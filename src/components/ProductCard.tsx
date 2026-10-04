import React from 'react';
import { Product } from '../types';
import { Plus, SlidersHorizontal, Ban } from 'lucide-react';
import { useBuchisapa } from '../context/BuchisapaContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setCustomizingProduct, quickAddToCart } = useBuchisapa();

  return (
    <div
      className={`bg-[#0F1424] border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-orange-950/20 group relative ${
        !product.available ? 'opacity-60' : ''
      }`}
      data-testid={`product_card_${product.id}`}
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-900 mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {/* Sold out overlay */}
          {!product.available && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-1.5 text-red-400 font-black text-xs uppercase tracking-wider backdrop-blur-[2px]">
              <Ban className="w-4 h-4" />
              <span>Agotado</span>
            </div>
          )}

          {/* Sauces Badge */}
          {product.includesSauces && product.available && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-400 border border-amber-500/20">
              Incluye Cremas
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <h3 className="font-bold text-sm sm:text-base text-white leading-snug line-clamp-1 group-hover:text-orange-400 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Price & Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none mb-0.5">
            Precio
          </span>
          <span className="text-base sm:text-lg font-black text-orange-400 leading-none">
            S/ {product.price.toFixed(2)}
          </span>
        </div>

        {product.available && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCustomizingProduct(product)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all text-xs font-bold flex items-center gap-1"
              title="Personalizar cremas y guarniciones"
              data-testid={`customize_btn_${product.id}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => quickAddToCart(product)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md shadow-orange-600/20 active:scale-95 transition-all"
              data-testid={`quick_add_btn_${product.id}`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
