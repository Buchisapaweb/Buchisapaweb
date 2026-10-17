import React, { useState, useEffect, useCallback } from 'react';
import { CoverBanner } from '../types';

interface HeroCarouselProps {
  banners: CoverBanner[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [nextSlide, banners.length]);

  if (!banners.length) return null;

  return (
    <section className="w-full bg-white px-3 sm:px-6 pt-3 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-gray-100">
          {/* Banner Images */}
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <picture className="w-full h-full">
                <source media="(max-width: 640px)" srcSet={banner.mobileImage} type="image/webp" />
                <img
                  src={banner.desktopImage}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </picture>
            </div>
          ))}

          {/* Indicator Pills at bottom (matching screenshot: elongated white active pill + dots) */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/35 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`transition-all rounded-full ${
                    idx === currentIdx
                      ? 'w-7 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Ir a portada ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
