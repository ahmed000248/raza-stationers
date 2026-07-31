require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

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
  ssl: false
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
        passwordHash: '$2b$10$vYg/H44Y9/fL9d9pY8v1ueJ8j9Z9cT9qfX/pC8b9.aF6b1h.vYpKa'
      }
    });
    console.log('Upserted test admin:', user);
  } catch (err) {
    console.error('Failed to seed:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
