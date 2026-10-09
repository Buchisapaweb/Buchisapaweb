import React from 'react';
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Flame, Clock, Award } from 'lucide-react';
import { Product } from '../types';

interface HeroCarouselProps {
  promotions: Product[];
  onSelectProduct: (product: Product) => void;
  onExploreMenu: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  promotions,
  onSelectProduct,
  onExploreMenu
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Auto slide every 6 seconds
  React.useEffect(() => {
    if (promotions.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  if (promotions.length === 0) return null;

  const currentPromo = promotions[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text and Promo Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                Mega Promoción Destacada
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-800/80 text-stone-300 border border-stone-700">
                <Award className="w-3 h-3 text-amber-400" />
                Receta de la Selva & Broaster Crujiente
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {currentPromo.name}
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed line-clamp-3">
              {currentPromo.description || 'Disfruta la auténtica sazón de BuchiSapa: el mejor pollo broaster crujiente y la magia de los sabores amazónicos directo a tu mesa en Santa Clara, Ate.'}
            </p>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-xs uppercase font-extrabold text-stone-400 tracking-wider">Precio Especial:</span>
              <span className="text-3xl sm:text-4xl font-black text-amber-400">
                S/ {currentPromo.price.toFixed(2)}
              </span>
              <span className="text-xs text-stone-400 line-through">
                S/ {(currentPromo.price * 1.25).toFixed(2)}
              </span>
              <span className="text-[11px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                Ahorras 25%
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => onSelectProduct(currentPromo)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-95 text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Pedir esta Promoción
              </button>

              <button
                onClick={onExploreMenu}
                className="flex items-center gap-2 bg-stone-800/90 hover:bg-stone-700 text-stone-200 font-bold px-5 py-3.5 rounded-xl border border-stone-700 transition"
              >
                <Flame className="w-4 h-4 text-amber-500" />
                Ver Toda la Carta
              </button>
            </div>

            {/* Quick guarantees */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-stone-800/80 text-xs text-stone-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Atendemos hasta las 5:00 AM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Sale caliente al momento</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cremas & Ají amazónico gratis</span>
              </div>
            </div>
          </div>

          {/* Promo Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-stone-800 bg-stone-900 shadow-2xl group">
              <img
                src={currentPromo.image}
                alt={currentPromo.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                    BuchiSapa Especial
                  </span>
                  <span className="text-lg font-black">{currentPromo.name}</span>
                </div>
                <div className="bg-amber-500 text-stone-950 font-black px-3 py-1.5 rounded-xl shadow-lg text-lg">
                  S/ {currentPromo.price.toFixed(2)}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                aria-label="Promoción anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-950/70 text-stone-200 hover:text-white hover:bg-stone-900 transition border border-stone-700/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Promoción siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-950/70 text-stone-200 hover:text-white hover:bg-stone-900 transition border border-stone-700/50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Carousel Indicators / Dots */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'w-8 bg-amber-500' 
                      : 'w-2 bg-stone-700 hover:bg-stone-500'
                  }`}
                  aria-label={`Ir a promoción ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
