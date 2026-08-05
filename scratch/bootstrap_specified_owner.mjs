import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

async function bootstrapOwner() {
  const connectionString = process.env.DATABASE_URL;
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to PostgreSQL DB.");

  const email = "ahmedraa0007@gmail.com";
  const rawPassword = "@hmed.raza6246667";
  const name = "Ahmed Raza";
  const mobile = "03105008398";
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  // 1. Check or Upsert User in public.users
  const userRes = await client.query(
    "SELECT id, email, role FROM public.users WHERE LOWER(email) = LOWER($1)",
    [email]
  );

  let userId;
  if (userRes.rows.length > 0) {
    userId = userRes.rows[0].id;
    console.log("Updating existing user record:", userId);
    await client.query(
      "UPDATE public.users SET name = $1, mobile_number = $2, role = 'owner'::public.user_role, is_active = true, updated_at = now() WHERE id = $3",
      [name, mobile, userId]
    );
  } else {
    console.log("Creating new owner user record...");
    const newRes = await client.query(
      "INSERT INTO public.users (id, name, email, mobile_number, role, is_active, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, 'owner'::public.user_role, true, now(), now()) RETURNING id",
      [name, email, mobile]
    );
    userId = newRes.rows[0].id;
  }

  // 2. Insert or Update Better Auth public.account record
  const accountId = `account-${userId}`;
  await client.query(
    `INSERT INTO public.account (id, user_id, account_id, provider_id, password, created_at, updated_at)
     VALUES ($1, $2, $3, 'credential', $4, now(), now())
     ON CONFLICT (id) DO UPDATE SET password = $4, updated_at = now()`,
    [accountId, userId, userId, hashedPassword]
  );

  console.log("Successfully created/updated account for", email);

  // 3. Verify final state
  const verifyRes = await client.query(
    "SELECT u.id, u.email, u.name, u.role, u.is_active, a.id as account_id, a.provider_id, a.password FROM public.users u JOIN public.account a ON u.id = a.user_id WHERE u.email = $1",
    [email]
  );
  console.log("Verified database state:", verifyRes.rows);

  await client.end();
}

bootstrapOwner().catch(console.error);
