# Raza Stationers

Raza Stationers is an npm-workspaces monorepo for a customer storefront, an operations portal, a NestJS API, and shared business/database packages. PostgreSQL is hosted by Supabase; authentication is handled by a unified **Better Auth** session system with same-origin BFF cookie proxying, Google OAuth, TOTP MFA, and real-time database access revocation. Production provider configuration is deliberately kept outside Git.

## Applications and packages

| Path | Purpose | Local port |
|---|---|---:|
| `apps/web` | Next.js customer storefront | 3000 |
| `apps/admin` | Next.js owner and staff portal | 3001 |
| `apps/api` | NestJS application API | 4000 |
| `packages/db` | Prisma schema, migrations, PostgreSQL adapter, catalogue importer | n/a |
| `packages/api` | Shared API client utilities | n/a |
| `packages/types` | Shared domain types | n/a |
| `packages/validation` | Shared validation rules | n/a |
| `packages/ui` | Shared UI primitives | n/a |

Mobile application implementation is isolated and decoupled. Customer/admin mobile design prompts remain under `docs/mobile/`.

## Requirements

- Node.js 22 or newer
- npm 9 or newer
- Docker Desktop for disposable integration tests and container validation
- Database connection credentials supplied through ignored local files or provider dashboards

Install exactly from the lockfile:

```powershell
npm ci
```

## Local environment

Copy the committed templates, then enter secrets only in the ignored copies:

```powershell
Copy-Item .env.example .env
Copy-Item apps/web/.env.local.example apps/web/.env.local
Copy-Item apps/admin/.env.local.example apps/admin/.env.local
```

The root `.env` supplies API, Better Auth, and Prisma CLI variables. Web and Admin receive only public URL variables (`NEXT_PUBLIC_API_URL`). Never expose `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, or `JWT_SECRET` to a browser bundle.

Start all three applications:

```powershell
npm run dev:all
```

Or use `npm run dev`, `npm run dev:admin`, and `npm run dev:api` separately.

## Database & Security Model

- `DATABASE_URL` is the API/runtime connection (uses restricted `raza_runtime` role).
- `DIRECT_URL` is the migration-compatible connection used by Prisma CLI.
- Better Auth tables (`account`, `session`, `two_factor`, `verification`) are secured with RLS and revoked from untrusted browser roles (`anon`, `authenticated`, `PUBLIC`).
- High-frequency query joins are optimized with non-unique B-tree foreign key indexes (`products.category_id`, `orders.placed_by_user_id`, `business_user_links.linked_by_id`, `business_user_links.ended_by_id`, `product_prices.created_by_id`, `stock_movements.stock_location_id`, `stock_movements.created_by_id`, `payments.submitted_by_id`, `payments.verified_by_id`).
- Product creation is wrapped in interactive Prisma transactions with pre-insert Unit of Measure validation.
- Remote connections require certificate-verified TLS and `supabase-ca.crt` (or `PGSSLROOTCERT`).

Safe code-generation checks:

```powershell
npm run db:validate
npm run db:generate
```

Migration status is read-only:

```powershell
npx prisma migrate status --schema=packages/db/prisma/schema.prisma
```

Never run `migrate reset`, `migrate dev`, or `db push` against production. Production mutation suites are prohibited. `npm run test:integration` creates and destroys its own uniquely named local PostgreSQL 16 Docker container and refuses the production project reference.

## Verification & Testing

```powershell
npm run verify
npm test
npm run test:phase9
npm run test:api-startup
npm run test:integration
```

- `npm test` runs static checks and Phase 7–9 unit/security regression suites.
- `npm run test:phase9` runs the full 17-script Better Auth and security audit regression suite.
- `npm run test:api-startup` validates clean API compilation and startup environment guards.

## Docker

Build the API image:

```powershell
docker build -t raza-stationers-api:phase10 .
docker image inspect raza-stationers-api:phase10
```

Validate local Compose configuration without starting migrations:

```powershell
docker compose config --quiet
```

`compose.yaml` starts only the API and expects secrets from the calling environment or an ignored local environment file.

## Production Ownership

| System | Configuration owner |
|---|---|
| PostgreSQL (Supabase/Managed DB) | Database schema, RLS policies, exclusive `raza_runtime` role grants |
| Better Auth System | Unified authentication engine, Google OAuth, TOTP MFA, same-origin BFF cookie session storage |
| Vercel Web | Public API URL (`NEXT_PUBLIC_API_URL`) |
| Vercel Admin | Public API URL (`NEXT_PUBLIC_API_URL`) |
| Render API | Runtime database URL, `BETTER_AUTH_SECRET`, `JWT_SECRET`, trusted CORS origins (`CORS_ALLOWED_ORIGINS`) |
| Controlled migration environment | Direct database URL and trusted CA configuration |

See `docs/production/readiness-checklist.md` and `docs/production/environment-matrix.md` for deployment details.

## Documentation

Business and technical requirements are in `docs/BRD.md`, `docs/FRD.md`, `docs/PRD.md`, and `docs/TRD.md`. Database architecture and audit progress are documented in `docs/db/` and `docs/manual_testing/third_audit_progress.md`.

