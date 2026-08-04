# Raza Stationers — Authentication & Connection Debugging Report

**Repository:** `github.com/ahmed000248/raza-stationers`
**Branch analyzed:** `phase-9-betterauth` (HEAD at analysis time: `eda7cc6 fix(types): cast authClient for forgetPassword and resetPassword in use-auth.tsx`)
**Environments:**
- Web (storefront): `https://raza-stationers-web.vercel.app`
- Admin: `https://raza-stationers-admin-seven.vercel.app`
- API: `https://raza-stationers-api-staging.onrender.com`

**Method:** The branch was cloned directly and read file-by-file — this is not a generic checklist, every finding below is traced to a specific file, line, and (where relevant) a specific migration or dependency version actually present in the repo. Where I could not verify something without access you don't have either (Render/Vercel dashboard values, Google Cloud Console state, live database contents), it's explicitly flagged as an **assumption to verify**, not stated as fact.

---

## Executive Summary

| # | Issue | Severity | Symptom it explains |
|---|---|---|---|
| 1 | Admin Next.js middleware unconditionally redirects every route to `/login` | **Critical** | "Admin still not signing in" |
| 2 | `JwtAuthGuard` never updated for Better Auth cookie sessions — 17 controllers reject every request | **Critical** | Auth state not maintained across requests; anything past login fails |
| 3 | `User.mobileNumber` DB constraints make Google OAuth signup fail at the database layer | **Critical** | "Google Sign-in not working" |
| 4 | Google OAuth is configured in the wrong place (Supabase, not Google Cloud Console + Render) | **Critical** | Same as #3, plus `NEXT_PUBLIC_SUPABASE_URL` error |
| 5 | `render.yaml` / `.env.example` files are stale — missing every Better Auth env var | **Critical** | Root cause behind #3, #4 and likely #1's cousin issues; server silently falls back to a hardcoded default secret |
| 6 | Admin MFA enroll/disable hardcodes `password: ""` | **High** | 2FA setup will always fail once login itself is fixed |
| 7 | `better-auth` version declared inconsistently across workspaces | **Medium** | Currently masked by npm hoisting, but fragile |
| 8 | `dash()` plugin partially configured; client loads `sentinelClient()` but server never registers `sentinel()` | **Medium** | Console warnings, wasted fingerprinting requests, no functional break confirmed |
| 9 | Legacy `/auth/login`, `/auth/register`, `/auth/totp/*` endpoints still live and unused | **Low** | Dead code / confusing API surface, minor security relic |
| 10 | `authenticated_unregistered` account status is never set by `checkSession()` | **Medium** | Orphaned onboarding redirect flow on web |
| 11 | Catalogue "Unable to connect to server" | **Not an auth bug** | Almost certainly Render/Supabase availability, not authentication |
| 12 | CORS allows any `*.vercel.app` origin | **Low** | Not currently breaking anything; worth tightening before production |
| 13 | `docs/betterAuth/betterauth_progress.md` marks Phases 0–8 "Complete" with every task checkbox still unchecked | **Process issue** | Explains how #1, #2, #3, #6 shipped without being caught |

**The core story:** the migration from Supabase Auth to Better Auth replaced *how users log in*, but three things were never updated to match: the Admin app's route-protection middleware, the NestJS guards that protect almost every API route, and the database constraints on `User.mobileNumber`. Individually any one of these would break the system; together they mean **login can appear to work in isolation, but nothing downstream of it does.**

---

## Issue-by-Issue Breakdown

### Issue 1 — Admin app is locked out regardless of login state

**Description:** Every request to the Admin app except `/login` and `/auth/*` is unconditionally redirected back to the login page.

**Files affected:** `apps/admin/src/middleware.ts` (entire file, lines 1–19)

```ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Protected admin routes fail closed when no replacement authentication provider is configured
  return NextResponse.redirect(new URL("/login?reason=auth_unconfigured", request.url));
}
```

**Root cause:** This is a leftover "fail closed" stub. The comment on line 10 says it outright — it was written when the old Supabase SSR middleware was removed during the Better Auth migration, as a safety net so the admin app wouldn't accidentally allow unauthenticated access while auth was mid-migration. Nobody replaced it with a real check once Better Auth was wired up. It does not read cookies, does not check session state, does not do anything except redirect.

**Why this can't be fixed by just "checking the cookie" the naive way:** Better Auth is mounted on the **API** (`raza-stationers-api-staging.onrender.com`), a different origin from the Admin app (`raza-stationers-admin-seven.vercel.app`). The session cookie Better Auth sets belongs to the **API's** domain. Next.js middleware only ever sees cookies that were sent *to the admin app's own domain* — it will never see the API's session cookie, no matter how you write the check. This is a direct, concrete consequence of the cross-domain topology issue already flagged in your own `phases.md`/`betterauth_progress.md` (decision D6/D9) — this is that theoretical risk actually manifesting as a bug.

**Fix — recommended (works today, no infra changes needed):**

Remove the blanket middleware redirect and let the client-side gate that's already implemented in `AdminShell`/`useAdminAuth` do the job — it calls `authClient.getSession()`, which is a real cross-origin `fetch()` with `credentials: "include"` and *does* correctly receive the API's cookie (browsers send cookies on cross-site `fetch` when `credentials: "include"` is set and the cookie is `SameSite=None; Secure`, even though a passive Next.js middleware read cannot see it).

