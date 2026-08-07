# Legacy Backend Removal Report

## 1. Starting state

* **Source branch:** `phase-10-finalizing`
* **Starting commit:** `e58ac7a7bb2e5c982aa1a07bbae7482fa789aa5e`
* **Cleanup branch:** `cleanup/remove-legacy-backend`
* **Date:** 2026-08-07
* **Initial working-tree status:** Clean working tree prior to preflight branch creation.

## 2. Backend inventory

### Applications
* `apps/api/` (NestJS 11 backend server with controllers, modules, services, prisma integration, auth guards, better-auth handlers, swagger configuration)

### Packages
* `packages/api/` (Shared HTTP client and BetterAuth client SDK)
* `packages/db/` (Prisma schema, migrations, PostgreSQL connection pool, catalogue importer)

### Authentication
* BetterAuth integration in `apps/api`, `packages/api`, `apps/web/src/hooks/use-auth.tsx`, `apps/admin/src/hooks/use-admin-auth.tsx`
* BetterAuth proxies in `apps/web/src/app/api/auth/[...all]/route.ts` and `apps/admin/src/app/api/auth/[...all]/route.ts`
* Auth pages in `apps/web/src/app/signin`, `signup`, `forgot-password`, `reset-password`, `verify`, `register`, `onboarding`
* Admin auth in `apps/admin/src/app/login` and login modal/guards
* Session management and cookies in Next.js middleware / auth hooks

### Database
* Prisma schema in `packages/db/prisma/schema.prisma` and root `prisma.config.ts`
* 14 database migrations in `packages/db/prisma/migrations/`
* PostgreSQL connection and query logic in `packages/db/src/postgres.ts`
* Importer script writing to DB in `packages/db/src/importer/`

### Proxy routes & rewrites
* `apps/web/src/app/api/backend/[...path]/route.ts`
* `apps/admin/src/app/api/backend/[...path]/route.ts`
* `apps/web/src/app/api/auth/[...all]/route.ts`
* `apps/admin/src/app/api/auth/[...all]/route.ts`
* Rewrites in `apps/web/next.config.ts` and `apps/admin/next.config.ts`

### Deployment
* `Dockerfile`
* `render.yaml`
* `compose.yaml`
* `supabase-ca.crt`

### Mobile backend
* `apps/mobile/server.ts` (Express server proxying mock endpoints)

### Scripts & Tests
* Database scripts in `scripts/admin/bootstrap-owner.mjs`, `scripts/database/*`
* Verification scripts targeting DB/auth in `scripts/production/*`
* Backend and integration tests in `tests/phase7/`, `tests/phase8/`, `tests/phase9/`, `tests/integration/`, `tests/importer/`

### Environment variables
* Root `.env.example` containing `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_*`, `JWT_SECRET`, `BETTER_AUTH_*`, `GOOGLE_CLIENT_*`, `SMTP_*`, `NEXT_PUBLIC_API_URL`, `API_URL`

## 3. Deleted files

### API backend (`apps/api/`)
* Entire directory `apps/api/` (NestJS application, modules, controllers, services, guards, decorators)

### Shared packages (`packages/api/`, `packages/db/`)
* Entire directory `packages/api/` (HTTP API client SDK & BetterAuth client)
* Entire directory `packages/db/` (Prisma schema, PostgreSQL driver, migrations, importer)

### Database & Deployment configuration
* `prisma.config.ts`
* `supabase-ca.crt`
* `Dockerfile`
* `render.yaml`
* `compose.yaml`
* `apps/mobile/server.ts`

### Next.js API Proxy Routes
* `apps/web/src/app/api/auth/[...all]/route.ts`
* `apps/web/src/app/api/backend/[...path]/route.ts`
* `apps/admin/src/app/api/auth/[...all]/route.ts`
* `apps/admin/src/app/api/backend/[...path]/route.ts`

