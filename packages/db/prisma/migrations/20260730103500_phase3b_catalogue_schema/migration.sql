-- AlterTable
ALTER TABLE "product_packaging" ADD COLUMN "pack_quantity" INTEGER;

-- AlterTable
-- Clear existing mappings if any to allow NOT NULL additions safely
TRUNCATE TABLE "source_record_mappings" CASCADE;

ALTER TABLE "source_record_mappings" ADD COLUMN "source_system" TEXT NOT NULL;
ALTER TABLE "source_record_mappings" ADD COLUMN "source_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "source_record_mappings_source_system_source_key_key" ON "source_record_mappings"("source_system", "source_key");
