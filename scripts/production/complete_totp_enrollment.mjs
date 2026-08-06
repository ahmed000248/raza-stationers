// Complete TOTP enrollment - verify the TOTP code with BetterAuth to activate 2FA

import crypto from 'node:crypto';

const apiBase = 'https://raza-stationers-api-staging.onrender.com';
const ORIGIN = 'https://raza-stationers-admin-seven.vercel.app';

const ownerEmail = process.env.VERIFY_OWNER_EMAIL;
const ownerPassword = process.env.VERIFY_OWNER_PASSWORD;
const totpSecret = process.env.VERIFY_OWNER_TOTP_SECRET;

// Native TOTP using RFC 6238
function generateTOTP(secret) {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of secret.toUpperCase()) {
    const v = base32Chars.indexOf(c);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = [];
  while (bits.length >= 8) { bytes.push(parseInt(bits.slice(0, 8), 2)); bits = bits.slice(8); }
  const key = Buffer.from(bytes);
  const t = Math.floor(Date.now() / 1000 / 30);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(t));
  const hmac = crypto.createHmac('sha1', key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (((hmac[offset] & 0x7f) << 24) | (hmac[offset+1] << 16) | (hmac[offset+2] << 8) | hmac[offset+3]) % 1000000;
  return String(code).padStart(6, '0');
}

// Sign in without 2FA (now disabled)
const signInRes = await fetch(`${apiBase}/auth/api/sign-in/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
  body: JSON.stringify({ email: ownerEmail, password: ownerPassword }),
  redirect: 'manual',
});
const signInCookies = signInRes.headers.getSetCookie?.() || [];
const signInBody = await signInRes.json();
console.log('Sign-in:', signInRes.status, JSON.stringify(signInBody)?.slice(0, 100));

// Verify TOTP to complete enrollment
const otp = generateTOTP(totpSecret);
console.log('TOTP code:', otp);

const verifyRes = await fetch(`${apiBase}/auth/api/two-factor/verify-totp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Cookie': signInCookies.join('; '), 'Origin': ORIGIN },
  body: JSON.stringify({ code: otp }),
});
const verifyBody = await verifyRes.json().catch(() => verifyRes.text());
console.log('TOTP verify:', verifyRes.status, JSON.stringify(verifyBody)?.slice(0, 200));

if (verifyRes.status === 200) {
  console.log('\nSUCCESS: TOTP enrollment complete! 2FA is now active on production.');
  console.log('VERIFY_OWNER_TOTP_SECRET is correct and working.');
} else {
  // Alternatively try via two-factor enable with verify
  const enableRes = await fetch(`${apiBase}/auth/api/two-factor/enable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': signInCookies.join('; '), 'Origin': ORIGIN },
    body: JSON.stringify({ password: ownerPassword, code: otp }),
  });
  const enableBody = await enableRes.json().catch(() => enableRes.text());
  console.log('two-factor/enable with code:', enableRes.status, JSON.stringify(enableBody)?.slice(0, 200));
}
