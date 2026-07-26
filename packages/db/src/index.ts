/**
 * Shared Database Service Layer — Raza Stationers
 */

import {
  ProductCatalogueView,
  Order,
  ClientBusiness,
  PayLaterSummary,
  ExpenseEntry,
} from '@raza-stationers/types';

export * from "./importer/types.js";
export * from "./importer/parser.js";
export * from "./importer/validator.js";
export * from "./importer/importer.js";

export interface DatabaseConfig {
  connectionString: string;
  maxConnections?: number;
}

export class DBClient {
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  public async connect(): Promise<boolean> {
    console.log(`[DB] Connecting to database at ${this.config.connectionString}...`);
    return true;
  }

  // Placeholder query methods to be backed by Supabase / PostgreSQL / Prisma / Drizzle.
  // Signatures below follow TRD §6's entity model — ClientBusiness is the
  // wholesale customer record (BRD CB-07), not an individual CustomerProfile.

  public async getProducts(): Promise<ProductCatalogueView[]> {
    return [];
  }

  public async getClientBusiness(id: string): Promise<ClientBusiness | null> {
    return null;
  }

  /** TRD §11: available credit = credit_limit − outstanding_balance. */
  public async getCreditSummary(clientBusinessId: string): Promise<PayLaterSummary | null> {
    return null;
  }

  public async createOrder(order: Partial<Order>): Promise<Order> {
    throw new Error('Database method createOrder not implemented yet');
  }

  /** FR-ACC-02 — Owner-only; enforced at the API guard layer, not here. */
  public async logExpense(entry: Partial<ExpenseEntry>): Promise<ExpenseEntry> {
    throw new Error('Database method logExpense not implemented yet');
  }
}

export const createDbClient = (config: DatabaseConfig) => new DBClient(config);
