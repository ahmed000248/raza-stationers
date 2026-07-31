// check_cat_counts.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const client = await pool.connect();
  try {
    const totalCats = await client.query('SELECT COUNT(*) FROM categories;');
    const catsWithProds = await client.query('SELECT c.id, c.name, COUNT(p.id) as p_count FROM categories c JOIN products p ON p.category_id = c.id GROUP BY c.id, c.name;');
    const catsWithoutProds = await client.query('SELECT c.id, c.name, COUNT(p.id) as p_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id, c.name HAVING COUNT(p.id) = 0;');

    console.log(`Total categories in DB: ${totalCats.rows[0].count}`);
    console.log(`Categories WITH products: ${catsWithProds.rows.length}`);
    console.log(`Categories WITHOUT products: ${catsWithoutProds.rows.length}`);

    // Check which category in catsWithProds is not in the canonical XLSX 103 categories
    console.log("\nCategories WITH products details:");
    for (const r of catsWithProds.rows) {
      if (r.p_count != 2167) {
        // console.log(`Category ${r.id} (${r.name}): ${r.p_count} products`);
      }
    }
    console.log("Total prods mapped:", catsWithProds.rows.reduce((acc, r) => acc + Number(r.p_count), 0));
  } finally {
    client.release();
    await pool.end();
  }
}

check();
