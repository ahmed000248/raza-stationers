# UI Implementation Phases — Admin Panel (`apps/admin`)

**Version:** 1.0
**Companion to:** `architecture.md` (structure/conventions), `TRD.md` v1.4, `FRD.md` v1.2, `BRD.md` v1.1, `docs/website/phases.md` (the customer-site equivalent this document mirrors)
**Scope:** admin panel only. The customer website is already built and QA-passed — nothing in this document touches `apps/web`.

---

## 0. Ground rules (identical to the website's, restated because this is a standalone document)

1. **One phase at a time.** Do not start a phase's code until it's explicitly approved.
2. **Every phase starts with a written plan, not code.** Use the template in §2. Present it, stop, wait for approval.
3. **Phases are sequential and cumulative.** Phase 4 (Discount & Credit) assumes Phase 1 (shell) exists and is approved.
4. **Reference `architecture.md`, don't re-derive it.** The Owner/Admin gating pattern, design tokens, and animation posture are already decided there.
5. **Every phase plan names the FRD/BRD rule IDs it implements** — especially which of §4's three gating treatments (full-page block, section-level gate, action-level gate) applies to each piece of the page.
6. **Every phase's plan states whether the page matches its reviewed `.dc.html` design 1:1, or deviates — and if it deviates, why.** Two of these ten pages already needed a correction after review (`DiscountCredit`, `StockManagement`) — the design is a strong reference, not an infallible one, so this isn't a rubber-stamp step.

---

## 1. Graphify and Ponytail (same discipline as the website build)

`graphify query "<thing>"` before writing anything new — this matters even more here than it did for the website, because `apps/admin` can now reuse real, already-built things from two places: `@raza-stationers/ui` and, for patterns (not code — see `architecture.md` §0), `apps/web`. Check both before writing a new component. `graphify --update` after each phase.

Ponytail (already governing this repo via `.agents/AGENTS.md`, default **full**) applies with one admin-specific emphasis: **reuse `@raza-stationers/ui` before reaching for anything else.** If a phase's plan proposes a new local primitive that duplicates something already in `packages/ui` (a button variant, a card, a tab), that's a rung-2 miss ("already in this codebase? reuse it") — flag it and use the shared one instead.

---

## 2. The per-phase ritual

| Step | Action |
|---|---|
| 1. Check before building | `graphify query "<phase's components>"` — confirm what's already in `@raza-stationers/ui` or elsewhere in `apps/admin`. |
| 2. Plan | Use the template below. No code yet. |
| 3. **Approval gate** | Present the plan. Stop. Wait for explicit go-ahead. |
| 4. Motion pass (if applicable) | Per `architecture.md` §7 — most admin phases need only the CSS/Framer Motion tier; invoke `design-motion-principles` Create mode only for anything beyond a toast/drawer/count-up. |
| 5. Build | Reuse `@raza-stationers/ui` primitives; smallest correct diff. |
| 6. Self-check | Per `architecture.md` §9 — money/rule logic gets one runnable check; negative-role tests for every gated action. |
| 7. Sync the graph | `graphify --update`. |
| 8. **Review gate** | Present what was built. Wait for approval before the next phase. |

### Implementation plan template

```
## Phase N: <name>

**Goal:** <one line>
**Depends on:** <prior phases>
**Reviewed design:** Design/RazaStationersAdmin/<Page>.dc.html — matches 1:1 / deviates because <reason>
**FRD/BRD rules implemented:** <IDs>
**Gating treatment:** full-page block / section-level gate / action-level gate / none — per architecture.md §4

**Files to create/touch:**
- path — what it does

**@raza-stationers/ui components reused:** <list — if a new local component is proposed instead, justify why packages/ui doesn't already cover it>

**Data shape used:** <@raza-stationers/types entities, mock fixture if needed>

**Definition of done:**
- [ ] ...
```

---

## 3. Animation — the standing default (lighter than the website, per architecture.md §7)

Every table row gets a fade-in on population (`rowFade`, 300ms), every toast slides in (`toastIn`, 200ms) and auto-dismisses at 3s, every modal/drawer uses `@raza-stationers/ui`'s `Dialog`/`Sheet` as-is. Dashboard KPI tiles count up on load (ease-out cubic, ~700ms). Nothing beyond this without a specific reason named in that phase's plan — this is a data-entry tool for daily use by the same few people, and per `design-motion-principles`' own frequency gate, high-frequency contexts get the least decoration.

---

## 4. Phases

### Phase 0 — Shared Shell Verification

