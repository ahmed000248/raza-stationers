# Raza Stationers — Product Data, DeepSeek Implementation, Database, Backend, and Frontend Verification

## Instruction to the implementing/review agent

You are the senior software architect, database engineer, data-quality analyst, backend reviewer, frontend integration tester, security reviewer, and remediation engineer for the Raza Stationers project.

You have access to:

- The complete Raza Stationers repository and Git history.
- All project documentation.
- All product-related PDF, Excel, CSV, and generated reconciliation files.
- The authorized Supabase **development** project.
- The local development environment and its configured secrets.

Your mission is to:

1. Independently verify every product-bearing PDF and spreadsheet.
2. Reconcile the source files with one another and with the Supabase development database.
3. Audit every material claim in DeepSeek’s `summary.md`.
4. Audit the Prisma schema, migrations, catalogue importer, database records, NestJS backend, customer website, and admin frontend.
5. Safely fix confirmed defects and improve incomplete or fragile implementation.
6. Re-run all relevant validation and behavioral tests.
7. Produce a detailed, evidence-backed review report.

Do not trust a prior agent’s summary merely because code, commits, migrations, endpoints, or database rows exist. Treat every claim as unverified until you reproduce or inspect the supporting evidence.

---

## 1. Mandatory opening response

Start with this short acknowledgement:

> I have read the full audit and remediation instructions. I will first inventory the repository, product sources, Git history, migrations, and authorized Supabase development database. I will preserve raw evidence, verify DeepSeek’s claims independently, remediate only confirmed issues, and finish with an evidence-backed report.

Keep later chat updates concise. Put the complete findings in the required report file instead of flooding the chat.

---

## 2. Project context that must be preserved

Raza Stationers is a confidential wholesale and retail stationery system for a real family business built over approximately 30 years. The project is currently a development/demo system and must not disrupt the existing business.

The intended architecture is a modular monolith:

- Customer website: Next.js, React, TypeScript, Tailwind.
- Admin panel: Next.js, React, TypeScript, Tailwind.
- Mobile application: React Native/Expo, currently future work or scaffold only.
- Backend: NestJS REST API with Swagger/OpenAPI.
- Database: PostgreSQL hosted in Supabase.
- ORM and migrations: Prisma.
- Authentication plan in the approved architecture: Supabase Auth for identity, with NestJS responsible for authorization and business rules.
- Sensitive business tables must not be accessed directly by browser or mobile clients.

Important established data and business rules include:

- Categories are flat in schema v0.1.
- SKU is the stable unique product identifier.
- SKU format is `RS-000001`.
- SKU values must not be reset, reused, or silently renumbered.
- Barcode is deferred.
- Brand is not yet a structured master entity.
- Independently stocked variations require separate product/SKU records.
- Product packaging has independent prices; package pricing must not be calculated by the frontend.
- `ProductPurchaseType` records provenance and must not by itself authorize a sale.
- Wholesale accounts require admin/owner review.
- Multiple users may be linked to one client business.
- Credit is optional and owner-controlled.
- Stock is reserved at order confirmation and deducted when packing.
- `available = onHand - reserved`.
- Reserved stock must not be double-counted as separate business-owned inventory.
- Transactional records must not be cascade-deleted.
- Supplier purchasing, goods receipts, barcodes, images, multiwarehouse, payment gateways, complete accounting, GPS, and advanced messaging are deferred unless the actual repository contains a separately approved implementation.
- Missing prices, stock, packaging conversions, categories, or business rules must never be invented.

Previously verified database milestones included:

- Database Phase 4: approximately 48 Prisma models and 39 enums.
- Database Phase 5: migration engineering and disposable PostgreSQL validation.
- Database Phase 6: migration deployment to the authorized Supabase development database.
- Phase 6 milestone tag: `milestone/database-phase-6-supabase-dev-v0.1`.
- Phase 4 milestone tag: `milestone/database-phase-4-schema-v0.1`.
- Three migrations were reported as applied at the end of Phase 6.
- SSL enforcement was enabled.
- The Supabase Data API was disabled because NestJS is the intended business-table access layer.
- Network restrictions were deferred for development because a stable backend outbound IP was unavailable.
- Do not automatically modify the `_prisma_migrations` RLS configuration.
- One SKU sequence value was consumed during an earlier rolled-back test. Never reset the sequence to reuse that value.

These facts are the baseline, but verify the current repository and database state.

---

## 3. Authorization boundary

### Authorized

You may:

