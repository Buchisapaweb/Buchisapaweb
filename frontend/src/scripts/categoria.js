/**
 * RESTAURANTE BUCHISAPA - LÓGICA DE CATEGORÍAS (categoria.js)
 * Controlador de selección de categorías, renders del catálogo por categoría
 * y sincronización con URL query ?cat=
 */

(function () {
  'use strict';

  // Exponer globalmente la función de abrir vista de categoría con nombre único para evitar conflictos
  window.dbOpenCategoryView = function (catId, catTitle) {
    const bannersSection = document.getElementById('category-banners-section');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const searchSection = document.getElementById('search-results-section');
    const searchTitle = document.getElementById('search-view-title');
    const searchSubtitle = document.getElementById('search-view-subtitle');
    const searchList = document.getElementById('search-view-list');
    const carousel = document.querySelector('.hero-carousel-container');

    if (!searchSection || !searchList) return;

    if (bannersSection) bannersSection.style.display = 'none';
    if (titleWrap) titleWrap.style.display = 'none';
    if (carousel) carousel.style.display = 'none';

    searchSection.classList.remove('is-hidden');
    searchSection.style.display = 'block';

    const normalizedCat = (catId || '').toLowerCase().trim();
    if (searchTitle) searchTitle.textContent = catTitle || normalizedCat.toUpperCase();
    if (searchSubtitle) searchSubtitle.textContent = `Explora los platos disponibles en la categoría ${catTitle || normalizedCat.toUpperCase()}`;

    // Actualizar URL sin recargar
    try {
      const newUrl = `${window.location.pathname}?cat=${encodeURIComponent(normalizedCat)}`;
      window.history.pushState({ categoria: normalizedCat }, '', newUrl);
    } catch (e) {}

    // Renderizar platos de la categoría
    renderCategoryProducts(normalizedCat);

    // Scroll suave hacia la sección
    searchSection.scrollIntoView({ behavior: 'smooth' });
  };

  // Mantener compatibilidad con llamadas tradicionales sin pisar el delegador principal de encabezado.js
  if (!window.openCategoryView) {
    window.openCategoryView = window.dbOpenCategoryView;
  }


  window.exitSearchMode = function () {
    const bannersSection = document.getElementById('category-banners-section');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const searchSection = document.getElementById('search-results-section');
    const carousel = document.querySelector('.hero-carousel-container');

    if (searchSection) {
      searchSection.classList.add('is-hidden');
      searchSection.style.display = 'none';
    }
    if (bannersSection) bannersSection.style.display = 'grid';
    if (titleWrap) titleWrap.style.display = 'block';
    if (carousel) carousel.style.display = 'block';

    try {
      window.history.pushState({}, '', window.location.pathname);
    } catch (e) {}
  };

  // Función utilitaria para normalizar texto (sin tildes, minúsculas, limpio)
  function normalizeSearchText(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Diccionario de equivalencias y raíces gastronómicas comunes
  const SEARCH_SYNONYMS = {
    'ala': ['alita', 'alitas'],
    'alas': ['alita', 'alitas'],
    'alita': ['alitas'],
    'burger': ['hamburguesa', 'hamburguesas'],
    'hambur': ['hamburguesa', 'hamburguesas'],
    'salchi': ['salchipapa', 'salchipapas', 'salchibroaster'],
    'broas': ['broaster'],
    'papas': ['papa'],
    'platano': ['platano', 'bellaco', 'patacones', 'tacacho'],
    'selva': ['amazonico', 'amazonicos', 'tacacho', 'cecina', 'juane']
  };

  window.handleSearchInput = async function (query) {
    const rawQuery = String(query || '').trim();
    if (!rawQuery) {
      exitSearchMode();
      return;
    }

    const bannersSection = document.getElementById('category-banners-section');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const searchSection = document.getElementById('search-results-section');
    const searchTitle = document.getElementById('search-view-title');
    const searchSubtitle = document.getElementById('search-view-subtitle');
    const searchList = document.getElementById('search-view-list');
    const carousel = document.querySelector('.hero-carousel-container');

    // Si no estamos en la página principal, redirigir con ?q=
    if (!searchSection || !searchList) {
      window.location.href = `/?q=${encodeURIComponent(rawQuery)}`;
      return;
    }

    if (bannersSection) bannersSection.style.display = 'none';
    if (titleWrap) titleWrap.style.display = 'none';
    if (carousel) carousel.style.display = 'none';

    searchSection.classList.remove('is-hidden');
    searchSection.style.display = 'block';

    if (searchTitle) searchTitle.textContent = 'Resultados de Búsqueda';
    if (searchSubtitle) searchSubtitle.textContent = `Mostrando resultados para "${rawQuery}"`;

    let products = [];
    if (window.currentProducts && Array.isArray(window.currentProducts) && window.currentProducts.length > 0) {
      products = window.currentProducts;
    } else {
      searchList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-weight: 700;">Cargando platos...</div>';
      try {
        const res = await fetch('/api/productos');
        if (res.ok) {
          const json = await res.json();
          products = json.datos || [];
          window.currentProducts = products;
        }
      } catch (e) {
        products = [];
      }
    }

    // Normalizar la consulta del usuario
    const normalizedQuery = normalizeSearchText(rawQuery);
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    // Filtrar productos EXCLUSIVAMENTE por el nombre del producto (sin descripción ni otras propiedades)
    const filtered = products.filter(p => {
      const normName = normalizeSearchText(p.nombre);
      if (!normName) return false;

      // 1. Coincidencia directa de la frase en el nombre del producto
      if (normName.includes(normalizedQuery)) return true;

      // 2. Coincidencia token por token en el nombre del producto
      return tokens.every(tok => {
        if (normName.includes(tok)) return true;

        // Comprobar sinónimos / variantes gastronómicas si aplican al nombre del producto
        const syns = SEARCH_SYNONYMS[tok];
        if (syns && syns.some(s => normName.includes(s))) {
          return true;
        }

        return false;
      });
    });

    const countBadge = document.getElementById('search-view-count');
    if (countBadge) countBadge.textContent = `${filtered.length} plato${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      searchList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9;">
          <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
          <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">No se encontraron resultados para "${rawQuery}"</h3>
          <p style="font-size: 13.5px; color: #64748b; margin-bottom: 16px;">Prueba buscando por alitas, broaster, hamburguesa, tacacho o bebidas.</p>
          <button type="button" class="btn-volver" onclick="exitSearchMode()">Ver Todas las Categorías</button>
        </div>
      `;
      return;
    }

    renderFilteredList(filtered);
  };

  function renderFilteredList(filtered) {
    const searchList = document.getElementById('search-view-list');
    if (!searchList) return;
    searchList.innerHTML = '';
    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'buchisapa-dish-card';
      card.innerHTML = `
        <a href="/producto?id=${encodeURIComponent(item.id || item.code)}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
          <div style="position: relative; width: 100%; aspect-ratio: 1/1; overflow: hidden; background: #f1f5f9; border-radius: 16px 16px 0 0;">
            <img src="${item.imagen || '/imagenes/categorias/broaster/banner.webp'}" alt="${item.nombre}" class="dish-card-img" loading="lazy">
            ${item.etiqueta ? `<span style="position: absolute; top: 10px; left: 10px; background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">${item.etiqueta}</span>` : ''}
          </div>
          <div class="dish-card-content">
            <span class="dish-card-cat-label">${item.categoriaBadge || item.categoria || 'BuchiSapa'}</span>
            <h3 class="dish-card-title">${item.nombre}</h3>
            <div class="dish-card-footer">
              <span class="dish-card-price">S/ ${Number(item.precio || 0).toFixed(2)}</span>
              <button type="button" class="dish-card-add-btn" onclick="event.preventDefault(); window.location.href='/producto?id=${encodeURIComponent(item.id || item.code)}'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span style="vertical-align: middle;">Agregar</span>
              </button>
            </div>
          </div>
        </a>
      `;
      searchList.appendChild(card);
    });
  }

  async function renderCategoryProducts(catId) {
    const searchList = document.getElementById('search-view-list');
    const countBadge = document.getElementById('search-view-count');
    if (!searchList) return;

    searchList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-weight: 700;">Cargando platos de la categoría...</div>';

    // 1. Cargar productos desde memoria del cliente para velocidad instantánea si ya existen
    let products = [];
    if (window.currentProducts && Array.isArray(window.currentProducts) && window.currentProducts.length > 0) {
      products = window.currentProducts;
    } else {
      try {
        const res = await fetch('/api/productos');
        if (res.ok) {
          const json = await res.json();
          products = json.datos || [];
          window.currentProducts = products; // Guardar en caché global del cliente
        } else {
          console.warn("API general de productos devolvió estado no-ok:", res.status);
        }
      } catch (e) {
        console.error("Error al cargar productos desde la API general:", e);
      }
    }

    // 2. Si falló la carga general de productos, intentar ruta específica de la categoría como fallback secundario
    if ((!products || products.length === 0) && catId) {
      try {
        console.log(`Intentando fallback API específico para categoría: ${catId}`);
        const res = await fetch(`/api/productos?category=${encodeURIComponent(catId)}`);
        if (res.ok) {
          const json = await res.json();
          products = json.datos || [];
        }
      } catch (err) {
        console.error("Error en fallback API de categoría específica:", err);
      }
    }

    // Filtrar por categoría utilizando mapeo de ID exacto para evitar conflictos con tildes y guiones
    const slugToIdMap = {
      'adicionales': 'C0001',
      'alitas': 'C0002',
      'bebidas': 'C0003',
      'broaster': 'C0004',
      'hamburguesas': 'C0005',
      'infusiones': 'C0006',
      'platos-amazonicos': 'C0007',
      'promociones': 'C0008',
      'refrescos': 'C0009',
      'salchipapas': 'C0010',
      'salchipapas-y-salchibroasters': 'C0010'
    };

    let filtered = products;
    if (catId && catId !== 'todas' && catId !== 'all') {
      const catIdNorm = String(catId || '').toLowerCase().trim();
      const targetCatId = slugToIdMap[catIdNorm] || catIdNorm.toUpperCase();
      
      // Lógica de filtrado dual robusta: compara contra el category_id y también contra el nombre de la categoría (case-insensitive)
      filtered = products.filter(p => {
        const pCatId = String(p.id_categoria || '').toUpperCase().trim();
        const pCatName = String(p.categoria || '').toLowerCase().trim();
        return pCatId === targetCatId || pCatName === catIdNorm;
      });
    }

    if (countBadge) countBadge.textContent = `${filtered.length} platos disponibles`;

    if (filtered.length === 0) {
      searchList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9;">
          <div style="font-size: 40px; margin-bottom: 10px;">🍽️</div>
          <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">No hay platos registrados en esta categoría</h3>
          <p style="font-size: 13.5px; color: #64748b; margin-bottom: 16px;">Revisa las demás categorías de nuestra carta oficial BuchiSapa.</p>
          <button type="button" class="btn-volver" onclick="exitSearchMode()">Ver Todas las Categorías</button>
        </div>
      `;
      return;
    }

    searchList.innerHTML = '';

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'buchisapa-dish-card';
      card.innerHTML = `
        <a href="/producto?id=${encodeURIComponent(item.id || item.code)}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
          <div style="position: relative; width: 100%; aspect-ratio: 1/1; overflow: hidden; background: #f1f5f9; border-radius: 16px 16px 0 0;">
            <img src="${item.imagen || '/imagenes/categorias/broaster/banner.webp'}" alt="${item.nombre}" class="dish-card-img" loading="lazy">
            ${item.etiqueta ? `<span style="position: absolute; top: 10px; left: 10px; background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">${item.etiqueta}</span>` : ''}
          </div>
          <div class="dish-card-content">
            <span class="dish-card-cat-label">${item.categoriaBadge || item.categoria || 'BuchiSapa'}</span>
            <h3 class="dish-card-title">${item.nombre}</h3>
            <div class="dish-card-footer">
              <span class="dish-card-price">S/ ${Number(item.precio || 0).toFixed(2)}</span>
              <button type="button" class="dish-card-add-btn" onclick="event.preventDefault(); window.location.href='/producto?id=${encodeURIComponent(item.id || item.code)}'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span style="vertical-align: middle;">Agregar</span>
              </button>
            </div>
          </div>
        </a>
      `;
      searchList.appendChild(card);
    });
  }

  function setupCategoryListeners() {
    // Escuchar clics en banners
    const banners = document.querySelectorAll('.category-banner-card');
    banners.forEach(b => {
      b.addEventListener('click', () => {
        const catId = b.getAttribute('data-category');
        const catTitle = b.getAttribute('data-title') || catId.toUpperCase();
        openCategoryView(catId, catTitle);
      });
    });

    // Botón salir
    const exitBtn = document.getElementById('btn-exit-search');
    if (exitBtn) {
      exitBtn.addEventListener('click', exitSearchMode);
    }

    // Auto abrir si viene query ?cat= o ?q= en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const catQuery = urlParams.get('cat');
    if (catQuery) {
      openCategoryView(catQuery, catQuery.toUpperCase());
    }

    const searchQuery = urlParams.get('q');
    if (searchQuery) {
      const desktopInput = document.getElementById('desktop-search-input');
      const mobileInput = document.getElementById('main-search-input');
      if (desktopInput) desktopInput.value = searchQuery;
      if (mobileInput) mobileInput.value = searchQuery;
      handleSearchInput(searchQuery);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCategoryListeners);
  } else {
    setupCategoryListeners();
  }
})();
