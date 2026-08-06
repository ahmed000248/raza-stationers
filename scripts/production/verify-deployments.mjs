// Gate 3 — Render deployment identity
// Gate 4 — Vercel deployment identity
// Gate 6 — OpenAPI inventory

const renderApiKey = process.env.RENDER_API_KEY;
const vercelToken = process.env.VERCEL_TOKEN;
const renderServiceId = process.env.RENDER_SERVICE_ID || 'srv-d9mgse6417fc73bd2la0';
const vercelTeamId = process.env.VERCEL_TEAM_ID || 'team_zPsmCZ1YlNvK02qDXcJtcEnH';
const expectedBranch = process.env.PRODUCTION_BRANCH || 'phase-10-finalizing';
const webUrl = process.env.PRODUCTION_WEB_URL || 'https://raza-stationers-web.vercel.app';
const adminUrl = process.env.PRODUCTION_ADMIN_URL || 'https://raza-stationers-admin-seven.vercel.app';

const results = { gate3: {}, gate4: {}, gate6: {} };

// ── Gate 3: Render deployment identity ──
if (!renderApiKey || renderApiKey.startsWith('your_')) {
  console.log('GATE 3 SKIP: RENDER_API_KEY not configured');
  results.gate3 = { status: 'BLOCKED', reason: 'RENDER_API_KEY not set' };
} else {
  try {
    const serviceRes = await fetch(`https://api.render.com/v1/services/${renderServiceId}`, {
      headers: { 'Authorization': `Bearer ${renderApiKey}`, 'Accept': 'application/json' }
    });
    if (serviceRes.ok) {
      const service = await serviceRes.json();
      console.log('GATE 3: Render service:', service.name, '| State:', service.state, '| Branch:', service.branch || service.repo?.branch);
      results.gate3 = { status: 'PASSED', name: service.name, state: service.state, branch: service.branch || service.repo?.branch };
    } else {
      const body = await serviceRes.text();
      console.error('GATE 3 FAIL: Render API responded', serviceRes.status, body.slice(0, 200));
      results.gate3 = { status: 'FAILED', code: serviceRes.status, body: body.slice(0, 200) };
    }
  } catch (e) {
    console.error('GATE 3 ERROR:', e.message);
    results.gate3 = { status: 'FAILED', error: e.message };
  }
}

// ── Gate 4: Vercel deployment identity ──
if (!vercelToken || vercelToken.startsWith('your_')) {
  console.log('GATE 4 SKIP: VERCEL_TOKEN not configured');
  results.gate4 = { status: 'BLOCKED', reason: 'VERCEL_TOKEN not set' };
} else {
  try {
    const webProject = process.env.VERCEL_WEB_PROJECT_ID || 'raza-stationers-web';
    const adminProject = process.env.VERCEL_ADMIN_PROJECT_ID || 'raza-stationers-admin';
    const headers = { 'Authorization': `Bearer ${vercelToken}`, 'Accept': 'application/json' };

    // Get latest deployment for web
    const webRes = await fetch(`https://api.vercel.com/v6/deployments?teamId=${vercelTeamId}&projectId=${webProject}&limit=1`, { headers });
    const adminRes = await fetch(`https://api.vercel.com/v6/deployments?teamId=${vercelTeamId}&projectId=${adminProject}&limit=1`, { headers });

    if (webRes.ok && adminRes.ok) {
      const webData = await webRes.json();
      const adminData = await adminRes.json();
      const webDeploy = webData.deployments?.[0];
      const adminDeploy = adminData.deployments?.[0];
      console.log('GATE 4 Web:', webDeploy?.url, '| State:', webDeploy?.state, '| Git branch:', webDeploy?.meta?.githubCommitRef);
      console.log('GATE 4 Admin:', adminDeploy?.url, '| State:', adminDeploy?.state, '| Git branch:', adminDeploy?.meta?.githubCommitRef);
      results.gate4 = {
        status: 'PASSED',
        web: { url: webDeploy?.url, state: webDeploy?.state, branch: webDeploy?.meta?.githubCommitRef },
        admin: { url: adminDeploy?.url, state: adminDeploy?.state, branch: adminDeploy?.meta?.githubCommitRef }
      };
    } else {
      const errBody = webRes.ok ? await adminRes.text() : await webRes.text();
      console.error('GATE 4 FAIL:', !webRes.ok ? webRes.status : adminRes.status, errBody.slice(0, 200));
      results.gate4 = { status: 'FAILED', code: !webRes.ok ? webRes.status : adminRes.status };
    }
  } catch (e) {
    console.error('GATE 4 ERROR:', e.message);
    results.gate4 = { status: 'FAILED', error: e.message };
  }
}

// ── Gate 6: OpenAPI inventory ──
const apiPaths = [
  '/api/docs-json',
  '/api/docs/json',
  '/api-json',
  '/openapi.json',
  '/api/v1/docs-json',
];
const apiBaseUrl = 'https://raza-stationers-api.onrender.com';
let openApiFound = false;

for (const p of apiPaths) {
  try {
    const r = await fetch(apiBaseUrl + p, { headers: { 'Accept': 'application/json' } });
    console.log(`GATE 6: GET ${p} => ${r.status}`);
    if (r.ok) {
      const body = await r.json();
      console.log('GATE 6 OpenAPI found! Info:', JSON.stringify(body.info || {}));
      console.log('GATE 6 Route count:', Object.keys(body.paths || {}).length);
      results.gate6 = { status: 'PASSED', path: p, info: body.info, routeCount: Object.keys(body.paths || {}).length };
      openApiFound = true;
      break;
    }
  } catch (e) {
    console.error(`GATE 6: ${p} error:`, e.message);
  }
}
if (!openApiFound) {
  // Try health check to see if API is even alive
  try {
    const healthRes = await fetch(`${apiBaseUrl}/health`);
    console.log(`GATE 6: /health => ${healthRes.status}`);
  } catch(e) {
    console.log('GATE 6: API unreachable:', e.message);
  }
  results.gate6 = { status: 'FAILED', reason: 'No OpenAPI endpoint found at any known path' };
}

// Also test web and admin are reachable
for (const [label, url] of [['WEB', webUrl], ['ADMIN', adminUrl]]) {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    console.log(`${label} app: ${url} => ${r.status}`);
  } catch(e) {
    console.error(`${label} app unreachable: ${e.message}`);
  }
}

import fs from 'node:fs';
fs.mkdirSync('artifacts/production-verification/deployments', { recursive: true });
fs.writeFileSync('artifacts/production-verification/deployments/gate3-gate4-gate6.json', JSON.stringify(results, null, 2));

console.log('\n=== SUMMARY ===');
console.log('Gate 3 (Render):', results.gate3.status);
console.log('Gate 4 (Vercel):', results.gate4.status);
console.log('Gate 6 (OpenAPI):', results.gate6.status);
