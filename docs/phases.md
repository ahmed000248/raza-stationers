# UI Implementation Phases — Customer Website (`apps/web`)

**Version:** 1.0
**Companion to:** `architecture.md` (structure/conventions), `TRD.md` v1.3, `FRD.md` v1.2, `BRD.md` v1.1
**Scope:** customer-facing website only. The admin panel gets its own `phases.md` once its design is generated and reviewed (still pending, per the current build status).

---

## 0. Ground rules

1. **One phase at a time.** Do not start building a phase's code until it's been explicitly approved. No exceptions for "quick" phases.
2. **Every phase starts with a written plan, not code.** Before touching a single file, produce a short implementation plan for that phase only (see §2's template) and present it for review. Wait for explicit approval ("go", "approved", "start", etc.) before writing anything.
3. **Phases are sequential and cumulative.** Phase 3 (Home) assumes Phase 1 (components) and Phase 2 (site shell) already exist and are approved. Don't jump ahead "to save time" — a later phase built against an unapproved earlier one is rework, not progress.
4. **Reference `architecture.md`, don't re-derive it.** Design tokens, folder layout, state management choice, and animation-tool split are already decided there. A phase plan should cite it, not re-litigate it.
5. **Every phase plan names the FRD/BRD rule IDs it implements.** If a screen needs a rule this document doesn't list, look it up in `FRD.md` before planning the component — don't infer business logic from a screenshot alone.

---

## 1. Why Graphify and Ponytail are used every phase (context/token discipline)

This build runs across many separate sessions. Without a deliberate strategy, each new session re-reads large parts of the codebase (and this doc set) just to figure out what already exists — expensive in tokens and slow. Two already-installed tools exist specifically to avoid that:

- **Graphify** (`graphify-out/graph.json`, `.graphifyignore` already present in the repo root) maintains a queryable knowledge graph of the codebase. **Before writing any component**, run `graphify query "<thing you're about to build>"` (e.g. `graphify query "product card"`, `graphify query "cart state"`) instead of grepping or re-reading files by hand — it answers "does this already exist, and where" in one call instead of an open-ended search. **After a phase's code is committed**, run `graphify --update` (or `graphify extract . --code-only --update`) so the graph stays current for the next phase/session. Skipping the update means the next phase's query returns stale results and someone re-reads the codebase manually anyway — defeating the point.
- **Ponytail** (`.agents/skills/ponytail`, already governing this repo per `.agents/AGENTS.md`) keeps every diff as small as it can be while still being correct: reuse the shadcn primitive or the util that's already there instead of regenerating it, no speculative abstractions, no boilerplate nobody asked for. Smaller diffs mean less code generated per phase, which directly means fewer tokens spent per phase and a smaller surface for the next session to re-read. Default intensity is **full** — that's already active repo-wide, no need to re-invoke it, just don't drift from it.
- Combined effect: a new session opening mid-build should be able to run one `graphify query`, read `architecture.md`'s relevant section, and pick up exactly where the last session left off — without re-reading every file in `apps/web/src`.

This applies to every phase below without being repeated per phase — treat it as always-on, the same way `architecture.md`'s conventions are always-on.

---

## 2. The per-phase ritual (apply this to every phase in §4)

| Step | Action |
|---|---|
| 1. Check before building | `graphify query "<phase's main components>"` — confirm what already exists (e.g. does `ui/button.tsx` already cover what's needed, or does this phase need a new primitive). |
| 2. Plan | Write the phase's implementation plan using the template below. No code yet. |
| 3. **Approval gate** | Present the plan. Stop. Wait for explicit go-ahead. |
| 4. Motion pass (if the phase has interactive elements) | Invoke `design-motion-principles` in **Create mode** for the phase's key interaction (e.g. "add-to-cart button", "catalogue filter transitions") before freehanding animation choices — reference `architecture.md` §7 for which tool (CSS/Framer/GSAP) applies. |
| 5. Build | Write the code. Ponytail-scoped: reuse before adding, smallest correct diff. |
| 6. Self-check | For any non-trivial logic (pricing display, cart math, form validation, checkout gating) — one runnable check per `architecture.md` §9. Purely presentational components skip this. |
| 7. Sync the graph | `graphify --update` so the next phase/session starts from an accurate picture. |
| 8. **Review gate** | Present what was built. Wait for approval before starting the next phase. |

### Implementation plan template (Step 2)

```
## Phase N: <name>

**Goal:** <one line>
**Depends on:** <prior phases this assumes are done>
**FRD/BRD rules implemented:** <IDs>

**Files to create/touch:**
- path — what it does

**Data shape used:** <which @raza-stationers/types entities, mock fixture if needed>

**Animation notes:** <what gets motion, which tool, referencing architecture.md §7 tokens>

**Definition of done:**
- [ ] ...
```

---

## 3. Animations — the standing default for every phase

Every interactive element built in any phase gets, at minimum, a hover/active state — this is not a separate phase, it's baked into "done" for every component from Phase 1 onward:

- **Hover:** subtle lift (`translateY(-2px)` to `-4px`) and/or color shift on cards and buttons, CSS `transition`, 150ms, ease-out — per `architecture.md` §7's motion tokens. No JS needed for this tier.
- **Press/active:** slight scale down (`scale(0.97)`), 100ms.
- **Focus:** visible focus ring (shadcn default, don't strip it) — this is accessibility, not decoration, and is mandatory even where hover isn't.
- **Mount/enter (where a phase introduces new content appearing, e.g. a toast, a drawer, a filtered product grid):** Framer Motion `AnimatePresence` + fade/slide, 250ms, per `architecture.md` §7.
- **Reduced motion:** every animated component must degrade gracefully under `prefers-reduced-motion` — build it in, not as a follow-up.

Libraries already installed and available for this, no new dependencies needed: `framer-motion` / `motion`, `gsap` (via the pre-wired `src/lib/gsap`), `tw-animate-css`. Plain CSS transitions via Tailwind utilities cover the hover/press tier without pulling in JS at all — prefer that tier whenever it's sufficient (Ponytail: CSS before a library, a library before hand-rolled JS).

---

## 4. Phases

### Phase 0 — Design System Foundation

**Goal:** replace the default shadcn grayscale theme in `globals.css` with the finalized Raza Stationers design system, before any component exists to use it.
**Depends on:** nothing (first phase).
**FRD/BRD rules:** design-system decisions from the earlier design-prompt phase (colors, typography, radius, no-photography rule) — not a numbered FRD/BRD requirement, but a locked prior decision.

**Covers:**
- `@theme` color tokens (Primary Ink, Deep Forest, Forest, Evergreen, Sage, Mist, Canvas, muted semantic Amber/Red/Blue) replacing the current `oklch` grayscale values.
- Font tokens: Poppins (body), heading font (**blocked on your Gondens vs. Unbounded confirmation — this phase cannot fully close without it**), Noto Nastaliq Urdu (loaded but only used inside the `<Bilingual>` component, built in Phase 1).
- Radius scale: 12px / 16px / 999px, no sharp corners.
- Motion tokens (`lib/motion-tokens.ts`): fast/base/slow durations.
- `.glass` utility class defined (not yet applied to anything — that's Phase 2).

**Definition of done:** `globals.css` reflects the real palette; a plain unstyled page (still the default `page.tsx`) visibly renders in the new colors/fonts as a sanity check; no components built yet.

**Approval gate before Phase 1.**

---

### Phase 1 — Core Component Library

**Goal:** build the reusable primitives every later phase depends on, with zero business-page logic yet.
**Depends on:** Phase 0.
**FRD/BRD rules:** `FR-CAT-01` (no product photography → icon block), `FR-LNG-01` (bilingual labels), `NA-03`.

**Covers (`src/components/ui/` + `src/components/motion/` + a few cross-cutting ones):**
- Any missing shadcn primitives (`Button`, `Input`, `Badge`, `Card`, `Sheet`/drawer, `Tabs`, `Dialog`, `Skeleton`) — installed via shadcn CLI, not hand-built, per `architecture.md` §4.
- `<Bilingual en="" ur="" />` — the English+Urdu label pattern used everywhere.
- `ProductIconBlock` — the solid-Evergreen icon block standing in for product photography.
- `components/motion/FadeIn.tsx`, `StaggerList.tsx`, `SkeletonBlock.tsx` — reduced-motion-safe wrappers other phases reuse instead of each hand-rolling `prefers-reduced-motion` logic.
- `Toast`/snackbar confirmation pattern.
- Empty-state pattern (used later for empty cart, no search results, etc.).

**Animation notes:** this phase is where the hover/press/focus tier (§3) gets built into the primitives themselves, so every later phase inherits it for free just by using `<Button>`/`<Card>` rather than raw `<button>`/`<div>`.

**Definition of done:** a throwaway `/dev/components` route (deleted before Phase 2 ships, or gated behind a dev-only flag) renders every primitive so they can be eyeballed together; no real page content yet.

**Approval gate before Phase 2.**

---

### Phase 2 — Site Shell

**Goal:** the nav, footer, and notification dropdown that wrap every subsequent page.
**Depends on:** Phase 1.
**FRD/BRD rules:** `FR-NTF-06` (notification feed vs. preferences are distinct), liquid-glass scoping rule from the design system.

**Covers (`src/components/site/`):**
- `SiteNav.tsx` — the round/pill floating navbar, scroll-responsive `.glass` treatment (the first of the two components allowed to use it, per `architecture.md` §3).
- `SiteFooter.tsx`.
- `NotificationDropdown.tsx` — the second and last `.glass` component; renders mock notifications for now (real data is a later-phase/backend concern) but the read/unread interaction is real.
- Root `layout.tsx` wires `SiteNav` + `SiteFooter` around `{children}`, plus the `CartProvider` from `architecture.md` §5.

**Animation notes:** nav background-opacity transition on scroll (GSAP `ScrollTrigger` or a lightweight scroll-listener + CSS variable — decide at plan time based on how simple the scroll behavior actually needs to be; don't reach for GSAP if a CSS `scroll-timeline` or a two-line listener covers it, per Ponytail rung 4/5). Notification badge pulse — CSS only, respecting reduced motion.

**Definition of done:** every route (even placeholder ones) renders inside the shell correctly; nav and notification dropdown behave correctly at both scroll positions and on mobile width.

**Approval gate before Phase 3.**

---

### Phase 3 — Home Page

**Goal:** first real page, using the shell + component library together.
**Depends on:** Phases 1–2.
**FRD/BRD rules:** `PRD §5.1` (highlights restocked/new items), `CD-04` (pricing shown only per approval status).

**Covers:** hero section (the one place GSAP's scroll/entrance treatment and the isometric 3D-transform composition are used, per `architecture.md` §7), featured/restocked product grid (using `ProductCard` — built in this phase since Catalogue also needs it, see note below), category shortcuts, CTA toward registration for unapproved guests.

**Note:** `ProductCard` is arguably a Phase 4 (Catalogue) component, but Home needs it too. Build it here, in `components/catalogue/`, and Phase 4 reuses it rather than rebuilding it — flag this explicitly in the Phase 3 plan so it isn't duplicated later. This is exactly the kind of thing a `graphify query "product card"` at the start of Phase 4 should catch.

**Definition of done:** Home renders real (mock) featured products with correct stock-status badges and no visible discount percentages, only resolved prices; guest vs. approved-account pricing states both viewable by swapping the mock user.

**Approval gate before Phase 4.**

---

### Phase 4 — Catalogue

**Goal:** browse, search, filter, and the Individual/Bulk purchase-type split.
**Depends on:** Phases 1–3 (reuses `ProductCard`).
**FRD/BRD rules:** `FR-CAT-04` (search/filter across full catalogue, paginated), `FR-CAT-05` (live stock label), `FR-CAT-06` (out-of-stock stays visible, "Notify Me" instead of "Add to Cart"), `FR-CAT-08` (Individual/Bulk toggle), `FR-STK-05` (restock notification opt-in).

**Covers:** category browse + free-text search + filters, `PurchaseTypeToggle`, pagination (built in from the start per `architecture.md` §8, not retrofitted), out-of-stock state with "Notify Me" CTA.

**Animation notes:** filtered-grid re-render uses `StaggerList` (Phase 1) with a short, capped stagger (per the max-skill anti-slop rule: total stagger under 300ms, not 30ms×100 items) — Jakub-primary/Emil-secondary per the design-motion-principles e-commerce weighting.

**Definition of done:** filtering/search feels instant against the mock catalogue; out-of-stock items are correctly un-orderable; purchase-type toggle correctly changes what's shown per `FR-CAT-08`.

**Approval gate before Phase 5.**

---

### Phase 5 — Product Detail

**Goal:** single-product page.
**Depends on:** Phase 4.
**FRD/BRD rules:** `PR-02` (units/variants, e.g. piece/dozen/carton), `FR-CAT-05`/`06`, `CD-04`.

**Covers:** icon-block hero (not a photo), unit/variant selector respecting `ProductUnit` conversions, quantity stepper, add-to-cart with the one deliberately-expressive spring/bounce moment (per the locked design-system decision — this is the *only* place a bounce is allowed).

**Definition of done:** unit conversion math is correct and covered by the Phase-required self-check (`architecture.md` §9); add-to-cart visibly and correctly updates the cart badge in `SiteNav`.

**Approval gate before Phase 6.**

---

### Phase 6 — Cart

**Goal:** cart page, building out `hooks/use-cart.ts` for real (Phase 3–5 only needed the count badge).
**Depends on:** Phase 5.
**FRD/BRD rules:** `FR-CRT-01` (persists across sessions for logged-in users; guests via `localStorage` per `architecture.md` §5).

**Covers:** line-item list, quantity edit/remove, subtotal, empty-cart state (reusing Phase 1's empty-state pattern), continue-to-checkout gating.

**Definition of done:** cart math (subtotal, quantity changes) has its self-check; empty/non-empty states both correct; cart persists across a page reload.

**Approval gate before Phase 7.**

---

### Phase 7 — Checkout

**Goal:** the highest business-logic-density page on the customer site.
**Depends on:** Phase 6. **First phase that likely needs `packages/validation` (Zod schemas)** — flag this at plan time; creating that package is a small architecture addition, worth calling out explicitly rather than quietly adding a new package mid-phase.
**FRD/BRD rules:** `FR-CRT-02` through `FR-CRT-07` (stock/minimum-order/unit validation, payment method selection incl. conditional Pay Later, over-credit → Pending Owner Approval messaging, manual bank-transfer receipt upload, partial payment), `OF-01` (minimum order rules), `OF-04` (delivery zone), `PY-01`/`PY-04` (credit availability, partial payment).

**Covers:** delivery address + zone validation (with the specific inline blocking messages already established: *"This city is outside our delivery zones..."*, *"Minimum order is..."*), payment method picker (Cash on Delivery / Online — Easypaisa/JazzCash/NayaPay/Bank Transfer / Pay Later shown only if credit-active), receipt upload for manual bank transfer, order summary, submit → Pending Review.

**Animation notes:** validation errors use the established shake pattern (already named in the earlier design-prompt work) — fast (150ms), not the slow tier; this is a frequent, error-recovery interaction, so keep it minimal per the frequency gate.

**Definition of done:** every checkout-blocking rule (min order, delivery zone, credit availability) is enforced client-side for UX *and* the plan explicitly notes it will need server-side re-validation once `apps/api` exists (`FR-SEC-01`: client-side is UX only, never the real gate) — this phase must not give a false sense that client validation is sufficient.

**Approval gate before Phase 8.**

---

### Phase 8 — Order Confirmation & Invoice

**Goal:** post-checkout confirmation screen + downloadable invoice.
**Depends on:** Phase 7.
**FRD/BRD rules:** `FR-ORD-04` (order/picking slip generation — backend-driven, this phase renders the confirmation and links to it), `OF-03` (invoice download).

**Covers:** confirmation screen with order summary, order number, next-steps messaging; invoice view (matches the `Invoice.dc.html` page already reviewed in the design bundle).

**Definition of done:** confirmation correctly reflects whatever was actually submitted in Phase 7 (no re-derived/mismatched totals).

**Approval gate before Phase 9.**

---

### Phase 9 — Auth: Sign In & Wholesale Registration

**Goal:** the two auth-adjacent pages; this is where `hooks`/session handling gets real (still against mock/local logic until `apps/api` exists).
**Depends on:** Phase 1 (forms), independent of the shopping flow phases otherwise.
**FRD/BRD rules:** `FR-AUTH-01`/`02`/`03` (mobile+password, lockout after 5 attempts, admin-assisted recovery — no self-service reset, no OTP), `FR-CB-01` (wholesale account request form matching `CB-03` fields).

**Covers:** Sign In form (mobile number + password, lockout messaging), "Forgot password? Contact support for help" (matches the reviewed design — no self-service flow), Wholesale Registration form covering the full `ClientBusiness` field set from `packages/types`.

**Definition of done:** form validation covers required fields and duplicate-mobile-number messaging (mocked); registration submits to a "pending approval" state, not an immediately-active account, per `CB-06`.

**Approval gate before Phase 10.**

---

### Phase 10 — Account

**Goal:** the logged-in business user's own profile.
**Depends on:** Phase 9.
**FRD/BRD rules:** `CD-04` (approval-pending vs. approved pricing state), `FR-NTF-01`/`06` (subscriptions vs. feed are distinct tabs, not one screen), `PY-01` (credit bar), `FR-CB-05`/`06` (linked staff users under one business).

**Covers:** tabbed account page — Details, Notifications (the feed), Preferences (opt-in subscriptions — distinct tab from Notifications, per the earlier locked decision), Staff (other users linked to the same `ClientBusiness`, shown only if the logged-in user's `businessRole` is `owner` or `manager`), animated credit bar (`creditLimit` vs `outstandingBalance`).

**Definition of done:** the Notifications-vs-Preferences distinction is visibly two separate tabs, not conflated; credit bar animates in but the underlying number is correct and covered by a self-check (money math).

**Approval gate before Phase 11.**

---

### Phase 11 — Order History & Order Tracking

**Goal:** past orders, reorder, and per-order tracking with change/cancel requests.
**Depends on:** Phase 8 (shares order-rendering components) and Phase 10 (account shell).
**FRD/BRD rules:** `OF-02` (edit/cancel only in Pending Review, otherwise a Change Request), `OF-03` (Order Again applies current prices/stock, not historical), `FR-ORD-05`/`06` (status must follow the FRD §7 state machine — customer sees the simplified `ORDER_STATUS_CUSTOMER_VIEW` mapping already defined in `packages/types`).

**Covers:** order list with status, `OrderStatusTimeline` component (Placed → Confirmed → Preparing → Out for Delivery → Delivered, per the customer-facing simplification already coded into `packages/types`), "Order Again" (rebuilds cart from a past order using **current** prices/stock, explicitly not the historical order's values — this is a common bug to get backwards, call it out in the plan), change/cancel request flow gated by current status.

**Definition of done:** an order that's already `Confirmed` correctly shows a "Request Change" flow instead of a direct edit; "Order Again" is verified against current (not historical) mock prices.

**Approval gate before Phase 12.**

---

### Phase 12 — Informational Pages

**Goal:** About and Contact — lowest business-logic-density pages, deliberately scheduled last.
**Depends on:** Phase 2 (shell) only, otherwise independent.
**FRD/BRD rules:** none directly — general usability requirement (BRD §16, simplicity for non-technical users).

**Covers:** About (business story, matches the reviewed design), Contact (also the destination for "Forgot password? Contact support" from Phase 9).

**Definition of done:** straightforward — content correctness and shell consistency, not logic.

**Approval gate before Phase 13.**

---

### Phase 13 — Cross-Cutting Polish & Audit Pass

**Goal:** close the loop across every page built in Phases 0–12, not add new pages.
**Depends on:** all prior phases.

**Covers:**
- `design-motion-principles` in **Audit mode** across the whole site — catches AI-slop motion patterns (excessive bounce, stagger spam, unwanted pulsing) that may have crept in phase-by-phase without a cross-page view.
- `ponytail-audit` (whole-repo, not just a diff) — ranked list of anything over-engineered across the 13 phases' worth of code, biggest cut first.
- Responsive QA pass (mobile widths especially, given the non-technical/mobile-data-constrained user base per BRD §16).
- Accessibility pass: focus rings, `prefers-reduced-motion` coverage, touch target sizes — verified, not assumed, against every phase's output.
- Bilingual label coverage check — every primary action across every phase actually uses `<Bilingual>`, not just the ones built early when it was fresh in mind.
- Final `graphify --update` + a clean graph state, so the eventual admin-panel build (or a backend-wiring pass) starts from an accurate map of the finished customer site.

**Definition of done:** a punch list of findings from both audits, with what got fixed inline versus what's deliberately deferred (and why) — presented for final review before this document is considered closed out.

---

## 5. What happens after Phase 13

Two things are explicitly **not** covered by this document, and shouldn't be started until it's finished and approved:

1. **Wiring to a real backend** (resolving TRD §5's open architecture question, building `apps/api` or the Server-Actions alternative, replacing `src/content/mock/` with real calls) — a separate, backend-focused plan.
2. **The admin panel** (`apps/admin`) — needs its own design review first (the Stitch prompts were written but never generated/reviewed), then its own `phases.md`, following the same one-phase-at-a-time, plan-then-approve structure as this document.
