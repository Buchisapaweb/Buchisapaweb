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
  Plus,
  Package,
  FileText,
  TrendingUp,
  Receipt
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

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'kds' | 'sales' | 'inventory' | 'config'>('orders');

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

  // Mock inventory of kitchen supplies
  const initialSupplies = [
    { name: 'Carne Artesanal para Burger (kg)', stock: '18 kg', status: 'Óptimo' },
    { name: 'Pechuga y Presas de Pollo Broaster', stock: '25 kg', status: 'Óptimo' },
    { name: 'Cecina Ahumada de Tarapoto', stock: '12 kg', status: 'Óptimo' },
    { name: 'Chorizo Amazónico Parrillero', stock: '10 kg', status: 'Óptimo' },
    { name: 'Plátano Bellaco Verde / Maduro', stock: '40 kg', status: 'Óptimo' },
    { name: 'Papas Cortadas para Freír', stock: '35 kg', status: 'Óptimo' },
    { name: 'Panes de Hamburguesa Artesanal', stock: '60 un.', status: 'Óptimo' },
    { name: 'Rollos de Papel Térmico 80mm', stock: '8 rollos', status: 'Óptimo' }
  ];

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
              BuchiSapa POS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión en tiempo real de comandas de cocina, carta, ventas e inventario.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0F1424] border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ventas Turno</span>
            <span className="text-base font-black text-orange-400">
              S/ {totalRevenue.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0F1424] border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">En Cocina</span>
            <span className="text-base font-black text-amber-400">
              {activeOrdersCount} pedidos
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
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
          onClick={() => setActiveTab('kds')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'kds'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-slate-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Pantalla Cocina KDS</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'products'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-slate-200'
          }`}
          data-testid="admin_tab_products"
        >
          <Package className="w-4 h-4" />
          <span>Carta & Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'sales'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ventas & Caja</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'inventory'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#0F1424] text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Insumos</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
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

      {/* TAB 1: Comandas & Pedidos */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center bg-[#0F1424] border border-slate-800 rounded-2xl p-6">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">
                No hay comandas registradas en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-black text-white">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {order.orderType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                        {order.paymentMethod}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium">
                      <span className="font-bold text-white">{order.customerName}</span> ({order.customerPhone})
                      {order.deliveryAddress && (
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          📍 {order.deliveryAddress} {order.deliveryReference ? `(Ref: ${order.deliveryReference})` : ''}
                        </p>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-1 bg-[#070A13] p-2.5 rounded-xl border border-slate-800/80">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex justify-between text-slate-300">
                          <span>
                            <strong className="text-orange-400">{item.quantity}x</strong> {item.productName}
                            {item.selectedCremas && item.selectedCremas.length > 0 && (
                              <span className="text-[10px] text-slate-400 block ml-4">
                                🧴 Salsas: {item.selectedCremas.join(', ')}
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-slate-200">
                            S/ {item.itemTotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Status Controls */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-between gap-2.5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <span className="text-base font-black text-orange-400 md:text-right">
                      Total: S/ {order.total.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setViewingTicketOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 border border-slate-700"
                        title="Imprimir Ticket Térmico"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ticket</span>
                      </button>

                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="PENDIENTE">⏳ PENDIENTE</option>
                        <option value="PREPARANDO">🔥 PREPARANDO</option>
                        <option value="LISTO">✅ LISTO</option>
                        <option value="EN_CAMINO">🛵 EN CAMINO</option>
                        <option value="ENTREGADO">🎉 ENTREGADO</option>
                        <option value="CANCELADO">❌ CANCELADO</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Pantalla Cocina KDS */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-amber-400">Pantalla de Cocina en Vivo (KDS)</h3>
              <p className="text-xs text-slate-300">Monitoreo de comandas en preparación y tiempos de entrega.</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-black rounded-lg border border-amber-500/30 animate-pulse">
              EN VIVO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(o => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO').map(order => (
              <div key={order.id} className="bg-[#0F1424] border-2 border-orange-500/60 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-base font-black text-orange-400">#{order.orderNumber}</span>
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                    {order.orderType}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="text-xs text-slate-200">
                      <span className="font-black text-amber-400">{item.quantity}x</span> {item.productName}
                      {item.selectedCremas && (
                        <div className="text-[10px] text-slate-400 ml-3">
                          🧴 {item.selectedCremas.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 font-bold">
                    Nota: {order.notes}
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'PREPARANDO')}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase"
                  >
                    Preparando
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'LISTO')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase"
                  >
                    Listo ✅
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Productos & Stock */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {products.map(prod => (
              <div
                key={prod.id}
                className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {prod.categorySlug}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {prod.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">Precio:</span>
                    <span className="font-black text-orange-400">S/ {prod.price.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">Disponibilidad:</span>
                    <button
                      onClick={() => toggleProductAvailability(prod.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${
                        prod.available
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {prod.available ? 'En Carta' : 'Agotado'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Ventas & Caja */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-bold">Total Recaudado</span>
              <p className="text-2xl font-black text-orange-400 mt-1">S/ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-bold">Total Pedidos</span>
              <p className="text-2xl font-black text-white mt-1">{orders.length}</p>
            </div>
            <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-bold">Ticket Promedio</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                S/ {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Insumos */}
      {activeTab === 'inventory' && (
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Control de Insumos Principales
          </h3>
          <div className="divide-y divide-slate-800">
            {initialSupplies.map((sup, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <span className="font-bold text-white">{sup.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-black">{sup.stock}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {sup.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Configuración */}
      {activeTab === 'config' && (
        <form onSubmit={handleConfigSubmit} className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Configuración del Restaurante
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={configForm.businessName}
                onChange={e => setConfigForm({ ...configForm, businessName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={configForm.phone}
                onChange={e => setConfigForm({ ...configForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Dirección del Local</label>
              <input
                type="text"
                value={configForm.address}
                onChange={e => setConfigForm({ ...configForm, address: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Costo de Delivery (S/)</label>
              <input
                type="number"
                step="0.5"
                value={configForm.deliveryFee}
                onChange={e => setConfigForm({ ...configForm, deliveryFee: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Horario de Atención</label>
              <input
                type="text"
                value={configForm.openingHours}
                onChange={e => setConfigForm({ ...configForm, openingHours: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider transition-all"
          >
            Guardar Cambios
          </button>
        </form>
      )}
    </div>
  );
};
