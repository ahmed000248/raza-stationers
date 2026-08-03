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
import { execFileSync, spawn } from 'child_process';
import crypto from 'node:crypto';
import net from 'node:net';
import path from 'path';
import fs from 'fs';
import pg from 'pg';

const timestamp = Date.now();
const runId = `${timestamp}_${crypto.randomBytes(4).toString("hex")}`;
const containerName = `raza_test_pg_${runId}`;
const dbName = `raza_test_db_${runId}`;
const schemaName = 'public';
const postgresPassword = crypto.randomBytes(24).toString("base64url");
const productionProjectRef = "pqlmgqzpjjllhgalyhwz";
const dockerBin = process.env.DOCKER_BIN || "docker";
const npmCliPath = process.env.npm_execpath;
if (!npmCliPath || !npmCliPath.endsWith("npm-cli.js") || !fs.existsSync(npmCliPath)) {
  throw new Error("The disposable runner must be launched by npm so its exact npm CLI path is available.");
}

// Catalogue workbook — certified repository artifact, not staging copy
const WORKBOOK_PATH = path.resolve('data/final/Raza-Stationers-Final-Supabase-Catalogue.xlsx');

// Test JWT secret must match what the API is configured with in test mode
const TEST_JWT_SECRET = 'raza-stationers-local-test-secret-32-bytes';

for (const name of ["DATABASE_URL", "DIRECT_URL", "TEST_DATABASE_URL", "TEST_DIRECT_URL"]) {
  if (process.env[name]?.includes(productionProjectRef)) {
    throw new Error(`Refusing integration test: ${name} references the production project.`);
  }
}

const allowedEnvironment = new Set([
  "APPDATA", "CI", "COMSPEC", "HOME", "LOCALAPPDATA", "NUMBER_OF_PROCESSORS",
  "OS", "PATH", "PATHEXT", "PROCESSOR_ARCHITECTURE", "SYSTEMDRIVE", "SYSTEMROOT",
  "TEMP", "TMP", "USERPROFILE", "WINDIR",
]);
const safeSystemEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => allowedEnvironment.has(key.toUpperCase()) || key.toLowerCase().startsWith("npm_config_")),
);

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

