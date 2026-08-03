# Phase 1 Reproducibility & Setup Guide — Raza Stationers

**Phase**: Phase 1 Reproducible Project  
**Branch**: `phase-1-reproducible`  
**Execution Date**: 2026-07-30  
**Status**: `VERIFIED & COMPLETE`  

---

## 1. Supported Prerequisites

- **Node.js**: `>=20.19.0` (Required by Prisma 7.9; verified on `v24.16.0`)
- **npm**: `>=9.0.0` (Verified on `11.13.0`)
- **Prisma CLI / Client**: `7.9.0`
- **Lockfile Authority**: `package-lock.json` (npm Workspaces)
- **Operating Systems**: Windows 10/11, macOS, Linux

---

## 2. Clean-Clone Setup Commands

Follow these deterministic steps to set up a fresh checkout of the repository:

```bash
# 1. Clone the repository and checkout branch
git clone https://github.com/ahmed000248/raza-stationers.git
cd "Raza Stationers"
git checkout phase-1-reproducible

# 2. Perform a clean frozen dependency installation
npm ci

# 3. Copy environment configuration template
cp .env.example .env

# 4. Supply required JWT_SECRET in .env (Application startup fails if missing)
# Edit .env and set: JWT_SECRET=your_secure_random_jwt_secret_token

# 5. Run the complete automated verification pipeline
npm run verify
```

---

## 3. Environment Variable Names & Configuration

The application requires the following environment variables defined in `.env`:

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | Optional | `4000` | NestJS API Server listening port |
| `NEXT_PUBLIC_API_URL` | Required | `http://localhost:4000` | Backend API URL consumed by Next.js frontends |
| `JWT_SECRET` | **REQUIRED** | None | Secret key for signing backend JWT tokens (No fallback permitted) |
| `DATABASE_URL` | Required | Supabase Pooler | Connection string for PostgreSQL transaction pooler (Port 6543) |
| `DIRECT_URL` | Required | Supabase Direct | Direct session connection string for Prisma migrations (Port 5432) |

---

## 4. Standardized Root NPM Commands

| Command | Action / Target | Description |
| :--- | :--- | :--- |
| `npm run db:validate` | `npx prisma validate` | Validates Prisma schema (`packages/db/prisma/schema.prisma`) |
| `npm run db:generate` | `npx prisma generate` | Generates Prisma Client v7.9.0 into `node_modules/@prisma/client` |
| `npm run typecheck` | `npm run typecheck --workspaces` | Runs `tsc --noEmit` across all 9 workspaces to verify type safety |
| `npm run lint` | `npm run lint --workspaces` | Runs ESLint across `@raza-stationers/admin` and `@raza-stationers/web` |
| `npm run test` | `echo ...` | Reports `NOT CONFIGURED` cleanly (Future task logged for Jest/Vitest) |
| `npm run build` | `npm run build --workspaces` | Compiles production builds for Next.js web, admin, NestJS api, and TS packages |
| `npm run verify` | Complete Pipeline | Executes `db:validate && db:generate && typecheck && lint && build` in sequence |

---

## 5. Database Safety Guardrails

- **No Schema Mutation**: Schema alterations must use reviewable forward-only Prisma migrations (`npx prisma migrate dev`).
- **No Production Access**: Production database connection strings must never be committed to repository source code or default `.env` files.
- **No Destructive Commands**: `prisma migrate reset`, `prisma db push --force-reset`, and table truncations are strictly forbidden.
- **Catalogue Import Isolation**: Dry-run catalogue seeding is restricted to future Phase 3 tasks.

---

## 6. Testing Infrastructure Status

- **Status**: `OPEN / DEFERRED (NOT CONFIGURED)`
- **Details**: No automated unit/integration test framework (Jest/Vitest) is currently configured in `package.json`.
- **Honest Reporting**: `npm run test` explicitly outputs:  
  `Testing is NOT CONFIGURED for this workspace. See docs/stabilization/phase-1-reproducibility.md`
