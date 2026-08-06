import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BetterAuthGuard } from "./guards/better-auth.guard";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret && process.env.NODE_ENV === "production") {
          throw new Error("JWT_SECRET environment variable is missing. API cannot start.");
        }
        return {
          secret: secret || "raza-stationers-test-secret-1234567890",
          signOptions: {
            expiresIn: "7d",
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, BetterAuthGuard],
  exports: [AuthService, BetterAuthGuard, JwtModule],
})
export class AuthModule {}

