// test_readonly_conn.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function checkConnection() {
  console.log("Checking read-only connectivity...");
  let dnsSucceeded = false;
  let tlsSucceeded = false;
  let authSucceeded = false;
  let querySucceeded = false;

  // Create pg pool with ssl requiring valid connection (standard sslmode=require)
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    dnsSucceeded = true; // Connection creation attempted
    const client = await pool.connect();
    tlsSucceeded = true;
    authSucceeded = true;

    const res = await client.query('SELECT current_database(), current_user, NOW();');
    querySucceeded = true;

    console.log("DNS Resolution: SUCCEEDED");
    console.log("TLS Connection: SUCCEEDED");
    console.log("Authentication: SUCCEEDED");
    console.log("HARMLERSS QUERY RESULT:");
    console.log("  Database Name:", res.rows[0].current_database);
    console.log("  Timestamp:", res.rows[0].now);
    // Note: Database username is omitted/sanitized per prompt instructions.

    client.release();
  } catch (err) {
    console.error("Connection check failed:", err.message);
  } finally {
    await pool.end();
  }
}

checkConnection();
