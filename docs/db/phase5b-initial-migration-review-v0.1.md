# Phase 5B Initial Migration Review v0.1

Status: generated and statically reviewed; not applied

Migration: `20260726162130_initial_schema_v0_1`

Target: future development Supabase project only, after independent Phase 5C review and Ahmed's approval

## 1. Scope and safety statement

Phase 5B reconciled the approved schema and documentation gaps, generated one initial Prisma migration from an empty source entirely offline, and added the approved PostgreSQL protections. No database or Supabase connection was made. The migration was not applied. Prisma Client, seeds, imports, role credentials, browser policies, backend modules and frontend changes are outside this phase and were not produced.

The migration is a review artifact, not deployment authorization. SQL execution and behavioural tests remain Phase 5C/5D work.

## 2. Phase 4 checkpoint

- Branch: `main`
- HEAD before Phase 5B: `1272cb8a10997d02effdfa843bdfe0de068778c1`
- Annotated Phase 4 tag target: `milestone/database-phase-4-schema-v0.1` at the same commit
- Tracked working tree and index at the safety gate: clean
- Prisma CLI and package version: `6.19.3`
- Existing migration directories or SQL: none
- Existing Phase 5B artifacts: none
- Tracked credential files: none found
- Machine-local `settings.local.json` files were not inspected, modified, staged or reported.

## 3. Approved decisions

1. Product low-stock threshold is nullable, per Product, expressed in the base inventory unit, nonnegative when configured, and unseeded.
2. Order numbers use `RS-ORD-YYYY-000001`, with an atomic counter by document type and year.
3. `CreditLedgerEntry` stores customer-owned credit only; invoice debt is calculated separately.
4. A CreditNote has exactly one source type: cancellation, return or Owner-approved manual adjustment.
5. Version 0.1 business tables remain in `public`, with Data API exposure disabled later, RLS enabled as defence-in-depth, browser/Data API role privileges revoked, and NestJS retained as the application boundary.
6. `directUrl`, environment files and Supabase connectivity remain deferred.

## 4. Schema corrections

- Added `Product.lowStockThresholdBase Decimal? @db.Decimal(18, 3)` mapped to `low_stock_threshold_base`.
- Added required `Order.orderYear` and `Order.sequenceNumber`, with `@@unique([orderYear, sequenceNumber])`; retained the required unique `orderNumber` and internal CUID ID.
- Added `order` to `DocumentType`.
- Replaced ambiguous credit-ledger types with signed store-credit concepts: `overpayment_credit`, `refund_credit`, `manual_credit_adjustment`, `reversal_credit`, `credit_applied`, `credit_payout`, `manual_debit_adjustment`, and `reversal_debit`.
- Added `CreditNoteSourceType` with `cancellation`, `return`, and `manual_adjustment`; added required `CreditNote.sourceType` while retaining nullable source-specific relations.
- No active category hierarchy or barcode, brand, image, supplier, purchasing, upload, delivery-proof or multi-warehouse workflow was introduced.

## 5. Updated model and enum counts

- Prisma models: **48** (unchanged)
- Prisma enums: **40** (increased from 39 because `CreditNoteSourceType` was added)
- `onDelete: Cascade`: **0**
- `directUrl`: **0**

## 6. Prisma-generated migration summary

Offline generation used:

```text
npx --no-install prisma migrate diff --from-empty --to-schema-datamodel packages/db/prisma/schema.prisma --script --output packages/db/prisma/migrations/20260726162130_initial_schema_v0_1/migration.sql
```

The generated baseline contains 40 `CREATE TYPE`, 48 `CREATE TABLE`, 96 Prisma indexes (26 unique and 70 non-unique), and 128 foreign keys. All generated table and column names were inspected before custom SQL was added; the physical identifiers are quoted snake_case names such as `"products"`, `"product_packaging"`, and `"credit_notes"`.

## 7. Custom PostgreSQL SQL inventory

The migration adds one extension, 93 named row-local CHECK constraints, 11 partial unique indexes, two GiST exclusions, one non-cycling sequence, 12 functions, 16 triggers, 48 RLS enables, explicit privilege revocations, three default-privilege revocations, and one outer transaction.

Validation labels used below:

- **Static-pass**: names, targets, counts and structural delimiters were checked locally.
- **Phase 5C required**: PostgreSQL parsing, extension/operator availability and live behavioural tests have deliberately not been performed.

Every comma-separated name in an inventory row is a distinct custom object. The enforcement, validation and risk columns apply to each named object in that row.

## 8. Extension details

| Object | Scope | Purpose | Enforcement layer | Validation | Risk if incorrect |
|---|---|---|---|---|---|
| `btree_gist` extension in `extensions` schema | Pricing exclusions | Supplies GiST operator classes for scalar equality dimensions | PostgreSQL extension | Static-pass; Phase 5C required | Migration failure or ineffective price-overlap protection |

`CREATE EXTENSION IF NOT EXISTS "btree_gist" WITH SCHEMA "extensions"` is placed before the exclusions and does not pin a version. Supabase documents use of a separate schema such as `extensions`, and lists `btree_gist` as supported. Project-specific extension placement must still be confirmed before application: <https://supabase.com/docs/guides/database/extensions>.

## 9. CHECK constraints

All constraints below are row-local; none query another row. Cross-row totals, role authorization, accounting sign-by-entry-type rules and business state machines remain outside CHECK constraints.

| Table/model | Named CHECK object(s) | Purpose | Enforcement layer | Validation | Risk if incorrect |
|---|---|---|---|---|---|
| `users` / User | `users_deactivation_metadata_check` | Pair deactivation actor and time | PostgreSQL CHECK | Static-pass; Phase 5C required | Incomplete audit metadata or blocked lifecycle update |
| `client_businesses` / ClientBusiness | `client_businesses_archive_metadata_check` | Pair archive actor and time | PostgreSQL CHECK | Static-pass; Phase 5C required | Incomplete archive evidence |
| `business_user_links` / BusinessUserLink | `business_user_links_end_metadata_check` | Pair end metadata and time order | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid active-link history |
| `client_credit_accounts` / ClientCreditAccount | `client_credit_accounts_nonnegative_check` | Prevent negative limits/days | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid credit configuration |
| `client_credit_limit_changes` / ClientCreditLimitChange | `client_credit_limit_changes_nonnegative_check` | Keep before/after limits and days nonnegative | PostgreSQL CHECK | Static-pass; Phase 5C required | Corrupt audit values |
| `categories` / Category | `categories_archive_metadata_check` | Pair archive actor and time | PostgreSQL CHECK | Static-pass; Phase 5C required | Incomplete archive evidence |
| `products` / Product | `products_sku_number_range_check`, `products_sku_nonblank_check`, `products_sku_format_check`, `products_sku_consistency_check`, `products_low_stock_threshold_check`, `products_activation_metadata_check`, `products_archive_metadata_check` | Enforce SKU range/format/mapping, nullable nonnegative threshold and lifecycle metadata pairs | PostgreSQL CHECK | Static-pass; Phase 5C required | Duplicate/malformed identity, invalid alert configuration or lifecycle evidence |
| `units_of_measure` / UnitOfMeasure | `units_of_measure_decimal_scale_check`, `units_of_measure_fractional_scale_check` | Bound scale and force scale zero for non-fractional units | PostgreSQL CHECK | Static-pass; Phase 5C required | Unsupported quantities or rejected valid unit setup |
| `product_packaging` / ProductPackaging | `product_packaging_conversion_positive_check`, `product_packaging_base_conversion_check` | Positive conversions and base conversion equal to one | PostgreSQL CHECK | Static-pass; Phase 5C required | Inventory conversion errors |
| `product_prices` / ProductPrice | `product_prices_amount_positive_check`, `product_prices_effective_range_check` | Positive price and valid interval | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid sale price or time range |
| `client_specific_prices` / ClientSpecificPrice | `client_specific_prices_amount_positive_check`, `client_specific_prices_effective_range_check` | Positive client price and valid interval | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid client price or time range |
| `discount_rules` / DiscountRule | `discount_rules_percent_check`, `discount_rules_target_check` | Bound percentage and enforce scope-aware target cardinality | PostgreSQL CHECK | Static-pass; Phase 5C required | Misapplied or excessive discount |
| `discount_change_logs` / DiscountChangeLog | `discount_change_logs_percent_check` | Bound optional before/after percentages | PostgreSQL CHECK | Static-pass; Phase 5C required | Misleading discount audit |
| `stock_locations` / StockLocation | `stock_locations_archive_metadata_check` | Pair archive actor and time | PostgreSQL CHECK | Static-pass; Phase 5C required | Incomplete location history |
| `stock_balances` / StockBalance | `stock_balances_nonnegative_check`, `stock_balances_reserved_within_on_hand_check` | Prevent negative buckets and excess reservation | PostgreSQL CHECK | Static-pass; Phase 5C required | Oversell or double-counting symptoms |
| `stock_reservations` / StockReservation | `stock_reservations_quantity_positive_check`, `stock_reservations_terminal_metadata_check` | Positive base-unit quantity and coherent terminal metadata | PostgreSQL CHECK | Static-pass; Phase 5C required | Inventory released/consumed without evidence |
| `stock_movements` / StockMovement | `stock_movements_quantity_positive_check`, `stock_movements_bucket_endpoints_check`, `stock_movements_reason_nonblank_check` | Positive base-unit movement, meaningful endpoints and reason | PostgreSQL CHECK | Static-pass; Phase 5C required | Inventory drift or unauditable movement |
| `orders` / Order | `orders_year_check`, `orders_sequence_number_check`, `orders_number_format_check`, `orders_number_consistency_check`, `orders_totals_nonnegative_check`, `orders_discount_within_subtotal_check`, `orders_total_consistency_check` | Stable numbering domain/format and safe document arithmetic | PostgreSQL CHECK | Static-pass; Phase 5C required | Wrong visible identity or financial totals |
| `order_items` / OrderItem | `order_items_quantity_positive_check`, `order_items_price_positive_check`, `order_items_amounts_nonnegative_check`, `order_items_discount_percent_check`, `order_items_tax_rate_check`, `order_items_discount_within_subtotal_check` | Bound quantities, price, snapshots, rates and discount | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid line snapshot; multiplication/rounding remains NestJS-owned |
| `order_change_requests` / OrderChangeRequest | `order_change_requests_review_metadata_check` | Pair reviewer/time and preserve ordering | PostgreSQL CHECK | Static-pass; Phase 5C required | Incomplete review evidence |
| `order_credit_approvals` / OrderCreditApproval | `order_credit_approvals_amounts_nonnegative_check` | Nonnegative approval snapshots | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid credit decision evidence |
| `document_sequences` / DocumentSequence | `document_sequences_year_check`, `document_sequences_next_value_check` | Bound year and next counter | PostgreSQL CHECK | Static-pass; Phase 5C required | Number exhaustion/format mismatch |
| `invoices` / Invoice | `invoices_year_check`, `invoices_sequence_number_check`, `invoices_number_format_check`, `invoices_number_consistency_check`, `invoices_totals_nonnegative_check`, `invoices_discount_within_subtotal_check`, `invoices_total_consistency_check`, `invoices_due_date_check` | Enforce number format, arithmetic and due-date order | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid legal/financial snapshot |
| `credit_notes` / CreditNote | `credit_notes_amount_positive_check`, `credit_notes_year_check`, `credit_notes_sequence_number_check`, `credit_notes_number_format_check`, `credit_notes_number_consistency_check`, `credit_notes_source_cardinality_check`, `credit_notes_approval_metadata_check`, `credit_notes_issue_metadata_check`, `credit_notes_reason_nonblank_check` | Positive amount, stable number, exactly one approved source representation and coherent approval/issue evidence | PostgreSQL CHECK | Static-pass; Phase 5C required | Untraceable or malformed financial adjustment |
| `payments` / Payment | `payments_amount_positive_check`, `payments_submission_metadata_check`, `payments_verification_metadata_check` | Positive amount and paired workflow metadata | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid or unauditable payment |
| `payment_allocations` / PaymentAllocation | `payment_allocations_amount_positive_check`, `payment_allocations_reversal_metadata_check` | Positive allocation and all-or-none reversal metadata | PostgreSQL CHECK | Static-pass; Phase 5C required | Incorrect invoice outstanding calculation |
| `credit_ledger_entries` / CreditLedgerEntry | `credit_ledger_entries_amount_nonzero_check`, `credit_ledger_entries_reason_nonblank_check` | Nonzero signed store-credit entry and reason | PostgreSQL CHECK | Static-pass; Phase 5C required | Incorrect customer-owned credit balance |
| `refunds` / Refund | `refunds_amount_positive_check`, `refunds_approval_metadata_check`, `refunds_processing_metadata_check` | Positive refund and coherent approval/processing evidence | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid payout or audit trail |
| `return_items` / ReturnItem | `return_items_quantity_positive_check`, `return_items_inspection_metadata_check` | Positive quantities and paired inspection evidence | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid returned inventory |
| `delivery_zones` / DeliveryZone | `delivery_zones_charge_check` | Nonnegative/free delivery charge semantics | PostgreSQL CHECK | Static-pass; Phase 5C required | Incorrect delivery pricing |
| `delivery_attempts` / DeliveryAttempt | `delivery_attempts_number_positive_check`, `delivery_attempts_inspection_metadata_check`, `delivery_attempts_timestamp_order_check` | Positive attempt number and coherent evidence/times | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid delivery history |
| `delivery_assignments` / DeliveryAssignment | `delivery_assignments_end_time_check` | End cannot precede assignment | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid worker assignment history |
| `import_batches` / ImportBatch | `import_batches_sha256_check`, `import_batches_counts_check`, `import_batches_approval_metadata_check`, `import_batches_commit_metadata_check` | Lowercase SHA-256, bounded counts and paired workflow metadata | PostgreSQL CHECK | Static-pass; Phase 5C required | Duplicate/invalid import provenance |
| `import_rows` / ImportRow | `import_rows_source_row_number_check` | Positive source row number | PostgreSQL CHECK | Static-pass; Phase 5C required | Broken source traceability |
| `import_issues` / ImportIssue | `import_issues_resolution_metadata_check` | All-or-none resolution evidence | PostgreSQL CHECK | Static-pass; Phase 5C required | Unverifiable issue resolution |
| `source_record_mappings` / SourceRecordMapping | `source_record_mappings_one_target_check` | Exactly one canonical target | PostgreSQL CHECK | Static-pass; Phase 5C required | Ambiguous import mapping |
| `expense_entries` / ExpenseEntry | `expense_entries_amount_positive_check`, `expense_entries_void_metadata_check` | Positive expense and coherent void evidence | PostgreSQL CHECK | Static-pass; Phase 5C required | Invalid expense history |
| `notification_subscriptions` / NotificationSubscription | `notification_subscriptions_target_check` | Exactly one target consistent with scope | PostgreSQL CHECK | Static-pass; Phase 5C required | Misrouted notification |