```ts
// apps/admin/src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

// Middleware cannot see the Better Auth session cookie (it belongs to the
// API's origin, not this app's origin) — auth is enforced client-side by
// AdminShell/useAdminAuth via a real cross-origin fetch instead.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

Then confirm `AdminShell` (the component that wraps protected admin pages) actually blocks rendering until `useAdminAuth()`'s `loading` is `false` and `user` is non-null, redirecting to `/login` client-side otherwise. Based on `use-admin-auth.tsx`, `loading` starts `true` and `refreshSession()` resolves it — verify `AdminShell` respects this (`apps/admin/src/components/shell/AdminShell.tsx`, not fully inspected in this pass — check it explicitly as your first manual test).

**Fix — proper long-term fix (matches your own D9 decision):** put the Admin app and the API behind the same top-level domain (e.g. `admin.razastationers.com` and `api.razastationers.com`), so the session cookie is a legitimate first-party cookie to both. At that point, Better Auth's `getSessionCookie()` helper from `better-auth/cookies` becomes usable in middleware for a real (if optimistic-only) redirect check:

```ts
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/auth")) return NextResponse.next();

  const sessionCookie = getSessionCookie(request); // cookie-existence check only — NOT full validation
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login?reason=unauthenticated", request.url));
  }
  return NextResponse.next();
}
```
This still isn't full session validation (Better Auth's own docs call cookie-existence-only checks "NOT SECURE" for authorization decisions) — real enforcement still has to happen against the API for anything sensitive. But it works, because at that point the cookie is first-party.

**Related files:** `apps/admin/src/hooks/use-admin-auth.tsx`, `apps/admin/src/components/shell/AdminShell.tsx` (verify its gating logic as part of this fix).

---

### Issue 2 — Every protected API route rejects every logged-in user

**Description:** After a successful Better Auth login (cookie session established), any subsequent call to one of 17 guarded controllers returns 401.

**Files affected:**
- `apps/api/src/auth/guards/jwt-auth.guard.ts` (entire file)
- `apps/api/src/auth/strategies/jwt.strategy.ts`, `apps/api/src/auth/strategies/supabase.strategy.ts`
- `apps/web/src/hooks/use-auth.tsx` line 236: `const getAccessToken = React.useCallback(async () => null, [])`
- Every controller using `@UseGuards(JwtAuthGuard)`: `users`, `auth`, `delivery`, `orders`, `audit`, `invoicing`, `notifications`, `settings`, `staff`, `accounting`, `inventory`, `returns`, `imports`, `clients`, `catalogue` (admin routes), `dashboard`, `pricing` — 17 controller files total.

```ts
// apps/api/src/auth/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard(["supabase", "jwt"]) {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException("Invalid or expired token");
    }
    return user;
  }
}
```

Both underlying strategies extract the credential the same way:

```ts
// apps/api/src/auth/strategies/jwt.strategy.ts and supabase.strategy.ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ...
});
```

**Root cause:** `JwtAuthGuard` only knows how to read `Authorization: Bearer <token>`. It has no knowledge of Better Auth's cookie session at all. Meanwhile, the frontend hooks that talk to Better Auth never produce a bearer token — `getAccessToken()` in `use-auth.tsx` is hardcoded to always return `null` (this was presumably left as a stub because Better Auth is cookie-based and a bearer token genuinely isn't needed for *Better Auth's own* endpoints — but nobody updated the 17 controllers that still expect one).

Net effect: `POST /auth/api/sign-in/email` (Better Auth) succeeds and sets a cookie. The very next call — `GET /orders`, `GET /clients`, `GET /admin/products`, `GET /accounting/summary`, anything — hits `JwtAuthGuard`, finds no `Authorization` header, and 401s. This is the single biggest reason the app can look "logged in" (the auth hook shows a user) while every feature behind it is broken.

**Fix:** Give NestJS a way to read the Better Auth session from the incoming cookie and populate `request.user` from it. The cleanest approach is a custom guard that calls Better Auth's own `auth.api.getSession()` against the incoming request headers (which includes cookies), rather than trying to make Passport understand cookies.

```ts
// apps/api/src/auth/guards/better-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../better-auth";

@Injectable()
export class BetterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    // Shape it to match what RolesGuard / @CurrentUser already expect
    request.user = {
      id: session.user.id,
      name: session.user.name,
      mobileNumber: (session.user as any).mobileNumber,
      role: (session.user as any).role,
      isActive: true,
    };

    return true;
  }
}
```

Then swap it in everywhere `JwtAuthGuard` is currently used:

```ts
// before
@UseGuards(JwtAuthGuard, RolesGuard)

