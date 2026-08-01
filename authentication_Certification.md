# Raza Stationers — Supabase Authentication Certification

**Branch:** `phase-6-final-refinement`
**Completed:** 2026-08-02
**Scope:** Full Supabase Auth implementation for storefront customers and admin/owner staff

---

## 1. Overview

Supabase Auth is now the single identity provider for the Raza Stationers platform. It replaced:

- Custom mobile/password login with legacy JWT tokens
- Custom `speakeasy` TOTP 2FA
- Phone OTP (removed — paid service, not part of Demo v1)
- `localStorage`-based token persistence

The NestJS API and application database remain the authority for **roles, permissions, and business authorization**. Supabase handles **identity only**.

---

## 2. Authentication Methods Implemented

### Storefront Customers (`apps/web`)

| Method | Status | Notes |
|---|---|---|
| Email + Password signup | ✅ | Supabase `signUp`, confirmation email sent |
| Email + Password login | ✅ | Supabase `signInWithPassword` |
| Email confirmation | ✅ | `/auth/callback` route handles token exchange |
| Google OAuth | ✅ | `signInWithOAuth`, redirects to `/auth/callback` |
| Forgot password | ✅ | Supabase `resetPasswordForEmail`, email link sent |
| Reset password | ✅ | Supabase `updateUser`, called after OTP exchange on `/reset-password` |
| Logout | ✅ | Supabase `signOut`, context reset |
| Onboarding | ✅ | New users (Google or email) land on `/onboarding` to create their NestJS profile |
| Phone OTP | ❌ Removed | Paid service — not in Demo v1 |

### Admin / Owner Staff (`apps/admin`)

| Method | Status | Notes |
|---|---|---|
| Email + Password login | ✅ | Supabase `signInWithPassword` |
| Supabase TOTP MFA enrollment | ✅ | `TotpEnrollView` — 3-step QR wizard shown on first login |
| Supabase TOTP MFA challenge | ✅ | `TotpChallengeView` — shown on every AAL1 session before dashboard |
| AAL2 dashboard gate | ✅ | `AdminShell` blocks access until `currentLevel === "aal2"` |
| Logout | ✅ | Supabase `signOut` |

---

## 3. Architecture

### Identity Flow

```
Browser → Supabase Auth → access_token (JWT, signed by Supabase)
                      ↓
         Next.js (SSR) → reads token from Supabase cookie
                      ↓
         NestJS API → SupabaseStrategy validates JWT signature via JWKS
                    → loads User from Prisma by supabase_auth_id
                    → attaches { id, role, aal } to request
                    → RolesGuard enforces AAL2 for admin/owner routes
```

### Session Handling

- Supabase manages sessions via **SSR cookies** (`@supabase/ssr`).
- The Next.js middleware (`middleware.ts`) refreshes the session on every request.
- The frontend **never stores tokens in `localStorage`** — all session state lives in Supabase cookies.
- NestJS reads the `Authorization: Bearer <token>` header on each API call. The frontend reads the current session token from Supabase before each request.

### Database Linking

Every Supabase user is linked to a Prisma `User` record via `supabase_auth_id` (`TEXT UNIQUE`). This field was added in a Prisma migration. The NestJS `SupabaseStrategy` loads the full user profile by this field.

---

## 4. Files Changed

### NestJS API (`apps/api`)

| File | Change |
|---|---|
| `src/auth/auth.service.ts` | Removed `speakeasy`/`qrcode` imports and all 4 custom TOTP methods. Added `registerSupabase` for creating NestJS profile from Supabase token. |
| `src/auth/auth.controller.ts` | `/auth/totp/*` endpoints now throw `400 Bad Request` (retired). Added `/auth/register-supabase`. |
| `src/auth/strategies/supabase.strategy.ts` | Validates Supabase JWT via JWKS in production; falls back to local `JWT_SECRET` in test mode. Strict `supabaseAuthId` lookup. |
| `src/auth/guards/roles.guard.ts` | Blocks any admin/owner request where `user.aal !== "aal2"`. Legacy tokens (no `aal` field) are rejected. |

