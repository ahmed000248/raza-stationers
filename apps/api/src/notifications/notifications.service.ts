import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async subscribe(userId: string, data: { scope: string; productId?: string; categoryId?: string }) {
    return this.prisma.notificationSubscription.create({
      data: {
        userId,
        scope: data.scope as any,
        productId: data.productId,
        categoryId: data.categoryId,
      },
    });
  }

  async getSubscriptions(userId: string) {
    return this.prisma.notificationSubscription.findMany({
      where: { userId },
      include: { product: { select: { id: true, name: true } }, category: { select: { id: true, name: true } } },
    });
  }

  async removeSubscription(id: string, userId: string) {
    const sub = await this.prisma.notificationSubscription.findUnique({ where: { id } });
    if (!sub || sub.userId !== userId) throw new NotFoundException("Subscription not found");
    return this.prisma.notificationSubscription.delete({ where: { id } });
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }
}
