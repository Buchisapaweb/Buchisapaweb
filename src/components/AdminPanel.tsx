import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Tags, 
  Boxes, 
  Wrench, 
  Settings, 
  ArrowLeft, 
  Printer, 
  CheckCircle, 
  Clock, 
  Bike, 
  XCircle, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  DollarSign, 
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { Order, Product, Category, StoreConfig, SupplyItem, UtensilItem, OrderStatus } from '../types';

interface AdminPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  products: Product[];
  onToggleProductAvailable: (productId: string) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onAddProduct: (product: Product) => void;
  categories: Category[];
  storeConfig: StoreConfig;
  onUpdateStoreConfig: (newConfig: StoreConfig) => void;
  supplies: SupplyItem[];
  onUpdateSupplyQuantity: (supplyId: string, newQty: number) => void;
  utensils: UtensilItem[];
  onToggleUtensilStatus: (utensilId: string) => void;
  onViewTicket: (order: Order) => void;
  onCloseAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  onUpdateOrderStatus,
  products,
  onToggleProductAvailable,
  onUpdateProductPrice,
  onAddProduct,
  categories,
  storeConfig,
  onUpdateStoreConfig,
  supplies,
  onUpdateSupplyQuantity,
  utensils,
  onToggleUtensilStatus,
  onViewTicket,
  onCloseAdmin
}) => {
  const [activeTab, setActiveTab] = React.useState<
    'resumen' | 'pedidos' | 'productos' | 'categorias' | 'insumos' | 'utensilios' | 'configuracion'
  >('resumen');

  const [orderFilter, setOrderFilter] = React.useState<string>('all');
  const [productSearch, setProductSearch] = React.useState('');
  const [productCatFilter, setProductCatFilter] = React.useState('all');

  // Modal for adding product
  const [showAddProductModal, setShowAddProductModal] = React.useState(false);
  const [newProd, setNewProd] = React.useState({
    name: '',
    category: 'BROASTER',
    category_id: 'C0004',
    categoria_slug: 'broaster',
    price: 15,
    description: '',
    badge: '',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    popular: false,
    includes_sauces: true
  });

  // Calculate statistics
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const deliveryOrdersCount = orders.filter(o => o.status === 'delivery').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.code.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'all' || p.categoria_slug === productCatFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim() || newProd.price <= 0) return;

    const matchedCat = categories.find(c => c.slug === newProd.categoria_slug) || categories[0];

    const prodToAdd: Product = {
      id: `PL${Date.now()}`,
      code: `PL${Math.floor(10000 + Math.random() * 90000)}`,
      name: newProd.name.trim(),
      category: matchedCat.name,
      category_id: matchedCat.id,
      categoria_slug: matchedCat.slug,
      price: Number(newProd.price),
      description: newProd.description.trim(),
      badge: newProd.badge.trim() || undefined,
      image: newProd.image.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      popular: newProd.popular,
      available: true,
      stock: 30,
      includes_sauces: newProd.includes_sauces
    };

    onAddProduct(prodToAdd);
    setShowAddProductModal(false);
    setNewProd({
      name: '',
      category: 'BROASTER',
      category_id: 'C0004',
      categoria_slug: 'broaster',
      price: 15,
      description: '',
      badge: '',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      popular: false,
      includes_sauces: true
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseAdmin}
            className="flex items-center gap-1.5 text-xs font-bold bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-xl text-stone-200 transition"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Volver a la Tienda</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1">
              BUCHI<span className="text-amber-500">SAPA</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded ml-1">
                Panel Administración
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Toggles & Info */}
        <div className="flex items-center gap-3">
          {/* Store status switch */}
          <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
            <span className="text-stone-400">Local Santa Clara:</span>
            <button
              onClick={() => onUpdateStoreConfig({ ...storeConfig, isOpen: !storeConfig.isOpen })}
              className={`font-black px-2 py-0.5 rounded text-[11px] transition ${
                storeConfig.isOpen
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'bg-red-500 text-white'
              }`}
            >
              {storeConfig.isOpen ? 'ABIERTO' : 'CERRADO'}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-300">
            <span className="text-stone-500">Ventas Hoy:</span>
            <span className="font-black text-amber-400 text-sm">
              S/ {totalSales.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-1">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-2 space-y-1">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'resumen'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Resumen General</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('pedidos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'pedidos'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos en Vivo</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'pedidos' ? 'bg-stone-950 text-amber-400' : 'bg-red-500 text-white'
                }`}>
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('productos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'productos'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Platos & Carta</span>
              </div>
              <span className="text-[10px] text-stone-500">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('categorias')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'categorias'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tags className="w-4 h-4" />
                <span>Categorías</span>
              </div>
              <span className="text-[10px] text-stone-500">{categories.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('insumos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'insumos'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4" />
                <span>Insumos & Carnes</span>
              </div>
              <span className="text-[10px] text-stone-500">{supplies.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('utensilios')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'utensilios'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4" />
                <span>Utensilios & Equipos</span>
              </div>
              <span className="text-[10px] text-stone-500">{utensils.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('configuracion')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'configuracion'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: RESUMEN DASHBOARD */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-xs font-semibold block">Total Recaudado</span>
                  <span className="text-2xl font-black text-amber-400">
                    S/ {totalSales.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-stone-500 block">Ventas del turno nocturno</span>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-xs font-semibold block">Pedidos Totales</span>
                  <span className="text-2xl font-black text-white">{orders.length}</span>
                  <span className="text-[10px] text-stone-500 block">Registrados hoy</span>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-xs font-semibold block">En Preparación</span>
                  <span className="text-2xl font-black text-orange-400">{pendingOrdersCount}</span>
                  <span className="text-[10px] text-orange-500/80 block">Atención en cocina</span>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-xs font-semibold block">En Delivery</span>
                  <span className="text-2xl font-black text-cyan-400">{deliveryOrdersCount}</span>
                  <span className="text-[10px] text-cyan-500/80 block">En ruta por Ate</span>
                </div>
              </div>

              {/* Fast Order Queue Overview */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Últimos Pedidos en Proceso</h3>
                    <p className="text-xs text-stone-400">Atiende rápidamente a los comensales</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('pedidos')}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Ver todos los pedidos →
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="bg-stone-950 p-4 rounded-xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-400">#{o.code}</span>
                          <span className="text-xs font-bold text-white">{o.customerName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-stone-800 text-stone-300">
                            {o.orderType}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                          {o.items.map(it => `${it.quantity}x ${it.product.name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white">S/ {o.total.toFixed(2)}</span>
                        <button
                          onClick={() => onViewTicket(o)}
                          className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs"
                          title="Imprimir Ticket"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Store Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Platos Estrella de la Noche
                  </h4>
                  <ul className="text-xs text-stone-300 space-y-1.5 pt-1">
                    <li className="flex justify-between">
                      <span>Promo Broaster Familiar</span>
                      <span className="font-bold text-amber-400">14 vendidos</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Tacacho con Cecina</span>
                      <span className="font-bold text-amber-400">12 vendidos</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Alitas Acevichadas</span>
                      <span className="font-bold text-amber-400">9 vendidos</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Alertas de Insumos
                  </h4>
                  <p className="text-xs text-stone-400">
                    Insumos cercanos al stock mínimo para el turno:
                  </p>
                  <div className="space-y-1 pt-1">
                    {supplies.filter(s => s.status === 'low' || s.quantity <= s.minStock).map(s => (
                      <div key={s.id} className="text-xs flex justify-between text-amber-300">
                        <span>{s.name}</span>
                        <span className="font-bold">{s.quantity} {s.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEDIDOS EN VIVO */}
          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
                  {['all', 'pending', 'preparing', 'delivery', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-xl capitalize transition ${
                        orderFilter === st
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {st === 'all' ? 'Todos' : st === 'pending' ? 'Pendientes' : st === 'preparing' ? 'Preparando' : st === 'delivery' ? 'En Camino' : st === 'completed' ? 'Entregados' : 'Cancelados'}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-stone-400 font-medium">
                  {filteredOrders.length} pedidos encontrados
                </span>
              </div>

              {/* Order Cards */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center text-stone-400">
                    No hay pedidos en este estado.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-lg"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            #{order.code}
                          </span>
                          <div>
                            <span className="font-black text-white text-base block">{order.customerName}</span>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {order.customerPhone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                            order.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            order.status === 'preparing' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            order.status === 'delivery' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {order.status}
                          </span>

                          <button
                            onClick={() => onViewTicket(order)}
                            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-stone-700"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Ticket
                          </button>
                        </div>
                      </div>

                      {/* Items Details */}
                      <div className="space-y-2 text-xs">
                        <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 space-y-1.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-white">{it.quantity}x {it.product.name}</span>
                                {it.selectedSauces.length > 0 && (
                                  <div className="text-[11px] text-stone-400">
                                    Cremas: {it.selectedSauces.join(', ')}
                                  </div>
                                )}
                                {it.selectedExtras.length > 0 && (
                                  <div className="text-[11px] text-amber-400">
                                    Extras: {it.selectedExtras.map(e => e.name).join(', ')}
                                  </div>
                                )}
                                {it.notes && (
                                  <div className="text-[11px] text-stone-500 italic">
                                    Nota: "{it.notes}"
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-amber-400">S/ {it.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-stone-400 pt-1">
                          <div>
                            <span className="font-semibold text-stone-300">Dirección: </span>
                            <span>{order.address}</span>
                            {order.reference && <span className="text-stone-500"> ({order.reference})</span>}
                          </div>
                          <div className="text-right">
                            <span className="text-stone-300 font-bold">Total ({order.paymentMethod}): </span>
                            <span className="text-sm font-black text-amber-400">S/ {order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800">
                        <span className="text-xs text-stone-500 font-semibold mr-1">Cambiar estado:</span>
                        
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            order.status === 'preparing' ? 'bg-orange-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                          }`}
                        >
                          En Cocina
                        </button>

                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'delivery')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            order.status === 'delivery' ? 'bg-cyan-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                          }`}
                        >
                          En Reparto
                        </button>

                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            order.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                          }`}
                        >
                          Entregado
                        </button>

                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            order.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-400'
                          }`}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTOS & CARTA */}
          {activeTab === 'productos' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por plato o código..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 text-xs rounded-xl pl-9 pr-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={productCatFilter}
                    onChange={(e) => setProductCatFilter(e.target.value)}
                    className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2 rounded-xl text-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Plato</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-950 uppercase text-[10px] text-stone-500 border-b border-stone-800">
                      <tr>
                        <th className="p-3">Código</th>
                        <th className="p-3">Plato</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3">Precio (S/)</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-800/40 transition">
                          <td className="p-3 font-mono text-stone-400">{p.code}</td>
                          <td className="p-3">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{p.name}</span>
                              {p.badge && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-black">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-500 line-clamp-1">{p.description}</span>
                          </td>
                          <td className="p-3 text-stone-400">{p.category}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.5"
                              value={p.price}
                              onChange={(e) => onUpdateProductPrice(p.id, Number(e.target.value))}
                              className="w-20 bg-stone-950 border border-stone-800 rounded px-2 py-1 text-amber-400 font-bold"
                            />
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => onToggleProductAvailable(p.id)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition ${
                                p.available
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {p.available ? 'Disponible' : 'Agotado'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onToggleProductAvailable(p.id)}
                              className="text-xs text-amber-400 hover:underline font-semibold"
                            >
                              {p.available ? 'Marcar Agotado' : 'Habilitar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORÍAS */}
          {activeTab === 'categorias' && (
            <div className="space-y-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-black text-white">Categorías de la Carta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((c) => {
                    const count = products.filter(p => p.categoria_slug === c.slug).length;
                    return (
                      <div
                        key={c.id}
                        className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono text-xs text-amber-500 font-bold">#{c.code}</span>
                          <h4 className="text-sm font-black text-white">{c.name}</h4>
                          <p className="text-xs text-stone-400 mt-0.5">{c.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-400">{count}</span>
                          <span className="text-[10px] text-stone-500 block">platos</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INSUMOS */}
          {activeTab === 'insumos' && (
            <div className="space-y-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Inventario de Insumos</h3>
                    <p className="text-xs text-stone-400">Control de stock para cocina y broaster</p>
                  </div>
                </div>

                <div className="divide-y divide-stone-800/80">
                  {supplies.map((s) => (
                    <div key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{s.name}</span>
                          <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded">
                            {s.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500">Mínimo sugerido: {s.minStock} {s.unit}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-stone-950 px-2 py-1 rounded-xl border border-stone-800">
                          <button
                            onClick={() => onUpdateSupplyQuantity(s.id, Math.max(0, s.quantity - 1))}
                            className="w-6 h-6 rounded bg-stone-800 text-white font-bold flex items-center justify-center hover:bg-stone-700"
                          >
                            -
                          </button>
                          <span className="font-black text-white w-12 text-center">
                            {s.quantity} {s.unit}
                          </span>
                          <button
                            onClick={() => onUpdateSupplyQuantity(s.id, s.quantity + 1)}
                            className="w-6 h-6 rounded bg-amber-500 text-stone-950 font-bold flex items-center justify-center hover:bg-amber-400"
                          >
                            +
                          </button>
                        </div>

                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          s.quantity <= s.minStock
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {s.quantity <= s.minStock ? 'Bajo Stock' : 'Correcto'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: UTENSILIOS & EQUIPOS */}
          {activeTab === 'utensilios' && (
            <div className="space-y-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-black text-white">Estado de Maquinaria & Utensilios</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {utensils.map((u) => (
                    <div
                      key={u.id}
                      className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{u.name}</h4>
                        <span className="text-[11px] text-stone-400 block">{u.location}</span>
                        <span className="text-[10px] text-stone-500">Última revisión: {u.lastChecked}</span>
                      </div>
                      <button
                        onClick={() => onToggleUtensilStatus(u.id)}
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md transition ${
                          u.status === 'operativo'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {u.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONFIGURACIÓN */}
          {activeTab === 'configuracion' && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
              <h3 className="text-base font-black text-white">Configuración del Negocio</h3>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-stone-400 block mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      value={storeConfig.name}
                      onChange={(e) => onUpdateStoreConfig({ ...storeConfig, name: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Costo de Delivery (S/)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={storeConfig.deliveryFee}
                      onChange={(e) => onUpdateStoreConfig({ ...storeConfig, deliveryFee: Number(e.target.value) })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-stone-400 block mb-1">WhatsApp para Pedidos</label>
                    <input
                      type="text"
                      value={storeConfig.whatsapp}
                      onChange={(e) => onUpdateStoreConfig({ ...storeConfig, whatsapp: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Horario Nocturno</label>
                    <input
                      type="text"
                      value={storeConfig.schedule}
                      onChange={(e) => onUpdateStoreConfig({ ...storeConfig, schedule: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Dirección del Local</label>
                  <input
                    type="text"
                    value={storeConfig.address}
                    onChange={(e) => onUpdateStoreConfig({ ...storeConfig, address: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal for adding product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 text-xs text-white space-y-4">
            <h3 className="text-base font-black">Agregar Nuevo Plato a la Carta</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-stone-400 block mb-1">Nombre del Plato *</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Salchibroaster Mega Especial"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Categoría</label>
                  <select
                    value={newProd.categoria_slug}
                    onChange={(e) => {
                      const sel = categories.find(c => c.slug === e.target.value);
                      if (sel) {
                        setNewProd({
                          ...newProd,
                          categoria_slug: sel.slug,
                          category: sel.name,
                          category_id: sel.id
                        });
                      }
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Precio (S/) *</label>
                  <input
                    required
                    type="number"
                    step="0.5"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Acompañamiento / Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Papas crocantes + Ensalada fresca + Arroz"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Etiqueta / Badge (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: NUEVO, CRUJIENTE, ESPECIAL"
                  value={newProd.badge}
                  onChange={(e) => setNewProd({ ...newProd, badge: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black"
                >
                  Guardar Plato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
