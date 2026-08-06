import { CanActivate, ExecutionContext, Injectable, Optional, UnauthorizedException } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../better-auth";
import { AuthService } from "../auth.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    @Optional() private authService?: AuthService,
    @Optional() private prisma?: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      let userId: string | null = null;
      let email: string | null = null;
      let name: string | null = null;
      let mobileNumber: string | null = null;
      let role: string = "business_user";
      let userTwoFactorEnabled = false;
      let sessionTwoFactorVerified = false;

      if (session?.user) {
        userId = session.user.id;
        email = session.user.email;
        name = session.user.name;
        mobileNumber = (session.user as any).mobileNumber || null;
        role = (session.user as any).role || "business_user";
        userTwoFactorEnabled = Boolean((session.user as any).twoFactorEnabled);
        sessionTwoFactorVerified = Boolean(
          (session.session as any)?.twoFactorVerified ||
          (session.session as any)?.mfaVerifiedAt ||
          (session as any)?.twoFactorVerified
        );
      } else if (this.authService) {
        const authHeader = request.headers.authorization || request.headers.Authorization;
        if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7).trim();
          const verified = await this.authService.verifyAuthToken(token).catch(() => null);
          if (verified) {
            userId = verified.sub;
            email = verified.email || null;
            name = verified.name || "User";
            mobileNumber = verified.mobileNumber || null;
            role = verified.role || "business_user";
            sessionTwoFactorVerified = Boolean(verified.twoFactorVerified);
          }
        }
      }

      if (!userId) {
        throw new UnauthorizedException("Invalid or expired session");
      }

      let isActive = true;
      if (this.prisma) {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, isActive: true, twoFactorEnabled: true },
        });
        if (!dbUser || !dbUser.isActive) {
          throw new UnauthorizedException("User account is inactive or disabled");
        }
        role = dbUser.role || role;
        isActive = Boolean(dbUser.isActive);
        userTwoFactorEnabled = Boolean(dbUser.twoFactorEnabled);
      }

      const aal = userTwoFactorEnabled && sessionTwoFactorVerified ? "aal2" : "aal1";

      request.user = {
        id: userId,
        sub: userId,
        email,
        name,
        mobileNumber,
        role,
        aal,
        isActive,
      };

      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      console.error("[BetterAuthGuard] Authentication error:", err?.message || err);
      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}
