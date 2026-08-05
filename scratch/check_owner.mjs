import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

async function checkOwner() {
  const connectionString = process.env.DATABASE_URL;
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to DB successfully.");

  const res = await client.query(
    "SELECT u.id, u.email, u.name, u.role, u.is_active, a.id as account_id, a.provider_id, a.password FROM public.users u LEFT JOIN public.account a ON u.id = a.user_id WHERE LOWER(u.email) = 'ahmedraa0007@gmail.com'"
  );

  console.log("User query result:", res.rows);

  if (res.rows.length > 0) {
    const row = res.rows[0];
    if (row.password) {
      const matchNew = bcrypt.compareSync("@hmed.raza6246667", row.password);
      const matchOld = bcrypt.compareSync("raza_stationers@6246667", row.password);
      console.log("Password check (@hmed.raza6246667):", matchNew);
      console.log("Password check (raza_stationers@6246667):", matchOld);
    }
  }

  await client.end();
}

checkOwner().catch(console.error);