### Authentication-only pages
* `apps/web/src/app/signin/page.tsx`
* `apps/web/src/app/signup/page.tsx`
* `apps/web/src/app/forgot-password/page.tsx`
* `apps/web/src/app/reset-password/page.tsx`
* `apps/web/src/app/onboarding/page.tsx`
* `apps/web/src/app/register/page.tsx`
* `apps/admin/src/app/login/page.tsx`
* `apps/admin/src/components/shell/TotpEnrollView.tsx`
* `apps/admin/src/components/shell/TotpChallengeView.tsx`

### Backend scripts & tests
* `scripts/admin/bootstrap-owner.mjs`
* `scripts/database/migrate_legacy_auth.mjs`
* `scripts/database/reconcile-production-readonly.mjs`
* `scripts/production/verify-api-security.mjs`
* `scripts/production/verify-auth-matrix.mjs`
* `scripts/production/verify-deployments.mjs`
* `scripts/production/verify-production-database.mjs`
* `scripts/production/verify_auth_correct.mjs`
* `scripts/production/verify_business_readiness.mjs`
* `scripts/production/verify_route_security.mjs`
* `scripts/production/verify_web_admin_availability.mjs`
* `tests/importer/`
* `tests/integration/`
* `tests/phase7/`
* `tests/phase8/`
* `tests/phase9/`
* `tests/helpers/`
* `tests/run_all_tests_disposable.mjs`

## 4. Modified files

* `package.json`: Updated monorepo workspace scripts (`dev:all`, `build`, `build:runtime-packages`, `typecheck`, `lint`, `verify`). Removed backend devDependencies (`prisma`, `axios`, `form-data`, `jsonwebtoken`, `kysely`, `@better-auth/infra`).
* `apps/web/package.json`: Removed `@raza-stationers/api` and `better-auth` dependencies.
* `apps/admin/package.json`: Removed `@raza-stationers/api`, `better-auth`, `@better-auth/infra`, `qrcode`, `@types/qrcode`.
* `apps/mobile/package.json`: Converted to pure Vite application. Removed `express`, `dotenv`, `esbuild`, `tsx`, `@types/express`, `@google/genai`. Updated scripts to standard `vite` / `vite build`.
* `apps/web/next.config.ts`: Removed backend API rewrites function and `@raza-stationers/api` transpile package.
* `apps/admin/next.config.ts`: Removed backend API rewrites function and `@raza-stationers/api` transpile package.
* `apps/web/tsconfig.json`: Removed `@raza-stationers/api` path alias mapping.
* `apps/admin/tsconfig.json`: Removed `@raza-stationers/api` path alias mapping.
* `apps/web/src/hooks/use-auth.tsx`: Refactored into a clean frontend-only auth context stub returning guest state without network calls or API dependencies.
* `apps/admin/src/hooks/use-admin-auth.tsx`: Refactored into a clean frontend-only admin auth stub returning an authenticated owner state so admin panel UI pages are directly accessible for local review.
* `apps/web/src/lib/public-config.ts` & `apps/admin/src/lib/public-config.ts`: Decoupled from `NEXT_PUBLIC_API_URL` environment variables.
* `apps/web/src/middleware.ts` & `apps/admin/src/middleware.ts`: Refactored into pass-through middlewares without cookie or authentication checks.
* `apps/mobile/src/lib/api.ts`: Updated to directly filter local `PRODUCTS` fixture and return mock order payloads without making HTTP calls to `/api/*`.
* `apps/web/src/components/home/FeaturedSection.tsx`, `apps/web/src/app/catalogue/page.tsx`, `apps/web/src/app/product/[id]/page.tsx`, `apps/web/src/app/orders/page.tsx`, `apps/web/src/app/orders/[id]/page.tsx`, `apps/web/src/app/order-confirmation/[id]/page.tsx`, `apps/web/src/app/checkout/page.tsx`, `apps/web/src/app/account/page.tsx`: Decoupled from `@raza-stationers/api`, displaying local static mock data or explicit disabled mutation states.
* `apps/admin/src/app/dashboard/page.tsx`, `apps/admin/src/app/catalogue/page.tsx`, `apps/admin/src/app/accounting/page.tsx`, `apps/admin/src/app/client-businesses/page.tsx`, `apps/admin/src/app/delivery/page.tsx`, `apps/admin/src/app/audit-log/page.tsx`: Decoupled from `@raza-stationers/api`, displaying local dashboard UI with non-blocking disabled mutation banners.
* `apps/admin/src/components/shell/AdminShell.tsx`: Removed TOTP MFA enrollment & challenge gates.
* `.env.example`, `apps/web/.env.local.example`, `apps/admin/.env.local.example`, `apps/mobile/.env.example`: Replaced with clean frontend-only env notices.
* `README.md`: Documented intentional removal of legacy backend and temporary frontend-only state.

