# Raza Stationers Customer Website — Frontend QA and Testing Plan

**Document:** `qa_testing.md`  
**Target application:** `apps/web`  
**Project:** Raza Stationers Platform  
**Scope:** Complete customer-facing frontend after Phases 0–13  
**Status:** Working QA specification  
**Companion documents:** `PRD.md`, `BRD.md`, `FRD.md`, `TRD.md`, `architecture.md`, `phases.md`  

---

## 1. Purpose

This document defines how an implementation or QA agent must verify the complete Raza Stationers customer-facing website.

The objective is not only to confirm that pages render. Testing must verify:

- Customer journeys work from beginning to end.
- Retail and wholesale business rules are represented correctly.
- Pricing, quantities, totals, credit and checkout rules do not produce unsafe or misleading results.
- Guest, retail, pending-wholesale and approved-wholesale states remain separate.
- English and Urdu content is readable and correctly scoped.
- The interface works on mobile, tablet and desktop.
- Accessibility, reduced motion and keyboard navigation are supported.
- The frontend respects architectural and security boundaries.
- Mock frontend behaviour does not falsely claim to provide backend security.
- No confidential business or customer information is exposed.
- The build matches the approved customer design and sitemap.

This document covers the frontend demo. Passing this QA plan does **not** mean the complete business platform is production-ready. Backend authorization, server-side validation, database integrity, payment verification, audit logs, recovery, monitoring and data migration require separate production testing.

---

## 2. Scope

### 2.1 Included

The following customer website areas are included:

- Design system and global styles
- Reusable UI component library
- Navigation, footer and notification dropdown
- Home Page
- Product Catalogue
- Product Detail
- Cart
- Checkout
- Order Confirmation
- Printable Invoice
- Sign In
- Wholesale Registration
- Customer Account
- Order History
- Order Tracking
- Reorder flow
- About
- Contact and Support
- Responsive layouts
- English and Urdu labels
- Mock role and pricing states
- Local cart persistence
- Motion and reduced-motion behaviour
- Loading, empty, error and validation states
- Frontend architectural boundaries

### 2.2 Excluded from this QA pass

Do not claim that the following are tested unless they have been implemented and separately approved:

- Admin panel
- Mobile application
- Real NestJS API
- Real PostgreSQL or Prisma integration
- Real Supabase authentication
- Real SMS or OTP delivery
- Real payment-provider confirmation
- Real inventory reservation
- Real customer credit approval
- Real order fulfilment
- Real delivery-worker tracking
- Existing business database migration
- Production infrastructure
- Backups and disaster recovery
- Penetration testing
- Load testing against real production infrastructure

---

## 3. Sources of Truth

Before testing, the agent must read:

1. `.agents/AGENTS.md`
2. `docs/PRD.md`
3. `docs/BRD.md`
4. `docs/FRD.md`
5. `docs/TRD.md`
6. `docs/architecture.md`
7. `docs/phases.md`
8. This file
9. The approved customer sitemap
10. The approved customer design or design screenshots
11. `packages/types`
12. `packages/api`
13. `apps/web/package.json`
14. `apps/web/components.json`
15. Existing test configuration and scripts

If documents disagree:

1. Follow explicit user instructions.
2. Treat the latest approved PRD, BRD, FRD and TRD business rules as authoritative.
3. Use `architecture.md` for frontend structure.
4. Use `phases.md` for implementation order.
5. Do not silently choose between contradictory rules.
6. Record the conflict as a QA blocker and request a decision.

Screenshots demonstrate intended layout, but they must not override documented business rules.

---

## 4. QA Agent Operating Rules

The agent must:

- Inspect before changing anything.
- Run `/graphify` or the repository’s Graphify command to locate relevant components, routes, state and tests.
- Use `/ponytail` or the repository’s Ponytail workflow to keep any QA fix minimal.
- Preserve existing user changes.
- Test before fixing.
- Record evidence for every failure.
- Fix only clear implementation defects within the approved frontend scope.
- Request approval before making a change that alters business behaviour, architecture or scope.
- Rerun the affected test and the regression smoke suite after every fix.
- Update Graphify after approved code changes.
- Never start admin, backend or mobile implementation during frontend QA.
- Never delete or weaken a test merely to make the build pass.
- Never hide errors with unsafe type casts, disabled lint rules or empty exception handlers.
- Never use real customer, supplier, credit, sales or payment information as test data.
- Never commit, push or deploy unless explicitly requested.

If `/graphify` or `/ponytail` is unavailable, report it. Do not install or replace repository tooling without approval.

---

## 5. Entry Criteria

Full frontend QA can begin only when:

- Phases 0–13 are marked complete or ready for QA.
- The customer routes are implemented.
- The application starts locally.
- Required environment variables have safe demo values.
- Typed mock data is available.
- Lint and type-check scripts can be identified.
- The production build can be attempted.
- The approved customer design is available for comparison.
- There are no unresolved merge conflicts.
- Existing unrelated worktree changes are identified and preserved.

If a phase is incomplete, mark its test cases as **Blocked**, not **Passed**.

---

## 6. Exit Criteria

The frontend QA pass is complete only when:

- All critical customer routes render without crashes.
- The production build succeeds.
- Type checking succeeds.
- Linting succeeds without newly introduced errors.
- All Critical and High defects are fixed or explicitly accepted.
- Pricing, cart, checkout, credit and order totals have no known calculation defects.
- Guest, retail and wholesale visibility rules pass.
- No discount percentage is displayed.
- No direct database dependency exists in `apps/web`.
- Responsive testing passes at the required widths.
- Keyboard-only navigation completes all critical journeys.
- Reduced-motion testing passes.
- No serious accessibility violation remains in critical flows.
- No secrets or confidential data are exposed in the client bundle.
- The smoke regression suite passes after final fixes.
- Remaining Medium and Low findings are documented.
- The final QA report contains evidence and a clear recommendation.

---

## 7. Result and Severity Definitions

### 7.1 Test status

| Status | Meaning |
|---|---|
| Pass | Behaviour matches the requirement and no material issue was observed. |
| Fail | Behaviour does not match the requirement. |
| Blocked | Test cannot run because a dependency, route, decision or environment is missing. |
| Not Applicable | Requirement does not apply to the implemented demo. |
| Deferred | Intentionally postponed with an approved reason and owner. |

### 7.2 Defect severity

