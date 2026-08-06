# Raza Stationers Production Verification Runbook

**Repository:** `ahmed000248/raza-stationers`  
**Required branch:** `phase-10-finalizing`  
**Production Supabase project reference:** `pqlmgqzpjjllhgalyhwz`  
**Production Render service ID:** `srv-d9mgse6417fc73bd2la0`  
**Vercel team ID:** `team_zPsmCZ1YlNvK02qDXcJtcEnH`  
**Production web URL:** `https://raza-stationers-web.vercel.app`  
**Production admin URL:** `https://raza-stationers-admin-seven.vercel.app`  

This file is an execution contract for Antigravity. Execute it from the repository root on Windows PowerShell 7 or newer. Do not summarize steps, combine gates, skip checks, or mark a gate passed from source inspection alone. Every gate must have command output, HTTP evidence, database evidence where applicable, and a final status.

---

## 0. Mandatory execution rules

1. Work only on branch `phase-10-finalizing`.
2. Use only the production Supabase project `pqlmgqzpjjllhgalyhwz`.
3. Use only the production Render service identified by `srv-d9mgse6417fc73bd2la0`.
4. Use only the two production Vercel projects named `raza-stationers-web` and `raza-stationers-admin`.
5. Never print passwords, API tokens, database passwords, session cookies, TOTP secrets, OAuth secrets, SMTP credentials, or private keys.
6. Never commit `.env.production.verification`, browser storage-state files, cookies, downloaded logs containing secrets, or generated test credentials.
7. Never run `prisma db push`, `prisma migrate reset`, `supabase db reset`, `DROP DATABASE`, `DROP SCHEMA`, `TRUNCATE`, unrestricted `DELETE`, or unrestricted `UPDATE`.
8. Do not change any real customer, product, price, stock, order, invoice, delivery, return, staff, expense, or settings record.
9. Production write tests are permitted only when `ALLOW_PRODUCTION_VERIFICATION_WRITES=YES` and only on records created by this verification run or on dedicated verification records explicitly supplied through environment variables.
10. Prefix every synthetic record with a unique run marker generated in Gate 1.
11. Record every created ID immediately in `artifacts/production-verification/created-records.json`.
12. Cleanup may target only IDs recorded in that file and must also verify the record contains the run marker.
13. If any command returns a non-zero exit code, any required HTTP request returns `5xx`, any cross-tenant request succeeds, any response exposes a buying price to a business user, or any secret appears in logs, mark the relevant gate `FAILED`.
14. Continue independent read-only gates after a failure. Stop all write gates after a critical authentication, authorization, database-identity, or deployment-identity failure.
15. Do not fix issues during this run. Record them in the report with exact evidence.
16. Update `docs/production/production_verification_progress.md` after every gate.
17. A gate may use only these statuses: `NOT STARTED`, `IN PROGRESS`, `PASSED`, `FAILED`, `BLOCKED`.
18. The final result may be `PASS` only when every critical gate passes and route coverage is 100%.

---

## 1. Required secrets and dedicated verification data

Create a local file named `.env.production.verification`. Do not commit it.

```dotenv
PRODUCTION_BRANCH=phase-10-finalizing
SUPABASE_PROJECT_REF=pqlmgqzpjjllhgalyhwz
RENDER_SERVICE_ID=srv-d9mgse6417fc73bd2la0
VERCEL_TEAM_ID=team_zPsmCZ1YlNvK02qDXcJtcEnH
PRODUCTION_WEB_URL=https://raza-stationers-web.vercel.app
PRODUCTION_ADMIN_URL=https://raza-stationers-admin-seven.vercel.app

RENDER_API_KEY=
VERCEL_TOKEN=
DATABASE_URL=
DIRECT_URL=

VERIFY_OWNER_EMAIL=
VERIFY_OWNER_PASSWORD=
VERIFY_OWNER_TOTP_SECRET=

VERIFY_BUSINESS_EMAIL=
VERIFY_BUSINESS_PASSWORD=

VERIFY_TEST_STAFF_USER_ID=
VERIFY_TEST_STAFF_ORIGINAL_ROLE=
VERIFY_TEST_STAFF_RESTORE_ACTIVE=true

VERIFY_PASSWORD_RESET_MAILBOX_HOST=
VERIFY_PASSWORD_RESET_MAILBOX_PORT=993
VERIFY_PASSWORD_RESET_MAILBOX_USER=
VERIFY_PASSWORD_RESET_MAILBOX_PASSWORD=

ALLOW_PRODUCTION_VERIFICATION_WRITES=NO
```

Rules:

- `VERIFY_OWNER_EMAIL` must belong to a dedicated owner account.
- `VERIFY_BUSINESS_EMAIL` must belong to a dedicated business account.
- Do not place credentials inside this Markdown file.
- The staff ID must identify a dedicated verification staff account. Leave it empty when no dedicated staff record exists; staff mutation checks will then be `BLOCKED`, not `PASSED`.
- Set `ALLOW_PRODUCTION_VERIFICATION_WRITES=YES` only immediately before the controlled write phase.
- `DATABASE_URL` or `DIRECT_URL` must connect to project `pqlmgqzpjjllhgalyhwz`.
- Use the mailbox variables only for a dedicated password-reset mailbox.

Load the variables in PowerShell:

```powershell
Get-Content .env.production.verification |
  Where-Object { $_ -and -not $_.Trim().StartsWith("#") } |
  ForEach-Object {
    $name, $value = $_ -split "=", 2
    [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
  }
```

Abort if any core value is missing:

```powershell
$required = @(
  "PRODUCTION_BRANCH",
  "SUPABASE_PROJECT_REF",
  "RENDER_SERVICE_ID",
  "VERCEL_TEAM_ID",
  "PRODUCTION_WEB_URL",
  "PRODUCTION_ADMIN_URL",
  "RENDER_API_KEY",
  "VERCEL_TOKEN",
  "VERIFY_OWNER_EMAIL",
  "VERIFY_OWNER_PASSWORD",
  "VERIFY_BUSINESS_EMAIL",
  "VERIFY_BUSINESS_PASSWORD"
)

$missing = $required | Where-Object { -not [Environment]::GetEnvironmentVariable($_, "Process") }
if ($missing.Count -gt 0) {
  throw "Missing required verification variables: $($missing -join ', ')"
}

if (-not $env:DATABASE_URL -and -not $env:DIRECT_URL) {
  throw "DATABASE_URL or DIRECT_URL is required."
}
```

---

## 2. Progress report format

Create `docs/production/production_verification_progress.md` before starting.

```markdown
# Production Verification Progress

- Repository: ahmed000248/raza-stationers
- Branch:
- Commit:
- Production Supabase project:
- Production API URL:
- Production web URL:
- Production admin URL:
- Started at:
- Last updated at:
- Current gate:
- Overall status:

| Gate | Name | Status | Started | Completed | Evidence path | Notes |
|---:|---|---|---|---|---|---|

## Created synthetic records

| Entity | ID | Marker | Created at | Cleanup status |
|---|---|---|---|---|

## Failures

| Gate | Command or request | Expected | Actual | Evidence |
|---:|---|---|---|---|

## Final certification

- Route operations discovered:
- Route operations executed:
- Route coverage:
- Critical gates:
- High gates:
- Remaining blockers:
- Verdict:
```

After each gate, include:

- Full command.
- Exit code.
- Start and finish time.
- Sanitized stdout and stderr.
- HTTP method, URL path, status, and response-shape checks.
- Database query name and row-count result.
- Created IDs and cleanup result.
- Exact reason for `FAILED` or `BLOCKED`.

---

## 3. Gate 1 — Repository identity and safety baseline

Run:

```powershell
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

New-Item -ItemType Directory -Force artifacts/production-verification | Out-Null
New-Item -ItemType Directory -Force artifacts/production-verification/http | Out-Null
New-Item -ItemType Directory -Force artifacts/production-verification/database | Out-Null
New-Item -ItemType Directory -Force artifacts/production-verification/browser | Out-Null
New-Item -ItemType Directory -Force artifacts/production-verification/deployments | Out-Null

$runMarker = "PROD-VERIFY-" + (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$env:PRODUCTION_VERIFICATION_MARKER = $runMarker
@{ marker = $runMarker; records = @() } |
  ConvertTo-Json -Depth 10 |
  Set-Content artifacts/production-verification/created-records.json

git rev-parse --show-toplevel
git status --short
git branch --show-current
git rev-parse HEAD
git remote -v
git log -1 --oneline
```

