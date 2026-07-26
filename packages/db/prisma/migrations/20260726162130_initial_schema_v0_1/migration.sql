-- Phase 5B custom SQL: one atomic initial migration.
BEGIN;

-- CreateSchema (Prisma-generated)
CREATE SCHEMA IF NOT EXISTS "public";

-- Phase 5B custom SQL: Supabase-compatible extension placement.
CREATE SCHEMA IF NOT EXISTS "extensions";
CREATE EXTENSION IF NOT EXISTS "btree_gist" WITH SCHEMA "extensions";
-- pg_catalog remains implicitly first for lookup while public stays the CREATE target.
SET LOCAL search_path = "public", "extensions";

-- Prisma-generated enum, table, index and foreign-key DDL follows.

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('owner', 'admin', 'packing', 'delivery', 'business_user');

-- CreateEnum
CREATE TYPE "staff_role" AS ENUM ('admin', 'packing', 'delivery');

-- CreateEnum
CREATE TYPE "business_type" AS ENUM ('stationery_shop', 'school', 'bookstore', 'office', 'distributor', 'other');

-- CreateEnum
CREATE TYPE "client_business_account_status" AS ENUM ('pending', 'active', 'suspended', 'blocked', 'archived');

-- CreateEnum
CREATE TYPE "credit_status" AS ENUM ('active', 'suspended', 'blocked');

-- CreateEnum
CREATE TYPE "business_user_role" AS ENUM ('owner', 'manager', 'purchase_officer', 'branch_employee');

-- CreateEnum
CREATE TYPE "product_purchase_type" AS ENUM ('individual', 'bulk', 'both', 'unconfirmed');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('pending_review', 'inactive', 'active', 'archived');

-- CreateEnum
CREATE TYPE "confirmation_status" AS ENUM ('unconfirmed', 'confirmed', 'rejected');

-- CreateEnum
CREATE TYPE "currency_code" AS ENUM ('PKR');

-- CreateEnum
CREATE TYPE "price_type" AS ENUM ('retail', 'wholesale');

-- CreateEnum
CREATE TYPE "discount_scope" AS ENUM ('account_wide', 'category', 'product');

-- CreateEnum
CREATE TYPE "approval_decision" AS ENUM ('approved', 'rejected', 'more_information_required');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending_review', 'pending_owner_approval', 'confirmed', 'change_requested', 'packed', 'out_for_delivery', 'failed_delivery', 'return_pending_inspection', 'delivered', 'cancelled', 'rejected');

-- CreateEnum
CREATE TYPE "change_request_type" AS ENUM ('edit', 'cancellation');

-- CreateEnum
CREATE TYPE "change_request_status" AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "cancellation_status" AS ENUM ('requested', 'approved', 'pending_stock_inspection', 'completed', 'rejected');

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('issued', 'partially_paid', 'paid', 'credited', 'voided');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('order', 'invoice', 'credit_note');

-- CreateEnum
CREATE TYPE "credit_note_status" AS ENUM ('pending_approval', 'approved', 'issued', 'voided');

-- CreateEnum
CREATE TYPE "credit_note_source_type" AS ENUM ('cancellation', 'return', 'manual_adjustment');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'cash_on_delivery');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'submitted', 'verified', 'rejected', 'voided');

-- CreateEnum
CREATE TYPE "credit_ledger_entry_type" AS ENUM ('overpayment_credit', 'refund_credit', 'manual_credit_adjustment', 'reversal_credit', 'credit_applied', 'credit_payout', 'manual_debit_adjustment', 'reversal_debit');

