/**
 * run_all_tests_disposable.mjs
 *
 * Isolated local Docker integration test runner.
 * - Spins up a fresh PostgreSQL container per run
 * - Deploys schema via prisma migrate deploy
 * - Seeds catalogue from repository artifact (data/final/*.xlsx) via Admin API
 * - Runs all integration and importer test suites
 * - Tears down cleanly regardless of outcome
 *
 * No staging connections are made. All data is sourced from the repository.
 * ponytail: staging copy removed — local only; catalog seeded via Admin API commit
 */
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const timestamp = Date.now();
const containerName = `raza_test_pg_${timestamp}`;
const dbName = `raza_test_db_${timestamp}`;
const schemaName = 'public';

// Catalogue workbook — certified repository artifact, not staging copy
const WORKBOOK_PATH = path.resolve('data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx');

// Test JWT secret must match what the API is configured with in test mode
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'raza-stationers-test-secret-1234567890';

console.log("=== ISOLATED LOCAL DOCKER TEST RUNNER ===");
console.log("Container Name:", containerName);
console.log("Database Name:", dbName);
console.log("Schema Name:", schemaName);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, opts, maxAttempts = 30, intervalMs = 1000) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 200) return res;
    } catch (_) {}
    if (i === maxAttempts) throw new Error(`${url} did not become available after ${maxAttempts}s`);
    await sleep(intervalMs);
  }
}