- Read and analyze all repository files.
- Read and analyze all product-related PDFs, spreadsheets, CSV files, scripts, reports, and generated artifacts.
- Inspect Git history, branches, tags, diffs, ignored files, and working-tree state.
- Run formatting, validation, linting, type checking, builds, unit tests, integration tests, and local/dev behavioral tests.
- Connect to the explicitly configured Supabase **development** database.
- Run read-only SQL against the authorized development database.
- Create local backups or sanitized evidence exports.
- Add or repair tests.
- Fix confirmed application-code, import-pipeline, configuration, and documentation defects.
- Create a new forward-only Prisma/PostgreSQL migration when a verified schema fix genuinely requires one.
- Correct development data using a reviewed, repeatable, idempotent script after snapshots and dry runs.

### Not authorized

Do not:

- Access or modify any production database.
- Treat a project named `main` or labelled `PRODUCTION` in the Supabase UI as authorization for real production work; determine the actual environment from project documentation and configured project reference.
- Delete, truncate, or rebuild the development database.
- Reset PostgreSQL sequences.
- Reuse consumed SKUs.
- Edit an already-applied migration.
- Run `prisma migrate reset`.
- Run destructive schema pushes.
- Use `prisma db push` as a replacement for reviewed migrations.
- Drop tables, columns, constraints, indexes, roles, policies, functions, or data.
- Force-push, rewrite Git history, amend other agents’ commits, or use `git reset --hard`.
- Delete untracked files or local agent configuration blindly.
- commit `.env` files, passwords, database URLs, tokens, raw credentials, or confidential source documents.
- expose buying prices through customer-facing APIs.
- invent missing buying, wholesale, retail, or individual prices.
- automatically accept low-confidence product matches.
- silently change authentication architecture, pricing policy, accounting treatment, or business rules.

If a necessary fix would violate these limits, record it as a blocker and provide an exact safe follow-up plan.

---

## 4. Source-of-truth order

When sources conflict, use this order:

1. Explicit approved business decisions in current PRD, BRD, FRD, TRD, phase answers, and approved database reports.
2. Original product PDFs and original business spreadsheets.
3. Applied database migrations and verified database constraints.
4. Current Prisma schema.
5. Repeatable import/reconciliation code and its tests.
6. Current database records.
7. Backend implementation.
8. Frontend implementation and mock data.
9. Agent summaries, including `summary.md`.

Never overwrite stronger evidence with weaker evidence. Record every unresolved conflict.

---

## 5. Required output files

Create the following under the repository, using the closest existing documentation conventions:

1. Main report:

   `docs/reviews/deepseek-full-audit-and-remediation-report-v0.1.md`

2. Machine-readable source inventory:

   `docs/reviews/artifacts/product-source-inventory-v0.1.csv`

3. Aggregate reconciliation:

   `docs/reviews/artifacts/product-reconciliation-summary-v0.1.csv`

4. Detailed mismatch data:

   Store it in an existing ignored/private artifact directory. If none exists, create a safe ignored directory such as:

   `artifacts/private/product-reconciliation/`

   Do not commit confidential row-level product evidence unless the repository already has an explicitly approved private-data convention.

5. Test evidence:

   Use existing test-report conventions. If none exist, place sanitized summaries under:

   `docs/reviews/artifacts/test-results/`

Do not put credentials, full connection strings, passwords, tokens, or private customer records in any report.

---

## 6. Stage 0 — Preflight and preservation

Before changing anything:

### 6.1 Confirm environment

Record:

- Repository root.
- Current date/time and timezone.
- OS and shell.
- Node and npm versions.
- Prisma CLI and `@prisma/client` versions.
- NestJS version.
- PostgreSQL server version.
- Supabase project reference, redacted except for the minimum identifier needed to distinguish the authorized development project.
- Whether the connection uses the transaction pooler or direct/session connection.

Never print passwords or full URLs.

### 6.2 Inspect Git

Run and record:

- Current branch.
- Current HEAD.
- `origin/main` or the applicable upstream commit.
- `git status --short`.
- Recent commits with dates and subjects.
- Existing milestone tags and the commits they resolve to.
- Whether DeepSeek’s claimed latest commit `6ebcc51` exists.
- Whether claimed commit `f569c3c` exists.
- Whether the Phase 4 and Phase 6 tags exist and resolve cleanly.
- All changes since `milestone/database-phase-6-supabase-dev-v0.1`.

Preserve unrelated tracked, untracked, ignored, and local configuration files.

If the tree is dirty:

- Classify each path as expected project work, local configuration, generated output, confidential data, or unknown.
- Do not stop merely because known local Markdown reports were intentionally deleted or local `.claude` settings exist.
- Do stop before overwriting any ambiguous user work.

### 6.3 Create a safety checkpoint

After preflight and before remediation:

- Create a new audit branch from the current verified commit, for example:
  `audit/deepseek-full-verification`.
- Do not create the branch if it would conceal or overwrite uncommitted work.
- If uncommitted project work exists, preserve it with a non-destructive checkpoint agreed with existing repository conventions.
- Do not push until all validations pass or the report clearly records a partial state.

### 6.4 Identify the authorized database

Prove that the target is the development database. Confirm:

- Database host and project reference, safely redacted.
- Database name.
- PostgreSQL version.
- Current migration state.
- Absence of real production/customer/order/payment data, as far as authorized queries can establish.

If environment identity is ambiguous, stop all database writes and continue with read-only repository/source analysis.

---

## 7. Stage 1 — Discover every product source

Recursively discover product-bearing files, including:

- `.pdf`
- `.xlsx`
- `.xls`
- `.csv`
- `.tsv`
- structured `.json`
- prior generated reconciliation files
- importer fixtures
- source extracts

Do not assume filenames. Search the repository and approved external project folders.

Classify each file as:

- Original business source.
- Previously prepared database-ready source.
- DeepSeek-generated output.
- Importer input.
- Importer output.
- QA evidence.
- Duplicate/archive.
- Unrelated documentation/design asset.

For each product-bearing source, record:

- Exact filename and relative path.
- File type.
- SHA-256.
- File size.
- Last modified timestamp.
- PDF page count or workbook sheet names.
- Detected columns.
- Approximate row count.
- Whether formulas exist.
- Whether hidden sheets/rows/columns exist.
- Whether the file contains wholesale price, buying/cost price, retail/individual price, category, sales type, unit, pack quantity, SKU, barcode, or notes.
- Provenance and confidence.
- Whether it is safe to commit.

Do not process visual design PDFs as product sources.

---

## 8. Stage 2 — Extract and validate all product PDFs

For every product-bearing PDF:

1. Determine whether it is text-based, scanned, or mixed.
2. Extract text with layout preservation.
3. Use OCR only where text extraction is incomplete.
4. Render representative pages from the beginning, middle, and end.
5. Compare extracted rows against the rendered source.
6. Detect:
   - Repeated page headers and footers.
   - Page-number contamination.
   - Wrapped product names.
   - Split rows.
   - Shifted columns.
   - Lost decimal points.
   - Negative values caused by extraction artifacts.
   - Currency symbols.
   - Blank cost or price values.
   - Truncated categories.
   - Duplicate rows caused by page boundaries.
7. Preserve the raw extracted value and a separately normalized value.
8. Record extraction confidence per row.

For the known `WS RATES.pdf`-type source, expect fields resembling:

- Product name.
- Wholesale price.
- Cost/buying price.
- Category.

Do not assume every page follows the same layout. Verify it.

Create validation totals:

- Raw extracted rows.
- Valid product rows.
- Header/footer rows removed.
- Blank-name rows.
- Duplicate exact rows.
- Negative price/cost rows.
- Zero price/cost rows.
- Missing category rows.
- Parsing-error rows.
- Manual-review rows.

---

## 9. Stage 3 — Inspect and validate all product spreadsheets

For every product-bearing workbook:

1. Inventory all sheets, including hidden sheets.
2. Record used ranges, tables, formulas, named ranges, validations, filters, and merged cells.
3. Identify source-data sheets, summary sheets, mismatch sheets, and generated sheets.
4. Confirm whether formulas have cached values or require recalculation.
5. Inspect large sheets in bounded chunks.
6. Preserve all original columns and data.
7. Detect:
   - Blank product names.
   - Duplicate records.
   - Duplicate names with different prices.
   - Invalid numeric values.
   - Zero and negative values.
   - Category inconsistencies.
   - Formula errors.
   - Hard-coded values replacing expected formulas.
   - Hidden or filtered-out records.
   - Unexpected type coercion.
   - Whitespace and Unicode issues.
   - Pack/UOM information embedded only in names.

Verify any DeepSeek-created workbook, including a file named similarly to:

`RS-Database-Updated-v2.xlsx`

Confirm:

- It has the claimed five sheets.
- Existing source columns were preserved.
- Buying prices came from evidence.
- Formulas for profit, margin, and markup are mathematically correct.
- Missing selling prices do not produce fabricated profit.
- Suggested individual prices are clearly labelled as assumptions rather than confirmed business prices.
- The workbook distinguishes exact matches, fuzzy candidates, unmatched rows, conflicts, and manual-review cases.

Use these definitions only when inputs are valid:

- `Profit = Selling Price - Buying Price`
- `Margin % = Profit / Selling Price`
- `Markup % = Profit / Buying Price`

