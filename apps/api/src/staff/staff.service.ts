import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { normalizePakistaniMobile } from "@raza-stationers/validation";

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

  async create(data: { name: string; email: string; mobileNumber: string; role: "admin" | "packing" | "delivery" }, ownerId: string) {
    if (!["admin", "packing", "delivery"].includes(data.role)) throw new ConflictException("Unsupported staff role");
    if (!data.email?.includes("@")) throw new ConflictException("A valid staff email is required");
    const mobileNumber = normalizePakistaniMobile(data.mobileNumber);
    if (!mobileNumber) throw new ConflictException("Mobile number must use the Pakistani 03XXXXXXXXX format");
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({ where: { OR: [{ mobileNumber }, { email }] }, include: { staffProfile: true } });
    if (existing) {
      if (existing.mobileNumber !== mobileNumber || existing.email?.toLowerCase() !== email) throw new ConflictException("Email or mobile number belongs to another account");
      if (existing.role !== data.role) throw new ConflictException("Existing staff role differs; use the role-change workflow");
      return { ...existing, invitationStatus: "already_linked" };
    }

    throw new ConflictException("Staff email invitations require a configured authentication provider.");
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    const updated = await this.prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });

    // Revoke all active sessions upon deactivation/status change
    await this.prisma.session.deleteMany({ where: { userId: id } });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        entityType: "user",
        entityId: id,
        action: "toggle_active",
        actorId: id,
        afterData: { isActive: updated.isActive },
      },
    }).catch(() => {});

    return updated;
  }

  async changeRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: role as any, staffProfile: { upsert: { create: { staffRole: role as any }, update: { staffRole: role as any } } } },
    });

    // Revoke sessions so stale session roles are revoked
    await this.prisma.session.deleteMany({ where: { userId: id } });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        entityType: "user",
        entityId: id,
        action: "change_role",
        actorId: id,
        afterData: { role },
      },
    }).catch(() => {});

    return updated;
  }
}
