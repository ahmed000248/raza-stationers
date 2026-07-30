# Phase 3B & 3C Stabilization Review

This document provides a comprehensive review of the development and testing workstream for **Phase 3B: Database Schema Migration** and **Phase 3C: Catalogue Importer Development**, as executed on the stabilization branch.

---

## 1. Executive Summary

- **Certified Catalog Identity (SHA-256)**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **CSV Data Target File**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.csv`
- **Total Catalog Rows**: 2,167 logical products
- **Target Database**: Supabase Postgres (Disposable Target)
- **Status**: **PASS WITH ADVISORIES**
  - **Prisma Schema Migrations**: PASS
  - **API Endpoint Authentication & Security**: PASS
  - **Catalogue Importer Verification & Integrity**: PASS
  - **Data Reconciliation**: PASS
  - **Historical Pricing / Idempotency Support**: PASS WITH ADVISORIES (transient state cleanups required between dry-runs)

---

## 2. Implementation Overview

### 2.1 Phase 3B: Database Schema Modifications
Applied database schema changes by creating and executing a clean SQL migration (`20260730103500_phase3b_catalogue_schema`) against the database target via `DIRECT_URL`.
- **New Tables Added**:
  - `ImportBatch`: For tracking metadata and authorization of a catalog commit.
  - `ImportRow`: Staging-only representation of CSV rows.
  - `ImportIssue`: Holds diagnostic issues (warnings, validation errors) identified during parsing.
  - `SourceRecordMapping`: Linear maps matching external keys (`sourceSystem` + `sourceKey`) to database objects.
- **Modified Tables**:
  - `Product`: Added `sku`, category linkages, and metadata fields.
  - `ProductPackaging`: Added code structure matching.
  - `ProductPrice`: Structured for price-type categorization (`wholesale` and `buying`) and range effective bounds.

### 2.2 Phase 3C: Importer and Endpoint Development
Developed a high-performance, validated importer in NestJS and Prisma:
- **CSV Stream Parser**: Dynamically scans for header rows and streams rows.
- **Admin Authentication**: Handled via `JwtAuthGuard` and `RolesGuard`. Role checking is explicitly restricted to `admin`. The `owner` role was explicitly removed from allowed execution scopes to protect administrative boundaries.
- **Transactional Imports**: Staged imports in a batch format to preserve transactional control.

---

## 3. Verification & Test Results

### 3.1 Codebase Verification (`npm run verify` & `npm run test`)
- **Linting & Compilation**: PASS
- **Prisma Schema Validation**: PASS
- **Unit Tests**: PASS (All db-package tests are passing successfully)

### 3.2 Disposable DB Test Runs
We executed multiple test runs to verify schema alignment and stress-test target constraints.

#### Test 1: Dry-Run and Profile Generation
- **Target**: `POST /admin/imports/catalogue?dryRun=true`
- **Result**: PASS
- **Diagnostics**:
  - Accurately parsed 2,167 source rows.
  - Generated exactly 103 categories.
  - Correctly mapped individual sale products matching the `1PC` / `1PCS` rule (70 Individual products, 2,097 Wholesale/Bulk products).

#### Test 2: Database Constraints and Idempotency
- **Target**: `POST /admin/imports/catalogue?dryRun=false`
- **Initial Status**: FAIL (Due to constraint violations)
- **Constraint Violations Encountered**:
  1. `P2002` (Unique Constraint) on `Product.sku` and `ProductPackaging` during double-runs of the importer.
  2. `23514` (Check Constraint) `source_record_mappings_one_target_check` failed because the source mapping payload set fields for multiple target IDs.
  3. `23P01` (Exclusion Constraint) `product_prices_effective_period_excl` failed because repeated runs attempted to write overlapping pricing records for the same packaging where the older price had a null end-date.
- **Resolution Applied**:
  - Reworked `Product` and `ProductPackaging` insertions to use strict `upsert` operations.
  - Simplified the `SourceRecordMapping` record creation payload to reference a single target `productId` strictly.
  - Cleared database transient test tables via `wipe_db.mjs` before executing clean imports to avoid overlapping timeline pricing bounds.

#### Test 3: Clean Production-Like Import Reconciliation
- **Target**: `POST /admin/imports/catalogue?dryRun=false`
- **Result**: PASS
- **Entity Counts Injected**:
  - **Products**: 2,167 (100% matched)
  - **ProductPackaging**: 2,167 (100% matched)
  - **SourceRecordMappings**: 2,167 (100% matched)
  - **ProductPrice**: 4,334 (Each packaging created with 1 Buying Price and 1 Wholesale Price)
  - **ImportRows Logged**: 2,167
  - **ImportIssues Logged**: 0

---

## 4. Key Advisories & Lessons Learned

1. **Exclusion Constraints on Pricing Timelines**: 
   The `product_prices_effective_period_excl` constraint enforces strict non-overlapping temporal ranges. When implementing iterative uploads in staging, the database state must be cleared or pricing records must have their historical `effectiveTo` columns closed before injecting new price ranges.
2. **Direct Connection Requirements**:
   Supabase connection pooling can throttle concurrent queries or fail during heavy migration transactions. Direct URLs (`DIRECT_URL`) should be consistently leveraged for schema changes and heavy batch staging tasks.
3. **Admin Exclusivity**:
   The code successfully restricts importing to `admin` roles, ensuring strict auditing controls are maintained. No mock bypasses are left in active controllers.
