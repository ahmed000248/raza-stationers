import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto } from "./dto/pagination.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class CatalogueService {
  constructor(private prisma: PrismaService) {}

  async findProducts(query: PaginationDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const filters: Prisma.Sql[] = [Prisma.sql`p.status IN ('active'::product_status, 'pending_review'::product_status)`];

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      filters.push(Prisma.sql`(p.name ILIKE ${search} OR p.sku ILIKE ${search} OR p.shop_name ILIKE ${search} OR p.name_urdu ILIKE ${search})`);
    }
    if (query.categorySlug) filters.push(Prisma.sql`c.slug = ${query.categorySlug}`);
    if (query.saleType === "individual") {
      filters.push(Prisma.sql`EXISTS (
        SELECT 1 FROM product_packaging pp JOIN product_prices price ON price.product_packaging_id = pp.id
        WHERE pp.product_id = p.id AND pp.is_active
          AND price.price_type IN ('retail', 'wholesale') AND price.amount > 0 AND price.effective_to IS NULL
      )`);
    }
    if (query.saleType === "bulk") {
      filters.push(Prisma.sql`EXISTS (
        SELECT 1 FROM product_packaging pp JOIN product_prices price ON price.product_packaging_id = pp.id
        WHERE pp.product_id = p.id AND pp.is_active
          AND price.price_type IN ('retail', 'wholesale') AND price.amount > 0 AND price.effective_to IS NULL
      )`);
    }
    if (query.unit) {
      filters.push(Prisma.sql`EXISTS (
        SELECT 1 FROM product_packaging pp JOIN units_of_measure uom ON uom.id = pp.unit_of_measure_id
        WHERE pp.product_id = p.id AND pp.is_active
          AND (LOWER(uom.code) = LOWER(${query.unit}) OR LOWER(uom.name) = LOWER(${query.unit}))
      )`);
    }
    if (query.minPrice !== undefined) filters.push(Prisma.sql`catalogue_price.minimum_price >= ${query.minPrice}`);
    if (query.maxPrice !== undefined) filters.push(Prisma.sql`catalogue_price.minimum_price <= ${query.maxPrice}`);
    if (query.stock === "updating") filters.push(Prisma.sql`p.opening_stock_status = 'NOT_COUNTED'`);
    if (query.stock === "out_of_stock") filters.push(Prisma.sql`p.opening_stock_status <> 'NOT_COUNTED' AND stock.available <= 0`);
    if (query.stock === "low_stock") filters.push(Prisma.sql`p.opening_stock_status <> 'NOT_COUNTED' AND stock.available > 0 AND p.low_stock_threshold_base IS NOT NULL AND stock.available <= p.low_stock_threshold_base`);
    if (query.stock === "in_stock") filters.push(Prisma.sql`p.opening_stock_status <> 'NOT_COUNTED' AND stock.available > 0 AND (p.low_stock_threshold_base IS NULL OR stock.available > p.low_stock_threshold_base)`);

    const orderBy = query.sort === "name_desc"
      ? Prisma.sql`p.name DESC, p.id ASC`
      : query.sort === "newest"
        ? Prisma.sql`p.created_at DESC, p.id ASC`
        : Prisma.sql`p.name ASC, p.id ASC`;

    const rows = await this.prisma.$queryRaw<Array<{ id: string; total_count: bigint }>>(Prisma.sql`
      SELECT p.id, COUNT(*) OVER() AS total_count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      CROSS JOIN LATERAL (
        SELECT COALESCE(SUM(sb.on_hand_quantity - sb.reserved_quantity), 0) AS available
        FROM stock_balances sb WHERE sb.product_id = p.id
      ) stock
      CROSS JOIN LATERAL (
        SELECT MIN(price.amount) AS minimum_price
        FROM product_packaging pp JOIN product_prices price ON price.product_packaging_id = pp.id
        WHERE pp.product_id = p.id AND pp.is_active
          AND price.price_type IN ('retail', 'wholesale') AND price.amount > 0 AND price.effective_to IS NULL
      ) catalogue_price
      WHERE catalogue_price.minimum_price IS NOT NULL AND ${Prisma.join(filters, " AND ")}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `);

    const ids = rows.map((row) => row.id);
    const total = Number(rows[0]?.total_count || 0);
    const products = ids.length ? await this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, sku: true, name: true, nameUrdu: true, shopName: true, categoryId: true,
        purchaseType: true, allowIndividualSale: true, openingStockStatus: true, lowStockThresholdBase: true,
        category: { select: { name: true, slug: true } },
        stockBalances: { select: { onHandQuantity: true, reservedQuantity: true } },
        packaging: {
          where: { isActive: true, prices: { some: { amount: { gt: 0 }, effectiveTo: null, priceType: { in: ["retail", "wholesale"] } } } },
          select: {
            id: true, label: true, code: true, conversionToBase: true, packQuantity: true, isBase: true,
            unitOfMeasure: { select: { code: true, name: true } },
            prices: { where: { amount: { gt: 0 }, effectiveTo: null, priceType: { in: ["retail", "wholesale"] } }, select: { amount: true, priceType: true }, orderBy: { effectiveFrom: "desc" } },
          },
          orderBy: [{ isBase: "desc" }, { conversionToBase: "asc" }],
        },
      },
    }) : [];
    const byId = new Map(products.map((product) => [product.id, product]));
    const items = ids.map((id) => byId.get(id)).filter(Boolean).map((p) => {
      const available = p!.stockBalances.reduce((sum, balance) => sum + Number(balance.onHandQuantity) - Number(balance.reservedQuantity), 0);
      const stockStatus = p!.openingStockStatus === "NOT_COUNTED" ? "STOCK_UPDATING"
        : available <= 0 ? "OUT_OF_STOCK"
        : p!.lowStockThresholdBase !== null && available <= Number(p!.lowStockThresholdBase) ? "LOW_STOCK"
        : "IN_STOCK";
      const packages = p!.packaging.map((pkg) => ({
        id: pkg.id, label: pkg.label, code: pkg.code, conversionToBase: Number(pkg.conversionToBase), packQuantity: pkg.packQuantity,
        isBase: pkg.isBase, unitCode: pkg.unitOfMeasure.code, unitName: pkg.unitOfMeasure.name,
        retailPrice: pkg.prices.find((price) => price.priceType === "retail") ? Number(pkg.prices.find((price) => price.priceType === "retail")!.amount) : null,
        wholesalePrice: pkg.prices.find((price) => price.priceType === "wholesale") ? Number(pkg.prices.find((price) => price.priceType === "wholesale")!.amount) : null,
      }));
      const basePackage = packages.find((pkg) => pkg.isBase) || packages[0];
      return {
        id: p!.id, sku: p!.sku, name: p!.name, nameUrdu: p!.nameUrdu, shopName: p!.shopName,
        categoryId: p!.categoryId, category: p!.category.name, categorySlug: p!.category.slug,
        purchaseType: p!.purchaseType, saleTypes: { individual: true, bulk: packages.some((pkg) => pkg.conversionToBase > 1) },
        packaging: packages, wholesalePrice: basePackage?.wholesalePrice, retailPrice: basePackage?.retailPrice,
        stockStatus, currentQuantity: available,
      };
    });

    return {
      items,
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
    if (!product || product.status === "archived") throw new NotFoundException("Product not found");
    const publicProduct = { ...product, packaging: product.packaging.filter((pkg) => !pkg.isBase || product.allowIndividualSale) };
    return JSON.parse(JSON.stringify(publicProduct, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async findBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        packaging: {
          where: {
            isActive: true,
            prices: { some: { amount: { gt: 0 }, effectiveTo: null, priceType: { in: ["retail", "wholesale"] } } },
          },
          include: {
            unitOfMeasure: true,
            prices: {
              where: { priceType: { in: ["retail", "wholesale"] }, amount: { gt: 0 }, effectiveTo: null },
              orderBy: [{ priceType: "asc" }, { effectiveFrom: "desc" }],
            },
          },
          orderBy: [{ isBase: "desc" }, { conversionToBase: "asc" }],
        },
        aliases: true,
        stockBalances: { select: { onHandQuantity: true, reservedQuantity: true } },
      },
    });

    if (!product || product.status === "archived") throw new NotFoundException("Product not found");
    const publicProduct = { ...product, packaging: product.packaging.filter((pkg) => !pkg.isBase || product.allowIndividualSale) };
    return JSON.parse(JSON.stringify(publicProduct, (k, v) => (typeof v === "bigint" ? v.toString() : v)));
  }

  async findAllAdmin(query: { page?: number; limit?: number; status?: string; categorySlug?: string }) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 50, 100);  // ponytail: server-side cap; raise if bulk export added
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
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  }

  async findFilterOptions() {
    const units = await this.prisma.unitOfMeasure.findMany({
      where: {
        isActive: true,
        packaging: { some: { isActive: true, confirmationStatus: "confirmed", product: { status: "active" } } },
      },
      select: { code: true, name: true },
      orderBy: { name: "asc" },
    });
    return { units };
  }
}