- **Future Task**: Configure Vitest / Jest test runner in Phase 2 for unit testing backend services and React UI components.

---

## 7. Categorization of 143 Remaining Warnings

ESLint execution produces **0 ERRORS** and **143 TOTAL WARNINGS** across the monorepo (72 in `@raza-stationers/admin`, 71 in `@raza-stationers/web`):

| Warning Category | Rule ID | Count | Root Cause / Context |
| :--- | :--- | :--- | :--- |
| **TypeScript Any Usage** | `@typescript-eslint/no-explicit-any` | 69 | Explicit `any` type annotations in React component handlers recorded for a later code-quality/application phase (Phase 2 is strictly catalogue certification) |
| **React 19 Effect State** | `react-hooks/set-state-in-effect` | 17 | React 19 compiler hints for calling `setState` inside mount effects to synchronize local storage or props |
| **Unused Variables** | `@typescript-eslint/no-unused-vars` | 51 | Unused import or function parameter names not prefixed with `_` |
| **Effect Dependencies** | `react-hooks/exhaustive-deps` | 5 | React Hook dependency array recommendations |
| **Memoization Optimization** | `react-hooks/preserve-manual-memoization` | 1 | React 19 compiler note on manual memoization in `action-search-bar.tsx` |

---

## 8. Troubleshooting Setup Failures

| Failure / Error | Cause | Solution |
| :--- | :--- | :--- |
| `Error: JWT_SECRET environment variable is missing` | Missing `JWT_SECRET` in `.env` | Copy `.env.example` to `.env` and set `JWT_SECRET=your_jwt_secret_token` |
| `@prisma/client has no exported member` | Prisma Client not generated post `npm ci` | Run `npm run db:generate` |
| `TypeError: Do not know how to serialize a BigInt` | Raw Prisma model stringified by Express | Endpoint must use `JSON.stringify` with BigInt string replacer |
| `TLS / certificate error` | Node.js `pg` driver connecting to Supabase | Configure the approved CA certificate and full hostname verification; never bypass certificate validation |

---

## 9. Phase 1 Issue Resolution Table

| Issue ID | Description | Resolution Status | Phase 1 Evidence / Outcome |
| :--- | :--- | :--- | :--- |
| **ISSUE-02** | JWT fallback secret in backend | **RESOLVED** | Removed hardcoded fallback `"raza-stationers-jwt-secret-dev"` from `auth.module.ts` and `jwt.strategy.ts`. App now throws clear startup error if `JWT_SECRET` is missing. |
| **ISSUE-04** | Admin panel ESLint errors | **RESOLVED** | Fixed 49 ESLint errors in `@raza-stationers/admin` (unescaped entities, conditional hooks, strict rules). **0 errors remaining**. |
| **ISSUE-05** | Storefront ESLint errors | **RESOLVED** | Excluded vendored GSAP code (`src/lib/gsap/**`) in `eslint.config.mjs` and resolved code defects in `@raza-stationers/web`. **0 errors remaining**. |
| **ISSUE-06** | Lack of test script & testing report | **OPEN / DEFERRED** | Standardized `npm run test` to report `NOT CONFIGURED` honestly. Automated test framework setup deferred to future task. |

---

## 10. Deferred Issues Summary

- **ISSUE-01**: Catalogue Importer Incompatibility → Deferred to **Phase 3** (Dry-run reconciliation & importer refactoring).
- **ISSUE-03**: Browser `localStorage` Authentication Tokens → Deferred to **Phase 5** (Security hardening & httpOnly session cookies).
- **ISSUE-06**: Automated Unit & Integration Test Framework → **OPEN / DEFERRED** (Future task logged for Vitest/Jest).
- **ISSUE-07**: Admin Mock Category Fallback → Deferred to later application phase.
- **ISSUE-08**: Customer Multi-Device Cart Persistence → Deferred to later storefront phase.
- **ISSUE-09**: Branded Placeholder Imagery → Deferred to later UI phase.
