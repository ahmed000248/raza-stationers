// inventory_db.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { PrismaClient, PriceType, ProductPurchaseType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function inventory() {
  console.log("=== READ-ONLY INVENTORY OF CURRENT DATABASE ===");

  const productLifecycle = await prisma.product.groupBy({
    by: ['status'],
    _count: true
  });

  const individualProducts = await prisma.product.count({ where: { purchaseType: ProductPurchaseType.individual } });
  const wholesaleProducts = await prisma.product.count({ where: { purchaseType: ProductPurchaseType.bulk } });

  const basePackaging = await prisma.productPackaging.count({ where: { isBase: true } });
  const totalPackaging = await prisma.productPackaging.count();

  const categoriesCount = await prisma.category.count();

  const mappingsBySystem = await prisma.sourceRecordMapping.groupBy({
    by: ['sourceSystem'],
    _count: true
  });

  const currentBuyingPrices = await prisma.productPrice.count({
    where: { priceType: PriceType.buying, effectiveTo: null }
  });

  const currentWholesalePrices = await prisma.productPrice.count({
    where: { priceType: PriceType.wholesale, effectiveTo: null }
  });

  const closedBuyingPrices = await prisma.productPrice.count({
    where: { priceType: PriceType.buying, effectiveTo: { not: null } }
  });

  const closedWholesalePrices = await prisma.productPrice.count({
    where: { priceType: PriceType.wholesale, effectiveTo: { not: null } }
  });

  const batchCountsByStatus = await prisma.importBatch.groupBy({
    by: ['status'],
    _count: true
  });

  const batchRows = await prisma.importBatch.findMany({
    select: {
      id: true,
      originalFilename: true,
      status: true,
      _count: {
        select: { rows: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  const batchIssues = await prisma.$queryRaw`
    SELECT r.import_batch_id, COUNT(*) as issue_count
    FROM import_issues i
    JOIN import_rows r ON i.import_row_id = r.id
    GROUP BY r.import_batch_id
  `;

  const activatedProducts = await prisma.product.count({ where: { status: 'active' } });
  const nonNullActivatedAt = await prisma.product.count({ where: { activatedAt: { not: null } } });
  const nonNullActivatedById = await prisma.product.count({ where: { activatedById: { not: null } } });

  let stockBalanceCount = 0;
  try { stockBalanceCount = await prisma.stockBalance.count(); } catch (e) {}
  let stockMovementCount = 0;
  try { stockMovementCount = await prisma.stockMovement.count(); } catch (e) {}

  const duplicateSkus = await prisma.$queryRaw`
    SELECT sku, COUNT(*) FROM products GROUP BY sku HAVING COUNT(*) > 1
  `;

  const duplicateSourceKeys = await prisma.$queryRaw`
    SELECT source_key, COUNT(*) FROM source_record_mappings GROUP BY source_key HAVING COUNT(*) > 1
  `;

  const overlappingPrices = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM (
      SELECT p1.id FROM product_prices p1
      JOIN product_prices p2 ON p1.product_packaging_id = p2.product_packaging_id
        AND p1.price_type = p2.price_type AND p1.id <> p2.id
        AND p1.effective_from < COALESCE(p2.effective_to, 'infinity'::timestamptz)
        AND COALESCE(p1.effective_to, 'infinity'::timestamptz) > p2.effective_from
    ) t
  `;

  const invalidPackQtys = await prisma.productPackaging.count({ where: { packQuantity: { lte: 0 } } });

  const productsWithoutOneBase = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM products p
    WHERE (
      SELECT COUNT(*) FROM product_packaging pp
      WHERE pp.product_id = p.id AND pp.is_base = true
    ) <> 1
  `;

  console.log("\nProducts by Lifecycle Status:");
  productLifecycle.forEach(g => console.log(`  - ${g.status}: ${g._count}`));

  console.log(`\nIndividual Products (purchaseType = individual): ${individualProducts}`);
  console.log(`Wholesale Products (purchaseType = bulk): ${wholesaleProducts}`);
  console.log(`Base Packaging Records (isBase = true): ${basePackaging} (Total Packaging: ${totalPackaging})`);
  console.log(`Categories Count: ${categoriesCount}`);

  console.log("\nSource Record Mappings by Source System:");
  mappingsBySystem.forEach(g => console.log(`  - ${g.sourceSystem}: ${g._count}`));

  console.log(`\nCurrent Buying Prices (effectiveTo = null): ${currentBuyingPrices}`);
  console.log(`Current Wholesale Prices (effectiveTo = null): ${currentWholesalePrices}`);
  console.log(`Closed Buying Prices (effectiveTo != null): ${closedBuyingPrices}`);
  console.log(`Closed Wholesale Prices (effectiveTo != null): ${closedWholesalePrices}`);

  console.log("\nImport Batches by Status:");
  batchCountsByStatus.forEach(g => console.log(`  - ${g.status}: ${g._count}`));

  console.log("\nImport Row Counts by Batch:");
  batchRows.forEach(b => console.log(`  - Batch ${b.id} (${b.originalFilename}, ${b.status}): ${b._count.rows} rows`));

  console.log("\nImport Issue Counts by Batch:");
  const issueMap = new Map();
  if (Array.isArray(batchIssues)) {
    batchIssues.forEach(i => issueMap.set(i.import_batch_id, Number(i.issue_count)));
  }
  batchRows.forEach(b => {
    console.log(`  - Batch ${b.id}: ${issueMap.get(b.id) || 0} issues`);
  });

  console.log(`\nActivated Products (status = active): ${activatedProducts}`);
  console.log(`Products with non-null activatedAt: ${nonNullActivatedAt}`);
  console.log(`Products with non-null activatedById: ${nonNullActivatedById}`);

  console.log(`\nStockBalance count: ${stockBalanceCount}`);
  console.log(`StockMovement count: ${stockMovementCount}`);

  console.log(`\nDuplicate SKU groups count: ${duplicateSkus.length}`);
  console.log(`Duplicate source-key groups count: ${duplicateSourceKeys.length}`);
  console.log(`Overlapping price-period groups: ${Number(overlappingPrices[0]?.count || 0)}`);
  console.log(`Invalid packaging quantities (packQuantity <= 0): ${invalidPackQtys}`);
  console.log(`Products without exactly one base packaging: ${Number(productsWithoutOneBase[0]?.count || 0)}`);
}

inventory()
  .then(() => pool.end())
  .catch(err => {
    console.error("Inventory error:", err);
    pool.end();
  });