// after
@UseGuards(BetterAuthGuard, RolesGuard)
```

This is a mechanical find-and-replace across the 17 controller files listed above, plus `auth.controller.ts` itself. **Do this as one atomic change** — if you switch some controllers and not others, you'll have a confusing mix where some routes work post-login and others silently don't, which is a worse debugging state than the current "nothing works."

`RolesGuard` and `@CurrentUser()` should keep working unchanged as long as `request.user.role` is populated with the same shape they already expect — verify `apps/api/src/auth/guards/roles.guard.ts` and `apps/api/src/auth/decorators/current-user.decorator.ts` read from `request.user` (standard Nest pattern; almost certainly the case, but confirm before deleting the old guard).

**Do not delete `JwtAuthGuard`/`JwtStrategy`/`SupabaseStrategy` yet** — per your own `betterauth_progress.md` Phase 4 exit criteria, the old path should stay dormant until the new one is verified end to end in a real browser, not removed the moment it's replaced.

**Related files:** `apps/api/src/auth/guards/roles.guard.ts`, `apps/api/src/auth/decorators/current-user.decorator.ts`, `apps/web/src/hooks/use-auth.tsx` (the `getAccessToken` stub can stay as-is once this fix lands — it's genuinely not needed with a cookie-reading guard).

---

### Issue 3 — Google OAuth signups will fail at the database layer

**Description:** Even once Issues 1, 2, 4, and 5 are fixed, a brand-new user signing in with Google will get a server error creating their account.

**Files affected:**
- `packages/db/prisma/schema.prisma` line 428: `mobileNumber String @unique @map("mobile_number")` (not nullable)
- `packages/db/prisma/migrations/20260802120000_phase7_post_deployment_refinement/migration.sql` lines 77–78:
  ```sql
  ALTER TABLE "public"."users"
    ADD CONSTRAINT "users_mobile_number_local_check" CHECK ("mobile_number" ~ '^03[0-9]{9}$');
  ```
- `apps/api/src/auth/better-auth.ts` lines 96–107 — `mobileNumber` is declared as an optional additional field with no default value:
  ```ts
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "business_user" },
      mobileNumber: { type: "string", required: false },
    },
  },
  ```

**Root cause:** The `users` table requires `mobile_number` to be present, unique, and match a Pakistani mobile format (`03XXXXXXXXX`). Better Auth's Google OAuth flow only ever collects `name`, `email`, and a profile image from Google — it has no way to know the user's Pakistani mobile number, and nothing in the current config supplies a default or a fallback. When Better Auth's Prisma adapter tries to `INSERT` the new user row after a successful Google handshake, Postgres will reject it with a `NOT NULL` violation (or, if a blank-string fallback existed anywhere, a unique-constraint violation on the second Google user). This is a database-level failure, not a frontend or OAuth-config failure — it will happen even with perfect Google Cloud Console configuration.

**Fix — the real one:** Google sign-in for a Pakistani mobile-first business needs its own post-signup step to collect a mobile number, because Google will never supply it. Two solid options:

**Option A (recommended): make `mobileNumber` nullable, collect it after OAuth.**
```prisma
// schema.prisma
mobileNumber String? @unique @map("mobile_number")
```
```sql
-- new migration
ALTER TABLE "public"."users" ALTER COLUMN "mobile_number" DROP NOT NULL;
ALTER TABLE "public"."users"
  DROP CONSTRAINT "users_mobile_number_local_check",
  ADD CONSTRAINT "users_mobile_number_local_check"
    CHECK (mobile_number IS NULL OR mobile_number ~ '^03[0-9]{9}$');
