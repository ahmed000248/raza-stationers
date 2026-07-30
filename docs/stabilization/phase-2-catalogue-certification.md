# Phase 2 Catalogue Certification Report — Raza Stationers

**Certification Date**: 2026-07-30  
**Git Branch**: `phase-2-catalogue-certification`  
**Base Commit**: `3291a11` (Phase 1 merge)  
**Workbook Path**: `data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx`  
**SHA-256 (registered)**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`  
**SHA-256 (pre-analysis)**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`  
**SHA-256 (post-analysis)**: `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`  
**File Size**: 376,017 bytes  
**Workbook modified during analysis**: **NO**  
**Database accessed or mutated**: **NO**  

---

## Certification Decision

> **CERTIFIED WITH ADVISORIES**

All mandatory structural, hash, count, identity, and field checks pass.  
Two non-blocking advisory findings are documented below; both require transparent Phase 3 handling.

---

## Analysis Methods

Two fully independent read methods were used:

| Method | Tool | Mode | Purpose |
| :--- | :--- | :--- | :--- |
| **Method A** | `openpyxl` | `data_only=True` (reads cached values, not formulas) | Logical data read; authoritative for row counts and field values |
| **Method B** | Python `zipfile` + `xml.etree.ElementTree` | Raw OOXML/ZIP inspection (no library) | Independent structural verification |

Cross-check: both methods must agree on sheet names, row count, and headers. They did.

---

## Workbook Structure

| Property | Value |
| :--- | :--- |
| File format | XLSX (Office Open XML) |
| Sheets (order) | Summary, Products, Categories, Supabase Import |
| Hidden sheets | None |
| Very-hidden sheets | None |
| VBA / Macros | No |
| External links | No |
| Data connections | No |
| Protected sheets | No |
| Protected workbook | No |
| ZIP entries | 18 |
| Shared strings | 0 (all strings stored inline as `t="str"`) |

### Products Sheet Layout

| Row | Content |
| :--- | :--- |
| 1 | Title: "Products — Final Business Master" |
| 2 | Subtitle/description note |
| 3 | Blank (not present in XML) |
| **4** | **Header row** |
| **5 – 2171** | **Product data (2,167 rows)** |

- Hidden rows: **0**
- Blank rows inside data range: **0**
- Merged cells inside data range: **0**
- Formula error cells: **0**
- Sheet protected: **No**

### Formula Columns

Three columns contain Excel formulas (analytics/display only — **not import fields**):

| Column | Header | Formula pattern |
| :--- | :--- | :--- |
| J | Profit | `=H-I` (Wholesale Price – Buying Price) |
| K | Profit Margin % | `=IF(H=0, 0, J/H)` |
| L | Markup % | `=IF(I=0, 0, J/I)` |

Method A (`data_only=True`) reads cached numeric values for these columns — correct for import purposes.  
Method B (raw OOXML) counts 6,501 formula elements (3 × 2,167 rows) — expected.

---

## Exact Headers and Column Order

| # | Header | Required | Type | Non-empty | Unique |
|--:|:--- |:--- |:--- |--:|--:|
| 1 | SKU | Yes | Text | 2,167 | 2,167 |
| 2 | Product Name | Yes | Text | 2,167 | 2,167 |
| 3 | Category | Yes | Text | 2,167 | 103 |
| 4 | Sales Type | Yes | Text | 2,167 | 2 |
| 5 | Unit of Measure | Yes | Text | 2,167 | 6 |
| 6 | Pack Quantity | Conditional | Numeric | 236 | 36 |
| 7 | Currency | Yes | Text | 2,167 | 1 |
| 8 | Wholesale Price | Yes | Numeric | 2,167 | 403 |
| 9 | Buying Price | Yes | Numeric | 2,167 | 608 |
| 10 | Profit | Computed | Numeric | 2,167 | 224 |
| 11 | Profit Margin % | Computed | Numeric | 2,167 | 718 |
| 12 | Markup % | Computed | Numeric | 2,167 | 715 |
| 13 | Active | Yes | Boolean text | 2,167 | 1 |
| 14 | Source Key | Yes | Text | 2,167 | 2,167 |

