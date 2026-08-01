import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { normalizePakistaniMobile } from "@raza-stationers/validation";
import { createClient } from "@supabase/supabase-js";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) throw new ConflictException("Staff invitations are not configured on this environment");
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const invitation = await supabase.auth.admin.inviteUserByEmail(email, { data: { name: data.name.trim() } });
    if (invitation.error || !invitation.data.user) throw new ConflictException(invitation.error?.message || "Supabase invitation failed");

    let user;
    try {
      user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({ data: { name: data.name.trim(), email, mobileNumber, supabaseAuthId: invitation.data.user!.id, role: data.role, staffProfile: { create: { staffRole: data.role } } }, include: { staffProfile: true } });
        await tx.auditLog.create({ data: { actorId: ownerId, action: "STAFF_INVITED", entityType: "User", entityId: created.id, afterData: { email, mobileNumber, role: data.role, supabaseAuthId: invitation.data.user!.id }, reason: "AAL2 owner invited staff from the private Admin application" } });
        return created;
      });
    } catch (cause) {
      const cleanup = await supabase.auth.admin.deleteUser(invitation.data.user.id);
      if (cleanup.error) throw new ConflictException(`Staff record creation failed and the Supabase invitation requires manual cleanup: ${cleanup.error.message}`);
      throw cause;
    }
    return { id: user.id, name: user.name, email: user.email, mobileNumber: user.mobileNumber, role: user.role, staffRole: user.staffProfile?.staffRole, isActive: user.isActive, invitationStatus: "invited" };
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
