import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CatalogueService } from "./catalogue.service";
import { PaginationDto } from "./dto/pagination.dto";

@ApiTags("Catalogue")
@Controller()
export class CatalogueController {
  constructor(private catalogueService: CatalogueService) {}

  @Get("products")
  @ApiOperation({ summary: "List active products with pagination & search" })
  getProducts(@Query() query: PaginationDto) {
    return this.catalogueService.findProducts(query);
  }

  @Get("products/:sku")
  @ApiOperation({ summary: "Get product by SKU with packaging & prices" })
  getProduct(@Param("sku") sku: string) {
    return this.catalogueService.findBySku(sku);
  }

  @Get("categories")
  @ApiOperation({ summary: "List all active categories" })
  getCategories() {
    return this.catalogueService.findCategories();
  }
}
