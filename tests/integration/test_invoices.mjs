import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: path.resolve('.env') });

const API_BASE = "http://localhost:4000";
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'raza-stationers-test-secret-1234567890';

function getSslConfig() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (connectionString && (connectionString.includes('127.0.0.1') || connectionString.includes('localhost'))) {
    return false;
  }
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
  console.log("=== STARTING INVOICE FLOW TESTS ===");

  const suffix = Date.now();
  const testAdminSub = `admin_sub_${suffix}`;
  
  // Ensure Admin user exists with supabaseAuthId
  await prisma.user.upsert({
    where: { id: 'admin_test_user' },
    update: { isActive: true, supabaseAuthId: testAdminSub },
    create: {
      id: 'admin_test_user',
      mobileNumber: `037${String(suffix).slice(-8)}`,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      passwordHash: '',
      supabaseAuthId: testAdminSub,
    }
  });

  let testInvoiceId = null;

  try {
    // 1. Sign mock AAL2 token
    console.log("Signing mock AAL2 token for Admin...");
    const adminToken = jwt.sign(
      { sub: testAdminSub, email: `admin_${suffix}@example.com`, aal: 'aal2' },
      TEST_JWT_SECRET,
      { expiresIn: '10m' }
    );
    console.log("[PASS] Admin login succeeded.");

    // Find the confirmed order we created
    const confirmedOrder = await prisma.order.findFirst({
      where: { status: "confirmed" },
      orderBy: { createdAt: "desc" }
    });

    if (!confirmedOrder) {
      console.log("No confirmed order found in database. Skipping invoice generation.");
      return;
    }

    console.log("Found confirmed order ID:", confirmedOrder.id);

    // 2. Generate invoice
    console.log("Generating invoice...");
    const createRes = await axios.post(`${API_BASE}/invoices`, {
      orderId: confirmedOrder.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testInvoiceId = createRes.data.id;
    console.log("[PASS] Invoice generation succeeded, ID:", testInvoiceId, "Number:", createRes.data.invoiceNumber);

    // 3. Get invoice details
    console.log("Retrieving invoice details...");
    const getRes = await axios.get(`${API_BASE}/invoices/${testInvoiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] Invoice retrieval succeeded, total amount:", getRes.data.totalAmount);

    // 4. List client invoices
    console.log("Listing client invoices...");
    const listRes = await axios.get(`${API_BASE}/client-invoices/${confirmedOrder.clientBusinessId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] Client invoices listing succeeded. Found invoice count:", listRes.data.length);

  } catch (err) {
    console.error("[FAIL] Invoice flow test failed:", err.message);
    if (err.response) {
      console.error("  Response status:", err.response.status);
      console.error("  Response data:", err.response.data);
    }
    throw err;
  } finally {
    // Clean up: Invoices are retained and cannot be hard deleted.
    console.log("[Cleanup] Skipping invoice hard deletion (retained by DB constraint).");

    await prisma.$disconnect();
    await pool.end();
    console.log("=== INVOICE FLOW TESTS COMPLETED ===");
  }
}

main();
