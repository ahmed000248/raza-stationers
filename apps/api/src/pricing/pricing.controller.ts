import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { PricingService } from "./pricing.service";

@ApiTags("Pricing")
@Controller("pricing")
@UseGuards(BetterAuthGuard)
@ApiBearerAuth()
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get("resolve/:sku")
  @ApiOperation({ summary: "Resolve effective price for a product (5-tier resolution)" })
  resolvePrice(@Param("sku") sku: string, @Query("clientBusinessId") clientBusinessId?: string) {
    return this.pricingService.getResolvedPrice(sku, clientBusinessId);
  }

  @Get("products/:sku")
  @ApiOperation({ summary: "List all prices for a product across packaging" })
  listPrices(@Param("sku") sku: string) {
    return this.pricingService.listPrices(sku);
  }
}
