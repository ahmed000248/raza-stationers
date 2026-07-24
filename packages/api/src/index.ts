/**
 * Shared API Client & Service Methods — Raza Stationers
 * Used by Web (Next.js) and Mobile (React Native) clients
 */

import { ProductCatalogueView, Order, CustomerProfileView, PaymentMethod } from '@raza-stationers/types';

export interface APIClientOptions {
  baseUrl: string;
  authToken?: string;
}

export class RazaAPIClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(options: APIClientOptions) {
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
  }

  public setAuthToken(token: string) {
    this.authToken = token;
  }

  /** Returns pricing already resolved per FRD §8 — never a raw discount %, per CD-04. */
  public async fetchCatalog(category?: string, search?: string): Promise<ProductCatalogueView[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${this.baseUrl}/api/products?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch catalog');
    return res.json();
  }

  /** GET /client-businesses/me equivalent — the logged-in user's own business profile (FR-CB). */
  public async fetchOwnProfile(): Promise<CustomerProfileView> {
    const res = await fetch(`${this.baseUrl}/api/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  /**
   * POST /checkout — server validates stock, minimum-order rules, delivery
   * zone, and credit availability before creating the Order (FR-CRT-02 to 07).
   */
  public async placeOrder(orderData: {
    items: { productId: string; unit: string; quantity: number }[];
    paymentMethod: PaymentMethod;
    deliveryAddress: string;
  }): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/api/checkout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }
}

export const createAPIClient = (options: APIClientOptions) => new RazaAPIClient(options);
