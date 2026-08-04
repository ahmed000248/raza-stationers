import { Order, UserProfile } from '../types';

export const CITIES = [
  'Wah Cantt',
  'Hassanabdal',
  'Taxila',
  'Rawalpindi',
  'Islamabad'
];

export const FREE_DELIVERY_CITIES = ['Wah Cantt', 'Hassanabdal', 'Taxila'];

export const STAGE_LABELS = [
  'Placed',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered'
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'RS-20458',
    date: '22 Jul 2026',
    stageIndex: 2,
    city: 'Rawalpindi',
    address: '45 Commercial Market, Rawalpindi',
    recipientName: 'Al-Raza Traders',
    phone: '0300 1234567',
    subtotal: 4100,
    deliveryFee: 150,
    totalAmount: 4250,
    paymentMethod: 'transfer',
    transferRef: 'TRX-99218401',
    receiptUploaded: true,
    items: [
      {
        productId: 'p6',
        unitIndex: 1, // Carton (5 reams)
        qty: 1,
        unitPrice: 4100,
        totalPrice: 4100,
        unitLabel: 'Carton (5 reams)',
        productName: 'A4 Copier Paper Ream (80gsm)'
      }
    ]
  },
  {
    id: 'RS-20431',
    date: '12 Jul 2026',
    stageIndex: 4,
    city: 'Wah Cantt',
    address: 'Shop 12, College Road, Wah Cantt',
    recipientName: 'Ahmed Raza',
    phone: '0300 1234567',
    subtotal: 3550,
    deliveryFee: 0,
    totalAmount: 3550,
    paymentMethod: 'cod',
    items: [
      {
        productId: 'p1',
        unitIndex: 1, // Dozen
        qty: 2,
        unitPrice: 1350,
        totalPrice: 2700,
        unitLabel: 'Dozen',
        productName: 'Classic Ruled Notebook — 200 Pages'
      },
      {
        productId: 'p4',
        unitIndex: 1, // Dozen
        qty: 5,
        unitPrice: 170,
        totalPrice: 850,
        unitLabel: 'Dozen',
        productName: 'Ball Point Pen — Black'
      }
    ]
  }
];

export const MOCK_USERS: Record<string, UserProfile> = {
  guest: {
    id: 'usr_guest',
    phone: '',
    name: 'Guest Customer',
    accountTier: 'guest'
  },
  pending: {
    id: 'usr_pending',
    phone: '0300 9876543',
    name: 'Bismillah Stationery Shop',
    businessName: 'Bismillah Stationery Shop',
    accountTier: 'pending',
    address: 'Main Bazaar, Hassanabdal',
    city: 'Hassanabdal'
  },
  wholesale: {
    id: 'usr_wholesale',
    phone: '0300 1234567',
    name: 'Ahmed Raza',
    businessName: 'Al-Raza Traders',
    accountTier: 'wholesale',
    address: 'Shop 12, College Road',
    city: 'Wah Cantt',
    credit: {
      limit: 50000,
      outstanding: 12400,
      available: 37600
    },
    staff: [
      { id: 'st_1', name: 'Ahmed Raza', role: 'Owner' },
      { id: 'st_2', name: 'Bilal Nawaz', role: 'Staff — Orders only' }
    ]
  }
};
