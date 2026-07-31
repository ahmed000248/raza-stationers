import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto } from "./dto/pagination.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class CatalogueService {
  constructor(private prisma: PrismaService) {}

  async findProducts(query: PaginationDto) {
    const where: Prisma.ProductWhereInput = {
      status: { in: ["active", "pending_review"] },
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
        { shopName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          packaging: {
            where: { isActive: true, isBase: true },
            include: {
              prices: {
                where: {
                  priceType: "wholesale",
                  effectiveTo: null,
                },
                take: 1,
                orderBy: { effectiveFrom: "desc" },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        nameUrdu: p.nameUrdu,
        shopName: p.shopName,
        categoryId: p.categoryId,
        category: p.category.name,
        categorySlug: p.category.slug,
        wholesalePrice: p.packaging[0]?.prices[0]?.amount || null,
        status: p.status,
        stockStatus: "IN_STOCK",
        currentQuantity: 100,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        packaging: {
          where: { isActive: true },
          include: {
            unitOfMeasure: true,
            prices: {
              where: { priceType: { not: "buying" } },
              orderBy: [{ priceType: "asc" }, { effectiveFrom: "desc" }],
            },
          },
        },
        aliases: true,
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    return JSON.parse(JSON.stringify(product, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async findBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        packaging: {
          where: { isActive: true },
          include: {
            unitOfMeasure: true,
            prices: {
              where: { priceType: { not: "buying" } },
              orderBy: [{ priceType: "asc" }, { effectiveFrom: "desc" }],
            },
          },
        },
        aliases: true,
      },
    });

    if (!product) throw new NotFoundException("Product not found");
    return JSON.parse(JSON.stringify(product, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async findAllAdmin(query: { page?: number; limit?: number; status?: string; categorySlug?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const where: Prisma.ProductWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.categorySlug) where.category = { slug: query.categorySlug };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, packaging: { where: { isBase: true }, include: { prices: { where: { priceType: "wholesale" }, take: 1 } } }, _count: { select: { packaging: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);
    const result = { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    return JSON.parse(JSON.stringify(result, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async createProduct(data: { name: string; categoryId: string; purchaseType?: string; shopName?: string; description?: string; wholesalePrice?: number }, userId: string) {
    const cat = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!cat) throw new NotFoundException("Category not found");

    // Allocate real SKU first
    const skuResult = await this.prisma.$queryRawUnsafe<{ sku: string; sku_number: string }[]>(`SELECT sku, "sku_number"::text FROM public.allocate_product_sku()`);
    const skuStr = skuResult[0]?.sku || "RS-999999";
    const skuNum = parseInt(skuResult[0]?.sku_number || "999999", 10);

    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        shopName: data.shopName,
        description: data.description,
        purchaseType: (data.purchaseType as any) || "unconfirmed",
        status: "pending_review",
        categoryId: data.categoryId,
        sku: skuStr,
        skuNumber: skuNum,
      },
    });

    const uom = await this.prisma.unitOfMeasure.findFirst({ where: { isActive: true } });

    const pkg = await this.prisma.productPackaging.create({
      data: { productId: product.id, unitOfMeasureId: uom?.id || "", code: "BASE", label: "Piece", conversionToBase: 1, isBase: true, isActive: true, confirmationStatus: "confirmed" },
    });

    if (data.wholesalePrice && data.wholesalePrice > 0) {
      await this.prisma.productPrice.create({
        data: { productPackagingId: pkg.id, priceType: "wholesale", amount: data.wholesalePrice, effectiveFrom: new Date(), createdById: userId },
      });
    }

    const result = await this.prisma.product.findUnique({ where: { id: product.id }, include: { category: true, packaging: { include: { prices: true } } } });
    return JSON.parse(JSON.stringify(result, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async updateProduct(id: string, data: { name?: string; categoryId?: string; shopName?: string; description?: string; purchaseType?: string }) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    const result = await this.prisma.product.update({ where: { id }, data: { ...data, purchaseType: data.purchaseType as any } });
    return JSON.parse(JSON.stringify(result, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async updateProductStatus(id: string, status: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    const now = new Date();
    const data: any = { status: status as any };
    if (status === "active") {
      data.activatedAt = now;
      data.activatedById = userId;
      data.reviewReason = null;
    }
    if (status === "archived") {
      data.archivedAt = now;
      data.archivedById = userId;
    }
    const result = await this.prisma.product.update({ where: { id }, data });
    return JSON.parse(JSON.stringify(result, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async findCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }
}
