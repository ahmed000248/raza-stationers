import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { SettingsService } from "./settings.service";

@ApiTags("Settings")
@Controller("settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("owner")
@ApiBearerAuth()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get business settings (owner only)" })
  get() { return this.settingsService.get(); }

  @Put()
  @ApiOperation({ summary: "Update business settings (owner only)" })
  update(@Body() body: { businessName?: string; contactPhone?: string; requireApproval?: boolean; stockAlert?: boolean; packingView?: boolean; pickupLocation?: string | null; pickupInstructions?: string | null }) {
    return this.settingsService.update(body);
  }
}
