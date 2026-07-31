import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });

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
  console.log("=== STARTING ADMIN CATALOGUE FLOW TESTS ===");

  let testProductId = null;

  try {
    // 1. Log in as admin
    console.log("Logging in as Admin...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      mobileNumber: "+920000000001",
      password: "password123"
    });
    const adminToken = loginRes.data.accessToken;
    console.log("[PASS] Admin login succeeded.");

    // Get a valid category ID to use
    const categories = await prisma.category.findMany({ take: 1 });
    const categoryId = categories[0]?.id;
    if (!categoryId) throw new Error("No categories found in database to link product");

    // 2. Create a test product
    console.log("Creating new product...");
    const createRes = await axios.post(`${API_BASE}/products`, {
      name: "E2E Test Admin Product",
      categoryId: categoryId,
      purchaseType: "both",
      shopName: "E2E Shop Name",
      description: "E2E Test Description",
      wholesalePrice: 125
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testProductId = createRes.data.id;
    console.log("[PASS] Product creation succeeded, ID:", testProductId);

    // 3. Update the product
    console.log("Updating product...");
    const updateRes = await axios.put(`${API_BASE}/products/${testProductId}`, {
      name: "E2E Test Admin Product Updated",
      description: "Updated E2E Description"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] Product update succeeded, new name:", updateRes.data.name);

    // 4. Update status to active
    console.log("Activating product...");
    const statusRes = await axios.put(`${API_BASE}/products/${testProductId}/status`, {
      status: "active"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] Product activation succeeded, status:", statusRes.data.status);

    // 5. Update status to archived
    console.log("Archiving product...");
    const archiveRes = await axios.put(`${API_BASE}/products/${testProductId}/status`, {
      status: "archived"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log("[PASS] Product archiving succeeded, status:", archiveRes.data.status);

  } catch (err) {
    console.error("[FAIL] Admin catalogue test failed:", err.message);
    if (err.response) {
      console.error("  Response status:", err.response.status);
      console.error("  Response data:", err.response.data);
    }
    throw err;
  } finally {
    // Clean up created product
    if (testProductId) {
      console.log(`[Cleanup] Deleting test product ${testProductId}...`);
      
      // Delete any prices & packagings
      const packagings = await prisma.productPackaging.findMany({ where: { productId: testProductId } });
      for (const pkg of packagings) {
        await prisma.productPrice.deleteMany({ where: { productPackagingId: pkg.id } });
      }
      await prisma.productPackaging.deleteMany({ where: { productId: testProductId } });
      await prisma.product.delete({ where: { id: testProductId } });
      console.log("[Cleanup] Deleted test product, packaging, and prices successfully.");
    }

    await prisma.$disconnect();
    await pool.end();
    console.log("=== ADMIN CATALOGUE FLOW TESTS COMPLETED ===");
  }
}

main();
