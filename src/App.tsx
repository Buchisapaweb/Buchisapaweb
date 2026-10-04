import React, { useState } from 'react';
import { BuchisapaProvider, useBuchisapa } from './context/BuchisapaContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersTrackerPage } from './pages/OrdersTrackerPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { AdminPage } from './pages/AdminPage';
import { InfoPage } from './pages/InfoPage';
import { CustomizationModal } from './components/CustomizationModal';
import { ReceiptTicketModal } from './components/ReceiptTicketModal';
import { CartFloatingBar } from './components/CartFloatingBar';
import { Order } from './types';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const handleOrderSuccess = (order: Order) => {
    setLastOrder(order);
    setCurrentTab('success');
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-[#F8FAFC] flex flex-col antialiased">
      {/* Top Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5">
        {currentTab === 'home' && (
          <HomePage
            onNavigateToCart={() => setCurrentTab('cart')}
            onNavigateToClaims={() => setCurrentTab('claims')}
          />
        )}

        {currentTab === 'cart' && (
          <CartPage
            onNavigateToCheckout={() => setCurrentTab('checkout')}
            onNavigateToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigateBack={() => setCurrentTab('cart')}
          />
        )}

        {currentTab === 'success' && lastOrder && (
          <OrderSuccessPage
            order={lastOrder}
            onNavigateToHome={() => setCurrentTab('home')}
            onNavigateToTracker={() => setCurrentTab('tracker')}
          />
        )}

        {currentTab === 'tracker' && <OrdersTrackerPage />}

        {currentTab === 'claims' && <ClaimsPage />}

        {currentTab === 'admin' && <AdminPage />}

        {currentTab === 'info' && (
          <InfoPage onNavigateToClaims={() => setCurrentTab('claims')} />
        )}
      </main>

      {/* Floating Bottom Cart Bar for Home */}
      {currentTab === 'home' && (
        <CartFloatingBar onOpenCart={() => setCurrentTab('cart')} />
      )}

      {/* Modals */}
      <CustomizationModal />
      <ReceiptTicketModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BuchisapaProvider>
      <MainApp />
    </BuchisapaProvider>
  );
};

export default App;
