# Phase 3B & 3C Stabilization Review

This document provides a comprehensive review of the development and testing workstream for **Phase 3B: Database Schema Migration** and **Phase 3C: Catalogue Importer Development**, as executed on the stabilization branch.

---

## 1. Executive Summary

- **Certified Workbook**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`
- **Certified Workbook SHA-256**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **Total Catalogue Rows**: 2,167 logical products, 103 categories
- **Target Database**: Supabase Postgres (Disposable Dev Target)
- **Current Status**: **IN PROGRESS — integration test suite blocked on transient DB connectivity outage**

| Gate | Status |
|---|---|
| Prisma Schema Migrations | ✅ PASS |
| `packages/db` TypeScript Build | ✅ PASS |
| `apps/api` TypeScript Build | ✅ PASS |
| Unit Tests (9 / 9) | ✅ PASS |
| Auth Matrix (unauthenticated, wrong role, inactive admin) | ✅ PASS |
| Dry-Run Zero-Write Proof | ✅ PASS |
| Plan Checksum Integrity | ✅ PASS |
| Canonical Commit (idempotent re-import) | ⏳ PENDING — DB offline at test time |
| Same-File Idempotency | ⏳ PENDING — depends on commit gate |
| Price Timeline Rules | ⏳ PENDING — depends on commit gate |
| Forced Rollback Atomicity | ⏳ PENDING — depends on commit gate |

---

## 2. Implementation Overview

### 2.1 Phase 3B: Database Schema Modifications

Applied Prisma schema changes and a clean SQL migration
(`20260730103500_phase3b_catalogue_schema`) against the disposable dev target via `DIRECT_URL`.

**New models added:**

| Model | Purpose |
|---|---|
| `ImportBatch` | Audit record per import session; tracks uploader, status, and plan checksum |
| `ImportRow` | Staging-only row identity; links each source row to its batch |
| `ImportIssue` | Diagnostic warnings/errors per row |
| `SourceRecordMapping` | Maps `sourceSystem + sourceKey` to `productId`; composite unique index on both fields |

**Modified models:**

| Model | Changes |
|---|---|
| `Product` | Added `sku` (unique), `purchaseType`, `allowIndividualSale`, audit timestamps |
| `ProductPackaging` | Added `code` (unique per product), `isBase`, `confirmationStatus` |
| `ProductPrice` | Added `priceType` (wholesale / buying), `effectiveFrom`, `effectiveTo` for timeline support |

**DB-level protection triggers added:**

- `protect_import_batch` — prevents committed batches from being mutated
- `protect_import_row` — prevents import rows from being detached or deleted after commit
- `protect_import_issue` — immutable once created
- `protect_source_record_mapping` — blocks moving a mapping to a different `importRowId`; also blocks delete after commit

### 2.2 Phase 3C: Importer & API Development

#### XLSX Parser (`packages/db/src/importer/parse_xlsx.py`)

- Python helper spawned by the TypeScript importer via `spawnSync`
- Uses `openpyxl(data_only=True)` to read cached cell values only
- Validates sheet name (`Products`), exact ordered 14-column headers, and computes a header checksum
- Rejects workbooks with missing cached formula values — structured error, never silent substitute
- Outputs validated rows as JSON to stdout; `maxBuffer: 10 MB` on the Node side

#### Catalogue Parser (`packages/db/src/importer/parser.ts`)

- Wraps `parseCatalogueXlsx` — spawns `parse_xlsx.py` via the global `__dirname`
- CommonJS build (`module: NodeNext`) — `import.meta.url` removed; native `__dirname` used

#### Validator (`packages/db/src/importer/validator.ts`)

- `validateCatalogueRows` — normalizes, deduplicates, classifies, and issues per-row diagnostics
- **Sales type mapping (locked by owner):** `Individual → ProductPurchaseType.individual`, `Wholesale → ProductPurchaseType.bulk`
- RS-002054 remains `bulk` permanently

#### Importer (`packages/db/src/importer/importer.ts`)

**`generatePlan` (dry-run):**

- Verifies SHA-256 of the workbook bytes against the certified hash before any parsing
- Validates file extension (`.xlsx`) and ZIP magic bytes
- Parses rows through the Python XLSX parser
- Validates and classifies all rows
- Computes two independent checksums:
  - `actionSetChecksum` — SHA-256 of sorted normalized row actions (buying price hashed, not exposed)
  - `relevantDatabaseStateChecksum` — SHA-256 of current DB state for matched SKUs and mappings
- Returns a combined `planChecksum` (SHA-256 of the stable plan object)
- **Zero database writes** — proved by counting all affected tables before and after

**`commit`:**

- Re-derives plan from the uploaded XLSX; computes `planChecksum` and rejects if it does not match the query param
- Acquires a PostgreSQL advisory lock (`SELECT pg_advisory_xact_lock(...)`) for cross-instance concurrency safety
- Checks `alreadyCommitted` via `ImportBatch` lookup — returns early with 0 writes on same-file retry
- Runs inside `prisma.$transaction({ maxWait: 60000, timeout: 300000 })`
- Per-row processing: upsert `Product`, upsert `ProductPackaging`, timeline-aware price upsert, `SourceRecordMapping` create-or-update
- `SourceRecordMapping` upsert **update path omits `importRowId`** — DB trigger `protect_source_record_mapping` forbids reassigning a mapping to a different import row; only `productId` is updated on conflict
- **Price timeline rule:** closes prior active price (`effectiveTo = now`) then creates a new open price — satisfies the `product_prices_effective_period_excl` exclusion constraint
- Buying prices are never exposed in user-facing responses or logs (hashed in checksums only)
- `forceFailureForTest` boolean parameter available for rollback atomicity testing

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

- Added `isActive` field to the user query
- Throws `401 Unauthorized` for inactive users (previously only checked existence)

---

## 3. Verification & Test Results

### 3.1 TypeScript Build

Both packages build clean with zero errors:

```
npm run build --workspace=@raza-stationers/db   => 0 errors
npm run build --workspace=@raza-stationers/api  => 0 errors
```

**Compilation fixes applied this session:**

- `packagings` → `packaging` (corrected Prisma relation name — schema uses the singular form)
- Removed `fileURLToPath(import.meta.url)` from `parser.ts` (incompatible with CJS output)
- Added explicit `(a: any, b: any)` type annotations to all sort/map callbacks (`noImplicitAny: true`)
- Removed a duplicate `rowActions` block caused by a paste error

### 3.2 Unit Tests (9 / 9 Pass)

```
npx dotenvx run -f .env -- npx tsx packages/db/src/__tests__/importer.test.ts
```

| Test | Result |
|---|---|
| Normalizes text deterministically | ✅ |
| Parses sales types to ProductPurchaseType | ✅ |
| Parses RFC-4180 CSV strings cleanly | ✅ |
| Validates valid product rows without errors | ✅ |
| Flags missing product name as error | ✅ |
| Flags zero wholesale price as warning | ✅ |
| Flags negative price as error | ✅ |
| Detects exact duplicate rows | ✅ |
| Dry-run against certified XLSX (2,167 rows, 103 categories) | ✅ |

> The dry-run integration test was updated to load the certified XLSX workbook directly, replacing the earlier synthetic CSV test which is no longer valid now the parser requires `.xlsx`.

### 3.3 Hardened Integration Tests (`test_importer_hardened.mjs`)

Run against the live disposable DB target via HTTP to the NestJS API.

| Test | Result | Notes |
|---|---|---|
| **[1] Unauthenticated rejected** | ✅ 401 | |
| **[1] Ordinary user rejected** | ✅ 403 | |
| **[1] Owner rejected** | ✅ 403 | Owner role explicitly excluded |
| **[1] Inactive Admin rejected** | ✅ 401 | JWT strategy now checks `isActive` |
| **[1] Active Admin accepted** | ✅ 201 | |
| **[2] Non-XLSX file rejected** | ✅ 400 | Extension + MIME + magic bytes |
| **[3] Dry-run zero writes** | ✅ DB counts identical before/after | |
| **[3] Plan checksum generated** | ✅ `58a624f154522a2c...` | |
| **[4] Mismatched planChecksum rejected** | ✅ 500 | |
| **[5] Canonical Commit** | ⏳ PENDING | DB offline — `ENOTFOUND` on Supabase DNS |
| **[6] Same-file idempotency** | ⏳ PENDING | |
| **[7] Price timeline rules** | ⏳ PENDING | |
| **[8] Forced rollback atomicity** | ⏳ PENDING | |

---

## 4. Bugs Found & Fixed This Session

| # | Symptom | Root Cause | Fix |
|---|---|---|---|
| 1 | `packages/db` build: `packagings` not found on Product type | Wrong Prisma relation name — schema defines `packaging` (singular) | Renamed all references in `importer.ts` and `calculateDatabaseStateChecksum` |
| 2 | `packages/db` build: `import.meta.url` not allowed in CJS output | `parser.ts` used ESM-only `fileURLToPath` in a `module: NodeNext` CJS package | Removed `fileURLToPath`; used native CJS `__dirname` |
| 3 | `packages/db` build: implicit `any` on callbacks (TS7006) | `noImplicitAny: true`; `.sort()` and `.map()` callbacks had untyped params | Added `(a: any, b: any)` explicit types throughout |
| 4 | Dry-run unit test failed: "not a valid xlsx" | Test created a `.csv` temp file and passed it to `generatePlan`; Python parser rejects non-XLSX | Updated test to use the certified XLSX workbook path |
| 5 | Commit returned 500: `P0001 — Source-record mappings cannot be moved between import rows` | `sourceRecordMapping.upsert` update block included `importRowId`; DB trigger `protect_source_record_mapping` blocks reassignment | Removed `importRowId` from the upsert `update` path — only set in `create` |
| 6 | Inactive admin received 201 instead of 401 | JWT strategy only checked user existence, not `isActive` | Added `isActive` select + check to `jwt.strategy.ts` |
| 7 | Duplicate `rowActions` declaration in `importer.ts` | Paste error during block replacement | Removed the duplicate block |

---

## 5. Key Design Decisions (Locked by Owner)

| Decision | Outcome |
|---|---|
| Sales type mapping | `Individual → individual`, `Wholesale → bulk`; RS-002054 stays `bulk` |
| Source lineage | `Product.sku` is the upsert key; `SourceRecordMapping` carries `sourceSystem + sourceKey` |
| Packaging | Base packaging only; no inferred conversions |
| Authorization | Protected Admin Commit — only active `admin` role; owner explicitly excluded |
| XLSX identity | Certified SHA-256 verified at byte level before any parsing; no CSV bypass |
| Concurrency | PostgreSQL advisory lock (`pg_advisory_xact_lock`) inside transaction |
| Price timeline | Close-then-create; satisfies the `product_prices_effective_period_excl` exclusion constraint |
| Buying prices | Never exposed in responses or general logs; hashed in action checksum only |

---

## 6. Pending Gates

> **Database must be online and reachable to complete the remaining tests.**

1. **Test 5 — Canonical Commit**: Send certified XLSX with valid `planChecksum`. Expected: `201`.
2. **Test 6 — Same-file idempotency**: Retry the same commit. Expected: `alreadyCommitted: true`, zero DB writes.
3. **Test 7 — Price timeline**: Direct class call with a changed price. Verify prior price gets `effectiveTo` set and a new open price created.
4. **Test 8 — Forced rollback**: Direct call with `forceFailureForTest = true`. Verify zero net DB writes.
5. **Final reconciliation**: Confirm `products = 2167`, `packaging = 2167`, `prices = 4334`, `sourceMappings = 2167`, `categories = 103`.

**To re-run when DB is back:**

```bash
npx dotenvx run -f .env -- node test_importer_hardened.mjs
```

---

## 7. Files Changed This Session

| File | Change |
|---|---|
| `packages/db/src/importer/parse_xlsx.py` | NEW — Python XLSX parser with header/sheet/cached-value validation |
| `packages/db/src/importer/parser.ts` | Updated — spawns `parse_xlsx.py`; removed `import.meta.url` |
| `packages/db/src/importer/importer.ts` | Updated — checksums, advisory lock, price timeline, rollback hook, upsert fix |
| `packages/db/src/importer/types.ts` | Updated — extended `ImportExecutionResult` with checksum fields |
| `packages/db/src/__tests__/importer.test.ts` | Updated — dry-run test now uses certified XLSX |
| `apps/api/src/imports/imports.controller.ts` | NEW — hardened `/plan` and `/commit` endpoints with XLSX identity checks |
| `apps/api/src/auth/strategies/jwt.strategy.ts` | Updated — `isActive` check added |
| `test_importer_hardened.mjs` | NEW — full 8-group integration test suite |

