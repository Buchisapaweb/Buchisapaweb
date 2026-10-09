import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  Bike, 
  Store, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { CartItem, Order, StoreConfig } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  storeConfig: StoreConfig;
  onSubmitOrder: (order: Order, openWhatsApp: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  storeConfig,
  onSubmitOrder
}) => {
  const [orderType, setOrderType] = React.useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [reference, setReference] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'yape' | 'plin' | 'efectivo' | 'tarjeta'>('yape');
  const [cashAmount, setCashAmount] = React.useState<string>('');
  const [formError, setFormError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? storeConfig.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const cashChange = cashAmount && Number(cashAmount) > total ? Number(cashAmount) - total : 0;

  const handleCheckout = (openWhatsApp: boolean) => {
    setFormError(null);
    if (!customerName.trim()) {
      setFormError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setFormError('Por favor ingresa un número de teléfono/WhatsApp válido.');
      return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      setFormError('Por favor ingresa tu dirección de entrega en Santa Clara / Ate.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `BS-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: orderCode,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderType,
      address: orderType === 'delivery' ? address.trim() : 'Recojo en local BuchiSapa (Santa Clara)',
      reference: reference.trim(),
      items: [...cart],
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      cashChangeFor: paymentMethod === 'efectivo' && cashAmount ? Number(cashAmount) : undefined,
      status: 'pending'
    };

    onSubmitOrder(newOrder, openWhatsApp);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-stone-900 border-l border-stone-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              🍗
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Tu Pedido BuchiSapa</h2>
              <span className="text-xs text-stone-400">
                {cart.length === 0 ? 'El carrito está vacío' : `${cart.length} productos agregados`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-stone-400 space-y-4">
            <div className="w-20 h-20 rounded-full bg-stone-800/80 flex items-center justify-center text-3xl">
              🛒
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tu carrito está vacío</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explora nuestra carta de alitas, pollo broaster crujiente, platos amazónicos y hamburguesas.
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-2.5 rounded-xl text-sm transition"
            >
              Explorar Menú
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            
            {/* Items list */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Platos Seleccionados
              </span>

              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-500 uppercase">
                          {item.product.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">{item.product.name}</h4>
                      <span className="text-xs font-bold text-amber-400">
                        S/ {item.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.cartId)}
                      className="text-stone-500 hover:text-red-400 p-1.5 transition"
                      title="Eliminar del pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sauces breakdown */}
                  {item.selectedSauces.length > 0 && (
                    <div className="text-[11px] text-stone-400 bg-stone-900/80 px-2.5 py-1.5 rounded-lg border border-stone-800">
                      <span className="text-stone-300 font-semibold">Cremas: </span>
                      {item.selectedSauces.join(', ')}
                    </div>
                  )}

                  {/* Extras breakdown */}
                  {item.selectedExtras.length > 0 && (
                    <div className="text-[11px] text-amber-300/90 bg-stone-900/80 px-2.5 py-1.5 rounded-lg border border-stone-800">
                      <span className="text-amber-400 font-semibold">Extras: </span>
                      {item.selectedExtras.map((e) => `${e.name} (+S/ ${e.price.toFixed(2)})`).join(', ')}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <div className="text-[11px] text-stone-400 italic">
                      Nota: "{item.notes}"
                    </div>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                    <span className="text-xs text-stone-500">
                      S/ {item.unitPriceWithExtras.toFixed(2)} c/u
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, -1)}
                        className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center font-bold text-xs transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-black text-white w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, 1)}
                        className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery or Pickup Toggle */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Modalidad de Entrega
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition ${
                    orderType === 'delivery'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>🛵 Delivery (+S/ {storeConfig.deliveryFee.toFixed(2)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition ${
                    orderType === 'pickup'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>🏬 Recojo en Local</span>
                </button>
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="space-y-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
              <span className="text-xs font-bold text-white block">
                Datos para la Entrega
              </span>

              {formError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1 font-medium">Nombre completo:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-medium">Teléfono / WhatsApp:</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="Ej: 987654321"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <>
                    <div>
                      <label className="text-stone-400 block mb-1 font-medium">Dirección en Santa Clara / Ate:</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Calle, Jr, Mz, Lote y Urb..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-stone-400 block mb-1 font-medium">Referencia de entrega:</label>
                      <input
                        type="text"
                        placeholder="Ej: Portón blanco, frente al colegio o botica..."
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Método de Pago
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('yape')}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition ${
                    paymentMethod === 'yape'
                      ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <span className="font-black block">Yape</span>
                    <span className="text-[10px] text-stone-500">987 654 321</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('plin')}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition ${
                    paymentMethod === 'plin'
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <span className="font-black block">Plin</span>
                    <span className="text-[10px] text-stone-500">987 654 321</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition ${
                    paymentMethod === 'efectivo'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="font-black block">Efectivo</span>
                    <span className="text-[10px] text-stone-500">Contraentrega</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition ${
                    paymentMethod === 'tarjeta'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span className="font-black block">Tarjeta POS</span>
                    <span className="text-[10px] text-stone-500">Visa / MC</span>
                  </div>
                </button>
              </div>

              {/* Cash change calculator */}
              {paymentMethod === 'efectivo' && (
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-300">¿Con cuánto efectivo pagarás?</label>
                    <span className="text-stone-500 text-[11px]">(Para llevar cambio)</span>
                  </div>
                  <input
                    type="number"
                    placeholder={`Ej: ${Math.ceil(total / 10) * 10 + 10}`}
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                  {cashChange > 0 && (
                    <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5 pt-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>El repartidor te llevará vuelto de: S/ {cashChange.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer Summary & Submission */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 space-y-3 shrink-0">
            {/* Calculation rows */}
            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} productos):</span>
                <span className="text-stone-200 font-bold">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Delivery:</span>
                <span className="text-stone-200 font-bold">
                  {deliveryFee > 0 ? `S/ ${deliveryFee.toFixed(2)}` : 'GRATIS (Recojo)'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-stone-800">
                <span>Total a Pagar:</span>
                <span className="text-amber-400 text-xl font-black">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCheckout(true)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Pedir por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheckout(false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 text-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar Pedido Web</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
