/**
 * Shared Database Service Layer — Raza Stationers
 */
import { ProductCatalogueView, Order, ClientBusiness, PayLaterSummary, ExpenseEntry } from '@raza-stationers/types';
export * from "./importer/types.js";
export * from "./importer/parser.js";
export * from "./importer/validator.js";
export * from "./importer/importer.js";
export interface DatabaseConfig {
    connectionString: string;
    maxConnections?: number;
}
export declare class DBClient {
    private config;
    constructor(config: DatabaseConfig);
    connect(): Promise<boolean>;
    getProducts(): Promise<ProductCatalogueView[]>;
    getClientBusiness(id: string): Promise<ClientBusiness | null>;
    /** TRD §11: available credit = credit_limit − outstanding_balance. */
    getCreditSummary(clientBusinessId: string): Promise<PayLaterSummary | null>;
    createOrder(order: Partial<Order>): Promise<Order>;
    /** FR-ACC-02 — Owner-only; enforced at the API guard layer, not here. */
    logExpense(entry: Partial<ExpenseEntry>): Promise<ExpenseEntry>;
}
export declare const createDbClient: (config: DatabaseConfig) => DBClient;