**Goal:** confirm `packages/ui` design tokens render correctly inside `apps/admin` before any real page exists — the admin equivalent of the website's Phase 0, but shorter since the tokens are already built and shared, not authored fresh here.
**Depends on:** nothing (first phase).
**Covers:** verify `globals.css`'s import of `packages/ui/src/styles/tokens.css` resolves correctly (colors, Poppins/Unbounded/Noto Nastaliq Urdu fonts, radius scale) on the current placeholder page; confirm no `.glass` utility is present or reachable.
**Definition of done:** the placeholder page visibly renders in the correct palette/fonts; no components built yet.

**Approval gate before Phase 1.**

---

### Phase 1 — Core Admin Shell

**Goal:** the sidebar nav, top bar, and role-gating infrastructure every subsequent page depends on.
**Depends on:** Phase 0.
**FRD/BRD rules:** FRD §5 Role & Permission Matrix (the whole point of this phase), NA-03 (bilingual — sidebar shows "Admin Panel · انتظامی پینل" per the reviewed design).

**Covers:**
- `components/shell/AdminNav.tsx` — the 240px sticky sidebar, nav items with the 🔒 lock indicator for owner-only items when viewed as a non-owner role, matching the reviewed design exactly.
- `components/shell/TopBar.tsx` — search input, notification bell, avatar.
- `lib/role.ts` — `isOwner`, `isAdminOperator`, and any other role predicates used throughout the app. Every later phase imports from here; no component re-types `role !== 'owner'` inline.
- The dev-only "Viewing as" role switcher (per `architecture.md` §5) — gated behind `NODE_ENV`, exactly like the website's sign-in role switcher fix.
- Root `layout.tsx` wires `AdminNav` + `TopBar` around `{children}`.

**Definition of done:** every route (even placeholder ones) renders inside the shell; switching the dev-only role selector correctly locks/unlocks nav items and fires the "Owner only" toast on a locked item click, matching the reviewed design's `onClick` behavior exactly.

**Approval gate before Phase 2.**

---

### Phase 2 — Dashboard

