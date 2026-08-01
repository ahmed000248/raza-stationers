# Phase 6 — Production Deployment: Revised Implementation Plan

**Plan version:** 2.0 (incorporates all 12 mandatory corrections)
**Source branch:** `stabilization` (Phase 5 already merged — tip commit `971f4c7 merge: Phase 5 staging deployment`)
**Target branch:** `phase-6-production-deployment` (branched from `stabilization`)
**Final target:** merge into `main` after production certification
**Constraint:** Do not touch `main` until Gate 17 sign-off. Never expose passwords in chat, Git, docs, commands, or logs.

---

## 0. Pre-Work: Staging Credential Rotation (Immediate, Before Phase 6 Opens)

> [!CAUTION]
> **The staging admin password written in `PHASE_5_STAGING_PROGRESS.md`, `PHASE_5_STAGING_CERTIFICATION.md`, and `scripts/database/set_staging_passwords.js` must be rotated immediately.** Any committed or documented staging password is treated as compromised. This is a mandatory blocker for Phase 6.

**Actions (owner executes; no password appears in chat, Git, or docs):**
1. Log in to the staging Supabase project (`kjglykncjotsxoihupfe`) and change the admin/owner user `passwordHash` values directly via the Supabase dashboard or a one-time console script that is never committed.
2. Update `.env` locally with the new staging values.
3. In `PHASE_5_STAGING_CERTIFICATION.md` and `PHASE_5_STAGING_PROGRESS.md`, redact the old password string and replace with `[REDACTED — rotated prior to Phase 6]`.
4. Confirm rotation verbally in chat ("staging passwords rotated") — do not paste the new password.

---

## 1. Branch Strategy

```
main  ← approved release lands here at Gate 17
 └── stabilization  (Phase 5 merged: commit 971f4c7)
       └── phase-7-production-deployment  ← all Phase 6 work happens here
```

```bash
# One-time setup — do not run until plan is approved
git checkout stabilization
git pull origin stabilization
git checkout -b phase-7-production-deployment
git push -u origin phase-7-production-deployment
```

**Staging services (`phase-5-staging-deployment`) are preserved as-is.** No changes to staging Render service, staging Vercel projects, or staging Supabase project at any point during Phase 6.

---

## 2. Environment Isolation Matrix

| Layer | Staging | Production |
|---|---|---|
| Supabase project | `kjglykncjotsxoihupfe` | `pqlmgqzpjjllhgalyhwz` |
| Render service | `raza-stationers-api-staging` (preserved) | New service: `raza-stationers-api-prod` |
| Vercel Admin | `raza-stationers-admin-seven.vercel.app` (preserved) | New project: separate production project |
| Vercel Web | `raza-stationers-web.vercel.app` (preserved) | New project: separate production project |
| Git branch | `phase-5-staging-deployment` (preserved) | `phase-6-production-deployment` → `main` |
| JWT secret | Staging-only, rotated (Gate 0) | New production secret, never shared with staging |
| Database URLs | Staging Supabase only | Production Supabase only |
| Catalogue data | Staging catalogue (2167 products) | Production catalogue — same Excel source, verified by hash |

---

## 3. Final Change List (What Phase 6 Adds vs. Stabilization)

The following changes are **new** in Phase 6, beyond what is certified in `stabilization`. All are implemented in `phase-6-production-deployment`:

| # | Change | Rationale |
|---|---|---|
| 1 | Auth rate limiting on `POST /auth/login` and `POST /auth/register` | Correction 10 — mandatory before production |
| 2 | Lint-warning triage pass on `apps/admin` and `apps/web` | Correction 10 — 3,232 warnings are CI noise; must be triaged to block/warn/ignore categories |
| 3 | Production seeding script (no hardcoded passwords, prompt-based) | Correction 6 — password hygiene |
| 4 | Migration dry-run script | Correction 8 — validates SQL without applying |
| 5 | Catalogue hash verification script | Correction 7 — SHA-256 of Excel source vs. recorded hash |
| 6 | Idempotent import guard in `import_catalogue.js` | Correction 7 — safe to re-run without duplicating rows |
| 7 | Post-import reconciliation report script | Correction 7 — row counts, price totals, diff vs. staging |
| 8 | Production smoke test suite (read-safe + one append-only order) | Corrections 3, 9 |
| 9 | `docs/PHASE_6_PRODUCTION_PROGRESS.md` gate tracker | Standard |
| 10 | `docs/PHASE_6_PRODUCTION_CERTIFICATION.md` | Correction 12 |
| 11 | Monitoring/health alert configuration in `render.yaml` | Correction 10 |
| 12 | `docs/PHASE_6_ENVIRONMENT_ISOLATION.md` | Correction 2 |

