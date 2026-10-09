import React from 'react';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { Product, SelectedExtra } from '../types';
import { AVAILABLE_SAUCES, AVAILABLE_EXTRAS } from '../data/initialData';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedSauces: string[],
    selectedExtras: SelectedExtra[],
    notes: string
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [selectedSauces, setSelectedSauces] = React.useState<string[]>([
    'Ají Pollero Artesanal',
    'Mayonesa Casera'
  ]);
  const [selectedExtras, setSelectedExtras] = React.useState<SelectedExtra[]>([]);
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (product) {
      setQuantity(1);
      // Default recommended sauces for broaster / hamburgers
      if (product.includes_sauces) {
        setSelectedSauces(['Ají Pollero Artesanal', 'Mayonesa Casera', 'Ají de Cocona Amazónico']);
      } else {
        setSelectedSauces([]);
      }
      setSelectedExtras([]);
      setNotes('');
    }
  }, [product]);

  if (!product) return null;

  const toggleSauce = (sauceName: string) => {
    setSelectedSauces((prev) =>
      prev.includes(sauceName)
        ? prev.filter((s) => s !== sauceName)
        : [...prev, sauceName]
    );
  };

  const toggleExtra = (extra: typeof AVAILABLE_EXTRAS[0]) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, { id: extra.id, name: extra.name, price: extra.price }];
      }
    });
  };

  const extrasTotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onAddToCart(product, quantity, selectedSauces, selectedExtras, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header Image */}
        <div className="relative aspect-[16/9] w-full shrink-0 bg-stone-950">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/80 text-stone-300 hover:text-white hover:bg-stone-900 transition border border-stone-700/50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {product.name}
              </h2>
            </div>
            <div className="bg-amber-500 text-stone-950 font-black px-3 py-1.5 rounded-xl text-lg shadow-lg">
              S/ {product.price.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-300">
          {product.description && (
            <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Acompañamiento & Detalles
              </span>
              <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between bg-stone-950/40 p-3 rounded-2xl border border-stone-800/50">
            <div>
              <span className="font-bold text-white block">Cantidad</span>
              <span className="text-xs text-stone-400">¿Cuántas porciones deseas?</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center font-bold transition disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-black text-white w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sauces / Cremas (if applies) */}
          {product.includes_sauces && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  Elige tus Cremas & Ajíes
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  (Todas incluidas gratis)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_SAUCES.map((sauce) => {
                  const isChecked = selectedSauces.includes(sauce.name);
                  return (
                    <button
                      key={sauce.id}
                      type="button"
                      onClick={() => toggleSauce(sauce.name)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="font-medium pr-1">{sauce.name}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-amber-500 border-amber-500 text-stone-950'
                            : 'border-stone-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras / Adicionales */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">¿Deseas agregar Adicionales?</span>
              <span className="text-[11px] text-stone-400">Opcional</span>
            </div>

            <div className="space-y-2">
              {AVAILABLE_EXTRAS.map((extra) => {
                const isChecked = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-amber-500 border-amber-500 text-stone-950'
                            : 'border-stone-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-medium">{extra.name}</span>
                    </div>
                    <span className="font-black text-amber-400">
                      + S/ {extra.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white block">
              Indicaciones especiales para la cocina:
            </label>
            <input
              type="text"
              placeholder="Ej: Pollo bien dorado, mayonesa aparte, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Total por {quantity} und:</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              S/ {totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Agregar al Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
