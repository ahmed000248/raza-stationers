# Phase 5 Staging & Deployment Certification Report

This document certifies that the Phase 5 Staging Deployment, Database Preparation, and Production Readiness verification for Raza Stationers has been completed successfully.

---

## 1. Environment Verification

* **Staging Database Project**: Supabase project `kjglykncjotsxoihupfe` (Region: `ap-southeast-1`)
* **Staging API Server**: Deployed on Render container hosting
  * Live URL: `https://raza-stationers-api-staging.onrender.com`
  * Health Endpoint: `GET /` → `{ status: "ok", version: "0.1.0", services: { database: "connected" } }`
* **Staging Vercel Admin Dashboard**: `https://raza-stationers-admin-seven.vercel.app`
* **Staging Vercel Customer Storefront**: `https://raza-stationers-web.vercel.app`
* **Git Branch**: `phase-5-staging-deployment` (Clean working tree)

---

## 2. Database Preparation & Catalogue Ingestion

The staging database was fully initialized and populated using isolated staging scripts:

1. **Migrations**: Applied all 7 database migration scripts using Prisma CLI to deploy all tables, enums, triggers, and sequences on the staging schema.
2. **Administrative Credentials**: Seeded the default admin and owner user records with a secure known password (`StagingAdmin@2024`) via `scripts/database/set_staging_passwords.js`.
3. **Workbook Ingestion**: Executed `scripts/database/import_staging_catalogue.js` to parse and load the certified production-ready catalogue Excel workbook (`data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`).
   * **103 categories** successfully created.
   * **2,167 products** successfully created.
   * **2,167 packaging structures** successfully created.
   * **4,334 prices** successfully committed.
   * **0 validation errors or warnings** — identical ingestion fidelity to production requirements.

---

## 3. CORS Preflight Verification

Cross-Origin Resource Sharing (CORS) was configured dynamically on the NestJS API via Render environment variables. Preflight `OPTIONS` requests from Vercel origins were verified successfully:

```json
[
  {
    "origin": "https://raza-stationers-admin-seven.vercel.app",
    "status": 204,
    "acao": "https://raza-stationers-admin-seven.vercel.app",
    "acac": "true"
  },
  {
    "origin": "https://raza-stationers-web.vercel.app",
    "status": 204,
    "acao": "https://raza-stationers-web.vercel.app",
    "acac": "true"
  }
]
```

---

## 4. Security & Performance Audit

A comprehensive stateless security suite (`tests/run_gate15_security.mjs`) was executed against the live API, certifying the following behaviors:

* **Authentication Guards**: Unauthenticated requests to protected endpoints (`/users/me`, `/clients`, `/admin/products`) return `401 Unauthorized`. Malformed JWT tokens are rejected immediately.
* **Role-Based Access Control (RBAC)**: Non-admin users are strictly blocked (`403 Forbidden`) from admin routes (`GET /admin/products`) and owner actions (`PUT /clients/:id/approve`).
* **Error Sanitization**: Database schemas, credentials, and internal NestJS stack traces are fully stripped from error payloads (e.g. wrong password login, invalid route 404).
* **Null Password Bugfix**: Corrected `auth.service.ts` to reject null/non-string password values with a clean `401 Unauthorized` instead of crashing with a `500 Internal Server Error` during bcrypt parsing.
* **Pagination Safety Clamping**: Upgraded `catalogue.service.ts` to clamp pagination query limits to a maximum value of `100` items server-side, preventing database memory exhaustion from excessive page size requests.
* **Performance Response Baselines**:
  * Health check API path: `129ms`
  * Authentication login path: `703ms`
  * Paginated products list (20 items): `1099ms` (includes Render cold start path)

---

## 5. Staging E2E Certification Output

The staging integration test suite (`tests/run_staging_e2e.mjs`) was executed directly against the live environment. All **17 assertions passed successfully** with zero errors:

```
══════════════════════════════════════════════════════════════
  Gate 14 — Staging E2E Integration Tests
  Target: https://raza-stationers-api-staging.onrender.com
══════════════════════════════════════════════════════════════

── 1. Health Check ──────────────────────────────────────────
  [PASS] GET /  →  status=ok  database=connected

── 2. Authentication ────────────────────────────────────────
  [PASS] POST /auth/login (admin)
  [PASS] POST /auth/login (owner)
  [PASS] GET /users/me  →  role=admin

── 3. User Registration ─────────────────────────────────────
  [PASS] POST /auth/register  →  id=cms9izdie000901d0isnvb5hu

── 4. Client Business ───────────────────────────────────────
  [PASS] POST /clients  →  id=cms9izdp6000a01d09v5ukxy0
  [PASS] GET /clients  →  total=2
  [PASS] PUT /clients/:id/approve  →  active
  [PASS] PUT /clients/:id/credit
  [PASS] GET /clients/:id/credit  →  limit=50000

── 5. Catalogue ─────────────────────────────────────────────
  [PASS] GET /admin/products  →  2167 total products

── 6. Pricing Resolution ────────────────────────────────────
  [PASS] GET /pricing/resolve/RS-001574  →  effectivePrice=50

── 7. Order Lifecycle ────────────────────────────────────────
  [PASS] Found packaging id for RS-001574: cms9ict6h02yquowgac24fnny
  [PASS] POST /orders  →  id=cms9izg6g000e01d030dnpptf
  [PASS] GET /orders/:id  →  status=pending_review
  [PASS] PUT /orders/:id/status  →  confirmed

── 8. Auth Guard ────────────────────────────────────────────
  [PASS] GET /users/me without token  →  401

── Cleanup ──────────────────────────────────────────────────
  [Skip cleanup] order: order_status_history is append-only; DELETE is not permitted
  [Skip cleanup] business: Foreign key constraint violated (dependent order history)
  [Skip cleanup] user: Foreign key constraint violated (dependent order history)

══════════════════════════════════════════════════════════════
  Results: 17 passed, 0 failed
══════════════════════════════════════════════════════════════
```

---

## 6. Recommendations for Production Rollout (Phase 6)

1. **Database Credentials**: Ensure the production environment uses a separate, strong database password and connection pooler settings matching project ID `pqlmgqzpjjllhgalyhwz`.
2. **CORS Origins configuration**: Update `CORS_ORIGINS` in the production environment variables to point to the canonical production web and admin URLs.
3. **Database Seeding**: Run production admin seeding using unique credentials. Never reuse the staging passwords (`StagingAdmin@2024`) in the production database.
4. **Environment Variables**: Double-check that all client-exposed configurations do not contain secrets and only reveal the canonical production API endpoint.