```
Then, on the frontend, reuse the existing (currently orphaned — see Issue 10) `authenticated_unregistered` status: after a Google sign-in, check whether `session.user.mobileNumber` is null, and if so route the user into a short "add your mobile number" step before letting them place orders (you already have `apps/web/src/app/onboarding/page.tsx` scaffolded for exactly this — it just needs `checkSession()` to actually set the status it expects).

**Option B: block Google sign-up entirely until this is resolved**, by leaving the schema as-is and catching the resulting Prisma error in a `databaseHooks.user.create.before` hook to return a clean error instead of a raw 500:
```ts
databaseHooks: {
  user: {
    create: {
      before: async (user) => {
        if (!(user as any).mobileNumber) {
          throw new Error("A mobile number is required to complete signup.");
        }
      },
    },
  },
},
```
This doesn't fix Google sign-in, it just turns a 500 into a clean, explainable error — useful as a stop-gap if you want to ship Option A later but need Google sign-in to fail *gracefully* right now.

**Recommendation:** Option A. Given the business is B2B/wholesale and mobile number matters for delivery/order coordination, collecting it as a required *second step* rather than blocking Google sign-in entirely gives a better signup conversion without weakening the data quality you clearly care about (the CHECK constraint itself shows this was a deliberate decision).

---

### Issue 4 — Google OAuth is being configured in the wrong dashboard

**Description:** From the conversation history, Google OAuth was being configured through **Supabase's** Authentication → Providers → Google screen. That is no longer where this system reads Google OAuth configuration from.

**Files affected:** `apps/api/src/auth/better-auth.ts` lines 126–132

```ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
},
```

**Root cause:** Since the Better Auth migration, Google sign-in is handled entirely by Better Auth's own `socialProviders.google` config, reading `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` from the **API's** environment (Render), not from Supabase at all. `enabled` is computed as `Boolean(...)` — if either env var is unset, Google sign-in is silently disabled server-side rather than erroring loudly, which likely explains part of the observed failure (though the "Google authentication requires a configured Supabase project" message you saw is a *frontend* error, from the now-dead Supabase client code path — see Issue 10's related note on stale `.env.local.example` values still referencing `NEXT_PUBLIC_SUPABASE_URL`).

**Fix — steps to do manually, in order:**
1. In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials, create (or reuse) an OAuth 2.0 Client ID of type **Web application**.
2. Under **Authorized redirect URIs**, add:
   ```
   https://raza-stationers-api-staging.onrender.com/auth/api/callback/google
   http://localhost:4000/auth/api/callback/google
   ```
   This path is derived directly from the server config: `basePath: "/auth/api"` (`better-auth.ts` line 78) combined with Better Auth's standard `/callback/:provider` route, and `baseURL` on line 77 which defaults to the staging Render URL. **Do not** point this at anything on `raza-stationers-web.vercel.app` — the OAuth handshake happens against the API, not the web app.
3. Copy the generated **Client ID** and **Client Secret** into Render's environment variables for the API service as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (see the Configuration Checklist below for exactly where).
4. You can now ignore Supabase's Google provider screen entirely for this flow — it is not read by any code path in this branch.
5. Redeploy the API service so it picks up the new env vars (Render env var changes require a redeploy or restart to take effect).

---

### Issue 5 — Deployment configs and env examples are missing every Better Auth variable

**Description:** The infrastructure-as-code file and the example env files that document "what needs to be set" only list the old JWT/Supabase-era variables.

**Files affected:**
- `render.yaml` (entire `envVars` list, lines 7–19) — has `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CORS_ORIGINS`. Missing: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_API_KEY`, `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`SMTP_PORT`/`SMTP_FROM`, `DIRECT_URL`.
- `.env.example` (root) — same gap.
- `apps/web/.env.local.example`, `apps/admin/.env.local.example` — both still list `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which **no code in `apps/web/src` or `apps/admin/src` actually reads anymore** (verified — no `createClient`/`@supabase/supabase-js`/`NEXT_PUBLIC_SUPABASE_URL` usage in either app's `src` tree on this branch). Meanwhile `NEXT_PUBLIC_WEB_URL`, which the API *does* read (`better-auth.ts` line 113, for password-reset email links), isn't documented anywhere.

**Root cause:** These files were never updated when the Better Auth migration landed. If Render's actual environment variables were set up by following `render.yaml`/`.env.example` (a very reasonable thing to do), then `BETTER_AUTH_SECRET` and `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are genuinely not set in production — which is consistent with everything reported. This is worth checking first, since it's the cheapest possible fix if true.

**A related, more serious consequence:** look at `better-auth.ts` lines 71–74:
```ts
const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "raza-stationers-default-secret-key-123456";
```
If `BETTER_AUTH_SECRET` is genuinely unset (likely, per the above), the app falls back to `JWT_SECRET` — and if *that's* somehow also unset, it falls back to a **hardcoded, publicly-visible-in-this-repo string**. Sessions signed with a guessable, world-readable secret can be forged. This should be treated as a security issue, not just a config gap — see Fix below.

**Fix:**

1. Update `render.yaml` to declare (not necessarily set values for — `sync: false` still lets you set them in the dashboard) every variable the API actually needs:
```yaml
services:
  - type: web
    name: raza-stationers-api
    runtime: docker
    dockerfilePath: ./Dockerfile
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_SSL_MODE
        value: verify-full
      - key: DATABASE_URL
        sync: false
      - key: DIRECT_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: BETTER_AUTH_SECRET
        sync: false
      - key: BETTER_AUTH_URL
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: BETTER_AUTH_API_KEY
        sync: false
      - key: NEXT_PUBLIC_WEB_URL
        sync: false
      - key: SMTP_HOST
        sync: false
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: SMTP_PORT
        sync: false
      - key: SMTP_FROM
        sync: false
      - key: CORS_ORIGINS
        sync: false
```

2. Generate a real `BETTER_AUTH_SECRET` and set it explicitly in Render's dashboard — don't rely on the `JWT_SECRET` fallback:
```bash
openssl rand -base64 32
```

3. Update `.env.example` to match (add the same list, empty values).

4. Update `apps/web/.env.local.example` and `apps/admin/.env.local.example` — remove the unused `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` lines, keep `NEXT_PUBLIC_API_URL`:
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

5. (Optional but recommended, low effort) — once `BETTER_AUTH_SECRET` is confirmed set everywhere, delete the hardcoded fallback string in `better-auth.ts` so a misconfiguration fails loudly instead of silently running with a public secret:
```ts
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;
if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET (or JWT_SECRET) must be set.");
}
```

---

### Issue 6 — Admin 2FA enrollment and disabling are hardcoded to fail

**Description:** Enabling or disabling TOTP for an admin account always fails.

**Files affected:** `apps/admin/src/hooks/use-admin-auth.tsx` lines 119–129, 142–151

```ts
const enrollMfa = React.useCallback(async () => {
  const res = await authClient.twoFactor.enable({ password: "" })   // ← hardcoded empty string
  ...
const unenrollMfa = React.useCallback(async () => {
  const res = await authClient.twoFactor.disable({ password: "" })  // ← same
```

**Root cause:** Better Auth's `twoFactor.enable`/`.disable` endpoints require the account's real current password as a re-authentication step (standard security practice for enabling/disabling a second factor). This code passes a literal empty string every time, which will be rejected by the server as an incorrect password on every call, regardless of what the account's actual password is.

**Fix:** These functions need the user's password as an input, not a hardcoded value. Update the function signatures and whatever component calls them to actually prompt for and pass the current password:

```ts
const enrollMfa = React.useCallback(async (password: string) => {
  const res = await authClient.twoFactor.enable({ password })
  if (res.error) {
    throw new Error(res.error.message || "Failed to enable 2FA")
  }
  return {
    factorId: "totp",
    qrCode: (res.data as any)?.totpURI || "",
    secret: (res.data as any)?.totpURI || "",
  }
}, [authClient])

const unenrollMfa = React.useCallback(async (password: string) => {
  const res = await authClient.twoFactor.disable({ password })
  if (res.error) {
    throw new Error(res.error.message || "Failed to disable 2FA")
  }
  await refreshSession()
}, [authClient, refreshSession])
```

And update the `AdminAuthContextValue` interface (lines 18, 20 in the same file) and every call site accordingly — find them with:
```bash
grep -rn "enrollMfa\|unenrollMfa" apps/admin/src
```

---

### Issue 7 — Inconsistent `better-auth` version pinning across workspaces

**Description:** Different `package.json` files in the monorepo declare different semver ranges for `better-auth`.

**Files affected:**
- `apps/api/package.json` line 25: `"better-auth": "^1.1.0"`
- `packages/api/package.json` line 14: `"better-auth": "^1.1.0"`
- `apps/web/package.json` line 22: `"better-auth": "^1.6.25"`
- `apps/admin/package.json` line 18: `"better-auth": "^1.6.25"`

**Verified actual state (not just theoretical):** checking the committed `package-lock.json`, npm's workspace hoisting resolved **everything to a single version, `1.6.25`**, because `^1.1.0` is satisfied by any `1.x.x` release including `1.6.25`. **This is not currently causing a runtime bug** — I want to be precise about that so this isn't mistaken for a bigger problem than it is. But it's fragile: the moment `better-auth` releases a version incompatible with what `^1.1.0` was written against (or if someone runs `npm install` in a way that doesn't hoist identically, e.g. with strict workspace isolation), `apps/api` and `packages/api` could silently resolve to a different, much older minor version than the client libraries in `apps/web`/`apps/admin` expect — producing exactly the kind of "client expects a response shape the server doesn't send" bugs that are hard to diagnose.

