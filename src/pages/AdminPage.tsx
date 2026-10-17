import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Category,
  Product,
  CoverBanner,
  Order,
  OrderStatus,
  SupplyItem,
  UtensilItem,
  CajaSummary,
  CajaMovement,
} from '../types';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Image as ImageIcon,
  Receipt,
  Boxes,
  Utensils,
  Wallet,
  Users,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle,
  Clock,
  Bike,
  Shield,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { STORE_INFO } from '../data/initialData';

interface AdminPageProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  covers: CoverBanner[];
  setCovers: React.Dispatch<React.SetStateAction<CoverBanner[]>>;
  supplies: SupplyItem[];
  setSupplies: React.Dispatch<React.SetStateAction<SupplyItem[]>>;
  utensils: UtensilItem[];
  setUtensils: React.Dispatch<React.SetStateAction<UtensilItem[]>>;
  onExitAdmin: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  categories,
  setCategories,
  products,
  setProducts,
  covers,
  setCovers,
  supplies,
  setSupplies,
  utensils,
  setUtensils,
  onExitAdmin,
}) => {
  const { user, isAdmin, loginAsAdmin, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin login states if not authenticated
  const [adminEmail, setAdminEmail] = useState('buchisapaweb@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Orders State (loaded from server or localStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('buchisapa_recent_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'ord-demo-1',
        orderNumber: 'BS-8492',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'en_preparacion',
        orderType: 'delivery',
        customerName: 'Juan Carlos Quispe',
        customerPhone: '984123847',
        customerEmail: 'juan.quispe@gmail.com',
        deliveryAddress: 'Av. 15 de Julio Zona B, Huaycán',
        deliveryReference: 'Frente a la farmacia, reja azul',
        deliveryFee: 4.0,
        paymentMethod: 'yape',
        needCutlery: true,
        items: [
          {
            productId: 'PL00020',
            name: '1/4 Pollo Broaster Clásico',
            quantity: 2,
            unitPrice: 18.0,
            totalPrice: 36.0,
            accompaniment: 'Papa crocante',
            sauces: ['Mayonesa', 'Ají de Rocoto', 'Ají Charapita', 'Ketchup'],
          },
          {
            productId: 'PL00035',
            name: 'Inca Kola 500ml',
            quantity: 2,
            unitPrice: 4.5,
            totalPrice: 9.0,
          },
        ],
        subtotal: 45.0,
        total: 49.0,
      },
      {
        id: 'ord-demo-2',
        orderNumber: 'BS-8491',
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        status: 'en_camino',
        orderType: 'delivery',
        customerName: 'Mariana Flores',
        customerPhone: '921938471',
        deliveryAddress: 'Calle 28 de Julio 342, Santa Clara',
        deliveryFee: 4.0,
        paymentMethod: 'efectivo',
        cashAmount: 50.0,
        changeAmount: 18.0,
        needCutlery: false,
        items: [
          {
            productId: 'PL00012',
            name: 'Hamburguesa Royal Buchisapa',
            quantity: 1,
            unitPrice: 16.0,
            totalPrice: 16.0,
            accompaniment: 'Papa crocante',
            sauces: ['Mayonesa', 'Tártara', 'Salsa BBQ'],
          },
          {
            productId: 'PL00015',
            name: 'Porción de Tequeños Amazónicos',
            quantity: 1,
            unitPrice: 12.0,
            totalPrice: 12.0,
            sauces: ['Ají Charapita'],
          },
        ],
        subtotal: 28.0,
        total: 32.0,
      },
    ];
  });

  // Selected Order for detail & Ticket Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Caja Chica state
  const [caja, setCaja] = useState<CajaSummary>({
    estado: 'abierta',
    montoInicial: 200.0,
    totalVentas: 840.0,
    totalIngresos: 50.0,
    totalEgresos: 35.0,
    saldoActual: 1055.0,
    horaApertura: '6:00 PM',
  });

  const [cajaMovements, setCajaMovements] = useState<CajaMovement[]>([
    { id: 'mov-1', tipo: 'ingreso', concepto: 'Apertura de turno de noche', monto: 200.0, fecha: '18:00', usuario: 'Admin' },
    { id: 'mov-2', tipo: 'egreso', concepto: 'Compra urgente de limones y hielo', monto: 35.0, fecha: '19:45', usuario: 'Cajero' },
    { id: 'mov-3', tipo: 'ingreso', concepto: 'Cambio sencillo de caja', monto: 50.0, fecha: '20:30', usuario: 'Admin' },
  ]);

  // Product Filter & Modal
  const [prodSearch, setProdSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState(categories[0]?.id || 'C0001');
  const [newProdPrice, setNewProdPrice] = useState(15.0);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImg, setNewProdImg] = useState('/imagenes/categorias/broaster/banner.webp');

  // Sync orders to localStorage & backend
  useEffect(() => {
    localStorage.setItem('buchisapa_recent_orders', JSON.stringify(orders));
  }, [orders]);

  // Fetch orders from server if running
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const serverOrders = await res.json();
          if (Array.isArray(serverOrders) && serverOrders.length > 0) {
            setOrders(serverOrders);
          }
        }
      } catch {
        // use local
      }
    };
    fetchOrders();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (adminEmail.trim().toLowerCase() !== 'buchisapaweb@gmail.com') {
      setLoginError('Solo buchisapaweb@gmail.com tiene acceso autorizado.');
      return;
    }
    const ok = await loginAsAdmin(adminPassword);
    if (!ok) {
      setLoginError('Error de autenticación.');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => null);
    } catch {
      // ignore
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newProduct: Product = {
      id: `PL${Math.floor(10000 + Math.random() * 90000)}`,
      name: newProdName,
      category_id: newProdCat,
      price: Number(newProdPrice),
      description: newProdDesc,
      image_url: newProdImg || '/imagenes/logo/logo-buchisapa.webp',
      stock: 25,
      available: true,
      has_accompaniment: true,
      includes_sauces: true,
    };

    setProducts([newProduct, ...products]);
    setIsProductModalOpen(false);
    setNewProdName('');
    setNewProdDesc('');
  };

  const toggleProductAvailability = (prodId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, available: !p.available } : p))
    );
  };

  const updateSupplyStock = (id: string, delta: number) => {
    setSupplies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStock = Math.max(0, s.stockActual + delta);
          return {
            ...s,
            stockActual: newStock,
            estado: newStock < s.stockMinimo ? 'bajo' : 'ok',
          };
        }
        return s;
      })
    );
  };

  const updateUtensilStock = (id: string, delta: number) => {
    setUtensils((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStock = Math.max(0, u.stockActual + delta);
          return {
            ...u,
            stockActual: newStock,
            estado: newStock < u.stockMinimo ? 'bajo' : 'ok',
          };
        }
        return u;
      })
    );
  };

  // If not logged in as admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-3xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 mx-auto flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-black text-white">
              BuchiSapa Admin
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Ingresa tus credenciales para administrar cocina, pedidos e inventario
            </p>
          </div>

          {loginError && (
            <div className="bg-red-950/80 border border-red-700 p-2.5 rounded-xl text-xs text-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Correo de Administrador</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Contraseña</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-full shadow-lg shadow-red-600/30 transition-all"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full py-2.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Regresar a la Tienda
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ShoppingBag className="w-4 h-4" />, badge: orders.filter((o) => o.status !== 'entregado').length },
    { id: 'productos', label: 'Productos', icon: <Package className="w-4 h-4" /> },
    { id: 'categorias', label: 'Categorías', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'portada', label: 'Portadas', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'ticket', label: 'Ticket / Comprobante', icon: <Receipt className="w-4 h-4" /> },
    { id: 'insumos', label: 'Insumos', icon: <Boxes className="w-4 h-4" />, alert: supplies.some((s) => s.estado === 'bajo') },
    { id: 'utensilios', label: 'Utensilios', icon: <Utensils className="w-4 h-4" /> },
    { id: 'caja', label: 'Caja Chica', icon: <Wallet className="w-4 h-4" /> },
    { id: 'clientes', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { id: 'configuracion', label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col md:flex-row">
      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-64 bg-[#111827] border-r border-gray-800 flex flex-col transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/imagenes/logo/logo-buchisapa.webp"
              alt="Logo BuchiSapa"
              className="w-9 h-9 rounded-full object-contain border border-amber-500/40"
            />
            <div>
              <span className="font-['Playfair_Display'] font-black text-amber-400 text-lg block leading-tight">
                BuchiSapa
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Panel Administrativo
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === item.id
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.badge ? (
                  <span className="bg-amber-400 text-gray-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
                {item.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          <button
            onClick={onExitAdmin}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Ver Carta Tienda</span>
          </button>
          <button
            onClick={() => {
              logout();
              onExitAdmin();
            }}
            className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#111827]/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-['Playfair_Display'] font-black text-lg text-white capitalize">
              {navItems.find((n) => n.id === currentTab)?.label || 'Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">Administrador BuchiSapa</span>
              <span className="text-[10px] text-green-400 font-medium">● Sesión Activa</span>
            </div>
            <img
              src="/imagenes/logo/logo-buchisapa.webp"
              alt="Admin"
              className="w-8 h-8 rounded-full border border-amber-500/50 object-cover"
            />
          </div>
        </header>

        {/* Tab Views */}
        <main className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4">
                  <span className="text-xs text-gray-400 block">Ventas de Hoy</span>
                  <span className="text-2xl font-black text-amber-400 block mt-1">
                    S/ {caja.totalVentas.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-green-400 mt-1 block">↗ +18% vs ayer</span>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4">
                  <span className="text-xs text-gray-400 block">Pedidos Activos en Cocina</span>
                  <span className="text-2xl font-black text-red-500 block mt-1">
                    {orders.filter((o) => o.status !== 'entregado').length}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1 block">Esperando despacho</span>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4">
                  <span className="text-xs text-gray-400 block">Ticket Promedio</span>
                  <span className="text-2xl font-black text-white block mt-1">
                    S/ 38.50
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1 block">Combos y alitas top</span>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4">
                  <span className="text-xs text-gray-400 block">Estado de Caja Chica</span>
                  <span className="text-2xl font-black text-green-400 block mt-1 uppercase">
                    {caja.estado}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Saldo: S/ {caja.saldoActual.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Insumos Alert Banner */}
              {supplies.some((s) => s.estado === 'bajo') && (
                <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-xs">Alerta de Reposición de Cocina</h4>
                      <p className="text-[11px] text-gray-300">
                        Hay insumos por debajo del stock mínimo (ej: Aceite vegetal, Mayonesa base).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('insumos')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-xl shrink-0"
                  >
                    Ver Insumos
                  </button>
                </div>
              )}

              {/* Recent Orders in Dashboard */}
              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Playfair_Display'] font-black text-base text-white">
                    Pedidos Recientes en Turno
                  </h3>
                  <button
                    onClick={() => setCurrentTab('pedidos')}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    Ver todos los pedidos ({orders.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-bold">
                        <th className="py-2.5 px-3">Orden</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Modalidad</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-gray-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            #{o.orderNumber}
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">
                            {o.customerName}
                          </td>
                          <td className="py-3 px-3 text-gray-300">
                            {o.orderType === 'delivery' ? '🛵 Delivery' : '🏪 Recojo'}
                          </td>
                          <td className="py-3 px-3 font-bold text-white">
                            S/ {o.total.toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                o.status === 'pendiente'
                                  ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                                  : o.status === 'en_preparacion'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : o.status === 'en_camino'
                                  ? 'bg-purple-950 text-purple-400 border border-purple-800'
                                  : 'bg-green-950 text-green-400 border border-green-800'
                              }`}
                            >
                              {o.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[11px] font-bold"
                            >
                              Comanda
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

          {/* TAB 2: PEDIDOS */}
          {currentTab === 'pedidos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                    Gestión de Pedidos & Despacho
                  </h3>
                  <p className="text-xs text-gray-400">
                    Actualiza el estado de las órdenes para notificar al cliente en tiempo real
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Total órdenes: <strong>{orders.length}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#111827] border border-gray-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-amber-400 text-sm">
                              #{ord.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                ord.status === 'pendiente'
                                  ? 'bg-yellow-950 text-yellow-400'
                                  : ord.status === 'en_preparacion'
                                  ? 'bg-blue-950 text-blue-400'
                                  : ord.status === 'en_camino'
                                  ? 'bg-purple-950 text-purple-400'
                                  : 'bg-green-950 text-green-400'
                              }`}
                            >
                              {ord.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-base mt-1">
                            {ord.customerName}
                          </h4>
                          <p className="text-xs text-gray-400 font-mono">
                            📞 {ord.customerPhone}
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-amber-400 border border-gray-700 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Ticket</span>
                        </button>
                      </div>

                      {ord.deliveryAddress && (
                        <div className="text-xs text-gray-300 bg-gray-900 p-2.5 rounded-xl border border-gray-800">
                          📍 <strong>Dirección:</strong> {ord.deliveryAddress} {ord.deliveryReference ? `(${ord.deliveryReference})` : ''}
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-1 text-xs text-gray-300">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              <strong>{item.quantity}x</strong> {item.name}
                              {item.accompaniment && ` + ${item.accompaniment}`}
                            </span>
                            <span className="font-bold">S/ {item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <p className="text-xs italic text-amber-400/90 bg-black/40 p-2 rounded-lg">
                          Nota: "{ord.notes}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Status Control Buttons */}
                    <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-gray-400">Total: </span>
                        <strong className="text-amber-400 text-sm font-black">
                          S/ {ord.total.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-gray-400 ml-1 uppercase">({ord.paymentMethod})</span>
                      </div>

                      <div className="flex gap-1.5">
                        {ord.status === 'pendiente' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'en_preparacion')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold"
                          >
                            🧑‍🍳 A Cocina
                          </button>
                        )}
                        {ord.status === 'en_preparacion' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'en_camino')}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold"
                          >
                            🛵 Despachar
                          </button>
                        )}
                        {ord.status === 'en_camino' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'entregado')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-full text-xs font-bold"
                          >
                            ✓ Entregado
                          </button>
                        )}
                        {ord.status === 'entregado' && (
                          <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Completado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTOS */}
          {currentTab === 'productos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Producto</span>
                </button>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-bold bg-gray-900/60">
                        <th className="py-3 px-4">Platillo</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4">Precio (S/)</th>
                        <th className="py-3 px-4">Disponibilidad</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {products
                        .filter((p) => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                        .slice(0, 30)
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-gray-800/40">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={prod.image_url || '/imagenes/logo/logo-buchisapa.webp'}
                                alt={prod.name}
                                className="w-10 h-10 rounded-xl object-cover bg-gray-950"
                              />
                              <div>
                                <span className="font-bold text-white block">{prod.name}</span>
                                <span className="text-[10px] text-gray-400 line-clamp-1">{prod.description}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {categories.find((c) => c.id === prod.category_id)?.name || prod.category_id}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-400">
                              S/ {prod.price.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleProductAvailability(prod.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  prod.available !== false
                                    ? 'bg-green-950 text-green-400 border border-green-800'
                                    : 'bg-red-950 text-red-400 border border-red-800'
                                }`}
                              >
                                {prod.available !== false ? 'Disponible' : 'Agotado'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  const newPrice = prompt(`Nuevo precio para ${prod.name}:`, String(prod.price));
                                  if (newPrice && !isNaN(Number(newPrice))) {
                                    setProducts((prev) =>
                                      prev.map((p) => (p.id === prod.id ? { ...p, price: Number(newPrice) } : p))
                                    );
                                  }
                                }}
                                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs"
                              >
                                Editar Precio
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
          {currentTab === 'categorias' && (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                Categorías de la Carta
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white text-sm block">{cat.name}</span>
                      <span className="text-[10px] text-gray-400">
                        {products.filter((p) => p.category_id === cat.id).length} platillos
                      </span>
                    </div>
                    <span className="text-xs text-green-400 font-bold bg-green-950/40 px-2 py-0.5 rounded-full border border-green-900/60">
                      Activa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PORTADA / BANNERS */}
          {currentTab === 'portada' && (
            <div className="space-y-4">
              <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                Banners del Carrusel de Portada
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {covers.map((banner, idx) => (
                  <div
                    key={banner.id}
                    className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden space-y-3 p-4"
                  >
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-950">
                      <img
                        src={banner.desktopImage}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/80 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        Posición #{idx + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{banner.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{banner.subtitle}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-xs">
                      <span className="text-green-400 font-bold">Activo en Web</span>
                      <button
                        onClick={() => {
                          const newTitle = prompt('Editar título del banner:', banner.title);
                          if (newTitle) {
                            setCovers((prev) =>
                              prev.map((c) => (c.id === banner.id ? { ...c, title: newTitle } : c))
                            );
                          }
                        }}
                        className="text-amber-400 hover:underline font-bold"
                      >
                        Editar Texto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TICKET / COMPROBANTE */}
          {currentTab === 'ticket' && (
            <div className="space-y-6">
              <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                Generador e Impresión de Tickets Térmicos
              </h3>

              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row gap-8 items-start">
                {/* Ticket Selector */}
                <div className="flex-1 space-y-3 w-full">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Seleccionar Pedido para Imprimir Comanda
                  </span>
                  <div className="space-y-2">
                    {orders.map((ord) => (
                      <button
                        key={ord.id}
                        onClick={() => setSelectedOrder(ord)}
                        className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                          selectedOrder?.id === ord.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <div>
                          <span>#{ord.orderNumber} - {ord.customerName}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {ord.items.length} platos · S/ {ord.total.toFixed(2)}
                          </span>
                        </div>
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-black/40">
                          {ord.orderType}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thermal Preview 80mm */}
                <div className="w-full md:w-80 bg-white text-gray-900 p-6 rounded-2xl shadow-2xl font-mono text-xs space-y-3 border border-gray-300">
                  <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-3">
                    <img
                      src="/imagenes/logo/logo-ticket-bn.webp"
                      alt="Logo Ticket"
                      className="h-10 mx-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <h4 className="font-black text-sm tracking-tight">BUCHISAPA</h4>
                    <p className="text-[10px]">Pollería & Sabor Amazónico</p>
                    <p className="text-[9px]">Av. La Estrella c/ 28 de Julio - Santa Clara</p>
                    <p className="text-[9px]">RUC: 20612345678</p>
                  </div>

                  {selectedOrder ? (
                    <>
                      <div className="border-b border-dashed border-gray-400 pb-2 space-y-0.5 text-[11px]">
                        <p><strong>ORDEN:</strong> #{selectedOrder.orderNumber}</p>
                        <p><strong>FECHA:</strong> {new Date(selectedOrder.createdAt).toLocaleString('es-PE')}</p>
                        <p><strong>CLIENTE:</strong> {selectedOrder.customerName}</p>
                        <p><strong>TELF:</strong> {selectedOrder.customerPhone}</p>
                        <p><strong>TIPO:</strong> {selectedOrder.orderType.toUpperCase()}</p>
                        {selectedOrder.deliveryAddress && (
                          <p><strong>DIR:</strong> {selectedOrder.deliveryAddress}</p>
                        )}
                      </div>

                      <div className="space-y-1.5 border-b border-dashed border-gray-400 pb-2">
                        {selectedOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-bold">S/ {it.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 text-right text-[11px]">
                        <p>Subtotal: S/ {selectedOrder.subtotal.toFixed(2)}</p>
                        <p>Delivery: S/ {selectedOrder.deliveryFee.toFixed(2)}</p>
                        <p className="text-xs font-black">TOTAL: S/ {selectedOrder.total.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-600 uppercase">Pago: {selectedOrder.paymentMethod}</p>
                      </div>

                      <div className="text-center pt-2 border-t border-dashed border-gray-400 text-[10px]">
                        <p>¡Gracias por su preferencia!</p>
                        <p>Horario: 6:00 PM - 5:00 AM</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      Selecciona un pedido para ver la vista previa de la comanda
                    </div>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black mt-2"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Comanda Térmica</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INSUMOS */}
          {currentTab === 'insumos' && (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                    Control de Insumos & Cocina
                  </h3>
                  <p className="text-xs text-gray-400">
                    Control de stock de ingredientes, pollo y verduras para el turno
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 font-bold bg-gray-900/60">
                      <th className="py-3 px-4">Ingrediente / Insumo</th>
                      <th className="py-3 px-4">Unidad</th>
                      <th className="py-3 px-4">Stock Actual</th>
                      <th className="py-3 px-4">Mínimo</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {supplies.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-800/40">
                        <td className="py-3 px-4 font-bold text-white">{s.nombre}</td>
                        <td className="py-3 px-4 text-gray-400">{s.unidad}</td>
                        <td className="py-3 px-4 font-black text-amber-400 text-sm">{s.stockActual}</td>
                        <td className="py-3 px-4 text-gray-400">{s.stockMinimo}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              s.estado === 'ok'
                                ? 'bg-green-950 text-green-400 border border-green-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {s.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => updateSupplyStock(s.id, -1)}
                            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => updateSupplyStock(s.id, 5)}
                            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded font-bold"
                          >
                            +5
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: UTENSILIOS */}
          {currentTab === 'utensilios' && (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                Empaques & Utensilios Descartables
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 font-bold bg-gray-900/60">
                      <th className="py-3 px-4">Artículo</th>
                      <th className="py-3 px-4">Unidad</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Mínimo</th>
                      <th className="py-3 px-4 text-right">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {utensils.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-800/40">
                        <td className="py-3 px-4 font-bold text-white">{u.nombre}</td>
                        <td className="py-3 px-4 text-gray-400">{u.unidad}</td>
                        <td className="py-3 px-4 font-black text-amber-400">{u.stockActual}</td>
                        <td className="py-3 px-4 text-gray-400">{u.stockMinimo}</td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => updateUtensilStock(u.id, -5)}
                            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => updateUtensilStock(u.id, 25)}
                            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded font-bold"
                          >
                            +25
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: CAJA CHICA */}
          {currentTab === 'caja' && (
            <div className="space-y-6">
              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                      Arqueo y Movimientos de Caja Chica
                    </h3>
                    <p className="text-xs text-gray-400">
                      Turno actual aperturado a las {caja.horaApertura}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const monto = prompt('Monto del gasto / egreso (S/):');
                        const concepto = prompt('Concepto del gasto:');
                        if (monto && concepto) {
                          const val = Number(monto);
                          setCajaMovements([
                            { id: `mov-${Date.now()}`, tipo: 'egreso', concepto, monto: val, fecha: 'Ahora', usuario: 'Admin' },
                            ...cajaMovements,
                          ]);
                          setCaja((prev) => ({ ...prev, totalEgresos: prev.totalEgresos + val, saldoActual: prev.saldoActual - val }));
                        }
                      }}
                      className="px-3 py-1.5 bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold rounded-xl"
                    >
                      - Registrar Egreso
                    </button>
                    <button
                      onClick={() => {
                        const monto = prompt('Monto del ingreso adicional (S/):');
                        const concepto = prompt('Concepto del ingreso:');
                        if (monto && concepto) {
                          const val = Number(monto);
                          setCajaMovements([
                            { id: `mov-${Date.now()}`, tipo: 'ingreso', concepto, monto: val, fecha: 'Ahora', usuario: 'Admin' },
                            ...cajaMovements,
                          ]);
                          setCaja((prev) => ({ ...prev, totalIngresos: prev.totalIngresos + val, saldoActual: prev.saldoActual + val }));
                        }
                      }}
                      className="px-3 py-1.5 bg-green-950/60 border border-green-800 text-green-300 text-xs font-bold rounded-xl"
                    >
                      + Registrar Ingreso
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800">
                    <span className="text-[11px] text-gray-400">Fondo Inicial</span>
                    <strong className="text-white text-base block mt-0.5">S/ {caja.montoInicial.toFixed(2)}</strong>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800">
                    <span className="text-[11px] text-gray-400">Total Ventas</span>
                    <strong className="text-amber-400 text-base block mt-0.5">S/ {caja.totalVentas.toFixed(2)}</strong>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800">
                    <span className="text-[11px] text-gray-400">Egresos</span>
                    <strong className="text-red-400 text-base block mt-0.5">S/ {caja.totalEgresos.toFixed(2)}</strong>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800">
                    <span className="text-[11px] text-gray-400">Saldo en Efectivo</span>
                    <strong className="text-green-400 text-base block mt-0.5">S/ {caja.saldoActual.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                    Historial de Movimientos de Caja
                  </span>
                  <div className="space-y-1.5">
                    {cajaMovements.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className={`font-bold ${m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                            {m.tipo === 'ingreso' ? '↗ Ingreso' : '↘ Egreso'}
                          </span>
                          <span className="text-gray-300 ml-2">{m.concepto}</span>
                          <span className="text-gray-500 text-[10px] ml-2">({m.fecha} - {m.usuario})</span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          {m.tipo === 'ingreso' ? '+' : '-'} S/ {m.monto.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: CLIENTES */}
          {currentTab === 'clientes' && (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                Directorio de Clientes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 font-bold bg-gray-900/60">
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Teléfono</th>
                      <th className="py-3 px-4">Dirección Habitual</th>
                      <th className="py-3 px-4">Pedidos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    <tr className="hover:bg-gray-800/40">
                      <td className="py-3 px-4 font-bold text-white">Juan Carlos Quispe</td>
                      <td className="py-3 px-4 text-gray-300 font-mono">984123847</td>
                      <td className="py-3 px-4 text-gray-400">Av. 15 de Julio Zona B, Huaycán</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">12 pedidos</td>
                    </tr>
                    <tr className="hover:bg-gray-800/40">
                      <td className="py-3 px-4 font-bold text-white">Mariana Flores</td>
                      <td className="py-3 px-4 text-gray-300 font-mono">921938471</td>
                      <td className="py-3 px-4 text-gray-400">Calle 28 de Julio 342, Santa Clara</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">8 pedidos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: CONFIGURACIÓN */}
          {currentTab === 'configuracion' && (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-5 max-w-2xl">
              <h3 className="font-['Playfair_Display'] font-black text-xl text-white">
                Configuración del Restaurante
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    defaultValue={STORE_INFO.name}
                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Dirección de la Sede</label>
                  <input
                    type="text"
                    defaultValue={STORE_INFO.address}
                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      defaultValue={STORE_INFO.phone}
                      className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Tarifa Delivery (S/)</label>
                    <input
                      type="number"
                      defaultValue={STORE_INFO.deliveryFee}
                      className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Horario Nocturno de Atención</label>
                  <input
                    type="text"
                    defaultValue={STORE_INFO.schedule}
                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Configuración actualizada')}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full text-xs shadow-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="font-bold text-white text-base">Crear Nuevo Platillo</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 block mb-1">Nombre del Platillo *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Alitas Acevichadas Buchisapa"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 block mb-1">Categoría</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Precio (S/) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Ingredientes y presentación..."
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">URL de Imagen</label>
                <input
                  type="text"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-full font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-md"
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