Validation criteria:

1. Repository root ends in the Raza Stationers repository.
2. Current branch equals `$env:PRODUCTION_BRANCH`.
3. Working tree is clean. Generated verification artifacts may be untracked only after this gate.
4. Remote repository is `ahmed000248/raza-stationers`.
5. Record the exact HEAD SHA as `$LOCAL_HEAD`.

```powershell
$LOCAL_HEAD = (git rev-parse HEAD).Trim()
$CURRENT_BRANCH = (git branch --show-current).Trim()
if ($CURRENT_BRANCH -ne $env:PRODUCTION_BRANCH) {
  throw "Wrong branch. Expected $env:PRODUCTION_BRANCH, got $CURRENT_BRANCH"
}
```

Verify the remote branch points to the same commit:

```powershell
$remoteLine = git ls-remote origin "refs/heads/$env:PRODUCTION_BRANCH"
if (-not $remoteLine) { throw "Remote branch was not found." }
$REMOTE_HEAD = ($remoteLine -split "\s+")[0]
if ($REMOTE_HEAD -ne $LOCAL_HEAD) {
  throw "Local and remote branch heads differ. Local=$LOCAL_HEAD Remote=$REMOTE_HEAD"
}
```

Scan active code and deployment configuration for non-production environment language. Exclude historical documentation and generated artifacts:

```powershell
$environmentReferenceMatches = git grep -n -i `
  -e "non-production" `
  -e "development database" `
  -e "dev database" `
  -- `
  "apps/**" `
  "packages/**" `
  "scripts/**" `
  "render.yaml" `
  "vercel.json" `
  "Dockerfile" `
  "package.json" 2>$null

$environmentReferenceMatches |
  Set-Content artifacts/production-verification/environment-reference-scan.txt

if ($environmentReferenceMatches) {
  throw "Active production code/config contains non-production environment references. Review environment-reference-scan.txt."
}
```

Search for unexpected Supabase project references:

```powershell
$projectRefs = git grep -n -E "[a-z]{20}" -- "apps/**" "packages/**" "scripts/**" 2>$null |
  Select-String -Pattern "supabase|postgres"
$projectRefs | Set-Content artifacts/production-verification/supabase-reference-scan.txt
```

Pass criteria: no active runtime code points to another Supabase project.

---

## 4. Gate 2 — Toolchain and deterministic local verification

Record versions:

```powershell
node --version
npm --version
git --version
npx prisma --version
```

Required minimums:

- Node.js `22.x` or newer.
- npm `9.x` or newer.
- Prisma CLI and Prisma Client resolve successfully.
- Git is available.

Install exactly from the lockfile:

```powershell
npm ci
```

Run every repository verification command separately:

```powershell
npm run db:validate
npm run db:generate
npm run typecheck
npm run lint
npm run build:api
npm run build:web
npm run build:admin
npm run build --workspace=@raza-stationers/mobile
npm test
npm run test:phase9
npm run verify
```

Validation criteria:

1. Every command exits `0`.
2. No workspace build is skipped because of an unresolved package.
3. No test uses a different database project.
4. No test claims a live deployment passed by checking source text only.
5. Warnings must be recorded. Security, auth, migration, or route warnings are failures.
6. Save complete output from every command under `artifacts/production-verification/local/`.

Use this pattern for each command:

```powershell
New-Item -ItemType Directory -Force artifacts/production-verification/local | Out-Null
npm run db:validate *>&1 |
  Tee-Object artifacts/production-verification/local/db-validate.txt
if ($LASTEXITCODE -ne 0) { throw "db:validate failed" }
```

Repeat the pattern for every command.

---

## 5. Gate 3 — Render production deployment identity

Resolve the service directly through the Render API.

```powershell
$renderHeaders = @{
  Authorization = "Bearer $env:RENDER_API_KEY"
  Accept = "application/json"
}

$renderResponse = Invoke-RestMethod `
  -Method Get `
  -Headers $renderHeaders `
  -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID"

$renderService = if ($renderResponse.service) { $renderResponse.service } else { $renderResponse }

$renderService |
  ConvertTo-Json -Depth 20 |
  Set-Content artifacts/production-verification/deployments/render-service.json

if ($renderService.branch -ne $env:PRODUCTION_BRANCH) {
  throw "Render is deploying the wrong branch. Expected $env:PRODUCTION_BRANCH, got $($renderService.branch)"
}

$env:PRODUCTION_API_URL = $renderService.serviceDetails.url.TrimEnd("/")
if (-not $env:PRODUCTION_API_URL.StartsWith("https://")) {
  throw "Render service does not expose an HTTPS URL."
}
```

Retrieve deployments:

```powershell
$renderDeployResponse = Invoke-RestMethod `
  -Method Get `
  -Headers $renderHeaders `
  -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID/deploys?limit=20"

$renderDeployments =
  if ($renderDeployResponse.deploys) { $renderDeployResponse.deploys }
  elseif ($renderDeployResponse -is [System.Array]) { $renderDeployResponse }
  else { @($renderDeployResponse) }

$renderDeployments |
  ConvertTo-Json -Depth 20 |
  Set-Content artifacts/production-verification/deployments/render-deployments.json

$latestRenderDeploy = $renderDeployments |
  Sort-Object createdAt -Descending |
  Select-Object -First 1

if (-not $latestRenderDeploy) { throw "No Render deployment was found." }

$renderStatus = [string]$latestRenderDeploy.status
if ($renderStatus -notin @("live", "succeeded")) {
  throw "Latest Render deployment is not live. Status=$renderStatus"
}

$renderCommit =
  if ($latestRenderDeploy.commit.id) { $latestRenderDeploy.commit.id }
  elseif ($latestRenderDeploy.commitId) { $latestRenderDeploy.commitId }
  else { "" }

if ($renderCommit -and $renderCommit -ne $LOCAL_HEAD) {
  throw "Render deployment commit differs from repository HEAD. Render=$renderCommit Git=$LOCAL_HEAD"
}
```

Health request:

```powershell
$health = Invoke-RestMethod -Method Get -Uri "$env:PRODUCTION_API_URL/"
$health | ConvertTo-Json -Depth 10 |
  Set-Content artifacts/production-verification/http/api-health.json

if ($health.status -ne "ok") { throw "API health status is not ok." }
if ($health.services.database -ne "connected") {
  throw "API reports database disconnected."
}
```

Also verify:

```powershell
$response = Invoke-WebRequest -Method Get -Uri "$env:PRODUCTION_API_URL/" -SkipHttpErrorCheck
if ($response.StatusCode -ne 200) { throw "Health endpoint did not return HTTP 200." }
```

Pass criteria:

- Correct branch.
- Latest deployment is live.
- Deployment commit matches Git HEAD.
- HTTPS URL.
- Health returns `200`.
- JSON says `status=ok`.
- JSON says `services.database=connected`.

---

## 6. Gate 4 — Vercel production deployment identity

Retrieve projects:

```powershell
$vercelHeaders = @{
  Authorization = "Bearer $env:VERCEL_TOKEN"
  Accept = "application/json"
}

$projectResponse = Invoke-RestMethod `
  -Method Get `
  -Headers $vercelHeaders `
  -Uri "https://api.vercel.com/v9/projects?teamId=$env:VERCEL_TEAM_ID&limit=100"

$projectResponse |
  ConvertTo-Json -Depth 30 |
  Set-Content artifacts/production-verification/deployments/vercel-projects.json

$webProject = $projectResponse.projects |
  Where-Object { $_.name -eq "raza-stationers-web" } |
  Select-Object -First 1

$adminProject = $projectResponse.projects |
  Where-Object { $_.name -eq "raza-stationers-admin" } |
  Select-Object -First 1

if (-not $webProject) { throw "Vercel web project was not found." }
if (-not $adminProject) { throw "Vercel admin project was not found." }
```

For each project, retrieve production deployments:

