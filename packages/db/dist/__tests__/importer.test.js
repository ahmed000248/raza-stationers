"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const client_1 = require("@prisma/client");
const validator_js_1 = require("../importer/validator.js");
const parser_js_1 = require("../importer/parser.js");
const importer_js_1 = require("../importer/importer.js");
const mockRow = (overrides) => ({
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
(0, node_test_1.describe)("Catalogue Import Pipeline — Unit & Validation Tests", () => {
    (0, node_test_1.it)("normalizes text deterministically", () => {
        strict_1.default.equal((0, validator_js_1.normalizeText)("  DAY  BOOK   NO 200 "), "day book no 200");
        strict_1.default.equal((0, validator_js_1.normalizeText)("GATTA KHATA COPY 68g"), "gatta khata copy 68g");
    });
    (0, node_test_1.it)("parses sales types accurately to ProductPurchaseType", () => {
        strict_1.default.equal((0, validator_js_1.parsePurchaseType)("Both"), client_1.ProductPurchaseType.both);
        strict_1.default.equal((0, validator_js_1.parsePurchaseType)("Wholesale"), client_1.ProductPurchaseType.bulk);
        strict_1.default.equal((0, validator_js_1.parsePurchaseType)("Individual"), client_1.ProductPurchaseType.individual);
        strict_1.default.equal((0, validator_js_1.parsePurchaseType)("UnknownType"), client_1.ProductPurchaseType.unconfirmed);
    });
    (0, node_test_1.it)("parses RFC-4180 CSV strings cleanly", () => {
        const csv = `SKU,Item Name,Category,Sales Type,UOM,Pack,Currency,Wholesale Price,Buying Price,Profit,Margin,Markup,Active,SourceKey\n"RS-01","Book, Special",Notebooks,Both,Piece,1,PKR,150,100,50,33%,50%,TRUE,KEY1\nRS-02,Simple Item,Stationery,Wholesale,Piece,1,PKR,200,100,100,50%,100%,TRUE,KEY2`;
        const rows = (0, parser_js_1.parseCsvText)(csv);
        strict_1.default.equal(rows.length, 3);
        strict_1.default.equal(rows[1][1], "Book, Special");
        strict_1.default.equal(rows[2][7], "200");
    });
    (0, node_test_1.it)("validates valid product rows without errors", () => {
        const rawRows = [mockRow({ name: "BOX PENCIL 12PCS", wholesalePriceRaw: 450 })];
        const { parsedRows, profile } = (0, validator_js_1.validateCatalogueRows)(rawRows, "test.csv", "hash123");
        strict_1.default.equal(parsedRows.length, 1);
        strict_1.default.equal(parsedRows[0].validationStatus, client_1.ImportValidationStatus.valid);
        strict_1.default.equal(profile.validRows, 1);
        strict_1.default.equal(profile.invalidRows, 0);
    });
    (0, node_test_1.it)("flags missing product name as error", () => {
        const rawRows = [mockRow({ name: "" })];
        const { parsedRows, profile } = (0, validator_js_1.validateCatalogueRows)(rawRows, "test.csv", "hash123");
        strict_1.default.equal(parsedRows[0].validationStatus, client_1.ImportValidationStatus.invalid);
        strict_1.default.equal(profile.invalidRows, 1);
        strict_1.default.ok(parsedRows[0].issues.some((i) => i.code === "MISSING_PRODUCT_NAME" && i.severity === client_1.ImportIssueSeverity.error));
    });
    (0, node_test_1.it)("flags zero wholesale price as warning issue", () => {
        const rawRows = [mockRow({ wholesalePriceRaw: 0 })];
        const { parsedRows, profile } = (0, validator_js_1.validateCatalogueRows)(rawRows, "test.csv", "hash123");
        strict_1.default.equal(parsedRows[0].validationStatus, client_1.ImportValidationStatus.warning);
        strict_1.default.equal(profile.zeroPrices, 1);
        strict_1.default.ok(parsedRows[0].issues.some((i) => i.code === "ZERO_WHOLESALE_PRICE" && i.severity === client_1.ImportIssueSeverity.warning));
    });
    (0, node_test_1.it)("flags negative price as error issue", () => {
        const rawRows = [mockRow({ wholesalePriceRaw: -100 })];
        const { parsedRows, profile } = (0, validator_js_1.validateCatalogueRows)(rawRows, "test.csv", "hash123");
        strict_1.default.equal(parsedRows[0].validationStatus, client_1.ImportValidationStatus.invalid);
        strict_1.default.equal(profile.negativePrices, 1);
        strict_1.default.ok(parsedRows[0].issues.some((i) => i.code === "NEGATIVE_WHOLESALE_PRICE" && i.severity === client_1.ImportIssueSeverity.error));
    });
    (0, node_test_1.it)("detects exact duplicate rows and duplicate normalized names", () => {
        const rawRows = [
            mockRow({ name: "BLUE PEN PACK", sku: "RS-001" }),
            mockRow({ name: "BLUE PEN PACK", sku: "RS-001" }),
        ];
        const { parsedRows, profile } = (0, validator_js_1.validateCatalogueRows)(rawRows, "test.csv", "hash123");
        strict_1.default.equal(profile.exactDuplicateGroups, 1);
        strict_1.default.ok(parsedRows[0].issues.some((i) => i.code === "EXACT_DUPLICATE_ROW"));
    });
});
(0, node_test_1.describe)("Catalogue Importer — Integration & Dry Run Tests", () => {
    (0, node_test_1.it)("executes dry-run without writing to database", async () => {
        const originalPath = node_path_1.default.resolve(__dirname, "../../../../data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx");
        const tempPath = node_path_1.default.resolve(__dirname, `../../../../data/final/temp-unit-test-${Date.now()}.xlsx`);
        // Copy and append a unique byte to make the SHA-256 unique and bypass the committed batch check
        const orgBytes = await promises_1.default.readFile(originalPath);
        const modBytes = Buffer.concat([orgBytes, Buffer.from(`unit-test-token-${Date.now()}`)]);
        await promises_1.default.writeFile(tempPath, modBytes);
        try {
            const { result } = await importer_js_1.CatalogueImporter.generatePlan(tempPath);
            strict_1.default.equal(result.dryRun, true);
            strict_1.default.equal(result.committed, false);
            strict_1.default.equal(result.profile.totalSourceRows, 2167);
            strict_1.default.equal(result.profile.nonEmptyRows, 2167);
            strict_1.default.equal(result.createdCounts.products, 2167);
            strict_1.default.equal(result.createdCounts.categories, 103);
        }
        finally {
            await promises_1.default.unlink(tempPath).catch(() => { });
        }
    });
});