---

## 4. Staging Regression Gate (Before Production Work Begins)

**Before any production changes, the staging stack must re-pass a full regression run to confirm it is still clean:**

```bash
node tests/run_staging_e2e.mjs     # must return 17/17
node tests/run_gate15_security.mjs  # must return 15/15
```

Pass criteria: both suites pass with 0 failures. Any regression must be fixed in `phase-6-production-deployment` and re-verified on staging before proceeding to production gates.

---

## 5. Gate Sequence

### Gate 1 — Branch and Pre-Flight

- [ ] Staging credential rotation confirmed verbally (see §0)
- [ ] `phase-6-production-deployment` created from `stabilization`
- [ ] `git status` clean, branch tip confirmed
- [ ] `PHASE_6_PRODUCTION_PROGRESS.md` created with all gates in `NOT_STARTED` state
- [ ] Staging regression run: `run_staging_e2e.mjs` 17/17, `run_gate15_security.mjs` 15/15

### Gate 2 — Code Changes in phase-6-production-deployment

All new code changes land here before production is touched:

**2a — Auth rate limiting**
- Implement `@nestjs/throttler` (or equivalent) on `POST /auth/login` and `POST /auth/register`
- Default: max 10 login attempts per IP per 15 minutes; max 5 register attempts per IP per hour
- Returns `429 Too Many Requests` on breach
- `apps/api` build must still pass

**2b — Lint-warning triage**
- Run `npm run lint --workspace=@raza-stationers/admin --workspace=@raza-stationers/web 2>&1`
- Categorize each warning class as: **BLOCK** (type errors, security issues), **WARN** (unused vars, `any`), **IGNORE** (next/image, third-party)
- Fix or suppress all **BLOCK** class warnings
- Document **WARN** and **IGNORE** classes in `docs/LINT_TRIAGE.md` — committed, never silenced globally

**2c — Migration dry-run script**
- `scripts/database/dry_run_migrations.js` — connects via `DIRECT_URL`, parses all `migration.sql` files in `packages/db/prisma/migrations/`, checks each against `_prisma_migrations` table, prints which would apply vs. skip
- Does NOT apply any SQL; read-only

**2d — Catalogue hash verification**
- `scripts/database/verify_catalogue_hash.js` — computes SHA-256 of `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`, compares to committed expected hash in `data/final/catalogue.sha256`
- Fails with non-zero exit code if hash mismatches
- `catalogue.sha256` committed to the branch from the Phase 3b-3c certified import

**2e — Import idempotency guard**
- Update `scripts/database/import_staging_catalogue.js` to be idempotent: before inserting a category/product/packaging/price row, check by natural key (e.g. SKU, category slug) whether it already exists; skip if present
- Add a `--dry-run` flag that prints what would be inserted/skipped without writing
- Add a post-import reconciliation: print expected counts vs. actual DB counts; exit non-zero if diff

**2f — Production seeder (no hardcoded passwords)**
- `scripts/database/seed_production_admin.js` — reads `PRODUCTION_ADMIN_PASSWORD` and `PRODUCTION_OWNER_PASSWORD` from environment variables only; refuses to run if either variable is unset; never logs the password values; never commits them
- Script is committed; env vars are set at Render/terminal runtime only

**2g — Production smoke test**
- `tests/run_production_smoke.mjs` — see §7 for policy

**2h — Rate limiting verification**
- `tests/run_gate16_rate_limit.mjs` — fires 11 sequential login requests with wrong credentials; asserts the 11th returns `429`

Pass criteria: `npm run build --workspace=@raza-stationers/api-server` clean, all new scripts exit 0 on dry-run against staging, lint BLOCK category empty.

### Gate 3 — Pre-Deploy Snapshot and Backup

**Owner action — no automation.**

> [!CAUTION]
> Take a full manual snapshot of the production Supabase project (`pqlmgqzpjjllhgalyhwz`) before any migration or data change. Use Supabase Dashboard → Database → Backups → Point-in-Time or manual export. Confirm the snapshot timestamp in chat. This is the rollback anchor.

- [ ] Production Supabase snapshot taken and timestamp confirmed
- [ ] Snapshot label recorded in `PHASE_6_PRODUCTION_PROGRESS.md`