**Fix:** align all four to the same explicit range:
```bash
npm install better-auth@^1.6.25 --workspace=@raza-stationers/api-server
npm install better-auth@^1.6.25 --workspace=@raza-stationers/api
```
(adjust workspace names to match your actual `name` fields in `apps/api/package.json` and `packages/api/package.json`), then commit the regenerated lockfile.

---

### Issue 8 — `dash` plugin partially configured; client/server plugin mismatch

**Description:** The server registers Better Auth's `dash()` infra plugin with only an API key; the client loads `sentinelClient()`, but the server never registers the matching `sentinel()` plugin.

**Files affected:**
- `apps/api/src/auth/better-auth.ts` lines 137–139:
  ```ts
  dash({
    apiKey: process.env.BETTER_AUTH_API_KEY,
  }),
  ```
  Per `@better-auth/infra`'s own documented usage, `dash()` normally also takes `apiUrl` and `kvUrl` — both are omitted here.
- `packages/api/src/index.ts` lines 1–27:
  ```ts
  import { twoFactorClient } from "better-auth/client/plugins";
  import { sentinelClient } from "@better-auth/infra/client";
  ...
  plugins: [twoFactorClient(), sentinelClient()],
  ```
  The client loads `sentinelClient()` (bot/abuse-protection fingerprinting), but the server-side config only registers `dash()`, never `sentinel()`.

**Root cause:** This looks like partial adoption of Better Auth's managed "Infrastructure" add-on (analytics/audit logging via `dash`, abuse protection via `sentinel`) — the client and server configs were edited independently and drifted apart. I could not verify from the repo alone whether `BETTER_AUTH_API_KEY` is actually set in Render (see Issue 5) or whether you have an active `@better-auth/infra` subscription at all — **this is an assumption to verify with you**, since if you never signed up for that managed service, the fix is simply to remove these plugins rather than complete their configuration.

**Confirmed from Better Auth's own docs:** when `sentinel()`'s API key is missing, it logs `"[Sentinel] Missing BETTER_AUTH_API_KEY. Security checks may fall back to allow mode."` and continues rather than hard-failing — so this is unlikely to be blocking login outright, but it is unfinished configuration that will generate console noise and, if you do intend to use it, isn't providing the protection you'd expect.

**Fix — pick one:**

**A. If you're using `@better-auth/infra` intentionally:** finish the config on both sides.
```ts
// apps/api/src/auth/better-auth.ts
import { dash, sentinel } from "@better-auth/infra";
...
plugins: [
  twoFactor({ issuer: "Raza Stationers" }),
  dash({
    apiUrl: process.env.BETTER_AUTH_API_URL,
    kvUrl: process.env.BETTER_AUTH_KV_URL,
    apiKey: process.env.BETTER_AUTH_API_KEY,
  }),
  sentinel({
    apiUrl: process.env.BETTER_AUTH_API_URL,
    kvUrl: process.env.BETTER_AUTH_KV_URL,
    apiKey: process.env.BETTER_AUTH_API_KEY,
  }),
],
```
and add `BETTER_AUTH_API_URL`/`BETTER_AUTH_KV_URL` to the env checklist in Issue 5.

**B. If you're not actively using it:** remove `dash()` from the server and `sentinelClient()` from the client entirely, and drop the `@better-auth/infra` dependency, to eliminate the unused surface area.

---

### Issue 9 — Legacy mobile/password JWT endpoints are dead but still live

**Description:** `POST /auth/login`, `POST /auth/register`, and `POST /auth/totp/*` still exist and are still reachable, but nothing in the current frontend calls them.

**Files affected:** `apps/api/src/auth/auth.controller.ts` lines 20–24, 73–78, 80–106

**Root cause:** These predate Better Auth (mobile-number + bcrypt login) and were kept during the migration "to be safe," per your own migration plan's rollback guidance. Verified via `grep -rn "api.login(|api.register(" apps/web/src apps/admin/src` — zero matches. They're not being called by the current frontend. The `totp/*` endpoints already throw `400 Bad Request` unconditionally (`auth.controller.ts` lines 84, 91, 98, 105) — they're stubs, not functioning MFA.

