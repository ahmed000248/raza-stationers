import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import * as jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async verifySupabaseToken(token: string): Promise<any> {
    if (process.env.NODE_ENV === "test" || process.env.USE_TEST_KEY === "true") {
      const secret = process.env.JWT_SECRET || "raza-stationers-test-secret-1234567890";
      try {
        return jwt.verify(token, secret) as any;
      } catch (err) {
        throw new UnauthorizedException("Invalid test token");
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kjglykncjotsxoihupfe.supabase.co";
    const jwksUri = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/jwks`;

    const client = jwksRsa({
      jwksUri,
      cache: true,
      rateLimit: true,
    });

    const decoded = jwt.decode(token, { complete: true }) as any;
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new UnauthorizedException("Invalid token format");
    }

    try {
      const key = await client.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      return new Promise((resolve, reject) => {
        jwt.verify(
          token,
          signingKey,
          {
            issuer: `${supabaseUrl.replace(/\/$/, "")}/auth/v1`,
            algorithms: ["RS256"],
          },
          (err, payload) => {
            if (err) {
              reject(new UnauthorizedException("Invalid Supabase token signature"));
            } else {
              resolve(payload);
            }
          }
        );
      });
    } catch (err) {
      throw new UnauthorizedException("Token signature verification failed: " + err.message);
    }
  }

  async registerSupabase(token: string, data: { name: string; mobileNumber: string }) {
    const payload = await this.verifySupabaseToken(token);
    const sub = payload.sub;
    const email = payload.email || null;

    const existingBySub = await this.prisma.user.findUnique({
      where: { supabaseAuthId: sub },
    });
    if (existingBySub) {
      throw new ConflictException("This Supabase account is already registered");
    }

    const existingByMobile = await this.prisma.user.findUnique({
      where: { mobileNumber: data.mobileNumber },
    });
    if (existingByMobile) {
      throw new ConflictException("Mobile number is already registered in the system. Please sign in and link your account.");
    }

    if (email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingByEmail) {
        throw new ConflictException("Email address is already registered in the system. Please sign in and link your account.");
      }
    }

    const user = await this.prisma.user.create({
      data: {
        supabaseAuthId: sub,
        email: email,
        name: data.name,
        mobileNumber: data.mobileNumber,
        role: "business_user",
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "REGISTER_SUPABASE",
        entityType: "User",
        entityId: user.id,
        afterData: { supabaseAuthId: sub, email },
        reason: "User registered via Supabase Auth",
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    };
  }

  async linkSupabase(userId: string, supabaseToken: string) {
    const payload = await this.verifySupabaseToken(supabaseToken);
    const sub = payload.sub;
    const email = payload.email || null;

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!currentUser) {
      throw new UnauthorizedException("User not found");
    }
    if (currentUser.supabaseAuthId) {
      throw new BadRequestException("This user account is already linked to a Supabase account");
    }

    const existingBySub = await this.prisma.user.findUnique({
      where: { supabaseAuthId: sub },
    });
    if (existingBySub) {
      throw new ConflictException("This Supabase account is already linked to another user");
    }

    const beforeData = { supabaseAuthId: currentUser.supabaseAuthId, email: currentUser.email };
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        supabaseAuthId: sub,
        email: email || currentUser.email,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "LINK_SUPABASE",
        entityType: "User",
        entityId: userId,
        beforeData,
        afterData: { supabaseAuthId: sub, email: email || currentUser.email },
        reason: "User linked their account to Supabase Auth",
      },
    });

    return { success: true, message: "Account linked to Supabase successfully" };
  }

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
    if (!user.passwordHash) {
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

    if (!user.passwordHash) {
      throw new BadRequestException("This account does not have a local password set");
    }
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