```powershell
function Get-LatestProductionDeployment([string]$projectId, [string]$artifactName) {
  $uri = "https://api.vercel.com/v6/deployments?projectId=$projectId&target=production&limit=20&teamId=$env:VERCEL_TEAM_ID"
  $result = Invoke-RestMethod -Method Get -Headers $vercelHeaders -Uri $uri
  $result | ConvertTo-Json -Depth 30 |
    Set-Content "artifacts/production-verification/deployments/$artifactName.json"
  return $result.deployments |
    Sort-Object created -Descending |
    Select-Object -First 1
}

$webDeployment = Get-LatestProductionDeployment $webProject.id "vercel-web-deployments"
$adminDeployment = Get-LatestProductionDeployment $adminProject.id "vercel-admin-deployments"

foreach ($deployment in @($webDeployment, $adminDeployment)) {
  if (-not $deployment) { throw "A Vercel production deployment is missing." }
  $state = if ($deployment.readyState) { $deployment.readyState } else { $deployment.state }
  if ($state -ne "READY") {
    throw "Vercel deployment is not READY. State=$state"
  }

  $deployedBranch = $deployment.meta.githubCommitRef
  if ($deployedBranch -and $deployedBranch -ne $env:PRODUCTION_BRANCH) {
    throw "Vercel deployment uses wrong branch: $deployedBranch"
  }

  $deployedSha = $deployment.meta.githubCommitSha
  if ($deployedSha -and $deployedSha -ne $LOCAL_HEAD) {
    throw "Vercel deployment SHA differs from Git HEAD. Vercel=$deployedSha Git=$LOCAL_HEAD"
  }
}
```

Verify public URLs and required pages:

```powershell
$webChecks = @(
  "$env:PRODUCTION_WEB_URL/",
  "$env:PRODUCTION_WEB_URL/catalogue",
  "$env:PRODUCTION_WEB_URL/login",
  "$env:PRODUCTION_WEB_URL/register",
  "$env:PRODUCTION_WEB_URL/reset-password"
)

$adminChecks = @(
  "$env:PRODUCTION_ADMIN_URL/login",
  "$env:PRODUCTION_ADMIN_URL/"
)

foreach ($url in $webChecks + $adminChecks) {
  $result = Invoke-WebRequest -Uri $url -Method Get -SkipHttpErrorCheck -MaximumRedirection 5
  [pscustomobject]@{
    url = $url
    status = $result.StatusCode
    finalUrl = $result.BaseResponse.RequestMessage.RequestUri.AbsoluteUri
  } | ConvertTo-Json |
    Add-Content artifacts/production-verification/http/vercel-page-checks.jsonl

  if ($result.StatusCode -ge 500) {
    throw "Vercel page returned server error: $url status=$($result.StatusCode)"
  }
}
```

Pass criteria:

- Both production projects exist.
- Latest production deployments are `READY`.
- Branch and commit match Git HEAD.
- Public pages do not return `5xx`.
- Login pages render and do not redirect indefinitely.

---

## 7. Gate 5 — Production Supabase identity, migrations, schema, permissions, and data integrity

First ensure the connection string targets the required project without printing it:

```powershell
$dbUrl = if ($env:DIRECT_URL) { $env:DIRECT_URL } else { $env:DATABASE_URL }
if (-not $dbUrl.Contains($env:SUPABASE_PROJECT_REF)) {
  throw "Database URL does not target production project $env:SUPABASE_PROJECT_REF."
}
```

Create `scripts/production/verify-production-database.mjs` with the following complete content:

```javascript
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const projectRef = process.env.SUPABASE_PROJECT_REF;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!projectRef) throw new Error("SUPABASE_PROJECT_REF is missing");
if (!connectionString) throw new Error("DIRECT_URL or DATABASE_URL is missing");
if (!connectionString.includes(projectRef)) {
  throw new Error(`Connection string does not target required project ${projectRef}`);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 2,
  statement_timeout: 30000,
  query_timeout: 30000,
});

const output = {
  startedAt: new Date().toISOString(),
  projectRef,
  checks: [],
  failures: [],
};

async function check(name, query, validate) {
  try {
    const result = await pool.query(query);
    const valid = await validate(result.rows);
    output.checks.push({ name, rowCount: result.rowCount, valid, rows: result.rows });
    if (!valid) output.failures.push(name);
  } catch (error) {
    output.checks.push({ name, valid: false, error: error.message });
    output.failures.push(name);
  }
}

await check(
  "database-connection",
  "select current_database() as database_name, current_user as database_user, version() as version",
  rows => rows.length === 1
);

const migrationDir = path.resolve("packages/db/prisma/migrations");
const diskMigrations = fs.readdirSync(migrationDir)
  .filter(name => fs.statSync(path.join(migrationDir, name)).isDirectory())
  .sort();

const migrationResult = await pool.query(`
  select migration_name, finished_at, rolled_back_at
  from public._prisma_migrations
  order by migration_name
`);
const applied = new Set(
  migrationResult.rows
    .filter(row => row.finished_at && !row.rolled_back_at)
    .map(row => row.migration_name)
);
const missingMigrations = diskMigrations.filter(name => !applied.has(name));
output.checks.push({
  name: "migration-parity",
  valid: missingMigrations.length === 0,
  diskMigrations,
  appliedMigrations: [...applied].sort(),
  missingMigrations,
});
if (missingMigrations.length) output.failures.push("migration-parity");

await check(
  "required-tables",
  `
  select table_name
  from information_schema.tables
  where table_schema='public'
    and table_name in (
      'users','account','session','verification','two_factor',
      'categories','products','product_packaging','product_prices',
      'client_businesses','business_user_links','orders','order_items',
      'invoices','deliveries','returns','return_items','notifications',
      'notification_subscriptions','stock_locations','stock_balances',
      'stock_movements','audit_logs','expense_entries'
    )
  order by table_name
  `,
  rows => rows.length === 25
);

await check(
  "better-auth-user-columns",
  `
  select column_name
  from information_schema.columns
  where table_schema='public'
    and table_name='users'
    and column_name in ('email_verified','image','two_factor_enabled')
  order by column_name
  `,
  rows => rows.length === 3
);

await check(
  "better-auth-rls",
  `
  select c.relname as table_name, c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and c.relname in ('account','session','verification','two_factor')
  order by c.relname
  `,
  rows => rows.length === 4 && rows.every(row => row.rls_enabled === true)
);

await check(
  "better-auth-public-privileges",
  `
  select table_name, grantee, privilege_type
  from information_schema.role_table_grants
  where table_schema='public'
    and table_name in ('account','session','verification','two_factor')
    and grantee in ('PUBLIC','anon','authenticated')
  order by table_name, grantee, privilege_type
  `,
  rows => rows.length === 0
);

await check(
  "public-security-definer-execute",
  `
  select n.nspname as schema_name, p.proname,
         p.prosecdef,
         has_function_privilege('PUBLIC', p.oid, 'EXECUTE') as public_execute,
         has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
         has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prosecdef=true
  order by p.proname
  `,
  rows => rows.every(row =>
    row.public_execute === false &&
    row.anon_execute === false &&
    row.authenticated_execute === false
  )
);

await check(
  "required-indexes",
  `
  select indexname
  from pg_indexes
  where schemaname='public'
    and indexname in (
      'idx_products_category_id',
      'idx_orders_placed_by_user_id',
      'idx_business_user_links_linked_by_id',
      'idx_business_user_links_ended_by_id',
      'idx_product_prices_created_by_id',
      'idx_stock_movements_stock_location_id',
      'idx_stock_movements_created_by_id',
      'idx_payments_submitted_by_id',
      'idx_payments_verified_by_id'
    )
  order by indexname
  `,
  rows => rows.length === 9
);

await check(
  "orphan-product-packaging",
  `
  select count(*)::int as count
  from product_packaging pp
  left join products p on p.id=pp.product_id
  where p.id is null
  `,
  rows => rows[0]?.count === 0
);

await check(
  "orphan-product-prices",
  `
  select count(*)::int as count
  from product_prices pr
  left join product_packaging pp on pp.id=pr.product_packaging_id
  where pp.id is null
  `,
  rows => rows[0]?.count === 0
);

await check(
  "invalid-price-values",
  `
  select count(*)::int as count
  from product_prices
  where amount < 0
  `,
  rows => rows[0]?.count === 0
);

await check(
  "duplicate-active-business-links",
  `
  select user_id, count(*)::int as count
  from business_user_links
  where ended_at is null
  group by user_id
  having count(*) > 1
  `,
  rows => rows.length === 0
);

await check(
  "expired-sessions",
  `
  select count(*)::int as count
  from session
  where expires_at < now() - interval '30 days'
  `,
  rows => rows[0]?.count === 0
);

await check(
  "fixture-active-product",
  `
  select p.id as product_id, p.sku, p.category_id,
         pp.id as packaging_id, pp.unit_of_measure_id,
         coalesce(sum(sb.on_hand_quantity - sb.reserved_quantity),0) as available
  from products p
  join product_packaging pp on pp.product_id=p.id and pp.is_active=true
  left join stock_balances sb on sb.product_id=p.id
  where p.status='active'
  group by p.id,p.sku,p.category_id,pp.id,pp.unit_of_measure_id
  order by p.created_at
  limit 1
  `,
  rows => rows.length === 1
);

await check(
  "fixture-stock-location",
  `
  select id as stock_location_id, name
  from stock_locations
  where is_active=true
  order by created_at
  limit 1
  `,
  rows => rows.length === 1
);

const productFixture = output.checks.find(c => c.name === "fixture-active-product")?.rows?.[0];
const locationFixture = output.checks.find(c => c.name === "fixture-stock-location")?.rows?.[0];

fs.mkdirSync("artifacts/production-verification/database", { recursive: true });
fs.writeFileSync(
  "artifacts/production-verification/database/database-verification.json",
  JSON.stringify(output, null, 2)
);
fs.writeFileSync(
  "artifacts/production-verification/database/fixtures.json",
  JSON.stringify({ ...productFixture, ...locationFixture }, null, 2)
);

await pool.end();

if (output.failures.length) {
  console.error(`Database verification failed: ${output.failures.join(", ")}`);
  process.exit(1);
}

console.log("Production database verification passed.");
```

