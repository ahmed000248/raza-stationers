-- Phase 6: Supabase development runtime role, least-privilege grants and RLS.
BEGIN;

SET LOCAL search_path = pg_catalog, public;

-- The runtime authorization role is deliberately group-only. A separate
-- secret-backed LOGIN role may inherit it during a future NestJS deployment.
DO $role$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_roles
        WHERE rolname = 'raza_runtime'
    ) THEN
        EXECUTE 'CREATE ROLE raza_runtime NOLOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS';
    END IF;
END;
$role$;

ALTER ROLE raza_runtime
    NOLOGIN
    NOSUPERUSER
    INHERIT
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    NOBYPASSRLS;

REVOKE CREATE ON SCHEMA public FROM PUBLIC, raza_runtime;
GRANT USAGE ON SCHEMA public TO raza_runtime;

-- Existing business tables remain unavailable to browser/API roles. The
-- trusted NestJS runtime receives DML only; TRUNCATE and DDL are not granted.
REVOKE ALL PRIVILEGES ON TABLE
    public."users", public."staff_profiles", public."client_businesses",
    public."business_user_links", public."client_business_approvals",
    public."client_credit_accounts", public."client_credit_limit_changes",
    public."categories", public."products", public."product_aliases",
    public."units_of_measure", public."product_packaging", public."product_prices",
    public."client_specific_prices", public."discount_rules",
    public."discount_change_logs", public."stock_locations", public."stock_balances",
    public."stock_reservations", public."stock_movements", public."orders",
    public."order_items", public."order_status_history", public."order_change_requests",
    public."cancellations", public."order_credit_approvals", public."document_sequences",
    public."invoices", public."credit_notes", public."payments",
    public."payment_allocations", public."credit_ledger_entries", public."refunds",
    public."returns", public."return_items", public."delivery_zones",
    public."deliveries", public."delivery_attempts", public."delivery_assignments",
    public."delivery_attempt_status_history", public."import_batches",
    public."import_rows", public."import_issues", public."source_record_mappings",
    public."expense_entries", public."notification_subscriptions",
    public."notifications", public."audit_logs"
FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public."users", public."staff_profiles", public."client_businesses",
    public."business_user_links", public."client_business_approvals",
    public."client_credit_accounts", public."client_credit_limit_changes",
    public."categories", public."products", public."product_aliases",
    public."units_of_measure", public."product_packaging", public."product_prices",
    public."client_specific_prices", public."discount_rules",
    public."discount_change_logs", public."stock_locations", public."stock_balances",
    public."stock_reservations", public."stock_movements", public."orders",
    public."order_items", public."order_status_history", public."order_change_requests",
    public."cancellations", public."order_credit_approvals", public."document_sequences",
    public."invoices", public."credit_notes", public."payments",
    public."payment_allocations", public."credit_ledger_entries", public."refunds",
    public."returns", public."return_items", public."delivery_zones",
    public."deliveries", public."delivery_attempts", public."delivery_assignments",
    public."delivery_attempt_status_history", public."import_batches",
    public."import_rows", public."import_issues", public."source_record_mappings",
    public."expense_entries", public."notification_subscriptions",
    public."notifications", public."audit_logs"
TO raza_runtime;

-- The SKU allocator is SECURITY INVOKER, so its caller needs sequence USAGE.
REVOKE ALL PRIVILEGES ON SEQUENCE public."product_sku_seq"
FROM PUBLIC, anon, authenticated, service_role, raza_runtime;
GRANT USAGE ON SEQUENCE public."product_sku_seq" TO raza_runtime;

-- Only the two application allocators are directly callable by the runtime.
REVOKE ALL PRIVILEGES ON FUNCTION public."allocate_product_sku"()
FROM PUBLIC, anon, authenticated, service_role, raza_runtime;
REVOKE ALL PRIVILEGES ON FUNCTION public."allocate_document_number"(public."document_type", integer)
FROM PUBLIC, anon, authenticated, service_role, raza_runtime;
GRANT EXECUTE ON FUNCTION public."allocate_product_sku"() TO raza_runtime;
GRANT EXECUTE ON FUNCTION public."allocate_document_number"(public."document_type", integer) TO raza_runtime;

