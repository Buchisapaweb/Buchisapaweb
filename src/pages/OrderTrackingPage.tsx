import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircle2, Clock, MapPin, ChefHat, Bike, Check, MessageSquare, ArrowLeft } from 'lucide-react';
import { STORE_INFO } from '../data/initialData';

interface OrderTrackingPageProps {
  order: Order;
  onBackToMenu: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ order: initialOrder, onBackToMenu }) => {
  const [order, setOrder] = useState<Order>(initialOrder);

  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (res.ok) {
          const updated = await res.json();
          if (updated && updated.status && isMounted) {
            setOrder((prev) => ({ ...prev, status: updated.status }));
          }
        }
      } catch {
        try {
          const savedOrders = JSON.parse(localStorage.getItem('buchisapa_recent_orders') || '[]');
          const match = savedOrders.find((o: Order) => o.id === order.id || o.orderNumber === order.orderNumber);
          if (match && match.status !== order.status && isMounted) {
            setOrder((prev) => ({ ...prev, status: match.status }));
          }
        } catch {
          // ignore
        }
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order.id, order.status, order.orderNumber]);

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'pendiente',
      label: 'Pedido Recibido',
      desc: 'Tu orden fue recibida y enviada a cocina.',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      key: 'en_preparacion',
      label: 'En Cocina',
      desc: 'Nuestros maestros cocineros están dorando tu pollo y alitas.',
      icon: <ChefHat className="w-5 h-5" />,
    },
    {
      key: 'en_camino',
      label: order.orderType === 'delivery' ? 'En Camino' : 'Listo para Recojo',
      desc:
        order.orderType === 'delivery'
          ? 'El repartidor lleva tu pedido en caja térmica.'
          : 'Pasa a recogerlo por nuestro mostrador.',
      icon: <Bike className="w-5 h-5" />,
    },
    {
      key: 'entregado',
      label: '¡Entregado!',
      desc: '¡Buen provecho! Disfruta del auténtico sabor BuchiSapa.',
      icon: <Check className="w-5 h-5" />,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return 0;
      case 'en_preparacion':
        return 1;
      case 'en_camino':
        return 2;
      case 'entregado':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-white text-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Carta Digital</span>
        </button>

        {/* Success Header Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 mx-auto flex items-center justify-center font-bold text-3xl">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase font-black tracking-widest text-red-600">
            ¡PEDIDO CONFIRMADO CON ÉXITO!
          </span>
          <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-black text-gray-900">
            Orden #{order.orderNumber}
          </h1>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Gracias por tu preferencia, <strong>{order.customerName}</strong>. Estamos preparando tus platillos con el mejor sabor de Santa Clara.
          </p>
        </div>

        {/* Live Progress Timeline */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-red-600">
            Estado de tu Pedido en Vivo
          </h2>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 space-y-8">
            {steps.map((step, idx) => {
              const isPassed = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="relative group">
                  {/* Step circle marker */}
                  <div
                    className={`absolute -left-[35px] sm:-left-[43px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? 'bg-amber-500 border-white text-gray-950 font-black scale-110 shadow-md animate-pulse'
                        : isPassed
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>

                  <div>
                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        isCurrent
                          ? 'text-red-600'
                          : isPassed
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                          En Progreso
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-red-600 pb-2 border-b border-gray-200">
            Detalles del Pedido
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
            <div>
              <span className="text-gray-500 block">Modalidad:</span>
              <strong className="text-gray-900 text-sm">
                {order.orderType === 'delivery' ? '🛵 Delivery a Domicilio' : '🏪 Recojo en Tienda'}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Forma de Pago:</span>
              <strong className="text-gray-900 text-sm uppercase">
                {order.paymentMethod}
              </strong>
            </div>
            {order.deliveryAddress && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 block">Dirección de Entrega:</span>
                <div className="flex items-start gap-1.5 text-gray-900 font-medium mt-0.5">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{order.deliveryAddress} {order.deliveryReference ? `(${order.deliveryReference})` : ''}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Platos Ordenados:
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-200/50">
                  <div>
                    <span className="font-bold text-gray-900">{item.quantity}x {item.name}</span>
                    {item.accompaniment && (
                      <span className="text-[11px] text-gray-500 ml-2">({item.accompaniment})</span>
                    )}
                  </div>
                  <span className="font-bold text-red-600">S/ {item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
            <span className="font-bold text-gray-900">Total Pagado / A Cobrar:</span>
            <span className="font-black text-red-600 text-lg">S/ {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* WhatsApp Support Box */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">¿Deseas comunicarte con nosotros?</h4>
              <p className="text-xs text-gray-500">Atención inmediata en nuestro WhatsApp oficial</p>
            </div>
          </div>

          <a
            href={`${STORE_INFO.whatsapp}?text=Hola%20BuchiSapa,%20consulto%20por%20mi%20pedido%20%23${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
