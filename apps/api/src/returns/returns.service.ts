import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { orderId: string; invoiceId: string; reason: string; userId: string; userRole?: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });
    if (!order) throw new NotFoundException("Order not found");

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice || invoice.orderId !== data.orderId) {
      throw new BadRequestException("Invoice does not belong to this order");
    }

    const isAdmin = data.userRole === "owner" || data.userRole === "admin";
    if (!isAdmin) {
      const activeLink = await this.prisma.businessUserLink.findFirst({
        where: { userId: data.userId, clientBusinessId: order.clientBusinessId, endedAt: null },
      });
      if (!activeLink) {
        throw new ForbiddenException("You do not have permission to request returns for this business");
      }
    }

    const allowedStatuses = ["packed", "delivered", "out_for_delivery"];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(`Returns cannot be created for orders with status '${order.status}'`);
    }

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

  async findById(id: string, user?: { id: string; role: string }) {
    const ret = await this.prisma.return.findUnique({
      where: { id },
      include: {
        order: { select: { id: true, orderNumber: true, clientBusinessId: true } },
        items: true,
        refunds: true,
      },
    });
    if (!ret) throw new NotFoundException("Return not found");

    if (user && user.role !== "owner" && user.role !== "admin") {
      const activeLink = await this.prisma.businessUserLink.findFirst({
        where: { userId: user.id, clientBusinessId: ret.order.clientBusinessId, endedAt: null },
      });
      if (!activeLink) throw new NotFoundException("Return not found");
    }

    return ret;
  }

  async findByOrder(orderId: string, user?: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException("Order not found");

    if (user && user.role !== "owner" && user.role !== "admin") {
      const activeLink = await this.prisma.businessUserLink.findFirst({
        where: { userId: user.id, clientBusinessId: order.clientBusinessId, endedAt: null },
      });
      if (!activeLink) throw new NotFoundException("Order not found");
    }

    return this.prisma.return.findMany({
      where: { orderId },
      include: { items: true },
      orderBy: { requestedAt: "desc" },
    });
  }
}
