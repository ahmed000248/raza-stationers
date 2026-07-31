// proposed_cleanup_transaction.mjs
// DRY-RUN PREPARATION SCRIPT FOR PHASE 3C CLEANUP
// DEFAULT ACTION: ROLLBACK AT THE END. NO WRITES PERSIST.

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { PrismaClient, PriceType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import assert from 'assert/strict';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CANONICAL_BATCH_ID = 'cms7excy9002tj0wggesccuaw';

const NON_CANONICAL_BATCH_IDS = [
  'cms2e5mpn0000wcwgskqn2exp',
  'cms2e6lvq0000acwg3mr2fjdl',
  'cms2e7vzt0000twwg9nmahwhx',
  'cms2e8wpm0000aowgvuw9o874',
  'cms2ea0es0000pgwgvgsjqhsc',
  'cms2efcqr0000n8wgfhdqjte3',
  'cms2ehdsf0000lkwgkbqn58s2',
  'cms2eog2o0000ngwgpnmyzsy6',
  'cms7emddn00001gwgvm4u59m2',
  'cms7er5u1004a1gwggyxf6z35',
  'cms7ev0k90000j0wgyok5m32p',
  '58a624f154522a2c3b5d1f3f0b214afaba7f420a3c182396f233d62ded83475d',
  '69231266578c8174a6ffeabfb0daf2f511fb29dd56d37f16a5789f448a680aba',
  'c1c927d4af399254ef6007795dec767e377a615c96221f1c953153446cf5bebc',
  '2f84d15279a36d29f84c4b77c21aef47a0bc33623bf2c57f87f4c59ad8ac32cf',
  'cf1a832a35beb57edd6d0c658997c46094f1fb0ea3a1dc4549d9e9861986eb2a'
];

const SYNTHETIC_MAPPING_IDS = [
  'cms7hsger0006o4wglivi1sy9',
  'cms7hxxlg0004xgwg94itjrlv',
  'cms7hz1ct0004k0wgl63ejrvh',
  'cms7infar0005wkwgq9jl33lx'
];

const TEST_SUCCESSOR_PRICE_IDS = [
  'cms7hsfq80004o4wg4cvmo1us',
  'cms7hsg890005o4wg0miv6e6h',
  'cms7hxxai0003xgwgdrlevjhm',
  'cms7hz11z0003k0wgtxhys8tw'
];

const CANONICAL_PRICE_IDS_TO_REOPEN = [
  'cms7exul5004xj0wgl4qziln1',
  'cms7exux6005mj0wgi5wva4m4'
];

async function runDryRunCleanup() {
  console.log("=== PREPARING TRANSACTION-SAFE CLEANUP (DRY-RUN MODE) ===");

  const client = await pool.connect();

  try {
    await client.query('BEGIN;');
    console.log("[1/8] Transaction started (BEGIN)");

    // PRECONDITION 1: Verify total batches and canonical batch presence
    const batchRes = await client.query('SELECT COUNT(*) FROM import_batches;');
    assert.equal(Number(batchRes.rows[0].count), 17, "Precondition failed: Expected 17 total import batches");

    const canonBatchRes = await client.query('SELECT id FROM import_batches WHERE id = $1;', [CANONICAL_BATCH_ID]);
    assert.equal(canonBatchRes.rows.length, 1, "Precondition failed: Canonical batch missing");

    // PRECONDITION 2: Verify category product reference counts for excess categories
    const excessCatsRes = await client.query(`
      SELECT c.id, COUNT(p.id) as p_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id 
      GROUP BY c.id 
      HAVING COUNT(p.id) = 0;
    `);
    assert.equal(excessCatsRes.rows.length, 84, "Precondition failed: Expected exactly 84 categories with 0 product references");
    const excessCategoryIds = excessCatsRes.rows.map(r => r.id);

    // OPERATION 1: Delete 4 synthetic source mappings
    const mapDel = await client.query('DELETE FROM source_record_mappings WHERE id = ANY($1::text[]);', [SYNTHETIC_MAPPING_IDS]);
    assert.equal(mapDel.rowCount, 4, "Op 1 failed: Expected 4 deleted synthetic mappings");
    console.log(`[2/8] Deleted ${mapDel.rowCount} synthetic source_record_mappings`);

    // OPERATION 2: Delete 4 test successor prices
    const priceDel = await client.query('DELETE FROM product_prices WHERE id = ANY($1::text[]);', [TEST_SUCCESSOR_PRICE_IDS]);
    assert.equal(priceDel.rowCount, 4, "Op 2 failed: Expected 4 deleted test successor prices");
    console.log(`[3/8] Deleted ${priceDel.rowCount} test successor product_prices`);

    // OPERATION 3: Reopen original canonical prices (set effective_to = NULL)
    const priceReopen = await client.query('UPDATE product_prices SET effective_to = NULL WHERE id = ANY($1::text[]);', [CANONICAL_PRICE_IDS_TO_REOPEN]);
    assert.equal(priceReopen.rowCount, 2, "Op 3 failed: Expected 2 reopened canonical prices");
    console.log(`[4/8] Reopened ${priceReopen.rowCount} canonical product_prices (effective_to = NULL)`);

    // OPERATION 4: Delete 84 unreferenced excess categories
    const catDel = await client.query('DELETE FROM categories WHERE id = ANY($1::text[]);', [excessCategoryIds]);
    assert.equal(catDel.rowCount, 84, "Op 4 failed: Expected 84 deleted categories");
    console.log(`[5/8] Deleted ${catDel.rowCount} unreferenced excess categories`);

    // OPERATION 5: Delete import_issues belonging to non-canonical batches
    const issueDel = await client.query(`
      DELETE FROM import_issues 
      WHERE import_row_id IN (
        SELECT id FROM import_rows WHERE import_batch_id = ANY($1::text[])
      );
    `, [NON_CANONICAL_BATCH_IDS]);
    console.log(`[6/8] Deleted ${issueDel.rowCount} import_issues from non-canonical batches`);

    // OPERATION 6: Delete import_rows belonging to non-canonical batches
    const rowDel = await client.query('DELETE FROM import_rows WHERE import_batch_id = ANY($1::text[]);', [NON_CANONICAL_BATCH_IDS]);
    console.log(`[7/8] Deleted ${rowDel.rowCount} import_rows from non-canonical batches`);

    // OPERATION 7: Delete 16 non-canonical import_batches
    const batchDel = await client.query('DELETE FROM import_batches WHERE id = ANY($1::text[]);', [NON_CANONICAL_BATCH_IDS]);
    assert.equal(batchDel.rowCount, 16, "Op 7 failed: Expected 16 deleted non-canonical import_batches");
    console.log(`[8/8] Deleted ${batchDel.rowCount} non-canonical import_batches`);

    // POST-CLEANUP RECONCILIATION CHECKS (INSIDE TRANSACTION)
    console.log("\n--- RECONCILIATION PREVIEW (INSIDE TRANSACTION) ---");
    const pRes = await client.query('SELECT COUNT(*) FROM products;');
    const pkgRes = await client.query('SELECT COUNT(*) FROM product_packaging;');
    const catFinalRes = await client.query('SELECT COUNT(*) FROM categories;');
    const mapFinalRes = await client.query('SELECT COUNT(*) FROM source_record_mappings;');
    const buyPriceRes = await client.query("SELECT COUNT(*) FROM product_prices WHERE price_type = 'buying';");
    const buyOpenRes = await client.query("SELECT COUNT(*) FROM product_prices WHERE price_type = 'buying' AND effective_to IS NULL;");
    const buyClosedRes = await client.query("SELECT COUNT(*) FROM product_prices WHERE price_type = 'buying' AND effective_to IS NOT NULL;");
    const salePriceRes = await client.query("SELECT COUNT(*) FROM product_prices WHERE price_type = 'wholesale';");
    const saleOpenRes = await client.query("SELECT COUNT(*) FROM product_prices WHERE price_type = 'wholesale' AND effective_to IS NULL;");
    const saleClosedRes = await client.query("SELECT COUNT(*) FROM product_prices WHERE price_type = 'wholesale' AND effective_to IS NOT NULL;");
    const batchFinalRes = await client.query('SELECT COUNT(*) FROM import_batches;');

    assert.equal(Number(pRes.rows[0].count), 2167, "Reconciliation failed: Products count");
    assert.equal(Number(pkgRes.rows[0].count), 2167, "Reconciliation failed: Packaging count");
    assert.equal(Number(catFinalRes.rows[0].count), 104, "Reconciliation failed: Category count");
    assert.equal(Number(mapFinalRes.rows[0].count), 2167, "Reconciliation failed: Mappings count");
    assert.equal(Number(buyPriceRes.rows[0].count), 2167, "Reconciliation failed: Buying prices total");
    assert.equal(Number(buyOpenRes.rows[0].count), 2167, "Reconciliation failed: Buying prices open");
    assert.equal(Number(buyClosedRes.rows[0].count), 0, "Reconciliation failed: Buying prices closed");
    assert.equal(Number(salePriceRes.rows[0].count), 2167, "Reconciliation failed: Wholesale prices total");
    assert.equal(Number(saleOpenRes.rows[0].count), 2167, "Reconciliation failed: Wholesale prices open");
    assert.equal(Number(saleClosedRes.rows[0].count), 0, "Reconciliation failed: Wholesale prices closed");
    assert.equal(Number(batchFinalRes.rows[0].count), 1, "Reconciliation failed: Batches count");

    console.log("✅ All Post-Cleanup Reconciliation Assertions Passed Inside Transaction!");

    // ALWAYS ROLLBACK FOR SAFETY IN DRY-RUN MODE
    await client.query('ROLLBACK;');
    console.log("\n🔒 Transaction ROLLED BACK safely. Database remains unmodified.");

  } catch (err) {
    await client.query('ROLLBACK;');
    console.error("❌ Cleanup dry-run transaction failed and rolled back:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runDryRunCleanup();
