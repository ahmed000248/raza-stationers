# Route Inventory — Raza Stationers Web System

**Phase**: Phase 0 Baseline  
**Scope**: All Storefront (`apps/web`) and Admin Panel (`apps/admin`) Frontend Routes  

---

## 1. Storefront Routes (`apps/web`)

| Route | Application | Public / Protected | Expected Role | Main Component | API Calls | Data Type | Loading State | Empty State | Error State | Current Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `apps/web` | Public | Visitor / Customer | `HomePage` (`app/page.tsx`) | `GET /products`, `GET /categories` | Real DB | Skeleton hero & grid | Fallback text | Toast message | **OPERATIONAL** |
| `/about` | `apps/web` | Public | Visitor / Customer | `AboutPage` (`app/about/page.tsx`) | None | Static | None | N/A | N/A | **OPERATIONAL** |
| `/account` | `apps/web` | Protected | Customer | `AccountPage` (`app/account/page.tsx`) | `GET /users/me` | Real DB | Spinner | Empty profile notice | Redirect to `/signin` | **OPERATIONAL** |
| `/cart` | `apps/web` | Public | Visitor / Customer | `CartPage` (`app/cart/page.tsx`) | LocalStorage | Local State | Skeleton | "Cart is empty" | Error banner | **OPERATIONAL** |
| `/catalogue` | `apps/web` | Public | Visitor / Customer | `CataloguePage` (`app/catalogue/page.tsx`) | `GET /products`, `GET /categories` | Real DB | Grid Skeleton | "No products found" | Retry button | **OPERATIONAL** |
| `/catalogue/[category]` | `apps/web` | Public | Visitor / Customer | `CategoryPage` (`app/catalogue/[category]/page.tsx`) | `GET /products?categorySlug=` | Real DB | Category Skeleton | "No products in category" | 404 / Error card | **OPERATIONAL** |
| `/checkout` | `apps/web` | Protected | Customer | `CheckoutPage` (`app/checkout/page.tsx`) | `POST /orders`, `GET /users/me` | Real DB | Submit Spinner | "Cart is empty" | Inline error summary | **OPERATIONAL** |
| `/contact` | `apps/web` | Public | Visitor / Customer | `ContactPage` (`app/contact/page.tsx`) | None | Static | Submit Spinner | N/A | Toast error | **OPERATIONAL** |
| `/dev/components` | `apps/web` | Public | Developer | `DevComponentsPage` (`app/dev/components/page.tsx`) | None | Static / Mock | None | N/A | N/A | **OPERATIONAL (DEV)** |
| `/order-confirmation/[id]` | `apps/web` | Protected | Customer | `OrderConfirmationPage` (`app/order-confirmation/[id]/page.tsx`) | `GET /orders/:id` | Real DB | Card Skeleton | "Order not found" | Error alert | **OPERATIONAL** |
| `/orders` | `apps/web` | Protected | Customer | `OrdersPage` (`app/orders/page.tsx`) | `GET /orders` | Real DB | Table Skeleton | "No orders placed yet" | Redirect to `/signin` | **OPERATIONAL** |
| `/orders/[id]` | `apps/web` | Protected | Customer | `OrderDetailPage` (`app/orders/[id]/page.tsx`) | `GET /orders/:id` | Real DB | Detail Skeleton | "Order not found" | Error card | **OPERATIONAL** |
| `/product/[id]` | `apps/web` | Public | Visitor / Customer | `ProductDetailPage` (`app/product/[id]/page.tsx`) | `GET /products/id/:id` or `/products/:sku` | Real DB | Details Skeleton | "Product not found" | 404 page | **OPERATIONAL** |
| `/register` | `apps/web` | Public | Visitor | `RegisterPage` (`app/register/page.tsx`) | `POST /auth/register` | Real DB | Button Spinner | N/A | Form error message | **OPERATIONAL** |
| `/signin` | `apps/web` | Public | Visitor | `SignInPage` (`app/signin/page.tsx`) | `POST /auth/login` | Real DB | Button Spinner | N/A | Invalid credentials alert | **OPERATIONAL** |

---

## 2. Admin Panel Routes (`apps/admin`)

| Route | Application | Public / Protected | Expected Role | Main Component | API Calls | Data Type | Loading State | Empty State | Error State | Current Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `apps/admin` | Protected | Staff / Admin / Owner | `AdminDashboard` (`app/page.tsx`) | `GET /dashboard/stats` | Real DB | Metric Skeleton | "No data available" | Redirect to `/login` | **OPERATIONAL** |
| `/accounting` | `apps/admin` | Protected | Admin / Owner | `AccountingPage` (`app/accounting/page.tsx`) | `GET /accounting/*` | Real DB | Summary Skeleton | "No financial records" | 401 Unauthorized | **OPERATIONAL** |
| `/audit-log` | `apps/admin` | Protected | Admin / Owner | `AuditLogPage` (`app/audit-log/page.tsx`) | `GET /audit-logs` | Real DB | Timeline Skeleton | "No audit events logged" | 401 Unauthorized | **OPERATIONAL** |
| `/catalogue` | `apps/admin` | Protected | Staff / Admin / Owner | `CatalogueManagement` (`app/catalogue/page.tsx`) | `GET /admin/products`, `GET /categories` | Real DB | Table Skeleton | "No products in database" | Error toast | **OPERATIONAL** |
| `/client-businesses` | `apps/admin` | Protected | Staff / Admin / Owner | `ClientsPage` (`app/client-businesses/page.tsx`) | `GET /clients` | Real DB | Card Skeleton | "No client businesses" | Error toast | **OPERATIONAL** |
| `/dashboard` | `apps/admin` | Protected | Staff / Admin / Owner | `DashboardPage` (`app/dashboard/page.tsx`) | `GET /dashboard/stats` | Real DB | Metric Skeleton | "No stats available" | Redirect to `/login` | **OPERATIONAL** |
| `/delivery` | `apps/admin` | Protected | Staff / Admin / Owner | `DeliveryPage` (`app/delivery/page.tsx`) | `GET /deliveries` | Real DB | Table Skeleton | "No deliveries scheduled" | Error toast | **OPERATIONAL** |
| `/discount-credit` | `apps/admin` | Protected | Admin / Owner | `DiscountCreditPage` (`app/discount-credit/page.tsx`) | `GET /clients` | Real DB | Table Skeleton | "No credit records" | 401 Unauthorized | **OPERATIONAL** |
| `/login` | `apps/admin` | Public | Visitor | `AdminLoginPage` (`app/login/page.tsx`) | `POST /auth/login` | Real DB | Button Spinner | N/A | Invalid credentials alert | **OPERATIONAL** |
| `/orders` | `apps/admin` | Protected | Staff / Admin / Owner | `OrdersPage` (`app/orders/page.tsx`) | `GET /orders` | Real DB | Table Skeleton | "No orders found" | Error toast | **OPERATIONAL** |
| `/settings` | `apps/admin` | Protected | Owner | `SettingsPage` (`app/settings/page.tsx`) | `GET /settings`, `PUT /settings` | Real DB | Form Skeleton | "Settings unavailable" | 401 Unauthorized | **OPERATIONAL** |
| `/staff` | `apps/admin` | Protected | Owner | `StaffManagement` (`app/staff/page.tsx`) | `GET /staff` | Real DB | List Skeleton | "No staff members" | 401 Unauthorized | **OPERATIONAL** |
| `/stock` | `apps/admin` | Protected | Staff / Admin / Owner | `StockManagement` (`app/stock/page.tsx`) | `GET /stock` | Real DB | Table Skeleton | "No stock records" | Error toast | **OPERATIONAL** |
