import { Controller, Get, Post, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccountingService } from "./accounting.service";

@ApiTags("Accounting")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("owner")
@ApiBearerAuth()
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Get("accounting/summary")
  @ApiOperation({ summary: "Get accounting summary (owner only)" })
  getSummary() { return this.accountingService.getSummary(); }

  @Get("accounting/revenue")
  @ApiOperation({ summary: "Get revenue breakdown by month" })
  getRevenue() { return this.accountingService.getRevenue(); }

  @Get("accounting/expenses")
  @ApiOperation({ summary: "List expenses" })
  getExpenses(@Query() query: { page?: number; limit?: number }) { return this.accountingService.getExpenses(query); }

  @Post("accounting/expenses")
  @ApiOperation({ summary: "Create expense entry" })
  createExpense(@Body() body: { amount: number; category: string; description: string }, @CurrentUser("id") userId: string) {
    return this.accountingService.createExpense(body, userId);
  }

  @Get("accounting/outstanding")
  @ApiOperation({ summary: "List clients with outstanding credit" })
  getOutstanding() { return this.accountingService.getOutstandingClients(); }
}
