# Raza Stationers Admin Panel — QA and Testing Plan

**Document:** `qa_testing.md`
**Target application:** `apps/admin`
**Project:** Raza Stationers Platform
**Scope:** Complete admin panel after Phases 0–13 of `docs/admin/phases.md`
**Status:** Working QA specification
**Companion documents:** `PRD.md`, `BRD.md`, `FRD.md`, `TRD.md`, `docs/admin/architecture.md`, `docs/admin/phases.md`, `docs/website/qa_testing.md` (the customer-site equivalent this document mirrors)

---

## 1. Purpose

This document defines how an implementation or QA agent must verify the complete admin panel. It mirrors `docs/website/qa_testing.md`'s structure and rigor, with one difference in emphasis: **the Owner-only vs. Admin-allowed permission boundary is this application's highest-severity concern**, in the same way pricing/cart/checkout math was the highest-severity concern for the customer site. This is not a stylistic choice — two of the ten admin pages (`DiscountCredit`, `StockManagement`) already had real permission-boundary defects caught during design review, before a single line of frontend code was written against them.

Testing must verify:

- Every Owner-only action, section, and page is actually inaccessible to non-owner roles — not just visually hidden.
- Every Admin-allowed action remains available to Admin/Operator — over-blocking is as much a defect as under-blocking.
- Business rules (credit limits, discount tiers, stock corrections, order state transitions, staff management) behave per the FRD, not per assumption.
- Mock frontend behaviour does not falsely claim to provide backend security or audit-log durability.
- No confidential business, customer, or staff information is exposed.
- English and Urdu content is readable and correctly scoped, same bilingual rule as the website.
- The interface works on the devices actually used for admin work (desktop/laptop primarily — this is a back-office tool, not a customer-facing site, so mobile-width testing is lower priority than it was for `apps/web`, but not skipped).
- The build matches the reviewed and corrected admin design.

Passing this QA plan does **not** mean the business platform is production-ready. Backend authorization, server-side validation, database integrity, real audit-log persistence, and data migration require separate production testing — identical caveat to the website spec.

---

## 2. Scope

### 2.1 Included

- Design system and global styles (shared tokens via `@raza-stationers/ui`, no admin-specific glass)
- Admin shell: sidebar nav, top bar, dev-only role switcher
- Dashboard
- Client Businesses (including the approval workflow and discount/credit split)
- Discount & Credit
- Stock Management (including the owner-only correction path)
- Order Queue (full state-machine enforcement)
- Product Catalogue (admin) and bulk import
- Delivery Management
- Staff Management
- Accounting & Reporting
- Audit Log
- Settings
- The Owner-only vs. Admin-allowed permission boundary, end to end, across every page above
- Mock role states and mock data
- Motion and reduced-motion behaviour (lighter scope than the website — see `architecture.md` §7)
- Loading, empty, error, and validation states
- Frontend architectural boundaries (no `@raza-stationers/db` dependency, no admin route inside `apps/web`)

### 2.2 Excluded from this QA pass

