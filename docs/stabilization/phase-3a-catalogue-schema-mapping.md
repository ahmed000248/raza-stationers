# Phase 3A Catalogue-to-Schema Mapping Report — Raza Stationers

**Date**: 2026-07-30  
**Branch**: `phase-3a-catalogue-schema-mapping`  
**Base Commit**: `3665918` (Phase 2 merge)  
**Primary Approved Workbook**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`  
**Workbook SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`  
**Phase 2 Decision**: `CERTIFIED WITH ADVISORIES`  
**Phase 3A Decision**: **READY FOR SCHEMA APPROVAL**  

---

## 1. Executive Summary & Audit Decision

Phase 3A completes the exhaustive structural comparison between the 14 certified columns of the master business catalogue (`Raza-Stationers-Final-Supabase-Catalogue.xlsx`) and the physical Prisma database schema (`packages/db/prisma/schema.prisma`).

### Status Summary
- **Total Excel Columns Mapped**: 14 of 14 (100% complete)
- **Existing Fields Reused Directly**: 5 (`Product.sku`, `Product.name`, `ProductPackaging.conversionToBase`, `ProductPrice.currency`, `Product.status`)
- **Existing Relationships Reused**: 4 (`Category` via `Product.categoryId`, `UnitOfMeasure` via `ProductPackaging`, `Wholesale Price` via `ProductPrice`, `Buying Price` via `ProductPrice`)
- **Calculated Fields (Not Stored)**: 3 (`Profit`, `Profit Margin %`, `Markup %`)
- **New Fields Proposed**: 2 (`Product.sourceKey`, `Product.salesType`)
- **New Models/Relations Required**: 0 (existing `ProductPackaging`, `ProductPrice`, `ImportBatch`, `ImportRow`, `SourceRecordMapping`, `StockBalance`, `StockMovement` models fully cover requirements)
- **Blocking Schema Gaps for Importer**: 2 (`GAP-01`: `Product.sourceKey`, `GAP-02`: `Product.salesType` alignment)

