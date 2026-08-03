# Phase 8 production readiness checklist

## Repository and local gates

- [x] Production-readiness branch created from the verified Phase 7 checkpoint.
- [x] Timestamped migration history and certified catalogue artifacts preserved.
- [x] Staging-specific executable configuration, credentials, scripts, and tests removed.
- [x] Runtime database and migration connection responsibilities separated.
- [x] Remote PostgreSQL TLS fails closed and loads a trusted CA.
- [x] Browser, backend, and migration environment ownership documented.
- [x] Static tests cannot connect to a database.
- [x] Integration tests require their own uniquely named localhost PostgreSQL container and sentinel.
- [x] Docker/Render definitions contain no committed secret and do not auto-run migrations.
- [ ] Remove raw `Design/` exports after explicit owner filesystem-deletion approval.
- [ ] Review and resolve the production dependency audit (9 high, 4 moderate, 0 critical) in a dedicated upgrade/regression pass.
- [ ] Replace the ignored local database URLs, which still target the retired project, with complete URLs for `pqlmgqzpjjllhgalyhwz`.
- [ ] Complete all command gates and record their exit codes in the Phase 8 handoff.
- [ ] Run sanitized migration status and aggregate reconciliation if both ignored local URLs are complete and target the intended project.

## External configuration checkpoint (Ahmed)

- [ ] Supabase: confirm project URL, publishable key, service-role key, Google OAuth client ID/secret, Site URL, Web/Admin callback allow-lists, MFA/TOTP settings, and email confirmation/redirect settings.
- [ ] Vercel Web: set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Vercel Admin: set the same three public variables for the Admin deployment.
- [ ] Render API: set `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CORS_ORIGINS`, and `NODE_ENV=production`.
- [ ] Controlled migration environment: set `DIRECT_URL` and the approved CA configuration.
- [ ] Deploy Web/Admin/API only after the configuration above is reviewed.
- [ ] Verify owner authentication, customer/business registration, and deployed application acceptance tests.
- [ ] Explicitly authorize staging cloud deletion only after every gate in `staging-retirement.md` passes.

Secrets must be entered directly in the local terminal or provider dashboard, never in chat.
