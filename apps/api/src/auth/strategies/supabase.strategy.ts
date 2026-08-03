import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import * as jwt from "jsonwebtoken";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, "supabase") {
  constructor(private prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl && process.env.NODE_ENV !== "test" && process.env.USE_TEST_KEY !== "true") {
      throw new Error("Missing SUPABASE_URL environment variable.");
    }
    const jwksUri = `${(supabaseUrl || "https://mock.supabase.co").replace(/\/$/, "")}/auth/v1/jwks`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        if (process.env.NODE_ENV === "test" || process.env.USE_TEST_KEY === "true") {
          done(null, process.env.JWT_SECRET || "raza-stationers-test-secret-1234567890");
          return;
        }

        const decoded = jwt.decode(rawJwtToken, { complete: true }) as any;
        const alg = decoded?.header?.alg || "HS256";
        const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

        // HS256 algorithm verification using JWT Secret
        if (alg === "HS256" && jwtSecret) {
          done(null, jwtSecret);
          return;
        }

        // RS256 / ES256 algorithm verification using Supabase JWKS
        if ((alg === "RS256" || alg === "ES256") && decoded?.header?.kid) {
          const jwksProvider = passportJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: jwksUri,
          });
          jwksProvider(request, rawJwtToken, done);
          return;
        }

        // Fallback verification attempt with JWT secret
        if (jwtSecret) {
          done(null, jwtSecret);
          return;
        }

        done(new Error("Unable to determine verification key for Supabase token"), undefined);
      },
      algorithms: ["RS256", "HS256", "ES256"],
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      return null;
    }

    let user = await this.prisma.user.findUnique({
      where: { supabaseAuthId: payload.sub },
      select: { id: true, name: true, mobileNumber: true, role: true, isActive: true },
    });

    if (!user && payload.email) {
      const existingByEmail = await this.prisma.user.findFirst({
        where: { email: { equals: payload.email, mode: "insensitive" } },
        select: { id: true, name: true, mobileNumber: true, role: true, isActive: true },
      });
      if (existingByEmail) {
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { supabaseAuthId: payload.sub },
          select: { id: true, name: true, mobileNumber: true, role: true, isActive: true },
        });
      }
    }

    if (!user) {
      return null;
    }
    if (!user.isActive) {
      throw new UnauthorizedException("User account is inactive");
    }

    return {
      ...user,
      supabaseAuthId: payload.sub,
      aal: payload.aal || "aal1",
    };
  }
}
