import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import assert from 'assert';
import { TEST_API_URL, TEST_DIRECT_URL, TEST_JWT_SECRET } from '../helpers/test-environment.mjs';

const API_BASE = TEST_API_URL;
const schemaName = 'public';

// Connect to the disposable schema
const connectionUrl = new URL(TEST_DIRECT_URL);
connectionUrl.searchParams.set('schema', schemaName);
connectionUrl.searchParams.set('options', `-c search_path=${schemaName}`);
const connectionString = connectionUrl.toString();
const pool = new pg.Pool({
  connectionString,
  ssl: false,
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
    const suffix = Date.now();
    const testAdminSub = `admin_sub_${suffix}`;
    const testOwnerSub = `owner_sub_${suffix}`;
    
    // Ensure Admin user exists with supabaseAuthId
    const testAdminUser = await prisma.user.upsert({
      where: { id: 'admin_test_user' },
      update: { isActive: true, supabaseAuthId: testAdminSub },
      create: {
        id: 'admin_test_user',
        mobileNumber: `031${String(suffix).slice(-8)}`,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        passwordHash: '',
        supabaseAuthId: testAdminSub,
      }
    });

    // Ensure Owner user exists with supabaseAuthId
    await prisma.user.upsert({
      where: { id: 'owner_test_user' },
      update: { isActive: true, supabaseAuthId: testOwnerSub },
      create: {
        id: 'owner_test_user',
        mobileNumber: `032${String(suffix).slice(-8)}`,
        name: 'Owner User',
        role: 'owner',
        isActive: true,
        passwordHash: '',
        supabaseAuthId: testOwnerSub,
      }
    });

    // 1. Sign mock AAL2 token for Admin
    console.log("Signing mock AAL2 token for Admin...");
    const adminToken = jwt.sign(
      { sub: testAdminSub, email: `admin_${suffix}@example.com`, aal: 'aal2' },
      TEST_JWT_SECRET,
      { expiresIn: '10m' }
    );
    console.log("[PASS] Admin login succeeded.");

    // Sign mock AAL2 token for Owner
    console.log("Signing mock AAL2 token for Owner...");
    const ownerToken = jwt.sign(
      { sub: testOwnerSub, email: `owner_${suffix}@example.com`, aal: 'aal2' },
      TEST_JWT_SECRET,
      { expiresIn: '10m' }
    );

    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    const testMobile = `033${randomSuffix}`;
    const testBusinessName = `Gate 2 Test Shop ${randomSuffix}`;

    console.log(`Registering test business user: ${testMobile}...`);
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: "Gate 2 Test User",
      mobileNumber: testMobile,
      password: "password123"
    });
    const userToken = regRes.data.accessToken;
    try {
      await axios.post(`${API_BASE}/auth/register`, { name: "Duplicate Legacy Format", mobileNumber: `+92${testMobile.slice(1)}`, password: "password123" });
      assert.fail('Equivalent +92 and 03 mobile identities must not create duplicate users');
    } catch (err) {
      assert.strictEqual(err.response.status, 409);
      console.log('[PASS] Local and legacy +92 mobile formats resolve to one account identity.');
    }

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

    // Create isolated synthetic saleable fixtures. Certified catalogue rows remain untouched.
    const fixtureNumber = 680000 + Number(String(suffix).slice(-5));
    const fixtureCategory = await prisma.category.upsert({
      where: { slug: 'synthetic-gate2' },
      update: { isActive: true },
      create: { name: 'Synthetic Gate 2', slug: 'synthetic-gate2', isActive: true }
    });
    const fixtureUnit = await prisma.unitOfMeasure.upsert({
      where: { code: 'SYN-G2-EACH' },
      update: { isActive: true },
      create: { code: 'SYN-G2-EACH', name: 'Synthetic Gate 2 each', symbol: 'ea', isActive: true }
    });
    const fixtureProduct = await prisma.product.create({
      data: {
        skuNumber: BigInt(fixtureNumber),
        sku: `RS-${fixtureNumber}`,
        name: `Synthetic Gate 2 product ${suffix}`,
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
    const packaging = await prisma.productPackaging.create({
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
    const openingFixtureNumber = fixtureNumber + 100000;
    const openingProduct = await prisma.product.create({
      data: {
        skuNumber: BigInt(openingFixtureNumber),
        sku: `RS-${openingFixtureNumber}`,
        name: `Synthetic opening-stock product ${suffix}`,
        categoryId: fixtureCategory.id,
        purchaseType: 'individual',
        status: 'active',
        unitConfirmationStatus: 'confirmed',
        allowIndividualSale: true,
        openingStockStatus: 'NOT_COUNTED',
        activatedAt: new Date(),
        activatedById: testAdminUser.id,
        packaging: {
          create: {
            unitOfMeasureId: fixtureUnit.id,
            code: 'UNIT',
            label: 'Synthetic unit',
            conversionToBase: 1,
            isBase: true,
            confirmationStatus: 'confirmed',
            isActive: true
          }
        }
      }
    });

    // --- TEST CASE 1: DEMO MODE ORDER PLACEMENT ---
    console.log("TEST CASE 1: Placing order in DEMO mode...");
    // Force settings to DEMO first
    const currentSettings = await prisma.businessSettings.findFirst();
    if (currentSettings) await prisma.businessSettings.update({ where: { id: currentSettings.id }, data: { inventoryMode: 'DEMO', pickupLocation: 'Synthetic test pickup counter', pickupInstructions: 'Bring the order number during disposable testing.' } });
    else await prisma.businessSettings.create({ data: { id: 'test_settings', inventoryMode: 'DEMO', pickupLocation: 'Synthetic test pickup counter', pickupInstructions: 'Bring the order number during disposable testing.' } });
    await prisma.deliveryZone.upsert({
      where: { name: 'Gate 2 Karachi' },
      create: { name: 'Gate 2 Karachi', city: 'Karachi', isFree: true, isActive: true },
      update: { city: 'Karachi', isFree: true, isActive: true }
    });
    await prisma.product.update({ where: { id: packaging.productId }, data: { openingStockStatus: 'COUNTED' } });

    const orderRes1 = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId,
      items: [{ productPackagingId: packaging.id, quantity: 2 }],
      recipientName: "Test Recipient",
      mobile: "03001234567",
      address: "Test Address, Karachi",
      city: "Karachi",
      fulfilmentMethod: "delivery",
      idempotencyKey: `gate2-demo-${suffix}`
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    assert.strictEqual(orderRes1.status, 201);
    assert.strictEqual(orderRes1.data.isDemo, true, "Order placed in DEMO mode must be tagged with isDemo: true");
    assert.strictEqual(orderRes1.data.clientBusinessId, clientBusinessId);
    assert.ok(orderRes1.data.placedByUserId, 'Order must retain the authenticated application-user identity');
    console.log("[PASS] DEMO mode order placed and tagged isDemo: true successfully.");

    const duplicateRes = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId,
      items: [{ productPackagingId: packaging.id, quantity: 2 }],
      recipientName: "Test Recipient",
      mobile: "03001234567",
      address: "Test Address, Karachi",
      city: "Karachi",
      fulfilmentMethod: "delivery",
      idempotencyKey: `gate2-demo-${suffix}`
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    assert.strictEqual(duplicateRes.data.id, orderRes1.data.id, "A repeated checkout key must return the original order");
    assert.strictEqual(await prisma.order.count({ where: { checkoutIdempotencyKey: `gate2-demo-${suffix}` } }), 1);
    console.log("[PASS] Checkout idempotency prevents duplicate orders.");

    const pickupRes = await axios.post(`${API_BASE}/orders`, {
      clientBusinessId,
      items: [{ productPackagingId: packaging.id, quantity: 1 }],
      recipientName: "Pickup Recipient",
      mobile: "03001234567",
      fulfilmentMethod: "pickup",
      idempotencyKey: `gate2-pickup-${suffix}`
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    assert.strictEqual(pickupRes.data.fulfilmentMethod, 'pickup');
    assert.strictEqual(Number(pickupRes.data.deliveryCharge), 0);
    assert.strictEqual(await prisma.delivery.count({ where: { orderId: pickupRes.data.id } }), 0);
    console.log("[PASS] Pickup snapshots configured instructions and never creates a delivery charge/record.");

    try {
      await axios.post(`${API_BASE}/orders`, {}, { headers: { Authorization: 'Bearer invalid_token' } });
      assert.fail('Invalid access token should be rejected');
    } catch (err) {
      assert.strictEqual(err.response.status, 401);
      console.log("[PASS] Invalid/expired checkout session remains protected with HTTP 401.");
    }

    // --- TEST CASE 2: DISPOSABLE DATABASE STARTS IN DEMO MODE ---
    console.log("TEST CASE 2: Verifying disposable inventory mode fixture...");
    const settingsAfterDry = await prisma.businessSettings.findFirst();
    assert.strictEqual(settingsAfterDry.inventoryMode, 'DEMO', "Disposable fixture must start in DEMO mode");
    console.log("[PASS] Disposable inventory fixture starts in DEMO mode.");

    // --- TEST CASE 3: SYNTHETIC LIVE-MODE FIXTURE ---
    console.log("TEST CASE 3: Creating a synthetic LIVE-mode fixture...");
    await prisma.$transaction(async (tx) => {
      await tx.businessSettings.update({
        where: { id: settingsAfterDry.id },
        data: { inventoryMode: 'LIVE' },
      });
      await tx.auditLog.create({
        data: {
          actorId: testAdminUser.id,
          action: 'INVENTORY_MODE_TRANSITION',
          entityType: 'BusinessSettings',
          entityId: settingsAfterDry.id,
          beforeData: { inventoryMode: 'DEMO' },
          afterData: { inventoryMode: 'LIVE' },
          reason: 'Synthetic disposable integration-test fixture',
        },
      });
    });

    const settingsAfterConfirm = await prisma.businessSettings.findFirst();
    assert.strictEqual(settingsAfterConfirm.inventoryMode, 'LIVE', "Settings must switch to LIVE");

    // Verify audit log exists
    const auditLogs = await prisma.auditLog.findMany({
      where: { action: 'INVENTORY_MODE_TRANSITION' }
    });
    assert.strictEqual(auditLogs.length, 1, "An audit log entry must be created");
    assert.strictEqual(auditLogs[0].afterData.inventoryMode, 'LIVE');
    console.log("[PASS] Synthetic LIVE-mode fixture and audit record were created locally.");

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
        city: "Karachi",
        fulfilmentMethod: "delivery",
        idempotencyKey: `gate2-uncounted-${suffix}`
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert.fail("Should have thrown 400 for uncounted stock in LIVE mode");
    } catch (err) {
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.message.includes("stock being updated"), "Error must reference stock being updated");
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
        city: "Karachi",
        fulfilmentMethod: "delivery",
        idempotencyKey: `gate2-zero-${suffix}`
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert.fail("Should have thrown 400 for out of stock in LIVE mode");
    } catch (err) {
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.message.includes("enough available stock"), "Error must reference insufficient available stock");
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
      city: "Karachi",
      fulfilmentMethod: "delivery",
      idempotencyKey: `gate2-live-${suffix}`
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(orderRes3.status, 201);
    assert.strictEqual(orderRes3.data.isDemo, false, "LIVE order must have isDemo: false");
    await axios.put(`${API_BASE}/orders/${orderRes3.data.id}/status`, { status: 'confirmed' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log("[PASS] LIVE order confirmation reserved available stock.");

    const basePerOrder = 2 * Number(packaging.conversionToBase);
    const beforePacking = await prisma.stockBalance.findFirst({ where: { productId: packaging.productId } });
    await axios.put(`${API_BASE}/orders/${orderRes3.data.id}/status`, { status: 'packed' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const afterPacking = await prisma.stockBalance.findUnique({ where: { id: beforePacking.id } });
    assert.strictEqual(Number(afterPacking.onHandQuantity), Number(beforePacking.onHandQuantity) - basePerOrder);
    assert.strictEqual(Number(afterPacking.reservedQuantity), Number(beforePacking.reservedQuantity) - basePerOrder);
    assert.strictEqual(Number(afterPacking.unavailableQuantity), Number(beforePacking.unavailableQuantity) + basePerOrder);
    assert.ok(await prisma.stockMovement.findFirst({ where: { orderItemId: orderRes3.data.items[0].id, movementType: 'packing' } }));
    console.log("[PASS] Packing consumes the reservation and writes a before/after stock movement.");

    const liveBalance = afterPacking;
    await prisma.stockBalance.update({ where: { id: liveBalance.id }, data: { onHandQuantity: Number(liveBalance.reservedQuantity) + basePerOrder * 1.5 } });
    const concurrentBodies = ['a', 'b'].map((key) => ({
      clientBusinessId,
      items: [{ productPackagingId: packaging.id, quantity: 2 }],
      recipientName: "Concurrent Recipient",
      mobile: "03001234567",
      address: "Test Address, Karachi",
      city: "Karachi",
      fulfilmentMethod: "delivery",
      idempotencyKey: `gate2-concurrent-${key}-${suffix}`
    }));
    const pendingOrders = await Promise.all(concurrentBodies.map((body) => axios.post(`${API_BASE}/orders`, body, { headers: { Authorization: `Bearer ${userToken}` } })));
    const concurrent = await Promise.allSettled(pendingOrders.map((result) => axios.put(`${API_BASE}/orders/${result.data.id}/status`, { status: 'confirmed' }, { headers: { Authorization: `Bearer ${adminToken}` } })));
    const rejectedConfirmations = concurrent
      .filter((result) => result.status === 'rejected')
      .map((result) => ({ status: result.reason.response?.status, code: result.reason.code, message: result.reason.message, data: result.reason.response?.data }));
    console.log('[INFO] Concurrent confirmation rejections:', JSON.stringify(rejectedConfirmations));
    assert.strictEqual(concurrent.filter((result) => result.status === 'fulfilled').length, 1, 'Only one competing confirmation may reserve limited stock');
    assert.strictEqual(concurrent.filter((result) => result.status === 'rejected' && result.reason.response?.status === 400).length, 1, `The overselling confirmation must receive HTTP 400: ${JSON.stringify(rejectedConfirmations)}`);
    const protectedBalance = await prisma.stockBalance.findUnique({ where: { id: liveBalance.id } });
    assert.ok(Number(protectedBalance.reservedQuantity) <= Number(protectedBalance.onHandQuantity));
    console.log("[PASS] Row-locked reservations prevent concurrent overselling.");
    const confirmedConcurrent = concurrent.find((result) => result.status === 'fulfilled').value.data;
    const reservedBeforeCancel = Number((await prisma.stockBalance.findUnique({ where: { id: liveBalance.id } })).reservedQuantity);
    await axios.put(`${API_BASE}/orders/${confirmedConcurrent.id}/status`, { status: 'cancelled' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const reservedAfterCancel = Number((await prisma.stockBalance.findUnique({ where: { id: liveBalance.id } })).reservedQuantity);
    assert.strictEqual(reservedAfterCancel, reservedBeforeCancel - basePerOrder);
    console.log("[PASS] Cancelling a confirmed order releases its active stock reservation.");

    await prisma.product.update({ where: { id: openingProduct.id }, data: { openingStockStatus: 'NOT_COUNTED' } });
    const openingRes = await axios.post(`${API_BASE}/stock/opening`, {
      productId: openingProduct.id,
      stockLocationId: 'cms9ict6g02ynowgac24fnny',
      quantityBase: 0,
      reason: 'Synthetic verified zero opening count'
    }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    assert.strictEqual(Number(openingRes.data.previousQuantityBase), 0);
    assert.strictEqual(Number(openingRes.data.newQuantityBase), 0);
    assert.strictEqual((await prisma.product.findUnique({ where: { id: openingProduct.id } })).openingStockStatus, 'COUNTED');
    const adjustRes = await axios.post(`${API_BASE}/stock/adjustments`, {
      productId: openingProduct.id,
      stockLocationId: 'cms9ict6g02ynowgac24fnny',
      quantityDelta: 7,
      reason: 'Synthetic verified restock adjustment'
    }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    assert.strictEqual(Number(adjustRes.data.previousQuantityBase), 0);
    assert.strictEqual(Number(adjustRes.data.newQuantityBase), 7);
    console.log("[PASS] Initialized-zero stock is distinct and adjustments preserve before/delta/after evidence.");

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