| Severity | Definition | Examples |
|---|---|---|
| Critical | Risk of exposing sensitive information, corrupting money-related behaviour, bypassing access rules or making the main application unusable. | Direct DB import in frontend, wrong final total, unapproved user receives wholesale price, checkout submits an invalid order. |
| High | A primary customer journey cannot be completed or a major business rule is incorrect. | Cart cannot update, registration activates immediately, Pay Later appears for an ineligible user. |
| Medium | Feature works partially but usability, accessibility or secondary behaviour is materially affected. | Keyboard trap, broken mobile layout, notification preferences mixed with notification feed. |
| Low | Cosmetic, copy or minor consistency issue with no major task impact. | Small spacing mismatch, non-critical alignment issue. |

### 7.3 Defect priority

- **P0:** Fix immediately; QA cannot continue safely.
- **P1:** Fix before frontend approval.
- **P2:** Fix before demo or document an approved exception.
- **P3:** Backlog candidate.

---

## 8. Required Test Environments

### 8.1 Browsers

Test the latest available versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari, when macOS or an iOS device is available

At minimum, Chrome and Edge must pass before the student demo.

### 8.2 Viewports

Test at:

- 320 × 568 — small phone
- 360 × 800 — common Android phone
- 375 × 812 — common mobile width
- 390 × 844 — modern mobile width
- 768 × 1024 — tablet portrait
- 1024 × 768 — tablet landscape or small laptop
- 1280 × 720 — laptop
- 1366 × 768 — common Windows laptop
- 1440 × 900 — desktop
- 1920 × 1080 — large desktop

Also drag continuously between widths to detect breakpoint jumps and horizontal overflow.

### 8.3 Input methods

- Mouse
- Keyboard only
- Touch emulation
- Real touch device when available

### 8.4 Network and device conditions

- Normal broadband
- Fast 4G
- Slow 4G simulation
- Temporary offline state
- API/mock request failure
- Browser refresh on a nested route
- Low-end mobile CPU simulation when available

### 8.5 Theme and preferences

- Default operating-system motion setting
- `prefers-reduced-motion: reduce`
- Browser zoom at 100%, 200% and 400% for key pages
- High contrast mode where available

---

## 9. Test Data Matrix

Use fake data only. Keep test users clearly labelled as demo records.

| Persona | Required state | Expected access |
|---|---|---|
| Guest | Not signed in | Public catalogue and standard public pricing only. |
| Retail customer | Signed in, retail account | Retail account features and retail pricing. |
| Pending wholesale business | Registration submitted, not approved | No approved wholesale pricing or Pay Later. |
| Approved wholesale, no credit | Approved business, wholesale pricing, credit inactive | Wholesale pricing; no Pay Later. |
| Approved wholesale, credit active | Approved business with available credit | Wholesale pricing and eligible Pay Later option. |
| Approved wholesale, low credit | Approved but order exceeds available credit | Clear pending-approval or blocking behaviour according to FRD. |
| Business owner | Approved business, `businessRole=owner` | May see linked staff tab and permitted staff controls. |
| Business manager | Approved business, `businessRole=manager` | May see staff area only if allowed by current requirements. |
| Business staff | Approved business, restricted role | Must not see owner-only staff controls. |
| Locked user | Five failed sign-in attempts in mock state | Lockout message; no silent sign-in. |

### 9.1 Product fixtures

Include:

- In-stock individual item
- In-stock bulk item
- Product supporting piece, dozen and carton
- Low-stock item
- Out-of-stock item
- Newly restocked item
- Product with Urdu name
- Product with a long English name
- Product with a long Urdu name
- Product in each category
- Product with a current price different from a historical order price
- Product removed or unavailable after appearing in a past order

### 9.2 Cart and checkout fixtures

Include:

- Empty cart
- Single item
- Multiple items
- Maximum allowed quantity
- Quantity greater than stock
- Order below minimum
- Order exactly at minimum
- Order above minimum
- Valid delivery city
- Invalid/out-of-zone city
- Credit sufficient
- Credit exactly sufficient
- Credit insufficient
- Partial-payment scenario
- Manual bank-transfer receipt scenario

---

## 10. Expected Route Inventory

Confirm the actual routes against `architecture.md` and report deviations.

| Route | Expected purpose |
|---|---|
| `/` | Home |
| `/catalogue` | Product Catalogue |
| `/catalogue/[category]` | Category Catalogue |
| `/product/[id]` | Product Detail |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/order-confirmation/[id]` | Order Confirmation |
| `/sign-in` | Sign In and retail account entry |
| `/register` | Wholesale Registration |
| `/account` | Customer Account |
| `/orders` | Order History |
| `/orders/[id]` | Order Tracking and order details |
| `/about` | About |
| `/contact` | Contact and Support |

The invoice route or invoice view may differ. Record its actual implementation and verify that it is reachable from a completed order.

The temporary `/dev/components` route must not be publicly reachable in a production build.

---

## 11. Static and Architectural Checks

### QA-ARCH-001 — Dependency boundary

**Steps**

1. Inspect `apps/web/package.json`.
2. Search imports in `apps/web`.
3. Check workspace dependency references.

**Pass criteria**

- `apps/web` does not depend on `@raza-stationers/db`.
- No Prisma client or raw database client is imported into customer frontend code.
- Frontend domain data comes through typed mocks or `@raza-stationers/api`.

### QA-ARCH-002 — Server and Client Component boundaries

**Pass criteria**

- Server Components are used by default.
- `"use client"` appears only where hooks, browser APIs or client interactions require it.
- Large page trees are not converted to Client Components unnecessarily.

### QA-ARCH-003 — Shared domain types

**Pass criteria**

- Product, order, customer and business data use `@raza-stationers/types`.
- Duplicate, incompatible inline domain types are not introduced.
- Mock JSON shapes match the shared types.

### QA-ARCH-004 — Pricing isolation

**Pass criteria**

- Pricing is resolved through the approved pricing layer.
- UI components do not independently calculate customer discounts.
- Discount percentages are never exposed to customers.

### QA-ARCH-005 — Dependency discipline

**Pass criteria**

- Existing shadcn primitives are reused.
- No duplicate UI, toast, state-management or animation library was introduced.
- No Redux, Zustand or Jotai dependency exists without an approved architecture change.

### QA-ARCH-006 — Client bundle privacy

**Pass criteria**

- No secrets, private API keys, database strings or service credentials appear in client code or built assets.
- No real customer, supplier, sales, payment or credit data appears in fixtures.
- Only intentionally public `NEXT_PUBLIC_*` values are exposed.

---

## 12. Phase 0 — Design System Tests

### QA-DS-001 — Colour tokens

Verify the approved palette exists and is used consistently:

- Primary Ink `#051F20`
- Deep Forest `#0B2B26`
- Forest `#163832`
- Evergreen `#235347`
- Sage `#8EB69B`
- Mist `#DAF1DE`
- Canvas `#F8F9F6`
- Semantic amber, red and blue

