import { Controller, Get, Post, Put, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { StaffService } from "./staff.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("Staff")
@Controller("staff")
@UseGuards(BetterAuthGuard, RolesGuard)
@Roles("owner")
@ApiBearerAuth()
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: "List all staff members (owner only)" })
  findAll() { return this.staffService.findAll(); }

  @Post()
  @ApiOperation({ summary: "Invite a Supabase-backed staff member (AAL2 owner only)" })
  create(@CurrentUser("id") ownerId: string, @Body() body: { name: string; email: string; mobileNumber: string; role: "admin" | "packing" | "delivery" }) {
    return this.staffService.create(body, ownerId);
  }

  @Put(":id/toggle-active")
  @ApiOperation({ summary: "Toggle staff member active status" })
  toggleActive(@Param("id") id: string) { return this.staffService.toggleActive(id); }

  @Put(":id/change-role")
  @ApiOperation({ summary: "Change staff member role" })
  changeRole(@Param("id") id: string, @Body() body: { role: string }) { return this.staffService.changeRole(id, body.role); }
}