> **Phase 3A Outcome: READY FOR SCHEMA APPROVAL**  
> This document and the accompanying [schema change proposal](file:///d:/Projects/Raza%20Stationers/docs/stabilization/phase-3a-schema-change-proposal.md) provide the exact blueprint for Phase 3B importer development. No Prisma schema edits, database migrations, or importer code have been executed during Phase 3A.

---

## 2. Starting State & Source Evidence Verification

Prior to performing schema mapping, the Phase 2 certification tool was executed from a cold check to verify catalogue integrity:

```bash
$env:PYTHONUTF8=1; python tools/certify_catalogue.py data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx
```

### Verification Results
- **Exit Code**: `0` (CERTIFIED WITH ADVISORIES)
- **Pre-Analysis SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **Post-Analysis SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b` (**UNCHANGED**)
- **Reconciliation Totals**:
  - Logical Products: **2,167**
  - Distinct Categories: **103**
  - Individual Sales Type: **70**
  - Wholesale Sales Type: **2,097**

---

## 3. Existing Prisma Data Model Overview

The physical monorepo schema resides in `packages/db/prisma/schema.prisma` (the root `prisma/schema.prisma` is a 14-line stub pointing to `../generated/prisma`).

### Existing Relevant Models & Tables

| Model | Table Name | Purpose & Structure |
| :--- | :--- | :--- |
| `Product` | `products` | Base product definition. Has `id`, `skuNumber` (BigInt @unique), `sku` (String @unique), `name`, `categoryId`, `purchaseType` (ProductPurchaseType enum), `status` (ProductStatus enum), `allowIndividualSale` (Boolean). |
| `Category` | `categories` | Product category definition. Has `id`, `name` (String @unique), `slug` (String @unique), `isActive`. Flat structure in v0.1. |
| `UnitOfMeasure` | `units_of_measure` | Physical unit definition. Has `id`, `code` (String @unique), `name`, `symbol`. Standard codes: `piece`, `pack`, `box`, `jar`, `rim`, `set`. |
| `ProductPackaging` | `product_packaging` | Packaging variants & unit conversion. Has `id`, `productId`, `unitOfMeasureId`, `code`, `label`, `conversionToBase` (Decimal(18,6)), `isBase` (Boolean). |
| `ProductPrice` | `product_prices` | Relational price history. Has `id`, `productPackagingId`, `priceType` (PriceType enum: `retail`, `wholesale`, `buying`), `currency` (CurrencyCode @default(PKR)), `amount` (Decimal(14,2)), `effectiveFrom`, `createdById`. |
| `StockBalance` | `stock_balances` | Inventory balances per location & bucket (`onHandQuantity`, `reservedQuantity`, `unavailableQuantity`, `inTransitQuantity`, `damagedQuantity`). |
| `StockMovement` | `stock_movements` | Stock audit ledger (`productId`, `stockLocationId`, `quantityBase`, `movementType` [restock, packing, dispatch, return_receipt, adjustment, etc.], `createdById`). |
| `ImportBatch` | `import_batches` | File-level import tracking (`sha256`, `status`, `totalRows`, `uploadedById`, `approvedById`, `committedById`). |
| `ImportRow` | `import_rows` | Row-level import data (`sourceSheet`, `sourceRowNumber`, `rawData` Json, `validationStatus`, `commitStatus`). |
| `SourceRecordMapping`| `source_record_mappings` | Link between `ImportRow` and target entities (`categoryId`, `productId`, `productPackagingId`, `productPriceId`). |
| `User` | `users` | User & Admin identity (`role` UserRole: `owner`, `admin`, `packing`, `delivery`, `business_user`). |
| `AuditLog` | `audit_logs` | System audit ledger (`actorId`, `action`, `entityType`, `entityId`, `beforeData` Json, `afterData` Json). |

### Migration History
Existing physical database migrations located in `packages/db/prisma/migrations/`:
1. `20260726162130_initial_schema_v0_1`: Initial physical schema baseline.
2. `20260727021642_supabase_runtime_security`: Supabase RLS and runtime security.
3. `20260727022832_supabase_function_default_privileges`: DB function default privileges.
4. `20260727150435_add_buying_price_type`: Added `buying` to `PriceType` enum.
5. `20260727190918_add_business_settings`: Added `business_settings` model.

---

## 4. Complete Catalogue Field-Mapping Matrix

Every certified Excel column from the master workbook (`Products` sheet, header row 4) is mapped below:

| Col | Excel Header | Position | Example | Meaning | Current Destination | Classification | Proposed Destination | Transformation | Required for Phase 3B | Schema Change | Notes |
|--:|:--- |--:|:--- |:--- |:--- |:--- |:--- |:--- |:---:|:---:|:--- |
| 1 | `SKU` | 1 | `RS-000001` | Unique product SKU | `Product.sku` (String @unique) | `EXISTING_DIRECT_FIELD` | `Product.sku` | Trim, uppercase | Yes | No | Direct map. `Product.skuNumber` (BigInt) derived by parsing numeric suffix `1`. |
| 2 | `Product Name` | 2 | `JAHAZ (6 PCS)` | Commercial product title | `Product.name` (String) | `EXISTING_DIRECT_FIELD` | `Product.name` | Trim, normalize spaces | Yes | No | Preserves approved local Pakistani trade names. |
| 3 | `Category` | 3 | `BALL POINT` | Category classification | `Category.name` -> `Product.categoryId` | `EXISTING_RELATIONSHIP` | `Category.name` -> `Product.categoryId` | Trim, upsert Category by name & slug | Yes | No | Resolves to `Category.id` (103 categories). |
| 4 | `Sales Type` | 4 | `Wholesale` | Sales channel type | `Product.purchaseType` & `allowIndividualSale` | `NEW_FIELD_REQUIRED` | `Product.salesType` (SalesType enum) | Match text: Wholesale -> wholesale, Individual -> individual | Yes | **Yes** | Authoritative. DO NOT infer from packaging. Row 2048 (`RS-002054`) MUST remain Wholesale. |
| 5 | `Unit of Measure` | 5 | `Pack` | Packaging unit | `UnitOfMeasure.code` -> `ProductPackaging` | `EXISTING_RELATIONSHIP` | `ProductPackaging.unitOfMeasureId` | Map to UOM code (`piece`, `pack`, `box`, `jar`, `rim`, `set`) | Yes | No | Maps to `UnitOfMeasure` & `ProductPackaging`. |
| 6 | `Pack Quantity` | 6 | `6` | Items per pack | `ProductPackaging.conversionToBase` | `EXISTING_DIRECT_FIELD` | `ProductPackaging.conversionToBase` | Parse numeric Decimal (default 1.0 for single units) | Yes | No | Populated in 236 pack products. Represents packaging ratio. |
| 7 | `Currency` | 7 | `PKR` | ISO currency code | `ProductPrice.currency` | `EXISTING_DIRECT_FIELD` | `ProductPrice.currency` | Validate == 'PKR', map to CurrencyCode.PKR | Yes | No | Supported by `CurrencyCode` enum. |
| 8 | `Wholesale Price` | 8 | `390` | Selling price (PKR) | `ProductPrice.amount` (priceType=wholesale) | `EXISTING_RELATIONSHIP` | `ProductPrice.amount` [wholesale] & `Product.wholesalePrice` | Parse to Decimal(14,2). Never store float. | Yes | No | Stored in `ProductPrice` with `priceType = wholesale`. |
| 9 | `Buying Price` | 9 | `355` | Cost price (PKR) | `ProductPrice.amount` (priceType=buying) | `EXISTING_RELATIONSHIP` | `ProductPrice.amount` [buying] & `Product.buyingPrice` | Parse to Decimal(14,2). Never store float. | Yes | No | Stored in `ProductPrice` with `priceType = buying`. |
| 10 | `Profit` | 10 | `35` | Excel formula `=H5-I5` | None | `CALCULATED_NOT_STORED` | Calculated in DTO / service getters | Compute: Wholesale - Buying. DO NOT store. | No | No | Formula column. Persisting calculated state is prohibited. |
| 11 | `Profit Margin %` | 11 | `0.08974` | Excel formula `=IF(H=0,0,J/H)` | None | `CALCULATED_NOT_STORED` | Calculated in DTO / service getters | Compute: (Profit / Wholesale) * 100. DO NOT store. | No | No | Formula column. Persisting calculated state is prohibited. |
| 12 | `Markup %` | 12 | `0.09859` | Excel formula `=IF(I=0,0,J/I)` | None | `CALCULATED_NOT_STORED` | Calculated in DTO / service getters | Compute: (Profit / Buying) * 100. DO NOT store. | No | No | Formula column. Persisting calculated state is prohibited. |
| 13 | `Active` | 13 | `True` | Active status flag | `Product.status` | `EXISTING_DIRECT_FIELD` | `Product.status` (ProductStatus.active) | Map 'True' -> ProductStatus.active, activatedAt = now() | Yes | No | Sets `status = active` and `activatedAt = now()`. |
| 14 | `Source Key` | 14 | `WS-RATES:1:2` | Traceability row key | `ImportRow` / `SourceRecordMapping` | `NEW_FIELD_REQUIRED` | `Product.sourceKey` (String? @unique) | Trim, store in `Product.sourceKey` & `SourceRecordMapping` | Yes | **Yes** | Enables direct idempotency check during re-imports. |

---

## 5. Detailed Domain & Architecture Analysis

### 5.1 Category Mapping
- **Approved Total**: 103 distinct categories.
- **Model**: `Category` (`id`, `name` @unique, `slug` @unique, `isActive`).
- **Upsert Strategy**:
  - `name`: Cleaned raw text (e.g., `BALL POINT`).
  - `slug`: URL-safe slugified string (e.g., `ball-point`).
  - Foreign Key: `Product.categoryId` -> `Category.id`.
- **Invariance Rule**: Importer MUST NOT attempt to alter, merge, or re-parent approved category names.

### 5.2 Product Identity & Idempotency
- **Primary Identity Key**: `SKU` (`RS-000001` to `RS-002167`). Maps to `Product.sku` (`String @unique`).
- **Secondary Identity Key**: `Source Key` (`WS-RATES:1:2`). Maps to proposed `Product.sourceKey` (`String? @unique`).
- **Numeric SKU Helper**: `Product.skuNumber` (`BigInt @unique`). Importer parses the integer portion of `RS-000001` (`1`) to satisfy this field cleanly.
- **Idempotency Contract**:
  - Re-running the Phase 3B importer against an already imported database matches existing products by `sku` and `sourceKey`.
  - Matching records update prices/metadata without creating duplicate rows.

### 5.3 Sales Type Representation & Exception Rule
- **Approved Population**: 70 `Individual`, 2,097 `Wholesale`.
- **Authoritative Source**: Column 4 (`Sales Type`).
- **CRITICAL RULE**: Importer MUST NOT infer Sales Type from pack quantity or unit of measure.
- **Approved Business Exception**:
  - Row 2048 | SKU `RS-002054` | Product: `DOLLAR PERMANENT MARKER 1 P` | Unit: `Piece` | Pack Qty: `1` | Sales Type: **`Wholesale`**.
  - This row MUST remain `Wholesale` during import.
- **Schema Mapping**:
  - Proposed enum: `enum SalesType { wholesale, individual }` on `Product.salesType`.
  - Also sets `Product.allowIndividualSale = (salesType == individual)`.

### 5.4 Packaging & Unit Mapping
- **Units**: 6 distinct approved units (`Piece`, `Pack`, `Box`, `Jar`, `Rim`, `Set`).
- **Pack Quantity**: Populated in 236 wholesale pack products (e.g., `6`, `12`, `500`).
- **Mapping**:
  - `UnitOfMeasure`: Standard records seeded with codes `piece`, `pack`, `box`, `jar`, `rim`, `set`.
  - `ProductPackaging`: Each product gets a primary `ProductPackaging` record with `conversionToBase = Pack Quantity` (or `1.0` if single piece) and `isBase = true`.

### 5.5 Pricing & Financial Precision
- **Buying Price**: Cost price (PKR 3.50 to 8,500.00).
- **Wholesale Price**: Commercial selling price (PKR 5.00 to 9,000.00).
- **Financial Precision Rule**: Prices MUST be stored as `Decimal(14,2)` in PostgreSQL. Floats are strictly prohibited.
- **Relational Storage**:
  - Each product's `ProductPackaging` links to two `ProductPrice` records:
    1. `priceType = wholesale`, `amount = Wholesale Price`, `currency = PKR`, `effectiveFrom = now()`
    2. `priceType = buying`, `amount = Buying Price`, `currency = PKR`, `effectiveFrom = now()`

### 5.6 Formula Columns (Calculated, Not Stored)
- `Profit` (Col 10), `Profit Margin %` (Col 11), `Markup %` (Col 12) contain 6,501 Excel formulas.
- **Rule**: These formula results MUST NOT be stored in the database.
- **Calculation Spec**:
  - $	ext{Profit} = 	ext{Wholesale Price} - 	ext{Buying Price}$
  - $\text{Profit Margin \%} = \begin{cases} 0 & \text{if Wholesale Price} = 0 \\ \frac{\text{Profit}}{\text{Wholesale Price}} \times 100 & \text{otherwise} \end{cases}$
  - $\text{Markup \%} = \begin{cases} 0 & \text{if Buying Price} = 0 \\ \frac{\text{Profit}}{\text{Buying Price}} \times 100 & \text{otherwise} \end{cases}$
- Computed dynamically in NestJS DTOs / service getters.

### 5.7 Inventory Compatibility (Stock Management Rule)
- **Requirement**: Stock must be managed via movements (`restock`, `sale`, `return`, `adjustment`) rather than arbitrary overwrites.
- **Current Schema Support**: `StockBalance` and `StockMovement` models ALREADY support multi-bucket stock and movement audit trails.
- **Phase 3B Scope**: Initial catalogue import seeds product definitions and pricing. Opening inventory (if supplied) will be recorded as `StockMovement` of type `restock` / `adjustment` linked to default `StockLocation`.

### 5.8 Admin-Only Modification & Attribution
- **Requirement**: All business data mutations must be attributable to an authenticated Admin.
- **Import Attribution**:
  - Import batches: `ImportBatch.uploadedById`, `ImportBatch.committedById` link to acting Admin `User.id`.
  - Prices: `ProductPrice.createdById` links to acting Admin `User.id`.
  - System Seed Requirement: A default system Admin user (`admin@razastationers.com`) must be seeded in `users` prior to committing catalogue imports.

---

## 6. Schema Gap Matrix

| Gap ID | Business Requirement | Current Schema | Proposed Schema Change | Import Blocking | Migration Needed | Risk | Phase |
| :--- | :--- | :--- | :--- | :---:|:---:| :--- | :--- |
| **GAP-01** | Direct Source Key tracking on Product for fast idempotency | Traceability indirect via `ImportRow` / `SourceRecordMapping` | Add `sourceKey String? @unique @map("source_key")` to `Product` | **YES** | No (nullable addition) | Low | `BLOCKING_PHASE_3` |
| **GAP-02** | Explicit `SalesType` enum matching business terms | `ProductPurchaseType` enum uses `individual`, `bulk`, `both` | Add `SalesType` enum (`wholesale`, `individual`) & `salesType SalesType?` to `Product` | **YES** | No (enum & nullable field) | Low | `BLOCKING_PHASE_3` |
| **GAP-03** | Fast catalog price reads without joining 3 tables | Prices stored exclusively in `ProductPrice` relation table | Optional: Add cached `wholesalePrice Decimal?` & `buyingPrice Decimal?` to `Product` | No | No (optional field) | Low | `REQUIRED_BEFORE_PRODUCTION` |
| **GAP-04** | Admin actor attribution for CLI/automated imports | Foreign keys `createdById`, `committedById` require valid `User.id` | Ensure seed System Admin user exists in `users` table prior to import | **YES** | No (data seed step) | Low | `BLOCKING_PHASE_3` |

---

## 7. Phase 3B Importer Contract (Handoff Specification)

### Input Artifact
- **Path**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`
- **SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **Sheet**: `Products`
- **Header Row**: 4 (Headers: SKU, Product Name, Category, Sales Type, Unit of Measure, Pack Quantity, Currency, Wholesale Price, Buying Price, Profit, Profit Margin %, Markup %, Active, Source Key)
- **Data Range**: Rows 5 through 2171 (2,167 logical product rows)

### Reconciled Output Contract
Upon completing an import into an empty database, the system must contain exactly:
- **2,167** `Product` records (`status = active`)
- **103** `Category` records
- **2,167** `ProductPackaging` base records
- **4,334** `ProductPrice` records (2,167 `wholesale` + 2,167 `buying`)
- **70** `Individual` sales type products
- **2,097** `Wholesale` sales type products

### Operational Requirements
1. **SHA-256 Guard**: Importer must calculate SHA-256 before processing and abort if hash != `7cb65d6d...`.
2. **Dry-Run Mode**: Importer must support `--dry-run` flag to validate all 2,167 rows without committing DB transactions.
3. **Transaction Boundary**: Batch commit inside a single PostgreSQL database transaction. Rollback on any unhandled error.
4. **Idempotency**: Running importer twice produces 0 duplicate products and 0 duplicate categories.

---

## 8. Confirmations

- **Workbook Modified**: **NO** (SHA-256 verified unchanged)
- **Prisma Schema (`schema.prisma`) Modified**: **NO** (Proposal phase only)
- **Database Access / Mutations**: **NONE**
- **Importer Code Written**: **NONE**
- **Package Lockfiles Modified**: **NO**
