# Phase 4 API Contract Matrix

This document maps all the REST API endpoints defined in the NestJS backend and their integration with the frontend applications.

## API Endpoint Matrix

| HTTP Method | Route | Controller | Guard / Auth | Roles | Request DTO / Params | Response Structure | Frontend Caller | Status |
|-------------|-------|------------|--------------|-------|----------------------|--------------------|-----------------|--------|
| **GET** | `/` | `AppController` | None | None | None | `{ status: "ok" }` (or similar) | None (healthcheck) | Working |
| **GET** | `/products` | `CatalogueController` | None | None | `PaginationDto` (page, limit, search, categorySlug) | `{ items: Product[], total: number, page: number, limit: number, totalPages: number }` | `RazaAPIClient.getProducts()` | Broken (visibility check) |
| **GET** | `/admin/products` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ page, limit, status, categorySlug }` | `{ items: Product[], total: number }` | `RazaAPIClient.getAdminProducts()` | Working |
| **POST** | `/products` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ name, categoryId, purchaseType, shopName, description, wholesalePrice }` | Created `Product` | `RazaAPIClient.createProduct()` | Untested |
| **PUT** | `/products/:id` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ name, categoryId, shopName, description, purchaseType }` | Updated `Product` | `RazaAPIClient.updateProduct()` | Untested |
| **PUT** | `/products/:id/status` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ status }` | `{ id, status }` | `RazaAPIClient.updateProductStatus()` | Untested |
| **GET** | `/products/id/:id` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `id` (Param) | Full `Product` details | `RazaAPIClient.getProductById()` | Untested |
| **GET** | `/products/:sku` | `CatalogueController` | None | None | `sku` (Param) | Full `Product` details with packaging & prices | `RazaAPIClient.getProduct()` | Untested |
| **GET** | `/categories` | `CatalogueController` | None | None | None | `Category[]` | `RazaAPIClient.getCategories()` | Working |
| **POST** | `/auth/register` | `AuthController` | None | None | `{ name, mobileNumber, password }` | Auth payload | `RazaAPIClient.register()` | Untested |
| **POST** | `/auth/login` | `AuthController` | None | None | `{ mobileNumber, password }` | Auth token & profile | `RazaAPIClient.login()` | Working |
| **PUT** | `/auth/change-password` | `AuthController` | `JwtAuthGuard` (Inferred) | None | `{ currentPassword, newPassword }` | `{ success: boolean }` | `RazaAPIClient.changePassword()` | Untested |
| **GET** | `/users/me` | `UsersController` | `JwtAuthGuard` (Inferred) | None | None | `User` Profile | `RazaAPIClient.getProfile()` | Working |
| **GET** | `/clients` | `ClientsController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ page, status }` | `{ items: ClientBusiness[], total: number }` | `RazaAPIClient.listClients()` | Working |
| **POST** | `/clients` | `ClientsController` | `JwtAuthGuard` | None | `{ businessName, businessType, contactPerson, mobileNumber, address, city }` | Registered `ClientBusiness` | `RazaAPIClient.registerClient()` | Untested |
| **GET** | `/clients/:id` | `ClientsController` | `JwtAuthGuard` | None | `id` (Param) | `ClientBusiness` details | `RazaAPIClient.getClient()` | Untested |
| **PUT** | `/clients/:id/approve` | `ClientsController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | None | `{ id, status }` | `RazaAPIClient.approveClient()` | Untested |
| **PUT** | `/clients/:id/credit` | `ClientsController` | `JwtAuthGuard`, `RolesGuard` | `owner` | `{ creditLimit, creditDays }` | Updated Credit details | `RazaAPIClient.updateClientCredit()` | Untested |
| **GET** | `/clients/:id/credit` | `ClientsController` | `JwtAuthGuard`, `RolesGuard` | `owner` | `id` (Param) | Credit Summary details | None (Internal admin check) | Untested |
| **GET** | `/dashboard/stats` | `DashboardController` | `JwtAuthGuard` | None | None | KPI Dashboard data | `RazaAPIClient.getDashboardStats()` | Working |
| **GET** | `/deliveries` | `DeliveryController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin`, `delivery` | `{ page }` | `{ items: Delivery[], total: number }` | `RazaAPIClient.getAllDeliveries()` | Working |
| **POST** | `/deliveries` | `DeliveryController` | None | None | Delivery details | Created `Delivery` | None (Internal) | Untested |
| **GET** | `/deliveries/:id` | `DeliveryController` | None | None | `id` (Param) | Full `Delivery` details | None (Internal) | Untested |
| **GET** | `/order-delivery/:orderId` | `DeliveryController` | None | None | `orderId` (Param) | `Delivery` for the order | None (Internal) | Untested |
| **POST** | `/admin/imports/catalogue/plan` | `ImportsController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` (Inferred) | Multipart XLSX File | Dry-run Plan check | None (Admin panel importer) | Working (Dry-run) |
| **POST** | `/admin/imports/catalogue/commit` | `ImportsController` | `JwtAuthGuard`, `RolesGuard` | `admin` (Wait, UserRole.admin?) | `{ planChecksum }` | Commit import | None (Admin panel importer) | Working |
| **GET** | `/stock` | `InventoryController` | `JwtAuthGuard` | None | `{ page }` | `{ items: StockBalance[], total: number }` | `RazaAPIClient.getAllStock()` | Working |
| **GET** | `/stock/:sku` | `InventoryController` | None | None | `sku` (Param) | `StockBalance` | `RazaAPIClient.getStock()` | Untested |
| **POST** | `/stock/movements` | `InventoryController` | None | None | Movement payload | Registered movement | None (Internal) | Untested |
| **GET** | `/stock-locations` | `InventoryController` | `RolesGuard` (Wait) | `owner`, `admin`, `packing` | None | `StockLocation[]` | None | Untested |
| **POST** | `/invoices` | `InvoicingController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ orderId }` | Created `Invoice` | None | Untested |
| **GET** | `/invoices/:id` | `InvoicingController` | None | None | `id` (Param) | Full `Invoice` details | `RazaAPIClient.getInvoice()` | Untested |
| **GET** | `/client-invoices/:clientBusinessId` | `InvoicingController` | None | None | `clientBusinessId` (Param) | `Invoice[]` for Client | `RazaAPIClient.getClientInvoices()` | Untested |
| **POST** | `/notifications/subscriptions` | `NotificationsController` | `JwtAuthGuard` | None | `{ scope, productId, categoryId }` | Subscribed subscription | `RazaAPIClient.subscribeToNotifications()` | Untested |
| **GET** | `/notifications/subscriptions` | `NotificationsController` | None | None | None | `Subscription[]` | `RazaAPIClient.getNotificationSubscriptions()` | Untested |
| **DELETE** | `/notifications/subscriptions/:id` | `NotificationsController` | None | None | `id` (Param) | Deleted Subscription | `RazaAPIClient.removeNotificationSubscription()` | Untested |
| **GET** | `/notifications` | `NotificationsController` | None | None | None | `Notification[]` | `RazaAPIClient.getNotifications()` | Untested |
| **PUT** | `/notifications/:id/read` | `NotificationsController` | None | None | `id` (Param) | Marked notification | `RazaAPIClient.markNotificationRead()` | Untested |
| **POST** | `/orders` | `OrdersController` | `JwtAuthGuard` | None | `{ clientBusinessId, items, recipientName, mobile, address, city }` | Created `Order` | `RazaAPIClient.createOrder()` | Untested |
| **GET** | `/orders` | `OrdersController` | None | None | `{ page, status }` | `{ items: Order[], total: number }` | `RazaAPIClient.getOrders()` | Working |
| **GET** | `/orders/:id` | `OrdersController` | None | None | `id` (Param) | Full `Order` details | `RazaAPIClient.getOrder()` | Working |
| **PUT** | `/orders/:id/status` | `OrdersController` | None | None | `{ status }` | Updated `Order` | `RazaAPIClient.updateOrderStatus()` | Working |
| **GET** | `/pricing/resolve/:sku` | `PricingController` | `JwtAuthGuard` | None | `{ sku, clientBusinessId }` | Resolved unit price | `RazaAPIClient.getResolvedPrice()` | Untested |
| **GET** | `/pricing/products/:sku` | `PricingController` | None | None | `sku` (Param) | Price records | None | Untested |
| **POST** | `/returns` | `ReturnsController` | `JwtAuthGuard` | None | Return details | Created `Return` | None | Untested |
| **GET** | `/returns/:id` | `ReturnsController` | None | None | `id` (Param) | `Return` details | None | Untested |
| **GET** | `/order-returns/:orderId` | `ReturnsController` | None | None | `orderId` (Param) | `Return[]` for Order | None | Untested |
| **GET** | `/settings` | `SettingsController` | `JwtAuthGuard`, `RolesGuard` | `owner` | None | Business settings | `RazaAPIClient.getSettings()` | Working |
| **PUT** | `/settings` | `SettingsController` | None | None | `{ businessName, contactPhone, requireApproval, stockAlert, packingView }` | Updated settings | `RazaAPIClient.updateSettings()` | Working |
| **GET** | `/staff` | `StaffController` | `JwtAuthGuard`, `RolesGuard` | `owner` | None | `StaffProfile[]` | `RazaAPIClient.listStaff()` | Working |
| **POST** | `/staff` | `StaffController` | None | None | `{ name, mobileNumber, password, role }` | Created Staff | `RazaAPIClient.createStaff()` | Untested |
| **PUT** | `/staff/:id/toggle-active` | `StaffController` | None | None | `id` (Param) | `{ id, isActive }` | `RazaAPIClient.toggleStaffActive()` | Untested |
| **PUT** | `/staff/:id/change-role` | `StaffController` | None | None | `{ role }` | `{ id, role }` | `RazaAPIClient.changeStaffRole()` | Untested |
| **GET** | `/users/me` | `UsersController` | None | None | None | Current `User` Profile | `RazaAPIClient.getProfile()` | Working |

## Identified Mocks & Gaps
* **Mock Data / Placeholders**: None identified in production backend. Some mock data exists in frontend client modules (e.g. notifications feed tab).
* **Supabase direct connections**: None. All frontend network requests route through the NestJS backend API.