-- CreateEnum
CREATE TYPE "refund_method" AS ENUM ('cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'cash_on_delivery', 'client_credit');

-- CreateEnum
CREATE TYPE "refund_status" AS ENUM ('pending_approval', 'approved', 'processed', 'rejected', 'voided');

-- CreateEnum
CREATE TYPE "stock_bucket" AS ENUM ('sellable', 'unavailable', 'in_transit', 'damaged', 'external');

-- CreateEnum
CREATE TYPE "stock_movement_type" AS ENUM ('restock', 'packing', 'dispatch', 'delivery', 'return_receipt', 'inspection_release', 'damage_transfer', 'cancellation_reversal', 'adjustment');

-- CreateEnum
CREATE TYPE "stock_reservation_status" AS ENUM ('active', 'consumed', 'released');

-- CreateEnum
CREATE TYPE "inventory_condition" AS ENUM ('pending_inspection', 'sellable', 'damaged', 'quarantined');

-- CreateEnum
CREATE TYPE "return_status" AS ENUM ('requested', 'approved', 'awaiting_inspection', 'inspected', 'completed', 'rejected', 'voided');

-- CreateEnum
CREATE TYPE "delivery_status" AS ENUM ('pending', 'active', 'delivered', 'failed', 'returning', 'cancelled');

-- CreateEnum
CREATE TYPE "delivery_attempt_status" AS ENUM ('assigned', 'dispatched', 'delivered', 'failed', 'returning_to_warehouse', 'returned_to_warehouse', 'cancelled');

-- CreateEnum
CREATE TYPE "import_batch_status" AS ENUM ('uploaded', 'validating', 'preview_ready', 'approved', 'committing', 'committed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "import_validation_status" AS ENUM ('pending', 'valid', 'warning', 'invalid');

-- CreateEnum
CREATE TYPE "import_commit_status" AS ENUM ('pending', 'approved', 'imported', 'skipped', 'failed');

-- CreateEnum
CREATE TYPE "import_issue_severity" AS ENUM ('warning', 'error');

-- CreateEnum
CREATE TYPE "expense_category" AS ENUM ('restocking', 'salaries', 'rent', 'utilities', 'fuel', 'vehicle_maintenance', 'packaging', 'gateway_fees', 'returns_refunds', 'damaged_stock', 'taxes', 'other');

-- CreateEnum
CREATE TYPE "notification_subscription_scope" AS ENUM ('product', 'category');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('restock', 'order_status', 'payment_reminder', 'credit_status', 'account_status', 'announcement');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deactivated_at" TIMESTAMPTZ(3),
    "deactivated_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "staff_role" "staff_role" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_businesses" (
    "id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "business_type" "business_type" NOT NULL,
    "contact_person" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT,
    "ntn" TEXT,
    "cnic" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "account_status" "client_business_account_status" NOT NULL DEFAULT 'pending',
    "archived_at" TIMESTAMPTZ(3),
    "archived_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "client_businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_user_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "role" "business_user_role" NOT NULL,
    "linked_by_id" TEXT NOT NULL,
    "ended_by_id" TEXT,
    "linked_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(3),

    CONSTRAINT "business_user_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_business_approvals" (
    "id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "decision" "approval_decision" NOT NULL,
    "decided_by_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "decided_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_business_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_credit_accounts" (
    "id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "credit_limit" DECIMAL(14,2) NOT NULL,
    "credit_days" INTEGER NOT NULL DEFAULT 0,
    "status" "credit_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "client_credit_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_credit_limit_changes" (
    "id" TEXT NOT NULL,
    "client_credit_account_id" TEXT NOT NULL,
    "old_limit" DECIMAL(14,2) NOT NULL,
    "new_limit" DECIMAL(14,2) NOT NULL,
    "old_credit_days" INTEGER NOT NULL,
    "new_credit_days" INTEGER NOT NULL,
    "approved_by_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_credit_limit_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "archived_at" TIMESTAMPTZ(3),
    "archived_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku_number" BIGINT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_urdu" TEXT,
    "shop_name" TEXT,
    "category_id" TEXT NOT NULL,
    "description" TEXT,
    "purchase_type" "product_purchase_type" NOT NULL DEFAULT 'unconfirmed',
    "status" "product_status" NOT NULL DEFAULT 'pending_review',
    "unit_confirmation_status" "confirmation_status" NOT NULL DEFAULT 'unconfirmed',
    "allow_individual_sale" BOOLEAN NOT NULL DEFAULT false,
    "low_stock_threshold_base" DECIMAL(18,3),
    "review_reason" TEXT,
    "activated_at" TIMESTAMPTZ(3),
    "activated_by_id" TEXT,
    "archived_at" TIMESTAMPTZ(3),
    "archived_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_aliases" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalized_alias" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units_of_measure" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "allows_fractional" BOOLEAN NOT NULL DEFAULT false,
    "decimal_scale" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_packaging" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "unit_of_measure_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "conversion_to_base" DECIMAL(18,6) NOT NULL,
    "is_base" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_status" "confirmation_status" NOT NULL DEFAULT 'unconfirmed',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_packaging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "product_packaging_id" TEXT NOT NULL,
    "price_type" "price_type" NOT NULL,
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "amount" DECIMAL(14,2) NOT NULL,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "effective_to" TIMESTAMPTZ(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_specific_prices" (
    "id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "product_packaging_id" TEXT NOT NULL,
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "amount" DECIMAL(14,2) NOT NULL,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "effective_to" TIMESTAMPTZ(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_specific_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_rules" (
    "id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "scope" "discount_scope" NOT NULL,
    "category_id" TEXT,
    "product_id" TEXT,
    "discount_percent" DECIMAL(5,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discount_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_change_logs" (
    "id" TEXT NOT NULL,
    "discount_rule_id" TEXT NOT NULL,
    "old_percent" DECIMAL(5,2),
    "new_percent" DECIMAL(5,2),
    "changed_by_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_locations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMPTZ(3),
    "archived_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "stock_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_balances" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "stock_location_id" TEXT NOT NULL,
    "on_hand_quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "reserved_quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "unavailable_quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "in_transit_quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "damaged_quantity" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "stock_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "stock_location_id" TEXT NOT NULL,
    "quantity_base" DECIMAL(18,3) NOT NULL,
    "status" "stock_reservation_status" NOT NULL DEFAULT 'active',
    "created_by_id" TEXT NOT NULL,
    "consumed_by_id" TEXT,
    "released_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumed_at" TIMESTAMPTZ(3),
    "released_at" TIMESTAMPTZ(3),
    "release_reason" TEXT,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "stock_location_id" TEXT NOT NULL,
    "quantity_base" DECIMAL(18,3) NOT NULL,
    "from_bucket" "stock_bucket",
    "to_bucket" "stock_bucket",
    "movement_type" "stock_movement_type" NOT NULL,
    "stock_reservation_id" TEXT,
    "order_item_id" TEXT,
    "cancellation_id" TEXT,
    "return_item_id" TEXT,
    "delivery_attempt_id" TEXT,
    "reason" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "order_year" INTEGER NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "placed_by_user_id" TEXT NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'pending_review',
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "requested_payment_method" "payment_method",
    "recipient_name_snapshot" TEXT NOT NULL,
    "mobile_snapshot" TEXT NOT NULL,
    "address_snapshot" TEXT NOT NULL,
    "city_snapshot" TEXT NOT NULL,
    "delivery_notes_snapshot" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "discount_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "delivery_charge" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_packaging_id" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "base_quantity" DECIMAL(18,3) NOT NULL,
    "sku_snapshot" TEXT NOT NULL,
    "product_name_snapshot" TEXT NOT NULL,
    "packaging_label_snapshot" TEXT NOT NULL,
    "unit_code_snapshot" TEXT NOT NULL,
    "conversion_to_base_snapshot" DECIMAL(18,6) NOT NULL,
    "base_price_type_snapshot" "price_type" NOT NULL,
    "base_price_amount_snapshot" DECIMAL(14,2) NOT NULL,
    "discount_scope_snapshot" "discount_scope",
    "discount_percent_snapshot" DECIMAL(5,2),
    "discount_amount_snapshot" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "unit_price_snapshot" DECIMAL(14,2) NOT NULL,
    "subtotal_snapshot" DECIMAL(14,2) NOT NULL,
    "tax_treatment_snapshot" TEXT NOT NULL DEFAULT 'none',
    "tax_rate_snapshot" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount_snapshot" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "line_total_snapshot" DECIMAL(14,2) NOT NULL,
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "from_status" "order_status",
    "to_status" "order_status" NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_change_requests" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "request_type" "change_request_type" NOT NULL,
    "status" "change_request_status" NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "proposed_changes" JSONB,
    "requested_by_id" TEXT NOT NULL,
    "reviewed_by_id" TEXT,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(3),

    CONSTRAINT "order_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellations" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "cancellation_status" NOT NULL DEFAULT 'requested',
    "reason" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "stock_confirmed_by_id" TEXT,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(3),
    "stock_confirmed_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_credit_approvals" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "client_credit_account_id" TEXT NOT NULL,
    "credit_limit_snapshot" DECIMAL(14,2) NOT NULL,
    "exposure_snapshot" DECIMAL(14,2) NOT NULL,
    "order_total_snapshot" DECIMAL(14,2) NOT NULL,
    "decision" "approval_decision" NOT NULL,
    "decided_by_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "decided_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_credit_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sequences" (
    "document_type" "document_type" NOT NULL,
    "year" INTEGER NOT NULL,
    "next_value" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("document_type","year")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_year" INTEGER NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'issued',
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "discount_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "delivery_charge" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "issued_by_id" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "cancellation_id" TEXT,
    "return_id" TEXT,
    "source_type" "credit_note_source_type" NOT NULL,
    "credit_note_number" TEXT NOT NULL,
    "document_year" INTEGER NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "status" "credit_note_status" NOT NULL DEFAULT 'pending_approval',
    "reason" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "issued_by_id" TEXT,
    "approved_at" TIMESTAMPTZ(3),
    "issued_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "method" "payment_method" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "external_reference" TEXT,
    "receipt_reference" TEXT,
    "submitted_by_id" TEXT,
    "verified_by_id" TEXT,
    "rejection_reason" TEXT,
    "submitted_at" TIMESTAMPTZ(3),
    "verified_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "allocated_by_id" TEXT NOT NULL,
    "reversed_by_id" TEXT,
    "reversal_reason" TEXT,
    "allocated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversed_at" TIMESTAMPTZ(3),

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_ledger_entries" (
    "id" TEXT NOT NULL,
    "client_credit_account_id" TEXT NOT NULL,
    "entry_type" "credit_ledger_entry_type" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "invoice_id" TEXT,
    "payment_id" TEXT,
    "refund_id" TEXT,
    "credit_note_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "client_business_id" TEXT NOT NULL,
    "return_id" TEXT,
    "credit_note_id" TEXT,
    "original_payment_id" TEXT,
    "method" "refund_method" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "status" "refund_status" NOT NULL DEFAULT 'pending_approval',
    "reason" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "processed_by_id" TEXT,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(3),
    "processed_at" TIMESTAMPTZ(3),

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "status" "return_status" NOT NULL DEFAULT 'requested',
    "reason" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "inspected_by_id" TEXT,
    "completed_by_id" TEXT,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(3),
    "inspected_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_items" (
    "id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "base_quantity" DECIMAL(18,3) NOT NULL,
    "condition" "inventory_condition" NOT NULL DEFAULT 'pending_inspection',
    "destination" "stock_bucket" NOT NULL DEFAULT 'unavailable',
    "inspected_by_id" TEXT,
    "inspected_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "charge" DECIMAL(14,2),
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "requires_manual_confirmation" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "delivery_zone_id" TEXT,
    "status" "delivery_status" NOT NULL DEFAULT 'pending',
    "recipient_name_snapshot" TEXT NOT NULL,
    "mobile_snapshot" TEXT NOT NULL,
    "address_snapshot" TEXT NOT NULL,
    "recipient_confirmation" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_attempts" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "status" "delivery_attempt_status" NOT NULL DEFAULT 'assigned',
    "failure_reason" TEXT,
    "dispatch_at" TIMESTAMPTZ(3),
    "return_warehouse_at" TIMESTAMPTZ(3),
    "inspection_outcome" "inventory_condition",
    "inspected_by_id" TEXT,
    "inspected_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_assignments" (
    "id" TEXT NOT NULL,
    "delivery_attempt_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "reason" TEXT,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(3),

    CONSTRAINT "delivery_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_attempt_status_history" (
    "id" TEXT NOT NULL,
    "delivery_attempt_id" TEXT NOT NULL,
    "from_status" "delivery_attempt_status",
    "to_status" "delivery_attempt_status" NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "is_override" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_attempt_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "status" "import_batch_status" NOT NULL DEFAULT 'uploaded',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "warning_rows" INTEGER NOT NULL DEFAULT 0,
    "invalid_rows" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "committed_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(3),
    "committed_at" TIMESTAMPTZ(3),
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_rows" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_sheet" TEXT NOT NULL,
    "source_row_number" INTEGER NOT NULL,
    "raw_data" JSONB NOT NULL,
    "normalized_data" JSONB,
    "validation_status" "import_validation_status" NOT NULL DEFAULT 'pending',
    "commit_status" "import_commit_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_issues" (
    "id" TEXT NOT NULL,
    "import_row_id" TEXT NOT NULL,
    "severity" "import_issue_severity" NOT NULL,
    "code" TEXT NOT NULL,
    "field_name" TEXT,
    "message" TEXT NOT NULL,
    "resolved_by_id" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(3),

    CONSTRAINT "import_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_record_mappings" (
    "id" TEXT NOT NULL,
    "import_row_id" TEXT NOT NULL,
    "category_id" TEXT,
    "product_id" TEXT,
    "product_packaging_id" TEXT,
    "product_price_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_record_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_entries" (
    "id" TEXT NOT NULL,
    "category" "expense_category" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "currency_code" NOT NULL DEFAULT 'PKR',
    "description" TEXT NOT NULL,
    "expense_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "voided_by_id" TEXT,
    "void_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voided_at" TIMESTAMPTZ(3),

    CONSTRAINT "expense_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scope" "notification_subscription_scope" NOT NULL,
    "product_id" TEXT,
    "category_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "reason" TEXT,
    "correlation_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_number_key" ON "users"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_user_id_key" ON "staff_profiles"("user_id");

-- CreateIndex
CREATE INDEX "client_businesses_account_status_idx" ON "client_businesses"("account_status");

-- CreateIndex
CREATE INDEX "client_businesses_business_name_idx" ON "client_businesses"("business_name");

-- CreateIndex
CREATE INDEX "client_businesses_mobile_number_idx" ON "client_businesses"("mobile_number");

-- CreateIndex
CREATE INDEX "business_user_links_user_id_ended_at_idx" ON "business_user_links"("user_id", "ended_at");

-- CreateIndex
CREATE INDEX "business_user_links_client_business_id_ended_at_idx" ON "business_user_links"("client_business_id", "ended_at");

-- CreateIndex
CREATE INDEX "client_business_approvals_client_business_id_decided_at_idx" ON "client_business_approvals"("client_business_id", "decided_at");

-- CreateIndex
CREATE UNIQUE INDEX "client_credit_accounts_client_business_id_key" ON "client_credit_accounts"("client_business_id");

-- CreateIndex
CREATE INDEX "client_credit_limit_changes_client_credit_account_id_create_idx" ON "client_credit_limit_changes"("client_credit_account_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_name_idx" ON "categories"("is_active", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_number_key" ON "products"("sku_number");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_status_category_id_idx" ON "products"("status", "category_id");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_shop_name_idx" ON "products"("shop_name");

-- CreateIndex
CREATE INDEX "product_aliases_normalized_alias_idx" ON "product_aliases"("normalized_alias");

-- CreateIndex
CREATE UNIQUE INDEX "product_aliases_product_id_normalized_alias_key" ON "product_aliases"("product_id", "normalized_alias");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_code_key" ON "units_of_measure"("code");

-- CreateIndex
CREATE INDEX "product_packaging_product_id_is_base_idx" ON "product_packaging"("product_id", "is_base");

-- CreateIndex
CREATE INDEX "product_packaging_unit_of_measure_id_idx" ON "product_packaging"("unit_of_measure_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_packaging_product_id_code_key" ON "product_packaging"("product_id", "code");

-- CreateIndex
CREATE INDEX "product_prices_product_packaging_id_price_type_currency_eff_idx" ON "product_prices"("product_packaging_id", "price_type", "currency", "effective_from");

-- CreateIndex
CREATE INDEX "client_specific_prices_client_business_id_product_packaging_idx" ON "client_specific_prices"("client_business_id", "product_packaging_id", "currency", "effective_from");

-- CreateIndex
CREATE INDEX "discount_rules_client_business_id_scope_is_active_idx" ON "discount_rules"("client_business_id", "scope", "is_active");

-- CreateIndex
CREATE INDEX "discount_rules_category_id_idx" ON "discount_rules"("category_id");

-- CreateIndex
CREATE INDEX "discount_rules_product_id_idx" ON "discount_rules"("product_id");

-- CreateIndex
CREATE INDEX "discount_change_logs_discount_rule_id_created_at_idx" ON "discount_change_logs"("discount_rule_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "stock_locations_code_key" ON "stock_locations"("code");

-- CreateIndex
CREATE INDEX "stock_locations_is_active_idx" ON "stock_locations"("is_active");

-- CreateIndex
CREATE INDEX "stock_balances_stock_location_id_idx" ON "stock_balances"("stock_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_balances_product_id_stock_location_id_key" ON "stock_balances"("product_id", "stock_location_id");

-- CreateIndex
CREATE INDEX "stock_reservations_order_item_id_status_idx" ON "stock_reservations"("order_item_id", "status");

-- CreateIndex
CREATE INDEX "stock_reservations_product_id_stock_location_id_status_idx" ON "stock_reservations"("product_id", "stock_location_id", "status");

-- CreateIndex
CREATE INDEX "stock_movements_product_id_stock_location_id_occurred_at_idx" ON "stock_movements"("product_id", "stock_location_id", "occurred_at");

-- CreateIndex
CREATE INDEX "stock_movements_order_item_id_idx" ON "stock_movements"("order_item_id");

-- CreateIndex
CREATE INDEX "stock_movements_cancellation_id_idx" ON "stock_movements"("cancellation_id");

-- CreateIndex
CREATE INDEX "stock_movements_return_item_id_idx" ON "stock_movements"("return_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_client_business_id_created_at_idx" ON "orders"("client_business_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_year_sequence_number_key" ON "orders"("order_year", "sequence_number");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_product_packaging_id_idx" ON "order_items"("product_packaging_id");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_created_at_idx" ON "order_status_history"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "order_change_requests_order_id_status_idx" ON "order_change_requests"("order_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cancellations_order_id_key" ON "cancellations"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_credit_approvals_order_id_key" ON "order_credit_approvals"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_order_id_key" ON "invoices"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_client_business_id_due_at_idx" ON "invoices"("client_business_id", "due_at");

-- CreateIndex
CREATE INDEX "invoices_status_due_at_idx" ON "invoices"("status", "due_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_year_sequence_number_key" ON "invoices"("invoice_year", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_credit_note_number_key" ON "credit_notes"("credit_note_number");

-- CreateIndex
CREATE INDEX "credit_notes_invoice_id_status_idx" ON "credit_notes"("invoice_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_document_year_sequence_number_key" ON "credit_notes"("document_year", "sequence_number");

-- CreateIndex
CREATE INDEX "payments_client_business_id_created_at_idx" ON "payments"("client_business_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

-- CreateIndex
CREATE INDEX "payment_allocations_payment_id_reversed_at_idx" ON "payment_allocations"("payment_id", "reversed_at");

-- CreateIndex
CREATE INDEX "payment_allocations_invoice_id_reversed_at_idx" ON "payment_allocations"("invoice_id", "reversed_at");

-- CreateIndex
CREATE INDEX "credit_ledger_entries_client_credit_account_id_created_at_idx" ON "credit_ledger_entries"("client_credit_account_id", "created_at");

-- CreateIndex
CREATE INDEX "refunds_client_business_id_status_idx" ON "refunds"("client_business_id", "status");

-- CreateIndex
CREATE INDEX "returns_order_id_requested_at_idx" ON "returns"("order_id", "requested_at");

-- CreateIndex
CREATE INDEX "returns_invoice_id_idx" ON "returns"("invoice_id");

-- CreateIndex
CREATE INDEX "return_items_return_id_idx" ON "return_items"("return_id");

-- CreateIndex
CREATE INDEX "return_items_order_item_id_idx" ON "return_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_zones_name_key" ON "delivery_zones"("name");

-- CreateIndex
CREATE INDEX "delivery_zones_city_is_active_idx" ON "delivery_zones"("city", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_order_id_key" ON "deliveries"("order_id");

-- CreateIndex
CREATE INDEX "deliveries_status_created_at_idx" ON "deliveries"("status", "created_at");

-- CreateIndex
CREATE INDEX "delivery_attempts_status_created_at_idx" ON "delivery_attempts"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_attempts_delivery_id_attempt_number_key" ON "delivery_attempts"("delivery_id", "attempt_number");

-- CreateIndex
CREATE INDEX "delivery_assignments_delivery_attempt_id_ended_at_idx" ON "delivery_assignments"("delivery_attempt_id", "ended_at");

-- CreateIndex
CREATE INDEX "delivery_assignments_worker_id_ended_at_idx" ON "delivery_assignments"("worker_id", "ended_at");

-- CreateIndex
CREATE INDEX "delivery_attempt_status_history_delivery_attempt_id_created_idx" ON "delivery_attempt_status_history"("delivery_attempt_id", "created_at");

-- CreateIndex
CREATE INDEX "import_batches_sha256_status_idx" ON "import_batches"("sha256", "status");

-- CreateIndex
CREATE INDEX "import_batches_status_created_at_idx" ON "import_batches"("status", "created_at");

-- CreateIndex
CREATE INDEX "import_rows_import_batch_id_validation_status_commit_status_idx" ON "import_rows"("import_batch_id", "validation_status", "commit_status");

-- CreateIndex
CREATE UNIQUE INDEX "import_rows_import_batch_id_source_sheet_source_row_number_key" ON "import_rows"("import_batch_id", "source_sheet", "source_row_number");

-- CreateIndex
CREATE INDEX "import_issues_import_row_id_severity_idx" ON "import_issues"("import_row_id", "severity");

-- CreateIndex
CREATE INDEX "source_record_mappings_import_row_id_idx" ON "source_record_mappings"("import_row_id");

-- CreateIndex
CREATE INDEX "source_record_mappings_category_id_idx" ON "source_record_mappings"("category_id");

-- CreateIndex
CREATE INDEX "source_record_mappings_product_id_idx" ON "source_record_mappings"("product_id");

-- CreateIndex
CREATE INDEX "source_record_mappings_product_packaging_id_idx" ON "source_record_mappings"("product_packaging_id");

-- CreateIndex
CREATE INDEX "source_record_mappings_product_price_id_idx" ON "source_record_mappings"("product_price_id");

-- CreateIndex
CREATE INDEX "expense_entries_expense_at_idx" ON "expense_entries"("expense_at");

-- CreateIndex
CREATE INDEX "notification_subscriptions_user_id_scope_is_active_idx" ON "notification_subscriptions"("user_id", "scope", "is_active");

-- CreateIndex
CREATE INDEX "notification_subscriptions_product_id_idx" ON "notification_subscriptions"("product_id");

-- CreateIndex
CREATE INDEX "notification_subscriptions_category_id_idx" ON "notification_subscriptions"("category_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_deactivated_by_id_fkey" FOREIGN KEY ("deactivated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_businesses" ADD CONSTRAINT "client_businesses_archived_by_id_fkey" FOREIGN KEY ("archived_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_user_links" ADD CONSTRAINT "business_user_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_user_links" ADD CONSTRAINT "business_user_links_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_user_links" ADD CONSTRAINT "business_user_links_linked_by_id_fkey" FOREIGN KEY ("linked_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_user_links" ADD CONSTRAINT "business_user_links_ended_by_id_fkey" FOREIGN KEY ("ended_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_business_approvals" ADD CONSTRAINT "client_business_approvals_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_business_approvals" ADD CONSTRAINT "client_business_approvals_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_credit_accounts" ADD CONSTRAINT "client_credit_accounts_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_credit_limit_changes" ADD CONSTRAINT "client_credit_limit_changes_client_credit_account_id_fkey" FOREIGN KEY ("client_credit_account_id") REFERENCES "client_credit_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_credit_limit_changes" ADD CONSTRAINT "client_credit_limit_changes_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_archived_by_id_fkey" FOREIGN KEY ("archived_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_activated_by_id_fkey" FOREIGN KEY ("activated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_archived_by_id_fkey" FOREIGN KEY ("archived_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_aliases" ADD CONSTRAINT "product_aliases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packaging" ADD CONSTRAINT "product_packaging_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packaging" ADD CONSTRAINT "product_packaging_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_packaging_id_fkey" FOREIGN KEY ("product_packaging_id") REFERENCES "product_packaging"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_specific_prices" ADD CONSTRAINT "client_specific_prices_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_specific_prices" ADD CONSTRAINT "client_specific_prices_product_packaging_id_fkey" FOREIGN KEY ("product_packaging_id") REFERENCES "product_packaging"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_specific_prices" ADD CONSTRAINT "client_specific_prices_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_change_logs" ADD CONSTRAINT "discount_change_logs_discount_rule_id_fkey" FOREIGN KEY ("discount_rule_id") REFERENCES "discount_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_change_logs" ADD CONSTRAINT "discount_change_logs_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_locations" ADD CONSTRAINT "stock_locations_archived_by_id_fkey" FOREIGN KEY ("archived_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_stock_location_id_fkey" FOREIGN KEY ("stock_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_stock_location_id_fkey" FOREIGN KEY ("stock_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_consumed_by_id_fkey" FOREIGN KEY ("consumed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_released_by_id_fkey" FOREIGN KEY ("released_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_location_id_fkey" FOREIGN KEY ("stock_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_reservation_id_fkey" FOREIGN KEY ("stock_reservation_id") REFERENCES "stock_reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_cancellation_id_fkey" FOREIGN KEY ("cancellation_id") REFERENCES "cancellations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_return_item_id_fkey" FOREIGN KEY ("return_item_id") REFERENCES "return_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_delivery_attempt_id_fkey" FOREIGN KEY ("delivery_attempt_id") REFERENCES "delivery_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_placed_by_user_id_fkey" FOREIGN KEY ("placed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_packaging_id_fkey" FOREIGN KEY ("product_packaging_id") REFERENCES "product_packaging"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_change_requests" ADD CONSTRAINT "order_change_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_change_requests" ADD CONSTRAINT "order_change_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_change_requests" ADD CONSTRAINT "order_change_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_stock_confirmed_by_id_fkey" FOREIGN KEY ("stock_confirmed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_credit_approvals" ADD CONSTRAINT "order_credit_approvals_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_credit_approvals" ADD CONSTRAINT "order_credit_approvals_client_credit_account_id_fkey" FOREIGN KEY ("client_credit_account_id") REFERENCES "client_credit_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_credit_approvals" ADD CONSTRAINT "order_credit_approvals_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_cancellation_id_fkey" FOREIGN KEY ("cancellation_id") REFERENCES "cancellations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_allocated_by_id_fkey" FOREIGN KEY ("allocated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_reversed_by_id_fkey" FOREIGN KEY ("reversed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_client_credit_account_id_fkey" FOREIGN KEY ("client_credit_account_id") REFERENCES "client_credit_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_client_business_id_fkey" FOREIGN KEY ("client_business_id") REFERENCES "client_businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_original_payment_id_fkey" FOREIGN KEY ("original_payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_inspected_by_id_fkey" FOREIGN KEY ("inspected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_inspected_by_id_fkey" FOREIGN KEY ("inspected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_delivery_zone_id_fkey" FOREIGN KEY ("delivery_zone_id") REFERENCES "delivery_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_inspected_by_id_fkey" FOREIGN KEY ("inspected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_delivery_attempt_id_fkey" FOREIGN KEY ("delivery_attempt_id") REFERENCES "delivery_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_attempt_status_history" ADD CONSTRAINT "delivery_attempt_status_history_delivery_attempt_id_fkey" FOREIGN KEY ("delivery_attempt_id") REFERENCES "delivery_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_attempt_status_history" ADD CONSTRAINT "delivery_attempt_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_committed_by_id_fkey" FOREIGN KEY ("committed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_import_row_id_fkey" FOREIGN KEY ("import_row_id") REFERENCES "import_rows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_record_mappings" ADD CONSTRAINT "source_record_mappings_import_row_id_fkey" FOREIGN KEY ("import_row_id") REFERENCES "import_rows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_record_mappings" ADD CONSTRAINT "source_record_mappings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_record_mappings" ADD CONSTRAINT "source_record_mappings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_record_mappings" ADD CONSTRAINT "source_record_mappings_product_packaging_id_fkey" FOREIGN KEY ("product_packaging_id") REFERENCES "product_packaging"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_record_mappings" ADD CONSTRAINT "source_record_mappings_product_price_id_fkey" FOREIGN KEY ("product_price_id") REFERENCES "product_prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_voided_by_id_fkey" FOREIGN KEY ("voided_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Phase 5B custom SQL: row-local CHECK constraints.
-- Cross-row totals, role authorization, state machines and fractional-UOM rules remain NestJS responsibilities.
ALTER TABLE "users"
    ADD CONSTRAINT "users_deactivation_metadata_check" CHECK (
        ("deactivated_at" IS NULL AND "deactivated_by_id" IS NULL)
        OR ("deactivated_at" IS NOT NULL AND "deactivated_by_id" IS NOT NULL)
    );

ALTER TABLE "client_businesses"
    ADD CONSTRAINT "client_businesses_archive_metadata_check" CHECK (
        ("archived_at" IS NULL AND "archived_by_id" IS NULL)
        OR ("archived_at" IS NOT NULL AND "archived_by_id" IS NOT NULL)
    );

ALTER TABLE "business_user_links"
    ADD CONSTRAINT "business_user_links_end_metadata_check" CHECK (
        ("ended_at" IS NULL AND "ended_by_id" IS NULL)
        OR ("ended_at" IS NOT NULL AND "ended_by_id" IS NOT NULL AND "ended_at" >= "linked_at")
    );

ALTER TABLE "client_credit_accounts"
    ADD CONSTRAINT "client_credit_accounts_nonnegative_check" CHECK (
        "credit_limit" >= 0 AND "credit_days" >= 0
    );

ALTER TABLE "client_credit_limit_changes"
    ADD CONSTRAINT "client_credit_limit_changes_nonnegative_check" CHECK (
        "old_limit" >= 0 AND "new_limit" >= 0
        AND "old_credit_days" >= 0 AND "new_credit_days" >= 0
    );

ALTER TABLE "categories"
    ADD CONSTRAINT "categories_archive_metadata_check" CHECK (
        ("archived_at" IS NULL AND "archived_by_id" IS NULL)
        OR ("archived_at" IS NOT NULL AND "archived_by_id" IS NOT NULL)
    );

ALTER TABLE "products"
    ADD CONSTRAINT "products_sku_number_range_check" CHECK ("sku_number" BETWEEN 1 AND 999999),
    ADD CONSTRAINT "products_sku_nonblank_check" CHECK (btrim("sku") <> ''),
    ADD CONSTRAINT "products_sku_format_check" CHECK ("sku" ~ '^RS-[0-9]{6}$'),
    ADD CONSTRAINT "products_sku_consistency_check" CHECK (
        "sku" = 'RS-' || lpad("sku_number"::text, 6, '0')
    ),
    ADD CONSTRAINT "products_low_stock_threshold_check" CHECK (
        "low_stock_threshold_base" IS NULL OR "low_stock_threshold_base" >= 0
    ),
    ADD CONSTRAINT "products_activation_metadata_check" CHECK (
        ("activated_at" IS NULL AND "activated_by_id" IS NULL)
        OR ("activated_at" IS NOT NULL AND "activated_by_id" IS NOT NULL)
    ),
    ADD CONSTRAINT "products_archive_metadata_check" CHECK (
        ("archived_at" IS NULL AND "archived_by_id" IS NULL)
        OR ("archived_at" IS NOT NULL AND "archived_by_id" IS NOT NULL)
    );

ALTER TABLE "units_of_measure"
    ADD CONSTRAINT "units_of_measure_decimal_scale_check" CHECK ("decimal_scale" BETWEEN 0 AND 3),
    ADD CONSTRAINT "units_of_measure_fractional_scale_check" CHECK (
        "allows_fractional" OR "decimal_scale" = 0
    );

ALTER TABLE "product_packaging"
    ADD CONSTRAINT "product_packaging_conversion_positive_check" CHECK ("conversion_to_base" > 0),
    ADD CONSTRAINT "product_packaging_base_conversion_check" CHECK (
        NOT "is_base" OR "conversion_to_base" = 1
    );

ALTER TABLE "product_prices"
    ADD CONSTRAINT "product_prices_amount_positive_check" CHECK ("amount" > 0),
    ADD CONSTRAINT "product_prices_effective_range_check" CHECK (
        "effective_to" IS NULL OR "effective_to" > "effective_from"
    );

ALTER TABLE "client_specific_prices"
    ADD CONSTRAINT "client_specific_prices_amount_positive_check" CHECK ("amount" > 0),
    ADD CONSTRAINT "client_specific_prices_effective_range_check" CHECK (
        "effective_to" IS NULL OR "effective_to" > "effective_from"
    );

ALTER TABLE "discount_rules"
    ADD CONSTRAINT "discount_rules_percent_check" CHECK (
        "discount_percent" > 0 AND "discount_percent" <= 100
    ),
    ADD CONSTRAINT "discount_rules_target_check" CHECK (
        ("scope" = 'account_wide'::"discount_scope" AND "category_id" IS NULL AND "product_id" IS NULL)
        OR ("scope" = 'category'::"discount_scope" AND "category_id" IS NOT NULL AND "product_id" IS NULL)
        OR ("scope" = 'product'::"discount_scope" AND "category_id" IS NULL AND "product_id" IS NOT NULL)
    );

ALTER TABLE "discount_change_logs"
    ADD CONSTRAINT "discount_change_logs_percent_check" CHECK (
        ("old_percent" IS NULL OR ("old_percent" > 0 AND "old_percent" <= 100))
        AND ("new_percent" IS NULL OR ("new_percent" > 0 AND "new_percent" <= 100))
    );

ALTER TABLE "stock_locations"
    ADD CONSTRAINT "stock_locations_archive_metadata_check" CHECK (
        ("archived_at" IS NULL AND "archived_by_id" IS NULL)
        OR ("archived_at" IS NOT NULL AND "archived_by_id" IS NOT NULL)
    );

ALTER TABLE "stock_balances"
    ADD CONSTRAINT "stock_balances_nonnegative_check" CHECK (
        "on_hand_quantity" >= 0
        AND "reserved_quantity" >= 0
        AND "unavailable_quantity" >= 0
        AND "in_transit_quantity" >= 0
        AND "damaged_quantity" >= 0
    ),
    ADD CONSTRAINT "stock_balances_reserved_within_on_hand_check" CHECK (
        "reserved_quantity" <= "on_hand_quantity"
    );

ALTER TABLE "stock_reservations"
    ADD CONSTRAINT "stock_reservations_quantity_positive_check" CHECK ("quantity_base" > 0),
    ADD CONSTRAINT "stock_reservations_terminal_metadata_check" CHECK (
        ("status" = 'active'::"stock_reservation_status"
            AND "consumed_by_id" IS NULL AND "consumed_at" IS NULL
            AND "released_by_id" IS NULL AND "released_at" IS NULL AND "release_reason" IS NULL)
        OR ("status" = 'consumed'::"stock_reservation_status"
            AND "consumed_by_id" IS NOT NULL AND "consumed_at" IS NOT NULL AND "consumed_at" >= "created_at"
            AND "released_by_id" IS NULL AND "released_at" IS NULL AND "release_reason" IS NULL)
        OR ("status" = 'released'::"stock_reservation_status"
            AND "consumed_by_id" IS NULL AND "consumed_at" IS NULL
            AND "released_by_id" IS NOT NULL AND "released_at" IS NOT NULL AND "released_at" >= "created_at"
            AND "release_reason" IS NOT NULL AND btrim("release_reason") <> '')
    );

ALTER TABLE "stock_movements"
    ADD CONSTRAINT "stock_movements_quantity_positive_check" CHECK ("quantity_base" > 0),
    ADD CONSTRAINT "stock_movements_bucket_endpoints_check" CHECK (
        ("from_bucket" IS NOT NULL OR "to_bucket" IS NOT NULL)
        AND ("from_bucket" IS NULL OR "to_bucket" IS NULL OR "from_bucket" <> "to_bucket")
    ),
    ADD CONSTRAINT "stock_movements_reason_nonblank_check" CHECK (btrim("reason") <> '');

ALTER TABLE "orders"
    ADD CONSTRAINT "orders_year_check" CHECK ("order_year" BETWEEN 2000 AND 9999),
    ADD CONSTRAINT "orders_sequence_number_check" CHECK ("sequence_number" BETWEEN 1 AND 999999),
    ADD CONSTRAINT "orders_number_format_check" CHECK ("order_number" ~ '^RS-ORD-[0-9]{4}-[0-9]{6}$'),
    ADD CONSTRAINT "orders_number_consistency_check" CHECK (
        "order_number" = 'RS-ORD-' || lpad("order_year"::text, 4, '0') || '-' || lpad("sequence_number"::text, 6, '0')
    ),
    ADD CONSTRAINT "orders_totals_nonnegative_check" CHECK (
        "subtotal" >= 0 AND "discount_total" >= 0 AND "tax_total" >= 0
        AND "delivery_charge" >= 0 AND "grand_total" >= 0
    ),
    ADD CONSTRAINT "orders_discount_within_subtotal_check" CHECK ("discount_total" <= "subtotal"),
    ADD CONSTRAINT "orders_total_consistency_check" CHECK (
        "grand_total" = "subtotal" - "discount_total" + "tax_total" + "delivery_charge"
    );

ALTER TABLE "order_items"
    ADD CONSTRAINT "order_items_quantity_positive_check" CHECK (
        "quantity" > 0 AND "base_quantity" > 0 AND "conversion_to_base_snapshot" > 0
    ),
    ADD CONSTRAINT "order_items_price_positive_check" CHECK (
        "base_price_amount_snapshot" > 0 AND "unit_price_snapshot" > 0
    ),
    ADD CONSTRAINT "order_items_amounts_nonnegative_check" CHECK (
        "discount_amount_snapshot" >= 0 AND "subtotal_snapshot" >= 0
        AND "tax_amount_snapshot" >= 0 AND "line_total_snapshot" >= 0
    ),
    ADD CONSTRAINT "order_items_discount_percent_check" CHECK (
        "discount_percent_snapshot" IS NULL
        OR ("discount_percent_snapshot" > 0 AND "discount_percent_snapshot" <= 100)
    ),
    ADD CONSTRAINT "order_items_tax_rate_check" CHECK (
        "tax_rate_snapshot" >= 0 AND "tax_rate_snapshot" <= 100
    ),
    ADD CONSTRAINT "order_items_discount_within_subtotal_check" CHECK (
        "discount_amount_snapshot" <= "subtotal_snapshot"
    );

ALTER TABLE "order_change_requests"
    ADD CONSTRAINT "order_change_requests_review_metadata_check" CHECK (
        ("reviewed_at" IS NULL AND "reviewed_by_id" IS NULL)
        OR ("reviewed_at" IS NOT NULL AND "reviewed_by_id" IS NOT NULL AND "reviewed_at" >= "requested_at")
    );

ALTER TABLE "order_credit_approvals"
    ADD CONSTRAINT "order_credit_approvals_amounts_nonnegative_check" CHECK (
        "credit_limit_snapshot" >= 0 AND "exposure_snapshot" >= 0 AND "order_total_snapshot" >= 0
    );

ALTER TABLE "document_sequences"
    ADD CONSTRAINT "document_sequences_year_check" CHECK ("year" BETWEEN 2000 AND 9999),
    ADD CONSTRAINT "document_sequences_next_value_check" CHECK ("next_value" BETWEEN 1 AND 1000000);

ALTER TABLE "invoices"
    ADD CONSTRAINT "invoices_year_check" CHECK ("invoice_year" BETWEEN 2000 AND 9999),
    ADD CONSTRAINT "invoices_sequence_number_check" CHECK ("sequence_number" BETWEEN 1 AND 999999),
    ADD CONSTRAINT "invoices_number_format_check" CHECK ("invoice_number" ~ '^RS-INV-[0-9]{4}-[0-9]{6}$'),
    ADD CONSTRAINT "invoices_number_consistency_check" CHECK (
        "invoice_number" = 'RS-INV-' || lpad("invoice_year"::text, 4, '0') || '-' || lpad("sequence_number"::text, 6, '0')
    ),
    ADD CONSTRAINT "invoices_totals_nonnegative_check" CHECK (
        "subtotal" >= 0 AND "discount_total" >= 0 AND "tax_total" >= 0
        AND "delivery_charge" >= 0 AND "total_amount" >= 0
    ),
    ADD CONSTRAINT "invoices_discount_within_subtotal_check" CHECK ("discount_total" <= "subtotal"),
    ADD CONSTRAINT "invoices_total_consistency_check" CHECK (
        "total_amount" = "subtotal" - "discount_total" + "tax_total" + "delivery_charge"
    ),
    ADD CONSTRAINT "invoices_due_date_check" CHECK ("due_at" >= "issued_at");

ALTER TABLE "credit_notes"
    ADD CONSTRAINT "credit_notes_amount_positive_check" CHECK ("amount" > 0),
    ADD CONSTRAINT "credit_notes_year_check" CHECK ("document_year" BETWEEN 2000 AND 9999),
    ADD CONSTRAINT "credit_notes_sequence_number_check" CHECK ("sequence_number" BETWEEN 1 AND 999999),
    ADD CONSTRAINT "credit_notes_number_format_check" CHECK ("credit_note_number" ~ '^RS-CN-[0-9]{4}-[0-9]{6}$'),
    ADD CONSTRAINT "credit_notes_number_consistency_check" CHECK (
        "credit_note_number" = 'RS-CN-' || lpad("document_year"::text, 4, '0') || '-' || lpad("sequence_number"::text, 6, '0')
    ),
    ADD CONSTRAINT "credit_notes_source_cardinality_check" CHECK (
        ("source_type" = 'cancellation'::"credit_note_source_type" AND "cancellation_id" IS NOT NULL AND "return_id" IS NULL)
        OR ("source_type" = 'return'::"credit_note_source_type" AND "cancellation_id" IS NULL AND "return_id" IS NOT NULL)
        OR ("source_type" = 'manual_adjustment'::"credit_note_source_type" AND "cancellation_id" IS NULL AND "return_id" IS NULL)
    ),
    ADD CONSTRAINT "credit_notes_approval_metadata_check" CHECK (
        ("status" = 'pending_approval'::"credit_note_status"
            AND "approved_by_id" IS NULL AND "approved_at" IS NULL)
        OR ("status" IN (
                'approved'::"credit_note_status", 'issued'::"credit_note_status", 'voided'::"credit_note_status"
            )
            AND "approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL
            AND "approved_at" >= "created_at")
    ),
    ADD CONSTRAINT "credit_notes_issue_metadata_check" CHECK (
        ("status" IN ('pending_approval'::"credit_note_status", 'approved'::"credit_note_status")
            AND "issued_by_id" IS NULL AND "issued_at" IS NULL)
        OR ("status" = 'issued'::"credit_note_status"
            AND "issued_by_id" IS NOT NULL AND "issued_at" IS NOT NULL
            AND "issued_at" >= "created_at" AND "issued_at" >= "approved_at")
        OR ("status" = 'voided'::"credit_note_status" AND (
            ("issued_by_id" IS NULL AND "issued_at" IS NULL)
            OR ("issued_by_id" IS NOT NULL AND "issued_at" IS NOT NULL
                AND "issued_at" >= "created_at" AND "issued_at" >= "approved_at")
        ))
    ),
    ADD CONSTRAINT "credit_notes_reason_nonblank_check" CHECK (btrim("reason") <> '');

ALTER TABLE "payments"
    ADD CONSTRAINT "payments_amount_positive_check" CHECK ("amount" > 0),
    ADD CONSTRAINT "payments_submission_metadata_check" CHECK (
        ("submitted_by_id" IS NULL AND "submitted_at" IS NULL)
        OR ("submitted_by_id" IS NOT NULL AND "submitted_at" IS NOT NULL AND "submitted_at" >= "created_at")
    ),
    ADD CONSTRAINT "payments_verification_metadata_check" CHECK (
        ("verified_by_id" IS NULL AND "verified_at" IS NULL)
        OR ("verified_by_id" IS NOT NULL AND "verified_at" IS NOT NULL
            AND "submitted_by_id" IS NOT NULL AND "submitted_at" IS NOT NULL
            AND "verified_at" >= "created_at" AND "verified_at" >= "submitted_at")
    );

ALTER TABLE "payment_allocations"
    ADD CONSTRAINT "payment_allocations_amount_positive_check" CHECK ("amount" > 0),
    ADD CONSTRAINT "payment_allocations_reversal_metadata_check" CHECK (
        ("reversed_by_id" IS NULL AND "reversal_reason" IS NULL AND "reversed_at" IS NULL)
        OR ("reversed_by_id" IS NOT NULL AND "reversal_reason" IS NOT NULL
            AND btrim("reversal_reason") <> '' AND "reversed_at" IS NOT NULL
            AND "reversed_at" >= "allocated_at")
    );

ALTER TABLE "credit_ledger_entries"
    ADD CONSTRAINT "credit_ledger_entries_amount_nonzero_check" CHECK ("amount" <> 0),
    ADD CONSTRAINT "credit_ledger_entries_reason_nonblank_check" CHECK (btrim("reason") <> '');

ALTER TABLE "refunds"
    ADD CONSTRAINT "refunds_amount_positive_check" CHECK ("amount" > 0),
    ADD CONSTRAINT "refunds_approval_metadata_check" CHECK (
        ("approved_by_id" IS NULL AND "approved_at" IS NULL)
        OR ("approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL AND "approved_at" >= "requested_at")
    ),
    ADD CONSTRAINT "refunds_processing_metadata_check" CHECK (
        (("processed_by_id" IS NULL AND "processed_at" IS NULL)
        OR ("processed_by_id" IS NOT NULL AND "processed_at" IS NOT NULL))
        AND ("processed_at" IS NULL OR (
            "approved_at" IS NOT NULL
            AND "processed_at" >= "requested_at"
            AND "processed_at" >= "approved_at"
        ))
    );

ALTER TABLE "return_items"
    ADD CONSTRAINT "return_items_quantity_positive_check" CHECK (
        "quantity" > 0 AND "base_quantity" > 0
    ),
    ADD CONSTRAINT "return_items_inspection_metadata_check" CHECK (
        ("inspected_by_id" IS NULL AND "inspected_at" IS NULL)
        OR ("inspected_by_id" IS NOT NULL AND "inspected_at" IS NOT NULL)
    );

ALTER TABLE "delivery_zones"
    ADD CONSTRAINT "delivery_zones_charge_check" CHECK (
        ("charge" IS NULL OR "charge" >= 0)
        AND (NOT "is_free" OR "charge" IS NULL OR "charge" = 0)
    );

ALTER TABLE "delivery_attempts"
    ADD CONSTRAINT "delivery_attempts_number_positive_check" CHECK ("attempt_number" > 0),
    ADD CONSTRAINT "delivery_attempts_inspection_metadata_check" CHECK (
        ("inspected_by_id" IS NULL AND "inspected_at" IS NULL)
        OR ("inspected_by_id" IS NOT NULL AND "inspected_at" IS NOT NULL)
    ),
    ADD CONSTRAINT "delivery_attempts_timestamp_order_check" CHECK (
        ("return_warehouse_at" IS NULL OR "dispatch_at" IS NULL OR "return_warehouse_at" >= "dispatch_at")
        AND ("completed_at" IS NULL OR "completed_at" >= "created_at")
    );

ALTER TABLE "delivery_assignments"
    ADD CONSTRAINT "delivery_assignments_end_time_check" CHECK (
        "ended_at" IS NULL OR "ended_at" >= "assigned_at"
    );

ALTER TABLE "import_batches"
    ADD CONSTRAINT "import_batches_sha256_check" CHECK ("sha256" ~ '^[0-9a-f]{64}$'),
    ADD CONSTRAINT "import_batches_counts_check" CHECK (
        "total_rows" >= 0 AND "valid_rows" >= 0 AND "warning_rows" >= 0 AND "invalid_rows" >= 0
        AND "valid_rows" + "warning_rows" + "invalid_rows" <= "total_rows"
    ),
    ADD CONSTRAINT "import_batches_approval_metadata_check" CHECK (
        ("status" IN (
                'uploaded'::"import_batch_status", 'validating'::"import_batch_status", 'preview_ready'::"import_batch_status"
            )
            AND "approved_by_id" IS NULL AND "approved_at" IS NULL)
        OR ("status" IN (
                'approved'::"import_batch_status", 'committing'::"import_batch_status", 'committed'::"import_batch_status"
            )
            AND "approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL
            AND "approved_at" >= "created_at")
        OR ("status" IN ('failed'::"import_batch_status", 'cancelled'::"import_batch_status") AND (
            ("approved_by_id" IS NULL AND "approved_at" IS NULL)
            OR ("approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL AND "approved_at" >= "created_at")
        ))
    ),
    ADD CONSTRAINT "import_batches_commit_metadata_check" CHECK (
        ("status" = 'committed'::"import_batch_status"
            AND "committed_by_id" IS NOT NULL AND "committed_at" IS NOT NULL
            AND "approved_at" IS NOT NULL
            AND "committed_at" >= "created_at" AND "committed_at" >= "approved_at")
        OR ("status" <> 'committed'::"import_batch_status"
            AND "committed_by_id" IS NULL AND "committed_at" IS NULL)
    );

ALTER TABLE "import_rows"
    ADD CONSTRAINT "import_rows_source_row_number_check" CHECK ("source_row_number" > 0);

ALTER TABLE "import_issues"
    ADD CONSTRAINT "import_issues_resolution_metadata_check" CHECK (
        ("resolved_by_id" IS NULL AND "resolution" IS NULL AND "resolved_at" IS NULL)
        OR ("resolved_by_id" IS NOT NULL AND "resolution" IS NOT NULL
            AND btrim("resolution") <> '' AND "resolved_at" IS NOT NULL)
    );

ALTER TABLE "source_record_mappings"
    ADD CONSTRAINT "source_record_mappings_one_target_check" CHECK (
        num_nonnulls("category_id", "product_id", "product_packaging_id", "product_price_id") = 1
    );

ALTER TABLE "expense_entries"
    ADD CONSTRAINT "expense_entries_amount_positive_check" CHECK ("amount" > 0),
    ADD CONSTRAINT "expense_entries_void_metadata_check" CHECK (
        ("voided_by_id" IS NULL AND "void_reason" IS NULL AND "voided_at" IS NULL)
        OR ("voided_by_id" IS NOT NULL AND "void_reason" IS NOT NULL
            AND btrim("void_reason") <> '' AND "voided_at" IS NOT NULL)
    );

ALTER TABLE "notification_subscriptions"
    ADD CONSTRAINT "notification_subscriptions_target_check" CHECK (
        ("scope" = 'product'::"notification_subscription_scope" AND "product_id" IS NOT NULL AND "category_id" IS NULL)
        OR ("scope" = 'category'::"notification_subscription_scope" AND "product_id" IS NULL AND "category_id" IS NOT NULL)
    );

-- Phase 5B custom SQL: partial uniqueness for current/active records.
CREATE UNIQUE INDEX "product_packaging_one_base_per_product_uidx"
    ON "product_packaging"("product_id") WHERE "is_base" = true;

CREATE UNIQUE INDEX "stock_locations_one_active_uidx"
    ON "stock_locations"((1)) WHERE "is_active" = true;

CREATE UNIQUE INDEX "import_batches_committed_sha256_uidx"
    ON "import_batches"("sha256") WHERE "status" = 'committed'::"import_batch_status";

CREATE UNIQUE INDEX "delivery_assignments_one_current_uidx"
    ON "delivery_assignments"("delivery_attempt_id") WHERE "ended_at" IS NULL;

CREATE UNIQUE INDEX "business_user_links_one_current_uidx"
    ON "business_user_links"("user_id", "client_business_id") WHERE "ended_at" IS NULL;

CREATE UNIQUE INDEX "stock_reservations_one_active_per_item_uidx"
    ON "stock_reservations"("order_item_id") WHERE "status" = 'active'::"stock_reservation_status";

CREATE UNIQUE INDEX "discount_rules_one_active_account_uidx"
    ON "discount_rules"("client_business_id")
    WHERE "is_active" = true AND "scope" = 'account_wide'::"discount_scope";

CREATE UNIQUE INDEX "discount_rules_one_active_category_uidx"
    ON "discount_rules"("client_business_id", "category_id")
    WHERE "is_active" = true AND "scope" = 'category'::"discount_scope";

CREATE UNIQUE INDEX "discount_rules_one_active_product_uidx"
    ON "discount_rules"("client_business_id", "product_id")
    WHERE "is_active" = true AND "scope" = 'product'::"discount_scope";

CREATE UNIQUE INDEX "notification_subscriptions_one_active_product_uidx"
    ON "notification_subscriptions"("user_id", "product_id")
    WHERE "is_active" = true AND "scope" = 'product'::"notification_subscription_scope";

CREATE UNIQUE INDEX "notification_subscriptions_one_active_category_uidx"
    ON "notification_subscriptions"("user_id", "category_id")
    WHERE "is_active" = true AND "scope" = 'category'::"notification_subscription_scope";

-- Phase 5B custom SQL: concurrent-safe non-overlapping price periods.
ALTER TABLE "product_prices"
    ADD CONSTRAINT "product_prices_effective_period_excl"
    EXCLUDE USING GIST (
        "product_packaging_id" WITH =,
        "price_type" WITH =,
        "currency" WITH =,
        tstzrange("effective_from", "effective_to", '[)') WITH &&
    );

ALTER TABLE "client_specific_prices"
    ADD CONSTRAINT "client_specific_prices_effective_period_excl"
    EXCLUDE USING GIST (
        "client_business_id" WITH =,
        "product_packaging_id" WITH =,
        "currency" WITH =,
        tstzrange("effective_from", "effective_to", '[)') WITH &&
    );

-- Phase 5B custom SQL: concurrency-safe SKU and yearly document allocators.
CREATE SEQUENCE "product_sku_seq"
    AS bigint
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1
    NO CYCLE;

CREATE FUNCTION "allocate_product_sku"()
RETURNS TABLE ("sku_number" bigint, "sku" text)
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
    allocated_number bigint;
BEGIN
    allocated_number := nextval('public.product_sku_seq'::regclass);
    RETURN QUERY
    SELECT allocated_number, 'RS-' || lpad(allocated_number::text, 6, '0');
END;
$$;

CREATE FUNCTION "allocate_document_number"(
    p_document_type "document_type",
    p_year integer
)
RETURNS TABLE ("sequence_number" integer, "document_number" text)
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
    allocated_number integer;
    document_prefix text;
BEGIN
    IF p_year < 2000 OR p_year > 9999 THEN
        RAISE EXCEPTION 'Document year must be between 2000 and 9999';
    END IF;

    INSERT INTO public."document_sequences" (
        "document_type", "year", "next_value", "updated_at"
    )
    VALUES (p_document_type, p_year, 2, CURRENT_TIMESTAMP)
    ON CONFLICT ("document_type", "year") DO UPDATE
    SET "next_value" = public."document_sequences"."next_value" + 1,
        "updated_at" = CURRENT_TIMESTAMP
    WHERE public."document_sequences"."next_value" <= 999999
    RETURNING "next_value" - 1 INTO allocated_number;

    IF allocated_number IS NULL THEN
        RAISE EXCEPTION 'Document sequence exhausted for % in %', p_document_type, p_year;
    END IF;

    document_prefix := CASE p_document_type
        WHEN 'order'::public."document_type" THEN 'RS-ORD-'
        WHEN 'invoice'::public."document_type" THEN 'RS-INV-'
        WHEN 'credit_note'::public."document_type" THEN 'RS-CN-'
    END;

    RETURN QUERY
    SELECT allocated_number,
           document_prefix || p_year::text || '-' || lpad(allocated_number::text, 6, '0');
END;
$$;

REVOKE ALL ON FUNCTION "allocate_product_sku"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "allocate_document_number"("document_type", integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SEQUENCE "product_sku_seq" FROM PUBLIC, anon, authenticated, service_role;

-- Phase 5B custom SQL: stable identifiers and issued-document snapshots.
CREATE FUNCTION "prevent_product_sku_change"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NEW."sku_number" IS DISTINCT FROM OLD."sku_number"
       OR NEW."sku" IS DISTINCT FROM OLD."sku" THEN
        RAISE EXCEPTION 'Product SKU identity is immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "products_prevent_sku_change"
BEFORE UPDATE ON "products"
FOR EACH ROW EXECUTE FUNCTION "prevent_product_sku_change"();

CREATE FUNCTION "prevent_order_identity_change"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NEW."order_number" IS DISTINCT FROM OLD."order_number"
       OR NEW."order_year" IS DISTINCT FROM OLD."order_year"
       OR NEW."sequence_number" IS DISTINCT FROM OLD."sequence_number" THEN
        RAISE EXCEPTION 'Order number identity is immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "orders_prevent_identity_change"
BEFORE UPDATE ON "orders"
FOR EACH ROW EXECUTE FUNCTION "prevent_order_identity_change"();

CREATE FUNCTION "prevent_invoice_snapshot_change"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF ROW(
        NEW."order_id", NEW."client_business_id", NEW."invoice_number",
        NEW."invoice_year", NEW."sequence_number", NEW."currency",
        NEW."subtotal", NEW."discount_total", NEW."tax_total",
        NEW."delivery_charge", NEW."total_amount", NEW."issued_by_id",
        NEW."issued_at", NEW."due_at"
    ) IS DISTINCT FROM ROW(
        OLD."order_id", OLD."client_business_id", OLD."invoice_number",
        OLD."invoice_year", OLD."sequence_number", OLD."currency",
        OLD."subtotal", OLD."discount_total", OLD."tax_total",
        OLD."delivery_charge", OLD."total_amount", OLD."issued_by_id",
        OLD."issued_at", OLD."due_at"
    ) THEN
        RAISE EXCEPTION 'Issued invoice snapshot is immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "invoices_prevent_snapshot_change"
BEFORE UPDATE ON "invoices"
FOR EACH ROW EXECUTE FUNCTION "prevent_invoice_snapshot_change"();

CREATE FUNCTION "protect_credit_note_snapshot"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NEW."credit_note_number" IS DISTINCT FROM OLD."credit_note_number"
       OR NEW."document_year" IS DISTINCT FROM OLD."document_year"
       OR NEW."sequence_number" IS DISTINCT FROM OLD."sequence_number" THEN
        RAISE EXCEPTION 'Credit-note number identity is immutable';
    END IF;

    IF OLD."status" = 'voided'::public."credit_note_status"
       AND NEW."status" <> OLD."status" THEN
        RAISE EXCEPTION 'A voided credit note is terminal';
    END IF;

    IF OLD."status" = 'issued'::public."credit_note_status"
       AND NEW."status" NOT IN ('issued'::public."credit_note_status", 'voided'::public."credit_note_status") THEN
        RAISE EXCEPTION 'An issued credit note may only remain issued or become voided';
    END IF;

    IF OLD."status" IN ('issued'::public."credit_note_status", 'voided'::public."credit_note_status")
       AND ROW(
           NEW."invoice_id", NEW."cancellation_id", NEW."return_id", NEW."source_type",
           NEW."amount", NEW."currency", NEW."reason", NEW."approved_by_id",
           NEW."issued_by_id", NEW."approved_at", NEW."issued_at", NEW."created_at"
       ) IS DISTINCT FROM ROW(
           OLD."invoice_id", OLD."cancellation_id", OLD."return_id", OLD."source_type",
           OLD."amount", OLD."currency", OLD."reason", OLD."approved_by_id",
           OLD."issued_by_id", OLD."approved_at", OLD."issued_at", OLD."created_at"
       ) THEN
        RAISE EXCEPTION 'Issued or voided credit-note snapshot is immutable';
    END IF;

    IF OLD."status" = 'approved'::public."credit_note_status"
       AND NEW."status" IN ('issued'::public."credit_note_status", 'voided'::public."credit_note_status")
       AND ROW(
           NEW."invoice_id", NEW."cancellation_id", NEW."return_id", NEW."source_type",
           NEW."amount", NEW."currency", NEW."reason", NEW."approved_by_id",
           NEW."approved_at", NEW."created_at"
       ) IS DISTINCT FROM ROW(
           OLD."invoice_id", OLD."cancellation_id", OLD."return_id", OLD."source_type",
           OLD."amount", OLD."currency", OLD."reason", OLD."approved_by_id",
           OLD."approved_at", OLD."created_at"
       ) THEN
        RAISE EXCEPTION 'Approved credit-note evidence cannot change during issuance or voiding';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "credit_notes_protect_snapshot"
BEFORE UPDATE ON "credit_notes"
FOR EACH ROW EXECUTE FUNCTION "protect_credit_note_snapshot"();

CREATE FUNCTION "prevent_append_only_mutation"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
    RAISE EXCEPTION '% is append-only; % is not permitted', TG_TABLE_NAME, TG_OP;
END;
$$;

CREATE TRIGGER "stock_movements_append_only"
BEFORE UPDATE OR DELETE ON "stock_movements"
FOR EACH ROW EXECUTE FUNCTION "prevent_append_only_mutation"();

CREATE TRIGGER "order_status_history_append_only"
BEFORE UPDATE OR DELETE ON "order_status_history"
FOR EACH ROW EXECUTE FUNCTION "prevent_append_only_mutation"();

CREATE TRIGGER "credit_ledger_entries_append_only"
BEFORE UPDATE OR DELETE ON "credit_ledger_entries"
FOR EACH ROW EXECUTE FUNCTION "prevent_append_only_mutation"();

CREATE TRIGGER "delivery_attempt_status_history_append_only"
BEFORE UPDATE OR DELETE ON "delivery_attempt_status_history"
FOR EACH ROW EXECUTE FUNCTION "prevent_append_only_mutation"();

CREATE TRIGGER "client_credit_limit_changes_append_only"
BEFORE UPDATE OR DELETE ON "client_credit_limit_changes"
FOR EACH ROW EXECUTE FUNCTION "prevent_append_only_mutation"();

CREATE TRIGGER "discount_change_logs_append_only"
BEFORE UPDATE OR DELETE ON "discount_change_logs"
FOR EACH ROW EXECUTE FUNCTION "prevent_append_only_mutation"();

CREATE TRIGGER "audit_logs_append_only"
BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION "prevent_append_only_mutation"();

CREATE FUNCTION "prevent_hard_delete"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
    RAISE EXCEPTION '% is retained; hard deletion is not permitted', TG_TABLE_NAME;
END;
$$;

CREATE TRIGGER "orders_prevent_hard_delete"
BEFORE DELETE ON "orders"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "order_items_prevent_hard_delete"
BEFORE DELETE ON "order_items"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "order_change_requests_prevent_hard_delete"
BEFORE DELETE ON "order_change_requests"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "cancellations_prevent_hard_delete"
BEFORE DELETE ON "cancellations"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "order_credit_approvals_prevent_hard_delete"
BEFORE DELETE ON "order_credit_approvals"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "invoices_prevent_hard_delete"
BEFORE DELETE ON "invoices"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "credit_notes_prevent_hard_delete"
BEFORE DELETE ON "credit_notes"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "payments_prevent_hard_delete"
BEFORE DELETE ON "payments"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "refunds_prevent_hard_delete"
BEFORE DELETE ON "refunds"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "returns_prevent_hard_delete"
BEFORE DELETE ON "returns"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "return_items_prevent_hard_delete"
BEFORE DELETE ON "return_items"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "deliveries_prevent_hard_delete"
BEFORE DELETE ON "deliveries"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "delivery_attempts_prevent_hard_delete"
BEFORE DELETE ON "delivery_attempts"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "delivery_assignments_prevent_hard_delete"
BEFORE DELETE ON "delivery_assignments"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

CREATE TRIGGER "expense_entries_prevent_hard_delete"
BEFORE DELETE ON "expense_entries"
FOR EACH ROW EXECUTE FUNCTION "prevent_hard_delete"();

-- Phase 5B custom SQL: controlled one-way lifecycle mutations.
CREATE FUNCTION "protect_payment_allocation"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Payment allocations cannot be deleted';
    END IF;

    IF ROW(
        NEW."payment_id", NEW."invoice_id", NEW."amount",
        NEW."allocated_by_id", NEW."allocated_at"
    ) IS DISTINCT FROM ROW(
        OLD."payment_id", OLD."invoice_id", OLD."amount",
        OLD."allocated_by_id", OLD."allocated_at"
    ) THEN
        RAISE EXCEPTION 'Payment allocation core fields are immutable';
    END IF;

    IF OLD."reversed_at" IS NOT NULL
       OR OLD."reversed_by_id" IS NOT NULL
       OR OLD."reversal_reason" IS NOT NULL THEN
        RAISE EXCEPTION 'A reversed payment allocation is immutable';
    END IF;

    IF NOT (
        NEW."reversed_at" IS NOT NULL
        AND NEW."reversed_by_id" IS NOT NULL
        AND NEW."reversal_reason" IS NOT NULL
        AND btrim(NEW."reversal_reason") <> ''
    ) THEN
        RAISE EXCEPTION 'Allocation update must be a complete reversal';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "payment_allocations_protect_lifecycle"
BEFORE UPDATE OR DELETE ON "payment_allocations"
FOR EACH ROW EXECUTE FUNCTION "protect_payment_allocation"();

CREATE FUNCTION "protect_stock_reservation"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Stock reservations cannot be deleted';
    END IF;

    IF ROW(
        NEW."order_item_id", NEW."product_id", NEW."stock_location_id",
        NEW."quantity_base", NEW."created_by_id", NEW."created_at"
    ) IS DISTINCT FROM ROW(
        OLD."order_item_id", OLD."product_id", OLD."stock_location_id",
        OLD."quantity_base", OLD."created_by_id", OLD."created_at"
    ) THEN
        RAISE EXCEPTION 'Stock reservation core fields are immutable';
    END IF;

    IF OLD."status" <> 'active'::public."stock_reservation_status" THEN
        RAISE EXCEPTION 'Consumed or released stock reservations are immutable';
    END IF;

    IF NEW."status" = 'consumed'::public."stock_reservation_status" THEN
        IF NEW."consumed_by_id" IS NULL OR NEW."consumed_at" IS NULL
           OR NEW."released_by_id" IS NOT NULL OR NEW."released_at" IS NOT NULL
           OR NEW."release_reason" IS NOT NULL THEN
            RAISE EXCEPTION 'Consumed reservation metadata is incomplete or conflicting';
        END IF;
    ELSIF NEW."status" = 'released'::public."stock_reservation_status" THEN
        IF NEW."released_by_id" IS NULL OR NEW."released_at" IS NULL
           OR NEW."release_reason" IS NULL OR btrim(NEW."release_reason") = ''
           OR NEW."consumed_by_id" IS NOT NULL OR NEW."consumed_at" IS NOT NULL THEN
            RAISE EXCEPTION 'Released reservation metadata is incomplete or conflicting';
        END IF;
    ELSIF ROW(
        NEW."consumed_by_id", NEW."consumed_at", NEW."released_by_id",
        NEW."released_at", NEW."release_reason"
    ) IS DISTINCT FROM ROW(
        OLD."consumed_by_id", OLD."consumed_at", OLD."released_by_id",
        OLD."released_at", OLD."release_reason"
    ) THEN
        RAISE EXCEPTION 'Active reservation metadata cannot be changed';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "stock_reservations_protect_lifecycle"
BEFORE UPDATE OR DELETE ON "stock_reservations"
FOR EACH ROW EXECUTE FUNCTION "protect_stock_reservation"();

CREATE FUNCTION "protect_import_batch"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Import batches cannot be deleted';
    END IF;
    IF OLD."status" = 'committed'::public."import_batch_status" THEN
        RAISE EXCEPTION 'Committed import batches are immutable';
    END IF;
    IF ROW(
        NEW."original_filename", NEW."sha256", NEW."uploaded_by_id", NEW."created_at"
    ) IS DISTINCT FROM ROW(
        OLD."original_filename", OLD."sha256", OLD."uploaded_by_id", OLD."created_at"
    ) THEN
        RAISE EXCEPTION 'Import batch source identity is immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "import_batches_protect_lifecycle"
BEFORE UPDATE OR DELETE ON "import_batches"
FOR EACH ROW EXECUTE FUNCTION "protect_import_batch"();

CREATE FUNCTION "protect_import_row"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
    parent_status public."import_batch_status";
BEGIN
    IF TG_OP = 'UPDATE' AND NEW."import_batch_id" IS DISTINCT FROM OLD."import_batch_id" THEN
        RAISE EXCEPTION 'Import rows cannot be moved between batches';
    END IF;

    -- Import child writers always lock the parent batch before the child mutation proceeds.
    SELECT batch."status" INTO parent_status
    FROM public."import_batches" AS batch
    WHERE batch."id" = CASE WHEN TG_OP = 'INSERT' THEN NEW."import_batch_id" ELSE OLD."import_batch_id" END
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Import row parent batch does not exist';
    END IF;

    IF parent_status = 'committed'::public."import_batch_status" THEN
        RAISE EXCEPTION 'Rows of a committed import batch are immutable';
    END IF;

    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Import rows cannot be deleted';
    END IF;

    IF ROW(
        NEW."import_batch_id", NEW."source_sheet", NEW."source_row_number",
        NEW."raw_data", NEW."created_at"
    ) IS DISTINCT FROM ROW(
        OLD."import_batch_id", OLD."source_sheet", OLD."source_row_number",
        OLD."raw_data", OLD."created_at"
    ) THEN
        RAISE EXCEPTION 'Import row source identity and raw data are immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "import_rows_protect_lifecycle"
BEFORE INSERT OR UPDATE OR DELETE ON "import_rows"
FOR EACH ROW EXECUTE FUNCTION "protect_import_row"();

CREATE FUNCTION "protect_import_issue"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
    parent_status public."import_batch_status";
BEGIN
    IF TG_OP = 'UPDATE' AND NEW."import_row_id" IS DISTINCT FROM OLD."import_row_id" THEN
        RAISE EXCEPTION 'Import issues cannot be moved between rows';
    END IF;

    SELECT batch."status" INTO parent_status
    FROM public."import_batches" AS batch
    JOIN public."import_rows" AS import_row ON import_row."import_batch_id" = batch."id"
    WHERE import_row."id" = CASE WHEN TG_OP = 'INSERT' THEN NEW."import_row_id" ELSE OLD."import_row_id" END
    FOR UPDATE OF batch;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Import issue parent row or batch does not exist';
    END IF;

    IF parent_status = 'committed'::public."import_batch_status" THEN
        RAISE EXCEPTION 'Issues of a committed import batch are immutable';
    END IF;

    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Import issues cannot be deleted';
    END IF;

    IF ROW(
        NEW."import_row_id", NEW."severity", NEW."code", NEW."field_name",
        NEW."message", NEW."created_at"
    ) IS DISTINCT FROM ROW(
        OLD."import_row_id", OLD."severity", OLD."code", OLD."field_name",
        OLD."message", OLD."created_at"
    ) THEN
        RAISE EXCEPTION 'Import issue evidence is immutable';
    END IF;

    IF OLD."resolved_at" IS NOT NULL
       OR OLD."resolved_by_id" IS NOT NULL
       OR OLD."resolution" IS NOT NULL THEN
        RAISE EXCEPTION 'Resolved import issues are immutable';
    END IF;

    IF NOT (
        NEW."resolved_at" IS NOT NULL
        AND NEW."resolved_by_id" IS NOT NULL
        AND NEW."resolution" IS NOT NULL
        AND btrim(NEW."resolution") <> ''
    ) THEN
        RAISE EXCEPTION 'Issue update must be a complete resolution';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "import_issues_protect_lifecycle"
BEFORE INSERT OR UPDATE OR DELETE ON "import_issues"
FOR EACH ROW EXECUTE FUNCTION "protect_import_issue"();

CREATE FUNCTION "protect_source_record_mapping"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
    parent_status public."import_batch_status";
BEGIN
    IF TG_OP = 'UPDATE' AND NEW."import_row_id" IS DISTINCT FROM OLD."import_row_id" THEN
        RAISE EXCEPTION 'Source-record mappings cannot be moved between import rows';
    END IF;

    SELECT batch."status" INTO parent_status
    FROM public."import_batches" AS batch
    JOIN public."import_rows" AS import_row ON import_row."import_batch_id" = batch."id"
    WHERE import_row."id" = CASE WHEN TG_OP = 'INSERT' THEN NEW."import_row_id" ELSE OLD."import_row_id" END
    FOR UPDATE OF batch;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source-record mapping parent row or batch does not exist';
    END IF;

    IF parent_status = 'committed'::public."import_batch_status" THEN
        RAISE EXCEPTION 'Mappings of a committed import batch are immutable';
    END IF;

    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Source-record mappings cannot be deleted';
    END IF;

    IF NEW."created_at" IS DISTINCT FROM OLD."created_at" THEN
        RAISE EXCEPTION 'Source-record mapping creation evidence is immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "source_record_mappings_protect_lifecycle"
BEFORE INSERT OR UPDATE OR DELETE ON "source_record_mappings"
FOR EACH ROW EXECUTE FUNCTION "protect_source_record_mapping"();

REVOKE ALL ON FUNCTION "prevent_product_sku_change"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "prevent_order_identity_change"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "prevent_invoice_snapshot_change"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "protect_credit_note_snapshot"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "prevent_append_only_mutation"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "prevent_hard_delete"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "protect_payment_allocation"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "protect_stock_reservation"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "protect_import_batch"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "protect_import_row"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "protect_import_issue"() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION "protect_source_record_mapping"() FROM PUBLIC, anon, authenticated, service_role;

-- Phase 5B custom SQL: defense-in-depth RLS. No browser-access policies are created.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_businesses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "business_user_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_business_approvals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_credit_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_credit_limit_changes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_aliases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "units_of_measure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_packaging" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_prices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_specific_prices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "discount_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "discount_change_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_balances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_change_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cancellations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_credit_approvals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_allocations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_ledger_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refunds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "returns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "return_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "delivery_zones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "delivery_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "delivery_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "delivery_attempt_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_rows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_issues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "source_record_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expense_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
    "users", "staff_profiles", "client_businesses", "business_user_links",
    "client_business_approvals", "client_credit_accounts", "client_credit_limit_changes",
    "categories", "products", "product_aliases", "units_of_measure", "product_packaging",
    "product_prices", "client_specific_prices", "discount_rules", "discount_change_logs",
    "stock_locations", "stock_balances", "stock_reservations", "stock_movements",
    "orders", "order_items", "order_status_history", "order_change_requests",
    "cancellations", "order_credit_approvals", "document_sequences", "invoices",
    "credit_notes", "payments", "payment_allocations", "credit_ledger_entries",
    "refunds", "returns", "return_items", "delivery_zones", "deliveries",
    "delivery_attempts", "delivery_assignments", "delivery_attempt_status_history",
    "import_batches", "import_rows", "import_issues", "source_record_mappings",
    "expense_entries", "notification_subscriptions", "notifications", "audit_logs"
FROM anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
    REVOKE ALL ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
    REVOKE USAGE, SELECT, UPDATE ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