async function main() {
  let serverProcess = null;
  let containerStarted = false;

  try {
    // --- 1. Start Docker postgres container ---
    console.log("[1] Spinning up PostgreSQL docker container...");
    execSync(
      `docker run -d --name ${containerName} -p 5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=${dbName} postgres:15-alpine`,
      { stdio: 'ignore' }
    );
    containerStarted = true;
    await sleep(3000);

    const portOutput = execSync(`docker port ${containerName} 5432`, { encoding: 'utf8' }).trim();
    const portMatch = portOutput.match(/:(\d+)$/);
    if (!portMatch) throw new Error(`Failed to parse mapped port: ${portOutput}`);
    const localPort = portMatch[1];
    const testDatabaseUrl = `postgresql://postgres:postgres@127.0.0.1:${localPort}/${dbName}?schema=${schemaName}`;
    const testDirectUrl = testDatabaseUrl;

    console.log("Mapped Local Port:", localPort);

    // --- 2. Safety assertion: must be local ---
    const urlObj = new URL(testDatabaseUrl);
    if (urlObj.hostname !== '127.0.0.1' && urlObj.hostname !== 'localhost') {
      throw new Error(`CRITICAL: test database host is not local: ${urlObj.hostname}`);
    }

    const testPool = new pg.Pool({
      connectionString: testDatabaseUrl.replace(`schema=${schemaName}`, 'schema=public'),
    });

    // --- 3. Wait for Postgres to be ready ---
    console.log("[2] Waiting for PostgreSQL to accept connections...");
    let actualDb = null;
    for (let attempt = 1; attempt <= 45; attempt++) {
      try {
        const dbCheckRes = await testPool.query("SELECT current_database()");
        actualDb = dbCheckRes.rows[0].current_database;
        break;
      } catch (_) {
        if (attempt === 45) throw new Error('PostgreSQL container failed to become ready after 45 attempts');
        await sleep(1000);
      }
    }
    if (actualDb !== dbName) {
      throw new Error(`CRITICAL ID MISMATCH: Expected '${dbName}', got '${actualDb}'`);
    }

    // --- 4. Create standard Supabase roles expected by migrations ---
    console.log("[3] Creating Supabase standard roles...");
    await testPool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
          CREATE ROLE authenticator NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
          CREATE ROLE supabase_admin NOLOGIN;
        END IF;
      END
      $$;
    `);

    // --- 5. Deploy schema via prisma migrate deploy ---
    console.log("[4] Running prisma migrate deploy...");
    execSync(`npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: testDatabaseUrl, DIRECT_URL: testDirectUrl }
    });

    // --- 6. Create test sentinel table ---
    console.log("[5] Creating test sentinel...");
    await testPool.query(`CREATE TABLE public.test_run_sentinel (id SERIAL PRIMARY KEY, run_id VARCHAR(255))`);
    await testPool.query(`INSERT INTO public.test_run_sentinel (run_id) VALUES ($1)`, [containerName]);
    await testPool.end();

    // --- 7. Start Local API Server ---
    console.log("[6] Starting local API Server...");
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
    await fetchWithRetry('http://localhost:4000/');
    console.log("[PASS] Local API Server is healthy on port 4000.");

    // --- 8. Seed catalogue from repository XLSX via Admin API ---
    console.log("[7] Seeding catalogue from repository artifact (data/final/*.xlsx)...");
    if (!fs.existsSync(WORKBOOK_PATH)) {
      throw new Error(`Catalogue workbook not found at ${WORKBOOK_PATH}`);
    }

    // Sign an admin JWT directly (test secret)
    const jwt = await import('jsonwebtoken');
    const adminToken = jwt.default.sign(
      { sub: 'seed_admin', role: 'admin', mobileNumber: '+920000000001' },
      TEST_JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Seed admin user so JWT is accepted by JwtStrategy's user validation
    const localSeedPool = new pg.Pool({ connectionString: testDirectUrl });
    const bcrypt = await import('bcryptjs');
    const seedHash = await bcrypt.default.hash('SeedAdmin@2024', 10);
    await localSeedPool.query(`
      INSERT INTO public.users (id, mobile_number, name, role, is_active, password_hash, created_at, updated_at)
      VALUES ('seed_admin', '+920000000001', 'Seed Admin', 'admin', true, $1, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'admin'
    `, [seedHash]);
    await localSeedPool.end();

    // Step 1: Generate plan to get planChecksum
    const planForm1 = new FormData();
    planForm1.append('file', fs.createReadStream(WORKBOOK_PATH), {
      filename: 'Raza-Stationers-Final-Supabase-Catalogue.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const planRes = await fetch('http://localhost:4000/admin/imports/catalogue/plan', {
      method: 'POST',
      headers: { ...planForm1.getHeaders(), Authorization: `Bearer ${adminToken}` },
      body: planForm1,
      duplex: 'half'
    });
    if (!planRes.ok) {
      const body = await planRes.text();
      throw new Error(`Catalogue plan failed (${planRes.status}): ${body}`);
    }
    const planBody = await planRes.json();
    const planChecksum = planBody.checksum || planBody.planChecksum || planBody.sha256;
    if (!planChecksum) {
      throw new Error(`Plan response did not contain a checksum. Keys: ${Object.keys(planBody).join(', ')}`);
    }
    console.log(`[INFO] Plan checksum: ${planChecksum}`);

    // Step 2: Commit with planChecksum
    const commitForm = new FormData();
    commitForm.append('file', fs.createReadStream(WORKBOOK_PATH), {
      filename: 'Raza-Stationers-Final-Supabase-Catalogue.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const importRes = await fetch(
      `http://localhost:4000/admin/imports/catalogue/commit?planChecksum=${encodeURIComponent(planChecksum)}`,
      {
        method: 'POST',
        headers: { ...commitForm.getHeaders(), Authorization: `Bearer ${adminToken}` },
        body: commitForm,
        duplex: 'half'
      }
    );
    if (!importRes.ok) {
      const body = await importRes.text();
      throw new Error(`Catalogue commit failed (${importRes.status}): ${body}`);
    }
    const importBody = await importRes.json();
    console.log(`[PASS] Catalogue seeded: ${importBody.createdCounts?.products ?? '?'} products, ${importBody.createdCounts?.categories ?? '?'} categories`);

    // --- 9. Run Integration Test Suites ---
    console.log("[8] Executing test suites...");
    const testSuites = [
      'tests/integration/test_admin_endpoint.mjs',
      'tests/integration/test_admin_catalogue.mjs',
      'tests/integration/test_all_flows.mjs',
      'tests/integration/test_invoices.mjs',
      'tests/integration/test_gate2_inventory.mjs',
      'tests/integration/test_gate7_totp.mjs',
      'tests/importer/test_importer_hardened.mjs',
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
      } catch (_) {
        console.error(`[FAIL] Suite failed: ${suite}`);
        testFailed = true;
      }
    }

    if (testFailed) throw new Error("One or more integration test suites failed.");

    console.log("=== ALL SUITES COMPLETED SUCCESSFULLY ===");

  } catch (err) {
    console.error("[CRITICAL ERROR] Test execution failed:", err.message);
    if (containerStarted) {
      try {
        const logs = execSync(`docker logs ${containerName}`, { encoding: 'utf8' });
        console.log("=== DOCKER CONTAINER LOGS ===\n", logs);
      } catch (_) {}
    }
    process.exitCode = 1;
  } finally {
    if (serverProcess) {
      console.log("[Cleanup] Stopping local API Server...");
      serverProcess.kill('SIGTERM');
      try { execSync(`taskkill /F /T /PID ${serverProcess.pid}`, { stdio: 'ignore' }); } catch (_) {}
    }

    // Force-kill orphan processes on port 4000
    try {
      if (process.platform === 'win32') {
        const stdout = execSync('netstat -ano | findstr :4000', { encoding: 'utf8' });
        for (const line of stdout.split('\n')) {
          if (line.includes('LISTENING')) {
            const pid = line.trim().split(/\s+/).pop();
            if (pid && pid !== '0') execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          }
        }
      }
    } catch (_) {}

    if (containerStarted) {
      console.log(`[Cleanup] Removing PostgreSQL container ${containerName}...`);
      try {
        execSync(`docker rm -f ${containerName}`, { stdio: 'ignore' });
        console.log(`[Cleanup SUCCESS] Container ${containerName} removed cleanly.`);
      } catch (e) {
        console.error(`[Cleanup FAIL] Failed to remove container:`, e.message);
      }
    }
    console.log("=== TEST SUITE LIFECYCLE CONCLUDED ===");
  }
}

main();
