SET LOCAL search_path = "public", "extensions", pg_catalog;

CREATE TYPE "public"."fulfilment_method" AS ENUM ('delivery', 'pickup');
ALTER TYPE "public"."stock_movement_type" RENAME TO "stock_movement_type_old";
CREATE TYPE "public"."stock_movement_type" AS ENUM ('opening_balance', 'restock', 'packing', 'dispatch', 'delivery', 'return_receipt', 'inspection_release', 'damage_transfer', 'cancellation_reversal', 'adjustment');
ALTER TABLE "public"."stock_movements"
  ALTER COLUMN "movement_type" TYPE "public"."stock_movement_type"
  USING "movement_type"::text::"public"."stock_movement_type";
DROP TYPE "public"."stock_movement_type_old";

-- Refuse ambiguous identity merges before canonicalizing Pakistani mobiles.
DO $$
DECLARE
  duplicate_value text;
BEGIN
  SELECT canonical INTO duplicate_value
  FROM (
    SELECT CASE
      WHEN raw ~ '^00923[0-9]{9}$' THEN '0' || substr(raw, 5)
      WHEN raw ~ '^923[0-9]{9}$' THEN '0' || substr(raw, 3)
      WHEN raw ~ '^3[0-9]{9}$' THEN '0' || raw
      WHEN raw ~ '^03[0-9]{9}$' THEN raw
      ELSE NULL
    END AS canonical
    FROM (SELECT regexp_replace("mobile_number", '[[:space:]()+-]', '', 'g') AS raw FROM "public"."users") source
  ) normalized
  WHERE canonical IS NOT NULL
  GROUP BY canonical HAVING count(*) > 1 LIMIT 1;
  IF duplicate_value IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot canonicalize users: multiple rows represent mobile %', duplicate_value;
  END IF;

  SELECT canonical INTO duplicate_value
  FROM (
    SELECT CASE
      WHEN raw ~ '^00923[0-9]{9}$' THEN '0' || substr(raw, 5)
      WHEN raw ~ '^923[0-9]{9}$' THEN '0' || substr(raw, 3)
      WHEN raw ~ '^3[0-9]{9}$' THEN '0' || raw
      WHEN raw ~ '^03[0-9]{9}$' THEN raw
      ELSE NULL
    END AS canonical
    FROM (SELECT regexp_replace("mobile_number", '[[:space:]()+-]', '', 'g') AS raw FROM "public"."client_businesses") source
  ) normalized
  WHERE canonical IS NOT NULL
  GROUP BY canonical HAVING count(*) > 1 LIMIT 1;
  IF duplicate_value IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot canonicalize client businesses: multiple rows represent mobile %', duplicate_value;
  END IF;
END
$$;

UPDATE "public"."users"
SET "mobile_number" = CASE
  WHEN raw ~ '^00923[0-9]{9}$' THEN '0' || substr(raw, 5)
  WHEN raw ~ '^923[0-9]{9}$' THEN '0' || substr(raw, 3)
  WHEN raw ~ '^3[0-9]{9}$' THEN '0' || raw
  WHEN raw ~ '^03[0-9]{9}$' THEN raw
  ELSE '03' || lpad(right(regexp_replace(raw, '[^0-9]', '', 'g'), 9), 9, '0')
END
FROM (SELECT "id", regexp_replace("mobile_number", '[[:space:]()+-]', '', 'g') AS raw FROM "public"."users") normalized
WHERE "users"."id" = normalized."id";

UPDATE "public"."client_businesses"
SET "mobile_number" = CASE
  WHEN raw ~ '^00923[0-9]{9}$' THEN '0' || substr(raw, 5)
  WHEN raw ~ '^923[0-9]{9}$' THEN '0' || substr(raw, 3)
  WHEN raw ~ '^3[0-9]{9}$' THEN '0' || raw
  WHEN raw ~ '^03[0-9]{9}$' THEN raw
  ELSE '03' || lpad(right(regexp_replace(raw, '[^0-9]', '', 'g'), 9), 9, '0')
