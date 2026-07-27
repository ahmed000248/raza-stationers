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

  async findCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }
}
