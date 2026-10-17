import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, Store, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Order, OrderItem } from '../types';
import { STORE_INFO } from '../data/initialData';

interface CheckoutPageProps {
  onBackToMenu: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToMenu, onOrderPlaced }) => {
  const { items, subtotal, total, orderType, setOrderType, deliveryLocation, setDeliveryLocation, needCutlery, clearCart } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(deliveryLocation.phone || user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(deliveryLocation.address || '');
  const [reference, setReference] = useState(deliveryLocation.reference || '');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'plin' | 'efectivo' | 'tarjeta'>('yape');
  const [cashAmount, setCashAmount] = useState<number>(Math.ceil(total / 10) * 10);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center text-3xl">
            🛒
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-xs text-gray-500">
            Debes agregar platillos de la carta antes de poder procesar tu orden.
          </p>
          <button
            onClick={onBackToMenu}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xs shadow-md transition-transform active:scale-95"
          >
            Regresar a la Carta
          </button>
        </div>
      </div>
    );
  }

  const changeDue = Math.max(0, cashAmount - total);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y número telefónico para confirmar la orden.');
      return;
    }

    if (orderType === 'delivery' && !address.trim()) {
      setErrorMsg('Por favor ingresa la dirección de entrega.');
      return;
    }

    setIsSubmitting(true);

    const orderNumber = `BS-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      accompaniment: item.selectedAccompaniment,
      sauces: item.selectedSauces,
      notes: item.notes,
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      orderType,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      deliveryAddress: orderType === 'delivery' ? address : undefined,
      deliveryReference: orderType === 'delivery' ? reference : undefined,
      deliveryFee: orderType === 'delivery' ? deliveryLocation.fee : 0,
      paymentMethod,
      cashAmount: paymentMethod === 'efectivo' ? cashAmount : undefined,
      changeAmount: paymentMethod === 'efectivo' ? changeDue : undefined,
      notes: orderNotes || undefined,
      needCutlery,
      items: orderItems,
      subtotal,
      total,
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => null);
    } catch {
      // Continue locally
    }

    const existingOrders = JSON.parse(localStorage.getItem('buchisapa_recent_orders') || '[]');
    localStorage.setItem('buchisapa_recent_orders', JSON.stringify([newOrder, ...existingOrders]));

    clearCart();
    setIsSubmitting(false);
    onOrderPlaced(newOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Carta Digital</span>
        </button>

        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-black text-gray-900">
              Confirmar & Pagar Pedido
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Completa tus datos para enviar tu pedido a la cocina de BuchiSapa
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-bold">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Compra Segura</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-xs text-red-700 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Delivery details & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Modalidad */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-3 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600">
                1. Modalidad de Entrega
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    orderType === 'delivery'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>🛵 Delivery (S/ {deliveryLocation.fee.toFixed(2)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    orderType === 'pickup'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>🏪 Recojo en Tienda (Gratis)</span>
                </button>
              </div>
            </div>

            {/* 2. Customer Contact */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600">
                2. Datos de Contacto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Rodrigo Peña"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="924955869"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="para recibir el comprobante digital"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500"
                />
              </div>

              {orderType === 'delivery' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Dirección Exacta de Entrega *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle, Jr, Av, Mz, Lote o Urbanización"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Referencia para el Repartidor</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ej: A media cuadra del colegio, timbre azul, casa de 3 pisos"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 3. Forma de Pago */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600">
                3. Forma de Pago
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('yape')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'yape'
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <span className="text-xs font-black block">Yape</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('plin')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'plin'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs font-black block">Plin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'efectivo'
                      ? 'bg-green-50 border-green-500 text-green-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Banknote className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <span className="text-xs font-black block">Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'tarjeta'
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <span className="text-xs font-black block">Tarjeta / POS</span>
                </button>
              </div>

              {/* Payment details */}
              {paymentMethod === 'yape' && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-2 text-xs text-purple-900">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">📱 Yape Oficial BuchiSapa:</span>
                    <span className="font-mono font-black text-purple-700 text-sm">{STORE_INFO.yapeNumber}</span>
                  </div>
                  <p>Titular: <strong>{STORE_INFO.yapeHolder}</strong></p>
                  <p className="text-[11px] text-purple-700">
                    Transfiere el total exacto (<strong>S/ {total.toFixed(2)}</strong>) a nuestro número oficial. Al pulsar Confirmar, tu orden se enviará a cocina de inmediato.
                  </p>
                </div>
              )}

              {paymentMethod === 'plin' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2 text-xs text-blue-900">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">📱 Plin Oficial BuchiSapa:</span>
                    <span className="font-mono font-black text-blue-700 text-sm">{STORE_INFO.yapeNumber}</span>
                  </div>
                  <p>Titular: <strong>{STORE_INFO.yapeHolder}</strong></p>
                  <p className="text-[11px] text-blue-700">
                    Realiza tu Plin por <strong>S/ {total.toFixed(2)}</strong> desde BBVA, Scotiabank o Interbank.
                  </p>
                </div>
              )}

              {paymentMethod === 'efectivo' && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-2xl space-y-3 text-xs text-green-900">
                  <span className="font-bold block">💵 Pago en Efectivo contra Entrega</span>
                  <div className="flex items-center gap-3">
                    <label className="text-green-800 text-xs shrink-0 font-medium">¿Con cuánto billete pagarás?</label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">S/</span>
                      <input
                        type="number"
                        min={total}
                        step="5"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-gray-600">Vuelto a entregarte:</span>
                    <span className="font-bold text-green-700 text-sm">S/ {changeDue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'tarjeta' && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-xs text-orange-950 space-y-1">
                  <span className="font-bold block">💳 POS Inalámbrico contra Entrega</span>
                  <p>El repartidor llevará un lector POS para pagar con Visa, Mastercard o contactless en la puerta de tu domicilio.</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Instrucciones o notas adicionales para la cocina
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej: Timbre no funciona, llamar al llegar. Mucho ají charapita por favor."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 sticky top-28 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600 pb-2 border-b border-gray-100">
                Resumen de tu Pedido
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.cartItemId} className="text-xs space-y-1 pb-2 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-bold text-red-600">
                        S/ {item.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {item.selectedAccompaniment && (
                      <p className="text-[11px] text-gray-500">🍟 {item.selectedAccompaniment}</p>
                    )}

                    {item.selectedSauces && item.selectedSauces.length > 0 && (
                      <p className="text-[10px] text-gray-500 truncate">
                        Salsas: {item.selectedSauces.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="pt-2 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío:</span>
                  <span className="font-semibold text-gray-900">
                    {orderType === 'delivery' ? `S/ ${deliveryLocation.fee.toFixed(2)}` : 'Gratis (Recojo)'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total General:</span>
                  <span className="text-red-600">S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-black text-sm rounded-full shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Enviando a Cocina...' : 'CONFIRMAR Y ENVIAR PEDIDO'}</span>
              </button>

              <div className="text-[11px] text-gray-500 text-center space-y-1">
                <p>📍 Preparado al instante en Av. La Estrella, Santa Clara</p>
                <p>Tiempo estimado: <strong>25 - 40 minutos</strong></p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
