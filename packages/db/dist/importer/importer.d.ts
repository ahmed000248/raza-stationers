import { ImportExecutionResult, ParsedCatalogueRow } from "./types.js";
export declare function generateSlug(name: string): string;
export declare class CatalogueImporter {
    private static createPrismaClient;
    static generatePlan(sourcePath: string): Promise<{
        parsedRows: ParsedCatalogueRow[];
        result: ImportExecutionResult;
    }>;
    private static calculateDatabaseStateChecksum;
    static commit(parsedRows: ParsedCatalogueRow[], profile: ImportExecutionResult["profile"], uploaderId: string, planChecksum: string, chunkSize?: number, forceFailureForTest?: boolean): Promise<ImportExecutionResult>;
}
