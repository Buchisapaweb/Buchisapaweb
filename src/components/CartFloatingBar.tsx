import React from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface CartFloatingBarProps {
  onOpenCart: () => void;
}

export const CartFloatingBar: React.FC<CartFloatingBarProps> = ({ onOpenCart }) => {
  const { cartCount, cartSubtotal } = useBuchisapa();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={onOpenCart}
          className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl shadow-orange-600/40 border border-orange-400/30 flex items-center justify-between group active:scale-[0.98] transition-all"
          data-testid="floating_cart_button"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center font-black text-xs">
              {cartCount}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-100 block leading-none">
                Tu Pedido
              </span>
              <span className="text-xs text-white font-semibold">
                Ver detalle y finalizar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-black text-base">
            <span>S/ {cartSubtotal.toFixed(2)}</span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
