import "dotenv/config";
import pg from "pg";

async function checkTwoFactorTable() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to DB.");

  try {
    const tableRes = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%two%'"
    );
    console.log("Two factor tables in DB:", tableRes.rows);

    const colsRes = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'two_factor' OR table_name = 'user' OR table_name = 'users'"
    );
    console.log("Columns for two_factor / users:", colsRes.rows.filter(c => c.column_name.includes('two')));
  } catch (err) {
    console.error("DB query error:", err);
  }

  await client.end();
}

checkTwoFactorTable().catch(console.error);