### Gate 4 — Migration Dry-Run Against Production

Run the dry-run script against the production `DIRECT_URL`:

```bash
# DIRECT_URL set to production connection string in local .env.prod (never committed)
DIRECT_URL=<prod-direct-url> node scripts/database/dry_run_migrations.js
```

Pass criteria:
- Output lists every `migration.sql` file present in `packages/db/prisma/migrations/` at the approved `phase-6-production-deployment` HEAD commit (currently: the same set verified during Phase 3b/3c certification, plus any new ones added in Gate 2)
- Each migration is correctly classified as `PENDING` (not yet applied) or `APPLIED`
- Zero SQL errors reported in parse/simulation pass
- A migration is NEVER considered passing because a fixed count matches — it passes only when every file in the repo's migrations directory is accounted for in the output

> [!IMPORTANT]
> **The accepted migration set is defined by what is committed at HEAD of `phase-6-production-deployment`, not by any fixed number.** If Gate 2 adds new migrations, they are automatically included.

### Gate 5 — Controlled Production Migration Deployment

Migrations are applied via Prisma's deployment pipeline, not ad-hoc CLI:

```bash
# In the production environment only — executed via Render pre-deploy hook or manual step
# DIRECT_URL must point to production Supabase; DATABASE_URL must point to production pooler
npx prisma migrate deploy
```

**Pre-deploy hook option (preferred):** Configure `render.yaml` with a `preDeployCommand: npx prisma migrate deploy` so migrations run atomically before the new API container goes live. If the migration fails, Render rolls back to the previous deploy automatically.

Pass criteria:
- `prisma migrate status` on production shows all migrations as `Applied`
- `prisma migrate status` output is captured and appended to `PHASE_6_PRODUCTION_PROGRESS.md`
- Zero failed migrations

**Rollback plan:** If any migration fails, restore from the Gate 3 snapshot (Supabase Point-in-Time restore). Do not attempt to manually reverse SQL.

### Gate 6 — Catalogue Hash Verification

```bash
node scripts/database/verify_catalogue_hash.js
```

Pass criteria: SHA-256 of `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx` matches `data/final/catalogue.sha256`. If it does not match, stop — the source file has changed and the import cannot proceed until the hash is re-certified by the owner.

### Gate 7 — Production Catalogue Import (Idempotent)

```bash
# Dry run first
node scripts/database/import_staging_catalogue.js --env production --dry-run

# If dry run shows correct pending counts, run for real
node scripts/database/import_staging_catalogue.js --env production
```

Pass criteria:
- Reconciliation report shows counts matching the certified staging baseline:
  - Categories: matches count in `phase-5-staging-deployment` certification
  - Products: matches count
  - Packaging units: matches count
  - Prices: matches count
- Zero errors or skipped rows due to data issues
- Re-running the import a second time produces zero new insertions (idempotency check)

### Gate 8 — Production Admin Seeding

```bash
# PRODUCTION_ADMIN_PASSWORD and PRODUCTION_OWNER_PASSWORD set in terminal session only
# Never passed as arguments, never echoed, never logged
PRODUCTION_ADMIN_PASSWORD=<> PRODUCTION_OWNER_PASSWORD=<> node scripts/database/seed_production_admin.js
```

> [!CAUTION]
> **Passwords must never appear in chat, git history, terminal scroll-back, CI logs, or documentation.** Set them in a local terminal session using `$env:PRODUCTION_ADMIN_PASSWORD = (Read-Host -AsSecureString "Admin password" | ConvertFrom-SecureString -AsPlainText)` pattern on Windows PowerShell. Confirm seeding succeeded with a `[PASS]` message only.

### Gate 9 — Production API Deployment (Separate Render Service)

**Manual owner action — new Render web service, not the staging service:**

1. Create a new Render web service `raza-stationers-api-prod`
2. Connect it to the repository, branch: `phase-6-production-deployment` (later updated to `main` post-merge)
3. Set environment variables (Render dashboard only — never in code or docs):
   - `DATABASE_URL` → production Supabase pooler URL
   - `DIRECT_URL` → production Supabase direct URL
   - `JWT_SECRET` → new production secret (distinct from staging)
   - `CORS_ORIGINS` → production Vercel URLs (set after Gate 10)
   - `NODE_ENV=production`
   - `PORT=4000`
4. Configure `preDeployCommand: npx prisma migrate deploy` in Render service settings (ensures Gate 5 re-runs on every deploy)
5. Configure health check path: `/` (returns `{ status: ok }`)
6. Configure failure threshold: 3 consecutive failures = alert