## 10. Partial indexes

| Object | Table/model | Purpose | Enforcement layer | Validation | Risk if incorrect |
|---|---|---|---|---|---|
| `product_packaging_one_base_per_product_uidx` | `product_packaging` / ProductPackaging | At most one base package per Product | PostgreSQL partial unique index | Static-pass; Phase 5C required | Ambiguous base-unit conversion |
| `stock_locations_one_active_uidx` | `stock_locations` / StockLocation | At most one active v0.1 location; archived history may coexist | PostgreSQL partial unique index | Static-pass; Phase 5C required | Version-one stock split across active locations |
| `import_batches_committed_sha256_uidx` | `import_batches` / ImportBatch | Prevent duplicate committed source content while allowing retries/history | PostgreSQL partial unique index | Static-pass; Phase 5C required | Duplicate catalogue commit |
| `delivery_assignments_one_current_uidx` | `delivery_assignments` / DeliveryAssignment | At most one unended assignment per attempt | PostgreSQL partial unique index | Static-pass; Phase 5C required | Concurrent delivery ownership |
| `business_user_links_one_current_uidx` | `business_user_links` / BusinessUserLink | One current user/business link; ended history may coexist | PostgreSQL partial unique index | Static-pass; Phase 5C required | Duplicate active membership |
| `stock_reservations_one_active_per_item_uidx` | `stock_reservations` / StockReservation | One active reservation per order item; terminal history may coexist | PostgreSQL partial unique index | Static-pass; Phase 5C required | Duplicate stock reservation |
| `discount_rules_one_active_account_uidx` | `discount_rules` / DiscountRule | One active account-wide rule per client | PostgreSQL partial unique index | Static-pass; Phase 5C required | Ambiguous discount selection |
| `discount_rules_one_active_category_uidx` | `discount_rules` / DiscountRule | One active client/category rule | PostgreSQL partial unique index | Static-pass; Phase 5C required | Ambiguous discount selection |
| `discount_rules_one_active_product_uidx` | `discount_rules` / DiscountRule | One active client/product rule | PostgreSQL partial unique index | Static-pass; Phase 5C required | Ambiguous discount selection |
| `notification_subscriptions_one_active_product_uidx` | `notification_subscriptions` / NotificationSubscription | One active user/product subscription | PostgreSQL partial unique index | Static-pass; Phase 5C required | Duplicate alert delivery |
| `notification_subscriptions_one_active_category_uidx` | `notification_subscriptions` / NotificationSubscription | One active user/category subscription | PostgreSQL partial unique index | Static-pass; Phase 5C required | Duplicate alert delivery |

