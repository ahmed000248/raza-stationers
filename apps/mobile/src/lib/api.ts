import { AccountTier, Order, Product, UserProfile, WholesaleRegistrationData } from '../types';
import { PRODUCTS } from '../data/products';
import { MOCK_ORDERS, MOCK_USERS } from '../data/mockData';

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/$/, '');
  }
  return '';
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

export async function fetchProductsFromApi(category?: string, search?: string, tier: AccountTier = 'guest'): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All Categories') params.set('category', category);
    if (search) params.set('search', search);
    params.set('tier', tier);

    const baseUrl = getApiBaseUrl();
    const endpoint = baseUrl ? `${baseUrl}/products` : `/api/products`;
    const res = await fetch(`${endpoint}?${params.toString()}`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      return data.products || data.data || data;
    }
  } catch (err) {
    console.warn('API unavailable, falling back to client-side catalog filter', err);
  }

  // Client-side fallback
  return PRODUCTS.filter((p) => {
    const matchCategory = !category || category === 'All Categories' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.urduName && p.urduName.includes(search));
    return matchCategory && matchSearch;
  });
}

export async function createOrderApi(orderPayload: Partial<Order>): Promise<Order> {
  try {
    const baseUrl = getApiBaseUrl();
    const endpoint = baseUrl ? `${baseUrl}/orders` : `/api/orders`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderPayload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.order || data;
    }
    const errText = await res.text().catch(() => "Order placement failed");
    throw new Error(errText || "Failed to place order");
  } catch (err: any) {
    console.error('API error creating order:', err);
    throw new Error(err.message || 'Unable to connect to backend service to place order');
  }
}
