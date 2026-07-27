import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException("Order not found");

    return this.prisma.delivery.create({
      data: {
        orderId,
        recipientNameSnapshot: order.recipientNameSnapshot,
        mobileSnapshot: order.mobileSnapshot,
        addressSnapshot: order.addressSnapshot,
      },
      include: { order: { select: { orderNumber: true, status: true } } },
    });
  }

  async findById(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: { include: { clientBusiness: true, items: true } },
        attempts: { orderBy: { attemptNumber: "asc" } },
      },
    });
    if (!delivery) throw new NotFoundException("Delivery not found");
    return delivery;
  }

  async findByOrder(orderId: string) {
    return this.prisma.delivery.findUnique({
      where: { orderId },
      include: { attempts: { orderBy: { attemptNumber: "asc" } } },
    });
  }
}