Handle blank or zero denominators safely.

---

## 10. Stage 4 — Build a canonical reconciliation dataset

Create an analysis-only canonical dataset without destroying raw values.

Required fields should include, where available:

- Source file.
- Source sheet/page.
- Source row identifier.
- Raw item name.
- Normalized item name.
- Raw category.
- Normalized/category candidate.
- SKU.
- Raw wholesale price.
- Parsed wholesale price.
- Raw buying/cost price.
- Parsed buying/cost price.
- Retail/individual price.
- Sales type.
- Unit of measure.
- Pack quantity.
- Packaging description.
- Match status.
- Match method.
- Match confidence.
- Matched database product ID.
- Matched database packaging ID.
- Issue codes.
- Review notes.

### 10.1 Conservative normalization

Normalization may standardize:

- Case.
- Extra whitespace.
- Safe punctuation.
- Unicode variants.
- Common unit abbreviations.
- Obvious page-extraction artifacts.

Normalization must not:

- Remove meaningful sizes.
- merge distinct brands or models.
- infer pack quantities.
- convert retail units into wholesale packaging.
- change a price.
- assign a category without evidence.

### 10.2 Matching order

Use this order:

1. Exact SKU.
2. Exact stable source mapping.
3. Exact normalized name plus compatible packaging/UOM.
4. Exact normalized name plus compatible category and price evidence.
5. High-confidence fuzzy match as a **candidate only**.
6. Manual review.

Never auto-accept fuzzy matches that could merge distinct product variants.

### 10.3 Required match statuses

At minimum:

- `exact_match`
- `source_mapping_match`
- `probable_match_review_required`
- `ambiguous_multiple_candidates`
- `pdf_only`
- `spreadsheet_only`
- `database_only`
- `category_conflict`
- `wholesale_price_conflict`
- `buying_price_conflict`
- `missing_wholesale_price`
- `missing_buying_price`
- `invalid_price`
- `duplicate_source_row`
- `duplicate_database_candidate`
- `packaging_conflict`
- `unresolved`

---

## 11. Stage 5 — Reconcile the claimed product totals

Independently reproduce or disprove every reported count.

DeepSeek’s summary claims:

- 2,156 products imported in Phase 7.
- 87 categories.
- SKU range `RS-000002` through `RS-0002156`.
- 2,169 parsed PDF rows.
- 1,784 matched products.
- 372 CSV-only products.
- 385 PDF-extra products.
- 2 negative extraction artifacts.
- 3 suspicious costs.
- 26 zero-cost products.
- 1,189 buying prices inserted.
- Final database totals of 2,643 products.
- 2,634 packaging rows.
- 2,605 wholesale prices.
- 1,189 buying prices.

Investigate these known arithmetic and completeness concerns:

1. If 2,156 sequential products begin at sequence 2, the final sequence would normally be 2,157, not 2,156. Explain the actual SKU set, gaps, consumed values, duplicates, and sequence state.
2. `2,156 + 385 = 2,541`, not 2,643. Explain the additional 102 products or show which assumption is wrong.
3. 2,643 products versus 2,634 packaging rows implies at least nine products without packaging unless legitimate multi-/zero-package cases explain the count.
4. 2,634 packaging rows versus 2,605 wholesale prices implies at least 29 packaging rows without wholesale prices unless there is a documented reason.
5. 1,784 matched products versus 1,189 inserted buying prices leaves 595 matched records without inserted buying prices.
6. The 2 negative artifacts, 3 suspicious costs, and 26 zero-cost rows explain only 31 exclusions. Determine the reason for the remaining 564.

Report exact set-based reconciliation, not only totals.

Required sets include:

- Source workbook product keys.
- PDF product keys.
- Database product IDs and SKUs.
- Packaging IDs.
- Wholesale price records.
- Buying price records.
- Import row/source mappings.

Explain overlaps and differences.

---

## 12. Stage 6 — Audit Git history and DeepSeek’s claimed implementation

Read `summary.md`, but treat it as a claim register.

Create a claim-verification table with:

- Claim.
- Claimed file/commit/migration.
- Evidence inspected.
- Reproduction command/query.
- Result: `verified`, `partially_verified`, `disproved`, or `not_verifiable`.
- Severity.
- Remediation.

Verify:

- Claimed monorepo structure.
- Customer, admin, mobile, database, API, types, UI, and validation packages.
- Prisma upgrade from 6.19.3 to 7.9.0.
- Exact installed Prisma CLI/client/adapter versions.
- Lockfile consistency.
- Commit `f569c3c`.
- Commit `6ebcc51`.
- All claimed milestone tags.
- Number and names of migrations.
- Number of Prisma models and enums.
- Claimed 65+ backend endpoints.
- Claimed frontend integration.
- Claimed QA suite and its actual results.
- Claimed diagrams.
- Claimed `BusinessSettings` model.
- Claimed `buying` price type.
- Claimed importer and temporary scripts.
- Claimed database counts.

Pay special attention to the claim of six migrations. The previously verified Phase 6 baseline had three, and the summary explicitly names only:

- `20260727150435_add_buying_price_type`
- `20260727190918_add_business_settings`

Three plus these two equals five. Identify and explain the sixth migration, or mark the count false.

---

## 13. Stage 7 — Prisma schema and migration audit

### 13.1 Static verification

Run:

- Prisma formatting check.
- Prisma validation.
- Prisma Client generation.
- Migration status.
- Schema-to-migration review.
- Diff/checksum review for applied migrations.

Confirm:

- No applied migration was edited after deployment.
- Migration checksums agree with `_prisma_migrations`.
- No schema drift exists.
- No accidental `onDelete: Cascade` exists on protected transactional data.
- Required indexes and uniqueness constraints exist.
- PostgreSQL-specific protections remain active.
- `prisma.config.ts` and datasource configuration follow the installed Prisma version.

### 13.2 Review `PriceType.buying`

Determine whether buying cost belongs in the current `ProductPrice` model.

Evaluate:

- Supplier-specific cost.
- Purchase-batch cost.
- Effective date.
- Landed cost.
- Historical cost.
- Currency.
- Whether supplier/purchasing is deferred.
- Whether this is explicitly a temporary catalogue reference cost.

If retained in `ProductPrice`, ensure:

- Its meaning is documented.
- It cannot be selected by public price resolution.
- It cannot leak through storefront endpoints.
- Permissions prevent customer/business users from reading it.
- Accounting does not mistake it for true realized COGS.

Do not silently create a supplier/purchasing subsystem unless it is separately approved.

### 13.3 Review `BusinessSettings`

Verify:

- Its migration and model are required.
- Defaults are safe.
- Only authorized owner/admin roles may read or update sensitive settings.
- No secret is stored in settings.
- Singleton/uniqueness behavior is enforced.
- Audit records are created for changes.

### 13.4 Database security

Verify:

- SSL enforcement.
- Data API state.
- Business-table grants.
- Runtime role versus migration/admin role separation.
- RLS/policy assumptions.
- New tables introduced after Phase 6 received the intended privileges.
- Functions use safe `search_path`.
- No anonymous or authenticated browser role can read business tables.

Do not auto-fix the `_prisma_migrations` RLS advisor warning.

---

## 14. Stage 8 — Audit the catalogue import pipeline

Locate all importer code, including temporary files such as:

`.codex-phase7-tmp/import-buying-prices.ts`

Verify that the maintained importer supports:

- Source discovery.
- Source SHA-256 hashing.
- Duplicate-file detection.
- `ImportBatch`.
- `ImportRow`.
- `ImportIssue`.
- `SourceRecordMapping`.
- Raw source preservation.
- Row-level validation.
- Dry-run mode.
- Explicit commit mode.
- Transactional chunks.
- Retry safety.
- Idempotency.
- Partial-failure recovery.
- Deterministic category matching.
- Concurrency-safe SKU allocation.
- Packaging creation only from evidence.
- Independent wholesale and buying prices.
- Aggregate reconciliation.
- Safe re-running.

The production path must not depend on a temporary one-off script.

Run:

1. Dry run against a disposable or isolated test database where possible.
2. First committed import with fixtures.
3. Exact rerun of the same file.
4. Confirm no duplicate products, packaging, prices, source mappings, or batches.
5. Inject invalid rows and confirm issues are recorded without corrupting committed rows.
6. Simulate a mid-batch failure and confirm recovery behavior.

Do not rerun the real product import blindly against Supabase development.

---

## 15. Stage 9 — Audit the NestJS backend

### 15.1 Baseline

Verify:

- Backend starts cleanly.
- Health endpoint works.
- Swagger/OpenAPI generation works.
- Environment validation fails safely when required variables are absent.
- CORS is allowlist-based.
- Global validation pipe rejects unknown/invalid input.
- Consistent error responses exist.
- Logging redacts secrets and sensitive personal data.
- Database connections close cleanly.

### 15.2 `GET /products` blocker

DeepSeek reported that `GET /products` still returned HTTP 500.

This is a critical blocker. Reproduce it and capture:

- Request.
- Response.
- Server stack trace.
- Query.
- Prisma error code.
- Database connectivity state.