## 11. Exclusion constraints

| Object | Table/model | Purpose | Enforcement layer | Validation | Risk if incorrect |
|---|---|---|---|---|---|
| `product_prices_effective_period_excl` | `product_prices` / ProductPrice | Reject overlapping `[effective_from, effective_to)` periods for packaging, price type and currency; allow adjacency and unbounded end | PostgreSQL GiST exclusion | Static-pass; Phase 5C required | Ambiguous applicable product price |
| `client_specific_prices_effective_period_excl` | `client_specific_prices` / ClientSpecificPrice | Reject overlapping half-open periods for client, packaging and currency | PostgreSQL GiST exclusion | Static-pass; Phase 5C required | Ambiguous applicable client price |

The constraints rely on `btree_gist` defaults for scalar equality and PostgreSQL `tstzrange` overlap. Extension schema and operator-class resolution must be exercised on the target PostgreSQL/Supabase version in Phase 5C/5D.

## 12. Sequences and functions

| Object | Table/model | Purpose | Enforcement layer | Validation | Risk if incorrect |
|---|---|---|---|---|---|
| `product_sku_seq` | Product | Non-cycling bigint counter, 1..999999, cache 1; intentionally not owned by Product so deleted/rolled-back values are not recycled operationally | PostgreSQL sequence | Static-pass; Phase 5C required | SKU collision, exhaustion or reuse |
| `allocate_product_sku()` | Product | Atomically return numeric SKU and `RS-000001` text pair | PostgreSQL function; NestJS caller later | Static-pass; Phase 5C required | Mismatched or duplicate SKU allocation |
| `allocate_document_number(document_type, integer)` | DocumentSequence, Order, Invoice, CreditNote | Atomic upsert/increment and formatted yearly order/invoice/credit-note number | PostgreSQL function; NestJS caller later | Static-pass; Phase 5C required | Duplicate, skipped or malformed document identity |
| `prevent_product_sku_change()` | Product | Trigger helper rejecting SKU identity updates | PostgreSQL trigger function | Static-pass; Phase 5C required | Product identity drift |
| `prevent_order_identity_change()` | Order | Trigger helper rejecting visible order identity updates | PostgreSQL trigger function | Static-pass; Phase 5C required | Order identity drift |
| `prevent_invoice_snapshot_change()` | Invoice | Trigger helper freezing issued invoice identity and financial snapshot while allowing status changes | PostgreSQL trigger function | Static-pass; Phase 5C required | Altered financial record or blocked legitimate operation |
| `protect_credit_note_snapshot()` | CreditNote | Freeze number always and source/financial evidence after issued/voided | PostgreSQL trigger function | Static-pass; Phase 5C required | Altered credit evidence or blocked approved transition |
| `prevent_append_only_mutation()` | Seven ledger/history tables | Shared narrow rejection helper for UPDATE/DELETE | PostgreSQL trigger function | Static-pass; Phase 5C required | Mutable audit trail if missing; blocked maintenance if overbroad |
| `protect_payment_allocation()` | PaymentAllocation | Allow only one complete reversal mutation; reject deletes/core changes | PostgreSQL trigger function | Static-pass; Phase 5C required | Incorrect invoice outstanding balance |
| `protect_stock_reservation()` | StockReservation | Allow active to consumed/released with coherent evidence; reject deletes/core changes | PostgreSQL trigger function | Static-pass; Phase 5C required | Inventory leakage or blocked fulfilment |
| `protect_import_batch()` | ImportBatch | Preserve source identity; freeze committed batch; reject delete | PostgreSQL trigger function | Static-pass; Phase 5C required | Altered import provenance |
| `protect_import_row()` | ImportRow | Preserve raw source identity; freeze when parent committed; reject delete | PostgreSQL trigger function | Static-pass; Phase 5C required | Altered raw import evidence |
| `protect_import_issue()` | ImportIssue | Preserve evidence and allow one complete resolution mutation | PostgreSQL trigger function | Static-pass; Phase 5C required | Mutable validation evidence or blocked resolution |

