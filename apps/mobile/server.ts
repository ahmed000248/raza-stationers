import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { PRODUCTS } from './src/data/products.js';
import { MOCK_ORDERS, MOCK_USERS } from './src/data/mockData.js';
import { AccountTier, Order } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;

  app.use(express.json());

  // Memory store for state
  let ordersList: Order[] = [...MOCK_ORDERS];
  let currentTier: AccountTier = 'guest';

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Raza Stationers Mobile Backend' });
  });

  // Auth Session Endpoint
  app.get('/api/auth/session', (req, res) => {
    const tier = (req.query.tier as AccountTier) || currentTier;
    const profile = MOCK_USERS[tier] || MOCK_USERS.guest;
    res.json({
      authenticated: tier !== 'guest',
      user: profile,
      tier
    });
  });

  // Login Endpoint
  app.post('/api/auth/login', (req, res) => {
    const { phone, role } = req.body;
    let selectedTier: AccountTier = 'wholesale';
    if (role === 'pending' || phone?.includes('9876')) {
      selectedTier = 'pending';
    } else if (role === 'guest') {
      selectedTier = 'guest';
    }
    currentTier = selectedTier;
    const profile = MOCK_USERS[selectedTier];
    res.json({
      success: true,
      message: 'Logged in successfully',
      user: profile,
      tier: selectedTier
    });
  });

  // Register Wholesale Endpoint
  app.post('/api/auth/register-wholesale', (req, res) => {
    const registration = req.body;
    currentTier = 'pending';
    res.json({
      success: true,
      status: 'pending_approval',
      message: 'Registration submitted. Standard catalog prices apply until verification completes.',
      data: registration
    });
  });

  // Products Catalog API
  app.get('/api/products', (req, res) => {
    const category = req.query.category as string;
    const search = (req.query.search as string || '').toLowerCase();
    const tier = (req.query.tier as AccountTier) || currentTier;

    let filtered = PRODUCTS.filter((p) => {
      const matchCategory = !category || category === 'All Categories' || p.category === category;
      const matchSearch = !search || p.name.toLowerCase().includes(search) || (p.urduName && p.urduName.includes(search));
      return matchCategory && matchSearch;
    });

    // Map resolved pricing per tier
    const mapped = filtered.map((p) => {
      return {
        ...p,
        units: p.units.map((u) => ({
          ...u,
          resolvedPrice: tier === 'wholesale' ? u.wholesalePrice : u.retailPrice,
          priceCaption: tier === 'wholesale' ? 'Wholesale price' : 'Standard price'
        }))
      };
    });

    res.json({
      count: mapped.length,
      tier,
      products: mapped
    });
  });

  // Get Orders History
  app.get('/api/orders', (_req, res) => {
    res.json({
      orders: ordersList
    });
  });

  // Create Order
  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    const newId = `RS-${20500 + ordersList.length + 1}`;
    const newOrder: Order = {
      id: newId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      stageIndex: 0,
      city: orderData.city || 'Wah Cantt',
      address: orderData.address || 'College Road, Wah Cantt',
      recipientName: orderData.recipientName || 'Valued Customer',
      phone: orderData.phone || '0300 1234567',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      transferRef: orderData.transferRef
    };

    ordersList = [newOrder, ...ordersList];
    res.json({
      success: true,
      order: newOrder
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Raza Stationers App running on http://localhost:${PORT}`);
  });
}

startServer();
