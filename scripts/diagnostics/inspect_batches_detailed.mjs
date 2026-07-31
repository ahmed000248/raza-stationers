// inspect_batches_detailed.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { rows: true }
      }
    }
  });

  const tableData = [];

  for (const b of batches) {
    const issueCount = await prisma.importIssue.count({
      where: { importRow: { importBatchId: b.id } }
    });

    const totalMappings = await prisma.sourceRecordMapping.count({
      where: { importRow: { importBatchId: b.id } }
    });

    const isCanonical = b.id === 'cms7excy9002tj0wggesccuaw';
    const decision = isCanonical ? 'PRESERVE' : 'REMOVE';
    let reason = '';
    if (isCanonical) {
      reason = 'Canonical import batch containing all 2,167 production rows';
    } else if (b.status === 'failed') {
      reason = 'Failed staging attempt from early CSV import';
    } else if (b.status === 'committing') {
      reason = 'Stuck uncommitted transaction from aborted test run';
    } else if (b.status === 'committed') {
      reason = 'Non-canonical test batch (Test 7 price timeline or checksum validation)';
    }

    tableData.push({
      id: b.id,
      status: b.status,
      filename: b.originalFilename,
      rows: b._count.rows,
      issues: issueCount,
      mappings: totalMappings,
      decision,
      reason
    });
  }

  console.log(JSON.stringify(tableData, null, 2));
}

run()
  .then(() => pool.end())
  .catch(err => { console.error(err); pool.end(); });