**Pass criteria**

- Default shadcn grayscale is not the visible brand theme.
- Text and controls retain sufficient contrast.
- Semantic colours are not used inconsistently.

### QA-DS-002 — Typography

**Pass criteria**

- Unbounded is used for approved display headings.
- Poppins is used for body content.
- Noto Nastaliq Urdu is applied to Urdu text.
- Missing font files do not make content unreadable.
- Font fallback is sensible.
- No major layout shift occurs when fonts load.

### QA-DS-003 — Radius

**Pass criteria**

- Inputs and small panels use the intended 12px treatment.
- Cards use the intended 16px treatment.
- Pills, chips and approved buttons use full rounding.
- Sharp corners do not appear unexpectedly.

### QA-DS-004 — Motion tokens

**Pass criteria**

- Fast, base and slow tokens resolve to approximately 150ms, 250ms and 400ms.
- Components reuse tokens instead of inventing arbitrary timings.

### QA-DS-005 — Glass scope

**Pass criteria**

- Glass styling appears only on `SiteNav` and `NotificationDropdown`.
- Product cards, account panels, forms and data surfaces do not use glass.

---

## 13. Phase 1 — Core Component Library Tests

### QA-CORE-001 — Component preview

Verify the development preview demonstrates:

- Buttons
- Inputs
- Badges
- Cards
- Sheet or drawer
- Tabs
- Dialog
- Skeleton
- Bilingual labels
- ProductIconBlock
- Toast
- Empty state
- Motion wrappers

The route must be development-only or removed before production.

### QA-CORE-002 — Bilingual component

**Pass criteria**

- English and Urdu appear together.
- Urdu span uses `lang="ur"` and `dir="rtl"`.
- Page direction remains LTR.
- Long labels wrap without overlap.
- The component works inside headings, buttons and normal labels.

### QA-CORE-003 — ProductIconBlock

**Pass criteria**

- No product photograph is rendered.
- Icon block uses the approved Evergreen treatment.
- Decorative icons are hidden from assistive technology where appropriate.
- Meaningful icons have an accessible name when required.
- Different sizes do not distort the layout.

### QA-CORE-004 — Shared interaction states

**Pass criteria**

- Hover is subtle.
- Press state does not shift surrounding layout.
- Focus ring remains visible.
- Disabled state is visibly and functionally disabled.
- Real touch target is at least 44 × 44px.

### QA-CORE-005 — Motion wrappers

**Pass criteria**

- Enter animation is short and non-blocking.
- Stagger total remains below 300ms.
- Reduced-motion mode removes or minimizes non-essential movement.
- No unexpected bounce is present.

### QA-CORE-006 — Toast and empty state

**Pass criteria**

- Toast is announced accessibly where appropriate.
- Toast does not trap focus.
- Toast can be dismissed when required.
- Empty state supports title, description and optional action.
- Empty-state action is keyboard accessible.

---

## 14. Phase 2 — Site Shell Tests

### QA-SHELL-001 — Navigation links

Verify every navigation item:

- Has the correct label
- Has the correct target
- Works through mouse, keyboard and touch
- Provides an active/current-page indication
- Does not cause a full application crash

### QA-SHELL-002 — Responsive navigation

**Pass criteria**

- Desktop navigation fits without overlap.
- Mobile menu opens and closes.
- Focus moves into the menu appropriately.
- Escape closes an open overlay when expected.
- Focus returns to the trigger after closing.
- Background scrolling is handled correctly.

### QA-SHELL-003 — Scroll treatment

**Pass criteria**

- Floating navbar changes its approved treatment at the correct scroll position.
- No flicker appears during rapid scrolling.
- Reduced-motion users are not forced through scroll animation.

### QA-SHELL-004 — Notification dropdown

**Pass criteria**

- Opens and closes correctly.
- Read/unread state is represented.
- Keyboard navigation works.
- Feed is not confused with notification preferences.
- Glass is applied only to the intended dropdown surface.

### QA-SHELL-005 — Cart badge

**Pass criteria**

- Badge count matches cart state.
- Count updates after add, quantity change and removal.
- Empty count behaviour is consistent.
- Large counts do not break the navbar.

### QA-SHELL-006 — Footer

**Pass criteria**

- Footer links work.
- Contact information uses approved demo content.
- Footer remains readable on all widths.
- No admin-only link is accidentally exposed.

---

## 15. Phase 3 — Home Page Tests

### QA-HOME-001 — Hero

**Pass criteria**

- Business purpose is understandable without animation.
- Wholesale registration and catalogue actions are visible.
- English and Urdu labels are readable.
- Hero is usable at 320px width.
- Text remains accessible if animation is disabled.

### QA-HOME-002 — Hero motion

**Pass criteria**

- GSAP, if used, is limited to the approved hero experience.
- Hero animation does not delay access to navigation or core actions.
- No hydration error appears.
- Animation cleans up on route changes.
- Reduced-motion mode provides an immediate stable layout.

### QA-HOME-003 — Featured and restocked products

**Pass criteria**

- Typed mock products render.
- Stock labels are correct.
- Out-of-stock action is correct.
- No discount percentage appears.
- Pricing changes correctly between approved mock personas.
- Product links open the correct detail route.

### QA-HOME-004 — Category shortcuts

**Pass criteria**

- Every category points to the correct filtered catalogue state.
- Category names remain readable in both languages where required.

### QA-HOME-005 — Wholesale call-to-action visibility

**Pass criteria**

- Guest and non-approved users see an appropriate registration invitation.
- Approved wholesale customers are not repeatedly asked to register.

---

## 16. Phase 4 — Catalogue Tests

### QA-CAT-001 — Initial catalogue

**Pass criteria**

- Product list loads without a console error.
- Loading skeleton appears when expected.
- Empty and error states are available.
- Products use icon blocks, not photography.

### QA-CAT-002 — Search

Test:

- Exact English name
- Partial English name
- Urdu name if supported
- SKU
- Mixed case
- Leading/trailing spaces
- No-result query
- Special characters
- Very long query

**Pass criteria**

- Search returns the expected results.
- Search input remains responsive.
- No-result state is clear.
- Query does not create a crash or unsafe HTML.

### QA-CAT-003 — Category filters

**Pass criteria**

- Stationery, Registers, Sports and Office filters return correct fixtures.
- Multiple filter state follows the approved design.
- Clear/reset restores the catalogue.
- URL state is correct if filters are URL-driven.

### QA-CAT-004 — Individual/Bulk toggle

**Pass criteria**

- Toggle changes the intended product or unit view.
- It does not automatically grant wholesale pricing.
- Selected state is perceivable without relying only on colour.
- Keyboard operation works.

