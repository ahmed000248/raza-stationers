"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeText = normalizeText;
exports.parsePurchaseType = parsePurchaseType;
exports.validateCatalogueRows = validateCatalogueRows;
const client_1 = require("@prisma/client");
const PACKAGING_PATTERN = /\b(single|jar|box|carton|pack(?:et)?|bundle|dozen|pcs?|pieces?|set|display|tin|bottle|roll)\b/i;
const VARIANT_PATTERN = /\b(?:black|blue|red|green|yellow|white|pink|orange|purple|brown|assorted|\d+(?:\.\d+)?\s*(?:mm|cm|inch|inches|pages?|pgs?|pcs?|pieces?))\b/i;
function normalizeText(text) {
    return text
        .normalize("NFKC")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}
function parsePurchaseType(salesType) {
    const normalized = normalizeText(salesType);
    if (normalized === "both")
        return client_1.ProductPurchaseType.both;
    if (normalized.includes("wholesale") || normalized.includes("bulk"))
        return client_1.ProductPurchaseType.bulk;
    if (normalized.includes("individual") || normalized.includes("retail"))
        return client_1.ProductPurchaseType.individual;
    return client_1.ProductPurchaseType.unconfirmed;
}
function validateCatalogueRows(rawRows, sourcePath, fileSha256) {
    const parsedRows = [];
    const exactCounts = new Map();
    const nameCounts = new Map();
    const categorySet = new Set();
    const classifications = {};
    let nonEmptyCount = 0;
    let emptyCount = 0;
    let validPriceCount = 0;
    let missingPriceCount = 0;
    let zeroPriceCount = 0;
    let negativePriceCount = 0;
    let ambiguousPackagingCount = 0;
    let possibleVariantCount = 0;
    let unparseableCount = 0;
    // First pass: count exact duplicates and name frequencies
    for (const row of rawRows) {
        const isRowEmpty = !row.sku && !row.name && !row.category && !row.salesType && (row.wholesalePriceRaw == null || String(row.wholesalePriceRaw).trim() === "");
        if (isRowEmpty) {
            emptyCount++;
            continue;
        }
        nonEmptyCount++;
        const normName = normalizeText(row.name);
        const normCategory = normalizeText(row.category);
        const exactKey = JSON.stringify([row.sku.trim(), normName, normCategory, row.salesType.trim()]);
        exactCounts.set(exactKey, (exactCounts.get(exactKey) ?? 0) + 1);
        if (normName) {
            nameCounts.set(normName, (nameCounts.get(normName) ?? 0) + 1);
        }
    }
    // Second pass: validate each row
    for (const row of rawRows) {
        const isRowEmpty = !row.sku && !row.name && !row.category && !row.salesType && (row.wholesalePriceRaw == null || String(row.wholesalePriceRaw).trim() === "");
        if (isRowEmpty)
            continue;
        const issues = [];
        const origName = row.name.trim();
        const normName = normalizeText(origName);
        const origCategory = row.category.trim() || "Uncategorized";
        const normCategory = normalizeText(origCategory);
        categorySet.add(normCategory);
        // Sales Type & Classification
        const salesTypeTrimmed = row.salesType.trim() || "Unconfirmed";
        const purchaseType = parsePurchaseType(salesTypeTrimmed);
        classifications[salesTypeTrimmed] = (classifications[salesTypeTrimmed] ?? 0) + 1;
        // Check name
        if (!origName) {
            unparseableCount++;
            issues.push({
                severity: client_1.ImportIssueSeverity.error,
                code: "MISSING_PRODUCT_NAME",
                fieldName: "name",
                message: "Product name is missing or empty",
            });
        }
        // Check SKU
        if (!row.sku.trim()) {
            issues.push({
                severity: client_1.ImportIssueSeverity.error,
                code: "MISSING_SKU",
                fieldName: "sku",
                message: "Product SKU is missing",
            });
        }
        // Price parsing
        let wholesalePrice = null;
        let hasPrice = false;
        let isValidPrice = false;
        let isZeroPrice = false;
        let isNegativePrice = false;
        if (row.wholesalePriceRaw != null && String(row.wholesalePriceRaw).trim() !== "") {
            hasPrice = true;
            const parsedNum = typeof row.wholesalePriceRaw === "number" ? row.wholesalePriceRaw : Number(String(row.wholesalePriceRaw).replace(/,/g, "").trim());
            if (Number.isFinite(parsedNum)) {
                wholesalePrice = parsedNum;
                if (wholesalePrice > 0) {
                    isValidPrice = true;
                    validPriceCount++;
                }
                else if (wholesalePrice === 0) {
                    isZeroPrice = true;
                    zeroPriceCount++;
                    issues.push({
                        severity: client_1.ImportIssueSeverity.warning,
                        code: "ZERO_WHOLESALE_PRICE",
                        fieldName: "wholesalePrice",
                        message: "Wholesale price is 0 in source catalogue",
                    });
                }
                else {
                    isNegativePrice = true;
                    negativePriceCount++;
                    issues.push({
                        severity: client_1.ImportIssueSeverity.error,
                        code: "NEGATIVE_WHOLESALE_PRICE",
                        fieldName: "wholesalePrice",
                        message: "Wholesale price cannot be negative",
                    });
                }
            }
            else {
                issues.push({
                    severity: client_1.ImportIssueSeverity.error,
                    code: "MALFORMED_WHOLESALE_PRICE",
                    fieldName: "wholesalePrice",
                    message: `Unparseable price value: ${String(row.wholesalePriceRaw)}`,
                });
            }
        }
        else {
            missingPriceCount++;
            issues.push({
                severity: client_1.ImportIssueSeverity.warning,
                code: "MISSING_WHOLESALE_PRICE",
                fieldName: "wholesalePrice",
                message: "Wholesale price is missing in source row",
            });
        }
        let buyingPrice = null;
        if (row.buyingPriceRaw != null && String(row.buyingPriceRaw).trim() !== "") {
            const parsedBuying = typeof row.buyingPriceRaw === "number" ? row.buyingPriceRaw : Number(String(row.buyingPriceRaw).replace(/,/g, "").trim());
            if (Number.isFinite(parsedBuying)) {
                buyingPrice = parsedBuying;
            }
        }
        let packQuantity = null;
        if (row.packQuantityRaw != null && String(row.packQuantityRaw).trim() !== "") {
            const parsedPackQty = typeof row.packQuantityRaw === "number" ? row.packQuantityRaw : parseInt(String(row.packQuantityRaw).replace(/,/g, "").trim(), 10);
            if (Number.isFinite(parsedPackQty) && parsedPackQty > 0) {
                packQuantity = parsedPackQty;
            }
        }
        if (VARIANT_PATTERN.test(origName)) {
            possibleVariantCount++;
        }
        // Duplicate checks
        const exactKey = JSON.stringify([row.sku.trim(), normName, normCategory, salesTypeTrimmed]);
        if ((exactCounts.get(exactKey) ?? 0) > 1) {
            issues.push({
                severity: client_1.ImportIssueSeverity.warning,
                code: "EXACT_DUPLICATE_ROW",
                fieldName: "name",
                message: "Exact duplicate row found in source catalogue",
            });
        }
        else if (normName && (nameCounts.get(normName) ?? 0) > 1) {
            issues.push({
                severity: client_1.ImportIssueSeverity.warning,
                code: "DUPLICATE_PRODUCT_NAME",
                fieldName: "name",
                message: "Product name matches another row after normalization",
            });
        }
        // Determine row status
        let validationStatus = client_1.ImportValidationStatus.valid;
        if (issues.some((i) => i.severity === client_1.ImportIssueSeverity.error)) {
            validationStatus = client_1.ImportValidationStatus.invalid;
        }
        else if (issues.length > 0) {
            validationStatus = client_1.ImportValidationStatus.warning;
        }
        parsedRows.push({
            sourceRowNumber: row.sourceRowNumber,
            sourceSheet: row.sourceSheet,
            sku: row.sku.trim(),
            originalName: origName,
            normalizedName: normName,
            originalCategory: origCategory,
            normalizedCategory: normCategory,
            salesType: salesTypeTrimmed,
            purchaseType,
            unitOfMeasure: row.unitOfMeasure.toLowerCase().trim() || "piece",
            packQuantity,
            currency: row.currency.trim() || "PKR",
            wholesalePrice,
            buyingPrice,
            isActive: String(row.activeRaw).trim().toLowerCase() === "true",
            sourceKey: row.sourceKey.trim(),
            hasPrice,
            isValidPrice,
            isZeroPrice,
            isNegativePrice,
            validationStatus,
            issues,
        });
    }
    const validRowCount = parsedRows.filter((r) => r.validationStatus === client_1.ImportValidationStatus.valid).length;
    const warningRowCount = parsedRows.filter((r) => r.validationStatus === client_1.ImportValidationStatus.warning).length;
    const invalidRowCount = parsedRows.filter((r) => r.validationStatus === client_1.ImportValidationStatus.invalid).length;
    const duplicateExactGroups = [...exactCounts.values()].filter((c) => c > 1).length;
    const possibleDuplicateNameGroups = [...nameCounts.values()].filter((c) => c > 1).length;
    const profile = {
        sourcePath,
        fileSha256,
        totalSourceRows: rawRows.length,
        nonEmptyRows: nonEmptyCount,
        emptyRows: emptyCount,
        validRows: validRowCount,
        warningRows: warningRowCount,
        invalidRows: invalidRowCount,
        exactDuplicateGroups: duplicateExactGroups,
        possibleDuplicateNameGroups,
        uniqueProductNames: nameCounts.size,
        uniqueCategories: categorySet.size,
        validWholesalePrices: validPriceCount,
        missingPrices: missingPriceCount,
        zeroPrices: zeroPriceCount,
        negativePrices: negativePriceCount,
        ambiguousPackagingRows: ambiguousPackagingCount,
        possibleVariantRows: possibleVariantCount,
        classifications,
        unparseableRows: unparseableCount,
    };
    return { parsedRows, profile };
}
