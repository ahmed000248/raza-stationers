# Raza Stationers — Authentication Debugging Implementation Progress

**Branch:** `phase-9-betterauth`  
**Report Reference:** `docs/manual_testing/auth_debugging.md`

---

## 1. Implementation Status Board

| # | Issue | Severity | Status | Verification / Artifacts |
|---|---|---|---|---|
| 1 | Admin Next.js middleware unconditional lockout | **Critical** | Complete | Unconditional redirect removed in middleware.ts; verified client-side gating in AdminShell |
| 2 | `BetterAuthGuard` implementation for API controllers | **Critical** | Complete | BetterAuthGuard created, supports Bearer fallback & session 2FA AAL calculation across NestJS controllers |
| 3 | `User.mobileNumber` nullable schema & post-signup step | **Critical** | Complete | User.mobileNumber set to nullable in Prisma schema and database; schema pushed cleanly |
| 4 | Google OAuth configuration alignment | **Critical** | Complete | Verified callback URI: /auth/api/callback/google on API domain |
| 5 | Stale `render.yaml`, `.env.example`, & authSecret fallback | **Critical** | Complete | Updated render.yaml with DATABASE_URL, .env.example, .env.local.example; removed hardcoded secret fallback |
| 6 | Admin MFA hardcoded `password: ""` in enroll/unenroll | **High** | Complete | Required password parameter in enrollMfa and unenrollMfa; added password input to TotpEnrollView |
| 7 | Monorepo `better-auth` version alignment | **Medium** | Complete | Aligned better-auth to ^1.6.25 across apps/api, packages/api, apps/web, apps/admin |
| 8 | `dash` / `sentinel` plugin client-server alignment | **Medium** | Complete | Removed dash/sentinel plugins to eliminate dashboard connection errors |
| 9 | Legacy `/auth/*` endpoints deprecation audit | **Low** | Complete | Unified BetterAuthGuard with AuthService.verifyAuthToken fallback for Bearer tokens |
| 10 | `authenticated_unregistered` status & onboarding routing | **Medium** | Complete | Added global OnboardingGate wrapper in AuthProvider routing Google OAuth users to /onboarding |
| 11 | Catalogue connectivity & SSL cert verification | **Info** | Complete | Verified supabase-ca.crt is copied in Dockerfile and logged in findCertificate |
| 12 | CORS regex restriction for Vercel preview deployments | **Low** | Complete | Wired CORS_ORIGINS env var & exact localhost hostname matching in main.ts |
| 13 | Progress & verification discipline sync | **Process** | Complete | Updated docs/betterAuth/betterauth_progress.md checkboxes with verified evidence |

---

## 2. Issue Execution Ledger

### Issue 1: Admin Next.js middleware unconditional lockout
- [x] Inspect `AdminShell.tsx` to confirm client-side auth gating behavior
- [x] Replace blanket stub redirect in `apps/admin/src/middleware.ts`
- [x] Run `npm run build:admin` & `npm run typecheck`

### Issue 2: `BetterAuthGuard` implementation for API controllers
- [x] Create `BetterAuthGuard` in `apps/api/src/auth/guards/better-auth.guard.ts`
- [x] Replace `JwtAuthGuard` with `BetterAuthGuard` across protected NestJS controllers
- [x] Run `npm run typecheck` & `npm run test`

### Issue 3: `User.mobileNumber` nullable schema & post-signup step
- [x] Make `mobileNumber` nullable in `packages/db/prisma/schema.prisma`
- [x] Create Prisma migration and update DB check constraint
- [x] Update `use-auth.tsx` `checkSession()` for `authenticated_unregistered` status
- [x] Run `npm run db:push` / `npx prisma db push`

### Issue 4: Google OAuth configuration alignment
- [x] Verify Google OAuth callback URL in server config & docs
- [x] Update Google OAuth env guidance for Render

### Issue 5: Stale `render.yaml`, `.env.example`, & authSecret fallback
- [x] Update `render.yaml` with all required Better Auth & SMTP env vars including `DATABASE_URL`
- [x] Update root `.env.example`, `apps/web/.env.local.example`, `apps/admin/.env.local.example`
- [x] Remove hardcoded fallback secret in `apps/api/src/auth/better-auth.ts`

### Issue 6: Admin MFA hardcoded `password: ""` in enroll/unenroll
- [x] Update `enrollMfa` and `unenrollMfa` signatures in `apps/admin/src/hooks/use-admin-auth.tsx`
- [x] Wire current password parameter through `TotpEnrollView.tsx` / `TotpChallengeView.tsx`

### Issue 7: Monorepo `better-auth` version alignment
- [x] Align `better-auth` semver across `apps/api`, `packages/api`, `apps/web`, `apps/admin`
- [x] Update lockfile and run `npm run typecheck`

### Issue 8: `dash` / `sentinel` plugin client-server alignment
- [x] Clean up or align `@better-auth/infra` plugins across client and server

### Issue 9: Legacy `/auth/*` endpoints deprecation audit
- [x] Unified BetterAuthGuard to verify Bearer tokens via AuthService.verifyAuthToken

### Issue 10: `authenticated_unregistered` status & onboarding routing
- [x] Connect `/onboarding` routing for Google OAuth users needing mobile collection via OnboardingGate

### Issue 11: Catalogue connectivity & SSL cert verification
- [x] Verify `supabase-ca.crt` inclusion in Dockerfile & `.dockerignore`

### Issue 12: CORS regex restriction for Vercel preview deployments
- [x] Wire `CORS_ORIGINS` env var and exact localhost hostname matching in `apps/api/src/main.ts`

### Issue 13: Progress & verification discipline sync
- [x] Update `docs/betterAuth/betterauth_progress.md` with verified status
