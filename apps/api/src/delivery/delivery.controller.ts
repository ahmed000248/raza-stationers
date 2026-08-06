import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { DeliveryService } from "./delivery.service";

@ApiTags("Delivery")
@Controller("deliveries")
@UseGuards(BetterAuthGuard, RolesGuard)
@Roles("owner", "admin", "delivery")
@ApiBearerAuth()
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get()
  @ApiOperation({ summary: "List all deliveries" })
  findAll(@Query() query: { page?: number; limit?: number }) {
    return this.deliveryService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a delivery for an order" })
  create(@Body() body: { orderId: string }) {
    return this.deliveryService.create(body.orderId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get delivery details" })
  findById(@Param("id") id: string) {
    return this.deliveryService.findById(id);
  }

  @Get("order/:orderId")
  @ApiOperation({ summary: "Get delivery by order ID" })
  findByOrder(@Param("orderId") orderId: string) {
    return this.deliveryService.findByOrder(orderId);
  }
}
