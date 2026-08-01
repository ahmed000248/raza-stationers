# Raza Stationers — Mobile Admin App: Design Generation Prompt

Paste this into Claude Design against the saved **raza-stationers-design-system**, same system used for `RazaStationersAdmin` (web) and the customer mobile app prompt above. This is the native mobile companion to the web admin panel — same brand tokens, same functional scope, restyled for one-handed, on-the-go staff use rather than a desktop-density reflow.

## Design system to reuse (do not invent new tokens)

- **Fonts:** Poppins (body), Unbounded (headings), Noto Nastaliq Urdu (Urdu text) — identical to both other apps.
- **Color tokens:** same ink/evergreen/canvas/amber palette. **Do not use the `.glass` utility here** — it's customer-facing only; the admin surface (web and mobile alike) stays flat/solid.
- **Radius scale:** 12 / 16 / 999px, matching the web admin panel.
- **Motion:** CSS + light native transitions only, same restrained posture as the web admin panel — no GSAP/3D, this is an operations tool.
- **Accessibility carry-over:** the web admin panel has a known icon-button `aria-label` gap flagged in `docs/admin/architecture.md` — do not repeat it here; every icon-only tap target needs an accessible label from the start.

## Platform, roles, and navigation shape

Native mobile (iOS/Android). This app serves **Owner, Admin/Operator, Packing Worker, and Delivery Worker** — the same four staff roles as the web admin panel — but a given staff member only sees the tabs/screens their role covers. Bottom tab bar, role-dependent:

