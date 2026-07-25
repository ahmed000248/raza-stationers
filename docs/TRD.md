# Technical Requirements Document (TRD)

## Raza Stationers — E-Commerce & Business Management Platform

**Prepared for:** Raza Stationers
**Prepared by:** Ahmed (Product Owner), drafted with AI assistance
**Version:** 1.4 (Draft)
**Date:** July 25, 2026
**Status:** Draft
**Based on:** PRD v1.1, BRD v1.1, FRD v1.2

---

## Document Control

| Version | Date | Author | Description | Status |
|---|---|---|---|---|
| 1.0 | 2026-07-23 | Ahmed | Initial TRD — architecture, stack, schema, API, and two-environment (demo/production) strategy | Draft |
| 1.1 | 2026-07-23 | Ahmed | Added Owner-only vs. Admin-allowed authorization guidance and matching API endpoint annotations, aligned with FRD v1.1 | Draft |
| 1.2 | 2026-07-23 | Ahmed | Re-verified every demo-stack component against current provider pricing; confirmed all layers (including hosting) remain $0 for the demo phase; added Supabase's 7-day auto-pause caveat and a note on Vercel Hobby's non-commercial terms | Draft |
| 1.3 | 2026-07-25 | Ahmed | Reconciled this document against the actual scaffolded repo: switched §3/§5 from pnpm+Turborepo to npm workspaces (matches what's built, functionally equivalent for this scale); updated §5's repo tree to reflect real package/app names and flag what's not yet scaffolded (`apps/admin`, `apps/api`); removed stale product-image references from §6/§12 (no product photography, per the finalized description-based catalogue design); added `purchase_type` to the Product schema row; flagged an open architecture question on whether `apps/api` (NestJS) is still needed given Next.js Route Handlers/Server Actions could serve the same role | Draft |
| 1.4 | 2026-07-25 | Ahmed | `apps/admin` scaffolded as its own Next.js app (resolving part of v1.3's open question — a separate app, not a route inside `apps/web`); added `packages/ui` (shared shadcn primitives, Bilingual, motion wrappers, and design tokens, consumed by both `apps/web` and `apps/admin`); updated §5's repo tree; `docs/` split into `docs/website/` and `docs/admin/` for surface-specific documents, with PRD/BRD/FRD/TRD staying at `docs/` root as cross-cutting | Draft |

---

## Table of Contents

1. Introduction & Purpose
2. Guiding Principle: Two Environments, One Architecture
3. Technology Stack
4. High-Level System Architecture
5. Repository Structure & Tooling
6. Database Schema
7. Authentication & Authorization
8. API Design
9. Pricing Engine — Technical Implementation
10. Order Lifecycle — Technical Implementation
11. Credit / Pay-Later — Technical Implementation
12. File & Image Storage
13. Notifications — Technical Implementation
14. Background Jobs / Queues
15. Payments — Technical Implementation
16. Security Architecture
17. Testing Strategy
18. Monitoring & Logging
19. Mobile App Architecture
20. Demo Environment (Now) — Full Configuration
21. Production Environment (After Approval) — Full Configuration
22. Cost Summary
23. Migration Path: Demo → Production
24. Non-Functional Requirements Mapping
25. Assumptions & Dependencies
26. Open Items
27. Approval & Sign-Off

---

## 1. Introduction & Purpose

This Technical Requirements Document (TRD) defines the architecture, technology stack, database schema, API design, and infrastructure strategy for the Raza Stationers platform. It implements every functional requirement defined in the FRD, which in turn traces back to the business rules in the BRD and the product vision in the PRD.

This document is written to directly guide AI-assisted development (Claude Code, Codex, etc.) and human review — every technical decision below should be traceable to a functional or business requirement, not made arbitrarily.

---

## 2. Guiding Principle: Two Environments, One Architecture

This project runs in two environments that share the **same core technologies** — only the hosting tier and security/reliability level change between them. Nothing needs to be rebuilt when moving from one to the other.

- **Demo/Portfolio Environment (now):** built entirely on free tiers, using sample/fake data, mock payments, and no confidential business information. Cost: **$0**. Purpose: portfolio showcase, university presentation, and development/testing.
- **Production Environment (after the owner approves real business use):** the same codebase deployed to paid, reliable infrastructure with automated backups, real payment gateways, and production-grade security. Cost: real, ongoing (see §22).

The reasoning: Ahmed can build and demonstrate the full, real architecture today at no cost, and only commit to paid hosting once the business owner has reviewed the working system and decided to adopt it. Switching environments later is a configuration/deployment change, not a rewrite.

---

## 3. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Customer website | Next.js (React, TypeScript) | Fast, SEO-friendly, huge ecosystem, free and open source |
| Admin panel | Next.js (React, TypeScript) | Same framework as customer site — one team, one skill set |
| Mobile application | React Native + Expo | Cross-platform (Android + iOS) from one codebase; free |
| Backend API | NestJS (Node.js, TypeScript) | Structured, modular, testable — suits a system with many domains (orders, credit, stock, accounting) |
| Database | PostgreSQL | Relational integrity matters here (orders, credit balances, stock — must never be inconsistent) |
| ORM | Prisma | Type-safe schema and queries, migrations built in |
| Authentication | Supabase Auth (demo) → production-grade auth provider or self-managed (production) | Free tier now; swappable later without changing the app's auth logic |
| File/image storage | Supabase Storage (demo) → dedicated object storage (production) | Free tier now; same access pattern later |
| Styling | Tailwind CSS | Fast to build simple, consistent UI — matches the "simple, usable by everyone" requirement |
| Validation | Zod | Shared validation schemas between frontend and backend |
| Package management | npm workspaces | Efficient-enough monorepo for this project's scale (one team, four apps); the actual repo already uses this rather than pnpm+Turborepo — Turborepo's build-caching benefit isn't worth the added tooling complexity yet, and can be layered in later without restructuring if build times become a problem |
| Testing | Jest, Supertest, Playwright | Unit, API integration, and end-to-end UI testing |
| API documentation | Swagger/OpenAPI | Auto-generated from NestJS decorators; keeps API contract in sync with code |
| Containerization | Docker | Consistent local development and deployment environment |
| Monitoring | Sentry (Developer/free tier initially) | Error tracking and basic tracing |
| Repository | Private GitHub repository | Version control; contains business logic, must not be public |

All of the above are free and open source to develop with locally, regardless of environment — only *hosting* differs between demo and production (§20–21).

---

## 4. High-Level System Architecture

```
┌────────────────────┐     ┌────────────────────┐     ┌──────────────────────┐
│  Customer Website   │     │    Admin Panel      │     │   Mobile App (Phase 2)│
│  (Next.js)          │     │    (Next.js)         │     │   (React Native/Expo) │
└──────────┬──────────┘     └──────────┬──────────┘     └───────────┬───────────┘
           │                            │                            │
           └────────────────┬───────────┴────────────────┬──────────┘
                             │        REST API (JSON, HTTPS)
                             ▼
                  ┌───────────────────────┐
                  │   Backend API (NestJS)  │
                  │  Auth · Orders · Pricing│
                  │  Stock · Credit · Accounting│
                  │  Notifications · Audit Log │
                  └───────────┬────────────┘
                              │ Prisma ORM
                              ▼
                  ┌───────────────────────┐
                  │  PostgreSQL Database   │
                  └───────────────────────┘
                              │
                  ┌───────────┴────────────┐
                  ▼                        ▼
        ┌──────────────────┐   ┌────────────────────┐
        │  File/Image Storage│   │  Auth Provider      │
        │  (product images,  │   │  (login, sessions,  │
        │   receipts, docs)  │   │   MFA for owner)     │
        └──────────────────┘   └────────────────────┘
```

**Single backend, multiple frontends.** The customer website, admin panel, and future mobile app all consume the same NestJS REST API — this avoids duplicating business logic (pricing resolution, credit checks, order state machine) across multiple codebases, per FRD §8–9.

**Why not a separate database per app.** All three surfaces need consistent, real-time views of stock, pricing, and order status (e.g. an admin confirming an order must immediately affect what the customer sees) — a single source of truth is required.

---

## 5. Repository Structure & Tooling

A single monorepo (npm workspaces) keeps shared types, validation schemas, and business logic constants (e.g. order status enum, discount priority order) consistent across every app. This is the actual current structure, not an aspirational one — items marked *(not yet scaffolded)* are real gaps, not renamed equivalents of something that already exists:

```
raza-stationers/
├── apps/
│   ├── web/              # Next.js customer website — full 14-page build, QA-passed
│   ├── admin/             # Next.js admin panel — scaffolded (config + placeholder page only, no real pages yet)
│   ├── mobile/             # React Native + Expo (Phase 2) — placeholder only, no real code
│   └── api/               # NestJS backend — NOT YET SCAFFOLDED (see open architecture question below)
├── packages/
│   ├── types/              # @raza-stationers/types — TypeScript domain types (Order, Product, ClientBusiness, etc.)
│   ├── api/                 # @raza-stationers/api — shared HTTP client used by web/admin/mobile to call the backend
│   ├── db/                   # @raza-stationers/db — DB access layer; must only ever be imported by the backend (apps/api), never by a frontend app — see note below
│   ├── validation/            # @raza-stationers/validation — Zod schemas shared between frontend forms and backend DTOs (created during the web build's Checkout phase)
│   └── ui/                     # @raza-stationers/ui — shared shadcn primitives, Bilingual, motion wrappers, and design tokens (packages/ui/src/styles/tokens.css), consumed by both apps/web and apps/admin
├── docs/
│   ├── PRD.md / BRD.md / FRD.md / TRD.md   # cross-cutting, both surfaces
│   ├── website/                              # apps/web-scoped: architecture.md, phases.md, qa_testing.md, qa-report.md
│   └── admin/                                  # apps/admin-scoped: architecture.md, phases.md, qa_testing.md
└── docker-compose.yml    # Local Postgres + services for development — NOT YET CREATED
```

**Fixed 2026-07-25:** `apps/web/package.json` had `@raza-stationers/db` listed as a direct dependency — a Next.js frontend importing the raw DB client would let it read/write the database without going through any of the NestJS auth guards `FR-SEC-01` requires. That dependency has been removed; `apps/admin`'s package.json was scaffolded without it from the start, for the same reason. Both frontends depend only on `@raza-stationers/api`.

**Note on `packages/ui`:** the components moved into `packages/ui` are copies of what already existed and was QA-passed in `apps/web/src/components/{ui,motion}` — `apps/web` was deliberately left importing its own local copies rather than being rewired to consume the new package in the same pass, to avoid risking a 60+ file mechanical import change against an already-approved build. `apps/admin` consumes `packages/ui` from day one. Migrating `apps/web` onto `packages/ui` (deleting its local duplicates) is a real, tracked follow-up — not silently accepted permanent duplication.

**Open architecture question, not yet decided:** §4 above specifies a separate NestJS backend (`apps/api`) as the single API every frontend calls. Since `apps/api` still isn't scaffolded, this remains a clean decision point rather than a correction: either (a) build `apps/api` as a real NestJS service per §4, the safer choice if the mobile app and admin panel need a stable, independently-versioned API contract, or (b) drop the separate backend and let Next.js Route Handlers / Server Actions in each frontend call `packages/db` directly, which is simpler to run and deploy (no second free-tier service, no Render cold starts) but means each of `apps/web` and `apps/admin` re-implements the same request-handling logic since they're now separate apps. This document still assumes (a) until the owner/Ahmed decides otherwise, since (a) is what the rest of this TRD (§4, §7, §8, §16) is written against.

CI runs on GitHub Actions (free tier: 2,000 minutes/month is sufficient) — lint, type-check, unit tests, and API integration tests on every pull request.

---

## 6. Database Schema

The schema below implements the FRD's functional modules. Field lists are representative, not exhaustive — the Prisma schema is the source of truth once implementation begins.

| Entity | Key Fields | Relations | Implements |
|---|---|---|---|
| **User** | id, mobile_number, password_hash, name, role (owner/admin/packing/delivery/business_user), is_active | → StaffProfile (if staff) or → BusinessUserLink (if business user) | FR-AUTH, FR-STF |
| **ClientBusiness** | id, business_name, owner_name, contact_person, phone, whatsapp, email, address, city, business_type, relationship_start_date, discount_percent, credit_limit, outstanding_balance, credit_status, account_status, internal_notes | → BusinessUserLink (many users), → Order (many), → DiscountChangeLog (many) | FR-CB (all), BRD CB-03 |
| **BusinessUserLink** | id, user_id, client_business_id, business_role (owner/manager/purchase_officer/branch_employee) | User ↔ ClientBusiness (many-to-many) | FR-CB-05, FR-CB-06 |
| **StaffProfile** | id, user_id, staff_role (admin/operator, packing, delivery), join_date | → User (1:1) | FR-STF |
| **Category** | id, name, name_urdu, parent_category_id | → Product (many) | FR-CAT |
| **Product** | id, name, name_urdu, shop_name, category_id, description, base_price, sku, barcode, is_archived, purchase_type (individual/bulk/both) | → Category, → ProductUnit (many), → StockLevel (1:1), → DiscountRule (many) | FR-CAT, PR-02 |
| **ProductUnit** | id, product_id, unit_name (piece/dozen/carton), conversion_to_base | → Product | FR-CAT-03, PR-02 |
| **StockLevel** | id, product_id, current_quantity (base unit), low_stock_threshold | → Product (1:1), → StockMovement (many) | FR-STK-01 to 04 |
| **StockMovement** | id, product_id, quantity_change, movement_type (restock/sale/adjustment), supplier, purchase_price, invoice_number, entered_by_user_id, created_at | → Product, → User | FR-STK-01 |
| **DiscountRule** | id, client_business_id, scope (account_wide/category/product), category_id (nullable), product_id (nullable), discount_percent (nullable), fixed_price (nullable), is_active | → ClientBusiness, → Category (opt), → Product (opt) | FR-PRC-01 to 03 |
| **DiscountChangeLog** | id, client_business_id, previous_value, new_value, changed_by_user_id, reason, created_at | → ClientBusiness, → User | FR-PRC-05 |
| **Order** | id, client_business_id, placed_by_user_id, status (enum, §10), payment_method, subtotal, delivery_charge, total, delivery_address, created_at, confirmed_at | → ClientBusiness, → User, → OrderItem (many), → OrderStatusHistory (many), → Payment (many) | FR-ORD (all) |
| **OrderItem** | id, order_id, product_id, unit, quantity, unit_price_at_order, line_total | → Order, → Product | FR-ORD, FR-PRC |
| **OrderStatusHistory** | id, order_id, from_status, to_status, changed_by_user_id, reason, created_at | → Order, → User | FR-ORD-06, §10 |
| **DeliveryAssignment** | id, order_id, delivery_worker_id, dispatched_at, delivered_at, delivery_status, cash_collected, failed_reason, returned_items | → Order, → User (delivery worker) | FR-DLV |
| **Payment** | id, order_id, client_business_id, amount, method (online/cash/credit/partial), status (pending/submitted/verified/rejected), transaction_reference, receipt_url, verified_by_user_id, created_at | → Order, → ClientBusiness | FR-PAY-05, FR-PAY-06 |
| **CreditTransaction** | id, client_business_id, order_id (nullable), amount, type (charge/payment/adjustment), balance_after, created_at, note | → ClientBusiness, → Order (opt) | FR-PAY-01 to 04, §11 |
| **ExpenseEntry** | id, category (rent/salaries/utilities/etc.), amount, description, entered_by_user_id, expense_date | → User | FR-ACC-02 |
| **NotificationSubscription** | id, user_id, scope (product/category/brand), target_id | → User | FR-NTF-01 |
| **Notification** | id, user_id, type, message, is_read, created_at | → User | FR-NTF (all) |
| **AuditLog** | id, actor_user_id, action_type, entity_type, entity_id, previous_value (JSON), new_value (JSON), created_at | → User | FR-SEC-02 |

**Indexing notes:** `Product.name`, `Product.shop_name`, and `Product.category_id` are indexed to keep catalogue search fast across 3,000–3,500 rows (FRD §10). `Order.status` and `Order.client_business_id` are indexed for the admin queue and business history views.

---

## 7. Authentication & Authorization

- **Demo environment:** Supabase Auth handles account creation, login, and session/JWT issuance (email/password to start, per the free-tier constraint on SMS OTP). Phone numbers are still stored on the `User`/`ClientBusiness` record for display and future OTP use — they're just not the login mechanism yet in the demo.
- **Production environment:** the same JWT-based auth pattern continues, either via a production Supabase tier, a dedicated auth provider, or a self-hosted solution — the application code does not need to change, only the provider configuration, because auth logic is abstracted behind an internal auth service module in the NestJS backend (not called directly from frontend code).
- **Authorization:** every API endpoint is protected by role-based guards in NestJS (`@Roles('admin', 'owner')` style decorators) implementing the permission matrix in FRD §5. This is enforced **server-side only** — the frontend hiding a button is a UX nicety, never the actual access control (FR-SEC-01).
- **Owner-only vs. Admin-allowed actions:** a plain `@Roles('admin', 'owner')` guard is not granular enough on its own — several endpoints must accept `owner` but reject `admin` even though both are staff roles. Per FRD §5 (v1.1), the following are **Owner-only**, not delegable to Admin: approving/rejecting a client business account, setting or approving a credit limit or credit status, viewing a client's payment history, all accounting/reporting endpoints, the audit log, stock corrections/adjustments (as opposed to routine restock entries), staff account management, and business settings. Admin retains order confirmation, routine stock entry, catalogue management, and discount/pricing-tier assignment. Implement this as two guard levels (e.g. `@Roles('owner')` vs `@Roles('admin', 'owner')`) rather than a single shared "staff" role, so a future permission change is a one-line decorator edit, not a logic rewrite.
- **2FA for Owner/Admin:** basic MFA is available on Supabase's free tier and should be enabled for the Owner account even in the demo, to establish the pattern early (FR-AUTH-04).

---

## 8. API Design

REST API (NestJS controllers), documented via Swagger/OpenAPI, versioned under `/api/v1/`. Representative endpoints by module — full contract lives in the generated OpenAPI spec once implementation begins.

| Module | Example Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/recover` |
| Client Businesses | `GET /client-businesses`, `POST /client-businesses`, `POST /client-businesses/:id/approve`, `PATCH /client-businesses/:id/discount`, `GET /client-businesses/:id/history` |
| Users (business-linked) | `POST /client-businesses/:id/users`, `DELETE /client-businesses/:id/users/:userId` |
| Catalogue | `GET /products`, `GET /products/:id`, `POST /products`, `POST /products/bulk-import`, `GET /categories` |
| Pricing | `GET /products/:id/price?businessId=...` (internal — resolves per §9 logic), used by cart/checkout, not called directly by clients for raw discount data |
| Cart/Checkout | `POST /checkout` (validates stock, minimums, payment method, credit — creates Order) |
| Orders | `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`, `POST /orders/:id/change-request`, `GET /orders/:id/slip` (PDF) |
| Payments | `POST /payments`, `POST /payments/:id/verify`, `GET /client-businesses/:id/credit` |
| Stock | `POST /stock/restock` (Admin, Owner), `POST /stock/adjustment` (Owner-only — corrections/write-offs, per `FR-STK-07`), `GET /stock/low-stock` |
| Delivery | `POST /orders/:id/dispatch`, `POST /orders/:id/deliver`, `POST /orders/:id/delivery-failed` |
| Staff | `GET /staff`, `POST /staff`, `PATCH /staff/:id/deactivate` |
| Accounting | `POST /expenses`, `GET /reports/sales`, `GET /reports/credit`, `GET /reports/stock-value` — all Owner-only (all support date-range query params, `?format=pdf|xlsx`) |
| Notifications | `GET /notifications`, `POST /notifications/subscribe`, `PATCH /notifications/:id/read` |
| Audit | `GET /audit-log?actor=&action=&from=&to=` |

All list endpoints support pagination (`?page=&limit=`) given the 3,000+ product catalogue and growing order history.

---

## 9. Pricing Engine — Technical Implementation

Implements FRD §8. A single backend service (`PricingService`) is the **only** place price resolution logic lives — called by the catalogue endpoint, cart, checkout, and reorder, so all four surfaces can never disagree on price.

```
resolvePrice(productId, clientBusinessId):
  1. look up DiscountRule where scope=product AND product_id=productId AND client_business_id=clientBusinessId AND is_active
     → if found, return fixed_price or (base_price × (1 - discount_percent))
  2. look up DiscountRule where scope=category AND category_id=product.category_id AND client_business_id=clientBusinessId AND is_active
     → if found, return accordingly
  3. look up ClientBusiness.discount_percent (account-wide default)
     → if set and business is approved/active, return base_price × (1 - discount_percent)
  4. return product.base_price (standard price) — used for guests, pending, and unapproved accounts
```

This function is unit-tested directly (Jest) against all four branches, per FRD §17 requirements.

---

## 10. Order Lifecycle — Technical Implementation

Implements the state machine in FRD §7. `Order.status` is a Postgres enum; transitions are enforced in an `OrderStateMachine` service that whitelists valid `from → to` pairs (matching the FRD table exactly) and rejects anything else with a 409 error. Every transition writes an `OrderStatusHistory` row, which also feeds the `AuditLog`.

Order confirmation triggers, in one transaction: stock decrement, picking-slip PDF generation, and a customer notification — this must be atomic so a confirmed order can never exist without a corresponding stock deduction.

---

## 11. Credit / Pay-Later — Technical Implementation

Implements FRD §9. `CreditService.checkAvailability(clientBusinessId, orderTotal)`:

1. Computes `available = credit_limit − outstanding_balance` from `ClientBusiness`.
2. If `orderTotal <= available` and `credit_status = active` → checkout proceeds, a `CreditTransaction` (type: charge) is created on order confirmation.
3. If `orderTotal > available` → order is created with status `pending_owner_approval`; Owner receives a notification with one-click approve/reject.
4. If `credit_status != active` → "Pay Later" is excluded from the checkout payment-method options entirely (not shown, not just disabled).

`outstanding_balance` on `ClientBusiness` is a derived/cached value, recalculated from the sum of `CreditTransaction` rows on every write — never manually edited directly, to guarantee it always reconciles with the transaction log (supports FRD `FR-ACC-06` traceability).

---

## 12. File & Image Storage

The finalized design system has **no product photography** — the catalogue is description-based only, represented with a solid icon block rather than a photo, per the reviewed design (`_ds` bundle) and BRD/FRD's Individual/Bulk purchase-type split. Object storage (Supabase Storage in the demo; a dedicated bucket service in production) is therefore used only for **payment receipts** (`Payment.receiptUrl`, manual verification per §15) and **client business documents** (`ClientBusiness` uploaded documents, per BRD `CB-03`) — referenced by URL from the database, never stored as binary blobs in PostgreSQL. Files are kept small (compressed where the format allows) to control storage usage within the 1GB free tier.

---

## 13. Notifications — Technical Implementation

Implements FRD §6.12. In both environments, notifications are triggered synchronously from the relevant API action (order confirmed, restock matching a subscription, payment reminder due) and written to the `Notification` table, then surfaced via the in-app notification center (FR-NTF-06). No message queue is required for this volume of activity — see §14.

Payment/due-date reminders run on a scheduled job (a simple daily cron-style job in the NestJS app, e.g. via `@nestjs/schedule`) that scans for upcoming/overdue `CreditTransaction` due dates — this does not require Redis or a dedicated queue at this scale.

---

## 14. Background Jobs / Queues

**Decision: no Redis/BullMQ in Version 1.** Order processing, notifications, and reports all run synchronously within API request/response cycles or via NestJS's built-in `@nestjs/schedule` for the daily reminder job. This significantly simplifies both the demo and initial production deployment. If order volume or reporting load later requires background processing, Upstash (Redis-compatible, has a free tier) can be introduced without restructuring the core application — this is a Phase 2+ consideration, not a v1 blocker.

---

## 15. Payments — Technical Implementation

**Demo environment:** a `Payment` record supports a mock/manual flow only — `Payment Pending → Payment Submitted → Payment Verified/Rejected`. The customer uploads a receipt or enters a transaction reference; the admin manually verifies it via `POST /payments/:id/verify`. No real gateway is called.

**Production environment:** once merchant accounts exist (BRD `PY-03`), the same `Payment` entity and status flow is extended with real gateway callbacks (Easypaisa/JazzCash/NayaPay webhook → auto-transitions `Payment` to Verified and triggers the same downstream logic the manual path already uses). Because the manual and automated paths converge on the same `Payment` state machine, this is an additive change, not a redesign.

Real payment integration requires, before it is enabled: signed business documents, provider sandbox access, and a security review of the payment webhook handling (per FR-PAY-07 in the FRD).

---

## 16. Security Architecture

Directly implements FRD §6.14 (`FR-SEC-01` to `FR-SEC-06`):

- **Server-side authorization** on every endpoint via NestJS guards — never trust client-side role checks.
- **Password hashing** via bcrypt/argon2 (never plaintext), enforced by the auth provider in both environments.
- **HTTPS everywhere** — enforced by Vercel/Render in the demo, and by the production host's TLS termination.
- **Audit log** (`AuditLog` table) written on every sensitive mutation: discount changes, credit limit/status changes, price overrides, stock edits, order confirmations, staff account changes.
- **Encryption at rest** for sensitive fields (customer contact info, financial balances) — handled at the managed-database level in both Supabase and production-grade Postgres hosting.
- **Backups:** automated daily backups are a **production requirement, not present in the demo** (Supabase's free tier explicitly lacks this — see §20). The demo therefore must never hold real confidential business data, per the constraint in §20.
- **Secrets management:** `.env` files, API keys, and service-role keys are never committed to the repository; `.gitignore` enforced from the first commit.

---

## 17. Testing Strategy

| Layer | Tool | Covers |
|---|---|---|
| Unit tests | Jest | Pricing engine (§9), credit logic (§11), order state machine (§10) — the highest-risk business logic |
| API integration tests | Supertest | Every controller endpoint, including authorization checks (attempting restricted actions as the wrong role, per FRD §10) |
| End-to-end tests | Playwright | Core customer flows (browse → cart → checkout) and core admin flows (confirm order → print slip → dispatch → deliver) |
| Manual/usability testing | N/A | Non-technical users (e.g. shop owners) walk through the UI before launch, per FRD §10 |

CI (GitHub Actions) runs lint, type-check, and the unit/integration suite on every pull request; Playwright E2E tests run against a preview deployment.

---

## 18. Monitoring & Logging

**Demo:** Vercel logs, Render logs, Supabase logs, and browser console are sufficient. Sentry's free Developer tier can optionally be added early to establish the error-tracking pattern.

**Production:** Sentry (or equivalent) becomes a requirement for error tracking and alerting, alongside host-level uptime monitoring, since real orders and money will depend on the system staying up.

---

## 19. Mobile App Architecture

Phase 2, per PRD/BRD/FRD. React Native + Expo, consuming the **same** backend API and shared `packages/types` (and `packages/validation` once it exists) from the monorepo — no separate backend or duplicated business logic. This assumes the "keep a real backend" side of the open architecture question in §5; if that's resolved the other way, the mobile app would need its own thin API layer since it can't call Next.js Server Actions directly. Distribution during the demo phase is via Expo Go or a shared Android APK; app-store publishing (Google Play $25 one-time, Apple Developer $99/year) is deferred until the business commits to production use.

---

## 20. Demo Environment (Now) — Full Configuration

| Part | Choice | Free-Tier Limit | Notes |
|---|---|---|---|
| Customer website | Next.js → Vercel Hobby | Personal/small-scale use | `raza-stationers-storefront.vercel.app` |
| Admin panel | Next.js → Vercel Hobby | Personal/small-scale use | `raza-stationers-admin.vercel.app` |
| Mobile app | React Native + Expo | Limited low-priority builds | Expo Go or shared APK |
| Backend | NestJS → Render Free | Sleeps after 15 min idle (~1 min cold start) | Acceptable for demo, not for live business |
| Database | Supabase PostgreSQL Free | 500MB DB, 2 active projects, no automated backups, **project auto-pauses after 7 days of inactivity** | Use 100–300 sample products, not the full catalogue. Log in periodically (or ping the project) to prevent pausing before a demo/presentation |
| Auth | Supabase Auth Free | 50,000 MAU, basic MFA | Email/password; phone OTP needs a paid SMS provider, so it's deferred |
| File storage | Supabase Storage Free | 1GB, 5GB egress | WebP-compressed sample images only |
| Repository | GitHub Private Free | Unlimited private repos, 2,000 CI minutes/month | Never commit secrets |
| Monitoring | Sentry Developer Free | 1 user | Optional at this stage |
| Domain | Free Vercel subdomain | — | Custom domain deferred |
| Payments | Mock/sandbox only | — | No real money ever touches the demo |
| Redis/queues | None | — | Not needed at this scale (§14) |

**Data rules for the demo (non-negotiable):** sample/fake business data only; no real customer balances; no real payment information; manual database export instead of relying on backups, since Supabase's free tier has none.

**Note on Vercel Hobby's terms:** the Hobby plan is for personal, non-commercial projects — using it while this is a portfolio demo (sample data, no real transactions, no real revenue) is within its terms. Once real orders or revenue are involved, this moves to Vercel Pro or another host regardless of budget, per §21.

**Estimated infrastructure cost: $0 — every layer of the stack, including hosting, is free for this demo phase.** No component listed above requires a paid plan, a credit card, or a trial that expires. The only real risk to keeping it at $0 is exceeding a free-tier limit (e.g. Supabase's 500MB or Render's cold-start/idle behavior) or letting a project sit unused long enough to auto-pause — both are usage caveats, not costs.

---

## 21. Production Environment (After Owner Approval) — Full Configuration

| Part | Change from Demo |
|---|---|
| Backend hosting | Move off Render Free to a paid, always-on tier (no cold starts) |
| Database | Paid managed PostgreSQL with automated backups and point-in-time recovery |
| File storage | Paid tier with higher capacity for the full 3,000–3,500 product catalogue's images |
| Authentication | Production-tier auth with SMS/WhatsApp OTP (requires a paid SMS provider) and enforced MFA for Owner/Admin |
| Payments | Real Easypaisa/JazzCash/NayaPay/bank integration, enabled only after merchant accounts, sandbox access, and a security review of the payment flow |
| Domain | Custom paid domain |
| Monitoring | Sentry (or equivalent) as a hard requirement, plus uptime monitoring |
| Mobile distribution | Google Play ($25 one-time) and/or Apple Developer ($99/year) if publishing to app stores |
| Security | Full security review pass before go-live, per BRD non-functional requirements (§16) |

No core technology changes — Next.js, NestJS, React Native, PostgreSQL, and Prisma all remain exactly as in the demo. Only hosting tier, backup policy, and integrations change.

---

## 22. Cost Summary

| Item | Demo (Now) | Production (After Approval) |
|---|---|---|
| Website + admin hosting | $0 (Vercel Hobby) | Paid plan or alternative host |
| Backend hosting | $0 (Render Free, with cold starts) | Paid, always-on tier |
| Database | $0 (Supabase Free, 500MB, no backups) | Paid managed Postgres with backups |
| File storage | $0 (Supabase Free, 1GB) | Paid tier as catalogue grows |
| Auth | $0 (Supabase Auth Free) | Production tier + SMS/WhatsApp OTP costs |
| Mobile builds | $0 (Expo free tier) | Google Play $25 one-time / Apple $99/year if published |
| Payments | $0 (mock only) | Gateway transaction fees (~1–2% per transaction, typical) |
| Monitoring | $0 (optional Sentry free tier) | Sentry or equivalent, paid tier likely |
| Domain | $0 (Vercel subdomain) | ~$10–15/year |
| **Total** | **$0** | Roughly $10–30+/month depending on chosen providers and traffic (consistent with the earlier roadmap estimate) |

---

## 23. Migration Path: Demo → Production

1. Owner reviews the working demo (sample data, mock payments) and approves real business use.
2. Confirm/open merchant accounts for Easypaisa/JazzCash/NayaPay (BRD `PY-03`) — this can start in parallel, earlier, since it involves external approval time.
3. Provision production-tier database, file storage, and backend hosting; migrate schema via Prisma migrations (no schema redesign needed).
4. Run the real product/customer bulk import (FR-MIG-01 to 04) using the business's actual data, replacing demo sample data.
5. Enable production auth tier, enforce MFA for Owner/Admin, add SMS/WhatsApp OTP if approved.
6. Switch `Payment` module from mock to live gateway callbacks (§15) after a security review.
7. Run the accounting parallel-run period (BRD `AC-03`) — new system alongside existing bookkeeping — before fully retiring the old process.
8. Point the custom domain at the production deployment; decommission demo URLs or keep them as a separate staging environment.

---

## 24. Non-Functional Requirements Mapping

| NFR (FRD §10 / BRD §16) | Technical Implementation |
|---|---|
| Fast catalogue search across 3,000+ SKUs | Postgres indexes on name/category; pagination on all list endpoints |
| Usable without instructions | Enforced at design stage, not infra — see design/wireframe documents |
| No silent failures on order/payment/stock actions | Explicit success/error responses on every mutating endpoint; frontend surfaces all API errors |
| Tested backup restoration | Deferred to production environment (§21) — demo explicitly excludes real data to compensate for lacking this |
| Server-side role enforcement verified in QA | Supertest suite includes negative tests (wrong role attempts each restricted action) |

---

## 25. Assumptions & Dependencies

- The demo environment is explicitly not suitable for any real customer or financial data — this is a hard constraint, not a suggestion, and should be respected even during later-stage testing with the business owner.
- Moving to production is triggered by an explicit business decision (owner approval), not a technical milestone — the TRD supports that decision but does not assume its timing.
- Real payment gateway integration depends on external, non-technical timelines (merchant account approval) noted already in the BRD (§18) and FRD (§13).
- Render's free-tier cold start (~1 minute) is acceptable for demo purposes but should be clearly communicated when presenting the demo live (e.g. "first load may take a moment").

---

## 26. Open Items

| Item | Needed From | Affects |
|---|---|---|
| Confirm which SMS/WhatsApp OTP provider to use in production | Owner (cost decision) | §21 Auth |
| Confirm production hosting provider/budget once approved | Owner | §21, §22 |
| Confirm merchant account status for Easypaisa/JazzCash/NayaPay | Owner (carried from BRD `PY-03`) | §15, §23 |
| Decide whether to publish to Google Play / Apple App Store, or distribute APK only | Ahmed + Owner | §19, §22 |

---

## 27. Approval & Sign-Off

This TRD should be reviewed alongside the PRD, BRD, and FRD before design work (sitemap, wireframes) and coding begin.

| Name | Role | Signature | Date |
|---|---|---|---|
| | Owner, Raza Stationers | | |
| Ahmed | Product Owner / Developer | | |

