# Third Audit — Antigravity Remediation Loop

**Repository:** `ahmed000248/raza-stationers`  
**Target branch:** `phase-9-betterauth`  
**Execution file:** `third_audit.md`  
**Required progress file:** `third_audit_progress.md`

---

# 1. Your Role

You are the implementation agent for the Raza Stationers project.

Do not treat this document as a normal prompt. Treat it as a strict remediation loop.

You must:

1. Work on exactly one issue at a time.
2. Read the issue completely before changing code.
3. Inspect the current code before editing.
4. Implement the complete solution.
5. Run the required tests.
6. Fix every test failure caused by your work.
7. Update `third_audit_progress.md`.
8. Mark the issue as `PASSED` only when all acceptance criteria pass.
9. Commit the completed issue.
10. Move to the next issue only after the current issue is passed.

Do not skip issues.

Do not combine unrelated issues into one large change.

Do not mark an issue passed because the code “looks correct.”

Every issue must be verified by commands, tests, API calls, database checks, or browser tests.

---

# 2. Mandatory Work Loop

Use this loop for every issue.

```text
LOOP START

1. Read the next unresolved issue from third_audit.md.

2. Update third_audit_progress.md:
   Status = IN PROGRESS
   Started At = current date/time
   Current Issue = issue ID and title

3. Inspect all listed files and related code.

4. Write a short implementation plan inside third_audit_progress.md.

5. Implement only the current issue.

6. Run:
   - focused tests for the issue
   - typecheck
   - lint
   - relevant build
   - API or browser verification where required

7. If any check fails:
   - keep the issue IN PROGRESS
   - record the failure in third_audit_progress.md
   - fix the failure
   - rerun all required checks

8. When all acceptance criteria pass:
   - update the issue to PASSED
   - record exact commands and results
   - record changed files
   - record database changes, if any
   - record deployment verification, if any
   - record commit hash

9. Commit only the completed issue.

10. Move to the next unresolved issue.

LOOP END
```

Never move to the next issue while the current issue is `FAILED`, `BLOCKED`, or `IN PROGRESS`.

---

# 3. Required Progress Report

Create this file before editing any code:

```text
third_audit_progress.md
```

Use this structure:

```md
# Third Audit Progress Report

## Audit Information

- Repository: ahmed000248/raza-stationers
- Branch: phase-9-betterauth
- Started At:
- Last Updated At:
- Current Issue:
- Overall Status: IN PROGRESS

## Progress Summary

| Order | Issue ID | Title | Priority | Status | Commit |
|------:|----------|-------|----------|--------|--------|
| 1 | C-01 | API cannot start because JwtService is missing | Critical | NOT STARTED | |
| 2 | C-02 | Staging database is missing Better Auth schema | Critical | NOT STARTED | |
| 3 | C-03 | Split-domain cookie architecture breaks sessions | Critical | NOT STARTED | |
| 4 | C-04 | MFA is bypassed by hardcoded AAL2 | Critical | NOT STARTED | |
| 5 | C-05 | Multiple incompatible authentication systems coexist | Critical | NOT STARTED | |
| 6 | C-06 | Existing businesses can be taken over by mobile-number matching | Critical | NOT STARTED | |
| 7 | C-07 | Buying prices and cross-business financial data are exposed | Critical | NOT STARTED | |
| 8 | C-08 | Mobile app has mock authentication and mock authorization | Critical | NOT STARTED | |
| 9 | H-01 | Admin route protection is not secure | High | NOT STARTED | |
| 10 | H-02 | Password reset leaks tokens and has unreliable delivery | High | NOT STARTED | |
| 11 | H-03 | Signup does not complete business onboarding | High | NOT STARTED | |
| 12 | H-04 | Public catalogue exposes pending products and incorrect sale types | High | NOT STARTED | |
| 13 | H-05 | Accounting, returns, and delivery routes do not match clients | High | NOT STARTED | |
| 14 | H-06 | Inactive users and changed roles retain access | High | NOT STARTED | |
| 15 | H-07 | Supabase RLS does not provide tenant isolation | High | NOT STARTED | |
| 16 | H-08 | Trusted origins and cookie settings are inconsistent | High | NOT STARTED | |
| 17 | M-01 | Unauthorized responses do not clear stale frontend state | Medium | NOT STARTED | |
| 18 | M-02 | Phase 9 has no dedicated authentication regression suite | Medium | NOT STARTED | |
| 19 | M-03 | Important foreign keys lack indexes | Medium | NOT STARTED | |
| 20 | M-04 | Product creation can leave partial records | Medium | NOT STARTED | |

## Current Issue Implementation Plan

- Issue:
- Root Cause:
- Files to Inspect:
- Planned Changes:
- Tests to Run:

## Issue Completion Records

### ISSUE-ID — Issue title

- Status:
- Started At:
- Completed At:
- Root Cause Confirmed:
- Files Changed:
- Database Changes:
- Environment Changes:
- Tests Run:
- Test Results:
- Browser/API Verification:
- Remaining Risks:
- Commit Hash:
- Notes:
```

Allowed status values:

```text
NOT STARTED
IN PROGRESS
BLOCKED
FAILED
PASSED
```

Only use `PASSED` when every required acceptance criterion passes.

---

# 4. Global Safety Rules

1. Work on branch `phase-9-betterauth`.

2. Before changing code, run:

```bash
git status
git branch --show-current
git log -5 --oneline
```

3. Do not discard unrelated user changes.

4. Do not use:

```bash
git reset --hard
git clean -fd
git checkout .
```

5. Do not expose secret values in:
   - terminal output
   - progress report
   - commits
   - logs
   - screenshots

6. Do not run destructive database commands.

7. Do not use `prisma db push` on staging or production.

8. All database changes must use checked-in Prisma migrations or reviewed SQL migrations.

9. Apply database migrations to staging before production.

