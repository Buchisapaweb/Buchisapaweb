import React from 'react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_STORE_CONFIG, 
  INITIAL_ORDERS, 
  INITIAL_SUPPLIES, 
  INITIAL_UTENSILS 
} from './data/initialData';
import { Product, Category, CartItem, Order, StoreConfig, SupplyItem, UtensilItem, SelectedExtra, OrderStatus } from './types';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ThermalTicketModal } from './components/ThermalTicketModal';
import { InfoPagesModal } from './components/InfoPagesModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { Lock, Sparkles, X, ShieldCheck } from 'lucide-react';

export function App() {
  // Persistence with localStorage
  const [products, setProducts] = React.useState<Product[]>(() => {
    const saved = localStorage.getItem('buchisapa_products');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = React.useState<Order[]>(() => {
    const saved = localStorage.getItem('buchisapa_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ORDERS;
  });

  const [storeConfig, setStoreConfig] = React.useState<StoreConfig>(() => {
    const saved = localStorage.getItem('buchisapa_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_STORE_CONFIG;
  });

  const [supplies, setSupplies] = React.useState<SupplyItem[]>(() => {
    const saved = localStorage.getItem('buchisapa_supplies');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_SUPPLIES;
  });

  const [utensils, setUtensils] = React.useState<UtensilItem[]>(() => {
    const saved = localStorage.getItem('buchisapa_utensils');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_UTENSILS;
  });

  const [categories] = React.useState<Category[]>(INITIAL_CATEGORIES);
  const [cart, setCart] = React.useState<CartItem[]>([]);

  // Navigation and Modal States
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [lastConfirmedOrder, setLastConfirmedOrder] = React.useState<Order | null>(null);
  const [ticketOrder, setTicketOrder] = React.useState<Order | null>(null);
  const [infoModalTab, setInfoModalTab] = React.useState<'nosotros' | 'ubicacion' | 'reclamaciones' | 'horario' | null>(null);

  // Admin Mode & PIN modal
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = React.useState(false);
  const [adminPinInput, setAdminPinInput] = React.useState('');
  const [pinError, setPinError] = React.useState(false);

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem('buchisapa_products', JSON.stringify(products));
  }, [products]);

  React.useEffect(() => {
    localStorage.setItem('buchisapa_orders', JSON.stringify(orders));
  }, [orders]);

  React.useEffect(() => {
    localStorage.setItem('buchisapa_config', JSON.stringify(storeConfig));
  }, [storeConfig]);

  React.useEffect(() => {
    localStorage.setItem('buchisapa_supplies', JSON.stringify(supplies));
  }, [supplies]);

  React.useEffect(() => {
    localStorage.setItem('buchisapa_utensils', JSON.stringify(utensils));
  }, [utensils]);

  // Promotions for the Carousel
  const promotionsList = React.useMemo(() => {
    return products.filter(p => p.categoria_slug === 'promociones' || p.popular);
  }, [products]);

  // Product Counts per category
  const productCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(c => {
      counts[c.slug] = products.filter(p => p.categoria_slug === c.slug).length;
    });
    return counts;
  }, [products, categories]);

  // Filtered Products for Catalog
  const displayedProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.categoria_slug === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number,
    selectedSauces: string[],
    selectedExtras: SelectedExtra[],
    notes: string
  ) => {
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const unitPriceWithExtras = product.price + extrasTotal;
    const totalPrice = unitPriceWithExtras * quantity;

    const newItem: CartItem = {
      cartId: `cart-${Date.now()}-${Math.random()}`,
      product,
      quantity,
      selectedSauces,
      selectedExtras,
      notes,
      unitPriceWithExtras,
      totalPrice
    };

    setCart(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPriceWithExtras * newQty
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit order from checkout
  const handleSubmitOrder = (order: Order, openWhatsApp: boolean) => {
    // Add to orders store
    setOrders(prev => [order, ...prev]);
    setCart([]);
    setIsCartOpen(false);
    setLastConfirmedOrder(order);

    if (openWhatsApp) {
      // Build nicely formatted Peruvian WhatsApp message
      let message = `🍗 *NUEVO PEDIDO BUCHISAPA - #${order.code}*\n`;
      message += `--------------------------------------\n`;
      message += `👤 *Cliente:* ${order.customerName}\n`;
      message += `📞 *Teléfono:* ${order.customerPhone}\n`;
      message += `🛵 *Modalidad:* ${order.orderType === 'delivery' ? 'Delivery a domicilio' : 'Recojo en Local (Santa Clara)'}\n`;
      if (order.orderType === 'delivery') {
        message += `📍 *Dirección:* ${order.address}\n`;
        if (order.reference) message += `🔍 *Referencia:* ${order.reference}\n`;
      }
      message += `\n🛒 *DETALLE DEL PEDIDO:*\n`;
      order.items.forEach(it => {
        message += `• *${it.quantity}x ${it.product.name}* (S/ ${it.totalPrice.toFixed(2)})\n`;
        if (it.selectedSauces.length > 0) {
          message += `   Cremas: ${it.selectedSauces.join(', ')}\n`;
        }
        if (it.selectedExtras.length > 0) {
          message += `   Extras: ${it.selectedExtras.map(e => e.name).join(', ')}\n`;
        }
        if (it.notes) {
          message += `   Nota: "${it.notes}"\n`;
        }
      });
      message += `\n--------------------------------------\n`;
      message += `Subtotal: S/ ${order.subtotal.toFixed(2)}\n`;
      if (order.deliveryFee > 0) {
        message += `Delivery: S/ ${order.deliveryFee.toFixed(2)}\n`;
      }
      message += `*TOTAL A PAGAR: S/ ${order.total.toFixed(2)}*\n`;
      message += `💳 *Método de Pago:* ${order.paymentMethod.toUpperCase()}\n`;
      if (order.cashChangeFor) {
        message += `💵 *Paga con:* S/ ${order.cashChangeFor.toFixed(2)} (Vuelto: S/ ${(order.cashChangeFor - order.total).toFixed(2)})\n`;
      }
      message += `\n_Por favor confirmar recepción del pedido. ¡Muchas gracias!_`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${storeConfig.whatsapp}?text=${encoded}`, '_blank');
    }
  };

  // Admin order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Admin product availability toggle
  const handleToggleProductAvailable = (productId: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, available: !p.available } : p))
    );
  };

  // Admin product price update
  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, price: newPrice } : p))
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateSupplyQuantity = (supplyId: string, newQty: number) => {
    setSupplies(prev =>
      prev.map(s => {
        if (s.id === supplyId) {
          const status = newQty <= s.minStock ? 'low' : 'ok';
          return { ...s, quantity: newQty, status };
        }
        return s;
      })
    );
  };

  const handleToggleUtensilStatus = (utensilId: string) => {
    setUtensils(prev =>
      prev.map(u => {
        if (u.id === utensilId) {
          const newStatus = u.status === 'operativo' ? 'mantenimiento' : 'operativo';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Handle Admin PIN verification
  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234
    if (adminPinInput === '1234' || adminPinInput === 'admin') {
      setIsAdminMode(true);
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {isAdminMode ? (
        <AdminPanel
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          products={products}
          onToggleProductAvailable={handleToggleProductAvailable}
          onUpdateProductPrice={handleUpdateProductPrice}
          onAddProduct={handleAddProduct}
          categories={categories}
          storeConfig={storeConfig}
          onUpdateStoreConfig={setStoreConfig}
          supplies={supplies}
          onUpdateSupplyQuantity={handleUpdateSupplyQuantity}
          utensils={utensils}
          onToggleUtensilStatus={handleToggleUtensilStatus}
          onViewTicket={(order) => setTicketOrder(order)}
          onCloseAdmin={() => setIsAdminMode(false)}
        />
      ) : (
        <>
          {/* Header */}
          <Header
            storeConfig={storeConfig}
            cartCount={cartCount}
            cartTotal={cartTotal}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAdmin={() => {
              if (isAdminMode) {
                setIsAdminMode(false);
              } else {
                setShowAdminPinModal(true);
              }
            }}
            onOpenInfo={(tab) => setInfoModalTab(tab)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isAdmin={isAdminMode}
          />

          {/* Hero Promotions Carousel */}
          {!searchQuery && (
            <HeroCarousel
              promotions={promotionsList}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
              onExploreMenu={() => {
                const element = document.getElementById('menu-catalog');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

          {/* Category Filter Tabs */}
          <div id="menu-catalog">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(slug) => setSelectedCategory(slug)}
              productCounts={productCounts}
            />
          </div>

          {/* Main Product Catalog */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
            {/* Catalog Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>
                    {selectedCategory === 'all' 
                      ? 'Nuestra Carta Completa' 
                      : categories.find(c => c.slug === selectedCategory)?.name || 'Carta'}
                  </span>
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {displayedProducts.length} opciones
                  </span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {selectedCategory === 'all'
                    ? 'Preparados con receta auténtica de la selva y el pollo broaster más crujiente de Lima Este.'
                    : categories.find(c => c.slug === selectedCategory)?.description || ''}
                </p>
              </div>

              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Ver todas las categorías
                </button>
              )}
            </div>

            {/* Product Cards Grid */}
            {displayedProducts.length === 0 ? (
              <div className="bg-stone-900/60 border border-stone-800 p-12 rounded-3xl text-center space-y-3">
                <span className="text-3xl block">🔍</span>
                <h3 className="text-base font-bold text-white">No encontramos platos con ese nombre</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Prueba buscando "broaster", "alitas", "tacacho", "cecina" o "hamburguesa".
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Reiniciar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Footer */}
          <Footer
            storeConfig={storeConfig}
            onOpenInfo={(tab) => setInfoModalTab(tab)}
            onOpenAdmin={() => setShowAdminPinModal(true)}
          />
        </>
      )}

      {/* Product Customizer Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        storeConfig={storeConfig}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={lastConfirmedOrder}
        onClose={() => setLastConfirmedOrder(null)}
        onViewTicket={(o) => {
          setTicketOrder(o);
        }}
        storeConfig={storeConfig}
      />

      {/* Printable Thermal Ticket Modal */}
      <ThermalTicketModal
        order={ticketOrder}
        onClose={() => setTicketOrder(null)}
      />

      {/* Info Pages Modal (Nosotros, Ubicacion, Reclamaciones, Horario) */}
      {infoModalTab && (
        <InfoPagesModal
          initialTab={infoModalTab}
          onClose={() => setInfoModalTab(null)}
          storeConfig={storeConfig}
        />
      )}

      {/* Admin PIN Login Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <button
              onClick={() => { setShowAdminPinModal(false); setPinError(false); }}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black">Acceso de Administración</h3>
              <p className="text-xs text-stone-400">
                Panel de pedidos en vivo, inventario, precios y configuración.
              </p>
            </div>

            <form onSubmit={handleVerifyAdminPin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-400 block mb-1">
                  Ingresa el PIN de Administrador (PIN por defecto: 1234):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="PIN: 1234"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-center tracking-widest text-white focus:outline-none focus:border-amber-500 font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {pinError && (
                <p className="text-red-400 text-xs text-center font-bold">
                  PIN incorrecto. (Usa: 1234 o presiona el botón inferior)
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded-xl text-xs transition"
              >
                Ingresar al Panel
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(true);
                  setShowAdminPinModal(false);
                }}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-2 rounded-xl text-xs transition"
              >
                Entrar en Modo Prueba (1 Clic)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
