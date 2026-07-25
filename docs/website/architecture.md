# Frontend Architecture Reference (Customer Website)

## Raza Stationers — `apps/web`

**Version:** 1.0
**Companion to:** `phases.md` (execution order), `TRD.md` v1.3 (system-wide architecture), `FRD.md` v1.2, `BRD.md` v1.1
**Scope:** this document only covers `apps/web` (the customer-facing site). The admin panel (`apps/admin`) is out of scope until it exists — see TRD §5's open items.

---

## 0. How to use this document

`architecture.md` answers *"where does this go and how is it structured"*. `phases.md` answers *"what do I build next, in what order"*. Read this once before Phase 0, then reference specific sections as each phase needs them — don't re-read it end to end every session. If a phase's plan would contradict something here, the contradiction gets resolved and this file gets updated before code is written, not silently overridden.

Every structural decision below traces to the TRD; where this document makes a call the TRD didn't (e.g. state management, file layout inside `src/components`), it's marked **(new decision)** so it's clear what's actually specified upstream versus decided here.

---

## 1. Monorepo context

```
raza-stationers/
├── apps/
│   ├── web/          # THIS DOCUMENT — customer website (Next.js 16, React 19)
│   ├── admin/         # not yet scaffolded
│   ├── mobile/          # placeholder only
│   └── api/             # not yet scaffolded — see TRD §5 open architecture question
├── packages/
│   ├── types/        # @raza-stationers/types — shared domain types, already aligned to TRD §6
│   ├── api/            # @raza-stationers/api — HTTP client apps/web calls, never touches the DB directly
│   ├── db/               # @raza-stationers/db — DB access layer, backend-only, apps/web must never depend on this
│   ├── validation/         # Zod schemas — not yet created (Phase 6, Checkout, is the first phase that will need it)
│   └── ui/                   # shared components for web + admin — not yet created; until apps/admin exists, components live in apps/web/src/components
├── docs/
│   ├── PRD.md / BRD.md / FRD.md / TRD.md
│   ├── architecture.md   # this file
│   └── phases.md
└── .agents/
    ├── AGENTS.md          # Ponytail persona — governs how code gets written in this repo
    └── skills/            # ponytail*, animate, gsap, design-motion-principles, max-skill
```

`apps/web` depends on `@raza-stationers/types` and `@raza-stationers/api` only. It must never add `@raza-stationers/db` as a dependency — that was a real bug fixed in this repo already (a Next.js frontend importing the raw DB client bypasses every server-side auth guard `FR-SEC-01` requires). If a future phase seems to need direct DB access, that's a sign the plan needs a review, not a `package.json` edit.

---

## 2. `apps/web/src` layout