Do not guess that the cause is the pooler.

Fix the root cause, then verify:

- Default listing.
- Pagination.
- Search.
- Category filtering.
- Case-insensitive search behavior.
- Sorting.
- Empty result.
- Invalid query.
- Public response redaction.
- Response performance.

If `mode: "insensitive"` was removed, confirm whether behavior changed and whether the Prisma client/server version mismatch was actually resolved.

### 15.3 Endpoint and module audit

For every claimed module, map routes to controllers, services, repositories, database models, guards, and frontend consumers:

- Authentication.
- Users and roles.
- Catalogue/products/categories.
- Client businesses and approvals.
- Pricing and discounts.
- Orders.
- Inventory.
- Deliveries.
- Invoices.
- Payments.
- Credit.
- Returns/refunds.
- Notifications.
- Audit log.
- Staff.
- Accounting/reporting.
- Settings.

An endpoint existing is not evidence that the business rule is implemented.

### 15.4 Authentication architecture

The approved architecture planned Supabase Auth for identity plus NestJS authorization. DeepSeek reportedly implemented custom JWT, bcrypt, Passport, and browser `localStorage`.

Audit this as an architecture drift.

Verify:

- Password storage.
- Password policy.
- Login rate limiting.
- Account lockout/throttling.
- Token lifetime.
- Refresh and revocation.
- Logout invalidation.
- Password recovery.
- Disabled-user enforcement.
- Role changes and token staleness.
- CSRF/XSS implications.
- Mobile compatibility.
- Secret rotation.
- Audit logging.

Do not silently rewrite the complete authentication system. In the report:

1. State whether the custom system is safe enough for demo use.
2. Compare it to the approved Supabase Auth architecture.
3. Recommend one architecture.
4. Implement critical containment fixes that do not lock the project into the wrong architecture.
5. Mark a full auth migration as requiring explicit architecture approval if it is large or destructive.

### 15.5 Authorization

Test every sensitive route for:

- Unauthenticated request.
- Retail/business customer.
- Packing worker.
- Delivery worker.
- Admin/operator.
- Owner.

Ensure ordinary users cannot:

- Read buying prices.
- Change credit limits.
- Approve wholesale accounts.
- View all clients.
- Change staff roles.
- View sensitive audit logs.
- Adjust stock.
- Generate unrestricted financial reports.
- modify settings.

### 15.6 Business transactions

Verify transactionally:

- Backend resolves package and client-specific price.
- Frontend cannot submit an authoritative price.
- Wholesale status and approval are enforced.
- Minimum/order constraints use actual confirmed rules only.
- Stock reservation occurs at confirmation.
- Packing deducts stock and releases reservation correctly.
- Failures roll back atomically.
- Duplicate requests are idempotent.
- Invoice/document numbers are concurrency-safe and never reused.
- Payments and allocations preserve history and reversals.
- Cancellation, refund, return, and credit changes are audited.
- Delivery workers can update only assigned deliveries unless an authorized override applies.

---

## 16. Stage 10 — Audit customer and admin frontend integration

Build and test both frontends.

### 16.1 Route-to-API matrix

For every customer and admin page, record:

- Route/page.
- Intended function.
- API method/path.
- Loading state.
- Empty state.
- Error state.
- Authorization requirement.
- Whether data is real, static, partially mocked, or fully mocked.
- Test result.

### 16.2 Customer website

Verify:

- Home catalogue sections.
- Product catalogue.
- Product detail.
- Cart.
- Checkout.
- Order confirmation.
- Order tracking.
- Sign up/login.
- Wholesale registration.
- Account/profile.
- Order history/reorder.
- About.
- Contact/support.

Confirm:

- No frontend-derived authoritative package prices.
- No buying prices are exposed.
- Cart and checkout reprice on the backend.
- Failed API requests do not masquerade as empty results.
- Authentication state is handled safely.
- Static category links match real category identifiers.
- Registration fields follow approved optional/conditional rules.

### 16.3 Admin panel

Verify:

- Dashboard.
- Order queue.
- Delivery management.
- Client businesses.
- Discounts and credit.
- Product catalogue.
- Stock management.
- Staff management.
- Accounting and reporting.
- Audit log.
- Settings.

Identify and replace remaining mocks only where a real, tested endpoint exists. Do not connect a page to an incomplete or unsafe endpoint merely to remove mock data.

### 16.4 Type alignment

Confirm:

- Shared enums match Prisma/backend enums.
- Generated or declared API types match actual payloads.
- Dates and decimal money fields are handled safely.
- Error shapes are consistent.
- No frontend contains duplicated business-rule authority.

---

