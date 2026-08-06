# Raza Stationers — Better Auth Migration: Pre-Implementation Checklist

**Companion document to:** `phases.md` (the phased plan) and `betterauth_progress.md` (the tracker)
**Purpose:** Everything in this file has to be true, decided, or in hand **before Phase 1 of `phases.md` starts**. It's the gate between "we agreed on an architecture" and "the coding agent is allowed to touch the repo." Nothing here is code — it's decisions, access, and backups that only Ahmed can provide or approve.

**Rule:** If any item below is unchecked, the coding agent should not be told to begin Phase 1. Treat this like a pre-flight list, not a suggestion.

---

## 1. Decisions only Ahmed can make

These were flagged as open in `betterauth_progress.md` (Section 4). They are architecture calls, not implementation details, so the agent should never resolve them on its own mid-task.

- [ ] **D7 — Existing password migration.** Decide: do existing bcrypt password hashes get accepted directly into Better Auth's credential provider, or does every existing account (including the bootstrapped owner account and any already-approved business accounts) get forced through a password reset on cutover? This affects real people who already have accounts — decide before Phase 4, not during it.
- [ ] **D8 — Admin 2FA approach.** Decide: does Better Auth's own two-factor/TOTP plugin replace the current (currently broken) Supabase TOTP/AAL2 flow for Admin, or is Supabase TOTP deliberately kept as a scoped exception just for Admin? Either is fine — but it needs to be a decision, not a default the agent picks.
- [ ] **D9 — Production domain topology.** Decide: restructure `raza-stationers-web.vercel.app` / `raza-stationers-admin-seven.vercel.app` / the Render API domain onto shared subdomains of one root domain (e.g. `app.`, `admin.`, `api.` on one domain you own), or put a first-party reverse proxy in front of the current three-domain setup. This is what determines whether cookie auth can work in production at all — see Section 3 below, it has real cost/effort implications.

**Do not let the coding agent proceed past Phase 0 in `phases.md` until all three of these have a written answer in `betterauth_progress.md`.**

---

## 2. Domain and DNS readiness (needed for D9, above)

Whichever way D9 is decided, some of this has to be true before Phase 7 (and ideally confirmed now, since it can take time — DNS propagation, certificate issuance, Google Cloud Console review):

- [ ] Do you already own a root domain for the business (e.g. `razastationers.com` or similar), or does one need to be purchased? If Better Auth/cookie auth is going to work reliably in production, the current unrelated Vercel/Render domains are a blocker regardless of which D9 option you pick.
- [ ] If going the shared-subdomain route: confirm you have DNS management access (registrar or DNS provider dashboard) to add subdomain records pointing at Vercel and Render.
- [ ] If going the reverse-proxy route: confirm which service will host the proxy (a Vercel edge config, a dedicated proxy service, etc.) — this needs to be decided, not left for the agent to improvise mid-implementation.
- [ ] Confirm SSL/TLS will be handled automatically by whichever platform you land on (Vercel and Render both auto-issue certs for custom domains, but only once DNS is correctly pointed).

---

## 3. Google OAuth setup (needed for Phase 5)

The current failure ("Google authentication requires a configured Supabase project") happens because the web app is missing `NEXT_PUBLIC_SUPABASE_URL`. The fix in `phases.md` moves Google auth off Supabase and into Better Auth directly — which means new credentials, not a patched env var.

- [ ] Google Cloud Console project exists (or will be created) for Raza Stationers OAuth — confirm who owns/has access to this project (personal Google account vs. a dedicated business account — worth deciding now rather than mid-migration).
- [ ] OAuth consent screen configured (app name, support email, logo if desired) — this is user-facing, customers will see it on the Google sign-in screen.
- [ ] OAuth 2.0 Client ID + Client Secret generated for a **web application** type.
- [ ] Redirect URIs planned for all three environments: local dev, staging, and production — but **cannot be finalized until D9 (domain topology) is decided**, since the production redirect URI depends on the final domain.
- [ ] Decide where these credentials will be stored (Render env vars for the API, Vercel env vars for web) — and confirm who has access to set/rotate them.

