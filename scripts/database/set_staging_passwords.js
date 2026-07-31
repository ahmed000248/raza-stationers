require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

// Sets a known password on both staging users so E2E tests can log in.
// Safe to run multiple times (idempotent upsert).
const STAGING_PASSWORD = 'StagingAdmin@2024';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL, ssl: false });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash(STAGING_PASSWORD, 10);
  console.log('Generated hash for', STAGING_PASSWORD);

  // Admin
  await prisma.user.upsert({
    where: { id: 'user_admin123' },
    update: { passwordHash: hash, isActive: true },
    create: {
      id: 'user_admin123',
      mobileNumber: '+920000000001',
      name: 'Test Admin',
      role: 'admin',
      isActive: true,
      passwordHash: hash,
    }
  });
  console.log('Admin user_admin123 password updated.');

  // Owner (for staging E2E tests)
  await prisma.user.upsert({
    where: { id: 'user_owner_staging' },
    update: { passwordHash: hash, isActive: true },
    create: {
      id: 'user_owner_staging',
      mobileNumber: '+920000000002',
      name: 'Staging Owner',
      role: 'owner',
      isActive: true,
      passwordHash: hash,
    }
  });
  console.log('Owner user_owner_staging password updated.');
  console.log('Done. Login password is:', STAGING_PASSWORD);
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
