import React from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { Truck, Receipt, Clock, CheckCircle2, ChevronRight, Utensils, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../types';

export const OrdersTrackerPage: React.FC = () => {
  const { orders, setViewingTicketOrder } = useBuchisapa();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'PREPARANDO':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'LISTO':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'ENTREGADO':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'CANCELADO':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const getStepNumber = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 1;
      case 'PREPARANDO':
        return 2;
      case 'LISTO':
        return 3;
      case 'ENTREGADO':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Seguimiento de Pedidos en Vivo
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Monitorea el estado de tus platos en la cocina de BuchiSapa en tiempo real.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Truck className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-sm font-bold text-slate-300">No tienes pedidos recientes</h3>
          <p className="text-xs text-slate-500">
            Realiza una orden desde el menú para darle seguimiento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const step = getStepNumber(order.status);
            const dateStr = new Date(order.createdAt).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-black text-orange-400">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-medium">
                      {dateStr} • {order.orderType}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status === 'PENDIENTE'
                      ? 'Recibido'
                      : order.status === 'PREPARANDO'
                      ? 'En Cocina'
                      : order.status === 'LISTO'
                      ? 'En Camino / Listo'
                      : order.status === 'ENTREGADO'
                      ? 'Entregado'
                      : 'Cancelado'}
                  </span>
                </div>

                {/* Progress Steps Bar */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { title: 'Recibido', num: 1 },
                    { title: 'En Cocina', num: 2 },
                    { title: 'En Camino', num: 3 },
                    { title: 'Entregado', num: 4 }
                  ].map(s => {
                    const isDone = step >= s.num;
                    return (
                      <div key={s.num} className="text-center space-y-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isDone ? 'bg-orange-500' : 'bg-slate-800'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold block ${
                            isDone ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Items preview */}
                <div className="bg-slate-900/80 rounded-xl p-3 space-y-1 text-xs text-slate-300">
                  {order.items.map(it => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.quantity}x {it.productName}
                      </span>
                      <span className="font-bold text-slate-400">
                        S/ {it.itemTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <div className="text-xs">
                    <span className="text-slate-400">Total: </span>
                    <span className="font-black text-orange-400 text-sm">
                      S/ {order.total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => setViewingTicketOrder(order)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Ver Ticket Comanda</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
