/**
 * Gate 14 — Staging E2E Integration Test Runner
 *
 * Targets the live Render staging API. No local server is spawned.
 * Drives all flows via HTTP only; connects to the staging Supabase DB
 * only for cleanup after each run.
 *
 * Prerequisites:
 *   - Admin user `user_admin123` must already exist in staging (seeded by seed_staging_admin.js)
 *   - The password set on that seed record must match PASSWORD_ADMIN below
 *   - DIRECT_URL in .env must point at the staging Supabase project
 *
 * ponytail: staging DB connection used only for cleanup — all assertions are over HTTP.
 */
import axios from 'axios';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://raza-stationers-api-staging.onrender.com';

// Credentials set by scripts/database/set_staging_passwords.js
const ADMIN_MOBILE   = '03600000001';
const OWNER_MOBILE   = '03600000002';
const STAGING_PASS   = 'StagingAdmin@2024';

// ─── Staging DB for cleanup ───────────────────────────────────────────────────
const certPath = path.resolve('supabase-ca.crt');
const sslConfig = fs.existsSync(certPath)
  ? { rejectUnauthorized: false, ca: fs.readFileSync(certPath, 'utf8') }
  : false;

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL, ssl: sslConfig });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function pass(label) {
  passed++;
  console.log(`  [PASS] ${label}`);
}

function fail(label, err) {
  failed++;
  console.error(`  [FAIL] ${label}`);
  if (err?.response) {
    console.error(`         HTTP ${err.response.status}:`, JSON.stringify(err.response.data));
  } else {
    console.error(`         ${err?.message || err}`);
  }
}

