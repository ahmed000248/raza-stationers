/**
 * test_supabase_auth.mjs — Integration tests for Supabase Authentication in NestJS.
 */
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });

const API_BASE = 'http://localhost:4000';
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'raza-stationers-test-secret-1234567890';

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
  console.log('=== INTEGRATION: SUPABASE AUTHENTICATION TESTS ===');

  const suffix = Date.now();
  const mobileSuffix = String(suffix).slice(-8);
  const testSub1 = `supabase_sub_1_${suffix}`;
  const testSub2 = `supabase_sub_2_${suffix}`;
  const testSubAdmin = `supabase_sub_admin_${suffix}`;

  // 1. Sign a mock Supabase token for a new user registration (sub1)
  const regToken = jwt.sign(
    { sub: testSub1, email: `customer1_${suffix}@example.com`, aal: 'aal1' },
    TEST_JWT_SECRET,
    { expiresIn: '10m' }
  );

  // Test register-supabase endpoint
  try {
    const res = await axios.post(
      `${API_BASE}/auth/register-supabase`,
      { name: 'Supabase User 1', mobileNumber: `030${mobileSuffix}` },
      {
        headers: { Authorization: `Bearer ${regToken}` },
        validateStatus: () => true,
      }
    );
    if (res.status === 201) {
      pass('register-supabase successfully registers a new user');
    } else {
      fail('register-supabase registration failed', { message: `Status ${res.status}, data: ${JSON.stringify(res.data)}` });
    }
  } catch (e) {
    fail('register-supabase registration', e);
  }

  // Test conflict validation: duplicate registration attempt with same sub
  try {
    const res = await axios.post(
      `${API_BASE}/auth/register-supabase`,
      { name: 'Supabase User 1 Clone', mobileNumber: `031${mobileSuffix}` },
      {
        headers: { Authorization: `Bearer ${regToken}` },
        validateStatus: () => true,
      }
    );
    if (res.status === 409) {
      pass('register-supabase prevents duplicate registration of same Supabase sub (409)');
    } else {
      fail('register-supabase did not reject duplicate sub', { message: `Status ${res.status}` });
    }
  } catch (e) {
    fail('register-supabase duplicate sub check', e);
  }

  // Test invalid token signature rejection
  try {
    const badToken = jwt.sign(
      { sub: testSub2, email: 'bad@example.com' },
      'wrong-secret-key-12345',
      { expiresIn: '10m' }
    );
    const res = await axios.post(
      `${API_BASE}/auth/register-supabase`,
      { name: 'Supabase User 2', mobileNumber: `032${mobileSuffix}` },
      {
        headers: { Authorization: `Bearer ${badToken}` },
        validateStatus: () => true,
      }
    );
    if (res.status === 401) {
      pass('register-supabase rejects malformed/invalid token signature (401)');
    } else {
      fail('register-supabase did not reject invalid token', { message: `Status ${res.status}` });
    }
  } catch (e) {
    fail('register-supabase invalid token check', e);
  }

  // Test account linking (create a legacy user first)
  const legacyPassHash = '$2a$10$abcdefghijklmnopqrstuv'; // placeholder hash
  const legacyUser = await prisma.user.create({
    data: {
      name: 'Legacy User',
      mobileNumber: `033${mobileSuffix}`,
      passwordHash: legacyPassHash,
      role: 'business_user',
    },
  });

  // Generate legacy access token for API calling
  const legacyToken = jwt.sign(
    { sub: legacyUser.id, mobileNumber: legacyUser.mobileNumber, role: legacyUser.role },
    TEST_JWT_SECRET,
    { expiresIn: '10m' }
  );

  const supabaseLinkToken = jwt.sign(
    { sub: testSub2, email: `linked_${suffix}@example.com`, aal: 'aal1' },
    TEST_JWT_SECRET,
    { expiresIn: '10m' }
  );

  try {
    const res = await axios.post(
      `${API_BASE}/auth/link`,
      { supabaseToken: supabaseLinkToken },
      {
        headers: { Authorization: `Bearer ${legacyToken}` },
        validateStatus: () => true,
      }
    );
    if (res.status === 201 && res.data.success) {
      pass('Account linking successfully links legacy account to Supabase sub');
    } else {
      fail('Account linking failed', { message: `Status ${res.status}, data: ${JSON.stringify(res.data)}` });
    }
  } catch (e) {
    fail('Account linking', e);
  }

  // Verify link conflict prevention (cannot link to already linked Supabase account)
  try {
    const res = await axios.post(
      `${API_BASE}/auth/link`,
      { supabaseToken: supabaseLinkToken },
      {
        headers: { Authorization: `Bearer ${legacyToken}` },
        validateStatus: () => true,
      }
    );
    if (res.status === 400 || res.status === 409) {
      pass('Account linking prevents linking an already linked account');
    } else {
      fail('Account linking allowed duplicate link', { message: `Status ${res.status}` });
    }
  } catch (e) {
    fail('Account linking duplicate check', e);
  }

  // Enforce roles & AAL2 tests for administrators
  // Create an admin user linked to testSubAdmin in DB
  const adminUser = await prisma.user.create({
    data: {
      name: 'Supabase Admin',
      mobileNumber: `034${mobileSuffix}`,
      role: 'owner',
      supabaseAuthId: testSubAdmin,
      passwordHash: '',
    },
  });

  // Call GET /settings (requires owner role)
  // Scenario A: Admin token has AAL1
  const adminAal1Token = jwt.sign(
    { sub: testSubAdmin, email: `admin_${suffix}@example.com`, aal: 'aal1' },
    TEST_JWT_SECRET,
    { expiresIn: '10m' }
  );

  try {
    const res = await axios.get(
      `${API_BASE}/settings`,
      {
        headers: { Authorization: `Bearer ${adminAal1Token}` },
        validateStatus: () => true,
      }
    );
    if (res.status === 403) {
      pass('Admin route rejects AAL1 Supabase sessions (403)');
    } else {
      fail('Admin route did not reject AAL1 session', { message: `Status ${res.status}, data: ${JSON.stringify(res.data)}` });
    }
  } catch (e) {
    fail('Admin AAL1 check', e);
  }

  // Scenario B: Admin token has AAL2
  const adminAal2Token = jwt.sign(
    { sub: testSubAdmin, email: `admin_${suffix}@example.com`, aal: 'aal2' },
    TEST_JWT_SECRET,
    { expiresIn: '10m' }
  );

  try {
    const res = await axios.get(
      `${API_BASE}/settings`,
      {
        headers: { Authorization: `Bearer ${adminAal2Token}` },
        validateStatus: () => true,
      }
    );
    if (res.status === 200) {
      pass('Admin route accepts AAL2 Supabase sessions (200)');
    } else {
      fail('Admin route rejected AAL2 session', { message: `Status ${res.status}, data: ${JSON.stringify(res.data)}` });
    }
  } catch (e) {
    fail('Admin AAL2 check', e);
  }

  // Audited identities are intentionally retained until the disposable database is destroyed.

  await prisma.$disconnect();
  await pool.end();

  console.log(`\n=== SUPABASE AUTH TESTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exitCode = 1;
    console.error('[FAIL] Supabase Authentication tests FAILED');
  } else {
    console.log('[SUCCESS] Supabase Authentication tests PASSED');
  }
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exitCode = 1;
});
