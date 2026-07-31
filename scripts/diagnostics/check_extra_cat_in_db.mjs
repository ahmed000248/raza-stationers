// check_extra_cat_in_db.mjs
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT DISTINCT c.id, c.name, c.slug
      FROM categories c
      JOIN products p ON p.category_id = c.id
      ORDER BY c.name;
    `);
    console.log("Categories with products in DB:", res.rows.length);
    res.rows.forEach((r, idx) => {
      console.log(`${idx + 1}: ID: ${r.id} | Name: "${r.name}" | Slug: "${r.slug}"`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

check();
