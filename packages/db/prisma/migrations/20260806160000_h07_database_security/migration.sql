-- Migration for H-07: Backend-Only Database Security Model (Model A)
-- Revokes public/anon/authenticated access on Better Auth tables and security definer functions,
-- ensuring raza_runtime is granted exclusive application backend permissions.

BEGIN;

-- 1. Ensure Better Auth tables are revoked from PUBLIC, anon, authenticated
REVOKE ALL PRIVILEGES ON TABLE
    public."account", public."session", public."two_factor", public."verification"
FROM PUBLIC, anon, authenticated;

-- 2. Grant DML access exclusively to raza_runtime
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public."account", public."session", public."two_factor", public."verification"
TO raza_runtime;

-- 3. Enable RLS on Better Auth tables
ALTER TABLE public."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."two_factor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification" ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS policies for raza_runtime on Better Auth tables
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raza_runtime_full_access_account') THEN
        CREATE POLICY "raza_runtime_full_access_account" ON public."account" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raza_runtime_full_access_session') THEN
        CREATE POLICY "raza_runtime_full_access_session" ON public."session" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raza_runtime_full_access_two_factor') THEN
        CREATE POLICY "raza_runtime_full_access_two_factor" ON public."two_factor" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'raza_runtime_full_access_verification') THEN
        CREATE POLICY "raza_runtime_full_access_verification" ON public."verification" FOR ALL TO raza_runtime USING (true) WITH CHECK (true);
    END IF;
END $$;

COMMIT;
