/**
 * test_gate7_totp.mjs — Gate 7: Admin TOTP 2FA Integration Tests (FR-AUTH-04)
 *
 * Tests:
 *  1. Owner/Admin can call /auth/totp/setup and get a valid secret + QR URL
 *  2. /auth/totp/enable rejects wrong token
 *  3. /auth/totp/enable accepts correct TOTP code and enables 2FA
 *  4. Login with 2FA-enabled account returns requiresTotp=true, not accessToken
 *  5. /auth/totp/verify with correct code returns full accessToken
 *  6. /auth/totp/disable disables 2FA
 *  7. Non-admin/owner cannot setup TOTP
 *
 * ponytail: self-seeding via API — no raw SQL. Cleanup on every run.
 */
import axios from 'axios';
import speakeasy from 'speakeasy';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });

const API_BASE = 'http://localhost:4000';

function getSslConfig() {
  const cs = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (cs && (cs.includes('127.0.0.1') || cs.includes('localhost'))) return false;
  const certPath = path.resolve('supabase-ca.crt');
  if (fs.existsSync(certPath)) return { rejectUnauthorized: true, ca: fs.readFileSync(certPath, 'utf8') };
  return true;
}

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL, ssl: getSslConfig() });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

let passed = 0;
let failed = 0;

function pass(label) { passed++; console.log(`  [PASS] ${label}`); }
function fail(label, err) { failed++; console.error(`  [FAIL] ${label}:`, err?.response?.data || err.message); }

async function main() {
  console.log('=== GATE 7: ADMIN TOTP 2FA TESTS ===');

  const passwordHash = await bcrypt.hash('AdminTest@123', 10);
  const suffix = Date.now();

  // Seed test users
  const adminUser = await prisma.user.upsert({
    where: { mobileNumber: `+9221${suffix}` },
    update: {},
    create: { mobileNumber: `+9221${suffix}`, name: 'TOTP Test Admin', role: 'admin', isActive: true, passwordHash },
  });
  const bizUser = await prisma.user.upsert({
    where: { mobileNumber: `+9222${suffix}` },
    update: {},
    create: { mobileNumber: `+9222${suffix}`, name: 'TOTP Biz User', role: 'business_user', isActive: true, passwordHash },
  });

  // Login admin to get token
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    mobileNumber: `+9221${suffix}`, password: 'AdminTest@123'
  }, { validateStatus: () => true });

  if (loginRes.status !== 200 || !loginRes.data.accessToken) {
    fail('Admin login for TOTP test', { message: `Status ${loginRes.status}, body: ${JSON.stringify(loginRes.data)}` });
    await cleanup(adminUser.id, bizUser.id);
    return;
  }
  const adminToken = loginRes.data.accessToken;
  pass('Admin login without 2FA returns accessToken');

  // Login biz user to get token
  const bizLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    mobileNumber: `+9222${suffix}`, password: 'AdminTest@123'
  }, { validateStatus: () => true });
  const bizToken = bizLoginRes.data.accessToken;

  // Test 1: business_user cannot setup TOTP
  try {
    const r = await axios.post(`${API_BASE}/auth/totp/setup`, {}, {
      headers: { Authorization: `Bearer ${bizToken}` },
      validateStatus: () => true,
    });
    if (r.status === 400) pass('Non-admin TOTP setup rejected (400)');
    else fail('Non-admin TOTP setup rejected', { message: `Got ${r.status}` });
  } catch (e) { fail('Non-admin TOTP setup rejected', e); }

  // Test 2: Admin can setup TOTP
  let totpSecret = null;
  try {
    const r = await axios.post(`${API_BASE}/auth/totp/setup`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: () => true,
    });
    if (r.status === 201 && r.data.secret && r.data.qrDataUrl) {
      totpSecret = r.data.secret;
      pass('Admin TOTP setup returns secret and QR data URL');
    } else {
      fail('Admin TOTP setup', { message: `Status ${r.status}, data: ${JSON.stringify(r.data)}` });
    }
  } catch (e) { fail('Admin TOTP setup', e); }

  if (!totpSecret) {
    console.error('[SKIP] Cannot continue TOTP tests without secret');
    await cleanup(adminUser.id, bizUser.id);
    return;
  }

  // Test 3: Enable with wrong code fails
  try {
    const r = await axios.post(`${API_BASE}/auth/totp/enable`, { token: '000000' }, {
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: () => true,
    });
    if (r.status === 401) pass('Wrong TOTP code rejected on enable (401)');
    else fail('Wrong TOTP code rejected on enable', { message: `Got ${r.status}` });
  } catch (e) { fail('Wrong TOTP code rejected on enable', e); }

  // Test 4: Enable with correct code succeeds
  const correctToken = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
  try {
    const r = await axios.post(`${API_BASE}/auth/totp/enable`, { token: correctToken }, {
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: () => true,
    });
    if (r.status === 201 && r.data.success) pass('TOTP enable succeeds with correct code');
    else fail('TOTP enable succeeds with correct code', { message: `Status ${r.status}, data: ${JSON.stringify(r.data)}` });
  } catch (e) { fail('TOTP enable succeeds with correct code', e); }

  // Test 5: Login after enabling 2FA returns requiresTotp
  let preAuthToken = null;
  try {
    const r = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: `+9221${suffix}`, password: 'AdminTest@123'
    }, { validateStatus: () => true });
    if (r.status === 200 && r.data.requiresTotp === true && r.data.preAuthToken) {
      preAuthToken = r.data.preAuthToken;
      pass('Login with 2FA returns requiresTotp=true and preAuthToken');
    } else {
      fail('Login with 2FA returns requiresTotp=true', { message: `Status ${r.status}, data: ${JSON.stringify(r.data)}` });
    }
  } catch (e) { fail('Login with 2FA returns requiresTotp=true', e); }

  // Test 6: Verify TOTP with pre-auth token returns full accessToken
  if (preAuthToken) {
    // Generate a fresh TOTP code (different window from enable step)
    const verifyToken = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
    try {
      const r = await axios.post(`${API_BASE}/auth/totp/verify`, { token: verifyToken }, {
        headers: { Authorization: `Bearer ${preAuthToken}` },
        validateStatus: () => true,
      });
      if (r.status === 201 && r.data.accessToken) pass('TOTP verify with correct code returns accessToken');
      else fail('TOTP verify with correct code returns accessToken', { message: `Status ${r.status}, data: ${JSON.stringify(r.data)}` });
    } catch (e) { fail('TOTP verify returns accessToken', e); }
  }

  // Test 7: Disable TOTP
  const disableToken = speakeasy.totp({ secret: totpSecret, encoding: 'base32' });
  try {
    const r = await axios.post(`${API_BASE}/auth/totp/disable`, { token: disableToken }, {
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: () => true,
    });
    if (r.status === 201 && r.data.success) pass('TOTP disable succeeds with correct code');
    else fail('TOTP disable succeeds', { message: `Status ${r.status}, data: ${JSON.stringify(r.data)}` });
  } catch (e) { fail('TOTP disable', e); }

  await cleanup(adminUser.id, bizUser.id);

  console.log(`\n=== GATE 7 TOTP TESTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) { process.exitCode = 1; console.error('[FAIL] Gate 7 TOTP tests FAILED'); }
  else console.log('[SUCCESS] Gate 7 TOTP tests PASSED');
}

async function cleanup(adminId, bizId) {
  try {
    await prisma.user.deleteMany({ where: { id: { in: [adminId, bizId] } } });
  } catch (_) {}
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exitCode = 1;
});
