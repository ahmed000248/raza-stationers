import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InvoicingService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(orderId: string, userId: string, dueAt?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { clientBusiness: true },
    });
    if (!order) throw new NotFoundException("Order not found");

    const year = new Date().getFullYear();
    const seq = await this.prisma.documentSequence.upsert({
      where: { documentType_year: { documentType: "invoice", year } },
      create: { documentType: "invoice", year, nextValue: 1 },
      update: { nextValue: { increment: 1 } },
    });

    const invoiceNumber = `RS-INV-${year}-${String(seq.nextValue).padStart(6, "0")}`;
    const dueDate = dueAt ? new Date(dueAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.invoice.create({
      data: {
        orderId,
        clientBusinessId: order.clientBusinessId,
        invoiceNumber,
        invoiceYear: year,
        sequenceNumber: seq.nextValue,
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        taxTotal: order.taxTotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.grandTotal,
        issuedById: userId,
        dueAt: dueDate,
      },
      include: { order: true },
    });
  }

  async findByBusiness(clientBusinessId: string) {
    return this.prisma.invoice.findMany({
      where: { clientBusinessId },
      include: { order: { select: { id: true, orderNumber: true, status: true } } },
      orderBy: { issuedAt: "desc" },
    });
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: { include: { items: true, clientBusiness: true } },
        paymentAllocations: { include: { payment: true } },
      },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }
}
