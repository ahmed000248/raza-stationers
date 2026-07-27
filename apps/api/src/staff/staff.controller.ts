import { Controller, Get, Post, Put, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { StaffService } from "./staff.service";

@ApiTags("Staff")
@Controller("staff")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("owner")
@ApiBearerAuth()
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: "List all staff members (owner only)" })
  findAll() { return this.staffService.findAll(); }

  @Post()
  @ApiOperation({ summary: "Create a new staff member (owner only)" })
  create(@Body() body: { name: string; mobileNumber: string; password: string; role: string; staffRole?: string }) {
    return this.staffService.create(body);
  }

  @Put(":id/toggle-active")
  @ApiOperation({ summary: "Toggle staff member active status" })
  toggleActive(@Param("id") id: string) { return this.staffService.toggleActive(id); }

  @Put(":id/change-role")
  @ApiOperation({ summary: "Change staff member role" })
  changeRole(@Param("id") id: string, @Body() body: { role: string }) { return this.staffService.changeRole(id, body.role); }
}
