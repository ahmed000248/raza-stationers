# Phase 3C Fresh Database Certification

This document certifies the successful validation, dry-run, canonical import, reconciliation, and idempotency verification of the product catalogue database for Raza Stationers.

## 1. Import Metadata

- **Certified Workbook Path**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`
- **Certified Workbook SHA-256 Hash**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **Production Database Host**: `aws-1-ap-south-1.pooler.supabase.com`
- **Supabase Project ID**: `pqlmgqzpjjllhgalyhwz`
- **Database Name**: `postgres`
- **Certified Plan Checksum**: `09e14bcc6fde57e2f1f9545909b9437046f1cf677740d80c19d677cdf06823f2`
- **Certified Date**: 2026-07-31

---

## 2. Ingestion Summary & Target Totals

The canonical import completed successfully with the following target totals:

| Entity Type | Target Count | Database Verified Count | Status |
| :--- | :--- | :--- | :--- |
| **Total Products** | 2,167 | 2,167 | ✅ Verified |
| **Wholesale (Bulk) Products** | 2,097 | 2,097 | ✅ Verified |
| **Individual Products** | 70 | 70 | ✅ Verified |
| **Unique Categories** | 103 | 103 | ✅ Verified |
| **Base Packaging Records** | 2,167 | 2,167 | ✅ Verified |
| **Prices (Wholesale & Buying)** | 4,334 | 4,334 | ✅ Verified |
| **Source Record Mappings** | 2,167 | 2,167 | ✅ Verified |
| **Imported Rows (Logs)** | 2,167 | 2,167 | ✅ Verified |

---

## 3. Database Reconciliation Proofs

Below are the raw query outputs from the production database verifying table counts and classifications.

### Count Check Query:
```sql
SELECT 
  (SELECT COUNT(*) FROM products) AS products, 
  (SELECT COUNT(*) FROM product_packaging) AS packaging, 
  (SELECT COUNT(*) FROM product_prices) AS prices, 
  (SELECT COUNT(*) FROM source_record_mappings) AS mappings, 
  (SELECT COUNT(*) FROM import_rows) AS import_rows, 
  (SELECT COUNT(*) FROM import_batches) AS batches, 
  (SELECT COUNT(*) FROM categories) AS categories;
```

**Result:**
```
 products | packaging | prices | mappings | import_rows | batches | categories 
----------+-----------+--------+----------+-------------+---------+------------
     2167 |      2167 |   4334 |     2167 |        2167 |       1 |        103
```

### Classification Check Query:
```sql
SELECT purchase_type, COUNT(*) FROM products GROUP BY purchase_type;
```

**Result:**
```
 purchase_type | count 
---------------+-------
 individual    |    70
 bulk          |  2097
```

---

## 4. Idempotency Verification

The import API's same-file retry idempotency was tested on production. Executing the same payload with the identical planChecksum yielded a clean `alreadyCommitted: true` response without making any database modifications:

```json
{
  "batchId": "09e14bcc6fde57e2f1f9545909b9437046f1cf677740d80c19d677cdf06823f2",
  "sha256": "7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b",
  "dryRun": false,
  "committed": true,
  "alreadyCommitted": true,
  "createdCounts": {
    "categories": 0,
    "products": 0,
    "packaging": 0,
    "prices": 0,
    "sourceMappings": 0,
    "rows": 0,
    "issues": 0
  }
}
```

---

## 5. Integration Test Results

All 16 assertions of the integration test suite (`tests/importer/test_importer_hardened.mjs`) were successfully verified on the `raza_stationers_test_2` database:

1. **Authorization Matrix**: Verified 401/403 status codes for unauthenticated, ordinary user, owner, and inactive admin, and 201 for active admin.
2. **Format/Rejection Checks**: Verified rejection of non-XLSX file format and changed workbook (modified content / invalid signature hash).
3. **Dry-Run Zero-Write Proof**: Confirmed that executing the plan generation step makes zero modifications to database counts.
4. **Plan Integrity**: Mismatched planChecksum gets rejected with controlled 400.
5. **Stale Database-State Rejection**: Verified that database modifications after plan generation trigger stale rejection.
6. **Idempotency (Sequential/Concurrent)**: Confirmed sequential and concurrent duplicate commits do not duplicate records.
7. **Price Timeline Rules**: Verified that updating a product's price correctly updates the active timeline (sets `effectiveTo = now` on old price, inserts new active price).
8. **Forced Rollback**: mid-transaction failure rolls back all database modifications cleanly.

---

## 6. Sign-off and Certification

We certify that the Phase 3C catalog import is complete, verified, and stabilized. The database is populated correctly and the transaction latency issue on WAN has been resolved through batch SQL operations.

**Lead Engineer**: AI pair programmer
**Status**: Certified