Run it:

```powershell
New-Item -ItemType Directory -Force scripts/production | Out-Null
node scripts/production/verify-production-database.mjs
if ($LASTEXITCODE -ne 0) {
  throw "Production database verification failed."
}
```

Also run Prisma migration status:

```powershell
npx prisma migrate status --schema=packages/db/prisma/schema.prisma *>&1 |
  Tee-Object artifacts/production-verification/database/prisma-migrate-status.txt
if ($LASTEXITCODE -ne 0) { throw "Prisma migration status failed." }
```

Pass criteria:

- Connection is successful.
- Connection URL contains exactly the required project reference.
- Every migration directory is recorded as successfully applied.
- BetterAuth tables and user columns exist.
- RLS is enabled on BetterAuth tables.
- `PUBLIC`, `anon`, and `authenticated` have no direct table privileges on BetterAuth tables.
- No publicly executable `SECURITY DEFINER` function remains.
- Required indexes exist.
- Integrity queries return zero failures.
- Fixture queries return one active product and one active location.

---

## 8. Gate 6 — OpenAPI inventory and 100% route-accounting gate

Download the live Swagger document:

```powershell
$openApiUrl = "$env:PRODUCTION_API_URL/api/docs-json"
$openApiResponse = Invoke-WebRequest `
  -Method Get `
  -Uri $openApiUrl `
  -SkipHttpErrorCheck

if ($openApiResponse.StatusCode -ne 200) {
  throw "Swagger JSON was not available at $openApiUrl"
}

$openApiResponse.Content |
  Set-Content artifacts/production-verification/openapi.json
```

Create a sorted operation inventory:

```powershell
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('artifacts/production-verification/openapi.json','utf8'));const ops=[];for(const [p,v] of Object.entries(d.paths||{}))for(const [m,o] of Object.entries(v))if(['get','post','put','patch','delete','options','head'].includes(m))ops.push({method:m.toUpperCase(),path:p,operationId:o.operationId||null,tags:o.tags||[]});ops.sort((a,b)=>(a.path+a.method).localeCompare(b.path+b.method));fs.writeFileSync('artifacts/production-verification/openapi-operations.json',JSON.stringify(ops,null,2));console.log('operations='+ops.length);"
```

Validation criteria:

1. `openapi.json` parses.
2. It contains at least one path.
3. Every operation is represented in the route matrix below or is a BetterAuth dynamic route handled in Gate 8.
4. No route present in production may be silently ignored.
5. No expected route may be absent.
6. Record total operations, matrix operations, dynamic BetterAuth operations, and coverage percentage.

### Required route matrix

| # | Method | Path | Access | Required validation | Workflow |
|---:|---|---|---|---|---|
| 1 | `GET` | `/` | public | 200; JSON status=ok and services.database=connected | Health check |
| 2 | `POST` | `/auth/register` | public | 201/200 for controlled test identity; 400/409 for duplicate or invalid input; never 5xx | Controlled signup workflow |
| 3 | `POST` | `/auth/register-supabase` | public-with-bearer | 400 without bearer; 2xx only with an explicitly supplied valid token | Legacy compatibility verification |
| 4 | `GET` | `/auth/bootstrap-status` | public-with-optional-bearer | 2xx; unauthenticated response must not expose secrets | Bootstrap contract |
| 5 | `GET` | `/auth/session-profile` | public-with-optional-bearer | 2xx; authenticated result must match the current user | Session-profile contract |
| 6 | `POST` | `/auth/link` | business | 401/403 without session; controlled success only for dedicated account | Account-link contract |
| 7 | `POST` | `/auth/login` | public | 200 for valid controlled account; 401 for wrong password; cookie must be secure | Compatibility login |
| 8 | `POST` | `/auth/totp/verify` | business | Expected application-defined result; never 5xx | Compatibility TOTP route |
| 9 | `POST` | `/auth/totp/setup` | business | Expected application-defined result; never 5xx | Compatibility TOTP route |
| 10 | `POST` | `/auth/totp/enable` | business | Expected application-defined result; never 5xx | Compatibility TOTP route |
| 11 | `POST` | `/auth/totp/disable` | business | Expected application-defined result; never 5xx | Compatibility TOTP route |
| 12 | `PUT` | `/auth/change-password` | business | 401/403 without session; dedicated-account success and restoration | Password change |
| 13 | `GET` | `/products` | public | 200; paginated items; no buying price | Catalogue list |
| 14 | `GET` | `/admin/products` | owner-admin | 401/403 without privileged session; 200 for owner/admin | Admin catalogue |
| 15 | `POST` | `/products` | owner-admin | 401/403 without privileged session; controlled product creation | Product create |
| 16 | `PUT` | `/products/:id` | owner-admin | 401/403 without privileged session; controlled product update | Product update |
| 17 | `PUT` | `/products/:id/status` | owner-admin | 401/403 without privileged session; controlled activate/archive | Product status |
| 18 | `GET` | `/products/id/:id` | public | 200 for active product; 404 for non-public product; no buying price | Product by ID |
| 19 | `GET` | `/products/:sku` | public | 200 for active SKU; no buying price | Product by SKU |
| 20 | `GET` | `/categories` | public | 200; active categories only | Categories |
| 21 | `GET` | `/catalogue/filter-options` | public | 200; values backed by active product packaging | Filter options |
| 22 | `GET` | `/users/me` | business | 401/403 without session; 200 and current user only | Profile |
| 23 | `GET` | `/clients` | owner-admin | 401/403 for business user; 200 for owner/admin | Client list |
| 24 | `POST` | `/clients` | business | 401/403 without session; controlled business registration | Business registration |
| 25 | `GET` | `/clients/me` | business | 200 for linked user; only own active link | Current business |
| 26 | `GET` | `/clients/:id` | business-or-owner | Own business or owner/admin only; cross-business must be 404/403 | Client detail |
| 27 | `PUT` | `/clients/:id/approve` | owner | Owner only; controlled pending business approval | Client approval |
| 28 | `PUT` | `/clients/:id/credit` | owner | Owner only; no-op or controlled credit change and restore | Credit update |
| 29 | `GET` | `/clients/:id/credit` | business-or-owner | Own business or owner/admin only | Credit summary |
| 30 | `POST` | `/orders` | business | Controlled order success; idempotent repeat returns same result/no duplicate | Order create |
| 31 | `GET` | `/orders/fulfilment-options` | business | 200; delivery/pickup configuration | Fulfilment options |
| 32 | `GET` | `/orders` | business-or-owner | Business sees own orders; owner/admin may filter | Order list |
| 33 | `GET` | `/orders/:id` | business-or-owner | Owner or linked business only | Order detail |
| 34 | `PUT` | `/orders/:id/status` | owner-admin | Owner/admin only; valid transition succeeds; invalid transition rejected | Order status |
| 35 | `GET` | `/pricing/resolve/:sku` | business | 200; effective price; customer response has no buying price | Resolved price |
| 36 | `GET` | `/pricing/products/:sku` | business | 200 or 403 according to policy; response must never expose buying price to business user | Price list protection |
| 37 | `GET` | `/stock` | owner-admin-packing | 401/403 for unauthorized role; 200 for allowed role | Stock list |
| 38 | `POST` | `/stock/opening` | owner-admin | Controlled product only; creates one opening balance | Opening stock |
| 39 | `POST` | `/stock/adjustments` | owner-admin | Controlled product only; before/after quantities verified | Stock adjustment |
| 40 | `GET` | `/stock/:sku` | owner-admin-packing | 200 for controlled SKU | Stock detail |
| 41 | `GET` | `/stock-locations` | owner-admin-packing | 200; active locations only | Stock locations |
| 42 | `GET` | `/deliveries` | owner-admin-delivery | 200 for allowed role; 403 for business user | Delivery list |
| 43 | `POST` | `/deliveries` | owner-admin-delivery | Controlled order only; success with orderId body | Delivery create |
| 44 | `GET` | `/deliveries/:id` | owner-admin-delivery | 200 for controlled delivery | Delivery detail |
| 45 | `GET` | `/deliveries/order/:orderId` | owner-admin-delivery | 200 for controlled order | Delivery by order |
| 46 | `POST` | `/returns` | business | Controlled eligible order/invoice only | Return request |
| 47 | `GET` | `/returns/:id` | business-or-owner | Linked business or owner/admin only | Return detail |
| 48 | `GET` | `/returns/order/:orderId` | business-or-owner | Linked business or owner/admin only | Returns by order |
| 49 | `POST` | `/invoicing/invoices` | owner-admin | Controlled order only; one invoice | Invoice create |
| 50 | `GET` | `/invoicing/invoices/:id` | business-or-owner | Linked business or owner/admin only | Invoice detail |
| 51 | `GET` | `/invoicing/client-invoices/:clientBusinessId` | business-or-owner | Own business or owner/admin only | Invoices by client |
| 52 | `POST` | `/notifications/subscriptions` | business | Controlled subscription success | Notification subscribe |
| 53 | `GET` | `/notifications/subscriptions` | business | Only current user's subscriptions | Notification subscriptions |
| 54 | `DELETE` | `/notifications/subscriptions/:id` | business | Owner of subscription only; controlled delete | Notification unsubscribe |
| 55 | `GET` | `/notifications` | business | Only current user's notifications | Notification list |
| 56 | `PUT` | `/notifications/:id/read` | business | Owner of notification only | Notification read |
| 57 | `GET` | `/staff` | owner | Owner AAL2 only | Staff list |
| 58 | `POST` | `/staff` | owner | Owner AAL2 only; controlled duplicate/invalid invitation validation | Staff invite |
| 59 | `PUT` | `/staff/:id/toggle-active` | owner | Dedicated test staff only; toggle and restore | Staff active state |
| 60 | `PUT` | `/staff/:id/change-role` | owner | Dedicated test staff only; change and restore | Staff role |
| 61 | `GET` | `/accounting/summary` | owner | Owner AAL2 only; 200 | Accounting summary |
| 62 | `GET` | `/accounting/revenue` | owner | Owner AAL2 only; 200 | Accounting revenue |
| 63 | `GET` | `/accounting/expenses` | owner | Owner AAL2 only; 200 | Expense list |
| 64 | `POST` | `/accounting/expenses` | owner | Controlled tagged expense; success then cleanup | Expense create |
| 65 | `GET` | `/accounting/outstanding` | owner | Owner AAL2 only; 200 | Outstanding clients |
| 66 | `GET` | `/settings` | owner | Owner AAL2 only; 200 | Settings read |
| 67 | `PUT` | `/settings` | owner | No-op write using current values; 200 and no unintended changes | Settings update |
| 68 | `GET` | `/dashboard/stats` | owner-admin | Owner/admin AAL2 only; 200 | Dashboard |
| 69 | `GET` | `/audit-logs` | owner | Owner AAL2 only; 200; verification actions visible | Audit logs |

If the live OpenAPI inventory contains an operation not represented above:

1. Mark Gate 6 `FAILED`.
2. Record the exact method, path, operation ID, tags, request schema, and security metadata.
3. Do not mark route coverage complete.
4. Do not invent a result for the missing route.

If an operation above is not present in live OpenAPI:

1. Mark Gate 6 `FAILED`.
2. Record the missing route.
3. Check the deployed commit identity again.
4. Do not continue route-specific write tests until deployment identity is resolved.

---

## 9. Gate 7 — Unauthenticated route and security-boundary sweep

Create a request helper:

```powershell
function Invoke-RecordedRequest {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers = @{},
    [object]$Body = $null
  )

  $params = @{
    Method = $Method
    Uri = $Url
    Headers = $Headers
    SkipHttpErrorCheck = $true
    MaximumRedirection = 0
  }

  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 20)
  }

  $response = Invoke-WebRequest @params
  [pscustomobject]@{
    name = $Name
    method = $Method
    url = $Url
    status = $response.StatusCode
    headers = $response.Headers
    body = $response.Content
  } | ConvertTo-Json -Depth 20 |
    Set-Content "artifacts/production-verification/http/$Name.json"

  return $response
}
```

Run public endpoints:

```powershell
$fixtures = Get-Content artifacts/production-verification/database/fixtures.json | ConvertFrom-Json

