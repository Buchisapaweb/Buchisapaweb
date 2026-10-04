import React, { useState } from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { ExtraOption } from '../types';

export const CustomizationModal: React.FC = () => {
  const { customizingProduct, setCustomizingProduct, addToCart } = useBuchisapa();

  if (!customizingProduct) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedAccompaniments, setSelectedAccompaniments] = useState<string[]>(
    customizingProduct.accompaniments || []
  );
  const [selectedCremas, setSelectedCremas] = useState<string[]>(
    customizingProduct.cremas || []
  );
  const [availableExtras, setAvailableExtras] = useState<ExtraOption[]>([
    { id: 'ext-1', name: 'Huevo Frito a la Plancha', price: 2.0, selected: false },
    { id: 'ext-2', name: 'Lámina de Queso Fundido', price: 2.0, selected: false },
    { id: 'ext-3', name: 'Tiras de Tocino Ahumado', price: 2.0, selected: false },
    { id: 'ext-4', name: 'Plátano Maduro Frito', price: 2.0, selected: false },
    { id: 'ext-5', name: 'Porción Extra de Papas Crocantes', price: 4.0, selected: false }
  ]);
  const [instructions, setInstructions] = useState('');

  const toggleAccompaniment = (acc: string) => {
    setSelectedAccompaniments(prev =>
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const toggleCrema = (crema: string) => {
    setSelectedCremas(prev =>
      prev.includes(crema) ? prev.filter(c => c !== crema) : [...prev, crema]
    );
  };

  const toggleExtra = (id: string) => {
    setAvailableExtras(prev =>
      prev.map(e => (e.id === id ? { ...e, selected: !e.selected } : e))
    );
  };

  const extrasSum = availableExtras
    .filter(e => e.selected)
    .reduce((sum, e) => sum + e.price, 0);

  const unitTotal = customizingProduct.price + extrasSum;
  const grandTotal = unitTotal * quantity;

  const handleConfirm = () => {
    addToCart(
      customizingProduct,
      quantity,
      selectedAccompaniments,
      selectedCremas,
      availableExtras.filter(e => e.selected),
      instructions
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative h-44 bg-slate-900">
          <img
            src={customizingProduct.image}
            alt={customizingProduct.name}
            className="w-full h-full object-cover filter brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1424] via-transparent to-transparent" />
          
          <button
            onClick={() => setCustomizingProduct(null)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 active:scale-95 transition-all"
            data-testid="close_modal_button"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {customizingProduct.name}
            </h2>
            <p className="text-xs text-orange-400 font-extrabold mt-0.5">
              Precio Base: S/ {customizingProduct.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-5">
          {/* Accompaniments */}
          {customizingProduct.accompaniments.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Guarniciones Incluidas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customizingProduct.accompaniments.map(acc => {
                  const isChecked = selectedAccompaniments.includes(acc);
                  return (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => toggleAccompaniment(acc)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                      }`}
                    >
                      <span>{acc}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          isChecked ? 'bg-orange-500 text-white' : 'border border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cremas / Sauces */}
          {customizingProduct.cremas.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Cremas & Salsas Caseras
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {customizingProduct.cremas.map(crema => {
                  const isChecked = selectedCremas.includes(crema);
                  return (
                    <button
                      key={crema}
                      type="button"
                      onClick={() => toggleCrema(crema)}
                      className={`p-2 rounded-xl text-xs font-bold text-center transition-all ${
                        isChecked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                      }`}
                    >
                      {crema}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras / Adicionales */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Adicionales / Extras
            </h4>
            <div className="space-y-2">
              {availableExtras.map(extra => (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    extra.selected
                      ? 'bg-orange-500/20 text-white border border-orange-500/40'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  <span>{extra.name}</span>
                  <span className="text-orange-400 font-black">+ S/ {extra.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Instrucciones Especiales
            </h4>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Ej: papas bien doradas, sin mayonesa, enviar ají extra..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              data-testid="modal_instructions_input"
            />
          </div>
        </div>

        {/* Footer: Quantity & Add Button */}
        <div className="p-4 sm:p-5 bg-[#0A0D1A] border-t border-slate-800/80 flex items-center justify-between gap-3">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95"
              data-testid="modal_decrement_qty"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center text-sm font-black text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              className="p-1.5 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-slate-700 active:scale-95"
              data-testid="modal_increment_qty"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm shadow-lg shadow-orange-600/25 active:scale-[0.98] transition-all flex items-center justify-between"
            data-testid="modal_confirm_add"
          >
            <span>Agregar al Pedido</span>
            <span className="bg-black/20 px-2 py-0.5 rounded-md">
              S/ {grandTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
