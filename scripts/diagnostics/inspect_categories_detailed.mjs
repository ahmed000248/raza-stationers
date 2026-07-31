// inspect_categories_detailed.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const allCategories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: {
          products: true,
          sourceMappings: true
        }
      }
    }
  });

  console.log(`Total Categories in DB: ${allCategories.length}`);

  // Find all category IDs used by products
  const productsWithCat = await prisma.product.groupBy({
    by: ['categoryId'],
    _count: true
  });

  const usedCategoryIds = new Set(productsWithCat.map(p => p.categoryId));
  console.log(`Unique Category IDs used by Products: ${usedCategoryIds.size}`);

  const canonicalCategories = allCategories.filter(c => usedCategoryIds.has(c.id));
  const excessCategories = allCategories.filter(c => !usedCategoryIds.has(c.id));

  console.log(`Canonical Categories (referenced by products): ${canonicalCategories.length}`);
  console.log(`Excess Categories (unreferenced): ${excessCategories.length}\n`);

  let totalExcessProductRefs = 0;
  let totalExcessMappingRefs = 0;

  const excessList = [];
  for (const c of excessCategories) {
    totalExcessProductRefs += c._count.products;
    totalExcessMappingRefs += c._count.sourceMappings;
    excessList.push({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
      mappingCount: c._count.sourceMappings,
      createdAt: c.createdAt.toISOString()
    });
  }

  console.log(`Total Product References on Excess Categories: ${totalExcessProductRefs}`);
  console.log(`Total SourceMapping References on Excess Categories: ${totalExcessMappingRefs}`);

  console.log("\nEXACT 85 EXCESS CATEGORY IDs:");
  console.log(JSON.stringify(excessList, null, 2));
}

run()
  .then(() => pool.end())
  .catch(err => { console.error(err); pool.end(); });
