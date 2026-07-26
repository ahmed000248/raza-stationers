# Business Requirements Document (BRD)

## Raza Stationers — E-Commerce & Business Management Platform

**Prepared for:** Raza Stationers
**Prepared by:** Ahmed (Product Owner), drafted with AI assistance
**Version:** 1.1 (Draft — Pending Owner Review)
**Date:** July 23, 2026
**Status:** Draft

---

## Document Control

| Version | Date | Author | Description | Status |
|---|---|---|---|---|
| 1.0 | 2026-07-23 | Ahmed | Initial BRD compiled from business workflow discussion and Q&A with stakeholder | Draft — pending owner sign-off |
| 1.1 | 2026-07-23 | Ahmed | Refined Owner vs. Admin permission split after admin panel design review: account approval, credit limits/approval, payment history, staff management, accounting/reports, and audit log are now explicitly Owner-only | Draft — pending owner sign-off |

---

## Table of Contents

1. Introduction & Purpose
2. Business Overview
3. Business Objectives
4. Scope
5. Stakeholders & User Roles
6. Business Workflow (As-Is vs. To-Be)
7. Customers & Discount Tiers
8. Orders & Fulfilment
9. Payments & Credit (Pay-Later)
10. Stock & Restocking
11. Products & Catalogue
12. Staff & Delivery
13. Accounting
14. Notifications & Access
15. Client Business Management (Core Feature)
16. Non-Functional Requirements
17. Assumptions
18. Open Items — Needs Confirmation
19. Future Enhancements (Phase 2+)
20. Approval & Sign-Off

---

## 1. Introduction & Purpose

This Business Requirements Document (BRD) defines the business rules, workflows, and functional expectations for the Raza Stationers e-commerce and business management platform. It translates the business's real-world operations — wholesale ordering, customer relationships, credit, stock, staff, and accounting — into explicit rules that the technical team (and AI-assisted development tools) will build against.

