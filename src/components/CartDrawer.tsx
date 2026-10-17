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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white text-gray-900 h-full flex flex-col shadow-2xl border-l border-gray-100 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] font-black text-lg text-gray-900 leading-tight">
                Tu Pedido Buchisapa
              </h2>
              <span className="text-xs text-red-600 font-bold">
                {orderType === 'delivery' ? '🛵 Delivery a Domicilio' : '🏪 Recojo en Tienda'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Cerrar pedido"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Subbar: Count & Vaciar */}
        {items.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-bold uppercase tracking-wider">
              Platos Seleccionados ({totalItems})
            </span>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 font-bold transition-colors"
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
              <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Aún no has seleccionado ningún platillo. ¡Explora nuestra carta y añade tus favoritos!
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition-transform active:scale-95"
              >
                Ver Carta Digital
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900">{item.product.name}</h4>
                      <div className="text-xs text-red-600 font-extrabold mt-0.5">
                        S/ {item.unitPrice.toFixed(2)} c/u
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      title="Eliminar plato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.selectedAccompaniment && (
                    <div className="text-[11px] text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 inline-block font-semibold">
                      🍟 {item.selectedAccompaniment}
                    </div>
                  )}

                  {item.selectedSauces && item.selectedSauces.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.selectedSauces.map((sauce) => (
                        <span
                          key={sauce}
                          className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-md font-medium"
                        >
                          {sauce}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-gray-600 italic bg-gray-50 p-2 rounded-lg">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Quantity and Subtotal controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="text-gray-500 hover:text-gray-900 p-0.5"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="text-gray-500 hover:text-gray-900 p-0.5"
                        aria-label="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-black text-sm text-gray-900">
                      S/ {item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Cutlery toggle */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold">
                  <Utensils className="w-4 h-4 text-red-600" />
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
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="font-bold text-gray-900">
                      {orderType === 'delivery' ? 'Entrega a Domicilio:' : 'Recojo en Tienda:'}
                    </span>
                    <p className="text-gray-500 truncate max-w-[200px]">
                      {orderType === 'delivery' ? deliveryLocation.address : 'Santa Clara, Ate'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-red-600 hover:underline font-bold"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Price & Checkout button */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-100 space-y-3">
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-gray-900">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="font-bold text-gray-900">
                  {orderType === 'delivery' ? `S/ ${deliveryLocation.fee.toFixed(2)}` : 'Gratis'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total a Pagar:</span>
                <span className="text-red-600">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded-full shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
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