**This is not a bug causing your reported symptoms** — it's flagged here because dead authentication endpoints are attack surface (an old bcrypt-based login path staying reachable in production is worth knowing about even if unused) and because their presence can confuse debugging (e.g., testing `/auth/login` manually and getting a real, different response than what the frontend actually uses).

**Fix:** Per your own `betterauth_progress.md` rules, don't delete these until Phase 4/8 exit criteria are fully met with evidence. Once Issues 1–5 are fixed and verified in a real browser, remove `register`, `login`, and the four `totp/*` handlers from `auth.controller.ts`, along with their corresponding methods in `auth.service.ts` and the `login`/`register` methods in `packages/api/src/index.ts`'s `RazaAPIClient` (lines 46–52).

---

### Issue 10 — Orphaned onboarding redirect (web)

**Description:** The web app has a whole `authenticated_unregistered` account status and a corresponding `/onboarding` page and redirect, but nothing ever sets that status.

**Files affected:**
- `apps/web/src/hooks/use-auth.tsx` — `AccountStatus` type includes `"authenticated_unregistered"` (line 12), but `checkSession()` (lines 68–94) only ever sets `"approved"` or `"guest"`.
- `apps/web/src/app/signin/page.tsx` line 34–35 — dead branch, never reached:
  ```ts
  } else if (accountStatus === "authenticated_unregistered") {
    router.replace(`/onboarding?returnTo=${encodeURIComponent(returnTo)}`)
  ```
- `apps/web/src/app/onboarding/page.tsx` line 166 — also gated on a status that's never set.
- `apps/web/src/app/auth/callback/route.ts` — entire file is a dead stub from the old Supabase flow that unconditionally redirects to `/signin?error=auth_provider_not_configured`. It is not in Better Auth's actual redirect path today (Better Auth's Google flow redirects straight from the API to the `callbackURL` you pass, e.g. `/catalogue` — not through this route), **but if Google Cloud Console's redirect URI is ever pointed at the web app instead of the API** (an easy mistake given the Supabase-era muscle memory), the browser will land here and immediately show this dead-end error. Worth double-checking your Google Console redirect URIs don't reference `raza-stationers-web.vercel.app` anywhere.

**Fix:** This becomes directly useful once you implement Issue 3's Option A (mobile-number collection after Google sign-up). Update `checkSession()`:
```ts
const checkSession = React.useCallback(async () => {
  try {
    setAccountStatus("loading")
    const sessionRes = await authClient.getSession()
    if (sessionRes?.data?.user) {
      const u = sessionRes.data.user
      const mappedUser: User = { /* ...unchanged... */ }
      setUser(mappedUser)
      setAccountStatus(mappedUser.mobileNumber ? "approved" : "authenticated_unregistered")
      setAuthError(null)
    } else {
      setUser(null)
      setAccountStatus("guest")
    }
  } catch {
    setUser(null)
    setAccountStatus("guest")
  }
}, [authClient])
```
If you decide not to implement Issue 3 Option A, remove the dead `authenticated_unregistered` branch, the `/onboarding` route, and `/auth/callback/route.ts` instead, so there's no confusing unreachable code left for the next person debugging this.

---

### Issue 11 — Catalogue "Unable to connect to server" (likely not an auth bug)

**Description:** The storefront catalogue fails to load with a generic connectivity error.

**Files checked:** `apps/api/src/catalogue/catalogue.controller.ts` lines 15–18 — confirmed `GET /products` has **no guard at all**:
```ts
@Get("products")
@ApiOperation({ summary: "List active products with pagination & search" })
getProducts(@Query() query: PaginationDto) {
  return this.catalogueService.findProducts(query);
}
```
This route is public. It cannot be failing because of anything in Issues 1–10 — those only affect *guarded* routes. If the catalogue fails to load, the API process itself is either not running, not reachable, or failing before it gets to routing (most likely a database connection failure during a request, or the Render service being asleep/cold).

**What I could verify in the repo:** `packages/db/src/postgres.ts` (`getPostgresConnection`) requires either a `PGSSLROOTCERT` env var pointing at a real file, or a `supabase-ca.crt` file discoverable by walking up from `process.cwd()` — and will `throw` if neither is found once `DATABASE_URL`/`DIRECT_URL` point at a non-local host. The `Dockerfile` does `COPY --from=builder ... /app/supabase-ca.crt ./supabase-ca.crt` into the runtime image, so this should be present in the deployed container — but it's worth confirming that file actually exists at repo root and isn't excluded by `.dockerignore`.