### QA-CAT-005 — Stock states

**Pass criteria**

- In-stock product can proceed toward ordering.
- Low-stock product is labelled correctly.
- Out-of-stock product remains visible.
- Out-of-stock product cannot be added to cart.
- “Notify Me” replaces or disables “Add to Cart” as required.

### QA-CAT-006 — Restock opt-in

**Pass criteria**

- Opt-in action gives feedback.
- Duplicate opt-in is handled.
- Guest/account requirements follow the FRD.
- Mock success does not claim a real backend subscription.

### QA-CAT-007 — Pagination

**Pass criteria**

- First, middle and last pages work.
- Previous/Next disabled states are correct.
- Filtering resets or preserves page state intentionally.
- No duplicate or missing fixture appears across pages.
- Keyboard focus is managed after page changes.

### QA-CAT-008 — Large-catalogue behaviour

Use a sufficiently large generated mock set to evaluate browsing behaviour without committing confidential or real data.

**Pass criteria**

- Search and filters remain responsive.
- UI does not attempt to render all 3,000+ items in one unpaginated list.
- No severe memory growth occurs during repeated filtering.

---

## 17. Phase 5 — Product Detail Tests

### QA-PDP-001 — Valid and invalid products

**Pass criteria**

- Valid ID renders the correct product.
- Invalid ID provides a safe not-found state.
- Missing fixture does not crash the application.

### QA-PDP-002 — Product information

Verify:

- English name
- Urdu name
- SKU
- Category
- Description
- Specifications
- Stock state
- Resolved price
- Unit or pack information

No discount percentage may be displayed.

### QA-PDP-003 — Unit conversion

Test piece, dozen and carton quantities according to typed fixtures.

**Pass criteria**

- Conversion math is correct.
- Displayed quantity and subtotal use the selected unit.
- Floating-point or rounding errors do not appear in currency.
- Invalid conversion values are rejected safely.

### QA-PDP-004 — Quantity control

Test:

- Minimum quantity
- Increment
- Decrement
- Manual input if supported
- Zero
- Negative value
- Decimal value for integer-only units
- More than available stock
- Very large value

**Pass criteria**

- Only valid quantities can be added.
- Buttons disable at correct limits.
- Validation message is understandable.

### QA-PDP-005 — Add to Cart

**Pass criteria**

- Correct product, unit, quantity and resolved price are added.
- Repeated add follows the approved merge behaviour.
- Cart badge updates.
- Confirmation feedback appears.
- The approved add-to-cart spring is the only expressive bounce.
- Reduced-motion mode removes the bounce.

### QA-PDP-006 — Related products

**Pass criteria**

- Related products are category-based.
- No “customers also bought” or review-based recommendation is introduced.
- Links open correct products.

---

## 18. Phase 6 — Cart Tests

### QA-CART-001 — Empty cart

**Pass criteria**

- Empty state is clear.
- Browse Catalogue action works.
- Checkout cannot proceed with no items.

### QA-CART-002 — Populated cart

**Pass criteria**

- Every line shows correct product, unit, quantity, price and total.
- Retail and wholesale states show the correct resolved prices.
- No discount percentage appears.

### QA-CART-003 — Quantity update

**Pass criteria**

- Increase and decrease update line total and subtotal.
- Invalid quantity is rejected.
- Stock maximum is enforced for frontend UX.
- Cart badge remains synchronized.

### QA-CART-004 — Remove item

**Pass criteria**

- Correct item is removed.
- Totals recalculate.
- Removing the final item returns to the empty state.
- Undo behaviour, if present, works.

### QA-CART-005 — Cart calculations

Verify with independent manual calculations:

`line total = resolved unit price × valid quantity`

`subtotal = sum of all line totals`

**Pass criteria**

- PKR display is consistent.
- Rounding is consistent.
- No stale totals remain after role, unit or quantity changes.

### QA-CART-006 — Persistence

**Pass criteria**

- Guest cart persists after refresh through `localStorage`.
- Cart survives navigation.
- Corrupt local data is handled safely.
- Sign-out or role change follows documented reconciliation behaviour.
- Client/server hydration does not create a visible mismatch.

### QA-CART-007 — Pricing-state change

Change from guest/retail to approved wholesale mock state.

**Pass criteria**

- Price refresh behaviour is intentional and documented.
- Cart never shows mixed or stale pricing without warning.
- Final checkout summary uses the current resolved prices.

---

## 19. Phase 7 — Checkout Tests

Checkout is a money- and rule-sensitive area. Failures here are at least High severity and may be Critical.

### QA-CHK-001 — Access and cart requirement

**Pass criteria**

- Empty cart cannot complete checkout.
- Direct navigation to checkout handles empty state safely.
- Required sign-in behaviour follows the current FRD.

### QA-CHK-002 — Shipping fields

Test:

- Empty required fields
- Customer/shop name
- Valid Pakistani mobile format
- Invalid mobile formats
- Address
- City
- Extremely long input
- Leading/trailing spaces
- Urdu input
- Script or HTML-like input

**Pass criteria**

- Errors are associated with fields.
- Labels remain visible after typing.
- Invalid input cannot proceed.
- Input is rendered as text, not executable markup.

### QA-CHK-003 — Delivery zone

**Pass criteria**

- Supported city proceeds.
- Unsupported city shows the approved blocking message.
- Changing to a supported city clears the correct error.
- Frontend clearly treats this as UX validation requiring backend revalidation later.

### QA-CHK-004 — Minimum order

Test below, exactly at and above the configured minimum.

**Pass criteria**

- Below-minimum order is blocked with the required message.
- Exact minimum is accepted.
- Message states the current minimum clearly.
- Minimum is not duplicated inconsistently across components.

### QA-CHK-005 — Stock revalidation message

Simulate changed or insufficient stock.

**Pass criteria**

- Customer is told which item changed.
- Invalid quantity cannot be submitted.
- Cart can be corrected without losing unrelated items.
- UI does not imply that client-side validation reserves stock.

### QA-CHK-006 — Payment-method visibility

Verify:

- Cash on Delivery
- Easypaisa
- JazzCash
- NayaPay
- Bank Transfer
- Pay Later

**Pass criteria**

- Card payment is not introduced.
- Pay Later is hidden or unavailable for guests, retail accounts, pending businesses and credit-inactive businesses.
- Pay Later appears only for an eligible approved wholesale account.
- Method selection is keyboard accessible.

### QA-CHK-007 — Bank-transfer receipt

If receipt upload exists, test:

- No file
- Valid approved type
- Unsupported type
- Oversized file
- Filename with special characters
- Remove and replace

