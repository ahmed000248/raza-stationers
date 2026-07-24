# Functional Requirements Document (FRD / SRS)

## Raza Stationers — E-Commerce & Business Management Platform

**Prepared for:** Raza Stationers
**Prepared by:** Ahmed (Product Owner), drafted with AI assistance
**Version:** 1.2 (Draft — Pending Review)
**Date:** July 25, 2026
**Status:** Draft
**Based on:** PRD v1.1, BRD v1.1

---

## Document Control

| Version | Date | Author | Description | Status |
|---|---|---|---|---|
| 1.0 | 2026-07-23 | Ahmed | Initial FRD derived from PRD and BRD | Draft |
| 1.1 | 2026-07-23 | Ahmed | Aligned role/permission matrix and affected FRs with BRD v1.1's Owner-only split (account approval, credit limits/approval, payment history, accounting/reports, audit log, stock corrections); added `FR-STK-07` | Draft |
| 1.2 | 2026-07-25 | Ahmed | Removed the stale "images" reference in `FR-CAT-01` — the finalized design has no product photography, catalogue is description-based only; added `FR-CAT-08` for the Individual/Bulk purchase-type split that the design phase introduced but was never written back into this document | Draft |

---

## Table of Contents

1. Introduction
2. Purpose & Scope
3. Definitions & Abbreviations
4. System Overview & Actors
5. Role & Permission Matrix
6. Functional Requirements
   6.1 Authentication & Account Access
   6.2 Client Business & User Account Management
   6.3 Product & Catalogue Management
   6.4 Pricing & Discount Engine
   6.5 Cart & Checkout
   6.6 Order Management & Lifecycle
   6.7 Payments & Pay-Later Credit
   6.8 Stock & Inventory Management
   6.9 Delivery & Fulfilment
   6.10 Staff & Role Management
   6.11 Accounting & Financial Reports
   6.12 Notifications
   6.13 Admin Dashboard & Analytics
   6.14 Audit Log & Security Controls
   6.15 Localization (Bilingual Support)
   6.16 Data Migration (Initial Catalogue & Customer Import)
7. Order Lifecycle — Detailed State Machine
8. Pricing Resolution — Detailed Logic
9. Credit / Pay-Later Approval — Detailed Logic
10. Functional Non-Requirements (Testable NFRs)
11. Traceability Matrix (FR → BRD → PRD)
12. Assumptions & Dependencies
13. Open Items
14. Approval & Sign-Off

---

## 1. Introduction

This Functional Requirements Document (FRD, sometimes called an SRS — Software Requirements Specification) translates the PRD's feature list and the BRD's business rules into precise, testable functional behavior: what the system does, screen by screen and action by action, given specific inputs.

Where the BRD says *what the business needs* (e.g. "a customer's discount can be changed, and the change must be logged" — `CD-05`), this FRD says *exactly how the system behaves* when that happens (who can trigger it, what fields are required, what the system validates, what state changes, what the user sees afterward).

This document is written for the development team (including AI coding tools) to build directly against, and for QA to write test cases against.

---

## 2. Purpose & Scope

**Purpose:** define every functional requirement of Version 1 (MVP) in enough detail that a developer or AI coding assistant can implement it without having to guess business logic, and a tester can verify it without ambiguity.

**In scope:** all Version 1 features listed in PRD §5 and BRD §4.1 — customer web platform, admin panel, order/pricing/credit/stock/accounting logic, staff roles, notifications, bilingual basics, and initial data migration.

**Out of scope:** anything listed as Phase 2+ in PRD §8 and BRD §4.2 / §19 (mobile app, live GPS tracking, automated discount rule engine, full multi-language switching, SMS/WhatsApp OTP, live payment gateways pending merchant account approval, loyalty programs, advanced analytics). These are noted where relevant but not specified in functional detail here.

---

## 3. Definitions & Abbreviations

