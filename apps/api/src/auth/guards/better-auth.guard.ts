import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../better-auth";

@Injectable()
export class BetterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session || !session.user) {
        throw new UnauthorizedException("Invalid or expired session");
      }

      request.user = {
        id: session.user.id,
        sub: session.user.id,
        email: session.user.email,
        name: session.user.name,
        mobileNumber: (session.user as any).mobileNumber || null,
        role: (session.user as any).role || "business_user",
        aal: "aal2",
        isActive: true,
      };

      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}
