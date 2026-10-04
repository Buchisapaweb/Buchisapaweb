import React, { useState } from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { Trash2, ShoppingBag, ArrowRight, Truck, Store, UtensilsCrossed } from 'lucide-react';
import { OrderType } from '../types';

interface CartPageProps {
  onNavigateToCheckout: () => void;
  onNavigateToHome: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigateToCheckout,
  onNavigateToHome
}) => {
  const { cartItems, removeCartItem, clearCart, cartSubtotal, businessConfig } = useBuchisapa();
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');

  const deliveryFee = orderType === 'DELIVERY' ? businessConfig.deliveryFee : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-white">Tu carrito está vacío</h2>
        <p className="text-xs text-slate-400">
          Agrega hamburguesas artesanales, combos broaster o delicias selváticas para empezar tu pedido.
        </p>
        <button
          onClick={onNavigateToHome}
          className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30"
          data-testid="explore_menu_btn"
        >
          Explorar la Carta
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-white">
          Mi Pedido ({cartItems.length} items)
        </h2>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
          data-testid="clear_all_cart"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vaciar Carrito</span>
        </button>
      </div>

      {/* Delivery Mode Selector */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Modalidad de Entrega
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setOrderType('DELIVERY')}
            className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              orderType === 'DELIVERY'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('PICKUP')}
            className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              orderType === 'PICKUP'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Recojo</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('DINE_IN')}
            className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              orderType === 'DINE_IN'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>En Mesa</span>
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cartItems.map(item => (
          <div
            key={item.id}
            className="bg-[#0F1424] border border-slate-800 rounded-2xl p-4 flex gap-3.5 items-start justify-between"
          >
            <img
              src={item.productImage}
              alt={item.productName}
              className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-white truncate">
                  {item.quantity}x {item.productName}
                </h4>
                <span className="font-black text-sm text-orange-400 shrink-0">
                  S/ {item.itemTotal.toFixed(2)}
                </span>
              </div>

              {/* Modifiers info */}
              {item.selectedAccompaniments.length > 0 && (
                <p className="text-[11px] text-slate-400 truncate">
                  Guarnición: {item.selectedAccompaniments.join(', ')}
                </p>
              )}

              {item.selectedCremas.length > 0 && (
                <p className="text-[11px] text-amber-400 truncate">
                  Cremas: {item.selectedCremas.join(', ')}
                </p>
              )}

              {item.selectedExtras.length > 0 && (
                <p className="text-[11px] text-emerald-400 truncate">
                  Extras: {item.selectedExtras.map(e => e.name).join(', ')}
                </p>
              )}

              {item.instructions && (
                <p className="text-[11px] text-slate-400 italic truncate">
                  Nota: "{item.instructions}"
                </p>
              )}
            </div>

            <button
              onClick={() => removeCartItem(item.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
              title="Eliminar plato"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Subtotal</span>
          <span className="text-white font-bold">S/ {cartSubtotal.toFixed(2)}</span>
        </div>

        {orderType === 'DELIVERY' && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Costo de Envío (Delivery)</span>
            <span className="text-amber-400 font-bold">S/ {deliveryFee.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <span className="font-black text-sm text-white uppercase tracking-wider">Total</span>
          <span className="font-black text-xl text-orange-400">S/ {grandTotal.toFixed(2)}</span>
        </div>

        <button
          onClick={onNavigateToCheckout}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          data-testid="proceed_checkout_btn"
        >
          <span>Continuar a Finalizar Pedido</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
