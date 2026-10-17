import React, { useState, useMemo } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryNav } from '../components/CategoryNav';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { useCart } from '../context/CartContext';
import { Category, Product, Cream, Accompaniment, CoverBanner } from '../types';
import { Sparkles, Utensils, Star, Flame } from 'lucide-react';

interface HomePageProps {
  categories: Category[];
  products: Product[];
  creams: Cream[];
  accompaniments: Accompaniment[];
  covers: CoverBanner[];
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  products,
  creams,
  accompaniments,
  covers,
}) => {
  const { addItem } = useCart();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.active !== false);
  }, [categories]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (prod.available === false) return false;

      const matchesCategory =
        selectedCategoryId === 'all' || prod.category_id === selectedCategoryId;

      const matchesSearch =
        searchQuery.trim() === '' ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Group filtered products by category if 'all' is selected
  const productsByCategory = useMemo(() => {
    if (selectedCategoryId !== 'all' || searchQuery.trim() !== '') {
      return null;
    }

    const grouped: { category: Category; items: Product[] }[] = [];
    activeCategories.forEach((cat) => {
      const items = products.filter(
        (p) => p.category_id === cat.id && p.available !== false
      );
      if (items.length > 0) {
        grouped.push({ category: cat, items });
      }
    });
    return grouped;
  }, [activeCategories, products, selectedCategoryId, searchQuery]);

  const handleQuickAdd = (product: Product) => {
    // Default 1 qty without extra customizations
    addItem(product, 1);
  };

  const handleCustomAdd = (
    product: Product,
    quantity: number,
    accompaniment?: string,
    sauces?: string[],
    notes?: string
  ) => {
    addItem(product, quantity, accompaniment, sauces, notes);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* Hero Carousel */}
      <HeroCarousel
        banners={covers.filter((c) => c.active)}
        onActionClick={() => {
          const el = document.getElementById('carta-menu');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Highlights Strip */}
      <section className="bg-[#111827] border-b border-gray-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-gray-300">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Papas Nativas & Crujientes</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Receta Original con Ají Charapita</span>
          </div>
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-red-500" />
            <span>Cremas Caseras Ilimitadas</span>
          </div>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <div id="carta-menu">
        <CategoryNav
          categories={activeCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Catalog View */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* If grouped by category */}
        {productsByCategory ? (
          <div className="space-y-12">
            {productsByCategory.map(({ category, items }) => (
              <section key={category.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-8 bg-red-600 rounded-full" />
                    <div>
                      <h2 className="font-['Playfair_Display'] font-black text-xl sm:text-2xl text-white">
                        {category.name}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {items.length} {items.length === 1 ? 'platillo' : 'platillos'} disponibles
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline"
                  >
                    Ver solo esta categoría →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {items.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      categoryName={category.name}
                      onOpenCustomizer={(p) => setCustomizingProduct(p)}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Single list filtered view */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="font-['Playfair_Display'] font-black text-2xl text-white">
                  {selectedCategoryId === 'all'
                    ? 'Resultados de búsqueda'
                    : categories.find((c) => c.id === selectedCategoryId)?.name || 'Platos'}
                </h2>
                <p className="text-xs text-gray-400">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'platillo encontrado' : 'platillos encontrados'}
                </p>
              </div>

              {selectedCategoryId !== 'all' && (
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  ← Ver todas las categorías
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-[#111827] rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-800 text-gray-500 mx-auto flex items-center justify-center text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-white">No encontramos platillos</h3>
                <p className="text-xs text-gray-400">
                  No hay productos que coincidan con "{searchQuery}". Intenta con otro término o explora las categorías.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId('all');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold transition-colors"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    categoryName={categories.find((c) => c.id === prod.category_id)?.name}
                    onOpenCustomizer={(p) => setCustomizingProduct(p)}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Customizer Modal */}
      <ProductModal
        product={customizingProduct}
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
        onAddToCart={handleCustomAdd}
        availableCreams={creams}
        availableAccompaniments={accompaniments}
      />
    </div>
  );
};
