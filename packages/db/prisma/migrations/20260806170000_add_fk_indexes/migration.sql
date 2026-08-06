-- Migration for M-03: Add foreign key indexes for query performance optimization
BEGIN;

CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "public"."products"("category_id");
CREATE INDEX IF NOT EXISTS "idx_orders_placed_by_user_id" ON "public"."orders"("placed_by_user_id");
CREATE INDEX IF NOT EXISTS "idx_business_user_links_linked_by_id" ON "public"."business_user_links"("linked_by_id");
CREATE INDEX IF NOT EXISTS "idx_business_user_links_ended_by_id" ON "public"."business_user_links"("ended_by_id");
CREATE INDEX IF NOT EXISTS "idx_product_prices_created_by_id" ON "public"."product_prices"("created_by_id");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_stock_location_id" ON "public"."stock_movements"("stock_location_id");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_created_by_id" ON "public"."stock_movements"("created_by_id");
CREATE INDEX IF NOT EXISTS "idx_payments_submitted_by_id" ON "public"."payments"("submitted_by_id");
CREATE INDEX IF NOT EXISTS "idx_payments_verified_by_id" ON "public"."payments"("verified_by_id");

COMMIT;