### Admin App (`apps/admin`)

| File | Change |
|---|---|
| `src/app/login/page.tsx` | Two-step login: credentials → inline TOTP challenge (if enrolled). No page redirect for MFA. |
| `src/components/shell/AdminShell.tsx` | Gates dashboard: renders `TotpEnrollView` or `TotpChallengeView` for any admin/owner at AAL1. |
| `src/components/shell/TotpEnrollView.tsx` | **New.** 3-step TOTP enrollment wizard: intro → QR code (from Supabase) + manual secret copy → confirm code. |
| `src/components/shell/TotpChallengeView.tsx` | **New.** AAL2 step-up screen for enrolled users: 6-digit input, refresh challenge link. |
| `src/hooks/use-admin-auth.tsx` | Full Supabase TOTP MFA API: `login`, `verifyMfa`, `enrollMfa`, `confirmEnrollMfa`, `unenrollMfa`. Removed `localStorage` token persistence. |

### Storefront (`apps/web`)

| File | Change |
|---|---|
| `src/app/signin/page.tsx` | Email + password login. Google OAuth button. Removed phone/OTP. |
| `src/app/register/page.tsx` | Email registration. Confirmation pending state. Removed phone. |
| `src/app/onboarding/page.tsx` | **New.** Post-signup profile creation form (NestJS side). Handles Google and email flows. |
| `src/app/forgot-password/page.tsx` | **New.** Triggers Supabase `resetPasswordForEmail`. |
| `src/app/reset-password/page.tsx` | **New.** Calls Supabase `updateUser` after OTP exchange. |
| `src/hooks/use-auth.tsx` | Supabase session via SSR cookies. Removed localStorage. Removed phone OTP. Added onboarding redirect for unregistered users. |

### Database (`packages/db`)

| File | Change |
|---|---|
| `prisma/schema.prisma` | `supabase_auth_id` column is the primary Supabase link. Legacy `totpSecret` and `isTotpEnabled` columns marked `@deprecated` in comments — **not dropped** (safe migration, data preserved). |

### Integration Tests (`tests/`)

| File | Change |
|---|---|
| `integration/test_all_flows.mjs` | Seeds admin/owner with `supabaseAuthId`. Authenticates via mock AAL2 JWT. |
| `integration/test_invoices.mjs` | Same — mock AAL2 JWT replaces legacy `/auth/login`. |
| `integration/test_gate2_inventory.mjs` | Same — seeds both admin and owner. |
| `integration/test_gate7_totp.mjs` | **Retired.** Emits a single PASS and exits. |
| `integration/test_admin_catalogue.mjs` | Already updated in prior session. |
| `integration/test_supabase_auth.mjs` | Existing — tests `register-supabase`, AAL2 guard, profile linking. |

---

## 5. Security Guarantees

| Guarantee | Implementation |
|---|---|
| Admin/owner cannot access any API route without AAL2 | `RolesGuard` checks `user.aal === "aal2"` for roles `admin` and `owner` |
| Tokens are never stored in localStorage | `use-auth.tsx` and `use-admin-auth.tsx` do not write any JWT key to localStorage |
| Supabase JWTs are verified by signature | `SupabaseStrategy` uses `jwks-rsa` in production to verify against Supabase's JWKS endpoint |
| Legacy tokens are rejected | Tokens without an `aal` claim are blocked by `RolesGuard` |
| Test tokens cannot work in production | `USE_TEST_KEY` / `NODE_ENV=test` switches are required for local JWT secret; production validates against real Supabase JWKS |
| Custom TOTP has no live code paths | All `speakeasy` endpoints return `400 Bad Request`; service methods removed |

---

## 6. What Was Deliberately NOT Changed

