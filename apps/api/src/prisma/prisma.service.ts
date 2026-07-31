import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as fs from "fs";
import * as path from "path";

function getSslConfig(): any {
  let currentDir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const certPath = path.join(currentDir, "supabase-ca.crt");
    if (fs.existsSync(certPath)) {
      return {
        rejectUnauthorized: true,
        ca: fs.readFileSync(certPath, "utf8"),
      };
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
  return true;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: pg.Pool;

  constructor() {
    if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
      require("dotenv").config({ path: require("path").resolve(process.cwd(), "../../.env") });
      require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env") });
    }
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    console.log(`[PrismaService] Connecting with connectionString host: ${connectionString?.split('@')[1]?.split('/')[0] || 'undefined'}`);
    const pool = new pg.Pool({
      connectionString,
      ssl: getSslConfig(),
      max: 10,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
