import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Coffee, 
  GlassWater, 
  CupSoda, 
  Beef, 
  Utensils, 
  Plus,
  Drumstick
} from 'lucide-react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  productCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts
}) => {
  const getCategoryIcon = (iconName: string, slug: string) => {
    switch (iconName.toLowerCase()) {
      case 'drumstick':
        return <Drumstick className="w-4 h-4" />;
      case 'beef':
        return <Beef className="w-4 h-4" />;
      case 'flame':
        return <Flame className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'glasswater':
        return <GlassWater className="w-4 h-4" />;
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      case 'cupsoda':
        return <CupSoda className="w-4 h-4" />;
      case 'plus':
        return <Plus className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  const totalAllProducts = Object.values(productCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="sticky top-[69px] z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 py-3 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {/* 'Todos' Button */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Todos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedCategory === 'all' ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-400'
            }`}>
              {totalAllProducts}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = productCounts[cat.slug] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                <span className={isSelected ? 'text-stone-950' : 'text-amber-500'}>
                  {getCategoryIcon(cat.icon, cat.slug)}
                </span>
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
