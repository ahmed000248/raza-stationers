import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHealth() {
    let dbStatus = "unknown";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (err) {
      dbStatus = "disconnected";
    }

    return {
      status: "ok",
      version: "0.1.0",
      services: {
        database: dbStatus,
      },
    };
  }
}
