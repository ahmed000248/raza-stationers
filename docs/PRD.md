# Product Requirements Document (PRD)
## Raza Stationers — Wholesale & Retail Ordering Platform

**Version:** 1.1 (Draft)
**Owner:** Ahmed
**Status:** For review with business owner (father) before technical work begins
**Change log:** v1.1 — split the "Admin (Owner/Computer Operator)" role description to match the Owner-only vs. Admin-allowed permission split finalized in BRD v1.1 after admin panel design review.

---

## 1. Background

Raza Stationers is a wholesale/retail stationery business (registers, stationery items, sports items, and more — ~3,000–3,500 SKUs), sourcing directly from factories and major vendors. Roughly 80% of revenue comes from wholesale — bulk sales to smaller shops and businesses, many of whom have been customers for 20–30 years.

**Current workflow:** Customer calls the owner → owner manually writes the order on paper → paper is handed to a delivery person → delivery person fulfills and delivers.

**Problem:** This process depends entirely on manual phone calls and paper, has no record of stock levels, no customer history, no automated discount handling, and no way to notify customers when new stock arrives.

**Vision:** Replace the phone-call ordering process with a simple, fast website and mobile app that any customer — regardless of technical skill — can use to browse the live catalog, place orders, and track them, while giving the shop a digital admin panel to confirm orders, manage stock, apply customer-specific discounts, offer pay-later credit, and track basic accounting.

## 2. Goals

1. **Business goal:** Digitize and simplify Raza Stationers' ordering, stock, discount, and accounting workflow.
2. **Portfolio goal:** Produce a genuine, in-production SaaS-style product demonstrating full-stack skills — suitable to show to employers/clients.
3. **Usability goal:** Must be usable by non-technical customers and staff with no training.

## 3. User Roles

| Role | Description |
|---|---|
| **Guest** | Can browse catalog, cannot order or see prices requiring login (TBD — see open question in §9) |
| **Regular Customer** | Signed up, no special discount, orders at list price, can choose payment method |
| **Verified/Tier Customer** | Long-term or high-volume customer, approved by admin, has an assigned discount tier applied automatically |
| **Admin (Computer Operator)** | Confirms orders, manages stock and catalogue, assigns customer discount tiers — day-to-day operations. See BRD §5 for the precise split of what's delegated to Admin vs. reserved for the Owner |
| **Staff/Delivery Worker** | Has a profile in the system; receives/fulfills confirmed orders (initially via printed slip) |
| **Owner (Father)** | Full access, plus several actions reserved exclusively for the Owner: approving new customer/business accounts, setting or approving credit ("pay-later loan") limits, viewing accounting/analytics, staff management, and the audit log |

## 4. Core Workflow

1. **Stock arrives** → admin logs it into the system → product marked "in stock" / "restocked" live on the site → optional push notification to subscribed customers (especially top-tier wholesale customers).
2. **Customer browses catalog** (categories, search, filters) → adds items to cart → checks out.
3. **At checkout, customer selects:**
   - Pay online now (Easypaisa / JazzCash / NayaPay / bank app)
   - Cash on delivery
   - **Pay later (loan)** — requests credit from the owner; if approved, order proceeds and the amount owed is recorded against the customer's profile and in the admin panel as an outstanding balance/reminder.
4. **Order appears in Admin Panel** → admin reviews and confirms → system generates a printable order slip (replaces the handwritten paper) → slip printed and handed to the delivery worker.
5. **Delivery worker fulfills** the order using the printed slip (Phase 1 does not require the worker to use the app directly — see Phase 2+ in the roadmap for a worker-facing app view).
6. **Payment status updates**: if paid online, marked paid automatically; if cash/loan, admin marks it manually once settled.
7. **System updates stock, sales analytics, and accounting** automatically from the confirmed order.

## 5. Feature List

