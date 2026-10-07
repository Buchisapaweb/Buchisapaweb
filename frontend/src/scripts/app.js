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
      precio: 22.00,
      oldPrice: 25.00,
      categoria: 'broaster',
      imagen: '/imagenes/portada/Portada1M.webp',
      etiqueta: 'MÁS VENDIDO',
      descripcion: 'Jugoso cuarto de pollo sazonado con especias secretas al carbón, acompañado de crocantes papas fritas y ensalada fresca.'
    },
    {
      id: 'p2',
      title: '1/2 Pollo a la Brasa Familiar',
      precio: 42.00,
      oldPrice: 48.00,
      categoria: 'broaster',
      imagen: '/imagenes/portada/Portada2M.webp',
      etiqueta: 'PROMO',
      descripcion: 'Medio pollo dorado a la perfección con porción familiar de papas fritas y cremas artesanales.'
    },
    {
      id: 'p3',
      title: '1 Pollo a la Brasa Entero + Inca Kola 1.5L',
      precio: 78.00,
      oldPrice: 88.00,
      categoria: 'broaster',
      imagen: '/imagenes/portada/Portada1E.webp',
      etiqueta: 'COMBO FAMILIAR',
      descripcion: 'Un pollo entero jugoso al carbón, papas familiares, ensalada grande y bebida Inca Kola de 1.5 Litros.'
    },
    {
      id: 'p4',
      title: 'Hamburguesa Buchisapa Especial Doble Carne',
      precio: 18.50,
      oldPrice: 22.00,
      categoria: 'hamburguesas',
      imagen: '/imagenes/portada/Portada2E.webp',
      etiqueta: 'RECOMENDADO',
      descripcion: 'Doble carne artesanal de 150g, queso cheddar fundido, tocino crocante, huevo frito y papas al hilo.'
    },
    {
      id: 'p5',
      title: 'Juane Amazónico Tradicional con Cecina',
      precio: 24.00,
      oldPrice: 28.00,
      categoria: 'amazonicos',
      imagen: '/imagenes/portada/Portada1M.webp',
      etiqueta: 'SABOR AMAZÓNICO',
      descripcion: 'Juane de arroz sazonado con palillo y hierbas de la selva, acompañado de jugosa cecina ahumada y tacacho.'
    },
    {
      id: 'p6',
      title: 'Alitas BBQ Crocantes (8 piezas)',
      precio: 26.00,
      oldPrice: 30.00,
      categoria: 'alitas',
      imagen: '/imagenes/portada/Portada2M.webp',
      etiqueta: 'NUEVO',
      descripcion: '8 jugosas alitas empanizadas bañadas en salsa BBQ dulce y ahumada, servidas con papas doradas.'
    },
    {
      id: 'p7',
      title: 'Chicha Morada Artesanal (1 Litro)',
      precio: 12.00,
      oldPrice: 14.00,
      categoria: 'bebidas',
      imagen: '/imagenes/portada/Portada1E.webp',
      etiqueta: 'REFRESCANTE',
      descripcion: 'Chicha morada natural preparada con maíz morado, piña, membrillo, manzana y gotas de limón.'
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

    gridEl.innerHTML = products.map(prod => `
      <article class="category-banner-card product-card-item" onclick="openProductDetailModal('${prod.id}')">
        <div class="product-card-img-wrap">
          <img src="${prod.imagen}" alt="${prod.title}" class="category-banner-img" loading="lazy">
          ${prod.etiqueta ? `<span class="category-banner-tag">${prod.etiqueta}</span>` : ''}
        </div>
        <div class="category-banner-overlay">
          <h3 class="category-banner-title" style="font-size: 16px; margin-bottom: 4px;">${prod.title}</h3>
          <p style="font-size: 12.5px; color: #64748b; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${prod.descripcion || ''}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
            <span style="font-size: 18px; font-weight: 900; color: #dc2626;">S/ ${Number(prod.precio).toFixed(2)}</span>
            <button type="button" class="promo-btn-agregar" onclick="event.stopPropagation(); quickAddToCart('${prod.id}')">
              + Agregar
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Filtrar por categoría
  window._appOpenCategoryView = function (catId, catTitle) {
    currentCategory = catId || 'all';
    const all = getAllProducts();
    const filtered = currentCategory === 'all' 
      ? all 
      : all.filter(p => {
          const pCatName = String(p.categoria || '').toLowerCase().trim();
          const pCatId = String(p.id_categoria || p.categoriaId || '').toLowerCase().trim();
          const target = String(currentCategory).toLowerCase().trim();
          
          // Mapeos de slug de categoría a ID exacto
          const slugToIdMap = {
            'adicionales': 'c0001',
            'alitas': 'c0002',
            'bebidas': 'c0003',
            'broaster': 'c0004',
            'hamburguesas': 'c0005',
            'infusiones': 'c0006',
            'platos-amazonicos': 'c0007',
            'promociones': 'c0008',
            'refrescos': 'c0009',
            'salchipapas': 'c0010',
            'salchipapas-y-salchibroasters': 'c0010'
          };
          
          const mappedTargetId = slugToIdMap[target];
          return pCatName === target || 
                 pCatId === target || 
                 (mappedTargetId && pCatId === mappedTargetId);
        });

    const titleEl = document.getElementById('category-selected-title');
    if (titleEl) {
      titleEl.textContent = catTitle || (currentCategory === 'all' ? 'CARTA COMPLETA' : currentCategory.toUpperCase());
    }

    renderProductsGrid(filtered);

    const sectionEl = document.getElementById('products-grid-container') || document.getElementById('category-banners-section');
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Agregar rápido al carrito
  window.quickAddToCart = function (idProducto) {
    const all = getAllProducts();
    const prod = all.find(p => p.id === idProducto);
    if (prod && window.BuchisapaCart) {
      window.BuchisapaCart.addItem({
        id: prod.id,
        title: prod.title || prod.nombre,
        precio: prod.precio,
        imagen: prod.imagen,
        qty: 1
      });
      window.BuchisapaCart.openDrawer();
    }
  };

  // Abrir detalle de producto modal / página
  window.openProductDetailModal = function (idProducto) {
    window.location.href = `/producto?id=${idProducto}`;
  };

  // Función asíncrona para cargar productos de la base de datos
  async function loadDatabaseProducts() {
    try {
      const res = await fetch('/api/productos');
      if (res.ok) {
        const json = await res.json();
        const apiProducts = json.datos || [];
        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          // Mapear campos de la base de datos para compatibilidad con la UI de app.js
          const mappedProducts = apiProducts.map(p => ({
            ...p,
            id: p.id || p.code,
            title: p.nombre,
            precio: Number(p.precio || 0),
            imagen: p.imagen || '/imagenes/categorias/broaster/banner.webp',
            etiqueta: p.etiqueta || (p.popular ? '🔥 POPULAR' : ''),
            descripcion: p.descripcion || ''
          }));
          
          allMenuProducts = mappedProducts;
          currentProducts = mappedProducts;
          window.currentProducts = mappedProducts; // Sincronizar cache global
          
          // Re-renderizar con los productos de la BD
          const urlParams = new URLSearchParams(window.location.search);
          const catQuery = urlParams.get('cat');
          if (catQuery) {
            window._appOpenCategoryView(catQuery, catQuery.toUpperCase());
          } else {
            renderProductsGrid(mappedProducts);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Fallo cargando productos desde la BD de Supabase, usando catálogo local estático como respaldo:', e);
    }
    
    // Fallback por defecto si la API falla
    allMenuProducts = OFFICIAL_CATALOG;
    currentProducts = OFFICIAL_CATALOG;
    window.currentProducts = OFFICIAL_CATALOG;
    renderProductsGrid(OFFICIAL_CATALOG);
  }

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    // Seteo rápido con catálogo estático para render instantáneo
    allMenuProducts = OFFICIAL_CATALOG;
    currentProducts = OFFICIAL_CATALOG;
    window.currentProducts = OFFICIAL_CATALOG;

    // Inicializar carrito
    if (window.BuchisapaCart && typeof window.BuchisapaCart.init === 'function') {
      window.BuchisapaCart.init();
    }

    // Renderizar catálogo inicial estático inmediatamente
    renderProductsGrid(OFFICIAL_CATALOG);
    
    // Cargar asíncronamente los 57 productos reales de la base de datos
    loadDatabaseProducts();
  });

})();
