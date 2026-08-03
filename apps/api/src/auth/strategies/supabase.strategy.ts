import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, "supabase") {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET || "raza-stationers-test-secret-1234567890";

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      return null;
    }

    let user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, mobileNumber: true, role: true, isActive: true },
    });

    if (!user && payload.supabaseAuthId) {
      user = await this.prisma.user.findUnique({
        where: { supabaseAuthId: payload.supabaseAuthId },
        select: { id: true, name: true, mobileNumber: true, role: true, isActive: true },
      });
    }

    if (!user) {
      return null;
    }
    if (!user.isActive) {
      throw new UnauthorizedException("User account is inactive");
    }

    return {
      ...user,
      aal: payload.aal || "aal1",
    };
  }
}
