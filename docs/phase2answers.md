# Phase 2 Answers — Raza Stationers Database Design

Answers to the 45 blocking / pilot-import / deferred questions from Codex's Phase 2 report, worked out from everything already decided in this project (PRD/BRD/FRD/TRD, `packages/types`, `packages/db/prisma/schema.prisma`, the admin QA report, and this conversation's own decisions) plus sound engineering defaults where no rule existed yet.

**Status legend**

- **DECIDED** — already answered by an existing, locked document or by something already built (schema, admin panel behavior). Not a guess.
- **RECOMMENDED** — a reasoned default consistent with existing docs, adopted as the working answer for Codex to build against. Should still get a quick yes/no from you or your father before it's treated as final.
- **UNKNOWN — NEEDS FATHER** — a real fact about how the business actually operates that no document or prior conversation contains. Not answered here; flagged honestly instead of invented.

Of the 45 questions: 19 were DECIDED from existing docs/schema, 19 are RECOMMENDED defaults, and the 7 that genuinely needed your father (PRICE-Q01, PKG-Q01, CAT-Q02, STOCK-Q03, ORDER-Q02, DEL-Q02, PID-Q02) are now **CONFIRMED BY FATHER** — see each entry below.

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
Largely DECIDED already. The real workbook's "Sales Type" column already answers this per product for all 2,156 rows: `Both` (1,986) = yes, sellable individually; `Wholesale/Bulk` (170) = no, bulk-only. Only the ~63 rows with an uncertain *category* (not sales type) need a second look.

**PKG-Q03 — Does each packaging level get its own SKU/barcode and price?**
DECIDED. Follows from VAR-Q01/BRD PR-02: piece/box/carton of the same product share one `Product` row and stock, expressed as multiple `ProductUnit` rows — unless the bulk price doesn't scale linearly, in which case a `DiscountRule` (fixed price override) is used instead of a new SKU.

**PRICE-Q01 — What does each wholesale price represent (per jar/piece/package)?**
CONFIRMED BY FATHER. Read the price basis directly off the item name at import time: name says "single" → price is per single piece; name names a container ("jar," etc.) → price is for the whole container; name states a pack count ("30 pcs," "40 pcs") → price is for the whole pack. This is a real import-parsing rule, not a per-product manual lookup — the importer should keyword-match each `Item Name` for these patterns to set `ProductUnit`/pricing correctly.

**PRICE-Q02 — Are retail/wholesale prices independently entered per sale unit?**
DECIDED (mechanism). Default: a bulk unit's price is a linear multiple of the base `wholesalePrice`/`retailPrice` (exactly what `apps/web`'s `calculateUnitPrice` already does), with an explicit override point (`DiscountRule.fixedPrice`) for the specific products where a carton/box price isn't a simple multiple. Which specific products need the override is unknown until flagged.

**PRICE-Q03 — Do pending accounts see retail price or no price?**
DECIDED — this isn't actually a contradiction. A **registered-but-pending** business account sees CD-04's "pending approval" message with no price at all. An **anonymous guest** browsing without registering sees the standard retail price (CD-03). FRD §8's "guests and pending accounts resolve to retail" describes the price-resolution function's safe fallback (never leak a wholesale rate to anyone unapproved) — the UI layer additionally hides pricing entirely for a pending account behind the approval banner. Both rules coexist; nothing needs to change.

**CLIENT-Q01 — Can one person act for multiple client businesses?**
DECIDED. Already modeled as many-to-many: `BusinessUserLink` lets one `User` link to several `ClientBusiness` rows, each with its own `businessRole`. No schema change needed.

**CREDIT-Q01 — Balance calc / which invoice does a payment settle?**
RECOMMENDED. Default: oldest-outstanding-invoice-first automatic allocation, with owner/admin able to manually reallocate a specific payment when needed. Balance itself stays derived from `CreditTransaction` rows, never directly edited (already the schema's design).

**CREDIT-Q02 — What happens when a credit order exceeds the limit?**
DECIDED, already built. `OrderStatus.pending_owner_approval` exists specifically for this — an over-limit credit order routes to the owner for a manual decision rather than being auto-rejected (FRD §9).

**STOCK-Q01 — When is stock reserved and deducted?**
RECOMMENDED. No formal "reservation" hold while browsing/in-cart (keeps v1 simple); stock deducts at order **confirmation**, recorded as a `StockMovement(type=sale)` tied to the order. Needs your father's confirmation if he wants a stricter hold-at-cart behavior given repeat wholesale order volume.

**STOCK-Q02 — Shortage / cancellation / failed-delivery reversal?**
RECOMMENDED. Full automatic reversal of the original sale movement on cancellation. Failed-delivery returns get a manual, reason-required adjustment (FR-STK-07) instead of an automatic one, since "resellable vs. damaged" needs a human judgment call.

**SUP-Q01 — Does v1 need formal supplier/purchase-receipt records?**
DECIDED — no. `StockMovement.supplier` (free text) + `purchasePrice` + `invoiceNumber` captured per restock (BRD SK-01) is already the right level of detail for a single-location wholesaler. A `Supplier`/`PurchaseReceipt` master-data system is out of locked scope.

**ORDER-Q01 — Partial fulfilment / backorders?**
DECIDED — no, not in v1. If a line can't be fully filled, admin adjusts or rejects it via the existing change-request workflow (FR-ORD-02) rather than the system auto-splitting shipments. No new order states needed.

**RETURN-Q01 — Full/partial return rules?**
RECOMMENDED — defer to Phase 2. Returns have no FR-RET-* requirements anywhere in the locked FRD; treat them the same tier as the already-documented Phase 2 items (automated discount engine, live GPS). `DeliveryAssignment.returnedItems` already captures enough for v1 record-keeping. Needs your father's sign-off that manual/off-system return handling is acceptable for the pilot.

**DEL-Q01 — Who records delivery status, what proof?**
DECIDED — resolves the "contradiction" directly. The admin panel's `/delivery` page is already gated "blocked for Packing role, dispatch & outcome recording open to Delivery/Admin" per the admin QA report — meaning delivery workers are real staff users with their own login recording outcomes directly, not admin entering it on their behalf. Proof = `DeliveryAssignment`'s existing fields (cashCollected, failedReason, returnedItems, timestamps).

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

**CAT-Q02 — Which of the 63 uncertain categories should change?**
CONFIRMED BY FATHER — a general rule, not a row-by-row fix. If a row has no item name at all, drop it from the import entirely. If the name is present but too unclear/truncated to categorize confidently, put it in a single generic **"Others"** category rather than forcing it into a specific guess. This means the two generated catch-alls ("Writing Instruments – Model Unclear," "Unidentified/Truncated Source Entries") should be merged into one real "Others" category at import — no manual per-row category assignment needed.

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
