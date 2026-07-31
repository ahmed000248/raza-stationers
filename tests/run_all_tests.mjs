import { execSync } from 'child_process';
import path from 'path';

const testSuites = [
  'tests/integration/test_admin_endpoint.mjs',
  'tests/integration/test_admin_catalogue.mjs',
  'tests/integration/test_all_flows.mjs',
  'tests/integration/test_invoices.mjs',
];

async function run() {
  console.log("==========================================");
  console.log("   RAZA STATIONERS INTEGRATION TEST RUNNER ");
  console.log("==========================================\n");

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
    console.error("\n==========================================");
    console.error("   SOME INTEGRATION TEST SUITES FAILED!   ");
    console.error("==========================================");
    process.exit(1);
  } else {
    console.log("\n==========================================");
    console.log("   ALL INTEGRATION TEST SUITES PASSED!    ");
    console.log("==========================================");
    process.exit(0);
  }
}

run();
