/**
 * Restore the 5 runaway test orders to is_demo = true on staging.
 * Keep inventory_mode = DEMO. No other rows are touched.
 * Run: node scripts/database/fix_demo_orders_staging.js
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getSslConfig(connStr) {
  if (connStr && (connStr.includes('127.0.0.1') || connStr.includes('localhost'))) {
    return false;
  }
  const certPath = path.resolve(__dirname, '../../supabase-ca.crt');
  if (fs.existsSync(certPath)) {
    return { rejectUnauthorized: false, ca: fs.readFileSync(certPath, 'utf8') };
  }
  return true;
}

const DIRECT_URL = process.env.DIRECT_URL;
if (!DIRECT_URL) {
  console.error('[FATAL] DIRECT_URL env var not set');
  process.exit(1);
}

// Refuse to run against local DB
if (DIRECT_URL.includes('127.0.0.1') || DIRECT_URL.includes('localhost')) {
  console.error('[FATAL] This script must target staging, not localhost');
  process.exit(1);
}

const TARGET_ORDER_IDS = [
  'cmsa5xfdc00065swge2kyay50',
  'cmsa5xqh4000f5swgrj6vztlk',
  'cmsa5zpwr000bnowgm8ra65om',
  'cmsa62edr000bycwgx4vawkn1',
  'cmsa6abyd000dq0wgk3haey4x',
];

const pool = new pg.Pool({ connectionString: DIRECT_URL, ssl: getSslConfig(DIRECT_URL) });

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Pre-flight: verify orders exist
    const checkRes = await client.query(
      `SELECT id, is_demo FROM public.orders WHERE id = ANY($1::text[])`,
      [TARGET_ORDER_IDS]
    );
    console.log(`[CHECK] Found ${checkRes.rows.length} of ${TARGET_ORDER_IDS.length} target orders`);
    checkRes.rows.forEach(r => console.log(`  ${r.id}  is_demo=${r.is_demo}`));

    if (checkRes.rows.length !== TARGET_ORDER_IDS.length) {
      throw new Error(`Expected 5 orders, found ${checkRes.rows.length}. Aborting.`);
    }

    // 2. Restore is_demo = true
    const updateRes = await client.query(
      `UPDATE public.orders SET is_demo = true, updated_at = NOW()
       WHERE id = ANY($1::text[])`,
      [TARGET_ORDER_IDS]
    );
    console.log(`[UPDATE] Rows affected: ${updateRes.rowCount}`);

    // 3. Verify inventory_mode is DEMO
    const settingsRes = await client.query(
      `SELECT id, inventory_mode FROM public.business_settings LIMIT 5`
    );
    settingsRes.rows.forEach(r => console.log(`[SETTINGS] id=${r.id} inventory_mode=${r.inventory_mode}`));

    // 4. Post-repair check
    const postRes = await client.query(
      `SELECT id, is_demo FROM public.orders WHERE id = ANY($1::text[])`,
      [TARGET_ORDER_IDS]
    );
    const notDemo = postRes.rows.filter(r => !r.is_demo);
    if (notDemo.length > 0) {
      throw new Error(`Verification failed: ${notDemo.length} orders still have is_demo=false`);
    }

    await client.query('COMMIT');
    console.log('[PASS] All 5 orders restored to is_demo=true. Staging recovery complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[FAIL]', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
