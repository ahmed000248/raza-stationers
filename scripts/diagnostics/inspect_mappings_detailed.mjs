// inspect_mappings_detailed.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const excessMappingIds = [
    'cms7hsger0006o4wglivi1sy9',
    'cms7hxxlg0004xgwg94itjrlv',
    'cms7hz1ct0004k0wgl63ejrvh',
    'cms7infar0005wkwgq9jl33lx'
  ];

  const mappings = await prisma.sourceRecordMapping.findMany({
    where: { id: { in: excessMappingIds } },
    include: { importRow: true }
  });

  console.log(`Excess Mappings Found: ${mappings.length}\n`);

  for (const m of mappings) {
    console.log(`ID: ${m.id}`);
    console.log(`  SourceSystem: ${m.sourceSystem}`);
    console.log(`  SourceKey: ${m.sourceKey}`);
    console.log(`  ProductId: ${m.productId}`);
    console.log(`  ImportRowId: ${m.importRowId}`);
    console.log(`  ImportBatchId: ${m.importRow?.importBatchId}`);
    console.log(`  Created: ${m.createdAt.toISOString()}`);
    console.log('------------------------------------------------');
  }
}

run()
  .then(() => pool.end())
  .catch(err => { console.error(err); pool.end(); });
