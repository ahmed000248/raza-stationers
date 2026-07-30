# Phase 3A Catalogue-to-Schema Mapping Report — Raza Stationers (Revised)

**Date**: 2026-07-30  
**Branch**: `phase-3a-catalogue-schema-mapping`  
**Base Commit**: `3665918` (Phase 2 merge)  
**Primary Approved Workbook**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`  
**Workbook SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`  
**Phase 2 Decision**: `CERTIFIED WITH ADVISORIES`  
**Phase 3A Decision**: **APPROVED** (Locked Decisions)  

---

## 1. Executive Summary & Revised Decision

Phase 3A presents an exhaustive, code-grounded structural analysis comparing the 14 certified columns of the master business catalogue (`Raza-Stationers-Final-Supabase-Catalogue.xlsx`) with the physical Prisma database schema (`packages/db/prisma/schema.prisma`).

Following codebase analysis, the proposed addition of redundant cached fields (e.g. `Product.wholesalePrice`, `Product.buyingPrice`, `Product.salesType`) has been **removed**. Existing schema models (`Product.purchaseType`, `ProductPrice`, `ProductPackaging`, `ImportRow`, `SourceRecordMapping`) ALREADY support the catalogue data cleanly via explicit value translation and relational lineage.

> **Phase 3A Outcome: APPROVED**  
> Phase 3A mappings are approved. Locked owner decisions require specific schema additions (Design B for lineage, packQuantity for packaging). No Prisma schema edits have been executed during Phase 3A.

---

## 2. Starting State & Source Evidence Verification

Prior to analysis, the Phase 2 certification tool was executed to confirm source file integrity:

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

## 3. Detailed Codebase Analysis & Empirical Evidence

### 3.1 Sales Type & Product Fields Analysis
A comprehensive audit of field usages across `apps/web`, `apps/admin`, `packages/types`, `packages/db`, and system documentation (`docs/db/phase2answers.md`, `BRD.md`) revealed:

1. **`Product.purchaseType`**:
   - Existing Prisma Enum: `ProductPurchaseType` (`individual`, `bulk`, `both`, `unconfirmed`).
   - Business Meaning: Models the product's selling channel eligibility. Frontend website handlers (`shared/store.js`, `Catalogue.dc.html`, `ProductDetail.dc.html`) toggle `purchaseType` between `'individual'` (single item) and `'bulk'` (wholesale pack).
   - Alignment with Catalogue: The certified catalogue's "Sales Type" column (`Wholesale` = 2,097, `Individual` = 70) maps directly to this existing field via explicit value translation:
     - Excel `Wholesale` $\rightarrow$ `ProductPurchaseType.bulk`
     - Excel `Individual` $\rightarrow$ `ProductPurchaseType.individual`
   - **Conclusion**: Explicit mapping approved. `Wholesale` -> `bulk`, `Individual` -> `individual`. RS-002054 must remain bulk. Do not add `Product.salesType`.

2. **`Product.allowIndividualSale`**:
   - Existing Field: `Boolean @default(false)`.
   - Business Meaning: Governs whether a bulk packaging unit can be broken apart into individual unit sales.
   - **Locked Decision**: Do not automatically derive `allowIndividualSale` unless its existing semantics are proven to be identical.

3. **`ProductPrice.priceType`**:
   - Existing Prisma Enum: `PriceType` (`retail`, `wholesale`, `buying`). Added `buying` in migration `20260727150435_add_buying_price_type`.
   - Business Meaning: Authoritative price classifier. Stores historical effective price records per packaging unit.

---

### 3.2 Source Key & Identity Architecture (Design Alternatives)

The certified workbook `Source Key` (`WS-RATES:1:2` to `WS-RATES:43:52`) identifies the *source row*, whereas `Product` represents the *business entity*. Products may eventually originate from multiple source files or manual entries.

`Product.sku` (`RS-000001` to `RS-002167`) is the **authoritative stable product identity**.

#### Identity Taxonomy
- **Product Primary Key**: `Product.id` (CUID, internal DB primary key).
- **Product SKU**: `Product.sku` (`RS-000001`, human-readable stable business SKU).
- **Numeric SKU**: `Product.skuNumber` (`1`, BigInt representation of SKU).
- **Source Record Key**: `WS-RATES:1:2` (Workbook sheet & row coordinate).
- **Import Row Identity**: `ImportRow.id` (CUID per staging row).
- **Logical Duplicate Identity**: Matching `sku` or normalized product name + category.