**Pass criteria**

- Restrictions are stated.
- Invalid file is rejected.
- Preview does not execute active content.
- Demo clearly indicates that server-side scanning and validation are still required.

### QA-CHK-008 — Credit availability

Test:

- Credit greater than order
- Credit equal to order
- Credit lower than order
- Zero credit
- Overdue or inactive credit

**Pass criteria**

- Available credit is calculated consistently.
- Insufficient credit does not silently approve Pay Later.
- Pending Owner Approval or blocking behaviour matches the FRD.
- UI does not modify the owner-set credit limit.

### QA-CHK-009 — Partial payment

**Pass criteria**

- Partial-payment values cannot be negative or exceed the order.
- Remaining credit requirement is calculated correctly.
- Remaining amount is understandable.
- Unsupported combinations are blocked.

### QA-CHK-010 — Order summary

**Pass criteria**

- Summary matches cart items and current resolved prices.
- Subtotal, delivery and grand total reconcile.
- Selected payment method is shown.
- No hidden discount percentage appears.
- A last-minute role or quantity change cannot leave stale totals.

### QA-CHK-011 — Duplicate submission

**Pass criteria**

- Repeated click/tap does not create multiple mock orders.
- Submit button shows a processing state.
- Back/refresh behaviour is safe and understandable.

### QA-CHK-012 — Validation animation

**Pass criteria**

- Error feedback is short and subtle.
- Shake does not repeat indefinitely.
- Reduced-motion mode removes unnecessary shaking.
- Error is communicated through text, not motion or colour alone.

### QA-CHK-013 — Security statement

**Pass criteria**

- Code or documentation explicitly recognizes that client validation is UX only.
- Server-side validation is not falsely represented as complete.

---

## 20. Phase 8 — Confirmation and Invoice Tests

### QA-CONF-001 — Confirmation data

**Pass criteria**

- Order number exists and is readable.
- Items and totals exactly match submitted checkout data.
- Payment method matches selection.
- Confirmation does not recalculate totals differently.

### QA-CONF-002 — Next steps

**Pass criteria**

- Pending Review status is explained where required.
- Packing and delivery expectations do not promise unsupported live behaviour.
- Track Order and Browse More actions work.

### QA-CONF-003 — Refresh and direct access

**Pass criteria**

- Refresh does not crash.
- Invalid order ID is handled safely.
- One mock user cannot view another user’s private mock order through simple ID changes.
- Real authorization is marked as a backend requirement.

### QA-INV-001 — Invoice content

Verify:

- Business details
- Customer/business details
- Invoice number
- Order number
- Date
- Line items
- Units
- Quantities
- Unit prices
- Totals
- Payment method
- Payment status

### QA-INV-002 — Invoice calculations

**Pass criteria**

- Invoice numbers match confirmation and order history.
- Every line and total reconciles independently.
- No discount percentage appears unless explicitly required by an approved document.

### QA-INV-003 — Print layout

**Pass criteria**

- Print preview is readable.
- Navigation and unrelated buttons are hidden from print.
- Content does not clip across pages.
- Colours remain understandable in grayscale.
- A4 layout is practical.

---

## 21. Phase 9 — Authentication and Wholesale Registration Tests

### QA-AUTH-001 — Sign-in fields

**Pass criteria**

- Mobile number and password are required.
- Password can be shown/hidden accessibly if the control exists.
- Errors do not reveal whether sensitive production records exist.
- Form supports keyboard submission.

### QA-AUTH-002 — Failed attempts and lockout

**Pass criteria**

- Failed attempts increment in the mock flow.
- Fifth failed attempt produces the documented lockout state.
- Lockout is clearly explained.
- The UI does not offer OTP or automatic email reset.

### QA-AUTH-003 — Password recovery

**Pass criteria**

- “Forgot password” directs the customer to Contact Support.
- No unapproved self-service reset flow exists.

### QA-AUTH-004 — Role-state separation

**Pass criteria**

- Retail sign-in does not grant wholesale access.
- Pending wholesale account does not receive approved pricing.
- Development role preview is not presented as a real production control.

### QA-REG-001 — Required wholesale fields

Verify the latest FRD fields, including:

- Business name
- Business type
- Contact person
- Mobile number
- Email where required
- Password in the mock registration flow
- Business address
- City
- Optional NTN/GST information
- Terms acknowledgement

### QA-REG-002 — Field validation

Test empty, invalid, duplicate and extreme-length values.

**Pass criteria**

- Required errors are clear.
- Pakistani mobile validation is consistent with sign-in and checkout.
- Optional fields are not incorrectly required.
- Visible labels remain after input.

### QA-REG-003 — Pending approval

**Pass criteria**

- Successful registration results in Pending Approval.
- Wholesale pricing is not immediately activated.
- Pay Later is not activated.
- Explanation of the review process is visible.

### QA-REG-004 — Duplicate mobile

**Pass criteria**

- Mock duplicate-mobile response is handled.
- Existing customer receives a useful next action.
- No duplicate active account is falsely created.

---

## 22. Phase 10 — Account Tests

### QA-ACC-001 — Access

**Pass criteria**

- Guest cannot treat the account page as authenticated.
- Signed-in mock persona sees only its own data.
- Pending and approved states are visibly different.

### QA-ACC-002 — Tabs

Verify distinct tabs:

- Details
- Notifications
- Preferences
- Staff, when authorized

**Pass criteria**

- Notifications feed and notification preferences are not combined.
- Tabs work by keyboard.
- Active tab is announced and visible.
- Refresh/deep-link behaviour is intentional.

### QA-ACC-003 — Pricing tier

**Pass criteria**

- Approved tier name may be displayed.
- Discount percentage is not displayed.
- Pending account does not appear approved.

### QA-ACC-004 — Credit bar

Independently calculate:

`available credit = credit limit - outstanding balance`

**Pass criteria**

- Numbers are correct and never visually exceed valid bounds.
- Negative availability follows approved exception behaviour.
- Animation does not change the underlying number.
- Reduced-motion mode uses a stable representation.

### QA-ACC-005 — Notification feed

**Pass criteria**

- Read/unread state works.
- Empty feed has an empty state.
- Feed actions do not change opt-in preferences accidentally.

### QA-ACC-006 — Preferences

**Pass criteria**

- Restock category opt-ins can be changed in the mock state.
- Saved feedback is clear.
- Preferences remain distinct from already-created notifications.

### QA-ACC-007 — Staff visibility

**Pass criteria**

- Owner sees permitted staff information.
- Manager visibility follows the FRD.
- Restricted staff cannot see owner-only controls.
- Guest, retail and pending wholesale accounts cannot access business staff management.

