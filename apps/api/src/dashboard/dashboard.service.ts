import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [pendingOrders, pendingClients, totalProducts, totalOrders] = await Promise.all([
      this.prisma.order.count({ where: { status: "pending_review" } }),
      this.prisma.clientBusiness.count({ where: { accountStatus: "pending" } }),
      this.prisma.product.count({ where: { status: { in: ["active", "pending_review"] } } }),
      this.prisma.order.count(),
    ]);

    return { pendingOrders, pendingClients, totalProducts, totalOrders };
  }
}
