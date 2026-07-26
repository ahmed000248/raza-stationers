import { ImportBatchStatus, ImportValidationStatus, ImportIssueSeverity, ProductPurchaseType } from "@prisma/client";

export interface RawCatalogueRow {
  sourceRowNumber: number;
  sourceSheet: string;
  name: string;
  category: string;
  salesType: string;
  priceRaw: unknown;
}

export interface ParsedCatalogueRow {
  sourceRowNumber: number;
  sourceSheet: string;
  originalName: string;
  normalizedName: string;
  originalCategory: string;
  normalizedCategory: string;
  salesType: string;
  purchaseType: ProductPurchaseType;
  price: number | null;
  hasPrice: boolean;
  isValidPrice: boolean;
  isZeroPrice: boolean;
  isNegativePrice: boolean;
  hasPackagingKeyword: boolean;
  detectedPackagingUnit: string | null;
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
