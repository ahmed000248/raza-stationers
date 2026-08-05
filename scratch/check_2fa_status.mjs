import "dotenv/config";
import pg from "pg";

async function check2faStatus() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to DB.");

  const userRes = await client.query(`SELECT id, email, role, two_factor_enabled FROM public.users WHERE email = 'ahmedraa0007@gmail.com'`);
  console.log("User:", userRes.rows[0]);

  if (userRes.rows[0]) {
    const userId = userRes.rows[0].id;
    const twoFactorRes = await client.query(`SELECT id, user_id, verified, secret FROM public.two_factor WHERE user_id = $1`, [userId]);
    console.log("TwoFactor record:", twoFactorRes.rows[0]);
  }

  await client.end();
}

check2faStatus().catch(console.error);
