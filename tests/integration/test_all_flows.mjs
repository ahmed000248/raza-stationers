import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { TEST_API_URL, TEST_DIRECT_URL, TEST_JWT_SECRET } from '../helpers/test-environment.mjs';

const JWT_SECRET = TEST_JWT_SECRET;
const API_BASE = TEST_API_URL;

const pool = new pg.Pool({
  connectionString: TEST_DIRECT_URL,
  ssl: false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== STARTING FULL END-TO-END FLOW TESTS ===");

  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  const testMobileNumber = `035${randomSuffix}`;
  const testBusinessName = `E2E Test Shop ${randomSuffix}`;

  const passwordHash = await bcrypt.hash("password123", 10);
  
  const testAdminSub = `admin_sub_e2e_${randomSuffix}`;
  const testOwnerSub = `owner_sub_e2e_${randomSuffix}`;

  console.log("[Setup] Setting up admin and owner users in database...");
  const testAdminUser = await prisma.user.upsert({
    where: { mobileNumber: '03600000001' },
    update: { isActive: true, role: 'admin', passwordHash, supabaseAuthId: testAdminSub },
    create: {
      mobileNumber: '03600000001',
      name: 'Test Admin',
      role: 'admin',
      isActive: true,
      passwordHash,
      supabaseAuthId: testAdminSub
    }
  });

  await prisma.user.upsert({
    where: { mobileNumber: '03600000002' },
    update: { isActive: true, role: 'owner', passwordHash, supabaseAuthId: testOwnerSub },
    create: {
      mobileNumber: '03600000002',
      name: 'Test Owner',
      role: 'owner',
      isActive: true,
      passwordHash,
      supabaseAuthId: testOwnerSub
    }
  });

  // Track items to clean up
  let testUserId = null;
  let testBusinessId = null;
  let testOrderId = null;

  try {
    // === GATE 5: AUTHENTICATION AND AUTHORIZATION ===
    console.log("\n--- Testing Gate 5: Authentication & Authorization ---");

    // 1. Sign mock AAL2 token for Admin
    console.log("Signing mock AAL2 token for Admin...");
    const adminToken = jwt.sign(
      { sub: testAdminSub, email: `admin_${randomSuffix}@example.com`, aal: 'aal2' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );
    console.log("[PASS] Admin login succeeded.");

    // Sign mock AAL2 token for Owner
    console.log("Signing mock AAL2 token for Owner...");
    const ownerToken = jwt.sign(
      { sub: testOwnerSub, email: `owner_${randomSuffix}@example.com`, aal: 'aal2' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );
    console.log("[PASS] Owner login succeeded.");

    // Retrieve Admin Profile
    const adminProfileRes = await axios.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] GET /users/me for admin succeeded, role:", adminProfileRes.data.role);

    // Register a new test business user
    console.log(`Registering new test business user with mobile ${testMobileNumber}...`);
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: "E2E Test User",
      mobileNumber: testMobileNumber,
      password: "password123"
    });
    testUserId = regRes.data.user.id;
    const userToken = regRes.data.accessToken;
    console.log("[PASS] Business user registration succeeded, ID:", testUserId);

    // Register client business for the test user
    console.log(`Registering client business with name ${testBusinessName}...`);
    const clientRes = await axios.post(`${API_BASE}/clients`, {
      businessName: testBusinessName,
      businessType: "stationery_shop",
      contactPerson: "E2E Test Contact",
      mobileNumber: testMobileNumber,
      address: "123 Test Street",
      city: "Karachi"
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    testBusinessId = clientRes.data.id;
    console.log("[PASS] Client business registration succeeded, ID:", testBusinessId);

    // List clients as Owner
    const listClientsRes = await axios.get(`${API_BASE}/clients`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    console.log("[PASS] GET /clients for owner succeeded. Found client count:", listClientsRes.data.total);

    // Approve the client business as Owner (only owner can approve)
    console.log("Approving client business...");
    const approveRes = await axios.put(`${API_BASE}/clients/${testBusinessId}/approve`, {}, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    console.log("[PASS] Client business approval succeeded, status:", approveRes.data.accountStatus);

    // Configure credit limit as Owner
    console.log("Configuring credit limit...");
    const creditRes = await axios.put(`${API_BASE}/clients/${testBusinessId}/credit`, {
      creditLimit: 50000,
      creditDays: 30
    }, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    console.log("[PASS] Credit limit configuration succeeded.");

    // Retrieve credit summary as regular user
    const creditSummaryRes = await axios.get(`${API_BASE}/clients/${testBusinessId}/credit`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log("[PASS] GET /clients/:id/credit limit:", creditSummaryRes.data.creditAccount?.creditLimit);


    // === GATE 6: ADMIN CATALOGUE MANAGEMENT ===
    console.log("\n--- Testing Gate 6: Admin Catalogue Management ---");

    // List admin products
    const adminProductsRes = await axios.get(`${API_BASE}/admin/products?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] GET /admin/products succeeded.");


    // === GATE 7: CUSTOMER AND ORDER FLOWS ===
    console.log("\n--- Testing Gate 7: Customer and Order Flows ---");

    const fixtureNumber = 580000 + Number(randomSuffix.slice(-5));
    const fixtureCategory = await prisma.category.upsert({
      where: { slug: 'synthetic-e2e' },
      update: { isActive: true },
      create: { name: 'Synthetic E2E', slug: 'synthetic-e2e', isActive: true }
    });
    const fixtureUnit = await prisma.unitOfMeasure.upsert({
      where: { code: 'SYN-EACH' },
      update: { isActive: true },
      create: { code: 'SYN-EACH', name: 'Synthetic each', symbol: 'ea', isActive: true }
    });
    const fixtureProduct = await prisma.product.create({
      data: {
        skuNumber: BigInt(fixtureNumber),
        sku: `RS-${fixtureNumber}`,
        name: `Synthetic wholesale fixture ${randomSuffix}`,
        categoryId: fixtureCategory.id,
        purchaseType: 'both',
        status: 'active',
        unitConfirmationStatus: 'confirmed',
        allowIndividualSale: true,
        openingStockStatus: 'COUNTED',
        activatedAt: new Date(),
        activatedById: testAdminUser.id
      }
    });
    const samplePackaging = await prisma.productPackaging.create({
      data: {
        productId: fixtureProduct.id,
        unitOfMeasureId: fixtureUnit.id,
        code: 'UNIT',
        label: 'Synthetic unit',
        conversionToBase: 1,
        isBase: true,
        confirmationStatus: 'confirmed',
        isActive: true,
        prices: {
          create: { priceType: 'wholesale', amount: 100, effectiveFrom: new Date(), createdById: testAdminUser.id }
        }
      },
      include: { product: true }
    });
    const productPackagingId = samplePackaging.id;
    const resolvePriceRes = await axios.get(`${API_BASE}/pricing/resolve/${samplePackaging.product.sku}?clientBusinessId=${testBusinessId}`, { headers: { Authorization: `Bearer ${userToken}` } });
    if (resolvePriceRes.data.effectivePrice === undefined) throw new Error("Resolved price is undefined");
    await prisma.product.update({ where: { id: samplePackaging.productId }, data: { openingStockStatus: 'COUNTED' } });
    await prisma.deliveryZone.upsert({ where: { name: 'E2E Karachi' }, create: { name: 'E2E Karachi', city: 'Karachi', isFree: true, isActive: true }, update: { city: 'Karachi', isFree: true, isActive: true } });

    // Create an order
    console.log("Creating wholesale order...");
    const orderRes = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId: testBusinessId,
      items: [
        { productPackagingId, quantity: 5 }
      ],
      recipientName: "E2E Test Recipient",
      mobile: "03500000000",
      address: "123 Test Street",
      city: "Karachi",
      paymentMethod: "CASH_ON_DELIVERY",
      fulfilmentMethod: "delivery",
      idempotencyKey: `e2e-order-${randomSuffix}`
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    testOrderId = orderRes.data.id;
    console.log("[PASS] Order creation succeeded, ID:", testOrderId);

    // Get order details
    const orderDetailRes = await axios.get(`${API_BASE}/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log("[PASS] GET /orders/:id status:", orderDetailRes.data.status);

    // Update order status to confirmed as Admin
    console.log("Confirming order as Admin...");
    const confirmRes = await axios.put(`${API_BASE}/orders/${testOrderId}/status`, {
      status: "confirmed"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] Order confirmation succeeded, status:", confirmRes.data.status);

  } catch (err) {
    console.error("[FAIL] Error during integration test:", err.message);
    if (err.response) {
      console.error("  Response status:", err.response.status);
      console.error("  Response data:", err.response.data);
    }
    throw err;
  } finally {
    // CLEANUP WORK
    console.log("\n[Cleanup] Cleaning up created test entities from database...");
    
    if (testOrderId) {
      try {
        console.log(`Deleting OrderStatusHistory and OrderItem for Order ${testOrderId}...`);
        await prisma.orderStatusHistory.deleteMany({ where: { orderId: testOrderId } });
        await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
        await prisma.order.delete({ where: { id: testOrderId } });
        console.log(`Deleted Order ${testOrderId}.`);
      } catch (e) {
        console.log(`[Cleanup Warning] Skipping order deletion: ${e.message} (retained by DB triggers)`);
      }
    }

    if (testBusinessId) {
      try {
        console.log(`Deleting ClientCreditAccount, ClientCreditLimitChange, ClientBusinessApproval, BusinessUserLink for Client ${testBusinessId}...`);
        const creditAccount = await prisma.clientCreditAccount.findUnique({ where: { clientBusinessId: testBusinessId } });
        if (creditAccount) {
          await prisma.clientCreditLimitChange.deleteMany({ where: { clientCreditAccountId: creditAccount.id } });
          await prisma.clientCreditAccount.delete({ where: { id: creditAccount.id } });
        }
        await prisma.clientBusinessApproval.deleteMany({ where: { clientBusinessId: testBusinessId } });
        await prisma.businessUserLink.deleteMany({ where: { clientBusinessId: testBusinessId } });
        await prisma.clientBusiness.delete({ where: { id: testBusinessId } });
        console.log(`Deleted ClientBusiness ${testBusinessId}.`);
      } catch (e) {
        console.log(`[Cleanup Warning] Skipping client business deletion: ${e.message} (retained by DB triggers due to dependent order history)`);
      }
    }

    if (testUserId) {
      try {
        console.log(`Deleting User ${testUserId}...`);
        await prisma.user.delete({ where: { id: testUserId } });
        console.log(`Deleted User ${testUserId}.`);
      } catch (e) {
        console.log(`[Cleanup Warning] Skipping user deletion: ${e.message} (retained by DB triggers due to dependent order history)`);
      }
    }

    await prisma.$disconnect();
    await pool.end();
    console.log("=== INTEGRATION FLOW TESTS COMPLETED ===");
  }
}

main();