All functions set an explicit search path, none uses `SECURITY DEFINER`, and execution is explicitly revoked from `PUBLIC`, `anon`, `authenticated`, and `service_role`. Phase 5D must grant only the minimum required allocator execution to the dedicated NestJS runtime role.

## 13. Triggers and immutability

| Trigger object | Table/model | Purpose | Enforcement layer | Validation | Risk if incorrect |
|---|---|---|---|---|---|
| `products_prevent_sku_change` | Product | Stable SKU pair | PostgreSQL BEFORE UPDATE trigger | Static-pass; Phase 5C required | SKU drift |
| `orders_prevent_identity_change` | Order | Stable visible order identity | PostgreSQL BEFORE UPDATE trigger | Static-pass; Phase 5C required | Order-number drift |
| `invoices_prevent_snapshot_change` | Invoice | Immutable issued identity/financial snapshot | PostgreSQL BEFORE UPDATE trigger | Static-pass; Phase 5C required | Altered invoice or over-restriction |
| `credit_notes_protect_snapshot` | CreditNote | Stable identity and terminal snapshot | PostgreSQL BEFORE UPDATE trigger | Static-pass; Phase 5C required | Altered credit note or over-restriction |
| `stock_movements_append_only` | StockMovement | Reject UPDATE/DELETE | PostgreSQL BEFORE trigger | Static-pass; Phase 5C required | Mutable inventory ledger |
| `order_status_history_append_only` | OrderStatusHistory | Reject UPDATE/DELETE | PostgreSQL BEFORE trigger | Static-pass; Phase 5C required | Mutable order history |
| `credit_ledger_entries_append_only` | CreditLedgerEntry | Reject UPDATE/DELETE | PostgreSQL BEFORE trigger | Static-pass; Phase 5C required | Mutable customer-credit ledger |
| `delivery_attempt_status_history_append_only` | DeliveryAttemptStatusHistory | Reject UPDATE/DELETE | PostgreSQL BEFORE trigger | Static-pass; Phase 5C required | Mutable delivery history |
| `client_credit_limit_changes_append_only` | ClientCreditLimitChange | Reject UPDATE/DELETE | PostgreSQL BEFORE trigger | Static-pass; Phase 5C required | Mutable credit-limit audit |
| `discount_change_logs_append_only` | DiscountChangeLog | Reject UPDATE/DELETE | PostgreSQL BEFORE trigger | Static-pass; Phase 5C required | Mutable discount audit |
| `audit_logs_append_only` | AuditLog | Reject UPDATE/DELETE | PostgreSQL BEFORE trigger | Static-pass; Phase 5C required | Mutable audit record |
| `payment_allocations_protect_lifecycle` | PaymentAllocation | Controlled one-time reversal only | PostgreSQL BEFORE UPDATE/DELETE trigger | Static-pass; Phase 5C required | Incorrect allocation history |
| `stock_reservations_protect_lifecycle` | StockReservation | Controlled terminal transition only | PostgreSQL BEFORE UPDATE/DELETE trigger | Static-pass; Phase 5C required | Reservation corruption |
| `import_batches_protect_lifecycle` | ImportBatch | Source identity/committed immutability | PostgreSQL BEFORE UPDATE/DELETE trigger | Static-pass; Phase 5C required | Import provenance corruption |
| `import_rows_protect_lifecycle` | ImportRow | Raw-row/committed immutability | PostgreSQL BEFORE UPDATE/DELETE trigger | Static-pass; Phase 5C required | Import evidence corruption |
| `import_issues_protect_lifecycle` | ImportIssue | One-time resolution only | PostgreSQL BEFORE UPDATE/DELETE trigger | Static-pass; Phase 5C required | Issue evidence corruption |

