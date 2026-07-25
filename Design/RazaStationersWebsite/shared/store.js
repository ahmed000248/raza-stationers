// Shared data + state helpers for the Raza Stationers customer site.
// Pure JS module — no framework deps. Persists demo state via localStorage so it
// survives navigation between the site's separate page documents.

export const BRAND = { name: 'Raza Stationers', nameUrdu: 'راضا اسٹیشنرز' };

export const CATEGORIES = [
  { key: 'stationery', name: 'Stationery', nameUrdu: 'اسٹیشنری', icon: 'discount' },
  { key: 'registers', name: 'Registers', nameUrdu: 'رجسٹرز', icon: 'invoice' },
  { key: 'sports', name: 'Sports', nameUrdu: 'کھیل کا سامان', icon: 'block' },
  { key: 'office', name: 'Office Supplies', nameUrdu: 'دفتری سامان', icon: 'wallet' },
];

export const SERVED_ZONES = ['Lahore', 'Gujranwala', 'Sheikhupura', 'Kasur', 'Multan'];
export const MIN_ORDER = 2000;
export const WHOLESALE_TIER = {
  name: 'Shop Partner',
  nameUrdu: 'شاپ پارٹنر',
  benefits: ['Final wholesale pricing on every product', 'Pay Later credit on approved orders', 'Priority order processing'],
  creditLimit: 50000,
  creditUsed: 18500,
};

