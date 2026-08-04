import React, { useState, useEffect } from 'react';
import { AccountTier, CartItem, Order, Product, ScreenName, UserProfile, WholesaleRegistrationData } from './types';
import { PRODUCTS } from './data/products';
import { MOCK_ORDERS, MOCK_USERS } from './data/mockData';
import { createOrderApi, fetchProductsFromApi } from './lib/api';

// Components
import { MobileFrame } from './components/MobileFrame';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DocumentationModal } from './components/DocumentationModal';

// Screens
import { SplashScreen } from './components/screens/SplashScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CatalogueScreen } from './components/screens/CatalogueScreen';
import { ProductDetailScreen } from './components/screens/ProductDetailScreen';
import { CartScreen } from './components/screens/CartScreen';
import { CheckoutScreen } from './components/screens/CheckoutScreen';
import { ConfirmationScreen } from './components/screens/ConfirmationScreen';
import { InvoiceScreen } from './components/screens/InvoiceScreen';
import { SignInScreen } from './components/screens/SignInScreen';
import { RegisterScreen } from './components/screens/RegisterScreen';
import { AccountScreen } from './components/screens/AccountScreen';
import { OrdersScreen } from './components/screens/OrdersScreen';
import { InfoScreen } from './components/screens/InfoScreen';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [prevScreen, setPrevScreen] = useState<ScreenName>('home');
  const [accountTier, setAccountTier] = useState<AccountTier>('guest');
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USERS.guest);

  // Products & Filtering
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [purchaseType, setPurchaseType] = useState<'individual' | 'bulk' | 'both'>('individual');
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');

  // Shopping Cart & Orders
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: 'p1', unitIndex: 1, qty: 2 },
    { productId: 'p4', unitIndex: 1, qty: 5 }
  ]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(MOCK_ORDERS[0]);

  // Notifications Subscription Memory
  const [subscribedNotify, setSubscribedNotify] = useState<Record<string, boolean>>({});

  // Developer Documentation Modal
  const [docsOpen, setDocsOpen] = useState<boolean>(false);
  const [isFullWidthView, setIsFullWidthView] = useState<boolean>(false);

  // Sync products when tier or filters change
  useEffect(() => {
    fetchProductsFromApi(selectedCategory, searchQuery, accountTier).then((res) => {
      setProductsList(res);
    });
  }, [selectedCategory, searchQuery, accountTier]);

  // Navigation handlers
  const navigateTo = (targetScreen: ScreenName, extra?: { productId?: string }) => {
    setPrevScreen(screen);
    if (extra?.productId) setSelectedProductId(extra.productId);
    setScreen(targetScreen);
  };

  const handleHeaderBack = () => {
    if (screen === 'product' || screen === 'checkout' || screen === 'invoice') {
      setScreen(prevScreen || 'home');
    } else {
      setScreen('home');
    }
  };

  // Tier Switching
  const handleTierChange = (newTier: AccountTier) => {
    setAccountTier(newTier);
    setUserProfile(MOCK_USERS[newTier] || MOCK_USERS.guest);
  };

  // Cart operations
  const handleAddToCart = (productId: string, unitIndex: number, qty: number) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.productId === productId && item.unitIndex === unitIndex);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty };
        return updated;
      }
      return [...prev, { productId, unitIndex, qty }];
    });
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    setCartItems((prev) => {
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      const updated = [...prev];
      updated[index] = { ...updated[index], qty: newQty };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Order Placement
  const handlePlaceOrder = async (orderPayload: any) => {
    const created = await createOrderApi(orderPayload);
    setOrders((prev) => [created, ...prev]);
    setCurrentOrder(created);
    setCartItems([]);
    setScreen('confirmation');
  };

  // Reorder
  const handleReorder = (order: Order) => {
    order.items.forEach((it) => {
      handleAddToCart(it.productId, it.unitIndex, it.qty);
    });
    setScreen('cart');
  };

  // Wholesale Registration
  const handleRegisterWholesale = (data: WholesaleRegistrationData) => {
    handleTierChange('pending');
  };

  // Login Handler
  const handleSignIn = (phone: string, role: AccountTier) => {
    handleTierChange(role);
    setScreen('home');
  };

  const handleSignOut = () => {
    handleTierChange('guest');
    setScreen('home');
  };

  const selectedProduct = productsList.find((p) => p.id === selectedProductId) || PRODUCTS[0];
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Determine header visibility
  const isMainTabScreen = ['home', 'catalogue', 'cart', 'account'].includes(screen);
  const showHeader = !['splash', 'confirmation'].includes(screen);
  const showBottomNav = isMainTabScreen && screen !== 'splash';

  // Get screen header title
  const getHeaderTitle = () => {
    switch (screen) {
      case 'product':
        return 'Product Details';
      case 'checkout':
        return 'Order Checkout';
      case 'invoice':
        return 'Invoice Details';
      case 'signin':
        return 'Account Sign In';
      case 'register':
        return 'Wholesale Registration';
      case 'orders':
        return 'Order History & Tracking';
      case 'info':
        return 'About & Store Info';
      case 'home':
        return 'Raza Stationers';
      case 'catalogue':
        return 'Product Catalogue';
      case 'cart':
        return 'Shopping Cart';
      case 'account':
        return 'Business Account';
      default:
        return 'Raza Stationers';
    }
  };

  return (
    <MobileFrame
      accountTier={accountTier}
      onChangeTier={handleTierChange}
      isFullWidth={isFullWidthView}
      onToggleFullWidth={() => setIsFullWidthView(!isFullWidthView)}
    >
      {/* Top Bar Header */}
      {showHeader && (
        <Header
          screen={screen}
          title={getHeaderTitle()}
          urduTitle="راضا اسٹیشنرز"
          accountTier={accountTier}
          showBack={!isMainTabScreen}
          onBack={handleHeaderBack}
          onOpenDocs={() => setDocsOpen(true)}
        />
      )}

      {/* Main Screen Router */}
      <main className="relative min-h-[720px]">
        {screen === 'splash' && (
          <SplashScreen onComplete={() => setScreen('home')} />
        )}

        {screen === 'home' && (
          <HomeScreen
            accountTier={accountTier}
            featuredProducts={productsList.slice(0, 3)}
            cartCount={cartCount}
            onOpenCatalogue={(cat) => {
              if (cat) setSelectedCategory(cat);
              setScreen('catalogue');
            }}
            onOpenProduct={(id) => navigateTo('product', { productId: id })}
            onOpenCart={() => setScreen('cart')}
            onOpenRegister={() => setScreen('register')}
            onQuickAdd={(p) => handleAddToCart(p.id, 0, 1)}
          />
        )}

        {screen === 'catalogue' && (
          <CatalogueScreen
            products={productsList}
            categories={['All Categories', 'Notebooks', 'Pens & Markers', 'Paper', 'Office Supplies']}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            purchaseType={purchaseType}
            accountTier={accountTier}
            onSelectCategory={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onSelectPurchaseType={setPurchaseType}
            onOpenProduct={(id) => navigateTo('product', { productId: id })}
            onQuickAdd={(p, uIdx) => handleAddToCart(p.id, uIdx, 1)}
            subscribedNotify={subscribedNotify}
            onToggleNotify={(id) =>
              setSubscribedNotify((prev) => ({ ...prev, [id]: !prev[id] }))
            }
          />
        )}

        {screen === 'product' && (
          <ProductDetailScreen
            product={selectedProduct}
            accountTier={accountTier}
            onAddToCart={handleAddToCart}
            isSubscribedNotify={!!subscribedNotify[selectedProduct.id]}
            onToggleNotify={(id) =>
              setSubscribedNotify((prev) => ({ ...prev, [id]: !prev[id] }))
            }
          />
        )}

        {screen === 'cart' && (
          <CartScreen
            cartItems={cartItems}
            products={productsList}
            accountTier={accountTier}
            city={userProfile.city || 'Wah Cantt'}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onOpenCheckout={() => setScreen('checkout')}
            onOpenCatalogue={() => setScreen('catalogue')}
          />
        )}

        {screen === 'checkout' && (
          <CheckoutScreen
            cartItems={cartItems}
            products={productsList}
            accountTier={accountTier}
            initialName={userProfile.name}
            initialPhone={userProfile.phone}
            initialAddress={userProfile.address || 'Shop 12, College Road'}
            initialCity={userProfile.city || 'Wah Cantt'}
            creditLimit={userProfile.credit?.limit || 50000}
            creditOutstanding={userProfile.credit?.outstanding || 12400}
            creditAvailable={userProfile.credit?.available || 37600}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {screen === 'confirmation' && currentOrder && (
          <ConfirmationScreen
            order={currentOrder}
            onTrackOrder={() => setScreen('orders')}
            onViewInvoice={() => setScreen('invoice')}
            onGoHome={() => setScreen('home')}
          />
        )}

        {screen === 'invoice' && currentOrder && (
          <InvoiceScreen
            order={currentOrder}
            onDone={() => setScreen('home')}
          />
        )}

        {screen === 'signin' && (
          <SignInScreen
            onSignInSuccess={handleSignIn}
            onOpenRegister={() => setScreen('register')}
          />
        )}

        {screen === 'register' && (
          <RegisterScreen
            onSubmitRegistration={handleRegisterWholesale}
            onGoHome={() => setScreen('home')}
          />
        )}

        {screen === 'account' && (
          <AccountScreen
            user={userProfile}
            accountTier={accountTier}
            onOpenOrders={() => setScreen('orders')}
            onOpenInfo={() => setScreen('info')}
            onOpenSignIn={() => setScreen('signin')}
            onOpenRegister={() => setScreen('register')}
            onSignOut={handleSignOut}
          />
        )}

        {screen === 'orders' && (
          <OrdersScreen
            orders={orders}
            onReorder={handleReorder}
            onViewInvoice={(id) => {
              const found = orders.find((o) => o.id === id);
              if (found) setCurrentOrder(found);
              setScreen('invoice');
            }}
          />
        )}

        {screen === 'info' && <InfoScreen />}
      </main>

      {/* Floating Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNav
          currentScreen={screen}
          cartCount={cartCount}
          onSelectTab={(tab) => setScreen(tab)}
        />
      )}

      {/* Developer & Architecture Documentation Modal */}
      <DocumentationModal
        isOpen={docsOpen}
        onClose={() => setDocsOpen(false)}
      />
    </MobileFrame>
  );
}
