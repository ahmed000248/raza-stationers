# Feature Inventory — Raza Stationers Web System

**Phase**: Phase 0 Baseline  
**Scope**: Complete Storefront (`apps/web`) and Admin Panel (`apps/admin`) Feature Inventory  

---

## 1. Storefront Features (`apps/web`)

| Area | Feature | Relevant Route | Relevant Files | API Dependency | Auth Req | Role Req | Data Source | Current Status | Evidence | Known Issue |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Auth | Customer Registration | `/register` | `apps/web/src/app/register/page.tsx` | `POST /auth/register` | Public | None | Supabase DB | **Connected** | Form submits to `POST /auth/register`, creates user & business, stores JWT | Client-side validation only; no OTP verification |
| Auth | Customer Login / Logout | `/signin` | `apps/web/src/app/signin/page.tsx` | `POST /auth/login` | Public | None | Supabase DB | **Connected** | Authenticates credentials, stores token in `localStorage` | Token stored in `localStorage` instead of httpOnly cookies |
| Catalogue | Product Browsing | `/catalogue` | `apps/web/src/app/catalogue/page.tsx` | `GET /products` | Public | None | Supabase DB | **Connected** | Fetches products with pagination & filters from NestJS API | Page resets on filter change; images default to fallback placeholders |
| Catalogue | Category Filtering | `/catalogue/[category]` | `apps/web/src/app/catalogue/[category]/page.tsx` | `GET /categories`, `GET /products?categorySlug=` | Public | None | Supabase DB | **Connected** | Fetches categories & category products via API client | Server-side query parameter mapping requires strict slug format |
| Catalogue | Product Search | `/catalogue` | `apps/web/src/components/catalogue/SearchHeader.tsx` | `GET /products?search=` | Public | None | Supabase DB | **Connected** | Submits debounced search query to `GET /products` | Case-insensitive search requires default DB index |
| Catalogue | Product Details | `/product/[id]` | `apps/web/src/app/product/[id]/page.tsx` | `GET /products/id/:id`, `GET /products/:sku` | Public | None | Supabase DB | **Connected** | Renders product info & packaging options, strictly excludes buying prices | Packaging price calculations handled client-side |
| Cart | Shopping Cart | `/cart` | `apps/web/src/app/cart/page.tsx` | Local State / `useCart` hook | Public | None | LocalStorage | **Partial** | Manages line items in React state & `localStorage` | Cart state not synced with backend database session |
| Checkout | Order Checkout | `/checkout` | `apps/web/src/app/checkout/page.tsx` | `POST /orders` | Required | Customer | Supabase DB | **Connected** | Submits cart items, delivery address, payment method to API | Cash on delivery default; gateway callback mocked for demo |
| Orders | Order History | `/orders` | `apps/web/src/app/orders/page.tsx` | `GET /orders` | Required | Customer | Supabase DB | **Connected** | Displays customer order list from `GET /orders` | Filter by status is client-side |
| Orders | Order Tracking / Detail | `/orders/[id]`, `/order-confirmation/[id]` | `apps/web/src/app/orders/[id]/page.tsx` | `GET /orders/:id` | Required | Customer | Supabase DB | **Connected** | Fetches single order details & item breakdown | Delivery tracking status relies on manual admin updates |
| Returns | Product Returns | `/orders/[id]` | `apps/web/src/app/orders/[id]/page.tsx` | `POST /returns` | Required | Customer | Supabase DB | **Partial** | UI contains return request modal calling `POST /returns` | Automated return authorization workflow pending admin review UI |
| Account | Business Profile | `/account` | `apps/web/src/app/account/page.tsx` | `GET /users/me` | Required | Customer | Supabase DB | **Connected** | Displays user & client business profile details | Profile update API endpoint lacks dedicated PUT method |

---

## 2. Admin Panel Features (`apps/admin`)

