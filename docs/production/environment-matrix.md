# Production environment matrix

Committed example files contain names and local defaults only. Copy them to ignored local files and enter secrets there; do not paste secrets into chat or commit them.

| Variable | Local file / provider | Exposure | Required behavior |
|---|---|---|---|
| `NODE_ENV` | Root/API, Render | Server | `production` in the deployed API. |
| `PORT` | Root/API local; supplied by Render | Server | Local default 4000; do not hardcode a Render port. |
| `DATABASE_URL` | Root local, Render API | Server secret | API/runtime URL for project `pqlmgqzpjjllhgalyhwz`; verified TLS. |
| `DIRECT_URL` | Root local migration environment only | Migration secret | Exact dashboard-provided migration-compatible URL; never inject into normal API/browser runtime. |
| `SUPABASE_URL` | Root local, Render API | Server | Backend Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Root local, Render API | Server secret | Backend only; never public-prefixed or browser-exposed. |
| `JWT_SECRET` | Root local, Render API | Server secret | Independent random value of at least 32 bytes; no production fallback. |
| `CORS_ORIGINS` | Root local, Render API | Server | Comma-separated exact Web/Admin origins; no wildcard with credentials. |
| `PGSSLROOTCERT` | Root/local migration environment | Server path | Trusted CA path when the repository certificate is not used. |
| `DATABASE_SSL_MODE` | Root/API, Render | Server | `verify-full` for remote PostgreSQL. |
| `NEXT_PUBLIC_API_URL` | Web/Admin local files and Vercel | Browser public | Public NestJS API origin; localhost is development-only. |
| `NEXT_PUBLIC_SUPABASE_URL` | Web/Admin local files and Vercel | Browser public | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web/Admin local files and Vercel | Browser public | Publishable key only, never the service-role key. |

Templates:

- `.env.example` -> ignored root `.env`
- `apps/web/.env.local.example` -> ignored `apps/web/.env.local`
- `apps/admin/.env.local.example` -> ignored `apps/admin/.env.local`

The API reads `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `CORS_ORIGINS`. Prisma CLI reads `DIRECT_URL`. Web/Admin consume only `NEXT_PUBLIC_*` values.