export const PRODUCTS = [
  // Registers
  { id: 'REG-100', sku: 'RS-REG-100', category: 'registers', name: '100-Page Register', nameUrdu: '100 صفحات رجسٹر', icon: 'invoice', retail: 145, wholesale: 118, bulk: { label: 'Carton of 20', retail: 2650, wholesale: 2150 }, stock: 'in' },
  { id: 'REG-200', sku: 'RS-REG-200', category: 'registers', name: '200-Page Register', nameUrdu: '200 صفحات رجسٹر', icon: 'invoice', retail: 210, wholesale: 172, bulk: { label: 'Carton of 20', retail: 3900, wholesale: 3200 }, stock: 'in' },
  { id: 'REG-LB300', sku: 'RS-REG-LB3', category: 'registers', name: 'Long Book Register — 300 Pages', nameUrdu: 'لانگ بک رجسٹر — 300 صفحات', icon: 'invoice', retail: 295, wholesale: 245, bulk: { label: 'Carton of 12', retail: 3400, wholesale: 2820 }, stock: 'low', stockCount: 6 },
  { id: 'REG-CASH', sku: 'RS-REG-CSH', category: 'registers', name: 'Cash Book Register', nameUrdu: 'کیش بک رجسٹر', icon: 'invoice', retail: 260, wholesale: 214, bulk: { label: 'Carton of 12', retail: 2980, wholesale: 2460 }, stock: 'in' },
  { id: 'REG-LEDGER', sku: 'RS-REG-LDG', category: 'registers', name: 'Ledger Register — A4', nameUrdu: 'لیجر رجسٹر — اے فور', icon: 'invoice', retail: 340, wholesale: 285, bulk: { label: 'Carton of 10', retail: 3250, wholesale: 2700 }, stock: 'in' },
  { id: 'REG-ATT', sku: 'RS-REG-ATT', category: 'registers', name: 'Attendance Register', nameUrdu: 'حاضری رجسٹر', icon: 'invoice', retail: 180, wholesale: 148, bulk: { label: 'Carton of 20', retail: 3350, wholesale: 2700 }, stock: 'in' },
  { id: 'REG-ROLL', sku: 'RS-REG-RLN', category: 'registers', name: 'Roll Number Register', nameUrdu: 'رول نمبر رجسٹر', icon: 'invoice', retail: 165, wholesale: 136, bulk: { label: 'Carton of 20', retail: 3050, wholesale: 2480 }, stock: 'out' },
  { id: 'REG-SAL', sku: 'RS-REG-SAL', category: 'registers', name: 'Salary Register', nameUrdu: 'تنخواہ رجسٹر', icon: 'invoice', retail: 230, wholesale: 190, bulk: { label: 'Carton of 12', retail: 2640, wholesale: 2180 }, stock: 'in' },
  // Stationery
  { id: 'STA-BP10', sku: 'RS-STA-BP10', category: 'stationery', name: 'Ball Pen — Box of 10', nameUrdu: 'بال پین — ڈبہ 10 عدد', icon: 'discount', retail: 320, wholesale: 265, bulk: { label: 'Carton of 20 boxes', retail: 6200, wholesale: 5100 }, stock: 'in' },
  { id: 'STA-GEL10', sku: 'RS-STA-GL10', category: 'stationery', name: 'Gel Pen — Blue (Pack of 10)', nameUrdu: 'جیل پین — نیلا (10 عدد)', icon: 'discount', retail: 380, wholesale: 315, bulk: { label: 'Carton of 20 packs', retail: 7300, wholesale: 6000 }, stock: 'low', stockCount: 9 },
  { id: 'STA-HB20', sku: 'RS-STA-HB20', category: 'stationery', name: 'HB Pencil — Box of 20', nameUrdu: 'ایچ بی پنسل — ڈبہ 20 عدد', icon: 'discount', retail: 240, wholesale: 198, bulk: { label: 'Carton of 24 boxes', retail: 5500, wholesale: 4550 }, stock: 'in' },
  { id: 'STA-A4NB', sku: 'RS-STA-A4NB', category: 'stationery', name: 'A4 Notebook — 100 Pages', nameUrdu: 'اے فور نوٹ بک — 100 صفحات', icon: 'discount', retail: 155, wholesale: 128, bulk: { label: 'Carton of 24', retail: 3550, wholesale: 2900 }, stock: 'in' },
  { id: 'STA-SPIR', sku: 'RS-STA-SPR', category: 'stationery', name: 'Spiral Notebook — 80 Leaf', nameUrdu: 'اسپائرل نوٹ بک — 80 پتے', icon: 'discount', retail: 175, wholesale: 144, bulk: { label: 'Carton of 20', retail: 3300, wholesale: 2700 }, stock: 'in' },
  { id: 'STA-SKB', sku: 'RS-STA-SKB', category: 'stationery', name: 'Sketch Book — A4', nameUrdu: 'اسکیچ بک — اے فور', icon: 'discount', retail: 210, wholesale: 172, bulk: { label: 'Carton of 20', retail: 3950, wholesale: 3250 }, stock: 'out' },
  { id: 'STA-HL4', sku: 'RS-STA-HL4', category: 'stationery', name: 'Highlighter Set — Pack of 4', nameUrdu: 'ہائی لائٹر سیٹ — 4 عدد', icon: 'discount', retail: 260, wholesale: 214, bulk: { label: 'Carton of 24 packs', retail: 5900, wholesale: 4850 }, stock: 'low', stockCount: 4 },
  { id: 'STA-CTAPE', sku: 'RS-STA-CTP', category: 'stationery', name: 'Correction Tape', nameUrdu: 'کریکشن ٹیپ', icon: 'discount', retail: 95, wholesale: 78, bulk: { label: 'Carton of 40', retail: 3500, wholesale: 2850 }, stock: 'in' },
  // Sports
  { id: 'SPT-TBALL', sku: 'RS-SPT-TBL', category: 'sports', name: 'Cricket Tape Ball', nameUrdu: 'کرکٹ ٹیپ بال', icon: 'block', retail: 90, wholesale: 74, bulk: { label: 'Box of 12', retail: 980, wholesale: 800 }, stock: 'in' },
  { id: 'SPT-FBL5', sku: 'RS-SPT-FB5', category: 'sports', name: 'Football — Size 5', nameUrdu: 'فٹ بال — سائز 5', icon: 'block', retail: 850, wholesale: 705, bulk: { label: 'Carton of 10', retail: 7800, wholesale: 6450 }, stock: 'in' },
  { id: 'SPT-VBALL', sku: 'RS-SPT-VBL', category: 'sports', name: 'Volleyball', nameUrdu: 'والی بال', icon: 'block', retail: 780, wholesale: 645, bulk: { label: 'Carton of 10', retail: 7150, wholesale: 5900 }, stock: 'low', stockCount: 3 },
  { id: 'SPT-BADM', sku: 'RS-SPT-BDM', category: 'sports', name: 'Badminton Racket — Pair', nameUrdu: 'بیڈمنٹن ریکٹ — جوڑا', icon: 'block', retail: 620, wholesale: 510, bulk: { label: 'Carton of 12 pairs', retail: 6900, wholesale: 5650 }, stock: 'in' },
  { id: 'SPT-ROPE', sku: 'RS-SPT-RPE', category: 'sports', name: 'Skipping Rope', nameUrdu: 'رسی کودنے والی', icon: 'block', retail: 130, wholesale: 108, bulk: { label: 'Carton of 30', retail: 3450, wholesale: 2850 }, stock: 'in' },
  { id: 'SPT-TT6', sku: 'RS-SPT-TT6', category: 'sports', name: 'Table Tennis Ball — Pack of 6', nameUrdu: 'ٹیبل ٹینس بال — 6 عدد', icon: 'block', retail: 210, wholesale: 172, bulk: { label: 'Carton of 24 packs', retail: 4600, wholesale: 3800 }, stock: 'out' },
  { id: 'SPT-BAT', sku: 'RS-SPT-BAT', category: 'sports', name: 'Cricket Bat — Tape Ball', nameUrdu: 'کرکٹ بیٹ — ٹیپ بال', icon: 'block', retail: 1450, wholesale: 1195, bulk: { label: 'Box of 6', retail: 7900, wholesale: 6500 }, stock: 'in' },
  { id: 'SPT-BOTL', sku: 'RS-SPT-BTL', category: 'sports', name: 'Sports Water Bottle', nameUrdu: 'اسپورٹس واٹر بوتل', icon: 'block', retail: 240, wholesale: 198, bulk: { label: 'Carton of 24', retail: 5300, wholesale: 4350 }, stock: 'in' },
  // Office Supplies
  { id: 'OFF-STPL', sku: 'RS-OFF-STPL', category: 'office', name: 'Heavy Duty Stapler', nameUrdu: 'ہیوی ڈیوٹی اسٹیپلر', icon: 'wallet', retail: 610, wholesale: 520, bulk: { label: 'Carton of 12', retail: 6800, wholesale: 5700 }, stock: 'in' },
  { id: 'OFF-PINS', sku: 'RS-OFF-PIN', category: 'office', name: 'Stapler Pins — Box', nameUrdu: 'اسٹیپلر پن — ڈبہ', icon: 'wallet', retail: 60, wholesale: 48, bulk: { label: 'Carton of 50 boxes', retail: 2650, wholesale: 2150 }, stock: 'in' },
  { id: 'OFF-SCIS', sku: 'RS-OFF-SCS', category: 'office', name: 'Office Scissors', nameUrdu: 'دفتری قینچی', icon: 'wallet', retail: 195, wholesale: 160, bulk: { label: 'Carton of 24', retail: 4300, wholesale: 3550 }, stock: 'low', stockCount: 7 },
  { id: 'OFF-A4RM', sku: 'RS-OFF-A4R', category: 'office', name: 'A4 Copier Paper Ream', nameUrdu: 'اے فور کاپیئر پیپر ریم', icon: 'wallet', retail: 980, wholesale: 840, bulk: { label: 'Carton of 5 reams', retail: 4650, wholesale: 4000 }, stock: 'in' },
  { id: 'OFF-FILE12', sku: 'RS-OFF-FL12', category: 'office', name: 'File Folder — Pack of 12', nameUrdu: 'فائل فولڈر — 12 عدد', icon: 'wallet', retail: 340, wholesale: 280, bulk: { label: 'Carton of 20 packs', retail: 6300, wholesale: 5200 }, stock: 'in' },
  { id: 'OFF-PUSH', sku: 'RS-OFF-PSH', category: 'office', name: 'Push Pins — Box', nameUrdu: 'پش پن — ڈبہ', icon: 'wallet', retail: 55, wholesale: 44, bulk: { label: 'Carton of 50 boxes', retail: 2400, wholesale: 1950 }, stock: 'out' },
  { id: 'OFF-CFLU', sku: 'RS-OFF-CFL', category: 'office', name: 'Correction Fluid', nameUrdu: 'کریکشن فلوئڈ', icon: 'wallet', retail: 85, wholesale: 70, bulk: { label: 'Carton of 40', retail: 3050, wholesale: 2500 }, stock: 'in' },
  { id: 'OFF-PTAPE', sku: 'RS-OFF-PTP', category: 'office', name: 'Packing Tape Roll', nameUrdu: 'پیکنگ ٹیپ رول', icon: 'wallet', retail: 120, wholesale: 98, bulk: { label: 'Carton of 36', retail: 3900, wholesale: 3200 }, stock: 'low', stockCount: 11 },
];

