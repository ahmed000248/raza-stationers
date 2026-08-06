import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async getResolvedPrice(sku: string, user?: { id: string; role: string }, queryClientBusinessId?: string) {
    let resolvedBusinessId: string | undefined = undefined;

    const isAdmin = user && (user.role === "owner" || user.role === "admin");
    if (isAdmin) {
      resolvedBusinessId = queryClientBusinessId;
    } else if (user?.id) {
      const activeLink = await this.prisma.businessUserLink.findFirst({
        where: { userId: user.id, endedAt: null },
      });
      resolvedBusinessId = activeLink?.clientBusinessId;
    }

    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        packaging: {
          where: { isActive: true, isBase: true },
          include: {
            prices: { where: { effectiveTo: null }, orderBy: { effectiveFrom: "desc" } },
            clientPrices: resolvedBusinessId ? { where: { clientBusinessId: resolvedBusinessId } } : false,
          },
        },
        category: true,
        discountRules: resolvedBusinessId ? { where: { clientBusinessId: resolvedBusinessId } } : false,
      },
    });
    if (!product) throw new NotFoundException("Product not found");

    const basePackaging = product.packaging[0];
    if (!basePackaging) return { sku, name: product.name, prices: [] };

    const wholesalePrice = basePackaging.prices.find((p) => p.priceType === "wholesale");
    const buyingPrice = basePackaging.prices.find((p) => p.priceType === "buying");
    const clientPrice = basePackaging.clientPrices?.[0];

    let effectivePrice = wholesalePrice?.amount || null;
    let priceSource = "wholesale_fallback";

    if (clientPrice) {
      effectivePrice = clientPrice.amount;
      priceSource = "client_specific";
    }

    if (isAdmin) {
      return {
        sku: product.sku,
        name: product.name,
        wholesalePrice: wholesalePrice?.amount || null,
        buyingPrice: buyingPrice?.amount || null,
        effectivePrice,
        priceSource,
      };
    }

    // Customer responses MUST NEVER contain buyingPrice or internal wholesale prices
    return {
      sku: product.sku,
      name: product.name,
      effectivePrice,
      priceSource,
    };
  }

  async listPrices(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        packaging: {
          where: { isActive: true },
          include: {
            prices: { orderBy: [{ priceType: "asc" }, { effectiveFrom: "desc" }] },
            unitOfMeasure: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }
}