| Term | Meaning |
|---|---|
| **Client Business** | A wholesale customer account representing a business (shop, school, bookstore, etc.), per BRD §15 |
| **User Account** | An individual login, either a Client Business's authorized person, staff, or a guest/standard customer |
| **SKU** | Stock Keeping Unit — a unique trackable product variant |
| **Pending Review** | Initial order status before admin confirmation |
| **Pay-Later / Credit** | Order paid against an approved credit balance rather than immediately |
| **FR** | Functional Requirement (this document's ID prefix, e.g. `FR-ORD-03`) |
| **BR** | Business Rule (from the BRD, e.g. `CD-01`) |
| **MoSCoW** | Prioritization: **M**ust have, **S**hould have, **C**ould have (v1); items marked **Phase 2** are deferred |

---

## 4. System Overview & Actors

The platform consists of two connected surfaces sharing one backend/API:

1. **Customer-Facing Web App** — catalogue, cart, checkout, order tracking, business profile, notifications preferences.
2. **Admin Panel** — order queue, product/stock management, client business management, pricing/discount/credit approval, delivery tracking, accounting, staff management, reports.

(A native mobile app is Phase 2, built against the same API — see PRD §5.1 and BRD §4.2.)

**Actors:** Owner, Admin/Computer Operator, Packing/Warehouse Worker, Delivery Worker, Client Business — Primary Contact, Client Business — Additional Staff, Guest/Unapproved Customer. Full descriptions in BRD §5.

---

## 5. Role & Permission Matrix

| Function | Guest | Client Business User | Owner | Admin/Operator | Packing Worker | Delivery Worker |
|---|---|---|---|---|---|---|
| Browse catalogue (standard prices) | ✅ | ✅ (own pricing) | ✅ | ✅ | ❌ | ❌ |
| Place order | ❌ (must register) | ✅ | ✅ | ✅ (on behalf of walk-in) | ❌ | ❌ |
| View own order history / reorder | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Request wholesale account | ✅ | — | — | — | — | — |
| Approve / reject a new wholesale business account | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Assign or change a client's discount / pricing tier | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Set or approve a client's credit limit | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View a client's payment history / outstanding balance | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Confirm / reject orders | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Print picking slip | ❌ | ❌ | ✅ | ✅ | View only | ❌ |
| Log a routine restock entry | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Make a stock correction / adjustment | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Mark order packed | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Mark order delivered / failed | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| View/manage accounting & reports | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage staff accounts | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View audit log | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Change business settings | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

Server-side enforcement is mandatory for every row above — see `FR-SEC-01`. Note the split introduced in v1.1: the Admin/Computer Operator runs day-to-day operations (orders, routine stock, catalogue, discount/pricing-tier assignment) but has no access to account approval, credit limits/approval, payment history, staff management, accounting reports, the audit log, or settings — those remain Owner-only. See BRD §5 for the rationale.

---

## 6. Functional Requirements

### 6.1 Authentication & Account Access

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-AUTH-01 | User registers with mobile number, name, and password. System validates mobile number format and checks for duplicates. | Guest | M | NA-02 |
| FR-AUTH-02 | User logs in with mobile number + password. After 5 failed attempts, account is temporarily locked for 15 minutes and the attempt is logged. | All registered users | M | Security (§16) |
| FR-AUTH-03 | User requests password reset via admin-assisted recovery (v1: staff verifies identity and issues a reset link/code manually). | Registered user | M | NA-02 |
| FR-AUTH-04 | Owner/Admin accounts require two-factor authentication (2FA) at login. | Owner, Admin | S (target for v1; acceptable to phase in) | NA-02, Security (§16) |
| FR-AUTH-05 | SMS/WhatsApp OTP login. | All | Phase 2 | NA-02 |
| FR-AUTH-06 | Session expires after a configurable period of inactivity; sensitive admin actions (e.g. approving credit limits) require re-authentication if session is older than a set threshold. | Owner, Admin | S | Security (§16) |

### 6.2 Client Business & User Account Management

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-CB-01 | A registered user can submit a "Request Wholesale Account" form containing the business profile fields defined in BRD `CB-03`. | Client Business User | M | CB-01, CB-03 |
| FR-CB-02 | Submitted business requests appear in an admin "Pending Client Businesses" queue with all submitted fields visible, plus a decision panel (Approve / Reject / Request more info). Admin can review the queue and flag issues; only the Owner can action Approve/Reject. | Owner (Admin: review only) | M | CB-06 |
| FR-CB-03 | On approval, the owner must set: credit limit, payment terms, and account status, before the business becomes Active — these are Owner-only. The discount value (or tier default) may be set at approval by the Owner, or assigned/adjusted afterward by the Owner or Admin (`FR-PRC-02`). Fields cannot be left blank on approval. | Owner | M | CB-06, CD-01, PY-01 |
| FR-CB-04 | Admin can manually create a client business profile (without a prior online request) to onboard existing long-term customers directly. | Admin, Owner | M | CB-06 |
| FR-CB-05 | Multiple individual user logins can be linked to one client business. Linked users share the business's pricing, order history, credit balance, and outstanding invoices — none of these are tracked per individual login. | Client Business Owner (primary contact) | M | CB-05 |
| FR-CB-06 | The primary contact of a client business can invite/add additional authorized users (manager, purchase officer, branch employee) to their business account. Admin can also add/remove linked users. | Client Business primary contact, Admin | M | CB-05 |
| FR-CB-07 | Client Business profile page (admin view) displays full history per BRD `CB-04`: orders, payments, discount change log, credit usage, returns, delivery history, notes. | Admin, Owner | M | CB-04 |
| FR-CB-08 | Admin can search/filter the Client Businesses list by name, city, customer type, account status, outstanding balance, and discount — per BRD `CB-02`. | Admin, Owner | M | CB-02 |
| FR-CB-09 | Owner can suspend or block a client business account, which immediately blocks new orders from all linked users of that business (existing orders unaffected). Account status changes are Owner-only, consistent with `FR-CB-02`. | Owner | M | CD-05, PY-02 |

### 6.3 Product & Catalogue Management

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-CAT-01 | Admin can add, edit, and remove products individually, including name, category, description, base price, unit(s) of sale, and SKU/barcode. No product images are captured or displayed anywhere in the system — the catalogue is description-based only, per the finalized design (icon block in place of a photo). | Admin, Owner | M | PR-02 |
| FR-CAT-02 | Admin can bulk-import/update products via CSV/Excel upload, with a validation preview step before committing changes. | Admin, Owner | M | PR-03 |
| FR-CAT-03 | Each product may define multiple sale units (e.g. piece, dozen, carton) with defined conversion ratios; stock is tracked at the base unit and displayed/sold in whichever unit is configured per product. | Admin, Owner | M | PR-02 |
| FR-CAT-04 | Customer-facing catalogue supports category browsing, free-text search, and filters (category, price range, availability). Search must return results across the full 3,000–3,500 SKU catalogue within acceptable response time (see §10). | Guest, Client Business User | M | Scope §4.1 |
| FR-CAT-05 | Each product displays a live stock status label: "In Stock", "Low Stock", or "Out of Stock", derived from current stock level vs. threshold (`FR-STK-03`). | Guest, Client Business User | M | SK-02, SK-03 |
| FR-CAT-06 | Out-of-stock products remain visible and browsable but cannot be added to cart; a "Notify Me" option is shown instead of "Add to Cart". | Guest, Client Business User | M | SK-02 |
| FR-CAT-07 | Admin can archive a product (removes it from customer-facing catalogue and search, retains historical order data). Archived products are not deleted. | Admin, Owner | M | SK-02 |
| FR-CAT-08 | Every product is tagged as Individual, Bulk, or both — the catalogue's primary purchase-type split, shown as a toggle/filter on the customer-facing catalogue. A "Bulk" product may enforce carton/pack-only ordering (`FR-ORD-01`'s pack-only rule); an "Individual" product is sold in single units. Admin sets this when creating/editing a product. | Admin, Owner (set) · Guest, Client Business User (browse/filter) | M | PR-02 (retroactively documented — this was decided during the design phase, after BRD/FRD v1.0/v1.1, and is confirmed in the reviewed customer-site design) |

