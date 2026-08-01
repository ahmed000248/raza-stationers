const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

function getSslConfig(connectionString) {
  if (connectionString && (connectionString.includes('127.0.0.1') || connectionString.includes('localhost'))) {
    return false;
  }
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
  const args = process.argv.slice(2);
  const confirm = args.includes('--confirm');

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL or DIRECT_URL environment variables not defined.');
    process.exit(1);
  }

  // Refuse unsafe or ambiguous environments
  const isProdDb = connectionString.includes('pqlmgqzpjjllhgalyhwz');
  const targetEnv = isProdDb ? 'PRODUCTION' : 'DEVELOPMENT/STAGING';

  console.log(`=== DEMO COMPLETION UTILITY ===`);
  console.log(`Target Environment: ${targetEnv}`);
  console.log(`Database Host:      ${connectionString.split('@')[1]?.split('/')[0] || 'unknown'}`);
  console.log(`Dry-run Mode:      ${!confirm}`);
  console.log(`================================\n`);

  if (isProdDb) {
    console.error('CRITICAL ERROR: This command cannot be run against the production database.');
    console.error('Refusing to execute.');
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: getSslConfig(connectionString),
    max: 2,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Get settings
    const settings = await prisma.businessSettings.findFirst();
    const currentMode = settings?.inventoryMode || 'DEMO';

    console.log(`Current Inventory Mode: ${currentMode}`);

    if (currentMode === 'LIVE') {
      console.log('System is already in LIVE mode. No transition needed (Idempotent check passed).');
      if (!confirm) {
        console.log('[DRY-RUN] No changes would be made.');
      }
      await prisma.$disconnect();
      await pool.end();
      process.exit(0);
    }

    // Retrieve affected record summaries
    const demoOrdersCount = await prisma.order.count({ where: { isDemo: true } });
    const totalProducts = await prisma.product.count();

    console.log(`Affected Records:`);
    console.log(`- Business Settings row: 1 (Switch DEMO -> LIVE)`);
    console.log(`- Current Demo Orders:   ${demoOrdersCount}`);
    console.log(`- Total Catalogue SKUs:  ${totalProducts}`);
    console.log();

    if (!confirm) {
      console.log('WARNING: This is a DRY-RUN. To execute the changes for real, re-run with:');
      console.log('  npm run demo:complete -- --confirm');
      console.log('No modifications were written.');
      await prisma.$disconnect();
      await pool.end();
      process.exit(0);
    }

    console.log('Executing live transition transaction...');

    // Transactionally update settings and create audit log
    await prisma.$transaction(async (tx) => {
      // Find or create settings row
      if (settings) {
        await tx.businessSettings.update({
          where: { id: settings.id },
          data: { inventoryMode: 'LIVE' },
        });
      } else {
        await tx.businessSettings.create({
          data: { inventoryMode: 'LIVE' },
        });
      }

      // Find bootstrap/system actor user for audit log
      let systemActor = await tx.user.findFirst({
        where: { role: 'owner' },
      });
      if (!systemActor) {
        systemActor = await tx.user.findFirst();
      }
      if (!systemActor) {
        throw new Error('No user found to assign as actor in audit log.');
      }

      // Create Audit Log record
      await tx.auditLog.create({
        data: {
          actorId: systemActor.id,
          action: 'INVENTORY_MODE_TRANSITION',
          entityType: 'BusinessSettings',
          entityId: settings?.id || 'new_settings',
          beforeData: { inventoryMode: 'DEMO' },
          afterData: { inventoryMode: 'LIVE' },
          reason: 'Switched system to LIVE inventory mode via CLI',
        },
      });
    });

    console.log('[SUCCESS] System switched to LIVE mode successfully.');
    console.log('[SUCCESS] Audit log entry created.');

  } catch (err) {
    console.error('[ERROR] Transaction failed. Rolled back.', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
