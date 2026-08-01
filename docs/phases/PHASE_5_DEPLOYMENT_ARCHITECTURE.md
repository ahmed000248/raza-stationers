# Phase 5 Deployment Architecture

This document inventories the repository workspace configurations, technologies, and target runtime settings required for deployment.

---

## 1. Repository Structure Overview

The project is structured as an npm monorepo with workspace setups for applications and shared packages:

* **Package Manager**: npm (requires engine node `>=20.19.0`, npm `>=9.0.0`)
* **Monorepo Workspaces**:
  * **Applications (`apps/*`)**:
    * `apps/web`: `@raza-stationers/web` - Customer Storefront portal (Next.js 16/React 19).
    * `apps/admin`: `@raza-stationers/admin` - Admin operations panel (Next.js 16/React 19).
    * `apps/api`: `@raza-stationers/api-server` - REST API backend (NestJS 11/Express).
  * **Shared Packages (`packages/*`)**:
    * `packages/db`: `@raza-stationers/db` - Holds the Prisma schema and client generation configurations.
    * `packages/types`: `@raza-stationers/types` - Shared interfaces and typings.
    * `packages/validation`: `@raza-stationers/validation` - DTO and class-validator rules shared between apps and API.
    * `packages/ui`: `@raza-stationers/ui` - Shared design tokens and visual library elements.

---

## 2. Workspace Build and Execution Contracts

### Backend API (`apps/api`)
* **Framework**: NestJS v11
* **Source/Target**: TypeScript compiling via Nest CLI (`nest build`) to `dist/`
* **Execution Command**: `node dist/main`
* **Prisma Schema Location**: `packages/db/prisma/schema.prisma`
* **Prisma Generation Command**: `npm run db:generate` (runs `prisma generate` pointing to schema)
* **API Prefix**: `/` (Swagger at `/api/docs`)
* **Listening Interface**: binds to `0.0.0.0`
* **Port**: Configured via environment variable `PORT` (defaults to `4000`)
* **Health Check Endpoint**: `/` (returns `{ status: "ok" }`)
* **Authentication**: JWT Bearer strategy in Header (validated via NestJS Passport module)

### Customer Frontend Storefront (`apps/web`)
* **Framework**: Next.js v16 (App Router)
* **Staging Platform**: Vercel Preview
* **Build Command**: `next build`
* **Start Command**: `next start`
* **Public Variables**: Prefix `NEXT_PUBLIC_`

---

## 3. Staging Target Architecture

```text
Vercel Staging Frontend
        ↓ (HTTPS API calls using NEXT_PUBLIC_API_URL)
Dockerized NestJS Staging API (running on Docker Host)
        ↓ (Prisma ORM using DATABASE_URL)
Separate Supabase Staging Database (isolated staging schema or project)
```

* All write tests and orders are executed inside the isolated staging database schema.
* Production canonical database (`public` schema on `pqlmgqzpjjllhgalyhwz`) remains strictly read-only.
