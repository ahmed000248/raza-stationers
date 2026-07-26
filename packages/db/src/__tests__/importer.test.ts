import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ImportValidationStatus, ImportIssueSeverity, ProductPurchaseType } from "@prisma/client";
import { validateCatalogueRows, parsePurchaseType, normalizeText } from "../importer/validator.js";
import { parseCsvText } from "../importer/parser.js";
import { CatalogueImporter } from "../importer/importer.js";

describe("Catalogue Import Pipeline — Unit & Validation Tests", () => {
  it("normalizes text deterministically", () => {
    assert.equal(normalizeText("  DAY  BOOK   NO 200 "), "day book no 200");
    assert.equal(normalizeText("GATTA KHATA COPY 68g"), "gatta khata copy 68g");
  });

  it("parses sales types accurately to ProductPurchaseType", () => {
    assert.equal(parsePurchaseType("Both"), ProductPurchaseType.both);
    assert.equal(parsePurchaseType("Wholesale/Bulk"), ProductPurchaseType.bulk);
    assert.equal(parsePurchaseType("Individual"), ProductPurchaseType.individual);
    assert.equal(parsePurchaseType("UnknownType"), ProductPurchaseType.unconfirmed);
  });

  it("parses RFC-4180 CSV strings cleanly", () => {
    const csv = `Name,Category,Sales Type,Price\n"Book, Special",Notebooks,Both,150\nSimple Item,Stationery,Wholesale,200`;
    const rows = parseCsvText(csv);
    assert.equal(rows.length, 3);
    assert.equal(rows[1][0], "Book, Special");
    assert.equal(rows[2][3], "200");
  });

  it("validates valid product rows without errors", () => {
    const rawRows = [
      {
        sourceRowNumber: 2,
        sourceSheet: "Products",
        name: "BOX PENCIL 12PCS",
        category: "Writing Instruments",
        salesType: "Both",
        priceRaw: 450,
      },
    ];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows.length, 1);
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.valid);
    assert.equal(parsedRows[0].hasPackagingKeyword, true);
    assert.equal(parsedRows[0].detectedPackagingUnit, "box");
    assert.equal(profile.validRows, 1);
    assert.equal(profile.invalidRows, 0);
  });

  it("flags missing product name as error", () => {
    const rawRows = [
      {
        sourceRowNumber: 2,
        sourceSheet: "Products",
        name: "",
        category: "Writing Instruments",
        salesType: "Both",
        priceRaw: 450,
      },
    ];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.invalid);
    assert.equal(profile.invalidRows, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "MISSING_PRODUCT_NAME" && i.severity === ImportIssueSeverity.error));
  });

  it("flags zero wholesale price as warning issue", () => {
    const rawRows = [
      {
        sourceRowNumber: 2,
        sourceSheet: "Products",
        name: "TEST ITEM BOX",
        category: "General",
        salesType: "Both",
        priceRaw: 0,
      },
    ];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.warning);
    assert.equal(profile.zeroPrices, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "ZERO_WHOLESALE_PRICE" && i.severity === ImportIssueSeverity.warning));
  });

  it("flags negative price as error issue", () => {
    const rawRows = [
      {
        sourceRowNumber: 2,
        sourceSheet: "Products",
        name: "NEGATIVE PRICE BOX",
        category: "General",
        salesType: "Both",
        priceRaw: -100,
      },
    ];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.invalid);
    assert.equal(profile.negativePrices, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "NEGATIVE_WHOLESALE_PRICE" && i.severity === ImportIssueSeverity.error));
  });

  it("flags ambiguous packaging when no packaging keyword exists", () => {
    const rawRows = [
      {
        sourceRowNumber: 2,
        sourceSheet: "Products",
        name: "ERASER SUPER CLEAR",
        category: "Erasers",
        salesType: "Both",
        priceRaw: 25,
      },
    ];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows[0].hasPackagingKeyword, false);
    assert.equal(profile.ambiguousPackagingRows, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "AMBIGUOUS_PACKAGING" && i.severity === ImportIssueSeverity.warning));
  });

  it("detects exact duplicate rows and duplicate normalized names", () => {
    const rawRows = [
      {
        sourceRowNumber: 2,
        sourceSheet: "Products",
        name: "BLUE PEN PACK",
        category: "Pens",
        salesType: "Both",
        priceRaw: 100,
      },
      {
        sourceRowNumber: 3,
        sourceSheet: "Products",
        name: "BLUE PEN PACK",
        category: "Pens",
        salesType: "Both",
        priceRaw: 100,
      },
    ];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(profile.exactDuplicateGroups, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "EXACT_DUPLICATE_ROW"));
  });
});

describe("Catalogue Importer — Integration & Dry Run Tests", () => {
  it("executes dry-run without writing to database", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "import-test-"));
    const tempCsvPath = path.join(tempDir, "synthetic-catalogue.csv");

    const syntheticCsv = `Item Name,Category,Sales Type,Wholesale Price
SYNTHETIC ITEM BOX 12PCS,Synthetic Category,Both,500
SYNTHETIC ITEM PACK 6PCS,Synthetic Category,Wholesale/Bulk,300
SYNTHETIC FREE ITEM BOX,Synthetic Category,Both,0`;

    await fs.writeFile(tempCsvPath, syntheticCsv, "utf8");

    const result = await CatalogueImporter.execute({
      sourcePath: tempCsvPath,
      dryRun: true,
      commit: false,
    });

    assert.equal(result.dryRun, true);
    assert.equal(result.committed, false);
    assert.equal(result.profile.totalSourceRows, 3);
    assert.equal(result.profile.nonEmptyRows, 3);
    assert.equal(result.profile.zeroPrices, 1);
    assert.equal(result.createdCounts.products, 3);
    assert.equal(result.createdCounts.categories, 1);

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
