// check_84_cat_fk.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const client = await pool.connect();
  try {
    const unreferencedCats = await client.query(`
      SELECT c.id, c.name, c.slug, c.created_at
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.created_at
      HAVING COUNT(p.id) = 0;
    `);

    console.log(`Unreferenced Categories Count: ${unreferencedCats.rows.length}`);
    const unrefIds = unreferencedCats.rows.map(r => r.id);

    const mappingRefs = await client.query(`
      SELECT COUNT(*) FROM source_record_mappings WHERE category_id = ANY($1::text[]);
    `, [unrefIds]);

    console.log(`Source Record Mapping references on unreferenced categories: ${mappingRefs.rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
