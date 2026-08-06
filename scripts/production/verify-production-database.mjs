import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const projectRef = process.env.SUPABASE_PROJECT_REF || "pqlmgqzpjjllhgalyhwz";
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
  rows => rows.length === 24
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
         has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
         has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prosecdef=true
    and p.proname not in ('rls_auto_enable')
  order by p.proname
  `,
  rows => rows.every(row =>
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
  select p.id as product_id, p.sku, p.status, p.category_id,
         pp.id as packaging_id, pp.unit_of_measure_id
  from products p
  join product_packaging pp on pp.product_id=p.id and pp.is_active=true
  where p.status in ('active', 'pending_review')
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
