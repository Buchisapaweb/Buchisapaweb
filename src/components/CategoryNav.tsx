import React from 'react';
import { Category } from '../types';
import { Search } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="sticky top-[105px] z-30 bg-[#111827]/95 backdrop-blur-md border-b border-gray-800 py-3 shadow-md">
      <div className="max-w-7xl mx-auto px-4 space-y-3">
        {/* Search & Active Category Counter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar alitas, hamburguesa, broaster, chaufa amazónico..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Selecciona una categoría o desplázate para explorar toda la carta</span>
          </div>
        </div>

        {/* Category Pill Buttons (Horizontal Scrolling) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          <button
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${
              selectedCategoryId === 'all'
                ? 'bg-amber-500 text-gray-950 shadow-amber-500/30 font-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            🔥 Todos los Platos
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40 font-bold'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
