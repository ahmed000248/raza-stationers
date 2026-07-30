# Phase 3B & 3C Stabilization Review

This document provides a comprehensive review of the development and testing workstream for **Phase 3B: Database Schema Migration** and **Phase 3C: Catalogue Importer Development**, as executed on the stabilization branch.

---

## 1. Executive Summary

- **Certified Workbook**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`
- **Certified Workbook SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **Total Catalogue Rows**: 2,167 logical products, 103 categories
- **Target Database**: Supabase Postgres (Disposable Dev Target)
- **Current Status**: **PHASE 3B COMPLETE — PHASE 3C COMPLETE**

| Gate | Status | Notes |
|---|---|---|
| Prisma Schema Migrations | ✅ PASS | Applied successfully |
| `packages/db` TypeScript Build | ✅ PASS | Compiles cleanly |
| `apps/api` TypeScript Build | ✅ PASS | Compiles cleanly |
| Unit Tests (9 / 9) | ✅ PASS | Normalization, sales mapping, duplicates, etc. |
| Auth Matrix | ✅ PASS | Owner explicitly excluded; inactive admin rejected |
| Dry-Run Zero-Write Proof | ✅ PASS | Verified zero database changes |
| Plan Checksum Integrity | ✅ PASS | Returns controlled HTTP 400 Bad Request |
| Canonical Commit (first import) | ✅ PASS | 2,167 products imported atomically |
| Same-File Idempotency | ✅ PASS | Returns `alreadyCommitted: true`, zero DB writes |
| Price Timeline Rules | ✅ PASS | Verified correct close-then-create bounds |
| Forced Rollback Atomicity | ✅ PASS | Transaction rolled back cleanly on force failure |

---

## 2. Implementation Overview

### 2.1 Phase 3B: Database Schema Modifications

Applied Prisma schema changes and a clean SQL migration (`20260730103500_phase3b_catalogue_schema`) against the disposable dev target via `DIRECT_URL`.

**New models added:**

| Model | Purpose |
|---|---|
| `ImportBatch` | Audit record per import session; tracks uploader, status, and plan checksum. Its primary key `id` stores the unique `planChecksum`. |
| `ImportRow` | Staging-only row identity; links each source row to its batch. |
| `ImportIssue` | Diagnostic warnings/errors per row. |
| `SourceRecordMapping` | Maps `sourceSystem + sourceKey` to `productId`; composite unique index on both fields. |

**Modified models:**

| Model | Changes |
|---|---|
| `Product` | Added `sku` (unique), `purchaseType`, `allowIndividualSale`, audit timestamps. |
| `ProductPackaging` | Added `code` (unique per product), `isBase`, `confirmationStatus`. |
| `ProductPrice` | Added `priceType` (wholesale / buying), `effectiveFrom`, `effectiveTo` for timeline support. |

**DB-level protection triggers added:**

- `protect_import_batch` — prevents committed batches from being mutated.
- `protect_import_row` — prevents import rows from being detached or deleted after commit.
- `protect_import_issue` — immutable once created.
- `protect_source_record_mapping` — blocks moving a mapping to a different `importRowId`; also blocks delete after commit.

### 2.2 Phase 3C: Importer & API Development

#### XLSX Parser (`packages/db/src/importer/parse_xlsx.py`)

- Python helper spawned by the TypeScript importer via `spawnSync`.
- Uses `openpyxl(data_only=True)` to read cached cell values only.
- Validates sheet name (`Products`), exact ordered 14-column headers, and computes a header checksum.
- Rejects workbooks with missing cached formula values — structured error, never silent substitute.
- Outputs validated rows as JSON to stdout; `maxBuffer: 10 MB` on the Node side.

#### Catalogue Parser (`packages/db/src/importer/parser.ts`)

- Wraps `parseCatalogueXlsx` — spawns `parse_xlsx.py` via the global `__dirname`.
- CommonJS build (`module: NodeNext`) — `import.meta.url` removed; native `__dirname` used.

#### Validator (`packages/db/src/importer/validator.ts`)

- `validateCatalogueRows` — normalizes, deduplicates, classifies, and issues per-row diagnostics.
- **Sales type mapping (locked by owner):** `Individual → ProductPurchaseType.individual`, `Wholesale → ProductPurchaseType.bulk`.
- RS-002054 remains `bulk` permanently.

#### Importer (`packages/db/src/importer/importer.ts`)

**`generatePlan` (dry-run):**

- Verifies SHA-256 of the workbook bytes against the certified hash before any parsing.
- Checks if the batch is already committed. If found, returns the stored planChecksum.
- Validates file extension (`.xlsx`) and ZIP magic bytes.
- Parses rows through the Python XLSX parser.
- Validates and classifies all rows.
- Computes two independent checksums:
  - `actionSetChecksum` — SHA-256 of sorted normalized row actions (buying price hashed, not exposed).
  - `relevantDatabaseStateChecksum` — SHA-256 of current DB state for matched SKUs and mappings.
- Returns a combined `planChecksum` (SHA-256 of the stable plan object).
- **Zero database writes** — proved by counting all affected tables before and after.

**`commit`:**

- Implements correct transaction flow:
  1. Acquire PostgreSQL transaction advisory lock (`SELECT pg_advisory_xact_lock(...)`).
  2. Check for an existing committed `ImportBatch` for the workbook SHA-256.
  3. If found, verify submitted `planChecksum` matches stored batch ID, then return early (zero writes).
  4. If not found, regenerate the current plan and database state checksum.
  5. Compare submitted `planChecksum` against computed. Throw error on mismatch.
  6. Atomically write batch, row, catalog, prices, and mapping records.
- Runs inside `prisma.$transaction({ maxWait: 60000, timeout: 300000 })`.
- Per-row processing: upsert `Product`, upsert `ProductPackaging`, timeline-aware price upsert, `SourceRecordMapping` create-or-update.
- `SourceRecordMapping` upsert **update path omits `importRowId`** — DB trigger `protect_source_record_mapping` forbids reassigning a mapping to a different import row; only `productId` is updated on conflict.
- **Price timeline rule:** closes prior active price (`effectiveTo = now`) then creates a new open price — satisfies the `product_prices_effective_period_excl` exclusion constraint.
- Buying prices are never exposed in user-facing responses or logs (hashed in checksums only).
- `forceFailureForTest` boolean parameter available for rollback atomicity testing.

#### API Endpoints (`apps/api/src/imports/imports.controller.ts`)

| Endpoint | Method | Guard | Description |
|---|---|---|---|
| `/admin/imports/catalogue/plan` | POST | `admin` only | Dry-run: parse, validate, return plan + checksum |
| `/admin/imports/catalogue/commit` | POST | `admin` only | Commit with `planChecksum` query param |

Both endpoints enforce the same four-layer XLSX identity check:

1. File extension must be `.xlsx`
2. MIME type verified
3. ZIP magic bytes (`PK\x03\x04`) verified
4. SHA-256 of uploaded bytes must match `7cb65d6d...` exactly

#### JWT Strategy (`apps/api/src/auth/strategies/jwt.strategy.ts`)

- Added `isActive` field to the user query.
- Throws `401 Unauthorized` for inactive users (previously only checked existence).

---

## 3. Verification & Test Results

### 3.1 TypeScript Build

Both packages build clean with zero errors:

```bash
npm run build --workspace=@raza-stationers/db
npm run build --workspace=@raza-stationers/api-server
```

### 3.2 Unit Tests (9 / 9 Pass)

```bash
npx dotenvx run -f .env -- npx tsx packages/db/src/__tests__/importer.test.ts
```

| Test | Result |
|---|---|
| Normalizes text deterministically | ✅ PASS |
| Parses sales types to ProductPurchaseType | ✅ PASS |
| Parses RFC-4180 CSV strings cleanly | ✅ PASS |
| Validates valid product rows without errors | ✅ PASS |
| Flags missing product name as error | ✅ PASS |
| Flags zero wholesale price as warning | ✅ PASS |
| Flags negative price as error | ✅ PASS |
| Detects exact duplicate rows | ✅ PASS |
| Dry-run against certified XLSX (2,167 rows, 103 categories) | ✅ PASS |

### 3.3 Hardened Integration Tests (`test_importer_hardened.mjs`)

Run against the live disposable DB target via HTTP and direct class calls.

```bash
npx dotenvx run -f .env -- node test_importer_hardened.mjs
```

| Test Group | Result | Notes |
|---|---|---|
| **[1] Authorization Matrix** | ✅ PASS | Unauthenticated, ordinary user, owner, and inactive admin rejected. Active admin allowed. |
| **[2] Workbook Validation** | ✅ PASS | Non-XLSX formats rejected (400) |
| **[3] Dry-Run Zero-Write** | ✅ PASS | Counts are identical before and after. |
| **[4] Checksum Validation** | ✅ PASS | Invalid planChecksum rejected with controlled HTTP 400 Bad Request. |
| **[5] Canonical Commit** | ✅ PASS | Certified XLSX committed successfully. |
| **[6] Same-File Idempotency** | ✅ PASS | Retry returns `alreadyCommitted: true` and makes 0 writes to the database. |
| **[7] Price Timeline Rules** | ✅ PASS | Direct price change closes active price timeline and starts new open price cleanly. |
| **[8] Forced Rollback** | ✅ PASS | Transaction rollbacks cleanly on failure, leaving 0 database changes. |

---

## 4. Bugs Found & Fixed This Session

| # | Symptom | Root Cause | Fix |
|---|---|---|---|
| 1 | `packages/db` build: `packagings` not found on Product type | Wrong Prisma relation name — schema defines `packaging` (singular) | Renamed all references in `importer.ts` and `calculateDatabaseStateChecksum` |
| 2 | `packages/db` build: `import.meta.url` not allowed in CJS output | `parser.ts` used ESM-only `fileURLToPath` in CJS package | Removed `fileURLToPath`; used CJS `__dirname` |
| 3 | `packages/db` build: implicit `any` on callbacks (TS7006) | `noImplicitAny: true`; `.sort()` and `.map()` callbacks had untyped params | Added `(a: any, b: any)` explicit types throughout |
| 4 | Dry-run unit test failed: "not a valid xlsx" | Test created a `.csv` temp file and passed it to `generatePlan` | Updated test to use the certified XLSX workbook path |
| 5 | Commit returned 500: `P0001 — Source-record mappings cannot be moved between import rows` | `sourceRecordMapping.upsert` update block included `importRowId` | Removed `importRowId` from the upsert `update` path |
| 6 | Inactive admin received 201 instead of 401 | JWT strategy only checked user existence, not `isActive` | Added `isActive` check to `jwt.strategy.ts` |
| 7 | Duplicate `rowActions` declaration in `importer.ts` | Paste error during block replacement | Removed the duplicate block |
| 8 | Test 5 returned HTTP 500 checksum mismatch on retry | Checksum calculated against populated DB before checking `alreadyCommitted` | Reordered transaction flow to check `alreadyCommitted` first using advisory lock |
| 9 | Lock ID BigInt conversion failed for mock SHA strings | BigInt conversion failed on non-hex characters in mock SHA strings | Added hex check and fallback hash to ensure valid hex substring |
| 10 | Concurrency lock failed with Postgres numeric range error | Substring length of 16 hex chars can exceed signed 64-bit BigInt range | Limited `lockIdHex` substring to 15 characters, guaranteeing safe range |
| 11 | Commit batch creation failed with constraint check 23514 | `import_batches_sha256_check` constraint rejects mock non-64 hex SHAs | Normalize test SHA strings to valid 64-character lowercase SHA hashes |

---

## 5. Key Design Decisions (Locked by Owner)

| Decision | Outcome |
|---|---|
| Sales type mapping | `Individual → ProductPurchaseType.individual`, `Wholesale → ProductPurchaseType.bulk` |
| Source lineage | `Product.sku` is the authoritative key; `SourceRecordMapping` carries `sourceSystem + sourceKey` |
| Packaging | Base packaging only; no inferred conversions |
| Authorization | Protected Admin Commit — only active `admin` role; owner explicitly excluded |
| XLSX identity | Certified SHA-256 verified at byte level before any parsing; no CSV bypass |
| Concurrency | PostgreSQL advisory lock (`pg_advisory_xact_lock`) inside transaction |
| Price timeline | Close-then-create; satisfies the `product_prices_effective_period_excl` exclusion constraint |
| Buying prices | Never exposed in responses or general logs; hashed in action checksum only |

---

## 6. Final Reconciliation

The following database state has been verified after executing the complete catalogue import workstream:

- **Products**: 2,167 (All matched)
- **Base packagings**: 2,167 (All matched)
- **Source mappings**: 2,167 (from canonical catalogue) + 3 (from mock price timeline test rows)
- **Buying prices**: 2,167 (initial canonical) + 1 (from price timeline test)
- **Wholesale prices**: 2,167 (initial canonical) + 3 (from price timeline test)
- **Categories**: 103 (canonical) + seeded database categories
- **Import rows**: 2,167 (from canonical commit) + retry logs
- **Import issues**: 0 (no validation errors logged for canonical commit)
- **Import batches grouped by status**:
  - `committed`: 6 (canonical workbook commit + unit test committed runs)
  - `committing`: 3 (stuck from early crashes before advisory lock transaction hardening)
  - `failed`: 7 (rejected/rolled-back test runs)
- **Products grouped by lifecycle status**:
  - `pending_review`: 2,167
- **activatedAt non-null count**: 0 (zero activated imported products)
- **activatedById non-null count**: 0
- **StockBalance count**: 0 (zero stock balances)
- **StockMovement count**: 0 (zero stock movements)
- **Duplicate SKU groups**: 0 (zero duplicates)
- **Duplicate source-key groups**: 0 (zero duplicates)
- **Overlapping price-period groups**: 0 (zero overlaps)
- **packQuantity <= 0 count**: 0
- **Products without exactly one base packaging**: 0

---

## 7. Files Changed This Session

| File | Change |
|---|---|
| `packages/db/src/importer/parse_xlsx.py` | NEW — Python XLSX parser with header/sheet/cached-value validation |
| `packages/db/src/importer/parser.ts` | Updated — spawns `parse_xlsx.py`; removed `import.meta.url` |
| `packages/db/src/importer/importer.ts` | Updated — checksums, advisory lock, price timeline, rollback hook, upsert fix |
| `packages/db/src/importer/types.ts` | Updated — extended `ImportExecutionResult` with checksum fields |
| `packages/db/src/__tests__/importer.test.ts` | Updated — dry-run test now uses certified XLSX |
| `apps/api/src/imports/imports.controller.ts` | NEW — hardened `/plan` and `/commit` endpoints with XLSX identity checks and exception mappings |
| `apps/api/src/auth/strategies/jwt.strategy.ts` | Updated — `isActive` check added |
| `test_importer_hardened.mjs` | NEW — full 8-group integration test suite |
