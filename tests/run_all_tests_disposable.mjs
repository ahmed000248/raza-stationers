import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const timestamp = Date.now();
const containerName = `raza_test_pg_${timestamp}`;
const dbName = `raza_test_db_${timestamp}`;
const schemaName = 'public';

console.log("=== ISOLATED LOCAL DOCKER TEST RUNNER ===");
console.log("Container Name:", containerName);
console.log("Database Name:", dbName);
console.log("Schema Name:", schemaName);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  let serverProcess = null;
  let containerStarted = false;

  try {
    // 1. Start Docker postgres container with dynamic host port mapping
    console.log("[1] Spinning up PostgreSQL docker container...");
    execSync(`docker run -d --name ${containerName} -p 5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=${dbName} postgres:15-alpine`, { stdio: 'ignore' });
    containerStarted = true;

    // Wait for mapping
    await sleep(3000);

    // Get mapped port
    const portOutput = execSync(`docker port ${containerName} 5432`, { encoding: 'utf8' }).trim();
    const portMatch = portOutput.match(/:(\d+)$/);
    if (!portMatch) {
      throw new Error(`Failed to parse mapped port from docker port output: ${portOutput}`);
    }
    const localPort = portMatch[1];
    const testDatabaseUrl = `postgresql://postgres:postgres@127.0.0.1:${localPort}/${dbName}?schema=${schemaName}`;
    const testDirectUrl = `postgresql://postgres:postgres@127.0.0.1:${localPort}/${dbName}?schema=${schemaName}`;

    console.log("Mapped Local Port:", localPort);
    console.log("Test URL:", testDatabaseUrl);

    // 2. Perform Allowlist & Identity Assertions
    const urlObj = new URL(testDatabaseUrl);
    if (urlObj.hostname !== '127.0.0.1' && urlObj.hostname !== 'localhost') {
      throw new Error(`CRITICAL: Test database target host is not local: ${urlObj.hostname}`);
    }

    const testPool = new pg.Pool({
      connectionString: testDatabaseUrl.replace(`schema=${schemaName}`, 'schema=public'),
    });

    // Retry connection up to 45 times to allow PostgreSQL service to fully initialize
    let actualDb = null;
    for (let attempt = 1; attempt <= 45; attempt++) {
      try {
        const dbCheckRes = await testPool.query("SELECT current_database()");
        actualDb = dbCheckRes.rows[0].current_database;
        break;
      } catch (e) {
        if (attempt === 45) {
          throw new Error(`Failed to connect to PostgreSQL container after 45 attempts: ${e.message}`);
        }
        await sleep(1000);
      }
    }

    if (actualDb !== dbName) {
      throw new Error(`CRITICAL ID MISMATCH: Expected database name '${dbName}', but server returned '${actualDb}'`);
    }

    // 3. Create standard Supabase roles expected by migrations
    console.log("[2.5] Creating Supabase standard roles (anon, authenticated, etc.)...");
    await testPool.query(`
      CREATE ROLE anon NOLOGIN;
      CREATE ROLE authenticated NOLOGIN;
      CREATE ROLE service_role NOLOGIN;
      CREATE ROLE authenticator NOLOGIN;
      CREATE ROLE supabase_admin NOLOGIN;
    `);

    // 4. Deploy Schema via prisma migrate deploy on empty database
    console.log("[3] Running prisma migrate deploy...");
    execSync(`npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl,
        DIRECT_URL: testDirectUrl
      }
    });

    // 4. Create schema and test-only sentinel table after migrations are deployed
    console.log("[2] Creating schemas and sentinel table...");
    await testPool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    await testPool.query(`CREATE TABLE public.test_run_sentinel (id SERIAL PRIMARY KEY, run_id VARCHAR(255))`);
    await testPool.query(`INSERT INTO public.test_run_sentinel (run_id) VALUES ($1)`, [containerName]);
    await testPool.end();

    // 5. Copy certified catalogue from staging (read-only)
    console.log("[4] Copying certified catalogue from staging...");
    const stagingPool = new pg.Pool({
      connectionString: process.env.DIRECT_URL,
      ssl: fs.existsSync('supabase-ca.crt') ? { rejectUnauthorized: true, ca: fs.readFileSync('supabase-ca.crt', 'utf8') } : true
    });

    // Resilient retry loop for connecting to staging pool to handle transient DNS glitches
    let stagingConnected = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        await stagingPool.query("SELECT 1");
        stagingConnected = true;
        break;
      } catch (e) {
        console.log(`[Warning] Failed to connect to staging DB (attempt ${attempt}/10): ${e.message}`);
        if (attempt === 10) throw e;
        await sleep(3000);
      }
    }

    const localPool = new pg.Pool({
      connectionString: testDatabaseUrl
    });

    // Copy tables helper
    async function copyTable(tableName, columns, castMap = {}) {
      console.log(`  Copying table ${tableName}...`);
      const res = await stagingPool.query(`SELECT * FROM public.${tableName}`);
      for (const row of res.rows) {
        const vals = [];
        const placeholders = [];
        const cols = [];

        columns.forEach((col, idx) => {
          cols.push(`"${col}"`);
          let val = row[col];
          if (castMap[col]) {
            placeholders.push(`$${idx + 1}::${castMap[col]}`);
          } else {
            placeholders.push(`$${idx + 1}`);
          }
          vals.push(val);
        });

        await localPool.query(`INSERT INTO ${schemaName}.${tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`, vals);
      }
    }

    // Copy Users
    await copyTable('users', [
      'id', 'mobile_number', 'email', 'password_hash', 'name', 'role', 'is_active', 'deactivated_at', 'deactivated_by_id', 'created_at', 'updated_at'
    ], { role: `${schemaName}.user_role` });

    // Copy Categories
    await copyTable('categories', [
      'id', 'name', 'slug', 'is_active', 'archived_at', 'archived_by_id', 'created_at', 'updated_at'
    ]);

    // Copy Products (force openingStockStatus = 'NOT_COUNTED')
    console.log("  Copying products...");
    const prodRes = await stagingPool.query(`SELECT * FROM public.products`);
    for (const row of prodRes.rows) {
      await localPool.query(`
        INSERT INTO ${schemaName}.products (
          id, sku_number, sku, name, name_urdu, shop_name, category_id, description, purchase_type, status, unit_confirmation_status, allow_individual_sale, low_stock_threshold_base, opening_stock_status, review_reason, activated_at, activated_by_id, archived_at, archived_by_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::${schemaName}.product_purchase_type, $10::${schemaName}.product_status, $11::${schemaName}.confirmation_status, $12, $13, 'NOT_COUNTED', $14, $15, $16, $17, $18, $19, $20)
      `, [
        row.id, row.sku_number, row.sku, row.name, row.name_urdu, row.shop_name, row.category_id, row.description, row.purchase_type, row.status, row.unit_confirmation_status, row.allow_individual_sale, row.low_stock_threshold_base, row.review_reason, row.activated_at, row.activated_by_id, row.archived_at, row.archived_by_id, row.created_at, row.updated_at
      ]);
    }

    // Copy Units of Measure
    await copyTable('units_of_measure', ['id', 'code', 'name', 'created_at', 'updated_at']);

    // Copy Product Packaging
    await copyTable('product_packaging', [
      'id', 'product_id', 'unit_of_measure_id', 'code', 'label', 'conversion_to_base', 'is_base', 'confirmation_status', 'is_active', 'created_at', 'updated_at', 'pack_quantity'
    ], { confirmation_status: `${schemaName}.confirmation_status` });

    // Copy Product Prices
    await copyTable('product_prices', [
      'id', 'product_packaging_id', 'price_type', 'currency', 'amount', 'effective_from', 'effective_to', 'created_by_id', 'created_at'
    ], { price_type: `${schemaName}.price_type`, currency: `${schemaName}.currency_code` });

    // Copy Document Sequences
    await copyTable('document_sequences', [
      'document_type', 'year', 'next_value', 'updated_at'
    ], { document_type: `${schemaName}.document_type` });

    // Setup sequence for products in local db to avoid serial conflicts
    await localPool.query(`
      SELECT setval('public.product_sku_seq', COALESCE((SELECT MAX(sku_number) FROM ${schemaName}.products), 1) + 1)
    `);

    await stagingPool.end();
    await localPool.end();
    console.log("[PASS] Catalogue fixtures successfully populated.");

    // 6. Start Local API Server
    console.log("[5] Starting local API Server pointing to local DB...");
    serverProcess = spawn('npm', ['run', 'dev:api'], {
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl,
        DIRECT_URL: testDirectUrl,
        PORT: '4000',
        PGOPTIONS: `-c search_path=${schemaName}`
      },
      shell: true,
      stdio: 'pipe'
    });

    const serverLogStream = fs.createWriteStream(path.resolve('tests/disposable_server.log'));
    serverProcess.stdout.pipe(serverLogStream);
    serverProcess.stderr.pipe(serverLogStream);

    console.log("Waiting for API server to boot on port 4000...");
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch('http://localhost:4000/');
          if (res.status === 200) {
            clearInterval(interval);
            console.log("[PASS] Local API Server is healthy on port 4000.");
            resolve();
          }
        } catch (e) {
          if (attempts > 30) {
            clearInterval(interval);
            reject(new Error("API Server failed to start on port 4000 within 30 seconds. Check tests/disposable_server.log"));
          }
        }
      }, 1000);
    });

    // 7. Run Integration Test Suites
    console.log("[6] Executing test suites...");
    const testSuites = [
      'tests/integration/test_admin_endpoint.mjs',
      'tests/integration/test_admin_catalogue.mjs',
      'tests/integration/test_all_flows.mjs',
      'tests/integration/test_invoices.mjs',
      'tests/integration/test_gate2_inventory.mjs',
    ];

    let testFailed = false;
    for (const suite of testSuites) {
      console.log(`Running suite: ${suite}...`);
      try {
        execSync(`node "${suite}"`, {
          stdio: 'inherit',
          env: {
            ...process.env,
            DATABASE_URL: testDatabaseUrl,
            DIRECT_URL: testDirectUrl,
            PGOPTIONS: `-c search_path=${schemaName}`
          }
        });
        console.log(`[SUCCESS] Suite passed: ${suite}\n`);
      } catch (err) {
        console.error(`[FAIL] Suite failed: ${suite}`);
        testFailed = true;
      }
    }

    if (testFailed) {
      throw new Error("One or more integration test suites failed.");
    }

    console.log("=== ALL SUITES COMPLETED SUCCESSFULLY ===");

  } catch (err) {
    console.error("[CRITICAL ERROR] Test execution failed:", err.message);
    if (containerStarted) {
      console.log("=== DOCKER CONTAINER LOGS ===");
      try {
        const logs = execSync(`docker logs ${containerName}`, { encoding: 'utf8' });
        console.log(logs);
      } catch (logErr) {
        console.error("Failed to retrieve docker logs:", logErr.message);
      }
      console.log("=============================");
    }
    process.exitCode = 1;
  } finally {
    // 8. Stop Local API Server
    if (serverProcess) {
      console.log("[Cleanup] Stopping local API Server...");
      serverProcess.kill('SIGTERM');
      try {
        execSync(`taskkill /F /T /PID ${serverProcess.pid}`, { stdio: 'ignore' });
      } catch (e) {}
    }

    // Force kill any remaining process on port 4000
    try {
      if (process.platform === 'win32') {
        const stdout = execSync('netstat -ano | findstr :4000', { encoding: 'utf8' });
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            }
          }
        }
      }
    } catch (e) {}

    // 9. Shutdown and remove the postgres docker container created by this run
    if (containerStarted) {
      console.log(`[Cleanup] Removing PostgreSQL container ${containerName}...`);
      try {
        execSync(`docker rm -f ${containerName}`, { stdio: 'ignore' });
        console.log(`[Cleanup SUCCESS] Container ${containerName} removed cleanly.`);
      } catch (e) {
        console.error(`[Cleanup FAIL] Failed to remove container ${containerName}:`, e.message);
      }
    }
    console.log("=== TEST SUITE LIFECYCLE CONCLUDED ===");
  }
}

main();
