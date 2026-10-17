import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LocationModal } from './components/LocationModal';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ReclamacionesPage } from './pages/ReclamacionesPage';
import { InfoPages } from './pages/InfoPages';
import { AdminPage } from './pages/AdminPage';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_CREAMS,
  INITIAL_ACCOMPANIMENTS,
  INITIAL_COVERS,
  INITIAL_SUPPLIES,
  INITIAL_UTENSILS,
} from './data/initialData';
import { Category, Product, CoverBanner, Order, SupplyItem, UtensilItem } from './types';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // App Master Datasets
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [covers, setCovers] = useState<CoverBanner[]>(INITIAL_COVERS);
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES);
  const [utensils, setUtensils] = useState<UtensilItem[]>(INITIAL_UTENSILS);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (order: Order) => {
    setTrackedOrder(order);
    setCurrentTab('orderTracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin panel, render AdminPage without standard customer header/footer
  if (currentTab === 'admin') {
    return (
      <AdminPage
        categories={categories}
        setCategories={setCategories}
        products={products}
        setProducts={setProducts}
        covers={covers}
        setCovers={setCovers}
        supplies={supplies}
        setSupplies={setSupplies}
        utensils={utensils}
        setUtensils={setUtensils}
        onExitAdmin={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      {/* Sticky Header with Logo, Navigation, Location, & Cart Badge */}
      <Header currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Page Routing */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            categories={categories}
            products={products}
            creams={INITIAL_CREAMS}
            accompaniments={INITIAL_ACCOMPANIMENTS}
            covers={covers}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onBackToMenu={() => handleNavigate('home')}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentTab === 'orderTracking' && trackedOrder && (
          <OrderTrackingPage
            order={trackedOrder}
            onBackToMenu={() => handleNavigate('home')}
          />
        )}

        {currentTab === 'reclamaciones' && (
          <ReclamacionesPage onBackToMenu={() => handleNavigate('home')} />
        )}

        {(currentTab === 'nosotros' ||
          currentTab === 'servicios' ||
          currentTab === 'contacto' ||
          currentTab === 'politicas' ||
          currentTab === 'terminos') && (
          <InfoPages
            type={currentTab as any}
            onBackToMenu={() => handleNavigate('home')}
          />
        )}
      </div>

      {/* Slide-out Cart Drawer ("Tu Pedido Buchisapa") */}
      <CartDrawer onProceedToCheckout={() => handleNavigate('checkout')} />

      {/* Location Selector Modal */}
      <LocationModal />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Rich Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