Pass criteria:
- `GET https://<prod-api>.onrender.com/` returns `{ status: "ok", database: "connected", version: "0.1.0" }`
- Response time under 2s on warm instance

### Gate 10 — Production Vercel Deployment (Separate Projects)

**Manual owner action — new Vercel projects, not the staging projects:**

Create two new Vercel projects:
- `raza-stationers-admin-prod` connected to repo, branch `phase-6-production-deployment`
- `raza-stationers-web-prod` connected to repo, branch `phase-6-production-deployment`

Set environment variables (Vercel dashboard only):
- `NEXT_PUBLIC_API_URL` → `https://<prod-api>.onrender.com`
- `NODE_ENV=production`

After first successful deploy, obtain the Vercel production URLs and:
1. Update Render `CORS_ORIGINS` to include the two production Vercel URLs
2. Trigger Render redeploy to apply new CORS configuration

Pass criteria:
- Both Vercel builds succeed from `phase-6-production-deployment`
- `GET https://<admin-prod>.vercel.app` returns HTTP 200
- `GET https://<web-prod>.vercel.app` returns HTTP 200

### Gate 11 — Custom Domain Configuration (If Applicable)

If custom domains are ready (e.g. `admin.razastationers.com`, `www.razastationers.com`):
- Configure DNS CNAME records pointing to Vercel
- Configure custom domain in each Vercel project
- Verify TLS certificate provisioned
- Update Render `CORS_ORIGINS` to include the custom domain URLs (in addition to Vercel URLs)

If custom domains are not ready, document this as deferred and proceed to Gate 12.

### Gate 12 — CORS Verification (Production Origins)

```bash
node -e "
const origins = ['https://<admin-prod>.vercel.app','https://<web-prod>.vercel.app'];
Promise.all(origins.map(o => fetch('https://<prod-api>.onrender.com/', {
  method:'OPTIONS',
  headers:{'Origin':o,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type'}
}).then(r => ({origin:o,status:r.status,acao:r.headers.get('access-control-allow-origin'),acac:r.headers.get('access-control-allow-credentials')}))
)).then(r => console.log(JSON.stringify(r,null,2)));
"
```

Pass criteria: both origins return `status: 204`, `acao` matches the origin exactly, `acac: "true"`.

### Gate 13 — Environment Isolation Verification

Confirm no cross-contamination between staging and production:

- [ ] Production `DATABASE_URL` connects to `pqlmgqzpjjllhgalyhwz` (not `kjglykncjotsxoihupfe`)
- [ ] Production Render service uses distinct JWT_SECRET from staging
- [ ] Staging Vercel projects still point to staging API (not production)
- [ ] Production Vercel projects point to production API (not staging)
- [ ] Running `GET /` on staging API still returns `database: connected` to staging DB
- [ ] Running `GET /` on production API returns `database: connected` to production DB

### Gate 14 — Rate Limiting Verification

```bash
node tests/run_gate16_rate_limit.mjs --target https://<prod-api>.onrender.com
```

Pass criteria: 11th failed login attempt returns `429 Too Many Requests` with no stack trace in body.

### Gate 15 — Security Audit (Production Target)

```bash
node tests/run_gate15_security.mjs --target https://<prod-api>.onrender.com
```

Pass criteria: all 15 assertions pass — same as staging Gate 15, against the production endpoint.

### Gate 16 — Production Smoke Test

See §7 for full policy.

```bash
node tests/run_production_smoke.mjs --target https://<prod-api>.onrender.com
```

Pass criteria: all assertions pass with zero failures.

### Gate 17 — Owner Acceptance

Owner manually verifies:
- Production storefront loads at the production URL
- Admin login succeeds with production credentials (confirmed in private — not in chat)
- At least one product is browseable in the catalogue
- The test order created in Gate 16 is visible in the admin order queue

Owner confirms in chat: "production accepted" (no credentials, no passwords).

### Gate 18 — Merge into main

**This is the only merge into main. Phase 5 was merged into stabilization. Phase 6 merges stabilization + Phase 6 changes into main.**

```bash
# After Gate 17 owner acceptance
git checkout main
git merge --no-ff phase-6-production-deployment -m "feat(production): Phase 6 — Production Deployment certified and accepted"
git tag -a milestone/phase-6-production-v1.0 -m "Phase 6 production deployment certified"
git push origin main --tags
```

