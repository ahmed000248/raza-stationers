import { PrismaClient } from '../../node_modules/@prisma/client/index.js';
import { PrismaPg } from '../../node_modules/@prisma/adapter-pg/dist/index.js';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

function getSslConfig() {
  const certPath = path.resolve('supabase-ca.crt');
  if (fs.existsSync(certPath)) {
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath, 'utf8'),
    };
  }
  return true;
}

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: getSslConfig()
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Counting tables for disposable DB test...');
  try {
    const productsCount = await prisma.product.count();
    const pricesCount = await prisma.productPrice.count();
    console.log(`Products count: ${productsCount}`);
    console.log(`ProductPrice count: ${pricesCount}`);
    console.log('Count complete.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
