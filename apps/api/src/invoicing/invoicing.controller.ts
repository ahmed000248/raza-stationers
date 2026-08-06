import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { InvoicingService } from "./invoicing.service";

@ApiTags("Invoicing")
@Controller("invoicing")
@UseGuards(BetterAuthGuard)
@ApiBearerAuth()
export class InvoicingController {
  constructor(private invoicingService: InvoicingService) {}

  @Post("invoices")
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiOperation({ summary: "Generate an invoice from an order (admin/owner)" })
  createInvoice(@CurrentUser("id") userId: string, @Body() body: { orderId: string; dueAt?: string }) {
    return this.invoicingService.createInvoice(body.orderId, userId, body.dueAt);
  }

  @Get("invoices/:id")
  @ApiOperation({ summary: "Get invoice details" })
  getInvoice(@Param("id") id: string, @CurrentUser() user: any) {
    return this.invoicingService.findById(id, user);
  }

  @Get("client-invoices/:clientBusinessId")
  @ApiOperation({ summary: "List invoices for a client business" })
  getClientInvoices(@Param("clientBusinessId") clientBusinessId: string, @CurrentUser() user: any) {
    return this.invoicingService.findByBusiness(clientBusinessId, user);
  }
}
