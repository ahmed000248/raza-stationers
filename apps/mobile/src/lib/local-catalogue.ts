import { AccountTier, Product } from '../types';
import { PRODUCTS } from '../data/products';

export function formatPKR(num: number): string {
  return 'Rs ' + num.toLocaleString('en-US');
}

export function getResolvedPrice(product: Product, unitIndex: number, tier: AccountTier): number {
  const unit = product.units[unitIndex] || product.units[0];
  if (!unit) return 0;
  return tier === 'wholesale' ? unit.wholesalePrice : unit.retailPrice;
}

export function getPriceCaption(tier: AccountTier): string {
  return tier === 'wholesale' ? 'Wholesale price' : 'Standard price';
}

export async function getLocalProducts(category?: string, search?: string): Promise<Product[]> {
  return PRODUCTS.filter((p) => {
    const matchCategory = !category || category === 'All Categories' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.urduName && p.urduName.includes(search));
    return matchCategory && matchSearch;
  });
}
