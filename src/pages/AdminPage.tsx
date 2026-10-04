import React, { useState } from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { OrderStatus } from '../types';
import {
  ShoppingBag,
  ChefHat,
  Settings,
  Printer,
  DollarSign,
  Clock,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Plus
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    orders,
    products,
    updateOrderStatus,
    toggleProductAvailability,
    updateProductPrice,
    updateProductStock,
    businessConfig,
    updateBusinessConfig,
    setViewingTicketOrder
  } = useBuchisapa();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'config'>('orders');

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const activeOrdersCount = orders.filter(
    o => o.status === 'PENDIENTE' || o.status === 'PREPARANDO'
  ).length;

  // Config Form State
  const [configForm, setConfigForm] = useState(businessConfig);

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig(configForm);
    alert('✅ Configuración de BuchiSapa guardada exitosamente');
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Panel de Administración
            </h2>
            <span className="px-2 py-0.5 rounded bg-orange-600/30 text-orange-400 border border-orange-500/40 text-[10px] font-black uppercase">
              Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión en tiempo real de comandas de cocina, carta y configuración del restaurante.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0F1424] border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ventas Hoy</span>
            <span className="text-base font-black text-orange-400">
              S/ {totalRevenue.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0F1424] border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">En Cocina</span>
            <span className="text-base font-black text-amber-400">
              {activeOrdersCount} comandas
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-slate-200'
          }`}
          data-testid="admin_tab_orders"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Comandas ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            activeTab === 'products'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-slate-200'
          }`}
          data-testid="admin_tab_products"
        >
          <ChefHat className="w-4 h-4" />
          <span>Productos & Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            activeTab === 'config'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-slate-200'
          }`}
          data-testid="admin_tab_config"
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </button>
      </div>

      {/* TAB 1: ORDERS / COMANDAS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-10 text-center bg-[#0F1424] border border-slate-800 rounded-2xl text-slate-400">
              No hay comandas registradas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(ord => (
                <div
                  key={ord.id}
                  className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4"
                  data-testid={`admin_order_card_${ord.orderNumber}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-orange-400">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-300 ml-2">
                          {ord.customerName}
                        </span>
                      </div>

                      <button
                        onClick={() => setViewingTicketOrder(ord)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                        title="Ver / Imprimir Ticket"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 space-y-0.5">
                      <p>
                        Tel: <span className="text-white font-semibold">{ord.customerPhone}</span>
                      </p>
                      <p>
                        Modalidad: <span className="text-amber-400 font-bold">{ord.orderType}</span>
                        {ord.deliveryAddress && ` • ${ord.deliveryAddress}`}
                        {ord.tableNumber && ` • Mesa ${ord.tableNumber}`}
                      </p>
                      <p>
                        Pago: <span className="text-white font-semibold">{ord.paymentMethod}</span>
                      </p>
                    </div>

                    {/* Item list */}
                    <div className="bg-slate-900/90 rounded-xl p-3 space-y-1.5 border border-slate-800 text-xs">
                      {ord.items.map(it => (
                        <div key={it.id} className="space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-200">
                            <span>
                              {it.quantity}x {it.productName}
                            </span>
                            <span>S/ {it.itemTotal.toFixed(2)}</span>
                          </div>
                          {it.selectedCremas?.length > 0 && (
                            <p className="text-[10px] text-amber-400 pl-3">
                              Cremas: {it.selectedCremas.join(', ')}
                            </p>
                          )}
                          {it.instructions && (
                            <p className="text-[10px] text-slate-400 italic pl-3">
                              Nota: {it.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Cambiar Estado:
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO'] as OrderStatus[]).map(st => {
                        const isCurrent = ord.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, st)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                              isCurrent
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {st === 'PENDIENTE'
                              ? 'Pend'
                              : st === 'PREPARANDO'
                              ? 'Cocina'
                              : st === 'LISTO'
                              ? 'Listo'
                              : 'Entregado'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {products.map(prod => (
              <div
                key={prod.id}
                className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-white truncate">{prod.name}</h4>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      {prod.categorySlug}
                    </span>
                    <span className="text-xs font-black text-orange-400">
                      S/ {prod.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">
                    {prod.available ? 'Disponible' : 'Agotado'}
                  </span>

                  <button
                    onClick={() => toggleProductAvailability(prod.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      prod.available
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {prod.available ? 'Marcar Agotado' : 'Habilitar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-xl mx-auto">
          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <h3 className="text-sm font-black uppercase text-white tracking-wider mb-2">
              Datos del Restaurante & Impresora
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                value={configForm.businessName}
                onChange={e => setConfigForm({ ...configForm, businessName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">RUC</label>
                <input
                  type="text"
                  value={configForm.ruc}
                  onChange={e => setConfigForm({ ...configForm, ruc: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Costo Delivery S/
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={configForm.deliveryFee}
                  onChange={e =>
                    setConfigForm({ ...configForm, deliveryFee: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Dirección del Local
              </label>
              <input
                type="text"
                value={configForm.address}
                onChange={e => setConfigForm({ ...configForm, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={configForm.phone}
                  onChange={e => setConfigForm({ ...configForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  IP Impresora Térmica WiFi
                </label>
                <input
                  type="text"
                  value={configForm.printerIp}
                  onChange={e => setConfigForm({ ...configForm, printerIp: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Horario de Atención
              </label>
              <input
                type="text"
                value={configForm.openingHours}
                onChange={e => setConfigForm({ ...configForm, openingHours: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30 transition-all"
              data-testid="save_config_btn"
            >
              Guardar Cambios
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