export function getProduct(id) { return PRODUCTS.find((p) => p.id === id); }
export function relatedProducts(product, count) {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, count || 4);
}
export function formatPrice(n) { return 'Rs ' + Number(n).toLocaleString('en-US'); }

export const STOCK_META = {
  in: { tone: 'success', label: 'In Stock', labelUrdu: 'سٹاک میں موجود' },
  low: { tone: 'warning', label: 'Low Stock', labelUrdu: 'کم سٹاک' },
  out: { tone: 'error', label: 'Out of Stock', labelUrdu: 'سٹاک ختم' },
};
export function stockInfo(product) {
  const meta = STOCK_META[product.stock];
  const label = product.stock === 'low' && product.stockCount ? `${product.stockCount} Left` : meta.label;
  return { ...meta, label };
}

// ---- Demo account state (guest / retail / wholesale) ----
const STATE_KEY = 'raza_demo_state';
const CART_KEY = 'raza_cart';
const NOTIF_KEY = 'raza_notif_read';

export function getDemoState() {
  try { return localStorage.getItem(STATE_KEY) || 'guest'; } catch (e) { return 'guest'; }
}
export function setDemoState(v) {
  try { localStorage.setItem(STATE_KEY, v); } catch (e) {}
  window.dispatchEvent(new CustomEvent('raza:store-changed'));
}
export function isWholesale() { return getDemoState() === 'wholesale'; }
export function isLoggedIn() { return getDemoState() !== 'guest'; }

