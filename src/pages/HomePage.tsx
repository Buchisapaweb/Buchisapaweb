import React from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryBar } from '../components/CategoryBar';
import { ProductCard } from '../components/ProductCard';
import { Search, Clock, MapPin, X } from 'lucide-react';

interface HomePageProps {
  onNavigateToCart: () => void;
  onNavigateToClaims: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToCart, onNavigateToClaims }) => {
  const {
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    businessConfig
  } = useBuchisapa();

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === 'all' ||
      product.categorySlug.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Live Status Header */}
      <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <p className="text-xs font-black uppercase text-emerald-400 tracking-wider">
              Local Abierto • Preparando en Vivo
            </p>
            <p className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{businessConfig.openingHours}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
          <span className="flex items-center gap-1 truncate max-w-xs">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="truncate">Santa Clara, Ate - Lima</span>
          </span>
        </div>
      </div>

      {/* Hero Carousel */}
      <HeroBanner />

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar hamburguesas, tacacho, alitas, broasters..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#0F1424] border border-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500 shadow-sm transition-colors"
          data-testid="search_input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories */}
      <CategoryBar />

      {/* Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
          {selectedCategory === 'all' ? 'Toda la Carta' : selectedCategory.toUpperCase()}
        </h2>
        <span className="text-xs font-bold text-slate-400">
          {filteredProducts.length} platos disponibles
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-[#0F1424] border border-slate-800 rounded-2xl p-6">
          <p className="text-sm font-bold text-slate-300">
            No se encontraron platos con tu búsqueda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl"
          >
            Ver toda la carta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
