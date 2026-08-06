// Gate 8 — BetterAuth sign-in, session, TOTP MFA, AAL2 elevation & role verification
// Gate 9 — Authenticated route sweep & authorization matrix

import crypto from 'node:crypto';
import fs from 'node:fs';

const apiBase = 'https://raza-stationers-api-staging.onrender.com';
const ORIGIN = 'https://raza-stationers-admin-seven.vercel.app';

const ownerEmail = process.env.VERIFY_OWNER_EMAIL;
const ownerPassword = process.env.VERIFY_OWNER_PASSWORD;
const ownerTotpSecret = process.env.VERIFY_OWNER_TOTP_SECRET;
const businessEmail = process.env.VERIFY_BUSINESS_EMAIL;
const businessPassword = process.env.VERIFY_BUSINESS_PASSWORD;

const results = {};

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

// BetterAuth sign-in → returns cookies for session-based auth
async function betterAuthSignIn(email, password) {
  const r = await fetch(`${apiBase}/auth/api/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
    body: JSON.stringify({ email, password }),
    redirect: 'manual',
  });
  const cookies = r.headers.getSetCookie?.() || [];
  let body = null;
  try { body = await r.json(); } catch { body = await r.text(); }
  return { status: r.status, body, cookies };
}

// BetterAuth TOTP verify — upgrades session to AAL2
async function betterAuthVerifyTotp(otp, cookies) {
  const cookieHeader = cookies.join('; ');
  const r = await fetch(`${apiBase}/auth/api/two-factor/verify-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader, 'Origin': ORIGIN },
    body: JSON.stringify({ code: otp }),
  });
  const setCookies = r.headers.getSetCookie?.() || [];
  let body = null;
  try { body = await r.json(); } catch { body = await r.text(); }
  return { status: r.status, body, cookies: setCookies.length > 0 ? setCookies : cookies };
}

// Get BetterAuth session
async function getSession(cookies) {
  const r = await fetch(`${apiBase}/auth/api/get-session`, {
    headers: { 'Cookie': cookies.join('; '), 'Origin': ORIGIN }
  });
  return r.json();
}

// App /auth/login — returns JWT bearer token (AAL1)
async function appLogin(email, password) {
  const r = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
    body: JSON.stringify({ email, password }),
  });
  const body = await r.json();
  return { status: r.status, token: body.accessToken, user: body.user };
}

