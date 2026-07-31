import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
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

  @Get("admin/products")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all products for admin (including pending/archived)" })
  getAdminProducts(@Query() query: { page?: number; limit?: number; status?: string; categorySlug?: string }) {
    return this.catalogueService.findAllAdmin(query);
  }

  @Post("products")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new product (admin only)" })
  createProduct(@Body() body: { name: string; categoryId: string; purchaseType?: string; shopName?: string; description?: string; wholesalePrice?: number }, @CurrentUser("id") userId: string) {
    return this.catalogueService.createProduct(body, userId);
  }

  @Put("products/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product (admin only)" })
  updateProduct(@Param("id") id: string, @Body() body: { name?: string; categoryId?: string; shopName?: string; description?: string; purchaseType?: string }) {
    return this.catalogueService.updateProduct(id, body);
  }

  @Put("products/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("owner", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update product status (activate/archive)" })
  updateProductStatus(@Param("id") id: string, @Body() body: { status: string }, @CurrentUser("id") userId: string) {
    return this.catalogueService.updateProductStatus(id, body.status, userId);
  }

  @Get("products/id/:id")
  @ApiOperation({ summary: "Get product by internal ID" })
  getProductById(@Param("id") id: string) {
    return this.catalogueService.findById(id);
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
