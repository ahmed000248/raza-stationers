import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name: string; mobileNumber: string; password: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { mobileNumber: data.mobileNumber },
    });
    if (existing) {
      throw new ConflictException("Mobile number already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        mobileNumber: data.mobileNumber,
        passwordHash: hashedPassword,
        role: "business_user",
      },
    });

    return this.generateToken(user);
  }

  async login(mobileNumber: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { mobileNumber },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!password || typeof password !== 'string') {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // If TOTP is enabled for this user, return a partial token indicating 2FA is required
    if (user.isTotpEnabled) {
      return {
        requiresTotp: true,
        // Short-lived pre-auth token carrying only the user id
        preAuthToken: this.jwtService.sign(
          { sub: user.id, preAuth: true },
          { expiresIn: "5m" },
        ),
      };
    }

    return this.generateToken(user);
  }

  async verifyTotp(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isTotpEnabled || !user.totpSecret) {
      throw new UnauthorizedException("TOTP not configured for this account");
    }
    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token,
      window: 1,
    });
    if (!isValid) {
      throw new UnauthorizedException("Invalid or expired TOTP code");
    }
    return this.generateToken(user);
  }

  async setupTotp(userId: string): Promise<{ secret: string; otpauthUrl: string; qrDataUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found");
    if (!["owner", "admin"].includes(user.role)) {
      throw new BadRequestException("TOTP 2FA is only available for owner and admin roles");
    }

    const generated = speakeasy.generateSecret({
      name: `Raza Stationers (${user.mobileNumber})`,
      length: 20,
    });
    const otpauthUrl = generated.otpauth_url!;
    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Store secret (base32) but do NOT enable yet — enabled after first successful verify
    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: generated.base32 },
    });

    return { secret: generated.base32, otpauthUrl, qrDataUrl };
  }

  async enableTotp(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret) {
      throw new BadRequestException("Run TOTP setup first");
    }
    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token,
      window: 1,
    });
    if (!isValid) {
      throw new UnauthorizedException("Invalid TOTP code — setup verification failed");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { isTotpEnabled: true },
    });
    return { success: true, message: "TOTP 2FA enabled" };
  }

  async disableTotp(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isTotpEnabled || !user.totpSecret) {
      throw new BadRequestException("TOTP is not enabled for this account");
    }
    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token,
      window: 1,
    });
    if (!isValid) {
      throw new UnauthorizedException("Invalid TOTP code");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { isTotpEnabled: false, totpSecret: null },
    });
    return { success: true, message: "TOTP 2FA disabled" };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found");

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException("Current password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hashedPassword } });
    return { success: true };
  }

  private generateToken(user: { id: string; name: string; mobileNumber: string; role: string }) {
    const payload = { sub: user.id, mobileNumber: user.mobileNumber, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    };
  }
}