export function priceDisplay(product, purchaseType, demoState) {
  demoState = demoState || getDemoState();
  const src = purchaseType === 'bulk' ? product.bulk : product;
  const unitLabel = purchaseType === 'bulk' ? src.label : 'Per Piece';
  if (demoState === 'wholesale') {
    return { amount: src.wholesale, label: unitLabel, cta: null, isWholesale: true };
  }
  const cta = demoState === 'guest' ? 'Log in to see your wholesale price' : 'Apply for wholesale pricing';
  return { amount: src.retail, label: unitLabel, cta, ctaUrdu: 'ہول سیل قیمت دیکھنے کے لیے لاگ ان کریں', isWholesale: false };
}

// ---- Cart ----
export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; }
}
export function setCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  window.dispatchEvent(new CustomEvent('raza:store-changed'));
}
export function addToCart(productId, purchaseType, qty) {
  const cart = getCart();
  const idx = cart.findIndex((l) => l.productId === productId && l.purchaseType === purchaseType);
  if (idx >= 0) cart[idx].qty += qty; else cart.push({ productId, purchaseType, qty });
  setCart(cart);
  return cart;
}
export function removeCartLine(index) {
  const cart = getCart(); cart.splice(index, 1); setCart(cart); return cart;
}
export function updateCartQty(index, qty) {
  const cart = getCart();
  if (qty <= 0) { cart.splice(index, 1); } else { cart[index].qty = qty; }
  setCart(cart); return cart;
}
export function cartCount() { return getCart().reduce((s, l) => s + l.qty, 0); }
export function cartLines(demoState) {
  demoState = demoState || getDemoState();
  return getCart().map((line, index) => {
    const product = getProduct(line.productId);
    if (!product) return null;
    const price = priceDisplay(product, line.purchaseType, demoState);
    return { index, product, purchaseType: line.purchaseType, qty: line.qty, unitAmount: price.amount, lineTotal: price.amount * line.qty, priceLabel: price.label };
  }).filter(Boolean);
}
export function cartSubtotal(demoState) { return cartLines(demoState).reduce((s, l) => s + l.lineTotal, 0); }
export function clearCart() { setCart([]); }

