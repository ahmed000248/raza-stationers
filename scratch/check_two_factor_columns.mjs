import "dotenv/config";
import pg from "pg";

async function checkTwoFactorColumns() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const colsRes = await client.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'two_factor'"
  );
  console.log("public.two_factor columns:", colsRes.rows);

  await client.end();
}

checkTwoFactorColumns().catch(console.error);
