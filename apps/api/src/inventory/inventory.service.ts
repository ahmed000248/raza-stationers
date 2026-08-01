import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  private async validateBaseQuantity(productId: string, quantityBase: number) {
    if (Math.abs(quantityBase * 1000 - Math.round(quantityBase * 1000)) > Number.EPSILON) throw new BadRequestException("Stock quantities support at most three decimal places");
    const basePackaging = await this.prisma.productPackaging.findFirst({ where: { productId, isBase: true }, include: { unitOfMeasure: true } });
    if (!basePackaging) throw new BadRequestException("The product base unit is not configured");
    if (!basePackaging.unitOfMeasure.allowsFractional && !Number.isInteger(quantityBase)) throw new BadRequestException(`${basePackaging.unitOfMeasure.name} stock must use whole base units`);
  }

  async findAllStock(query: { page?: number; limit?: number; search?: string; stockState?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const filters: Prisma.Sql[] = [Prisma.sql`p.status <> 'archived'::product_status`];
    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      filters.push(Prisma.sql`(p.name ILIKE ${search} OR p.sku ILIKE ${search})`);
    }
    if (query.stockState === "not_initialized") filters.push(Prisma.sql`p.opening_stock_status = 'NOT_COUNTED'`);
    if (query.stockState === "out_of_stock") filters.push(Prisma.sql`p.opening_stock_status <> 'NOT_COUNTED' AND stock.available <= 0`);
    if (query.stockState === "low_stock") filters.push(Prisma.sql`p.opening_stock_status <> 'NOT_COUNTED' AND stock.available > 0 AND p.low_stock_threshold_base IS NOT NULL AND stock.available <= p.low_stock_threshold_base`);
    if (query.stockState === "in_stock") filters.push(Prisma.sql`p.opening_stock_status <> 'NOT_COUNTED' AND stock.available > 0 AND (p.low_stock_threshold_base IS NULL OR stock.available > p.low_stock_threshold_base)`);

    const rows = await this.prisma.$queryRaw<Array<{ id: string; total_count: bigint }>>(Prisma.sql`
      SELECT p.id, COUNT(*) OVER() AS total_count
      FROM products p
      CROSS JOIN LATERAL (
        SELECT COALESCE(SUM(sb.on_hand_quantity - sb.reserved_quantity), 0) AS available
        FROM stock_balances sb WHERE sb.product_id = p.id
      ) stock
      WHERE ${Prisma.join(filters, " AND ")}
      ORDER BY p.sku ASC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `);
    const ids = rows.map((row) => row.id);
    const products = ids.length ? await this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, sku: true, name: true, status: true, openingStockStatus: true, lowStockThresholdBase: true,
        stockBalances: { select: { id: true, stockLocationId: true, onHandQuantity: true, reservedQuantity: true, unavailableQuantity: true, inTransitQuantity: true, damagedQuantity: true, stockLocation: { select: { name: true } } } },
        stockMovements: { take: 1, orderBy: { occurredAt: "desc" }, select: { movementType: true, quantityBase: true, previousQuantityBase: true, newQuantityBase: true, reason: true, occurredAt: true, createdBy: { select: { name: true } } } },
      },
    }) : [];
    const byId = new Map(products.map((product) => [product.id, product]));
    const items = ids.map((id) => byId.get(id)).filter(Boolean).map((product) => {
      const onHand = product!.stockBalances.reduce((sum, balance) => sum + Number(balance.onHandQuantity), 0);
      const reserved = product!.stockBalances.reduce((sum, balance) => sum + Number(balance.reservedQuantity), 0);
      const available = onHand - reserved;
      const stockState = product!.openingStockStatus === "NOT_COUNTED" ? "not_initialized" : available <= 0 ? "out_of_stock" : product!.lowStockThresholdBase !== null && available <= Number(product!.lowStockThresholdBase) ? "low_stock" : "in_stock";
      return { ...product, onHand, reserved, available, stockState, primaryBalance: product!.stockBalances[0] || null, lastMovement: product!.stockMovements[0] || null };
    });
    const total = Number(rows[0]?.total_count || 0);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStockBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        stockBalances: {
          include: { stockLocation: true },
        },
      },
    });
    if (!product) throw new NotFoundException("Product not found");

    return {
      sku: product.sku,
      name: product.name,
      balances: product.stockBalances.map((b) => ({
        location: b.stockLocation.name,
        onHand: b.onHandQuantity,
        reserved: b.reservedQuantity,
        available: Number(b.onHandQuantity) - Number(b.reservedQuantity),
        unavailable: b.unavailableQuantity,
        inTransit: b.inTransitQuantity,
        damaged: b.damagedQuantity,
      })),
    };
  }

  async recordOpeningStock(data: { productId: string; stockLocationId: string; quantityBase: number; userId: string; reason: string }) {
    if (!Number.isFinite(data.quantityBase) || data.quantityBase < 0) throw new BadRequestException("Opening quantity must be zero or greater");
    if (!data.reason?.trim() || data.reason.trim().length < 3) throw new BadRequestException("A reason is required");
    await this.validateBaseQuantity(data.productId, data.quantityBase);
    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ opening_stock_status: string; status: string }>>(Prisma.sql`SELECT opening_stock_status, status::text FROM products WHERE id = ${data.productId} FOR UPDATE`);
      if (!locked.length) throw new NotFoundException("Product not found");
      if (locked[0].status === "archived") throw new BadRequestException("Archived products cannot receive opening stock");
      if (locked[0].opening_stock_status !== "NOT_COUNTED") throw new BadRequestException("Opening stock has already been initialized");
      const location = await tx.stockLocation.findFirst({ where: { id: data.stockLocationId, isActive: true } });
      if (!location) throw new NotFoundException("Active stock location not found");
      const existing = await tx.stockBalance.findUnique({ where: { productId_stockLocationId: { productId: data.productId, stockLocationId: data.stockLocationId } } });
      if (existing && [existing.onHandQuantity, existing.reservedQuantity, existing.unavailableQuantity, existing.inTransitQuantity, existing.damagedQuantity].some((value) => Number(value) !== 0)) {
        throw new BadRequestException("Existing stock values must be reconciled before opening stock can be initialized");
      }
      await tx.stockBalance.upsert({
        where: { productId_stockLocationId: { productId: data.productId, stockLocationId: data.stockLocationId } },
        create: { productId: data.productId, stockLocationId: data.stockLocationId, onHandQuantity: data.quantityBase },
        update: { onHandQuantity: data.quantityBase },
      });
      const movement = await tx.stockMovement.create({ data: { productId: data.productId, stockLocationId: data.stockLocationId, quantityBase: data.quantityBase, previousQuantityBase: 0, newQuantityBase: data.quantityBase, toBucket: "sellable", movementType: "opening_balance", createdById: data.userId, reason: data.reason.trim() } });
      await tx.product.update({ where: { id: data.productId }, data: { openingStockStatus: "COUNTED" } });
      await tx.auditLog.create({ data: { actorId: data.userId, action: "OPENING_STOCK_RECORDED", entityType: "Product", entityId: data.productId, beforeData: { openingStockStatus: "NOT_COUNTED", quantityBase: 0 }, afterData: { openingStockStatus: "COUNTED", quantityBase: data.quantityBase, stockLocationId: data.stockLocationId }, reason: data.reason.trim() } });
      return movement;
    });
  }

  async adjustStock(data: { productId: string; stockLocationId: string; quantityDelta: number; userId: string; reason: string }) {
    if (!Number.isFinite(data.quantityDelta) || data.quantityDelta === 0) throw new BadRequestException("Adjustment quantity must be non-zero");
    if (!data.reason?.trim() || data.reason.trim().length < 3) throw new BadRequestException("A reason is required");
    await this.validateBaseQuantity(data.productId, data.quantityDelta);
    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ opening_stock_status: string; status: string }>>(Prisma.sql`SELECT opening_stock_status, status::text FROM products WHERE id = ${data.productId} FOR UPDATE`);
      if (!locked.length) throw new NotFoundException("Product not found");
      if (locked[0].status === "archived") throw new BadRequestException("Archived products cannot be adjusted");
      if (locked[0].opening_stock_status === "NOT_COUNTED") throw new BadRequestException("Record opening stock before making adjustments");
      const balance = await tx.stockBalance.findUnique({ where: { productId_stockLocationId: { productId: data.productId, stockLocationId: data.stockLocationId } } });
      if (!balance) throw new NotFoundException("Stock balance not found");
      const previous = Number(balance.onHandQuantity);
      const next = previous + data.quantityDelta;
      if (next < Number(balance.reservedQuantity) || next < 0) throw new BadRequestException("Adjustment would reduce on-hand stock below reserved or zero");
      await tx.stockBalance.update({ where: { id: balance.id }, data: { onHandQuantity: next } });
      const movement = await tx.stockMovement.create({ data: { productId: data.productId, stockLocationId: data.stockLocationId, quantityBase: Math.abs(data.quantityDelta), previousQuantityBase: previous, newQuantityBase: next, fromBucket: data.quantityDelta < 0 ? "sellable" : null, toBucket: data.quantityDelta > 0 ? "sellable" : null, movementType: "adjustment", createdById: data.userId, reason: data.reason.trim() } });
      await tx.auditLog.create({ data: { actorId: data.userId, action: "STOCK_ADJUSTED", entityType: "Product", entityId: data.productId, beforeData: { quantityBase: previous }, afterData: { adjustmentQuantityBase: data.quantityDelta, quantityBase: next, stockLocationId: data.stockLocationId }, reason: data.reason.trim() } });
      return movement;
    });
  }

  async getLocations() {
    return this.prisma.stockLocation.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }
}
