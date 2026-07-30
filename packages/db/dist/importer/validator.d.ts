import { ProductPurchaseType } from "@prisma/client";
import { RawCatalogueRow, ParsedCatalogueRow, ImportProfile } from "./types.js";
export declare function normalizeText(text: string): string;
export declare function parsePurchaseType(salesType: string): ProductPurchaseType;
export declare function validateCatalogueRows(rawRows: RawCatalogueRow[], sourcePath: string, fileSha256: string): {
    parsedRows: ParsedCatalogueRow[];
    profile: ImportProfile;
};
