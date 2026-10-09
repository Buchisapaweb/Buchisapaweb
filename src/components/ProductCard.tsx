import React from 'react';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div 
      className={`group bg-stone-900/90 rounded-2xl border border-stone-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-amber-500/10 ${
        !product.available ? 'opacity-65 grayscale-[30%]' : ''
      }`}
    >
      {/* Product Image Header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-950">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          {product.badge ? (
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md shadow-md">
              {product.badge}
            </span>
          ) : product.popular ? (
            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Popular
            </span>
          ) : <span />}

          {!product.available && (
            <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
              <AlertCircle className="w-3 h-3" /> Agotado
            </span>
          )}
        </div>

        {/* Price tag over image */}
        <div className="absolute bottom-2.5 right-2.5">
          <div className="bg-stone-950/90 backdrop-blur-sm border border-stone-700/80 text-amber-400 font-black px-2.5 py-1 rounded-xl text-base shadow-md">
            S/ {product.price.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              {product.category}
            </span>
            <span className="text-stone-600 text-xs">•</span>
            <span className="text-stone-500 text-[11px]">#{product.code}</span>
          </div>

          <h3 className="text-base font-black text-white group-hover:text-amber-400 transition leading-snug">
            {product.name}
          </h3>

          {product.description ? (
            <p className="text-stone-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          ) : (
            <p className="text-stone-500 text-xs italic mt-1.5">
              Preparado al momento con el toque especial de BuchiSapa.
            </p>
          )}
        </div>

        {/* Footer / Action */}
        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
          <div className="text-[11px] text-stone-400">
            {product.includes_sauces ? (
              <span className="text-emerald-400 font-medium">Incluye cremas & ají</span>
            ) : (
              <span>Sabor original</span>
            )}
          </div>

          <button
            onClick={() => onSelect(product)}
            disabled={!product.available}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition active:scale-95 ${
              product.available
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{product.includes_sauces ? 'Personalizar' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