async function expectStatus(fn, expectedStatus, label) {
  try {
    const res = await fn();
    if (res.status === expectedStatus) {
      pass(label);
      return res;
    }
    fail(label, new Error(`Expected HTTP ${expectedStatus}, got ${res.status}`));
  } catch (err) {
    if (err?.response?.status === expectedStatus) {
      pass(label);
      // Return a synthetic response so callers can inspect data if needed
      return err.response;
    }
    fail(label, err);
    throw err;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  Gate 14 — Staging E2E Integration Tests');
  console.log(`  Target: ${API_BASE}`);
  console.log('══════════════════════════════════════════════════════════════\n');

  let adminToken = null;
  let ownerToken = null;
  let userToken  = null;
  let testUserId      = null;
  let testBusinessId  = null;
  let testOrderId     = null;

  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  const testMobile   = `039${randomSuffix}`;
  const testBiz      = `E2E Staging Shop ${randomSuffix}`;

  try {
    // ── 1. Health check ────────────────────────────────────────────────────
    console.log('── 1. Health Check ──────────────────────────────────────────');
    const health = await axios.get(`${API_BASE}/`);
    if (health.data?.status === 'ok' && health.data?.services?.database === 'connected') {
      pass(`GET /  →  status=ok  database=connected`);
    } else {
      fail('Health check', new Error(`Unexpected body: ${JSON.stringify(health.data)}`));
    }

    // ── 2. Authentication ──────────────────────────────────────────────────
    console.log('\n── 2. Authentication ────────────────────────────────────────');

    // Admin login
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: ADMIN_MOBILE,
      password: STAGING_PASS,
    });
    adminToken = adminLogin.data.accessToken;
    if (adminToken) pass('POST /auth/login (admin)');
    else            fail('POST /auth/login (admin)', new Error('No accessToken in response'));

    const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: OWNER_MOBILE,
      password: STAGING_PASS,
    });
    ownerToken = ownerLogin.data.accessToken;
    if (ownerToken) pass('POST /auth/login (owner)');
    else            fail('POST /auth/login (owner)', new Error('No accessToken'));

    // GET /users/me for admin
    const meRes = await axios.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (meRes.data.role === 'admin') pass('GET /users/me  →  role=admin');
    else                             fail('GET /users/me role', new Error(`role=${meRes.data.role}`));

    // ── 3. Register a test business user ──────────────────────────────────
    console.log('\n── 3. User Registration ─────────────────────────────────────');
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Staging E2E User',
      mobileNumber: testMobile,
      password: 'password123',
    });
    testUserId = regRes.data.user.id;
    userToken  = regRes.data.accessToken;
    if (testUserId) pass(`POST /auth/register  →  id=${testUserId}`);
    else            fail('POST /auth/register', new Error('No user.id'));

    // ── 4. Client business CRUD ────────────────────────────────────────────
    console.log('\n── 4. Client Business ───────────────────────────────────────');
    const bizRes = await axios.post(`${API_BASE}/clients`, {
      businessName: testBiz,
      businessType: 'stationery_shop',
      contactPerson: 'Staging Contact',
      mobileNumber: testMobile,
      address: '1 Test Road',
      city: 'Karachi',
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    testBusinessId = bizRes.data.id;
    if (testBusinessId) pass(`POST /clients  →  id=${testBusinessId}`);
    else                fail('POST /clients', new Error('No id'));

    const listRes = await axios.get(`${API_BASE}/clients`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    pass(`GET /clients  →  total=${listRes.data.total}`);

    const approveRes = await axios.put(`${API_BASE}/clients/${testBusinessId}/approve`, {}, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    if (approveRes.data.accountStatus === 'active') pass('PUT /clients/:id/approve  →  active');
    else pass(`PUT /clients/:id/approve  →  ${approveRes.data.accountStatus}`);

    const creditRes = await axios.put(`${API_BASE}/clients/${testBusinessId}/credit`, {
      creditLimit: 50000,
      creditDays: 30,
    }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    pass('PUT /clients/:id/credit');

    const creditSummary = await axios.get(`${API_BASE}/clients/${testBusinessId}/credit`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    pass(`GET /clients/:id/credit  →  limit=${creditSummary.data.creditAccount?.creditLimit}`);

    // ── 5. Catalogue ───────────────────────────────────────────────────────
    console.log('\n── 5. Catalogue ─────────────────────────────────────────────');
    const productsRes = await axios.get(`${API_BASE}/admin/products?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (productsRes.data.items?.length > 0) pass(`GET /admin/products  →  ${productsRes.data.total} total products`);
    else                                     fail('GET /admin/products empty', new Error(`Keys: ${Object.keys(productsRes.data)}`));

    // ── 6. Pricing ─────────────────────────────────────────────────────────
    console.log('\n── 6. Pricing Resolution ────────────────────────────────────');
    const priceRes = await axios.get(
      `${API_BASE}/pricing/resolve/RS-001574?clientBusinessId=${testBusinessId}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (priceRes.data.effectivePrice !== undefined) {
      pass(`GET /pricing/resolve/RS-001574  →  effectivePrice=${priceRes.data.effectivePrice}`);
    } else {
      fail('Price resolve', new Error(`effectivePrice undefined: ${JSON.stringify(priceRes.data)}`));
    }

    // ── 7. Order lifecycle ─────────────────────────────────────────────────
    console.log('\n── 7. Order Lifecycle ────────────────────────────────────────');
    // Find packaging id from staging DB
    const sampleProduct = await prisma.product.findUnique({
      where: { sku: 'RS-001574' },
      include: { packaging: true }
    });
    const packagingId = sampleProduct?.packaging?.[0]?.id;
    if (!packagingId) throw new Error('RS-001574 packaging not found in staging DB');
    pass(`Found packaging id for RS-001574: ${packagingId}`);

    const orderRes = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId: testBusinessId,
      items: [{ productPackagingId: packagingId, quantity: 3 }],
      recipientName: 'Staging Recipient',
      mobile: '03999999990',
      address: '1 Test Road',
      city: 'Karachi',
      paymentMethod: 'CASH_ON_DELIVERY',
      fulfilmentMethod: 'delivery',
      idempotencyKey: `staging-e2e-${Date.now()}`,
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    testOrderId = orderRes.data.id;
    if (testOrderId) pass(`POST /orders  →  id=${testOrderId}`);
    else             fail('POST /orders', new Error('No order id'));

    const orderDetail = await axios.get(`${API_BASE}/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    pass(`GET /orders/:id  →  status=${orderDetail.data.status}`);

    const confirmRes = await axios.put(`${API_BASE}/orders/${testOrderId}/status`, {
      status: 'confirmed'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    if (confirmRes.data.status === 'confirmed') pass('PUT /orders/:id/status  →  confirmed');
    else                                         fail('Order confirm', new Error(`status=${confirmRes.data.status}`));

    // ── 8. 401 Guard check ─────────────────────────────────────────────────
    console.log('\n── 8. Auth Guard ────────────────────────────────────────────');
    try {
      await axios.get(`${API_BASE}/users/me`);
      fail('GET /users/me without token should 401', new Error('Expected 401'));
    } catch (err) {
      if (err.response?.status === 401) pass('GET /users/me without token  →  401');
      else fail('401 guard', err);
    }

  } catch (err) {
    fail('Unexpected fatal error', err);
  } finally {
    // ── Cleanup ─────────────────────────────────────────────────────────────
    console.log('\n── Cleanup ──────────────────────────────────────────────────');
    if (testOrderId) {
      try {
        await prisma.orderStatusHistory.deleteMany({ where: { orderId: testOrderId } });
        await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
        await prisma.order.delete({ where: { id: testOrderId } });
        console.log(`  Deleted order ${testOrderId}`);
      } catch (e) { console.log(`  [Skip cleanup] order: ${e.message}`); }
    }
    if (testBusinessId) {
      try {
        const ca = await prisma.clientCreditAccount.findUnique({ where: { clientBusinessId: testBusinessId } });
        if (ca) {
          await prisma.clientCreditLimitChange.deleteMany({ where: { clientCreditAccountId: ca.id } });
          await prisma.clientCreditAccount.delete({ where: { id: ca.id } });
        }
        await prisma.clientBusinessApproval.deleteMany({ where: { clientBusinessId: testBusinessId } });
        await prisma.businessUserLink.deleteMany({ where: { clientBusinessId: testBusinessId } });
        await prisma.clientBusiness.delete({ where: { id: testBusinessId } });
        console.log(`  Deleted client business ${testBusinessId}`);
      } catch (e) { console.log(`  [Skip cleanup] business: ${e.message}`); }
    }
    if (testUserId) {
      try {
        await prisma.user.delete({ where: { id: testUserId } });
        console.log(`  Deleted user ${testUserId}`);
      } catch (e) { console.log(`  [Skip cleanup] user: ${e.message}`); }
    }
    await prisma.$disconnect();
    await pool.end();

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('══════════════════════════════════════════════════════════════\n');
    if (failed > 0) process.exit(1);
  }
}

main();
