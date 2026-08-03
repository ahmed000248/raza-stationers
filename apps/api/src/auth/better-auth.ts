import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "raza-stationers-default-secret-key-123456";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: authSecret,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    async password({ password }: { password: string }) {
      return await bcrypt.hash(password, 10);
    },
    async verifyPassword({ password, hash }: { password: string; hash: string }) {
      return await bcrypt.compare(password, hash);
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
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4000",
    "https://raza-stationers-web.vercel.app",
    "https://raza-stationers-admin-seven.vercel.app",
  ],
});
