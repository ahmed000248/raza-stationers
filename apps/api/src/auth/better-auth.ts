import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import * as bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getPostgresConnection } from "@raza-stationers/db";
import pg from "pg";
import { getTrustedOrigins, validateEnvironment } from "../config/env.config";

validateEnvironment();

async function sendResetPasswordEmail(to: string, resetUrl: string) {
  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || "587", 10);
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Raza Stationers" <no-reply@razastationers.com>';

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transporter.sendMail({
        from,
        to,
        subject: "Reset your Raza Stationers password",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #064e3b; margin-top: 0;">Reset Your Password</h2>
            <p>We received a request to reset your password for your Raza Stationers account.</p>
            <p>Click the button below to choose a new password:</p>
            <p style="margin: 24px 0;">
              <a href="${resetUrl}" style="background-color: #064e3b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
      console.log(`[Better Auth] Reset Password email sent successfully.`);
    } catch (err: any) {
      console.error(`[Better Auth] Failed to send reset email via SMTP:`, err.message || err);
    }
  } else {
    console.warn(`[Better Auth] SMTP is not configured. Reset email not dispatched.`);
  }
}

function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (!rawUrl) {
    return new PrismaClient({
      adapter: new PrismaPg(new pg.Pool({ connectionString: "postgresql://localhost:5432/dummy" })),
    });
  }
  const { connectionString, ssl, info } = getPostgresConnection(rawUrl, "DATABASE_URL");
  const pool = new pg.Pool({
    connectionString,
    ssl,
    max: 10,
    options: `-c search_path=${info.schema},public`,
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createPrismaClient();
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET!;
const isProd = process.env.NODE_ENV === "production";
const authUrl = process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
  baseURL: authUrl || "http://localhost:4000",
  basePath: "/auth/api",
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProd,
      httpOnly: true,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: authSecret,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "business_user",
      },
      mobileNumber: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    async sendResetPassword({ user, url }) {
      await sendResetPasswordEmail(user.email, url);
    },
    password: {
      hash: async (password: string) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ password, hash }: { password: string; hash: string }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  plugins: [
    twoFactor({
      issuer: "Raza Stationers",
    }),
  ],
  trustedOrigins: getTrustedOrigins(),
});
