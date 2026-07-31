# Phase 5 Environment Matrix

This document maps the environment configurations, scopes, and target values (as variable names) across all environments: Local, Test, Staging, and Production.

---

## 1. Environment Variables Scopes

| Variable Name | Scope | Purpose | Frontend Exposed? |
|---|---|---|---|
| `NODE_ENV` | Global | Configures application execution mode (`development` vs `production`). | No |
| `PORT` | Backend | Configures backend listening port (default `4000`). | No |
| `NEXT_PUBLIC_API_URL` | Frontend | Target API server base URL for next.js fetch/axios calls. | **Yes** (Bundled in client assets) |
| `JWT_SECRET` | Backend | Minimum 32-character key for signing and verifying authorization tokens. | No (Server secret) |
| `DATABASE_URL` | Backend | Connection string to database, configured with connection pooler parameters. | No (Server secret) |
| `DIRECT_URL` | Backend | Connection string to database for direct migration DDL executions. | No (Server secret) |

---

## 2. Environment Configurations Matrix

| Environment | Frontend URL | API URL | Database Target | Writes Allowed? |
|---|---|---|---|---|
| **Local** | `http://localhost:3000` | `http://localhost:4000` | Local PostgreSQL or `public` read-only | Yes (on local dev mocks/schemas) |
| **Test** | `http://localhost:3000` | `http://localhost:4000` | Disposable schema `e2e_test_schema` | Yes (schema destroyed after run) |
| **Staging** | *Vercel Preview URL* | *Docker Host HTTPS URL* | Separate Supabase Staging DB | Yes (for E2E customer journey validation) |
| **Production** | *Canonical Web URL* | *Canonical API URL* | Supabase Production DB (`pqlmgqzpjjllhgalyhwz`) | **Real Business Only** (strictly monitored) |

---

## 3. Security Guidelines
* **Secrets Protection**: Do not add JWT_SECRET, DATABASE_URL, or DIRECT_URL to public files.
* **NEXT_PUBLIC Protection**: Never prefix any database URL or JWT secret with `NEXT_PUBLIC_`.
* **Database Isolation**: The staging environment must point to a distinct database instance or completely isolated staging schema. Staging write scripts and integration flows must never target `pqlmgqzpjjllhgalyhwz`.
