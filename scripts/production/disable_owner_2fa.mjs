// Temporarily disable 2FA for owner so we can re-enroll via BetterAuth
// with the production BETTER_AUTH_SECRET

import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const email = process.env.VERIFY_OWNER_EMAIL || 'ahmedraa0007@gmail.com';

// Disable 2FA on the user account
await pool.query("UPDATE users SET two_factor_enabled = false WHERE email = $1", [email]);

// Delete the two_factor record so it can be re-enrolled fresh
const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
const userId = userRes.rows[0]?.id;
if (userId) {
  await pool.query("DELETE FROM two_factor WHERE user_id = $1", [userId]);
  console.log('Deleted two_factor record for user:', userId);
}

console.log('SUCCESS: 2FA disabled for owner. You can now:');
console.log('1. Sign in to admin panel with email+password (no TOTP)');
console.log('2. Go to security settings and enable TOTP fresh');
console.log('3. Scan QR code with Google Authenticator');
console.log('4. Copy the Base32 secret into .env.production.verification as VERIFY_OWNER_TOTP_SECRET');

await pool.end();