### QA-ACC-008 — Account details

**Pass criteria**

- Editable and read-only fields follow requirements.
- Validation is consistent with registration.
- Mock save does not claim that production data was updated.

---

## 23. Phase 11 — Order History, Tracking and Reorder Tests

### QA-ORD-001 — Order list

**Pass criteria**

- Orders show number, date, total and status.
- Empty order history has a useful action.
- Invalid or incomplete fixtures do not crash the page.

### QA-ORD-002 — Customer status mapping

Verify customer-facing progression:

- Placed
- Confirmed
- Preparing
- Out for Delivery
- Delivered

**Pass criteria**

- Internal-only statuses are not exposed unnecessarily.
- Timeline order is correct.
- Current state is not indicated by colour alone.

### QA-ORD-003 — Pending Review edit/cancel

**Pass criteria**

- Pending Review order offers allowed edit or cancellation behaviour.
- Confirmation is required for destructive cancellation.
- State update is reflected across order list and detail mock views.

### QA-ORD-004 — Confirmed order change

**Pass criteria**

- Confirmed or later order does not provide direct editing.
- “Request Change” is offered when allowed.
- Customer is told that the request requires review.

### QA-ORD-005 — Order Again

**Critical rule:** Reorder must use current product availability and current resolved pricing, not the historical order’s price.

**Pass criteria**

- Current price is added to the cart.
- Current stock is checked.
- Unavailable product is explained.
- Quantity above current stock is corrected or blocked.
- Historical invoice remains unchanged.

### QA-ORD-006 — Tracking lookup

If guest tracking is supported, test:

- Correct order number and mobile
- Correct order with wrong mobile
- Unknown order
- Empty values
- Extra spaces
- Rapid repeated attempts

**Pass criteria**

- Valid input returns the appropriate mock order.
- Invalid input does not reveal private order details.
- Production rate limiting and server authorization remain documented requirements.

### QA-ORD-007 — Invoice access

**Pass criteria**

- Invoice action opens the correct order’s invoice.
- Invalid ID is handled.
- Print action works.

---

## 24. Phase 12 — Informational Page Tests

### QA-INFO-001 — About

**Pass criteria**

- Business story reflects approved information.
- The 30-year history is presented consistently.
- Unsupported statistics or claims are not invented.
- Wholesale call-to-action works.

### QA-INFO-002 — Contact

**Pass criteria**

- Phone, WhatsApp, email and address use approved values or clearly labelled placeholders.
- No personal information is accidentally exposed.
- Links use appropriate protocols.
- External links are handled safely.

### QA-INFO-003 — Contact form

**Pass criteria**

- Required validation works.
- Enquiry type can represent general, wholesale, order and bulk enquiries if approved.
- Success state is clearly marked as mock when no backend exists.
- Repeated submission is controlled.
- HTML/script-like input is displayed safely.

### QA-INFO-004 — Business hours and map

**Pass criteria**

- Hours are readable and use approved data.
- Map placeholder or link does not block the page.
- Missing external map access has a fallback.

---

## 25. Responsive and Visual QA

Test every route at all required viewport groups.

### QA-RWD-001 — Horizontal overflow

**Pass criteria**

- No unintended horizontal page scrolling.
- Long product, business and Urdu text wraps.
- Tables or invoice content handle narrow widths intentionally.

### QA-RWD-002 — Layout integrity

Verify:

- Navbar
- Hero
- Product grid
- Filters
- Forms
- Cart rows
- Checkout summary
- Account tabs
- Order timeline
- Footer

**Pass criteria**

- Elements do not overlap.
- Sticky elements do not hide content.
- Content order remains logical.
- Primary actions remain visible.

### QA-RWD-003 — Mobile controls

**Pass criteria**

- Touch targets are at least 44 × 44px.
- Mobile menus and drawers are reachable.
- On-screen keyboard does not permanently cover active inputs or submit actions.

### QA-RWD-004 — Design comparison

Compare each implemented page with approved design evidence.

Record:

- Major structural deviations
- Missing sections
- Unapproved sections
- Incorrect colour or typography
- Inconsistent spacing or radius
- Desktop-only behaviour

Do not fail the build for a harmless one-pixel difference. Prioritize hierarchy, usability, consistency and business correctness.

---

## 26. Accessibility QA

Use automated checks as support, followed by manual testing. Automated scores alone are insufficient.

### QA-A11Y-001 — Semantic structure

**Pass criteria**

- One meaningful primary heading per page.
- Heading levels are logical.
- Navigation, main content and footer landmarks exist.
- Lists, forms and buttons use appropriate elements.
- Links are not nested inside buttons and buttons are not nested inside links.

### QA-A11Y-002 — Keyboard journey

Complete these without a mouse:

1. Home → Catalogue → Product → Add to Cart → Cart
2. Cart → Checkout form → Payment choice
3. Sign In
4. Wholesale Registration
5. Account tabs
6. Order History → Order Detail
7. Mobile navigation

**Pass criteria**

- Focus is visible.
- Focus order is logical.
- No keyboard trap exists.
- Dialogs and drawers manage focus.
- Escape works where expected.

### QA-A11Y-003 — Forms

**Pass criteria**

- Every field has a persistent label.
- Required fields are announced.
- Errors are associated with the correct fields.
- Error summary is used for long forms where appropriate.
- Placeholder text is not the only label.

### QA-A11Y-004 — Colour and state

**Pass criteria**

- Normal text targets WCAG AA contrast.
- Large text and interactive states remain readable.
- Status is not conveyed only through colour.
- Disabled controls remain understandable.

### QA-A11Y-005 — Zoom and reflow

**Pass criteria**

- Critical pages remain usable at 200% zoom.
- Content reflows without losing actions.
- At 400%, the customer can still complete essential tasks with expected scrolling.

### QA-A11Y-006 — Assistive text

**Pass criteria**

- Icon-only buttons have accessible names.
- Decorative icons are hidden appropriately.
- Toasts and dynamic validation are announced without excessive interruption.
- Loading state communicates progress.

---

## 27. English and Urdu QA

### QA-LNG-001 — Primary action coverage

Verify that primary customer actions use the shared Bilingual component where required, including:

- Browse Catalogue
- Register for Wholesale
- Add to Cart
- Notify Me
- Continue to Checkout
- Place Order
- Track Order
- Reorder
- Sign In
- Submit Registration
- Contact Support

### QA-LNG-002 — Direction

**Pass criteria**

- Entire page remains LTR.
- Urdu spans use RTL.
- Punctuation and numbers do not reorder incorrectly.
- Mixed English/Urdu labels do not overlap icons.