**Goal:** the landing page.
**Depends on:** Phase 1.
**FRD/BRD rules:** `FR-DSH-01` (pending orders, low-stock, pending approvals, overdue payments, today's sales), `FR-DSH-02` (Client Businesses metrics), `SK-03`, `PY-02`.
**Gating treatment:** section-level gate — "Wholesale Approvals" and "Overdue Payments" tiles are blurred/hidden for non-owner, per the reviewed design and `FR-CB-02`/`FR-PAY-01` being owner-only data.

**Covers:** 6 KPI tiles with count-up animation, sales-trend line chart, category bar chart, low-stock list, recent-orders list — all per `Dashboard.dc.html`.

**Definition of done:** non-owner role correctly sees blurred/locked values on the two owner-only tiles (not just visually dimmed — the underlying count should not be computed/shown); count-up respects `prefers-reduced-motion`.

**Approval gate before Phase 3.**

---

### Phase 3 — Client Businesses

**Goal:** the core wholesale-customer management screen — arguably the most important page in the whole panel, given BRD §15 names Client Business Management a core, first-release feature.
**Depends on:** Phase 1.
**FRD/BRD rules:** all of BRD CB-01 to CB-08, `FR-CB-01` to `FR-CB-09`.
**Gating treatment:** section-level gate — per the reviewed (and already-correct) design: account approval and credit-limit/payment-history viewing are owner-only; discount/tier assignment is open to both Owner and Admin.

**Covers:** searchable/filterable client list, the client detail drawer (approve/reject for pending accounts, tier select + apply, credit limit & balance, order history, payment history) — per `ClientBusinesses.dc.html`.

**Definition of done:** an Admin-role view can change a client's discount tier but cannot approve a pending account or see payment history (locked message shown instead, not a hidden section with no explanation); every approve/reject/tier-change fires a toast, worded to reflect audit logging per the reviewed design.

**Approval gate before Phase 4.**

---

### Phase 4 — Discount & Credit

**Goal:** tier percentages and per-client credit limits.
**Depends on:** Phase 3 (shares the client list data).
**FRD/BRD rules:** `FR-PRC-02`, `FR-PRC-03`, `FR-PRC-05`, `PY-01`, `FR-PAY-01`, `FR-PAY-04`.
**Gating treatment:** section-level gate, per the corrected design — discount tiers are open to both Owner and Admin (no page-level block); credit limits are visible to both but only editable by Owner, with a "🔒 OWNER ONLY" pill and a read-only display for non-owner.

**Covers:** the 4-tier discount grid with % inputs and "Save tier changes"; the "Credit limits by client" table with owner-only edit — per the corrected `DiscountCredit.dc.html`. **This page's design was already sent back once for over-blocking Admin entirely — build it against the corrected version, and if anything in this phase's plan would re-introduce a full-page block, stop and flag it rather than build it.**

**Definition of done:** an Admin-role view can edit discount percentages and save them; the same view sees credit limits as read-only text, not hidden.

**Approval gate before Phase 5.**

---

### Phase 5 — Stock Management

**Goal:** routine restocking plus the owner-only correction/adjustment path.
**Depends on:** Phase 1.
**FRD/BRD rules:** `FR-STK-01` to `FR-STK-07` (all of them — this is the one page where all seven apply).
**Gating treatment:** action-level gate, per the corrected design — "Log Restock" is open to Admin and Owner; "Stock Correction" is Owner-only (dimmed for non-owner, blocked with a toast on click, not silently disabled).

**Covers:** low-stock table, recent stock entries (tagged Restock/Correction via badge), the Restock modal (product, qty, cost, supplier), and the Stock Correction modal (product, quantity delta, required reason, Save disabled until both are filled) — per the corrected `StockManagement.dc.html`. **Same note as Phase 4: this page's design was already corrected once for missing `FR-STK-07` entirely — build against the corrected version.**

**Definition of done:** a correction cannot be saved without a reason; the entries list visibly distinguishes corrections from restocks; the confirmation toast for a correction reads "written to audit log", matching the reviewed design.

**Approval gate before Phase 6.**

---

### Phase 6 — Order Queue

**Goal:** the admin side of the order lifecycle — confirm, reject, request changes, dispatch.
**Depends on:** Phase 1.
**FRD/BRD rules:** `FR-ORD-01` to `FR-ORD-08`, the full state machine in FRD §7, `FR-CRT-04`/§9 (Pending Owner Approval sub-state for over-limit Pay Later orders).
**Gating treatment:** section-level gate — order confirm/reject/dispatch is Admin-and-Owner; anything reaching **Pending Owner Approval** status can only be actioned by Owner (per `FR-CRT-04`, `§9`), same pattern as the Client Businesses approval gate.

**Covers:** order queue table (status, customer/business, total, payment method), per-order action panel following the exact state-machine transitions in FRD §7 — no status change outside the whitelisted `from → to` pairs. Per `OrderQueue.dc.html`.

**Definition of done:** attempting an invalid status transition is blocked in the UI (not just theoretically possible); a Pending Owner Approval order shows the approve/reject action only to the Owner role.

**Approval gate before Phase 7.**

---

### Phase 7 — Product Catalogue (Admin)

**Goal:** product/category management and bulk import — the admin-side counterpart to the customer site's read-only catalogue.
**Depends on:** Phase 1.
**FRD/BRD rules:** `FR-CAT-01` to `FR-CAT-08` (including the Individual/Bulk purchase-type field and the no-photography rule — this page manages the same `Product` entity the website reads, so it must stay consistent with `packages/types`), `FR-MIG-01` to `FR-MIG-04` (bulk CSV/Excel import with a validation-preview step).
**Gating treatment:** none at the page level — catalogue management is Admin-and-Owner per FRD §5.

**Covers:** product table (add/edit/archive), category management, the bulk-import flow (upload → validation preview → confirm) — per `ProductCatalogue.dc.html`.

**Definition of done:** the bulk-import preview correctly reports invalid rows without blocking valid ones (`FR-MIG-02`); no image-upload field exists anywhere on this page, consistent with the no-photography rule.

**Approval gate before Phase 8.**

---

### Phase 8 — Delivery Management

**Goal:** dispatch assignment and delivery outcome recording.
**Depends on:** Phase 6 (shares confirmed/packed orders).
**FRD/BRD rules:** `FR-DLV-01` to `FR-DLV-05`, `ST-02`.
**Gating treatment:** none at the page level — Admin-and-Owner per FRD §5.

**Covers:** assignment of a packed order to a delivery worker, dispatch/delivered/failed recording with required fields (cash collected, failure reason, returned items) — per `DeliveryManagement.dc.html`.

**Definition of done:** a failed delivery requires a reason; a delivered order requires the collected-amount field to be present when payment method is cash/partial.

**Approval gate before Phase 9.**

---

### Phase 9 — Staff Management

**Goal:** staff accounts.
**Depends on:** Phase 1.
**FRD/BRD rules:** `FR-STF-01` to `FR-STF-04`, `ST-01`, `ST-03`.
**Gating treatment:** full-page block — Owner-only, per the reviewed design and BRD §5 (staff account management is explicitly Owner-reserved).

**Covers:** staff list, add/deactivate staff account, role assignment (Admin/Operator, Packing, Delivery) — per `StaffManagement.dc.html`. No individual login is ever shared between staff members (`ST-03`).

**Definition of done:** non-owner sees the full-page "Owner only" block, not a partially-rendered table; deactivating a staff account doesn't delete their historical attribution on past confirmed orders/entries.

**Approval gate before Phase 10.**

---

### Phase 10 — Accounting & Reporting

**Goal:** financial reports.
**Depends on:** Phase 1.
**FRD/BRD rules:** `FR-ACC-01` to `FR-ACC-06`, `AC-01` to `AC-03`.
**Gating treatment:** full-page block — Owner-only, per the reviewed design and BRD §5/`AC-02` ("the Admin/Computer Operator does not have access to this section").

**Covers:** expense entry form (editable categories per `AC-01`), report views (sales, credit, stock value, top products/customers, cash-per-delivery-worker) with date-range selection and export (Excel/PDF per `FR-ACC-04`) — per `AccountingReporting.dc.html`.

**Definition of done:** every figure traces to a source (order, restock entry, or manual expense entry) per `FR-ACC-06` — no report value invented without a backing mock record; non-owner sees the full-page block.

**Approval gate before Phase 11.**

---

### Phase 11 — Audit Log

**Goal:** the append-only log view.
**Depends on:** Phase 1 (structurally independent of other data phases, but only meaningful once other phases are producing loggable actions).
**FRD/BRD rules:** `FR-SEC-02`, `FR-SEC-03`.
**Gating treatment:** full-page block — Owner-only, per the reviewed design and FRD `FR-SEC-03` ("the audit log is Owner-only in v1 — Admin has no access, even though many logged actions are ones Admin performed").

**Covers:** filterable log table (actor, action type, date range), per `AuditLog.dc.html`. Since a real backend doesn't exist yet, this phase's mock data should include entries generated by the mock actions built in earlier phases (approvals, tier changes, stock corrections) so the log isn't populated with disconnected fixture data.

**Definition of done:** filtering by actor/action/date works against the mock log; non-owner sees the full-page block.

**Approval gate before Phase 12.**

---

### Phase 12 — Settings

**Goal:** business-wide configuration.
**Depends on:** Phase 1.
**FRD/BRD rules:** the "change business settings" row in FRD §5 (Owner-only), `OF-01` (minimum-order rules), `OF-04` (delivery zones/charges).
**Gating treatment:** full-page block — Owner-only, per the reviewed design and FRD §5.

**Covers:** minimum-order configuration (amount/quantity/pack-only/free-delivery threshold), delivery zone management (cities, charges, manual-confirmation areas) — per `Settings.dc.html`. These are the same rules the website's Checkout phase (`docs/website/phases.md` Phase 7) enforces at checkout time — this page is where an Owner would actually set the values Checkout reads, so the two should agree on shape (reuse `@raza-stationers/types` / `@raza-stationers/validation` definitions, don't invent a parallel settings shape).

