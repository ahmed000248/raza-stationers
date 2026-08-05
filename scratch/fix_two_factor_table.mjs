import "dotenv/config";
import pg from "pg";

async function fixTwoFactorTable() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to DB.");

  try {
    // 1. Ensure public.two_factor table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.two_factor (
        id text NOT NULL PRIMARY KEY,
        secret text NOT NULL,
        backup_codes text NOT NULL,
        user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
      );
    `);
    console.log("public.two_factor table verified.");

    // 2. Ensure unique index on user_id
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS two_factor_user_id_key ON public.two_factor(user_id);
    `);
    console.log("Unique index on two_factor(user_id) created/verified.");

    // 3. Ensure two_factor_enabled column on public.users
    await client.query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;
    `);
    console.log("two_factor_enabled column on public.users verified.");

  } catch (err) {
    console.error("Error fixing two_factor table:", err);
  }

  await client.end();
}

fixTwoFactorTable().catch(console.error);
