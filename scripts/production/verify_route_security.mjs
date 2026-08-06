import fs from 'node:fs';

const API_BASE = 'https://raza-stationers-api-staging.onrender.com';
const ORIGIN = 'https://raza-stationers-admin-seven.vercel.app';

console.log('=== GATE R5: CORRECTED UNAUTHENTICATED SECURITY SWEEP ===');

// 1. Fetch live OpenAPI specification
const specRes = await fetch(`${API_BASE}/api/docs-json`, {
  headers: { 'Accept': 'application/json', 'Origin': ORIGIN }
});
if (!specRes.ok) {
  console.error(`FAILED: OpenAPI fetch returned HTTP ${specRes.status}`);
  process.exit(1);
}

const spec = await specRes.json();
const allPaths = Object.keys(spec.paths || {});
console.log(`OpenAPI Title: "${spec.info?.title}" v${spec.info?.version}`);
console.log(`Total OpenAPI routes: ${allPaths.length}`);

// Target representatives across all domains from OpenAPI spec
const testCases = [
  // Protected Domain Routes (Expect 401 when unauthenticated)
  { domain: 'users', method: 'GET', path: '/users/me', expectStatus: 401 },
  { domain: 'clients', method: 'GET', path: '/clients', expectStatus: 401 },
  { domain: 'orders', method: 'GET', path: '/orders', expectStatus: 401 },
  { domain: 'admin products', method: 'GET', path: '/admin/products', expectStatus: 401 },
  { domain: 'staff', method: 'GET', path: '/staff', expectStatus: 401 },
  { domain: 'inventory', method: 'GET', path: '/stock-locations', expectStatus: 401 },
  { domain: 'pricing', method: 'GET', path: '/pricing/products/TEST-SKU', expectStatus: 401 },
  { domain: 'accounting', method: 'GET', path: '/accounting/summary', expectStatus: 401 },
  { domain: 'audit', method: 'GET', path: '/audit-logs', expectStatus: 401 },
  { domain: 'imports', method: 'POST', path: '/admin/imports/catalogue/plan', expectStatus: 401 },
  { domain: 'settings', method: 'GET', path: '/settings', expectStatus: 401 },

  // Public Routes (Expect 200)
  { domain: 'health', method: 'GET', path: '/', expectStatus: 200 },
  { domain: 'categories', method: 'GET', path: '/categories', expectStatus: 200 },
  { domain: 'public catalogue', method: 'GET', path: '/products', expectStatus: 200 },
  { domain: 'better-auth get-session', method: 'GET', path: '/auth/api/get-session', expectStatus: 200, checkNull: true }
];

const results = [];
let passCount = 0;
let failCount = 0;

for (const tc of testCases) {
  // Confirm route exists in OpenAPI (handling {param} placeholders)
  const existsInOpenApi = allPaths.some(p => {
    if (p === tc.path) return true;
    const regexStr = '^' + p.replace(/\{[^}]+\}/g, '[^/]+') + '$';
    return new RegExp(regexStr).test(tc.path);
  });
  if (!existsInOpenApi && tc.path !== '/auth/api/get-session') {
    console.error(`✗ FAIL [${tc.domain}] ${tc.method} ${tc.path} — missing from OpenAPI spec!`);
    failCount++;
    results.push({ ...tc, existsInOpenApi: false, pass: false, error: 'Missing from OpenAPI' });
    continue;
  }

  try {
    const res = await fetch(`${API_BASE}${tc.path}`, {
      method: tc.method,
      headers: { 'Accept': 'application/json', 'Origin': ORIGIN }
    });

    let bodyCheckPassed = true;
    if (tc.checkNull) {
      const json = await res.json().catch(() => 'non-json');
      bodyCheckPassed = json === null;
    }

    const statusMatched = res.status === tc.expectStatus;
    const pass = statusMatched && bodyCheckPassed;
    const requestId = res.headers.get('x-request-id') || 'n/a';

    if (pass) {
      passCount++;
      console.log(`✓ PASS [${tc.domain}] ${tc.method} ${tc.path} => HTTP ${res.status} (ReqId: ${requestId})`);
    } else {
      failCount++;
      console.error(`✗ FAIL [${tc.domain}] ${tc.method} ${tc.path} => HTTP ${res.status} (Expected HTTP ${tc.expectStatus})`);
    }

    results.push({
      domain: tc.domain,
      method: tc.method,
      path: tc.path,
      expectedStatus: tc.expectStatus,
      actualStatus: res.status,
      requestId,
      pass
    });
  } catch (err) {
    failCount++;
    console.error(`✗ ERROR [${tc.domain}] ${tc.method} ${tc.path} => ${err.message}`);
    results.push({ ...tc, pass: false, error: err.message });
  }
}

fs.mkdirSync('artifacts/production-verification/http', { recursive: true });
fs.writeFileSync(
  'artifacts/production-verification/http/gate-r5-sweep.json',
  JSON.stringify({ totalTested: testCases.length, passCount, failCount, results }, null, 2)
);

console.log(`\n=== GATE R5 RESULTS: ${failCount === 0 ? 'PASSED' : 'FAILED'} ===`);
console.log(`Passed: ${passCount}/${testCases.length} | Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
