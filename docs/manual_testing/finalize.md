# Project Finalization Report: Raza Stationers

**Prepared by:** Claude (AI code quality audit)
**Repository:** https://github.com/ahmed000248/raza-stationers
**Branch under review:** `phase-9-betterauth` → target merge: `main`
**Audit date:** August 6, 2026

> **Methodology note (read before acting on this report):** This audit was produced by reading the repository's public GitHub pages directly — the full file tree of `phase-9-betterauth` (verified via GitHub's API, 300+ files enumerated with real paths), the `main` branch README, and the project's own `docs/PRD.md` and `docs/TRD.md`. I was **not able to run the application, execute the test suite, install dependencies, or open a live database connection** — I have no shell/network access to clone and run this project, and GitHub's public API rate-limited individual file-content reads partway through this session. Every finding below is labeled by confidence level:
> - **[VERIFIED]** — confirmed by directly reading the actual file/page content.
> - **[STRUCTURAL]** — confirmed from the real file tree (paths, module names) but the file's *contents* weren't read.
> - **[INFERRED]** — a reasonable conclusion from verified evidence, flagged as needing direct confirmation.
> - **[UNVERIFIED — REQUIRES MANUAL CHECK]** — could not be checked at all (tests, live app behavior, mobile connectivity, DB migrations state).
>
> Treat the "Critical Issues" and "Pre-Merge Checklist" sections as the actionable core of this report. Do not treat this as a substitute for actually running `npm run build`, the test suite, and a manual smoke test before merging.

---

## Executive Summary

Raza Stationers is a solo-developer (Ahmed), AI-assisted portfolio/business project: a wholesale + retail stationery ordering platform for a family business in Rawalpindi/Islamabad, Pakistan. The project has excellent planning documentation (PRD, BRD, FRD, TRD — all present and detailed in `docs/`), which is unusual and valuable; most of this audit's structural conclusions are cross-checked against that TRD.

**The single most important finding is architectural, not cosmetic:** the `phase-9-betterauth` branch and the `main` branch appear to implement **two different backend architectures**. `main`'s README describes a Next.js-only monorepo (`apps/web`, `apps/admin`, `apps/mobile` all calling `packages/db`/`packages/api` directly, no separate backend service). The `phase-9-betterauth` branch tree contains a fully-built-out **separate NestJS backend** at `apps/api` (auth, orders, inventory, pricing, accounting, delivery, invoicing, returns, settings, notifications — 20+ modules) alongside `apps/admin`. The project's own TRD (v1.3, July 25 2026) documents this exact fork in the road as an *explicitly undecided open question* ("drop `apps/api` and let Next.js Route Handlers call `packages/db` directly" vs. "build `apps/api` as a real NestJS service"). It looks like `phase-9-betterauth` took path (a) while `main` may have since moved toward path (b), or simply hasn't caught up. **This needs to be resolved as a deliberate decision before merging — it is not a normal merge conflict, it's an unresolved product/architecture decision.**

Second major finding: the repository is **public**, but the project's own TRD explicitly states "Private GitHub repository... contains business logic, must not be public." The repo root also contains `RS-Database.xlsx` and `WS RATE LIST.pdf` — filenames strongly suggesting real wholesale pricing/product data for the business. This is a real, concrete confidentiality exposure that should be resolved (make the repo private, and audit git history for any real customer/pricing data) independent of anything else in this report.

Third, the auth code under audit (`apps/api/src/auth/`) contains **three parallel authentication implementations side by side**: `better-auth.ts`, a custom `auth.service.ts`/`jwt.strategy.ts`, and a `supabase.strategy.ts`. This is consistent with an in-progress migration to BetterAuth that has not yet removed the prior JWT/Supabase auth code — exactly the kind of half-finished migration that should not reach `main` un-flagged.

