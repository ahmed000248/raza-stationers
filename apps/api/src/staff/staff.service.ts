import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { role: { in: ["admin", "packing", "delivery"] } },
      include: { staffProfile: true },
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      mobileNumber: u.mobileNumber,
      role: u.role,
      staffRole: u.staffProfile?.staffRole || null,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));
  }

  async create(data: { name: string; mobileNumber: string; password: string; role: string; staffRole?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { mobileNumber: data.mobileNumber } });
    if (existing) throw new ConflictException("Mobile number already registered");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        mobileNumber: data.mobileNumber,
        passwordHash: hashedPassword,
        role: data.role as any,
        staffProfile: { create: { staffRole: (data.staffRole || data.role) as any } },
      },
      include: { staffProfile: true },
    });
    return { id: user.id, name: user.name, mobileNumber: user.mobileNumber, role: user.role, staffRole: user.staffProfile?.staffRole, isActive: user.isActive };
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return this.prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  }

  async changeRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return this.prisma.user.update({ where: { id }, data: { role: role as any, staffProfile: { upsert: { create: { staffRole: role as any }, update: { staffRole: role as any } } } } });
  }
}