| Area | Feature | Relevant Route | Relevant Files | API Dependency | Auth Req | Role Req | Data Source | Current Status | Evidence | Known Issue |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Admin Auth | Admin Login | `/login` | `apps/admin/src/app/login/page.tsx` | `POST /auth/login` | Public | Staff/Admin | Supabase DB | **Connected** | Authenticates staff credentials, verifies admin/owner/staff role | Hardcoded admin credentials removed; uses real API |
| Dashboard | Analytics Dashboard | `/dashboard`, `/` | `apps/admin/src/app/dashboard/page.tsx` | `GET /dashboard/stats` | Required | Admin/Owner | Supabase DB | **Connected** | Renders revenue, pending orders, stock alerts, category sales | Some secondary breakdown widgets fallback to `mock` data if empty |
| Products | Product CRUD | `/catalogue` | `apps/admin/src/app/catalogue/page.tsx` | `GET /admin/products`, `POST /products`, `PUT /products/:id` | Required | Admin/Owner | Supabase DB | **Connected** | Tables fetch real DB products; modal permits creating & updating | Edit modal uses `MOCK_CATEGORIES` fallback if API category query fails |
| Categories | Category Management | `/catalogue` | `apps/admin/src/components/catalogue/CategoryFilterBar.tsx` | `GET /categories` | Required | Admin/Owner | Supabase DB | **Connected** | Fetches 87 active categories from backend | Category creation UI modal pending dedicated admin route |
| Packaging | Packaging Structure | `/catalogue` | `apps/admin/src/components/catalogue/ProductModal.tsx` | `GET /admin/products` | Required | Admin/Owner | Supabase DB | **Connected** | Displays packaging tiers (box, carton, pack) | Packaging tier creation locked to standard ratios |
| Prices | Wholesale & Retail Pricing | `/catalogue` | `apps/admin/src/components/catalogue/ProductModal.tsx` | `GET /pricing/products/:sku` | Required | Admin/Owner | Supabase DB | **Connected** | Displays wholesale & retail price records per product | Buying price modification restricted to owner role |
| Imports | Bulk Import Pipeline | `/catalogue` | `apps/admin/src/components/catalogue/BulkImportModal.tsx` | `packages/db/src/importer/cli.ts` | Required | Admin/Owner | File System | **Mocked** | Modal UI simulates file upload progress; backend CLI is standalone | Modal does not trigger backend node process directly |
| Clients | B2B Business Approval | `/client-businesses` | `apps/admin/src/app/client-businesses/page.tsx` | `GET /clients`, `PUT /clients/:id/approve` | Required | Admin/Owner | Supabase DB | **Connected** | Table displays client businesses; approve button updates status | Credit tier selection modal requires audit logging |
| Discounts | Discount & Credit Control | `/discount-credit` | `apps/admin/src/app/discount-credit/page.tsx` | `GET /clients`, `PUT /clients/:id/credit` | Required | Admin/Owner | Supabase DB | **Connected** | Lists client credit limits, used credit, and discount tiers | Custom tier assignment lacks automated credit scoring |
| Orders | Order Management | `/orders` | `apps/admin/src/app/orders/page.tsx` | `GET /orders`, `PUT /orders/:id/status` | Required | Staff/Admin | Supabase DB | **Connected** | Lists customer orders; status dropdown updates order state | Status transition does not auto-generate delivery dispatch |
| Returns | Return Processing | `/orders` | `apps/admin/src/app/orders/page.tsx` | `GET /order-returns/:orderId` | Required | Staff/Admin | Supabase DB | **Partial** | Inspects return requests submitted by clients | Refund credit transaction assignment requires accounting hook |
| Inventory | Stock Audit & Movements | `/stock` | `apps/admin/src/app/stock/page.tsx` | `GET /stock`, `POST /stock/movements` | Required | Staff/Admin | Supabase DB | **Connected** | Lists stock levels per location; movement form records adjustments | Multi-warehouse transfer requires location selector validation |
| Delivery | Delivery Dispatch | `/delivery` | `apps/admin/src/app/delivery/page.tsx` | `GET /deliveries`, `POST /deliveries` | Required | Staff/Admin | Supabase DB | **Connected** | Displays delivery notes, assigned drivers, and dispatch status | Driver assignment list is hardcoded select options |
| Staff | Staff & Role Management | `/staff` | `apps/admin/src/app/staff/page.tsx` | `GET /staff`, `POST /staff`, `PUT /staff/:id/change-role` | Required | Owner | Supabase DB | **Connected** | Lists staff members; modal permits creating staff & updating roles | Only accessible by `owner` role |
| Accounting | Accounting & Financials | `/accounting` | `apps/admin/src/app/accounting/page.tsx` | `GET /accounting/*`, `POST /accounting/expenses` | Required | Owner/Admin | Supabase DB | **Connected** | Displays summary, revenue, expense log, outstanding balances | Financial chart aggregation uses monthly DB summary view |
| Notifications | System Notifications | `/dashboard` | `apps/admin/src/components/shell/Header.tsx` | `GET /notifications` | Required | Staff/Admin | Supabase DB | **Connected** | Bell icon dropdown fetches unread system notifications | WebPush subscription browser permission request disabled in dev |
| Settings | Business Settings | `/settings` | `apps/admin/src/app/settings/page.tsx` | `GET /settings`, `PUT /settings` | Required | Owner | Supabase DB | **Connected** | Form manages tax rates, currency, business name, address | Requires owner role authorization |
| Audit Log | System Audit Timeline | `/audit-log` | `apps/admin/src/app/audit-log/page.tsx` | `GET /audit-logs` | Required | Owner/Admin | Supabase DB | **Connected** | Displays system audit events and staff actions | Audit log entry creation relies on API service interceptors |
