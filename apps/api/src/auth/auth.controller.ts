import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

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
  @ApiOperation({ summary: "Login with mobile number and password" })
  login(@Body() body: { mobileNumber: string; password: string }) {
    return this.authService.login(body.mobileNumber, body.password);
  }
}
