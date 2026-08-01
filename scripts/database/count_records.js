const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars
require('dotenv').config();

function getSslConfig() {
  let currentDir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const certPath = path.join(currentDir, "supabase-ca.crt");
    if (fs.existsSync(certPath)) {
      return {
        rejectUnauthorized: true,
        ca: fs.readFileSync(certPath, "utf8"),
      };
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
  return true;
}

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Neither DIRECT_URL nor DATABASE_URL is defined in environment.');
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: getSslConfig(),
    max: 2,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  const prices = await prisma.productPrice.count();

  console.log('--- DATABASE STATUS ---');
  console.log(`Products:   ${products}`);
  console.log(`Categories: ${categories}`);
  console.log(`Prices:     ${prices}`);
  console.log('-----------------------');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
