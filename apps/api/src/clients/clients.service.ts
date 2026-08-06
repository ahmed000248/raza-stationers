import { Injectable, NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { normalizePakistaniMobile } from "@raza-stationers/validation";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findMyClient(userId: string) {
    const link = await this.prisma.businessUserLink.findFirst({
      where: { userId, endedAt: null },
      include: { clientBusiness: true },
    });
    if (!link) return { clientBusiness: null, role: null };
    return { clientBusiness: link.clientBusiness, role: link.role };
  }

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
    const existingLink = await this.prisma.businessUserLink.findFirst({
      where: { userId, endedAt: null },
      include: { clientBusiness: true },
    });
    if (existingLink) {
      return existingLink.clientBusiness;
    }

    const mobileNumber = normalizePakistaniMobile(data.mobileNumber);
    if (!mobileNumber) throw new ConflictException("Mobile number must use the Pakistani 03XXXXXXXXX format");

    const existingBusiness = await this.prisma.clientBusiness.findFirst({
      where: { mobileNumber },
    });
    if (existingBusiness) {
      throw new ConflictException({
        code: "BUSINESS_ALREADY_REGISTERED",
        message: "A business with this mobile number is already registered in the system.",
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const business = await tx.clientBusiness.create({
        data: {
          businessName: data.businessName,
          businessType: data.businessType as any,
          contactPerson: data.contactPerson,
          mobileNumber,
          address: data.address,
          city: data.city,
        },
      });

      await tx.businessUserLink.create({
        data: {
          userId,
          clientBusinessId: business.id,
          role: "owner",
          linkedById: userId,
        },
      });

      return business;
    });
  }

  async findById(id: string, user?: { id: string; role: string }) {
    if (user && user.role !== "owner" && user.role !== "admin") {
      const activeLink = await this.prisma.businessUserLink.findFirst({
        where: { userId: user.id, clientBusinessId: id, endedAt: null },
      });
      if (!activeLink) {
        throw new NotFoundException("Client business not found");
      }
    }

    const business = await this.prisma.clientBusiness.findUnique({
      where: { id },
      include: {
        userLinks: {
          where: { endedAt: null },
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

  async updateCredit(id: string, data: { creditLimit: number; creditDays?: number }) {
    const business = await this.prisma.clientBusiness.findUnique({ where: { id } });
    if (!business) throw new NotFoundException("Client business not found");

    return this.prisma.clientCreditAccount.upsert({
      where: { clientBusinessId: id },
      create: { clientBusinessId: id, creditLimit: data.creditLimit, creditDays: data.creditDays || 0 },
      update: { creditLimit: data.creditLimit, creditDays: data.creditDays },
    });
  }

  async getCreditSummary(id: string, user?: { id: string; role: string }) {
    if (user && user.role !== "owner" && user.role !== "admin") {
      const activeLink = await this.prisma.businessUserLink.findFirst({
        where: { userId: user.id, clientBusinessId: id, endedAt: null },
      });
      if (!activeLink) {
        throw new NotFoundException("Client business not found");
      }
    }

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
