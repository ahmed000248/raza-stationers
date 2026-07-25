// Shared sample data + helpers for the Raza Stationers admin panel demo.
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', urdu: 'ڈیش بورڈ', icon: 'home', href: './Dashboard.dc.html' },
  { key: 'orders', label: 'Order Queue', urdu: 'آرڈر قطار', icon: 'invoice', href: './OrderQueue.dc.html' },
  { key: 'delivery', label: 'Delivery', urdu: 'ترسیل', icon: 'delivery', href: './DeliveryManagement.dc.html' },
  { key: 'clients', label: 'Client Businesses', urdu: 'کلائنٹ کاروبار', icon: 'shop', href: './ClientBusinesses.dc.html' },
  { key: 'discount', label: 'Discount & Credit', urdu: 'رعایت اور کریڈٹ', icon: 'discount', href: './DiscountCredit.dc.html' },
  { key: 'catalogue', label: 'Product Catalogue', urdu: 'مصنوعات کیٹلاگ', icon: 'cart', href: './ProductCatalogue.dc.html' },
  { key: 'stock', label: 'Stock Management', urdu: 'اسٹاک کا انتظام', icon: 'wallet', href: './StockManagement.dc.html' },
  { key: 'staff', label: 'Staff Management', urdu: 'عملے کا انتظام', icon: 'account', href: './StaffManagement.dc.html', ownerOnly: true },
  { key: 'accounting', label: 'Accounting & Reports', urdu: 'حساب کتاب', icon: 'invoice', href: './AccountingReporting.dc.html', ownerOnly: true },
  { key: 'audit', label: 'Audit Log', urdu: 'آڈٹ لاگ', icon: 'support', href: './AuditLog.dc.html', ownerOnly: true },
  { key: 'settings', label: 'Settings', urdu: 'ترتیبات', icon: 'discount', href: './Settings.dc.html', ownerOnly: true },
];

export const ROLES = [
  { key: 'owner', label: 'Owner' },
  { key: 'admin', label: 'Admin / Operator' },
  { key: 'packing', label: 'Packing Worker' },
  { key: 'delivery', label: 'Delivery Worker' },
];

export const ROLE_HOME = { owner: './Dashboard.dc.html', admin: './Dashboard.dc.html', packing: './OrderQueue.dc.html', delivery: './DeliveryManagement.dc.html' };

export function getRole() {
  return localStorage.getItem('raza_admin_role') || 'owner';
}
export function setRole(r) {
  localStorage.setItem('raza_admin_role', r);
}
// true if this whole page is owner-only and role can't see it at all
export function pageBlocked(pageKey, role) {
  if (role === 'packing') return pageKey !== 'orders';
  if (role === 'delivery') return pageKey !== 'delivery';
  if (role === 'admin') return ['staff', 'accounting', 'audit', 'settings'].includes(pageKey);
  return false;
}

