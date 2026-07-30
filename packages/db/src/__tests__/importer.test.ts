import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ImportValidationStatus, ImportIssueSeverity, ProductPurchaseType } from "@prisma/client";
import { validateCatalogueRows, parsePurchaseType, normalizeText } from "../importer/validator.js";
import { parseCsvText } from "../importer/parser.js";
import { CatalogueImporter } from "../importer/importer.js";
import { RawCatalogueRow } from "../importer/types.js";

const mockRow = (overrides: Partial<RawCatalogueRow>): RawCatalogueRow => ({
  sourceRowNumber: 1,
  sourceSheet: "WS-RATES",
  sku: "RS-000001",
  name: "TEST ITEM",
  category: "Test Category",
  salesType: "Wholesale",
  unitOfMeasure: "Piece",
  packQuantityRaw: 1,
  currency: "PKR",
  wholesalePriceRaw: 100,
  buyingPriceRaw: 80,
  profitRaw: 20,
  profitMarginRaw: "20%",
  markupRaw: "25%",
  activeRaw: "TRUE",
  sourceKey: "EXCEL_KEY",
  ...overrides,
});

describe("Catalogue Import Pipeline — Unit & Validation Tests", () => {
  it("normalizes text deterministically", () => {
    assert.equal(normalizeText("  DAY  BOOK   NO 200 "), "day book no 200");
    assert.equal(normalizeText("GATTA KHATA COPY 68g"), "gatta khata copy 68g");
  });

  it("parses sales types accurately to ProductPurchaseType", () => {
    assert.equal(parsePurchaseType("Both"), ProductPurchaseType.both);
    assert.equal(parsePurchaseType("Wholesale"), ProductPurchaseType.bulk);
    assert.equal(parsePurchaseType("Individual"), ProductPurchaseType.individual);
    assert.equal(parsePurchaseType("UnknownType"), ProductPurchaseType.unconfirmed);
  });

  it("parses RFC-4180 CSV strings cleanly", () => {
    const csv = `SKU,Item Name,Category,Sales Type,UOM,Pack,Currency,Wholesale Price,Buying Price,Profit,Margin,Markup,Active,SourceKey\n"RS-01","Book, Special",Notebooks,Both,Piece,1,PKR,150,100,50,33%,50%,TRUE,KEY1\nRS-02,Simple Item,Stationery,Wholesale,Piece,1,PKR,200,100,100,50%,100%,TRUE,KEY2`;
    const rows = parseCsvText(csv);
    assert.equal(rows.length, 3);
    assert.equal(rows[1][1], "Book, Special");
    assert.equal(rows[2][7], "200");
  });

  it("validates valid product rows without errors", () => {
    const rawRows = [mockRow({ name: "BOX PENCIL 12PCS", wholesalePriceRaw: 450 })];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows.length, 1);
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.valid);
    assert.equal(profile.validRows, 1);
    assert.equal(profile.invalidRows, 0);
  });

  it("flags missing product name as error", () => {
    const rawRows = [mockRow({ name: "" })];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.invalid);
    assert.equal(profile.invalidRows, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "MISSING_PRODUCT_NAME" && i.severity === ImportIssueSeverity.error));
  });

  it("flags zero wholesale price as warning issue", () => {
    const rawRows = [mockRow({ wholesalePriceRaw: 0 })];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.warning);
    assert.equal(profile.zeroPrices, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "ZERO_WHOLESALE_PRICE" && i.severity === ImportIssueSeverity.warning));
  });

  it("flags negative price as error issue", () => {
    const rawRows = [mockRow({ wholesalePriceRaw: -100 })];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(parsedRows[0].validationStatus, ImportValidationStatus.invalid);
    assert.equal(profile.negativePrices, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "NEGATIVE_WHOLESALE_PRICE" && i.severity === ImportIssueSeverity.error));
  });

  it("detects exact duplicate rows and duplicate normalized names", () => {
    const rawRows = [
      mockRow({ name: "BLUE PEN PACK", sku: "RS-001" }),
      mockRow({ name: "BLUE PEN PACK", sku: "RS-001" }),
    ];

    const { parsedRows, profile } = validateCatalogueRows(rawRows, "test.csv", "hash123");
    assert.equal(profile.exactDuplicateGroups, 1);
    assert.ok(parsedRows[0].issues.some((i) => i.code === "EXACT_DUPLICATE_ROW"));
  });
});

describe("Catalogue Importer — Integration & Dry Run Tests", () => {
  it("executes dry-run without writing to database", async () => {
    const filePath = path.resolve(__dirname, "../../../../data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx");

    const { result } = await CatalogueImporter.generatePlan(filePath);

    assert.equal(result.dryRun, true);
    assert.equal(result.committed, false);
    assert.equal(result.profile.totalSourceRows, 2167);
    assert.equal(result.profile.nonEmptyRows, 2167);
    assert.equal(result.createdCounts.products, 2167);
    assert.equal(result.createdCounts.categories, 103);
  });
});