These triggers are intentionally not complete state machines. They protect narrow invariants while leaving authorization, permitted status transitions, orchestration and compensating commands to NestJS.

## 14. RLS and privilege protections

RLS is enabled on all 48 tables, with no policies created:

`users`, `staff_profiles`, `client_businesses`, `business_user_links`, `client_business_approvals`, `client_credit_accounts`, `client_credit_limit_changes`, `categories`, `products`, `product_aliases`, `units_of_measure`, `product_packaging`, `product_prices`, `client_specific_prices`, `discount_rules`, `discount_change_logs`, `stock_locations`, `stock_balances`, `stock_reservations`, `stock_movements`, `orders`, `order_items`, `order_status_history`, `order_change_requests`, `cancellations`, `order_credit_approvals`, `document_sequences`, `invoices`, `credit_notes`, `payments`, `payment_allocations`, `credit_ledger_entries`, `refunds`, `returns`, `return_items`, `delivery_zones`, `deliveries`, `delivery_attempts`, `delivery_assignments`, `delivery_attempt_status_history`, `import_batches`, `import_rows`, `import_issues`, `source_record_mappings`, `expense_entries`, `notification_subscriptions`, `notifications`, `audit_logs`.

| Protection | Scope | Purpose | Enforcement layer | Validation | Risk if incorrect |
|---|---|---|---|---|---|
| 48 `ENABLE ROW LEVEL SECURITY` statements | Every business table | Default-deny direct access when no policy exists | PostgreSQL RLS | Static-pass; Phase 5C required | Accidental Data API access or application lockout |
| Table `REVOKE ALL` | `anon`, `authenticated`, `service_role` on all 48 tables | Prevent browser/Data API roles from bypassing the NestJS boundary | PostgreSQL privileges | Coverage static-pass; Supabase role review required | Data exposure or unusable deployment |
| Sequence/function revokes | Product SKU sequence and all 12 functions | Prevent direct browser allocation/trigger invocation | PostgreSQL privileges | Coverage static-pass; Supabase role review required | Identifier abuse or deployment failure |
| Three `ALTER DEFAULT PRIVILEGES` revokes | Future public tables, sequences and functions | Avoid automatic future exposure | PostgreSQL default privileges | Static-pass; owner-context review required | Future object exposure if run under wrong owner |