export function formatRs(n) {
  if (n >= 100000) return 'Rs ' + (n / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
  return 'Rs ' + n.toLocaleString('en-IN');
}
export function timeAgo(iso) {
  const d = new Date(iso), now = new Date('2026-07-25T15:00:00');
  const mins = Math.round((now - d) / 60000);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.round(hrs / 24) + 'd ago';
}

export const CATEGORIES = ['Stationery', 'Registers', 'Sports', 'Office'];

export const PRODUCTS = [
  { id: 'p1', sku: 'RS-NB-2004', name: 'Classic Ruled Notebook 200pg', category: 'Stationery', price: 145, stock: 180, threshold: 40, unit: 'pc' },
  { id: 'p2', sku: 'RS-PN-1180', name: 'Gel Pen — Blue (Pack of 10)', category: 'Stationery', price: 320, stock: 6, threshold: 20, unit: 'pack' },
  { id: 'p3', sku: 'RS-RG-3050', name: 'Long Register 4-Quire', category: 'Registers', price: 410, stock: 54, threshold: 15, unit: 'pc' },
  { id: 'p4', sku: 'RS-PP-7002', name: 'A4 Copier Paper (Ream)', category: 'Office', price: 780, stock: 12, threshold: 25, unit: 'ream' },
  { id: 'p5', sku: 'RS-SP-9110', name: 'Cricket Tennis Ball (Box of 6)', category: 'Sports', price: 960, stock: 30, threshold: 10, unit: 'box' },
  { id: 'p6', sku: 'RS-ST-4420', name: 'Heavy Duty Stapler', category: 'Office', price: 540, stock: 22, threshold: 10, unit: 'pc' },
  { id: 'p7', sku: 'RS-NB-2010', name: 'Spiral Notebook A5 100pg', category: 'Stationery', price: 95, stock: 4, threshold: 30, unit: 'pc' },
  { id: 'p8', sku: 'RS-RG-3060', name: 'Cash Book 2-Quire', category: 'Registers', price: 280, stock: 68, threshold: 15, unit: 'pc' },
  { id: 'p9', sku: 'RS-PN-1200', name: 'Ballpoint Pen — Black (Box of 50)', category: 'Stationery', price: 850, stock: 40, threshold: 12, unit: 'box' },
  { id: 'p10', sku: 'RS-OF-5501', name: 'File Folder — Legal Size', category: 'Office', price: 60, stock: 210, threshold: 50, unit: 'pc' },
];

export const CLIENTS = [
  { id: 'c1', name: 'Al-Falah Stationers', city: 'Lahore', status: 'active', tier: 'Gold — 12%', outstanding: 84500, creditLimit: 150000, phone: '0300-1234567', since: '2023-02-10' },
  { id: 'c2', name: 'City Book Depot', city: 'Karachi', status: 'active', tier: 'Silver — 8%', outstanding: 21000, creditLimit: 80000, phone: '0321-9988771', since: '2022-11-04' },
  { id: 'c3', name: 'Noor Traders', city: 'Faisalabad', status: 'pending', tier: 'Not assigned', outstanding: 0, creditLimit: 0, phone: '0333-4567890', since: '2026-07-20' },
  { id: 'c4', name: 'Bright Future Book Shop', city: 'Lahore', status: 'active', tier: 'Gold — 12%', outstanding: 132000, creditLimit: 120000, phone: '0301-2345678', since: '2021-06-18' },
  { id: 'c5', name: 'Model Town General Store', city: 'Multan', status: 'suspended', tier: 'Silver — 8%', outstanding: 68000, creditLimit: 50000, phone: '0345-1122334', since: '2022-01-30' },
  { id: 'c6', name: 'Zubair Traders', city: 'Karachi', status: 'pending', tier: 'Not assigned', outstanding: 0, creditLimit: 0, phone: '0312-9876543', since: '2026-07-22' },
];

export const ORDERS = [
  { id: 'ORD-4821', client: 'Al-Falah Stationers', city: 'Lahore', total: 46200, status: 'pending', placedAt: '2026-07-25T13:40:00', tier: 'Gold — 12%',
    items: [{ name: 'Classic Ruled Notebook 200pg', qty: 200, price: 145 }, { name: 'Ballpoint Pen — Black (Box of 50)', qty: 20, price: 850 }],
    history: [{ status: 'Placed', at: '2026-07-25T13:40:00', note: '' }] },
  { id: 'ORD-4820', client: 'City Book Depot', city: 'Karachi', total: 18700, status: 'confirmed', placedAt: '2026-07-25T11:05:00', tier: 'Silver — 8%',
    items: [{ name: 'A4 Copier Paper (Ream)', qty: 20, price: 780 }, { name: 'File Folder — Legal Size', qty: 40, price: 60 }],
    history: [{ status: 'Placed', at: '2026-07-25T11:05:00' }, { status: 'Confirmed', at: '2026-07-25T11:40:00', note: 'Stock verified' }] },
  { id: 'ORD-4818', client: 'Bright Future Book Shop', city: 'Lahore', total: 61500, status: 'packed', placedAt: '2026-07-24T16:20:00', tier: 'Gold — 12%',
    items: [{ name: 'Long Register 4-Quire', qty: 100, price: 410 }, { name: 'Cash Book 2-Quire', qty: 75, price: 280 }],
    history: [{ status: 'Placed', at: '2026-07-24T16:20:00' }, { status: 'Confirmed', at: '2026-07-24T17:00:00' }, { status: 'Packed', at: '2026-07-25T09:10:00', note: 'Ready for dispatch' }] },
  { id: 'ORD-4815', client: 'Al-Falah Stationers', city: 'Lahore', total: 28800, status: 'dispatched', placedAt: '2026-07-24T10:00:00', tier: 'Gold — 12%',
    items: [{ name: 'Gel Pen — Blue (Pack of 10)', qty: 90, price: 320 }],
    history: [{ status: 'Placed', at: '2026-07-24T10:00:00' }, { status: 'Confirmed', at: '2026-07-24T10:30:00' }, { status: 'Packed', at: '2026-07-24T15:00:00' }, { status: 'Dispatched', at: '2026-07-25T08:30:00', note: 'Driver: Imran — Bike 2' }] },
  { id: 'ORD-4809', client: 'City Book Depot', city: 'Karachi', total: 15200, status: 'delivered', placedAt: '2026-07-23T09:15:00', tier: 'Silver — 8%',
    items: [{ name: 'Heavy Duty Stapler', qty: 20, price: 540 }, { name: 'Spiral Notebook A5 100pg', qty: 40, price: 95 }],
    history: [{ status: 'Placed', at: '2026-07-23T09:15:00' }, { status: 'Confirmed', at: '2026-07-23T09:40:00' }, { status: 'Packed', at: '2026-07-23T14:00:00' }, { status: 'Dispatched', at: '2026-07-24T08:00:00' }, { status: 'Delivered', at: '2026-07-24T12:20:00' }] },
  { id: 'ORD-4801', client: 'Model Town General Store', city: 'Multan', total: 9600, status: 'rejected', placedAt: '2026-07-22T14:00:00', tier: 'Silver — 8%',
    items: [{ name: 'Cricket Tennis Ball (Box of 6)', qty: 10, price: 960 }],
    history: [{ status: 'Placed', at: '2026-07-22T14:00:00' }, { status: 'Rejected', at: '2026-07-22T15:10:00', note: 'Account suspended — outstanding balance overdue' }] },
];

export const STAFF = [
  { id: 's1', name: 'Rehan Raza', role: 'Owner', phone: '0300-1000001', active: true, lastLogin: '2026-07-25T14:50:00' },
  { id: 's2', name: 'Sana Malik', role: 'Admin / Operator', phone: '0300-1000002', active: true, lastLogin: '2026-07-25T14:20:00' },
  { id: 's3', name: 'Waqas Ahmed', role: 'Admin / Operator', phone: '0300-1000003', active: true, lastLogin: '2026-07-24T18:05:00' },
  { id: 's4', name: 'Imran Sheikh', role: 'Delivery Worker', phone: '0300-1000004', active: true, lastLogin: '2026-07-25T08:30:00' },
  { id: 's5', name: 'Bilal Hussain', role: 'Warehouse Worker', phone: '0300-1000005', active: true, lastLogin: '2026-07-25T09:00:00' },
  { id: 's6', name: 'Kamran Iqbal', role: 'Warehouse Worker', phone: '0300-1000006', active: false, lastLogin: '2026-06-11T10:00:00' },
];

export const DISCOUNT_TIERS = [
  { name: 'Bronze', pct: 5, minOrder: 5000 },
  { name: 'Silver', pct: 8, minOrder: 15000 },
  { name: 'Gold', pct: 12, minOrder: 40000 },
  { name: 'Platinum', pct: 16, minOrder: 100000 },
];

export const AUDIT_LOG = [
  { at: '2026-07-25T11:30:00', user: 'Rehan Raza (Owner)', action: 'Credit limit approved', detail: 'Al-Falah Stationers — limit raised to Rs 150,000' },
  { at: '2026-07-24T17:45:00', user: 'Sana Malik (Admin)', action: 'Discount tier changed', detail: 'City Book Depot moved to Silver — 8%' },
  { at: '2026-07-24T09:20:00', user: 'Rehan Raza (Owner)', action: 'Stock correction', detail: 'Gel Pen — Blue: -14 units, reason: damaged in storage' },
  { at: '2026-07-23T16:00:00', user: 'Rehan Raza (Owner)', action: 'Wholesale account approved', detail: 'City Book Depot — Karachi' },
  { at: '2026-07-22T15:10:00', user: 'Waqas Ahmed (Admin)', action: 'Order rejected', detail: 'ORD-4801 — outstanding balance overdue' },
  { at: '2026-07-21T12:00:00', user: 'Rehan Raza (Owner)', action: 'Staff deactivated', detail: 'Kamran Iqbal — login disabled' },
];

export const EXPENSES = [
  { date: '2026-07-24', category: 'Transport', amount: 8200, note: 'Fuel — delivery bikes' },
  { date: '2026-07-22', category: 'Utilities', amount: 14500, note: 'Warehouse electricity' },
  { date: '2026-07-18', category: 'Supplies', amount: 32000, note: 'Packing material restock' },
  { date: '2026-07-12', category: 'Salaries', amount: 185000, note: 'Warehouse staff — July advance' },
];

export const STOCK_ENTRIES = [
  { date: '2026-07-24', product: 'A4 Copier Paper (Ream)', qty: 60, supplier: 'Bilal Paper Mart', price: 620, total: 37200 },
  { date: '2026-07-23', product: 'Gel Pen — Blue (Pack of 10)', qty: 100, supplier: 'Khalid Stationery Supplies', price: 240, total: 24000 },
  { date: '2026-07-20', product: 'Classic Ruled Notebook 200pg', qty: 300, supplier: 'Sindh Paper Co.', price: 98, total: 29400 },
  { date: '2026-07-15', product: 'Long Register 4-Quire', qty: 80, supplier: 'Khalid Stationery Supplies', price: 320, total: 25600 },
];

export const SUPPLIERS = [
  { name: 'Khalid Stationery Supplies', city: 'Lahore', phone: '042-35678901', products: 'Pens, registers, notebooks' },
  { name: 'Sindh Paper Co.', city: 'Karachi', phone: '021-34567890', products: 'Paper, notebooks' },
  { name: 'Bilal Paper Mart', city: 'Faisalabad', phone: '041-2345678', products: 'Copier paper, office supplies' },
];

export const DELIVERY_STAFF = ['Imran Sheikh — Bike 2', 'Tariq Javed — Bike 1', 'Adnan Malik — Van 1'];

export const SALES_TREND = '0,95 40,88 80,80 120,72 160,68 200,55 240,48 280,30 320,22 360,15';
export const CATEGORY_BARS = [
  { label: 'Stationery', value: 85, emphasis: true },
  { label: 'Registers', value: 55 },
  { label: 'Sports', value: 30 },
  { label: 'Office', value: 68, emphasis: true },
];
