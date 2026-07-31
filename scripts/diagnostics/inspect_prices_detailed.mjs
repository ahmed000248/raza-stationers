// inspect_prices_detailed.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const pkg = await prisma.productPackaging.findFirst({
    where: { code: 'RS-000001-BASE' },
    include: {
      prices: {
        orderBy: { createdAt: 'asc' },
        include: { sourceMappings: { include: { importRow: true } } }
      }
    }
  });

  console.log(`Packaging Code: ${pkg.code} | ID: ${pkg.id}`);
  console.log(`Prices count: ${pkg.prices.length}\n`);

  for (const pr of pkg.prices) {
    console.log(`Price ID: ${pr.id}`);
    console.log(`  Type: ${pr.priceType}`);
    console.log(`  EffectiveFrom: ${pr.effectiveFrom.toISOString()}`);
    console.log(`  EffectiveTo: ${pr.effectiveTo ? pr.effectiveTo.toISOString() : 'NULL (OPEN)'}`);
    console.log(`  Created: ${pr.createdAt.toISOString()}`);
    console.log(`  Source Mappings Count: ${pr.sourceMappings.length}`);
    for (const sm of pr.sourceMappings) {
      console.log(`    Mapping ID: ${sm.id} | SourceKey: ${sm.sourceKey} | BatchID: ${sm.importRow?.importBatchId}`);
    }
    console.log('------------------------------------------------');
  }
}

run()
  .then(() => pool.end())
  .catch(err => { console.error(err); pool.end(); });
