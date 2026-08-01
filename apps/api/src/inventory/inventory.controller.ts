import { Controller, Get, Post, Param, Query, Body, UseGuards } from "@nestjs/common";
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

  @Get("stock")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "packing")
  @ApiOperation({ summary: "List all stock balances" })
  findAllStock(@Query() query: { page?: number; limit?: number; search?: string; stockState?: string }) {
    return this.inventoryService.findAllStock(query);
  }

  @Post("stock/opening")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  @ApiOperation({ summary: "Record a product's first real opening-stock count" })
  recordOpeningStock(@CurrentUser("id") userId: string, @Body() body: { productId: string; stockLocationId: string; quantityBase: number; reason: string }) {
    return this.inventoryService.recordOpeningStock({ ...body, userId });
  }

  @Post("stock/adjustments")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  @ApiOperation({ summary: "Adjust initialized stock with before/after audit evidence" })
  adjustStock(@CurrentUser("id") userId: string, @Body() body: { productId: string; stockLocationId: string; quantityDelta: number; reason: string }) {
    return this.inventoryService.adjustStock({ ...body, userId });
  }

  @Get("stock/:sku")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "packing")
  @ApiOperation({ summary: "Get stock balance for a product by SKU" })
  getStock(@Param("sku") sku: string) {
    return this.inventoryService.getStockBySku(sku);
  }

  @Get("stock-locations")
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "packing")
  @ApiOperation({ summary: "List active stock locations" })
  getLocations() {
    return this.inventoryService.getLocations();
  }
}
