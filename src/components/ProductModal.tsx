import React, { useState, useEffect } from 'react';
import { Product, Cream, Accompaniment } from '../types';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    accompaniment?: string,
    sauces?: string[],
    notes?: string
  ) => void;
  availableCreams: Cream[];
  availableAccompaniments: Accompaniment[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  availableCreams,
  availableAccompaniments,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAccompaniment, setSelectedAccompaniment] = useState<string>('');
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [imgError, setImgError] = useState(false);

  const relevantAccompaniments = availableAccompaniments.filter((acc) => {
    if (!product?.has_accompaniment) return false;
    if (!product.accompaniment_ids || product.accompaniment_ids.length === 0) return true;
    return product.accompaniment_ids.includes(acc.id);
  });

  const relevantSauces = availableCreams.filter((s) => {
    if (product?.includes_sauces === false) return false;
    if (!product?.sauce_ids || product.sauce_ids.length === 0) return true;
    return product.sauce_ids.includes(s.id);
  });

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setImgError(false);

      if (product.has_accompaniment && relevantAccompaniments.length > 0) {
        setSelectedAccompaniment(relevantAccompaniments[0].name);
      } else {
        setSelectedAccompaniment('');
      }

      if (product.includes_sauces !== false && relevantSauces.length > 0) {
        const defaultSauces = relevantSauces.slice(0, 4).map((s) => s.name);
        setSelectedSauces(defaultSauces);
      } else {
        setSelectedSauces([]);
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const toggleSauce = (sauceName: string) => {
    if (selectedSauces.includes(sauceName)) {
      setSelectedSauces(selectedSauces.filter((s) => s !== sauceName));
    } else {
      setSelectedSauces([...selectedSauces, sauceName]);
    }
  };

  const handleSelectAllSauces = () => {
    if (selectedSauces.length === relevantSauces.length) {
      setSelectedSauces([]);
    } else {
      setSelectedSauces(relevantSauces.map((s) => s.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart(product, quantity, selectedAccompaniment || undefined, selectedSauces, notes.trim() || undefined);
    onClose();
  };

  const totalCalculated = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl text-gray-900 my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-md"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Header */}
        <div className="relative h-52 sm:h-60 w-full bg-gray-100">
          <img
            src={imgError ? '/imagenes/logo/logo-buchisapa.webp' : product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-md">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-amber-300 font-black text-xl">
                S/ {product.price.toFixed(2)}
              </span>
              {product.is_promotion && (
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-200" /> Promoción Especial
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[calc(85vh-190px)] overflow-y-auto">
          {product.description && (
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
              {product.description}
            </p>
          )}

          {/* Guarnición */}
          {product.has_accompaniment && relevantAccompaniments.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center justify-between">
                <span>Elige tu Guarnición</span>
                <span className="text-red-600 text-[11px] font-bold">Obligatorio</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relevantAccompaniments.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccompaniment(acc.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      selectedAccompaniment === acc.name
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{acc.name}</span>
                    {selectedAccompaniment === acc.name && (
                      <Check className="w-4 h-4 text-red-600 stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cremas y Salsas */}
          {product.includes_sauces !== false && relevantSauces.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-800">
                  Cremas Caseras BuchiSapa
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllSauces}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  {selectedSauces.length === relevantSauces.length ? 'Quitar todas' : 'Todas las cremas'}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Seleccionadas: {selectedSauces.length} de {relevantSauces.length}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {relevantSauces.map((sauce) => {
                  const isChecked = selectedSauces.includes(sauce.name);
                  return (
                    <button
                      key={sauce.id}
                      type="button"
                      onClick={() => toggleSauce(sauce.name)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                        isChecked
                          ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                          isChecked
                            ? 'bg-red-600 border-red-600 text-white font-bold'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                      <span className="truncate">{sauce.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              Instrucciones Especiales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Pollo bien dorado, ají aparte, sin sal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500"
              maxLength={150}
            />
          </div>

          {/* Quantity Counter & Submit */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-gray-700 shadow-sm transition-colors"
                aria-label="Restar una unidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-black text-sm text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-gray-700 shadow-sm transition-colors"
                aria-label="Sumar una unidad"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black py-3 px-5 rounded-full shadow-lg shadow-red-600/30 transition-all flex items-center justify-between text-sm"
            >
              <span>Agregar al Pedido</span>
              <span className="text-amber-200 font-black">S/ {totalCalculated.toFixed(2)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
