import { AccountTier, Order, Product } from '../types';
import { PRODUCTS } from '../data/products';

export function getApiBaseUrl(): string {
  return "";
}

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

export async function fetchProductsFromApi(category?: string, search?: string): Promise<Product[]> {
  return PRODUCTS.filter((p) => {
    const matchCategory = !category || category === 'All Categories' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.urduName && p.urduName.includes(search));
    return matchCategory && matchSearch;
  });
}

export async function createOrderApi(orderPayload: Partial<Order>): Promise<Order> {
  return {
    id: 'MOCK-ORD-' + Math.floor(1000 + Math.random() * 9000),
    items: orderPayload.items || [],
    totalAmount: orderPayload.totalAmount || 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    deliveryAddress: orderPayload.deliveryAddress || 'Local Mobile Order',
    notes: 'Backend rebuild in progress. Local simulation only.',
  } as Order;
}