10. Never change production data as part of this audit unless the user explicitly authorizes it.

11. Do not silently catch important errors.

Bad:

```ts
try {
  await operation();
} catch {}
```

Good:

```ts
try {
  await operation();
} catch (error) {
  logger.error(error);
  throw error;
}
```

12. Do not keep insecure fallback behavior “temporarily” unless it is isolated behind a clearly named migration flag with tests and a removal task.

13. Do not mark an issue passed if the build is broken.

14. At the end of each issue, run the widest reasonable verification command.

15. Create one commit per passed issue using this format:

```text
fix(audit-C-01): register JWT dependency and restore API startup
```

---

# 5. Baseline Verification

Before starting C-01, record baseline results in `third_audit_progress.md`.

Run:

```bash
npm ci
npm run db:validate
npm run db:generate
npm run typecheck
npm run lint
npm run build:api
npm run build:web
npm run build:admin
npm run build --workspace=@raza-stationers/mobile
npm test
```

If baseline commands fail, record the failures.

Do not fix unrelated failures during baseline. Associate each known failure with the relevant issue.

---

# 6. Issue Queue

---

# C-01 — API Cannot Start Because `JwtService` Is Missing

**Priority:** Critical  
**Order:** 1

## Problem

`AuthService` injects `JwtService`, but `AuthModule` does not import `JwtModule`.

The Render deployment fails during NestJS dependency injection.

## Main Files

```text
apps/api/src/auth/auth.service.ts
apps/api/src/auth/auth.module.ts
apps/api/src/app.module.ts
apps/api/package.json
```

## Required Implementation

### Step 1 — Confirm the dependency

Inspect the constructor in:

```text
apps/api/src/auth/auth.service.ts
```

Confirm it contains:

```ts
constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
) {}
```

### Step 2 — Restore a valid NestJS provider

Until C-05 removes the legacy JWT system, import and configure `JwtModule`.

Use a structure equivalent to:

```ts
import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "7d",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, BetterAuthGuard],
  exports: [AuthService, BetterAuthGuard, JwtModule],
})
export class AuthModule {}
```

### Step 3 — Validate environment configuration

The API must fail clearly during startup if the legacy JWT code still exists and `JWT_SECRET` is missing.

Do not use a production fallback secret.

### Step 4 — Add API startup smoke test

Create a script that:

1. Starts the compiled API.
2. Waits for the health endpoint.
3. Fails if Nest exits.
4. Stops the process cleanly.

Add it to package scripts.

## Required Tests

```bash
npm run typecheck --workspace=@raza-stationers/api-server
npm run build:api
npm run test:api-startup
```

Also manually start:

```bash
NODE_ENV=production npm run start:prod --workspace=@raza-stationers/api-server
```

Use safe test environment variables.

## Acceptance Criteria

- API build succeeds.
- NestJS starts successfully.
- No `UnknownDependenciesException`.
- Health endpoint returns 200.
- Missing required JWT configuration produces a clear startup error.
- Startup smoke test is part of CI or the root verification flow.
- Progress report is updated.
- Issue commit is created.

---

# C-02 — Staging Database Is Missing the Better Auth Schema

**Priority:** Critical  
**Order:** 2

## Problem

The Prisma schema expects Better Auth tables and user fields that are absent from staging.

Expected tables:

```text
session
account
verification
two_factor
```

Expected user fields include:

```text
email_verified
image
two_factor_enabled
```

The Docker startup process generates Prisma Client but does not apply migrations.

## Main Files

```text
packages/db/prisma/schema.prisma
packages/db/prisma/migrations/*
Dockerfile
package.json
render.yaml
```

## Required Implementation

### Step 1 — Inspect migration history

Compare:

```text
packages/db/prisma/schema.prisma
packages/db/prisma/migrations
```

Determine the last migration that exists before Phase 9.

### Step 2 — Generate a real migration

Create a checked-in migration that adds:

- Better Auth user fields
- `session`
- `account`
- `verification`
- `two_factor`
- indexes
- unique constraints
- foreign keys
- timestamp mappings

Do not use `prisma db push`.

### Step 3 — Protect existing data

The migration must:

1. Add nullable columns first where necessary.
2. Backfill safe defaults.
3. Add non-null constraints after backfill.
4. Preserve existing user IDs and business relationships.
5. Avoid recreating or dropping the `users` table.
6. Avoid deleting legacy password data until C-05.

### Step 4 — Add migration deployment command

Add a controlled command:

```bash
npx prisma migrate deploy \
  --schema=packages/db/prisma/schema.prisma
```

Do not automatically run destructive migrations every time the API starts.

Prefer a release command, pre-deploy command, or documented deployment step.

### Step 5 — Add staging schema verification

Create a script that checks for:

```text
users
session
account
verification
two_factor
```

Also check required columns and indexes.

## Required Tests

Use a disposable PostgreSQL database:

```bash
npm run db:migrate:test
npm run db:validate
npm run db:generate
npm run test:phase9:migration
```

Then, only with authorized staging credentials:

```bash
npx prisma migrate deploy \
  --schema=packages/db/prisma/schema.prisma
```

Run schema verification against staging.

## Acceptance Criteria

- Fresh database migration succeeds.
- Existing Phase 8-style database migration succeeds.
- Staging contains all Better Auth tables and fields.
- Running `migrate deploy` a second time is a no-op.
- No user or business records are lost.
- Prisma Client matches the deployed database.
- Progress report contains migration name and verification results.
- Issue commit is created.

---

# C-03 — Split-Domain Cookies Break Sessions and Google OAuth

**Priority:** Critical  
**Order:** 3

## Problem

Authentication requests use a same-origin Next.js proxy, but protected API requests go directly from the browser to Render.

This creates separate cookie domains:

```text
Frontend cookie: Vercel domain
Backend cookie: Render domain
```

