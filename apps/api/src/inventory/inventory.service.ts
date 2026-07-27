import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getStockBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        stockBalances: {
          include: { stockLocation: true },
        },
      },
    });
    if (!product) throw new NotFoundException("Product not found");

    return {
      sku: product.sku,
      name: product.name,
      balances: product.stockBalances.map((b) => ({
        location: b.stockLocation.name,
        onHand: b.onHandQuantity,
        reserved: b.reservedQuantity,
        available: Number(b.onHandQuantity) - Number(b.reservedQuantity),
        unavailable: b.unavailableQuantity,
        inTransit: b.inTransitQuantity,
        damaged: b.damagedQuantity,
      })),
    };
  }

  async recordMovement(data: {
    productId: string;
    stockLocationId: string;
    quantityBase: number;
    fromBucket?: string;
    toBucket: string;
    movementType: string;
    userId: string;
    reason: string;
  }) {
    const balance = await this.prisma.stockBalance.findUnique({
      where: {
        productId_stockLocationId: {
          productId: data.productId,
          stockLocationId: data.stockLocationId,
        },
      },
    });

    if (!balance) throw new NotFoundException("Stock balance not found for this product/location");

    const movement = await this.prisma.stockMovement.create({
      data: {
        productId: data.productId,
        stockLocationId: data.stockLocationId,
        quantityBase: data.quantityBase,
        fromBucket: data.fromBucket as any || null,
        toBucket: data.toBucket as any,
        movementType: data.movementType as any,
        createdById: data.userId,
        reason: data.reason,
      },
    });

    return movement;
  }

  async getLocations() {
    return this.prisma.stockLocation.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }
}
