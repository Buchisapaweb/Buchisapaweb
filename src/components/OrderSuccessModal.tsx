import React from 'react';
import { CheckCircle2, Clock, MapPin, Printer, ExternalLink, X, ChefHat, Bike } from 'lucide-react';
import { Order, StoreConfig } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewTicket: (order: Order) => void;
  storeConfig: StoreConfig;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewTicket,
  storeConfig
}) => {
  if (!order) return null;

  const handleOpenWhatsAppTracking = () => {
    const text = encodeURIComponent(
      `Hola BuchiSapa, acabo de registrar el pedido *#${order.code}* a nombre de *${order.customerName}*. ¿Podrían confirmarme el tiempo estimado de entrega? Muchas gracias!`
    );
    window.open(`https://wa.me/${storeConfig.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col text-white">
        
        {/* Top Celebration Header */}
        <div className="p-6 bg-gradient-to-b from-amber-500/20 via-stone-900 to-stone-900 text-center space-y-3 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/60 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
              ¡Pedido Confirmado con Éxito!
            </span>
            <h2 className="text-2xl font-black text-white">
              Pedido #{order.code}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Estamos preparando tu pedido en nuestro local de Santa Clara, Ate.
            </p>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="px-6 py-4 bg-stone-950/70 border-y border-stone-800/80">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-stone-300">Estado en Tiempo Real:</span>
            <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              {order.status === 'pending' ? 'Recibido en Cocina' : order.status}
            </span>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="space-y-1">
              <div className="h-1.5 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-bold text-amber-400 block">Recibido</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-stone-700 rounded-full" />
              <span className="text-[10px] text-stone-500 block">En Cocina</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-stone-700 rounded-full" />
              <span className="text-[10px] text-stone-500 block">En Camino</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-stone-700 rounded-full" />
              <span className="text-[10px] text-stone-500 block">Entregado</span>
            </div>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
            <div>
              <span className="text-stone-500 block font-medium">Cliente:</span>
              <span className="font-bold text-stone-200">{order.customerName}</span>
              <span className="text-stone-400 block">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-stone-500 block font-medium">Tiempo Estimado:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 30 a 45 minutos
              </span>
              <span className="text-stone-400 block capitalize">
                Pago: {order.paymentMethod} (S/ {order.total.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
            <span className="text-stone-400 block font-bold uppercase tracking-wider text-[10px]">
              Destino ({order.orderType === 'delivery' ? 'Delivery' : 'Recojo'}):
            </span>
            <div className="flex items-start gap-2 text-stone-200">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{order.address}</p>
                {order.reference && (
                  <p className="text-[11px] text-stone-400 mt-0.5">Ref: {order.reference}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick item summary */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <span className="text-stone-500 block font-bold uppercase tracking-wider text-[10px]">
              Resumen de Platos:
            </span>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-stone-300 py-0.5 border-b border-stone-800/40">
                <span>{it.quantity}x {it.product.name}</span>
                <span className="font-bold text-stone-200">S/ {it.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => onViewTicket(order)}
            className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold py-3 px-4 rounded-xl text-xs transition border border-stone-700"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Ver Comprobante / Ticket</span>
          </button>

          <button
            onClick={handleOpenWhatsAppTracking}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Consultar por WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
