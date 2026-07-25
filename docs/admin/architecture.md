# Frontend Architecture Reference (Admin Panel)

## Raza Stationers — `apps/admin`

**Version:** 1.0
**Companion to:** `phases.md` (execution order), `TRD.md` v1.4 (system-wide architecture), `docs/website/architecture.md` (the customer-site equivalent this document mirrors)
**Scope:** this document only covers `apps/admin`. It assumes `apps/web` and `packages/ui`/`types`/`api`/`validation` already exist and are stable.

---

## 0. How this differs from the website's architecture.md

Same purpose, same companion relationship to its own `phases.md`, same rule: read once before Phase 0, reference sections as needed, don't re-read end to end every session. Three things are genuinely different here and worth stating up front rather than repeating website reasoning that no longer applies verbatim:

1. **`apps/admin` is a separate Next.js app, not a route inside `apps/web`.** This was a real incident on this project — an earlier pass built a full admin dashboard at `apps/web/src/app/admin` with zero design review and zero auth gate, reachable by anyone on the public site. It was removed. `apps/admin` now exists as its own app specifically so that mistake can't recur structurally: it has its own deployment, its own `package.json` (no `@raza-stationers/db` dependency, same rule as `apps/web`), and nothing about it ships inside the customer-facing bundle.
2. **Shared components come from `@raza-stationers/ui`, not a local copy.** `apps/web` has its own `components/ui` and `components/motion` (pre-dating this package); `apps/admin` is built against `packages/ui` from its first line of code, since duplicating a second local shadcn install here would be exactly the drift `packages/ui` exists to prevent.
3. **The animation posture is deliberately lighter.** The reviewed and approved admin design (`Design/RazaStationersAdmin/*.dc.html`) uses plain CSS keyframes (toast slide-in, row fade-in, a count-up on dashboard tiles, a bar-height transition) and nothing else — no GSAP, no scroll-driven motion, no 3D. That's not a gap to fill in later; it's the correct choice for a data-entry tool per `.agents/skills/design-motion-principles`' own project-type weighting (SaaS dashboard → Emil-restraint primary, Jakub secondary, Jhey selective on empty states only). `apps/admin` does not need the GSAP bundle, Three.js, Anime.js, or Lenis that `apps/web` installed for its hero — don't add them.

---

## 1. Monorepo context

```
raza-stationers/
├── apps/
│   ├── web/            # customer website — stable, QA-passed, not part of this build
│   ├── admin/            # THIS DOCUMENT — scaffolded (config + placeholder page only)
│   ├── mobile/             # placeholder
│   └── api/                # not yet scaffolded — see TRD §5 open architecture question
├── packages/
│   ├── types/         # @raza-stationers/types — shared domain types (already correct, includes ClientBusiness, StockMovement, etc.)
│   ├── api/             # @raza-stationers/api — HTTP client; apps/admin calls this, never packages/db directly
│   ├── db/                # backend-only — apps/admin must never depend on this, same rule as apps/web
│   ├── validation/          # Zod schemas — reuse for admin forms (discount tiers, stock corrections, staff accounts) rather than hand-rolling validation
│   └── ui/                    # shared shadcn primitives + design tokens — apps/admin's primary UI dependency
└── docs/
    ├── PRD.md / BRD.md / FRD.md / TRD.md
    ├── website/
    └── admin/          # this file + phases.md + qa_testing.md
```

`apps/admin/package.json` depends on `@raza-stationers/types`, `@raza-stationers/api`, `@raza-stationers/ui`. It does not and must never depend on `@raza-stationers/db` — this is enforced the same way it now is for `apps/web`, and should be one of the first things any admin QA pass checks (mirroring `QA-ARCH-001` from the website spec).

---

## 2. `apps/admin/src` layout

Current state (scaffold only):

```
apps/admin/src/
├── app/
│   ├── layout.tsx      # fonts (Poppins/Unbounded/Noto Nastaliq Urdu, same as apps/web), imports globals.css
│   ├── page.tsx          # placeholder — "no admin pages built yet"
│   └── globals.css        # imports packages/ui/src/styles/tokens.css, admin-only base rules, NO .glass utility
```

Target layout, one folder introduced per phase in `phases.md`, mirroring the 10 reviewed design pages 1:1 (nothing invented beyond what was reviewed):