The project is clearly a serious, well-planned effort with real documentation discipline (a strength most audits don't get to say). But the branch is **not merge-ready** until the architecture question is explicitly resolved and the auth duplication is cleaned up. See §10 for the full severity-ranked list.

---

## 1. Frontend Audit

**[STRUCTURAL]** `apps/admin` is a Next.js 16 app (React 19, Tailwind, App Router) with a conventional structure: `src/app/<feature>/page.tsx` per domain (accounting, audit-log, catalogue, client-businesses, dashboard, delivery, discount-credit, orders, settings, staff, stock), matching `src/components/<feature>/` for the UI. This is clean, conventional Next.js organization — no obvious anti-patterns from the file tree alone.

Notable structural details:
- `src/hooks/use-admin-auth.tsx` (6.6 KB) — sizeable custom auth hook; worth reviewing for duplicated logic now that BetterAuth exists server-side.
- `src/components/shell/TotpChallengeView.tsx` and `TotpEnrollView.tsx` — TOTP/2FA UI is present, which is good (TRD §7 calls for MFA on Owner/Admin accounts).
- `src/content/mock/*.ts` — nine mock-data files (`accounting-data.ts`, `audit-data.ts`, `catalogue-data.ts`, `client-data.ts`, `dashboard-data.ts`, `delivery-data.ts`, `order-data.ts`, `settings-data.ts`, `staff-data.ts`) still present alongside real pages. **[INFERRED]** These need to be confirmed as dev-only fixtures, not accidentally wired into production pages — if any page still imports from `content/mock` instead of the real API, that's a functional gap, not just dead code.
- `apps/admin/public/sw.js` — a service worker is registered (`RegisterServiceWorker.tsx`). Confirm caching strategy doesn't cache authenticated/admin data insecurely on shared devices.

**[UNVERIFIED — REQUIRES MANUAL CHECK]** Responsive design, actual component-level state management patterns, performance (bundle size, render waterfalls) — none of this can be assessed without running the app. Recommend `npm run build` + Lighthouse/bundle-analyzer pass as part of the actual pre-merge work.

**Customer storefront (`apps/web`):** **[STRUCTURAL — main branch only]** The `main` README describes a full storefront (Next.js, GSAP, Framer Motion, Lenis, Three.js) as already "full 14-page build, QA-passed" per the TRD changelog. I could not confirm whether `apps/web` exists at all on `phase-9-betterauth` — it did not appear in the branch tree I was able to enumerate before it was truncated by response size limits. **This must be checked directly: if `phase-9-betterauth` is missing `apps/web` entirely, merging it into `main` could delete or shadow the customer storefront.**

---

## 2. Backend Audit

**[STRUCTURAL]** `apps/api` is a NestJS application with one module per business domain: `accounting`, `audit`, `auth`, `catalogue`, `clients`, `dashboard`, `delivery`, `imports`, `inventory`, `invoicing`, `notifications`, `orders`, `pricing`, `returns`, `settings`. Each follows the standard NestJS controller/service/module triad, which is good structural hygiene.

Points worth direct review (contents not readable this session):
- `orders/orders.service.ts` is **23 KB** — by far the largest file in the codebase. Given the TRD's detailed order-state-machine and stock-reservation requirements (§10), this size is plausible for legitimate complexity, but a file this large is also where god-service anti-patterns hide. Recommend splitting into `OrderStateMachine`, `OrderPricingIntegration`, and `OrderRepository` concerns if not already separated internally.
- `catalogue/catalogue.service.ts` (14 KB) and `inventory/inventory.service.ts` (10.7 KB) are the next largest — consistent with the catalogue/stock complexity described in the TRD, but worth a maintainability pass.
- `common/base-repository.ts` is only 218 bytes — check whether this is a real shared abstraction or a near-empty stub not yet adopted by the domain services (each service currently seems to talk to Prisma directly rather than through a repository layer, based on file sizes).

**API design:** The TRD (§8) specifies REST endpoints versioned under `/api/v1/` with Swagger/OpenAPI documentation. **[UNVERIFIED]** Confirm the actual controllers implement versioning and that Swagger is wired up in `main.ts` — I could not read `main.ts`'s contents this session due to rate limiting.

**Error handling / validation:** **[UNVERIFIED — REQUIRES MANUAL CHECK]** Cannot confirm DTO validation (`class-validator`), global exception filters, or consistent error response shapes without reading controller/DTO source. Given the domain (money, stock, credit — TRD explicitly calls out "no silent failures on order/payment/stock actions" as a hard requirement), this should be a priority check before merge, not an afterthought.

---

## 3. Database Audit

**[VERIFIED — via TRD]** The schema is Prisma/PostgreSQL, documented in detail in `docs/TRD.md` §6, with the TRD explicitly stating `packages/db/prisma/schema.prisma` is "the actual source of truth" as of TRD v1.5. Per the README, the schema spans **48 models and 39 enums**. Design highlights confirmed from the TRD:
- **Zero cascade deletions** — all 165 relationships enforce `onDelete: Restrict` to preserve business/audit history. This is a strong, deliberate integrity choice.
- Append-only ledgers for credit (`CreditLedgerEntry`) and stock (`StockMovement`), with `StockBalance` explicitly documented as "a transactionally maintained projection, never an independently editable ledger" — good practice, assuming the actual service code respects this (unverified).
- Indexes are called out for `Product.name`, `Product.shop_name`, `Product.category_id`, `Order.status`, `Order.client_business_id` — reasonable for the stated 3,000+ SKU catalogue scale.

**Critical structural risk:** `apps/api` (the branch under review) references its own Prisma setup (`apps/api/src/prisma/prisma.service.ts`, `prisma.module.ts`), while the canonical schema per the TRD lives in `packages/db/prisma/schema.prisma` at the monorepo root, consumed by `apps/web`/`apps/admin` directly. **[REQUIRES DIRECT CHECK]: Does `apps/api` have its own duplicate/divergent Prisma schema, or does it correctly import `packages/db`?** If `apps/api` was built against a duplicated or stale schema copy, that's a Critical blocker — you'd have two schemas that can silently drift, and migrations run against one could leave the other's Prisma Client out of sync.

**Migrations:** **[UNVERIFIED — REQUIRES MANUAL CHECK]** I could not read `packages/db/prisma/migrations/` history or confirm `phase-9-betterauth`'s migration state is compatible with `main`'s. Run `npx prisma migrate status` on both branches against a shared shadow database before merging, and diff the schema files directly (`git diff main phase-9-betterauth -- '**/schema.prisma'`).

---

## 4. Authentication & Authorization

This is the branch's namesake feature, and the area with the clearest, most concrete finding.

**[STRUCTURAL — confirmed from file tree]** `apps/api/src/auth/` contains, simultaneously:
- `better-auth.ts` (5.8 KB) — the new BetterAuth integration
- `auth.service.ts` (9.3 KB) + `auth.controller.ts` (4.1 KB) — a custom auth implementation
- `strategies/jwt.strategy.ts` — custom JWT (Passport)
- `strategies/supabase.strategy.ts` — Supabase Auth integration
- `guards/better-auth.guard.ts` (2.6 KB), `guards/jwt-auth.guard.ts`, `guards/roles.guard.ts` — three separate guard implementations
- `decorators/roles.decorator.ts`, `decorators/current-user.decorator.ts`

**This is the top authentication-layer risk on this branch.** Three coexisting auth mechanisms almost always means: some routes are still protected by the old guard, some by the new one, and it's easy for a route to end up accidentally unprotected or double-protected during the transition. Before merge:

1. **Grep every controller for guard usage** (`@UseGuards(...)`) and produce a table of which guard protects which endpoint. Confirm every endpoint uses `BetterAuthGuard` (or a single, intentional guard), not a mix.
2. Confirm `jwt.strategy.ts` and `supabase.strategy.ts` are either (a) actively still needed for a specific reason (e.g., mobile app still on old auth) and that reason is documented, or (b) dead code that should be deleted before merge, not carried forward as confusion for the next contributor.
3. Confirm session/token invalidation: if a user has an old JWT/Supabase session, does switching to BetterAuth invalidate it cleanly, or could a stale token still pass an old guard on a route that wasn't migrated?

**Owner vs. Admin role split [VERIFIED — via TRD §7]:** The TRD is explicit and detailed here — several actions (approving client-business accounts, setting credit limits, viewing payment history, all accounting/reporting, the audit log, stock *corrections* (not routine restocks), staff management, business settings) must be **Owner-only**, not just "any staff." The TRD recommends two guard levels: `@Roles('owner')` vs. `@Roles('admin', 'owner')`. **[REQUIRES DIRECT CHECK]:** Confirm `roles.guard.ts` + `roles.decorator.ts` actually implement this two-tier split, and spot check at minimum: `accounting.controller.ts`, `audit.controller.ts`, `settings.controller.ts`, and the stock-correction endpoint in `inventory.controller.ts` — these are the highest-consequence endpoints per the TRD's own threat model.

**MFA/TOTP:** The admin frontend has `TotpChallengeView.tsx`/`TotpEnrollView.tsx`, consistent with the TRD's requirement for Owner/Admin MFA. Confirm this is actually *enforced* server-side (i.e., a completed TOTP challenge is required by the guard, not just offered as an optional UI flow).

---

## 5. Security & Traffic Management

**[VERIFIED — repository-level finding]** **The GitHub repository is public.** The project's own TRD (§3, Technology Stack table) states: *"Repository: Private GitHub repository — Version control; contains business logic, must not be public."* This is a direct contradiction between stated intent and actual state. Compounding this, the repo root contains `RS-Database.xlsx` and `WS RATE LIST.pdf` — filenames strongly consistent with the real wholesale rate list referenced throughout the TRD ("the actual rate list (`RS-Database.xlsx`: 2,156 products, 87 categories, wholesale prices only...)"). **If this file contains real business pricing, it is currently exposed publicly, along with the full commit history.** This should be treated as the single highest-priority item in this entire report, ahead of any code-quality concern:
1. Immediately audit whether `RS-Database.xlsx` / `WS RATE LIST.pdf` contain real (not sample) business data.
2. If yes: rotate/reconsider any pricing sensitivity, and either make the repo private or scrub the files from git history (`git filter-repo`/BFG — a simple delete-and-commit is not sufficient, history retains the blob).
3. Decide going forward whether this repo should be private per the TRD's own stated requirement, or whether the TRD needs to be updated to reflect an intentional decision to keep it public (e.g., for portfolio purposes) with real data kept out entirely.

**Other security items (from TRD §16, cross-checked against what's structurally visible):**
- **Secrets management:** `.env.example` and `apps/admin/.env.local.example` are present at expected locations (good — placeholders, not real secrets, based on file size: 431 bytes and 44 bytes respectively, consistent with example files). Confirm `.gitignore` actually excludes `.env`/`.env.local` (a `.gitignore` file is present at root, 989 bytes — worth opening to confirm coverage). **[REQUIRES DIRECT CHECK]** Also worth a `git log --all --full-history -- '*.env'` style history scan to confirm no real `.env` was ever committed and later removed (removal ≠ purged from history).
- **CORS/rate limiting/CSRF:** **[UNVERIFIED]** Could not read `apps/api/src/main.ts` (where NestJS CORS config and any rate-limiting middleware like `@nestjs/throttler` would be registered) due to API rate limiting during this session. This is a direct, must-check item — confirm `main.ts` sets an explicit CORS allow-list (not `origin: '*'`) and that rate limiting exists on auth endpoints (`/auth/login`, `/auth/register`) at minimum, given brute-force risk on a customer-facing login.
- **Input validation:** NestJS's `ValidationPipe` + DTOs are the standard approach; `catalogue/dto/pagination.dto.ts` exists, suggesting DTOs are in use, but coverage across all mutating endpoints needs direct confirmation.
- **Supabase RLS:** The TRD (§16) describes a specific defense-in-depth plan: business tables live in Postgres `public` schema with the Supabase auto-generated Data API disabled, and `anon`/`authenticated`/`service_role` privileges revoked, making NestJS the sole database boundary. **[REQUIRES DIRECT CHECK]** — this is easy to get wrong (leaving the Supabase Data API enabled would let anyone with the anon key query tables directly, bypassing all NestJS auth/role guards entirely). This should be verified against the live Supabase project settings, not just the code.

---

## 6. Project Structure Analysis

**[VERIFIED — real, structural divergence]** As covered in the Executive Summary, `phase-9-betterauth` (`apps/admin` + `apps/api`) and `main` (`apps/web` + `apps/admin` + `apps/mobile` + `packages/db`/`api`/`types`/`ui`/`validation`) do not share the same top-level shape based on what each branch's own README/tree shows. Before any file-level merge conflict resolution, resolve the structural question:
- Does `phase-9-betterauth` still have `apps/web` (the customer storefront)? If not, merging will need to either pull `apps/web` in from `main` unchanged, or the storefront needs to be re-pointed at the new `apps/api` backend (`packages/api`, the shared HTTP client, would need updating to call the new NestJS routes instead of local Next.js route handlers / `packages/db` directly).
- Does `phase-9-betterauth`'s `apps/api` import from the canonical `packages/db`, or does it have its own Prisma setup? (Flagged again here because it affects project structure, not just the database section — if `apps/api` isn't a workspace member consuming `packages/db`, that's a monorepo wiring gap, not just a schema question.)

**Config files present and structurally reasonable:** `.env.example`, `.dockerignore`, `Dockerfile` (2.4 KB, root-level — presumably containerizes `apps/api`), `.gitignore`, `nest-cli.json`, `tsconfig.json` per app, ESLint flat config (`eslint.config.mjs`) in `apps/admin`. This all looks like conventional, competent tooling setup.

**Unusual/notable:** the repo root (both branches) contains a large `.agents/` and `.claude/skills/` and `.windsurf/skills/` directory tree — these are AI coding-assistant configuration/skill files (animate, better-auth-best-practices, create-auth, design-motion-principles, gsap, prisma-cli, supabase, and several oddly-named "ponytail-*" skills). These are development tooling artifacts, not application code — see §7.

---

## 7. Unused & Unnecessary Files

**[VERIFIED — real files found in the tree, worth a decision either way, not necessarily "wrong"]**

- **`.agents/`, `.claude/skills/`, `.windsurf/skills/`** — three near-identical copies of the same skill files (e.g., `prisma-cli/SKILL.md` appears at all three paths with the *same blob SHA*, i.e., byte-for-byte identical). These are AI-assistant tool configuration, not app code, and are duplicated three times for three different tools (Claude, Windsurf, and a generic `.agents` convention). **Recommendation:** keep at most one canonical copy (or a symlink strategy) rather than three synced-by-hand copies — as-is, any update to one will silently drift from the other two.
- **`.antigravityignore`, `.graphifyignore`** — ignore files for tools not mentioned anywhere else in the docs (Antigravity, Graphify). Confirm these tools are actually in use; if not, remove.
- **`graphify-out/`** (seen in `main`'s root listing) — sounds like generated output from the "Graphify" tool referenced by `.graphifyignore`. Generated output directories generally shouldn't be committed to git at all (should be gitignored, not committed-then-ignored-for-future-changes). Worth checking whether this is intentionally checked in (e.g., a rendered diagram export) or an accidental commit.
- **`Design/` folder** — contains `.dc.html` static mockup files (Dashboard, OrderQueue, StockManagement, etc. — full admin and website mockups) plus a bundled design-system folder with fonts (`.woff2`, ~240 KB for one font alone) and a `_ds_bundle.js` (57.9 KB). These are design-reference artifacts, not application code. They're large (the biggest single mockup file is 71 KB) and don't need to ship in the same repo as the application, or at minimum shouldn't be pulled into `main` if `main` doesn't already have them — confirm intent before merging.
- **`RS-Database.xlsx`, `WS RATE LIST.pdf`** — flagged already in §5 as a potential confidentiality issue; also simply don't belong in a git repository from a "binary business data shouldn't be version-controlled alongside code" hygiene perspective, regardless of the sensitivity question.
- **Mock data files** (`apps/admin/src/content/mock/*.ts`, 9 files) — flagged in §1; confirm these are intentionally-retained dev fixtures (e.g., for Storybook or local dev without a DB) rather than abandoned scaffolding.

---

## 8. Mobile App Integration Verification

**[UNVERIFIED — REQUIRES MANUAL CHECK, with an important caveat]** I found **no `apps/mobile` directory in the `phase-9-betterauth` file tree** during this session (the tree fetch was large and may have been truncated before reaching it, so I cannot say with certainty it's absent — this needs direct confirmation, not an assumption either way). The `main` branch README lists `apps/mobile` as "React Native Mobile App... Expo, React Native," and the TRD (§19) describes it as Phase 2, still "placeholder only, no real code" as of the TRD's writing.

Given that, the PRD's explicit requirement to "Verify mobile app connectivity to backend APIs" and "Test authentication flow on mobile" is very likely **not yet applicable** — if the mobile app is still a placeholder per the TRD, there is nothing to test yet. **Before doing mobile-integration testing work, first confirm via `git diff main phase-9-betterauth --stat -- apps/mobile` (or the GitHub UI) whether `apps/mobile` has any real code on either branch.** If it's still a placeholder on both, remove "mobile integration testing" from the pre-merge blocking checklist entirely and note it as a Phase 2 item, per the project's own roadmap — don't invent testing work for code that doesn't exist yet.

If mobile code *does* exist and I simply didn't see it in the truncated tree: the TRD (§19) notes the mobile app's viability depends on the same open architecture question from §6 — if `apps/api` is kept, mobile calls it directly; if dropped, mobile "would need its own thin API layer since it can't call Next.js Server Actions directly." This makes mobile connectivity verification directly dependent on resolving the architecture question first.

---

## 9. Testing & Quality Assurance

**[UNVERIFIED — REQUIRES MANUAL CHECK]** I cannot run tests from this environment. What I can report structurally:

- The TRD (§17) specifies a clear testing strategy: **Jest** for unit tests (pricing engine, credit logic, order state machine — explicitly called "the highest-risk business logic"), **Supertest** for API integration tests including *negative* authorization tests ("attempting restricted actions as the wrong role"), and **Playwright** for E2E (customer browse→cart→checkout, admin confirm→print→dispatch→deliver flows).
- I did not see obvious `*.spec.ts` / `*.test.ts` files or a `__tests__`/`e2e` directory in the portion of the file tree I was able to enumerate for `apps/api` or `apps/admin`. **This is worth confirming directly and, if true, is a Critical gap** — the TRD calls out negative-role-authorization tests specifically as required *because* of exactly the kind of auth-guard confusion flagged in §4. Given three coexisting auth mechanisms and no visible automated test coverage forcing "wrong role → 403" behavior, this combination is the highest-risk pairing in the whole audit: an untested, mid-migration authorization layer.
- CI: the TRD states GitHub Actions runs lint/type-check/tests on every PR. Given **zero open or closed pull requests exist on this repository** (confirmed directly — the Pull Requests tab shows "0 Open, 0 Closed"), it's worth confirming whether a `.github/workflows/` CI config exists and has ever actually run, since a PR-triggered CI pipeline that's never received a PR has never actually executed.

---

## 10. Critical Issues to Resolve Before Merge

### 🔴 Critical (must resolve before any merge)

1. **Repository is public; TRD requires it be private; possible real business data (`RS-Database.xlsx`, `WS RATE LIST.pdf`) is committed.** Audit the files, decide public-vs-private deliberately, purge history if real data is confirmed exposed.
2. **Unresolved architecture divergence between branches** (`apps/api` NestJS backend on `phase-9-betterauth` vs. `main`'s apparent direct `packages/db`/Next.js approach). This is a product decision, not a merge-conflict-resolution task — resolve it explicitly (which architecture wins?) before attempting the merge, or the merge will produce an internally inconsistent codebase.
3. **Three coexisting authentication mechanisms** (BetterAuth, custom JWT, Supabase strategy) with no confirmed test coverage forcing correct role enforcement. Audit every controller's guard usage; remove dead auth code; confirm negative-authorization tests exist and pass.
4. **Confirm `apps/api`'s Prisma setup isn't a divergent/duplicate schema** from the canonical `packages/db/prisma/schema.prisma` described in the TRD.
5. **Confirm `apps/web` (customer storefront) exists on `phase-9-betterauth`** or has an explicit plan to be reintroduced during merge — do not silently lose it.

### 🟠 High

6. CORS config, rate limiting (especially on `/auth/login` and `/auth/register`), and Supabase RLS/Data-API-disabled status in `main.ts` and Supabase project settings — unverified this session, high-consequence if misconfigured.
7. Confirm Owner-only vs. Admin-allowed endpoint split (accounting, audit log, settings, stock corrections) is actually enforced by `roles.guard.ts`, matching TRD §7's explicit list.
8. Confirm test suite exists and covers the pricing engine, order state machine, and credit logic (TRD's own stated "highest-risk business logic"), plus negative role-based-access tests.

### 🟡 Medium

9. `orders.service.ts` (23 KB) and other large services — review for maintainability/single-responsibility, not urgent but will compound.
10. Triplicated `.agents/`/`.claude/skills/`/`.windsurf/skills/` directories — consolidate to avoid silent drift.
11. Nine mock-data files in `apps/admin/src/content/mock/` — confirm none are still wired into production pages.

### 🟢 Low

12. `.antigravityignore`, `.graphifyignore`, `graphify-out/` — confirm these tools are still in active use; remove if not.
13. `Design/` folder's static mockups and bundled design-system assets (fonts, JS bundle) — consider whether these belong in the application repo at all, or a separate design-assets repo.

---

## 11. Pre-Merge Checklist

- [ ] Confirm repo visibility decision (public/private) and act on any exposed business data
- [ ] Explicitly resolve the `apps/api` vs. direct-`packages/db` architecture question with the project owner
- [ ] Confirm `apps/web` and `apps/mobile` presence/state on `phase-9-betterauth`
- [ ] Audit and consolidate the three auth mechanisms in `apps/api/src/auth/`
- [ ] Confirm `apps/api`'s Prisma schema matches (or correctly imports) `packages/db/prisma/schema.prisma`
- [ ] Run `npx prisma migrate status` on both branches; diff schemas
- [ ] Read and verify `apps/api/src/main.ts` for CORS, rate limiting, Swagger, global validation pipe
- [ ] Verify Supabase Data API is disabled and RLS/privilege revocation is live in the actual Supabase project (not just documented intent)
- [ ] Confirm/implement negative-authorization tests for every Owner-only endpoint
- [ ] Run full test suite (`npm run build`, Jest, Supertest, Playwright) — none of this was run during this audit
- [ ] Remove or confirm intent behind mock-data files, duplicated agent-skill folders, and stray ignore files
- [ ] Open an actual pull request for `phase-9-betterauth` → `main` (currently 0 PRs exist) so CI runs and a real diff review happens

---

## 12. Merge Instructions

**Do not run these commands until the Critical items in §10 are resolved.** Once they are:

```bash
# 1. Make sure you have the latest state of both branches
git fetch origin

# 2. Create a fresh local branch off main to merge into, rather than merging
#    directly on main, so you can inspect the result before pushing
git checkout -b merge-phase-9-betterauth origin/main

# 3. Merge phase-9-betterauth in, without auto-committing, so you can review
#    the full diff and conflict set first
git merge --no-commit --no-ff origin/phase-9-betterauth

# 4. Resolve conflicts deliberately -- pay special attention to:
#    - packages/db/prisma/schema.prisma (or apps/api's schema, per Critical #4)
#    - apps/admin (present on both branches -- likely to have real conflicts)
#    - any apps/web changes if it exists on both branches

# 5. Once conflicts are resolved and the architecture question (Critical #2)
#    is settled, review the full diff before committing
git diff --staged

# 6. Run the full verification suite locally BEFORE committing the merge
npm install
npm run build
npm test              # or the actual test script names in package.json
npx prisma migrate status --schema=<correct-schema-path>

# 7. Only after all of the above passes, commit the merge
git commit

# 8. Push to a remote branch first (not directly to main) and open a real PR,
#    so CI runs and there is an actual reviewable diff -- this repo currently
#    has 0 PRs ever opened, so this will be the first real review checkpoint
git push origin merge-phase-9-betterauth
# then open a PR: merge-phase-9-betterauth -> main via GitHub UI
```

---

## 13. Post-Merge Verification Steps

**Automated:**
- [ ] CI pipeline (GitHub Actions) runs and passes on the merge PR
- [ ] `npm run build` succeeds for every workspace (`web`, `admin`, `mobile`, `api`, `db`, `types`, `ui`, `validation`)
- [ ] Full test suite passes (unit, integration, E2E)
- [ ] `npx prisma migrate deploy` (or equivalent) succeeds against a staging database without manual intervention

**Manual:**
- [ ] Log in as each role (Guest, Regular Customer, Verified Customer, Admin, Staff/Delivery, Owner) and confirm access matches the TRD §7 permission matrix — especially confirm Admin *cannot* reach Owner-only endpoints (accounting, audit log, credit approval, stock corrections, staff management, settings)
- [ ] Place a full test order end-to-end: browse → cart → checkout → admin confirm → print slip → dispatch → deliver, confirming stock reservation/deduction and audit log entries at each step
- [ ] Confirm BetterAuth session behavior: log in, refresh, log out, and confirm no stale JWT/Supabase session can still authenticate against any endpoint
- [ ] Confirm CORS is correctly scoped to the actual deployed frontend origins (not `*`) in the merged `main.ts`
- [ ] If mobile app has real code: test full auth + order flow from the mobile client against the merged backend
- [ ] Re-check repository visibility and confirm no secrets were introduced by the merge commit itself (`git log -p` scan or a tool like `gitleaks` on the merge diff)

---

*This report reflects a static review of publicly-readable repository structure and documentation as of August 6, 2026. It is a starting point for the implementation team's own verification, not a substitute for it — several items above are explicitly marked as requiring direct, hands-on confirmation that was not possible from this session.*
