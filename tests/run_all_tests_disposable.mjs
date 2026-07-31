import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const schemaName = 'e2e_test_schema';

function appendSchema(url, schema) {
  if (!url) return url;
  if (url.includes('?')) {
    return url + `&schema=${schema}`;
  }
  return url + `?schema=${schema}`;
}

const testDatabaseUrl = appendSchema(process.env.DATABASE_URL, schemaName);
const testDirectUrl = appendSchema(process.env.DIRECT_URL, schemaName);

console.log("=== DISPOSABLE TEST RUNNER CONFIG ===");
console.log("Test Schema:", schemaName);
console.log("Test DATABASE_URL:", testDatabaseUrl);
console.log("Test DIRECT_URL:", testDirectUrl);
console.log("=====================================\n");

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

async function main() {
  let serverProcess = null;
  
  try {
    // 1. Re-initialize Schema
    console.log(`[1/7] Initializing clean disposable schema ${schemaName}...`);
    await pool.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    await pool.query(`CREATE SCHEMA ${schemaName}`);
    
    // 2. Deploy Schema DDL from Migration SQL
    console.log(`[2/7] Deploying database structure to ${schemaName} via all 7 migration SQL scripts...`);
    const migrationsDir = path.resolve('packages/db/prisma/migrations');
    const migrationFolders = fs.readdirSync(migrationsDir)
      .filter(f => /^\d+_\w+/.test(f))
      .sort(); // alphabet sort matches chronological timestamp order

    for (const folder of migrationFolders) {
      const migPath = path.join(migrationsDir, folder, 'migration.sql');
      if (fs.existsSync(migPath)) {
        console.log(`  Applying migration: ${folder}...`);
        let sql = fs.readFileSync(migPath, 'utf8');
        sql = `SET search_path = ${schemaName}, pg_catalog;\n` + sql;
        
        sql = sql.replace(/CREATE SCHEMA IF NOT EXISTS "public";/g, `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
        sql = sql.replace(/"public"/g, `"${schemaName}"`);
        sql = sql.replace(/public\./g, `${schemaName}.`);
        sql = sql.replace(/'public\./g, `'${schemaName}.`);
        
        await pool.query(sql);
      }
    }
    console.log("[PASS] All 7 migrations deployed successfully.");
    
    // 3. Copy certified catalogue fixtures from public schema to disposable schema
    console.log(`[3/7] Copying certified catalogue from public to ${schemaName}...`);
    await pool.query(`
      INSERT INTO ${schemaName}.users (
        id, mobile_number, email, password_hash, name, role, is_active, deactivated_at, deactivated_by_id, created_at, updated_at
      )
      SELECT 
        id, mobile_number, email, password_hash, name, role::text::${schemaName}.user_role, is_active, deactivated_at, deactivated_by_id, created_at, updated_at
      FROM public.users
    `);
    await pool.query(`
      INSERT INTO ${schemaName}.categories (
        id, name, slug, is_active, archived_at, archived_by_id, created_at, updated_at
      )
      SELECT 
        id, name, slug, is_active, archived_at, archived_by_id, created_at, updated_at
      FROM public.categories
    `);
    await pool.query(`
      INSERT INTO ${schemaName}.products (
        id, sku_number, sku, name, name_urdu, shop_name, category_id, description, purchase_type, status, unit_confirmation_status, allow_individual_sale, low_stock_threshold_base, review_reason, activated_at, activated_by_id, archived_at, archived_by_id, created_at, updated_at
      )
      SELECT 
        id, sku_number, sku, name, name_urdu, shop_name, category_id, description, purchase_type::text::${schemaName}.product_purchase_type, status::text::${schemaName}.product_status, unit_confirmation_status::text::${schemaName}.confirmation_status, allow_individual_sale, low_stock_threshold_base, review_reason, activated_at, activated_by_id, archived_at, archived_by_id, created_at, updated_at
      FROM public.products
    `);
    await pool.query(`INSERT INTO ${schemaName}.units_of_measure SELECT * FROM public.units_of_measure`);
    await pool.query(`
      INSERT INTO ${schemaName}.product_packaging (
        id, product_id, unit_of_measure_id, code, label, conversion_to_base, is_base, confirmation_status, is_active, created_at, updated_at, pack_quantity
      )
      SELECT 
        id, product_id, unit_of_measure_id, code, label, conversion_to_base, is_base, confirmation_status::text::${schemaName}.confirmation_status, is_active, created_at, updated_at, pack_quantity
      FROM public.product_packaging
    `);
    await pool.query(`
      INSERT INTO ${schemaName}.product_prices (
        id, product_packaging_id, price_type, currency, amount, effective_from, effective_to, created_by_id, created_at
      )
      SELECT 
        id, product_packaging_id, price_type::text::${schemaName}.price_type, currency::text::${schemaName}.currency_code, amount, effective_from, effective_to, created_by_id, created_at
      FROM public.product_prices
    `);
    
    // Also copy document sequences to avoid sequence missing errors on order/invoice allocation
    await pool.query(`
      INSERT INTO ${schemaName}.document_sequences (
        document_type, "year", next_value, updated_at
      )
      SELECT 
        document_type::text::${schemaName}.document_type, "year", next_value, updated_at
      FROM public.document_sequences
    `);
    
    console.log("[PASS] Catalogue fixtures copied successfully.");
    
    // 4. Start API server pointing to the disposable schema
    console.log(`[4/7] Starting API Server pointing to ${schemaName}...`);
    
    // Spawn api-server
    serverProcess = spawn('npm', ['run', 'dev:api'], {
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl,
        DIRECT_URL: testDirectUrl,
        PORT: '4000'
      },
      shell: true,
      stdio: 'pipe'
    });
    
    // Log server output to a temporary log
    const serverLogStream = fs.createWriteStream(path.resolve('tests/disposable_server.log'));
    serverProcess.stdout.pipe(serverLogStream);
    serverProcess.stderr.pipe(serverLogStream);
    
    // Wait for the server to be ready on port 4000
    console.log("Waiting for API server to boot on port 4000...");
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch('http://localhost:4000/');
          if (res.status === 200) {
            clearInterval(interval);
            console.log("[PASS] API Server is running and healthy on port 4000.");
            resolve();
          }
        } catch (e) {
          if (attempts > 30) {
            clearInterval(interval);
            reject(new Error("API Server failed to start on port 4000 within 30 seconds. check tests/disposable_server.log"));
          }
        }
      }, 1000);
    });
    
    // 5. Run E2E Integration tests
    console.log("[5/7] Running all integration test suites sequentially...");
    const testSuites = [
      'tests/integration/test_admin_endpoint.mjs',
      'tests/integration/test_admin_catalogue.mjs',
      'tests/integration/test_all_flows.mjs',
      'tests/integration/test_invoices.mjs',
    ];
    
    let failed = false;
    for (const suite of testSuites) {
      console.log(`Running suite: ${suite}...`);
      try {
        execSync(`node "${suite}"`, { stdio: 'inherit' });
        console.log(`[SUCCESS] Suite passed: ${suite}\n`);
      } catch (err) {
        console.error(`[FAIL] Suite failed: ${suite}`);
        failed = true;
      }
    }
    
    if (failed) {
      throw new Error("One or more integration test suites failed!");
    }
    
    console.log("[6/7] All integration test suites completed successfully!");
    
  } catch (err) {
    console.error("\n[CRITICAL ERROR] Test run aborted:", err.message);
    process.exitCode = 1;
  } finally {
    // 6. Kill Server Process
    if (serverProcess) {
      console.log("[Cleanup] Stopping test API Server...");
      serverProcess.kill('SIGTERM');
      // For Windows: force kill if it doesn't close
      try {
        execSync(`taskkill /F /T /PID ${serverProcess.pid}`, { stdio: 'ignore' });
      } catch (e) {}
    }
    
    // 7. Drop Schema
    console.log(`[7/7] Cleaning up: dropping disposable schema ${schemaName}...`);
    try {
      await pool.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
      console.log(`[Cleanup SUCCESS] Schema ${schemaName} dropped cleanly.`);
    } catch (e) {
      console.error(`[Cleanup FAIL] Could not drop schema ${schemaName}:`, e.message);
    }
    
    await pool.end();
    console.log("=== DISPOSABLE TEST RUN COMPLETED ===");
  }
}

main();
