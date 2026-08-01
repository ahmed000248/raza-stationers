import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as fs from "fs";
import * as path from "path";

function getSslConfig(connectionString?: string): any {
  if (connectionString) {
    try {
      const urlObj = new URL(connectionString.replace('postgresql://', 'http://').replace('postgres://', 'http://'));
      if (urlObj.hostname === '127.0.0.1' || urlObj.hostname === 'localhost') {
        return false;
      }
    } catch (e) {}
  }
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

    let schema = 'public';
    if (connectionString && connectionString.includes('schema=')) {
      const match = connectionString.match(/schema=([^&]+)/);
      if (match && match[1]) {
        schema = match[1];
      }
    }
    console.log(`[PrismaService] Setting search_path to: ${schema}`);
    const pool = new pg.Pool({
      connectionString,
      ssl: getSslConfig(connectionString),
      max: 10,
    });

    const originalConnect = pool.connect.bind(pool);
    pool.connect = (async (callback?: any) => {
      if (callback) {
        originalConnect(async (err: any, client: any, release: any) => {
          if (err) return callback(err);
          try {
            if (!client._searchPathSet) {
              await client.query(`SET search_path TO "${schema}", public`);
              client._searchPathSet = true;
            }
            callback(null, client, release);
          } catch (queryErr) {
            release();
            callback(queryErr);
          }
        });
        return;
      }

      const client = await originalConnect();
      if (!(client as any)._searchPathSet) {
        await client.query(`SET search_path TO "${schema}", public`);
        (client as any)._searchPathSet = true;
      }
      return client;
    }) as any;

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
