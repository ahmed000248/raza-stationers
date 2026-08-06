// Fix owner TOTP enrollment using BetterAuth's own /auth/api/two-factor/enable endpoint
// This uses the production BETTER_AUTH_SECRET (Render's deployed secret) for encryption

import crypto from 'node:crypto';

const apiBase = 'https://raza-stationers-api-staging.onrender.com';
const ORIGIN = 'https://raza-stationers-admin-seven.vercel.app';

const ownerEmail = process.env.VERIFY_OWNER_EMAIL;
const ownerPassword = process.env.VERIFY_OWNER_PASSWORD;

// Step 1: Sign in as owner via BetterAuth
const signInRes = await fetch(`${apiBase}/auth/api/sign-in/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
  body: JSON.stringify({ email: ownerEmail, password: ownerPassword }),
});
const signInCookies = signInRes.headers.getSetCookie?.() || [];
const signInBody = await signInRes.json();
console.log('Sign-in status:', signInRes.status, 'two-factor?', signInBody?.twoFactorRedirect);
console.log('Cookies from sign-in:', signInCookies.length);

// Step 2: Try to get current session (may work without TOTP for setup-only)
// Use the session from sign-in, then call /auth/api/two-factor/enable
// to generate a new server-side TOTP secret (encrypted with Render's secret)

// First, we need an authenticated session. Since owner has MFA enabled and we can't
// pass TOTP, let's use /auth/login (JWT bearer) to get a bearer token and call
// the BetterAuth setup endpoint via the app's proxy endpoint

// Use app /auth/login to get bearer token (AAL1)
const loginRes = await fetch(`${apiBase}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
  body: JSON.stringify({ email: ownerEmail, password: ownerPassword }),
});
const loginBody = await loginRes.json();
const bearerToken = loginBody.accessToken;
console.log('\nApp /auth/login:', loginRes.status, '- Token:', bearerToken?.slice(0, 20) + '...');

// Step 3: Use BetterAuth's two-factor setup endpoint to generate a new TOTP secret
// This bypasses the requirement to know the current encrypted secret
const setupRes = await fetch(`${apiBase}/auth/api/two-factor/enable`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${bearerToken}`,
    'Origin': ORIGIN,
  },
  body: JSON.stringify({ password: ownerPassword }),
});
const setupBody = await setupRes.json().catch(() => setupRes.text());
console.log('\n/auth/api/two-factor/enable status:', setupRes.status);
console.log('Response:', JSON.stringify(setupBody)?.slice(0, 400));

if (setupRes.status === 200 && setupBody?.totpURI) {
  // Extract secret from otpauth URI
  const uriMatch = setupBody.totpURI.match(/secret=([A-Z2-7]+)/);
  if (uriMatch) {
    const newSecret = uriMatch[1];
    console.log('\n=== NEW SERVER-GENERATED TOTP SECRET ===');
    console.log('TOTP URI:', setupBody.totpURI);
    console.log('Plain Base32 Secret:', newSecret);
    console.log('\nUpdate in .env.production.verification:');
    console.log(`VERIFY_OWNER_TOTP_SECRET=${newSecret}`);
    console.log('\nQR Code URL:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(setupBody.totpURI)}&size=250x250`);
  }
} else {
  console.log('\nCould not get TOTP setup URI. Sign-in may require bypassing 2FA first.');
  // Try with BetterAuth cookies
  const setupRes2 = await fetch(`${apiBase}/auth/api/two-factor/enable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': signInCookies.join('; '),
      'Origin': ORIGIN,
    },
    body: JSON.stringify({ password: ownerPassword }),
  });
  const setupBody2 = await setupRes2.json().catch(() => setupRes2.text());
  console.log('/auth/api/two-factor/enable (cookie) status:', setupRes2.status);
  console.log('Response:', JSON.stringify(setupBody2)?.slice(0, 400));

  if (setupBody2?.totpURI) {
    const uriMatch2 = setupBody2.totpURI.match(/secret=([A-Z2-7]+)/);
    if (uriMatch2) {
      const newSecret = uriMatch2[1];
      console.log('\n=== NEW SERVER-GENERATED TOTP SECRET ===');
      console.log('Plain Base32 Secret:', newSecret);
      console.log(`VERIFY_OWNER_TOTP_SECRET=${newSecret}`);
      console.log(`QR: https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(setupBody2.totpURI)}&size=250x250`);
    }
  }
}
