# Product Requirements Document (PRD)
## Raza Stationers — Wholesale & Retail Ordering Platform

**Version:** 1.2 (Final / Phase 10)  
**Owner:** Ahmed  
**Status:** Completed & Verified  
**Change log:**
- v1.1 — Split "Admin (Owner/Computer Operator)" permissions to match Owner-only vs. Admin-allowed split.
- v1.2 — Phase 10 update: Unified Better Auth authentication engine (email + mobile identifier, Google OAuth, mandatory AAL2 TOTP MFA for administrative roles), same-origin BFF cookie session storage, real-time active status & role revocation, atomic transaction guarantees, and backend-only database security model.

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

| Role | Description | Authentication Level |
|---|---|---|
| **Guest** | Can browse active catalog products at standard retail pricing without logging in. | None |
| **Regular Customer** | Signed up, orders at list price, chooses payment method. | AAL1 (Better Auth email/mobile or Google OAuth) |
| **Verified/Tier Customer** | Long-term wholesale business customer, approved by admin, assigned wholesale pricing/credit ledger. | AAL1 (Better Auth linked business context) |
| **Staff/Delivery Worker** | Receives and fulfills assigned delivery attempts (packing / delivery views). | AAL1 (Staff role whitelist, real-time DB active check) |
| **Admin (Computer Operator)** | Confirms orders, manages stock/catalogue, assigns customer tiers — day-to-day operations. | Mandatory AAL2 (Better Auth + TOTP 2FA) |
| **Owner (Father)** | Full system control: approving business credit limits, viewing financial summaries/buying prices, staff management, audit logs. | Mandatory AAL2 (Better Auth + TOTP 2FA) |

## 4. Core Workflow

1. **Stock arrives** → admin logs it into the system → product marked "in stock" / "restocked" live on the site → optional push notification to subscribed customers.
2. **Customer browses catalog** (categories, search, filters) → adds items to cart → checks out.
3. **At checkout, customer selects:**
   - Cash, Bank Transfer, Easypaisa, JazzCash, or Cash on Delivery (manual verification in v1)
   - **Approved client credit** — optional ClientBusiness ledger facility; over-limit orders require recorded Owner approval.
4. **Order appears in Admin Panel** → admin reviews and confirms → system generates a printable order slip → slip printed and handed to delivery worker.
5. **Delivery worker fulfills** currently assigned DeliveryAttempt; Admin/Owner can reassign or override with a recorded reason.
6. **Payment status updates** are manually verified in v1; unverified payments do not affect invoice or client-credit balances.
7. **System reserves stock on confirmation and deducts it on packing**, then updates sales/accounting records from preserved order and invoice events.

## 5. Feature List

### 5.1 Customer-Facing (Website + Mobile App)
- Sign up / sign in (email, mobile identifier, or Google OAuth via Better Auth)
- Home page — simple, visual, highlights restocked/new items and offers
- Catalog: browse by category, search, filter (sale type, price, category, availability)
- Live stock status per product ("In Stock", "Low Stock", "Out of Stock")
- Cart & checkout with same-origin cookie session security
- Payment-channel selection: Cash, Bank Transfer, Easypaisa, JazzCash, Cash on Delivery, or Client Credit
- Order tracking (Placed → Confirmed → Out for Delivery → Delivered)
- Order history & account profile
- Business registration incorporation during customer onboarding

### 5.2 Admin Panel
- Order queue: view, confirm, print order slip
- Product management: add/edit/remove products, atomic multi-record creation (product, packaging, price) inside Prisma transactions
- Stock management: update stock on restock, low-stock threshold alerts
- Customer tier & business approval: view pending business requests, credit limit management
- Pay-later (credit) management: view outstanding balances, mark settled
- Financial analytics dashboard: wholesale/retail revenue trends, restricted strictly to Owner/Admin
- Staff profile & role management: instant session invalidation and audit logging on status toggle
- Accounting ledger: revenue vs. expenses tracking

### 5.3 Cross-Cutting & Security
- Unified Better Auth engine with same-origin BFF HTTP-only cookies (`SameSite=Lax`, `Secure` in production)
- Server-side role & active-status validation on every request via `BetterAuthGuard` & `RolesGuard`
- Real-time session revocation upon user deactivation or role modification
- Mandatory AAL2 TOTP 2FA assurance for Owner and Admin roles
- Database RLS & exclusive `raza_runtime` role isolation (zero public/anon access to Auth and financial tables)
- Query performance optimization via B-tree foreign key indexes across high-frequency join relationships
- Complete audit logging of admin/owner operational actions

## 6. Discount & Pricing Protection

- Every customer starts as a **Regular Customer** at retail pricing.
- Verified business accounts receive access to wholesale packaging and pricing once approved.
- Internal buying prices (`buyingPrice`) and profit margins are strictly hidden from customer-facing APIs and client bundles.

## 7. Non-Functional Requirements

- **Simplicity first:** Customer-facing screens designed for non-technical users with clear labeling.
- **Performance:** Catalog queries stay under 50ms with optimized B-tree foreign key indexing and pagination.
- **Security:** Better Auth cookie session architecture, server-validated RBAC, RLS policies, encrypted credentials, audit logs, and environment validation guards (`env.config.ts`).
- **Reliability:** All multi-step product mutations wrapped in atomic database transactions (`$transaction`).
- **Availability:** Responsive design optimized for mobile connections.

## 8. Out of Scope (v1)

- Automated discount assignment (kept manual/admin-controlled by design)
- Full HR/payroll system for staff
- Multi-branch/multi-warehouse support (single shop/location assumed for v1)
- In-app chat/support

---

**Next documents:** BRD, FRD, TRD — updated to reflect Phase 10 production readiness.
 your dad can sign off on, in plain language, before we touch the TRD or design.