After merge:
- Update production Render service to deploy from `main` (not `phase-6-production-deployment`)
- Update production Vercel projects to deploy from `main`
- Verify both services redeploy cleanly from `main`

### Gate 19 — Post-Deployment Certification

- [ ] Final run of `run_production_smoke.mjs` against production (now serving from `main`)
- [ ] `PHASE_6_PRODUCTION_CERTIFICATION.md` written and committed to `main`
- [ ] All gate results appended to `PHASE_6_PRODUCTION_PROGRESS.md`
- [ ] Secret rotation schedule documented (JWT secret, DB passwords: rotate every 90 days)
- [ ] Monitoring alert documented: Render health-check failure → notify owner

---

## 6. Monitoring and Operations

**Render built-in health check** (configured at Gate 9):
- Path: `/` — checks DB connectivity
- Failure threshold: 3 consecutive failures
- Alert channel: Render email notifications to owner's email

**Manual observability baseline** (no external tool required for v1):
- Weekly: check Render service logs for error spikes
- Weekly: check Supabase dashboard for slow query reports
- On-demand: `GET /` health endpoint returns version + DB status

**Post-launch secret rotation schedule** (documented, not automated):
- `JWT_SECRET`: rotate every 90 days (coordinated deploy — all active sessions expire on rotation)
- Database passwords: rotate per Supabase scheduled rotation or on any suspected breach
- Document each rotation in `docs/SECRET_ROTATION_LOG.md` (date, what was rotated, who performed — no values)

---

## 7. Production Smoke Test Policy

**Guiding principle:** The production database contains real business data. The smoke test must be safe by design.

**Read-only checks (no side effects):**
- `GET /` → health + DB connected
- `POST /auth/login` (admin credentials) → JWT returned
- `GET /users/me` → role confirmed
- `GET /admin/products` → product count > 0 (sanity check)
- `GET /pricing/resolve/<first-valid-sku>` → effective price returned
- `GET /users/me` without token → 401

**One controlled write (append-only order):**
- `POST /orders` — places a single clearly-labelled test order with a `notes` field set to `"SMOKE_TEST — cancel immediately"` so it is identifiable in the admin order queue
- The order is intentionally left in `pending_review` state — it does NOT transition to confirmed
- Owner manually cancels/rejects this order in the admin panel after Gate 17

**Explicitly excluded from smoke test:**
- `POST /auth/register` (avoids polluting production user table)
- `PUT /clients/:id/approve` (avoids approving a test client in production)
- `PUT /orders/:id/status → confirmed` (avoids triggering stock deduction)
- Any destructive or irreversible operation

---

## 8. Rollback Plan

| Scenario | Rollback Action |
|---|---|
| Migration fails during `prisma migrate deploy` | Render auto-rolls back to previous image; restore DB from Gate 3 snapshot if schema was partially altered |
| Catalogue import corrupts data | Run idempotent import with `--dry-run` to assess; restore from Gate 3 snapshot if rows are wrong |
| Production API returns 500 on health check after deploy | Render rolls back to previous deploy (keep 1 previous version pinned) |
| Vercel build fails | Vercel auto-holds previous deployment; fix in branch and redeploy |
| CORS misconfiguration | Update `CORS_ORIGINS` in Render dashboard → redeploy (< 5 minutes) |

---

## 9. Open Questions (Resolve Before Execution)

> [!IMPORTANT]
> **Q1 — Custom domains:** Are production custom domains (`razastationers.com`, `admin.razastationers.com`) ready for Gate 11, or should Gate 11 be deferred and the Vercel URLs used permanently for now?

> [!IMPORTANT]
> **Q2 — Monitoring budget:** Is a paid monitoring service (e.g. Better Uptime, Cronitor) in scope for v1, or is Render's built-in health-check alert sufficient for launch?

> [!NOTE]
> **Q3 — Test order cleanup:** After Gate 16's smoke-test order appears in the admin queue, will you cancel it manually, or should the smoke test also send a `PUT /orders/:id/status → cancelled` call (requires verifying that `pending_review → cancelled` is a valid state machine transition)?

> [!NOTE]
> **Q4 — Lint BLOCK threshold:** The triage pass in Gate 2b may uncover TypeScript type errors that require real fixes. How much time is acceptable for lint remediation before it becomes a blocker? Recommended: fix all type errors, suppress `any` warnings with inline `// eslint-disable-next-line` where intentional, cap total remediation at 1 session.
