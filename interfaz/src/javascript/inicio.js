/**
 * RESTAURANTE BUCHISAPA - LÓGICA PRINCIPAL Y CATÁLOGO DE PRODUCTOS (app.js)
 * Carga de catálogo oficial, filtros por categoría, búsqueda y coordinación general.
 */

(function () {
  'use strict';

  let currentProducts = [];
  let allMenuProducts = [];
  let currentCategory = 'all';

  // Catálogo Base Oficial BuchiSapa
  const OFFICIAL_CATALOG = [
    {
      id: 'p1',
      title: '1/4 Pollo a la Brasa + Papas + Ensalada',
      price: 22.00,
      oldPrice: 25.00,
      category: 'broaster',
      image: '/imagenes/portada/Portada1M.webp',
      badge: 'MÁS VENDIDO',
      description: 'Jugoso cuarto de pollo sazonado con especias secretas al carbón, acompañado de crocantes papas fritas y ensalada fresca.'
    },
    {
      id: 'p2',
      title: '1/2 Pollo a la Brasa Familiar',
      price: 42.00,
      oldPrice: 48.00,
      category: 'broaster',
      image: '/imagenes/portada/Portada2M.webp',
      badge: 'PROMO',
      description: 'Medio pollo dorado a la perfección con porción familiar de papas fritas y cremas artesanales.'
    },
    {
      id: 'p3',
      title: '1 Pollo a la Brasa Entero + Inca Kola 1.5L',
      price: 78.00,
      oldPrice: 88.00,
      category: 'broaster',
      image: '/imagenes/portada/Portada1E.webp',
      badge: 'COMBO FAMILIAR',
      description: 'Un pollo entero jugoso al carbón, papas familiares, ensalada grande y bebida Inca Kola de 1.5 Litros.'
    },
    {
      id: 'p4',
      title: 'Hamburguesa Buchisapa Especial Doble Carne',
      price: 18.50,
      oldPrice: 22.00,
      category: 'hamburguesas',
      image: '/imagenes/portada/Portada2E.webp',
      badge: 'RECOMENDADO',
      description: 'Doble carne artesanal de 150g, queso cheddar fundido, tocino crocante, huevo frito y papas al hilo.'
    },
    {
      id: 'p5',
      title: 'Juane Amazónico Tradicional con Cecina',
      price: 24.00,
      oldPrice: 28.00,
      category: 'amazonicos',
      image: '/imagenes/portada/Portada1M.webp',
      badge: 'SABOR AMAZÓNICO',
      description: 'Juane de arroz sazonado con palillo y hierbas de la selva, acompañado de jugosa cecina ahumada y tacacho.'
    },
    {
      id: 'p6',
      title: 'Alitas BBQ Crocantes (8 piezas)',
      price: 26.00,
      oldPrice: 30.00,
      category: 'alitas',
      image: '/imagenes/portada/Portada2M.webp',
      badge: 'NUEVO',
      description: '8 jugosas alitas empanizadas bañadas en salsa BBQ dulce y ahumada, servidas con papas doradas.'
    },
    {
      id: 'p7',
      title: 'Chicha Morada Artesanal (1 Litro)',
      price: 12.00,
      oldPrice: 14.00,
      category: 'bebidas',
      image: '/imagenes/portada/Portada1E.webp',
      badge: 'REFRESCANTE',
      description: 'Chicha morada natural preparada con maíz morado, piña, membrillo, manzana y gotas de limón.'
    }
  ];

  function getAllProducts() {
    return allMenuProducts.length > 0 ? allMenuProducts : OFFICIAL_CATALOG;
  }

  // Renderizar catálogo de productos en la grilla principal
  function renderProductsGrid(products) {
    const gridEl = document.getElementById('products-grid-container') || document.getElementById('buchisapa-cards-list');
    if (!gridEl) return;

    if (!products || products.length === 0) {
      gridEl.innerHTML = `
        <div class="cart-empty-state" style="grid-column: 1 / -1; padding: 40px 16px;">
          <h3 class="cart-empty-title">No se encontraron productos</h3>
          <p class="cart-empty-desc">Intenta buscando con otro término o selecciona una categoría diferente.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = products.map(prod => {
      const id = prod.id || prod.code || prod.codigo || '';
      const name = prod.name || prod.title || prod.nombre || 'Producto BuchiSapa';
      const category = prod.category_name || prod.category || prod.categoryBadge || 'BuchiSapa';
      const image = prod.image_url || prod.image || '';
      return `
        <article class="product-grid-card" onclick="openProductDetailModal('${id}')">
          <div class="product-grid-card-image">
            <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.removeAttribute('src');this.style.display='none';this.parentElement.classList.add('image-unavailable')">
            ${prod.badge ? `<span class="product-grid-card-badge">${prod.badge}</span>` : ''}
          </div>
          <div class="product-grid-card-content">
            <span class="product-grid-card-category">${category}</span>
            <h3 class="product-grid-card-title">${name}</h3>
            <div class="product-grid-card-footer">
              <span class="product-grid-card-price">S/ ${Number(prod.price || 0).toFixed(2)}</span>
              <button type="button" class="producto-btn-agregar" onclick="event.stopPropagation(); openProductDetailModal('${id}')">Ver producto</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Filtrar por categoría
  window._appOpenCategoryView = function (catId, catTitle) {
    currentCategory = catId || 'all';
    const normalized = String(currentCategory).toLowerCase().trim();
    const hero = document.querySelector('.hero-carousel-container');
    const banners = document.getElementById('category-banners-section');
    const mainTitle = document.getElementById('main-section-title-wrap');
    const searchSection = document.getElementById('search-results-section');

    // La portada/carrusel pertenece exclusivamente a la página inicial sin categoría seleccionada.
    if (normalized !== 'all' && normalized !== 'todas') {
      if (hero) hero.style.display = 'none';
      if (banners) banners.style.display = 'none';
      if (mainTitle) mainTitle.style.display = 'none';
      if (searchSection) {
        searchSection.classList.remove('is-hidden');
        searchSection.style.display = 'block';
      }
      if (typeof window.openCategoryView === 'function') {
        window.openCategoryView(normalized, catTitle);
        return;
      }
    }

    const all = getAllProducts();
    const filtered = normalized === 'all' || normalized === 'todas'
      ? all
      : all.filter(p => {
          const productCategory = String(p.category || p.category_slug || p.categoria_slug || '').toLowerCase().trim();
          const productCategoryId = String(p.category_id || '').toLowerCase().trim();
          return productCategory === normalized || productCategoryId === normalized;
        });

    const titleEl = document.getElementById('category-selected-title');
    if (titleEl) titleEl.textContent = catTitle || (normalized === 'all' ? 'CARTA COMPLETA' : normalized.toUpperCase());

    renderProductsGrid(filtered);

    const sectionEl = document.getElementById('products-grid-container') || document.getElementById('category-banners-section');
    if (sectionEl) sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Agregar rápido al carrito
  window.quickAddToCart = function (productId) {
    const all = getAllProducts();
    const prod = all.find(p => p.id === productId);
    if (prod && window.BuchisapaCart) {
      window.BuchisapaCart.addItem({
        id: prod.id,
        title: prod.title,
        price: prod.price,
        image: prod.image,
        qty: 1
      });
      window.BuchisapaCart.openDrawer();
    }
  };

  // Abrir detalle de producto modal / página
  window.openProductDetailModal = function (productId) {
    window.location.href = `/producto?id=${productId}`;
  };

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    allMenuProducts = OFFICIAL_CATALOG;
    currentProducts = OFFICIAL_CATALOG;

    // Inicializar carrito
    if (window.BuchisapaCart && typeof window.BuchisapaCart.init === 'function') {
      window.BuchisapaCart.init();
    }

    // Renderizar catálogo inicial
    renderProductsGrid(OFFICIAL_CATALOG);
  });

})();
