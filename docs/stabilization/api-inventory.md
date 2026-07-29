# API Inventory — Raza Stationers Backend System

**Phase**: Phase 0 Baseline  
**Scope**: Inspection of all NestJS Controllers, Services, Guards, and Endpoints (`apps/api/src/*`)  

---

## 1. Complete API Endpoint Inventory

| Method | Route | Controller | Service | Auth Guard | Role Guard | Allowed Roles | Tenant Scoping | Request DTO | Response Data | Tx Usage | Audit Log | Current Status | Security Concern |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | `AppController` | `AppService` | None | None | Public | None | None | Health status object | None | None | **Connected** | None |
| `POST` | `/auth/login` | `AuthController` | `AuthService` | None | None | Public | None | `LoginDto` | `{ accessToken, user }` | None | Yes | **Connected** | Returns JWT token; fallback secret used if env missing |
| `POST` | `/auth/register` | `AuthController` | `AuthService` | None | None | Public | None | `RegisterDto` | `{ accessToken, user, business }` | `$transaction` | Yes | **Connected** | Creates user & client business in atomic transaction |
| `PUT` | `/auth/change-password` | `AuthController` | `AuthService` | `JwtAuthGuard` | None | Authenticated | User ID | `ChangePasswordDto` | `{ message: string }` | None | Yes | **Connected** | Requires authenticated JWT |
| `GET` | `/users/me` | `UsersController` | `UsersService` | `JwtAuthGuard` | None | Authenticated | User ID | None | User profile & business details | None | None | **Connected** | None |
| `GET` | `/products` | `CatalogueController` | `CatalogueService` | None | None | Public | None | Query params | Paginated products list | None | None | **Connected** | Strictly excludes `buying` prices |
| `GET` | `/products/:sku` | `CatalogueController` | `CatalogueService` | None | None | Public | None | SKU param | Product detail object | None | None | **Connected** | Strictly excludes `buying` prices |
| `GET` | `/products/id/:id` | `CatalogueController` | `CatalogueService` | None | None | Public | None | ID param | Product detail object | None | None | **Connected** | Strictly excludes `buying` prices |
| `GET` | `/categories` | `CatalogueController` | `CatalogueService` | None | None | Public | None | None | Active categories list | None | None | **Connected** | None |
| `GET` | `/admin/products` | `CatalogueController` | `CatalogueService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Query params | Products including `buying` price | None | None | **Connected** | Restricted to Admin/Owner |
| `POST` | `/products` | `CatalogueController` | `CatalogueService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | `CreateProductDto` | Created product object | `$transaction` | Yes | **Connected** | Creates SKU, packaging, prices in transaction |
| `PUT` | `/products/:id` | `CatalogueController` | `CatalogueService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | `UpdateProductDto` | Updated product object | `$transaction` | Yes | **Connected** | Protected endpoint |
| `PUT` | `/products/:id/status` | `CatalogueController` | `CatalogueService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Status DTO | Updated product object | None | Yes | **Connected** | Protected endpoint |
| `GET` | `/pricing/products/:sku` | `PricingController` | `PricingService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | SKU param | Product price list | None | None | **Connected** | Strictly protected to Admin/Owner |
| `GET` | `/pricing/resolve/:sku` | `PricingController` | `PricingService` | `JwtAuthGuard` | None | Customer | `clientBusinessId` | Query params | Applicable price for client | None | None | **Connected** | Resolves customer discount tiers |
| `GET` | `/orders` | `OrdersController` | `OrdersService` | `JwtAuthGuard` | None | Customer/Staff | `clientBusinessId` | Query params | Paginated orders list | None | None | **Connected** | Scoped by tenant for customers |
| `GET` | `/orders/:id` | `OrdersController` | `OrdersService` | `JwtAuthGuard` | None | Customer/Staff | `clientBusinessId` | ID param | Order detail object | None | None | **Connected** | Verifies ownership before returning |
| `POST` | `/orders` | `OrdersController` | `OrdersService` | `JwtAuthGuard` | None | Customer | `clientBusinessId` | `CreateOrderDto` | Created order object | `$transaction` | Yes | **Connected** | Deducts stock & validates credit limit |
| `PUT` | `/orders/:id/status` | `OrdersController` | `OrdersService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | Status DTO | Updated order object | None | Yes | **Connected** | Requires staff/admin role |
| `GET` | `/clients` | `ClientsController` | `ClientsService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Query params | Client businesses list | None | None | **Connected** | Admin/Owner only |
| `POST` | `/clients` | `ClientsController` | `ClientsService` | None | None | Public | None | `RegisterClientDto` | Created client business | `$transaction` | Yes | **Connected** | Creates business in `pending_approval` |
| `GET` | `/clients/:id` | `ClientsController` | `ClientsService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | ID param | Client business detail | None | None | **Connected** | Admin/Owner only |
| `PUT` | `/clients/:id/approve` | `ClientsController` | `ClientsService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Status DTO | Updated business object | None | Yes | **Connected** | Admin/Owner only |
| `GET` | `/clients/:id/credit` | `ClientsController` | `ClientsService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | ID param | Credit status object | None | None | **Connected** | Financial data protected |
| `PUT` | `/clients/:id/credit` | `ClientsController` | `ClientsService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Credit DTO | Updated credit object | None | Yes | **Connected** | Financial data protected |
| `GET` | `/invoices/:id` | `InvoicingController` | `InvoicingService` | `JwtAuthGuard` | None | Customer/Staff | `clientBusinessId` | ID param | Invoice detail object | None | None | **Connected** | Tenant scoped |
| `POST` | `/invoices` | `InvoicingController` | `InvoicingService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | `CreateInvoiceDto` | Created invoice object | `$transaction` | Yes | **Connected** | Admin/Owner only |
| `GET` | `/client-invoices/:clientBusinessId` | `InvoicingController` | `InvoicingService` | `JwtAuthGuard` | None | Customer/Staff | `clientBusinessId` | Business ID | Client invoices list | None | None | **Connected** | Tenant scoped |
| `GET` | `/deliveries` | `DeliveryController` | `DeliveryService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | Query params | Delivery notes list | None | None | **Connected** | Staff/Admin only |
| `POST` | `/deliveries` | `DeliveryController` | `DeliveryService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | `CreateDeliveryDto` | Created delivery note | None | Yes | **Connected** | Staff/Admin only |
| `GET` | `/deliveries/:id` | `DeliveryController` | `DeliveryService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | ID param | Delivery note detail | None | None | **Connected** | Staff/Admin only |
| `GET` | `/order-delivery/:orderId` | `DeliveryController` | `DeliveryService` | `JwtAuthGuard` | None | Customer/Staff | `clientBusinessId` | Order ID | Order delivery status | None | None | **Connected** | Tenant scoped |
| `GET` | `/returns/:id` | `ReturnsController` | `ReturnsService` | `JwtAuthGuard` | None | Customer/Staff | `clientBusinessId` | ID param | Return request detail | None | None | **Connected** | Tenant scoped |
| `POST` | `/returns` | `ReturnsController` | `ReturnsService` | `JwtAuthGuard` | None | Customer | `clientBusinessId` | `CreateReturnDto` | Created return request | None | Yes | **Connected** | Tenant scoped |
| `GET` | `/order-returns/:orderId` | `ReturnsController` | `ReturnsService` | `JwtAuthGuard` | None | Customer/Staff | `clientBusinessId` | Order ID | Order returns list | None | None | **Connected** | Tenant scoped |
| `GET` | `/stock` | `InventoryController` | `InventoryService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | Query params | Inventory stock list | None | None | **Connected** | Staff/Admin only |
| `GET` | `/stock/:sku` | `InventoryController` | `InventoryService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | SKU param | SKU stock level | None | None | **Connected** | Staff/Admin only |
| `POST` | `/stock/movements` | `InventoryController` | `InventoryService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | `MovementDto` | Recorded movement | `$transaction` | Yes | **Connected** | Stock movement transaction |
| `GET` | `/stock-locations` | `InventoryController` | `InventoryService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | None | Warehouse locations | None | None | **Connected** | Staff/Admin only |
| `GET` | `/staff` | `StaffController` | `StaffService` | `JwtAuthGuard` | `RolesGuard` | Owner | None | Query params | Staff members list | None | None | **Connected** | Owner only |
| `POST` | `/staff` | `StaffController` | `StaffService` | `JwtAuthGuard` | `RolesGuard` | Owner | None | `CreateStaffDto` | Created staff member | None | Yes | **Connected** | Owner only |
| `PUT` | `/staff/:id/change-role` | `StaffController` | `StaffService` | `JwtAuthGuard` | `RolesGuard` | Owner | None | Role DTO | Updated staff object | None | Yes | **Connected** | Owner only |
| `PUT` | `/staff/:id/toggle-active` | `StaffController` | `StaffService` | `JwtAuthGuard` | `RolesGuard` | Owner | None | ID param | Updated staff object | None | Yes | **Connected** | Owner only |
| `GET` | `/accounting/summary` | `AccountingController` | `AccountingService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | None | Financial summary object | None | None | **Connected** | Financial protection |
| `GET` | `/accounting/revenue` | `AccountingController` | `AccountingService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Query params | Revenue breakdown | None | None | **Connected** | Financial protection |
| `GET` | `/accounting/expenses` | `AccountingController` | `AccountingService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Query params | Expense records list | None | None | **Connected** | Financial protection |
| `POST` | `/accounting/expenses` | `AccountingController` | `AccountingService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | `CreateExpenseDto` | Created expense record | None | Yes | **Connected** | Financial protection |
| `GET` | `/accounting/outstanding` | `AccountingController` | `AccountingService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | None | Outstanding balances | None | None | **Connected** | Financial protection |
| `GET` | `/dashboard/stats` | `DashboardController` | `DashboardService` | `JwtAuthGuard` | `RolesGuard` | Staff, Admin, Owner | None | None | Overview dashboard metrics | None | None | **Connected** | Admin/Owner stats |
| `GET` | `/audit-logs` | `AuditController` | `AuditService` | `JwtAuthGuard` | `RolesGuard` | Admin, Owner | None | Query params | Audit trail records | None | None | **Connected** | Audit protection |
| `GET` | `/settings` | `SettingsController` | `SettingsService` | `JwtAuthGuard` | `RolesGuard` | Owner | None | None | Business settings object | None | None | **Connected** | Owner only |
| `PUT` | `/settings` | `SettingsController` | `SettingsService` | `JwtAuthGuard` | `RolesGuard` | Owner | None | `UpdateSettingsDto` | Updated settings object | None | Yes | **Connected** | Owner only |
| `GET` | `/notifications` | `NotificationsController` | `NotificationsService` | `JwtAuthGuard` | None | Authenticated | User ID | Query params | User notifications list | None | None | **Connected** | User scoped |
| `PUT` | `/notifications/:id/read` | `NotificationsController` | `NotificationsService` | `JwtAuthGuard` | None | Authenticated | User ID | ID param | Updated notification | None | None | **Connected** | User scoped |
| `POST` | `/notifications/subscriptions` | `NotificationsController` | `NotificationsService` | `JwtAuthGuard` | None | Authenticated | User ID | Subscription DTO | Created subscription | None | None | **Connected** | User scoped |
| `GET` | `/notifications/subscriptions` | `NotificationsController` | `NotificationsService` | `JwtAuthGuard` | None | Authenticated | User ID | None | WebPush subscriptions | None | None | **Connected** | User scoped |
| `DELETE` | `/notifications/subscriptions/:id` | `NotificationsController` | `NotificationsService` | `JwtAuthGuard` | None | Authenticated | User ID | ID param | Deletion result | None | None | **Connected** | User scoped |

---

## 2. Special Security Flags & Verification Summary

1. **Request Body Business Identity Verification**: `POST /orders` and `POST /invoices` extract `clientBusinessId` directly from the authenticated user's JWT payload (`req.user.clientBusinessId`), preventing users from forging order creation for another business.
2. **DTO Validation Enforcement**: Global `ValidationPipe({ transform: true, whitelist: true })` is configured in `apps/api/src/main.ts`, stripping unparsed fields and casting query parameter types automatically.
3. **Buying Price Exposure Audit**: Public endpoints `GET /products`, `GET /products/:sku`, and `GET /products/id/:id` explicitly include the query clause `where: { priceType: { not: "buying" } }`, guaranteeing secret wholesale acquisition costs are never returned to public storefront users.
4. **Financial & Stock Transactions**: `POST /orders`, `POST /products`, `POST /invoices`, and `POST /stock/movements` utilize `prisma.$transaction()` to guarantee atomic state updates across multiple tables.
