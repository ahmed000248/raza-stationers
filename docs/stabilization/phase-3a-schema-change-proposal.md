# Phase 3A Schema Change Proposal — Raza Stationers

**Date**: 2026-07-30  
**Status**: **PROPOSAL FOR OWNER REVIEW** (No changes applied to `schema.prisma`)  
**Branch**: `phase-3a-catalogue-schema-mapping`  
**Target File**: `packages/db/prisma/schema.prisma`  

---

## 1. Summary of Proposed Prisma Schema Modifications

To cleanly support the certified business master catalogue (`2,167` products, `103` categories, `70` Individual, `2,097` Wholesale) and ensure fast, idempotent imports, the following minimal, non-destructive schema additions are proposed.

---

## 2. Proposed Prisma Schema Code Snippet (Diff)

```prisma
// ============================================================================
// Proposed Additions to packages/db/prisma/schema.prisma
// ============================================================================

// 1. Proposed New Enum for Business Sales Channel Alignment
enum SalesType {
  wholesale
  individual

  @@map("sales_type")
}

// 2. Proposed Field Additions to Product Model
model Product {
  id                     String              @id @default(cuid())
  skuNumber              BigInt              @unique @map("sku_number")
  sku                    String              @unique
  sourceKey              String?             @unique @map("source_key")   // <--- PROPOSED: GAP-01 (Traceability & Idempotency)
  salesType              SalesType?          @map("sales_type")           // <--- PROPOSED: GAP-02 (Explicit Business Sales Type)
  name                   String
  nameUrdu               String?             @map("name_urdu")
  shopName               String?             @map("shop_name")
  categoryId             String              @map("category_id")
  description            String?
  purchaseType           ProductPurchaseType @default(unconfirmed) @map("purchase_type")
  status                 ProductStatus       @default(pending_review)
  unitConfirmationStatus ConfirmationStatus  @default(unconfirmed) @map("unit_confirmation_status")
  allowIndividualSale    Boolean             @default(false) @map("allow_individual_sale")
  
  // Optional Cached Price Fields for Fast Catalogue API Response (GAP-03)
  wholesalePrice         Decimal?            @map("wholesale_price") @db.Decimal(14, 2) // <--- PROPOSED: Cached current Wholesale Price
  buyingPrice            Decimal?            @map("buying_price") @db.Decimal(14, 2)    // <--- PROPOSED: Cached current Buying Price

  lowStockThresholdBase  Decimal?            @map("low_stock_threshold_base") @db.Decimal(18, 3)
  reviewReason           String?             @map("review_reason")
  activatedAt            DateTime?           @map("activated_at") @db.Timestamptz(3)
  activatedById          String?             @map("activated_by_id")
  archivedAt             DateTime?           @map("archived_at") @db.Timestamptz(3)
  archivedById           String?             @map("archived_by_id")
  createdAt              DateTime            @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt              DateTime            @updatedAt @map("updated_at") @db.Timestamptz(3)

  // Indexes
  @@index([status, categoryId])
  @@index([name])
  @@index([shopName])
  @@index([salesType])                                                      // <--- PROPOSED: Index for Sales Type filtering
  @@map("products")
}
```

---

## 3. Rationale for Proposed Additions

### 3.1 `sourceKey String? @unique` (GAP-01)
- **Why**: The certified catalogue contains a unique source key per row (`WS-RATES:1:2` to `WS-RATES:43:52`).
- **Benefit**: Storing `sourceKey` directly on `Product` allows the importer to perform instant $O(1)$ lookup during re-runs to update existing records without creating duplicates.
- **Safety**: Fully nullable (`String?`), causing zero impact to any existing records or queries.

### 3.2 `salesType SalesType?` (GAP-02)
- **Why**: Business operations explicitly distinguish between `Wholesale` (2,097 items) and `Individual` (70 items).
- **Benefit**: Replaces ambiguous mapping to `ProductPurchaseType.bulk` with clean domain terms matching the business catalogue.
- **Safety**: Nullable field addition (`SalesType?`). Existing `allowIndividualSale` boolean is synchronized automatically (`allowIndividualSale = (salesType == individual)`).

### 3.3 Cached `wholesalePrice` and `buyingPrice` (GAP-03 — Optional)
- **Why**: Avoids joining 3 tables (`Product` -> `ProductPackaging` -> `ProductPrice`) for simple catalog browsing queries.
- **Benefit**: Dramatically simplifies storefront & admin catalogue listing API handlers. `ProductPrice` table remains the authoritative historical price ledger.
- **Safety**: Nullable decimal fields (`Decimal(14, 2)`).

---

## 4. Migration Safety & Zero Data Loss Plan

Should the project owner approve these proposed changes for Phase 3B:

1. **Non-Destructive Migration**: All proposed fields (`sourceKey`, `salesType`, `wholesalePrice`, `buyingPrice`) are nullable additions (`?`).
2. **Zero Table Recreation**: PostgreSQL executes `ALTER TABLE products ADD COLUMN ...` instantaneously without locking or recreating tables.
3. **Rollback Safety**: Every proposed change can be cleanly reverted via standard down-migration script without losing existing production data.
4. **No Destructive Commands**: Commands such as `prisma db push --force-reset` or `prisma migrate reset` are strictly prohibited.

---

## 5. Owner Approval Checklist

Before proceeding to Phase 3B (Importer Development):

- [ ] **Approval Item 1**: Approve addition of `sourceKey String? @unique` to `Product`.
- [ ] **Approval Item 2**: Approve addition of `SalesType` enum (`wholesale`, `individual`) and `salesType` field to `Product`.
- [ ] **Approval Item 3**: Approve optional cached price fields (`wholesalePrice`, `buyingPrice` Decimal(14,2)) on `Product`.
- [ ] **Approval Item 4**: Authorize creation of Phase 3B Prisma migration script (`20260730_catalogue_import_fields`).

---

## 6. Next Steps

Upon owner review and approval:
1. Apply proposed additions to `packages/db/prisma/schema.prisma`.
2. Generate migration via `npx prisma migrate dev --name catalogue_import_fields`.
3. Proceed to **Phase 3B: Importer Development & Dry-Run Verification**.
