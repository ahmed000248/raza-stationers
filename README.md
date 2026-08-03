# Raza Stationers

Raza Stationers is an npm-workspaces monorepo for a customer storefront, an operations portal, a NestJS API, and shared business/database packages. PostgreSQL is hosted by Supabase; authentication uses Supabase Auth. Production provider configuration is deliberately kept outside Git.

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

Mobile application implementation is deferred. The approved customer/admin mobile design prompts remain under `docs/mobile/`.

## Requirements

- Node.js 22 or newer
- npm 9 or newer
- Docker Desktop for disposable integration tests and container validation
- Complete Supabase credentials supplied through ignored local files or provider dashboards

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

The root `.env` supplies API and Prisma CLI variables. Web and Admin receive only public URL/publishable-key variables. Never expose `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or `JWT_SECRET` to a browser bundle.

Start all three applications:

```powershell
npm run dev:all
```

Or use `npm run dev`, `npm run dev:admin`, and `npm run dev:api` separately.

## Database safety

- `DATABASE_URL` is the API/runtime connection.
- `DIRECT_URL` is the exact Supabase-provided migration-compatible URL used by Prisma CLI.
- Remote connections require certificate-verified TLS and `supabase-ca.crt` (or `PGSSLROOTCERT`).
- Do not derive one Supabase URL from the other or log either URL.

Safe code-generation checks:

```powershell
npm run db:validate
npm run db:generate
```

Migration status is read-only:

```powershell
npx prisma migrate status --schema=packages/db/prisma/schema.prisma
```

Never run `migrate reset`, `migrate dev`, or `db push` against Supabase. Production mutation suites are prohibited. `npm run test:integration` creates and destroys its own uniquely named local PostgreSQL 16 Docker container and refuses the production project reference.

## Verification

```powershell
npm run verify
npm test
npm run test:integration
```

`npm test` is static and does not connect to a database. Docker is required only for the isolated integration suite.

## Docker

Build the API image:

```powershell
docker build -t raza-stationers-api:phase8 .
docker image inspect raza-stationers-api:phase8
```

Validate local Compose configuration without starting migrations:

```powershell
docker compose config --quiet
```

`compose.yaml` starts only the API and expects secrets from the calling environment or an ignored local environment file. It does not create an application PostgreSQL service and does not run migrations.

## Production ownership

| System | Configuration owner |
|---|---|
| Supabase | Database, public/backend keys, Auth, Google OAuth, redirects, MFA, email settings |
| Vercel Web | Public API URL and public Supabase URL/publishable key |
| Vercel Admin | Public API URL and public Supabase URL/publishable key |
| Render API | Runtime database URL, backend Supabase URL/service key, JWT secret, CORS origins |
| Controlled migration environment | Direct database URL and trusted CA configuration |

Phase 8 stops before external dashboard configuration or deployment. See `docs/production/readiness-checklist.md` and `docs/production/environment-matrix.md` for the handoff.

## Documentation

Business and technical requirements are in `docs/BRD.md`, `docs/FRD.md`, `docs/PRD.md`, and `docs/TRD.md`. Database architecture and import evidence are under `docs/db/`; certified catalogue evidence is under `docs/stabilization/` and `docs/reviews/artifacts/`.