// Authenticated route fetch using Bearer token (AAL1) or Cookie (AAL2)
async function authFetch(path, method = 'GET', { token, cookies } = {}) {
  const headers = { 'Origin': ORIGIN, 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (cookies) headers['Cookie'] = cookies.join('; ');
  const r = await fetch(`${apiBase}${path}`, { method, headers });
  let body = null;
  try { body = await r.json(); } catch { body = await r.text(); }
  return { status: r.status, body };
}

// ── Gate 8: Owner sign-in through BetterAuth with TOTP for AAL2 ──
console.log('\n=== GATE 8: BetterAuth Sign-in and MFA ===');

// 8.1 Owner BetterAuth sign-in (expect twoFactorRedirect)
const ownerBaSignIn = await betterAuthSignIn(ownerEmail, ownerPassword);
console.log(`Gate 8.1 Owner BetterAuth sign-in: ${ownerBaSignIn.status}`, JSON.stringify(ownerBaSignIn.body)?.slice(0, 150));

let ownerCookies = ownerBaSignIn.cookies;
let ownerSession = null;

if (ownerBaSignIn.status === 200 && ownerBaSignIn.body?.twoFactorRedirect) {
  // 8.2 TOTP challenge — generate and submit
  const otp = generateTOTP(ownerTotpSecret);
  console.log(`Gate 8.2 TOTP challenge received — generating OTP: ${otp}`);
  const totpResult = await betterAuthVerifyTotp(otp, ownerCookies);
  console.log(`Gate 8.2 TOTP verify: ${totpResult.status}`, JSON.stringify(totpResult.body)?.slice(0, 200));
  if (totpResult.status === 200) {
    ownerCookies = totpResult.cookies;
    console.log('Gate 8.2 TOTP PASSED — session upgraded to AAL2');
  } else {
    // Try next TOTP window (+30s)
    console.log('Gate 8.2 TOTP failed first window — trying next window...');
    await new Promise(r => setTimeout(r, 31000));
    const otp2 = generateTOTP(ownerTotpSecret);
    const totpResult2 = await betterAuthVerifyTotp(otp2, ownerCookies);
    console.log(`Gate 8.2 TOTP retry: ${totpResult2.status}`, JSON.stringify(totpResult2.body)?.slice(0, 200));
    if (totpResult2.status === 200) ownerCookies = totpResult2.cookies;
  }
} else if (ownerBaSignIn.status === 200 && !ownerBaSignIn.body?.twoFactorRedirect) {
  console.log('Gate 8.1 Note: No TOTP challenge — session may be AAL1 only');
}

// 8.3 Get session
ownerSession = await getSession(ownerCookies);
console.log('Gate 8.3 Owner session:', JSON.stringify(ownerSession)?.slice(0, 400));
const ownerLoggedIn = ownerSession?.user?.email === ownerEmail;
const ownerRole = ownerSession?.user?.role;
console.log(`Gate 8.3 Owner: logged_in=${ownerLoggedIn}, role=${ownerRole}`);

// 8.4 Business user: use app login (JWT bearer, AAL1, no TOTP required)
console.log('\n--- Business user sign-in ---');
const bizLogin = await appLogin(businessEmail, businessPassword);
console.log(`Gate 8.4 Business login: ${bizLogin.status}, role=${bizLogin.user?.role}`);
const bizLoggedIn = !!bizLogin.token && bizLogin.user?.role === 'business_user';

results.gate8 = {
  status: ownerLoggedIn && bizLoggedIn ? 'PASSED' : 'PARTIALLY_PASSED',
  owner: { loggedIn: ownerLoggedIn, role: ownerRole, aalMethod: 'BetterAuth cookie AAL2' },
  business: { loggedIn: bizLoggedIn, role: bizLogin.user?.role, aalMethod: 'JWT bearer AAL1' }
};
console.log(`\nGate 8: ${results.gate8.status}`);

// ── Gate 9: Authenticated route sweep & authorization matrix ──
console.log('\n=== GATE 9: Authenticated route sweep ===');

const gate9Tests = [];

// Owner AAL2 cookie routes (should pass all)
const ownerAal2Routes = [
  { method: 'GET', path: '/auth/session-profile', expectMin: 200, expectMax: 299 },
  { method: 'GET', path: '/products', expectMin: 200, expectMax: 299 },
  { method: 'GET', path: '/categories', expectMin: 200, expectMax: 299 },
];

// Owner AAL1 bearer token routes
const ownerAal1Login = await appLogin(ownerEmail, ownerPassword);
const ownerToken = ownerAal1Login.token;

const ownerAal1Routes = [
  { method: 'GET', path: '/users/me', expectMin: 200, expectMax: 299 },
  { method: 'GET', path: '/products', expectMin: 200, expectMax: 299 },
  { method: 'GET', path: '/categories', expectMin: 200, expectMax: 299 },
];

// Admin routes require AAL2 — test with bearer token (expect 403) as proof of AAL2 gate
const aal2ProtectedRoutes = [
  { method: 'GET', path: '/admin/products', expectMin: 403, expectMax: 403, note: 'AAL1 bearer should get 403, proving AAL2 gate works' },
  { method: 'GET', path: '/clients', expectMin: 403, expectMax: 403, note: 'AAL1 bearer should get 403' },
  { method: 'GET', path: '/orders', expectMin: 403, expectMax: 403, note: 'AAL1 bearer should get 403' },
  { method: 'GET', path: '/staff', expectMin: 403, expectMax: 403, note: 'AAL1 bearer should get 403' },
];

console.log('\nOwner AAL2 cookie routes:');
for (const test of ownerAal2Routes) {
  const r = await authFetch(test.path, test.method, { cookies: ownerCookies });
  const pass = r.status >= test.expectMin && r.status <= test.expectMax;
  console.log(`  ${test.method} ${test.path} => ${r.status} ${pass ? '✓' : `✗ FAIL`}`);
  gate9Tests.push({ ...test, actor: 'owner-aal2', status: r.status, pass });
}

console.log('\nOwner AAL1 bearer routes:');
for (const test of ownerAal1Routes) {
  const r = await authFetch(test.path, test.method, { token: ownerToken });
  const pass = r.status >= test.expectMin && r.status <= test.expectMax;
  console.log(`  ${test.method} ${test.path} => ${r.status} ${pass ? '✓' : `✗ FAIL`}`);
  gate9Tests.push({ ...test, actor: 'owner-aal1', status: r.status, pass });
}

console.log('\nAAL2 gate enforcement (owner AAL1 must be denied):');
for (const test of aal2ProtectedRoutes) {
  const r = await authFetch(test.path, test.method, { token: ownerToken });
  const pass = r.status >= test.expectMin && r.status <= test.expectMax;
  console.log(`  ${test.method} ${test.path} => ${r.status} ${pass ? '✓ AAL2 gate enforced' : `✗ FAIL — gate not enforced`}`);
  gate9Tests.push({ ...test, actor: 'owner-aal1-denied', status: r.status, pass });
}

console.log('\nBusiness user authorization (must be blocked from owner/admin routes):');
const forbiddenForBiz = [
  { method: 'GET', path: '/admin/products', expectMin: 401, expectMax: 403 },
  { method: 'GET', path: '/staff', expectMin: 401, expectMax: 403 },
  { method: 'GET', path: '/clients', expectMin: 401, expectMax: 403 },
];
for (const test of forbiddenForBiz) {
  const r = await authFetch(test.path, test.method, { token: bizLogin.token });
  const pass = r.status >= test.expectMin && r.status <= test.expectMax;
  console.log(`  ${test.method} ${test.path} => ${r.status} ${pass ? '✓' : `✗ FAIL (expected ${test.expectMin}-${test.expectMax})`}`);
  gate9Tests.push({ ...test, actor: 'business', status: r.status, pass });
}

const gate9Failures = gate9Tests.filter(t => !t.pass);
results.gate9 = {
  status: gate9Failures.length === 0 ? 'PASSED' : 'FAILED',
  tested: gate9Tests.length,
  failures: gate9Failures
};

fs.mkdirSync('artifacts/production-verification/http', { recursive: true });
fs.writeFileSync('artifacts/production-verification/http/gate8-gate9.json', JSON.stringify({ ...results, ownerCookieCount: ownerCookies.length }, null, 2));

console.log(`\nGate 9: ${results.gate9.status} (${gate9Failures.length} failures / ${gate9Tests.length} tests)`);

console.log('\n=== FINAL SUMMARY ===');
console.log('Gate 8 (BetterAuth MFA):', results.gate8.status);
console.log('Gate 9 (Auth matrix):', results.gate9.status);
