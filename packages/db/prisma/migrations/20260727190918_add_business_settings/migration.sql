-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL DEFAULT 'Raza Stationers',
    "contact_phone" TEXT NOT NULL DEFAULT '042-35678901',
    "require_approval" BOOLEAN NOT NULL DEFAULT true,
    "stock_alert" BOOLEAN NOT NULL DEFAULT true,
    "packing_view" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);
