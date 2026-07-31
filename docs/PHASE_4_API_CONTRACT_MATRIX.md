# Phase 4 API Contract Matrix

This document maps all the REST API endpoints defined in the NestJS backend and their integration with the frontend applications.

## API Endpoint Matrix

| HTTP Method | Route | Controller | Guard / Auth | Roles | Request DTO / Params | Response Structure | Frontend Caller | Status |
|-------------|-------|------------|--------------|-------|----------------------|--------------------|-----------------|--------|
| **GET** | `/` | `AppController` | None | None | None | `{ status: "ok" }` | None (healthcheck) | Working |
| **GET** | `/products` | `CatalogueController` | None | None | `PaginationDto` (page, limit, search, categorySlug) | `{ items: Product[], total: number }` | `RazaAPIClient.getProducts()` | Working |
| **GET** | `/admin/products` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ page, limit, status, categorySlug }` | `{ items: Product[], total: number }` | `RazaAPIClient.getAdminProducts()` | Working |
| **POST** | `/products` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ name, categoryId, purchaseType, shopName, description, wholesalePrice }` | Created `Product` | `RazaAPIClient.createProduct()` | Working |
| **PUT** | `/products/:id` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ name, categoryId, shopName, description, purchaseType }` | Updated `Product` | `RazaAPIClient.updateProduct()` | Working |
| **PUT** | `/products/:id/status` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ status }` | `{ id, status }` | `RazaAPIClient.updateProductStatus()` | Working |
| **GET** | `/products/id/:id` | `CatalogueController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `id` (Param) | Full `Product` details | `RazaAPIClient.getProductById()` | Working |
| **GET** | `/products/:sku` | `CatalogueController` | None | None | `sku` (Param) | Full `Product` details with packaging & prices | `RazaAPIClient.getProduct()` | Working |
| **GET** | `/categories` | `CatalogueController` | None | None | None | `Category[]` | `RazaAPIClient.getCategories()` | Working |
| **POST** | `/auth/register` | `AuthController` | None | None | `{ name, mobileNumber, password }` | Auth payload | `RazaAPIClient.register()` | Working |
| **POST** | `/auth/login` | `AuthController` | None | None | `{ mobileNumber, password }` | Auth token & profile | `RazaAPIClient.login()` | Working |
| **PUT** | `/auth/change-password` | `AuthController` | `JwtAuthGuard` | None | `{ currentPassword, newPassword }` | `{ success: boolean }` | `RazaAPIClient.changePassword()` | Working |
| **GET** | `/users/me` | `UsersController` | `JwtAuthGuard` | None | None | `User` Profile | `RazaAPIClient.getProfile()` | Working |
| **GET** | `/clients` | `ClientsController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ page, status }` | `{ items: ClientBusiness[], total: number }` | `RazaAPIClient.listClients()` | Working |
| **POST** | `/clients` | `ClientsController` | `JwtAuthGuard` | None | `{ businessName, businessType, contactPerson, mobileNumber, address, city }` | Registered `ClientBusiness` | `RazaAPIClient.registerClient()` | Working |
| **GET** | `/clients/:id` | `ClientsController` | `JwtAuthGuard` | None | `id` (Param) | `ClientBusiness` details | `RazaAPIClient.getClient()` | Working |
| **PUT** | `/clients/:id/approve` | `ClientsController` | `JwtAuthGuard`, `RolesGuard` | `owner` | None | `{ id, status }` | `RazaAPIClient.approveClient()` | Working |
| **PUT** | `/clients/:id/credit` | `ClientsController` | `JwtAuthGuard`, `RolesGuard` | `owner` | `{ creditLimit, creditDays }` | Updated Credit details | `RazaAPIClient.updateClientCredit()` | Working |
| **GET** | `/clients/:id/credit` | `ClientsController` | `JwtAuthGuard` | None | `id` (Param) | Credit Summary details | None (Internal check) | Working |
| **GET** | `/dashboard/stats` | `DashboardController` | `JwtAuthGuard` | None | None | KPI Dashboard data | `RazaAPIClient.getDashboardStats()` | Working |
| **GET** | `/deliveries` | `DeliveryController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin`, `delivery` | `{ page }` | `{ items: Delivery[], total: number }` | `RazaAPIClient.getAllDeliveries()` | Working |
| **POST** | `/deliveries` | `DeliveryController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin`, `delivery` | `orderId` (Param) | Created `Delivery` | None (Internal) | Working |
| **GET** | `/deliveries/:id` | `DeliveryController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin`, `delivery` | `id` (Param) | Full `Delivery` details | None (Internal) | Working |
| **GET** | `/order-delivery/:orderId` | `DeliveryController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin`, `delivery` | `orderId` (Param) | `Delivery` for the order | None (Internal) | Working |
| **POST** | `/admin/imports/catalogue/plan` | `ImportsController` | `JwtAuthGuard`, `RolesGuard` | `admin` | Multipart XLSX File | Dry-run Plan check | None (Admin panel importer) | Working |
| **POST** | `/admin/imports/catalogue/commit` | `ImportsController` | `JwtAuthGuard`, `RolesGuard` | `admin` | `{ planChecksum }` | Commit import | None (Admin panel importer) | Working |
| **GET** | `/stock` | `InventoryController` | `JwtAuthGuard` | None | `{ page }` | `{ items: StockBalance[], total: number }` | `RazaAPIClient.getAllStock()` | Working |
| **GET** | `/stock/:sku` | `InventoryController` | `JwtAuthGuard` | None | `sku` (Param) | `StockBalance` | `RazaAPIClient.getStock()` | Working |
| **POST** | `/stock/movements` | `InventoryController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin`, `packing` | Movement payload | Registered movement | None (Internal) | Working |
| **GET** | `/stock-locations` | `InventoryController` | `JwtAuthGuard` | None | None | `StockLocation[]` | None | Working |
| **POST** | `/invoices` | `InvoicingController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ orderId }` | Created `Invoice` | None | Working |
| **GET** | `/invoices/:id` | `InvoicingController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `id` (Param) | Full `Invoice` details | `RazaAPIClient.getInvoice()` | Working |
| **GET** | `/client-invoices/:clientBusinessId` | `InvoicingController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `clientBusinessId` (Param) | `Invoice[]` for Client | `RazaAPIClient.getClientInvoices()` | Working |
| **POST** | `/notifications/subscriptions` | `NotificationsController` | `JwtAuthGuard` | None | `{ scope, productId, categoryId }` | Subscribed subscription | `RazaAPIClient.subscribeToNotifications()` | Working |
| **GET** | `/notifications/subscriptions` | `NotificationsController` | `JwtAuthGuard` | None | None | `Subscription[]` | `RazaAPIClient.getNotificationSubscriptions()` | Working |
| **DELETE** | `/notifications/subscriptions/:id` | `NotificationsController` | `JwtAuthGuard` | None | `id` (Param) | Deleted Subscription | `RazaAPIClient.removeNotificationSubscription()` | Working |
| **GET** | `/notifications` | `NotificationsController` | `JwtAuthGuard` | None | None | `Notification[]` | `RazaAPIClient.getNotifications()` | Working |
| **PUT** | `/notifications/:id/read` | `NotificationsController` | `JwtAuthGuard` | None | `id` (Param) | Marked notification | `RazaAPIClient.markNotificationRead()` | Working |
| **POST** | `/orders` | `OrdersController` | `JwtAuthGuard` | None | `{ clientBusinessId, items, recipientName, mobile, address, city }` | Created `Order` | `RazaAPIClient.createOrder()` | Working |
| **GET** | `/orders` | `OrdersController` | `JwtAuthGuard` | None | `{ page, status }` | `{ items: Order[], total: number }` | `RazaAPIClient.getOrders()` | Working |
| **GET** | `/orders/:id` | `OrdersController` | `JwtAuthGuard` | None | `id` (Param) | Full `Order` details | `RazaAPIClient.getOrder()` | Working |
| **PUT** | `/orders/:id/status` | `OrdersController` | `JwtAuthGuard`, `RolesGuard` | `owner`, `admin` | `{ status }` | Updated `Order` | `RazaAPIClient.updateOrderStatus()` | Working |
| **GET** | `/pricing/resolve/:sku` | `PricingController` | `JwtAuthGuard` | None | `{ sku, clientBusinessId }` | Resolved unit price | `RazaAPIClient.getResolvedPrice()` | Working |
| **GET** | `/pricing/products/:sku` | `PricingController` | `JwtAuthGuard` | None | `sku` (Param) | Price records | None | Working |
| **POST** | `/returns` | `ReturnsController` | `JwtAuthGuard` | None | Return details | Created `Return` | None | Working |
| **GET** | `/returns/:id` | `ReturnsController` | `JwtAuthGuard` | None | `id` (Param) | `Return` details | None | Working |
| **GET** | `/order-returns/:orderId` | `ReturnsController` | `JwtAuthGuard` | None | `orderId` (Param) | `Return[]` for Order | None | Working |
| **GET** | `/settings` | `SettingsController` | `JwtAuthGuard`, `RolesGuard` | `owner` | None | Business settings | `RazaAPIClient.getSettings()` | Working |
| **PUT** | `/settings` | `SettingsController` | `JwtAuthGuard`, `RolesGuard` | `owner` | `{ businessName, contactPhone, requireApproval, stockAlert, packingView }` | Updated settings | `RazaAPIClient.updateSettings()` | Working |
| **GET** | `/staff` | `StaffController` | `JwtAuthGuard`, `RolesGuard` | `owner` | None | `StaffProfile[]` | `RazaAPIClient.listStaff()` | Working |
| **POST** | `/staff` | `StaffController` | `JwtAuthGuard`, `RolesGuard` | `owner` | `{ name, mobileNumber, password, role }` | Created Staff | `RazaAPIClient.createStaff()` | Working |
| **PUT** | `/staff/:id/toggle-active` | `StaffController` | `JwtAuthGuard`, `RolesGuard` | `owner` | `id` (Param) | `{ id, isActive }` | `RazaAPIClient.toggleStaffActive()` | Working |
| **PUT** | `/staff/:id/change-role` | `StaffController` | `JwtAuthGuard`, `RolesGuard` | `owner` | `{ role }` | `{ id, role }` | `RazaAPIClient.changeStaffRole()` | Working |

## Audit Summary
* All sensitive mutation and configuration routes are restricted by `JwtAuthGuard` and, where appropriate, `RolesGuard`.
* No mock endpoints remain in the production NestJS backend.
