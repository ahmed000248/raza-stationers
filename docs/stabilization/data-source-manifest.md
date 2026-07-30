# Data Source Manifest — Approved Catalogue & Inventory

**Phase**: Phase 0 Baseline  
**Scope**: Product Data Source Registration & Import Authorization Status  

---

## 1. Approved Final Business Master Catalogue

- **Filename**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`
- **Relative Path**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`
- **SHA-256 Hash**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **File Size**: `376,017 bytes`
- **Sheet Breakdown**:
  1. `Summary`: Business totals and reconciliation matrix
  2. `Products`: 2,170 total rows (1 header + 2,167 product rows)
  3. `Categories`: 106 total rows (3 header/desc + 103 active categories)
  4. `Supabase Import`: Reconciled format for database seeding
- **Approved Totals**:
  - **Total Products**: `2,167 products`
  - **Total Categories**: `103 categories`
  - **Individual Sales Type**: `70 products`
  - **Wholesale Sales Type**: `2,097 products`
- **Approval Status**: `APPROVED AS FINAL BUSINESS CATALOGUE`
- **Authorized Usage**: Authorized ONLY for future development-database dry-run testing in Phase 3.
- **Prohibited Usage**: NOT authorized for production import or direct execution with current legacy importer scripts.
- **Importer Compatibility**: `INCOMPATIBLE / UNSAFE` (Requires Phase 3 importer refactoring to support multi-sheet Excel layout).

### Phase 2 Certification Result

- **Certification Date**: `2026-07-30`
- **Certification Decision**: `CERTIFIED WITH ADVISORIES`
- **Branch**: `phase-2-catalogue-certification`
- **Tool**: `tools/certify_catalogue.py` (read-only, deterministic, two independent methods)
- **SHA-256 (pre-analysis)**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`
- **SHA-256 (post-analysis)**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b` — unchanged
- **Actual Totals Confirmed**: 2,167 products · 103 categories · 70 Individual · 2,097 Wholesale
- **Blocking Failures**: None
- **Advisories**:
  - A1: 1 Wholesale row (SKU `RS-002054`) has `unit=Piece / pack_qty=1` — approved, importer must use `Sales Type` as authoritative
  - A2: Formula columns (Profit, Profit Margin %, Markup %) present — skip in import
- **Full Report**: `docs/stabilization/phase-2-catalogue-certification.md`
- **Machine Report**: `docs/stabilization/phase-2-catalogue-profile.json`
- **Workbook modified**: No
- **Database accessed**: No

---

## 2. Legacy & Archived Data Sources

The following historical files are archived and strictly prohibited from import operations:

| Filename | Location | SHA-256 Hash | Size (Bytes) | Status | Import Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Raza-Stationers-Final-Product-Master-v1.xlsx` | `data/archive/` | `432ecbbfa6bc1a67ad45e1439775ddcaee69e6b63d6b0521ad9c3b8bc0094770` | 1,082,138 | **ARCHIVED** | **PROHIBITED — NOT APPROVED FOR IMPORT** |
| `RS-Database-Updated-v2.xlsx` | `data/archive/` | `66e9f4a0fe6d91a10b2f2540913cecfcbd0653eecf717c71660bc3934b1968d5` | 235,400 | **ARCHIVED** | **PROHIBITED — NOT APPROVED FOR IMPORT** |
| `RS-Database.xlsx` | `data/archive/` | `43a34ad03cb3e52d5f14626306a3b1fb7656bccb728197f4dc2556b3ea52f63b` | 80,551 | **ARCHIVED** | **PROHIBITED — NOT APPROVED FOR IMPORT** |
| `WS RATE LIST.pdf` | `data/source/` | `07ddb0b88b912b6a67cb3db614b36bfcdd037c43414bbf5e6e777583ee8bd4c1` | 364,424 | **ARCHIVED SOURCE** | **PROHIBITED — REFERENCE ONLY** |
| `WS RATES.pdf` | `data/source/` | `50c27e9a48a2790b8a464e36eb6aefb578129d1c8926c42d08c8d638496ee862` | 376,847 | **ARCHIVED SOURCE** | **PROHIBITED — REFERENCE ONLY** |
