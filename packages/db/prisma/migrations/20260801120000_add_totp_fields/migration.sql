-- Gate 7: Admin TOTP 2FA fields (FR-AUTH-04)
-- Adds totp_secret and is_totp_enabled to users table.
-- totp_secret stores the base32 TOTP secret (null = not configured).
-- is_totp_enabled enforces 2FA at login for owner/admin roles.

ALTER TABLE "public"."users"
  ADD COLUMN "totp_secret" TEXT,
  ADD COLUMN "is_totp_enabled" BOOLEAN NOT NULL DEFAULT false;
