// inspect_db_triggers.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const client = await pool.connect();
  try {
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      ORDER BY event_object_table;
    `);

    console.log(`Triggers count: ${triggers.rows.length}\n`);
    for (const t of triggers.rows) {
      console.log(`Table: ${t.event_object_table} | Trigger: ${t.trigger_name} | Event: ${t.event_manipulation}`);
    }

    const functions = await client.query(`
      SELECT proname, prosrc FROM pg_proc JOIN pg_namespace n ON n.oid = pg_proc.pronamespace WHERE n.nspname = 'public';
    `);

    console.log("\nPL/pgSQL Functions:");
    for (const f of functions.rows) {
      if (f.proname.includes('import') || f.proname.includes('mapping') || f.proname.includes('price')) {
        console.log(`\nFunction ${f.proname}:\n${f.prosrc}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

check();
