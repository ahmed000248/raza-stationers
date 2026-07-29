# Baseline Quality Results — Phase 0 Verification

**Phase**: Phase 0 Baseline  
**Scope**: Empirical Tool Execution Results & Code Quality Audit Search  

---

## 1. Automated Baseline Tool Executions

| Command | Working Directory | Exit Code | Result | Concise Error / Output Summary | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `npm ci --dry-run` | Monorepo Root | `0` | **PASS** | Lockfile `package-lock.json` is clean and synchronized with all package dependencies. | 0 packages added/modified. |
| `npx prisma validate` | `d:/Projects/Raza Stationers` | `0` | **PASS** | Prisma schema loaded from `packages/db/prisma/schema.prisma` is valid 🚀 | Console output: "The schema at packages/db/prisma/schema.prisma is valid" |
| `npx prisma generate` | `d:/Projects/Raza Stationers` | `0` | **PASS** | Prisma Client (v7.9.0) generated successfully to `./node_modules/@prisma/client` in 624ms | Console output: "Generated Prisma Client (v7.9.0)" |
| `npm run build` | Monorepo Root | `0` | **PASS** | Next.js Turbopack compiled `admin` and `web`, NestJS compiled `api-server`, TypeScript compiled `api`, `db`, `types`, `ui`, `validation`. | Production builds created for all 9 workspace components without type errors. |
| `npm run lint` | Monorepo Root | `1` | **FAIL** | ESLint reported 74 problems in `@raza-stationers/admin` and 3,232 warnings in `@raza-stationers/web`. | Exit code 1 returned due to un-used variables, missing React hook dependencies, and `any` types. |

---

## 2. Codebase Audit Term Search Results

Search conducted across `apps/` and `packages/` source code (excluding `node_modules`, `.next`, `dist`, vendor libraries):

| Search Term | Occurrences | Primary Context / Location | Severity / Impact |
| :--- | :--- | :--- | :--- |
| `TODO` | `0` | Clean in custom application code | None |
| `FIXME` | `0` | Clean across all workspace packages | None |
| `mock` | `25` | `apps/admin/src/content/mock/*` imported by admin components | Low: Admin UI components fallback to mock files if API data is unpopulated |
| `dummy` | `0` | Clean | None |
| `placeholder` | `130` | Form input element placeholder text (e.g. `placeholder="Search by name"`) | Informational: Input UI UX guidance |
| `fake` | `0` | Clean | None |
| `demo` | `4` | Documentation comments & TRD references | Low: Conceptual demo notes |
| `setTimeout` | `22` | Toast notifications & auto-dismiss timers | Informational: Standard UI notification delay handling |
| `localStorage` | `24` | `use-admin-auth.tsx` & `use-auth.tsx` JWT token storage | Medium: Client-side token storage in `localStorage` |
| `console.log` | `30` | API bootstrap (`main.ts`) & CLI importer logging | Informational: Diagnostic server logging |
| `JWT_SECRET` | `2` | `auth.module.ts:12` & `jwt.strategy.ts:18` fallback secret | Medium: Dev fallback secret string used if env missing |
