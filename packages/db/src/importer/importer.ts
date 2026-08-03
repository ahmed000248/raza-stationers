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
import { getPostgresConnection } from "../postgres.js";

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
    const rawUrl = process.env.DATABASE_URL?.trim();
    if (!rawUrl) throw new Error("DATABASE_URL is required for catalogue importer runtime access.");
    const { connectionString, ssl } = getPostgresConnection(rawUrl, "DATABASE_URL");

    const pool = new pg.Pool({
      connectionString,
      ssl,
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

        // --- Bulk-insert phase: collapse ~N*9 WAN round-trips into ~12 SQL statements ---
        // forceFailureForTest is honoured by injecting a bad row before any writes
        if (forceFailureForTest) {
          const triggerRow = parsedRows.find((r) => r.sourceRowNumber === 10);
          if (triggerRow) throw new Error("FORCE_FAILURE_FOR_TEST");
        }

        // 1. Categories (small set, individual upserts are fine)
        let createdCategoriesCount = 0;
        const categoryMap = new Map<string, string>();
        const uniqueCategoryNames = new Set(parsedRows.map((r) => r.originalCategory));
        for (const catName of uniqueCategoryNames) {
          const norm = catName.normalize("NFKC").trim().toLowerCase();
          let cat = await tx.category.findFirst({ where: { name: { equals: catName, mode: "insensitive" } } });
          if (!cat) {
            cat = await tx.category.create({ data: { name: catName, slug: generateSlug(catName), isActive: true } });
            createdCategoriesCount++;
          }
          categoryMap.set(norm, cat.id);
        }

        // 2. Units of measure (small set, individual upserts are fine)
        const uomMap = new Map<string, string>();
        const allUomCodes = new Set<string>(["piece"]);
        for (const row of parsedRows) { if (row.unitOfMeasure) allUomCodes.add(row.unitOfMeasure); }
        for (const uomCode of allUomCodes) {
          let uom = await tx.unitOfMeasure.findUnique({ where: { code: uomCode } });
          if (!uom) {
            uom = await tx.unitOfMeasure.create({ data: { code: uomCode, name: uomCode.charAt(0).toUpperCase() + uomCode.slice(1), isActive: true } });
          }
          uomMap.set(uomCode, uom.id);
        }

        const validRows = parsedRows.filter((r) => r.validationStatus !== "invalid");

        // 3. Bulk upsert products (one statement)
        if (validRows.length > 0) {
          // Build values list for raw SQL
          const productValues = validRows.map((row) => {
            const skuNum = parseInt(row.sku.replace(/\D/g, ""), 10);
            if (isNaN(skuNum)) throw new Error(`Failed to extract numeric SKU from ${row.sku}`);
            const catId = categoryMap.get(row.normalizedCategory);
            if (!catId) throw new Error(`Category not resolved for: ${row.originalCategory}`);
            return { skuNum: BigInt(skuNum), sku: row.sku, name: row.originalName, purchaseType: row.purchaseType, catId };
          });

          // Single bulk INSERT ... ON CONFLICT DO UPDATE — one round-trip for all 2167+ rows
          await tx.product.createMany({
            data: productValues.map((v) => ({
              skuNumber: v.skuNum,
              sku: v.sku,
              name: v.name,
              status: ProductStatus.pending_review,
              purchaseType: v.purchaseType as any,
              categoryId: v.catId,
            })),
            skipDuplicates: true,
          });
          // Bulk UPDATE for existing rows: single SQL UPDATE ... FROM (VALUES ...) statement
          if (productValues.length > 0) {
            const vals = productValues.map((v) =>
              `(${v.skuNum}::bigint, '${v.sku.replace(/'/g, "''")}', '${v.name.replace(/'/g, "''")}', '${v.purchaseType}'::"product_purchase_type", '${v.catId}', '${now.toISOString()}'::timestamptz)`
            ).join(",");
            await tx.$executeRawUnsafe(`
              UPDATE products p
              SET sku = v.sku, name = v.name, status = 'pending_review', purchase_type = v.pt, category_id = v.cat_id, updated_at = v.updated_at
              FROM (VALUES ${vals}) AS v(sku_number, sku, name, pt, cat_id, updated_at)
              WHERE p.sku_number = v.sku_number
            `);
          }
        }

        // 4. Fetch all products by SKU number to get IDs
        const skuNumbers = validRows.map((r) => BigInt(parseInt(r.sku.replace(/\D/g, ""), 10)));
        const allProducts = await tx.product.findMany({ where: { skuNumber: { in: skuNumbers } } });
        const productBySkuNum = new Map(allProducts.map((p) => [p.skuNumber.toString(), p]));
        const createdProductsCount = validRows.length;

        // 5. Bulk upsert packaging (createMany skipDuplicates + updateMany)
        const packagingInputs = validRows.map((row) => {
          const skuNum = BigInt(parseInt(row.sku.replace(/\D/g, ""), 10));
          const product = productBySkuNum.get(skuNum.toString())!;
          const uomId = uomMap.get(row.unitOfMeasure || "piece")!;
          return { product, uomId, row, code: `${product.sku}-BASE` };
        });

        await tx.productPackaging.createMany({
          data: packagingInputs.map(({ product, uomId, row, code }) => ({
            productId: product.id,
            unitOfMeasureId: uomId,
            code,
            label: `Standard ${row.unitOfMeasure || "Piece"}`,
            conversionToBase: 1.0,
            packQuantity: row.packQuantity,
            isBase: true,
            confirmationStatus: ConfirmationStatus.unconfirmed,
            isActive: row.isActive,
          })),
          skipDuplicates: true,
        });
        // Bulk UPDATE packaging — single SQL statement
        if (packagingInputs.length > 0) {
          const pkgVals = packagingInputs.map(({ product, row, code }) =>
            `('${product.id}', '${code.replace(/'/g, "''")}', '${(`Standard ${row.unitOfMeasure || "Piece"}`).replace(/'/g, "''")}', ${row.packQuantity ?? 1}, ${row.isActive}, '${now.toISOString()}'::timestamptz)`
          ).join(",");
          await tx.$executeRawUnsafe(`
            UPDATE product_packaging pp
            SET label = v.label, pack_quantity = v.pack_quantity, is_active = v.is_active, updated_at = v.updated_at
            FROM (VALUES ${pkgVals}) AS v(product_id, code, label, pack_quantity, is_active, updated_at)
            WHERE pp.product_id = v.product_id AND pp.code = v.code
          `);
        }
        const createdPackagingCount = validRows.length;

        // 6. Fetch all packaging IDs
        const allPackaging = await tx.productPackaging.findMany({
          where: { productId: { in: allProducts.map((p) => p.id) }, isBase: true },
        });
        const packagingByProductId = new Map(allPackaging.map((pkg) => [pkg.productId, pkg]));

        // 7. Bulk insert prices: collect new prices needed, skip if unchanged
        const existingPrices = await tx.productPrice.findMany({
          where: { productPackagingId: { in: allPackaging.map((pkg) => pkg.id) }, effectiveTo: null },
        });
        const existingPriceMap = new Map<string, typeof existingPrices[0]>();
        for (const ep of existingPrices) {
          existingPriceMap.set(`${ep.productPackagingId}:${ep.priceType}`, ep);
        }

        const pricesToExpire: string[] = [];
        const pricesToCreate: Array<{
          productPackagingId: string; priceType: PriceType; amount: Prisma.Decimal;
          currency: CurrencyCode; effectiveFrom: Date; createdById: string;
        }> = [];

        for (const row of validRows) {
          const skuNum = BigInt(parseInt(row.sku.replace(/\D/g, ""), 10));
          const product = productBySkuNum.get(skuNum.toString())!;
          const pkg = packagingByProductId.get(product.id)!;
          if (!pkg) continue;

          for (const [priceType, amount] of [[PriceType.wholesale, row.wholesalePrice], [PriceType.buying, row.buyingPrice]] as [PriceType, number | null][]) {
            if (amount === null || amount <= 0) continue;
            const key = `${pkg.id}:${priceType}`;
            const existing = existingPriceMap.get(key);
            const newAmt = new Prisma.Decimal(amount);
            if (existing) {
              if (!existing.amount.equals(newAmt)) {
                pricesToExpire.push(existing.id);
                pricesToCreate.push({ productPackagingId: pkg.id, priceType, amount: newAmt, currency: CurrencyCode.PKR, effectiveFrom: now, createdById: uploaderId });
              }
            } else {
              pricesToCreate.push({ productPackagingId: pkg.id, priceType, amount: newAmt, currency: CurrencyCode.PKR, effectiveFrom: now, createdById: uploaderId });
            }
          }
        }

        // Expire changed prices (bulk updateMany per ID batch)
        if (pricesToExpire.length > 0) {
          await tx.productPrice.updateMany({ where: { id: { in: pricesToExpire } }, data: { effectiveTo: now } });
        }
        // Bulk-create new prices
        if (pricesToCreate.length > 0) {
          await tx.productPrice.createMany({ data: pricesToCreate });
        }
        const createdPricesCount = pricesToCreate.length;

        // 8. Bulk upsert import_rows (createMany skipDuplicates)
        const importRowData = parsedRows.map((row) => ({
          importBatchId: importBatch.id,
          sourceSheet: row.sourceSheet,
          sourceRowNumber: row.sourceRowNumber,
          rawData: {
            sku: row.sku, name: row.originalName, category: row.originalCategory,
            salesType: row.salesType, wholesalePrice: row.wholesalePrice,
            buyingPrice: row.buyingPrice, sourceKey: row.sourceKey,
          },
          normalizedData: {
            sku: row.sku, name: row.normalizedName, category: row.normalizedCategory,
            purchaseType: row.purchaseType, wholesalePrice: row.wholesalePrice,
            buyingPrice: row.buyingPrice, sourceKey: row.sourceKey,
          },
          validationStatus: row.validationStatus,
          commitStatus: row.validationStatus === "invalid" ? ImportCommitStatus.failed : ImportCommitStatus.imported,
        }));
        await tx.importRow.createMany({ data: importRowData });
        const createdRowsCount = parsedRows.length;

        // 9. Fetch created import_rows for issue linking and source mappings
        const createdImportRows = await tx.importRow.findMany({
          where: { importBatchId: importBatch.id },
          select: { id: true, sourceRowNumber: true },
        });
        const importRowBySourceRow = new Map(createdImportRows.map((r) => [r.sourceRowNumber, r.id]));

        // 10. Bulk-create import issues
        const issueData: Array<{ importRowId: string; severity: string; code: string; fieldName: string | null; message: string }> = [];
        for (const row of parsedRows) {
          const importRowId = importRowBySourceRow.get(row.sourceRowNumber);
          if (!importRowId) continue;
          for (const issue of row.issues) {
            issueData.push({ importRowId, severity: issue.severity, code: issue.code, fieldName: issue.fieldName, message: issue.message });
          }
        }
        if (issueData.length > 0) {
          await tx.importIssue.createMany({ data: issueData as any });
        }
        const createdIssuesCount = issueData.length;

        // 11. Bulk upsert source_record_mappings
        const mappingData = validRows.map((row) => {
          const skuNum = BigInt(parseInt(row.sku.replace(/\D/g, ""), 10));
          const product = productBySkuNum.get(skuNum.toString())!;
          const importRowId = importRowBySourceRow.get(row.sourceRowNumber)!;
          return { importRowId, sourceSystem: "Excel", sourceKey: row.sourceKey, productId: product.id };
        });
        await tx.sourceRecordMapping.createMany({ data: mappingData, skipDuplicates: true });
        // Bulk UPDATE product_id on existing mappings — single SQL statement
        // importRowId intentionally omitted: DB trigger forbids moving a mapping between rows
        if (mappingData.length > 0) {
          const mapVals = mappingData.map((m) =>
            `('${m.sourceKey.replace(/'/g, "''")}', '${m.productId}')`
          ).join(",");
          await tx.$executeRawUnsafe(`
            UPDATE source_record_mappings srm
            SET product_id = v.product_id
            FROM (VALUES ${mapVals}) AS v(source_key, product_id)
            WHERE srm.source_system = 'Excel' AND srm.source_key = v.source_key
          `);
        }
        const createdMappingsCount = validRows.length;

        const commitTime = new Date();
        await tx.importBatch.update({
          where: { id: importBatch.id },
          data: {
            status: ImportBatchStatus.committed,
            committedById: uploaderId,
            committedAt: commitTime,
          },
        });

        // 12. Synchronize product SKU sequence after bulk inserts
        await tx.$executeRawUnsafe(`
          SELECT setval('public.product_sku_seq', COALESCE((SELECT MAX(sku_number) FROM products), 1))
        `);

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
        timeout: 900000
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