### 6.4 Pricing & Discount Engine

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-PRC-01 | System resolves and displays a final price per product per logged-in customer according to the priority order defined in `§8` (this document) and BRD `PR-01`. Unapproved/guest users always see the standard price. | System | M | PR-01, CD-04 |
| FR-PRC-02 | Admin can set a client business's account-wide default discount percentage. | Admin, Owner | M | CD-02 |
| FR-PRC-03 | Admin can additionally set a category-level or product-level discount/fixed price override for a specific client business, which takes priority over the account-wide default. | Admin, Owner | M | CD-02, PR-01 |
| FR-PRC-04 | Before approval, a client business sees a "pending approval" state instead of any price; the discount percentage itself is never shown to the customer — only the resulting final price after approval. | Client Business User | M | CD-04 |
| FR-PRC-05 | Every discount change (create, increase, decrease, suspend, remove) is written to an immutable change log capturing: previous value, new value, changed by, timestamp, and reason (required free-text field). | Admin, Owner | M | CD-05 |
| FR-PRC-06 | Changing a discount takes effect only on orders placed after the change; previously confirmed orders retain the price/discount at time of confirmation. | System | M | CD-05 |
| FR-PRC-07 | Admin can apply a one-time manual discount to a specific guest/walk-in order without altering that customer's stored profile. | Admin, Owner | S | CD-03 |
| FR-PRC-08 | Automated category/product discount rule engine (rules apply themselves based on configurable conditions rather than manual admin entry per business). | System | Phase 2 | CD-02 |

