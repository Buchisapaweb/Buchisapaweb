import React, { useState, useMemo } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { useCart } from '../context/CartContext';
import { Category, Product, Cream, Accompaniment, CoverBanner } from '../types';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { STORE_INFO } from '../data/initialData';

interface HomePageProps {
  categories: Category[];
  products: Product[];
  creams: Cream[];
  accompaniments: Accompaniment[];
  covers: CoverBanner[];
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  products,
  creams,
  accompaniments,
  covers,
  searchQuery = '',
  onClearSearch,
}) => {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.active !== false);
  }, [categories]);

  // If there is an active search, filter products across all categories
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.available !== false &&
        (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Products belonging to the selected category
  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter(
      (p) => p.category_id === selectedCategory.id && p.available !== false
    );
  }, [products, selectedCategory]);

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    const target = document.getElementById('seccion-categoria');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (product: Product) => {
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
    <div className="min-h-screen bg-white text-gray-900 pb-12">
      {/* 1. FOTO DE PORTADA (CARRUSEL) */}
      <HeroCarousel banners={covers.filter((c) => c.active)} />

      {/* 2. EXPLORA POR CATEGORÍAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="seccion-categoria">
        {/* Search Results Mode */}
        {searchQuery.trim() !== '' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 block">
                  BÚSQUEDA EN CARTA
                </span>
                <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-black text-gray-900">
                  Resultados para "{searchQuery}"
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {searchedProducts.length} {searchedProducts.length === 1 ? 'platillo encontrado' : 'platillos encontrados'}
                </p>
              </div>
              <button
                onClick={onClearSearch}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                ← Ver todas las categorías
              </button>
            </div>

            {searchedProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-3xl p-8 max-w-md mx-auto space-y-3">
                <span className="text-3xl">🔍</span>
                <h3 className="font-bold text-base text-gray-900">No encontramos resultados</h3>
                <p className="text-xs text-gray-500">
                  Intenta buscar con otra palabra clave como "pollo", "alitas", "hamburguesa" o "chicha".
                </p>
                <button
                  onClick={onClearSearch}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-sm"
                >
                  Volver a Categorías
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {searchedProducts.map((prod) => (
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
        ) : selectedCategory ? (
          /* Viewing Specific Category Dishes */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors shrink-0"
                  aria-label="Volver a categorías"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-orange-600 block">
                    CATEGORÍA SELECCIONADA
                  </span>
                  <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-black text-gray-900">
                    {selectedCategory.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {categoryProducts.length} {categoryProducts.length === 1 ? 'platillo disponible' : 'platillos disponibles'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-red-600 hover:underline self-start sm:self-auto"
              >
                ← Cambiar de categoría
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {categoryProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  categoryName={selectedCategory.name}
                  onOpenCustomizer={(p) => setCustomizingProduct(p)}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Main Root View: Header -> Portada -> Categorías (Imágenes de las Categorías) */
          <div className="space-y-8">
            {/* Section Header (matching screenshot) */}
            <div className="text-center space-y-1.5 max-w-2xl mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-[#ea580c] block">
                NUESTRA CARTA
              </span>
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Explora por Categorías
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed px-4">
                Selecciona una categoría para ver los platos, combos y promociones disponibles.
              </p>
            </div>

            {/* Category Images Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {activeCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 bg-white transform hover:-translate-y-1"
                >
                  {/* Category Banner Image */}
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-white">
                    <img
                      src={category.banner_url || '/imagenes/logo/logo-buchisapa.webp'}
                      alt={category.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Category Title Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-['Playfair_Display'] font-black text-base sm:text-lg tracking-wide uppercase drop-shadow-md group-hover:text-amber-300 transition-colors">
                        {category.name}
                      </h3>
                      <span className="text-[11px] text-gray-300 font-semibold block mt-0.5">
                        {products.filter((p) => p.category_id === category.id).length} platos disponibles →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. BOTÓN FLOTANTE OFICIAL DE WHATSAPP (matching screenshot) */}
      <a
        href={STORE_INFO.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all focus:outline-none"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-8 h-8 fill-white text-[#25D366]" />
      </a>

      {/* Product Customizer Modal */}
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
