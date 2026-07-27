import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { OrdersService } from "./orders.service";
import { OrderStatus } from "@prisma/client";

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new order (checkout)" })
  create(
    @CurrentUser("id") userId: string,
    @Body() body: {
      clientBusinessId: string;
      items: Array<{ productPackagingId: string; quantity: number }>;
      recipientName: string;
      mobile: string;
      address: string;
      city: string;
      deliveryNotes?: string;
      paymentMethod?: string;
    },
  ) {
    return this.ordersService.create(userId, body.clientBusinessId, body);
  }

  @Get()
  @ApiOperation({ summary: "List orders with pagination and filters" })
  findAll(@Query() query: { page?: number; limit?: number; status?: string; clientBusinessId?: string }) {
    return this.ordersService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order details" })
  findById(@Param("id") id: string) {
    return this.ordersService.findById(id);
  }

  @Put(":id/status")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  @ApiOperation({ summary: "Update order status (admin/owner only)" })
  updateStatus(@Param("id") id: string, @Body() body: { status: OrderStatus }, @CurrentUser("id") userId: string) {
    return this.ordersService.updateStatus(id, body.status, userId);
  }
}
