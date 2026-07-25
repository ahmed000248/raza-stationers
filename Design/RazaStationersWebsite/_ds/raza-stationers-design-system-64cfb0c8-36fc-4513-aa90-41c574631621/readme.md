# Raza Stationers Design System

Raza Stationers is a wholesale & retail stationery business operating in Pakistan — notebooks, pens, paper, and general office supplies, sold both to individual retail customers and to registered wholesale shop accounts at a discounted tier. The brand voice and UI are bilingual throughout: English paired with Urdu (Noto Nastaliq Urdu, right-to-left) on nearly every label, not as a toggle but as a permanent dual-language lockup.

Two products are implied by the interface: a **customer-facing storefront** (mobile-first commerce: browse, cart, checkout, wholesale pricing) and an **internal admin dashboard** (inventory, orders, customers, reports) for staff.

## Source material

This design system was built from a single uploaded reference file:
- `uploads/Raza Stationers Design System (standalone).html` — a self-contained HTML specimen document (colors, type, spacing, radius, icon set, and click-through sketches of buttons, forms, badges, a product card, an admin dashboard, and navigation patterns). No Figma link, GitHub repo, or codebase was provided — this file is the sole source of truth.
- No logo file, product photography, or brand illustration assets were included. None were invented — see "Iconography & imagery" below.
- The reference file itself flagged its display typeface as a fallback: it names an intended font "Gondens" that could not be located, substituting **Unbounded** (Google Fonts) as the geometric display face. **This substitution needs your confirmation** — if "Gondens" is a real licensed font, please attach its font files and we'll swap it in.

## Content fundamentals

- **Bilingual by default, not as an afterthought.** Nearly every UI label pairs an English string with its Urdu translation directly beneath or beside it, in Noto Nastaliq Urdu, set `dir="rtl"`. Example: "Full Name" / "پورا نام", "In Stock" / "سٹاک میں موجود". When adding new copy, write the Urdu pairing at the same time — don't ship English-only screens.
- **Plain, functional copy.** No taglines, no exclamation points, no forced enthusiasm. Headings state what the section is ("Shop by Category", "Wholesale Pricing", "New Arrivals"); body copy is a single declarative sentence ("Quality notebooks, pens and office supplies — wholesale pricing for registered shops.").
- **Numbers over adjectives.** Stock and order status render as a plain fact ("6 left", "312 orders", "Rs 4.82L") rather than a subjective description.
- **Currency:** Pakistani Rupee, written `Rs 145` (no decimal for whole amounts), lakh notation for large sums (`Rs 4.82L`).
- **No emoji anywhere** in UI copy or navigation.
- **Two audiences, one tone.** Retail customer copy and wholesale/admin copy share the same plain register — wholesale pricing is simply surfaced as an additional pill on the same product card, not a separate marketing voice.

## Visual foundations

