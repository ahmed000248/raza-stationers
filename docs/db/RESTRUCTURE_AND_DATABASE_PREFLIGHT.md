# Restructuring and Database Preflight Report

This report documents the structural cleanup of the Raza Stationers monorepo and the preflight verification checks performed on the new Supabase PostgreSQL database.

---

## 1. Original Repository State

*   **Branch**: `phase-3b-3c-catalogue-import`
*   **Commit SHA**: `17ea2b0f738a86822b816b9f33882ed813ae1d7d`
*   **Dirty Files**: Modified files existed in `apps/api/src/imports/imports.controller.ts`, `packages/db/dist/importer/importer.d.ts`, `packages/db/dist/importer/importer.js`, `packages/db/src/__tests__/importer.test.ts`, `packages/db/src/importer/importer.ts`, and `test_importer_hardened.mjs`.
*   **Clutter**: The root folder contained 22 diagnostic, staging, test, and placeholder scripts/files, making it difficult to differentiate production application boundaries from temporary developer assets.
*   **Duplicate Configuration**: A boilerplate `prisma/schema.prisma` file existed in the root, duplicating the active schema defined in `packages/db/prisma/schema.prisma`.

---

## 2. Target Project Structure

The codebase is organized into clean boundaries:
*   `apps/`: User-facing storefront, admin, and backend API applications.
*   `packages/`: Shared libraries and the database layer (Prisma models, migrations).
*   `scripts/`: Developers' scripts categorized by functional domain (catalogue, database, development, diagnostics).
*   `tests/`: Test suites categorized by testing levels (integration, database, importer).
*   `data/`: Authoritative certified catalogue master files.
*   `docs/`: Historical audit, review, and baseline documentation.

---

## 3. Restructuring Activity Log

### Moves

| Original Path | New Path | Reason | References Updated |
| :--- | :--- | :--- | :--- |
| `audit_contamination.mjs` | `scripts/diagnostics/audit_contamination.mjs` | Group diagnostics script. | None |
| `check_84_cat_fk.mjs` | `scripts/diagnostics/check_84_cat_fk.mjs` | Group category check script. | None |
| `check_cat_counts.mjs` | `scripts/diagnostics/check_cat_counts.mjs` | Group count check script. | None |
| `check_extra_cat_in_db.mjs` | `scripts/diagnostics/check_extra_cat_in_db.mjs` | Group category check script. | None |
| `check_xlsx_categories.mjs` | `scripts/diagnostics/check_xlsx_categories.mjs` | Group category check script. | Relative import updated to `../../packages/db/src/importer/parser.js` |
| `debug_104_cats.mjs` | `scripts/diagnostics/debug_104_cats.mjs` | Group diagnostics script. | None |
| `inspect_batches_detailed.mjs` | `scripts/diagnostics/inspect_batches_detailed.mjs` | Group diagnostics script. | None |
| `inspect_categories_detailed.mjs` | `scripts/diagnostics/inspect_categories_detailed.mjs` | Group category check script. | None |
| `inspect_constraints.cjs` | `scripts/diagnostics/inspect_constraints.cjs` | Group constraint check script. | None |
| `inspect_counts.mjs` | `scripts/diagnostics/inspect_counts.mjs` | Group reconciliation script. | None |
| `inspect_db_triggers.mjs` | `scripts/diagnostics/inspect_db_triggers.mjs` | Group trigger check script. | None |
| `inspect_mappings_detailed.mjs` | `scripts/diagnostics/inspect_mappings_detailed.mjs` | Group mapping check script. | None |
| `inspect_prices_detailed.mjs` | `scripts/diagnostics/inspect_prices_detailed.mjs` | Group pricing check script. | None |
| `inventory_db.mjs` | `scripts/diagnostics/inventory_db.mjs` | Group diagnostics script. | None |
| `test_readonly_conn.mjs` | `scripts/diagnostics/test_readonly_conn.mjs` | Group connection test script. | None |
| `proposed_cleanup_transaction.mjs` | `scripts/database/proposed_cleanup_transaction.mjs` | Group transaction staging script. | None |
| `seed_test_admin.mjs` | `scripts/database/seed_test_admin.mjs` | Group database helper script. | None |
| `wipe_db.mjs` | `scripts/database/wipe_db.mjs` | Group database helper script. | None |
| `get_admin.mjs` | `scripts/development/get_admin.mjs` | Group developer script. | Relative imports updated to `../../node_modules/...` |
| `build_database.py` | `scripts/catalogue/build_database.py` | Group catalogue generator. | None |
| `test_admin_endpoint.mjs` | `tests/integration/test_admin_endpoint.mjs` | Group integration test script. | None |
| `test_disposable_db_real.mjs` | `tests/database/test_disposable_db_real.mjs` | Group database testing script. | None |
| `test_importer_hardened.mjs` | `tests/importer/test_importer_hardened.mjs` | Group importer test script. | Quarantined; database-writing integration test |

