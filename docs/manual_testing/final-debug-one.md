# Raza Stationers — Final Debug Report (One-Shot Fix List)

**Branch analyzed:** `phase-9-betterauth`
**Last commit at analysis time:** `3200a1d fix(monorepo): assign dedicated ports across workspaces...`
**Analyzed by:** Claude (independent code + docs audit)
**Purpose:** This is a single consolidated, evidence-based punch list for an AI coding agent ("antigravity") to work through and fix, top to bottom. Every item below was verified by reading the actual current code on this branch — not assumed from the PRD/BRD/FRD/TRD. Where the docs and code disagree, that disagreement is itself listed as a bug.

**How to use this file:** Fix items in severity order (CRITICAL → HIGH → MEDIUM → LOW). Each item has: what's wrong, exact file/line evidence, why it matters, and a concrete fix direction. After each fix, re-run `npm run typecheck`, `npm run lint`, and the relevant test suite before moving to the next item. Do not mark an item done without a matching code change — several of these were already claimed "Complete" in `docs/manual_testing/auth_debugging_progress.md` while the code shows they are not.

---

## 0. Ground-Truth Contradictions Found Between Docs and Code

Before touching code, be aware the project's own documentation is not reliable right now:

- `docs/manual_testing/auth_debugging_progress.md` marks **13 issues "Complete"** in its status table, but **every single checklist item underneath each issue is still an unchecked `[ ]` box**, and issue #10 (`authenticated_unregistered` onboarding routing) is silently missing from the status table entirely. Independent verification below shows several of the "Complete" items (MFA/AAL2 enforcement in particular) are **not actually implemented in the current code** — the guard/UI code that should enforce them is present but permanently short-circuited. Treat every "Complete" claim in that file as unverified until you personally confirm it against the code cited here.
- `docs/TRD.md` §3/§19 specifies the mobile app as **React Native + Expo**. The actual `apps/mobile` on this branch is a **Vite + React web app with an in-memory Express mock server** — not React Native, not Expo, and not connected to the real backend at all (see §4 below). This is a full architecture mismatch, not a naming issue.

---

## 1. CRITICAL — Security: Admin/Owner MFA (AAL2) enforcement is fully disabled, both server and client

**Impact:** Any user with `role: admin` or `role: owner` can access every admin route and every AAL2-gated API endpoint with just a password — no working two-factor step is ever actually enforced, even though the code has an MFA gate that appears to enforce it.

**Server side — `apps/api/src/auth/guards/better-auth.guard.ts` (lines ~20-28):**
```ts
request.user = {
  ...
  aal: "aal2",       // <-- HARDCODED, not derived from the actual session's 2FA state
  isActive: true,
};
```
Every authenticated request — whether the user has 2FA enabled or not, whether they've completed a TOTP challenge or not — is stamped `aal: "aal2"`. This value is what `RolesGuard` (`apps/api/src/auth/guards/roles.guard.ts:27`) and `apps/api/src/orders/orders.service.ts:257,284` check to gate admin/owner-only actions:
```ts
if (isSensitiveAdminRoute && user.aal !== "aal2") { throw new ForbiddenException(...) }
```
Because `aal` is always `"aal2"`, this check can never fail. The AAL2 gate is dead code that always passes.

**Client side — `apps/admin/src/components/shell/AdminShell.tsx` (lines 38-39, 75-76):**
```ts
const MFA_REQUIRED_ROLES: AdminRole[] = ["admin", "owner"]   // defined, never referenced again anywhere in the file
...
const needsMfaEnrollment = false   // hardcoded
const needsMfaStepUp = false       // hardcoded
```
`TotpEnrollView` and `TotpChallengeView` are fully built and imported, but the conditions that would ever render them (`needsMfaEnrollment`, `needsMfaStepUp`) are hardcoded constants, not derived from `currentLevel`/`nextLevel`/`role` (which the hook already computes and exposes). This makes both components unreachable dead code — an admin/owner logs in with a password and lands straight on `/dashboard`.

