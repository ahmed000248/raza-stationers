# Technical Requirements Document (TRD)

## Raza Stationers — E-Commerce & Business Management Platform

**Prepared for:** Raza Stationers
**Prepared by:** Ahmed (Product Owner), drafted with AI assistance
**Version:** 1.6 (Draft)
**Date:** July 25, 2026
**Status:** Draft
**Based on:** PRD v1.1, BRD v1.1, FRD v1.2

---

## Document Control

| Version | Date | Author | Description | Status |
|---|---|---|---|---| 1.0 | 2026-07-23 | Ahmed | Initial TRD — architecture, stack, schema, API, and two-environment (demo/production) strategy | Draft |
| 1.1 | 2026-07-23 | Ahmed | Added Owner-only vs. Admin-allowed authorization guidance and matching API endpoint annotations, aligned with FRD v1.1 | Draft |
| 1.2 | 2026-07-23 | Ahmed | Re-verified every demo-stack component against current provider pricing; confirmed all layers (including hosting) remain $0 for the demo phase; added Supabase's 7-day auto-pause caveat and a note on Vercel Hobby's non-commercial terms | Draft |
| 1.3 | 2026-07-25 | Ahmed | Reconciled this document against the actual scaffolded repo: switched §3/§5 from pnpm+Turborepo to npm workspaces (matches what's built, functionally equivalent for this scale); updated §5's repo tree to reflect real package/app names and flag what's not yet scaffolded (`apps/admin`, `apps/api`); removed stale product-image references from §6/§12 (no product photography, per the finalized description-based catalogue design); added `purchase_type` to the Product schema row; flagged an open architecture question on whether `apps/api` (NestJS) is still needed given Next.js Route Handlers/Server Actions could serve the same role | Draft |
| 1.4 | 2026-07-25 | Ahmed | `apps/admin` scaffolded as its own Next.js app (resolving part of v1.3's open question — a separate app, not a route inside `apps/web`); added `packages/ui` (shared shadcn primitives, Bilingual, motion wrappers, and design tokens, consumed by both `apps/web` and `apps/admin`); updated §5's repo tree; `docs/` split into `docs/website/` and `docs/admin/` for surface-specific documents, with PRD/BRD/FRD/TRD staying at `docs/` root as cross-cutting | Draft |
| 1.5 | 2026-07-26 | Ahmed | First real database design pass, against the actual rate list (`RS-Database.xlsx`: 2,156 products, 87 categories, wholesale prices only — retail/buying prices pending). Wrote `packages/db/prisma/schema.prisma`, the first real Prisma schema for this project (previously only a placeholder service-layer stub existed). Split Product's single `base_price` into `buying_price`/`wholesale_price`/`retail_price` (§6 row updated below) — a genuine pricing-model correction, not just a rename: it closes a gap where an approved wholesale account with no extra discount had no distinct price and silently saw the same price as a guest. BRD PR-01/CD-01 and FRD §8 updated to match (now a 5-tier priority order); `packages/types` and `apps/web`'s pricing logic/mock data updated in lockstep. | Draft |
| 1.6 | 2026-07-26 | Ahmed | Processed the business owner's answers to the 7 blocking database questions (`docs/phase2answers.md`) and Codex's independent Phase 2 verification of that file. Fixed two real schema gaps `StockMovement` was missing: `orderId` (traces a sale/reversal movement back to its order) and `purchaseDate` (BRD SK-01's own field, distinct from `createdAt`). Corrected BRD CD-04 and FRD FR-PRC-04, which described a "no price shown before approval" state that doesn't match the already-built, QA-passed storefront (pending accounts see retail prices plus a notice, never wholesale). Corrected BRD OF-01 (minimum orders: fully flexible, no MOQ engine needed) and OF-04 (delivery zones: free in Wah Cantt/Hassanabdal/Taxila, charged for Rawalpindi/Islamabad) with the owner's confirmed answers. Left one genuine open item: FR-DLV-02/03 (admin records delivery outcomes in v1) vs. the admin panel's `/delivery` page (built open to a `delivery`-role login directly) — needs an explicit choice before Phase 3 modeling of delivery continues. | Draft |
| 1.7 | 2026-07-26 | Ahmed/Codex | Phase 4 physical-schema alignment: Product is the required-SKU stock identity; ProductPackaging carries explicit conversions and independent effective-dated prices; categories remain flat; barcode/Brand/supplier/file/multi-warehouse scope is deferred; confirmation reserves and packing deducts; invoice/allocation/ledger/return/delivery-attempt/import-provenance models are introduced; transactional cascades are prohibited. | Demo-approved, awaiting business-owner production review |
| 1.8 | 2026-07-26 | Ahmed/Codex | Phase 5B reconciliation: optional Product base-unit low-stock threshold; yearly Order numbers; store-credit-only signed ledger; explicit CreditNote source; public-schema Supabase defence-in-depth plan | Demo-approved, awaiting independent migration review |
| 1.9 | 2026-08-06 | Ahmed | Phase 10 reconciliation: Switched authentication engine to **Better Auth** with same-origin BFF cookie proxying (`SameSite=Lax`, `Secure` in prod), Google OAuth, mandatory AAL2 TOTP MFA for Owner/Admin, real-time DB active check & role revocation (`BetterAuthGuard`), atomic product creation inside Prisma transactions, backend RLS database security model (`raza_runtime`), and query FK B-tree indexing | Completed & Approved |t migration review |

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

The schema below implements the FRD's functional modules. Field lists are representative, not exhaustive — **`packages/db/prisma/schema.prisma` is the actual source of truth** as of v1.5 (this is no longer a "once implementation begins" placeholder — the real Prisma schema exists and mirrors this table plus `packages/types`, entity-for-entity).

| Entity | Key Fields | Relations | Implements |
|---|---|---|---|
| **User / StaffProfile** | CUID id, required mobile/name/auth identity, optional email, role, deactivate metadata | Staff/User attribution is retained with `Restrict` | FR-AUTH, FR-STF |
| **ClientBusiness / BusinessUserLink** | business profile, optional NTN/CNIC/email, account state, historical user links | ClientBusiness → users/orders/payments; links end without deletion | FR-CB |
| **ClientCreditAccount** | optional 0..1 account per business, limit, credit days, status | → CreditLedgerEntry, limit-change and order-approval history | FR-PAY |
| **Category** | id, name, slug, active/archive fields | Flat Category → Product; no parent field in v0.1 | FR-CAT |
| **Product** | CUID id, required `RS-000001` SKU and sequence number, optional nonnegative base-unit low-stock threshold, category, review/activation and individual-sale flags | → ProductPackaging, aliases, stock and orders | FR-CAT, FR-STK, PR-02 |
| **UnitOfMeasure / ProductPackaging** | fractional capability, product-local package code, explicit conversion, base/confirmation/active state | Product → many packages, exactly one base | FR-CAT-03, PR-02 |
| **ProductPrice / ClientSpecificPrice / DiscountRule** | fixed-precision PKR amounts, effective periods, price type, non-stacking percentage scopes | Prices target ProductPackaging; discounts target business/product/category | FR-PRC |
| **StockLocation / StockBalance** | one active location in v1; on-hand, reserved, unavailable, in-transit, damaged base-unit quantities | Balance is a maintained projection | FR-STK |
| **StockReservation / StockMovement** | immutable base-unit reservations and bucket-to-bucket movement history with source/actor/reason | Historical authority for inventory | FR-STK |
| **Order / OrderItem / status/change/cancellation** | CUID plus stable `RS-ORD-YYYY-000001` yearly number, state machine and immutable commercial line snapshots | Never hard-deleted; one optional cancellation | FR-ORD |
| **Invoice / CreditNote** | one invoice per order, visible yearly numbers, due date, fixed-precision totals; each CreditNote has cancellation, return or manual-adjustment source | Original invoice retained | FR-PAY, FR-ACC |
| **Payment / PaymentAllocation** | verified manual payment and reversible many-to-many allocations | Payment ↔ Invoice via allocation history | FR-PAY |
| **CreditLedgerEntry / Refund** | append-only signed customer/store-credit changes only; positive adds usable credit and negative consumes/pays it out; invoice debt is separate | Store credit is ledger-derived | FR-PAY |
| **Return / ReturnItem** | partial return, original order item, condition, destination and inspection actors | Multiple partial returns per order | FR-RET |
| **Delivery / DeliveryAttempt / assignment/history** | one fulfilment, numbered attempts, current-worker assignment history and overrides | Retry/failure history retained | FR-DLV |
| **ImportBatch / ImportRow / ImportIssue / SourceRecordMapping** | SHA-256, raw staging, preview state, issues and canonical provenance | Import history retained after rollback | FR-MIG |
| **ExpenseEntry / Notification / NotificationSubscription / AuditLog** | voidable expenses, in-app product/category subscriptions, audit event shape | Brand target and file storage deferred | FR-ACC, FR-NTF, FR-SEC |

**Indexing notes:** `Product.name`, `Product.shop_name`, and `Product.category_id` are indexed to keep catalogue search fast across 3,000–3,500 rows (FRD §10). `Order.status` and `Order.client_business_id` are indexed for the admin queue and business history views.

---

## 7. Authentication & Authorization

- **Authentication Engine:** **Better Auth** (`apps/api/src/auth/better-auth.ts`) handles user creation, credential authentication, Google OAuth integration, and session management. Authentication credentials reside in PostgreSQL tables (`account`, `session`, `two_factor`, `verification`) managed via Prisma.
- **Session & Cookie Strategy:** Client applications use same-origin BFF proxying (`apps/web/src/app/api/auth/[...all]` and `apps/admin/src/app/api/auth/[...all]`). Better Auth issues Same-Site HTTP-only cookies (`SameSite=Lax`, `Secure` in production) so credentials are never exposed to browser scripts.
- **Real-Time Access Revocation:** `BetterAuthGuard` verifies user `role` and `isActive` status in real-time against the database on every protected NestJS request. Account deactivation or staff role modifications immediately delete active sessions (`session.deleteMany({ where: { userId } })`) and write audit logs.
- **Authorization & Role Guards:** API endpoints are protected by NestJS guards (`BetterAuthGuard`, `RolesGuard`, `@Roles(...)`). Administrative access is strictly enforced server-side.
- **Owner-only vs. Admin-allowed actions:** Owner-only endpoints (`@Roles('owner')`) include client account approval, credit limits/approvals, client payment history, financial/accounting reports, audit log inspection, staff management, and business settings. Admin retains order confirmation, routine stock entry, catalogue management, and discount tier assignment (`@Roles('owner', 'admin')`).
- **Mandatory AAL2 TOTP MFA:** Owner and Admin roles require verified AAL2 TOTP MFA via Better Auth (`authClient.twoFactor.verifyTotp`). `RolesGuard` rejects AAL1 sessions for privileged administrative routes.
- **Frontend Session State Clearing:** On HTTP 401 Unauthorized responses, `RazaAPIClient` invokes an `onUnauthorized` callback clearing cached React AuthProvider user, business, and role state cleanly.

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
resolvePrice(productPackagingId, clientBusinessId, at):
  require active Product + active/confirmed ProductPackaging + confirmed conversion/UOM
  select the one positive, effective wholesale/retail ProductPrice without overlapping periods
  1. return a matching fixed ClientSpecificPrice as the final price
  2. else apply one matching product-level percentage discount
  3. else apply one matching category-level percentage discount
  4. else apply one matching account-level percentage discount
  5. else return positive wholesale price for an approved wholesale account
  6. else return positive retail price; expose an admin warning for wholesale fallback
  if no positive applicable price exists, mark the package not orderable
```

Only one discount applies. Piece and package prices are independently entered; price division or `basePrice × conversion` is prohibited backend behaviour. The service is unit-tested against every branch and writes a full commercial snapshot to OrderItem.

---

## 10. Order Lifecycle — Technical Implementation

Implements the state machine in FRD §7. `Order.status` is a Postgres enum; transitions are enforced in an `OrderStateMachine` service that whitelists valid `from → to` pairs (matching the FRD table exactly) and rejects anything else with a 409 error. Every transition writes an `OrderStatusHistory` row, which also feeds the `AuditLog`.

Order placement revalidates stock but does not reserve it. Order confirmation locks affected StockBalance rows in deterministic Product order and atomically creates base-unit StockReservation rows for every line; all reservations succeed or the transaction rolls back. Packing consumes those reservations, reduces sellable on-hand, increases unavailable stock, appends StockMovement and OrderStatusHistory records, and changes status atomically. Dispatch transfers unavailable to in-transit. Failed/cancelled deliveries remain in-transit or unavailable until warehouse receipt and inspection routes stock to sellable, damaged or quarantined.

`available = onHand - reserved` and is calculated rather than stored. Reserved is already a subset of onHand. Total business-owned stock is `onHand + unavailable + inTransit + damaged`; reserved is not added again. Every balance and movement quantity uses the Product base unit. StockMovement and StockReservation are historical authority; StockBalance is a transactionally maintained projection, never an independently editable ledger.

---

## 11. Credit / Pay-Later — Technical Implementation

Implements FRD §9. `CreditService.checkAvailability(clientBusinessId, orderTotal)`:

1. Returns unavailable when the ClientBusiness has no active ClientCreditAccount.
2. When an account exists, derives unpaid invoice debt from issued Invoices, non-reversed PaymentAllocations and CreditNotes; it never records invoice charges in CreditLedgerEntry.
3. If `orderTotal <= available credit` and status is active, checkout may use approved credit and the financial entries are created with the Invoice transaction.
4. If `orderTotal > available credit`, Order is created with status `pending_owner_approval` and an OrderCreditApproval snapshot records the Owner decision.
5. If credit status is not active, credit is excluded as a settlement option. Client credit remains a ledger facility, not a PaymentMethod enum value.

Credit is optional: `ClientBusiness` has zero or one `ClientCreditAccount`, created only after Owner approval/configuration. Payments allocate across Invoices through immutable/reversible PaymentAllocation rows. Store credit is separately calculated as `sum(CreditLedgerEntry.amount)`: positive entries add customer-owned credit and negative entries consume or pay it out. Overpayments and refunds-to-credit create positive entries; credit application and cash/mobile/bank payout of stored credit create negative entries. Unverified payments do not affect invoice debt or store credit.

Every CreditNote explicitly selects `cancellation`, `return` or `manual_adjustment`. The first two require exactly the matching relation; manual adjustment has neither relation and requires future NestJS Owner-role validation. Credit notes adjust invoice outstanding calculations without rewriting the original Invoice.

---

## 12. File & Image Storage

Phase 4 schema version 0.1 does not introduce file-storage entities. Product images, wholesale registration documents and delivery-proof files are deferred. A Payment may retain a plain external/receipt reference string for manual reconciliation, but no upload subsystem or binary/document model is active in this schema.

---

## 13. Notifications — Technical Implementation

Implements FRD §6.12. In both environments, notifications are triggered synchronously from the relevant API action (order confirmed, restock matching a subscription, payment reminder due) and written to the `Notification` table, then surfaced via the in-app notification center (FR-NTF-06). No message queue is required for this volume of activity — see §14.

Payment/due-date reminders run on a scheduled job (a simple daily cron-style job in the NestJS app, e.g. via `@nestjs/schedule`) that scans issued Invoice due dates and derived outstanding amounts — this does not require Redis or a dedicated queue at this scale.

---

## 14. Background Jobs / Queues

**Decision: no Redis/BullMQ in Version 1.** Order processing, notifications, and reports all run synchronously within API request/response cycles or via NestJS's built-in `@nestjs/schedule` for the daily reminder job. This significantly simplifies both the demo and initial production deployment. If order volume or reporting load later requires background processing, Upstash (Redis-compatible, has a free tier) can be introduced without restructuring the core application — this is a Phase 2+ consideration, not a v1 blocker.

---

## 15. Payments — Technical Implementation

**Demo environment:** a `Payment` record supports a manual flow only — `Payment Pending → Payment Submitted → Payment Verified/Rejected`. The customer enters a transaction/reference string and the admin verifies it via `POST /payments/:id/verify`. No file upload or real gateway is called.

**Future production extension:** separately approved merchant integrations may extend the same Payment status flow with authenticated gateway callbacks. Easypaisa/JazzCash/bank integration is deferred; NayaPay is not an active schema-v0.1 method.

Real payment integration requires, before it is enabled: signed business documents, provider sandbox access, and a security review of the payment webhook handling (per FR-PAY-07 in the FRD).

---

## 16. Security Architecture & Database Hardening

Directly implements FRD §6.14 (`FR-SEC-01` to `FR-SEC-06`):

- **Server-Side Authorization & Guards:** Every NestJS API route is protected by `BetterAuthGuard` and `RolesGuard`, enforcing real-time active status validation against PostgreSQL.
- **Same-Origin Cookie BFF Architecture:** Web (`apps/web/src/app/api/auth/[...all]`) and Admin (`apps/admin/src/app/api/auth/[...all]`) applications use HTTP-only, Same-Site cookies (`SameSite=Lax`, `Secure` in production) to isolate auth credentials from browser JavaScript.
- **Database RLS & Least-Privilege Isolation:** Better Auth tables (`account`, `session`, `two_factor`, `verification`) are secured with Row Level Security (RLS) and revoked from untrusted browser roles (`anon`, `authenticated`, `PUBLIC`). The API connects exclusively via the restricted runtime user `raza_runtime`.
- **Query Performance & Indexing:** High-frequency join columns are indexed with non-unique B-tree foreign key indexes (`products.category_id`, `orders.placed_by_user_id`, `business_user_links.linked_by_id`, `business_user_links.ended_by_id`, `product_prices.created_by_id`, `stock_movements.stock_location_id`, `stock_movements.created_by_id`, `payments.submitted_by_id`, `payments.verified_by_id`).
- **Atomic Multi-Record Mutations:** All complex product, packaging, and initial price creations are wrapped inside interactive Prisma transactions (`$transaction`) with pre-insert Unit of Measure validation.
- **Financial Privacy:** Internal buying prices (`buyingPrice`) and profit analytics are stripped from customer-facing APIs and client bundles, accessible strictly to Owner/Admin roles.
- **Audit Logging:** Immutable `AuditLog` records capture operational actions (role changes, account deactivation, credit limit modifications) with correlation metadata.
- **Secrets Management:** Environment variables (`BETTER_AUTH_SECRET`, `JWT_SECRET`, `DATABASE_URL`, `DIRECT_URL`) are stored strictly in ignored `.env` files and managed via centralized validation (`apps/api/src/config/env.config.ts`).

---

## 17. Testing & Verification Strategy

| Layer | Tool / Command | Purpose & Coverage |
|---|---|---|
| Static & Unit Verification | `npm test` | Runs static checks, PWA, auth-navigation, checkout, and unit regression tests |
| Dedicated Phase 9 Audit Suite | `npm run test:phase9` | Runs the full 17-script Better Auth, MFA, takeover prevention, RLS, CORS, and transaction regression runner (`run_all_phase9_tests.mjs`) |
| API Startup Smoke Test | `npm run test:api-startup` | Validates compiled NestJS startup and environment variable guards |
| Database Validation | `npm run db:validate` & `npm run db:generate` | Verifies Prisma schema integrity and client generation |
| Production Build Compilation | `npm run build` | Validates clean production compilation across Web, Admin, API Server, Mobile, and shared packages |
| Disposable Docker Integration | `npm run test:integration` | Runs full disposable PostgreSQL 16 Docker container integration suite |

CI (GitHub Actions) executes `npm run verify`, `npm test`, `npm run test:phase9`, `npm run typecheck`, `npm run lint`, and `npm run build` on every pull request.

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
