import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { orderId: string; invoiceId: string; reason: string; userId: string }) {
    return this.prisma.return.create({
      data: {
        orderId: data.orderId,
        invoiceId: data.invoiceId,
        reason: data.reason,
        status: "requested",
        requestedById: data.userId,
      },
      include: { order: { select: { orderNumber: true } } },
    });
  }

  async findById(id: string) {
    const ret = await this.prisma.return.findUnique({
      where: { id },
      include: {
        order: { select: { orderNumber: true } },
        items: true,
        refunds: true,
      },
    });
    if (!ret) throw new NotFoundException("Return not found");
    return ret;
  }

  async findByOrder(orderId: string) {
    return this.prisma.return.findMany({
      where: { orderId },
      include: { items: true },
      orderBy: { requestedAt: "desc" },
    });
  }
}
