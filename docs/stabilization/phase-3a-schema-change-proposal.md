# Phase 3A Schema Change Proposal — Raza Stationers (Revised)

**Date**: 2026-07-30  
**Status**: **APPROVED** (Schema changes required but not yet applied)  
**Branch**: `phase-3a-catalogue-schema-mapping`  
**Target File**: `packages/db/prisma/schema.prisma`  

---

## 1. Summary of Schema Evaluation

Following owner decisions, **SPECIFIC SCHEMA CHANGES ARE REQUIRED** for Phase 3B catalogue import (Design B Lineage and packQuantity).

The existing Prisma schema (`packages/db/prisma/schema.prisma`) ALREADY natively supports the certified business catalogue via existing models:
- **`Product.sku`** (`String @unique`): Handles stable product identity (`RS-000001` to `RS-002167`).
- **`Product.purchaseType`** (`ProductPurchaseType` enum): Handles sales channel classification via value translation (`Wholesale` $\rightarrow$ `bulk`, `Individual` $\rightarrow$ `individual`).
- **`ProductPrice`**: Handles `Wholesale Price` (`priceType = wholesale`) and `Buying Price` (`priceType = buying`) with exact `Decimal(14,2)` precision.
- **`ProductPackaging` & `UnitOfMeasure`**: Handles packaging units and pack quantities.
- **`ImportRow` & `SourceRecordMapping`**: Handles source traceability and lineage.

---

## 2. Locked Design Options

### Topic 1: Sales Type Representation
- **Approved Solution (0 Schema Changes)**:
  - Translate Excel `Wholesale` $\rightarrow$ `ProductPurchaseType.bulk`.
  - Translate Excel `Individual` $\rightarrow$ `ProductPurchaseType.individual`.
  - Preserve Row 2048 (`RS-002054`) as `bulk`.
  - Do not automatically derive `allowIndividualSale` unless its existing semantics are proven to be identical.

### Topic 2: Source Record Identity & Lineage (Design B)
- **Approved Solution (Schema Change Required)**:
  - `Product.sku` is the primary stable product identity.
  - Add `sourceSystem String` and `sourceKey String` to `SourceRecordMapping` with `@@unique([sourceSystem, sourceKey])`.

### Topic 3: Packaging Conversion Semantics
- **Approved Solution (Schema Change Required)**:
  - Remove all inferred packaging conversions. Set `conversionToBase = 1` for all imported items.
  - Add `packQuantity Int?` to `ProductPackaging` to store Excel pack quantity explicitly.

---

## 3. Rejected Proposals (Removed from Scope)

The following items from the previous draft have been **REMOVED**:
1. ❌ **Cached `Product.wholesalePrice` & `Product.buyingPrice`**: Removed to prevent dual sources of truth and price cache synchronization risks. `ProductPrice` remains the sole authoritative model.
2. ❌ **`Product.salesType` Column Addition**: Removed in favor of explicit value translation into `Product.purchaseType`.
3. ❌ **Silently Seeded Default System Admin**: Removed. Phase 3B commit will strictly require an authenticated Admin user session.

---

## 4. Verification & Diagnostics

| Verification Step | Command | Result | Diagnostic Note |
| :--- | :--- | :---: | :--- |
| **npm Verification Pipeline** | `npm run verify` | **PASS (Exit Code 0)** | Replaced `npx prisma` with direct local invocation (`node node_modules/prisma/build/index.js`) to resolve path issues safely. |
| **Direct Prisma Validation** | `node node_modules/prisma/build/index.js validate --schema=packages/db/prisma/schema.prisma` | **PASS (Exit Code 0)** | `The schema at packages/db/prisma/schema.prisma is valid 🚀` |
| **Phase 2 Certification Guard** | `python tools/certify_catalogue.py data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx` | **PASS (Exit Code 0)** | `CERTIFIED WITH ADVISORIES` (SHA-256: `7cb65d6d...` UNCHANGED) |

---

## 5. Locked Owner Decisions

- **1 (Sales Type)**: Explicit mapping approved.
- **2 (Source Identity)**: Design B approved (composite key on SourceRecordMapping).
- **3 (Packaging)**: Inferred conversions removed. `packQuantity` (Int?) introduced.
- **4 (Pricing)**: Cached prices removed. ProductPrice authoritative.
- **5 (Lifecycle)**: Commit creates pending_review items.
- **6 (Authorization)**: CLI performs no writes. Commits strictly require a protected Admin API/session endpoint which derives actor identity from the authenticated session.
