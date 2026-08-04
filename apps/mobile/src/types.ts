/**
 * Raza Stationers Mobile Application Data Types
 */

export type AccountTier = 'guest' | 'pending' | 'wholesale';

export type StockStatus = 'in' | 'low' | 'out';

export interface ProductUnit {
  label: string; // e.g., 'Piece', 'Dozen', 'Carton (20 dozen)', 'Ream', 'Pack of 10'
  retailPrice: number;
  wholesalePrice: number;
  conversionFactor?: number; // e.g., 1, 12, 240
}

export interface Product {
  id: string;
  category: 'Notebooks' | 'Pens & Markers' | 'Paper' | 'Office Supplies';
  icon: string;
  name: string;
  urduName?: string;
  stockStatus: StockStatus;
  stockNote: string;
  description: string;
  units: ProductUnit[];
}

export interface CartItem {
  productId: string;
  unitIndex: number;
  qty: number;
}

export interface CartLineDetail {
  index: number;
  product: Product;
  unit: ProductUnit;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'cod' | 'transfer' | 'credit';

export interface OrderItem {
  productId: string;
  unitIndex: number;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  unitLabel: string;
  productName: string;
}

export type OrderStage = 0 | 1 | 2 | 3 | 4; // 0: Placed, 1: Confirmed, 2: Preparing, 3: Out for Delivery, 4: Delivered

export interface Order {
  id: string;
  date: string;
  stageIndex: OrderStage;
  city: string;
  address: string;
  recipientName: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  transferRef?: string;
  receiptUploaded?: boolean;
}

export interface BusinessCredit {
  limit: number;
  outstanding: number;
  available: number;
}

export interface BusinessStaff {
  id: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  businessName?: string;
  accountTier: AccountTier;
  address?: string;
  city?: string;
  credit?: BusinessCredit;
  staff?: BusinessStaff[];
}

export interface WholesaleRegistrationData {
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  businessType: string;
  email?: string;
  hasDocument: boolean;
}

export type ScreenName =
  | 'splash'
  | 'home'
  | 'catalogue'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'confirmation'
  | 'invoice'
  | 'signin'
  | 'register'
  | 'account'
  | 'orders'
  | 'info';