#### Approved Source Identity Design (Design B)
- **Design B (Lineage Model Addition)**:
  - `Product.sku` is the authoritative product matching/upsert key.
  - `sourceSystem` and `sourceKey` belong on `SourceRecordMapping`.
  - Add a composite unique constraint on: `sourceSystem` + `sourceKey`.
  - A Product may have multiple `SourceRecordMapping` records.
  - Do not add `Product.sourceKey`.
  - `ImportRow.id` remains staging-row identity only.
  - Normalized product name + category may be used only for duplicate warnings, never for merging or updating.

---

### 3.3 Packaging Semantics & Base Unit Analysis

A conversion ratio (`conversionToBase`) requires both a packaging unit AND a known base unit. The certified catalogue contains 6 distinct units of measure.

#### Packaging Decision Matrix

| Excel Unit of Measure | Count | Catalogue Price Applies To | Base Inventory Unit | Is Base Unit Inferred? | Packaging Records Needed | Pack Quantity Handling |
| :--- | ---: | :--- | :--- | :--- | :--- | :--- |
| **`Piece`** | 1,871 | Single piece | `piece` | No (explicit) | 1 (`isBase=true`, `conversion=1.0`) | Blank or `1` $\rightarrow$ `conversionToBase = 1.0` |
| **`Pack`** | 155 | Pack container | `piece` (if pack items) or `pack` | Inferred (236 items have numeric Pack Qty e.g. 6, 12) | 1 or 2 | Numeric value (e.g. 6) $\rightarrow$ `conversionToBase = 6.0` |
| **`Box`** | 85 | Box container | `box` (or `piece` if items inside known) | Inferred | 1 (`isBase=true`, `conversion=1.0`) | Blank $\rightarrow$ `conversionToBase = 1.0` |
| **`Jar`** | 33 | Jar container | `jar` | Inferred | 1 (`isBase=true`, `conversion=1.0`) | Blank $\rightarrow$ `conversionToBase = 1.0` |
| **`Rim`** | 13 | Paper rim (500 sheets) | `rim` (or `sheet`) | Inferred | 1 (`isBase=true`, `conversion=1.0`) | Blank $\rightarrow$ `conversionToBase = 1.0` |
| **`Set`** | 10 | Set container | `set` | Inferred | 1 (`isBase=true`, `conversion=1.0`) | Blank $\rightarrow$ `conversionToBase = 1.0` |

#### Approved Packaging Semantics
- Remove all inferred packaging conversions.
- For every imported item (including Piece, Pack, Box, etc.), set `conversionToBase = 1`.
- Introduce `packQuantity` (nullable integer) to `ProductPackaging`.
- Do not assume Piece is the base unit for all packaging types.
- Do not automatically map Pack Quantity to `ProductPackaging.conversionToBase`.

---

### 3.4 Pricing Query Strategy (Cached Fields Removed)

The proposal to add cached `Product.wholesalePrice` and `Product.buyingPrice` fields has been **REMOVED**. `ProductPrice` is the sole authoritative price-history model.

Current effective prices are queried via standard index-optimized Prisma queries:

```typescript
// Query Current Wholesale Price for a Product Packaging Unit
const currentWholesalePrice = await prisma.productPrice.findFirst({
  where: {
    productPackagingId: packagingId,
    priceType: PriceType.wholesale,
    effectiveFrom: { lte: now },
    OR: [
      { effectiveTo: null },
      { effectiveTo: { gte: now } }
    ]
  },
  orderBy: { effectiveFrom: 'desc' }
});
```

- Supported by existing compound index: `@@index([productPackagingId, priceType, currency, effectiveFrom])`.
- Zero risk of price cache desynchronization or dual sources of truth.

---

### 3.5 Import Authorization & Responsibility Split (Protected Admin Commit)

The proposal to silently seed a default "System Admin" user has been **REMOVED**.
The proposal to accept an `actorAdminId` CLI argument has been **REJECTED**.

**LOCKED AUTHORIZATION CONTRACT:**
- The CLI may inspect the workbook, validate rows and perform dry runs, but **must not directly commit** catalogue data to the database.
- A real import commit must go through a protected Admin API or equivalent authenticated Admin server action.
- The `actorAdminId` must be derived from the authenticated server session and must not be accepted as a manually supplied CLI argument.
- Any client-provided actor identity must be ignored.
- The authenticated user must exist in the database, be active, have the Admin role, and have a valid session.
- Terminal access alone must not be treated as Admin authentication.

