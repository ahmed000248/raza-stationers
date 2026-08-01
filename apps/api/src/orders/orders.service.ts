import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, OrderStatus } from "@prisma/client";
import { normalizePakistaniMobile } from "@raza-stationers/validation";

function databaseErrorCodeMatches(cause: unknown, expected: ReadonlySet<string>): boolean {
  if (!cause || typeof cause !== "object") return false;
  const error = cause as { code?: unknown; originalCode?: unknown; cause?: unknown; meta?: unknown; driverAdapterError?: unknown };
  if (typeof error.code === "string" && expected.has(error.code)) return true;
  if (typeof error.originalCode === "string" && expected.has(error.originalCode)) return true;
  return databaseErrorCodeMatches(error.cause, expected)
    || databaseErrorCodeMatches(error.meta, expected)
    || databaseErrorCodeMatches(error.driverAdapterError, expected);
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, clientBusinessId: string, data: {
    items: Array<{ productPackagingId: string; quantity: number }>;
    recipientName: string;
    mobile: string;
    address?: string;
    city?: string;
    deliveryNotes?: string;
    paymentMethod?: string;
    fulfilmentMethod: "delivery" | "pickup";
    idempotencyKey: string;
  }) {
    if (!data.idempotencyKey || data.idempotencyKey.length < 16 || data.idempotencyKey.length > 100) {
      throw new BadRequestException("A valid checkout idempotency key is required");
    }
    const previous = await this.prisma.order.findUnique({ where: { checkoutIdempotencyKey: data.idempotencyKey }, include: { items: true, statusHistory: true } });
    if (previous) {
      if (previous.placedByUserId !== userId) throw new BadRequestException("Checkout key is already in use");
      return previous;
    }
    const link = await this.prisma.businessUserLink.findFirst({
      where: { userId, clientBusinessId, endedAt: null },
      include: { clientBusiness: { select: { accountStatus: true } } },
    });
    if (!link) throw new BadRequestException("The selected business account is not linked to this user");
    if (link.clientBusiness.accountStatus !== "active") throw new BadRequestException("This business account is not active for ordering");

    const mobile = normalizePakistaniMobile(data.mobile);
    if (!mobile) throw new BadRequestException("Mobile number must use the Pakistani 03XXXXXXXXX format");
    if (!data.recipientName?.trim()) throw new BadRequestException("Recipient name is required");
    if (!data.fulfilmentMethod || !["delivery", "pickup"].includes(data.fulfilmentMethod)) throw new BadRequestException("Select delivery or pickup");

    const settings = await this.prisma.businessSettings.findFirst();
    const inventoryMode = settings?.inventoryMode || "DEMO";
    const isDemo = inventoryMode === "DEMO";
    let deliveryZone: { id: string; charge: Prisma.Decimal | null; isFree: boolean } | null = null;
    let deliveryCharge = 0;
    let addressSnapshot = data.address?.trim() || "";
    let citySnapshot = data.city?.trim() || "";
    let pickupLocationSnapshot: string | null = null;
    let pickupInstructionsSnapshot: string | null = null;

    if (data.fulfilmentMethod === "delivery") {
      if (!addressSnapshot || addressSnapshot.length < 10 || !citySnapshot) throw new BadRequestException("A complete delivery address and city are required");
      deliveryZone = await this.prisma.deliveryZone.findFirst({
        where: { city: { equals: citySnapshot, mode: "insensitive" }, isActive: true },
        select: { id: true, charge: true, isFree: true },
      });
      if (!deliveryZone) throw new BadRequestException("Delivery is not configured for this city");
      if (!deliveryZone.isFree && deliveryZone.charge === null) throw new BadRequestException("The delivery charge for this city still requires owner configuration");
      deliveryCharge = deliveryZone.isFree ? 0 : Number(deliveryZone.charge);
    } else {
      if (!settings?.pickupLocation?.trim() || !settings.pickupInstructions?.trim()) throw new BadRequestException("Pickup is not configured yet");
      pickupLocationSnapshot = settings.pickupLocation.trim();
      pickupInstructionsSnapshot = settings.pickupInstructions.trim();
      addressSnapshot = pickupLocationSnapshot;
      citySnapshot = "";
    }

    if (!Array.isArray(data.items) || data.items.length === 0) throw new BadRequestException("At least one order item is required");
    const packagingIds = data.items.map((i) => i.productPackagingId);
    const packaging = await this.prisma.productPackaging.findMany({
      where: { id: { in: packagingIds } },
      include: {
        product: true,
        unitOfMeasure: true,
        prices: {
          where: { priceType: "wholesale", effectiveTo: null, amount: { gt: 0 } },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
        },
      },
    });

    const packagingMap = new Map(packaging.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

    for (const item of data.items) {
      const pkg = packagingMap.get(item.productPackagingId);
      if (!pkg) throw new BadRequestException(`Packaging ${item.productPackagingId} not found`);
      if (!pkg.isActive) throw new BadRequestException(`Packaging ${pkg.code} is not active`);
      if (pkg.confirmationStatus !== "confirmed") throw new BadRequestException(`Packaging ${pkg.code} is not confirmed for sale`);
      if (pkg.product.status !== "active") throw new BadRequestException(`Product '${pkg.product.name}' is not active`);
      if (pkg.isBase && !pkg.product.allowIndividualSale) throw new BadRequestException(`Product '${pkg.product.name}' is not available for individual sale`);
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) throw new BadRequestException(`Quantity for '${pkg.product.name}' must be greater than zero`);
      if (!pkg.unitOfMeasure.allowsFractional && !Number.isInteger(item.quantity)) throw new BadRequestException(`${pkg.unitOfMeasure.name} quantities must be whole numbers`);

      const price = pkg.prices[0];
      if (!price) throw new BadRequestException(`No wholesale price for ${pkg.product.name}`);

      const requestedBaseQty = item.quantity * Number(pkg.conversionToBase);

      if (pkg.product.openingStockStatus === "NOT_COUNTED") {
        throw new BadRequestException(`Product '${pkg.product.name}' has stock being updated and cannot be ordered yet.`);
      }

      const lineTotal = Number(price.amount) * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: pkg.productId,
        productPackagingId: item.productPackagingId,
        quantity: item.quantity,
        baseQuantity: requestedBaseQty,
        skuSnapshot: pkg.product.sku,
        productNameSnapshot: pkg.product.name,
        packagingLabelSnapshot: pkg.label,
        unitCodeSnapshot: pkg.unitOfMeasure.code,
        conversionToBaseSnapshot: Number(pkg.conversionToBase),
        basePriceTypeSnapshot: price.priceType,
        basePriceAmountSnapshot: Number(price.amount),
        unitPriceSnapshot: Number(price.amount),
        subtotalSnapshot: lineTotal,
        lineTotalSnapshot: lineTotal,
      });
    }

    const paymentMethods: Record<string, "cash" | "bank_transfer" | "easypaisa" | "jazzcash" | "cash_on_delivery"> = {
      CASH_ON_DELIVERY: "cash_on_delivery",
      ONLINE_BANK_TRANSFER: "bank_transfer",
      ONLINE_EASYPAISA: "easypaisa",
      ONLINE_JAZZCASH: "jazzcash",
    };
    const requestedPaymentMethod = data.paymentMethod ? paymentMethods[data.paymentMethod] : undefined;
    if (data.paymentMethod && !requestedPaymentMethod) throw new BadRequestException("The selected payment method is not supported");

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
        const year = new Date().getFullYear();
        const seq = await tx.documentSequence.upsert({
          where: { documentType_year: { documentType: "order", year } },
          create: { documentType: "order", year, nextValue: 1 },
          update: { nextValue: { increment: 1 } },
        });
        const orderNumber = `RS-ORD-${year}-${String(seq.nextValue).padStart(6, "0")}`;

        if (inventoryMode === "LIVE") {
          const requiredByProduct = new Map<string, number>();
          for (const item of orderItems) requiredByProduct.set(item.productId, (requiredByProduct.get(item.productId) || 0) + Number(item.baseQuantity));
          for (const [productId, required] of requiredByProduct) {
            const balances = await tx.stockBalance.findMany({ where: { productId }, select: { onHandQuantity: true, reservedQuantity: true } });
            const available = balances.reduce((sum, balance) => sum + Number(balance.onHandQuantity) - Number(balance.reservedQuantity), 0);
            if (available < required) {
              const productName = packaging.find((pkg) => pkg.productId === productId)?.product.name || "Product";
              throw new BadRequestException(`Product '${productName}' does not have enough available stock.`);
            }
          }
        }

        const order = await tx.order.create({
      data: {
        orderNumber,
        orderYear: year,
        sequenceNumber: seq.nextValue,
        clientBusinessId,
        placedByUserId: userId,
        checkoutIdempotencyKey: data.idempotencyKey,
        fulfilmentMethod: data.fulfilmentMethod,
        recipientNameSnapshot: data.recipientName,
        mobileSnapshot: mobile,
        addressSnapshot,
        citySnapshot,
        requestedPaymentMethod,
        deliveryNotesSnapshot: data.deliveryNotes,
        pickupLocationSnapshot,
        pickupInstructionsSnapshot,
        subtotal,
        deliveryCharge,
        grandTotal: subtotal + deliveryCharge,
        status: "pending_review",
        isDemo,
        items: { create: orderItems },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "pending_review",
            changedById: userId,
          },
        },
        delivery: data.fulfilmentMethod === "delivery" ? {
          create: {
            deliveryZoneId: deliveryZone!.id,
            recipientNameSnapshot: data.recipientName.trim(),
            mobileSnapshot: mobile,
            addressSnapshot,
            notes: data.deliveryNotes,
          },
        } : undefined,
      },
      include: { items: true, statusHistory: true },
        });

        return order;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (cause) {
        if (databaseErrorCodeMatches(cause, new Set(["P2002", "23505"]))) {
          const existing = await this.prisma.order.findUnique({ where: { checkoutIdempotencyKey: data.idempotencyKey }, include: { items: true, statusHistory: true } });
          if (existing?.placedByUserId === userId) return existing;
        }
        if (databaseErrorCodeMatches(cause, new Set(["P2034", "40001"]))) {
          if (attempt < 5) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 20));
            continue;
          }
          throw new BadRequestException("Checkout changed concurrently; please retry");
        }
        throw cause;
      }
    }

    throw new BadRequestException("Checkout could not be completed safely; please retry");
  }

  async getFulfilmentOptions() {
    const [settings, zones] = await Promise.all([
      this.prisma.businessSettings.findFirst({ select: { pickupLocation: true, pickupInstructions: true } }),
      this.prisma.deliveryZone.findMany({ where: { isActive: true }, select: { city: true, charge: true, isFree: true, requiresManualConfirmation: true }, orderBy: { city: "asc" } }),
    ]);
    return {
      pickup: {
        available: Boolean(settings?.pickupLocation?.trim() && settings.pickupInstructions?.trim()),
        location: settings?.pickupLocation || null,
        instructions: settings?.pickupInstructions || null,
      },
      deliveryZones: zones.map((zone) => ({ city: zone.city, charge: zone.isFree ? 0 : zone.charge === null ? null : Number(zone.charge), isFree: zone.isFree, requiresManualConfirmation: zone.requiresManualConfirmation })),
    };
  }

  async findAll(query: { page?: number; limit?: number; status?: string; clientBusinessId?: string }, user: { id: string; role: string; aal?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: Prisma.OrderWhereInput = {};

    const isAdmin = user.role === "owner" || user.role === "admin";
    const isInternalStaff = isAdmin || user.role === "packing" || user.role === "delivery";
    if (isAdmin && user.aal !== "aal2") throw new ForbiddenException("Administrative order access requires an AAL2 session");
    if (!isInternalStaff) where.clientBusiness = { userLinks: { some: { userId: user.id, endedAt: null } } };

    if (query.status) where.status = query.status as OrderStatus;
    if (query.clientBusinessId) where.clientBusinessId = query.clientBusinessId;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          clientBusiness: { select: { id: true, businessName: true } },
          items: { take: 5, orderBy: { createdAt: "asc" } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, user: { id: string; role: string; aal?: string }) {
    const isAdmin = user.role === "owner" || user.role === "admin";
    const isInternalStaff = isAdmin || user.role === "packing" || user.role === "delivery";
    if (isAdmin && user.aal !== "aal2") throw new ForbiddenException("Administrative order access requires an AAL2 session");
    const order = await this.prisma.order.findUnique({
      where: { id, ...(isInternalStaff ? {} : { clientBusiness: { userLinks: { some: { userId: user.id, endedAt: null } } } }) },
      include: {
        clientBusiness: { select: { id: true, businessName: true } },
        placedByUser: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, sku: true, name: true } },
          },
        },
        statusHistory: { orderBy: { createdAt: "desc" } },
        invoice: true,
        delivery: true,
      },
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, userId: string) {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      pending_review: ["pending_owner_approval", "confirmed", "change_requested", "rejected", "cancelled"],
      pending_owner_approval: ["confirmed", "rejected", "cancelled"],
      confirmed: ["packed", "cancelled"],
      change_requested: ["pending_review", "rejected", "cancelled"],
      packed: ["out_for_delivery", "delivered", "return_pending_inspection"],
      out_for_delivery: ["delivered", "failed_delivery"],
      failed_delivery: ["out_for_delivery", "return_pending_inspection"],
      return_pending_inspection: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
      rejected: [],
    };

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const locked = await tx.$queryRaw<Array<{ status: OrderStatus; is_demo: boolean }>>(Prisma.sql`SELECT status, is_demo FROM orders WHERE id = ${id} FOR UPDATE`);
          if (!locked.length) throw new NotFoundException("Order not found");
          const current = locked[0].status;
          if (!transitions[current]?.includes(status)) throw new BadRequestException(`Order cannot move from ${current} to ${status}`);

          const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
          if (!order) throw new NotFoundException("Order not found");

          if (!locked[0].is_demo && status === "confirmed") await this.reserveConfirmedOrder(tx, order.items, userId);
          if (!locked[0].is_demo && status === "packed") await this.packConfirmedOrder(tx, order.items, userId);
          if (!locked[0].is_demo && ["cancelled", "rejected"].includes(status)) await this.releaseOrderReservations(tx, order.items.map((item) => item.id), userId, status);

          return tx.order.update({
            where: { id },
            data: { status, statusHistory: { create: { fromStatus: current, toStatus: status, changedById: userId } } },
            include: { statusHistory: { orderBy: { createdAt: "desc" }, take: 3 } },
          });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (cause) {
        if (databaseErrorCodeMatches(cause, new Set(["P2034", "40001"]))) {
          if (attempt < 5) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 20));
            continue;
          }
          throw new BadRequestException("Order stock changed concurrently; please retry");
        }
        throw cause;
      }
    }

    throw new BadRequestException("Order status could not be updated safely; please retry");
  }

  private async reserveConfirmedOrder(tx: Prisma.TransactionClient, items: Array<{ id: string; productId: string; baseQuantity: Prisma.Decimal; productNameSnapshot: string }>, userId: string) {
    type LockedBalance = { id: string; product_id: string; stock_location_id: string; on_hand_quantity: Prisma.Decimal; reserved_quantity: Prisma.Decimal };
    const productIds = [...new Set(items.map((item) => item.productId))];
    const balances = await tx.$queryRaw<LockedBalance[]>(Prisma.sql`
      SELECT id, product_id, stock_location_id, on_hand_quantity, reserved_quantity
      FROM stock_balances WHERE product_id IN (${Prisma.join(productIds)})
      ORDER BY product_id, id FOR UPDATE
    `);
    const remainingByBalance = new Map(balances.map((balance) => [balance.id, Number(balance.on_hand_quantity) - Number(balance.reserved_quantity)]));
    for (const item of items) {
      let remaining = Number(item.baseQuantity);
      for (const balance of balances.filter((candidate) => candidate.product_id === item.productId)) {
        if (remaining <= 0) break;
        const available = remainingByBalance.get(balance.id) || 0;
        const allocated = Math.min(remaining, available);
        if (allocated <= 0) continue;
        await tx.stockBalance.update({ where: { id: balance.id }, data: { reservedQuantity: { increment: allocated } } });
        await tx.stockReservation.create({ data: { orderItemId: item.id, productId: item.productId, stockLocationId: balance.stock_location_id, quantityBase: allocated, createdById: userId } });
        remainingByBalance.set(balance.id, available - allocated);
        remaining -= allocated;
      }
      if (remaining > 0.0001) throw new BadRequestException(`Product '${item.productNameSnapshot}' does not have enough available stock to confirm.`);
    }
  }

  private async packConfirmedOrder(tx: Prisma.TransactionClient, items: Array<{ id: string }>, userId: string) {
    const itemIds = items.map((item) => item.id);
    const reservations = await tx.stockReservation.findMany({ where: { orderItemId: { in: itemIds }, status: "active" }, include: { orderItem: true }, orderBy: [{ stockLocationId: "asc" }, { id: "asc" }] });
    if (!reservations.length) throw new BadRequestException("Confirmed order has no active stock reservations");
    const balanceIds = reservations.map((reservation) => ({ productId: reservation.productId, stockLocationId: reservation.stockLocationId }));
    await tx.$queryRaw(Prisma.sql`
      SELECT id FROM stock_balances
      WHERE (product_id, stock_location_id) IN (${Prisma.join(balanceIds.map((balance) => Prisma.sql`(${balance.productId}, ${balance.stockLocationId})`))})
      ORDER BY product_id, stock_location_id FOR UPDATE
    `);
    for (const reservation of reservations) {
      const balance = await tx.stockBalance.findUnique({ where: { productId_stockLocationId: { productId: reservation.productId, stockLocationId: reservation.stockLocationId } } });
      if (!balance || Number(balance.reservedQuantity) < Number(reservation.quantityBase) || Number(balance.onHandQuantity) < Number(reservation.quantityBase)) throw new BadRequestException(`Reserved stock is inconsistent for '${reservation.orderItem.productNameSnapshot}'`);
      const previous = Number(balance.onHandQuantity);
      const next = previous - Number(reservation.quantityBase);
      await tx.stockBalance.update({ where: { id: balance.id }, data: { onHandQuantity: next, reservedQuantity: { decrement: reservation.quantityBase }, unavailableQuantity: { increment: reservation.quantityBase } } });
      await tx.stockReservation.update({ where: { id: reservation.id }, data: { status: "consumed", consumedById: userId, consumedAt: new Date() } });
      await tx.stockMovement.create({ data: { productId: reservation.productId, stockLocationId: reservation.stockLocationId, quantityBase: reservation.quantityBase, previousQuantityBase: previous, newQuantityBase: next, fromBucket: "sellable", toBucket: "unavailable", movementType: "packing", stockReservationId: reservation.id, orderItemId: reservation.orderItemId, createdById: userId, reason: "Confirmed order packed" } });
    }
  }

  private async releaseOrderReservations(tx: Prisma.TransactionClient, itemIds: string[], userId: string, reason: string) {
    const reservations = await tx.stockReservation.findMany({ where: { orderItemId: { in: itemIds }, status: "active" }, orderBy: [{ stockLocationId: "asc" }, { id: "asc" }] });
    for (const reservation of reservations) {
      await tx.$queryRaw(Prisma.sql`SELECT id FROM stock_balances WHERE product_id = ${reservation.productId} AND stock_location_id = ${reservation.stockLocationId} FOR UPDATE`);
      const balance = await tx.stockBalance.findUnique({ where: { productId_stockLocationId: { productId: reservation.productId, stockLocationId: reservation.stockLocationId } } });
      if (!balance || Number(balance.reservedQuantity) < Number(reservation.quantityBase)) throw new BadRequestException("Reserved stock is inconsistent and cannot be released");
      await tx.stockBalance.update({ where: { id: balance.id }, data: { reservedQuantity: { decrement: reservation.quantityBase } } });
      await tx.stockReservation.update({ where: { id: reservation.id }, data: { status: "released", releasedById: userId, releasedAt: new Date(), releaseReason: `Order ${reason}` } });
    }
  }
}