---

## Column Profile

### SKU (col 1)
- Non-empty: 2,167 / 2,167 — **Required, fully populated**
- Unique count: 2,167 — **All unique** (no duplicates)
- Pattern: `RS-NNNNNN` (9 chars max)
- Sample: `RS-000001`, `RS-000002`, `RS-000003`

### Product Name (col 2)
- Non-empty: 2,167 / 2,167 — **Required, fully populated**
- Unique count: 2,167 — **All unique** (no duplicates)
- Max text length: 31 characters
- Exact duplicate names: **0**
- Control characters: **0**
- Non-breaking spaces: **0**
- Formula-injection prefixes: **0**
- Excessively long (>255 chars): **0**

### Category (col 3)
- Non-empty: 2,167 / 2,167 — **Required, fully populated**
- Distinct categories: **103** ✓
- Blank categories: 0
- Case-only collisions: 0
- Leading/trailing whitespace: 0

### Sales Type (col 4)
- Non-empty: 2,167 / 2,167
- Values: `Wholesale` (2,097), `Individual` (70)
- Blank values: 0
- Unknown values: 0
- Case variations: 0 (exact casing consistent)

### Unit of Measure (col 5)
- Non-empty: 2,167 / 2,167
- Distinct values: **6** — `Box`, `Jar`, `Pack`, `Piece`, `Rim`, `Set`
- Blank values: 0

### Pack Quantity (col 6)
- Non-empty: 236 / 2,167 (1,931 blank — expected for Individual and non-pack Wholesale rows)
- Range: 1 – 500
- Unique values: 36

### Currency (col 7)
- All values: `PKR` (single currency, 100% populated)

### Wholesale Price (col 8)
- Non-empty: 2,167 / 2,167 — **Required, fully populated**
- Min: **PKR 5.00** | Max: **PKR 9,000.00**
- Zero values: **0**
- Negative values: **0**
- Non-numeric values: **0**

### Buying Price (col 9)
- Non-empty: 2,167 / 2,167 — **Required, fully populated**
- Min: **PKR 3.50** | Max: **PKR 8,500.00**
- Zero values: **0**
- Negative values: **0**
- Non-numeric values: **0**

### Profit (col 10) — Computed, not import field
- Derived: Wholesale Price − Buying Price
- Min: 0.50 | Max: 850.00
- All 2,167 rows have cached values

### Profit Margin % (col 11) — Computed, not import field
- Derived: Profit / Wholesale Price
- Min: ≈ 0.37% | Max: 75%

### Markup % (col 12) — Computed, not import field
- Derived: Profit / Buying Price
- Min: ≈ 0.37% | Max: 300%

### Active (col 13)
- All values: `True` (boolean text, 100% populated)

### Source Key (col 14)
- Non-empty: 2,167 / 2,167 — **Required, fully populated**
- Unique count: 2,167 — **All unique**
- Pattern: `WS-RATES:PAGE:ROW`
- Max text length: 18 characters

---

## Exact Reconciliation Totals

| Metric | Expected | Actual | Match |
| :--- | ---: | ---: | :--- |
| Total product rows | 2,167 | **2,167** | ✓ |
| Distinct categories | 103 | **103** | ✓ |
| Individual Sales Type | 70 | **70** | ✓ |
| Wholesale Sales Type | 2,097 | **2,097** | ✓ |
| Individual + Wholesale | 2,167 | **2,167** | ✓ |

**Method A row count**: 2,167  
**Method B row count**: 2,167  
**Cross-check**: AGREE ✓

---

## Identity Results

- Blank product names: **0**
- Exact duplicate names: **0**
- Blank SKUs: **0**
- Duplicate SKUs: **0** (all 2,167 SKUs unique)
- Blank Source Keys: **0**
- Duplicate Source Keys: **0**
- Control characters in names: **0**
- Non-breaking spaces in names: **0**
- Formula-injection prefixes: **0**

