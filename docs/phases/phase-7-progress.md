# Phase 7 - Second Refinement Progress

**Branch:** `phase-7-second-refinement`

**Base commit:** `c68b935db79405c822085af0e1376969d946b021`

**Started:** 2026-08-02
**Last updated:** 2026-08-02

## Canonical sources

1. `C:\Users\Ahmed Raza\.codex\attachments\3e9e039b-3db6-4411-b0df-1b01766e8a7d\pasted-text.txt` - highest-authority 15-item owner list.
2. `C:\Users\Ahmed Raza\.codex\attachments\1a5b2728-4472-408c-b1fe-5aac9e48ce38\pasted-text.txt` - execution, safety and reporting rules.

Earlier phase documents and current code are evidence only and cannot expand this scope.

## Scope exclusions

- No catalogue re-import, certified identity/source-map change, invented catalogue value, production/staging database mutation, Supabase dashboard configuration, deployment, merge, commit, tag or push.
- No public Admin signup, authentication rewrite, service-role exposure or weakening of Supabase cookies, bearer-token validation, trusted database roles or AAL2.
- No edit to an existing migration. Database evolution uses the new additive Phase 7 migration only.
- Credit, suppliers, purchasing, returns, analytics and broad hardening remain outside Phase 7 except where an existing stock/order boundary is a direct dependency.
- Graphify was tried once and failed with `uv trampoline failed to canonicalize script path`; it was not repaired or retried.

## Architecture decisions

- Storefront and Admin remain separate Next.js applications; NestJS remains the authorization/business boundary; Prisma remains the database model; Supabase remains Auth and hosted PostgreSQL.
- Public catalogue sales eligibility comes from active products, confirmed active packaging, valid conversion/UOM, positive applicable price and `allowIndividualSale`, never `purchaseType` alone.
- Unknown opening stock remains `NOT_COUNTED`; zero is a valid recorded opening count.
- Live stock is reserved atomically at order confirmation, moved from sellable to unavailable at packing, and released when a confirmed order is cancelled/rejected.
- Delivery uses a real active zone. Pickup stays unavailable until both owner-supplied location and instructions are configured.
- Mobile identity is stored as local `03XXXXXXXXX`; accepted legacy `+923...` input normalizes to the same identity.
- Admin PWA performs network-only service-worker fetches and stores no private/API/business response in an offline cache.

## Requirement matrix

| ID | Requirement | Dependencies | Affected surfaces | Current status | Implementation evidence | Verification evidence / pending |
|---|---|---|---|---|---|---|
| P7-01 | Original scalable logo and consistent application | None | Web, Admin | `IMPLEMENTED` | SVG mark/lockup, reusable logo, navbar/auth/loaders/Admin/metadata/manifests | Static/PWA check, type-check and Web/Admin production builds passed |
| P7-02 | Delivery and pickup | P7-05 | DB, API, Web, Admin | `DEFERRED_OWNER_DATA` | Additive fulfilment fields/constraints, configured options API, conditional checkout and Admin snapshots | Disposable delivery/pickup assertions passed; real pickup and paid-zone values remain owner data |
| P7-03 | Opening stock and later maintenance | Orders/inventory | DB, API, Admin, Web | `IMPLEMENTED` | Explicit states, opening/adjustment audit, search/filter/paging, confirmation locks/reservations, packing and release ledger | Disposable zero/positive/concurrency/packing/release checks passed |
| P7-04 | Minimal centred navbar | P7-01, P7-19 | Web | `IMPLEMENTED` | Max-width minimal keyboard-accessible desktop/mobile navigation | Static check, type-check and production build passed |
| P7-05 | Fix order-submit 401 and duplicates | Supabase auth | Web, API, tests | `DEFERRED_EXTERNAL_TEST` | Refreshed token retrieval, bearer client, identity linking, idempotency, serialization retry and safe expiry redirect | Valid/invalid/duplicate local tests passed; real Supabase session flow remains staging verification |
| P7-06 | Branded genuine loading | P7-01 | Web, Admin | `IMPLEMENTED` | Route/auth branded loaders, skeleton catalogue, no artificial delay, reduced-motion classes | Static check and Web/Admin builds passed |
| P7-07 | Local Pakistani mobile identity | None | DB, API, Web, Admin, tests | `IMPLEMENTED` | Shared normalizer/schema, Phase 7 inputs, migration collision gate/canonicalization/unique/check constraints | Type-check, migration execution and `03`/`+92` equivalence test passed |
| P7-08 | Storefront responsive widths | P7-04/09/10/19 | Web | `DEFERRED_EXTERNAL_TEST` | Responsive nav/auth/list/drawers/product/cart/checkout layouts and touch targets implemented | Static/type checks pass; installed browser daemon stuck behind startup lock, manual 320/360/390/430/768 check remains |
| P7-09 | Compact catalogue list | P7-11 | Web | `IMPLEMENTED` | Compact responsive row with unit/price/stock/add action and detail link | Static/type checks and Web build passed |
| P7-10 | Limited categories/sidebar/drawer | P7-17 | Web, API | `IMPLEMENTED` | First six mobile categories, shared full list, desktop sidebar, mobile drawer and clear selection | Static/type checks and Web build passed |
| P7-11 | Catalogue performance | P7-09/10/17 | API, Web, tests | `IMPLEMENTED` | Server filters/paging, reduced response, parallel metadata, abort/debounce, indexes and bounded pagination | Reproducible baseline: 8 to 20 rows/request, 60% fewer traversal requests, 250 to max 5 page buttons; disposable regression passed |
| P7-16 | Production Admin creation | Supabase/AAL2 | Script, API, Admin, docs | `DEFERRED_OWNER_DATA` | Concurrent-safe first-owner bootstrap, rollback, trusted invitations, no signup, runbook, AAL2/private middleware/network-only SW | Syntax/type/static/build checks passed; actual first-owner identity/secrets remain owner data |
| P7-17 | Real combined URL/API filters | P7-10 | API, Web | `IMPLEMENTED` | Search/category/sale type/stock/unit/min/max/sort URL parameters with server validation and reset/chips | Static/type/build/disposable coverage passed |
| P7-18 | Valid bulk purchase option | P7-17 | API, Web, cart/order | `IMPLEMENTED` | Confirmed package selection/conversion/pricing, larger valid base quantity, package snapshot and backend validation | Type-check, build and disposable order coverage passed |
| P7-19 | Dedicated sign-in page | P7-01 | Web | `DEFERRED_EXTERNAL_TEST` | Overlay removed; split/stacked route with email, Google, recovery, registration, safe return and redirect | Static/type/build checks passed; real Google/recovery/provider flow remains staging verification |

