import React from 'react';
import { Order } from '../types';
import { CheckCircle2, Receipt, Truck, ArrowLeft } from 'lucide-react';
import { useBuchisapa } from '../context/BuchisapaContext';

interface OrderSuccessPageProps {
  order: Order;
  onNavigateToHome: () => void;
  onNavigateToTracker: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  onNavigateToHome,
  onNavigateToTracker
}) => {
  const { setViewingTicketOrder } = useBuchisapa();

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
      {/* Celebration Icon */}
      <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white">
          ¡Pedido Registrado con Éxito!
        </h2>
        <p className="text-xs text-slate-400">
          La cocina de BuchiSapa ya está alistando tus platos con todo el sabor amazónico.
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 text-left space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs text-slate-400 font-bold uppercase">Código de Orden</span>
          <span className="text-base font-black text-orange-400">#{order.orderNumber}</span>
        </div>

        <div className="space-y-1 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Cliente:</span>
            <span className="font-bold text-white">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Teléfono:</span>
            <span className="font-bold text-white">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Modalidad:</span>
            <span className="font-bold text-amber-400">{order.orderType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total a Pagar:</span>
            <span className="font-black text-orange-400 text-sm">
              S/ {order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={() => setViewingTicketOrder(order)}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
          data-testid="view_ticket_success_btn"
        >
          <Receipt className="w-4 h-4 text-amber-400" />
          <span>Ver Ticket / Comanda Térmica</span>
        </button>

        <button
          onClick={onNavigateToTracker}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
          data-testid="track_order_success_btn"
        >
          <Truck className="w-4 h-4" />
          <span>Ver Estado en Vivo (Seguimiento)</span>
        </button>

        <button
          onClick={onNavigateToHome}
          className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la Carta</span>
        </button>
      </div>
    </div>
  );
};
