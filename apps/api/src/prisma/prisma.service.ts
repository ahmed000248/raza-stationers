import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getPostgresConnection } from "@raza-stationers/db";
import pg from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: pg.Pool;

  constructor() {
    const rawUrl = process.env.DATABASE_URL?.trim();
    if (!rawUrl) throw new Error("DATABASE_URL is required for API runtime database access.");

    const { connectionString, ssl, info } = getPostgresConnection(rawUrl, "DATABASE_URL");
    if (!/^[a-z_][a-z0-9_]*$/i.test(info.schema)) {
      throw new Error("DATABASE_URL contains an invalid PostgreSQL schema name.");
    }

    const pool = new pg.Pool({
      connectionString,
      ssl,
      max: 10,
      options: `-c search_path=${info.schema},public`,
    });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;

    console.log("[Database] Configuration loaded", {
      projectRef: info.projectRef,
      hostname: info.hostname,
      port: info.port,
      mode: info.mode,
      database: info.database,
      schema: info.schema,
      sslMode: info.sslMode,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