## Dependency order

P7.0 -> P7-01 -> P7-19 -> P7-04 -> P7-06 -> P7-07 -> P7-08 -> P7-09 -> P7-10 -> P7-17 -> P7-11 -> P7-18 -> P7-02 -> P7-05 -> P7-03 -> P7-16 -> final verification.

## Current stage

Implementation and local verification complete. Owner review, owner-supplied configuration and manual staging/provider checks remain.

## Completed evidence

- Initial branch/base/clean-tree safety gate passed.
- Prisma Client regenerated locally after the additive schema change.
- Prisma format and offline placeholder-URL validation passed.
- API, Web and Admin targeted type-checks passed after one manifest-purpose correction.
- `node tests/phase7/test_static_refinement.mjs` passed and emitted reproducible catalogue before/after evidence.
- Graphify unavailability was recorded once without repair.

## Blocked items

- None in implementation.

## Deferred manual/external items

- Real pickup location/instructions and non-free delivery-zone charges are owner data.
- Supabase email/Google/recovery/TOTP and full authenticated staging flows require manual staging/provider verification.
- The gstack browser daemon timed out twice behind an existing startup lock. No repair was attempted; exact-width manual browser verification remains external.

## Verification history

| Check | Exit | Result |
|---|---:|---|
| Repository safety and canonical reconciliation | 0 | PASS |
| Initial Graphify discovery | 1 | Non-blocking unavailable; no retry |
| `npm install --package-lock-only --ignore-scripts` | 0 | Lockfile aligned without package scripts |
| Prisma Client generation | 0 | Prisma 7.9 client generated locally |
| Prisma format | 0 | Schema formatted |
| Prisma validate with local placeholder URL | 0 | Valid |
| Targeted API type-check | 0 | PASS |
| Targeted Web/Admin type-check retry | 0 | PASS after manifest type correction |
| Phase 7 static/performance check | 0 | PASS |
| gstack browser `goto` / `status` | timeout / 1 | External harness unavailable due existing startup lock |
| `npm run typecheck` | 0 | All workspaces passed |
| `npm run lint` | 1 | Phase 7 changed files had zero errors; two pre-existing errors remain in untouched `TotpEnrollView.tsx` |
| `npm run build:api` | 0 | NestJS production build passed |
| Synthetic-placeholder `npm run build:web` | 0 | Storefront production build passed |
| Synthetic-placeholder `npm run build:admin` | 0 | Admin production build passed |
| `node tests/run_all_tests_disposable.mjs` | 0 | All 11 migrations and eight suites passed; disposable container removed |
| Final Prisma/static recheck | 0 | PASS |
| `git diff --check` | 0 | PASS |

## Next exact action

Owner review, supply pickup/paid-delivery and first-owner values, then perform manual responsive and real Supabase-provider checks in staging. No commit, push, deployment or external database change was performed.