$publicChecks = @(
  @{ name="health"; method="GET"; url="$env:PRODUCTION_API_URL/" },
  @{ name="products"; method="GET"; url="$env:PRODUCTION_API_URL/products?page=1&limit=20" },
  @{ name="products-search"; method="GET"; url="$env:PRODUCTION_API_URL/products?page=1&limit=20&search=$([uri]::EscapeDataString($fixtures.sku))" },
  @{ name="product-sku"; method="GET"; url="$env:PRODUCTION_API_URL/products/$($fixtures.sku)" },
  @{ name="product-id"; method="GET"; url="$env:PRODUCTION_API_URL/products/id/$($fixtures.product_id)" },
  @{ name="categories"; method="GET"; url="$env:PRODUCTION_API_URL/categories" },
  @{ name="filter-options"; method="GET"; url="$env:PRODUCTION_API_URL/catalogue/filter-options" }
)

foreach ($check in $publicChecks) {
  $r = Invoke-RecordedRequest $check.name $check.method $check.url
  if ($r.StatusCode -ne 200) {
    throw "Public endpoint failed: $($check.url) status=$($r.StatusCode)"
  }
  if ($r.Content -match '"buyingPrice"' -or $r.Content -match '"buying"') {
    throw "Public response exposed buying price data: $($check.url)"
  }
}
```

Test invalid public inputs:

```powershell
$invalidPublicChecks = @(
  @{ name="product-unknown-sku"; method="GET"; url="$env:PRODUCTION_API_URL/products/PROD-VERIFY-NOT-FOUND" },
  @{ name="product-unknown-id"; method="GET"; url="$env:PRODUCTION_API_URL/products/id/00000000-0000-0000-0000-000000000000" },
  @{ name="products-invalid-page"; method="GET"; url="$env:PRODUCTION_API_URL/products?page=-1&limit=999999" }
)

