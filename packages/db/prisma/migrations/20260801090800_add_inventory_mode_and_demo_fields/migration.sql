-- AlterTable
ALTER TABLE "products" ADD COLUMN     "opening_stock_status" TEXT NOT NULL DEFAULT 'NOT_COUNTED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "business_settings" ADD COLUMN     "inventory_mode" TEXT NOT NULL DEFAULT 'DEMO';
