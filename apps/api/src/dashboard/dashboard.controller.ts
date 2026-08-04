import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { DashboardService } from "./dashboard.service";

@ApiTags("Dashboard")
@Controller("dashboard")
@UseGuards(BetterAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get dashboard statistics" })
  getStats() {
    return this.dashboardService.getStats();
  }
}
