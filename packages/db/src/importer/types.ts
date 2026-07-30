import { ImportBatchStatus, ImportValidationStatus, ImportIssueSeverity, ProductPurchaseType } from "@prisma/client";

export interface RawCatalogueRow {
  sourceRowNumber: number;
  sourceSheet: string;
  sku: string;
  name: string;
  category: string;
  salesType: string;
  unitOfMeasure: string;
  packQuantityRaw: unknown;
  currency: string;
  wholesalePriceRaw: unknown;
  buyingPriceRaw: unknown;
  profitRaw: unknown;
  profitMarginRaw: unknown;
  markupRaw: unknown;
  activeRaw: unknown;
  sourceKey: string;
}

export interface ParsedCatalogueRow {
  sourceRowNumber: number;
  sourceSheet: string;
  sku: string;
  originalName: string;
  normalizedName: string;
  originalCategory: string;
  normalizedCategory: string;
  salesType: string;
  purchaseType: ProductPurchaseType;
  unitOfMeasure: string;
  packQuantity: number | null;
  currency: string;
  wholesalePrice: number | null;
  buyingPrice: number | null;
  isActive: boolean;
  sourceKey: string;
  hasPrice: boolean;
  isValidPrice: boolean;
  isZeroPrice: boolean;
  isNegativePrice: boolean;
  validationStatus: ImportValidationStatus;
  issues: RowIssueData[];
}

export interface RowIssueData {
  severity: ImportIssueSeverity;
  code: string;
  fieldName: string | null;
  message: string;
}

export interface ImportProfile {
  sourcePath: string;
  fileSha256: string;
  totalSourceRows: number;
  nonEmptyRows: number;
  emptyRows: number;
  validRows: number;
  warningRows: number;
  invalidRows: number;
  exactDuplicateGroups: number;
  possibleDuplicateNameGroups: number;
  uniqueProductNames: number;
  uniqueCategories: number;
  validWholesalePrices: number;
  missingPrices: number;
  zeroPrices: number;
  negativePrices: number;
  ambiguousPackagingRows: number;
  possibleVariantRows: number;
  classifications: Record<string, number>;
  unparseableRows: number;
}

export interface ImportExecutionOptions {
  sourcePath: string;
  dryRun?: boolean;
  commit?: boolean;
  chunkSize?: number;
  uploadedById?: string;
}

export interface ImportExecutionResult {
  batchId?: string;
  sha256: string;
  dryRun: boolean;
  committed: boolean;
  alreadyCommitted?: boolean;
  profile: ImportProfile;
  createdCounts: {
    categories: number;
    products: number;
    packaging: number;
    prices: number;
    sourceMappings: number;
    rows: number;
    issues: number;
  };
}
