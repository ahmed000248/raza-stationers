// audit_contamination.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { PrismaClient, PriceType, ImportBatchStatus, ProductPurchaseType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function audit() {
  console.log("=== READ-ONLY CONTAMINATION AUDIT ===");

  // 1. Every ImportBatch grouped by status
  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      status: true,
      originalFilename: true,
      sha256: true,
      totalRows: true,
      uploadedById: true,
      committedById: true,
      createdAt: true,
      committedAt: true,
      _count: {
        select: {
          rows: true
        }
      }
    }
  });

  console.log(`\n1. Import Batches (${batches.length} total):`);
  const statusGroups = {};
  for (const b of batches) {
    statusGroups[b.status] = (statusGroups[b.status] || 0) + 1;
    console.log(`  - ID: ${b.id}`);
    console.log(`    Status: ${b.status}`);
    console.log(`    Filename: ${b.originalFilename}`);
    console.log(`    SHA256: ${b.sha256.substring(0, 16)}...`);
    console.log(`    Created: ${b.createdAt.toISOString()}`);
    console.log(`    Committed: ${b.committedAt ? b.committedAt.toISOString() : 'null'}`);
    console.log(`    Uploader: ${b.uploadedById}, Committer: ${b.committedById}`);
    console.log(`    Rows in DB: ${b._count.rows}`);
  }

  console.log('\nImportBatches Grouped By Status:');
  for (const [st, count] of Object.entries(statusGroups)) {
    console.log(`  ${st}: ${count}`);
  }

  // 2. Failed or stuck committing batches
  const nonCommittedBatches = batches.filter(b => b.status !== 'committed');
  console.log(`\n2. Failed / Committing Batches (${nonCommittedBatches.length} total):`);
  for (const b of nonCommittedBatches) {
    console.log(`  - ID: ${b.id} | Status: ${b.status} | Filename: ${b.originalFilename} | Created: ${b.createdAt.toISOString()}`);
  }

  // 3. Find synthetic / test fixture products, packaging, prices, mappings, and batches
  // Check for test SKUs (RS-FAIL-*, RS-900*, etc.) or synthetic source keys
  const testProducts = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { startsWith: 'RS-FAIL' } },
        { sku: { startsWith: 'RS-9' } },
        { name: { contains: 'STALE' } },
        { name: { contains: 'FAILED' } },
        { name: { contains: 'TEMP CONFLICT' } }
      ]
    },
    select: { id: true, sku: true, name: true, createdAt: true }
  });

  console.log(`\n3. Synthetic Test Products (${testProducts.length} total):`);
  for (const p of testProducts) {
    console.log(`  - ID: ${p.id} | SKU: ${p.sku} | Name: ${p.name}`);
  }

  const testMappings = await prisma.sourceRecordMapping.findMany({
    where: {
      OR: [
        { sourceKey: { contains: 'STALE' } },
        { sourceKey: { contains: 'FAIL' } },
        { sourceKey: { contains: 'EXCEL_KEY' } },
        { sourceKey: { contains: 'mock' } }
      ]
    },
    select: { id: true, sourceKey: true, categoryId: true, productId: true, productPackagingId: true, productPriceId: true }
  });

  console.log(`\nSynthetic Source Mappings (${testMappings.length} total):`);
  for (const m of testMappings) {
    console.log(`  - ID: ${m.id} | Key: ${m.sourceKey} | Category: ${m.categoryId} | Product: ${m.productId} | Pkg: ${m.productPackagingId} | Price: ${m.productPriceId}`);
  }

  // 4. Excess Categories (expected 103 canonical categories)
  const allCategories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, slug: true, createdAt: true }
  });

  console.log(`\n4. Categories Total: ${allCategories.length} (Expected Canonical: 103, Excess: ${allCategories.length - 103})`);
  if (allCategories.length > 103) {
    console.log("  Canonical categories are the first 103 created during valid canonical import.");
    console.log(`  Excess Categories (${allCategories.length - 103}):`);
    const excessCats = allCategories.slice(103);
    for (const c of excessCats) {
      console.log(`    - ID: ${c.id} | Name: "${c.name}" | Slug: "${c.slug}" | Created: ${c.createdAt.toISOString()}`);
    }
  }

  // 5. Excess Source Mappings (expected 2167)
  const allMappings = await prisma.sourceRecordMapping.findMany({
    select: { id: true, sourceKey: true, categoryId: true, productId: true, productPackagingId: true, productPriceId: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`\n5. Source Record Mappings Total: ${allMappings.length} (Expected Canonical: 2167, Excess: ${allMappings.length - 2167})`);
  if (allMappings.length > 2167) {
    const excessMappings = allMappings.slice(2167);
    console.log(`  Excess Source Mappings (${excessMappings.length}):`);
    for (const m of excessMappings) {
      console.log(`    - ID: ${m.id} | Key: "${m.sourceKey}" | Category: ${m.categoryId} | Product: ${m.productId} | Pkg: ${m.productPackagingId} | Price: ${m.productPriceId}`);
    }
  }

  // 6. Excess Prices (Buying expected 2167, Wholesale expected 2167)
  const buyingPrices = await prisma.productPrice.findMany({
    where: { priceType: PriceType.buying },
    orderBy: { createdAt: 'asc' },
    select: { id: true, productPackagingId: true, effectiveFrom: true, effectiveTo: true, createdAt: true }
  });

  const wholesalePrices = await prisma.productPrice.findMany({
    where: { priceType: PriceType.wholesale },
    orderBy: { createdAt: 'asc' },
    select: { id: true, productPackagingId: true, effectiveFrom: true, effectiveTo: true, createdAt: true }
  });

  console.log(`\n6. Product Prices:`);
  console.log(`  Buying Prices Total: ${buyingPrices.length} (Expected: 2167, Excess: ${buyingPrices.length - 2167})`);
  if (buyingPrices.length > 2167) {
    const excessBuying = buyingPrices.slice(2167);
    for (const p of excessBuying) {
      console.log(`    - ID: ${p.id} | PkgID: ${p.productPackagingId} | From: ${p.effectiveFrom.toISOString()} | To: ${p.effectiveTo ? p.effectiveTo.toISOString() : 'null'}`);
    }
  }

  console.log(`  Wholesale Prices Total: ${wholesalePrices.length} (Expected: 2167, Excess: ${wholesalePrices.length - 2167})`);
  if (wholesalePrices.length > 2167) {
    const excessWholesale = wholesalePrices.slice(2167);
    for (const p of excessWholesale) {
      console.log(`    - ID: ${p.id} | PkgID: ${p.productPackagingId} | From: ${p.effectiveFrom.toISOString()} | To: ${p.effectiveTo ? p.effectiveTo.toISOString() : 'null'}`);
    }
  }

  // Check for closed price periods (effectiveTo not null)
  const closedPrices = await prisma.productPrice.findMany({
    where: { effectiveTo: { not: null } },
    select: { id: true, productPackagingId: true, priceType: true, effectiveFrom: true, effectiveTo: true }
  });
  console.log(`\nClosed Prices Count (expected 0): ${closedPrices.length}`);
  for (const cp of closedPrices) {
    console.log(`  - ID: ${cp.id} | Type: ${cp.priceType} | PkgID: ${cp.productPackagingId} | From: ${cp.effectiveFrom.toISOString()} | To: ${cp.effectiveTo.toISOString()}`);
  }

  // 7. Product breakdown by purchase type
  const individualProducts = await prisma.product.count({ where: { purchaseType: ProductPurchaseType.individual } });
  const wholesaleProducts = await prisma.product.count({ where: { purchaseType: ProductPurchaseType.bulk } });
  const bothProducts = await prisma.product.count({ where: { purchaseType: ProductPurchaseType.both } });
  const unconfirmedProducts = await prisma.product.count({ where: { purchaseType: ProductPurchaseType.unconfirmed } });

  console.log(`\n7. Product Purchase Type Breakdown:`);
  console.log(`  Individual (individual): ${individualProducts} (Expected: 70)`);
  console.log(`  Wholesale (bulk): ${wholesaleProducts} (Expected: 2097)`);
  console.log(`  Both: ${bothProducts} (Expected: 0)`);
  console.log(`  Unconfirmed: ${unconfirmedProducts} (Expected: 0)`);
}

audit()
  .then(() => pool.end())
  .catch(err => {
    console.error("Audit error:", err);
    pool.end();
  });