```
apps/admin/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # redirects to /dashboard, or dashboard lives at /
│   ├── dashboard/page.tsx          # Dashboard.dc.html
│   ├── client-businesses/page.tsx    # ClientBusinesses.dc.html
│   ├── discount-credit/page.tsx        # DiscountCredit.dc.html
│   ├── stock/page.tsx                    # StockManagement.dc.html
│   ├── orders/page.tsx                     # OrderQueue.dc.html
│   ├── catalogue/page.tsx                    # ProductCatalogue.dc.html
│   ├── delivery/page.tsx                       # DeliveryManagement.dc.html
│   ├── staff/page.tsx                            # StaffManagement.dc.html
│   ├── accounting/page.tsx                         # AccountingReporting.dc.html
│   ├── audit-log/page.tsx                            # AuditLog.dc.html
│   ├── settings/page.tsx                               # Settings.dc.html
│   └── globals.css
├── components/
│   ├── shell/           # AdminNav (sidebar), TopBar (search + notification bell + avatar) — admin's own nav shell, analogous to apps/web's components/site/ but not shared, since the sidebar layout is structurally different from the customer site's floating pill nav
│   ├── dashboard/          # KpiTile (with the owner-only blur/lock treatment), SalesChart, CategoryBars, LowStockList, RecentOrdersList
│   ├── clients/              # ClientRow, ClientDrawer (approve/reject, tier select, credit panel)
│   ├── discount/                # DiscountTierEditor, CreditLimitTable
│   ├── stock/                     # RestockModal, StockCorrectionModal, StockEntryRow
│   ├── orders/                      # OrderQueueTable, OrderStatusActions
│   ├── catalogue/                      # ProductTable, BulkImportPanel
│   ├── delivery/                         # DeliveryAssignmentTable
│   ├── staff/                              # StaffTable, StaffFormModal
│   ├── accounting/                           # ReportTable, ExpenseEntryForm, ExportButtons
│   ├── audit/                                  # AuditLogTable, AuditFilterBar
│   └── settings/                                 # SettingsForm
├── lib/
│   ├── role.ts             # role-check helpers (isOwner, canApprove, canAdjustCredit, etc.) — one place these predicates live, not re-derived per component
│   └── motion-tokens.ts      # re-export or thin wrapper around packages/ui's tokens if admin-specific timing constants are ever needed (unlikely — reuse packages/ui's CSS variables directly first)
└── content/
    └── mock/               # fixture JSON matching @raza-stationers/types, same pattern as apps/web/src/content/mock
```

**No `components/motion/` folder in `apps/admin`.** `FadeIn`, `StaggerList`, and `SkeletonBlock` already live in `@raza-stationers/ui` — import them from there. Do not recreate local copies the way `apps/web` currently has its own (pre-`packages/ui`) versions.

---

## 3. Design tokens

Identical palette, typography, and radius tokens to the website — this was verified directly against the reviewed `.dc.html` bundle, which imports the exact same `_ds` bundle as `Design/RazaStationersWebsite`. `apps/admin/src/app/globals.css` imports `packages/ui/src/styles/tokens.css` (the same file `apps/web` should eventually migrate to) and adds only what's genuinely admin-specific:

- No `.glass` utility. Confirmed from the reviewed design: the admin sidebar is solid `var(--ink-900)`, never translucent. If a future phase reaches for backdrop-blur on an admin surface, that's a deviation from the reviewed design, not a style choice — flag it rather than build it.
- A dark sidebar base (`--ink-900` background, white/`--sage-400` text) — this is the one structural layout difference from the website's light floating nav, and it's a fixed 240px-wide sticky sidebar per the reviewed design, not a pill-shaped floating nav.

---

## 4. The Owner-only vs. Admin-allowed gating pattern

This is the single most important pattern in this app — it's the reason the design went through a dedicated review pass (`DiscountCredit.dc.html` and `StockManagement.dc.html` were both sent back and corrected before this document was written). Every phase's plan must state, explicitly, which of these three treatments a page or section uses:

| Treatment | When to use | Reviewed-design precedent |
|---|---|---|
| **Full-page block** | The entire page has no Admin-relevant content at all | `AccountingReporting`, `AuditLog`, `Settings`, `StaffManagement` — non-owner sees a centered "Owner only" card with a link back to the dashboard, not the real page |
| **Section-level gate** | The page has both Owner-only and Admin-allowed content | `ClientBusinesses` (credit limit + payment history owner-only, discount tier assignment open to both), `DiscountCredit` after its fix (discount tiers open to both, credit limits owner-only-editable-but-visible), `Dashboard` (Wholesale Approvals / Overdue Payments tiles blurred for non-owner) |
| **Action-level gate** | The page is otherwise fully accessible, but one specific action is Owner-only | `StockManagement` after its fix ("Log Restock" open to both, "Stock Correction" dimmed + toast-blocked for non-owner) |

