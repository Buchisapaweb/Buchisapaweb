import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, Utensils, MapPin, Plus, Minus } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    total,
    orderType,
    deliveryLocation,
    setIsLocationModalOpen,
    needCutlery,
    setNeedCutlery,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-[#111827] text-white h-full flex flex-col shadow-2xl border-l border-gray-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] font-black text-lg text-white">
                Tu Pedido Buchisapa
              </h2>
              <span className="text-xs text-amber-400 font-medium">
                {orderType === 'delivery' ? '🛵 Delivery a Domicilio' : '🏪 Recojo en Tienda'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar pedido"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Subbar: Count & Vaciar */}
        {items.length > 0 && (
          <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-wider">
              Platos Seleccionados ({totalItems})
            </span>
            <button
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-gray-500">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Aún no has seleccionado ningún platillo. ¡Explora nuestra carta y deleita tu paladar!
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg transition-transform active:scale-95"
              >
                Ver Carta Digital
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white">{item.product.name}</h4>
                      <div className="text-xs text-amber-400 font-extrabold mt-0.5">
                        S/ {item.unitPrice.toFixed(2)} c/u
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                      title="Eliminar plato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Accompaniments & Sauces tags */}
                  {item.selectedAccompaniment && (
                    <div className="text-[11px] text-gray-300 bg-gray-800/80 px-2 py-1 rounded-lg border border-gray-700/60 inline-block">
                      🍟 <span className="font-semibold">{item.selectedAccompaniment}</span>
                    </div>
                  )}

                  {item.selectedSauces && item.selectedSauces.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.selectedSauces.map((sauce) => (
                        <span
                          key={sauce}
                          className="text-[10px] bg-red-950/60 text-red-300 border border-red-900/40 px-2 py-0.5 rounded-md"
                        >
                          {sauce}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-gray-400 italic bg-black/40 px-2 py-1 rounded-md">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Quantity and Subtotal controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-800/80">
                    <div className="flex items-center gap-2 bg-gray-950 rounded-full border border-gray-700 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="text-gray-400 hover:text-white p-0.5"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-white w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="text-gray-400 hover:text-white p-0.5"
                        aria-label="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-black text-sm text-white">
                      S/ {item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Cutlery toggle */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <span>¿Incluir cubiertos descartables?</span>
                </div>
                <input
                  type="checkbox"
                  checked={needCutlery}
                  onChange={(e) => setNeedCutlery(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
              </div>

              {/* Delivery notice card */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <div>
                    <span className="font-semibold text-gray-200">
                      {orderType === 'delivery' ? 'Dirección de envío:' : 'Recojo en tienda:'}
                    </span>
                    <p className="text-gray-400 truncate max-w-[200px]">
                      {orderType === 'delivery' ? deliveryLocation.address : 'Santa Clara, Ate'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Calculation & Checkout button */}
        {items.length > 0 && (
          <div className="p-4 bg-[#0b0f19] border-t border-gray-800 space-y-3">
            <div className="space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-white">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="font-bold text-white">
                  {orderType === 'delivery' ? `S/ ${deliveryLocation.fee.toFixed(2)}` : 'Gratis'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-gray-800">
                <span>Total a Pagar:</span>
                <span className="text-amber-400">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black py-3 px-4 rounded-full shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
            >
              <span>Continuar con el Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