## 17. Stage 11 — Accounting and reporting truthfulness

Do not label a value “net profit” unless the system has sufficient evidence.

Because buying prices are incomplete and supplier purchasing/opening stock/full accounting are deferred, verify whether any current accounting page incorrectly presents:

- Gross profit.
- Net profit.
- COGS.
- Inventory valuation.
- Outstanding balance.
- Revenue.

Where data is incomplete:

- Rename metrics to accurate labels.
- Add an “estimated” or “incomplete data” indicator.
- Document the formula and data coverage.
- Prevent misleading production decisions.

Do not invent opening stock, expenses, cost flow, taxes, or historical balances.

---

## 18. Stage 12 — Dependency, build, and test audit

Run from a clean dependency state where safely possible:

- Dependency installation using the committed lockfile.
- Workspace builds.
- Type checks.
- Lint.
- Unit tests.
- Integration tests.
- API end-to-end tests.
- Frontend smoke tests.
- Migration validation.
- Importer tests.

DeepSeek’s summary states both:

- A QA run produced 30 tests with 24 passed and 6 failed.
- No automated test suite exists.

Resolve this contradiction.

Find the exact QA script, determine whether it is repeatable, and convert critical checks into maintained tests where reasonable.

After remediation, perform a clean rerun. Do not claim PASS while critical tests fail.

Review `npm audit fix` changes:

- Inspect manifest and lockfile diffs.
- Identify major/transitive upgrades.
- Confirm no dependency regression.
- Classify remaining vulnerabilities by exploitability in this project.
- Do not run forceful upgrades blindly.

---

## 19. Remediation order

Fix confirmed issues in this priority order:

### Critical

- Wrong/unauthorized database target.
- Migration drift or corrupted migration history.
- Secret exposure.
- Customer access to buying prices or sensitive tables.
- Broken authentication/authorization allowing privilege escalation.
- Broken `GET /products` or catalogue API preventing core storefront operation.
- Non-idempotent importer that can duplicate or corrupt products.
- Incorrect stock/order transaction behavior.

### High

- Unexplained database/source count differences.
- Missing source mappings.
- Incorrect buying-price matches.
- Products without required packaging.
- Sellable packaging without required wholesale prices.
- Invalid/negative/zero cost handling.
- Incomplete role enforcement.
- Missing rate limiting on authentication or sensitive endpoints.
- Incorrect frontend/backend price authority.
- New database objects with incorrect grants or security.

### Medium

- Remaining mocks.
- Incomplete empty/error/loading states.
- Misleading accounting labels.
- Missing maintained tests.
- Documentation drift.
- Temporary scripts that should become maintained tools.

### Low

- Formatting.
- Non-blocking warnings.
- Documentation polish.

For each fix:

1. State the evidence.
2. Write or update a regression test first where practical.
3. Make the smallest safe change.
4. Re-run targeted tests.
5. Re-run relevant integration tests.
6. Record files changed.
7. Record any database effect.

---

## 20. Database-write procedure

Before any development-database correction:

1. Capture read-only aggregate counts.
2. Capture the current migration status.
3. Export a safe backup or use the project’s approved backup procedure.
4. Create a dry-run reconciliation showing inserts, updates, unchanged rows, conflicts, and rejected rows.
5. Verify the script is deterministic and idempotent.
6. Use transactions and bounded chunks.
7. Do not update ambiguous matches.
8. Do not overwrite a known good price with weaker evidence.
9. Preserve price history where the schema supports effective-dated prices.
10. Write audit/import records in the same transaction where required.
11. Run the operation only against the authorized development project.
12. Re-run the same operation and prove it causes zero unintended duplicates or changes.
13. Reconcile post-write counts.

If a correction requires altering an applied schema:

- Create a new forward-only migration.
- Review the SQL before deployment.
- Test it on a disposable database first.
- Verify rollback/forward-recovery strategy.
- Never edit the old migration.

---

## 21. Required test scenarios

At minimum, test:

### Product data

- Exact product match.
- Name differs only by whitespace/case.
- Similar name but different size.
- Similar name but different brand/model.
- Same name with multiple wholesale prices.
- PDF-only product.
- Spreadsheet-only product.
- Database-only product.
- Missing buying price.
- Zero buying price.
- Negative extraction artifact.
- Ambiguous fuzzy match.
- Category conflict.
- Packaging conflict.
- Duplicate source row.

### Catalogue

- Product list.
- Product detail.
- Search.
- Category filter.
- Pagination.
- Public response redaction.
- Wholesale/retail price visibility.
- Buying price never returned publicly.

### Import