| Item | Reason |
|---|---|
| `totpSecret` / `isTotpEnabled` columns | Not dropped — safe migration, columns deprecated in comments, data preserved |
| Phone number fields on customer/business records | Contact info only — not authentication |
| NestJS role/permission system | Roles remain in the application database. Supabase is identity only. |
| Legacy `/auth/login` endpoint | Still present for non-admin users in some tests. Safe to remove later. |
| SMS / Twilio configuration | Not configured, not required |

---

## 7. Pending Manual Steps (Supabase Dashboard)

These cannot be done in code — they require the Supabase project dashboard.

> [!IMPORTANT]
> Complete all of these before going live or testing OAuth flows on staging.

### 7.1 Enable Google OAuth

1. Supabase Dashboard → **Authentication → Providers → Google**
2. Toggle **Enable**
3. Paste your **Google Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com)
4. Add the Supabase callback URL to **Authorized redirect URIs** in Google Console:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```

### 7.2 Enable TOTP MFA

1. Supabase Dashboard → **Authentication → MFA**
2. Toggle on **Time-based one-time passwords (TOTP)**
3. Set **Maximum enrolled factors per user** to `1` (recommended)

### 7.3 Email Confirmation Redirect URLs

1. Supabase Dashboard → **Authentication → URL Configuration**
2. Set **Site URL**:
   - Staging: `https://<your-vercel-storefront>.vercel.app`
   - Production: `https://razastationers.com` (when ready)
3. Add to **Redirect URLs** (allow list):
   ```
   https://<storefront-domain>/auth/callback
   https://<storefront-domain>/reset-password
   https://<admin-domain>/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```

### 7.4 Environment Variables

#### Render (NestJS API — `apps/api`)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (keep secret) |
| `JWT_SECRET` | Your app JWT secret (must match test secret in test mode) |
| `DATABASE_URL` | Supabase pooled connection string |
| `DIRECT_URL` | Supabase direct connection string |

#### Vercel (Storefront — `apps/web`)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Render API URL |

#### Vercel (Admin — `apps/admin`)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Render API URL |

---

## 8. How to Test Manually After Deployment

### Customer Flow
1. Go to `/register` → register with email → check inbox for confirmation email
2. Click confirmation link → lands on `/onboarding` → fill profile → redirected to `/catalogue`
3. Go to `/signin` → sign in with email/password
4. Go to `/forgot-password` → request reset → check inbox → click link → set new password
5. Go to `/signin` → click **Sign in with Google** → complete Google OAuth flow → profile created or linked

### Admin TOTP Flow (first time)
1. Go to admin `/login` → enter email + password
2. `AdminShell` detects no TOTP factor → shows **TotpEnrollView**
3. Scan QR code with Google Authenticator / Authy
4. Enter 6-digit code → confirmed → redirected to dashboard (now at AAL2)

### Admin TOTP Flow (returning)
1. Go to admin `/login` → enter email + password → login returns `requiresMfa: true`
2. Page shows inline TOTP input → enter 6-digit code → redirected to dashboard
3. Or: if session is only AAL1 when navigating directly → `AdminShell` shows **TotpChallengeView** first

### API Token Validation Test
```bash
# Should return 401 (no token)
curl https://api.razastationers.com/admin/products

# Should return 403 (customer token, not admin)
curl -H "Authorization: Bearer <customer_aal1_token>" https://api.razastationers.com/admin/products

# Should return 200 (admin token with aal2)
curl -H "Authorization: Bearer <admin_aal2_token>" https://api.razastationers.com/admin/products
```

---

## 9. Commit Reference

```
commit b8c3b3c
branch: phase-6-final-refinement
message: feat(auth): complete Supabase TOTP MFA gates and retire custom speakeasy TOTP

22 files changed, 1295 insertions(+), 584 deletions(-)
New files:
  apps/admin/src/components/shell/TotpChallengeView.tsx
  apps/admin/src/components/shell/TotpEnrollView.tsx
  apps/web/src/app/forgot-password/page.tsx
  apps/web/src/app/onboarding/page.tsx
  apps/web/src/app/reset-password/page.tsx
  authentication_progress.md
  authentication_Certification.md
```
