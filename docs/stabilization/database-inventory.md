# Database Inventory — Raza Stationers Schema & Data Layer

**Phase**: Phase 0 Baseline  
**Scope**: Inspection of Prisma Schema (`packages/db/prisma/schema.prisma`), Enums, Models, Constraints, and Data Boundaries  

---

## 1. Schema Summary & Core Statistics

- **Prisma Client Engine**: `7.9.0`
- **Database Provider**: PostgreSQL (`postgresql`)
- **Total Models**: 49 models
- **Total Enums**: 40 enums
- **Migrations Folder Count**: 5 physical migration folders on disk
- **Seed Scripts**: `packages/db/prisma/seed.ts` (Seeds initial categories, default admin user, and business settings)

---

## 2. Models & Data Classification Matrix

| Model Name | Table Name | Key Purpose | Primary Key | Foreign Keys | Monetary Fields | Stock / Quantity Fields | Tenant / Ownership Field | Sensitive / Protected Fields |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Product` | `products` | Master catalogue items | `id` (String UUID) | `categoryId` | None | None | None | `status`, `reviewReason` |
| `ProductPackaging` | `product_packaging` | Tiered unit packaging | `id` (String UUID) | `productId` | `retailPrice`, `wholesalePrice` | `quantity` | None | `buyingPrice` (via `prices` relation) |
| `ProductPrice` | `product_prices` | Price records by tier | `id` (String UUID) | `productPackagingId` | `priceAmount` | None | None | `priceType` (Type `buying` is sensitive) |
| `Category` | `categories` | Product categorization | `id` (String UUID) | `parentId` | None | None | None | None |
| `User` | `users` | User credentials & profile | `id` (String UUID) | `clientBusinessId` | None | None | `clientBusinessId` | `passwordHash`, `role` |
| `ClientBusiness` | `client_businesses` | B2B Wholesale Accounts | `id` (String UUID) | `ownerId` | `creditLimit`, `usedCredit` | None | `id` (Self) | `status`, `discountTier`, `taxNumber` |
| `Order` | `orders` | Sales orders | `id` (String UUID) | `clientBusinessId`, `createdById` | `totalAmount`, `subtotal`, `taxAmount`, `discountAmount` | None | `clientBusinessId` | `orderStatus`, `paymentStatus` |
| `OrderItem` | `order_items` | Sales order line items | `id` (String UUID) | `orderId`, `productId`, `packagingId` | `unitPrice`, `totalPrice` | `quantity` | None | None |
| `InventoryStock` | `inventory_stock` | Physical stock levels | `id` (String UUID) | `productId`, `packagingId`, `locationId` | None | `quantityOnHand`, `quantityReserved` | None | `reorderPoint` |
| `StockMovement` | `stock_movements` | Audit trail of inventory | `id` (String UUID) | `productId`, `locationId`, `createdById` | None | `quantityChange` | None | `movementType`, `reason` |
| `Invoice` | `invoices` | Billing & invoices | `id` (String UUID) | `orderId`, `clientBusinessId` | `totalAmount`, `amountPaid`, `balanceDue` | None | `clientBusinessId` | `invoiceStatus` |
| `DeliveryNote` | `delivery_notes` | Logistics dispatch notes | `id` (String UUID) | `orderId`, `driverId` | None | None | None | `deliveryStatus` |
| `Expense` | `expenses` | Operating expenses | `id` (String UUID) | `createdById` | `amount` | None | None | `category`, `approvedBy` |
| `AuditLog` | `audit_logs` | System security audit log | `id` (String UUID) | `userId` | None | None | None | `ipAddress`, `payload` |
| `BusinessSettings` | `business_settings` | Global store settings | `id` (String UUID) | None | `defaultTaxRate` | None | None | Store financial defaults |

---

## 3. Database Integrity & Security Rules

1. **SKU Uniqueness & Immutable Sequence**:
   - `Product.sku` is defined as `@unique` with format `RS-XXXXXX`.
   - SKU sequence allocations are **immutable**: once allocated or consumed during an import, an SKU sequence number must never be reset, reused, or recycled.
2. **Monetary Value Precision**:
   - All price, cost, tax, credit limit, and balance fields are stored using `Decimal(10, 2)` to avoid IEEE 754 floating-point rounding errors.
3. **Cross-Tenant Business Isolation**:
   - B2B customer accounts, orders, invoices, and credit balances are scoped by `clientBusinessId`.
   - Backend queries for B2B features MUST enforce `where: { clientBusinessId: user.clientBusinessId }` filters to prevent multi-tenant data leaks.
4. **Buying Price Confidentiality**:
   - Buying prices are recorded in `ProductPrice` rows with `priceType = 'buying'`.
   - Public customer-facing API endpoints strictly exclude buying prices from database queries.
5. **RLS & Security Warning**:
   - RLS is enabled on public business tables via Supabase migration `20260727021642_supabase_runtime_security`.
   - System table `_prisma_migrations` deliberately excludes manual RLS policy edits per Prisma ORM v7 requirements.