- Dry run.
- First commit.
- Identical rerun.
- Modified source rerun.
- Duplicate hash.
- Invalid row.
- Partial batch failure.
- Concurrent SKU allocation.

### Auth and roles

- Login success/failure.
- Disabled user.
- Expired/invalid token.
- Role boundary tests for customer, packing, delivery, admin, and owner.
- Buying-cost denial.
- Credit-change denial.
- Staff/settings denial.

### Orders and inventory

- Successful order.
- Insufficient stock.
- Concurrent orders for the last units.
- Reservation.
- Packing.
- Cancellation before and after packing.
- Idempotent retry.
- Price tampering from frontend.
- Unauthorized delivery update.

### Frontends

- Successful data load.
- API error.
- Empty data.
- Loading state.
- Unauthorized state.
- Expired session.
- No silent fallback to mocks.

---

## 22. Completion gates

Do not mark the work complete unless:

- Every product-bearing PDF and spreadsheet is inventoried.
- PDF extraction has visual spot-check evidence.
- Workbook formulas and hidden structures are inspected.
- Source-to-source and source-to-database reconciliation is complete.
- Every DeepSeek claim has a verification status.
- Every numerical inconsistency is explained or explicitly unresolved.
- `GET /products` works or is documented as a proven external blocker.
- Prisma format, validate, generate, and migration status pass.
- Applied migration checksums are intact.
- No database drift is unresolved.
- Public APIs do not expose buying prices.
- Role tests pass for critical permissions.
- Catalogue import is dry-run capable and idempotent.
- Core order and stock transactions are atomic.
- Customer and admin builds/type checks pass.
- Critical frontend routes are mapped to tested APIs or honestly marked incomplete.
- No critical test fails.
- All database changes are development-only, forward-only, and documented.
- Git diff contains only intentional changes.
- No secret or raw credential is staged.
- The final report is complete.

The final verdict must be one of:

- `PASS — VERIFIED AND REMEDIATED`
- `CONDITIONAL PASS — NON-CRITICAL ITEMS REMAIN`
- `FAIL — CRITICAL/HIGH BLOCKERS REMAIN`

Do not use `PASS` merely because builds succeed.

---

## 23. Required final report structure

The report at:

`docs/reviews/deepseek-full-audit-and-remediation-report-v0.1.md`

must contain:

1. Executive verdict.
2. Scope completed.
3. Environment and authorization confirmation.
4. Git baseline, branch, commits, and tags.
5. Product source inventory summary.
6. PDF extraction validation.
7. Spreadsheet validation.
8. Source-to-source reconciliation.
9. Source-to-database reconciliation.
10. Explanation of all product/SKU/package/price count differences.
11. DeepSeek claim-verification matrix.
12. Prisma schema review.
13. Migration history and checksum review.
14. Supabase security and privilege review.
15. Catalogue importer review.
16. Buying-price design and exposure review.
17. NestJS module and endpoint review.
18. Authentication architecture review.
19. Authorization matrix results.
20. Customer frontend integration review.
21. Admin frontend integration review.
22. Order, inventory, payment, delivery, and audit transaction review.
23. Accounting/reporting accuracy review.
24. Dependency/security audit.
25. Test results before remediation.
26. Confirmed defects.
27. Changes made.
28. Migrations or development-data corrections made.
29. Test results after remediation.
30. Remaining blockers, risks, and business-owner decisions.
31. Files changed.
32. Database objects/row counts changed.
33. Git status and secret scan.
34. Recommended next phase.
35. Final verdict.

For every defect include:

- ID.
- Severity.
- Evidence.
- Root cause.
- Impact.
- Fix.
- Regression test.
- Status.

For every unresolved item include:

- Exact blocker.
- Why it could not be resolved.
- What evidence or decision is needed.
- Safe next action.

---

## 24. Final chat response

When finished, keep the chat response short and include only:

- Final verdict.
- Main report path.
- Number of critical/high/medium/low findings.
- Number resolved and remaining.
- Whether the authorized Supabase development database was changed.
- Whether migrations were added/applied.
- Whether any production resource was accessed.
- Current branch and latest commit.
- One sentence describing the next recommended step.

Do not paste the entire report into chat.

---

## 25. Final safety reminder

Move quickly through read-only checks and parallelize safe validations, but do not trade away:

- Product-data correctness.
- Buying-price confidentiality.
- Migration integrity.
- SKU non-reuse.
- Import idempotency.
- Inventory and financial transaction safety.
- Authentication and authorization security.
- The continuity of the existing Raza Stationers business.

The goal is not to prove DeepSeek right or wrong. The goal is to leave the development project measurably safer, reproducible, tested, and honest about what remains unfinished.
