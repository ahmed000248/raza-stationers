# Raza Stationers — Mobile Customer App: Design Generation Prompt

Paste this into Claude Design against the saved **raza-stationers-design-system** (the same system already used for `RazaStationersWebsite` and `RazaStationersAdmin`). This app is the native mobile counterpart to the customer-facing website — same brand, same design tokens, same functional scope — restyled for iOS/Android navigation patterns, not a responsive reflow of the desktop site.

## Design system to reuse (do not invent new tokens)

- **Fonts:** Poppins (body/sans), Unbounded (headings), Noto Nastaliq Urdu (Urdu text) — same three families as the web app.
- **Color tokens:** the existing ink/evergreen/canvas/amber palette from the saved design system (`--color-ink-900`, `--color-evergreen-600`, `--color-canvas`, amber for pending/warning states). Do not introduce new brand colors.
- **Radius scale:** 12 / 16 / 999px, matching the web app's card, input, and pill radii.
- **The `.glass` frosted-glass utility is customer-facing only** — carry it into this app (it does not appear in the admin app). Use it for elevated surfaces: modals, the cart summary sheet, floating action bars.
- **Bilingual pattern:** every customer-facing label pairs an English string with an Urdu string (the `Bilingual` component pattern from the web app) — same behavior here, not full Urdu UI translation (that's a documented Phase 2+ item, not v1).
- **Motion:** light, native-feeling transitions only — screen push/pop, bottom-sheet slide-up, skeleton loading states while data resolves. No heavy 3D/parallax effects; this is a utility ordering app, not a marketing site.

## Platform and navigation shape

Native mobile (iOS/Android via React Native/Expo). Primary navigation is a **bottom tab bar**, not the website's top nav:

1. **Home**
2. **Catalogue**
3. **Cart** (badge showing item count)
4. **Account**

Deep screens (product detail, checkout, order tracking, sign-in) push on top of these tabs rather than living inside them. A persistent top bar carries the bilingual toggle and, when relevant, a "pending approval" banner (see Account below).

## Screens and workflow connections

### 1. Splash / Launch (mobile-only addition, no website equivalent)
Brief branded splash while the app checks stored auth state, then routes to Home (guest), Home with pending banner, or Home with full pricing — mirrors the website's silent auth-state resolution but needs an explicit native loading moment.

### 2. Home
Featured/restocked products carousel, quick category shortcuts, a persistent search entry point. Tapping a product → **Product Detail**. Tapping a category → **Catalogue** pre-filtered. Tapping search → **Catalogue** in search mode. This is the direct equivalent of the website's Home phase (Phase 3).

### 3. Catalogue
Category filter (chips or a filter sheet, not a sidebar — no room for one on mobile), the Individual/Bulk/Both purchase-type toggle, search, infinite-scroll product grid/list toggle. Each card shows: bilingual name, shop name, resolved price (never a raw discount %, per CD-04), stock status badge (In Stock / Low Stock / Out of Stock), and a quick-add control for simple single-unit items. Tapping a card → **Product Detail**. Equivalent of website Phase 4.

### 4. Product Detail
Bilingual name + shop name, description, unit selector (piece/dozen/carton — pulling from `ProductUnit`, matching the website's unit-conversion logic exactly, never recomputed differently on mobile), live stock status, resolved price for the selected unit, quantity stepper, "Add to Cart," and — if out of stock — a "Notify me when back in stock" action (FR-NTF-01, opt-in, never blanket). Equivalent of website Phase 5.

### 5. Cart
Line items grouped clearly by product/unit, quantity steppers that respect unit conversion, subtotal, a delivery-charge preview once an address/zone is known, and a single checkout CTA. Empty-cart state links back to Catalogue. Equivalent of website Phase 6.

### 6. Checkout
Multi-step flow (native mobile favors a stepper over one long form): delivery address entry/selection → delivery zone resolution (free within Wah Cantt/Hassanabdal/Taxila, charged for Rawalpindi/Islamabad — the confirmed zone split) → payment method (Cash on Delivery, manual bank/wallet transfer with reference/receipt upload, or Pay-Later Credit if the account is an approved wholesale business with available credit) → order review → place order. Guest/unapproved users never see a Pay-Later option. Equivalent of website Phase 7.

### 7. Order Confirmation
Order number, summary, and a simple "what happens next" stepper (Placed → Confirmed → Preparing → Out for Delivery → Delivered — the customer-facing simplified state machine, never the internal admin states). Links to **Order Tracking** and back to Home. Equivalent of website Phase 8.

### 8. Invoice
Read-only invoice view reachable from Order Confirmation and Order History, formatted for a small screen (stacked line items, not a wide table). Equivalent of website Phase 8's invoice half.

### 9. Sign In
Mobile-number + password (matches the demo's actual auth mechanism — do not design an OTP flow unless told otherwise, since OTP isn't live in the demo per TRD §7). Link out to **Wholesale Registration** for new business accounts. Equivalent of website Phase 9.

### 10. Wholesale Registration
Business name, contact person, phone, address, city, business type — always required. Email and NTN/CNIC document are **conditional on business type**, not mandatory for everyone (this corrects a known bug in the current website form — design the mobile version correctly from the start). No fixed "30-day credit terms" claim anywhere; credit terms are owner-set per business, communicated only after approval. Ends in a clear "submitted, pending approval" state. Equivalent of website Phase 9's registration half.

### 11. Account
Business profile summary, credit status card (limit / outstanding / available — read-only for the customer), linked staff/users tab if the account has multiple authorized users (BusinessUserLink), and a notifications tab covering both the subscription preferences (restock alerts on specific products/categories) and the notification feed itself (order status, payment reminders, credit/account status changes) as two distinct sections, not one blended list. If the account is pending approval: show standard/retail prices everywhere in the app plus a persistent "Registration submitted — standard catalog prices apply until verification completes" notice; never a fully hidden-price or fully blocked catalogue. Equivalent of website Phase 10.

### 12. Order History & Order Tracking
List of past orders with status chips, tap-through to a detail/tracking view with the same simplified stepper as Order Confirmation, a reorder action (always repricing and reverifying stock against current data, never replaying the original order's prices), and a link to that order's Invoice. Equivalent of website Phase 11.

### 13. Informational (About / Contact)
Simple content screens, reachable from Account or a settings/info entry point — lower priority, keep lightweight. Equivalent of website Phase 12.

## Cross-cutting requirements (apply to every screen)

- Never display a raw discount percentage anywhere — only the already-resolved final price (CD-04). If a screen needs a discount value for display, that's a design mistake to flag, not a style choice.
- Design for average Pakistani mobile data speeds: skeleton loaders over spinners, optimized image-free product cards (no product photography anywhere — this is a description/icon-based catalogue by finalized decision, not a placeholder gap).
- Every price-bearing screen must be able to render three states: guest/standard price, pending-approval (still standard price + banner), and approved-wholesale (personalized resolved price) — without the layout changing shape between them.
- Push notifications (native addition beyond the website): order status changes and restock alerts for subscribed products/categories.

## What NOT to design (explicitly out of scope for this pass)

- Any admin, staff, packing, or delivery-worker screens — those belong to the separate admin mobile app prompt.
- Live payment gateway checkout UI (Easypaisa/JazzCash/NayaPay integration screens) — the demo uses manual transfer + reference/receipt submission only.
- A full Urdu-translated interface — bilingual key labels only.
- GPS/live delivery map tracking for the customer.