**Fix direction:**
1. In `better-auth.guard.ts`, derive `aal` from the real session. Better Auth's `twoFactor` plugin session shape exposes whether the session was elevated (check `session.session` for a two-factor/verified flag, or require a fresh `auth.api` call that reflects TOTP verification state) — do not default to `"aal2"`. If the user has `twoFactorEnabled` but the current session was not verified via TOTP this login, `aal` must be `"aal1"`.
2. In `AdminShell.tsx`, compute `needsMfaEnrollment = MFA_REQUIRED_ROLES.includes(role) && !user.twoFactorEnabled` and `needsMfaStepUp = MFA_REQUIRED_ROLES.includes(role) && user.twoFactorEnabled && currentLevel !== "aal2"`, replacing the hardcoded `false` values. Use the already-fetched session's `twoFactorEnabled` flag (already read in `use-admin-auth.tsx:57`) instead of leaving it unused for this purpose.
3. Add a Supertest negative test: log in as an admin/owner with 2FA enabled but do not complete the TOTP step, then attempt an AAL2-gated action and assert `403`. This exact scenario is what silently passes today.

---

## 2. CRITICAL — Two parallel, incompatible authentication systems coexist in the API

**Impact:** Any client that logs in via the legacy mobile-number/password endpoint receives a token that **every protected route will reject.**

`apps/api/src/auth/auth.controller.ts` exposes two independent login paths:
- `POST /auth/api/sign-in/*` — the real Better Auth flow (session cookie based), handled by `toNodeHandler(auth)` at line 17-19.
- `POST /auth/login` (line 74-79) — a legacy, fully-functional custom endpoint that calls `AuthService.login()` (`apps/api/src/auth/auth.service.ts` lines ~230-252), which checks `bcrypt.compare` against `user.passwordHash` and returns a **custom-signed JWT** via `this.jwtService.sign(payload)` (line ~271, `generateToken`).

Every protected controller (17 of them, per the auth debugging progress notes) is guarded by `BetterAuthGuard`, whose entire implementation is:
```ts
const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
if (!session || !session.user) throw new UnauthorizedException(...);
```
This **only** recognizes a genuine Better Auth session (cookie, or a Better Auth bearer-plugin token — no such plugin is registered in `apps/api/src/auth/better-auth.ts`). It does **not** call `AuthService.verifyAuthToken()`, which is the only method in the codebase that would actually accept the legacy custom JWT. That method (lines 15-65 of `auth.service.ts`) is now **orphaned dead code** — nothing calls it in the request path anymore except itself/`getBootstrapStatus`/`registerSupabase`/`linkSupabase`, none of which sit behind `BetterAuthGuard`.

Net effect: `RazaAPIClient.login(mobileNumber, password)` and `RazaAPIClient.register(...)` in `packages/api/src/index.ts` (lines 46-52) call `/auth/login` / `/auth/register`, get back a JWT, and if any caller does `apiClient.setAuthToken(token)` and then calls any guarded endpoint (`/orders`, `/users/me`, `/clients`, etc.), it will get a `401 Invalid or expired session` every time, because `BetterAuthGuard` never looks at that token.

**Confirm before fixing:** grep the whole monorepo for callers of `api.login(` / `apiClient.login(` / `RazaAPIClient` `.login(` / `.register(` (not `authClient.signIn`) to find every place this broken path is still reachable — the web app currently does **not** call it (it uses `authClient.signIn.email` directly, see §5), so this is mainly a latent trap for any future/mobile client, but it must not ship as-is.

