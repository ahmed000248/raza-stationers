# Permission Matrix — Raza Stationers Access Control

**Phase**: Phase 0 Baseline  
**Scope**: Initial Role-Based Access Control (RBAC) & Route Action Permission Matrix  

---

## 1. Role Definitions

- **Visitor**: Unauthenticated guest browsing storefront.
- **Customer**: Authenticated retail or B2B client account holder.
- **Restricted Staff**: Operational employee (e.g. warehouse picker, delivery driver).
- **Manager**: Operational manager handling stock, orders, and delivery dispatch.
- **Owner / Admin**: Full administrative business authority.
- **Importer**: Standalone CLI pipeline process (System User).

---

## 2. Route & Action Permission Matrix

| Action / Route | Visitor | Customer | Restricted Staff | Manager | Owner / Admin | Importer | Business Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| View Public Storefront (`/`, `/catalogue`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| View Retail Product Details (`GET /products/:sku`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| View Wholesale Prices (`GET /pricing/resolve/:sku`) | ❌ Denied | ✅ Allowed (B2B) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| View Buying Cost Prices (`GET /admin/products`) | ❌ Denied | ❌ Denied | ❌ Denied | **BUSINESS DECISION REQUIRED** | ✅ Allowed | ❌ N/A | **BUSINESS DECISION REQUIRED** |
| Create Retail Order (`POST /orders`) | ✅ Guest Checkout | ✅ Allowed | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| Create B2B Credit Order (`POST /orders`) | ❌ Denied | ✅ Approved B2B Only | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| Approve B2B Client Business (`PUT /clients/:id/approve`) | ❌ Denied | ❌ Denied | ❌ Denied | **BUSINESS DECISION REQUIRED** | ✅ Allowed | ❌ N/A | **BUSINESS DECISION REQUIRED** |
| Update Client Credit Limit (`PUT /clients/:id/credit`) | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| View Admin Dashboard Metrics (`GET /dashboard/stats`) | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| Create / Edit Products (`POST /products`) | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| Execute Bulk Catalogue Import | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed (CLI) | ✅ CLI System | **CONFIRMED** |
| Record Stock Adjustments (`POST /stock/movements`) | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| Assign Delivery Driver (`POST /deliveries`) | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| View Accounting Summaries (`GET /accounting/*`) | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| Log Operating Expenses (`POST /accounting/expenses`) | ❌ Denied | ❌ Denied | ❌ Denied | **BUSINESS DECISION REQUIRED** | ✅ Allowed | ❌ N/A | **BUSINESS DECISION REQUIRED** |
| Manage Staff Accounts (`POST /staff`) | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| Modify Global Business Settings (`PUT /settings`) | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ N/A | **CONFIRMED** |
| View System Audit Logs (`GET /audit-logs`) | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ N/A | **CONFIRMED** |

---

## 3. Items Marked "BUSINESS DECISION REQUIRED"

The following permissions require explicit decision from Ahmed Raza before Phase 1 / Phase 2 role policy finalization:

1. **Manager Access to Buying Costs**: Should operational managers have visibility into product buying cost prices (`priceType = 'buying'`), or should cost data be restricted strictly to `owner`?
2. **Manager Access to B2B Client Approval**: Should store managers be authorized to approve pending B2B client applications (`PUT /clients/:id/approve`), or must all account approvals be granted by `owner`?
3. **Manager Authorization for Expense Entry**: Can branch/store managers submit operating expenses (`POST /accounting/expenses`) subject to owner review, or is financial expense logging reserved solely for `owner`?
