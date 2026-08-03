# Raza Stationers — Better Auth Migration: Progress & Approval Tracker

**Companion document to:** `phases.md`
**Purpose:** Single log of what's decided, what's approved, what's blocked, and what's still open — so the coding agent (Antigravity/Codex) is never given ambiguous authority, and Ahmed always has one place to check real status instead of asking "did it pass?" after the fact.

**How to use this file:** Update it as each phase in `phases.md` progresses. Every status change should be a deliberate edit, not something the agent silently reports as done in chat. Nothing in `phases.md` is "complete" unless it's marked Complete here with evidence.

---

## 1. Phase status board

| Phase | Name | Status | Owner sign-off | Evidence logged |
|---|---|---|---|---|
| 0 | Pre-implementation audit | In progress | Pending | This doc + `phases.md` |
| 1 | Better Auth core install & configuration | Not started | — | — |
| 2 | Role & permission mapping | Not started | — | — |
| 3 | Cookie-based sessions (web + admin) | Not started | — | — |
| 4 | Migrate existing user flows | Not started | — | — |
| 5 | Google OAuth via Better Auth | Not started | — | — |
| 6 | Admin 2FA / TOTP parity | Not started | — | — |
| 7 | Domain/cookie production readiness | Not started | — | — |
| 8 | Full staging verification (browser-driven) | Not started | — | — |
| 9 | Production cutover | Not started | — | — |

**Status values:** `Not started` / `In progress` / `Blocked` / `Ready for review` / `Complete`
A phase only moves to `Complete` after Ahmed's sign-off is recorded in the table above with a date.

---

## 2. Decisions log

Record every architectural or scope decision here, in the order made, so nothing has to be re-litigated or re-discovered later.

| # | Decision | Rationale | Date | Status |
|---|---|---|---|---|
| D1 | Better Auth runs as a single instance inside `apps/api` (NestJS), not a separate service | Keeps one backend, one deploy target, avoids a second auth surface to secure | — | Locked |
| D2 | Sessions are Prisma-backed in the existing Supabase Postgres database | Avoids a second datastore; reuses existing backup/RLS posture | — | Locked |
| D3 | Cookie-based auth for both `apps/web` and `apps/admin`, replacing `localStorage` JWT | Removes XSS-exposed token storage; standard Better Auth pattern | — | Locked |
| D4 | Application roles remain in existing Raza Stationers tables; Better Auth does not introduce a parallel role system | Prevents split-brain authorization logic between two systems | — | Locked |
| D5 | "Business owner" (customer who owns a `ClientBusiness`) is explicitly distinct from the platform `owner` role | Repo audit found this was previously ambiguous; must not repeat in new code | — | Locked |
| D6 | Cross-domain cookie issue (separate Vercel/Vercel/Render domains) must be resolved via shared subdomains or a reverse proxy before production cutover | Cookie auth is unreliable cross-site, especially in Safari, on today's domain topology | — | Locked |
| D7 | Existing bcrypt password migration strategy | **Open — see Section 4** | — | Pending |
| D8 | Admin 2FA: Better Auth native 2FA vs. retained Supabase TOTP | **Open — see Section 4** | — | Pending |
| D9 | Production domain topology: shared subdomains vs. reverse proxy | **Open — see Section 4** | — | Pending |

---

## 3. Task-level checklist

Use this as the working checklist during implementation. Check items only with real evidence (a passing test, a screenshot, a verified browser flow) — not because the agent's chat output claimed success. This project has a documented pattern of agent chat claiming "passed" prematurely; this checklist exists specifically to stop that from happening silently.

### Phase 0 — Pre-implementation audit
- [ ] All current guards/decorators inventoried (`JwtAuthGuard`, `RolesGuard`, `@Roles(...)` usage across all ~65+ endpoints)
- [ ] All current roles inventoried: `owner`, `admin`, `packing`, `delivery`, `business_user`
- [ ] `ClientBusiness` / `BusinessUserLink` relationship documented as the B2B source of truth
- [ ] Owner vs. business-owner naming distinction confirmed in writing
- [ ] Current package versions (NestJS, Prisma, Next.js, Playwright) confirmed against latest compatible Better Auth release — **not assumed**
- [ ] Ahmed has reviewed and approved `phases.md` Section 1 (architecture decisions)

### Phase 1 — Core install
- [ ] Better Auth + Prisma adapter installed in `apps/api`
- [ ] Adapter configured against existing Supabase Postgres
- [ ] Better Auth migration generated and applied (additive only — no existing table touched)
- [ ] API boots with Better Auth mounted
- [ ] Confirmed zero regression on existing endpoints (full endpoint list re-tested)

### Phase 2 — Role mapping
- [ ] User-linkage strategy decided (Better Auth user = canonical `User`, or 1:1 FK) and documented
- [ ] All 5 roles mapped explicitly (see `phases.md` Section 3 table, finalized here)
- [ ] Owner/business-owner distinction encoded in session/user metadata, not just documentation
- [ ] Ahmed sign-off on mapping

