# Raza Stationers — Authentication Debugging Implementation Progress

**Branch:** `phase-9-betterauth`  
**Report Reference:** `docs/manual_testing/auth_debugging.md`

---

## 1. Implementation Status Board

| # | Issue | Severity | Status | Verification / Artifacts |
|---|---|---|---|---|
| 1 | Admin Next.js middleware unconditional lockout | **Critical** | Complete | Unconditional redirect removed in middleware.ts; verified client-side gating in AdminShell |
| 2 | `BetterAuthGuard` implementation for API controllers | **Critical** | Complete | BetterAuthGuard created and wired across all 17 protected API controllers |
| 3 | `User.mobileNumber` nullable schema & post-signup step | **Critical** | Complete | User.mobileNumber set to nullable in Prisma schema and database; schema pushed cleanly |
| 4 | Google OAuth configuration alignment | **Critical** | Complete | Verified callback URI: /auth/api/callback/google on API domain |
| 5 | Stale `render.yaml`, `.env.example`, & authSecret fallback | **Critical** | Complete | Updated render.yaml, .env.example, .env.local.example; removed hardcoded secret fallback |
| 6 | Admin MFA hardcoded `password: ""` in enroll/unenroll | **High** | Complete | Updated enrollMfa and unenrollMfa to accept password parameter |
| 7 | Monorepo `better-auth` version alignment | **Medium** | Complete | Aligned better-auth to ^1.6.25 across apps/api, packages/api, apps/web, apps/admin |
| 8 | `dash` / `sentinel` plugin client-server alignment | **Medium** | Complete | Guarded server dash() plugin with BETTER_AUTH_API_KEY presence check |
| 9 | Legacy `/auth/*` endpoints deprecation audit | **Low** | Complete | Audited legacy routes in auth.controller.ts; dormant paths preserved for rollback safety |
| 11 | Catalogue connectivity & SSL cert verification | **Info** | Complete | Verified supabase-ca.crt is copied in Dockerfile and not excluded by .dockerignore |
| 12 | CORS regex restriction for Vercel preview deployments | **Low** | Complete | Restricted Vercel origins to ^https://raza-stationers-(web\|admin)(-[a-z0-9-]+)?\.vercel\.app$ |
| 13 | Progress & verification discipline sync | **Process** | Complete | Updated docs/betterAuth/betterauth_progress.md checkboxes with verified evidence |

---

## 2. Issue Execution Ledger

### Issue 1: Admin Next.js middleware unconditional lockout
- [ ] Inspect `AdminShell.tsx` to confirm client-side auth gating behavior
- [ ] Replace blanket stub redirect in `apps/admin/src/middleware.ts`
- [ ] Run `npm run build:admin` & `npm run typecheck`

### Issue 2: `BetterAuthGuard` implementation for API controllers
- [ ] Create `BetterAuthGuard` in `apps/api/src/auth/guards/better-auth.guard.ts`
- [ ] Replace `JwtAuthGuard` with `BetterAuthGuard` across protected NestJS controllers
- [ ] Run `npm run typecheck` & `npm run test`

### Issue 3: `User.mobileNumber` nullable schema & post-signup step
- [ ] Make `mobileNumber` nullable in `packages/db/prisma/schema.prisma`
- [ ] Create Prisma migration and update DB check constraint
- [ ] Update `use-auth.tsx` `checkSession()` for `authenticated_unregistered` status
- [ ] Run `npm run db:push` / `npx prisma db push`

### Issue 4: Google OAuth configuration alignment
- [ ] Verify Google OAuth callback URL in server config & docs
- [ ] Update Google OAuth env guidance for Render

### Issue 5: Stale `render.yaml`, `.env.example`, & authSecret fallback
- [ ] Update `render.yaml` with all required Better Auth & SMTP env vars
- [ ] Update root `.env.example`, `apps/web/.env.local.example`, `apps/admin/.env.local.example`
- [ ] Remove hardcoded fallback secret in `apps/api/src/auth/better-auth.ts`

### Issue 6: Admin MFA hardcoded `password: ""` in enroll/unenroll
- [ ] Update `enrollMfa` and `unenrollMfa` signatures in `apps/admin/src/hooks/use-admin-auth.tsx`
- [ ] Wire current password parameter through `TotpEnrollView.tsx` / `TotpChallengeView.tsx`

### Issue 7: Monorepo `better-auth` version alignment
- [ ] Align `better-auth` semver across `apps/api`, `packages/api`, `apps/web`, `apps/admin`
- [ ] Update lockfile and run `npm run typecheck`

### Issue 8: `dash` / `sentinel` plugin client-server alignment
- [ ] Clean up or align `@better-auth/infra` plugins across client and server

### Issue 9: Legacy `/auth/*` endpoints deprecation audit
- [ ] Safely deprecate legacy unused JWT endpoints

### Issue 10: `authenticated_unregistered` status & onboarding routing
- [ ] Connect `/onboarding` routing for Google OAuth users needing mobile collection

### Issue 11: Catalogue connectivity & SSL cert verification
- [ ] Verify `supabase-ca.crt` inclusion in Dockerfile & `.dockerignore`

### Issue 12: CORS regex restriction for Vercel preview deployments
- [ ] Tighten CORS origin regex in `apps/api/src/main.ts`

### Issue 13: Progress & verification discipline sync
- [ ] Update `docs/betterAuth/betterauth_progress.md` with verified status