Current state (Phase 0 hasn't started — this is still the default `create-next-app` scaffold):

```
apps/web/src/
├── app/                     # Next.js App Router — one folder per route
│   ├── layout.tsx
│   ├── page.tsx              # still the default template
│   └── globals.css            # still the default shadcn grayscale theme
├── components/
│   ├── ui/                     # shadcn primitives (button, input, ...) — installed via `npx shadcn add`, not hand-written
│   └── kokonutui/                # third-party components pulled from the kokonutui registry (components.json)
├── lib/
│   ├── utils.ts                   # shadcn's `cn()` helper
│   └── gsap/                       # centralized GSAP module — already correctly wired, see §7
└── hooks/
    └── use-debounce.ts
```

Target layout by the end of the customer-website build (each folder introduced in the phase that first needs it — see `phases.md`):

```
apps/web/src/
├── app/
│   ├── layout.tsx                 # root layout: fonts, providers (cart context, motion config)
│   ├── page.tsx                    # Home
│   ├── catalogue/
│   │   ├── page.tsx
│   │   └── [category]/page.tsx
│   ├── product/[id]/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order-confirmation/[id]/page.tsx
│   ├── account/page.tsx              # tabbed: details / notifications / preferences / staff
│   ├── orders/
│   │   ├── page.tsx                    # Order History
│   │   └── [id]/page.tsx                # Order Tracking + invoice download
│   ├── sign-in/page.tsx
│   ├── register/page.tsx                # Wholesale Registration
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn primitives — reused, never forked
│   ├── site/                      # SiteNav, SiteFooter, NotificationDropdown — cross-page shell
│   ├── catalogue/                   # ProductCard, PurchaseTypeToggle, StockBadge, CategoryFilter
│   ├── cart/                          # CartLineItem, CartSummary
│   ├── checkout/                       # PaymentMethodPicker, DeliveryZoneNotice, MinOrderNotice
│   ├── account/                         # CreditBar, TabNav
│   ├── orders/                           # OrderStatusTimeline, OrderCard
│   └── motion/                             # small reusable motion wrappers (FadeIn, StaggerList, SkeletonBlock) — see §7
├── lib/
│   ├── utils.ts
│   ├── gsap/
│   ├── pricing.ts                # thin client — calls @raza-stationers/api, never re-implements FRD §8 resolution logic
│   └── motion-tokens.ts             # duration/easing constants shared by Framer Motion and CSS
├── hooks/
│   ├── use-debounce.ts
│   └── use-cart.ts                    # see §5
├── content/
│   └── mock/                            # fixture JSON matching packages/types, used until apps/api exists — see §6
└── styles/
    └── (design tokens live inside globals.css's @theme block, not a separate file — Tailwind v4 convention)
```

**(new decision)** Components are organized by domain folder (`catalogue/`, `cart/`, `checkout/`...), not by atomic/molecule/organism tiers. Reasoning: this is a small, single-team site with ~14 pages: domain folders keep "everything about the cart" in one place, and match how the phases are sequenced. Only `ui/` (shadcn primitives) and `motion/` (cross-cutting wrappers) are tier-based, because those two genuinely get reused everywhere.

---

## 3. Design system → Tailwind v4 mapping

Tailwind v4 is CSS-first (no `tailwind.config.js` — confirmed absent from `apps/web`). All design tokens live in `src/app/globals.css`'s `@theme` block and `:root`/`.dark` variable declarations, exactly where shadcn already put its (currently grayscale) defaults.

Phase 0's job is to replace those default `oklch(...)` grayscale values with the finalized design system, reviewed and approved in the `_ds` bundle (`colors.css`, `typography.css`, `radius.css`):

| Token category | Source of truth | Target CSS variable(s) |
|---|---|---|
| Colors | `_ds/tokens/colors.css` — Primary Ink `#051F20`, Deep Forest `#0B2B26`, Forest `#163832`, Evergreen `#235347` (primary accent), Sage `#8EB69B`, Mist `#DAF1DE`, Canvas `#F8F9F6`, plus muted semantic Amber/Red/Blue | `--primary`, `--background`, `--foreground`, `--accent`, `--muted`, `--destructive`, plus custom `--color-evergreen-*`/`--color-sage-*` scale for anything shadcn's default variable names don't cover |
| Typography | `_ds/tokens/typography.css` — heading "Gondens" (unresolved, using Google Fonts "Unbounded" as a stand-in — **still needs your confirmation**), body Poppins, Urdu Noto Nastaliq Urdu | `--font-sans` (Poppins), `--font-heading` (Unbounded, pending confirmation), new `--font-urdu` (Noto Nastaliq Urdu) |
| Radius | `_ds/tokens/radius.css` — 12px inputs/small panels, 16px cards, 999px buttons/pills/avatars/chips, no sharp corners | `--radius` base value adjusted so shadcn's derived `--radius-sm/md/lg/xl` land on 12/16px, plus a `--radius-full` (999px) used explicitly on buttons/pills, not derived |
| Motion | Not yet in a token file — defined fresh in `lib/motion-tokens.ts` per §7 | `--motion-fast` (150ms), `--motion-base` (250ms), `--motion-slow` (400ms) |

**Open item carried into Phase 0:** confirm Gondens vs. Unbounded before the heading font is locked in `globals.css` — flagged twice already (once by me, once by the design tool's own readme) and still unresolved.

**Liquid glass** is scoped to exactly two components — the floating pill navbar (`components/site/SiteNav.tsx`) and the notification dropdown (`components/site/NotificationDropdown.tsx`) — implemented as a `.glass` utility class (backdrop-blur + translucent background) applied only in those two files. It never appears on data/table surfaces (there are none on the customer site, but the rule is worth stating so a later phase doesn't casually reach for it on, say, the account credit panel).

**No product photography anywhere.** Wherever a design would normally show a product image, render a solid Evergreen icon block instead (`components/catalogue/ProductIconBlock.tsx`, built once in Phase 1, reused everywhere a product is shown). This is a hard rule from the FRD, not a placeholder-until-photos-arrive — see FRD `FR-CAT-01`.

---

## 4. Component conventions

- **Server Components by default** (`components.json` already has `rsc: true`). Add `'use client'` only where a component needs interactivity, browser APIs, hooks, or GSAP/Framer Motion — the same rule the `gsap` skill already documents for this repo.
- **shadcn primitives are installed, not hand-written.** If `components/ui/` is missing something (e.g. a `Sheet`/drawer, `Tabs`, `Dialog`), install it via the shadcn CLI first (ponytail rung 5: "already-installed dependency solves it? use it" — shadcn itself is already a dependency) before writing a custom component.
- **One component, one file, one export.** No barrel files (`index.ts` re-exporting a folder) unless a phase specifically needs one — YAGNI per the Ponytail ladder.
- **Props are typed against `@raza-stationers/types` wherever the component renders domain data.** A `ProductCard` takes a `ProductCatalogueView`, not a hand-rolled inline type — this is what keeps the frontend, the (future) API, and the docs from drifting apart again the way `packages/types` had drifted before this week's fix.
- **Bilingual labels:** every primary customer-facing action label renders English with a Urdu companion span, per FRD `FR-LNG-01` — not a toggle, both always visible. Build one small `<Bilingual en="Add to Cart" ur="کارٹ میں شامل کریں" />` component in Phase 1 that renders the Urdu span with `lang="ur"` and `dir="rtl"` scoped to just that span (the page itself stays `dir="ltr"` — `components.json`'s `rtl: false` is correct and should stay that way; full-page RTL is a Phase-2+ item, not this build).
- **Never show a discount percentage**, only the resolved final price (`CD-04`). If a component ever receives a `discountPercent` prop for display, that's a bug, not a style choice — pricing display always consumes an already-resolved price from `lib/pricing.ts`.

---

## 5. State management **(new decision — not specified in the TRD)**

The TRD doesn't prescribe a frontend state library, and there isn't one installed. Per Ponytail rung 4 (native platform feature) and rung 2 (nothing already in the codebase needs replacing): use **React Context + `useReducer`** for the two pieces of state that need to persist across pages —

- **Cart** (`hooks/use-cart.ts` + a `CartProvider` in the root layout): items, quantities, derived subtotal. Persisted to `localStorage` for guests, reconciled with the server cart once the user is logged in (server-side persistence is a backend concern, out of scope until `apps/api` exists — see Phase 5).
- **Auth/session** (whatever the eventual Supabase Auth client provides) — wired in Phase 8, not before, since there's nothing to authenticate against yet.

No Zustand, Redux, or Jotai. If cart logic outgrows a reducer (it's not expected to — a cart is a list with quantities), that's a documented decision to revisit, not a default to reach for now.

---

## 6. Data strategy before `apps/api` exists

`apps/api` (the NestJS backend) isn't built yet, and per TRD §5's open architecture question, might not be built as a separate service at all. Building UI shouldn't block on that decision. Until it's resolved:

- Every page fetches through `@raza-stationers/api`'s `RazaAPIClient` (already fixed to only call HTTP endpoints, never the DB).
- `RazaAPIClient` points at a `NEXT_PUBLIC_API_URL` env var that, for now, resolves to local mock handlers rather than a real server.
- Mock data lives in `src/content/mock/*.json`, shaped exactly like `ProductCatalogueView`, `Order`, `ClientBusiness`, etc. from `@raza-stationers/types` — never a shape invented ad hoc per component. This is what lets Phase 2 onward build real, typed pages against realistic data without waiting on the backend decision, and means zero rework when a real API is wired in later (the type contract doesn't change, only where the data comes from).
- Pricing resolution (FRD §8's four-step priority) is **never re-implemented in a component.** Phase 2+ components call a single `lib/pricing.ts` function; today it reads from the mock catalogue's pre-resolved price field, later it calls the real `PricingService` endpoint. One call site, one place to swap.

---

## 7. Animation architecture

Three tools are already installed and each has a specific job — this repo's `.agents/skills/max-skill` documents the same split, this section is the `apps/web`-specific version of it:

| Tool | Job | Where |
|---|---|---|
| **CSS transitions** | Hover/press micro-states (lift, scale, color) — the highest-frequency interaction on the site | `ui/` primitives, `ProductCard`, buttons — plain Tailwind `transition` utilities, no JS |
| **Framer Motion** (`framer-motion`) | Mount/unmount (`AnimatePresence`), simple enter animations, shared layout (`layoutId`) for things like the notification badge or tab indicator | Toasts, modals/drawers, tab switches, cart drawer open/close |
| **GSAP** (`@/lib/gsap`, already centralized correctly) | Scroll-driven motion (`ScrollTrigger`), hero entrance, the one-time isometric hero composition | Home page hero only, plus any future scroll-triggered section — not used for routine hover states, that's what CSS is for |

**Motion tokens** (`lib/motion-tokens.ts`, `--motion-fast/base/slow` CSS variables): fast = 150ms (hover, press), base = 250ms (enter/exit, drawers), slow = 400ms (hero, page-level reveals). Ease-out for entrances, ease-in for exits, spring/bounce reserved for exactly one delight moment — add-to-cart — per the earlier design-prompt decision. Every new animation should be checkable against this table without re-deriving numbers per component.

**Every animation respects `prefers-reduced-motion`.** This isn't optional per `.agents/skills/design-motion-principles/references/accessibility.md` and per FRD's general accessibility posture — build the reduced-motion fallback in the same component, not as a follow-up pass. `components/motion/` wrappers (`FadeIn`, `StaggerList`) handle this once, centrally, so individual pages don't each re-implement the media query.

**The frequency gate applies:** catalogue browsing (high-frequency, e-commerce context) gets Jakub-Krehel-style subtle polish, not Jhey-Tompkins playfulness — reserve the more expressive motion for the Home page hero and the add-to-cart delight moment, per `.agents/skills/design-motion-principles`' own project-type weighting table (E-commerce → Jakub primary, Emil secondary, Jhey selective on product showcase only).

Before building a phase's animations, invoke `design-motion-principles` in **Create mode** for that phase's key interaction (see `phases.md`'s per-phase checklist) rather than freehanding motion choices — it's already installed and already has the reference material (easing, duration-by-context, anti-slop checklist) loaded.

---

## 8. Accessibility & performance baseline

- Focus rings on every interactive element (already a named requirement from the design-prompt phase) — shadcn primitives have this by default, don't strip it.
- 44px minimum real touch target on buttons/pills (already a locked design-system rule) — verify, don't assume, once components are built.
- Images: none (no product photography) — the one exception is the isometric hero composition, which is CSS 3D-transform, not a raster image, so there's no image-optimization concern there either. Any future icon assets should be SVG.
- Catalogue search/filter must stay responsive across 3,000+ SKUs once real data lands (`FR-CAT-04`) — Phase 3 should paginate from the start, not retrofit it.

---

## 9. Testing posture for the UI build (Ponytail-scoped)

Per `.agents/AGENTS.md`: non-trivial logic gets one runnable check, not a framework. For this build that means:

- Pricing resolution consumption (`lib/pricing.ts`), cart quantity/subtotal math (`hooks/use-cart.ts`), and checkout validation (min order / delivery zone gating) each get one small `assert`-based self-check or a single test file — these are the "money and rules" paths where a silent bug is expensive.
- Purely presentational components (a card, a badge, a footer) get none — Ponytail: "trivial one-liners need no test," and a component with no branching logic isn't meaningfully testable beyond "does it render," which Next.js's own type-checking and a manual look already cover.
- Full Playwright E2E suites (per TRD §17) are a later-phase, pre-launch concern — not part of this UI-build pass.

---

## 10. Traceability

Every phase in `phases.md` names the FRD/BRD requirement IDs it implements. This document doesn't restate the business rules — see `FRD.md` §6 and `BRD.md` for the authoritative rule text. If a component needs a rule this document doesn't mention, the rule gets looked up in the FRD before the component gets built, not inferred from the design screenshots alone.
