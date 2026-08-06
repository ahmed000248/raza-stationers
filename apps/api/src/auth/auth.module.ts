import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BetterAuthGuard } from "./guards/better-auth.guard";

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, BetterAuthGuard],
  exports: [AuthService, BetterAuthGuard],
})
export class AuthModule {}
