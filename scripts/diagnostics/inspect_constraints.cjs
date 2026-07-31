// inspect_constraints.cjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND conname LIKE 'products_%'
      ORDER BY conname
    `);
    console.log("=== Products Table Check Constraints ===");
    res.rows.forEach(r => {
      console.log(`- ${r.conname}: ${r.def}`);
    });

    const res2 = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND conname LIKE 'import_batches_%'
      ORDER BY conname
    `);
    console.log("=== ImportBatches Table Check Constraints ===");
    res2.rows.forEach(r => {
      console.log(`- ${r.conname}: ${r.def}`);
    });
  } finally {
    client.release();
  }
}

run()
  .then(() => pool.end())
  .catch(e => { console.error(e); pool.end(); });
