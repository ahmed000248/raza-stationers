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
  /**
   * Helper to create a Prisma client instance using the PrismaPg adapter.
   */
  private static createPrismaClient(): { prisma: PrismaClient; pool: pg.Pool } {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined");
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

  /**
   * Main entry point to run dry-run or commit import pipelines.
   */
  public static async execute(options: ImportExecutionOptions): Promise<ImportExecutionResult> {
    const { sourcePath, dryRun = true, commit = false, chunkSize = 25 } = options;

    if (!sourcePath) {
      throw new Error("Source path must be specified for catalogue import");
    }

    // Read source and compute SHA-256
    const fileBytes = await fs.readFile(sourcePath);
    const fileSha256 = createHash("sha256").update(fileBytes).digest("hex");

    // Parse and validate rows
    const rawRows = await parseCatalogueCsv(sourcePath);
    const { parsedRows, profile } = validateCatalogueRows(rawRows, sourcePath, fileSha256);

    // If dry run, perform zero database writes and return immediately
    if (dryRun || !commit) {
      const proposedProducts = parsedRows.filter((r) => r.validationStatus !== "invalid").length;
      const proposedCategories = profile.uniqueCategories;
      const proposedPackaging = proposedProducts;
      const proposedPrices = parsedRows.filter((r) => r.hasPrice && r.price !== null && r.price > 0).length;

      return {
        sha256: fileSha256,
        dryRun: true,
        committed: false,
        profile,
        createdCounts: {
          categories: proposedCategories,
          products: proposedProducts,
          packaging: proposedPackaging,
          prices: proposedPrices,
          sourceMappings: proposedProducts * 3 + proposedPrices,
          rows: parsedRows.length,
          issues: parsedRows.reduce((sum, r) => sum + r.issues.length, 0),
        },
      };
    }

    // Commit mode: execute database writes
    const { prisma, pool } = CatalogueImporter.createPrismaClient();

    try {
      // 1. Ensure System Importer User exists
      let uploaderId = options.uploadedById;
      if (!uploaderId) {
        let systemUser = await prisma.user.findFirst({
          where: { mobileNumber: "+920000000000" },
        });

        if (!systemUser) {
          systemUser = await prisma.user.create({
            data: {
              mobileNumber: "+920000000000",
              email: "system.importer@razastationers.local",
              name: "System Importer",
              role: UserRole.owner,
              passwordHash: "system-importer-placeholder-hash",
            },
          });
        }
        uploaderId = systemUser.id;
      }

      // 2. Check Idempotency: Check if this file has already been committed
      const existingCommittedBatch = await prisma.importBatch.findFirst({
        where: {
          sha256: fileSha256,
          status: ImportBatchStatus.committed,
        },
      });

      if (existingCommittedBatch) {
        return {
          batchId: existingCommittedBatch.id,
          sha256: fileSha256,
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

      // 3. Create ImportBatch record (fulfilling approval constraints)
      const now = new Date();
      const importBatch = await prisma.importBatch.create({
        data: {
          originalFilename: sourcePath.split(/[/\\]/).pop() || "catalogue.csv",
          sha256: fileSha256,
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

      // 4. Pre-create/resolve unique Categories
      const categoryMap = new Map<string, string>(); // normalizedCategory -> categoryId
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

      // 5. Pre-create/resolve ALL Units of Measure referenced in parsedRows
      const uomMap = new Map<string, string>(); // uomCode -> uomId
      const allUomCodes = new Set<string>(["unit"]);
      for (const row of parsedRows) {
        if (row.detectedPackagingUnit) {
          allUomCodes.add(row.detectedPackagingUnit);
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

      // 6. Process single row handler helper
      const processSingleRow = async (row: ParsedCatalogueRow) => {
        // Create ImportRow
        const importRow = await prisma.importRow.create({
          data: {
            importBatchId: importBatch.id,
            sourceSheet: row.sourceSheet,
            sourceRowNumber: row.sourceRowNumber,
            rawData: {
              name: row.originalName,
              category: row.originalCategory,
              salesType: row.salesType,
              price: row.price,
            },
            normalizedData: {
              name: row.normalizedName,
              category: row.normalizedCategory,
              purchaseType: row.purchaseType,
              price: row.price,
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

        // Allocate SKU via PostgreSQL allocator function
        const skuResult = await prisma.$queryRaw<Array<{ sku_number: bigint; sku: string }>>`SELECT * FROM public.allocate_product_sku()`;
        const skuNumber = skuResult[0]?.sku_number;
        const sku = skuResult[0]?.sku;

        if (!sku || skuNumber == null) {
          throw new Error(`Failed to allocate SKU for row ${row.sourceRowNumber}`);
        }

        // Create Product record
        const product = await prisma.product.create({
          data: {
            skuNumber,
            sku,
            name: row.originalName,
            status: ProductStatus.pending_review,
            purchaseType: row.purchaseType,
            categoryId,
          },
        });

        // Resolve Unit of Measure from pre-populated map
        const uomCode = row.detectedPackagingUnit || "unit";
        const uomId = uomMap.get(uomCode);
        if (!uomId) {
          throw new Error(`Unit of measure ID not resolved for code: ${uomCode}`);
        }

        // Create base ProductPackaging
        const packaging = await prisma.productPackaging.create({
          data: {
            productId: product.id,
            unitOfMeasureId: uomId,
            code: `${product.sku}-BASE`,
            label: row.detectedPackagingUnit ? `Standard ${row.detectedPackagingUnit}` : "Standard Unit",
            conversionToBase: 1.0,
            isBase: true,
            confirmationStatus: ConfirmationStatus.unconfirmed,
            isActive: true,
          },
        });

        // Create ProductPrice if price exists and is strictly positive (> 0 per product_prices_amount_positive_check)
        let productPriceId: string | null = null;
        let pricesCreated = 0;
        if (row.price !== null && row.price > 0) {
          const productPrice = await prisma.productPrice.create({
            data: {
              productPackagingId: packaging.id,
              priceType: PriceType.wholesale,
              amount: row.price,
              currency: CurrencyCode.PKR,
              effectiveFrom: now,
              createdById: uploaderId,
            },
          });
          productPriceId = productPrice.id;
          pricesCreated = 1;
        }

        // Create SourceRecordMapping entries
        let mappingsCreated = 0;
        await prisma.sourceRecordMapping.create({
          data: { importRowId: importRow.id, categoryId },
        });
        mappingsCreated++;

        await prisma.sourceRecordMapping.create({
          data: { importRowId: importRow.id, productId: product.id },
        });
        mappingsCreated++;

        await prisma.sourceRecordMapping.create({
          data: { importRowId: importRow.id, productPackagingId: packaging.id },
        });
        mappingsCreated++;

        if (productPriceId) {
          await prisma.sourceRecordMapping.create({
            data: { importRowId: importRow.id, productPriceId },
          });
          mappingsCreated++;
        }

        return {
          products: 1,
          packaging: 1,
          prices: pricesCreated,
          mappings: mappingsCreated,
          rows: 1,
          issues: issuesCount,
        };
      };

      // Concurrent chunk processing
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

      // 7. Update ImportBatch status to committed
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
        sha256: fileSha256,
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
