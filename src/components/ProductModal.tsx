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

  // Filter available accompaniments if product has specific IDs
  const relevantAccompaniments = availableAccompaniments.filter((acc) => {
    if (!product?.has_accompaniment) return false;
    if (!product.accompaniment_ids || product.accompaniment_ids.length === 0) return true;
    return product.accompaniment_ids.includes(acc.id);
  });

  // Filter available sauces if product has specific IDs
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

      // Default accompaniment
      if (product.has_accompaniment && relevantAccompaniments.length > 0) {
        setSelectedAccompaniment(relevantAccompaniments[0].name);
      } else {
        setSelectedAccompaniment('');
      }

      // Default sauces (first 3-4 creams checked by default if applicable)
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#161f30] border border-gray-700 rounded-3xl overflow-hidden shadow-2xl text-white my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-gray-600"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Header */}
        <div className="relative h-56 sm:h-64 w-full bg-gray-950">
          <img
            src={imgError ? '/imagenes/logo/logo-buchisapa.webp' : product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161f30] via-transparent to-black/40" />
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-400 font-black text-xl">
                S/ {product.price.toFixed(2)}
              </span>
              {product.is_promotion && (
                <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-200" /> Promoción Especial
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[calc(85vh-200px)] overflow-y-auto">
          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-300 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800">
              {product.description}
            </p>
          )}

          {/* Accompaniment Choice */}
          {product.has_accompaniment && relevantAccompaniments.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                <span>Elige tu Guarnición / Acompañamiento</span>
                <span className="text-gray-400 font-normal">Obligatorio</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relevantAccompaniments.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccompaniment(acc.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      selectedAccompaniment === acc.name
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span>{acc.name}</span>
                    {selectedAccompaniment === acc.name && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sauces / Cremas Selection */}
          {product.includes_sauces !== false && relevantSauces.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Cremas & Salsas Caseras BuchiSapa
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllSauces}
                  className="text-xs text-amber-500 hover:text-amber-400 underline font-semibold"
                >
                  {selectedSauces.length === relevantSauces.length ? 'Deseleccionar todas' : 'Todas las cremas'}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
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
                          ? 'bg-red-600/20 border-red-500 text-white'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                          isChecked
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'border-gray-600 bg-gray-950'
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

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Instrucciones Especiales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Pollo bien dorado, ají aparte, sin sal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
              maxLength={150}
            />
          </div>

          {/* Quantity Counter & Submit Button */}
          <div className="pt-3 border-t border-gray-800 flex items-center gap-4">
            <div className="flex items-center border border-gray-700 rounded-full bg-gray-900 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-800 text-gray-300"
                aria-label="Restar una unidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 text-center font-bold text-sm text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-800 text-gray-300"
                aria-label="Sumar una unidad"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-black py-3 px-5 rounded-full shadow-lg shadow-red-600/30 transition-all flex items-center justify-between text-sm"
            >
              <span>Agregar al Pedido</span>
              <span className="text-amber-200">S/ {totalCalculated.toFixed(2)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
