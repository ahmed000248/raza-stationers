# Phase 4 Physical Database Schema Design — v0.1

**Status:** implemented for the demo after Ahmed's conditional Stage A approval on 2026-07-26. Production use still requires business-owner, accounting, legal and migration review.

This document records the physical-schema decisions implemented in `packages/db/prisma/schema.prisma`. Phase 4 changes documentation, Mermaid models and the Prisma schema only. It does not create a migration, connect to a database, generate Prisma Client, seed data or import the catalogue.

## Scope boundary

Active version 0.1 scope includes catalogue, packaging prices, client businesses, optional credit, orders, invoices, payments, allocations, returns, refunds, inventory, delivery attempts, import staging, audit-event shape, expenses and simple in-app notifications.

Deferred:

- Category hierarchy; Category is flat in v0.1.
- Barcode, Brand and ProductImage.
- Supplier master, purchasing, purchase orders, goods receipt and supplier returns.
- Registration-document and delivery-proof file uploads.
- Multiple active warehouses and warehouse-transfer workflows.
- Reusable client-address collections.
- Payment gateways, full general ledger, GPS and external messaging.
- Advanced price lists, formal stock counts and mobile-specific database expansion.

## Product, packaging and SKU

`Product` is the stock-distinguishing SKU. Independently stocked colour, size or model differences are separate Products. Every Product has:

- CUID primary key.
- Required unique `skuNumber` and required unique visible `sku`.
- Visible format `RS-000001`.
- Review/activation and unit-confirmation state.
- `allowIndividualSale`, default `false`.
- At least one ProductPackaging and exactly one base package.

SKU generation will use a future PostgreSQL sequence. NestJS obtains one non-transactional sequence value, formats it and stores both number and visible SKU. Sequence gaps are acceptable; values are concurrency-safe and never reused after rollback or archival. PostgreSQL uniqueness and a format check provide the final guard.

`ProductPackaging` represents a selling option sharing Product base inventory. It stores UOM, explicit conversion, base marker, confirmation state and active state. Base conversion is 1. Conversions are never inferred.

Individual/bulk/both classification is import provenance only. A sale is authorised only when Product and ProductPackaging are active, unit/conversion data is confirmed, individual opening rules are satisfied where relevant, stock is available, and a positive applicable price exists.

## Pricing

Retail and wholesale prices are independent effective-dated `ProductPrice` records belonging to ProductPackaging. All v0.1 monetary fields use `Decimal(14,2)` and PKR.

Resolution stops at the first match:

1. Final fixed ClientSpecificPrice.
2. Product-level percentage discount.
3. Category-level percentage discount.
4. Account-level percentage discount.
5. Positive wholesale ProductPrice.
6. Positive retail ProductPrice fallback.

Discounts do not stack. A wholesale-to-retail fallback exposes an admin warning. No positive price means the package is not orderable. A package price is never multiplied or divided by its conversion.

Future PostgreSQL migration work must add non-overlapping-period exclusion constraints for ProductPrice and ClientSpecificPrice. Prisma cannot express those constraints.

## Flat categories and deferred barcode

Category has no parent field, self relation or hierarchy index in v0.1. Future nesting requires a separately approved migration.

Product has no barcode field. The current workbook and PDF contain no reliable barcode values. Any future barcode feature requires source validation, uniqueness rules and separate approval.

## Clients and optional credit

`ClientBusiness → 0..1 ClientCreditAccount`. No credit row exists until the Owner approves/configures credit. The account stores limit, credit days and status. Limit changes and over-limit order decisions retain Owner, reason and value snapshots.

Client credit balance is calculated from `CreditLedgerEntry`; it is never directly edited. User/business links have start/end actors and timestamps so historical Orders keep their acting User after a link ends.

User email, ClientBusiness email, NTN and CNIC are optional in the physical schema. No document-upload model exists.

## Inventory terminology

Every StockBalance, StockReservation and StockMovement quantity is expressed in the Product base unit.

| Quantity | Meaning |
|---|---|
| `onHandQuantity` | Sellable physical stock at the StockLocation. |
| `reservedQuantity` | The portion of on-hand committed by active reservations. It is a subset of on-hand. |
| `available` | Calculated as `onHandQuantity - reservedQuantity`; it is not stored. |
| `unavailableQuantity` | Business-owned packed, returned or inspection-pending stock at the warehouse that is not sellable. |
| `inTransitQuantity` | Business-owned dispatched stock outside the warehouse. |
| `damagedQuantity` | Inspected business-owned damaged stock that is not sellable. |

Total business-owned inventory is:

`onHandQuantity + unavailableQuantity + inTransitQuantity + damagedQuantity`

Reserved is not added again because it is already part of on-hand.

StockMovement and StockReservation are historical authority. StockBalance is a transactionally maintained projection and may not be directly changed without movement, reason, actor and audit-event creation.

Order placement only revalidates. Confirmation locks StockBalance rows in deterministic Product order and reserves every line atomically. Packing consumes reservations and transfers sellable/on-hand to unavailable. Dispatch transfers unavailable to in-transit. Delivery transfers in-transit outside business ownership. Failed delivery/cancellation remains unavailable or in-transit until physical warehouse receipt and inspection sends it to sellable, damaged or quarantined/unavailable.

## Orders, invoices, payments and returns

The Order state machine is defined in the FRD. Packed/dispatched cancellation proceeds through `return_pending_inspection`; stock cannot immediately become sellable.

OrderItem snapshots SKU/name, packaging, UOM, conversion, quantity, price type/base, discount, tax and totals. Later catalogue changes cannot affect it.