// ---- Notifications ----
export const NOTIFICATIONS = [
  { id: 'n1', title: 'Order #RS-10482 has shipped', titleUrdu: 'آرڈر #RS-10482 روانہ ہو گیا', time: '2h ago', unread: true },
  { id: 'n2', title: 'Ledger Register — A4 is back in stock', titleUrdu: 'لیجر رجسٹر — اے فور دوبارہ دستیاب ہے', time: '1d ago', unread: true },
  { id: 'n3', title: 'Your wholesale application was approved', titleUrdu: 'آپ کی ہول سیل درخواست منظور ہو گئی', time: '3d ago', unread: false },
  { id: 'n4', title: 'Payment received for Order #RS-10391', titleUrdu: 'آرڈر #RS-10391 کی ادائیگی موصول ہوئی', time: '5d ago', unread: false },
];
export function unreadNotifCount() { return NOTIFICATIONS.filter((n) => n.unread).length; }

// ---- Sample order history / tracking ----
export const ORDERS = [
  { id: 'RS-10482', date: '20 Jul 2026', status: 'out_for_delivery', total: 14200, items: 6, canChange: true },
  { id: 'RS-10391', date: '12 Jul 2026', status: 'delivered', total: 8600, items: 3, canChange: false },
  { id: 'RS-10276', date: '02 Jul 2026', status: 'delivered', total: 22350, items: 11, canChange: false },
  { id: 'RS-10190', date: '24 Jun 2026', status: 'cancelled', total: 3100, items: 2, canChange: false },
];
export const TRACK_STEPS = ['Placed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'];
export const STATUS_META = {
  placed: { step: 0, tone: 'info', label: 'Placed' },
  processing: { step: 1, tone: 'info', label: 'Processing' },
  packed: { step: 2, tone: 'warning', label: 'Packed' },
  out_for_delivery: { step: 3, tone: 'warning', label: 'Out for Delivery' },
  delivered: { step: 4, tone: 'success', label: 'Delivered' },
  cancelled: { step: -1, tone: 'error', label: 'Cancelled' },
};

export const CONTACT = {
  phone: '+92 42 3576 2200',
  whatsapp: '+92 300 1234567',
  email: 'sales@razastationers.pk',
  address: '14-B Bund Road Industrial Area, Lahore, Punjab',
  addressUrdu: '14-بی بند روڈ انڈسٹریل ایریا، لاہور، پنجاب',
  hours: [
    { day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
    { day: 'Saturday', time: '9:00 AM – 6:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ],
};

export const FAQS = [
  { q: 'How do I get wholesale pricing?', a: 'Register your shop through Wholesale Account Registration. Our team reviews applications and approves them within 1-2 business days.' },
  { q: 'What is the minimum order for delivery?', a: `Orders must total at least ${formatPrice(MIN_ORDER)} for delivery. There is no minimum for store pickup.` },
  { q: 'Which areas do you deliver to?', a: `We currently deliver to ${SERVED_ZONES.join(', ')}. More cities are added regularly.` },
  { q: 'What payment methods are accepted?', a: 'Cash on Delivery, Online Payment (Easypaisa, JazzCash, NayaPay, Bank Transfer), and Pay Later for approved credit accounts.' },
  { q: 'Can I cancel or change an order after placing it?', a: 'Yes — from Order History you can request a change or cancellation for any confirmed order that has not yet been delivered.' },
];
