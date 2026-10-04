import React, { useState, useEffect } from 'react';
import { initialHeroBanners } from '../data/initialData';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % initialHeroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = initialHeroBanners[currentIndex];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-orange-950/20 border border-slate-800/80 bg-slate-900 group">
      <div className="h-44 sm:h-52 md:h-60 relative w-full overflow-hidden">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-[#070A13]/60 to-transparent" />
        
        {/* Banner Content */}
        <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-md shadow-orange-600/30">
              <Sparkles className="w-3 h-3" />
              {banner.tag}
            </span>

            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
              {initialHeroBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-5 bg-orange-500' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
              {banner.title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 max-w-xl drop-shadow-sm">
              {banner.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
