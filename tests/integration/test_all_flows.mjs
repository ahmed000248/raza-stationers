import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });

const JWT_SECRET = "raza-stationers-test-secret-1234567890";
const API_BASE = "http://localhost:4000";

function getSslConfig() {
  const certPath = path.resolve('supabase-ca.crt');
  if (fs.existsSync(certPath)) {
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath, 'utf8'),
    };
  }
  return true;
}

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: getSslConfig()
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== STARTING FULL END-TO-END FLOW TESTS ===");

  const randomSuffix = Math.floor(1000000 + Math.random() * 9000000).toString();
  const testMobileNumber = `+929${randomSuffix}`;
  const testBusinessName = `E2E Test Shop ${randomSuffix}`;

  const passwordHash = await bcrypt.hash("password123", 10);
  
  // 1. Setup/Ensure test users in DB
  console.log("[Setup] Setting up admin and owner users in database...");
  await prisma.user.upsert({
    where: { id: 'user_admin123' },
    update: { isActive: true, role: 'admin', passwordHash },
    create: {
      id: 'user_admin123',
      mobileNumber: '+920000000001',
      name: 'Test Admin',
      role: 'admin',
      isActive: true,
      passwordHash
    }
  });

  await prisma.user.upsert({
    where: { id: 'user_owner123' },
    update: { isActive: true, role: 'owner', passwordHash },
    create: {
      id: 'user_owner123',
      mobileNumber: '+920000000002',
      name: 'Test Owner',
      role: 'owner',
      isActive: true,
      passwordHash
    }
  });

  // Track items to clean up
  let testUserId = null;
  let testBusinessId = null;
  let testOrderId = null;

  try {
    // === GATE 5: AUTHENTICATION AND AUTHORIZATION ===
    console.log("\n--- Testing Gate 5: Authentication & Authorization ---");

    // Login as Admin
    console.log("Logging in as Admin...");
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: "+920000000001",
      password: "password123"
    });
    const adminToken = adminLoginRes.data.accessToken;
    console.log("[PASS] Admin login succeeded.");

    // Login as Owner
    console.log("Logging in as Owner...");
    const ownerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: "+920000000002",
      password: "password123"
    });
    const ownerToken = ownerLoginRes.data.accessToken;
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

    // Resolve wholesale price for sample product SKU RS-001574
    console.log("Resolving price for product RS-001574...");
    const resolvePriceRes = await axios.get(`${API_BASE}/pricing/resolve/RS-001574?clientBusinessId=${testBusinessId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log("[PASS] Resolved price:", resolvePriceRes.data.price);

    // Find sample product packaging in DB
    const sampleProduct = await prisma.product.findUnique({
      where: { sku: "RS-001574" },
      include: { packaging: true }
    });
    const productPackagingId = sampleProduct?.packaging?.[0]?.id;
    if (!productPackagingId) {
      throw new Error("Could not find packaging for RS-001574");
    }

    // Create an order
    console.log("Creating wholesale order...");
    const orderRes = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId: testBusinessId,
      items: [
        { productPackagingId, quantity: 5 }
      ],
      recipientName: "E2E Test Recipient",
      mobile: "+929999999999",
      address: "123 Test Street",
      city: "Karachi",
      paymentMethod: "cash"
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