### Deletions

| Deleted Path | Tracked/Untracked | Proof It Was Disposable | Recoverability |
| :--- | :--- | :--- | :--- |
| `prisma/schema.prisma` | Tracked | Duplicate schema definition file. Boilerplate placeholder with only dummy content. Core configuration redirects to `packages/db/prisma/schema.prisma`. | Fully recoverable via git |
| `~$RS-Database-Updated-v2.xlsx` | Tracked | Temporary Excel owner/lock file. Accidentally committed during workbook edits. | Fully recoverable via git |

### Preserved Uncertain Files

| Path | Why It Looks Obsolete | Why It Was Preserved | Required Decision |
| :--- | :--- | :--- | :--- |
| `data/final/corrupt-signature-test.xlsx` | Untracked test file. | Holds Excel mock testing fixture with invalid signature to check import validation. | Keep for future regression test suite. |

---

## 4. Verification Results

Only database-independent project verification checks were executed:

| Check | Command | Database Access | Result |
| :--- | :--- | :--- | :--- |
| **Prisma Schema Validation** | `npm run db:validate` | No | **SUCCESS** (Schema is valid 🚀) |
| **Prisma Client Generation** | `npm run db:generate` | No | **SUCCESS** (Generated Prisma Client successfully) |
| **TypeScript Type-Checking** | `npm run typecheck` | No | **SUCCESS** (0 errors across all workspaces) |
| **ESLint Checks** | `npm run lint` | No | **SUCCESS** (Passed with 0 errors, 71 warnings) |

---

## 5. New Database Configuration Map

The environment variables were audited without exposing passwords or keys:

*   **DATABASE_URL**: Exists exactly once in `.env`. Host resolves to `aws-1-ap-south-1.pooler.supabase.com`, Port: `6543`, DB Name: `postgres`. Points to Supabase project ref `pqlmgqzpjjllhgalyhwz`.
*   **DIRECT_URL**: Exists exactly once in `.env`. Host resolves to `aws-1-ap-south-1.pooler.supabase.com`, Port: `5432`, DB Name: `postgres`. Points to Supabase project ref `pqlmgqzpjjllhgalyhwz`.
*   **Old Project Reference Absence**: Neither active URL contains the former project ref `xkmvdkdpycmhxkpeeoji`.
*   **Configuration Safety**: No production connection exists. Direct and transaction-pooled connection strings are correctly mapped to their respective variables.

---

## 6. Database Connectivity & Empty Baseline Verification

Harmless read-only connection checks were executed against the new database:

| Connection | Sanitized Target | DNS | TCP | TLS | Authentication | Query | Expected New Project |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DATABASE_URL** | `aws-1-ap-south-1.pooler.supabase.com:6543` | SUCCESS | SUCCESS | SUCCESS | SUCCESS | SUCCESS | **YES** (`pqlmgqzpjjllhgalyhwz`) |
| **DIRECT_URL** | `aws-1-ap-south-1.pooler.supabase.com:5432` | SUCCESS | SUCCESS | SUCCESS | SUCCESS | SUCCESS | **YES** (`pqlmgqzpjjllhgalyhwz`) |

### Empty Baseline Inspection:
*   **App-owned tables in public schema**: **0**
*   **Catalogue business records**: **0**
*   **Result**: The database is completely clean, contains no tables, and is ready for schema migrations.

---

## 7. Stale Database References

A search was performed across all project files:
*   **Former Supabase project reference (`xkmvdkdpycmhxkpeeoji`)**: Found only in historical documentation (`deepseek-full-audit-and-remediation-report-v0.1.md` and `phase-0-baseline.md`). No active configurations or source files contain the old reference.
*   **Bypassed TLS Certificate Verification**: Historical development/test scripts disabled certificate validation for pooler connections. This is now prohibited; remote connections require the approved CA and hostname verification.

---

## 8. Next Recommended Database Step

1.  Deploy SQL migrations to establish schema tables, functions, and least-privilege security roles:
    ```bash
    npx prisma migrate deploy
    ```
2.  Import the certified master workbook:
    ```bash
    npx tsx packages/db/src/importer/cli.ts import data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx
    ```