console.log("=== ISOLATED LOCAL DOCKER TEST RUNNER ===");
console.log("Container Name:", containerName);
console.log("Database Name:", dbName);
console.log("Schema Name:", schemaName);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, opts, maxAttempts = 90, intervalMs = 1000) {
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
  let serverLogStream = null;
  let containerStarted = false;
  let testPool = null;

  try {
    // --- 1. Start Docker postgres container ---
    console.log("[1] Spinning up PostgreSQL docker container...");
    const databasePort = await getFreePort();
    const apiPort = await getFreePort();
    execFileSync(dockerBin, [
      "run", "-d", "--name", containerName,
      "--label", `raza.test.run=${runId}`,
      "-p", `127.0.0.1:${databasePort}:5432`,
      "-e", `POSTGRES_PASSWORD=${postgresPassword}`,
      "-e", `POSTGRES_DB=${dbName}`,
      "--health-cmd", "pg_isready -U postgres",
      "--health-interval", "2s",
      "--health-timeout", "2s",
      "--health-retries", "30",
      "postgres:16-alpine",
    ], { stdio: "ignore" });
    containerStarted = true;
    const testDatabaseUrl = `postgresql://postgres:${encodeURIComponent(postgresPassword)}@127.0.0.1:${databasePort}/${dbName}?schema=${schemaName}`;
    const testDirectUrl = testDatabaseUrl;
    const testApiUrl = `http://127.0.0.1:${apiPort}`;
    const testEnvironment = {
      ...safeSystemEnv,
      DATABASE_URL: testDatabaseUrl,
      DIRECT_URL: testDirectUrl,
      TEST_DATABASE_URL: testDatabaseUrl,
      TEST_DIRECT_URL: testDirectUrl,
      TEST_API_URL: testApiUrl,
      TEST_JWT_SECRET,
      JWT_SECRET: TEST_JWT_SECRET,
      DATABASE_SSL_MODE: "verify-full",
      NODE_ENV: "test",
      USE_TEST_KEY: "true",
      PORT: String(apiPort),
      PGOPTIONS: `-c search_path=${schemaName}`,
    };

    console.log("Mapped database port:", databasePort);
    console.log("Local API port:", apiPort);

    // --- 2. Safety assertion: must be local ---
    const urlObj = new URL(testDatabaseUrl);
    if (!new Set(['127.0.0.1', 'localhost', '::1']).has(urlObj.hostname)) {
      throw new Error(`CRITICAL: test database host is not local: ${urlObj.hostname}`);
    }

    testPool = new pg.Pool({
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
    execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy", "--schema=packages/db/prisma/schema.prisma"], {
      stdio: 'inherit',
      env: testEnvironment,
    });

    // --- 6. Create test sentinel table ---
    console.log("[5] Creating test sentinel...");
    await testPool.query(`CREATE TABLE public.test_run_sentinel (id SERIAL PRIMARY KEY, run_id VARCHAR(255))`);
    await testPool.query(`INSERT INTO public.test_run_sentinel (run_id) VALUES ($1)`, [containerName]);
    const sentinel = await testPool.query("SELECT run_id FROM public.test_run_sentinel");
    if (sentinel.rowCount !== 1 || sentinel.rows[0].run_id !== containerName) {
      throw new Error("Disposable database ownership sentinel verification failed.");
    }
    await testPool.end();
    testPool = null;

    // --- 7. Build and start a stable local API process (never watch mode) ---
    console.log("[6] Building and starting local API Server...");
    for (const workspace of [
      "@raza-stationers/types",
      "@raza-stationers/validation",
      "@raza-stationers/db",
      "@raza-stationers/api-server",
    ]) {
      execFileSync(process.execPath, [npmCliPath, "run", "build", `--workspace=${workspace}`], {
        stdio: "inherit",
        env: testEnvironment,
      });
    }
    serverProcess = spawn(process.execPath, ["dist/main"], {
      cwd: path.resolve("apps/api"),
      env: testEnvironment,
      shell: false,
      stdio: 'pipe'
    });

    serverLogStream = fs.createWriteStream(path.resolve('tests/disposable_server.log'));
    serverProcess.stdout.pipe(serverLogStream);
    serverProcess.stderr.pipe(serverLogStream);

    console.log(`Waiting for API server to boot on port ${apiPort}...`);
    await fetchWithRetry(`${testApiUrl}/`);
    console.log(`[PASS] Local API Server is healthy on port ${apiPort}.`);

    // --- 8. Seed catalogue from repository XLSX via Admin API ---
    console.log("[7] Seeding catalogue from repository artifact (data/final/*.xlsx)...");
    if (!fs.existsSync(WORKBOOK_PATH)) {
      throw new Error(`Catalogue workbook not found at ${WORKBOOK_PATH}`);
    }

    // Sign an admin JWT directly (test secret)
    const jwt = await import('jsonwebtoken');
    const adminToken = jwt.default.sign(
      { sub: 'user_admin123', role: 'admin', mobileNumber: `03${String(timestamp).padStart(9, "0").slice(-9)}`, aal: 'aal2' },
      TEST_JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Seed admin user so JWT is accepted by JwtStrategy's user validation
    const localSeedPool = new pg.Pool({ connectionString: testDirectUrl });
    const bcrypt = await import('bcryptjs');
    const seedHash = await bcrypt.default.hash(crypto.randomBytes(18).toString("base64url"), 10);
    const seedMobile = `03${String(timestamp).padStart(9, "0").slice(-9)}`;
    await localSeedPool.query(`
      INSERT INTO public.users (id, mobile_number, name, role, is_active, password_hash, supabase_auth_id, created_at, updated_at)
      VALUES ('user_admin123', $2, 'Seed Admin', 'admin', true, $1, 'user_admin123', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'admin', supabase_auth_id = 'user_admin123'
    `, [seedHash, seedMobile]);
    await localSeedPool.end();

    // Step 1: Generate plan to get planChecksum
    const planForm1 = new globalThis.FormData();
    const fileBuffer = fs.readFileSync(WORKBOOK_PATH);
    const fileBlob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    planForm1.append('file', fileBlob, 'Raza-Stationers-Final-Supabase-Catalogue.xlsx');

    const planRes = await fetch(`${testApiUrl}/admin/imports/catalogue/plan`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: planForm1,
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
    const commitForm = new globalThis.FormData();
    commitForm.append('file', fileBlob, 'Raza-Stationers-Final-Supabase-Catalogue.xlsx');
    const importRes = await fetch(
      `${testApiUrl}/admin/imports/catalogue/commit?planChecksum=${encodeURIComponent(planChecksum)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: commitForm,
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
      'tests/integration/test_supabase_auth.mjs',
      'tests/importer/test_importer_hardened.mjs',
    ];

    let testFailed = false;
    for (const suite of testSuites) {
      console.log(`Running suite: ${suite}...`);
      try {
        const ownership = new pg.Pool({ connectionString: testDirectUrl });
        const owned = await ownership.query("SELECT run_id FROM public.test_run_sentinel");
        await ownership.end();
        if (owned.rowCount !== 1 || owned.rows[0].run_id !== containerName) {
          throw new Error("Disposable database ownership sentinel changed before test execution.");
        }
        execFileSync(process.execPath, [suite], {
          stdio: 'inherit',
          env: testEnvironment,
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
        const logs = execFileSync(dockerBin, ["logs", containerName], { encoding: 'utf8' });
        console.log("=== DOCKER CONTAINER LOGS ===\n", logs);
      } catch (_) {}
    }
    process.exitCode = 1;
  } finally {
    if (testPool) {
      try { await testPool.end(); } catch (_) {}
      testPool = null;
    }
    if (serverProcess) {
      console.log("[Cleanup] Stopping local API Server...");
      serverProcess.kill('SIGTERM');
      if (process.platform === "win32") {
        try { execFileSync("taskkill", ["/F", "/T", "/PID", String(serverProcess.pid)], { stdio: "ignore" }); } catch (_) {}
      }
    }
    serverLogStream?.end();

    if (containerStarted) {
      console.log(`[Cleanup] Removing PostgreSQL container ${containerName}...`);
      try {
        const label = execFileSync(
          dockerBin,
          ["inspect", "--format", "{{ index .Config.Labels \"raza.test.run\" }}", containerName],
          { encoding: "utf8" },
        ).trim();
        if (label !== runId) throw new Error("Container ownership label mismatch; refusing cleanup.");
        execFileSync(dockerBin, ["rm", "-f", containerName], { stdio: 'ignore' });
        console.log(`[Cleanup SUCCESS] Container ${containerName} removed cleanly.`);
      } catch (e) {
        console.error(`[Cleanup FAIL] Failed to remove container:`, e.message);
      }
    }
    console.log("=== TEST SUITE LIFECYCLE CONCLUDED ===");
  }
}

main();
