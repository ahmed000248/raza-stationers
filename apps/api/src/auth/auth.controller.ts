import { Controller, Post, Put, Body, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  register(@Body() body: { name: string; mobileNumber: string; password: string }) {
    return this.authService.register(body);
  }

  @Post("login")
  @ApiOperation({ summary: "Login with mobile number and password. Returns requiresTotp=true if 2FA is active." })
  login(@Body() body: { mobileNumber: string; password: string }) {
    return this.authService.login(body.mobileNumber, body.password);
  }

  @Post("totp/verify")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify a TOTP code after pre-auth login. Returns full access token." })
  verifyTotp(@CurrentUser("id") userId: string, @Body() body: { token: string }) {
    return this.authService.verifyTotp(userId, body.token);
  }

  @Post("totp/setup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generate a TOTP secret and QR code for owner/admin. Does not enable 2FA yet." })
  setupTotp(@CurrentUser("id") userId: string) {
    return this.authService.setupTotp(userId);
  }

  @Post("totp/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirm TOTP setup by verifying first code. Enables 2FA on account." })
  enableTotp(@CurrentUser("id") userId: string, @Body() body: { token: string }) {
    return this.authService.enableTotp(userId, body.token);
  }

  @Post("totp/disable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Disable TOTP 2FA. Requires current valid TOTP code." })
  disableTotp(@CurrentUser("id") userId: string, @Body() body: { token: string }) {
    return this.authService.disableTotp(userId, body.token);
  }

  @Put("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password for authenticated user" })
  changePassword(@CurrentUser("id") userId: string, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}