---

## 4. Database safety net

The Better Auth migration adds new tables and, depending on D7, may touch how existing user records authenticate. Before Phase 1 runs any migration against the shared Supabase Postgres database:

- [ ] Take a full manual backup/snapshot of the production database (Supabase has a backup/restore feature — confirm it's enabled and take an explicit snapshot right before Phase 1, don't rely solely on automatic daily backups).
- [ ] Confirm you know how to restore from that backup if something goes wrong — don't find this out for the first time during an incident.
- [ ] Confirm the staging database (if separate from production) is either a genuine copy or is explicitly understood to be different — this project has previously had confusion about which database an agent was actually testing against (the earlier "database is now live" episode). Don't let that repeat here: know, in writing, which database each environment points to before Phase 1 starts.

---

## 5. Environment variable audit

Before any Better Auth code exists, confirm you know the full current state of environment variables across all three deployment targets, since this migration will add new ones (Better Auth secret, Google OAuth credentials, session config) and should remove old ones (`NEXT_PUBLIC_SUPABASE_URL` if no longer needed elsewhere, old JWT secret once retired):

- [ ] Vercel (web) — current env vars listed and understood, including which ones are auth-related.
- [ ] Vercel (admin) — same.
- [ ] Render (API) — same, including the database connection strings (`DATABASE_URL` / `DIRECT_URL`) and current `JWT_SECRET`.
- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL` is still needed for anything else (e.g. any remaining direct Supabase client usage) before deciding whether to remove it, or whether it can be dropped entirely once Google auth moves to Better Auth.

---

## 6. Package/version confirmation

`phases.md` Phase 0 already flags this, repeating it here because it's a pre-implementation gate, not something to discover mid-Phase-1:

- [ ] Confirm current versions in use: NestJS, Prisma, Next.js (web + admin), Playwright (for the browser-driven testing in Phase 8).
- [ ] Confirm the latest stable Better Auth release and that it's compatible with the above — check this at the time implementation actually starts, not from anything assumed earlier in planning, since these move fast.

---

## 7. Role and naming sign-off

Before Phase 2 can start, but worth locking in now since it affects everything downstream:

- [ ] Confirm the role list is complete and correct: `owner`, `admin`, `packing`, `delivery`, `business_user` — are there any roles missing, or any of these that no longer apply?
- [ ] Confirm the owner vs. business-owner distinction (Section 1 of `phases.md`) is understood and agreed — this was a naming ambiguity the repo audit specifically flagged, worth a deliberate "yes, this is right" before code starts encoding it.

---

## 8. Working agreement for this round of implementation

Given the pattern seen in earlier phases of this project (the coding agent looping, claiming "PASSED" prematurely, running commands without clear direction), set these expectations before Phase 1 begins:

- [ ] Confirm with the agent up front: no phase is marked complete without evidence, per the rules in `betterauth_progress.md` Section 6.
- [ ] Confirm the agent will pause and ask rather than guess on any of the three open decisions (D7/D8/D9) if it hits them before you've answered.
- [ ] Confirm you (Ahmed) will do the manual/browser verification described in Phase 8 yourself, rather than accepting an HTTP-only smoke test as proof — this was explicitly the gap in the last round of testing on this project.
- [ ] Confirm a rollback plan is acceptable to you: old JWT/Supabase-auth code stays dormant in the repo (not deleted) until Phase 9 is fully signed off, so a bad cutover can be reverted quickly.

---

## 9. Go/no-go

Phase 1 of `phases.md` should not start until every checkbox above is either checked or explicitly deferred with a written reason in `betterauth_progress.md`. If something is genuinely blocked (e.g. you haven't decided on a root domain yet), that's fine — but it should be logged as `Blocked` with a reason, not silently skipped.