This SQL assumes Supabase's `anon`, `authenticated`, and `service_role` roles exist when applied; it is intentionally Supabase-targeted and may fail on generic PostgreSQL without those roles. Data API disabling remains a dashboard action. Supabase's API-security guidance confirms that exposed-schema access, grants and RLS are distinct controls: <https://supabase.com/docs/guides/api/securing-your-api>.

## 15. Prisma limitations

Prisma schema validation does not parse or prove the custom SQL. Prisma cannot express the row-local checks, partial indexes, GiST exclusions, custom sequences/functions, triggers, RLS, grants or default privileges in `schema.prisma`. A future `prisma migrate diff` may report custom objects as drift or omit them from generated changes. Prisma Client will also not expose allocator functions as model methods; NestJS must call reviewed SQL through a constrained data-access path.

The schema's `@updatedAt` behaviour is Prisma Client behaviour, not a database trigger. The migration does not claim that Prisma alone creates audit rows, redacts sensitive data, authorizes Owner actions or enforces business state machines.

## 16. NestJS responsibilities

NestJS must later:

- call the SKU and document allocation functions in the same transaction as canonical record creation;
- apply permitted order, invoice, credit-note, payment, refund, return, delivery, reservation and import state transitions;
- authorize Owner-only manual credit-note adjustments and other sensitive decisions;
- calculate invoice debt from invoices, non-reversed allocations and credit notes, separately from `sum(CreditLedgerEntry.amount)` store credit;
- enforce credit-ledger sign semantics by entry type and ensure references match the business event;
- calculate/round order lines and cross-row document totals consistently;
- determine sale eligibility from activation/review, packaging, unit conversion, individual-sale flag and positive applicable price;
- compute low-stock alerts from base-unit balances and nullable per-product thresholds;
- create and redact audit records through service, authorization and future PostgreSQL controls;
- use one dedicated least-privilege runtime role configured in Phase 5D, never browser database credentials.