foreach ($check in $invalidPublicChecks) {
  $r = Invoke-RecordedRequest $check.name $check.method $check.url
  if ($r.StatusCode -ge 500) {
    throw "Invalid public input caused a server error: $($check.url)"
  }
}
```

For every protected route in the route matrix:

1. Replace each path parameter with either a fixture ID or `00000000-0000-0000-0000-000000000000`.
2. Send the request with no cookie and no Authorization header.
3. For `POST`, `PUT`, `PATCH`, and `DELETE`, use `{}` as the body.
4. Accept only `401` or `403`.
5. Any `2xx`, redirect to an authenticated page, or `5xx` is a failure.
6. Save one JSON evidence file per operation.

For custom public authentication endpoints:

- Invalid credentials must return `400`, `401`, or `409`.
- They must never return `5xx`.
- They must not reveal whether an arbitrary email exists, except where the product intentionally uses a generic conflict message during controlled registration.

---

## 10. Gate 8 — BetterAuth configuration, cookie flow, session lifecycle, OAuth configuration, and MFA

### 10.1 Static configuration checks

Inspect:

```powershell
Get-Content apps/api/src/auth/better-auth.ts
Get-Content apps/api/src/auth/auth.controller.ts
Get-Content apps/api/src/auth/auth.service.ts
Get-Content apps/api/src/auth/guards/better-auth.guard.ts
Get-Content apps/api/src/auth/guards/roles.guard.ts
Get-Content apps/web/src/app/api/auth/[...all]/route.ts
Get-Content apps/admin/src/app/api/auth/[...all]/route.ts
Get-Content apps/web/src/hooks/use-auth.tsx
Get-Content apps/admin/src/hooks/use-admin-auth.tsx
```

Fail when any of these are found in an active production path:

```powershell
$forbiddenAuthPatterns = @(
  "sessionStorage.setItem",
  "sessionStorage.getItem",
  "twoFactorVerified = true",
  "sessionTwoFactorVerified = true",
  "JWT_SECRET || `"test",
  "secure: true,\s*sameSite: `"none`""
)

foreach ($pattern in $forbiddenAuthPatterns) {
  $matches = git grep -n -E $pattern -- `
    "apps/api/src/auth/**" `
    "apps/web/src/**" `
    "apps/admin/src/**" 2>$null
  if ($matches) {
    $matches | Add-Content artifacts/production-verification/auth-forbidden-patterns.txt
  }
}
```

Manually validate and record:

1. BetterAuth has one production `baseURL`.
2. The base path matches the backend handler.
3. Trusted origins contain exactly the production web/admin origins plus deliberate local development origins.
4. Production cookies are `Secure`, `HttpOnly`, and use the intended `SameSite` policy.
5. Google OAuth client ID and secret are both configured or both absent.
6. Password-reset callback uses the URL supplied by BetterAuth.
7. Reset tokens are not logged.
8. Sessions are stored in `session`.
9. Credential accounts are stored in `account`.
10. Role and `isActive` are reloaded from the database for authorization.
11. Privileged routes require MFA-derived assurance.
12. There is no browser-controlled MFA proof.

### 10.2 Browser automation dependencies

Install without changing the lockfile:

```powershell
npm install --no-save --package-lock=false playwright otpauth
npx playwright install chromium
```

### 10.3 Business-user login and session verification

Use Chromium and perform these exact actions:

1. Open `$env:PRODUCTION_WEB_URL/login`.
2. Locate the identifier field by the first matching selector:
   - `input[name="email"]`
   - `input[name="identifier"]`
   - `input[type="email"]`
3. Locate `input[type="password"]`.
4. Fill `VERIFY_BUSINESS_EMAIL` and `VERIFY_BUSINESS_PASSWORD`.
5. Submit the form.
6. Fail if the login request returns `5xx`.
7. Fail if the browser remains on the login page after the application finishes loading.
8. Call `$env:PRODUCTION_WEB_URL/api/auth/api/get-session` from the same browser context.
9. Require HTTP `200`.
10. Require a non-null user.
11. Require returned user email equals `VERIFY_BUSINESS_EMAIL`.
12. Save browser storage state to `artifacts/production-verification/browser/business-state.json`. Keep this file uncommitted.
13. Inspect cookies: session cookie exists, `httpOnly=true`, `secure=true`, expected host, expiry in the future.
14. Call `$env:PRODUCTION_WEB_URL/api/backend/users/me`.
15. Require `200`.
16. Require the returned user ID equals the session user ID.
17. Call `$env:PRODUCTION_WEB_URL/api/backend/clients/me`.
18. Record whether a linked business exists and its account status.
19. Attempt `$env:PRODUCTION_WEB_URL/api/backend/dashboard/stats`.
20. Require `403`.
21. Sign out.
22. Call `get-session` again.
23. Require a null session.
24. Call `/api/backend/users/me` again.
25. Require `401` or `403`.

### 10.4 Invalid login

1. Submit the correct business email with an intentionally wrong password.
2. Require `400` or `401`.
3. Require no session cookie.
4. Require no user enumeration details.
5. Require no `5xx`.

### 10.5 Owner login and MFA

1. Open `$env:PRODUCTION_ADMIN_URL/login`.
2. Fill owner email and password.
3. Submit.
4. If the account has MFA enabled, require the application to present an OTP field.
5. Generate the current TOTP only from `VERIFY_OWNER_TOTP_SECRET`.
6. Enter the code and submit.
7. Do not store the TOTP code.
8. Require the admin shell to load.
9. Call `$env:PRODUCTION_ADMIN_URL/api/auth/api/get-session`.
10. Require a non-null owner/admin user.
11. Require role is `owner` or `admin`.
12. Require the session or server authorization path to establish MFA assurance.
13. Call `$env:PRODUCTION_ADMIN_URL/api/backend/dashboard/stats`.
14. Require `200`.
15. Call `$env:PRODUCTION_ADMIN_URL/api/backend/accounting/summary`.
16. Require `200` for owner.
17. Save storage state to `artifacts/production-verification/browser/owner-state.json`.
18. Query the production database for the owner's latest session: row exists, expiry is in the future, user ID matches.
19. Sign out.
20. Query sessions again and verify the signed-out session is invalidated or no longer accepted.
21. Calling owner endpoints after sign-out must return `401` or `403`.

If MFA is enabled but no OTP challenge occurs, fail.  
If OTP succeeds but privileged API calls return an assurance error, fail.  
If a privileged API call succeeds before OTP completion, fail.

### 10.6 Google OAuth

Perform only when Google provider variables are configured.

1. Start Google sign-in from the production web URL.
2. Capture the initial authorization request.
3. Confirm `redirect_uri` resolves back through the intended production auth callback.
4. Confirm the state cookie is created on the production web origin.
5. Complete login using a dedicated verification Google account.
6. Require return to the production web origin.
7. Require `get-session` to return the Google account.
8. Require no state-mismatch, callback-origin, or missing-cookie error.
9. Sign out.
10. Repeat from the production admin origin with an allowed staff/owner Google account.
11. A non-staff Google account must not gain admin access.

If no dedicated Google account is supplied, mark this sub-gate `BLOCKED`; do not mark it passed from configuration inspection.

### 10.7 Password reset end to end

1. Use only the dedicated verification mailbox.
2. Submit password-reset request from the production web UI.
3. Require the same generic response for existing and random email addresses.
4. Connect to the dedicated mailbox using the supplied mailbox variables.
5. Retrieve the newest reset email generated after the test started.
6. Confirm sender, subject, HTTPS link, and production host.
7. Confirm no raw token appears in application logs.
8. Open the link in a fresh browser context.
9. Set a temporary strong password.
10. Sign in with the temporary password.
11. Require success.
12. Change the password back to the original dedicated verification password.
13. Require old sessions issued before reset to be invalid or explicitly record failure.
14. Delete the reset email from the dedicated mailbox only when mailbox policy permits it.

If mailbox credentials are absent, mark this sub-gate `BLOCKED`.

---

## 11. Gate 9 — Authenticated route sweep and authorization matrix

Use the browser storage states produced in Gate 8.

For every `GET` route:

1. Execute through the correct same-origin frontend proxy:
   - web business calls: `$env:PRODUCTION_WEB_URL/api/backend/...`
   - owner/admin calls: `$env:PRODUCTION_ADMIN_URL/api/backend/...`
2. Use the role required in the route matrix.
3. Use IDs from `database/fixtures.json` or controlled workflow IDs.
4. Require the expected `2xx` or deliberate `404`.
5. Never accept `5xx`.
6. Execute the same route with an unauthorized role.
7. Require `401`, `403`, or privacy-preserving `404`.
8. Compare returned business/customer IDs with the authenticated account.
9. Search every customer-visible JSON response recursively for `buyingPrice`, price type `buying`, another client's price, password hash, session token, TOTP secret, or reset token.
10. Any match is a critical failure.

For every write route not included in the controlled workflow:

1. Send an invalid or empty payload with the authorized role.
2. Require `400`, `404`, or `409`.
3. Require no record count change.
4. Require no `5xx`.
5. Do not send valid data to a real record.

Route coverage is:

```text
executed operations / discovered OpenAPI operations × 100
```

Required route coverage is `100%`.

---

## 12. Gate 10 — Controlled production write workflow

Before this gate:

```powershell
if ($env:ALLOW_PRODUCTION_VERIFICATION_WRITES -ne "YES") {
  throw "Controlled production writes are not enabled."
}
```

All generated names, descriptions, reasons, idempotency keys, and audit reasons must contain `$env:PRODUCTION_VERIFICATION_MARKER`.

### 12.1 Create a dedicated pending business identity

Use a unique email and mobile reserved for verification. Never use a real customer's values.

1. Register a BetterAuth email identity through the production web flow.
2. Use name `$marker Business User`.
3. Use business name `$marker Business`.
4. Complete `/clients` registration.
5. Record user ID, client business ID, business-user-link ID, account ID, and session ID.
6. Require initial business status is `pending`.
7. Owner lists clients and sees the pending business.
8. Owner approves it through `PUT /clients/:id/approve`.
9. Business user refreshes `/clients/me`.
10. Require status is `active`.
11. Attempt registration again with the same mobile.
12. Require `409` with no new link and no ownership takeover.

### 12.2 Create and activate a synthetic product

Use:

```json
{
  "name": "<marker> Product",
  "categoryId": "<fixture category_id>",
  "purchaseType": "unconfirmed",
  "shopName": "<marker>",
  "description": "<marker> production verification product",
  "wholesalePrice": 1
}
```

Steps:

1. Owner calls `POST /products`.
2. Require `2xx`.
3. Record product ID, SKU, and base packaging ID.
4. Require status is `pending_review`.
5. Public `GET /products/:sku` must return `404` before activation.
6. Owner calls `PUT /products/:id` with a description containing the marker.
7. Owner calls `PUT /products/:id/status` with `active`.
8. Public `GET /products/:sku` must return `200`.
9. Public response must not contain buying price.
10. Business pricing response must not contain buying price.

### 12.3 Stock workflow

1. Use the recorded synthetic product ID.
2. Use the active stock location from fixtures.
3. Call `POST /stock/opening` with quantity `10` and marker reason.
4. Require opening status changes from not counted to initialized.
5. Call `GET /stock/:sku`.
6. Require available quantity is `10`, subject to documented conversion.
7. Call `POST /stock/adjustments` with `quantityDelta=2`.
8. Require available quantity becomes `12`.
9. Call another adjustment with `quantityDelta=-2`.
10. Require available quantity returns to `10`.
11. Verify corresponding stock movements and audit entries exist.

### 12.4 Order idempotency and authorization

Create an order using:

```json
{
  "clientBusinessId": "<controlled client business ID>",
  "items": [
    {
      "productPackagingId": "<controlled packaging ID>",
      "quantity": 1
    }
  ],
  "recipientName": "<marker>",
  "mobile": "<dedicated verification mobile>",
  "address": "<marker> address",
  "city": "Wah Cantt",
  "deliveryNotes": "<marker>",
  "paymentMethod": "cash",
  "fulfilmentMethod": "pickup",
  "idempotencyKey": "<marker>-ORDER-1"
}
```

Steps:

1. Business user calls `POST /orders`.
2. Require `2xx`.
3. Record order ID and order number.
4. Repeat the same request with the same idempotency key.
5. Require the same order or explicit idempotency response.
6. Query database and require only one order for the key.
7. Business user lists orders and sees the order.
8. Business user gets the order by ID.
9. A different business user must receive `404` or `403`.
10. Owner gets the order.
11. Owner performs only valid status transitions.
12. An invalid transition must return `400` or `409`.

### 12.5 Invoice workflow

1. Owner calls `POST /invoicing/invoices` with the controlled order ID.
2. Require `2xx`.
3. Record invoice ID and number.
4. Owner calls `GET /invoicing/invoices/:id`.
5. Controlled business calls the same route and receives its invoice.
6. Different business receives `404` or `403`.
7. Controlled business calls `/invoicing/client-invoices/:clientBusinessId`.
8. Require the created invoice appears.
9. Verify shared SDK uses the exact `/invoicing/...` paths.

### 12.6 Delivery workflow

1. Owner calls `POST /deliveries` with `{ "orderId": "<controlled order ID>" }`.
2. Require `2xx`.
3. Record delivery ID.
4. Call `GET /deliveries/:id`.
5. Call `GET /deliveries/order/:orderId`.
6. Require both responses identify the same delivery and order.
7. Business user must not list all deliveries.

### 12.7 Return workflow

1. Move the controlled order only through valid statuses until eligible for return.
2. Business user calls `POST /returns` with controlled order ID, invoice ID, and marker reason.
3. Require `2xx`.
4. Record return ID.
5. Controlled business calls `GET /returns/:id`.
6. Controlled business calls `GET /returns/order/:orderId`.
7. Different business receives `404` or `403`.
8. Verify return references the correct order and invoice.

### 12.8 Notifications

1. Business user calls `POST /notifications/subscriptions` for the controlled product.
2. Record subscription ID.
3. Call `GET /notifications/subscriptions`.
4. Require only current user's subscriptions.
5. Call `GET /notifications`.
6. If a controlled notification exists, mark it read and verify `readAt`.
7. Delete the controlled subscription.
8. Require it no longer appears.
9. Another user may not delete it.

### 12.9 Settings no-op

1. Owner reads `GET /settings`.
2. Save the complete response.
3. Owner sends `PUT /settings` with exactly the same values.
4. Read settings again.
5. Require values are unchanged.
6. Record the audit event.
7. Do not change any setting to a new value.

### 12.10 Accounting expense

1. Owner creates one expense with amount `1`, category `verification`, and marker description.
2. Record expense ID.
3. Require it appears in `/accounting/expenses`.
4. Require accounting summary remains internally consistent.
5. Cleanup must delete only this exact tagged expense ID.

### 12.11 Staff session revocation

Run only when `VERIFY_TEST_STAFF_USER_ID` is set.

1. Read the dedicated staff user's role and active state from the database.
2. Require they match the expected environment values.
3. Log the staff user in and save a session.
4. Owner toggles active status to disabled.
5. Reuse the saved session against an allowed endpoint.
6. Require `401` or `403`.
7. Toggle active status back to the original state.
8. Change role to another non-owner staff role.
9. Require existing sessions are revoked.
10. Restore the original role.
11. Confirm final role and active state exactly match the baseline.
12. Never run this against an owner or a real employee account.

### 12.12 Audit verification

1. Owner calls `GET /audit-logs`.
2. Search for the run marker.
3. Require entries for business approval, product changes, stock changes, order status, invoice, delivery, return, settings, and staff changes when executed.
4. Actor IDs must match the authenticated user.
5. Entity IDs must match recorded synthetic IDs.

---

## 13. Gate 11 — Cleanup of controlled records

Cleanup is mandatory even when a write sub-gate fails.

Before cleanup:

1. Load `created-records.json`.
2. Reject cleanup if marker is empty.
3. Reject cleanup for any record whose stored marker differs from the current run marker.
4. Query every target and verify its name, description, reason, idempotency key, or audit marker contains the current marker.
5. If any target does not contain the marker, stop and mark cleanup `FAILED`.

Cleanup order:

1. Notification subscriptions and notifications created by the run.
2. Return items, refunds, and return created by the run.
3. Delivery attempts, assignments, and delivery created by the run.
4. Invoice-related controlled records.
5. Order items, status history, reservations, and order created by the run.
6. Controlled stock movements and balances for the synthetic product only.
7. Controlled product prices, packaging, aliases, mappings, and product.
8. Controlled expense.
9. Controlled business approval, credit account, business-user link, and client business.
10. Controlled BetterAuth session, account, verification, two-factor, and user.
11. Do not delete audit logs unless formal retention policy permits deletion.

Use a database transaction for cleanup. Roll back if any safety assertion fails.

After cleanup:

1. Query every recorded ID.
2. Require removable records are absent.
3. Require restored staff and settings match baseline.
4. Require no real data counts changed except expected retained audit entries.
5. Update `created-records.json` with cleanup status.

---

## 14. Gate 12 — Web application end-to-end checks

Use Chromium desktop viewport `1440x900`.

### Public web

1. Open home page.
2. Require no browser console errors.
3. Require no failed first-party network request with status `5xx`.
4. Navigate to catalogue.
5. Search by the fixture SKU.
6. Open product detail.
7. Compare displayed name, SKU, category, and public prices with API response.
8. Verify no buying price appears in HTML, JSON page data, or network responses.
9. Test category, sale type, stock, unit, min/max price, and sort filters.
10. Refresh each filtered URL and require state is preserved.
11. Test pagination and empty search.
12. Verify mobile-width layout at `390x844`.

### Business web

1. Sign in.
2. Refresh and require session persistence.
3. Verify business account status.
4. Verify own orders only.
5. Verify invoice and return pages use `/invoicing/...` and `/returns/...`.
6. Sign out and verify protected pages redirect to login.
7. Use browser back and require protected data is not visible from stale state.

### Browser security

1. Inspect cookies for `Secure` and `HttpOnly`.
2. Confirm no auth token is stored in `localStorage` or `sessionStorage`.
3. Confirm API calls use same-origin frontend proxy paths.
4. Confirm CORS errors do not appear.
5. Confirm no database URL, service-role key, private API key, or secret is present in page source or bundles.

---

## 15. Gate 13 — Admin application end-to-end checks

Use Chromium desktop viewport `1440x900`.

1. Open admin login.
2. Authenticate owner and complete MFA.
3. Require admin dashboard loads.
4. Record network requests for dashboard, products, clients, orders, stock, accounting, staff, settings, audit, delivery, and invoices.
5. Require no route returns `5xx`.
6. Require business user cannot open admin pages or APIs.
7. Test catalogue create/edit/status using only the synthetic product.
8. Test stock using only the synthetic product.
9. Test clients using only the synthetic business.
10. Test orders, invoice, delivery, and return using only controlled records.
11. Test accounting reads and controlled expense.
12. Test audit marker search.
13. Test settings read and no-op save.
14. Test staff mutation only on the dedicated verification staff record.
15. Refresh each page and require session remains valid.
16. Sign out and confirm admin APIs return `401` or `403`.
17. Confirm missing role never defaults to owner/admin.
18. Confirm MFA state is not stored in browser storage.

---

## 16. Gate 14 — Mobile application integration

The mobile workspace must communicate with production services and must not replace failed requests with mock authorization or mock business data.

### Static checks

Run:

```powershell
git grep -n -E `
  -e "Demo Role Fast-Login" `
  -e "onSignInSuccess\\(.*wholesale" `
  -e "MOCK_USERS" `
  -e "MOCK_ORDERS" `
  -e "falling back to client-side" `
  -e "PRODUCTS.filter" `
  -- "apps/mobile/src/**" |
  Tee-Object artifacts/production-verification/mobile-mock-scan.txt
```

