import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getPostgresConnection } from "@raza-stationers/db";
import pg from "pg";

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

const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "raza-stationers-default-secret-key-123456";

export const auth = betterAuth({
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
    dash(),
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4000",
    "https://raza-stationers-web.vercel.app",
    "https://raza-stationers-admin-seven.vercel.app",
  ],
});
