import { Controller, Get, Post, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccountingService } from "./accounting.service";

@ApiTags("Accounting")
@Controller("accounting")
@UseGuards(BetterAuthGuard, RolesGuard)
@Roles("owner")
@ApiBearerAuth()
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get accounting summary (owner only)" })
  getSummary() { return this.accountingService.getSummary(); }

  @Get("revenue")
  @ApiOperation({ summary: "Get revenue breakdown by month" })
  getRevenue() { return this.accountingService.getRevenue(); }

  @Get("expenses")
  @ApiOperation({ summary: "List expenses" })
  getExpenses(@Query() query: { page?: number; limit?: number }) { return this.accountingService.getExpenses(query); }

  @Post("expenses")
  @ApiOperation({ summary: "Create expense entry" })
  createExpense(@Body() body: { amount: number; category: string; description: string }, @CurrentUser("id") userId: string) {
    return this.accountingService.createExpense(body, userId);
  }

  @Get("outstanding")
  @ApiOperation({ summary: "List clients with outstanding credit" })
  getOutstanding() { return this.accountingService.getOutstandingClients(); }
}
