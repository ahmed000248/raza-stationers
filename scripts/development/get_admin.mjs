process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { PrismaClient } from '../../node_modules/@prisma/client/index.js';
import { PrismaPg } from '../../node_modules/@prisma/adapter-pg/dist/index.js';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    console.log('Admin ID:', admin.id);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
