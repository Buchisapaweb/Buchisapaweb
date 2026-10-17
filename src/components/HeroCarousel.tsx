import React, { useState, useEffect, useCallback } from 'react';
import { CoverBanner } from '../types';
import { ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';

interface HeroCarouselProps {
  banners: CoverBanner[];
  onActionClick: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners, onActionClick }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, banners.length]);

  if (!banners.length) return null;

  const currentBanner = banners[currentIdx];

  return (
    <section className="relative w-full bg-[#0b0f19] overflow-hidden border-b border-gray-800">
      {/* Banner Slide */}
      <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex items-center">
        {/* Background Responsive Image */}
        <picture className="absolute inset-0 w-full h-full">
          <source media="(max-width: 640px)" srcSet={currentBanner.mobileImage} type="image/webp" />
          <img
            src={currentBanner.desktopImage}
            alt={currentBanner.title}
            className="w-full h-full object-cover object-center brightness-[0.45] transition-opacity duration-700"
          />
        </picture>

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent pointer-events-none" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 z-10 w-full">
          <div className="max-w-2xl space-y-4">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 bg-red-600/30 border border-red-500/50 text-red-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>SABOR AMAZÓNICO & POLLO A LA BRASA</span>
            </div>

            {/* Title */}
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-md">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
              {currentBanner.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onActionClick}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold px-6 py-3 rounded-full shadow-lg shadow-red-600/40 active:scale-95 transition-all flex items-center gap-2 text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{currentBanner.linkText || 'Ver Carta & Pedir'}</span>
              </button>

              <div className="text-xs text-gray-300 bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-700 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>Abierto ahora: 6:00 PM a 5:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-gray-700 transition-all focus:outline-none"
              aria-label="Portada anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-gray-700 transition-all focus:outline-none"
              aria-label="Siguiente portada"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicator Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`transition-all rounded-full ${
                  idx === currentIdx ? 'w-8 h-2 bg-amber-400' : 'w-2 h-2 bg-gray-500/60 hover:bg-gray-400'
                }`}
                aria-label={`Ir a la diapositiva ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
