import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, OrderStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, clientBusinessId: string, data: {
    items: Array<{ productPackagingId: string; quantity: number }>;
    recipientName: string;
    mobile: string;
    address: string;
    city: string;
    deliveryNotes?: string;
  }) {
    const year = new Date().getFullYear();
    const seq = await this.prisma.documentSequence.upsert({
      where: { documentType_year: { documentType: "order", year } },
      create: { documentType: "order", year, nextValue: 1 },
      update: { nextValue: { increment: 1 } },
    });

    const orderNumber = `ORD-${year}-${String(seq.nextValue).padStart(6, "0")}`;

    const packagingIds = data.items.map((i) => i.productPackagingId);
    const packaging = await this.prisma.productPackaging.findMany({
      where: { id: { in: packagingIds } },
      include: {
        product: true,
        unitOfMeasure: true,
        prices: {
          where: { priceType: "wholesale", effectiveTo: null },
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

      const price = pkg.prices[0];
      if (!price) throw new BadRequestException(`No wholesale price for ${pkg.product.name}`);

      const lineTotal = Number(price.amount) * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: pkg.productId,
        productPackagingId: item.productPackagingId,
        quantity: item.quantity,
        baseQuantity: item.quantity * Number(pkg.conversionToBase),
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

    return this.prisma.order.create({
      data: {
        orderNumber,
        orderYear: year,
        sequenceNumber: seq.nextValue,
        clientBusinessId,
        placedByUserId: userId,
        recipientNameSnapshot: data.recipientName,
        mobileSnapshot: data.mobile,
        addressSnapshot: data.address,
        citySnapshot: data.city,
        deliveryNotesSnapshot: data.deliveryNotes,
        subtotal,
        grandTotal: subtotal,
        status: "pending_review",
        items: { create: orderItems },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "pending_review",
            changedById: userId,
          },
        },
      },
      include: { items: true, statusHistory: true },
    });
  }

  async findAll(query: { page?: number; limit?: number; status?: string; clientBusinessId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: Prisma.OrderWhereInput = {};

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

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
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
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("Order not found");

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: status,
            changedById: userId,
          },
        },
      },
      include: { statusHistory: { orderBy: { createdAt: "desc" }, take: 3 } },
    });
  }
}