Version 0.1 uses one Invoice per Order. Invoice visible numbers use `RS-INV-YYYY-000001`, generated by a transactionally locked `DocumentSequence` row per year. Credit notes use the same document-sequence approach and preserve original Invoice totals.

Payment and Invoice are many-to-many through PaymentAllocation. Only verified Payments allocate. Oldest outstanding Invoice is the default. Reallocation marks earlier allocation rows reversed and adds replacement rows. Cross-row total constraints require a NestJS transaction and may later receive PostgreSQL triggers.

Returns reference original OrderItems. Multiple partial Returns are supported; locked service validation prevents cumulative return quantity exceeding delivered quantity. Inspection decides sellable, damaged or quarantined destination. Refund approvals and processing actors are separate. Client-credit refunds create ledger entries.

## Delivery

One Order has zero or one Delivery; one Delivery has one or more numbered DeliveryAttempts. Assignment and status histories are retained. Workers update only their current assigned attempt. Admin/Owner overrides require a reason. Delivery-proof files are deferred; plain recipient confirmation and notes are permitted.

## Import staging and provenance

ImportBatch retains filename, SHA-256, status, row counts and actors. ImportRow retains raw/normalized JSON and validation/commit state. ImportIssue retains warnings/errors and resolution. SourceRecordMapping links a source row to exactly one canonical Category, Product, ProductPackaging or ProductPrice target.

A future partial unique index blocks duplicate SHA-256 values only after a batch is committed. Edited files produce new batches. Product matching uses existing source mappings and explicit SKU; repeated display names create warnings and never automatic merges. Selected approved rows commit in one transaction while staging/history survives rollback.

## Deletion policy

All business relations use `Restrict`; no Cascade relation remains in schema v0.1.

| Record class | Policy |
|---|---|
| Order, item, status, change, cancellation | Never hard-delete; cancel/reject/retain. |
| Invoice, credit note, payment, allocation, refund, credit ledger | Never hard-delete; void/reverse/retain. |
| Stock movement/reservation | Never hard-delete; counter-movement or release/consume state. |
| Return and delivery attempt/history | Never hard-delete. |
| Import batch/row/issue/mapping | Never hard-delete. |
| AuditLog | Never hard-delete; retained indefinitely for demo. |
| Product, Category, ClientBusiness, User | Hard-delete only when no transaction, provenance or audit reference exists; otherwise archive/deactivate. |
| ExpenseEntry | Void, do not delete. |

Conditional master deletion is NestJS policy backed by restrictive foreign keys. Prisma cannot express the complete no-history predicate.

## Audit enforcement boundary

AuditLog models actor, action, entity, redacted before/after JSON, reason, correlation ID and timestamp. `schema.prisma` does not enforce that an audit row is created, prevent update/delete by itself, or redact secrets.

Required later work:

- NestJS authorization and same-transaction audit creation.
- Central sensitive-field redaction before JSON serialization.
- PostgreSQL privileges/triggers for append-only enforcement.
- Tests proving passwords, tokens, authentication secrets and full sensitive documents never enter AuditLog.

## Future PostgreSQL constraints

The first approved migration must be reviewed separately and should add:

- SKU sequence and SKU format/nonblank checks.
- Positive money, quantity and conversion checks.
- Nonnegative stock bucket checks and `reserved <= onHand`.
- At-most-one base package partial unique index and an at-least-one-base service/constraint-trigger strategy.
- Exactly one active StockLocation partial unique index for v1.
- ProductPrice and ClientSpecificPrice effective-period exclusion constraints.
- Active business-link and current delivery-assignment partial unique indexes.
- Committed ImportBatch SHA-256 partial unique index.
- Target-cardinality checks for DiscountRule, NotificationSubscription and SourceRecordMapping.
- Append-only protections for financial, inventory, status, import and audit histories.

## Known Prisma limitations

Prisma schema cannot by itself enforce effective-period exclusion, cross-row allocation totals, cumulative returns, unit-dependent whole quantities, exactly one base package, conditional hard deletion, worker permissions, audit redaction/creation, append-only records or stock reservation concurrency. These are explicitly assigned to PostgreSQL, NestJS transactions or authorization guards rather than being claimed as schema-only guarantees.

## Required application follow-up

Frontend/shared/backend code was intentionally not changed in Phase 4. Follow-up includes:

- Remove frontend calculated package pricing and implement backend price resolution.
- Update shared types and Zod enums to the new physical contracts.
- Make registration email/NTN/CNIC optional and remove upload requirements.
- Replace outdated delivery-area mocks with configurable zones.
- Implement pricing, reservation, packing, invoice numbering, allocation, refund, return, import and audit transactions.
- Implement delivery-worker/current-assignment authorization.

## Remaining production confirmations

Retail/buying prices, opening stock, current client balances, exact delivery charges, unconfirmed conversions/classifications, final category approval, credit policies, refund/accounting policy and production audit retention remain outstanding. They are data/configuration work, not schema blockers, and no values are invented here.

## Stage B validation report

- `prisma format`: passed using the repository-installed Prisma CLI.
- `prisma validate`: passed with a nonconnecting placeholder URL used only to satisfy schema environment parsing.
- Mermaid syntax: 8/8 diagrams passed parser validation (six ERDs and two flowcharts).
- `git diff --check`: passed.
- Prisma directory inspection: contains only `schema.prisma`; no migration directory was created.
- No Prisma Client, SQL, database artifact, seed or import output was generated.
- No database connection, commit or push occurred.