A cookie created for the frontend domain is not sent to Render.

A cookie created for Render is not visible to the frontend auth proxy.

Google OAuth state can be stored on one domain and validated on another.

## Main Files

```text
apps/web/src/hooks/use-auth.tsx
apps/admin/src/hooks/use-admin-auth.tsx
apps/web/src/lib/public-config.ts
apps/admin/src/lib/public-config.ts
apps/web/src/app/api/auth/[...all]/route.ts
apps/admin/src/app/api/auth/[...all]/route.ts
apps/web/src/app/auth/callback/route.ts
apps/admin/src/app/auth/callback/route.ts
packages/api/src/index.ts
apps/api/src/auth/better-auth.ts
apps/api/src/main.ts
```

## Required Architecture

Use a same-origin backend-for-frontend proxy.

Browser requests must use:

```text
Web:
https://web-domain/api/backend/*

Admin:
https://admin-domain/api/backend/*
```

The Next.js applications must forward requests to Render.

The browser must not call Render directly for authenticated workflows.

## Required Implementation

### Step 1 — Create catch-all API proxy routes

Create:

```text
apps/web/src/app/api/backend/[...path]/route.ts
apps/admin/src/app/api/backend/[...path]/route.ts
```

Support:

```text
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Forward:

- request method
- path
- query string
- body
- `Cookie`
- `Authorization`
- content type
- accepted language where needed
- controlled forwarding headers

Forward response:

- status code
- response body
- content type
- `Set-Cookie`
- safe cache headers

Do not blindly forward all untrusted headers.

### Step 2 — Update API clients

Change web and admin API clients to use:

```ts
baseUrl: "/api/backend"
```

Do not use the public Render URL in browser-side code.

### Step 3 — Keep auth same-origin

Use one same-origin Better Auth route per frontend.

Standardize it to:

```text
/api/auth/[...all]
```

Remove unnecessary nested `/auth/api` duplication if compatible with Better Auth configuration.

### Step 4 — Remove manual OAuth callback forwarding

Delete or stop using:

```text
apps/web/src/app/auth/callback/route.ts
apps/admin/src/app/auth/callback/route.ts
```

Better Auth must handle the Google provider callback directly.

### Step 5 — Configure canonical callback URLs

For each environment, document exact Google redirect URIs.

Example:

```text
https://web-domain/api/auth/callback/google
https://admin-domain/api/auth/callback/google
```

If one Better Auth instance serves both frontends, use the supported callback architecture and test both.

### Step 6 — Configure proxy-aware base URL

Use trusted forwarded headers only when they originate from the controlled Next.js proxy.

Do not trust arbitrary public `X-Forwarded-Host` values.

## Required Tests

Use Playwright or equivalent:

1. Email login.
2. Refresh.
3. Navigate to protected pages.
4. Call `/users/me`.
5. Call `/clients/me`.
6. Call `/orders`.
7. Log out.
8. Verify 401 after logout.
9. Complete Google OAuth.
10. Test Chrome.
11. Test Firefox.
12. Test Safari/WebKit.

Also inspect browser network requests and confirm authenticated browser calls do not target `onrender.com` directly.

## Acceptance Criteria

- One browser-visible origin is used per frontend.
- Protected API calls succeed after login.
- Session survives page refresh.
- Logout invalidates access.
- Google OAuth completes without state mismatch.
- No manual OAuth code forwarding remains.
- No third-party authentication cookie is required.
- Progress report contains browser verification evidence.
- Issue commit is created.

---

# C-04 — MFA Is Bypassed by Hardcoded `aal2`

**Priority:** Critical  
**Order:** 4

## Problem

The backend currently sets:

```ts
sessionTwoFactorVerified = true
```

for every Better Auth session.

It then derives an `aal2` state for normal sessions.

The frontend also stores MFA verification in `sessionStorage`, which is not secure proof.

## Main Files

```text
apps/api/src/auth/guards/better-auth.guard.ts
apps/api/src/auth/guards/roles.guard.ts
apps/admin/src/hooks/use-admin-auth.tsx
apps/admin/src/app/login/page.tsx
apps/admin/src/components/shell/AdminShell.tsx
apps/api/src/auth/better-auth.ts
```

## Required Implementation

### Step 1 — Remove fake MFA state

Delete all logic that automatically treats any session as MFA verified.

Delete the use of browser `sessionStorage` as security evidence.

Browser state may be used for UI only, never authorization.

### Step 2 — Use Better Auth two-factor flow

Credential login must detect:

```ts
twoFactorRedirect
```

When present:

- do not treat the user as authenticated
- show the TOTP challenge
- call Better Auth `verifyTotp`
- refresh the real session after successful verification

Do not require fake `factorId` or `challengeId` values.

### Step 3 — Add server-verifiable assurance

For sensitive owner/admin operations, the backend must have evidence that the current session completed MFA.

Use a supported Better Auth session field or custom session field such as:

```text
mfaVerifiedAt
```

The value must be written server-side after TOTP verification.

Add a guard or decorator such as:

```text
@RequireMfa()
```

Sensitive operations must require:

- current valid session
- current active user
- privileged role
- recent or current-session MFA verification

### Step 4 — Handle Google OAuth

Do not assume Google OAuth satisfies the Raza Stationers MFA requirement.

Choose one:

1. Disable Google login for owner/admin accounts.
2. Require a TOTP step-up after Google OAuth before entering the admin portal.

Implement the selected rule explicitly.

## Required Tests

- Owner email/password with no TOTP.
- Owner email/password with wrong TOTP.
- Owner email/password with correct TOTP.
- Admin refresh after TOTP.
- Fake `sessionStorage` flag.
- Direct API request without MFA.
- Google OAuth owner.
- Business user with no MFA.
- Expired MFA assurance.

## Acceptance Criteria

- Normal sessions are not labelled MFA verified.
- Client storage cannot bypass MFA.
- Privileged endpoints reject non-MFA sessions.
- Correct TOTP allows access.
- Wrong TOTP never creates a privileged session.
- Google privileged login follows the selected step-up policy.
- Progress report includes API test results.
- Issue commit is created.

---

# C-05 — Remove Multiple Incompatible Authentication Systems

**Priority:** Critical  
**Order:** 5

## Problem

The project currently supports multiple identity and session paths:

- Better Auth sessions
- manually inserted session records
- legacy JWTs
- `users.password_hash`
- Better Auth credential accounts
- Supabase-linking endpoints
- custom login and registration
- custom TOTP placeholders

This creates inconsistent password, session, MFA, refresh, revocation, and logout behavior.

## Main Files

```text
apps/api/src/auth/auth.controller.ts
apps/api/src/auth/auth.service.ts
apps/api/src/auth/better-auth.ts
apps/api/src/auth/guards/better-auth.guard.ts
apps/web/src/hooks/use-auth.tsx
apps/admin/src/hooks/use-admin-auth.tsx
packages/api/src/index.ts
packages/db/prisma/schema.prisma
scripts/admin/bootstrap-owner.mjs
tests/phase8/*
```

## Required Target

Better Auth must become the only authentication and session source of truth.

## Required Implementation

### Step 1 — Create migration inventory

Document every account type:

```text
legacy mobile user
legacy email user
Better Auth email user
Google user
owner
admin
packing
delivery
business user
MFA-enabled user
inactive user
```

### Step 2 — Build credential migration

Create a one-time migration script that:

1. Reads legacy users with `password_hash`.
2. Creates or updates Better Auth credential `account` rows.
3. Preserves bcrypt hashes where supported.
4. Does not overwrite existing Better Auth credentials.
5. Logs safe reconciliation counts.
6. Does not log passwords or hashes.
7. Is idempotent.
8. Supports dry-run mode.
9. Writes a migration marker or reconciliation record.

### Step 3 — Remove legacy session creation

Delete manual session insertion.

Delete custom raw session-token generation.

Delete JWT fallback verification.

Delete legacy JWT generation.

### Step 4 — Remove or deprecate old endpoints

Remove or disable:

```text
POST /auth/register
POST /auth/login
POST /auth/register-supabase
POST /auth/link
GET /auth/session-profile
custom /auth/totp/*
```

Update all clients to use Better Auth directly.

### Step 5 — Unify password changes

Password changes and resets must update Better Auth credentials only.

Do not keep a second password hash.

### Step 6 — Remove old fields only after reconciliation

Do not remove:

```text
password_hash
supabase_auth_id
totp_secret
is_totp_enabled
```

until:

- migration is complete
- reconciliation passes
- rollback plan exists
- all clients use Better Auth

Use a separate cleanup migration after verification.

## Required Tests

Create a matrix test for every account type.

Verify:

- one login flow
- one session table
- one logout flow
- one password source
- one password reset flow
- one MFA flow
- one role source
- one user ID

## Acceptance Criteria

- No manual session rows are created by application code.
- No legacy JWT authentication remains in runtime code.
- Password login uses Better Auth credentials.
- Password change affects the same credentials used by login.
- Legacy accounts migrate successfully.
- Migration is dry-run capable and idempotent.
- Reconciliation report passes.
- Progress report contains migration counts.
- Issue commit is created.

---

# C-06 — Prevent Business Account Takeover

**Priority:** Critical  
**Order:** 6

## Problem

When a business already exists with the submitted mobile number, the current code links the new authenticated user to that business as `owner`.

A matching phone number is not proof of ownership.

## Main Files

```text
apps/api/src/clients/clients.controller.ts
apps/api/src/clients/clients.service.ts
packages/db/prisma/schema.prisma
apps/web onboarding and registration pages
packages/api/src/index.ts
```

## Required Implementation

### Step 1 — Remove automatic linking

Delete the branch that creates a new owner link when `existingBusiness` is found by phone number.

Return:

```text
409 BUSINESS_ALREADY_REGISTERED
```

or initiate a verified claim workflow.

### Step 2 — Implement a safe claim method

Use one explicit method:

- invitation from existing owner
- OTP sent to verified business phone
- owner/admin approval
- signed short-lived claim token

Do not create ownership before verification.

### Step 3 — Add object-level authorization

Rules:

```text
GET /clients
owner/admin only

GET /clients/:id
owner/admin OR active link to that exact business

GET /clients/:id/credit
owner/admin OR active link to that exact business

POST /clients
authenticated user may create a new business
authenticated user may not claim an existing business automatically
```

All business-link lookups must include:

```ts
endedAt: null
```

### Step 4 — Do not leak existence unnecessarily

For unauthorized object access, prefer a safe 404 where appropriate.

## Required Tests

- User A creates Business A.
- User B registers using Business A phone.
- User B requests Business A by ID.
- User B requests Business A credit.
- User B attempts to place an order for Business A.
- Active linked manager accesses allowed business data.
- Ended link no longer works.
- Owner/admin access still works.

## Acceptance Criteria

- Phone-number matching never creates ownership.
- Cross-business reads are blocked.
- Ended links are ignored.
- Claim workflow requires proof or approval.
- All object authorization tests pass.
- Issue commit is created.

---

# C-07 — Protect Buying Prices and Cross-Business Financial Data

**Priority:** Critical  
**Order:** 7

## Problem

Authenticated users can provide an arbitrary `clientBusinessId`.

Pricing responses can expose:

```text
buyingPrice
wholesalePrice
client-specific price
price source
```

Other endpoints expose global dashboard data and returns without ownership validation.

## Main Files

```text
apps/api/src/pricing/pricing.controller.ts
apps/api/src/pricing/pricing.service.ts
apps/api/src/dashboard/dashboard.controller.ts
apps/api/src/returns/returns.controller.ts
apps/api/src/returns/returns.service.ts
apps/api/src/invoicing/invoicing.controller.ts
apps/api/src/invoicing/invoicing.service.ts
```

## Required Implementation

### Customer pricing

Do not trust a customer-supplied business ID.

Resolve the business from the authenticated user’s active link.

Customer response must include only:

```text
effectivePrice
allowed packaging
availability
public price source label if needed
```

Customer response must not include:

```text
buyingPrice
margin
internal discount calculation
supplier information
other business pricing
```

### Admin pricing

Create or keep a separate owner/admin endpoint for:

```text
buying price
margin
all price types
client-specific rules
```

### Dashboard

Restrict global dashboard statistics to authorized internal roles.

### Returns

For return creation:

- verify order exists
- verify invoice exists
- verify invoice belongs to order
- verify user is linked to the order’s business
- verify link is active
- verify order status allows return

For reading returns:

- internal authorized role, or
- active linked user for the exact business

### Invoices

Apply the same object-level authorization rules to invoice access.

## Required Tests

- Business A requests Business B price.
- Customer inspects JSON for buying price.
- Customer requests global dashboard.
- Customer creates return for another business order.
- Customer reads another business invoice.
- Admin reads internal financial data.
- Owner reads internal financial data.

## Acceptance Criteria

- Customer responses never contain buying price.
- Cross-business price requests fail.
- Dashboard is role-protected.
- Returns and invoices enforce ownership.
- Internal financial endpoints require owner/admin.
- Issue commit is created.

---

# C-08 — Replace Mock Mobile Authentication and Authorization

**Priority:** Critical for mobile release  
**Order:** 8

## Problem

The current mobile package is a Vite React prototype.

It allows local role selection and mock sign-in.

It uses mock users, mock orders, mock cart data, and mock product fallback.

## Main Files

```text
apps/mobile/package.json
apps/mobile/src/App.tsx
apps/mobile/src/lib/api.ts
apps/mobile/src/components/screens/SignInScreen.tsx
apps/mobile/src/components/screens/RegisterScreen.tsx
apps/mobile/src/data/*
apps/mobile/src/types.ts
```

## Required Decision

Choose one:

```text
A. Rename and isolate as mobile-prototype
B. Finish as a real authenticated mobile web/PWA client
C. Replace with an Expo/React Native application
```

Record the selected approach in the progress report.

Do not claim production mobile readiness while mock authentication remains.

## Required Implementation for Existing Vite Client

### Environment variables

Use:

```ts
import.meta.env.VITE_API_URL
```

Do not use:

```ts
process.env.EXPO_PUBLIC_API_URL
process.env.NEXT_PUBLIC_API_URL
```

inside Vite browser code.

### Authentication

Use the canonical Better Auth flow.

The server must determine:

- user identity
- role
- business link
- business status
- pricing tier

Delete local role selection.

### Catalogue contract

The backend returns:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20,
  "totalPages": 0
}
```

Map `items` correctly.

Use `categorySlug`, not `category`.

Do not send ignored `tier` parameters.

### Production fallback

Mock fallback is allowed only when:

```ts
import.meta.env.VITE_DEMO_MODE === "true"
```

Production API failure must show a real error state.

### Orders

Use the backend order contract:

```text
clientBusinessId
items[].productPackagingId
items[].quantity
recipientName
mobile
address
city
deliveryNotes
paymentMethod
fulfilmentMethod
idempotencyKey
```

### Registration

Create real authentication and business onboarding records.

Document upload must be real or removed from production UI.

## Required Tests

- Login with real account.
- Restart application.
- Session remains valid.
- Logout revokes access.
- User cannot choose role.
- API failure does not show mock catalog in production.
- Real product mapping works.
- Real order reaches database.
- Pending and approved business states render correctly.

## Acceptance Criteria

- No fake role login remains.
- No production mock fallback remains.
- Real session bootstrap works.
- Real API contracts are used.
- Mobile status is described honestly.
- Issue commit is created.

---

# H-01 — Secure Admin Route Protection

**Priority:** High  
**Order:** 9

## Problem

Admin middleware only checks whether a cookie name exists.

It does not validate the session.

The admin hook defaults a missing role to `admin`.

## Main Files

```text
apps/admin/src/middleware.ts
apps/admin/src/proxy.ts
apps/admin/src/app/layout.tsx
apps/admin/src/app/(protected)/*
apps/admin/src/hooks/use-admin-auth.tsx
apps/admin/src/components/shell/AdminShell.tsx
```

## Required Implementation

1. For Next.js 16, replace `middleware.ts` with `proxy.ts`.
2. Cookie presence may be used only as an optimistic redirect.
3. Validate the full session in the protected layout or server boundary.
4. Load authoritative user role and active state.
5. Allow only:

```text
owner
admin
packing
delivery
```

6. Default missing role to `null`.
7. Deny unknown roles.
8. Apply role-specific navigation and page authorization.
9. Do not render sensitive data before verification completes.

## Required Tests

- No cookie.
- Fake cookie.
- Expired cookie.
- Business-user cookie.
- Inactive admin.
- Packing user.
- Delivery user.
- Owner.
- Admin.

## Acceptance Criteria

- Fake cookies cannot access admin pages.
- Business users cannot access admin pages.
- Unknown role is denied.
- Inactive staff is denied.
- Page-level role rules work.
- Issue commit is created.

---

# H-02 — Fix Password Reset Security and Reliability

**Priority:** High  
**Order:** 10

## Problem

Reset URLs are logged.

The application rebuilds the reset URL instead of using the URL supplied by Better Auth.

Email failures can be swallowed.

The frontend uses untyped methods.

## Main Files

```text
apps/api/src/auth/better-auth.ts
apps/web/src/hooks/use-auth.tsx
apps/web/src/app/forgot-password/*
apps/web/src/app/reset-password/*
apps/admin password reset pages if present
```

## Required Implementation

1. Remove all reset URL and token logging.
2. Send the exact URL provided by Better Auth.
3. Use the typed Better Auth request-password-reset method.
4. Use one password store only.
5. Revoke sessions after successful password reset.
6. Validate SMTP configuration at startup.
7. Return a generic response for existing and non-existing emails.
8. Record email delivery failures in safe structured logs.
9. Do not expose tokens in logs or errors.
10. Use an asynchronous queue if available; otherwise ensure public timing is not account-enumeration friendly.

## Required Tests

- Existing email.
- Unknown email.
- SMTP failure.
- Expired token.
- Reused token.
- Successful reset.
- Old password rejected.
- New password accepted.
- Old sessions revoked.
- No token appears in logs.

## Acceptance Criteria

- No reset token appears in logs.
- Exact Better Auth URL is sent.
- Frontend uses typed methods.
- Reset and login use the same credential source.
- Generic public responses prevent enumeration.
- Issue commit is created.

---

# H-03 — Complete Signup and Business Onboarding

**Priority:** High  
**Order:** 11

## Problem

The registration function accepts business details but discards them.

Only the Better Auth user account is created.

The onboarding guard is defined but not used.

Account state is inferred incorrectly from whether the user has a mobile number.

## Main Files

```text
apps/web/src/hooks/use-auth.tsx
apps/web/src/app/signup/*
apps/web/src/app/register/*
apps/web/src/app/onboarding/*
apps/api/src/clients/*
packages/api/src/index.ts
```

## Required Implementation

1. Create the Better Auth identity.
2. Create or resume business onboarding.
3. Create exactly one business record.
4. Create exactly one active business link.
5. Make onboarding idempotent.
6. Preserve partial progress safely.
7. Derive state from:

```text
authenticated user
active business link
business account status
```

Use states:

```text
guest
authenticated_unregistered
pending_approval
active
suspended
rejected
```

Actually wrap children with the onboarding gate.

Do not force ordinary retail customers into wholesale business onboarding unless product requirements require it.

## Required Tests

- Identity creation succeeds, business creation fails.
- User retries onboarding.
- Duplicate submission.
- Pending business.
- Active business.
- Suspended business.
- Rejected business.
- Customer-only account.

## Acceptance Criteria

- Business form values are persisted.
- Signup is resumable.
- Duplicate business records are not created.
- Account status is server-derived.
- Onboarding redirect works.
- Issue commit is created.

---

# H-04 — Fix Public Catalogue Visibility and Sale Filters

**Priority:** High  
**Order:** 12

## Problem

The public catalogue includes `pending_review` products.

Individual and bulk filters use the same SQL.

The response marks all products as individual-sale products.

Public detail routes reject only archived products.

## Main Files

```text
apps/api/src/catalogue/catalogue.service.ts
apps/api/src/catalogue/catalogue.controller.ts
apps/web catalogue pages
apps/mobile catalogue mapping
```

## Required Implementation

### Public listing

Use:

```sql
p.status = 'active'
```

### Individual filter

Require:

```text
allow_individual_sale = true
active base packaging
valid current public price
```

### Bulk filter

Require:

```text
active packaging
conversion_to_base > 1
valid current public price
```

### Response

Use real values:

```ts
saleTypes: {
  individual: product.allowIndividualSale,
  bulk: packages.some(
    (pkg) => pkg.conversionToBase > 1
  ),
}
```

### Detail routes

Public product-by-ID and product-by-SKU endpoints must return only active products.

Admin routes may return pending or archived products.

## Required Tests

Seed:

- active individual only
- active bulk only
- active both
- pending
- rejected
- archived
- active without price

Test:

- search
- category
- individual filter
- bulk filter
- pagination
- total count
- detail route
- direct URL access

## Acceptance Criteria

- Pending products never appear publicly.
- Sale filters return correct products.
- Sale type flags are accurate.
- Detail routes enforce active status.
- Issue commit is created.

---

# H-05 — Repair Accounting, Returns, and Delivery Route Contracts

**Priority:** High  
**Order:** 13

## Problem

Controller prefixes and route paths are duplicated.

The client and server do not agree.

Delivery creation reads a parameter that does not exist.

## Main Files

```text
apps/api/src/accounting/accounting.controller.ts
apps/api/src/returns/returns.controller.ts
apps/api/src/delivery/delivery.controller.ts
packages/api/src/index.ts
admin pages that call these methods
web pages that call these methods
```

## Required Routes

### Accounting

```text
GET  /accounting/summary
GET  /accounting/revenue
GET  /accounting/expenses
POST /accounting/expenses
GET  /accounting/outstanding
```

### Returns

```text
POST /returns
GET  /returns/:id
GET  /returns/order/:orderId
```

### Delivery

Use one:

```text
POST /deliveries/:orderId
```

or:

```text
POST /deliveries
Body: { orderId }
```

Use DTO validation.

## Required Implementation

1. Fix controller routes.
2. Update shared API client.
3. Update all callers.
4. Update Swagger.
5. Add contract tests that compare client methods with API routes.
6. Add DTOs rather than anonymous request-body types.

## Required Tests

- Every accounting API client method.
- Return creation.
- Return lookup.
- Delivery creation.
- Invalid order ID.
- Missing order ID.
- Unauthorized role.
- Swagger/OpenAPI route check.

## Acceptance Criteria

- No double-prefixed routes.
- Shared client calls exact server paths.
- Delivery receives a valid order ID.
- Contract tests pass.
- Issue commit is created.

---

# H-06 — Revoke Access for Inactive Users and Changed Roles

**Priority:** High  
**Order:** 14

## Problem

The guard trusts session role data and hardcodes:

```ts
isActive: true
```

Existing sessions may retain permissions after role change or deactivation.

## Main Files

```text
apps/api/src/auth/guards/better-auth.guard.ts
apps/api/src/auth/guards/roles.guard.ts
apps/api/src/staff/staff.service.ts
apps/api/src/users/*
apps/api/src/auth/better-auth.ts
```

## Required Implementation

For protected requests, load current authorization data from the database:

```text
id
role
isActive
twoFactorEnabled
current business links if required
```

Reject inactive users.

When staff role or active status changes:

1. Update user.
2. Revoke all sessions for that user.
3. Write audit log.
4. Require fresh login.

Do not trust stale session role for high-risk decisions.

## Required Tests

- Active admin logs in.
- Admin is deactivated elsewhere.
- Old session calls API.
- Admin role changes to packing.
- Old session calls owner/admin API.
- End business link.
- Old session attempts business API.

## Acceptance Criteria

- Deactivation takes effect immediately.
- Role downgrade takes effect immediately.
- Ended business links stop working.
- Sessions are revoked after high-risk authorization changes.
- Issue commit is created.

---

# H-07 — Define and Enforce the Supabase RLS Model

**Priority:** High  
**Order:** 15

## Problem

Business tables grant the runtime role broad access.

RLS currently does not isolate tenants for backend queries.

Better Auth sessions are not automatically Supabase Auth JWTs.

A public security-definer helper may be executable by anonymous or authenticated Supabase roles.

## Main Files

```text
packages/db/prisma/migrations/*
supabase SQL migrations
database security documentation
apps/api/src/prisma/*
apps/api authorization guards
```

## Required Decision

Choose one model and document it.

### Model A — Backend-only database authorization

- Browser cannot query business tables through Supabase Data API.
- Dedicated runtime role accesses database.
- NestJS enforces every role and object rule.
- `anon` and `authenticated` receive no business-table access.

### Model B — Database tenant authorization

- Better Auth identity produces verified claims accepted by Supabase.
- RLS enforces tenant isolation.
- Every policy is tested.

Do not pretend current Better Auth sessions automatically work with `auth.uid()`.

## Required Implementation

Minimum required changes:

1. Revoke public execution from security-definer administration helpers.
2. Move admin helpers to a private schema.
3. Verify grants for:

```text
anon
authenticated
runtime role
migration role
```

4. Verify Better Auth tables are writable by the actual runtime role.
5. Add database authorization tests.
6. Document the final model.

Example required revocation:

```sql
revoke execute
on function public.rls_auto_enable()
from public, anon, authenticated;
```

## Required Tests

- Anonymous Data API access.
- Authenticated Supabase Data API access.
- Runtime role access.
- Migration role access.
- Security-definer helper execution.
- Better Auth session create/read/delete.
- Tenant access tests if Model B is selected.

## Acceptance Criteria

- Security model is explicit.
- Public roles cannot invoke administration helpers.
- Browser roles cannot read private business data.
- Better Auth runtime permissions are verified.
- Database tests pass.
- Issue commit is created.

---

# H-08 — Unify Trusted Origins and Cookie Configuration

**Priority:** High  
**Order:** 16

## Problem

The code calculates an environment-based origin list but uses a separate hardcoded list.

Cookies are always forced to:

```text
secure = true
sameSite = none
```

including local development.

## Main Files

```text
apps/api/src/auth/better-auth.ts
apps/api/src/main.ts
.env.example
render.yaml
Vercel environment documentation
apps/web environment validation
apps/admin environment validation
```

## Required Implementation

1. Create one environment-validation module.
2. Validate all required variables at startup.
3. Use one trusted-origin list.
4. Use production-aware cookie flags.
5. Prefer `SameSite=Lax` with the same-origin proxy architecture.
6. Use `secure: false` only for local HTTP development.
7. Add preview origins only through controlled patterns or explicit environment values.
8. Fail clearly if Google is configured partially.
9. Validate web URL, admin URL, API URL, SMTP, database, and auth secret.

Example:

```ts
advanced: {
  useSecureCookies: isProd,
  defaultCookieAttributes: {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  },
},
trustedOrigins,
```

## Required Tests

Environment matrix:

```text
local web
local admin
Vercel preview
staging web
staging admin
production web
production admin
Render staging API
Render production API
```

Verify:

- allowed origin
- blocked origin
- cookies
- callback URL
- password reset URL
- CORS
- preview behavior

## Acceptance Criteria

- One trusted-origin source exists.
- Local HTTP login works.
- Production cookies remain secure.
- Preview origins are handled intentionally.
- Partial Google setup fails clearly.
- Issue commit is created.

---

# M-01 — Clear Stale Frontend State on 401

**Priority:** Medium  
**Order:** 17

## Problem

The API client stores an `onUnauthorized` callback but never calls it.

## Main Files

```text
packages/api/src/index.ts
apps/web/src/hooks/use-auth.tsx
apps/admin/src/hooks/use-admin-auth.tsx
```

## Required Implementation

In the API error handler:

```ts
if (res.status === 401) {
  this.onUnauthorized?.();
}
```

The callback must:

- clear authenticated user state
- clear business state
- clear role state
- redirect to login where appropriate
- avoid infinite loops
- preserve safe return path

## Required Tests

- Session expires while page is open.
- Next API request returns 401.
- Web user state clears.
- Admin state clears.
- Login redirect occurs once.
- No infinite request loop.
- Public API requests do not force login.

## Acceptance Criteria

- 401 triggers one controlled logout flow.
- Stale protected UI disappears.
- Return path is preserved safely.
- Issue commit is created.

---

# M-02 — Add a Phase 9 Regression Suite

**Priority:** Medium  
**Order:** 18

## Problem

The root tests cover earlier phases but do not cover the Better Auth migration.

## Main Files

```text
package.json
tests/phase9/*
playwright config
CI workflow files
```

## Required Test Suites

Create:

```text
tests/phase9/auth-email
tests/phase9/auth-google
tests/phase9/auth-mfa
tests/phase9/auth-role-revocation
tests/phase9/auth-cookie-proxy
tests/phase9/api-authorization
tests/phase9/mobile-contract
tests/phase9/migration
tests/phase9/route-contract
tests/phase9/api-startup
```

## Required CI Gates

```text
db validate
db generate
typecheck
lint
API build
web build
admin build
mobile build
API startup
disposable migration
auth E2E
authorization E2E
route contract
Playwright web/admin tests
```

Update root scripts so Phase 9 tests run by default.

## Acceptance Criteria

- Tests fail when C-01-style dependency injection is broken.
- Tests fail when MFA is bypassed.
- Tests fail on cross-business access.
- Tests fail on route mismatch.
- Tests fail when staging migration is incomplete.
- CI runs the suite.
- Issue commit is created.

---

# M-03 — Add Important Foreign-Key Indexes

**Priority:** Medium  
**Order:** 19

## Problem

The database advisor reports many foreign keys without supporting indexes.

Do not blindly add every possible index.

## Main Files

```text
packages/db/prisma/schema.prisma
packages/db/prisma/migrations/*
query-heavy services
database performance documentation
```

## Required Implementation

Start with query-critical relationships:

```text
products.category_id
orders.placed_by_user_id
business_user_links.linked_by_id
business_user_links.ended_by_id
product_prices.created_by_id
stock_movements.stock_location_id
stock_movements.created_by_id
payments.submitted_by_id
payments.verified_by_id
refund actor columns
approval actor columns
```

Use real query plans.

For large live tables, use safe index creation strategy.

Record:

- before plan
- after plan
- index size
- write impact

## Required Tests

Use:

```sql
EXPLAIN (ANALYZE, BUFFERS)
```

for high-traffic queries.

Measure:

- admin catalog
- client order history
- stock screens
- audit logs
- payments
- returns

## Acceptance Criteria

- Critical missing indexes are added by migration.
- Query plans improve or remain justified.
- No duplicate indexes are added.
- Write overhead is considered.
- Issue commit is created.

---

# M-04 — Make Product Creation Atomic

**Priority:** Medium  
**Order:** 20

## Problem

Product creation can use:

```ts
unitOfMeasureId: uom?.id || ""
```

If no active UOM exists, packaging creation fails after the product was already inserted.

Product, packaging, and price creation are not one transaction.

## Main Files

```text
apps/api/src/catalogue/catalogue.service.ts
apps/api/src/catalogue/dto/*
tests/phase9/catalogue-product-create*
```

## Required Implementation

1. Validate active category.
2. Validate active UOM before product creation.
3. Validate request using DTOs.
4. Wrap SKU allocation, product, packaging, and price creation in one transaction where compatible with the allocation function.
5. Do not use an empty foreign key.
6. If any step fails, roll back every inserted record.
7. Return clear conflict or validation errors.

Example:

```ts
return this.prisma.$transaction(async (tx) => {
  const uom = await tx.unitOfMeasure.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!uom) {
    throw new ConflictException(
      "No active unit of measure is configured",
    );
  }

  const product = await tx.product.create(...);
  const packaging = await tx.productPackaging.create(...);

  if (priceProvided) {
    await tx.productPrice.create(...);
  }

  return ...
});
```

## Required Tests

- No active UOM.
- Invalid category.
- Packaging insert failure.
- Price insert failure.
- Duplicate SKU.
- Successful product creation.
- Verify no partial product after failure.

## Acceptance Criteria

- Empty UOM IDs are impossible.
- Product creation is atomic.
- Failure leaves no orphan product.
- DTO validation exists.
- Issue commit is created.

---

# 7. Final Verification Loop

After all 20 issues are marked `PASSED`, do not stop immediately.

Run the complete final verification.

```bash
git status
npm ci
npm run db:validate
npm run db:generate
npm run typecheck
npm run lint
npm run build
npm test
npm run test:phase9
npm run test:api-startup
```

Run disposable migration tests.

Run authorized staging migration verification.

Run Playwright tests for:

```text
web email login
web Google login
web session refresh
web logout
admin owner login
admin MFA challenge
admin role restrictions
customer catalogue
business onboarding
order placement
cross-business access denial
password reset
```

Run mobile integration tests for the selected mobile approach.

---

# 8. Final Progress Report Requirements

At the end, update `third_audit_progress.md`:

```text
Overall Status: PASSED
```

Only when:

- all 20 issues are passed
- all final commands pass
- staging verification passes
- no Critical or High issue remains open

Add:

```md
## Final Verification

- Final Commit:
- Final Branch:
- Database Migration State:
- Render Deployment State:
- Web Deployment State:
- Admin Deployment State:
- Test Summary:
- Known Remaining Advisories:
- Production Promotion Recommendation:
```

Use one recommendation:

```text
READY FOR STAGING
READY FOR CONTROLLED PRODUCTION PROMOTION
NOT READY
```

Do not write `READY FOR CONTROLLED PRODUCTION PROMOTION` unless the complete suite and staging verification pass.

---

# 9. Definition of Done

The third audit is complete only when:

1. All issues are `PASSED`.
2. Every issue has an individual commit.
3. `third_audit_progress.md` is complete.
4. The API starts.
5. Staging schema matches code.
6. Better Auth is the only session system.
7. Cookie architecture works across all clients.
8. MFA cannot be bypassed.
9. Cross-business access is blocked.
10. Buying prices are private.
11. Admin authorization is server-validated.
12. Catalog publication rules are correct.
13. Mobile status is real and documented.
14. Route contracts match.
15. Role changes revoke access.
16. Database permissions are documented and tested.
17. Phase 9 tests run in CI.
18. Full verification passes.
19. No secret is exposed.
20. Final production recommendation is evidence-based.

Do not stop before the Definition of Done is satisfied.
