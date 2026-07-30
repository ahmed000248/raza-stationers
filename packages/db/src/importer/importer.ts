import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  PrismaClient,
  ImportBatchStatus,
  ImportCommitStatus,
  ProductStatus,
  PriceType,
  CurrencyCode,
  UserRole,
  ConfirmationStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { parseCatalogueCsv } from "./parser.js";
import { validateCatalogueRows } from "./validator.js";
import { ImportExecutionOptions, ImportExecutionResult, ParsedCatalogueRow } from "./types.js";

// Ensure Node TLS handles Supabase pooled connection certificates cleanly
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export function generateSlug(name: string): string {
  const clean = name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return clean || `cat-${Math.random().toString(36).substring(2, 8)}`;
}

export class CatalogueImporter {
  private static createPrismaClient(): { prisma: PrismaClient; pool: pg.Pool } {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DIRECT_URL environment variable is not defined");
    }

    const pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    return { prisma, pool };
  }

  public static async generatePlan(sourcePath: string): Promise<{ parsedRows: ParsedCatalogueRow[]; result: ImportExecutionResult }> {
    if (!sourcePath) {
      throw new Error("Source path must be specified for catalogue import");
    }

    const fileBytes = await fs.readFile(sourcePath);
    const fileSha256 = createHash("sha256").update(fileBytes).digest("hex");

    const rawRows = await parseCatalogueCsv(sourcePath);
    const { parsedRows, profile } = validateCatalogueRows(rawRows, sourcePath, fileSha256);

    const proposedProducts = parsedRows.filter((r) => r.validationStatus !== "invalid").length;
    const proposedCategories = profile.uniqueCategories;
    const proposedPackaging = proposedProducts;
    const proposedPrices = parsedRows.filter((r) => r.hasPrice && r.wholesalePrice !== null && r.wholesalePrice > 0).length;

    const result: ImportExecutionResult = {
      sha256: fileSha256,
      dryRun: true,
      committed: false,
      profile,
      createdCounts: {
        categories: proposedCategories,
        products: proposedProducts,
        packaging: proposedPackaging,
        prices: proposedPrices,
        sourceMappings: proposedProducts,
        rows: parsedRows.length,
        issues: parsedRows.reduce((sum, r) => sum + r.issues.length, 0),
      },
    };

    return { parsedRows, result };
  }

  public static async commit(
    parsedRows: ParsedCatalogueRow[],
    profile: ImportExecutionResult["profile"],
    uploaderId: string,
    chunkSize = 25
  ): Promise<ImportExecutionResult> {
    if (!uploaderId) {
      throw new Error("A valid authenticated Admin user ID is required to commit an import.");
    }

    const { prisma, pool } = CatalogueImporter.createPrismaClient();

    try {
      const existingCommittedBatch = await prisma.importBatch.findFirst({
        where: {
          sha256: profile.fileSha256,
          status: ImportBatchStatus.committed,
        },
      });

      if (existingCommittedBatch) {
        return {
          batchId: existingCommittedBatch.id,
          sha256: profile.fileSha256,
          dryRun: false,
          committed: true,
          alreadyCommitted: true,
          profile,
          createdCounts: {
            categories: 0,
            products: 0,
            packaging: 0,
            prices: 0,
            sourceMappings: 0,
            rows: 0,
            issues: 0,
          },
        };
      }

      const now = new Date();
      const importBatch = await prisma.importBatch.create({
        data: {
          originalFilename: profile.sourcePath.split(/[/\\]/).pop() || "catalogue.csv",
          sha256: profile.fileSha256,
          status: ImportBatchStatus.committing,
          totalRows: profile.totalSourceRows,
          validRows: profile.validRows,
          warningRows: profile.warningRows,
          invalidRows: profile.invalidRows,
          uploadedById: uploaderId,
          approvedById: uploaderId,
          approvedAt: now,
          createdAt: now,
        },
      });

      let createdCategoriesCount = 0;
      let createdProductsCount = 0;
      let createdPackagingCount = 0;
      let createdPricesCount = 0;
      let createdMappingsCount = 0;
      let createdRowsCount = 0;
      let createdIssuesCount = 0;

      const categoryMap = new Map<string, string>();
      const uniqueCategoryNames = new Set(parsedRows.map((r) => r.originalCategory));

      for (const catName of uniqueCategoryNames) {
        const norm = catName.normalize("NFKC").trim().toLowerCase();
        let cat = await prisma.category.findFirst({
          where: { name: { equals: catName, mode: "insensitive" } },
        });

        if (!cat) {
          const slug = generateSlug(catName);
          cat = await prisma.category.create({
            data: {
              name: catName,
              slug,
              isActive: true,
            },
          });
          createdCategoriesCount++;
        }
        categoryMap.set(norm, cat.id);
      }

      const uomMap = new Map<string, string>();
      const allUomCodes = new Set<string>(["piece"]);
      for (const row of parsedRows) {
        if (row.unitOfMeasure) {
          allUomCodes.add(row.unitOfMeasure);
        }
      }

      for (const uomCode of allUomCodes) {
        let uom = await prisma.unitOfMeasure.findUnique({
          where: { code: uomCode },
        });

        if (!uom) {
          uom = await prisma.unitOfMeasure.create({
            data: {
              code: uomCode,
              name: uomCode.charAt(0).toUpperCase() + uomCode.slice(1),
              isActive: true,
            },
          });
        }
        uomMap.set(uomCode, uom.id);
      }

      const processSingleRow = async (row: ParsedCatalogueRow) => {
        const importRow = await prisma.importRow.create({
          data: {
            importBatchId: importBatch.id,
            sourceSheet: row.sourceSheet,
            sourceRowNumber: row.sourceRowNumber,
            rawData: {
              sku: row.sku,
              name: row.originalName,
              category: row.originalCategory,
              salesType: row.salesType,
              wholesalePrice: row.wholesalePrice,
              buyingPrice: row.buyingPrice,
              sourceKey: row.sourceKey,
            },
            normalizedData: {
              sku: row.sku,
              name: row.normalizedName,
              category: row.normalizedCategory,
              purchaseType: row.purchaseType,
              wholesalePrice: row.wholesalePrice,
              buyingPrice: row.buyingPrice,
              sourceKey: row.sourceKey,
            },
            validationStatus: row.validationStatus,
            commitStatus: row.validationStatus === "invalid" ? ImportCommitStatus.failed : ImportCommitStatus.imported,
          },
        });

        let issuesCount = 0;
        for (const issue of row.issues) {
          await prisma.importIssue.create({
            data: {
              importRowId: importRow.id,
              severity: issue.severity,
              code: issue.code,
              fieldName: issue.fieldName,
              message: issue.message,
            },
          });
          issuesCount++;
        }

        if (row.validationStatus === "invalid") {
          return {
            products: 0,
            packaging: 0,
            prices: 0,
            mappings: 0,
            rows: 1,
            issues: issuesCount,
          };
        }

        const categoryId = categoryMap.get(row.normalizedCategory);
        if (!categoryId) {
          throw new Error(`Category ID not resolved for category: ${row.originalCategory}`);
        }

        const skuNumParsed = parseInt(row.sku.replace(/\D/g, ""), 10);
        if (isNaN(skuNumParsed)) {
          throw new Error(`Failed to extract numeric SKU from ${row.sku}`);
        }

        const product = await prisma.product.upsert({
          where: { skuNumber: BigInt(skuNumParsed) },
          update: {
            sku: row.sku,
            name: row.originalName,
            status: ProductStatus.pending_review,
            purchaseType: row.purchaseType,
            categoryId,
          },
          create: {
            skuNumber: BigInt(skuNumParsed),
            sku: row.sku,
            name: row.originalName,
            status: ProductStatus.pending_review,
            purchaseType: row.purchaseType,
            categoryId,
          },
        });

        const uomCode = row.unitOfMeasure || "piece";
        const uomId = uomMap.get(uomCode);
        if (!uomId) {
          throw new Error(`Unit of measure ID not resolved for code: ${uomCode}`);
        }

        const packaging = await prisma.productPackaging.upsert({
          where: { productId_code: { productId: product.id, code: `${product.sku}-BASE` } },
          update: {
            label: `Standard ${row.unitOfMeasure || "Piece"}`,
            conversionToBase: 1.0,
            packQuantity: row.packQuantity,
            isBase: true,
            confirmationStatus: ConfirmationStatus.unconfirmed,
            isActive: row.isActive,
          },
          create: {
            productId: product.id,
            unitOfMeasureId: uomId,
            code: `${product.sku}-BASE`,
            label: `Standard ${row.unitOfMeasure || "Piece"}`,
            conversionToBase: 1.0,
            packQuantity: row.packQuantity,
            isBase: true,
            confirmationStatus: ConfirmationStatus.unconfirmed,
            isActive: row.isActive,
          },
        });

        let productPriceId: string | null = null;
        let pricesCreated = 0;
        if (row.wholesalePrice !== null && row.wholesalePrice > 0) {
          const productPrice = await prisma.productPrice.create({
            data: {
              productPackagingId: packaging.id,
              priceType: PriceType.wholesale,
              amount: row.wholesalePrice,
              currency: CurrencyCode.PKR,
              effectiveFrom: now,
              createdById: uploaderId,
            },
          });
          productPriceId = productPrice.id;
          pricesCreated = 1;
        }

        if (row.buyingPrice !== null && row.buyingPrice > 0) {
          const buyingPrice = await prisma.productPrice.create({
            data: {
              productPackagingId: packaging.id,
              priceType: PriceType.buying,
              amount: row.buyingPrice,
              currency: CurrencyCode.PKR,
              effectiveFrom: now,
              createdById: uploaderId,
            },
          });
          pricesCreated++;
        }

        await prisma.sourceRecordMapping.upsert({
          where: { sourceSystem_sourceKey: { sourceSystem: "Excel", sourceKey: row.sourceKey } },
          update: {
            importRowId: importRow.id,
            productId: product.id,
          },
          create: {
            importRowId: importRow.id,
            sourceSystem: "Excel",
            sourceKey: row.sourceKey,
            productId: product.id,
          },
        });

        return {
          products: 1,
          packaging: 1,
          prices: pricesCreated,
          mappings: 1,
          rows: 1,
          issues: issuesCount,
        };
      };

      for (let i = 0; i < parsedRows.length; i += chunkSize) {
        const chunk = parsedRows.slice(i, i + chunkSize);
        const results = await Promise.all(chunk.map((row) => processSingleRow(row)));

        for (const res of results) {
          createdProductsCount += res.products;
          createdPackagingCount += res.packaging;
          createdPricesCount += res.prices;
          createdMappingsCount += res.mappings;
          createdRowsCount += res.rows;
          createdIssuesCount += res.issues;
        }
      }

      const commitTime = new Date();
      await prisma.importBatch.update({
        where: { id: importBatch.id },
        data: {
          status: ImportBatchStatus.committed,
          committedById: uploaderId,
          committedAt: commitTime,
        },
      });

      return {
        batchId: importBatch.id,
        sha256: profile.fileSha256,
        dryRun: false,
        committed: true,
        profile,
        createdCounts: {
          categories: createdCategoriesCount,
          products: createdProductsCount,
          packaging: createdPackagingCount,
          prices: createdPricesCount,
          sourceMappings: createdMappingsCount,
          rows: createdRowsCount,
          issues: createdIssuesCount,
        },
      };
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  }
}
