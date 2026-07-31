// debug_104_cats.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const client = await pool.connect();
  try {
    const cats = await client.query(`
      SELECT c.id, c.name, c.slug, c.created_at, COUNT(p.id) as p_count
      FROM categories c
      JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.created_at
      ORDER BY c.slug, c.created_at;
    `);

    console.log(`Categories WITH products: ${cats.rows.length}`);
    const slugMap = new Map();
    for (const r of cats.rows) {
      if (!slugMap.has(r.slug)) {
        slugMap.set(r.slug, []);
      }
      slugMap.get(r.slug).push(r);
    }

    for (const [slug, list] of slugMap.entries()) {
      if (list.length > 1) {
        console.log(`\nDUPLICATE SLUG: "${slug}":`);
        for (const item of list) {
          console.log(`  ID: ${item.id} | Name: "${item.name}" | Created: ${item.created_at} | Prods: ${item.p_count}`);
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

check();
