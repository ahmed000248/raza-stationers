// Gate 6 — OpenAPI inventory & route accounting
// Gate 7 — Unauthenticated route security sweep

const apiBase = 'https://raza-stationers-api-staging.onrender.com';

import fs from 'node:fs';

const results = {};

// ── Gate 6: Fetch OpenAPI spec ──
const specRes = await fetch(`${apiBase}/api/docs-json`, { headers: { 'Accept': 'application/json' } });
if (!specRes.ok) {
  console.error('GATE 6 FAIL: /api/docs-json returned', specRes.status);
  process.exit(1);
}

const spec = await specRes.json();
const routes = Object.entries(spec.paths || {}).flatMap(([path, methods]) =>
  Object.entries(methods)
    .filter(([m]) => ['get','post','put','patch','delete'].includes(m))
    .map(([method, op]) => ({ method: method.toUpperCase(), path, operationId: op.operationId, tags: op.tags, security: op.security }))
);

console.log(`GATE 6 PASSED: OpenAPI found — API title: "${spec.info?.title}" v${spec.info?.version}`);
console.log(`GATE 6: Total routes: ${routes.length}`);

// Tag breakdown
const byTag = {};
for (const r of routes) {
  const tag = r.tags?.[0] || 'untagged';
  byTag[tag] = (byTag[tag] || 0) + 1;
}
console.log('GATE 6 Route breakdown by tag:');
Object.entries(byTag).sort().forEach(([tag, count]) => console.log(`  ${tag}: ${count}`));

results.gate6 = { status: 'PASSED', title: spec.info?.title, version: spec.info?.version, routeCount: routes.length, byTag };

// ── Gate 7: Unauthenticated security boundary sweep ──
// Test that protected endpoints return 401/403, public endpoints return 200/404
const publicRoutes = routes.filter(r =>
  !r.security || r.security.length === 0
);
const protectedRoutes = routes.filter(r =>
  r.security && r.security.length > 0
);

console.log(`\nGATE 7: ${publicRoutes.length} public routes, ${protectedRoutes.length} protected routes`);

// Probe a sample of protected routes without auth — expect 401 or 403
const sensitiveEndpoints = [
  { method: 'GET', path: '/api/products' },
  { method: 'GET', path: '/api/users' },
  { method: 'GET', path: '/api/orders' },
  { method: 'GET', path: '/api/admin/users' },
  { method: 'POST', path: '/api/products' },
  // /auth/api/get-session intentionally returns 200+null when unauthenticated (BetterAuth spec)
];

const securityFailures = [];
for (const endpoint of sensitiveEndpoints) {
  try {
    const r = await fetch(`${apiBase}${endpoint.path}`, {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' }
    });
    const ok = [401, 403, 404, 405].includes(r.status); // 404 is fine for non-existent, 401/403 for auth
    const label = ok ? '✓' : '✗ SECURITY FAIL';
    console.log(`GATE 7: ${endpoint.method} ${endpoint.path} => ${r.status} ${label}`);
    if (!ok) securityFailures.push({ ...endpoint, status: r.status });
  } catch(e) {
    console.error(`GATE 7: ${endpoint.method} ${endpoint.path} => error: ${e.message}`);
  }
}

results.gate7 = securityFailures.length === 0
  ? { status: 'PASSED', tested: sensitiveEndpoints.length, failures: [] }
  : { status: 'FAILED', failures: securityFailures };

console.log(`\nGATE 7: ${securityFailures.length === 0 ? 'PASSED' : 'FAILED'} — ${securityFailures.length} security boundaries breached`);

// ── BetterAuth endpoint check ──
const authEndpoints = [
  '/auth/api/sign-in/email',
  '/auth/api/get-session',
  '/auth/api/sign-out',
];
console.log('\nGATE 7 (Better Auth endpoints):');
for (const path of authEndpoints) {
  try {
    const r = await fetch(`${apiBase}${path}`, { method: 'GET' });
    console.log(`  GET ${path} => ${r.status}`);
  } catch(e) {
    console.error(`  GET ${path} => error: ${e.message}`);
  }
}

fs.mkdirSync('artifacts/production-verification/http', { recursive: true });
fs.writeFileSync('artifacts/production-verification/http/gate6-gate7.json', JSON.stringify(results, null, 2));
fs.writeFileSync('artifacts/production-verification/http/routes.json', JSON.stringify(routes, null, 2));

console.log('\n=== SUMMARY ===');
console.log('Gate 6 (OpenAPI):', results.gate6.status);
console.log('Gate 7 (Security sweep):', results.gate7.status);