Pass criteria:

- Production build does not allow user-selected roles.
- Sign-in calls a real authentication endpoint.
- No arbitrary password succeeds.
- Failed API calls display an error and do not switch to mock data.
- Mobile uses the correct production base URL.
- Catalogue parameter names match backend parameters.
- Product response parsing uses the backend's `items` structure.
- Order payload matches `POST /orders`.
- Session cookies or tokens follow the selected mobile architecture.

Build:

```powershell
$env:VITE_API_URL = $env:PRODUCTION_API_URL
npm run build --workspace=@raza-stationers/mobile
if ($LASTEXITCODE -ne 0) { throw "Mobile production build failed." }
```

Serve:

```powershell
$mobileJob = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  npm run dev --workspace=@raza-stationers/mobile -- --host 127.0.0.1
}
Start-Sleep -Seconds 10
```

Browser validation at the printed local URL:

1. Open at `390x844`.
2. Attempt wrong password; require failure.
3. Sign in with dedicated business account; require real session.
4. Capture network requests.
5. Require catalogue request reaches production API or approved production proxy.
6. Require product list matches production API.
7. Require no hardcoded role switch.
8. Require no mock order appears unless created through controlled workflow.
9. Create no order unless write mode is enabled and controlled business/product are used.
10. When enabled, create one mobile order with unique idempotency key and verify it in web/admin/API/database.
11. Sign out and verify session is cleared.
12. Stop the local job.

