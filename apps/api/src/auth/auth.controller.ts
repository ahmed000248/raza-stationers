import { Controller, Post, Put, Body, UseGuards, Get, Headers, BadRequestException, HttpCode } from "@nestjs/common";
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

  @Post("register-supabase")
  @ApiOperation({ summary: "Register a new user with verified Supabase token in Authorization header" })
  registerSupabase(
    @Headers("authorization") authHeader: string,
    @Body() body: { name: string; mobileNumber: string }
  ) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new BadRequestException("Missing or invalid Authorization header");
    }
    const token = authHeader.substring(7);
    return this.authService.registerSupabase(token, body);
  }

  @Post("link")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Link current logged in user to a verified Supabase account" })
  linkSupabase(
    @CurrentUser("id") userId: string,
    @Body() body: { supabaseToken: string }
  ) {
    if (!body.supabaseToken) {
      throw new BadRequestException("supabaseToken is required");
    }
    return this.authService.linkSupabase(userId, body.supabaseToken);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Login with mobile number and password. Returns requiresTotp=true if 2FA is active." })
  login(@Body() body: { mobileNumber: string; password: string }) {
    return this.authService.login(body.mobileNumber, body.password);
  }

  @Post("totp/verify")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  verifyTotp() {
    throw new BadRequestException("Custom TOTP is retired. Please use Supabase TOTP MFA.");
  }

  @Post("totp/setup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setupTotp() {
    throw new BadRequestException("Custom TOTP is retired. Please use Supabase TOTP MFA.");
  }

  @Post("totp/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  enableTotp() {
    throw new BadRequestException("Custom TOTP is retired. Please use Supabase TOTP MFA.");
  }

  @Post("totp/disable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  disableTotp() {
    throw new BadRequestException("Custom TOTP is retired. Please use Supabase TOTP MFA.");
  }

  @Put("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password for authenticated user" })
  changePassword(@CurrentUser("id") userId: string, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}
