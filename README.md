# Raza Stationers

> **Notice**: The legacy backend and authentication system were removed intentionally.
> The repository is temporarily frontend-only while Backend V2 is designed and implemented.
> No authentication, database persistence, ordering or admin mutations are currently active.

Raza Stationers is an npm-workspaces monorepo containing frontend applications for the customer storefront, admin operations portal, mobile application, and shared UI/types/validation packages.

## Applications and packages

| Path | Purpose | Local command |
|---|---|---|
| `apps/web` | Next.js customer storefront | `npm run dev` |
| `apps/admin` | Next.js owner and staff portal | `npm run dev:admin` |
| `apps/mobile` | Vite customer mobile app | `npm run dev:mobile` |
| `packages/types` | Shared frontend-safe domain types | n/a |
| `packages/validation` | Shared frontend-safe validation rules | n/a |
| `packages/ui` | Shared UI primitives & components | n/a |

## Requirements

- Node.js >= 22.0.0
- npm >= 9.0.0

Install workspace dependencies:

```powershell
npm install
```

## Local Development

Start all frontend applications concurrently:

```powershell
npm run dev:all
```

Or start individual applications:

```powershell
# Customer Storefront (http://localhost:3000)
npm run dev

# Admin Panel (http://localhost:3001)
npm run dev:admin

# Mobile App (http://localhost:5173)
npm run dev:mobile
```

## Verification & Build

```powershell
npm run typecheck
npm run lint
npm run build:web
npm run build:admin
npm run build:mobile
npm run build
npm run verify
```

## Business Documentation & Catalogue Assets

Business and technical specifications are preserved in:
- `docs/BRD.md` — Business Requirements Document
- `docs/FRD.md` — Functional Requirements Document
- `docs/PRD.md` — Product Requirements Document
- `docs/TRD.md` — Technical Requirements Document

The certified product catalogue data and design assets are preserved in `data/` and `tools/certify_catalogue.py`.