### 6.5 Cart & Checkout

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-CRT-01 | User can add/remove/adjust quantity of items in cart; cart persists across sessions for logged-in users. | Client Business User, Guest | M | Scope §4.1 |
| FR-CRT-02 | At checkout, system validates cart against: current stock availability, minimum order rules (`FR-ORD-01`), and unit/pack constraints (e.g. carton-only items). | System | M | OF-01 |
| FR-CRT-03 | Checkout requires selection of one payment method: Pay Online Now, Cash on Delivery, or Pay Later (Credit) — the last option shown only if the client business has an active, non-suspended credit status. | Client Business User | M | PY-01, PY-04 |
| FR-CRT-04 | If "Pay Later" is selected and the order total would exceed available credit, the order is placed in a special **Pending Owner Approval** sub-state rather than being rejected outright (see §9). | System | M | PY-01 |
| FR-CRT-05 | If "Pay Online Now" is selected but no live gateway is active yet, checkout instead prompts for manual bank transfer details and a receipt/transaction-ID upload for admin verification. | System | M | PY-03 |
| FR-CRT-06 | Checkout supports partial payment (pay some now, remainder on credit) only for approved credit customers, per `PY-04`. | Client Business User | M | PY-04 |
| FR-CRT-07 | On successful checkout, order status is set to **Pending Review** and a confirmation is shown to the customer and queued to the admin panel. | System | M | OF-02 |

