import { Controller, Post, Put, Body, UseGuards, Get, Headers, BadRequestException, HttpCode, All, Req, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./better-auth";
import { AuthService } from "./auth.service";
import { BetterAuthGuard } from "./guards/better-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @All(["api", "api/*"])
  async handleBetterAuthApi(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(auth)(req, res);
  }

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  register(@Body() body: { name: string; mobileNumber: string; password: string }) {
    return this.authService.register(body);
  }

  @Post("register-supabase")
  @ApiOperation({ summary: "Register a new user with verified auth token in Authorization header" })
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

  @Get("bootstrap-status")
  @ApiOperation({ summary: "Check if a valid auth token is registered in the application database" })
  getBootstrapStatus(@Headers("authorization") authHeader: string) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return this.authService.getBootstrapStatus();
    }
    const token = authHeader.substring(7);
    return this.authService.getBootstrapStatus(token);
  }

  @Get("session-profile")
  @ApiOperation({ summary: "Check session profile status for auth token" })
  getSessionProfile(@Headers("authorization") authHeader: string) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return this.authService.getBootstrapStatus();
    }
    const token = authHeader.substring(7);
    return this.authService.getBootstrapStatus(token);
  }

  @Post("link")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Link current logged in user to a verified auth account" })
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
  @ApiOperation({ summary: "Login with email, mobile number, or identifier and password." })
  async login(
    @Body() body: { identifier?: string; mobileNumber?: string; email?: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const input = body.identifier || body.email || body.mobileNumber || "";
    const result = await this.authService.login(input, body.password);
    if (result.sessionToken) {
      res.cookie("better-auth.session_token", result.sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    return result;
  }

  @Post("totp/verify")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  verifyTotp() {
    throw new BadRequestException("TOTP MFA requires a configured authentication provider.");
  }

  @Post("totp/setup")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  setupTotp() {
    throw new BadRequestException("TOTP MFA requires a configured authentication provider.");
  }

  @Post("totp/enable")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  enableTotp() {
    throw new BadRequestException("TOTP MFA requires a configured authentication provider.");
  }

  @Post("totp/disable")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  disableTotp() {
    throw new BadRequestException("TOTP MFA requires a configured authentication provider.");
  }

  @Put("change-password")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password for authenticated user" })
  changePassword(@CurrentUser("id") userId: string, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}