END
FROM (SELECT "id", regexp_replace("mobile_number", '[[:space:]()+-]', '', 'g') AS raw FROM "public"."client_businesses") normalized
WHERE "client_businesses"."id" = normalized."id";

CREATE UNIQUE INDEX "client_businesses_mobile_number_key" ON "public"."client_businesses"("mobile_number");

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_mobile_number_local_check" CHECK ("mobile_number" ~ '^03[0-9]{9}$');
ALTER TABLE "public"."client_businesses"
  ADD CONSTRAINT "client_businesses_mobile_number_local_check" CHECK ("mobile_number" ~ '^03[0-9]{9}$');

ALTER TABLE "public"."orders"
  ADD COLUMN "fulfilment_method" "public"."fulfilment_method" NOT NULL DEFAULT 'delivery',
  ADD COLUMN "checkout_idempotency_key" TEXT,
  ADD COLUMN "pickup_location_snapshot" TEXT,
  ADD COLUMN "pickup_instructions_snapshot" TEXT;

CREATE UNIQUE INDEX "orders_checkout_idempotency_key_key" ON "public"."orders"("checkout_idempotency_key");

ALTER TABLE "public"."business_settings"
  ADD COLUMN "pickup_location" TEXT,
  ADD COLUMN "pickup_instructions" TEXT;

ALTER TABLE "public"."stock_movements"
  ADD COLUMN "previous_quantity_base" DECIMAL(18,3),
  ADD COLUMN "new_quantity_base" DECIMAL(18,3),
  DROP CONSTRAINT "stock_movements_quantity_positive_check",
  ADD CONSTRAINT "stock_movements_quantity_positive_check" CHECK (
    ("movement_type" = 'opening_balance'::"public"."stock_movement_type" AND "quantity_base" >= 0)
    OR ("movement_type" <> 'opening_balance'::"public"."stock_movement_type" AND "quantity_base" > 0)
  ),
  ADD CONSTRAINT "stock_movements_quantity_snapshot_check" CHECK (
    ("previous_quantity_base" IS NULL AND "new_quantity_base" IS NULL)
    OR ("previous_quantity_base" IS NOT NULL AND "new_quantity_base" IS NOT NULL
      AND "previous_quantity_base" >= 0 AND "new_quantity_base" >= 0)
  );

ALTER TABLE "public"."orders"
  ADD CONSTRAINT "orders_checkout_idempotency_key_nonblank_check" CHECK (
    "checkout_idempotency_key" IS NULL OR btrim("checkout_idempotency_key") <> ''
  ),
  ADD CONSTRAINT "orders_fulfilment_snapshot_check" CHECK (
    ("fulfilment_method" = 'delivery'::"public"."fulfilment_method"
      AND "pickup_location_snapshot" IS NULL AND "pickup_instructions_snapshot" IS NULL)
    OR
    ("fulfilment_method" = 'pickup'::"public"."fulfilment_method"
      AND "delivery_charge" = 0
      AND "pickup_location_snapshot" IS NOT NULL AND btrim("pickup_location_snapshot") <> ''
      AND "pickup_instructions_snapshot" IS NOT NULL AND btrim("pickup_instructions_snapshot") <> '')
  );

ALTER TABLE "public"."business_settings"
  ADD CONSTRAINT "business_settings_pickup_configuration_check" CHECK (
    ("pickup_location" IS NULL AND "pickup_instructions" IS NULL)
    OR ("pickup_location" IS NOT NULL AND btrim("pickup_location") <> ''
      AND "pickup_instructions" IS NOT NULL AND btrim("pickup_instructions") <> '')
  );

CREATE INDEX "products_opening_stock_status_idx" ON "public"."products"("opening_stock_status");
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";
CREATE INDEX "products_name_trgm_idx" ON "public"."products" USING GIN ("name" "extensions".gin_trgm_ops);
CREATE INDEX "products_shop_name_trgm_idx" ON "public"."products" USING GIN ("shop_name" "extensions".gin_trgm_ops);
CREATE INDEX "products_name_urdu_trgm_idx" ON "public"."products" USING GIN ("name_urdu" "extensions".gin_trgm_ops);
