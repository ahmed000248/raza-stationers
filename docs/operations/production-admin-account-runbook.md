# Production Admin Account Runbook

Public Admin registration is prohibited. The Admin application accepts Supabase sessions only for trusted application users whose role is stored in PostgreSQL, and owner/admin API routes require AAL2.

## Recommended process

### First owner — one-time idempotent bootstrap

Use `scripts/admin/bootstrap-owner.mjs` from a controlled operator workstation. The script:

- refuses to create a second, different first owner;
- creates or reuses the Supabase email identity;
- refuses to merge conflicting email, local `03…`, legacy `+923…`, or Supabase identities;
- refuses to promote an existing customer automatically;
- assigns `owner` only in the trusted application database;
- writes an idempotent audit record;
- removes a newly created Supabase identity if the database transaction fails;
- is safe to rerun for the same owner.

Set the values only in the current shell. Never put them in a tracked `.env` file:

```powershell
$env:DATABASE_URL = '<production direct PostgreSQL URL>'
$env:NEXT_PUBLIC_SUPABASE_URL = '<Supabase project URL>'
$env:SUPABASE_SERVICE_ROLE_KEY = '<service role key>'
$env:RAZA_OWNER_EMAIL = '<owner email>'
$env:RAZA_OWNER_NAME = '<owner name>'
$env:RAZA_OWNER_MOBILE = '03XXXXXXXXX'
$env:RAZA_OWNER_INITIAL_PASSWORD = '<temporary password of at least 12 characters>'
npm run admin:bootstrap-owner
Remove-Item Env:DATABASE_URL,Env:NEXT_PUBLIC_SUPABASE_URL,Env:SUPABASE_SERVICE_ROLE_KEY,Env:RAZA_OWNER_EMAIL,Env:RAZA_OWNER_NAME,Env:RAZA_OWNER_MOBILE,Env:RAZA_OWNER_INITIAL_PASSWORD
```

If the Supabase user already exists, the initial-password variable is not used. After the first login, the Admin PWA requires TOTP enrollment/verification before private content or privileged API access. Change the temporary password through the approved recovery/account flow.

Do not run the bootstrap from a browser, CI log, public endpoint, or shared command transcript. Do not use the Supabase anon/publishable key in place of the service-role key.

### Alternative — Dashboard identity plus trusted link

The owner may first create the email user in the Supabase Dashboard, then run the same bootstrap without `RAZA_OWNER_INITIAL_PASSWORD`. The script links the existing Supabase identity to the application owner atomically. Creating a Supabase user alone does not grant application access.

### Future Admin and staff accounts

After the first owner has an AAL2 session, use the private Admin PWA Staff Management page. The owner supplies the staff member’s real email, name, `03XXXXXXXXX` mobile and one allowed role (`admin`, `packing`, or `delivery`). The NestJS owner-only endpoint sends the Supabase invitation and writes the trusted role plus audit record. A customer cannot submit role data through a public signup flow.

## Verification checklist

1. `/login` is the only public Admin page and offers no signup.
2. A normal customer account is rejected by the Admin application.
3. The first owner is redirected to TOTP enrollment or challenge before the dashboard.
4. Owner/admin API requests at AAL1 return `403`; AAL2 requests use the trusted database role.
5. Re-running bootstrap for the same identity reports success without creating a duplicate.
6. Running it for a different identity after an owner exists stops without mutation.
7. Clear all temporary environment variables and operator shell history according to the hosting procedure.
