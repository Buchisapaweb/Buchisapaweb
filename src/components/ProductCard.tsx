import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onOpenCustomizer: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  onOpenCustomizer,
  onQuickAdd,
}) => {
  const [imgError, setImgError] = useState(false);

  const fallbackImage = '/imagenes/logo/logo-buchisapa.webp';

  const needsCustomization =
    (product.has_accompaniment && product.accompaniment_ids && product.accompaniment_ids.length > 0) ||
    (product.includes_sauces && product.sauce_ids && product.sauce_ids.length > 0);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (needsCustomization) {
      onOpenCustomizer(product);
    } else {
      onQuickAdd(product);
    }
  };

  return (
    <div
      onClick={() => onOpenCustomizer(product)}
      className="group bg-white hover:bg-gray-50/50 border border-gray-200/80 hover:border-red-500/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-0.5"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
        <img
          src={imgError ? fallbackImage : product.image_url}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {categoryName && (
          <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            {categoryName}
          </span>
        )}

        {product.is_promotion && (
          <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-200" /> PROMO
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base group-hover:text-red-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Preparado al momento con el auténtico sabor y sazón de BuchiSapa.'}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Precio</span>
            <span className="text-red-600 font-black text-lg">
              S/ {product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAction}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
              needsCustomization
                ? 'bg-amber-500 hover:bg-amber-600 text-gray-950 font-black'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{needsCustomization ? 'Personalizar' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
