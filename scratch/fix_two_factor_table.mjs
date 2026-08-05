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
    await client.query(`
      ALTER TABLE public.two_factor ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
      ALTER TABLE public.two_factor ADD COLUMN IF NOT EXISTS failed_verification_count integer DEFAULT 0;
      ALTER TABLE public.two_factor ADD COLUMN IF NOT EXISTS transient_secret text;
      ALTER TABLE public.two_factor ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;
    `);
    console.log("Successfully added locked_until column to public.two_factor!");
  } catch (err) {
    console.error("Error updating two_factor columns:", err);
  }

  await client.end();
}

fixTwoFactorTable().catch(console.error);
