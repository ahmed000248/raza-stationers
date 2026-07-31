// inspect_counts.mjs
import { PrismaClient, PriceType, ImportBatchStatus, ProductStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

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

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL, ssl: getSslConfig() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const pCount = await prisma.product.count();
  const pkgCount = await prisma.productPackaging.count();
  const srmCount = await prisma.sourceRecordMapping.count({ where: { sourceSystem: 'Excel' } });
  
  const buyingPricesCount = await prisma.productPrice.count({ where: { priceType: PriceType.buying } });
  const wholesalePricesCount = await prisma.productPrice.count({ where: { priceType: PriceType.wholesale } });
  const catCount = await prisma.category.count();
  const rowCount = await prisma.importRow.count();
  const issueCount = await prisma.importIssue.count();
  
  const batchGroups = await prisma.importBatch.groupBy({
    by: ['status'],
    _count: true,
  });
  
  const productGroups = await prisma.product.groupBy({
    by: ['status'],
    _count: true,
  });

  const activeAtCount = await prisma.product.count({ where: { activatedAt: { not: null } } });
  const activeByIdCount = await prisma.product.count({ where: { activatedById: { not: null } } });
  
  let sbCount = 0;
  try { sbCount = await prisma.stockBalance.count(); } catch (e) {}
  let smCount = 0;
  try { smCount = await prisma.stockMovement.count(); } catch (e) {}

  const duplicateSkus = await prisma.$queryRaw`
    SELECT sku, COUNT(*) FROM products GROUP BY sku HAVING COUNT(*) > 1
  `;
  const duplicateSourceKeys = await prisma.$queryRaw`
    SELECT source_key, COUNT(*) FROM source_record_mappings GROUP BY source_key HAVING COUNT(*) > 1
  `;

  // Overlapping price-period groups
  const overlappingPrices = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM (
      SELECT p1.id FROM product_prices p1
      JOIN product_prices p2 ON p1.product_packaging_id = p2.product_packaging_id
        AND p1.price_type = p2.price_type AND p1.id <> p2.id
        AND p1.effective_from < COALESCE(p2.effective_to, 'infinity'::timestamptz)
        AND COALESCE(p1.effective_to, 'infinity'::timestamptz) > p2.effective_from
    ) t
  `;

  // Pack quantity <= 0
  const invalidPackQtys = await prisma.productPackaging.count({ where: { packQuantity: { lte: 0 } } });

  // Products without exactly one base packaging
  const productsWithoutOneBase = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM products p
    WHERE (
      SELECT COUNT(*) FROM product_packaging pp
      WHERE pp.product_id = p.id AND pp.is_base = true
    ) <> 1
  `;

  console.log('--- RECONCILIATION DATA ---');
  console.log(`Products: ${pCount}`);
  console.log(`Base packagings: ${pkgCount}`);
  console.log(`Source mappings: ${srmCount}`);
  console.log(`Buying prices: ${buyingPricesCount}`);
  console.log(`Wholesale prices: ${wholesalePricesCount}`);
  console.log(`Categories: ${catCount}`);
  console.log(`Import rows: ${rowCount}`);
  console.log(`Import issues: ${issueCount}`);
  
  console.log('Import batches grouped by status:');
  batchGroups.forEach(g => console.log(`  - ${g.status}: ${g._count}`));
  
  console.log('Products grouped by lifecycle status:');
  productGroups.forEach(g => console.log(`  - ${g.status}: ${g._count}`));

  console.log(`activatedAt non-null count: ${activeAtCount}`);
  console.log(`activatedById non-null count: ${activeByIdCount}`);
  console.log(`StockBalance count: ${sbCount}`);
  console.log(`StockMovement count: ${smCount}`);
  
  console.log(`Duplicate SKU groups count: ${duplicateSkus.length}`);
  console.log(`Duplicate source-key groups count: ${duplicateSourceKeys.length}`);
  console.log(`Overlapping price-period groups: ${Number(overlappingPrices[0]?.count || 0)}`);
  console.log(`packQuantity <= 0 count: ${invalidPackQtys}`);
  console.log(`Products without exactly one base packaging: ${Number(productsWithoutOneBase[0]?.count || 0)}`);
}

run()
  .then(() => pool.end())
  .catch(e => { console.error(e); pool.end(); });
