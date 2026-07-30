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
  try {
    const user = await prisma.user.upsert({
      where: { id: 'user_admin123' },
      update: {},
      create: {
        id: 'user_admin123',
        mobileNumber: '+920000000001',
        name: 'Test Admin',
        role: 'admin',
        isActive: true,
        passwordHash: 'dummy'
      }
    });
    console.log('Upserted test admin:', user);
  } catch (err) {
    console.error('Failed to seed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
