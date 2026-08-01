# Supabase Authentication Completion Progress

This file tracks the progress of the Supabase Authentication implementation (with SMS OTP removed).

## Stage 1: Inspection & Audit
- [x] Audit Git status and user changes
- [x] Inspect Storefront and Admin Supabase clients
- [x] Inspect Next.js middleware and callback routes
- [x] Inspect Authentication hooks and pages
- [x] Inspect NestJS Passport strategies and guards
- [x] Inspect Prisma `supabase_auth_id` migration & database linking
- [x] Inspect Speakeasy TOTP and cookies/localStorage usage
- [x] Inspect existing integration and auth tests

## Stage 2: Required Coding
- [x] 1. Remove phone OTP from Auth (UI, hooks, tests, config)
- [x] 2. Fix Supabase session handling (SSR cookies, middleware refresh, token cleanup)
- [x] 3. Complete customer email/password Auth (Registration/login UI, confirmation callback, profile linking)
- [x] 4. Complete Google OAuth (Google sign-in, callback, onboarding form, identity link)
- [x] 5. Complete password recovery (Request page, reset page, callbacks, error handling)
- [x] 6. Fix admin login (Email + password, inline MFA challenge step on login page)
- [x] 7. Complete Supabase TOTP MFA (AAL gates in AdminShell: TotpEnrollView + TotpChallengeView)
- [x] 8. Retire duplicate custom speakeasy TOTP (Removed code/UI/tests, columns deprecated)
- [x] 9. Secure backend identity integration (RolesGuard enforces AAL2; mock AAL2 JWTs in tests)

## Stage 3: Verification & Testing
- [x] TypeScript type-check: API, Admin, Web — all pass clean
- [x] Integration tests aligned to Supabase AAL2 (test_all_flows, test_invoices, test_gate2_inventory)
- [x] test_gate7_totp retired cleanly
- [x] All changes committed and pushed to `phase-6-final-refinement`

## Pending Manual Steps (Supabase Dashboard)
- [ ] Enable Google OAuth provider (Client ID + Secret)
- [ ] Enable TOTP MFA in Auth settings
- [ ] Set email confirmation redirect URLs for staging and production
- [ ] Verify environment variables on Render (API) and Vercel (web/admin)
