/**
 * RESTAURANTE BUCHISAPA - LÓGICA DE CATEGORÍAS (categorias.js)
 * Controlador de selección de categorías, renders del catálogo por categoría
 * y sincronización con URL query ?cat=
 */

(function () {
  'use strict';

  // Exponer globalmente la función de abrir vista de categoría
  window.openCategoryView = function (catId, catTitle) {
    const bannersSection = document.getElementById('category-banners-section');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const searchSection = document.getElementById('search-results-section');
    const searchTitle = document.getElementById('search-view-title');
    const searchSubtitle = document.getElementById('search-view-subtitle');
    const searchList = document.getElementById('search-view-list');

    if (!searchSection || !searchList) return;

    if (bannersSection) bannersSection.style.display = 'none';
    if (titleWrap) titleWrap.style.display = 'none';

    searchSection.classList.remove('is-hidden');
    searchSection.style.display = 'block';

    const normalizedCat = (catId || '').toLowerCase().trim();
    if (searchTitle) searchTitle.textContent = catTitle || normalizedCat.toUpperCase();
    if (searchSubtitle) searchSubtitle.textContent = `Explora los platos disponibles en la categoría ${catTitle || normalizedCat.toUpperCase()}`;

    // Actualizar URL sin recargar
    try {
      const newUrl = `${window.location.pathname}?cat=${encodeURIComponent(normalizedCat)}`;
      window.history.pushState({ category: normalizedCat }, '', newUrl);
    } catch (e) {}

    // Renderizar platos de la categoría
    renderCategoryProducts(normalizedCat);

    // Scroll suave hacia la sección
    searchSection.scrollIntoView({ behavior: 'smooth' });
  };

  window.exitSearchMode = function () {
    const bannersSection = document.getElementById('category-banners-section');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const searchSection = document.getElementById('search-results-section');

    if (searchSection) {
      searchSection.classList.add('is-hidden');
      searchSection.style.display = 'none';
    }
    if (bannersSection) bannersSection.style.display = 'grid';
    if (titleWrap) titleWrap.style.display = 'block';

    try {
      window.history.pushState({}, '', window.location.pathname);
    } catch (e) {}
  };

  async function renderCategoryProducts(catId) {
    const searchList = document.getElementById('search-view-list');
    const countBadge = document.getElementById('search-view-count');
    if (!searchList) return;

    searchList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-weight: 700;">Cargando platos de la categoría...</div>';

    let products = [];
    let categories = [];
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      if (productsRes.ok) {
        const json = await productsRes.json();
        products = json.data || [];
      }
      if (categoriesRes.ok) {
        const json = await categoriesRes.json();
        categories = json.data || [];
      }
    } catch (e) {
      products = [];
      categories = [];
    }

    // Si la API no responde, se usa el catálogo JSON oficial como respaldo.
    if (!products.length) {
      try {
        const res = await fetch('/datos/productos.json');
        if (res.ok) products = await res.json();
      } catch (e) {}
    }
    if (!categories.length) {
      try {
        const res = await fetch('/datos/categorias.json');
        if (res.ok) categories = await res.json();
      } catch (e) {}
    }

    const crearSlug = (texto) => String(texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const categoria = categories.find(c => {
      const slug = crearSlug(c.slug || c.name);
      const id = String(c.id || '').toLowerCase();
      return slug === catId || id === catId;
    });
    const categoriaId = String(categoria?.id || categoria?.code || '').toLowerCase();

    // Filtrar por categoría usando el ID oficial o el slug.
    let filtered = products;
    if (catId && catId !== 'todas' && catId !== 'all') {
      filtered = products.filter(p => {
        const pCatId = String(p.category_id || '').toLowerCase();
        const pCatSlug = String(p.categoria_slug || p.slug || '').toLowerCase();
        const pCatName = String(p.category || '').toLowerCase();
        return (categoriaId && pCatId === categoriaId) || pCatSlug === catId || pCatName === String(categoria?.name || '').toLowerCase();
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
          <div style="position: relative; width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #f1f5f9;">
            <img src="${item.image || item.image_url || '/imagenes/categorias/broaster/banner.webp'}" onerror="this.onerror=null;this.src='/imagenes/categorias/${crearSlug(item.category || 'broaster')}/banner.webp'" alt="${item.name}" class="dish-card-img" loading="lazy">
            ${item.badge ? `<span style="position: absolute; top: 10px; left: 10px; background: #dc2626; color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">${item.badge}</span>` : ''}
          </div>
          <div class="dish-card-content">
            <span class="dish-card-cat-label">${item.categoryBadge || item.category || 'BuchiSapa'}</span>
            <h3 class="dish-card-title">${item.name}</h3>
            <p class="dish-card-desc">${item.description || ''}</p>
            <div class="dish-card-footer">
              <span class="dish-card-price">S/ ${Number(item.price || 0).toFixed(2)}</span>
              <button type="button" class="dish-card-add-btn" onclick="event.preventDefault(); window.location.href='/producto?id=${encodeURIComponent(item.id || item.code)}'">
                <span>Ver Plato</span>
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

    // Auto abrir si viene query ?cat= en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const catQuery = urlParams.get('cat');
    if (catQuery) {
      openCategoryView(catQuery, catQuery.toUpperCase());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCategoryListeners);
  } else {
    setupCategoryListeners();
  }
})();
