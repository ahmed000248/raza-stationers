import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, "supabase") {
  constructor(private prisma: PrismaService) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kjglykncjotsxoihupfe.supabase.co";
    const jwksUri = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/jwks`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        // If in test mode or test key is requested, verify using local JWT secret
        if (process.env.NODE_ENV === "test" || process.env.USE_TEST_KEY === "true") {
          done(null, process.env.JWT_SECRET || "raza-stationers-test-secret-1234567890");
          return;
        }

        const jwksProvider = passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: jwksUri,
        });
        jwksProvider(request, rawJwtToken, done);
      },
      issuer: (process.env.NODE_ENV === "test" || process.env.USE_TEST_KEY === "true")
        ? undefined
        : `${supabaseUrl.replace(/\/$/, "")}/auth/v1`,
      algorithms: ["RS256", "HS256"],
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { supabaseAuthId: payload.sub },
      select: { id: true, name: true, mobileNumber: true, role: true, isActive: true },
    });

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
