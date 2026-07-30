"use strict";
/**
 * Shared Database Service Layer — Raza Stationers
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDbClient = exports.DBClient = void 0;
__exportStar(require("./importer/types.js"), exports);
__exportStar(require("./importer/parser.js"), exports);
__exportStar(require("./importer/validator.js"), exports);
__exportStar(require("./importer/importer.js"), exports);
class DBClient {
    config;
    constructor(config) {
        this.config = config;
    }
    async connect() {
        console.log(`[DB] Connecting to database at ${this.config.connectionString}...`);
        return true;
    }
    // Placeholder query methods to be backed by Supabase / PostgreSQL / Prisma / Drizzle.
    // Signatures below follow TRD §6's entity model — ClientBusiness is the
    // wholesale customer record (BRD CB-07), not an individual CustomerProfile.
    async getProducts() {
        return [];
    }
    async getClientBusiness(id) {
        return null;
    }
    /** TRD §11: available credit = credit_limit − outstanding_balance. */
    async getCreditSummary(clientBusinessId) {
        return null;
    }
    async createOrder(order) {
        throw new Error('Database method createOrder not implemented yet');
    }
    /** FR-ACC-02 — Owner-only; enforced at the API guard layer, not here. */
    async logExpense(entry) {
        throw new Error('Database method logExpense not implemented yet');
    }
}
exports.DBClient = DBClient;
const createDbClient = (config) => new DBClient(config);
exports.createDbClient = createDbClient;
