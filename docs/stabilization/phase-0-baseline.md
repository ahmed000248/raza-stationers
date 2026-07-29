# Phase 0 Baseline & System Inventory

**Execution Date**: 2026-07-30  
**Branch**: `stabilization`  
**Git Commit SHA**: `48dfb04b29e4f543455b6386e57f5e5f10e4f7b8`  
**Git Working Tree Status**: `Clean (0 uncommitted changes)`  
**Operating Environment**: Windows 11 Home / PowerShell 7.x  

---

## 1. Environment & Runtime Parameters

- **Node.js Version**: `v24.16.0`
- **Package Manager / npm**: `11.13.0`
- **Lockfile Used**: `package-lock.json` (npm workspaces)
- **Prisma Version**: `7.9.0`
- **Framework Versions**:
  - NestJS API Server: `^11.0.0`
  - Next.js Admin Panel (`apps/admin`): `16.2.11` (Turbopack, React 19)
  - Next.js Web Storefront (`apps/web`): `16.2.11` (Turbopack, React 19)
- **Database Provider**: PostgreSQL `17.6` on Supabase Development Pooler (`aws-0-ap-northeast-1.pooler.supabase.com:5432`)

---

## 2. Workspace & Monorepo Structure

```
.
├── apps/
│   ├── admin/             # Next.js 16 Admin Panel (@raza-stationers/admin)
│   ├── api/               # NestJS 11 Backend API (@raza-stationers/api-server)
│   ├── mobile/            # React Native / Expo Mobile App Scaffold (@raza-stationers/mobile)
│   └── web/               # Next.js 16 Customer Storefront (@raza-stationers/web)
├── packages/
│   ├── api/               # Shared API client SDK (@raza-stationers/api)
│   ├── db/                # Prisma schema & catalogue importer (@raza-stationers/db)
│   ├── types/             # Shared TypeScript types (@raza-stationers/types)
│   ├── ui/                # Shared UI design tokens & components (@raza-stationers/ui)
│   └── validation/        # Zod validation schemas (@raza-stationers/validation)
├── data/
│   ├── archive/           # Archived legacy spreadsheets (NOT FOR IMPORT)
│   ├── final/             # Approved business master: Raza-Stationers-Final-Supabase-Catalogue.xlsx
│   └── source/            # Original PDF price lists
└── docs/
    ├── reviews/           # Audit reports & reconciliation CSVs
    └── stabilization/     # Phase 0 stabilization inventory (Inspection Only)
```

---

## 3. Migration History

Physical Migration Directories in `packages/db/prisma/migrations`:
1. `20260726162130_initial_schema_v0_1`
2. `20260727021642_supabase_runtime_security`
3. `20260727022832_supabase_function_default_privileges`
4. `20260727150435_add_buying_price_type`
5. `20260727190918_add_business_settings`

*Note on `_prisma_migrations` Table*: 6 rows exist in the database because migration `20260727021642_supabase_runtime_security` failed on attempt 1 (`finished_at: null`) before succeeding on attempt 2.

---

## 4. Required Environment Variables

The application requires the following environment variables (defined in `.env` at workspace root):
- `DATABASE_URL`: Connection string for PostgreSQL transaction pooler (Port 6543)
- `DIRECT_URL`: Direct session connection string for migrations (Port 5432)
- `JWT_SECRET`: Secret key for signing backend JWT authentication tokens
- `PORT` / `API_PORT`: API server listening port (Default: `4000`)
- `NEXT_PUBLIC_API_URL`: Backend API URL consumed by Next.js frontends (Default: `http://localhost:4000`)
- `NODE_ENV`: Runtime environment (`development`, `production`, `test`)

---

## 5. Current Known System Limitations

1. **Catalogue Importer Safety**: Current import script (`packages/db/src/importer/cli.ts`) is designed for legacy CSV format (`catalogue-products.csv`) and is considered **incompatible / unsafe** for the newly approved `Raza-Stationers-Final-Supabase-Catalogue.xlsx` until Phase 3 refactoring.
2. **Frontend Authentication Storage**: Auth tokens are stored in browser `localStorage`, making sessions sensitive to client-side script access until httpOnly cookies or secure token storage are implemented.
3. **Hardcoded Fallbacks**: JWT strategy contains fallback secret `"raza-stationers-jwt-secret-dev"` if `JWT_SECRET` is unset.
4. **Linting Debt**: `apps/admin` and `apps/web` have 3,232 total ESLint warnings/errors (mostly unused variables, explicit `any`, missing React hook dependencies, and un-optimized `<img>` elements).
5. **No Automated Test Framework**: Monorepo root and packages lack configured Jest/Vitest test runner scripts in `package.json`.