- The customer website (already QA-passed separately — see `docs/website/qa-report.md`)
- Mobile application
- Real NestJS API (or whatever `apps/api` resolves to — see TRD §5's open question)
- Real PostgreSQL/Prisma integration
- Real Supabase authentication
- Real payment-provider confirmation
- Real inventory reservation
- Real customer credit approval
- Real audit-log persistence (append-only guarantee is a database-level requirement, not testable against a mock)
- Production infrastructure, backups, disaster recovery, penetration testing, load testing

---

## 3. Sources of Truth

Before testing, the agent must read:

1. `.agents/AGENTS.md`
2. `docs/PRD.md`, `docs/BRD.md` (especially §5's Owner/Admin split note and §15 Client Business Management), `docs/FRD.md` (especially §5 Role & Permission Matrix), `docs/TRD.md`
3. `docs/admin/architecture.md`
4. `docs/admin/phases.md`
5. This file
6. `docs/website/qa_testing.md` — for the shared conventions (severity definitions, defect template) this document doesn't re-derive
7. The reviewed and corrected admin design (`Design/RazaStationersAdmin/*.dc.html`)
8. `packages/types`, `packages/api`, `packages/ui`
9. `apps/admin/package.json`, `apps/admin/components.json`
10. Existing test configuration and scripts

If documents disagree: follow explicit user instructions first, then treat the latest approved BRD/FRD business rules as authoritative for permission questions specifically (this is where disagreements are most consequential — a design screenshot is evidence of intent, not an override of FRD §5's role matrix). Record any conflict as a QA blocker rather than silently picking a side.

---

## 4. QA Agent Operating Rules

Same rules as `docs/website/qa_testing.md` §4, restated for this app:

- Inspect before changing anything. Use `/graphify` to locate existing components before assuming something needs to be built.
- Use `/ponytail` to keep any QA fix minimal — and specifically, to check whether a "missing" component is actually already available from `@raza-stationers/ui` before writing a new one.
- Test before fixing. Record evidence for every failure, especially permission-boundary failures (screenshot both the Owner view and the non-owner view side by side where possible).
- Request approval before changing business behaviour, scope, or the permission model itself.
- Never weaken a role gate to make a test pass.
- Never use real customer, staff, credit, or financial data as test fixtures.
- Never start backend, mobile, or customer-website implementation during admin QA.
- Never commit, push, or deploy unless explicitly requested.

---

## 5. Entry Criteria

- Phases 0–13 of `docs/admin/phases.md` are marked complete or ready for QA.
- The application starts locally, at a URL/port distinct from `apps/web`.
- `apps/admin/package.json` has no `@raza-stationers/db` dependency (verify before anything else — this is the single check most directly tied to the incident that shaped this app's structure).
- Typed mock data covering all four roles (Owner, Admin/Operator, Packing Worker, Delivery Worker) is available.
- The reviewed and corrected admin design is available for comparison.

If a phase is incomplete, mark its test cases **Blocked**, not **Passed** — identical rule to the website spec.

---

## 6. Exit Criteria

- All 12 admin routes render without crashes, for all four roles.
- Production build, type-check, and lint succeed.
- Every Owner-only page/section/action is verified inaccessible to every non-owner role — not sampled, verified for each of the ten pages individually.
- Every Admin-allowed action remains available to Admin/Operator (the over-blocking check — do not skip this in favor of only checking under-blocking).
- Order state-machine transitions match FRD §7 exactly; no invalid transition is reachable via the UI.
- Credit, discount, and stock-correction math have no known calculation defects.
- No `@raza-stationers/db` dependency in `apps/admin`; no admin route exists inside `apps/web`.
- No secrets or confidential data are exposed in the client bundle.
- Remaining Medium/Low findings are documented.
- The final QA report contains evidence and a clear recommendation, in the format defined in §19.

---

## 7. Severity Definitions

Same framework as `docs/website/qa_testing.md` §7.2, with admin-specific examples:

| Severity | Definition | Admin-specific examples |
|---|---|---|
| Critical | Exposes sensitive information, corrupts money-related behaviour, bypasses access rules, or makes the app unusable | Admin role can view payment history; Admin can approve a wholesale account; a stock correction saves without a reason; `@raza-stationers/db` reappears as a dependency |
| High | A primary admin workflow cannot be completed, or a major business rule is wrong | Order confirm action doesn't update status; discount tier save silently fails; Owner-only page doesn't block Admin |
| Medium | Works partially but usability/accessibility/secondary behaviour is materially affected | Icon-only button missing `aria-label`; audit log filter doesn't reset correctly |
| Low | Cosmetic or minor consistency issue | Spacing mismatch, inconsistent toast wording |

Priority levels (P0–P3) are identical to the website spec §7.3.

---

## 8. Test Data Matrix

| Persona | Role | Expected access |
|---|---|---|
| Owner | `owner` | Full access to all 10 pages and every gated section/action |
| Admin/Operator | `admin` | Order confirm/reject, routine restock, catalogue management, discount/tier assignment, delivery assignment — no account approval, no credit-limit edit, no payment history, no staff/accounting/audit-log/settings access |
| Packing Worker | `packing` | View picking slips only (out of scope for most admin pages — mainly relevant to Order Queue/Delivery Management phases) |
| Delivery Worker | `delivery` | View assigned deliveries only |

### 8.1 Client business fixtures

Include: a pending business awaiting approval, an active business with available credit, an active business with credit exactly at limit, an active business over its credit limit, a suspended business, a business with zero orders (empty-state check on the drawer's order/payment history).

### 8.2 Stock fixtures

Include: a product at/below its low-stock threshold, a product with existing restock entries, a product with no entries yet (empty state), a scenario requiring a stock correction (to verify the reason-required rule).

### 8.3 Order fixtures

Include: an order in every status from FRD §7's state machine, including `Pending Owner Approval` (to verify only Owner can action it) and `Failed Delivery` (to verify the redelivery path).

---

## 9. Expected Route Inventory

| Route | Expected purpose | Gating (architecture.md §4) |
|---|---|---|
| `/dashboard` (or `/`) | Dashboard | Section-level |
| `/client-businesses` | Client Businesses | Section-level |
| `/discount-credit` | Discount & Credit | Section-level |
| `/stock` | Stock Management | Action-level |
| `/orders` | Order Queue | Section-level (Pending Owner Approval sub-state) |
| `/catalogue` | Product Catalogue (admin) | None |
| `/delivery` | Delivery Management | None |
| `/staff` | Staff Management | Full-page block |
| `/accounting` | Accounting & Reporting | Full-page block |
| `/audit-log` | Audit Log | Full-page block |
| `/settings` | Settings | Full-page block |

Confirm actual routes against `docs/admin/architecture.md` §2 and report deviations. There is no admin route anywhere inside `apps/web` — confirm this explicitly as part of every QA pass on this app, not just the first one.

---

## 10. Static and Architectural Checks

### QA-ARCH-001 — Dependency boundary

**Pass criteria:** `apps/admin` does not depend on `@raza-stationers/db`. No Prisma client or raw DB client is imported anywhere in `apps/admin/src`. Domain data comes through typed mocks or `@raza-stationers/api`.

### QA-ARCH-002 — No admin code in `apps/web`

**Pass criteria:** `apps/web/src` contains no `app/admin` route, no `components/admin` folder, and no import of admin-specific domain logic. This directly re-checks the incident that motivated splitting `apps/admin` out as its own app.

### QA-ARCH-003 — Shared component reuse

**Pass criteria:** `apps/admin` imports shadcn-equivalent primitives, `Bilingual`, and motion wrappers from `@raza-stationers/ui`, not from a locally duplicated copy. A `graphify query` for any primitive that appears duplicated locally should be run before accepting the duplication as intentional.

### QA-ARCH-004 — Shared domain types

**Pass criteria:** Product, Order, ClientBusiness, StockMovement, DiscountRule, and CreditTransaction data all use `@raza-stationers/types`. No incompatible inline type is introduced for something already defined there (this was the original `packages/types` defect this project fixed once already — don't reintroduce a parallel model here).

### QA-ARCH-005 — Client bundle privacy

**Pass criteria:** no secrets, private keys, database strings, or service credentials appear in client code or built assets. No real customer, staff, or financial data appears in fixtures.

---

## 11. The Permission Boundary — Detailed Tests (highest priority in this document)

Run every one of these for **each** non-owner role that could plausibly reach the page (primarily Admin/Operator; Packing/Delivery where relevant), not just once.

### QA-PERM-001 — Full-page blocks

**Pages:** Staff Management, Accounting & Reporting, Audit Log, Settings.
**Steps:** Load each page as Admin/Operator.
**Pass criteria:** the real page content never renders, even momentarily — non-owner sees only the "Owner only" block with a link back to the dashboard. No network/mock-data call for the page's real content fires for a non-owner role (a full-page block that still fetches the underlying data before hiding it is itself a defect — the point is that a non-owner never receives owner-only data, not just that they don't see it rendered).

### QA-PERM-002 — Section-level gates, under-blocking check

**Pages:** Dashboard (Wholesale Approvals / Overdue Payments tiles), Client Businesses (credit limit & balance, payment history), Discount & Credit (credit limits table).
**Pass criteria:** the owner-only section is genuinely inaccessible to Admin/Operator (blurred/hidden values, no edit control, correct "Owner only" messaging) — verified per section, not assumed from one example.

### QA-PERM-003 — Section-level gates, over-blocking check

**Pages:** Client Businesses (discount/tier assignment), Discount & Credit (discount tier percentages), Order Queue (routine confirm/reject/dispatch).
**Pass criteria:** Admin/Operator can perform every one of these actions without being incorrectly blocked. This check exists specifically because `DiscountCredit.dc.html` initially over-blocked this exact action — treat this as a standing regression check, not a one-time verification.

### QA-PERM-004 — Action-level gate

**Page:** Stock Management.
**Pass criteria:** "Log Restock" works for Admin/Operator and Owner alike. "Stock Correction" is visibly dimmed for Admin/Operator, and attempting it fires the "Owner only" toast without opening the correction modal — the modal must not be reachable at all by a non-owner, not merely pre-filled/disabled.

### QA-PERM-005 — Pending Owner Approval sub-state

**Page:** Order Queue.
**Pass criteria:** an order in `Pending Owner Approval` status shows its approve/reject action only to Owner; Admin/Operator sees the order but cannot action this specific transition (they can still action orders in ordinary Pending Review status, per QA-PERM-003 — the gate is on this one sub-state, not the whole queue).

### QA-PERM-006 — Audit-trail wording

**Pass criteria:** every action that is Owner-only and mutates state (approve, reject, tier change, credit-limit change, stock correction) shows a confirmation that references audit logging (e.g. "written to audit log"), matching the reviewed design's existing wording. This isn't cosmetic — it's the frontend correctly representing `FR-SEC-02`'s requirement even before a real backend audit log exists.

### QA-PERM-007 — Role-predicate centralization

**Pass criteria:** `grep` confirms role checks route through `lib/role.ts` predicates rather than being re-typed as inline string comparisons (`role !== 'owner'`) scattered across components — a maintainability check, but one directly relevant to permission correctness: a typo in one of several inline checks is exactly how a boundary defect like `DiscountCredit`'s slips through.

---

## 12. Per-Page Functional Tests

### QA-DASH — Dashboard

Covers: KPI tile correctness (including locked tiles per QA-PERM-002), count-up animation and its reduced-motion fallback, chart rendering, low-stock/recent-orders list links to the correct destination pages.

### QA-CLIENT — Client Businesses

Covers: search/filter correctness, drawer open/close, approve/reject only reachable for pending + Owner (`QA-PERM-001`/`002` already cover the gate; this section covers the underlying workflow correctness — e.g. approving a business actually flips its status and removes it from "Pending" filters), order/payment history empty states.

### QA-DISC — Discount & Credit

Covers: tier percentage edits persist (in mock state) and apply; credit-limit edits are rejected (UI-level) for non-owner even if attempted via unexpected input; min-order display per tier is correct.

### QA-STOCK — Stock Management

Covers: restock entry updates stock quantity correctly; stock correction delta (positive and negative) updates quantity correctly and never allows negative resulting stock; reason field is genuinely required (empty/whitespace-only reason blocks save).

### QA-ORD — Order Queue

Covers: every FRD §7 transition reachable from the UI produces the correct next status; an invalid transition is not offered as an option at all (not just rejected after the fact); picking-slip/dispatch flow connects correctly to Delivery Management.

### QA-CAT — Product Catalogue (Admin)

Covers: add/edit/archive a product; bulk import validation preview correctly separates valid from invalid rows (`FR-MIG-02`); no image upload field exists anywhere; Individual/Bulk purchase-type field is settable and matches what the website's catalogue toggle expects (`FR-CAT-08`).

### QA-DLV — Delivery Management

Covers: assignment of a packed order to a delivery worker; delivered/failed recording with required fields; cash-collected figure feeds correctly into whatever the Accounting phase will later read.

### QA-STAFF — Staff Management

Covers (Owner only, per QA-PERM-001): add/deactivate staff; role assignment; deactivating a staff member doesn't erase their name from historical attribution on already-confirmed orders/entries (`FR-STF-03`).

### QA-ACC — Accounting & Reporting

Covers (Owner only): expense entry across all categories in `AC-01`; report date-range filtering; export buttons produce the expected format (or a clear "not yet wired to a real export" state if still mocked); every figure traces to a source record (`FR-ACC-06`).

### QA-AUDIT — Audit Log

Covers (Owner only): filter by actor/action/date; log entries generated by earlier phases' mock actions (approvals, tier changes, corrections) actually appear here, rather than the log being populated from disconnected fixture data.

### QA-SET — Settings

Covers (Owner only): minimum-order rule configuration, delivery zone/charge configuration; confirm the shape of these settings matches what the website's checkout validation (`docs/website/phases.md` Phase 7) already assumes — a mismatch here is a cross-app consistency defect, not just an admin-side bug.

---

## 13. Responsive and Visual QA

Lower priority than the website spec (this is a back-office tool, primarily used on desktop/laptop), but not skipped:

- Test at 1280×720, 1366×768, 1440×900, 1920×1080 at minimum.
- Test at 768×1024 (tablet) since a shop owner might reasonably check the dashboard on a tablet.
- Full mobile-width (360–430px) testing is a **Should**, not a **Must**, for v1 of the admin panel — document as an accepted limitation if not fully covered, rather than silently skipping without a note.
- Sidebar must not overlap content at any tested width; tables should scroll horizontally rather than break layout on narrower widths.

---

## 14. Accessibility QA

Same baseline as `docs/website/qa_testing.md` §26, with one specific carry-over defect to verify closed: **icon-only buttons in admin tables must have `aria-label`s** — this was an open P2 item on the website's own QA report for admin-adjacent components, and should be verified fixed here rather than re-opened as a fresh finding.

- Keyboard journey: Dashboard → Client Businesses → open drawer → close drawer (Escape) → Discount & Credit → edit a tier → Stock Management → attempt a gated correction as non-owner → Order Queue → action a transition.
- Focus management on drawer/modal open and close (focus moves in, returns to trigger on close).
- WCAG AA contrast on tables, badges, and locked/blurred states (a blurred owner-only value should still be distinguishable as "present but hidden" rather than ambiguous).

---

## 15. Motion QA

Per `architecture.md` §7 — this section is intentionally shorter than the website's, because the animation surface is smaller:

- Row fade-in (300ms), toast slide-in (200ms), count-up (700ms, ease-out) all present and correctly scoped.
- No GSAP, no scroll-driven motion, no 3D anywhere in `apps/admin` — if found, that's a scope deviation from the reviewed design, flag it.
- `prefers-reduced-motion` removes/minimizes the count-up and row-fade; no required information depends on the animation completing.

---

## 16. Security and Privacy QA

Same framework as `docs/website/qa_testing.md` §30, admin-specific instances:

### QA-SEC-001 — Secrets

Search for private keys, service-role keys, database URLs, tokens, real staff/customer information. Any confirmed exposure is Critical.

### QA-SEC-002 — Authorization claims

Client-side role checks (§11 above) are UX only. Code/comments must not claim they constitute production authorization. Server-side enforcement remains a documented requirement (`FR-SEC-01`).

### QA-SEC-003 — Development controls

The dev-only "Viewing as" role switcher must not render when `NODE_ENV === "production"` — verify this directly, don't assume the `architecture.md` §5 guidance was followed just because it's documented.

### QA-SEC-004 — Direct access

Changing an order/client ID in the URL fails safely; one mock client business's data is not casually reachable by guessing another's ID.

---

## 17. Automated Checks

Same discipline as `docs/website/qa_testing.md` §32 — use the repo's actual package manager, don't assume a testing framework needs installing, and at minimum have runnable checks for: credit-limit-minus-outstanding-balance math, discount tier percentage application, stock-correction quantity delta (including the negative-stock guard), and order state-transition validity.

---

## 18. Mandatory Regression Smoke Suite

Run after every significant QA fix and once more before final approval.

### SMOKE-01 — Owner full walkthrough

Dashboard → Client Businesses (approve a pending account, change a tier) → Discount & Credit (edit a tier, edit a credit limit) → Stock Management (log a restock, log a correction) → Order Queue (confirm an order, approve a Pending Owner Approval order) → Staff/Accounting/Audit Log/Settings (all accessible).

Expected: every action succeeds, every owner-only page is reachable.

### SMOKE-02 — Admin/Operator boundary walkthrough

Same walkthrough as SMOKE-01, as Admin/Operator.

Expected: order confirm, routine restock, catalogue edits, and discount-tier changes all succeed; account approval, credit-limit edit, stock correction, and the four full-page-block routes are all correctly refused with clear messaging — not silently broken, not silently allowed.

### SMOKE-03 — Order state machine

Attempt every valid and at least one invalid transition per FRD §7.

Expected: valid transitions succeed and are reflected immediately in the queue; invalid transitions are not offered as options.

### SMOKE-04 — Reduced motion

Repeat SMOKE-01's Dashboard and Stock Management steps with reduced motion enabled.

Expected: no required information or action depends on animation completing.

---

## 19. Final QA Report Format

Same structure as `docs/website/qa_testing.md` §36 (Executive Result, Automated Validation, Coverage Summary, Defects, Fixes Made, Deferred Production Requirements, Final Recommendation) — reuse that template directly rather than inventing a new one, adding one extra subsection specific to this app:

### 19.1 Permission Boundary Summary (required, admin-specific)

A table listing all ten pages, their gating treatment (full-page/section/action/none), and a Pass/Fail for both the under-blocking check (§11 QA-PERM-001/002/004/005) and the over-blocking check (§11 QA-PERM-003) — this is the one section of the report that cannot be summarized as a count; list every page by name.

Never state "production-ready" based only on this frontend QA pass — identical rule to the website spec.

---

## 20. Ready-to-Use QA Agent Instruction

```text
Test the complete Raza Stationers admin panel in apps/admin using docs/admin/qa_testing.md.

First read .agents/AGENTS.md, PRD.md, BRD.md, FRD.md, TRD.md, docs/admin/architecture.md, docs/admin/phases.md, and this file. Inspect the repository with /graphify and analyze proposed QA changes with /ponytail.

Start with read-only inspection. Record current Git state. Identify the package manager and existing test scripts. Do not install new testing frameworks or modify application code during the initial pass.

Treat the Owner-only vs. Admin-allowed permission boundary as this app's highest-severity test category — verify every full-page block, section-level gate, and action-level gate from both the under-blocking and over-blocking direction, for every relevant role, per section 11.

Execute the static/architectural checks (including confirming no @raza-stationers/db dependency and no admin route inside apps/web), the production build, required automated checks, all per-page functional tests, the permission boundary tests, responsive testing, keyboard testing, reduced-motion testing, and the mandatory regression smoke suite.

Use fake data only. Treat credit, discount, stock-correction, and order-state-transition logic as high-risk rules requiring runnable checks.

For every failure, create a defect entry using docs/website/qa_testing.md's template and attach reproducible evidence. Do not silently fix business-rule or permission-boundary conflicts — present findings and a minimal fix plan first, and wait for approval before applying fixes.

After approval, apply only the approved fixes using the smallest correct diff. Rerun the failed test and the smoke regression suite. Update Graphify.

Do not build the backend, mobile app, or make further changes to apps/web. Do not commit, push, or deploy unless explicitly requested. Do not claim the system is production-ready.

Finish with the complete QA report defined in section 19, including the required Permission Boundary Summary.
```

---

## 21. Approval

Review whenever: PRD/BRD/FRD/TRD business rules change, the admin route structure changes, the backend is connected, authentication becomes real, or admin implementation moves toward production.

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Project owner/student | | | | |
| Business owner/reviewer | | | | |
| QA reviewer | | | | |
