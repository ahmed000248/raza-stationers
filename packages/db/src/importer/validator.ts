import { ImportValidationStatus, ImportIssueSeverity, ProductPurchaseType } from "@prisma/client";
import { RawCatalogueRow, ParsedCatalogueRow, RowIssueData, ImportProfile } from "./types.js";

const PACKAGING_PATTERN = /\b(single|jar|box|carton|pack(?:et)?|bundle|dozen|pcs?|pieces?|set|display|tin|bottle|roll)\b/i;
const VARIANT_PATTERN = /\b(?:black|blue|red|green|yellow|white|pink|orange|purple|brown|assorted|\d+(?:\.\d+)?\s*(?:mm|cm|inch|inches|pages?|pgs?|pcs?|pieces?))\b/i;

export function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function parsePurchaseType(salesType: string): ProductPurchaseType {
  const normalized = normalizeText(salesType);
  if (normalized === "both") return ProductPurchaseType.both;
  if (normalized.includes("wholesale") || normalized.includes("bulk")) return ProductPurchaseType.bulk;
  if (normalized.includes("individual") || normalized.includes("retail")) return ProductPurchaseType.individual;
  return ProductPurchaseType.unconfirmed;
}

export function validateCatalogueRows(rawRows: RawCatalogueRow[], sourcePath: string, fileSha256: string): { parsedRows: ParsedCatalogueRow[]; profile: ImportProfile } {
  const parsedRows: ParsedCatalogueRow[] = [];
  const exactCounts = new Map<string, number>();
  const nameCounts = new Map<string, number>();
  const categorySet = new Set<string>();
  const classifications: Record<string, number> = {};

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
    const isRowEmpty = !row.name && !row.category && !row.salesType && (row.priceRaw == null || String(row.priceRaw).trim() === "");
    if (isRowEmpty) {
      emptyCount++;
      continue;
    }
    nonEmptyCount++;

    const normName = normalizeText(row.name);
    const normCategory = normalizeText(row.category);
    const exactKey = JSON.stringify([normName, normCategory, row.salesType.trim(), String(row.priceRaw).trim()]);

    exactCounts.set(exactKey, (exactCounts.get(exactKey) ?? 0) + 1);
    if (normName) {
      nameCounts.set(normName, (nameCounts.get(normName) ?? 0) + 1);
    }
  }

  // Second pass: validate each row
  for (const row of rawRows) {
    const isRowEmpty = !row.name && !row.category && !row.salesType && (row.priceRaw == null || String(row.priceRaw).trim() === "");
    if (isRowEmpty) continue;

    const issues: RowIssueData[] = [];
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
        severity: ImportIssueSeverity.error,
        code: "MISSING_PRODUCT_NAME",
        fieldName: "name",
        message: "Product name is missing or empty",
      });
    }

    // Price parsing
    let price: number | null = null;
    let hasPrice = false;
    let isValidPrice = false;
    let isZeroPrice = false;
    let isNegativePrice = false;

    if (row.priceRaw != null && String(row.priceRaw).trim() !== "") {
      hasPrice = true;
      const parsedNum = typeof row.priceRaw === "number" ? row.priceRaw : Number(String(row.priceRaw).replace(/,/g, "").trim());
      if (Number.isFinite(parsedNum)) {
        price = parsedNum;
        if (price > 0) {
          isValidPrice = true;
          validPriceCount++;
        } else if (price === 0) {
          isZeroPrice = true;
          zeroPriceCount++;
          issues.push({
            severity: ImportIssueSeverity.warning,
            code: "ZERO_WHOLESALE_PRICE",
            fieldName: "wholesalePrice",
            message: "Wholesale price is 0 in source catalogue",
          });
        } else {
          isNegativePrice = true;
          negativePriceCount++;
          issues.push({
            severity: ImportIssueSeverity.error,
            code: "NEGATIVE_WHOLESALE_PRICE",
            fieldName: "wholesalePrice",
            message: "Wholesale price cannot be negative",
          });
        }
      } else {
        issues.push({
          severity: ImportIssueSeverity.error,
          code: "MALFORMED_WHOLESALE_PRICE",
          fieldName: "wholesalePrice",
          message: `Unparseable price value: ${String(row.priceRaw)}`,
        });
      }
    } else {
      missingPriceCount++;
      issues.push({
        severity: ImportIssueSeverity.warning,
        code: "MISSING_WHOLESALE_PRICE",
        fieldName: "wholesalePrice",
        message: "Wholesale price is missing in source row",
      });
    }

    // Packaging check
    const packMatch = PACKAGING_PATTERN.exec(origName);
    const hasPackagingKeyword = packMatch !== null;
    const detectedPackagingUnit = packMatch ? packMatch[1].toLowerCase() : null;

    if (!hasPackagingKeyword) {
      ambiguousPackagingCount++;
      issues.push({
        severity: ImportIssueSeverity.warning,
        code: "AMBIGUOUS_PACKAGING",
        fieldName: "name",
        message: "Item name does not state packaging unit explicitly; defaulting to standard unit",
      });
    }

    if (VARIANT_PATTERN.test(origName)) {
      possibleVariantCount++;
    }

    // Duplicate checks
    const exactKey = JSON.stringify([normName, normCategory, salesTypeTrimmed, String(row.priceRaw).trim()]);
    if ((exactCounts.get(exactKey) ?? 0) > 1) {
      issues.push({
        severity: ImportIssueSeverity.warning,
        code: "EXACT_DUPLICATE_ROW",
        fieldName: "name",
        message: "Exact duplicate row found in source catalogue",
      });
    } else if (normName && (nameCounts.get(normName) ?? 0) > 1) {
      issues.push({
        severity: ImportIssueSeverity.warning,
        code: "DUPLICATE_PRODUCT_NAME",
        fieldName: "name",
        message: "Product name matches another row after normalization",
      });
    }

    // Determine row status
    let validationStatus: ImportValidationStatus = ImportValidationStatus.valid;
    if (issues.some((i) => i.severity === ImportIssueSeverity.error)) {
      validationStatus = ImportValidationStatus.invalid;
    } else if (issues.length > 0) {
      validationStatus = ImportValidationStatus.warning;
    }

    parsedRows.push({
      sourceRowNumber: row.sourceRowNumber,
      sourceSheet: row.sourceSheet,
      originalName: origName,
      normalizedName: normName,
      originalCategory: origCategory,
      normalizedCategory: normCategory,
      salesType: salesTypeTrimmed,
      purchaseType,
      price,
      hasPrice,
      isValidPrice,
      isZeroPrice,
      isNegativePrice,
      hasPackagingKeyword,
      detectedPackagingUnit,
      validationStatus,
      issues,
    });
  }

  const validRowCount = parsedRows.filter((r) => r.validationStatus === ImportValidationStatus.valid).length;
  const warningRowCount = parsedRows.filter((r) => r.validationStatus === ImportValidationStatus.warning).length;
  const invalidRowCount = parsedRows.filter((r) => r.validationStatus === ImportValidationStatus.invalid).length;

  const duplicateExactGroups = [...exactCounts.values()].filter((c) => c > 1).length;
  const possibleDuplicateNameGroups = [...nameCounts.values()].filter((c) => c > 1).length;

  const profile: ImportProfile = {
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
