import { Injectable, NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};
    if (query.status) where.accountStatus = query.status;

    const [items, total] = await Promise.all([
      this.prisma.clientBusiness.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { orders: true } } },
      }),
      this.prisma.clientBusiness.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async register(userId: string, data: {
    businessName: string;
    businessType: string;
    contactPerson: string;
    mobileNumber: string;
    address: string;
    city: string;
  }) {
    const existing = await this.prisma.clientBusiness.findFirst({
      where: { mobileNumber: data.mobileNumber },
    });
    if (existing) throw new ConflictException("Business with this mobile already exists");

    const business = await this.prisma.clientBusiness.create({
      data: {
        businessName: data.businessName,
        businessType: data.businessType as any,
        contactPerson: data.contactPerson,
        mobileNumber: data.mobileNumber,
        address: data.address,
        city: data.city,
      },
    });

    await this.prisma.businessUserLink.create({
      data: {
        userId,
        clientBusinessId: business.id,
        role: "owner",
        linkedById: userId,
      },
    });

    return business;
  }

  async findById(id: string) {
    const business = await this.prisma.clientBusiness.findUnique({
      where: { id },
      include: {
        userLinks: {
          include: { user: { select: { id: true, name: true, mobileNumber: true, role: true } } },
        },
        creditAccount: true,
        _count: { select: { orders: true, invoices: true } },
      },
    });
    if (!business) throw new NotFoundException("Client business not found");
    return business;
  }

  async approve(id: string, approvedById: string) {
    const business = await this.prisma.clientBusiness.findUnique({ where: { id } });
    if (!business) throw new NotFoundException("Client business not found");
    if (business.accountStatus !== "pending") {
      throw new ConflictException("Business is not in pending status");
    }

    await this.prisma.clientBusinessApproval.create({
      data: {
        clientBusinessId: id,
        decidedById: approvedById,
        reason: "Approved by owner",
        decision: "approved",
      },
    });

    return this.prisma.clientBusiness.update({
      where: { id },
      data: { accountStatus: "active" },
    });
  }

  async getCreditSummary(id: string) {
    const business = await this.prisma.clientBusiness.findUnique({
      where: { id },
      include: { creditAccount: true },
    });
    if (!business) throw new NotFoundException("Client business not found");

    const creditEntries = business.creditAccount
      ? await this.prisma.creditLedgerEntry.findMany({
          where: { clientCreditAccountId: business.creditAccount.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

    return {
      creditAccount: business.creditAccount,
      recentEntries: creditEntries,
    };
  }
}