### 6.6 Order Management & Lifecycle

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-ORD-01 | System enforces configurable minimum-order rules per BRD `OF-01` (minimum amount, minimum quantity, pack/carton-only items, minimum for free delivery) at checkout time. | System | M | OF-01 |
| FR-ORD-02 | Customer can edit or cancel an order only while status is **Pending Review**. Once **Confirmed**, edits/cancellation must go through a Change Request that the admin approves or rejects. | Client Business User | M | OF-02 |
| FR-ORD-03 | Admin order queue lists all Pending Review orders with customer/business name, items, total, requested payment method, and a Confirm / Reject / Request Changes action. | Admin, Owner | M | Core workflow (PRD §4) |
| FR-ORD-04 | On confirmation, system generates a printable order/picking slip (PDF or print-formatted view) containing all order line items, quantities, units, customer/business name, and delivery address. | System | M | Core workflow (PRD §4) |
| FR-ORD-05 | Customer can view full order history with status, and use "Order Again" to rebuild a cart from a past order, applying **current** prices and availability (not the historical order's values). | Client Business User | M | OF-03 |
| FR-ORD-06 | Order status must follow the fixed state machine defined in §7 of this document; illegal status transitions are blocked by the system. | System | M | Core workflow (BRD §6.2) |
| FR-ORD-07 | Delivery zone rules (city/area, delivery charge, minimum for delivery, free-delivery threshold, manual-confirmation areas) are enforced at checkout and configurable by admin. | Admin, Owner / System | M | OF-04 |
| FR-ORD-08 | System captures order volume metrics (orders/day, /week, busiest days, products/order) automatically from day one to support future capacity planning. | System | M | OF-05 |

### 6.7 Payments & Pay-Later Credit

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-PAY-01 | Each client business has stored: credit limit, current outstanding balance, available credit (computed), payment terms, and credit status (Active/Suspended/Blocked). | System | M | PY-01 |
| FR-PAY-02 | System automatically calculates available credit as `credit limit − outstanding balance` and blocks new pay-later orders that would push the balance negative, unless owner-approved (see §9). | System | M | PY-01 |
| FR-PAY-03 | System sends automated reminders to the client business before and after a payment due date (channel: notification per `FR-NTF`). | System | M | PY-02 |
| FR-PAY-04 | Owner can suspend credit privileges for a specific business (blocks new Pay Later orders only; cash/online orders remain available). Credit status changes are Owner-only, consistent with credit limit control (`PY-01`). | Owner | M | PY-02 |
| FR-PAY-05 | Admin can record a payment received against an outstanding balance (full or partial), updating the balance and payment history immediately. | Admin, Owner | M | PY-04 |
| FR-PAY-06 | For manual/offline payments, admin can verify a submitted transaction ID or receipt upload and mark the order/payment as Verified or Rejected. | Admin, Owner | M | PY-03 |
| FR-PAY-07 | Live payment gateway integration (Easypaisa/JazzCash/NayaPay/bank APIs) with automatic payment confirmation. | System | Phase 2 (pending merchant account confirmation, `PY-03`) | PY-03 |
| FR-PAY-08 | No automatic late fee/penalty is applied to overdue balances unless explicitly configured by the owner after confirming existing policy. | System | M | PY-02 |

### 6.8 Stock & Inventory Management

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-STK-01 | Admin/authorized staff can record a **routine restock entry**: product, quantity, supplier/vendor, purchase price, invoice number, purchase date. Entry is timestamped and attributed to the entering user. | Admin, Owner, authorized staff | M | SK-01 |
| FR-STK-02 | Stock level updates immediately and is reflected live on the customer-facing catalogue (`FR-CAT-05`). | System | M | SK-01, Core workflow |
| FR-STK-03 | Each product/SKU has an independently configurable low-stock threshold; when current stock falls at or below the threshold, the product is flagged "Low Stock" and an admin alert is generated. | System | M | SK-03 |
| FR-STK-04 | Admin dashboard lists all products currently at or below their low-stock threshold, sorted by urgency (e.g. stock/threshold ratio). | Admin, Owner | M | SK-03, AC-02 |
| FR-STK-05 | Customers can opt in to a "Notify Me" restock alert on an out-of-stock product; system triggers a targeted notification (`FR-NTF-01`) when that product's stock is next updated above zero. | Client Business User | M | SK-02, NA-01 |
| FR-STK-06 | Admin can archive a discontinued product, removing it from active stock tracking and the customer catalogue while preserving historical records. | Admin, Owner | M | SK-02 |
| FR-STK-07 | Owner can make a **stock correction/adjustment** — a manual change to a product's recorded quantity outside the normal restock-entry or order-fulfilment flow (e.g. fixing a miscount, writing off damaged stock). Distinct from `FR-STK-01`'s routine restock entries, this is Owner-only and always written to the audit log (`FR-SEC-02`) with a required reason. | Owner | M | SK-01 |

### 6.9 Delivery & Fulfilment

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-DLV-01 | Admin assigns a confirmed, packed order to a delivery worker (from the staff list, `FR-STF`) and marks it dispatched, recording dispatch time. | Admin, Owner | M | ST-02 |
| FR-DLV-02 | System records delivery outcome: delivered (with delivery time and cash collected, if applicable) or failed (with a required reason field) or returned/damaged items. | Admin, Owner (on behalf of delivery worker in v1) | M | ST-02 |
| FR-DLV-03 | Delivery worker-facing app/login to self-update delivery status. | Delivery Worker | Phase 2 (v1: admin updates on worker's behalf) | ST-02, ST-03 |
| FR-DLV-04 | Live GPS tracking of delivery workers. | System | Phase 2 | Future Enhancements (BRD §19) |
| FR-DLV-05 | Packing worker view (or printed picking slip in v1) lists items to pick per order, and supports marking the order as "Packed" before dispatch assignment. | Packing Worker, Admin | M | ST-02, ST-03 |

### 6.10 Staff & Role Management

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-STF-01 | Owner can create individual staff accounts with a defined role: Admin/Operator, Packing/Warehouse Worker, Delivery Worker. No shared/generic admin logins are permitted. | Owner | M | ST-03 |
| FR-STF-02 | Each staff account's permissions are strictly bound to its role per the matrix in §5; role changes require Owner action and are logged. | Owner | M | ST-03, Security (§16) |
| FR-STF-03 | Owner can deactivate a staff account, immediately revoking access without deleting historical attribution (e.g. "confirmed by [former staff name]" records remain intact). | Owner | M | ST-03 |
| FR-STF-04 | Staff profile stores basic info (name, contact, role, join date) for reference and accountability, per PRD §5.2. | Owner, Admin | M | ST-03 |

### 6.11 Accounting & Financial Reports

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-ACC-01 | System automatically logs "money in" entries from confirmed sales/payments without manual duplicate entry. | System | M | AC-01, AC-02 |
| FR-ACC-02 | Owner can manually log "money out" entries against editable expense categories (restocking, salaries, rent, utilities, fuel, maintenance, packaging, gateway fees, returns/refunds, damaged stock, taxes, misc.). Accounting & Reporting is Owner-only in v1 — Admin has no access. | Owner | M | AC-01 |
| FR-ACC-03 | System generates reports (daily/weekly/monthly/yearly/custom range) for: total sales, payments received, cash vs. credit sales, outstanding balances, overdue payments, purchases, expenses, estimated gross profit, stock value, top products, top customers, low-stock products, and cash collected per delivery worker. | Owner | M | AC-02 |
| FR-ACC-04 | All reports are exportable to Excel and PDF, and printable directly from the browser. | Owner | M | AC-02 |
| FR-ACC-05 | System supports a "parallel run" comparison mode: daily totals from the new system can be manually checked against the existing bookkeeping method without either system depending on the other. | Owner | M | AC-03 |
| FR-ACC-06 | Every financial figure (sale, expense, credit adjustment) is traceable to a source order, restock entry, or manual entry with a timestamp and user attribution. | System | M | AC-01, Security (§16) |

### 6.12 Notifications

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-NTF-01 | Customers can opt in to follow specific products, categories, or brands; restock notifications are sent only to opted-in followers of the affected item, not broadcast to all customers. | Client Business User | M | NA-01 |
| FR-NTF-02 | System sends order-status notifications (Confirmed, Out for Delivery, Delivered, Change Requested/Rejected) to the ordering customer. | System | M | Core workflow (PRD §4) |
| FR-NTF-03 | System sends payment/credit notifications: payment received confirmation, upcoming due date reminder, overdue balance reminder. | System | M | PY-02, PY-03 |
| FR-NTF-04 | Admin can broadcast important business announcements to opted-in customers (e.g. holiday closure, major restock). | Admin, Owner | S | NA-01 |
| FR-NTF-05 | Push notifications (mobile app). | System | Phase 2 | PRD §5.1 |
| FR-NTF-06 | In-app/website notification center shows a chronological list of a user's own notifications, marked read/unread. | Client Business User, Admin | M | NA-01 |

### 6.13 Admin Dashboard & Analytics

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-DSH-01 | Landing admin dashboard summarizes: pending orders needing review, low-stock alerts, pending client business approvals, overdue payments, and today's sales total. | Admin, Owner | M | Core workflow, SK-03, PY-02 |
| FR-DSH-02 | "Client Businesses" tab shows the metrics defined in BRD `CB-02` (total, active, pending, credit customers, overdue, recently active, blocked). | Admin, Owner | M | CB-02 |
| FR-DSH-03 | Analytics view shows units sold per product/category over a selectable period, top customers by volume/value, and revenue trend over time. This is financial/performance reporting and is therefore Owner-only, consistent with `FR-ACC-03`. | Owner | M | PRD §5.2 |
| FR-DSH-04 | Advanced AI-driven demand forecasting / predictive analytics. | System | Phase 2 | BRD §19 |

### 6.14 Audit Log & Security Controls

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-SEC-01 | All role/permission checks (§5) are enforced server-side on every request; client-side hiding of UI elements is not sufficient and must not be relied upon. | System | M | Non-Functional (§16) |
| FR-SEC-02 | System maintains an append-only audit log recording: actor, action, affected record, previous value, new value, and timestamp, for all sensitive actions — discount changes, credit limit changes, price overrides, stock edits, order confirmations, staff account changes, and account status changes. | System | M | CD-05, Security (§16) |
| FR-SEC-03 | Owner can view and filter the audit log by actor, action type, and date range. The audit log is Owner-only in v1 — Admin has no access, even though many logged actions are ones Admin performed. | Owner | M | Security (§16) |
| FR-SEC-04 | All passwords are stored hashed (never plaintext); all traffic is served over HTTPS. | System | M | Security (§16) |
| FR-SEC-05 | System performs automated daily backups of all data; backup restoration is tested and documented before go-live. | System | M | AC-03, Security (§16) |
| FR-SEC-06 | Sensitive data at rest (customer contact info, financial balances) is encrypted. | System | M | Security (§16) |

### 6.15 Localization (Bilingual Support)

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-LNG-01 | All primary customer-facing actions (Add to Cart, Checkout, Order Status, Pay Later, etc.) display simple English labels supplemented with Urdu text on key buttons and instructions. | System | M | NA-03 |
| FR-LNG-02 | Product names support both an official name and a commonly-used local/shop name, both searchable. | System | M | NA-03 |
| FR-LNG-03 | Full parallel Urdu interface with a language toggle. | System | Phase 2 | NA-03 |

### 6.16 Data Migration (Initial Catalogue & Customer Import)

| ID | Requirement | Actor(s) | Priority | Related BR |
|---|---|---|---|---|
| FR-MIG-01 | System provides a bulk import tool accepting CSV/Excel for products (name, category, price, unit(s), SKU, stock) and existing client businesses (per BRD `CB-03` fields). | Admin, Owner | M | PR-03 |
| FR-MIG-02 | Import tool validates data before committing: required fields present, no duplicate SKUs, valid category references, valid numeric prices/quantities. Invalid rows are reported without blocking valid rows from importing. | System | M | PR-03 |
| FR-MIG-03 | Import supports a test-batch mode (import a small subset first) so the business can verify accuracy before the full 3,000–3,500 product catalogue is committed. | Admin, Owner | M | PR-03 |
| FR-MIG-04 | Existing long-term client businesses can be pre-registered by admin (per `FR-CB-04`) as part of migration, including their historical discount arrangement, so no relationship "restarts from zero" at launch. | Admin, Owner | M | PR-03, CB-06 |

---

## 7. Order Lifecycle — Detailed State Machine

Every order must occupy exactly one of these statuses at a time. Transitions not listed below are invalid and must be blocked by the system.

| From | To | Trigger | Actor |
|---|---|---|---|
| — | Pending Review | Customer completes checkout | Client Business User |
| Pending Review | Cancelled | Customer cancels before admin review | Client Business User |
| Pending Review | Confirmed | Admin reviews and confirms | Admin, Owner |
| Pending Review | Rejected | Admin rejects (e.g. stock issue, pricing issue) | Admin, Owner |
| Pending Review | Pending Owner Approval | Pay-Later order exceeds available credit (see §9) | System |
| Pending Owner Approval | Confirmed | Owner approves the credit exception | Owner |
| Pending Owner Approval | Rejected | Owner declines the credit exception | Owner |
| Confirmed | Change Requested | Customer submits an edit/cancellation request | Client Business User |
| Change Requested | Confirmed | Admin rejects the change request (order proceeds as-is) | Admin, Owner |
| Change Requested | Cancelled | Admin approves a cancellation request | Admin, Owner |
| Change Requested | Confirmed (modified) | Admin approves an edit request | Admin, Owner |
| Confirmed | Packed | Packing worker/admin marks order picked and packed | Packing Worker, Admin |
| Packed | Out for Delivery | Admin dispatches order to a delivery worker | Admin, Owner |
| Out for Delivery | Delivered | Delivery confirmed, payment (if applicable) collected | Admin (on behalf of Delivery Worker in v1) |
| Out for Delivery | Failed Delivery | Delivery attempt unsuccessful; reason recorded | Admin (on behalf of Delivery Worker in v1) |
| Failed Delivery | Out for Delivery | Redelivery attempt scheduled | Admin, Owner |

Every transition is written to the audit log (`FR-SEC-02`) with actor and timestamp. Customers see a simplified version of this state machine (Placed → Confirmed → Preparing → Out for Delivery → Delivered), matching PRD §5.1's order tracking feature.

---

## 8. Pricing Resolution — Detailed Logic

When any price is displayed or calculated (catalogue, cart, checkout, reorder), the system evaluates in this fixed order and stops at the first match:

1. **Customer-specific negotiated price** — an explicit fixed price set for this exact client business + product combination (`FR-PRC-03`).
2. **Customer-group / category pricing rule** — a discount or fixed price set for this client business on a category or set of products (`FR-PRC-03`).
3. **Customer's default account-wide discount** — the single percentage discount assigned at approval (`FR-PRC-02`), applied to the standard price.
4. **Standard selling price** — the fallback base price, used for guests, unapproved accounts, and any product with no customer-specific rule.

Guests and pending/unapproved accounts always resolve to step 4 regardless of any rules that might exist (there should be none, since discounts are only assignable to approved businesses). This logic must be applied identically wherever a price is shown or calculated — catalogue listing, product detail, cart, checkout, invoice, and reorder — to prevent price mismatches between screens.

---

## 9. Credit / Pay-Later Approval — Detailed Logic

1. At checkout, if "Pay Later" is selected, system computes `available credit = credit limit − current outstanding balance`.
2. If `order total ≤ available credit` and credit status is Active: order proceeds directly to **Pending Review** (`FR-CRT-03`, `FR-PAY-02`).
3. If `order total > available credit`: order is placed in **Pending Owner Approval** rather than being auto-rejected, and the Owner is notified (`FR-CRT-04`).
4. If credit status is Suspended or Blocked: "Pay Later" is not offered as an option at all; only Online/Cash remain available (`FR-PAY-04`).
5. On Owner approval of an over-limit request, the order proceeds to **Confirmed** and the credit limit exception is logged (who approved, previous limit, effective exception amount) per `FR-SEC-02`.
6. On Owner rejection, the customer is notified and prompted to reduce the order, choose a different payment method, or make a partial payment (`FR-CRT-06`).

---

## 10. Functional Non-Requirements (Testable NFRs)

These restate the BRD's non-functional requirements (§16) as testable, functional-level targets for QA:

- Catalogue search across the full product set returns results in a time that feels instant to a non-technical user (target: under ~1–2 seconds under normal load).
- Every screen a Client Business User or Guest interacts with must be operable without written instructions — validated via informal usability testing with non-technical users (e.g. shop owners) before launch, not just internal review.
- No order, payment, or stock-adjusting action may silently fail — every such action must return an explicit success or error state visible to the user.
- Backup restoration (`FR-SEC-05`) must be tested and demonstrated at least once before go-live, not merely configured.
- Role-permission enforcement (`FR-SEC-01`) must be verified by attempting each restricted action as an unauthorized role during QA, not just by hiding the corresponding UI.

---

## 11. Traceability Matrix (FR → BRD → PRD)

| FR Module | BRD Section(s) | PRD Section(s) |
|---|---|---|
| 6.1 Authentication | NA-02 | §5.1, §7 |
| 6.2 Client Business Management | §15 (CB-01 to CB-07) | §5, §9 (open Q3) |
| 6.3 Product & Catalogue | PR-02, PR-03, SK-02 | §5.1, §5.2 |
| 6.4 Pricing & Discount Engine | CD-01 to CD-05, PR-01 | §6 |
| 6.5 Cart & Checkout | OF-01, PY-01 to PY-04 | §4, §5.1 |
| 6.6 Order Management | OF-01 to OF-05 | §4, §5.1, §5.2 |
| 6.7 Payments & Credit | PY-01 to PY-04 | §4, §9 (open Q2) |
| 6.8 Stock & Inventory | SK-01 to SK-03 | §4, §5.2 |
| 6.9 Delivery & Fulfilment | ST-02, ST-03 | §4, §5.2, §9 (open Q5) |
| 6.10 Staff & Role Management | ST-01, ST-03 | §5.2 |
| 6.11 Accounting & Reports | AC-01 to AC-03 | §5.2, §9 (open Q4) |
| 6.12 Notifications | NA-01 | §5.1, §5.3 |
| 6.13 Admin Dashboard | CB-02, SK-03, PY-02 | §5.2 |
| 6.14 Audit Log & Security | CD-05, §16 | §7 |
| 6.15 Localization | NA-03 | §7 |
| 6.16 Data Migration | PR-03 | — |

---

## 12. Assumptions & Dependencies

- This FRD assumes the BRD's open items (§18 of the BRD) will be resolved before final sizing of `FR-ORD-01`, `FR-ORD-07`, `FR-ORD-08`, `FR-STF`, and `FR-PAY-07`, but does not block starting development on unaffected modules.
- The TRD (next document) will define the concrete data model, API contracts, and technology choices needed to implement every FR listed here.
- Payment gateway functional requirements (`FR-PAY-07`) are defined at a high level only; exact behavior depends on which provider(s) approve merchant accounts first.
- Phase 2 items are included in this document for completeness and traceability, but are not required for v1 delivery.

---

## 13. Open Items

Carried forward from BRD §18 — these affect the exact configuration (not the existence) of `FR-ORD-01`, `FR-ORD-07`, `FR-ORD-08`, `FR-STF-01`, and `FR-PAY-07`:

| ID | Item | Affects |
|---|---|---|
| OF-01 | Actual current minimum order rules | FR-ORD-01 |
| OF-04 | Exact delivery cities/areas | FR-ORD-07 |
| OF-05 | Current order volume | FR-ORD-08 (capacity planning only) |
| ST-01 | Number of delivery/packing workers, vehicles | FR-STF-01, FR-DLV-01 |
| PY-03 | Merchant account availability | FR-PAY-07 |
| PY-02 | Existing late-payment policy, if any | FR-PAY-08 |

---

## 14. Approval & Sign-Off

This FRD should be reviewed alongside the BRD before the TRD (technical architecture) and design work (sitemap, wireframes) begin, since every screen and API endpoint should trace back to a requirement listed here.

| Name | Role | Signature | Date |
|---|---|---|---|
| | Owner, Raza Stationers | | |
| Ahmed | Product Owner | | |

