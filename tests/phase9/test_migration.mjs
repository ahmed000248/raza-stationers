import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { getPostgresConnection } from "@raza-stationers/db";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Ensure .env is loaded
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function createClient() {
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (!rawUrl) throw new Error("DATABASE_URL environment variable is required.");
  const { connectionString, ssl } = getPostgresConnection(rawUrl, "DATABASE_URL");
  const pool = new pg.Pool({ connectionString, ssl, max: 5 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  return { prisma, pool };
}

async function verifyMigration() {
  console.log("=== RUNNING C-02 STAGING SCHEMA VERIFICATION ===");
  const { prisma, pool } = createClient();

  try {
    // 1. Verify users table has new Better Auth columns
    const userCols = await prisma.$queryRaw`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('email_verified', 'image', 'two_factor_enabled');
    `;
    const colNames = userCols.map((c) => c.column_name);
    console.log("Users columns found:", colNames);
    if (!colNames.includes("email_verified") || !colNames.includes("image") || !colNames.includes("two_factor_enabled")) {
      throw new Error(`Missing expected Better Auth columns in 'users': ${JSON.stringify(userCols)}`);
    }

    // 2. Verify Better Auth tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('session', 'account', 'verification', 'two_factor');
    `;
    const tableNames = tables.map((t) => t.table_name);
    console.log("Better Auth tables found:", tableNames);
    const requiredTables = ["session", "account", "verification", "two_factor"];
    for (const reqTable of requiredTables) {
      if (!tableNames.includes(reqTable)) {
        throw new Error(`Missing required Better Auth table '${reqTable}' in database schema.`);
      }
    }

    // 3. Verify unique indexes on session.token and two_factor.user_id
    const sessionIndexes = await prisma.$queryRaw`
      SELECT indexname FROM pg_indexes WHERE tablename = 'session' AND indexname = 'session_token_key';
    `;
    if (sessionIndexes.length === 0) {
      throw new Error("Missing unique index 'session_token_key' on session.token");
    }

    const twoFactorIndexes = await prisma.$queryRaw`
      SELECT indexname FROM pg_indexes WHERE tablename = 'two_factor' AND indexname = 'two_factor_user_id_key';
    `;
    if (twoFactorIndexes.length === 0) {
      throw new Error("Missing unique index 'two_factor_user_id_key' on two_factor.user_id");
    }

    // 4. Verify existing user records preserved
    const userCount = await prisma.user.count();
    console.log(`Verified existing database users count: ${userCount}`);

    console.log("✔ ALL STAGING BETTER AUTH SCHEMA CHECKS PASSED SUCCESSFULLY!");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verifyMigration().catch((err) => {
  console.error("Migration verification failed:", err);
  process.exit(1);
});
