-- Phase 6 correction: PostgreSQL's built-in PUBLIC function EXECUTE default
-- is global. A schema-scoped REVOKE cannot remove that built-in privilege.
BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role, raza_runtime;

COMMIT;