### QA-LNG-003 — Typography and clipping

**Pass criteria**

- Urdu font loads.
- Nastaliq glyphs are not vertically clipped.
- Line height allows Urdu text to remain readable.
- Long Urdu content does not break cards or buttons.

### QA-LNG-004 — No unapproved language toggle

**Pass criteria**

- English and Urdu are displayed according to the documented bilingual treatment.
- A global language toggle is not introduced during this frontend build.

---

## 28. Motion QA

### QA-MOT-001 — Tool boundaries

**Pass criteria**

- CSS handles normal hover and press states.
- Framer Motion handles approved mount/unmount and layout transitions.
- GSAP is limited to the Home hero or genuinely approved scroll behaviour.
- Routine cards do not use GSAP.

### QA-MOT-002 — Frequency and restraint

**Pass criteria**

- Catalogue browsing is not slowed by repeated entrance effects.
- Stagger does not continue for excessive durations.
- No decorative element pulses indefinitely without meaning.
- Bounce is limited to the approved add-to-cart moment.

### QA-MOT-003 — Reduced motion

**Pass criteria**

- All critical content is immediately available.
- Parallax, scrolling and bouncing are removed or minimized.
- No animation is required to understand status or complete a task.

### QA-MOT-004 — Cleanup and stability

**Pass criteria**

- Repeated navigation does not duplicate event listeners.
- ScrollTrigger instances clean up.
- Animations do not run on unmounted components.
- No console warnings appear from motion code.

---

## 29. Performance QA

Performance results must be recorded for representative mobile and desktop runs.

### QA-PERF-001 — Production build

**Pass criteria**

- Production build completes.
- No unexpected dynamic-rendering or hydration errors appear.
- Bundle does not contain avoidable large dependencies.

### QA-PERF-002 — Lighthouse baseline

Recommended demo targets on representative pages:

| Category | Target |
|---|---:|
| Performance | 80+ mobile, 90+ desktop |
| Accessibility | 95+ |
| Best Practices | 90+ |
| SEO | 90+ for public pages |

Scores are diagnostic. A business-rule or accessibility failure cannot be ignored because the overall score is high.

### QA-PERF-003 — Core Web Vitals

Record:

- LCP
- CLS
- INP or available interaction proxy

Investigate:

- Late font shifts
- Hero animation blocking content
- Large client bundles
- Excessive Client Components
- Repeated catalogue re-renders

### QA-PERF-004 — Catalogue interaction

**Pass criteria**

- Typing in search remains responsive.
- Filters do not freeze the interface.
- Pagination prevents rendering thousands of product cards.
- Reduced-motion setting does not trigger extra work.

### QA-PERF-005 — Slow network

**Pass criteria**

- Loading state is visible.
- Page does not look broken while data is delayed.
- Retry or recovery is available for failed mock/API requests.

---

## 30. Frontend Security and Privacy QA

This is not a penetration test. It verifies that the frontend does not violate obvious security boundaries.

### QA-SEC-001 — Secrets

Search source and built output for:

- Private keys
- Service-role keys
- Database URLs
- Passwords
- Tokens
- Real customer information

Any confirmed secret exposure is Critical.

### QA-SEC-002 — Authorization claims

**Pass criteria**

- Client-side role checks are treated as display/UX behaviour.
- Code does not claim client checks are production authorization.
- Server-side enforcement requirements remain documented.

### QA-SEC-003 — Direct-object access

Change product and order IDs in URLs.

**Pass criteria**

- Invalid IDs fail safely.
- Private mock order data is not casually exposed across users.
- Backend authorization requirement is recorded for production.

### QA-SEC-004 — Input rendering

Use HTML and script-like strings in search, contact and registration inputs.

**Pass criteria**

- Input is not executed.
- Unsafe raw HTML rendering is not used without a reviewed reason.

### QA-SEC-005 — Upload

**Pass criteria**

- Client restrictions exist for receipt upload.
- UI does not treat client file checks as sufficient security.
- Production server scanning, renaming and storage controls are documented.

### QA-SEC-006 — Development controls

**Pass criteria**

- `/dev/components` is unavailable in production.
- Guest/Retail/Wholesale preview switcher is removed or development-only.
- Debug output and mock-control panels are not exposed publicly.

### QA-SEC-007 — External links

**Pass criteria**

- `target="_blank"` links use appropriate `rel` protection.
- Telephone, WhatsApp, email and map links use safe intended protocols.

---

## 31. Error, Loading and Recovery Tests

Every data-dependent page must be checked for:

- Initial loading
- Empty data
- Request failure
- Invalid ID
- Malformed mock data
- Delayed response
- Retry
- Browser refresh
- Back/forward navigation
- Duplicate submission

### QA-ERR-001 — Error message quality

**Pass criteria**

- Message explains what happened in plain language.
- Customer receives a useful next action.
- Internal stack traces are not displayed.
- Error does not expose confidential implementation detail.

### QA-ERR-002 — Recovery

**Pass criteria**

- Customer can retry, return or navigate elsewhere.
- Unrelated cart data is not lost because one request failed.
- Error boundary does not permanently trap the application.

### QA-ERR-003 — Console

During each critical journey, record:

- JavaScript errors
- React warnings
- Hydration warnings
- Failed network calls
- Accessibility warnings emitted by components

Critical journeys must finish without unexplained console errors.

---

## 32. Automated Checks

The agent must inspect package scripts and use the repository’s actual package manager. Do not assume npm if the workspace uses pnpm, Yarn or Bun.

Run the available equivalents of:

```bash
<package-manager> install --frozen-lockfile
<package-manager> run typecheck
<package-manager> run lint
<package-manager> run test
<package-manager> run build
```

Rules:

- Do not change a lockfile unintentionally.
- Do not install a new testing framework without approval.
- Use existing tests and tools first.
- Presentational components do not require meaningless snapshot tests.
- Money and business-rule logic requires runnable checks.

### 32.1 Required logic checks

At minimum, automated or independently runnable checks must cover:

- Unit conversion
- Line total
- Cart subtotal
- Available credit
- Minimum-order boundary
- Delivery-zone boundary
- Pay Later eligibility
- Partial-payment math
- Order confirmation total consistency
- Reorder using current price and stock

### 32.2 E2E testing

If Playwright or another E2E tool is already configured, automate the smoke journeys in Section 33.

If it is not configured:

- Perform the journeys manually.
- Record evidence.
- Propose E2E setup separately.
- Do not introduce a large test framework during audit without approval.

---

## 33. Mandatory Regression Smoke Suite

Run this suite after every significant QA fix and once more before final approval.

### SMOKE-01 — Guest shopping