**Fix direction (pick one, don't leave both):**
- **Preferred:** Delete the legacy `/auth/login`, `/auth/register`, `/auth/change-password`, and `generateToken`/JWT code path entirely. Standardize every client (web, admin, and — once rebuilt — mobile) on Better Auth's own endpoints via `createBetterAuthClient()`. Remove `RazaAPIClient.login`/`register`/`changePassword` or rewrite them as thin wrappers around the Better Auth client instead of hitting `/auth/login`.
- **If the legacy JWT path must stay** (e.g. for a non-cookie-capable client like a true native mobile app), wire `BetterAuthGuard` to fall back to `AuthService.verifyAuthToken()` when there is no Better Auth session but there is a `Bearer` header, so both token types are actually accepted. Either way, the two systems must issue tokens that the guard actually understands.

---

## 3. CRITICAL — The "mobile app" is a disconnected mock prototype, not integrated with the real backend, database, or auth at all

**Impact:** Anything a customer does in `apps/mobile` today — sign in, register, place an order — either does nothing real or, worse, appears to succeed while writing nothing to the actual Postgres database. This directly contradicts the PRD's core goal (§1: "no record of stock levels... no automated discount handling") and the BRD/TRD's single-source-of-truth architecture (TRD §4: "a single source of truth is required").

Evidence:
- `apps/mobile/package.json` — this is a **Vite + React + Express** project (`vite`, `express`, `@vitejs/plugin-react`), not React Native/Expo as specified in `docs/TRD.md` §3 and §19.
- `apps/mobile/server.ts` (lines 1-60+) runs its **own local Express server** with hardcoded `MOCK_ORDERS`/`MOCK_USERS` in memory, and a login endpoint (`/api/auth/login`) that fakes a tier based on substring-matching the phone number (`phone?.includes('9876')`) — there is no password check, no database call, nothing that touches `packages/db` or the NestJS API at all.
- **Global shared mutable state bug:** `server.ts` declares `let currentTier: AccountTier = 'guest';` as a single module-level variable shared by **every concurrent request the Express process handles.** If two different customers use this server at the same time, one customer's login changes `currentTier` for everyone — there is no per-session or per-user isolation whatsoever. This is a correctness/security bug on top of being disconnected from the real system.
- `apps/mobile/src/lib/api.ts` (`fetchProductsFromApi`, `createOrderApi`) does attempt to call a real backend first (`fetch(...)` with `credentials: 'include'`), but:
  - `getApiBaseUrl()` (lines 5-11) reads `process.env.EXPO_PUBLIC_API_URL` / `process.env.NEXT_PUBLIC_API_URL`. This is a **Vite** app — `process.env.*` is not automatically available in Vite's client bundle (Vite exposes only `import.meta.env.VITE_*` by default, or requires an explicit `define` in `vite.config.ts`, which does not configure this). Confirm at runtime, but as written this almost certainly always resolves to `''`, silently falling back to `/api/products` and `/api/orders` — i.e., this Express mock server, not the real API.
  - If the fetch fails or is unreachable, `createOrderApi` **fabricates a fake order object with a random ID** (`RS-${Math.floor(20500 + Math.random() * 500)}`) and returns it as if it succeeded (lines 73-88) — the UI has no way to distinguish a real persisted order from this fabricated one. A customer could believe they placed a real order that Raza Stationers will never see.

**Fix direction:**
1. Decide, with the project owner, whether `apps/mobile` is staying as a web-based "mobile-styled" PWA (in which case rename all TRD/BRD/FRD references to stop calling it React Native/Expo and remove the false claim), or whether it needs to be rebuilt in React Native/Expo per the TRD as originally scoped. Either way, the current state is a prototype, not "integrated," and should not be represented as done in any progress doc.
2. Remove the `let currentTier` global and all in-memory mock state from `server.ts`, or clearly firewall it behind a `MOCK_MODE`/`NODE_ENV=development` flag that can never be reachable in a deployed build.
3. Point `getApiBaseUrl()` at the real API using a Vite-correct env mechanism (`import.meta.env.VITE_API_URL`, wired through `vite.config.ts`'s `envPrefix`/`define`), and verify with a network trace that requests actually reach `apps/api`.
4. Wire real authentication: either embed `createBetterAuthClient` from `@raza-stationers/api` (requires solving mobile cookie handling — see item 4 below) or issue a proper Bearer-token flow the `BetterAuthGuard` will accept once item 2 above is resolved.
5. Remove the `createOrderApi` fake-success fallback. If the real request fails, the UI must show an explicit error, never a fabricated order confirmation.
6. Re-audit `docs/TRD.md` change log and `docs/mobile/customer-app-design-prompt.md` against what's actually built and correct the record.

---

## 4. HIGH — Cross-domain session cookies won't reliably work for any true native mobile client, and this hasn't been addressed

`apps/api/src/auth/better-auth.ts` (lines 79-85) sets:
```ts
advanced: {
  useSecureCookies: true,
  defaultCookieAttributes: { sameSite: "none", secure: true },
},
```
This is the right call for a **browser** talking cross-origin to `web.vercel.app` → `api.onrender.com` (which is what `apps/web` and `apps/admin` need, and this part is correctly built — see §5). But Better Auth sessions are cookie-based, and plain `fetch()`/`XMLHttpRequest` from a **React Native** app does not share a cookie jar with a WebView or persist `Set-Cookie` the way a browser does. If/when `apps/mobile` is rebuilt as a real native app (see item 3), this auth setup will not "just work" — it needs either:
- Better Auth's Expo/React Native client plugin (which stores the session token in secure storage and sends it as a header instead of a cookie), configured on both client and server, or
- A dedicated Bearer-token issuance path validated by the guard (tying back into item 2's fix).

**Fix direction:** Before rebuilding the mobile app, add the appropriate Better Auth native/Expo plugin on both `apps/api`'s `betterAuth()` config and the mobile client, and extend `BetterAuthGuard` to accept it. Do this as part of item 3, not as an afterthought.

---

## 5. HIGH — CORS origin check uses substring matching, effectively allowing spoofable domains through with credentials enabled

`apps/api/src/main.ts` (lines ~40-48):
```ts
app.enableCors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);
    if (/^https:\/\/raza-stationers-(web|admin)(-[a-z0-9-]+)?\.vercel\.app$/.test(requestOrigin)) {
      return callback(null, true);
    }
    if (requestOrigin.includes("localhost")) return callback(null, true);   // <-- substring match
    callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
  },
  credentials: true,
});
```
`requestOrigin.includes("localhost")` is a **substring** check, not an origin-format check. A malicious site hosted at, e.g., `https://not-localhost.attacker.com` or `https://localhost.attacker.com` would pass this check (`.includes("localhost")` is `true` for both), and because `credentials: true` is set, the browser would send the user's Better Auth session cookie along with such a request if the victim's browser had ever authenticated against the API and the attacker could get the victim to visit their page. This is a real cross-origin credential-leak vector, not just a style nit.

**Fix direction:** Replace the substring check with an exact allow-list match, e.g. parse `requestOrigin` with `new URL()` and compare `hostname === "localhost"` (and optionally allow a small fixed set of ports), or maintain an explicit array of exact allowed localhost origins (`http://localhost:3000`, `:3001`, `:3002`, `:4000`) and use strict equality/`Set.has()`, never `.includes()` on the raw origin string.

---

## 6. HIGH — `CORS_ORIGINS` environment variable is parsed but never actually used (dead code, and misleading to whoever configures Render)

Same file, `apps/api/src/main.ts` (lines ~33-39):
```ts
const configuredOrigins = process.env.CORS_ORIGINS?.split(",")...;
const corsOrigins = configuredOrigins?.length ? configuredOrigins : (production ? [...] : [...]);

app.enableCors({
  origin: (requestOrigin, callback) => { /* uses only the hardcoded regex + localhost check above */ },
  credentials: true,
});
```
`corsOrigins` is computed from `CORS_ORIGINS` but **never referenced inside the actual `origin` callback.** `render.yaml` declares `CORS_ORIGINS` as a configurable env var (`sync: false`), implying an operator can change allowed origins by setting it — but doing so currently has **zero effect** on which origins are actually allowed. This is actively misleading for whoever operates the deployment.

**Fix direction:** Either wire `corsOrigins` into the actual `origin` callback (check `corsOrigins.includes(requestOrigin)` in addition to/instead of the hardcoded regex), or remove the dead `CORS_ORIGINS` parsing and the `render.yaml` entry if the origin list is meant to stay hardcoded. Don't leave a config knob that silently does nothing.

---

## 7. HIGH — Better Auth's `baseURL` silently defaults to the **staging** API domain in production if the env var is unset

`apps/api/src/auth/better-auth.ts` (line 77):
```ts
baseURL: process.env.BETTER_AUTH_URL || "https://raza-stationers-api-staging.onrender.com",
```
If `BETTER_AUTH_URL` is ever missing on a production deploy (it's marked `sync: false` in `render.yaml`, meaning it's easy to forget when spinning up a new environment), every OAuth callback URL, password-reset link base, and Better Auth-internal absolute URL will silently resolve against the **staging** hostname instead of production — password reset emails would contain links pointing at staging, and Google OAuth's configured redirect URI would not match, breaking login for real users, with no startup error to signal the misconfiguration.

**Fix direction:** Make this fail loudly instead of failing silently, matching the pattern already used for `authSecret` two lines below it:
```ts
const authUrl = process.env.BETTER_AUTH_URL;
if (!authUrl) throw new Error("BETTER_AUTH_URL environment variable is required.");
```
(Keep a same-style fallback only for local dev, gated on `NODE_ENV !== "production"`.)

---

## 8. HIGH — `render.yaml` never declares `DATABASE_URL`, which the app requires to boot

`apps/api/src/main.ts` (lines ~23-26) enforces at startup:
```ts
if (production) {
  const required = ["DATABASE_URL"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
}
```
and `apps/api/src/auth/better-auth.ts`'s `createPrismaClient()` also reads `process.env.DATABASE_URL` directly. But `render.yaml`'s `envVars` list only declares `DIRECT_URL`, `JWT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Google OAuth vars, `NEXT_PUBLIC_WEB_URL`, SMTP vars, and `CORS_ORIGINS` — **`DATABASE_URL` is absent from the manifest entirely.** Anyone provisioning the service fresh from this Blueprint will not even be prompted for it in the Render dashboard, and the API will crash on boot with the exact error above.

**Fix direction:** Add `DATABASE_URL` (and `PGSSLROOTCERT` if it's not always resolvable via the repo-relative `supabase-ca.crt` lookup — see item 15) to `render.yaml`'s `envVars` list with `sync: false`.

---

## 9. HIGH — The web storefront never actually applies a customer's approved wholesale discount/pricing tier

`apps/web/src/hooks/use-auth.tsx`: `clientBusiness` state (line 61) is declared, initialized to `null`, and reset to `null` on logout (line 105) — but **it is never set anywhere else in the file.** There is no fetch of the user's `ClientBusiness`/discount tier after login, no call to `getClient`/`getResolvedPrice` from `RazaAPIClient` to populate it. Meanwhile `pricingContext` (lines 238-246) is computed directly from this always-null `clientBusiness`:
```ts
const pricingContext: UserPricingContext = React.useMemo(() => {
  if (accountStatus === "approved" && clientBusiness?.accountStatus === "active") {
    return { isApprovedBusiness: true, businessDiscountPercent: clientBusiness.discountPercent || 0 };
  }
  return { isApprovedBusiness: false };
}, [accountStatus, clientBusiness]);
```
Since `clientBusiness` is always `null`, this branch can never be taken — `pricingContext` is always `{ isApprovedBusiness: false }` for every logged-in user, no matter how long they've been an approved wholesale customer. This directly breaks the core pricing engine described in TRD §9 and BRD's 5-tier priority order (TRD v1.5 changelog) — approved customers would always see retail/base pricing on the storefront, never their assigned discount.

**Fix direction:** After `checkSession()` successfully resolves a user, fetch that user's linked `ClientBusiness` (there's already a `getClient(id)` method on `RazaAPIClient`, plus `businessUserLinks` is already returned by the bootstrap-status endpoint in `auth.service.ts`) and call `setClientBusiness(...)`/`setBusinessRole(...)` accordingly. Add a Playwright/E2E test that logs in as a seeded approved wholesale account and asserts the discounted price actually renders on a product page — this exact regression would not have been caught by unit tests alone.

---

## 10. MEDIUM — Google OAuth users can bypass the mobile-number onboarding step entirely

`apps/web/src/hooks/use-auth.tsx` `loginWithGoogle` (lines 187-196) sets:
```ts
callbackURL: typeof window !== "undefined" ? window.location.origin + (returnTo || "/catalogue") : "/catalogue",
```
Better Auth redirects the browser straight to this `callbackURL` after a successful Google sign-in — i.e., straight to `/catalogue` (or wherever `returnTo` points), **not** through `/signin`. The only place that checks `accountStatus === "authenticated_unregistered"` and redirects to `/onboarding` is `apps/web/src/app/signin/page.tsx` (lines 34-35). There is no such check in `apps/web/src/app/layout.tsx` or any shared/global gate — confirmed by inspecting the root layout, which renders `AuthProvider` but performs no status-based redirect itself. A user who signs up via Google therefore lands directly on the catalogue with `mobileNumber` still null on their `User` record, and nothing in the UI will ever prompt them to complete onboarding unless they happen to revisit `/signin` again.

This is the exact gap the project's own `auth_debugging_progress.md` calls "Issue 10," which is conspicuously the one issue missing from that document's "Complete" status table — i.e., the team's own notes already flagged this as unresolved; it still is.

**Fix direction:** Add the `authenticated_unregistered` → `/onboarding` redirect to a shared location every authenticated route passes through (e.g. a check inside `AuthProvider` itself, or a small client component mounted in `layout.tsx`), not just the `/signin` page, so it fires regardless of which URL Better Auth's OAuth callback lands the user on.

---

## 11. MEDIUM — Admin panel route protection is entirely client-side; no defense in depth

`apps/admin/src/middleware.ts`:
```ts
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}
```
This is a complete no-op (the comment explains why: cross-domain Better Auth cookies aren't visible to Next.js middleware running on the admin's own origin). Protection is entirely delegated to `AdminShell`'s client-side `useEffect` redirect (`apps/admin/src/components/shell/AdminShell.tsx` lines 51-55). This means:
- Any server-rendered/RSC data fetch that happens before the client JS mounts is not gated at all.
- There is a brief flash of the app shell (or at minimum a loading state that reveals the route exists and begins fetching) before the client-side redirect fires.
- Anyone with JS disabled, or intercepting the initial HTML/RSC payload directly, is not blocked by anything server-side.

This was a deliberate tradeoff (per the code comment) to work around Better Auth's cross-domain cookie visibility limitation, but it should not be the final state for an admin panel handling order/financial data.

**Fix direction:** Have `apps/admin`'s Next.js server verify the session server-side by forwarding the incoming cookies to the API's `auth.api.getSession()` (or a lightweight `/auth/api/get-session` call) from within middleware or a server component wrapper, rather than trusting only client-side JS. At minimum, ensure no sensitive data is fetched or embedded in the initial server-rendered payload before the auth check completes.

---

## 12. MEDIUM — `better-auth.guard.ts` swallows all errors into a generic 401, hiding real failures (including your own server misconfiguration)

```ts
} catch (err: any) {
  if (err instanceof UnauthorizedException) throw err;
  throw new UnauthorizedException("Invalid or expired session");
}
```
Any exception from `auth.api.getSession()` — including a database connection failure, a Prisma error, or a misconfigured `BETTER_AUTH_SECRET` — is reported to the client identically to "you're not logged in." This makes production incidents (e.g., the database pausing after Supabase's 7-day free-tier inactivity window, explicitly called out as a real risk in `docs/TRD.md` §20) indistinguishable from a normal session expiry in logs and in the UI, which will send whoever is debugging it down the wrong path (checking auth config) instead of the right one (checking DB connectivity).

**Fix direction:** Log the actual caught error server-side (e.g. via Nest's `Logger`) before re-throwing the sanitized `UnauthorizedException`, and consider surfacing a distinct `503`/`ServiceUnavailableException` for genuine backend failures (DB unreachable) versus a `401` for a genuinely missing/expired session.

---

## 13. MEDIUM — `trustedOrigins` list in `better-auth.ts` is a separate, inconsistent allow-list from the CORS config in `main.ts`

`apps/api/src/auth/better-auth.ts` (lines 138-144) hardcodes:
```ts
trustedOrigins: [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "https://raza-stationers-web.vercel.app",
  "https://raza-stationers-admin-seven.vercel.app",
],
```
This list is maintained completely separately from the CORS regex in `main.ts` (§5 above) and from `CORS_ORIGINS` in `render.yaml` (§6). It's missing `http://localhost:3002` (the mobile app's newly-assigned dev port, per the very last commit on this branch, `3200a1d`), and it will not automatically pick up Vercel preview-deployment URLs the way the CORS regex in `main.ts` does — meaning OAuth/social sign-in could behave differently (rejected as an untrusted origin) on a preview deploy even though a plain API request from the same origin would pass CORS.

**Fix direction:** Derive both `trustedOrigins` and the CORS allow-list from one shared source of truth (e.g. a small shared config module or the same `CORS_ORIGINS` env var, parsed once), so there is exactly one place that defines "which origins are allowed to talk to this API," not three.

---

## 14. MEDIUM — Admin MFA enroll/unenroll silently sends an empty password if the caller forgets to pass one

`apps/admin/src/hooks/use-admin-auth.tsx` (lines 119-121, 145-147):
```ts
const enrollMfa = React.useCallback(async (password?: string) => {
  const res = await authClient.twoFactor.enable({ password: password || "" })
  ...
```
This was the subject of the auth debugging report's "Issue 6" (claimed complete), and the signature was indeed updated to accept a `password` parameter — but it still silently falls back to an **empty string** password rather than throwing/validating if the caller omits it. Confirm every call site (`TotpEnrollView.tsx`, `TotpChallengeView.tsx`) always supplies the real current password; if any path can reach this without one, Better Auth will reject the empty-password request with a possibly-confusing server error rather than a clear client-side validation message.

**Fix direction:** Make `password` a required (non-optional) parameter on `enrollMfa`/`unenrollMfa` so a missing value is a TypeScript compile error, not a runtime empty-string surprise, and add a client-side guard that shows a clear "enter your password" validation message instead of submitting.

---

## 15. LOW — `supabase-ca.crt` discovery walks up from `process.cwd()`, which is fragile across different deploy working directories

`packages/db/src/postgres.ts` `findCertificate()` (lines 32-48) walks up to 6 parent directories from `process.cwd()` looking for `supabase-ca.crt`, and throws if not found (when no `PGSSLROOTCERT` override is set). This works today (per the auth debugging report, "Issue 11... Verified `supabase-ca.crt` is copied in Dockerfile and not excluded by `.dockerignore`"), but it is inherently sensitive to whatever working directory the process is launched from (Docker `WORKDIR`, Render's build vs. run directory, a future monorepo restructure). A silent path change elsewhere in the build (e.g. a Dockerfile edit) can break TLS verification at runtime with an unhelpful low-level Postgres SSL error rather than a clear message.

**Fix direction:** Prefer always setting `PGSSLROOTCERT` explicitly as an env var in `render.yaml`/Dockerfile pointing at a fixed, known path, and treat the directory-walk as a local-dev-only convenience fallback, not the production mechanism.

---

## 16. LOW — Legacy `AuthService.verifyAuthToken()` JWT fallback silently accepts test/dev secrets in non-test environments if `JWT_SECRET` happens to be set

`apps/api/src/auth/auth.service.ts` lines 34-65: the method checks `NODE_ENV === "test" || USE_TEST_KEY === "true"` first (using a hardcoded fallback test secret if `JWT_SECRET` is unset), then falls through to a second, separate `if (jwtSecret)` block for any environment. Combined with item 2 above (this method being effectively dead now that `BetterAuthGuard` doesn't call it), the safest fix is likely to delete this method along with the rest of the legacy JWT path — but if it's kept for any reason, tighten the `USE_TEST_KEY`/`NODE_ENV` branching so a misconfigured `USE_TEST_KEY=true` can never be set in a production environment (fail startup if `NODE_ENV === "production" && USE_TEST_KEY === "true"`).

---

## 17. LOW — Pre-existing Phase-0 findings that are still worth re-checking now that Better Auth has replaced the JWT-only setup

These were logged in `docs/stabilization/issue-register.md` before the Better Auth migration. Re-verify each against current code rather than assuming they're stale:

| ID | Original finding | Current status on this branch (verify) |
|---|---|---|
| ISSUE-02 | Fallback JWT secret string in auth code | `better-auth.ts` now throws if `BETTER_AUTH_SECRET`/`JWT_SECRET` unset (good) — but confirm `apps/api/src/auth/auth.module.ts` / `jwt.strategy.ts` (the legacy JWT strategy, still present per `apps/api/src/auth/strategies/jwt.strategy.ts`) don't still carry a hardcoded dev fallback for the legacy path. |
| ISSUE-03 | Auth tokens in `localStorage` | The current web/admin hooks (§this report) use Better Auth's httpOnly-cookie session, not `localStorage` — this looks resolved for the primary flow, but re-check `getAccessToken()` in `use-auth.tsx` (line 236, currently a stub always returning `null`) isn't quietly reintroducing token storage elsewhere once implemented. |
| ISSUE-07 | Admin bulk-import modal falls back to `MOCK_CATEGORIES` on API failure | Not re-verified in this pass — check `apps/admin/src/components/catalogue/BulkImportModal.tsx` still does this; if so, replace the silent mock fallback with an explicit error state per the original recommendation. |
| ISSUE-08 | Cart persisted only in `localStorage`, no server sync for logged-in users | Not re-verified in this pass — check `apps/web/src/hooks/use-cart.tsx` / cart page for server-side persistence; still relevant to B2B customers switching devices per the original note. |

---

## 18. Recommended Fix Order

1. **§1** (MFA/AAL2 bypass) — highest-risk security hole, admin/owner impersonation-adjacent.
2. **§5, §6** (CORS substring bug + dead `CORS_ORIGINS`) — credential-leak risk, quick to fix.
3. **§2** (dual auth systems) — decide and collapse to one system before building anything else on top (especially before rebuilding mobile).
4. **§7, §8** (production env var gaps: `BETTER_AUTH_URL`, `DATABASE_URL`) — deployment-breaking or silently-wrong-domain risk; cheap fixes.
5. **§9** (pricing/discount never applied) — direct business/revenue correctness bug.
6. **§10** (OAuth onboarding bypass) — data-integrity bug (users left without a mobile number).
7. **§3, §4** (mobile app rebuild/reconnect) — largest effort item; needs an explicit decision from the project owner on scope before starting.
8. **§11–§16** — defense-in-depth and code-quality items, fix opportunistically alongside the above.
9. **§17** — spot-check only; fold into whichever nearby item touches the same file.

---

## 19. Verification Checklist for Whoever Closes This Out

For each fixed item, do not close it until you can point to:
- The exact diff that changed the behavior (not just a comment or doc update).
- A test (unit, integration, or E2E) that would have failed before the fix and passes after.
- For anything touching `docs/manual_testing/auth_debugging_progress.md`: update it with the same discipline this report used — cite the file/line evidence, don't just flip a status cell to "Complete."
