# Raza Stationers — Product Catalogue Import Pipeline

**Document:** `catalogue-import-pipeline.md`  
**Package:** `@raza-stationers/db`  
**Status:** Completed & Validated (Database Phase 7)  

---

## 1. Overview

The Product Catalogue Import Pipeline processes wholesale catalogue data, validates rows, normalizes categories and product names, flags issues, and imports records into the Raza Stationers PostgreSQL database on Supabase.

It enforces strict idempotency, safe dry-run modes, PostgreSQL sequence-based SKU allocation (`RS-XXXXXX`), and physical constraint compliance.

---

## 2. Input Specifications

- **Format:** CSV (RFC-4180 compliant)
- **Supported Headers:** `Item Name` / `Product Name`, `Category`, `Sales Type`, `Wholesale Price`
- **Supported Encodings:** UTF-8

### Field Mapping Rules

1. **Product Name:** Original business name preserved in `Product.name`.
2. **Category:** Normalized & linked to flat `Category` model. `Category.slug` is deterministically generated.
3. **Sales Type:** Mapped to `ProductPurchaseType` (`both`, `bulk`, `individual`, `unconfirmed`).
4. **Wholesale Price:** Decimal PKR stored in `ProductPrice.amount` (`priceType: wholesale`). Prices equal to 0 or missing are flagged as warning issues (`ZERO_WHOLESALE_PRICE` / `MISSING_WHOLESALE_PRICE`) and not inserted into `product_prices` per database check constraint `product_prices_amount_positive_check`.
5. **Product Status:** Staged initially as `pending_review`.
6. **SKU Allocation:** Generated sequentially via PostgreSQL `public.allocate_product_sku()` (`RS-XXXXXX`).

---

## 3. CLI Operator Commands

### Dry Run (Read-Only Safety Mode)

Performs full parsing, validation, duplicate detection, and summary reporting without writing to the database:

```bash
npx tsx packages/db/src/importer/cli.ts --source .codex-phase7-tmp/catalogue-products.csv --dry-run
```

### Commit Mode (Database Writes)

Performs full import, inserts records into `import_batches`, `import_rows`, `import_issues`, `categories`, `products`, `product_packaging`, `product_prices`, and `source_record_mappings`:

```bash
npx tsx packages/db/src/importer/cli.ts --source .codex-phase7-tmp/catalogue-products.csv --commit
```

---

## 4. Idempotency & Error Review

- **SHA-256 Hashing:** Every source file is hashed. Attempting to rerun an already committed source hash returns `Already Committed: YES` with zero duplicate record creation.
- **Audit Logging:** Every warning and error issue is logged to `import_issues`.
- **Draft Approval:** Imported products are set to `pending_review` status awaiting business owner review before live storefront activation.