1. Open Home.
2. Open Catalogue.
3. Search for a product.
4. Open Product Detail.
5. Select a valid unit and quantity.
6. Add to Cart.
7. Open Cart.
8. Update quantity.
9. Continue to Checkout.

Expected: no crash, correct standard pricing and synchronized totals.

### SMOKE-02 — Approved wholesale shopping

1. Activate approved-wholesale mock persona.
2. Browse a product.
3. Confirm resolved wholesale price.
4. Add product to Cart.
5. Continue to Checkout.
6. Verify eligible payment methods.

Expected: approved pricing appears without exposing discount percentage.

### SMOKE-03 — Ineligible Pay Later

Run checkout as:

- Guest
- Retail customer
- Pending wholesale customer
- Approved wholesale customer with inactive credit

Expected: Pay Later is unavailable.

### SMOKE-04 — Eligible Pay Later

1. Use approved, credit-active persona.
2. Create order within available credit.
3. Select Pay Later.
4. Submit mock checkout.

Expected: correct credit and order totals; no immediate production approval claim beyond the documented flow.

### SMOKE-05 — Checkout blocking

Verify:

- Empty required field
- Below minimum
- Outside delivery zone
- Insufficient stock
- Insufficient credit

Expected: each condition blocks progress with a clear message.

### SMOKE-06 — Wholesale registration

1. Open registration.
2. Submit invalid form.
3. Correct the fields.
4. Submit valid fake business data.

Expected: Pending Approval state; no immediate wholesale access.

### SMOKE-07 — Account and notifications

1. Open Account as an approved business owner.
2. Move across Details, Notifications, Preferences and Staff.
3. Confirm feed and preferences are separate.

Expected: correct role visibility and credit calculation.

### SMOKE-08 — Order history

1. Open previous order.
2. View status.
3. Test cancellation on Pending Review.
4. Test Request Change on Confirmed.
5. Reorder a past product with a changed current price.

Expected: correct status rules and current price/stock in the new cart.

### SMOKE-09 — Mobile keyboard and navigation

At 360px width:

1. Open and close navigation.
2. Browse to product.
3. Add to cart.
4. Open checkout form.

Expected: no overflow, keyboard/touch usability and visible focus.

### SMOKE-10 — Reduced motion

Repeat Home, Catalogue filtering and Add to Cart with reduced motion enabled.

Expected: no required information or action depends on animation.

---

## 34. Defect Report Template

Use this format for every failure:

```text
Defect ID:
Title:
Severity:
Priority:
Status:

Requirement/Test ID:
Environment:
Browser:
Viewport:
Persona:

Preconditions:

Steps to reproduce:
1.
2.
3.

Expected result:

Actual result:

Evidence:
- Screenshot:
- Video:
- Console output:
- Network output:

Suspected component/file:

Business impact:

Recommended next action:

Retest result:
Regression result:
```

Do not include secrets or real customer data in screenshots or logs.

---

## 35. Test Execution Record

Maintain a table during QA:

| Test ID | Status | Browser/Viewport | Evidence | Defect ID | Notes |
|---|---|---|---|---|---|
| QA-ARCH-001 | Not Run | — | — | — | — |

Do not mark a test Pass without executing it.

---

## 36. Final QA Report Format

The agent’s final response must contain:

### 36.1 Executive result

- Overall recommendation: Pass / Conditional Pass / Fail
- Frontend version or commit tested
- Date
- Environment

### 36.2 Automated validation

| Check | Command | Result | Notes |
|---|---|---|---|
| Type check | Actual command | Pass/Fail | |
| Lint | Actual command | Pass/Fail | |
| Tests | Actual command | Pass/Fail | |
| Production build | Actual command | Pass/Fail | |

### 36.3 Coverage summary

| Area | Passed | Failed | Blocked | Deferred |
|---|---:|---:|---:|---:|
| Architecture | | | | |
| Design system | | | | |
| Shopping | | | | |
| Checkout | | | | |
| Authentication | | | | |
| Account | | | | |
| Orders | | | | |
| Responsive | | | | |
| Accessibility | | | | |
| Performance | | | | |
| Security boundaries | | | | |

### 36.4 Defects

List defects in this order:

1. Critical
2. High
3. Medium
4. Low

### 36.5 Fixes made

For every approved fix:

- Files changed
- Small explanation
- Test rerun
- Regression result

### 36.6 Deferred production requirements

Explicitly list:

- Server-side authorization
- Server-side pricing validation
- Inventory transaction safety
- Real payment verification
- Credit approval enforcement
- File scanning and secure storage
- Audit logging
- Rate limiting
- Monitoring
- Backup and recovery
- Data migration testing

### 36.7 Final recommendation

State one:

- Frontend approved for the student demo
- Frontend conditionally approved after named fixes
- Frontend not approved because of named blockers

Never state “production-ready” based only on this frontend QA pass.

---

## 37. Ready-to-Use QA Agent Instruction

Use the following instruction when assigning this document to a testing agent:

```text
Test the complete Raza Stationers customer frontend in apps/web using docs/qa_testing.md.

First read .agents/AGENTS.md, PRD.md, BRD.md, FRD.md, TRD.md, architecture.md, phases.md and qa_testing.md. Inspect the repository with /graphify and analyze proposed QA changes with /ponytail.

Start with read-only inspection. Record the current Git state and preserve all user changes. Identify the package manager and existing test scripts. Do not install new testing frameworks or modify application code during the initial test pass.

Execute the static checks, production build, required automated checks, all critical functional journeys, responsive testing, keyboard testing, reduced-motion testing and the mandatory regression smoke suite.

Use fake data only. Do not expose real customer or business records. Treat pricing, totals, credit, checkout eligibility, registration approval and reorder pricing as high-risk rules.

For every failure, create a defect entry using the template in qa_testing.md and attach reproducible evidence. Do not silently fix business-rule or architecture conflicts. Present the findings and a minimal fix plan first.

After I approve the fix plan, apply only the approved fixes using the smallest correct diff. Rerun the failed test and the smoke regression suite. Update Graphify after code changes.

Do not build the admin panel, backend or mobile application. Do not commit, push or deploy unless explicitly requested. Do not claim the system is production-ready.

Finish with the complete QA report defined in Section 36.
```

---

## 38. Approval

This QA document should be reviewed whenever:

- PRD, BRD, FRD or TRD business rules change.
- The route structure changes.
- The backend is connected.
- Authentication becomes real.
- Payment providers are integrated.
- Admin or mobile implementation begins.
- Production deployment is planned.

Frontend QA approval:

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Project owner/student | | | | |
| Business owner/reviewer | | | | |
| QA reviewer | | | | |

