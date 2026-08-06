import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { DeliveryService } from "./delivery.service";

@ApiTags("Delivery")
@Controller()
@UseGuards(BetterAuthGuard, RolesGuard)
@Roles("owner", "admin", "delivery")
@ApiBearerAuth()
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get("deliveries")
  @ApiOperation({ summary: "List all deliveries" })
  findAll(@Query() query: { page?: number; limit?: number }) {
    return this.deliveryService.findAll(query);
  }

  @Post("deliveries")
  @ApiOperation({ summary: "Create a delivery for an order" })
  create(@Param("orderId") orderId: string) {
    return this.deliveryService.create(orderId);
  }

  @Get("deliveries/:id")
  @ApiOperation({ summary: "Get delivery details" })
  findById(@Param("id") id: string) {
    return this.deliveryService.findById(id);
  }

  @Get("order-delivery/:orderId")
  @ApiOperation({ summary: "Get delivery by order ID" })
  findByOrder(@Param("orderId") orderId: string) {
    return this.deliveryService.findByOrder(orderId);
  }
}
