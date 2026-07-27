import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { InventoryService } from "./inventory.service";

@ApiTags("Inventory")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get("stock/:sku")
  @ApiOperation({ summary: "Get stock balance for a product by SKU" })
  getStock(@Param("sku") sku: string) {
    return this.inventoryService.getStockBySku(sku);
  }

  @Post("stock/movements")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "packing")
  @ApiOperation({ summary: "Record a stock movement (admin/owner/packing)" })
  recordMovement(
    @CurrentUser("id") userId: string,
    @Body() body: {
      productId: string;
      stockLocationId: string;
      quantityBase: number;
      fromBucket?: string;
      toBucket: string;
      movementType: string;
      reason: string;
    },
  ) {
    return this.inventoryService.recordMovement({ ...body, userId });
  }

  @Get("stock-locations")
  @ApiOperation({ summary: "List active stock locations" })
  getLocations() {
    return this.inventoryService.getLocations();
  }
}