### Previously Removed Items

The final workbook was produced after removing:
- **4 duplicate product copies** — not present in the certified workbook (confirmed: 0 exact duplicate names)
- **8 unusable product identities** — not present in the certified workbook (confirmed: 0 blank names, 0 blank SKUs, no formula errors)

These removals are consistent with approved prior-phase decisions and are not re-examined here.

---

## Category Results

- Total distinct categories: **103** ✓
- Blank category values: **0**
- Case-only collisions (e.g. "Ballpoint" vs "BALLPOINT"): **0**
- Leading/trailing whitespace in category values: **0**
- Invisible character collisions: **0**

Category list is approved as-is per existing business approval for local Pakistani category labels.

---

## Sales Type Results

| Value | Count | Casing | Whitespace |
| :--- | ---: | :--- | :--- |
| `Wholesale` | 2,097 | Consistent | None |
| `Individual` | 70 | Consistent | None |

Sales Type values are clean. No blanks, no unknown values, no casing variants.

---

## Classification Rule

The `Sales Type` column is the **authoritative classification field** in the final approved workbook.  
The 1PC/1PCS/1 PCS rule was applied during workbook creation. The final workbook directly encodes the result.

**Observed pattern for Individual rows:**
- `Unit of Measure` = `Piece` (all 70 rows)
- `Pack Quantity` = `1` (all 70 rows)

**Consistency check:**
- 70 rows marked Individual → all have `unit=Piece, pack_qty=1` ✓
- 1 row has `unit=Piece, pack_qty=1` but is marked **Wholesale** (see Advisory A1 below)

---

## Price and Numeric Field Results

| Field | Min | Max | Zeros | Negatives | Non-numeric |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Wholesale Price | PKR 5.00 | PKR 9,000.00 | 0 | 0 | 0 |
| Buying Price | PKR 3.50 | PKR 8,500.00 | 0 | 0 | 0 |

All prices are valid, non-zero, non-negative numbers. All 2,167 rows have both prices populated.  
Price values are approved per existing business approval and are not reconsidered here.

---

## Packaging Results

- `Unit of Measure` distinct values: `Box`, `Jar`, `Pack`, `Piece`, `Rim`, `Set`
- Blank unit values: **0**
- `Pack Quantity` populated: 236 rows (1,931 blank — expected for non-pack products)
- Pack Quantity range: 1 – 500
- Negative quantities: **0**
- Non-numeric pack quantities: **0**

Existing wholesale packaging differences are approved business decisions.

---

## Spreadsheet Hazard Results

| Hazard | Count | Status |
| :--- | ---: | :--- |
| Empty rows inside product table | 0 | PASS |
| Duplicate header rows | 0 | PASS |
| Footer / subtotal rows mixed with products | 0 | PASS |
| Hidden product rows | 0 | PASS |
| Hidden required columns | 0 | PASS |
| Merged cells in data range | 0 | PASS |
| Formula error cells | 0 | PASS |
| External references | 0 | PASS |
| Hyperlinks in required fields | 0 | PASS |
| Newlines / control characters in names | 0 | PASS |
| Non-breaking spaces in names | 0 | PASS |
| Leading apostrophes | 0 | PASS |
| Numbers stored as text (prices) | 0 | PASS |
| Formula-injection prefixes (=, +, -, @) | 0 | PASS |
| Excessive text lengths (>255 chars) | 0 | PASS |
| VBA / macros | 0 | PASS |
| External data connections | 0 | PASS |
| Sheet protection | None | PASS |

---

## Blocking Failures

**None.**

All mandatory hash, structure, count, identity, required-field, and spreadsheet-safety checks pass.

---

## Advisory Findings

### A1 — CLASSIFICATION CONSISTENCY: 1 Wholesale row with unit=Piece / pack_qty=1

> **Row 2048, SKU `RS-002054`, Product Name: "DOLLAR PERMANENT MARKER 1 P"**

This row has `Unit of Measure = Piece` and `Pack Quantity = 1` — the same physical signature as Individual products — but is classified as `Wholesale`. The product name ending "1 P" suggests it may be a single-piece item sold in a wholesale context (e.g., sold individually to retailers).

