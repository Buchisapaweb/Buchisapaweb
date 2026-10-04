import React from 'react';
import { useBuchisapa } from '../context/BuchisapaContext';
import { Utensils } from 'lucide-react';

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useBuchisapa();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
      {/* "Todos" button */}
      <button
        onClick={() => setSelectedCategory('all')}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 ${
          selectedCategory === 'all'
            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30 scale-[1.02]'
            : 'bg-[#0F1424] text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
        }`}
        data-testid="category_tab_all"
      >
        <Utensils className="w-3.5 h-3.5" />
        <span>Todos</span>
      </button>

      {/* Category Pills */}
      {categories.map(cat => {
        const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30 scale-[1.02]'
                : 'bg-[#0F1424] text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
            }`}
            data-testid={`category_tab_${cat.slug}`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