This document sits after the PRD (which defines the product's purpose and feature list) and before the TRD (which defines the technical architecture). Every feature in the TRD and every screen in the design should trace back to a rule in this document.

**Audience:** the business owner (Ahmed's father), Ahmed (product owner/developer), and anyone building or reviewing the system.

**How to use this document:** each business rule has a short ID (e.g. `CD-01`) so it can be referenced later in the FRD, TRD, and QA test plans without ambiguity.

---

## 2. Business Overview

Raza Stationers is a stationery and general goods business based in Pakistan. Its operations include:

- **Sourcing:** products are bought directly from factories and large manufacturers/vendors (e.g. register manufacturers, pen/stationery producers, sports goods suppliers).
- **Business mix:** approximately 80% wholesale (bulk sales to other businesses — shops, schools, bookstores, small retailers) and a smaller portion of retail/counter sales, including "Fortune" branded product lines.
- **Catalogue size:** roughly 3,000–3,500 distinct products across categories such as registers, general stationery, and sports items.
- **Customer base:** a mix of long-standing wholesale customers (some 20–30 years), medium-term regular customers, and daily/occasional walk-in customers.
- **Current process (manual):** customers call the shop, the owner writes down the order by hand, the paper slip is handed to a delivery worker, who collects the goods from the shop and delivers them.

This platform aims to digitize and formalize this process without making it harder for a largely non-technical customer base to use.

---

## 3. Business Objectives

The platform must:

1. Replace the manual phone-and-paper ordering process with a simple website (and later, a mobile app) that any customer can use regardless of technical skill.
2. Preserve and formalize the business's existing wholesale relationships, including individually negotiated discounts and long-term customer trust.
3. Give the business live visibility into stock levels, restocking, and low-stock warnings.
4. Support tiered and customer-specific pricing that reflects real relationships (20-year customers vs. new customers).
5. Track pay-later ("loan"/credit) balances accurately and transparently — this is currently done informally and is a high-risk area if mismanaged.
6. Provide basic but reliable accounting: money in, money out, and profit visibility.
7. Remain simple and understandable for users with low technical literacy — this is a strict design constraint, not a nice-to-have.
8. Protect sensitive business, customer, and financial data with strong security, since this system will hold confidential commercial information.
9. Serve as a genuine, production-quality product — this is both a real tool for the business and a portfolio-grade project.

---

## 4. Scope

### 4.1 In Scope — Version 1 (MVP)

- Customer-facing website: catalogue, search/filter, cart, checkout, order history, reorder.
- Customer accounts tied to **client businesses** (see Section 15), with owner-approval workflow.
- Admin panel: order management, product/stock management, customer & business management, discount/credit management, delivery tracking, basic accounting and reports.
- Manual/offline-verified payments (Cash, Bank Transfer, Easypaisa, JazzCash and Cash on Delivery) from day one; payment gateways and receipt-file uploads are deferred.
- Pay-later (credit) tracking with credit limits and balances.
- Low-stock and restock alerts for admin; opt-in restock notifications for customers.
- Bilingual interface basics (simple English + Urdu on key elements).
- Role-based staff accounts (Owner, Admin/Operator, Packing/Warehouse, Delivery).
- Bulk import of the existing 3,000–3,500 product catalogue.

### 4.2 Out of Scope for Version 1 (Phase 2+)

- Live GPS delivery tracking.
- Fully automated product/category-level discount rule engine (v1 ships with account-wide discounts; granular rules are manual admin overrides).
- Complete multi-language switching (v1 is simple English with Urdu on key elements only).
- SMS/WhatsApp OTP login (v1 uses mobile number + password).
- Mobile app (built after the web platform and API are stable).
- Loyalty/rewards programs, advanced demand forecasting, or AI-driven analytics.

---

## 5. Stakeholders & User Roles

| Role | Description | Key Permissions |
|---|---|---|
| **Owner** | Ahmed's father; ultimate authority over the business | Full access, plus several actions reserved exclusively for the Owner: approve/reject wholesale business accounts, set and approve credit limits, view payment history and outstanding balances, manage staff accounts, view accounting/financial reports, view the audit log, and change business settings |
| **Admin / Computer Operator** | Staff member managing day-to-day operations | Confirm/reject orders, manage stock (routine restocking and catalogue), assign or change a client business's discount/pricing tier, print picking slips, search/view the client business list and order history. Cannot approve new business accounts, set or approve credit limits, view payment history, manage staff, view accounting reports, or view the audit log — these remain Owner-only (see note below) |
| **Packing / Warehouse Worker** | Prepares orders for dispatch | View picking slips, mark items packed (may start with printed slips only in v1) |
| **Delivery Worker** | Delivers goods and collects payment where applicable | View assigned deliveries, mark delivered/failed, record cash collected |
| **Client Business — Owner/Primary Contact** | The main decision-maker at a wholesale customer business | Place orders, manage other users under their business, view business-wide order/payment history |
| **Client Business — Additional Staff** | Manager, purchase officer, or branch employee authorized to order on behalf of a business | Place orders under the business account (permissions may be limited by the business owner) |
| **Guest / Walk-in / Unapproved Customer** | Browses at standard pricing, not yet an approved wholesale account | View catalogue at standard prices, register for a wholesale account |

**Note on the Owner/Admin split.** For a family business handling real credit and money, anything with direct financial or personnel risk stays with the Owner alone rather than being delegated: approving a new wholesale account, setting or approving a credit limit, viewing payment history, managing staff accounts, viewing accounting reports, and viewing the audit log. The Admin/Computer Operator runs day-to-day operations — confirming orders, routine stock updates, catalogue management, and adjusting a client's discount or pricing tier — but does not touch these Owner-reserved areas. This is a deliberate simplification for Version 1: it is easier to build, and safer than a partial-delegation model, given the business currently has no digital record of any of this at all.

---

## 6. Business Workflow

### 6.1 Current (As-Is) Process

1. Customer calls the shop.
2. Owner (or staff) writes the order by hand on paper.
3. The paper slip is handed to a delivery worker.
4. The delivery worker collects the ordered items from the shop.
5. The delivery worker delivers the order and typically collects cash.

This process has no digital record, no live stock visibility, and relies entirely on the owner's memory for pricing and discount decisions.

### 6.2 Future (To-Be) Process

1. New stock arrives → admin/operator logs it in the system → catalogue updates live → opted-in customers following that product/category get a restock notification.
2. Customer browses the catalogue on the website (or app) and sees prices according to their approval status and tier.
3. Customer adds items to cart and checks out, choosing a payment method: pay online now, pay cash on delivery, or use approved pay-later credit.
4. Order enters **Pending Review** status and appears on the admin panel.
5. Admin/owner reviews the order, confirms it (or contacts the customer if something needs clarification).
6. A payment receipt/confirmation is generated for the customer.
7. The order is printed as a picking slip for the warehouse/packing worker.
8. Packing worker prepares the order; delivery worker is assigned and dispatches it.
9. Delivery worker delivers the order, collects payment if applicable, and marks the order as delivered (or failed, with a reason).
10. Payment, stock, and accounting records update automatically from this single transaction — no duplicate manual entry.

---

## 7. Customers & Discount Tiers

**CD-01 — Customer tiers.** The system will support three baseline customer groups:

1. Standard Customer
2. Regular Wholesale Customer
3. Special / Long-Term Wholesale Customer

In addition, the owner/admin can assign a **custom discount percentage or special price** to any individual customer, overriding the tier default. This reflects how real relationships (e.g. a 20-year customer) don't always map cleanly to a fixed tier.

> **Phase 4 database design update (v0.1):** prices belong to a Product's confirmed selling package, not directly to Product. Retail and wholesale package prices are independently entered and effective-dated. A piece price is never derived by dividing a package price, and a package price is never calculated as `base price × conversion`. Product identifies the stock-distinguishing SKU; ProductPackaging defines the ways that shared base inventory can be sold. See PR-01 and PR-02 below.

**CD-02 — Discount scope.** Every approved customer has a default account-wide discount percentage. In Version 1, this single account-wide discount is the primary mechanism. The admin can additionally set different discounts or special fixed prices for specific products or categories (e.g. 10% general discount, 5% on sports items, a fixed price on registers) — this product/category-level rule capability ships in v1 as a manual admin override, with a fully automated rules engine planned for a later phase.

**CD-03 — Walk-in and unapproved customers.** Walk-in, occasional, and unapproved online customers see the standard selling price. An authorized admin may manually apply a one-off discount when needed.

**CD-04 — Pricing visibility before approval.** *(Wording corrected v1.5 to match the already-built, QA-passed storefront — Codex Phase 2 review caught the original text describing a "no price shown" state that isn't what was actually implemented.)* A newly registered, pending customer sees standard/retail catalogue prices — the same prices a guest sees — plus a visible "pending verification" notice (e.g. *"Registration submitted... standard catalog prices apply until verification completes"*). They are never shown wholesale pricing before approval. Once the owner approves the account, the customer sees their actual personalized (wholesale/discounted) prices directly — the system shows the **final price**, not the discount percentage, to keep things simple and avoid confusion.

**CD-05 — Changing or removing a discount.** The owner or admin can increase, reduce, suspend, or remove a customer's discount/pricing tier at any time. Every change is recorded with:

- Previous discount value
- New discount value
- Who made the change
- Date and time
- Reason for the change

Changing a discount does **not** retroactively affect orders that were already confirmed.

---

## 8. Orders & Fulfilment

**OF-01 — Minimum orders.** *(Confirmed by the business owner, 2026-07-26.)* Ordering is fully flexible, not governed by fixed minimum-quantity rules. Most products sell in bulk units (dozen, 30 pcs, 50 pcs, etc.), but the same product can also be sold individually to retail customers — this is exactly what `purchaseType` (individual/bulk/both) already models. No separate per-product minimum-order-quantity engine is needed for v1.

**OF-02 — Editing and cancelling orders.** A customer can edit or cancel an order only while it is in **Pending Review** status. Once the admin confirms an order, the customer can no longer change it directly — instead, they submit a change or cancellation request, which the admin approves or rejects.

**OF-03 — Order history and reorder.** Customers can view previous orders, download invoices, check payment/delivery status, and select "Order Again" with the ability to adjust quantities before checkout. Reordering always applies current prices and current stock availability, not the original order's prices.

**OF-04 — Delivery zones.** Delivery is initially offered only in the areas the business already serves. The admin manages: delivery cities/areas, delivery charges, minimum order for delivery, free-delivery rules, and areas that require manual confirmation before dispatch.
*(Confirmed by the business owner, 2026-07-26.)* Free delivery within Wah Cantt, Hassanabdal, and Taxila (the whole region). Delivery charges apply for Rawalpindi and Islamabad. *Still needed: the exact Rupee charge amounts for Rawalpindi/Islamabad.*

**OF-05 — Order volume.** Current order volume (orders/day, orders/week, busiest days, seasonal peaks, average products per order) is not yet known and needs confirmation from the owner or computer operator. Regardless of current volume, the system must be architected to handle future growth without requiring a rebuild.

---

## 9. Payments & Credit (Pay-Later)

**PY-01 — Credit limits.** Every approved credit customer has: a credit limit, current outstanding balance, available credit, payment due date/terms, and a credit status (active, suspended, or blocked). Setting or changing a credit limit, and approving a pay-later order that would exceed available credit, are Owner-only actions — unlike discount/pricing tiers, credit decisions are not delegated to the Admin/Computer Operator.

**PY-02 — Late payment handling.** The system sends reminders before and after the due date. The owner can suspend further credit orders for a customer while still allowing cash or online payment orders to continue. No automatic penalty or late fee is applied unless Raza Stationers confirms it already follows such a policy.

**PY-03 — Payment methods and merchant accounts.** Version 1 supports Cash, Bank Transfer, Easypaisa, JazzCash and Cash on Delivery as manually recorded methods. Customers may submit a transaction/reference string for verification. Direct gateways and receipt-file uploads require separate future approval and are not part of schema v0.1. Client credit is a ledger facility, not a PaymentMethod.

**PY-04 — Partial payment plus credit.** A customer may pay part of an order online/cash and put the remainder on credit, but only if they are an approved credit customer. The system records: total order amount, amount already paid, payment method, remaining balance, due date, and any later payments made against that balance. The remaining balance cannot exceed the customer's available credit without owner approval.

---

## 10. Stock & Restocking

**SK-01 — Updating stock.** The computer operator normally enters new stock. The owner has full control over stock records; selected employees may be granted limited stock-entry permissions. Each restock entry records: product and quantity, supplier/vendor, purchase price, purchase invoice number, purchase date, and the employee who entered it.

**SK-02 — Out-of-stock visibility.** Out-of-stock products remain visible on the catalogue with an "Out of Stock" label but cannot be ordered. Customers can request a restock notification for that specific product. Permanently discontinued products can be archived by the admin so they stop appearing at all.

**SK-03 — Low-stock thresholds.** Each product/SKU has its own configurable low-stock threshold rather than one number for the entire catalogue, because products sell in very different quantities. Examples:

| Product | Low-Stock Trigger |
|---|---|
| Registers | 200 units |
| Expensive sports item | 5 units |
| Pens | 10 cartons |

---

## 11. Products & Catalogue

**PR-01 — Price priority.** The system stores independent, effective-dated retail and wholesale prices for each ProductPackaging record. When a customer views a price, the system applies this non-stacking priority order and stops at the first match:

| Priority | Rule |
|---|---|
| 1 (highest) | Fixed client-specific price for this business + ProductPackaging; this is already final |
| 2 | Product-level percentage discount for this business |
| 3 | Category-level percentage discount for this business |
| 4 | Account-level percentage discount for this business |
| 5 | Positive wholesale ProductPackaging price for an approved wholesale account |
| 6 (fallback) | Positive retail ProductPackaging price; an approved-account fallback creates an admin warning |

Only one discount applies; discounts never stack. Percentage discounts apply to the selected positive base price. A package with no positive applicable price is not orderable. Only authorized users can manage pricing rules, and all changes are historical/audited.

**PR-02 — SKU, packaging and categories.** Every stock-distinguishing variation is a separate Product with a required, stable, unique business SKU such as `RS-000001`. The SKU is unrelated to name/category changes and is never reused. ProductPackaging records represent piece, dozen, packet, jar, box, ream or carton options sharing the Product's base inventory. Every Product has at least one package and exactly one confirmed base package. Conversions are explicitly supplied or manually confirmed and are never guessed. Sale eligibility comes from Product/ProductPackaging status, confirmed unit data, `allowIndividualSale`, stock and a positive applicable package price—not from the provisional import sales classification. Version 0.1 categories are flat. Category hierarchy, barcode, Brand, ProductImage and supplier/purchasing systems are future extensions only.

**PR-03 — Bulk catalogue migration.** The existing 3,000–3,500 products will not be entered manually. Instead:

1. Export existing product and customer data from the business's current inventory/retail software (or paper/Excel records) into Excel, CSV, or a database backup.
2. Clean the data: remove duplicates and incorrect records.
3. Standardize categories, units, names, and prices.
4. Import a small test batch.
5. Verify the test batch with the business (owner/operator confirms accuracy).
6. Import the complete catalogue.

---

## 12. Staff & Delivery

**ST-01 — Delivery and packing staff.** The current number of delivery workers, packing workers, available vehicles, and use of temporary workers is not yet known and needs confirmation. The system is designed to support any number of staff rather than a fixed limit.

**ST-02 — Delivery accountability.** Each delivery records: assigned worker, vehicle (if applicable), dispatch time, delivery time, delivery status, cash collected, failed-delivery reason (if any), and any returned or damaged items. This provides accountability without requiring complex live GPS tracking in v1.

**ST-03 — Staff accounts.** Staff who manage orders, stock, payments, or deliveries have individual accounts from Version 1 — no shared admin logins. Initial roles: Owner, Admin/Computer Operator, Packing/Warehouse Worker, Delivery Worker. If individual logins prove too complex for packing staff initially, they may work from printed picking slips instead, with digital accounts added later.

---

## 13. Accounting

**AC-01 — Expense tracking.** The system supports editable expense categories, including: product purchases/restocking, salaries and wages, rent, electricity and utilities, fuel and delivery costs, vehicle maintenance, packaging, payment gateway/bank charges, returns and refunds, damaged or missing stock, taxes (if applicable), and miscellaneous expenses.

**AC-02 — Reports.** Accounting and financial reports are Owner-only — the Admin/Computer Operator does not have access to this section. The owner can view daily, weekly, monthly, yearly, and custom-date-range reports covering: total sales, payments received, cash sales, credit sales, outstanding balances, overdue payments, purchases, expenses, estimated gross profit, stock value, top-selling products, top customers, low-stock products, and cash collected per delivery worker. All reports are printable and exportable to Excel or PDF.

**AC-03 — Transition from current bookkeeping.** The new system will **not** immediately replace the current bookkeeping method (register, existing software, or manual process). Both systems will run in parallel and be compared daily for at least one or two complete business cycles. The old process is only retired after:

- Sales totals match between old and new systems
- Stock totals match
- Customer balances match
- Backups are confirmed working
- Backup restoration has been tested successfully
- The owner trusts the new system's reports

---

## 14. Notifications & Access

**NA-01 — Restock notifications.** Notifications are targeted and opt-in, not blanket. Approved customers can follow specific products, categories, brands, or important business announcements. The system will not notify every customer about every restock, to avoid notification fatigue.

**NA-02 — Login method.** Mobile number is the primary account identity, since it is more familiar and accessible to most customers than email. Version 1 uses: mobile number + secure password, with admin-assisted account recovery. SMS/WhatsApp OTP can be added later once cost and reliability are evaluated. Owner and admin accounts should eventually use two-factor authentication (2FA), given the sensitivity of the data they can access.

**NA-03 — Language.** The platform supports both Urdu and English. Version 1 uses very simple English throughout, with Urdu added to important buttons and instructions, familiar local product names, and support for both official and commonly-used shop names for products. Full language switching (a complete parallel Urdu interface) is a later-phase enhancement once the core ordering workflow is stable.

---

## 15. Client Business Management (Core Feature)

Because Raza Stationers is primarily a wholesale business, the platform maintains **client business profiles**, not just individual customer accounts. This is treated as a core, first-release requirement — pricing, credit, order history, and wholesale relationships all depend on it.

**CB-01 — Rationale.** A wholesale customer is fundamentally a *business* (a shop, school, bookstore, or distributor), even though individual people place the orders. Tracking at the business level keeps pricing, credit, and history accurate even as the individuals ordering on behalf of that business change.

**CB-02 — Admin panel: "Client Businesses" tab.** This dedicated tab shows:

- Total client businesses
- Active clients
- New or pending clients
- Credit customers
- Clients with overdue payments
- Recently active clients
- Blocked or inactive clients

Admin can search and filter businesses by name, city, customer type, account status, outstanding balance, and assigned discount.

**CB-03 — Business profile fields.** Each client business profile contains:

- Business/shop name
- Owner's name
- Primary contact person
- Phone and WhatsApp number
- Email (if available)
- Business address
- One primary business/delivery address in v1; reusable address collections are deferred
- City and delivery area
- Business type (stationery shop, school, bookstore, office, distributor, etc.)
- Optional NTN/CNIC tax/registration values when available
- Customer relationship start date
- Internal customer category
- Assigned discount or special price list
- Optional Owner-approved credit limit and credit days, stored only when credit is configured
- Current exposure, available credit and balance derived from invoices, allocations and ledger entries
- Account status
- Internal notes
- Document uploads are deferred from v1

**CB-04 — Business history.** Every client business profile shows a complete history:

- Complete order history
- Total amount purchased
- Frequently ordered products
- Previous and current prices
- Discount change history
- Payment history
- Outstanding and overdue invoices
- Credit usage history
- Returns, exchanges, and cancelled orders
- Delivery history
- Complaints or important internal notes
- Last order date
- Employees who made account changes

**CB-05 — Multiple accounts under one business.** A single client business may have multiple people placing orders — the business owner, a manager, a purchase officer, or a branch employee. These individual logins are all connected to the same business profile. Their orders, payments, discounts, and outstanding balance all belong to the business account, not to the individual login.

**CB-06 — Business approval workflow.**

1. A business registers or requests a wholesale account.
2. Its profile appears under **Pending Client Businesses**.
3. Admin can review and verify the business and contact details, but final approval is an **Owner-only** action.
4. The owner assigns the credit limit and payment terms (owner-only); the discount/pricing tier can be assigned by the owner or admin.
5. The account becomes active.
6. Authorized people from that business can place wholesale orders.

Admin can also manually add existing client businesses to the system before they ever register online, to preserve current relationships from day one — though activating the account still requires owner approval per the workflow above.

**CB-07 — Core business rule.** The client business is the primary wholesale customer record. Individual user accounts are simply the people authorized to act on behalf of that business.

*Example: "Ahmed Stationery Shop" is the client business. Its owner and purchase manager may have separate logins, but their orders, credit, and payment history all remain under Ahmed Stationery Shop.*

---

## 16. Non-Functional Requirements

**Security.** Given the confidential nature of customer, credit, and financial data, the system requires: role-based access control strictly enforced on the server side, encrypted passwords, HTTPS everywhere, audit logs for sensitive actions (discount changes, price overrides, credit approvals, stock edits), and regular automated backups with tested restoration.

**Usability / Simplicity.** The interface must be usable by people with low technical literacy — the primary customer base. This means large, clear buttons, minimal text, familiar icons, and short, simple flows. This is a hard constraint on every screen, not just the homepage.

**Scalability.** The system must handle the current catalogue (3,000–3,500 products) and current order volume comfortably, while being architected so it does not need to be rebuilt as order volume, staff count, or the customer base grows.

**Bilingual support.** English (simple) plus Urdu on key elements from v1, per NA-03.

**Auditability.** Every change to a discount, credit limit, price override, or stock entry must be traceable to a specific user, timestamp, and reason where applicable — this protects both the business and its customers from disputes.

---

## 17. Assumptions

- The business currently has no unified digital record of customers, discounts, or credit — these will be captured for the first time during onboarding/migration.
- Product and customer data exists in some exportable form (existing software, Excel, or will need to be compiled from paper records) to support the bulk migration described in PR-03.
- The owner will be actively involved in early testing and in approving the parallel-run accounting transition (AC-03).
- Payment gateway merchant accounts are not yet confirmed and may take time to set up (see PY-03); the system must work with manual/offline-verified payments in the meantime.
- Internet/connectivity at the shop is sufficient for the admin panel to be used reliably during business hours.

---

## 18. Open Items — Needs Confirmation

These items are referenced in the sections above and must be confirmed with the owner or computer operator before or during design:

| ID | Item | Needed From |
|---|---|---|
| OF-01 | Actual current minimum order rules (amount, quantity, pack-only items, free-delivery threshold) | Owner / operator |
| OF-04 | Exact list of cities/areas currently covered for delivery | Owner / operator |
| OF-05 | Current order volume: orders/day, orders/week, busiest days, seasonal peaks, avg. products per order | Owner / operator |
| ST-01 | Number of delivery workers, packing workers, available vehicles, use of temporary staff | Owner |
| PY-03 | Whether merchant accounts exist or can be opened for Easypaisa/JazzCash/NayaPay/bank | Owner |
| PY-02 | Whether any late-payment fee or penalty policy already exists informally | Owner |

---

## 19. Future Enhancements (Phase 2+)

- Fully automated product/category-level discount rules engine (beyond manual admin overrides).
- Live GPS tracking for delivery workers.
- SMS/WhatsApp OTP login.
- Complete multi-language interface switching (not just key elements).
- Native mobile app (built on top of the same API once the web platform is stable).
- Live payment gateway integrations once merchant accounts are confirmed.
- Loyalty/rewards programs for long-term wholesale customers.
- Advanced analytics and demand forecasting.

---

## 20. Approval & Sign-Off

This document should be reviewed and approved by the business owner before design work (sitemap, wireframes) begins, since it defines the rules the entire platform is built on.

| Name | Role | Signature | Date |
|---|---|---|---|
| | Owner, Raza Stationers | | |
| Ahmed | Product Owner | | |