### 5.1 Customer-Facing (Website + Mobile App)
- Sign up / sign in (phone-number based login recommended — more natural for this user base than email)
- Home page — simple, visual, highlights restocked/new items and offers
- Catalog: browse by category, search, filter (price, category, availability)
- Live stock status per product ("In Stock", "Low Stock", "Out of Stock")
- Push notifications: restock alerts, order status updates (for customers using the app)
- Cart & checkout
- Payment method selection: online (Easypaisa/JazzCash/NayaPay), cash on delivery, pay-later request
- Order tracking (Placed → Confirmed → Out for Delivery → Delivered)
- Order history
- "Become a Verified Customer" request — customer submits basic profile info; goes to admin for approval
- Customer profile: shows assigned discount tier (once approved) and any outstanding pay-later balance

### 5.2 Admin Panel
- Order queue: view, confirm, print order slip
- Product management: add/edit/remove products, bulk import via CSV/Excel (essential given 3,000+ SKUs — no one will hand-enter this)
- Stock management: update stock on restock, low-stock threshold alerts
- Customer tier approval: view pending verified-customer requests, assign discount % per approved customer
- Pay-later (loan) management: view outstanding balances per customer, mark as settled, reminders for overdue balances
- Analytics dashboard: units sold per product/category per period, top customers, revenue trends, low-stock report
- Staff/worker profiles: basic info, role, assigned deliveries (Phase 1: informational; Phase 2+: assignment workflow)
- Accounting ledger: money in (sales, online payments) and money out (expenses, restocking costs — manually entered), running balance

### 5.3 Cross-Cutting
- Role-based access control (customer / verified customer / admin / owner)
- Notification system (push + in-app) for restock and order status
- Audit log of admin actions (who approved which discount, who confirmed which order)

## 6. Discount Logic (as described)

- Every customer starts as a **Regular Customer** — no discount, standard workflow.
- A customer can request **Verified Customer** status through their profile.
- Request appears in Admin Panel, pending approval.
- Admin/owner reviews and assigns a discount percentage (e.g. 10%) based on relationship length/volume — this is a manual business decision, not automated.
- Once approved, the discount auto-applies to all of that customer's future orders until changed or revoked by admin.
- Multiple tiers can exist (e.g. 5–10 year customers, 20+ year customers) simply as different discount percentages assigned per customer — no need for rigid fixed "tier names" unless you want them for reporting purposes.

## 7. Non-Functional Requirements

- **Simplicity first:** every customer-facing screen should be understandable without instructions — large buttons, minimal steps, clear Urdu/English labeling if needed.
- **Performance:** catalog search across 3,000+ products must stay fast (proper indexing, pagination).
- **Security:** encrypted auth, role-based access strictly enforced server-side, encrypted sensitive data (customer info, balances), daily backups, audit logs.
- **Reliability:** order data and accounting figures must never be lost — this is real business money.
- **Availability:** should work reasonably well on average Pakistani mobile data speeds (optimize images, avoid heavy assets).

## 8. Out of Scope (v1)

- Automated discount assignment (kept manual/admin-controlled by design)
- Full HR/payroll system for staff (only basic profiles in v1)
- Multi-branch/multi-warehouse support (single shop/location assumed for v1)
- In-app chat/support

## 9. Open Questions (for your dad's input before finalizing)

1. Should guests be able to see the catalog and prices without signing up, or is login required upfront? (Affects the sitemap.)
2. Should "pay later" have a credit limit per customer, or is it fully case-by-case/manual each time?
3. Do you want fixed discount tier *names* (e.g. "Gold/Silver/Bronze") shown to customers, or just a raw percentage with no label?
4. For accounting — is "money out" limited to restocking costs, or should it also include shop expenses (rent, salaries, utilities)?
5. Should delivery workers get their own login to update "delivered" status, or does the admin mark that manually in v1?

---

**Next document:** BRD (Business Requirements Document) — turns section 4 and 6 above into explicit business rules your dad can sign off on, in plain language, before we touch the TRD or design.
