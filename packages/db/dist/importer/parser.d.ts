import { RawCatalogueRow } from "./types.js";
/**
 * Robust RFC-4180 compliant CSV line parser.
 */
export declare function parseCsvText(csvContent: string): string[][];
export declare function parseCatalogueCsv(filePath: string): Promise<RawCatalogueRow[]>;
