# Phase 2 Answers — Raza Stationers Database Design

Answers to the 45 blocking / pilot-import / deferred questions from Codex's Phase 2 report, worked out from everything already decided in this project (PRD/BRD/FRD/TRD, `packages/types`, `packages/db/prisma/schema.prisma`, the admin QA report, and this conversation's own decisions) plus sound engineering defaults where no rule existed yet.

**Status legend**

- **DECIDED** — already answered by an existing, locked document or by something already built (schema, admin panel behavior). Not a guess.
- **RECOMMENDED** — a reasoned default consistent with existing docs, adopted as the working answer for Codex to build against. Should still get a quick yes/no from you or your father before it's treated as final.
- **UNKNOWN — NEEDS FATHER** — a real fact about how the business actually operates that no document or prior conversation contains. Not answered here; flagged honestly instead of invented.

Of the 45 questions: 19 were DECIDED from existing docs/schema, 19 are RECOMMENDED defaults, and the 7 that genuinely needed your father (PRICE-Q01, PKG-Q01, CAT-Q02, STOCK-Q03, ORDER-Q02, DEL-Q02, PID-Q02) are now **CONFIRMED BY FATHER** — see each entry below.

**Codex's Phase 2 review (2026-07-26) caught real issues in this file, since corrected:**
- Two genuine schema gaps, now fixed in `packages/db/prisma/schema.prisma`: `StockMovement` had no `orderId` (couldn't trace a sale/reversal back to its order) and no `purchaseDate` (BRD SK-01 lists it as its own field, distinct from `createdAt`).
- I was wrong about **PRICE-Q03** (pending-account pricing) — the real, already-built code shows pending accounts retail prices plus a banner, not "no price"; BRD/FRD text corrected to match.
- I was wrong about **DEL-Q01** (who records delivery outcomes) — FR-DLV-02/03 explicitly say v1 is admin-recorded-on-worker's-behalf, contradicting how the admin panel's `/delivery` page was actually built. Still an open decision — see that entry.
- **CAT-Q02**'s count corrected from 63 to 66 uncertain-category rows.
- **PKG-Q02** softened from "decided" to "provisional, same tier as categories" — the workbook's own methodology says these values were inferred, not confirmed.
- **PKG-Q03** now notes `DiscountRule` can't express a general per-unit (box/carton) price override — a real limitation, currently not urgent given PRICE-Q01's answer.

---

## Section 7 — Blocking questions (20)

**PID-Q01 — What makes two entries the same product?**
DECIDED. Identity is the SKU, never the display name. `sku` was already designed as a synthetic key independent of `name` (`packages/types` + `@unique` in the Prisma schema) specifically because real names truncate/collide. The 22 same-name/multiple-price groups (58 rows) are imported as separate products/SKUs by default.

**CAT-Q01 — Which categories are official?**
RECOMMENDED. Keep the 87 generated categories as the v1 working taxonomy — they're already reasonably fine-grained and the flat `Category` table handles that count fine. Your father only needs to skim the Categories sheet for outright wrong groupings, not approve all 87 individually.

**VAR-Q01 — When do colour/size/model/GSM/page-count create separate stock?**
DECIDED. BRD PR-02: "every stock-tracked variation has its own SKU or barcode." Any independently priced or stocked variation is its own `Product` row — there's deliberately no separate variant sub-table.

**PKG-Q01 — What is the base stock unit for each product?**
CONFIRMED BY FATHER. Jar-packaged items are tracked and stocked as 1 jar — not exploded into individual pieces. Combined with PRICE-Q01, this means for most jar/pack items the jar (or stated pack) *is* the base sellable/stockable unit; there's no separate piece-level breakdown unless a product is later specifically flagged otherwise.

**PKG-Q02 — May boxes/jars/cartons be opened for individual sale?**
CORRECTED (Codex Phase 2 review caught this): the *mechanism* is decided (the `purchaseType` field, driven by the workbook's "Sales Type" column), but the workbook's own Methodology tab says these `Both`/`Wholesale-Bulk` values were inferred from packaging wording, not owner-confirmed — so the per-product values are provisional, same tier as the category assignments, not yet a confirmed business fact. Spot-checking is still worthwhile, though lower priority than the 66 category-uncertain rows.

**PKG-Q03 — Does each packaging level get its own SKU/barcode and price?**
DECIDED for the shared-stock mechanism, with one caveat Codex's review correctly caught: `DiscountRule.fixedPrice` is scoped to (client business + product), not to a specific `ProductUnit` — it cannot express a general "box always costs X regardless of piece price" rule for every customer, only a client-specific override. Right now this doesn't block anything, because your father's PRICE-Q01 answer means each row's price already applies to whatever pack size its name states — we're not computing box/carton prices from a piece price via formula. If a genuine need for a general non-linear per-unit price shows up later, `ProductUnit` will need its own optional price field; not needed today.

**PRICE-Q01 — What does each wholesale price represent (per jar/piece/package)?**
CONFIRMED BY FATHER. Read the price basis directly off the item name at import time: name says "single" → price is per single piece; name names a container ("jar," etc.) → price is for the whole container; name states a pack count ("30 pcs," "40 pcs") → price is for the whole pack. This is a real import-parsing rule, not a per-product manual lookup — the importer should keyword-match each `Item Name` for these patterns to set `ProductUnit`/pricing correctly.

**PRICE-Q02 — Are retail/wholesale prices independently entered per sale unit?**
DECIDED (mechanism). Default: a bulk unit's price is a linear multiple of the base `wholesalePrice`/`retailPrice` (exactly what `apps/web`'s `calculateUnitPrice` already does), with an explicit override point (`DiscountRule.fixedPrice`) for the specific products where a carton/box price isn't a simple multiple. Which specific products need the override is unknown until flagged.

**PRICE-Q03 — Do pending accounts see retail price or no price?**
CORRECTED — I got this wrong the first time, and Codex's review was right to push back. I'd theorized guest vs. pending were gated differently without actually checking the built code. Having now checked `use-auth.tsx` and `PendingVerificationNotice.tsx`: a pending account resolves `isApprovedBusiness: false` — identical to a guest — and sees standard/retail prices with a banner on top reading *"Standard catalog prices apply until verification completes."* That's the real, already-built, already-QA-passed behavior. BRD CD-04 and FRD FR-PRC-04's wording ("sees a message instead of any price") were the stale part, not the code — both docs are now corrected to match what's actually implemented (retail price + pending notice, never wholesale before approval).

**CLIENT-Q01 — Can one person act for multiple client businesses?**
DECIDED. Already modeled as many-to-many: `BusinessUserLink` lets one `User` link to several `ClientBusiness` rows, each with its own `businessRole`. No schema change needed.

**CREDIT-Q01 — Balance calc / which invoice does a payment settle?**
RECOMMENDED. Default: oldest-outstanding-invoice-first automatic allocation, with owner/admin able to manually reallocate a specific payment when needed. Balance itself stays derived from `CreditTransaction` rows, never directly edited (already the schema's design).

**CREDIT-Q02 — What happens when a credit order exceeds the limit?**
DECIDED, already built. `OrderStatus.pending_owner_approval` exists specifically for this — an over-limit credit order routes to the owner for a manual decision rather than being auto-rejected (FRD §9).

**STOCK-Q01 — When is stock reserved and deducted?**
RECOMMENDED, and Codex's review caught a real schema gap in how I'd described it: `StockMovement` didn't actually have a field linking a movement back to the order that caused it, so "deducts at confirmation, tied to the order" wasn't actually traceable. Fixed — `StockMovement.orderId` (nullable, `onDelete: SetNull`) added to `schema.prisma`, so a sale/reversal movement can now be traced to its order while ordinary restocks stay untied to any order. The behavioral recommendation itself (deduct on confirmation, no cart-stage reservation) still needs your father's confirmation if he wants a stricter hold-at-cart behavior.

**STOCK-Q02 — Shortage / cancellation / failed-delivery reversal?**
RECOMMENDED. Full automatic reversal of the original sale movement on cancellation. Failed-delivery returns get a manual, reason-required adjustment (FR-STK-07) instead of an automatic one, since "resellable vs. damaged" needs a human judgment call.

**SUP-Q01 — Does v1 need formal supplier/purchase-receipt records?**
DECIDED — no, a `Supplier`/`PurchaseReceipt` master-data system is still out of locked scope. Codex's review did catch a real omission though: BRD SK-01 lists "purchase date" as its own field on a restock entry, distinct from the record's `createdAt` (entry timestamp) — the schema was missing it. Fixed — `StockMovement.purchaseDate` added.

**ORDER-Q01 — Partial fulfilment / backorders?**
DECIDED — no, not in v1. If a line can't be fully filled, admin adjusts or rejects it via the existing change-request workflow (FR-ORD-02) rather than the system auto-splitting shipments. No new order states needed.

**RETURN-Q01 — Full/partial return rules?**
RECOMMENDED — defer to Phase 2. Returns have no FR-RET-* requirements anywhere in the locked FRD; treat them the same tier as the already-documented Phase 2 items (automated discount engine, live GPS). `DeliveryAssignment.returnedItems` already captures enough for v1 record-keeping. Needs your father's sign-off that manual/off-system return handling is acceptable for the pilot.

**DEL-Q01 — Who records delivery status, what proof?**
NOT RESOLVED — I was wrong to call this decided, and Codex's review is right. I over-read the admin QA report's role-gating table (which just says the `/delivery` admin page isn't blocked for a `delivery`-role login) without checking the actual functional requirement. FR-DLV-02 and FR-DLV-03 are explicit and repeated three times in the FRD: **v1 = Admin/Owner records delivery outcomes on the worker's behalf; a delivery-worker-facing login to self-update status is Phase 2.** This is a genuine, still-open inconsistency between the FRD (admin-recorded) and how the admin panel's `/delivery` page was designed (open to a `delivery`-role login directly) — it needs an actual decision, not something I can resolve myself:
- **Option A:** keep FR-DLV-03 as-is (Phase 2) and restrict `/delivery`'s recording actions to Admin/Owner only for v1, with the delivery worker just reporting outcomes verbally/by phone.
- **Option B:** since the admin panel was already built allowing a `delivery`-role login to use that page, accept that v1 quietly delivers FR-DLV-03 early — a delivery worker gets a real (if minimal) login purely to record their own outcomes — and update FR-DLV-02/03 to match.
Proof captured either way is the same: `DeliveryAssignment`'s existing fields (cashCollected, failedReason, returnedItems, timestamps).

**AUTH-Q01 — Who can view/change wholesale, retail, buying price?**
DECIDED. `buyingPrice` is Owner-only (matches FR-ACC's owner-only accounting scope). `wholesalePrice`/`retailPrice` are Admin+Owner editable (catalogue management is already an Admin-allowed action per TRD §7's permission matrix).

**AUDIT-Q01 — May any business record ever be permanently deleted?**
DECIDED on principle — no. Matches the pattern already used everywhere (`Product.isArchived`, `User.isActive`, FR-STF-03's "deactivated not deleted"): archive, never hard-delete. How long to keep archived data is a separate, smaller open question (see AUDIT-Q02).

---

## Section 8 — Pilot-import questions (15)

**PID-Q02 — Does Invo Retailer provide stable item codes/barcodes?**
CONFIRMED BY FATHER. No barcodes for now — that's a future feature. Work with SKU as the identifier for now (matches the schema's existing design: `sku` is the required unique key, `barcode` stays optional/unused).

**PID-Q03 — Is 2,156 the approved complete catalogue count?**
RECOMMENDED — yes, treat 2,156 as the working baseline. The original "~2,160" was your own rough spoken estimate before extraction, not a verified count; a 4-item gap between an eyeballed number and a structured line-by-line extraction is normal, most likely a few non-product header/page-break rows in the PDF. Only worth reconciling exactly if you want to hand-check the PDF yourself.

**CAT-Q02 — Which of the 66 uncertain-category rows should change?**
CONFIRMED BY FATHER — a general rule, not a row-by-row fix. *(Count corrected by Codex's review: 63 rows are category-only issues, plus 3 more rows that combine a zero-price issue with a category issue — 66 total need a category decision, not 63.)* If a row has no item name at all, drop it from the import entirely. If the name is present but too unclear/truncated to categorize confidently, put it in a single generic **"Others"** category rather than forcing it into a specific guess. The two generated catch-alls ("Writing Instruments – Model Unclear," "Unidentified/Truncated Source Entries") merge into one real "Others" category at import — no manual per-row category assignment needed.

**DUP-Q01 — How to resolve the 22 same-name/multiple-price groups?**
RECOMMENDED. Default: treat each as a distinct product/variant with its own SKU (consistent with PID-Q01), unless your father recognizes a specific pair as a stale/superseded price — in which case the old one gets archived, not merged. Worth a quick skim of just these 22, not the whole catalogue.

**PRICE-Q04 — The 13 zero-price products?**
RECOMMENDED. Import as `isArchived: true` — they exist for record-keeping but can't be shown or ordered until a real price is supplied.

**PRICE-Q05 — Where will retail/buying prices come from?**
DECIDED (source), pending (values). You already said these are coming directly from you/your father, arriving separately from the wholesale list. Just waiting on the actual numbers.

**PKG-Q04 — Who confirms package quantities/conversions?**
RECOMMENDED process. Computer operator drafts a first-pass `conversionToBase` per product using visible pack-size hints in the name (e.g., "24pcs"); owner only reviews the exceptions/unclear ones — same operator-drafts/owner-approves-exceptions pattern as categories.

**STOCK-Q03 — Opening stock source?**
CONFIRMED BY FATHER — explicitly deferred. Work on the items list only for now; stock quantities are a separate, later exercise. `StockLevel` rows can be created at zero/unset when products are imported and populated afterward — this is not a blocker for the catalogue/pricing pilot.

**CLIENT-Q02 — Which registration fields/documents are actually required?**
RECOMMENDED, and flags a real bug. Always required: business name, contact person, phone, address, city, business type. Tax/NTN document: conditional on business type, not mandatory for everyone — matches BRD's own "conditional" language. **`apps/web/src/app/register/page.tsx` currently hard-requires email + NTN/CNIC for every signup and advertises a flat "30-day credit terms," neither of which matches BRD** (terms are owner-set per business, not a fixed number). Worth a follow-up fix once your father confirms which business types genuinely need a tax document.

**CREDIT-Q03 — Import existing balances/limits/terms?**
RECOMMENDED. At minimum, import an opening balance per existing long-term customer as a single dated `CreditTransaction(adjustment)` row referencing the source, so 20–30 year relationships don't appear to start at zero. Full transaction-by-transaction history isn't necessary. Actual figures are UNKNOWN — NEEDS FATHER's current records.

**SUP-Q02 — Supplier names/buying prices available electronically?**
UNKNOWN, and not blocking — deferred per SUP-Q01, since margin reporting can wait.

**ORDER-Q02 — Actual minimum-order/pack-only rules?**
CONFIRMED BY FATHER. Fully flexible — no fixed minimum-order-quantity engine needed. Most items sell in bulk (dozen, 30 pcs, 50 pcs, etc.) but the same item can also be sold individually to retail customers. This is exactly what `purchaseType` (individual/bulk/both) already models — no additional per-product MOQ field is needed for v1. Resolves BRD OF-01's open flag.

**PAY-Q01 — Active payment methods/proof for the pilot?**
DECIDED — already the documented v1 plan. COD, manual bank/wallet transfer with an admin-verified reference or receipt, and approved Pay-Later credit. Live gateway integration stays deferred per BRD PY-03 (merchant accounts not yet confirmed).

**DEL-Q02 — Delivery areas/charges/free-delivery thresholds?**
CONFIRMED BY FATHER. Free delivery within Wah Cantt, Hassanabdal, and Taxila (the whole region). Delivery charges apply for Rawalpindi and Islamabad — exact charge amounts still to be set, but the zone split itself is confirmed. Resolves BRD OF-04's open flag; these four cities become the seed data for the delivery-zone configuration.

**IMPORT-Q01 — Who approves an import batch, repeat-file detection?**
RECOMMENDED. Operator/admin runs and reviews each test-batch preview; the owner gives final go-ahead only for the full/final catalogue import (FR-MIG's existing test-batch-mode language). Repeat-file detection via a SHA-256 file hash stored on the `ImportBatch` record, so re-uploading the identical file is caught regardless of filename.

---

## Section 9 — Deferred questions (10)

**CAT-Q03 — Subcategories / multiple categories needed?**
DECIDED — no. One category per product for v1 (matches how the real 87 categories are actually used — flat, no nesting). `parentCategoryId` stays in the schema for future use, just unpopulated.

**BRAND-Q01 — Brand as a structured record?**
DECIDED — no. The real data has no brand column at all (Products sheet is Item Name / Category / Sales Type / Wholesale Price only); adding a Brand table now would invent a field with no source data behind it.

**PRICE-Q06 — Promotional/time-bound pricing?**
DECIDED — deferred, already documented as Phase 2 scope ("automated discount rule engine"). Manual one-off discounts (already supported) cover the near-term need.

**PRICE-Q07 — Price-history retention?**
RECOMMENDED. Keep indefinitely. `DiscountChangeLog` already covers account-discount changes; for raw price edits on `Product` itself, use the existing generic `AuditLog` (entityType="Product") rather than adding a new dedicated table.

**SUP-Q03 — Purchase orders/supplier returns/payments?**
DECIDED — deferred, same reasoning as SUP-Q01.

**DEL-Q03 — GPS/mobile self-service for delivery workers?**
DECIDED — already out of scope. Listed as Phase 2+ in the FRD's own scope note, and the mobile app overall is already deferred until after database + backend per your own plan.

**AUTH-Q02 — Separate accounting-staff role?**
DECIDED — no. Current roles (owner/admin/packing/delivery) already cover it; accounting stays Owner-only per TRD §7.

**TAX-Q01 — Tax-inclusive/exclusive pricing, tax invoices?**
DECIDED for the pilot — not needed; no tax fields exist anywhere in the current schema/docs. UNKNOWN for production — would need your father (and possibly an accountant) if/when this moves toward real business use.

**LNG-Q01 — Full Urdu interface?**
DECIDED — no. Bilingual key labels only (`nameUrdu` fields, `Bilingual` component), not a full UI translation — already documented as Phase 2+ scope.

**AUDIT-Q02 — Formal retention period?**
RECOMMENDED. Indefinite retention as the safe v1 default — no legal/regulatory retention requirement has come up anywhere in this project. If Pakistani record-keeping law requires something specific, that's a legal question for your father or an accountant, not something to guess at here.

---

## Follow-ups this surfaced (not yet acted on)

1. `apps/web/src/app/register/page.tsx` over-requires fields (mandatory email + NTN/CNIC for everyone) and advertises a fixed "30-day credit terms" that doesn't match BRD (terms are owner-set per business). Worth fixing once CLIENT-Q02 is confirmed.
2. BRD's `ClientBusiness` model implies multiple addresses/documents per business; the current schema has a single `address` field. Recommend single address for the pilot, multiple addresses/document uploads as a tracked Phase 2 item unless your father says he needs it now.
3. Delivery-charge amounts for Rawalpindi/Islamabad are still needed (the free-vs-charged zone split is confirmed; the actual Rupee amounts aren't yet).
4. Import rule to build, per father's answers: parse `Item Name` for "single"/container words/pack-count numbers to set the price basis (PRICE-Q01); drop rows with no name and route unclear names to a single "Others" category, merging the two generated catch-all categories into it (CAT-Q02); skip stock population entirely for this pass (STOCK-Q03).

All 7 father-dependent questions are now answered — nothing left blocking Phase 3 conceptual modeling on the business-rule side. Remaining opens are just the exact delivery-charge Rupee amounts (#3 above) and the eventual real retail/buying prices, both already known to be coming later.

---

## Section 10 — Phase 2 Provisional Business Decisions (approved for Phase 3, 2026-07-26)

**Status: approved by Ahmed to unblock Phase 3 schema design and demo implementation. Not production-final — every decision below must be reviewed with the business owner before production deployment.**

### 1. Product Packaging and Sales Units

**BR-PROD-001 — Individual product sales.** Whether a package may be opened and sold as individual pieces is configured separately per product (`allowIndividualSale` or equivalent, default `false`). Boxes, jars, packets, and other packages cannot be opened for individual sale unless this setting is enabled.

**BR-PROD-002 — Individual piece pricing.** When a product can be sold by both package and individual piece, the individual piece price must be entered separately — never auto-divided from the package price. Individual sales cannot be activated until a valid piece price exists.

**BR-PROD-003 — Unconfirmed product units.** If the source data doesn't clearly identify the selling unit or packaging quantity, import the record as an unconfirmed SKU, keep it inactive, and flag it for admin review. Never guess whether it's a piece, packet, jar, box, or carton.

**BR-PROD-004 — Wholesale price basis.** The wholesale price from the source list applies to the complete selling unit described in the product name (a piece price belongs to one piece, a box price to one whole box, a jar price to one whole jar, etc.). If the selling unit is unclear, the product stays inactive until reviewed.

**BR-PROD-005 — Package conversions.** Package relationships (e.g. one box = 12 pieces, one carton = 24 boxes) may only be created when the conversion quantity is explicitly available or manually confirmed. No AI guesses or default conversion quantities. Uncertain products may still be imported but stay unlinked until reviewed.

### 2. Inventory Management

**BR-STOCK-001 — Stock reservation.** Stock is reserved when an order is confirmed. Track at least: stock on hand, reserved stock, and available stock (`Available = On Hand − Reserved`).

**BR-STOCK-002 — Stock deduction.** Reserved inventory is deducted from stock on hand only when the order is marked packed. Order confirmed → increase reserved quantity. Cancelled before packing → release reserved quantity. Packed → reduce stock on hand and reserved quantity together. Packed order later cancelled → create a reversal stock movement. Every stock change must create a traceable stock-movement record.

### 3. Payments and Client Credit

**BR-PAY-001 — Payment allocation.** When a client has multiple unpaid invoices, apply a payment to the oldest unpaid invoice by default; an authorised Admin/Owner may change the allocation, with who-changed-it-and-when recorded. The schema must support one payment being allocated across multiple invoices.

**BR-PAY-002 — Overpayments.** Excess payment beyond the outstanding amount is stored as client credit, usable on future orders/invoices. Every credit increase, use, adjustment, or refund is recorded in a client-credit ledger — never a bare editable balance with no transaction history.

### 4. Order Cancellation

**BR-ORDER-001 — Packed-order cancellation.** A packed order may be cancelled only with Admin/Owner approval. The cancellation must record the reason and the approving user, restore deducted inventory, reverse any active reservation, reverse/adjust related financial records where necessary, and create an audit-log entry. The original order and its history are never deleted.

### 5. Returns and Damaged Products

**BR-RETURN-001 — Version-one return process.** *(Reverses my earlier RETURN-Q01 recommendation to defer returns to Phase 2 — returns are now in v1 scope.)* v1 includes a simple Admin/Owner-managed return process. Each return records: original order/invoice, client, product, returned quantity, reason, product condition, refund/credit amount, whether restocked, whether marked damaged, processing staff member, and timestamp. Returned sellable products may re-enter inventory; damaged products are recorded separately and never automatically return to sellable stock.

### 6. Delivery Management

**BR-DEL-001 — Delivery responsibility.** *(Resolves DEL-Q01/the Option A vs. B fork above — Option B is the chosen answer.)* Delivery workers may update only deliveries assigned to them (assigned/dispatched/out for delivery/delivered/failed/returned). Admin/Owner may review all deliveries, correct or override statuses, reassign deliveries, and view delivery-status history. Every update or override records the responsible user and timestamp.

### 7. Record Deletion and Archiving

**BR-DATA-001 — Transactional records.** Orders, order items, invoices, payments, payment allocations, client-credit transactions, returns, stock movements, delivery history, and audit logs are never permanently deleted — use cancellation, reversal, voiding, or status changes instead.

**BR-DATA-002 — Master records.** Products, client businesses, and users may be permanently deleted only when they have zero related transactional history. If history exists: archive/deactivate, preserve historical relationships, never cascade-delete related transactions. *This explicitly replaces the schema's current cascading-delete behaviour on relations to transactional records — flagged as a required Phase 3 schema change, see below.*

### 8. Product Import Validation

**BR-IMPORT-001 — Duplicate names.** Duplicate product names are allowed when SKUs, units, package sizes, or variants differ. Import shows a duplicate warning, never auto-merges, and keeps enforcing SKU uniqueness.

**BR-IMPORT-002 — Missing or zero price.** Products with a missing/zero wholesale price may import, but stay inactive, flagged for price review, and unavailable for ordering.

**BR-IMPORT-003 — Import preview.** Every catalogue import uses a staged preview: valid rows, warning rows, invalid rows, duplicate-name warnings, missing-price warnings, unknown-unit warnings, and package-conversion warnings shown before commit. Admin approves valid rows; problem rows stay pending for correction.

**BR-IMPORT-004 — Import history.** Every import creates an import-batch record: filename, uploaded by, timestamp, total/valid/warning/invalid/imported row counts, batch status, and validation results. Imports must be repeatable, reviewable, and auditable.

### Phase 3 gate decision

Phase 2 is provisionally accepted for demo development. Codex may proceed to Phase 3 database schema design using these rules, provided that: existing files are inspected before changes; no file is modified without Ahmed's explicit permission; proposed schema changes are presented before implementation; business-specific rules stay configurable where practical; and every decision in this section is marked for business-owner review before production.

### Reconciliation with Sections 7–9 above

This section supersedes or extends several earlier answers in this file — noted here so nothing is silently contradictory:

- **RETURN-Q01** (Section 7): previously recommended deferring returns entirely to Phase 2. **Reversed by BR-RETURN-001** — a real return model is now v1 scope.
- **DEL-Q01** (Section 7): left as an open Option A/B fork last review. **Resolved by BR-DEL-001** — Option B: delivery workers get real, scoped self-service on their own assigned deliveries. FRD FR-DLV-02/03 (which say v1 is admin-recorded-on-worker's-behalf) are now stale and should be updated to match — done as part of this pass.
- **STOCK-Q01/Q02** (Section 7): previously recommended a simpler no-reservation, deduct-at-confirmation model. **Superseded by BR-STOCK-001/002** — a formal reserve-at-confirmation/deduct-at-packed model with an explicit reserved-quantity field.
- **CREDIT-Q01** (Section 7): oldest-invoice-first was already the recommendation; **BR-PAY-001 formalizes it** and adds a hard requirement the current schema doesn't yet meet — one `Payment` needs to be allocatable across multiple orders/invoices, which the current `Payment.orderId` (single relation) can't express.
- **AUDIT-Q01** (Section 7): "archive, never hard-delete" was already the stated principle; **BR-DATA-001/002 makes it enforceable** by calling out that the schema's existing `onDelete: Cascade` relations on transactional tables need to change to `Restrict` (block deletion of a master record with history) rather than `Cascade` (which would silently delete the history).
- **IMPORT-Q01, PID-Q01, PRICE-Q04** (Sections 7–8): already-recommended SKU-identity, zero-price-inactive, and import-batch/hash ideas are all formalized and confirmed by BR-IMPORT-001 through 004 and BR-PROD-003.

### Schema changes this section requires in Phase 3 (not yet made — for Codex to implement, per the gate decision above)

1. `Product.allowIndividualSale` (boolean, default false) — distinct from the existing `purchaseType` field, which governs wholesale/retail *channel* eligibility, not whether a package can be broken into pieces.
2. `ProductUnit` or `Product` needs an independent individual-piece price field (BR-PROD-002) — not derived from the package price.
3. An "unconfirmed/inactive" SKU import state (BR-PROD-003) distinct from ordinary `isArchived`.
4. `StockLevel.reservedQuantity` (BR-STOCK-001/002) — `availableQuantity` becomes a derived value, not stored.
5. A `PaymentAllocation` join entity between `Payment` and `Order`/`CreditTransaction` (BR-PAY-001) — `Payment` can no longer assume one payment maps to exactly one order.
6. `Return`/`ReturnItem` entities (BR-RETURN-001) — previously deferred, now needed.
7. Review every `onDelete: Cascade` on a relation pointing at a transactional table (Order, Payment, CreditTransaction, StockMovement, DeliveryAssignment, AuditLog, etc.) and change to `Restrict` where the related model is a master record (BR-DATA-002).
8. `ImportBatch`/`ImportRow`/`ImportError` staging entities (BR-IMPORT-003/004) — already flagged as a good addition in the Phase 0 prompt, now a firm requirement.