### Phase 3 — Cookie sessions
- [ ] Local/staging cross-domain issue resolved for testing purposes
- [ ] `httpOnly` / `secure` / `sameSite` cookie config set
- [ ] `use-auth.tsx` (web) migrated off `localStorage`
- [ ] `use-admin-auth.tsx` (admin) migrated off `localStorage`
- [ ] Session survives reload + new tab, web
- [ ] Session survives reload + new tab, admin

### Phase 4 — Migrate existing flows
- [ ] Customer signup on Better Auth
- [ ] Customer login on Better Auth
- [ ] Business registration flow re-wired (still creates `ClientBusiness`, correctly tagged)
- [ ] Admin login on Better Auth, role-restricted
- [ ] Password migration strategy decided (D7) and executed
- [ ] Old `AuthModule`/`JwtAuthGuard` kept dormant until all four flows verified
- [ ] Old JWT path removed

### Phase 5 — Google OAuth
- [ ] Google provider configured in Better Auth (not Supabase)
- [ ] Callback URLs registered for local, staging, production
- [ ] `NEXT_PUBLIC_SUPABASE_URL` dependency removed from web Google sign-in
- [ ] Google sign-in verified via real browser OAuth round trip in staging
- [ ] Resulting user correctly resolves through Phase 2 role mapping

### Phase 6 — Admin 2FA
- [ ] Decision D8 made and documented
- [ ] TOTP enrollment implemented for `owner`/`admin` only
- [ ] Original "Admin still not signing in" issue re-tested and confirmed fixed at root cause
- [ ] Owner account can sign in with password + TOTP, real browser, staging

### Phase 7 — Domain readiness
- [ ] Decision D9 made and documented
- [ ] Chosen topology implemented in staging
- [ ] Verified in Safari specifically
- [ ] Verified in Chrome and Firefox

### Phase 8 — Full browser verification
- [ ] Customer signup/login — browser evidence attached
- [ ] Business registration — browser evidence attached
- [ ] Google OAuth — browser evidence attached
- [ ] Admin login + TOTP + sign-out — browser evidence attached
- [ ] Session persistence across reload/tab/subdomain — browser evidence attached
- [ ] Console/network clean on every flow above
- [ ] Responsive check at 320/360/390/430/768px
- [ ] No pass recorded on HTTP-only smoke test alone

### Phase 9 — Production cutover
- [ ] Domain topology applied to production
- [ ] Better Auth deployed to production (API, web, admin)
- [ ] Phase 8 checklist re-run against production
- [ ] Dead code removed (old auth module, Supabase-only Google config, `localStorage` remnants)
- [ ] Previous deployment kept reachable for rollback, minimum 1 week

---

## 4. Open questions (must be resolved before the relevant phase starts)

| # | Question | Blocks | Status |
|---|---|---|---|
| D7 | Do we accept existing bcrypt hashes into Better Auth's credential provider, or force a password reset for all existing accounts (including the bootstrapped owner account) on cutover? | Phase 4 | Open |
| D8 | Does Better Auth's own 2FA/TOTP plugin replace the current Supabase TOTP/AAL2 admin flow, or is Supabase TOTP deliberately retained as a scoped exception for Admin only? | Phase 6 | Open |
| D9 | Production domain topology: restructure to shared subdomains of one root domain, or introduce a first-party reverse proxy in front of the existing Vercel + Render setup? | Phase 7, 9 | Open |

Ahmed should resolve these before their blocking phase begins — they are architecture calls, not implementation details, and shouldn't be decided unilaterally by the coding agent mid-task.

---

## 5. Known carry-over issues (from current JWT/Supabase-hybrid system)

These are the specific failures found in manual testing that this migration is expected to resolve. Each should be explicitly re-tested post-migration, not assumed fixed.

| ID | Issue | Expected resolution phase |
|---|---|---|
| ST2-01 | Catalogue: "Unable to connect to server" | Not an auth issue — deployment/env connectivity; verify independently, but re-check after cutover in case env vars change |
| ST2-02 | Customer signup fails: "Failed to fetch" | Phase 4, 8 |
| ST2-03 | Business-owner registration fails: "Failed to fetch" | Phase 4, 8 |
| ST2-05 | Google sign-in: missing `NEXT_PUBLIC_SUPABASE_URL` | Phase 5, 8 |
| ST2-06 | Admin still not signing in | Phase 6, 8 |

ST2-04 (catalogue layout not full width) is a UI issue, unrelated to this migration — tracked separately, not in this document.

---

## 6. Rules for the coding agent working against this plan

- Do not mark any checklist item above as done without attaching real evidence (test output, screenshot, or browser transcript) — chat narration alone is not evidence.
- Do not resolve an open question in Section 4 unilaterally; surface it and wait.
- Do not begin Phase 7 (domain readiness) or Phase 9 (cutover) until every prior phase's exit criteria in `phases.md` are met.
- Do not remove the old JWT/Supabase-auth code path until Phase 4's and Phase 8's exit criteria are both marked Complete in this file.
- If blocked (e.g. database unreachable, missing credentials, ambiguous scope), mark the phase `Blocked` in Section 1 with a one-line reason — do not keep attempting workarounds silently.