**Impact**: Non-blocking. `Sales Type` is the authoritative field. This row is correctly classified as Wholesale per the approved workbook.  
**Phase 3 handling**: Phase 3 importer must use `Sales Type` as the authoritative field, not derive it from unit/pack data.

---

### A2 — Formula columns present in Products sheet

> Columns J (Profit), K (Profit Margin %), L (Markup %) contain Excel formulas across all 2,167 rows.

Formula count: 6,501 (3 columns × 2,167 rows). All formulas are analytics display columns only.  
Method A reads cached values; Method B counts raw formula elements. This difference is expected and explained.

**Impact**: Non-blocking. These columns are not import fields.  
**Phase 3 handling**: Importer must either skip columns J/K/L or accept cached numeric values only. Do not execute formulas.

---

## Human Review Items

None required.

---

## Phase 3 Handoff Contract

The following defines the approved workbook contract for Phase 3 importer development:

### Import Sheet
**Sheet name**: `Products`  
**Header row**: Excel row 4  
**Data rows**: Excel rows 5 – 2171 (2,167 rows)

### Import Columns (14 total)

| Col | Header | Type | Required | Notes |
|--:|:--- |:--- |:--- |:--- |
| A | SKU | Text | Yes | Unique identifier, format `RS-NNNNNN` |
| B | Product Name | Text | Yes | Unique per row |
| C | Category | Text | Yes | 103 approved categories |
| D | Sales Type | Text | Yes | `Individual` or `Wholesale` only |
| E | Unit of Measure | Text | Yes | One of: Box, Jar, Pack, Piece, Rim, Set |
| F | Pack Quantity | Numeric | Conditional | Populated for pack products (236 rows); blank otherwise |
| G | Currency | Text | Yes | Always `PKR` |
| H | Wholesale Price | Numeric | Yes | PKR 5 – 9,000; never zero or negative |
| I | Buying Price | Numeric | Yes | PKR 3.50 – 8,500; never zero or negative |
| J | Profit | Numeric | **Skip** | Computed column — do not import |
| K | Profit Margin % | Numeric | **Skip** | Computed column — do not import |
| L | Markup % | Numeric | **Skip** | Computed column — do not import |
| M | Active | Boolean text | Yes | Always `True` in this workbook |
| N | Source Key | Text | Yes | Unique traceability key |

### Classification Rule (mandatory for Phase 3)
- Use `Sales Type` column directly — it is the authoritative field
- Do **not** derive Sales Type from unit or pack quantity
- Exception documented: SKU `RS-002054` is Wholesale with `unit=Piece, pack_qty=1` (approved)

### Import Safety Rules
- Never execute formulas; use cached values only
- Strip leading/trailing whitespace from all text fields before import
- Validate: `Individual` count = 70, `Wholesale` count = 2,097, total = 2,167
- Validate: distinct categories = 103
- Reject import if SHA-256 does not match `7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b`

---

## Commands to Reproduce Certification

```bash
# From repository root, on phase-2-catalogue-certification branch
python tools/certify_catalogue.py data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx
python tools/certify_catalogue.py data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx --json-out tools/phase2-report.json

# Both invocations must exit 0 and produce identical output.
```

**Environment**: Python 3.14+, `openpyxl` package, stdlib `zipfile` + `xml.etree.ElementTree`.  
No database connection. No lockfile changes.

---

## Final Verification Checklist

| Check | Result |
| :--- | :--- |
| Certification tool run twice | ✓ Both runs produced identical results |
| SHA-256 unchanged pre/post analysis | ✓ `7cb65d6d...` unchanged |
| `package-lock.json` unchanged | ✓ Not modified |
| No database connection made | ✓ Confirmed |
| No generated temporary files remaining | ✓ Scratch scripts in `.gemini/` only |
| Workbook not modified | ✓ Confirmed by hash |
| No importer, API, feature or Supabase data modified | ✓ Confirmed |