## 17. Static validation results

- `prisma format`: passed.
- `prisma validate`: passed with a non-connecting loopback placeholder URL.
- Models/enums: 48/40.
- Generated tables/types/indexes/FKs: 48/40/96/128.
- Custom checks/partial indexes/exclusions: 93/11/2.
- Custom functions/triggers: 12/16; function-name collisions: zero.
- RLS: 48 targets, with no missing or extra table target.
- Table privilege revocation: 48 targets, with no missing or extra table target.
- Function revocation: all 12 functions explicitly covered.
- Identifier scan: all CHECK/exclusion ALTER targets, quoted columns, partial-index columns and trigger targets matched the generated inventory.
- FK scan: all 128 source and referenced table targets exist.
- Transaction: exactly one `BEGIN` and one final `COMMIT`; dollar-quote and parenthesis balances are even/zero.
- `ON DELETE CASCADE`: zero.
- Destructive scan: zero `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE FROM`, role/password creation, concurrent indexes, `SECURITY DEFINER`, or broad grant to `PUBLIC`.
- `INSERT INTO`: one deliberate, parameterized upsert into `document_sequences` inside the allocator; no business seed/backfill rows.
- Mermaid: all five affected sources passed the installed Mermaid parser. CLI rendering timed out because its Chromium renderer did not start; this is an environment limitation, not a parser failure.
- No safe installed PostgreSQL SQL parser was found. Executable parsing and constraint/trigger behaviour remain pending Phase 5C/5D.

## 18. Risks requiring Phase 5C review

1. Parse the full SQL with the exact target PostgreSQL version and review every PL/pgSQL body.
2. Confirm `btree_gist` installation in `extensions` and default GiST operator-class resolution.
3. Test both exclusions for overlap, adjacency, null end and independent dimensions.
4. Test high-concurrency SKU/document allocation, rollback reuse policy, year boundaries and exhaustion at 999999.
5. Confirm all trigger transition matrices permit the intended creation/approval/issue/reversal/commit workflows and reject later mutation.
6. Confirm invoice and credit-note snapshot columns are neither under- nor over-protected.
7. Verify all 93 CHECKs against representative synthetic boundary data, especially numeric rounding.
8. Validate Supabase role existence, migration owner, default-privilege owner context, RLS state and absence of policies.
9. Confirm table/function/sequence revokes do not affect the future dedicated NestJS runtime grants.
10. Decide how Prisma drift diagnostics will account for custom objects.

## 19. Files changed

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/migration_lock.toml`
- `packages/db/prisma/migrations/20260726162130_initial_schema_v0_1/migration.sql`
- `docs/BRD.md`
- `docs/FRD.md`
- `docs/TRD.md`
- `docs/db/phase2answers.md`
- `docs/db/phase4-physical-schema-design-v0.1.md`
- `docs/db/phase5b-initial-migration-review-v0.1.md`
- `docs/diagrams/database-migration-and-deployment-flow-v0.1.mmd`
- `docs/diagrams/erd/catalogue-pricing-erd-v0.1.mmd`
- `docs/diagrams/erd/clients-credit-erd-v0.1.mmd`
- `docs/diagrams/erd/conceptual-erd-master-v0.1.mmd`
- `docs/diagrams/erd/orders-returns-delivery-erd-v0.1.mmd`

No PRD, frontend, shared type, API, backend module, package manifest, lockfile, environment file or local Claude settings file was changed.

## 20. Explicit no-application confirmation

The migration was generated from an empty source and reviewed only as local text. It was not applied or executed. No database or Supabase connection occurred. No Prisma Client, migration database artifact, seed, import, real business data, credential, role password, commit, push or tag change occurred.

Phase 5B is complete as a generation/static-review gate only. The artifact must wait for independent Phase 5C SQL review and Ahmed's explicit approval before any development Supabase configuration or migration application.