**Phase 3B Importer Engine (CLI):**
- Load the certified workbook, verify SHA-256, validate headers and worksheet identity.
- Parse and normalize rows, apply approved field mappings, produce validation errors.
- Compare rows against existing data where read access is allowed.
- Produce a deterministic import plan and support dry-run mode.
- **Make no business-data mutations.**

**Protected Admin Import Endpoint (Server Action):**
- Require an authenticated Admin session (verify Admin is active).
- Revalidate the workbook identity (SHA-256), exact headers, certification status, expected logical product count, and duplicate/conflict status.
- Revalidate the import-plan checksum and validation result.
- Reject plans whose workbook hash or validation state has changed.
- Derive the actor identity from the authenticated session.
- Execute the approved import transaction and create the `ImportRun` audit record.
- Record the authenticated Admin as the actor.
- Return a reconciliation report and prevent unauthorized direct commits.

**Phase 3C Staging Commit:**
- Execute only through the protected Admin path.
- Import products as `pending_review`.
- Keep `activatedAt` and `activatedById` null.
- Require a separate approved Admin action for activation.
- Reconcile expected and actual totals after the transaction.

---

### 3.6 Active Status & Lifecycle Rules

- **Dry-Run Mode (`--dry-run`)**: Validates catalogue structure, parses values, checks uniqueness, and checks constraints. **Creates ZERO database mutations.**
- **Commit Operation**:
  - `Product.status` is set to `pending_review` (not `active`).
  - `activatedAt` remains null until formal activation.
  - `activatedById` remains null until formal activation.

---

## 4. Verification Diagnostics & Accuracy Report

The repository verification status is reported below:

### 1. `npm run verify` Pipeline
- **Command**: `npm run verify`
- **Result**: **PASS ✅** (Exit Code `0`)
- **Fix Applied**: Modified `package.json` to replace `npx prisma` with explicit local invocation (`node node_modules/prisma/build/index.js`).
- **Constraint Compliance**: Kept local dependency, no `package-lock.json` changes, no dependencies added, no hard-coded paths.

### 2. Direct Prisma CLI Validation
- **Command**: `node node_modules/prisma/build/index.js validate --schema=packages/db/prisma/schema.prisma`
- **Result**: **PASS ✅** (Exit Code `0`)
- **Output**: `The schema at packages\db\prisma\schema.prisma is valid 🚀`

