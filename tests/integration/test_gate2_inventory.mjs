import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import { execSync } from 'child_process';
import assert from 'assert';

dotenv.config({ path: path.resolve('.env') });

const API_BASE = "http://localhost:4000";
const schemaName = 'public';

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

// Connect to the disposable schema
let connectionString = process.env.DIRECT_URL;
if (connectionString.includes('schema=')) {
  connectionString = connectionString.replace(/schema=[^&]*/, `schema=${schemaName}`);
} else {
  connectionString += (connectionString.includes('?') ? '&' : '?') + `schema=${schemaName}`;
}
connectionString += `&options=-c%20search_path%3D${schemaName}`;
const pool = new pg.Pool({
  connectionString,
  ssl: getSslConfig(),
});

const originalConnect = pool.connect.bind(pool);
pool.connect = (async (callback) => {
  if (callback) {
    originalConnect(async (err, client, release) => {
      if (err) return callback(err);
      try {
        if (!client._searchPathSet) {
          await client.query(`SET search_path TO "${schemaName}", public`);
          client._searchPathSet = true;
        }
        callback(null, client, release);
      } catch (queryErr) {
        release();
        callback(queryErr);
      }
    });
    return;
  }

  const client = await originalConnect();
  if (!client._searchPathSet) {
    await client.query(`SET search_path TO "${schemaName}", public`);
    client._searchPathSet = true;
  }
  return client;
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== STARTING GATE 2 INVENTORY FOUNDATION TESTS ===");

  try {
    // 1. Log in as admin
    console.log("Logging in as Admin...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: "+920000000001",
      password: "password123"
    });
    const adminToken = loginRes.data.accessToken;
    console.log("[PASS] Admin login succeeded.");

    // Log in as Owner to approve the business user/client
    console.log("Logging in as Owner...");
    const ownerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: "+920000000002",
      password: "password123"
    });
    const ownerToken = ownerLoginRes.data.accessToken;

    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000).toString();
    const testMobile = `+929${randomSuffix}`;
    const testBusinessName = `Gate 2 Test Shop ${randomSuffix}`;

    console.log(`Registering test business user: ${testMobile}...`);
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: "Gate 2 Test User",
      mobileNumber: testMobile,
      password: "password123"
    });
    const userToken = regRes.data.accessToken;

    console.log("Registering client business...");
    const clientRes = await axios.post(`${API_BASE}/clients`, {
      businessName: testBusinessName,
      businessType: "stationery_shop",
      contactPerson: "Gate 2 Contact",
      mobileNumber: testMobile,
      address: "Gate 2 Street",
      city: "Karachi"
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const clientBusinessId = clientRes.data.id;

    console.log("Approving client business...");
    await axios.put(`${API_BASE}/clients/${clientBusinessId}/approve`, {}, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });

    // Get a product packaging ID
    const packaging = await prisma.productPackaging.findFirst({
      where: { isActive: true },
      include: { product: true }
    });
    if (!packaging) throw new Error("No active product packaging found for order testing");

    // --- TEST CASE 1: DEMO MODE ORDER PLACEMENT ---
    console.log("TEST CASE 1: Placing order in DEMO mode...");
    // Force settings to DEMO first
    await prisma.businessSettings.upsert({
      where: { id: 'test_settings' },
      create: { id: 'test_settings', inventoryMode: 'DEMO' },
      update: { inventoryMode: 'DEMO' }
    });

    const orderRes1 = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId,
      items: [{ productPackagingId: packaging.id, quantity: 2 }],
      recipientName: "Test Recipient",
      mobile: "03001234567",
      address: "Test Address, Karachi",
      city: "Karachi"
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    assert.strictEqual(orderRes1.status, 201);
    assert.strictEqual(orderRes1.data.isDemo, true, "Order placed in DEMO mode must be tagged with isDemo: true");
    console.log("[PASS] DEMO mode order placed and tagged isDemo: true successfully.");

    // --- TEST CASE 2: DEMO COMPLETE CLI DRY-RUN ---
    console.log("TEST CASE 2: Running demo:complete in dry-run mode...");
    const dryRunOutput = execSync(`node scripts/database/demo_complete.js`, {
      env: { ...process.env, DIRECT_URL: connectionString, DATABASE_URL: connectionString },
      encoding: 'utf8'
    });
    assert.ok(dryRunOutput.includes('Dry-run Mode:      true'));
    assert.ok(dryRunOutput.includes('WARNING: This is a DRY-RUN'));
    
    // Verify settings still in DEMO
    const settingsAfterDry = await prisma.businessSettings.findFirst();
    assert.strictEqual(settingsAfterDry.inventoryMode, 'DEMO', "Dry-run must not modify settings");
    console.log("[PASS] Dry-run does not write changes to database.");

    // --- TEST CASE 3: DEMO COMPLETE CLI EXECUTION ---
    console.log("TEST CASE 3: Running demo:complete with --confirm...");
    const confirmOutput = execSync(`node scripts/database/demo_complete.js --confirm`, {
      env: { ...process.env, DIRECT_URL: connectionString, DATABASE_URL: connectionString },
      encoding: 'utf8'
    });
    assert.ok(confirmOutput.includes('Dry-run Mode:      false'));
    assert.ok(confirmOutput.includes('[SUCCESS] System switched to LIVE mode successfully.'));

    // Verify settings switched to LIVE
    const settingsAfterConfirm = await prisma.businessSettings.findFirst();
    assert.strictEqual(settingsAfterConfirm.inventoryMode, 'LIVE', "Settings must switch to LIVE");

    // Verify audit log exists
    const auditLogs = await prisma.auditLog.findMany({
      where: { action: 'INVENTORY_MODE_TRANSITION' }
    });
    assert.strictEqual(auditLogs.length, 1, "An audit log entry must be created");
    assert.strictEqual(auditLogs[0].afterData.inventoryMode, 'LIVE');
    console.log("[PASS] transition to LIVE and audit log write succeeded.");

    // --- TEST CASE 4: LIVE MODE ORDER BLOCKED BY UNCOUNTED STOCK ---
    console.log("TEST CASE 4: Placing order in LIVE mode for uncounted stock...");
    // Ensure product is marked NOT_COUNTED
    await prisma.product.update({
      where: { id: packaging.productId },
      data: { openingStockStatus: 'NOT_COUNTED' }
    });

    try {
      await axios.post(`${API_BASE}/orders`, {
        clientBusinessId,
        items: [{ productPackagingId: packaging.id, quantity: 2 }],
        recipientName: "Test Recipient",
        mobile: "03001234567",
        address: "Test Address, Karachi",
        city: "Karachi"
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert.fail("Should have thrown 400 for uncounted stock in LIVE mode");
    } catch (err) {
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.message.includes("uncounted opening stock"), "Error must reference uncounted opening stock");
      console.log("[PASS] Uncounted stock correctly blocked in LIVE mode.");
    }

    // --- TEST CASE 5: LIVE MODE ORDER BLOCKED BY ZERO AVAILABLE STOCK ---
    console.log("TEST CASE 5: Placing order in LIVE mode with zero stock...");
    // Mark product counted, but ensure available stock is 0
    await prisma.product.update({
      where: { id: packaging.productId },
      data: { openingStockStatus: 'COUNTED' }
    });
    
    // Ensure StockLocation exists to satisfy FK constraint
    await prisma.stockLocation.upsert({
      where: { id: 'cms9ict6g02ynowgac24fnny' },
      create: { id: 'cms9ict6g02ynowgac24fnny', code: 'WH-MAIN', name: 'Main Warehouse', isActive: true },
      update: { isActive: true }
    });

    await prisma.stockBalance.upsert({
      where: { productId_stockLocationId: { productId: packaging.productId, stockLocationId: 'cms9ict6g02ynowgac24fnny' } }, // default seeded location
      create: { productId: packaging.productId, stockLocationId: 'cms9ict6g02ynowgac24fnny', onHandQuantity: 0, reservedQuantity: 0 },
      update: { onHandQuantity: 0, reservedQuantity: 0 }
    });

    try {
      await axios.post(`${API_BASE}/orders`, {
        clientBusinessId,
        items: [{ productPackagingId: packaging.id, quantity: 2 }],
        recipientName: "Test Recipient",
        mobile: "03001234567",
        address: "Test Address, Karachi",
        city: "Karachi"
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert.fail("Should have thrown 400 for out of stock in LIVE mode");
    } catch (err) {
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.message.includes("Out of Stock"), "Error must reference Out of Stock");
      console.log("[PASS] Out of stock correctly blocked in LIVE mode.");
    }

    // --- TEST CASE 6: LIVE MODE SUCCESS WITH STOCK ---
    console.log("TEST CASE 6: Placing order in LIVE mode with sufficient stock...");
    await prisma.stockBalance.updateMany({
      where: { productId: packaging.productId },
      data: { onHandQuantity: 100, reservedQuantity: 0 }
    });

    const orderRes3 = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId,
      items: [{ productPackagingId: packaging.id, quantity: 2 }],
      recipientName: "Test Recipient",
      mobile: "03001234567",
      address: "Test Address, Karachi",
      city: "Karachi"
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(orderRes3.status, 201);
    assert.strictEqual(orderRes3.data.isDemo, false, "LIVE order must have isDemo: false");
    console.log("[PASS] LIVE order placed successfully with stock.");

    console.log("=== ALL GATE 2 INVENTORY FOUNDATION TESTS PASSED ===");

  } catch (err) {
    console.error("--- GATE 2 INVENTORY FOUNDATION TESTS FAILED ---");
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
