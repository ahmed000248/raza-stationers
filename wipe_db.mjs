process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { PrismaClient } from './node_modules/@prisma/client/index.js';
import { PrismaPg } from './node_modules/@prisma/adapter-pg/dist/index.js';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
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