- **Palette:** a single dark-to-light evergreen family carries almost the entire UI — Primary Ink `#051F20`, Deep Forest `#0B2B26`, Forest `#163832`, Evergreen `#235347` (the one accent color — primary buttons, active states, brand fill), Sage `#8EB69B` (secondary accent), Mist `#DAF1DE` (light tint backgrounds), plus two neutrals (White, Canvas `#F8F9F6`). Semantic colors (Amber warning, Red error, Blue info) are muted/low-saturation, used only as small pill fills — never a bright solid alert banner.
- **Type:** Unbounded (display/headings, geometric, confirm-needed substitution — see above) + Poppins (body/UI) + Noto Nastaliq Urdu (RTL Urdu pairing). No serif anywhere in the Latin type.
- **No sharp corners anywhere in the system.** Radius scale is deliberately tiny: 0 (never used in practice), 12px (inputs, small panels), 16px (cards, panels), 999px (buttons, pills, avatars, chips). Every button, input, badge, and image container uses one of these.
- **No product photography exists for this catalogue.** Product cards use a solid Evergreen icon block (a line icon from the brand set, in white) in place of a photo — never a placeholder image or stock photo.
- **The sole illustrative visual is a geometric isometric composition** (stacked notebook, packing box, pen — simple 3D boxes in the brand's own palette, built from CSS `transform-style:preserve-3d`, not a drawn illustration). Use it sparingly, as a single hero accent, never repeated as a pattern or texture.
- **Backgrounds are flat.** No gradients, no photographic full-bleed sections, no repeating patterns or grain. Canvas (`#F8F9F6`) is the default page background; White cards sit on top of it with a 1px `rgba(218,241,222,.9)` border, never a drop shadow.
- **Liquid glass is scoped to exactly two components** — the floating pill navbar and the notification dropdown — both on the customer-facing storefront only (`background: rgba(248,249,246,.55)`, `backdrop-filter: blur(20px)`, a 1px white-ish border, soft shadow). It is explicitly never used on data tables, forms, or any admin surface, which stay flat.
- **Admin surfaces are flatter and denser** than the storefront: a solid dark (`#051F20`) sidebar, white flat panels, a plain HTML-table-style data grid — built for fast scanning, not persuasion.
- **Buttons:** three variants — primary (solid Evergreen fill), secondary (2px Evergreen outline), ghost (underlined text link). All are pill-shaped, 44px tall minimum (a real touch target, not just a visual height). Hover darkens to Forest `#163832`; focus adds a 4px soft Sage ring; disabled drops to Sage fill at 70% opacity.
- **Press/active states** are not separately defined in the source — treat as a slight darken matching the hover state.
- **Shadows:** none on ordinary cards (border only). The two glass components carry one soft ambient shadow (`0 8px 30px rgba(5,31,32,.12)`) to lift them off the page.
- **Spacing:** 4px base unit — 4/8/12/16/24/32/44/64. 44px is reserved as the minimum interactive touch target, not just a spacing step.
- **Imagery color vibe:** N/A — no photography in the system; the only color-bearing visual is the flat-color isometric illustration described above.
- **Layout rules:** customer storefront is mobile-first (360px reference frame) with a fixed bottom tab bar; admin is desktop-first with a fixed left sidebar and scrolling content area.
- **Transparency/blur** is used only for the two glass nav components described above — nowhere else.

## Iconography

- **Custom outline icon set, hand-set for this brand** (not a third-party icon font/library) — 24px viewBox, `1.8px` stroke, rounded caps and joins, no fill. Twelve glyphs cover the whole interface: Home, Search, Cart, Account, Delivery, Notification, Discount, Wallet, Shop, Invoice, WhatsApp, Support. Copied verbatim into `assets/icons/*.svg` and wrapped as the `Icon` component (`components/core/Icon.jsx`) — **an intentional addition**: the source never named a wrapper, but every icon usage needs one.
- No emoji, no Unicode-character icons (aside from a plain "●" glyph used as the mobile bottom-nav dot, and "✓"/"−"/"+" for checkbox/stepper controls — these are typographic, not iconographic).
- No PNG icons; SVG only.
- **No logo file was supplied.** Wherever a brand mark would go, the system renders the wordmark "Raza Stationers" in Unbounded, plus the Urdu name "راضا اسٹیشنرز" beneath it in Noto Nastaliq Urdu. Do not draw or approximate a logo — ask the user for a real logo file if one exists.

## Index

```
styles.css              — root stylesheet (imports only)
tokens/                 — colors.css, typography.css, spacing.css, radius.css
fonts/                  — fonts.css (@font-face) + 7 webfont files
assets/icons/           — 12 brand line-icon SVGs
guidelines/             — 12 foundation specimen cards (Colors, Type, Spacing, Brand groups)
components/
  core/                 — Icon, Button, Avatar, Panel
  forms/                — TextInput, PhoneInput, Select, QuantityStepper, RadioOption, CheckboxOption
  feedback/              — StatusBadge
  commerce/             — ProductCard
  navigation/           — PillNavbar, NotificationDropdown, BottomNav
  admin/                — AdminSidebar, TopBar, MetricCard, DataTable, LowStockPanel, SimpleLineChart, SimpleBarChart
ui_kits/
  storefront/           — customer storefront screens (home, catalogue, product, cart)
  admin/                — admin dashboard screens (dashboard, inventory, orders)
SKILL.md                — Claude Code-compatible skill wrapper
```

### Components (22)

**Core:** Icon, Button, Avatar, Panel (intentional addition — shared white-surface wrapper)
**Forms:** TextInput, PhoneInput, Select, QuantityStepper, RadioOption, CheckboxOption
**Feedback:** StatusBadge
**Commerce:** ProductCard
**Navigation:** PillNavbar, NotificationDropdown, BottomNav
**Admin:** AdminSidebar, TopBar, MetricCard, DataTable, LowStockPanel, SimpleLineChart, SimpleBarChart

### Intentional additions
- **Panel** — the source repeats the same white/border/16px-radius/28px-padding container everywhere without naming it; factored out as a shared primitive.
- **Icon** — a wrapper was needed to reuse the 12 hand-set glyphs as a component; the source only ever inlined raw SVG.
- **Avatar** — appears once in the source (admin top bar initials circle) but is generic enough to name and reuse.
