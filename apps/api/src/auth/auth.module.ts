import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { SupabaseStrategy } from "./strategies/supabase.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret.trim() === "") {
          throw new Error("JWT_SECRET environment variable is missing and must be provided.");
        }
        return {
          secret,
          signOptions: { expiresIn: "7d" },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SupabaseStrategy],
  exports: [AuthService],
})
export class AuthModule {}