### 3. Phase 2 Certification Guard
- **Command**: `python tools/certify_catalogue.py data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`
- **Result**: **PASS ✅** (Exit Code `0`, CERTIFIED WITH ADVISORIES)
- **Workbook SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b` (**UNCHANGED**)

---

## 5. Complete Field-Mapping Matrix

| Col | Excel Header | Position | Example | Meaning | Current Destination | Classification | Proposed Destination | Transformation | Required 3B | Schema Change | Notes |
|--:|:--- |--:|:--- |:--- |:--- |:--- |:--- |:--- |:---:|:---:|:--- |
| 1 | `SKU` | 1 | `RS-000001` | Unique product SKU | `Product.sku` (String @unique) | `EXISTING_DIRECT_FIELD` | `Product.sku` | Trim, uppercase | Yes | No | Primary product identity. `Product.skuNumber` (BigInt) derived from numeric suffix `1`. |
| 2 | `Product Name` | 2 | `JAHAZ (6 PCS)` | Commercial product title | `Product.name` (String) | `EXISTING_DIRECT_FIELD` | `Product.name` | Trim, normalize spaces | Yes | No | Preserves approved local Pakistani trade names. |
| 3 | `Category` | 3 | `BALL POINT` | Category classification | `Category.name` -> `Product.categoryId` | `EXISTING_RELATIONSHIP` | `Category.name` -> `Product.categoryId` | Trim, upsert Category by name & slug | Yes | No | Resolves to `Category.id` (103 categories). |
| 4 | `Sales Type` | 4 | `Wholesale` | Sales channel type | `Product.purchaseType` & `allowIndividualSale` | `EXISTING_DIRECT_FIELD` | `Product.purchaseType` (ProductPurchaseType enum) | Explicit translation: Wholesale -> bulk, Individual -> individual | Yes | No | Value translation. Authoritative. Row 2048 (`RS-002054`) = bulk. |
| 5 | `Unit of Measure` | 5 | `Pack` | Packaging unit | `UnitOfMeasure.code` -> `ProductPackaging` | `EXISTING_RELATIONSHIP` | `ProductPackaging.unitOfMeasureId` | Map to UOM code (`piece`, `pack`, `box`, `jar`, `rim`, `set`) | Yes | No | Owner decision on base unit inference vs explicit packQuantity. |
| 6 | `Pack Quantity` | 6 | `6` | Items per pack | `ProductPackaging.packQuantity` | `NEW_FIELD` | `ProductPackaging.packQuantity` (Int?) | Parse numeric value. Set conversionToBase = 1 for all. | Yes | Yes | Populated in 236 pack products. Requires schema change. |
| 7 | `Currency` | 7 | `PKR` | ISO currency code | `ProductPrice.currency` | `EXISTING_DIRECT_FIELD` | `ProductPrice.currency` | Validate == 'PKR', map to CurrencyCode.PKR | Yes | No | Supported by `CurrencyCode` enum. |
| 8 | `Wholesale Price` | 8 | `390` | Selling price (PKR) | `ProductPrice.amount` (`priceType=wholesale`) | `EXISTING_RELATIONSHIP` | `ProductPrice.amount` [wholesale] | Parse to `Decimal(14,2)`. Never store float. | Yes | No | Stored exclusively in `ProductPrice`. Cached columns removed. |
| 9 | `Buying Price` | 9 | `355` | Cost price (PKR) | `ProductPrice.amount` (`priceType=buying`) | `EXISTING_RELATIONSHIP` | `ProductPrice.amount` [buying] | Parse to `Decimal(14,2)`. Never store float. | Yes | No | Stored exclusively in `ProductPrice`. Cached columns removed. |
| 10 | `Profit` | 10 | `35` | Excel formula `=H5-I5` | None | `CALCULATED_NOT_STORED` | Calculated in DTO / service getters | Compute: Wholesale - Buying. DO NOT store. | No | No | Formula column. Persisting calculated state prohibited. |
| 11 | `Profit Margin %` | 11 | `0.08974` | Excel formula `=IF(H=0,0,J/H)` | None | `CALCULATED_NOT_STORED` | Calculated in DTO / service getters | Compute: (Profit / Wholesale) * 100. DO NOT store. | No | No | Formula column. Persisting calculated state prohibited. |
| 12 | `Markup %` | 12 | `0.09859` | Excel formula `=IF(I=0,0,J/I)` | None | `CALCULATED_NOT_STORED` | Calculated in DTO / service getters | Compute: (Profit / Buying) * 100. DO NOT store. | No | No | Formula column. Persisting calculated state prohibited. |
| 13 | `Active` | 13 | `True` | Active status flag | `Product.status` | `EXISTING_DIRECT_FIELD` | `Product.status` (`ProductStatus.pending_review`) | Commit sets `status = pending_review`, `activatedAt` remains null. | Yes | No | Sets status = pending_review on commit. |
| 14 | `Source Key` | 14 | `WS-RATES:1:2` | Traceability row key | `SourceRecordMapping` | `NEW_FIELD` | `SourceRecordMapping` | Stored in `sourceSystem` and `sourceKey`. Product.sku is primary identity. | Yes | Yes | Design B approved. |

---

## 6. Owner Approval Checklist

Before proceeding to Phase 3B (Importer Development):

- [ ] **Approval Item 1 (Sales Type)**: Approve value translation mapping (Excel `Wholesale` $\rightarrow$ `ProductPurchaseType.bulk`, Excel `Individual` $\rightarrow$ `ProductPurchaseType.individual`). Confirm preservation of Row 2048 (`RS-002054`) as `bulk`.
- [ ] **Approval Item 2 (Source Identity)**: Select preferred source lineage design: **Design A** (lineage in `ImportRow`/`SourceRecordMapping`, zero schema changes), **Design B** (`sourceSystem`/`sourceKey` on `SourceRecordMapping`), or **Design C** (`Product.sourceKey`).
- [ ] **Approval Item 3 (Packaging Conversion)**: Approve packaging conversion semantics across 6 UOMs (Piece, Pack, Box, Jar, Rim, Set). Confirm whether to infer `Piece` as base unit or introduce an explicit `packQuantity` field.
- [ ] **Approval Item 4 (Import Admin Identity)**: Confirm that Phase 3B commit will require an existing authenticated Admin user session rather than a seeded fallback user.

---

## 7. Final Confirmations

- **Workbook Modified**: **NO** (SHA-256 verified unchanged: `7cb65d6d...`)
- **Prisma Schema (`schema.prisma`) Modified**: **NO** (Zero schema files edited)
- **Migration Directories Modified**: **NO**
- **Package Lockfiles Modified**: **NO**
- **Database Connected / Mutated**: **NO**
- **Importer Code Written**: **NO**
