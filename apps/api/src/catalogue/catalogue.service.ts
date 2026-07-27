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
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
        { shopName: { contains: query.search } },
      ];
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

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
        shopName: p.shopName,
        category: p.category.name,
        categorySlug: p.category.slug,
        wholesalePrice: p.packaging[0]?.prices[0]?.amount || null,
        status: p.status,
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
            prices: { orderBy: [{ priceType: "asc" }, { effectiveFrom: "desc" }] },
          },
        },
        aliases: true,
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
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
              orderBy: [{ priceType: "asc" }, { effectiveFrom: "desc" }],
            },
          },
        },
        aliases: true,
      },
    });

    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async findAllAdmin(query: { page?: number; limit?: number; status?: string; categorySlug?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
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
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createProduct(data: { name: string; categoryId: string; purchaseType?: string; shopName?: string; description?: string; wholesalePrice?: number }, userId: string) {
    const cat = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!cat) throw new NotFoundException("Category not found");

    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        shopName: data.shopName,
        description: data.description,
        purchaseType: (data.purchaseType as any) || "unconfirmed",
        status: "pending_review",
        categoryId: data.categoryId,
        sku: "TEMP", skuNumber: 0,
      },
    });

    // Allocate real SKU
    const sku = await this.prisma.$queryRawUnsafe<{ allocate_product_sku: string }[]>(`SELECT public.allocate_product_sku() as sku`);
    const skuStr = sku[0]?.allocate_product_sku || `RS-${String(product.skuNumber).padStart(6, "0")}`;
    const skuNum = parseInt(skuStr.replace("RS-", ""), 10);

    const uom = await this.prisma.unitOfMeasure.findFirst({ where: { isActive: true } });

    await this.prisma.product.update({ where: { id: product.id }, data: { sku: skuStr, skuNumber: skuNum } });

    const pkg = await this.prisma.productPackaging.create({
      data: { productId: product.id, unitOfMeasureId: uom?.id || "", code: "BASE", label: "Piece", conversionToBase: 1, isBase: true, isActive: true, confirmationStatus: "confirmed" },
    });

    if (data.wholesalePrice && data.wholesalePrice > 0) {
      await this.prisma.productPrice.create({
        data: { productPackagingId: pkg.id, priceType: "wholesale", amount: data.wholesalePrice, effectiveFrom: new Date(), createdById: userId },
      });
    }

    return this.prisma.product.findUnique({ where: { id: product.id }, include: { category: true, packaging: { include: { prices: true } } } });
  }

  async updateProduct(id: string, data: { name?: string; categoryId?: string; shopName?: string; description?: string; purchaseType?: string }) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    return this.prisma.product.update({ where: { id }, data: { ...data, purchaseType: data.purchaseType as any } });
  }

  async updateProductStatus(id: string, status: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    const now = new Date();
    const data: any = { status: status as any };
    if (status === "active") { data.activatedAt = now; data.reviewReason = null; }
    if (status === "archived") data.archivedAt = now;
    return this.prisma.product.update({ where: { id }, data });
  }

  async findCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }
}
