# 📚 Raza Stationers — Wholesale & Retail Management System

<div align="center">

![Raza Stationers Banner](https://img.shields.io/badge/Raza_Stationers-Enterprise_B2B_%26_Retail-2563eb?style=for-the-badge&logo=appveyor&logoColor=white)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2_(Turbopack)-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.3_(48_Models)-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-dc2626?style=for-the-badge)](LICENSE)

**An enterprise-grade, high-performance monorepo platform built for wholesale stationery distribution and retail commerce in Pakistan.**

[Storefront App](apps/web) • [Admin Operations Portal](apps/admin) • [Database Package](packages/db) • [System Specifications](docs)

</div>

---

## 🌟 Executive Overview

**Raza Stationers** is a dual-tier business management ecosystem handling **wholesale (B2B)** and **retail (B2C)** stationery commerce. It manages a real-world catalogue of **2,156+ products** across **87 categories**, supplying schools, offices, bookstores, and commercial clients across Rawalpindi and Islamabad.

> [!NOTE]
> **Production Scope**: Designed with strict business-rule enforcement, effective-dated 6-level pricing resolution, ledger-based credit accounts, multi-bucket inventory management, and complete append-only auditability.

---

## 🏗️ Architecture & Monorepo Structure

Built using an optimized **npm Workspaces Monorepo** architecture for high code reusability, strict separation of concerns, and ultra-fast builds via **Turbopack**.

```mermaid
graph TD
    subgraph APPS["📱 Applications Layer (apps/)"]
        WEB["apps/web<br/><b>Customer Storefront</b><br/>Next.js 16 (Turbopack) • React 19"]
        ADMIN["apps/admin<br/><b>Owner & Staff Portal</b><br/>Next.js 16 • Role-Gated KPIs"]
        MOBILE["apps/mobile<br/><b>Mobile App Scaffold</b><br/>Expo / React Native Ready"]
    end

    subgraph PACKAGES["📦 Shared Packages Layer (packages/)"]
        DB["packages/db<br/><b>Database Package</b><br/>Prisma ORM • 48 Models • 39 Enums"]
        API["packages/api<br/><b>API Services</b><br/>Shared HTTP Client & Handlers"]
        TYPES["packages/types<br/><b>Domain Contracts</b><br/>TypeScript Interfaces & Schemas"]
        UI["packages/ui<br/><b>Design System</b><br/>Component Primitives & Tokens"]
        VALIDATION["packages/validation<br/><b>Form Validation</b><br/>Zod Schemas & Assertions"]
    end

    WEB --> TYPES
    WEB --> API
    WEB --> DB
    WEB --> VALIDATION
    WEB --> UI

    ADMIN --> TYPES
    ADMIN --> API
    ADMIN --> DB
    ADMIN --> UI

    MOBILE --> TYPES
    MOBILE --> API
    MOBILE --> DB
```

### 💻 Package Breakdown

| Package | Path | Purpose | Key Stack |
|---|---|---|---|
| 🌐 `@raza-stationers/web` | [`apps/web`](apps/web) | Customer B2B/B2C E-Commerce Storefront | Next.js 16, React 19, GSAP, Framer Motion, Lenis, Three.js |
| 🛡️ `@raza-stationers/admin` | [`apps/admin`](apps/admin) | Owner & Staff Operations Dashboard | Next.js 16, Tailwind CSS v4, Lucide Icons, Recharts |
| 📱 `@raza-stationers/mobile` | [`apps/mobile`](apps/mobile) | React Native Mobile App | Expo, React Native |
| 🗄️ `@raza-stationers/db` | [`packages/db`](packages/db) | Database Schema, Prisma Models & Service Client | Prisma ORM 6.3, PostgreSQL |
| 🔌 `@raza-stationers/api` | [`packages/api`](packages/api) | Shared API Layer & Client Handlers | TypeScript, Fetch API |
| 📐 `@raza-stationers/types` | [`packages/types`](packages/types) | Centralized TypeScript Types & Contracts | TypeScript 5 |
| 🎨 `@raza-stationers/ui` | [`packages/ui`](packages/ui) | Shared UI Design Tokens & Components | Tailwind CSS v4, React 19 |
| 🧪 `@raza-stationers/validation` | [`packages/validation`](packages/validation) | Enterprise Validation Rules | Zod 3.24 |

---

## ⚡ Core Systems & Business Logic

### 💰 1. Six-Level Price Resolution Engine

To support complex wholesale tiering, prices resolve dynamically in a strict precedence hierarchy (stopping at the first match):

```
1. 🎯 Fixed Client-Specific Price    (ClientSpecificPrice)
2. 🏷️ Product-Level Discount        (DiscountRule: Product Scope)
3. 📂 Category-Level Discount       (DiscountRule: Category Scope)
4. 💼 Account-Wide Discount         (DiscountRule: Account Scope)
5. 🏬 Wholesale Package Price       (ProductPrice: Wholesale)
6. 🛒 Retail Price Fallback         (ProductPrice: Retail)
```

> [!IMPORTANT]
> **Pricing Invariants**: Discounts do not stack. Fixed client prices bypass discounts. Money values use exact `Decimal(14,2)` precision in PKR currency.

---

### 📦 2. Multi-Bucket Inventory Accounting

Stock is tracked in the base Unit of Measure (UOM) across 5 distinct buckets to prevent miscounts:

$$ \text{Available Stock} = \text{onHandQuantity} - \text{reservedQuantity} $$

$$ \text{Total Owned Inventory} = \text{onHandQuantity} + \text{unavailableQuantity} + \text{inTransitQuantity} + \text{damagedQuantity} $$

* **Stock Confirmation**: Reserves stock (`reservedQuantity` $\uparrow$).
* **Stock Packing**: Consumes reservation and moves stock from `onHand` to `unavailable`.
* **Stock Dispatch**: Transfers stock from `unavailable` to `inTransit`.
* **Delivery Completion**: Relinquishes ownership upon recipient signature.

---

### 💳 3. B2B Client Credit & Pay Later System

Wholesale client businesses can be granted dedicated credit privileges:
* **`0..1` Credit Account**: Created only upon explicit Owner approval (`ClientCreditAccount`).
* **Ledger-Derived Balance**: Balance is derived from append-only `CreditLedgerEntry` records (invoices, payments, refunds, adjustments)—never directly edited.
* **Over-Limit Approvals**: Orders exceeding available credit prompt an owner-approval workflow (`OrderCreditApproval`).

---

### 🔒 4. Append-Only Audit & Deletion Safety

* **0 Cascade Deletions**: 100% of the 165 database relationships enforce `onDelete: Restrict` to preserve business history.
* **Audit Trail**: Every critical action logs an `AuditLog` event recording actor, entity, timestamps, and redacted before/after JSON snapshots.

---

## 🛠️ Technology Stack

```
🖥️ Frontend & UI
├─ Framework: Next.js 16.2 (App Router, Turbopack)
├─ Core: React 19.2
├─ Styling: Tailwind CSS v4, Base UI, Lucide Icons
├─ Motion & Animation: GSAP 3.15, Framer Motion 12.4, Lenis Smooth Scroll
└─ 3D Visuals: Three.js, React Three Fiber

⚙️ Backend & Database
├─ ORM: Prisma ORM 6.3.1
├─ Database: PostgreSQL 16
├─ Schema Scale: 48 Models, 39 Enums
└─ Language: TypeScript 5.0 (Strict Mode)

📊 Tooling & Monorepo
├─ Workspaces: npm Workspaces
├─ Linter: ESLint 9 (Flat Config)
└─ Diagrams: Mermaid.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v20.x` or `v22.x`
* **npm**: `v10.x` or higher
* **PostgreSQL**: `v16.x` (or Supabase instance)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ahmed000248/raza-stationers.git
cd "raza-stationers"
npm install
```

### 2. Environment Setup

Create a `.env` file inside `packages/db/`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/raza_stationers?schema=public"
```

### 3. Database Initialization

Generate Prisma Client:

```bash
npm run prisma:generate --workspace=@raza-stationers/db
```

### 4. Running Local Development

Launch storefront and admin development servers simultaneously:

```bash
# Run Storefront (apps/web on http://localhost:3000)
npm run dev

# Run Admin Portal (apps/admin on http://localhost:3001)
npm run dev:admin
```

---

## 📊 Workspace Build & Verification

To verify full compilation across all workspace packages (`web`, `admin`, `mobile`, `api`, `db`, `types`, `ui`, `validation`):

```bash
npm run build
```

---

## 📄 Key Specifications & Documentation

Comprehensive architectural blueprints and business requirements are documented in the [`docs/`](docs) directory:

* 📋 [**Product Requirements Document (PRD)**](docs/PRD.md)
* 💼 [**Business Requirements Document (BRD)**](docs/BRD.md)
* ⚙️ [**Functional Requirements Document (FRD)**](docs/FRD.md)
* 🏛️ [**Technical Requirements Document (TRD)**](docs/TRD.md)
* 🗄️ [**Phase 4 Physical Schema Report**](docs/db/phase4-physical-schema-design-v0.1.md)
* 📊 [**System Architecture & Flow Diagrams**](docs/diagrams)

---

<div align="center">

**Developed with ❤️ for Raza Stationers**

*Designed for maximum reliability, speed, and elegance.*

</div>