## 5. Preserved assets and data

* `apps/web` (Customer website UI)
* `apps/admin` (Admin panel UI)
* `apps/mobile/src` (Mobile application UI)
* `packages/ui` (Shared UI components)
* `packages/types` (Shared frontend-safe types)
* `packages/validation` (Shared frontend-safe validation schemas)
* `data/final/` & `data/source/` (Certified product catalogue XLSX and CSV files, PDF price lists)
* Certified catalogue verified facts:
  * 2,167 products
  * 103 categories
  * 70 Individual products
  * 2,097 Wholesale products
  * Certified workbook SHA-256: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b` (verified unchanged by `tools/certify_catalogue.py`)
* All product images, logos, fonts, motion/3D assets, public directories
* Business requirements (`docs/BRD.md`, `docs/FRD.md`, `docs/PRD.md`, `docs/TRD.md`)

## 6. Dependency cleanup

* **Removed packages**: `@raza-stationers/api-server`, `@raza-stationers/api`, `@raza-stationers/db`, `better-auth`, `@better-auth/infra`, `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `kysely`, `express`, `dotenv`, `esbuild`, `tsx`, `axios`, `form-data`, `jsonwebtoken`, `qrcode`, `@types/qrcode`, `@types/express`, `@google/genai`.
* **Retained packages**: `@raza-stationers/web`, `@raza-stationers/admin`, `@raza-stationers/mobile`, `@raza-stationers/ui`, `@raza-stationers/types`, `@raza-stationers/validation`, `next`, `react`, `react-dom`, `vite`, `tailwindcss`, `lucide-react`, `framer-motion`, `gsap`, `zod`.
* Lockfile (`package-lock.json`) regenerated cleanly via `npm install` (525 packages purged).

## 7. Verification results

* **`npm install`**: PASS (clean workspace resolution for 6 remaining workspaces).
* **`npm run typecheck`**: PASS (0 errors across `admin`, `mobile`, `types`, `ui`, `validation`, `web`).
* **`npm run lint`**: PASS (0 errors, 43 warnings).
* **`npm run build:web`**: PASS (16/16 static Next.js pages generated successfully).
* **`npm run build:admin`**: PASS (18/18 static Next.js pages generated successfully).
* **`npm run build:mobile`**: PASS (Vite production bundle built in 1.83s).
* **`npm run build`**: PASS (Full monorepo build succeeded cleanly).
* **Forbidden-reference scan**: PASS (0 executable-code references to `@raza-stationers/api`, `@raza-stationers/db`, `PrismaClient`, `@nestjs`, `better-auth`, Render staging URLs, or backend environment variables).
* **Git diff check**: PASS (`git diff --check` clean).

## 8. Remaining external resources

The following external infrastructure resources remain active and untouched per safety rules:
* Render staging service: `raza-stationers-api-staging` (`https://raza-stationers-api-staging.onrender.com`) — **NOT EXECUTED — requires separate owner approval**
* Supabase remote PostgreSQL database tables & schema — **NOT EXECUTED — requires separate owner approval**
* Vercel environment variables — **NOT EXECUTED — requires separate owner approval**
* Google Cloud OAuth credentials — **NOT EXECUTED — requires separate owner approval**

## 9. Remaining limitations

The project currently has:
* No backend
* No database persistence
* No authentication
* No real ordering
* No real admin mutations
* No production readiness

## 10. Final status

```text
PASS — legacy backend fully removed and frontend-only workspace builds successfully
```