**Definition of done:** non-owner sees the full-page block; the settings shape here is the same one the website's checkout validation already assumes, not a redefinition.

**Approval gate before Phase 13.**

---

### Phase 13 — Cross-Cutting Polish & Audit Pass

**Goal:** close the loop across Phases 0–12.
**Depends on:** all prior phases.

**Covers:**
- `ponytail-audit` (whole-repo) across `apps/admin` — with particular attention to whether any phase quietly duplicated something already in `@raza-stationers/ui` instead of reusing it.
- A full negative-role pass: attempt every owner-only action (approve, reject, adjust credit limit, stock correction, view accounting/audit-log/staff/settings) as Admin/Operator and confirm each is blocked with the correct messaging, not just visually hidden.
- Accessibility pass, with explicit attention to the icon-only-button `aria-label` gap flagged in `architecture.md` §8.
- Bilingual label coverage check across all 10 pages.
- Confirm `apps/admin/package.json` still has no `@raza-stationers/db` dependency and no admin route has leaked into `apps/web`.
- Final `graphify --update`.

**Definition of done:** a punch list of findings, same format as the website's Phase 13, presented for final review.

---

## 5. What happens after Phase 13

Not covered by this document, and shouldn't start until it's finished and approved: wiring to a real backend (same open TRD §5 question as the website), and the mobile app (Phase 2 per PRD/BRD, not started).
