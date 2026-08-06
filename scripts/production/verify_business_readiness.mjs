import pg from 'pg';
import fs from 'node:fs';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL is required.");

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

console.log('=== GATE R9: PRODUCTION BUSINESS-DATA READINESS ===');

async function main() {
  const productsTotalRes = await pool.query('SELECT count(*)::int as count FROM products');
  const productsPendingRes = await pool.query("SELECT count(*)::int as count FROM products WHERE status = 'pending_review'");
  const productsActiveRes = await pool.query("SELECT count(*)::int as count FROM products WHERE status = 'active'");

  const packagingTotalRes = await pool.query('SELECT count(*)::int as count FROM product_packaging');
  const packagingActiveRes = await pool.query('SELECT count(*)::int as count FROM product_packaging WHERE is_active = true');

  const stockLocationsRes = await pool.query('SELECT count(*)::int as count FROM stock_locations WHERE is_active = true');
  const stockBalancesRes = await pool.query('SELECT count(*)::int as count FROM stock_balances');

  const summary = {
    totalProducts: productsTotalRes.rows[0].count,
    pendingProducts: productsPendingRes.rows[0].count,
    activeProducts: productsActiveRes.rows[0].count,
    totalPackaging: packagingTotalRes.rows[0].count,
    activePackaging: packagingActiveRes.rows[0].count,
    activeStockLocations: stockLocationsRes.rows[0].count,
    totalStockBalances: stockBalancesRes.rows[0].count,
    customerOrderingStatus: productsActiveRes.rows[0].count > 0 ? 'READY' : 'BLOCKED — OWNER BUSINESS CONFIGURATION REQUIRED'
  };

  console.log('Total Products:         ', summary.totalProducts);
  console.log('Pending Review Products:', summary.pendingProducts);
  console.log('Active Products:        ', summary.activeProducts);
  console.log('Active Packaging:       ', summary.activePackaging);
  console.log('Active Stock Locations: ', summary.activeStockLocations);
  console.log('Stock Balances Count:   ', summary.totalStockBalances);
  console.log('Customer Ordering Status:', summary.customerOrderingStatus);

  fs.mkdirSync('artifacts/production-verification/database', { recursive: true });
  fs.writeFileSync('artifacts/production-verification/database/gate-r9-business-readiness.json', JSON.stringify(summary, null, 2));

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