```powershell
Stop-Job $mobileJob -ErrorAction SilentlyContinue
Remove-Job $mobileJob -Force -ErrorAction SilentlyContinue
```

Any mock login, mock role, silent mock fallback, mismatched API contract, or arbitrary-password success is a critical mobile failure.

---

## 17. Gate 15 — Connectivity, dependencies, and production logs

### API dependency checks

1. Call health ten times at five-second intervals.
2. Require ten `200` responses.
3. Require database status `connected` every time.
4. Measure min, median, p95, and max latency.
5. Call catalogue ten times.
6. Require no intermittent `5xx`.
7. Confirm DNS for web, admin, API, and Supabase host.
8. Confirm TLS certificates are valid and unexpired.
9. Confirm redirects preserve HTTPS.
10. Confirm no mixed-content requests.

### Render logs

Retrieve logs covering the verification window. Search for:

- `ERROR`
- `Unhandled`
- `UnknownDependenciesException`
- `PrismaClient`
- `P1001`
- `P2025`
- `ECONNRESET`
- `CORS`
- `OAuth`
- `state`
- `cookie`
- `JWT`
- `two-factor`
- `reset`
- raw token-like values
- database URLs

Fail for unhandled exceptions, test-generated `5xx`, secret logging, repeated database failures, OAuth state failures, or valid MFA failures.

### Vercel logs

Retrieve runtime errors and logs for both projects covering the verification window.

Fail for repeated `5xx`, auth/backend proxy errors, lost `Set-Cookie`, function timeout, or secret logging.

Save sanitized logs under `artifacts/production-verification/logs/`.

---

## 18. Gate 16 — Final reconciliation and certification

Run:

```powershell
git status --short
git diff --stat
git diff
```

Allowed local changes:

- `docs/production/production_verification_progress.md`
- `artifacts/production-verification/**`
- temporary uncommitted verification scripts under `scripts/production/**`

No application code, migration, dependency, or deployment configuration may change.

Final reconciliation:

1. Re-run database verification.
2. Re-run migration status.
3. Re-run health.
4. Re-run public catalogue.
5. Re-run unauthenticated protected-route sweep.
6. Confirm all synthetic records were cleaned or intentionally retained according to policy.
7. Confirm settings and staff baseline were restored.
8. Confirm all verification sessions are signed out or revoked.
9. Confirm no active verification business, user, product, or order remains.
10. Confirm route coverage equals `100%`.

Final report format:

```markdown
# Production Verification Final Report

## Identity
- Branch:
- Commit:
- Supabase project:
- Render service:
- Render deployment:
- Web project/deployment:
- Admin project/deployment:
- API URL:
- Web URL:
- Admin URL:

## Results
- Local build/test:
- Database:
- Render:
- Vercel:
- OpenAPI route coverage:
- BetterAuth email login:
- BetterAuth session lifecycle:
- MFA:
- Google OAuth:
- Password reset:
- Authorization isolation:
- Public catalogue:
- Product/stock:
- Business approval:
- Order:
- Invoice:
- Delivery:
- Return:
- Notifications:
- Accounting:
- Staff revocation:
- Web UI:
- Admin UI:
- Mobile:
- Logs:
- Cleanup:

## Route coverage
- Discovered operations:
- Executed operations:
- Passed:
- Failed:
- Blocked:
- Coverage percentage:

## Production data changes
- Created IDs:
- Removed IDs:
- Retained audit IDs:
- Restored records:
- Unresolved records:

## Failures
For each failure:
- Gate:
- Severity:
- Command/request:
- Expected:
- Actual:
- Evidence:
- User impact:
- Recommended fix:

## Verdict
- PASS / FAIL
- Manual testing recommendation:
- Production use recommendation:
```

### PASS criteria

All are mandatory:

1. Repository, Render, and Vercel use the same branch and commit.
2. API health and database connectivity pass.
3. Production Supabase identity is exact.
4. Every migration is applied.
5. BetterAuth schema and security checks pass.
6. No publicly executable security-definer function remains.
7. OpenAPI operation coverage is `100%`.
8. No route returns an unexpected `5xx`.
9. BetterAuth email login, session persistence, and logout pass.
10. Owner MFA passes end to end.
11. Privileged APIs cannot be used before MFA.
12. Cross-business requests fail.
13. Customer-visible responses never contain buying prices.
14. Catalogue, business approval, product, stock, order, invoice, delivery, return, notification, accounting, and audit workflows pass.
15. Password reset passes or certification is `BLOCKED`.
16. Google OAuth passes when enabled; otherwise record provider-disabled state.
17. Web and admin deployments pass browser checks.
18. Mobile uses real authentication and production APIs with no mock authorization fallback.
19. Production logs contain no unhandled errors or secrets.
20. Cleanup and restoration pass.
21. No real production record was altered.
22. No critical or high failure remains.

Any failed mandatory condition produces final verdict `FAIL`.

---

## 19. Final agent instruction

Execute Gates 1 through 16 in order. Update the progress report after every gate. Do not mark a gate passed from a previous report. Reproduce every result during this run. Do not infer missing credentials, IDs, routes, or expected behavior. Mark missing prerequisites `BLOCKED`. Do not modify application code. At the end, provide the final report and evidence directory paths.