**Implementation rule:** every gate — at any of the three levels — is driven by `lib/role.ts` predicates (`isOwner(role)`, not an inline `role !== 'owner'` re-typed in every component), and every gated action that does fire for the Owner (approve, reject, adjust credit limit, record a correction) shows a toast confirming it, worded to reflect that it's logged where the FRD requires it (`FR-SEC-02`) — matching the reviewed design's existing pattern (e.g. "Wholesale account approved — written to audit log", "Stock correction recorded — written to audit log"). This is a real requirement, not decoration: it's the UI's way of making the audit-log rule visible to the person using it.

**This client-side gating is UX only.** Exactly as stated in the website's `qa_testing.md` `QA-SEC-002` and the FRD's `FR-SEC-01`: every one of these checks must be re-enforced server-side once a real backend exists. Nothing in `apps/admin` should be built or described in a way that implies the frontend check is the real security boundary.

---

## 5. Role switching (development only)

The reviewed design includes a persistent "Viewing as" role selector in the sidebar, used to preview Owner / Admin-Operator / Packing Worker / Delivery Worker states without four separate logins. This is a legitimate, already-approved design decision for a demo/portfolio build — but it must never ship as a real control in a production admin panel any more than the website's sign-in role switcher did (that one required a fix — see `docs/website/qa-report.md`). When this gets built, gate it the same way: `process.env.NODE_ENV !== "production"`, or — better, since a real admin panel legitimately might want a "view as" feature for support purposes later — clearly note in the phase plan whether this is a permanent, backend-verified feature or a demo-only convenience, and build it accordingly. Don't let it default to always-on without that decision being made explicitly.

---

## 6. State management and data strategy

Same call as the website, for the same reason (nothing in the TRD prescribes a library, nothing here needs one): React Context + `useReducer` for anything that needs to persist across an admin session (the current "viewing as" role during dev/demo, an open drawer's ID). No Zustand/Redux/Jotai here either.

Data strategy mirrors `docs/website/architecture.md` §6 exactly: `@raza-stationers/api`'s `RazaAPIClient` is the only thing admin pages call, mock fixtures in `src/content/mock` matching `@raza-stationers/types` stand in until `apps/api` exists, and business logic (credit availability, discount resolution, order state transitions) is never re-implemented in an admin component — it's the same `PricingService`/`CreditService`/`OrderStateMachine` logic the website consumes, just from the admin's side of the same rules.

---

## 7. Animation

Per §0's note: light by default.

- **CSS only** for: row fade-in on table population (`rowFade` keyframe, 300ms), toast slide-in (`toastIn`, 200ms), notification badge pulse.
- **Framer Motion** (already a dependency, via `@raza-stationers/ui`'s `Dialog`/`Sheet`/`ToastContainer`) for: the Client Business drawer, any modal (Stock Correction, Restock, Staff form).
- **A count-up animation on Dashboard KPI tiles** — reviewed design already specifies this (`runCountUp`, ease-out cubic, 700ms) — implement it as a small hook, not a new dependency.
- **No GSAP, no ScrollTrigger, no 3D.** If a future phase seems to want one of these, that's a signal to re-check the reviewed design before adding it, not a default to reach for.
- **`prefers-reduced-motion`** still applies — the count-up and row-fade should both degrade to an immediate final state, same discipline as the website build.

---

## 8. Accessibility

Same baseline as the website (focus rings, 44px touch targets, no color-only status) plus one admin-specific addition already flagged as a known gap on the customer site's own QA report: **icon-only buttons in tables need explicit `aria-label`s** — this was called out as a P2 item for the website's admin-adjacent tables and should be done correctly from the start here rather than repeating the same gap.

---

## 9. Testing posture (Ponytail-scoped)

Same standard as the website: money/rule-sensitive logic gets one runnable self-check, presentational components don't. For `apps/admin` specifically, that means: credit-limit-minus-outstanding-balance math, discount tier percentage application, and the stock-correction quantity delta each need a self-check. Role-gating logic (does an Admin ever see an Owner-only control) is exactly the kind of thing worth a negative test per the website spec's `QA-SEC` pattern — verify by attempting the restricted action as the wrong role, not by only checking that the UI hides a button.

---

## 10. Traceability

Same discipline as the website: every phase in `phases.md` names the FRD/BRD rule IDs it implements. The Owner/Admin split in particular traces to BRD §5's "Note on the Owner/Admin split" and FRD §5's Role & Permission Matrix — read those before planning any new gated section, don't infer the boundary from the design screenshots alone (that's exactly how `DiscountCredit.dc.html`'s over-blocking bug happened the first time).
