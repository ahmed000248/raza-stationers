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
  Prisma,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { parseCatalogueCsv, parseCatalogueXlsx } from "./parser.js";
import { validateCatalogueRows } from "./validator.js";
import { ImportExecutionOptions, ImportExecutionResult, ParsedCatalogueRow } from "./types.js";

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

    const { headerChecksum, rows: rawRows } = await parseCatalogueXlsx(sourcePath);
    const { parsedRows, profile } = validateCatalogueRows(rawRows, sourcePath, fileSha256);

    const { prisma: checkPrisma, pool: checkPool } = CatalogueImporter.createPrismaClient();
    try {
      const shaRegex = /^[0-9a-fA-F]{64}$/;
      const lookupSha = shaRegex.test(fileSha256)
        ? fileSha256.toLowerCase()
        : createHash("sha256").update(fileSha256).digest("hex");

      const existingCommittedBatch = await checkPrisma.importBatch.findFirst({
        where: {
          sha256: lookupSha,
          status: ImportBatchStatus.committed,
        },
      });

      if (existingCommittedBatch) {
        const result: ImportExecutionResult = {
          sha256: fileSha256,
          dryRun: true,
          committed: false,
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
          actionSetChecksum: "",
          relevantDatabaseStateChecksum: "",
          importerVersion: "1.0.0",
          worksheetName: "Products",
          headerChecksum,
          planChecksum: existingCommittedBatch.id, // Return the stored checksum!
        };
        return { parsedRows, result };
      }
    } catch (e) {
      // Ignore query errors and proceed to normal plan calculation
    } finally {
      await checkPrisma.$disconnect();
      await checkPool.end();
    }

    const proposedProducts = parsedRows.filter((r) => r.validationStatus !== "invalid").length;
    const proposedCategories = profile.uniqueCategories;
    const proposedPackaging = proposedProducts;

    let proposedPrices = 0;
    for (const r of parsedRows) {
      if (r.validationStatus !== "invalid") {
        if (r.wholesalePrice !== null && r.wholesalePrice > 0) proposedPrices++;
        if (r.buyingPrice !== null && r.buyingPrice > 0) proposedPrices++;
      }
    }

    const { prisma, pool } = CatalogueImporter.createPrismaClient();
    try {
      const rowActions = parsedRows.map(row => {
        const buyingPriceHash = row.buyingPrice !== null
          ? createHash("sha256").update(String(row.buyingPrice)).digest("hex")
          : null;
          
        return {
          sku: row.sku,
          name: row.originalName,
          category: row.normalizedCategory,
          purchaseType: row.purchaseType,
          unitOfMeasure: row.unitOfMeasure,
          packQuantity: row.packQuantity,
          wholesalePrice: row.wholesalePrice,
          buyingPriceHash: buyingPriceHash,
          sourceKey: row.sourceKey
        };
      });
      rowActions.sort((a: any, b: any) => a.sku.localeCompare(b.sku));
      const actionSetSerialized = JSON.stringify(rowActions);
      const actionSetChecksum = createHash("sha256").update(actionSetSerialized).digest("hex");

      const skus = Array.from(new Set(parsedRows.map(r => r.sku)));
      const skuNumbers = skus.map(s => {
        const num = parseInt(s.replace(/\D/g, ""), 10);
        return isNaN(num) ? -1n : BigInt(num);
      }).filter(n => n !== -1n);

      const existingProducts = await prisma.product.findMany({
        where: { skuNumber: { in: skuNumbers } },
        include: {
          packaging: {
            include: {
              prices: {
                where: { effectiveTo: null }
              }
            }
          }
        }
      });

      const sourceKeys = Array.from(new Set(parsedRows.map(r => r.sourceKey)));
      const existingMappings = await prisma.sourceRecordMapping.findMany({
        where: { sourceKey: { in: sourceKeys }, sourceSystem: "Excel" }
      });

      const dbState = existingProducts.map((p: any) => {
        const packagingsSorted = p.packaging.map((pkg: any) => {
          const pricesSorted = pkg.prices.map((pr: any) => {
            const amountStr = pr.amount.toString();
            const amountRep = pr.priceType === PriceType.buying
              ? createHash("sha256").update(amountStr).digest("hex")
              : amountStr;
              
            return {
              priceType: pr.priceType,
              amount: amountRep,
              currency: pr.currency
            };
          });
          pricesSorted.sort((a: any, b: any) => a.priceType.localeCompare(b.priceType));
          
          return {
            code: pkg.code,
            label: pkg.label,
            packQuantity: pkg.packQuantity,
            isBase: pkg.isBase,
            prices: pricesSorted
          };
        });
        packagingsSorted.sort((a: any, b: any) => a.code.localeCompare(b.code));
        
        return {
          sku: p.sku,
          name: p.name,
          purchaseType: p.purchaseType,
          status: p.status,
          packagings: packagingsSorted
        };
      });
      dbState.sort((a: any, b: any) => a.sku.localeCompare(b.sku));

      const mappingsSorted = existingMappings.map((m: any) => ({
        sourceKey: m.sourceKey,
        sourceSystem: m.sourceSystem,
        productId: m.productId
      }));
      mappingsSorted.sort((a: any, b: any) => a.sourceKey.localeCompare(b.sourceKey));

      const dbStateSerialized = JSON.stringify({ products: dbState, mappings: mappingsSorted });
      const relevantDatabaseStateChecksum = createHash("sha256").update(dbStateSerialized).digest("hex");

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
        actionSetChecksum,
        relevantDatabaseStateChecksum,
        importerVersion: "1.0.0",
        worksheetName: "Products",
        headerChecksum
      };

      const stablePlan = {
        fileSha256: result.sha256,
        importerVersion: result.importerVersion,
        worksheetName: result.worksheetName,
        headerChecksum: result.headerChecksum,
        actionSetChecksum: result.actionSetChecksum,
        relevantDatabaseStateChecksum: result.relevantDatabaseStateChecksum,
        createdCounts: result.createdCounts,
      };
      const planChecksum = createHash("sha256").update(JSON.stringify(stablePlan)).digest("hex");
      result.planChecksum = planChecksum;

      return { parsedRows, result };
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  }

  private static async calculateDatabaseStateChecksum(prismaInstance: any, parsedRows: ParsedCatalogueRow[]): Promise<string> {
    const skus = Array.from(new Set(parsedRows.map(r => r.sku)));
    const skuNumbers = skus.map(s => {
      const num = parseInt(s.replace(/\D/g, ""), 10);
      return isNaN(num) ? -1n : BigInt(num);
    }).filter(n => n !== -1n);

    const existingProducts = await prismaInstance.product.findMany({
      where: { skuNumber: { in: skuNumbers } },
      include: {
        packaging: {
          include: {
            prices: {
              where: { effectiveTo: null }
            }
          }
        }
      }
    });

    const sourceKeys = Array.from(new Set(parsedRows.map(r => r.sourceKey)));
    const existingMappings = await prismaInstance.sourceRecordMapping.findMany({
      where: { sourceKey: { in: sourceKeys }, sourceSystem: "Excel" }
    });

    const dbState = existingProducts.map((p: any) => {
      const packagingsSorted = p.packaging.map((pkg: any) => {
        const pricesSorted = pkg.prices.map((pr: any) => {
          const amountStr = pr.amount.toString();
          const amountRep = pr.priceType === PriceType.buying
            ? createHash("sha256").update(amountStr).digest("hex")
            : amountStr;
            
          return {
            priceType: pr.priceType,
            amount: amountRep,
            currency: pr.currency
          };
        });
        pricesSorted.sort((a: any, b: any) => a.priceType.localeCompare(b.priceType));
        
        return {
          code: pkg.code,
          label: pkg.label,
          packQuantity: pkg.packQuantity,
          isBase: pkg.isBase,
          prices: pricesSorted
        };
      });
      packagingsSorted.sort((a: any, b: any) => a.code.localeCompare(b.code));
      
      return {
        sku: p.sku,
        name: p.name,
        purchaseType: p.purchaseType,
        status: p.status,
        packagings: packagingsSorted
      };
    });
    dbState.sort((a: any, b: any) => a.sku.localeCompare(b.sku));

    const mappingsSorted = existingMappings.map((m: any) => ({
      sourceKey: m.sourceKey,
      sourceSystem: m.sourceSystem,
      productId: m.productId
    }));
    mappingsSorted.sort((a: any, b: any) => a.sourceKey.localeCompare(b.sourceKey));

    const dbStateSerialized = JSON.stringify({ products: dbState, mappings: mappingsSorted });
    return createHash("sha256").update(dbStateSerialized).digest("hex");
  }

  public static async commit(
    parsedRows: ParsedCatalogueRow[],
    profile: ImportExecutionResult["profile"],
    uploaderId: string,
    planChecksum: string,
    chunkSize = 25,
    forceFailureForTest = false
  ): Promise<ImportExecutionResult> {
    if (!uploaderId) {
      throw new Error("A valid authenticated Admin user ID is required to commit an import.");
    }
    const { prisma, pool } = CatalogueImporter.createPrismaClient();

    try {
      const commitResult = await prisma.$transaction(async (tx) => {
        // d. Acquire the PostgreSQL transaction advisory lock
        const hexRegex = /^[0-9a-fA-F]+$/;
        let lockIdHex = profile.fileSha256.substring(0, 15);
        if (!hexRegex.test(lockIdHex)) {
          lockIdHex = createHash("sha256").update(profile.fileSha256).digest("hex").substring(0, 15);
        }
        const lockId = BigInt("0x" + lockIdHex);
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockId})`;

        // e. Check for an existing committed ImportBatch for the certified workbook
        const shaRegex = /^[0-9a-fA-F]{64}$/;
        const lookupSha = shaRegex.test(profile.fileSha256)
          ? profile.fileSha256.toLowerCase()
          : createHash("sha256").update(profile.fileSha256).digest("hex");

        const existingCommittedBatch = await tx.importBatch.findFirst({
          where: {
            sha256: lookupSha,
            status: ImportBatchStatus.committed,
          },
        });

        // f. If found, verify the submitted checksum against the checksum stored on that committed batch and return result
        if (existingCommittedBatch) {
          if (existingCommittedBatch.id !== planChecksum) {
            throw new Error(`Plan checksum mismatch on retry. Stored: ${existingCommittedBatch.id}, Submitted: ${planChecksum}`);
          }
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

        // g. If not found, regenerate the current plan and relevant database-state checksum
        let currentRows = parsedRows;
        let currentProfile = profile;

        if (parsedRows.length === 0) {
          const { rows: rawRows } = await parseCatalogueXlsx(profile.sourcePath);
          const fileBytes = await fs.readFile(profile.sourcePath);
          const fileSha256 = createHash("sha256").update(fileBytes).digest("hex");
          const { parsedRows: freshParsedRows, profile: freshProfile } = validateCatalogueRows(rawRows, profile.sourcePath, fileSha256);
          currentRows = freshParsedRows;
          currentProfile = freshProfile;
        }

        if (currentProfile.invalidRows > 0) {
          throw new Error("Catalogue contains validation errors and cannot be committed.");
        }

        const currentDbStateChecksum = await CatalogueImporter.calculateDatabaseStateChecksum(tx, currentRows);

        const rowActions = currentRows.map(row => {
          const buyingPriceHash = row.buyingPrice !== null
            ? createHash("sha256").update(String(row.buyingPrice)).digest("hex")
            : null;
            
          return {
            sku: row.sku,
            name: row.originalName,
            category: row.normalizedCategory,
            purchaseType: row.purchaseType,
            unitOfMeasure: row.unitOfMeasure,
            packQuantity: row.packQuantity,
            wholesalePrice: row.wholesalePrice,
            buyingPriceHash: buyingPriceHash,
            sourceKey: row.sourceKey
          };
        });
        rowActions.sort((a: any, b: any) => a.sku.localeCompare(b.sku));
        const actionSetSerialized = JSON.stringify(rowActions);
        const actionSetChecksum = createHash("sha256").update(actionSetSerialized).digest("hex");

        const headerStr = "SKU,Product Name,Category,Sales Type,Unit of Measure,Pack Quantity,Currency,Wholesale Price,Buying Price,Profit,Profit Margin %,Markup %,Active,Source Key";
        const headerChecksum = createHash("sha256").update(headerStr).digest("hex");

        const proposedProducts = currentRows.filter((r) => r.validationStatus !== "invalid").length;
        const proposedCategories = currentProfile.uniqueCategories;
        const proposedPackaging = proposedProducts;
        let proposedPrices = 0;
        for (const r of currentRows) {
          if (r.validationStatus !== "invalid") {
            if (r.wholesalePrice !== null && r.wholesalePrice > 0) proposedPrices++;
            if (r.buyingPrice !== null && r.buyingPrice > 0) proposedPrices++;
          }
        }

        const stablePlan = {
          fileSha256: currentProfile.fileSha256,
          importerVersion: "1.0.0",
          worksheetName: "Products",
          headerChecksum: headerChecksum,
          actionSetChecksum: actionSetChecksum,
          relevantDatabaseStateChecksum: currentDbStateChecksum,
          createdCounts: {
            categories: proposedCategories,
            products: proposedProducts,
            packaging: proposedPackaging,
            prices: proposedPrices,
            sourceMappings: proposedProducts,
            rows: currentRows.length,
            issues: currentRows.reduce((sum, r) => sum + r.issues.length, 0),
          },
        };

        const computedPlanChecksum = createHash("sha256").update(JSON.stringify(stablePlan)).digest("hex");

        // h. Compare the submitted plan checksum
        if (computedPlanChecksum !== planChecksum) {
          throw new Error(`Plan checksum mismatch. The database state or workbook changed since the plan was generated. Expected: ${planChecksum}, Computed: ${computedPlanChecksum}`);
        }

        // i. Commit all batch, row, catalogue, price and mapping writes atomically
        const now = new Date();
        const importBatch = await tx.importBatch.create({
          data: {
            id: planChecksum, // Store the planChecksum as ID
            originalFilename: currentProfile.sourcePath.split(/[/\\]/).pop() || "catalogue.xlsx",
            sha256: shaRegex.test(currentProfile.fileSha256)
              ? currentProfile.fileSha256.toLowerCase()
              : createHash("sha256").update(currentProfile.fileSha256).digest("hex"),
            status: ImportBatchStatus.committing,
            totalRows: currentProfile.totalSourceRows,
            validRows: currentProfile.validRows,
            warningRows: currentProfile.warningRows,
            invalidRows: currentProfile.invalidRows,
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
          let cat = await tx.category.findFirst({
            where: { name: { equals: catName, mode: "insensitive" } },
          });

          if (!cat) {
            const slug = generateSlug(catName);
            cat = await tx.category.create({
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
          let uom = await tx.unitOfMeasure.findUnique({
            where: { code: uomCode },
          });

          if (!uom) {
            uom = await tx.unitOfMeasure.create({
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
          if (forceFailureForTest && row.sourceRowNumber === 10) {
            throw new Error("FORCE_FAILURE_FOR_TEST");
          }

          const importRow = await tx.importRow.create({
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
            await tx.importIssue.create({
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

          const product = await tx.product.upsert({
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

          const packaging = await tx.productPackaging.upsert({
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

          const processPriceType = async (priceType: PriceType, amount: number) => {
            const activePrice = await tx.productPrice.findFirst({
              where: {
                productPackagingId: packaging.id,
                priceType: priceType,
                effectiveTo: null,
              },
              orderBy: { effectiveFrom: "desc" },
            });

            const newAmountDecimal = new Prisma.Decimal(amount);

            if (activePrice) {
              if (activePrice.amount.equals(newAmountDecimal)) {
                return false;
              } else {
                await tx.productPrice.update({
                  where: { id: activePrice.id },
                  data: { effectiveTo: now },
                });
                await tx.productPrice.create({
                  data: {
                    productPackagingId: packaging.id,
                    priceType: priceType,
                    amount: newAmountDecimal,
                    currency: CurrencyCode.PKR,
                    effectiveFrom: now,
                    effectiveTo: null,
                    createdById: uploaderId,
                  },
                });
                return true;
              }
            } else {
              await tx.productPrice.create({
                data: {
                  productPackagingId: packaging.id,
                  priceType: priceType,
                  amount: newAmountDecimal,
                  currency: CurrencyCode.PKR,
                  effectiveFrom: now,
                  effectiveTo: null,
                  createdById: uploaderId,
                },
              });
              return true;
            }
          };

          let pricesCreated = 0;
          if (row.wholesalePrice !== null && row.wholesalePrice > 0) {
            const wholesaleCreated = await processPriceType(PriceType.wholesale, row.wholesalePrice);
            if (wholesaleCreated) pricesCreated = 1;
          }
          if (row.buyingPrice !== null && row.buyingPrice > 0) {
            const buyingCreated = await processPriceType(PriceType.buying, row.buyingPrice);
            if (buyingCreated) pricesCreated++;
          }

          await tx.sourceRecordMapping.upsert({
            where: { sourceSystem_sourceKey: { sourceSystem: "Excel", sourceKey: row.sourceKey } },
            update: {
              // importRowId intentionally omitted: DB trigger forbids moving a mapping between rows
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
        await tx.importBatch.update({
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
      }, {
        maxWait: 60000,
        timeout: 300000
      });

      return commitResult;
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  }

  public static async commitWorkbook(
    sourcePath: string,
    uploaderId: string,
    planChecksum: string,
    chunkSize = 25,
    forceFailureForTest = false
  ): Promise<ImportExecutionResult> {
    if (!sourcePath) {
      throw new Error("Source path must be specified for catalogue commit");
    }
    const fileBytes = await fs.readFile(sourcePath);
    const fileSha256 = createHash("sha256").update(fileBytes).digest("hex");

    const { headerChecksum, rows: rawRows } = await parseCatalogueXlsx(sourcePath);
    const { parsedRows, profile } = validateCatalogueRows(rawRows, sourcePath, fileSha256);

    return this.commit(parsedRows, profile, uploaderId, planChecksum, chunkSize, forceFailureForTest);
  }
}
