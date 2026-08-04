import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
@UseGuards(BetterAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  getProfile(@CurrentUser("id") userId: string) {
    return this.usersService.findById(userId);
  }
}