- **Owner / Admin:** Dashboard, Orders, Stock, Clients, More (Catalogue, Staff, Accounting, Audit Log, Settings, Delivery all live under More for these roles, since they're secondary to day-to-day order/stock work).
- **Packing Worker:** Orders (filtered to confirmed/packing-relevant), Stock (view-only unless also granted entry rights).
- **Delivery Worker:** **My Deliveries** as the primary and often *only* tab — this role's whole reason for having the app.

Apply the same three-tier permission-gating pattern as the web admin panel, adapted to mobile: **full-page block** (tab/screen simply doesn't appear for that role), **section-level** (a card or panel within a screen is replaced with an "Owner-only" placeholder), **action-level** (a specific button is hidden or disabled with a short explanation). Never hide something silently — if a role can't do something, show why, matching the web app's precedent.

## Screens and workflow connections

### 1. Sign In / Role Landing
Mobile-number + password, same demo auth mechanism as the customer app and web admin panel. On success, route straight to the role-appropriate default tab (Delivery Worker → My Deliveries; everyone else → Dashboard). No dev-only role switcher in a real build — that was a web-admin build-time convenience only, not a production pattern.

### 2. Dashboard (Owner/Admin)
KPI cards (today's orders, revenue, low-stock count, pending approvals) as a swipeable/stacked card set rather than the web's grid, since there's no room for six tiles side by side. Owner-only figures (revenue, credit exposure) render as blurred/locked cards for Admin, matching the web panel's section-level gating exactly. Tapping a KPI card drills into the relevant list (e.g., low-stock count → Stock, filtered). Equivalent of admin web Phase 2.

### 3. Client Businesses (Owner/Admin)
List of client businesses with account-status chips (pending/active/suspended/blocked), search/filter. Tapping a row opens a detail screen: business info, discount tier, credit summary, order history. Approval actions (approve/reject a pending business, set credit limit/status) are Owner-only — Admin sees the same detail screen with those specific controls replaced by a locked state, not a different screen. Discount tier assignment stays open to Admin. Equivalent of admin web Phase 3.

### 4. Discount & Credit (Owner/Admin)
Per-business discount tier view and the account-wide/category/product override list. Credit-limit editing and credit-status changes are Owner-only (locked for Admin); discount percentage assignment is Admin-allowed. Every change shows the change-log (previous value, new value, who, when, reason) inline, not buried in a separate audit screen. Equivalent of admin web Phase 4.

### 5. Stock Management (Owner/Admin/Packing, with restrictions)
Stock list with live status (In Stock/Low Stock/Out of Stock), search/filter by category. A "Log Restock" action (product, quantity, supplier, purchase price, invoice number, purchase date) is open to Admin and Packing with entry rights. A separate "Stock Correction" action — **Owner-only, mandatory reason field, always audited** — is visually distinct (different color/icon) from routine restock so nobody confuses the two, matching the web panel's existing action-level gating precedent exactly. Equivalent of admin web Phase 5.

### 6. Order Queue (Owner/Admin/Packing)
Filterable list by status (Pending Review, Confirmed, Packed, Out for Delivery, etc.). Tapping an order opens a full-screen detail (not a side drawer — no room on mobile) showing items, customer, totals, and the available status actions for that role: Admin confirms/rejects/packs/dispatches; Packing Worker marks picked-and-packed; a credit order that's gone over-limit shows a clear "Pending Owner Approval" state, actionable only by Owner. A packed order can be cancelled only with Owner/Admin approval, requiring a reason, and the screen must show that this reverses stock and any related financial records — make that consequence visible in the confirmation step, not just a silent toggle. Equivalent of admin web Phase 6.

### 7. Product Catalogue (Owner/Admin)
Search/browse/edit products — name, bilingual name, shop name, category, description, wholesale/retail/buying price (buying price Owner-only, visually distinct from the other two), units, SKU. Given file-picker and multi-step review UX doesn't translate well to a phone screen, **design the bulk-import flow as view-only here** (see an import batch's status/progress/results) with the actual file upload and row-by-row review happening on the web admin panel — call this out as an explicit, deliberate mobile/web split, not a missing feature. Equivalent of admin web Phase 7.

### 8. Delivery Management — the Delivery Worker's primary screen
This is the flow this whole app exists for. Two views on one dataset:
- **"My Deliveries" (Delivery Worker's own view):** a simple list of deliveries assigned to *them only* — never someone else's. Tapping one shows the order's delivery address, items, payment method (so they know whether to collect cash), and status actions: Dispatched → Delivered (record delivery time, cash collected if COD) or Failed (required reason field) or Returned. This directly implements the confirmed decision that delivery workers get real, scoped self-service on their own assignments — not admin entering it on their behalf.
- **"All Deliveries" (Owner/Admin view):** every assignment, with the ability to review, correct/override a status, and reassign a delivery to a different worker. Every override records who made it and when, same as the web panel.
Equivalent of admin web Phase 8, now meaningfully expanded since this decision was made after the web admin panel was originally built.

### 9. Staff Management (Owner-only)
Full-page block for every other role — the whole tab doesn't appear for Admin/Packing/Delivery, matching the web panel's precedent exactly. Owner sees staff list, add/deactivate actions (deactivate, never delete, preserving attribution on historical records), and role assignment. Equivalent of admin web Phase 9.

### 10. Accounting & Reporting (Owner-only)
Full-page block for everyone else. Owner sees summary reports (sales, payments, cash vs. credit, outstanding balances, overdue accounts, estimated margin, stock value, top products/customers, low-stock list, cash collected per delivery worker) as mobile-friendly charts/summary cards rather than dense tables — this is the screen most worth simplifying for a small display, favoring "glance at the number" over "read every row." Equivalent of admin web Phase 10.

### 11. Audit Log (Owner-only)
Full-page block for everyone else. Searchable/filterable list of sensitive actions (actor, action type, entity, before/after, timestamp) — a simple reverse-chronological feed with filters, not the web panel's denser table. Equivalent of admin web Phase 11.

### 12. Settings (Owner-only, mostly)
Delivery zone configuration (the confirmed Wah Cantt/Hassanabdal/Taxila free-zone, Rawalpindi/Islamabad charged-zone split, with charge amounts once set), business info, and any account-level configuration. Equivalent of admin web Phase 12.

## Cross-cutting requirements (apply to every screen)

- Every Owner-only vs. Admin-allowed distinction from the web admin panel must carry over exactly — do not loosen or tighten any permission boundary just because it's a smaller screen.
- Every stock correction, cancellation, override, and approval action requires its reason/actor/timestamp to be visible in the confirmation step, not just logged invisibly.
- Buying price is never shown to a role other than Owner, anywhere in this app, including in any export/share action.
- No product photography — same description/icon-based catalogue as the web panel and customer app.

## What NOT to design (explicitly out of scope for this pass)

- Any customer-facing screens — those belong to the separate customer mobile app prompt.
- GPS/live location tracking for delivery workers (Phase 2+, not v1).
- Full bulk-import file upload/row review UI (deliberately kept on web, see Product Catalogue above).
- Supplier/purchase-order management, multi-warehouse selection, or return/refund processing UI beyond what the web admin panel already defines for v1.