**Given this project's history** (multiple earlier `DatabaseNotReachable`/Supabase-pooler-paused incidents seen in your prior sessions), the most likely causes, roughly in order of likelihood, are:
1. Render's free/starter-tier service was asleep and the request timed out before cold-start completed (common on Render's free tier).
2. `DATABASE_URL`/`DIRECT_URL` genuinely unset or stale on Render (same root cause pattern as Issue 5).
3. Supabase's connection pooler was paused/unreachable at the time of testing.
4. `supabase-ca.crt` missing from the deployed image (check `.dockerignore` doesn't exclude it).

**Fix — this needs live verification, not a code change (unless one of the above is confirmed):**
```bash
# From Render's shell/logs, or locally against the same DATABASE_URL:
curl -s https://raza-stationers-api-staging.onrender.com/  # health check — should return 200 per healthCheckPath in render.yaml
curl -s https://raza-stationers-api-staging.onrender.com/products
```
If the health check (`/`) responds but `/products` doesn't, it's a database issue specifically. If neither responds, the service itself is down/asleep — check Render's dashboard logs directly for the actual error, which will state whether it's a cold start, a crash, or a DB timeout.

---

### Issue 12 — CORS accepts any `*.vercel.app` origin

**Description:** The CORS origin check is broader than it needs to be.

**Files affected:** `apps/api/src/main.ts` lines 36–43:
```ts
app.enableCors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);
    if (corsOrigins.includes(requestOrigin)) return callback(null, true);
    if (requestOrigin.endsWith(".vercel.app") || requestOrigin.includes("localhost") || requestOrigin.includes("raza-stationers"))
      return callback(null, true);
    callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
  },
  credentials: true,
});
```

**Root cause:** The `.endsWith(".vercel.app")` clause allows *any* Vercel-hosted app — not just yours — to make credentialed requests to your API, since Vercel preview URLs are attacker-controllable to some extent (anyone can deploy something to `*.vercel.app`). Combined with `credentials: true`, this is broader than intended — it's not currently the cause of your reported bugs, but it's worth tightening before production.

**Fix:**
```ts
const corsOrigins = configuredOrigins?.length
  ? configuredOrigins
  : production
    ? ["https://raza-stationers-web.vercel.app", "https://raza-stationers-admin-seven.vercel.app"]
    : ["http://localhost:3000", "http://localhost:3001"];

app.enableCors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);
    if (corsOrigins.includes(requestOrigin)) return callback(null, true);
    // Allow your own Vercel preview deployments specifically, not the whole *.vercel.app namespace
    if (/^https:\/\/raza-stationers-(web|admin)-[a-z0-9-]+\.vercel\.app$/.test(requestOrigin)) {
      return callback(null, true);
    }
    if (requestOrigin.includes("localhost")) return callback(null, true);
    callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
  },
  credentials: true,
});
```
Adjust the regex to match your actual Vercel preview URL pattern (check one real preview deployment URL to confirm the format).

---

### Issue 13 — Progress tracker marked phases "Complete" without evidence

**Description:** `docs/betterAuth/betterauth_progress.md` — the phase status board (Section 1) shows Phases 0 through 8 as **Complete** with a sign-off date of `2026-08-04`, but every single task checkbox in Section 3 for those same phases is still unchecked (`- [ ]`).

**Files affected:** `docs/betterAuth/betterauth_progress.md`, Section 1 (lines 12–23) vs. Section 3 (lines 52–125)

**Why this matters here:** This isn't a runtime bug, but it's the direct process explanation for why Issues 1, 2, 3, and 6 shipped. Phase 8 ("Full staging verification — browser-driven") is marked Complete with the evidence listed as *"100% monorepo build, test, and typecheck pass"* — which is exactly the failure mode your own rules in Section 6 of that same document warn about: a build/typecheck pass proves the code compiles, not that a real user can log in, load the admin dashboard, or complete a Google sign-in. None of the four critical issues in this report (middleware lockout, guard mismatch, mobile-number constraint, MFA password bug) would be caught by `npm run build` or `tsc` — they're all runtime/data-flow issues that only show up when a real session actually flows through the system.

**Fix:** No code change — this is a discipline fix. Before marking Phase 8 (or any phase) Complete again:
1. Un-check every box in Section 3 for Phases 0–8 in `betterauth_progress.md`.
2. Re-run this document's Testing Instructions (below) against staging, in an actual browser, and only re-check boxes with real evidence attached (screenshot or console output), per the rule already written in that file's own Section 6.
3. Only then move Phase 9 (production cutover) forward.

---

## Configuration Checklist

Work through this in order — items earlier in the list unblock verification of later ones.

### Render (API service — `raza-stationers-api-staging`)
- [ ] `DATABASE_URL` — set, points at a live, non-paused Supabase instance
- [ ] `DIRECT_URL` — set (used for Prisma direct/non-pooled operations)
- [ ] `DATABASE_SSL_MODE=verify-full`
- [ ] `JWT_SECRET` — set (still used by the legacy strategies until Issue 9's cleanup)
- [ ] `BETTER_AUTH_SECRET` — set explicitly, **do not rely on the `JWT_SECRET` fallback** (Issue 5)
- [ ] `BETTER_AUTH_URL` — set to `https://raza-stationers-api-staging.onrender.com` (matches the code's own default, but set it explicitly rather than relying on the fallback)
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — set, from the Web Application OAuth client created in Issue 4
- [ ] `BETTER_AUTH_API_KEY` — set if using `@better-auth/infra`, otherwise remove the `dash()`/`sentinel()` plugins (Issue 8)
- [ ] `NEXT_PUBLIC_WEB_URL` — set to `https://raza-stationers-web.vercel.app` (used for password-reset email links)
- [ ] `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `SMTP_PORT` / `SMTP_FROM` — set if password-reset emails need to actually deliver (otherwise reset links only log to console — see `better-auth.ts` line 13)
- [ ] `CORS_ORIGINS` — confirm it includes both Vercel app URLs exactly
- [ ] `supabase-ca.crt` present in the deployed Docker image (Issue 11)

### Vercel (Web — `raza-stationers-web`)
- [ ] `NEXT_PUBLIC_API_URL` — set to `https://raza-stationers-api-staging.onrender.com`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **safe to remove**, unused by current code (Issue 5)

### Vercel (Admin — `raza-stationers-admin-seven`)
- [ ] `NEXT_PUBLIC_API_URL` — set to `https://raza-stationers-api-staging.onrender.com`
- [ ] Same Supabase var removal as web

### Google Cloud Console
- [ ] OAuth consent screen configured (app name, support email)
- [ ] OAuth 2.0 Web application client created
- [ ] Authorized redirect URI: `https://raza-stationers-api-staging.onrender.com/auth/api/callback/google`
- [ ] Authorized redirect URI (local dev): `http://localhost:4000/auth/api/callback/google`
- [ ] **No redirect URIs pointing at `raza-stationers-web.vercel.app` or any Supabase domain**

### Database
- [ ] `session`, `account`, `verification`, `two_factor` tables exist on the target database (created in migration `20260726162130_initial_schema_v0_1` — confirm this migration has actually been *applied* to whichever database Render is pointed at, not just present in the repo — `prisma migrate status` will tell you)
- [ ] `users_mobile_number_local_check` constraint confirmed present (or already relaxed, if you've implemented Issue 3's fix)
- [ ] `npx prisma migrate status` shows no pending migrations against the production/staging database

### Supabase Dashboard
- [ ] Google provider under Authentication → Providers can be **left disabled** — it's not used by this auth flow
- [ ] Confirm the connection pooler / project isn't paused (Issue 11)

---

## Testing Instructions

Do these in order. Each step assumes the previous one passed — if one fails, fix it before moving to the next, since later steps depend on earlier ones working.

### 1. API health & connectivity (validates Issue 5, 11)
```bash
curl -i https://raza-stationers-api-staging.onrender.com/
curl -i https://raza-stationers-api-staging.onrender.com/products
```
Both should return `200`. If the first fails, the service itself is down — check Render logs. If only the second fails, it's a database issue.

### 2. Better Auth is mounted and reachable (validates Issue 5)
```bash
curl -i https://raza-stationers-api-staging.onrender.com/auth/api/get-session
```
Should return `200` with `{"data":null}` or similar (not a 404 — a 404 here means the Better Auth handler isn't mounted or `basePath` doesn't match what you're calling).

### 3. Email/password signup + login, in a real browser (validates Issue 2, 3's negative case, 5)
1. Open `https://raza-stationers-web.vercel.app/register` in an actual browser (not curl).
2. Register with a valid `03XXXXXXXXX` mobile number.
3. Open DevTools → Application → Cookies → confirm a cookie is set under the **API's** domain after signup completes (it won't appear under the web app's own domain — that's expected, see Issue 1's explanation).
4. Navigate to `/orders` or another page that calls a `JwtAuthGuard`-protected endpoint. **Before fixing Issue 2, this will fail with a 401 in the Network tab even though you're "logged in."** After fixing Issue 2, it should succeed.

### 4. Google OAuth (validates Issues 3, 4)
1. Complete the Google Cloud Console setup in the Configuration Checklist first.
2. From `/signin`, click "Sign in with Google," complete the Google consent screen.
3. **Before implementing Issue 3's fix**, expect this to fail with a server error during account creation — check the Network tab for the response from `/auth/api/callback/google` and confirm the error mentions `mobile_number` or a constraint violation, matching Issue 3's diagnosis.
4. After implementing Issue 3's fix, confirm the user lands on `/onboarding` (or wherever you route mobile-number collection) rather than erroring.

### 5. Admin login (validates Issue 1, 2, 6)
1. Open `https://raza-stationers-admin-seven.vercel.app/login` in a real browser.
2. **Before fixing Issue 1**, confirm the bug reproduces exactly as reported: even after a successful login POST (check Network tab for a `200` from `sign-in/email`), navigating to `/dashboard` (or any non-`/login` route) redirects straight back to `/login?reason=auth_unconfigured`.
3. After fixing Issue 1, confirm the redirect stops happening and the dashboard renders.
4. After fixing Issue 2, confirm dashboard data (orders, stats, etc.) actually loads instead of showing empty/error states from 401s.
5. Attempt to enroll TOTP (Settings → Security, or wherever `enrollMfa` is triggered in the UI) — **before fixing Issue 6**, confirm it fails with a password error. After fixing Issue 6 (which requires wiring an actual password prompt into the UI), confirm it succeeds and shows a real QR code.

### 6. Console/network cleanliness
On every screen above, check the browser console and Network tab for:
- No CORS errors
- No 401s on pages you're supposed to be authenticated for
- No requests to any `supabase.co` domain (confirms Issue 5's cleanup is complete)

### 7. Regression check on public routes
Confirm `/catalogue`, `/product/[sku]`, and the homepage still load **without** being logged in — these should never require authentication, and none of the fixes above should have accidentally added a guard to them.

---

## Assumptions Flagged During This Analysis

These could not be verified from the repository alone — verify them directly before treating any related finding as fully confirmed:

1. Whether `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `BETTER_AUTH_API_KEY` are actually set (or actually missing) in Render's live environment — I inferred "likely missing" from `render.yaml`/`.env.example` being stale, but this needs a direct look at Render's dashboard.
2. Whether `apps/admin/src/components/shell/AdminShell.tsx` actually performs a correct client-side auth gate (referenced in Issue 1's fix as the thing you'd be relying on) — I did not have budget to read this file directly in this pass; read it before removing the middleware redirect, to confirm it won't leave the admin app briefly unprotected.
3. Whether the `supabase-ca.crt` file is present at the repository root and not excluded by `.dockerignore` (Issue 11) — I did not check `.dockerignore` contents.
4. Whether you have an active `@better-auth/infra` subscription (Issue 8) — the fix branches depending on this.
5. Google Cloud Console's currently-configured redirect URIs — I could not access this; Issue 4/10 assume they may currently point at the wrong place based on the conversation history you shared, not from direct verification.
