import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [totalRevenue, totalExpenses, totalOrders, pendingInvoices] = await Promise.all([
      this.prisma.order.aggregate({ where: { status: "delivered" }, _sum: { grandTotal: true } }),
      this.prisma.expenseEntry.aggregate({ where: { voidedAt: null }, _sum: { amount: true } }),
      this.prisma.order.count(),
      this.prisma.invoice.count({ where: { status: { in: ["issued", "partially_paid"] } } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.grandTotal || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalOrders,
      pendingInvoices,
      netProfit: Number(totalRevenue._sum.grandTotal || 0) - Number(totalExpenses._sum.amount || 0),
    };
  }

  async getRevenue() {
    const orders = await this.prisma.order.findMany({
      where: { status: "delivered" },
      select: { grandTotal: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthly: Record<string, number> = {};
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 7);
      monthly[key] = (monthly[key] || 0) + Number(o.grandTotal);
    }

    return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));
  }

  async getExpenses(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const [items, total] = await Promise.all([
      this.prisma.expenseEntry.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.expenseEntry.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createExpense(data: { amount: number; category: string; description: string }, userId: string) {
    return this.prisma.expenseEntry.create({
      data: { amount: data.amount, category: data.category as any, description: data.description, createdById: userId, expenseAt: new Date() },
    });
  }

  async getOutstandingClients() {
    const clients = await this.prisma.clientBusiness.findMany({
      where: { accountStatus: "active", creditAccount: { isNot: null } },
      include: { creditAccount: true, _count: { select: { invoices: true } } },
    });
    return clients.map((c) => ({
      id: c.id,
      businessName: c.businessName,
      creditLimit: c.creditAccount?.creditLimit || 0,
      creditDays: c.creditAccount?.creditDays || 0,
    }));
  }
}
