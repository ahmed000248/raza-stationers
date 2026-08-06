// Gate 3 — Render deployment identity
// Gate 4 — Vercel deployment identity
// Gate 6 — OpenAPI inventory

import fs from 'node:fs';

const renderApiKey = (process.env.RENDER_API_KEY || '').trim();
const vercelToken = (process.env.VERCEL_TOKEN || '').trim();
const renderServiceId = process.env.RENDER_SERVICE_ID || 'srv-d9mgse6417fc73bd2la0';
const vercelTeamId = process.env.VERCEL_TEAM_ID || 'team_zPsmCZ1YlNvK02qDXcJtcEnH';
const webUrl = process.env.PRODUCTION_WEB_URL || 'https://raza-stationers-web.vercel.app';
const adminUrl = process.env.PRODUCTION_ADMIN_URL || 'https://raza-stationers-admin-seven.vercel.app';

const results = { gate3: {}, gate4: {}, gate6: {} };

// ── Gate 3: Render deployment identity ──
try {
  const serviceRes = await fetch(`https://api.render.com/v1/services/${renderServiceId}`, {
    headers: { 'Authorization': `Bearer ${renderApiKey}`, 'Accept': 'application/json' }
  });
  const deploysRes = await fetch(`https://api.render.com/v1/services/${renderServiceId}/deploys?limit=1`, {
    headers: { 'Authorization': `Bearer ${renderApiKey}`, 'Accept': 'application/json' }
  });

  if (serviceRes.ok && deploysRes.ok) {
    const service = await serviceRes.json();
    const deploys = await deploysRes.json();
    const latestDeploy = deploys[0]?.deploy;

    console.log('GATE 3 PASSED: Render service:', service.name, '| AutoDeploy:', service.autoDeploy, '| Branch:', service.branch);
    console.log('GATE 3: Latest Deploy ID:', latestDeploy?.id, '| Status:', latestDeploy?.status, '| Commit SHA:', latestDeploy?.commit?.id);

    results.gate3 = {
      status: 'PASSED',
      name: service.name,
      serviceId: service.id,
      branch: service.branch,
      deployId: latestDeploy?.id,
      deployStatus: latestDeploy?.status,
      commitSha: latestDeploy?.commit?.id,
      commitMessage: latestDeploy?.commit?.message
    };
  } else {
    console.error('GATE 3 FAIL:', serviceRes.status, deploysRes.status);
    results.gate3 = { status: 'FAILED', serviceStatus: serviceRes.status, deploysStatus: deploysRes.status };
  }
} catch (e) {
  console.error('GATE 3 ERROR:', e.message);
  results.gate3 = { status: 'FAILED', error: e.message };
}

// ── Gate 4: Vercel deployment identity ──
try {
  const userRes = await fetch('https://api.vercel.com/v2/user', {
    headers: { 'Authorization': `Bearer ${vercelToken}`, 'Accept': 'application/json' }
  });

  const webRes = await fetch(webUrl, { redirect: 'follow' });
  const adminRes = await fetch(adminUrl, { redirect: 'follow' });

  if (userRes.ok && webRes.ok && adminRes.ok) {
    const userData = await userRes.json();
    console.log('GATE 4 PASSED: Vercel user:', userData.user?.username, `(${userData.user?.email})`, '| Default Team:', userData.user?.defaultTeamId);
    console.log('GATE 4 Web App:', webUrl, '=> Status:', webRes.status);
    console.log('GATE 4 Admin App:', adminUrl, '=> Status:', adminRes.status);

    results.gate4 = {
      status: 'PASSED',
      username: userData.user?.username,
      email: userData.user?.email,
      defaultTeamId: userData.user?.defaultTeamId,
      webUrl: { url: webUrl, status: webRes.status },
      adminUrl: { url: adminUrl, status: adminRes.status }
    };
  } else {
    results.gate4 = { status: 'FAILED', userStatus: userRes.status, webStatus: webRes.status, adminStatus: adminRes.status };
  }
} catch (e) {
  console.error('GATE 4 ERROR:', e.message);
  results.gate4 = { status: 'FAILED', error: e.message };
}

// ── Gate 6: OpenAPI inventory ──
const apiBaseUrl = 'https://raza-stationers-api-staging.onrender.com';
try {
  const r = await fetch(`${apiBaseUrl}/api/docs-json`, { headers: { 'Accept': 'application/json' } });
  if (r.ok) {
    const body = await r.json();
    console.log('GATE 6 PASSED: OpenAPI title:', body.info?.title, 'v' + body.info?.version, '| Total routes:', Object.keys(body.paths || {}).length);
    results.gate6 = { status: 'PASSED', path: '/api/docs-json', info: body.info, routeCount: Object.keys(body.paths || {}).length };
  } else {
    results.gate6 = { status: 'FAILED', status: r.status };
  }
} catch (e) {
  results.gate6 = { status: 'FAILED', error: e.message };
}

fs.mkdirSync('artifacts/production-verification/deployments', { recursive: true });
fs.writeFileSync('artifacts/production-verification/deployments/gate3-gate4-gate6.json', JSON.stringify(results, null, 2));

console.log('\n=== SUMMARY ===');
console.log('Gate 3 (Render):', results.gate3.status);
console.log('Gate 4 (Vercel):', results.gate4.status);
console.log('Gate 6 (OpenAPI):', results.gate6.status);