-- Trigger and lifecycle helpers are not public APIs.
REVOKE ALL PRIVILEGES ON FUNCTION
    public."prevent_product_sku_change"(),
    public."prevent_order_identity_change"(),
    public."prevent_invoice_snapshot_change"(),
    public."protect_credit_note_snapshot"(),
    public."prevent_append_only_mutation"(),
    public."prevent_hard_delete"(),
    public."protect_payment_allocation"(),
    public."protect_stock_reservation"(),
    public."protect_import_batch"(),
    public."protect_import_row"(),
    public."protect_import_issue"(),
    public."protect_source_record_mapping"()
FROM PUBLIC, anon, authenticated, service_role, raza_runtime;

-- New objects created by the migration owner remain private to browser roles.
-- Future tables and sequences receive only the runtime privileges approved here;
-- future functions require an explicit migration grant.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO raza_runtime;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT USAGE ON SEQUENCES TO raza_runtime;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role, raza_runtime;

-- One policy per business table. The role is reachable only through a trusted
-- server-side LOGIN role, and NestJS remains responsible for domain authorization.
CREATE POLICY "raza_runtime_full_access_users"
    ON public."users" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_staff_profiles"
    ON public."staff_profiles" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_client_businesses"
    ON public."client_businesses" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_business_user_links"
    ON public."business_user_links" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_client_business_approvals"
    ON public."client_business_approvals" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_client_credit_accounts"
    ON public."client_credit_accounts" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_client_credit_limit_changes"
    ON public."client_credit_limit_changes" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_categories"
    ON public."categories" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_products"
    ON public."products" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_product_aliases"
    ON public."product_aliases" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_units_of_measure"
    ON public."units_of_measure" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_product_packaging"
    ON public."product_packaging" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_product_prices"
    ON public."product_prices" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_client_specific_prices"
    ON public."client_specific_prices" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_discount_rules"
    ON public."discount_rules" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_discount_change_logs"
    ON public."discount_change_logs" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_stock_locations"
    ON public."stock_locations" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_stock_balances"
    ON public."stock_balances" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_stock_reservations"
    ON public."stock_reservations" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_stock_movements"
    ON public."stock_movements" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_orders"
    ON public."orders" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_order_items"
    ON public."order_items" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_order_status_history"
    ON public."order_status_history" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_order_change_requests"
    ON public."order_change_requests" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_cancellations"
    ON public."cancellations" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_order_credit_approvals"
    ON public."order_credit_approvals" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_document_sequences"
    ON public."document_sequences" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_invoices"
    ON public."invoices" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_credit_notes"
    ON public."credit_notes" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_payments"
    ON public."payments" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_payment_allocations"
    ON public."payment_allocations" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_credit_ledger_entries"
    ON public."credit_ledger_entries" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_refunds"
    ON public."refunds" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_returns"
    ON public."returns" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_return_items"
    ON public."return_items" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_delivery_zones"
    ON public."delivery_zones" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_deliveries"
    ON public."deliveries" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_delivery_attempts"
    ON public."delivery_attempts" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_delivery_assignments"
    ON public."delivery_assignments" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_delivery_attempt_status_history"
    ON public."delivery_attempt_status_history" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_import_batches"
    ON public."import_batches" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_import_rows"
    ON public."import_rows" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_import_issues"
    ON public."import_issues" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_source_record_mappings"
    ON public."source_record_mappings" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_expense_entries"
    ON public."expense_entries" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_notification_subscriptions"
    ON public."notification_subscriptions" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_notifications"
    ON public."notifications" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
CREATE POLICY "raza_runtime_full_access_audit_logs"
    ON public."audit_logs" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);

COMMIT;
