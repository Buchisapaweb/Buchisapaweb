import React, { useState } from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { OrderType, PaymentMethod, Order } from '../types';
import { CheckCircle2, Banknote, QrCode, CreditCard, AlertCircle } from 'lucide-react';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onNavigateBack: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onNavigateBack }) => {
  const { cartItems, cartSubtotal, businessConfig, placeOrder } = useBuchisapa();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryReference, setDeliveryReference] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [cashAmount, setCashAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = orderType === 'DELIVERY' ? businessConfig.deliveryFee : 0;
  const total = cartSubtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y apellidos.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMsg('Por favor ingresa un número de celular válido de 9 dígitos.');
      return;
    }
    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      setErrorMsg('Por favor ingresa la dirección exacta de entrega.');
      return;
    }
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      setErrorMsg('Por favor ingresa el número de mesa.');
      return;
    }

    setIsSubmitting(true);
    const newOrder = placeOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      orderType,
      deliveryAddress: deliveryAddress.trim() || undefined,
      deliveryReference: deliveryReference.trim() || undefined,
      tableNumber: tableNumber.trim() || undefined,
      paymentMethod,
      paymentAmountCash: cashAmount ? parseFloat(cashAmount) : total,
      notes: notes.trim() || undefined
    });

    setIsSubmitting(false);
    onOrderSuccess(newOrder);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Finalizar Pedido
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Completa tus datos de entrega y pago para enviar la comanda a la cocina.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Datos del Cliente */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            1. Datos del Cliente
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nombre y Apellidos *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ej: Juan Mendoza"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                data-testid="checkout_name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Celular / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={9}
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="987654321"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  data-testid="checkout_phone"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  data-testid="checkout_email"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Modalidad y Dirección */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            2. Destino de la Entrega
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {(['DELIVERY', 'PICKUP', 'DINE_IN'] as OrderType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  orderType === type
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {type === 'DELIVERY' ? 'Delivery' : type === 'PICKUP' ? 'Recojo' : 'En Mesa'}
              </button>
            ))}
          </div>

          {orderType === 'DELIVERY' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Dirección Exacta de Entrega *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Av. La Estrella 450, Urb. Santa Clara"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  data-testid="checkout_address"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Referencia de Entrega
                </label>
                <input
                  type="text"
                  value={deliveryReference}
                  onChange={e => setDeliveryReference(e.target.value)}
                  placeholder="Frente al parque, portón de rejas negras"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  data-testid="checkout_ref"
                />
              </div>
            </div>
          )}

          {orderType === 'PICKUP' && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
              <span className="font-bold text-orange-400 block mb-1">Recojo en Local BuchiSapa:</span>
              <span>{businessConfig.address}</span>
            </div>
          )}

          {orderType === 'DINE_IN' && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Número de Mesa en Local *
              </label>
              <input
                type="text"
                required
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                placeholder="Ej: Mesa 4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                data-testid="checkout_table"
              />
            </div>
          )}
        </div>

        {/* 3. Método de Pago */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            3. Método de Pago
          </h3>

          <div className="space-y-2">
            {[
              { id: 'EFECTIVO', name: 'Efectivo', desc: 'Paga al recibir (con billete o cambio)', icon: Banknote },
              { id: 'YAPE_PLIN', name: 'Yape / Plin', desc: 'Billetera digital (942 475 459)', icon: QrCode },
              { id: 'TARJETA', name: 'Tarjeta Débito/Crédito', desc: 'Visa, Mastercard, Tarjeta online', icon: CreditCard }
            ].map(m => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-orange-500/20 border border-orange-500 text-white'
                      : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{m.name}</p>
                      <p className="text-[11px] text-slate-400">{m.desc}</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {paymentMethod === 'EFECTIVO' && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ¿Con cuánto pagarás? (Para llevarte vuelto)
              </label>
              <input
                type="number"
                value={cashAmount}
                onChange={e => setCashAmount(e.target.value)}
                placeholder={`Ej: S/ ${(total + 10).toFixed(0)}`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Notas Adicionales
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: tocar timbre 2 veces, cubiertos descartables..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Total & Submit Button */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total a Pagar
              </span>
              <span className="text-2xl font-black text-orange-400">
                S/ {total.toFixed(2)}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {cartItems.length} platos en orden
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-base shadow-xl shadow-orange-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            data-testid="submit_order_btn"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Enviando comanda...' : 'Confirmar y Enviar a Cocina'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
