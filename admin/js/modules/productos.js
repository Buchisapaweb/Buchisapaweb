/**
 * BUCHISAPA ADMIN - PRODUCTS CATALOG MODULE
 * Layer: /admin/js/modules/products.js
 */

(function () {
  'use strict';

  async function fetchProducts() {
    const state = window.AdminState = window.AdminState || {};
    const validCats = getAllCategories();
    const validCatKeys = new Set(validCats.flatMap(c => [c.id, c.code, c.slug].filter(Boolean)));
    try {
      const rawData = await window.AdminApi.getProducts();
      const list = Array.isArray(rawData) ? rawData : (rawData && Array.isArray(rawData.data) ? rawData.data : []);
      const activeList = (list && list.length > 0) ? list : (state.defaultSignatureProducts || []);
      state.allProducts = activeList.filter(p => {
        const cat = (p.category_id || '').toLowerCase().trim();
        const code = getCategoryCode(cat);
        return validCatKeys.has(cat) || validCatKeys.has(code);
      });
    } catch (e) {
      console.warn('Usando catálogo local de contingencia:', e);
      state.allProducts = (state.defaultSignatureProducts || []).filter(p => {
        const cat = (p.category_id || '').toLowerCase().trim();
        const code = getCategoryCode(cat);
        return validCatKeys.has(cat) || validCatKeys.has(code);
      });
    }
    applyProductFilters();
    window.updateDashboardMetrics?.();
  }

  function applyProductFilters() {
    const state = window.AdminState = window.AdminState || {};
    let prods = [...(state.allProducts || [])];

    // Filtro Categoría
    if (state.currentCategory && state.currentCategory !== 'todos') {
      const activeCatCode = getCategoryCode(state.currentCategory);
      prods = prods.filter(p => {
        const pCatCode = getCategoryCode(p.category_id);
        return p.category_id === state.currentCategory || pCatCode === activeCatCode;
      });
    }

    // Filtro Búsqueda (incluye código de 6 dígitos de producto y 4 dígitos de categoría)
    if (state.searchQuery && state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      prods = prods.filter((p, idx) => {
        const prodCode = getProductCode(p, idx);
        const catCode = getCategoryCode(p.category_id);
        const catName = window.AdminUtils.formatCategoryName(p.category_id).toLowerCase();
        return (p.name && p.name.toLowerCase().includes(q)) ||
               (p.description && p.description.toLowerCase().includes(q)) ||
               (p.category_id && p.category_id.toLowerCase().includes(q)) ||
               (prodCode && prodCode.includes(q)) ||
               (catCode && catCode.includes(q)) ||
               (catName && catName.includes(q)) ||
               (p.badge && p.badge.toLowerCase().includes(q));
      });
    }

    // Ordenamiento
    const sort = state.currentSort;
    if (sort === 'price-asc') {
      prods.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      prods.sort((a, b) => b.price - a.price);
    } else if (sort === 'stock-desc') {
      prods.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    } else if (sort === 'name-asc') {
      prods.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    state.filteredProducts = prods;
    renderProducts();
  }

  function renderProducts() {
    const gridContainer = document.getElementById('products-grid-container');
    const tableBody = document.getElementById('products-table-body');
    const state = window.AdminState = window.AdminState || {};
    const prods = state.filteredProducts || [];

    if (gridContainer) {
      if (prods.length === 0) {
        gridContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
            <p style="font-size: 1.1rem; font-weight: 700;">No se encontraron productos</p>
            <p style="font-size: 0.8rem; margin-top: 4px;">Intenta cambiar el término de búsqueda o la categoría seleccionada.</p>
          </div>
        `;
      } else {
        gridContainer.innerHTML = prods.map((prod, idx) => {
          const isAvail = prod.available !== false;
          const imgUrl = prod.image || '/imagenes/portada/Portada1E.webp';
          const prodCode = getProductCode(prod, idx);
          const catCode = getCategoryCode(prod.category_id);
          const catName = window.AdminUtils.formatCategoryName(prod.category_id);
          return `
            <div class="product-card ${!isAvail ? 'unavailable' : ''}">
              <div class="product-card-img-wrap">
                <img src="${imgUrl}" alt="${window.AdminUtils.escapeHtml(prod.name)}" class="product-card-img" loading="lazy">
                <span class="product-badge-pill" style="left: 12px; right: auto; background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(0,240,255,0.4); color: #00f0ff; font-weight: 800; letter-spacing: 0.5px;">ID: ${prodCode}</span>
              </div>
              <div class="product-card-body">
                <span class="product-card-category" style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-family: monospace; font-weight: 800; color: #00f0ff; background: rgba(0, 240, 255, 0.1); padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(0, 240, 255, 0.25); font-size: 0.72rem;">[${catCode}]</span>
                  <span>${catName}</span>
                </span>
                <h4 class="product-card-title">${window.AdminUtils.escapeHtml(prod.name)}</h4>
                <p class="product-card-desc">${window.AdminUtils.escapeHtml(prod.description || '')}</p>
                <div class="product-card-footer">
                  <div>
                    <span class="product-price-tag">${window.AdminUtils.formatSoles(prod.price)}</span>
                    <div class="product-stock-tag">Stock: ${prod.stock ?? 25} un.</div>
                  </div>
                  <div class="product-actions">
                    <button class="btn-action-icon" onclick="window.editProduct('${prod.id}')" title="Editar producto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                    <button class="btn-action-icon delete" onclick="window.confirmDeleteProduct('${prod.id}')" title="Eliminar producto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    if (tableBody) {
      tableBody.innerHTML = prods.map((prod, idx) => {
        const isAvail = prod.available !== false;
        const prodCode = getProductCode(prod, idx);
        const catCode = getCategoryCode(prod.category_id);
        const catName = window.AdminUtils.formatCategoryName(prod.category_id);
        return `
          <tr>
            <td>
              <span style="font-family: monospace; font-weight: 800; color: #00f0ff; background: rgba(0, 240, 255, 0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(0, 240, 255, 0.25); font-size: 0.85rem; letter-spacing: 0.5px;">${prodCode}</span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${prod.image || '/imagenes/portada/Portada1E.webp'}" alt="" style="width: 36px; height: 36px; border-radius: var(--radius-sm); object-fit: cover;">
                <span style="font-weight: 700; color: #fff;">${window.AdminUtils.escapeHtml(prod.name)}</span>
              </div>
            </td>
            <td>
              <span style="font-family: monospace; font-weight: 700; color: rgba(255, 255, 255, 0.7); margin-right: 4px;">[${catCode}]</span>
              <span>${catName}</span>
            </td>
            <td style="font-weight: 800; color: var(--accent-orange);">${window.AdminUtils.formatSoles(prod.price)}</td>
            <td>${prod.stock ?? 25} un.</td>
            <td>
              <span class="badge ${isAvail ? 'badge-green' : 'badge-red'}">
                ${isAvail ? 'Activo' : 'Agotado'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="window.editProduct('${prod.id}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="window.confirmDeleteProduct('${prod.id}')">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  function updateProductFormLivePreview() {
    const name = document.getElementById('form-product-name')?.value.trim() || 'Nombre del producto';
    const cat = document.getElementById('form-product-category')?.value || 'platos-amazonicos';
    const price = document.getElementById('form-product-price')?.value || '0.00';
    const desc = document.getElementById('form-product-description')?.value.trim() || 'Descripción e ingredientes del plato...';
    const image = document.getElementById('form-product-image')?.value.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
    const badge = document.getElementById('form-product-badge')?.value.trim();

    const pImg = document.getElementById('product-preview-img');
    const pCat = document.getElementById('product-preview-category');
    const pName = document.getElementById('product-preview-name');
    const pDesc = document.getElementById('product-preview-desc');
    const pPrice = document.getElementById('product-preview-price');
    const pBadge = document.getElementById('product-preview-badge');

    if (pImg) pImg.src = image;
    if (pCat) pCat.textContent = window.AdminUtils?.formatCategoryName?.(cat) || cat;
    if (pName) pName.textContent = name;
    if (pDesc) pDesc.textContent = desc;
    if (pPrice) pPrice.textContent = `S/ ${parseFloat(price || 0).toFixed(2)}`;
    if (pBadge) {
      pBadge.style.display = 'none';
    }
  }

  // Default and Custom Categories Management with 4-Digit Unique Codes
  const DEFAULT_CATEGORIES = [
    { id: 'alitas', code: '1001', slug: 'alitas', name: 'ALITAS' },
    { id: 'bebidas', code: '1002', slug: 'bebidas', name: 'BEBIDAS' },
    { id: 'broaster', code: '1003', slug: 'broaster', name: 'BROASTER' },
    { id: 'hamburguesas', code: '1004', slug: 'hamburguesas', name: 'HAMBURGUESAS' },
    { id: 'infusiones', code: '1005', slug: 'infusiones', name: 'INFUSIONES' },
    { id: 'platos-amazonicos', code: '1006', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS' },
    { id: 'refrescos', code: '1007', slug: 'refrescos', name: 'REFRESCOS' },
    { id: 'salchipapas', code: '1008', slug: 'salchipapas', name: 'SALCHIPAPAS Y SALCHIBROASTERS' }
  ];

  function getCategoryCode(catId) {
    if (!catId) return '1001';
    const key = String(catId).toLowerCase().trim();
    if (/^\d{4}$/.test(key)) return key;
    const found = DEFAULT_CATEGORIES.find(c => c.id === key || c.slug === key || c.code === key);
    if (found) return found.code;
    const custom = getCustomCategories();
    const customFound = custom.find(c => c.id === key || c.code === key || c.slug === key);
    if (customFound) return customFound.code || customFound.id;
    return '1001';
  }

  function getNextCategoryCode() {
    const all = getAllCategories();
    let max = 1008;
    all.forEach(c => {
      const codeNum = parseInt(c.code || c.id, 10);
      if (!isNaN(codeNum) && codeNum > max) {
        max = codeNum;
      }
    });
    return String(max + 1).padStart(4, '0');
  }

  // 6-Digit Unique Product Codes (e.g. 100001)
  function getProductCode(product, index = 0) {
    if (!product) return '100001';
    if (product.code && /^\d{6}$/.test(String(product.code))) {
      return String(product.code);
    }
    if (product.id && /^\d{6}$/.test(String(product.id))) {
      return String(product.id);
    }
    const state = window.AdminState = window.AdminState || {};
    const prods = state.allProducts || [];
    const pos = prods.findIndex(p => p.id === product.id);
    const idx = pos >= 0 ? pos : index;
    return String(100001 + idx).padStart(6, '0');
  }

  function getNextProductCode() {
    const state = window.AdminState = window.AdminState || {};
    const prods = state.allProducts || [];
    let max = 100000;
    prods.forEach((p, idx) => {
      const codeStr = getProductCode(p, idx);
      const num = parseInt(codeStr, 10);
      if (!isNaN(num) && num > max) {
        max = num;
      }
    });
    return String(max + 1).padStart(6, '0');
  }

  function getCustomCategories() {
    try {
      const stored = localStorage.getItem('buchisapa_custom_categories');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function getDeletedCategoryIds() {
    try {
      const stored = localStorage.getItem('buchisapa_deleted_categories');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function getAllCategories() {
    const custom = getCustomCategories();
    const deleted = new Set(getDeletedCategoryIds());
    const combined = [...DEFAULT_CATEGORIES, ...custom];
    return combined.filter(c => !deleted.has(c.id) && !deleted.has(c.code));
  }

  function renderCategoryDropdownOptions() {
    const hiddenInput = document.getElementById('form-product-category');
    const cats = getAllCategories();
    if (cats.length === 0) return;

    // Support both select element (legacy) and hidden input + custom picker
    if (hiddenInput) {
      const currentVal = hiddenInput.value || cats[0].id;
      selectCategoryOption(currentVal);
    }
  }

  function renderCustomCategoryDropdownList() {
    const container = document.getElementById('cat-dropdown-list');
    const countEl = document.getElementById('cat-dropdown-count');
    if (!container) return;

    const allCats = getAllCategories();
    const hiddenInput = document.getElementById('form-product-category');
    const currentVal = hiddenInput ? hiddenInput.value : (allCats[0]?.id || '1001');

    if (countEl) countEl.textContent = `${allCats.length} activas`;

    container.innerHTML = allCats.map(c => {
      const catCode = c.code || c.id;
      const isSelected = currentVal === c.id || currentVal === c.code;
      return `
        <div class="custom-cat-item ${isSelected ? 'selected' : ''}" onclick="window.selectCategoryOption('${c.id}')">
          <div class="cat-item-left">
            <span class="cat-item-badge">ID: ${catCode}</span>
            <span class="cat-item-title">${window.AdminUtils.escapeHtml(c.name)}</span>
          </div>
          ${isSelected ? '<span class="cat-item-check">✓</span>' : ''}
        </div>
      `;
    }).join('');
  }

  function selectCategoryOption(catId) {
    const hiddenInput = document.getElementById('form-product-category');
    if (hiddenInput) {
      hiddenInput.value = catId;
    }

    const allCats = getAllCategories();
    const selectedCat = allCats.find(c => c.id === catId || c.code === catId || c.slug === catId) || allCats[0];

    if (selectedCat) {
      const codeLabel = selectedCat.code || selectedCat.id;
      const badgePreview = document.getElementById('cat-badge-preview');
      const namePreview = document.getElementById('cat-name-preview');

      if (badgePreview) badgePreview.textContent = `ID: ${codeLabel}`;
      if (namePreview) namePreview.textContent = selectedCat.name;
    }

    closeCategoryDropdown();
    updateProductFormLivePreview();
  }

  function toggleCategoryDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('custom-category-dropdown');
    const trigger = document.getElementById('custom-category-trigger');
    if (!dropdown) return;

    const isVisible = dropdown.style.display === 'block';
    if (isVisible) {
      closeCategoryDropdown();
    } else {
      dropdown.style.display = 'block';
      if (trigger) trigger.classList.add('open');
      renderCustomCategoryDropdownList();
    }
  }

  function closeCategoryDropdown() {
    const dropdown = document.getElementById('custom-category-dropdown');
    const trigger = document.getElementById('custom-category-trigger');
    if (dropdown) dropdown.style.display = 'none';
    if (trigger) trigger.classList.remove('open');
  }

  // Close custom dropdown when clicking anywhere outside
  document.addEventListener('click', (e) => {
    const picker = document.getElementById('custom-category-picker');
    if (picker && !picker.contains(e.target)) {
      closeCategoryDropdown();
    }
  });

  function renderCategoryChips() {
    const container = document.querySelector('.category-filter-chips');
    if (!container) return;
    const state = window.AdminState = window.AdminState || {};
    const activeCategory = state.currentCategory || 'todos';
    const cats = getAllCategories();

    let html = `<button class="category-chip ${activeCategory === 'todos' ? 'active' : ''}" data-category="todos">Todos los Platos</button>`;
    cats.forEach(c => {
      const isActive = activeCategory === c.id || activeCategory === c.code;
      const codeLabel = c.code || c.id;
      html += `<button class="category-chip ${isActive ? 'active' : ''}" data-category="${c.id}">${c.name} <span style="opacity: 0.7; font-size: 0.75rem;">(${codeLabel})</span></button>`;
    });
    container.innerHTML = html;

    // Attach click listeners to chips
    container.querySelectorAll('.category-chip').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentCategory = btn.getAttribute('data-category') || 'todos';
        applyProductFilters();
      };
    });
  }

  // GESTOR DE CATEGORÍAS EN NUEVA PÁGINA REDIRECCIONABLE
  function openCategoryManagerView(focusMode = 'add') {
    if (typeof window.switchAdminView === 'function') {
      window.switchAdminView('categorias');
    } else {
      const listSec = document.getElementById('products-list-section');
      const prodFormSec = document.getElementById('product-form-page-section');
      const catMgrSec = document.getElementById('categories-manager-page-section');
      if (listSec) listSec.style.display = 'none';
      if (prodFormSec) prodFormSec.style.display = 'none';
      if (catMgrSec) catMgrSec.style.display = 'block';
    }

    const codeInput = document.getElementById('form-cat-page-code');
    if (codeInput) {
      codeInput.value = getNextCategoryCode();
    }

    renderCategoryListInManager();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (focusMode === 'add') {
      const nameInput = document.getElementById('form-cat-page-name');
      if (nameInput) setTimeout(() => nameInput.focus(), 150);
    }
  }

  function closeCategoryManagerView() {
    if (typeof window.switchAdminView === 'function') {
      window.switchAdminView('productos');
    } else {
      const listSec = document.getElementById('products-list-section');
      const catMgrSec = document.getElementById('categories-manager-page-section');
      if (catMgrSec) catMgrSec.style.display = 'none';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getCategoryIconBadge(c) {
    const name = (c.name || '').toLowerCase();
    const emoji = c.emoji || '';

    let colorClass = 'squircle-cyan';
    let svgContent = '';

    if (name.includes('plat') || name.includes('amazón') || name.includes('selva') || name.includes('vegeta')) {
      colorClass = 'squircle-green';
      svgContent = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
    } else if (name.includes('hamburg') || name.includes('burger')) {
      colorClass = 'squircle-amber';
      svgContent = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/><path d="M4 14h16"/><path d="M4 18h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/></svg>`;
    } else if (name.includes('broaster') || name.includes('alita') || name.includes('pollo')) {
      colorClass = 'squircle-orange';
      svgContent = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
    } else if (name.includes('bebida') || name.includes('gaseosa') || name.includes('jugo') || name.includes('trago') || name.includes('refresco')) {
      colorClass = 'squircle-blue';
      svgContent = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
    } else if (name.includes('salch') || name.includes('papas')) {
      colorClass = 'squircle-pink';
      svgContent = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
      colorClass = 'squircle-purple';
      svgContent = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
    }

    if (emoji && emoji !== '✨' && emoji !== '📁') {
      return `<div class="squircle-icon-badge ${colorClass}"><span class="squircle-emoji">${emoji}</span></div>`;
    }

    return `<div class="squircle-icon-badge ${colorClass}">${svgContent}</div>`;
  }

  function renderCategoryListInManager() {
    const containers = [
      document.getElementById('categories-full-list-container'),
      document.getElementById('categories-list-container')
    ].filter(Boolean);

    if (containers.length === 0) return;

    const allCats = getAllCategories();

    const htmlContent = allCats.length === 0 ? `
      <p style="color: #94a3b8; font-size: 0.85rem; padding: 16px; text-align: center;">No hay categorías activas en el menú.</p>
    ` : allCats.map(c => `
      <div class="category-item-card">
        <div class="cat-card-header">
          <div class="cat-card-badges">
            <span class="cat-card-code-pill">ID: ${c.code || c.id}</span>
            <span class="cat-card-status-pill"><span class="dot"></span> Activa en Carta</span>
          </div>
        </div>
        <div class="cat-card-body">
          <div class="cat-card-left">
            <div class="cat-card-text">
              <h4 class="cat-card-title">${window.AdminUtils.escapeHtml(c.name)}</h4>
            </div>
          </div>
          <div class="cat-card-right">
            <button type="button" class="btn-delete-category-sleek" onclick="window.deleteCategory('${c.id}', this)" title="Eliminar categoría">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    containers.forEach(container => {
      container.innerHTML = htmlContent;
    });
  }

  function deleteCategory(catId, btnEl = null) {
    const all = getAllCategories();
    const target = all.find(c => c.id === catId || c.code === catId);
    const catName = target ? target.name : 'esta categoría';

    // 1. Confirmación de 2 pasos en línea
    if (btnEl && !btnEl.classList.contains('confirming')) {
      btnEl.classList.add('confirming');
      btnEl.style.background = '#dc2626';
      btnEl.style.borderColor = '#ef4444';
      btnEl.style.color = '#ffffff';
      btnEl.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>¿Confirmar Borrar?</span>
      `;
      setTimeout(() => {
        if (btnEl && btnEl.classList.contains('confirming')) {
          btnEl.classList.remove('confirming');
          btnEl.style.background = '';
          btnEl.style.borderColor = '';
          btnEl.style.color = '';
          btnEl.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Eliminar Categoría</span>
          `;
        }
      }, 4000);
      return;
    }

    // 2. Registrar en lista de borradas
    const deleted = getDeletedCategoryIds();
    if (!deleted.includes(catId)) {
      deleted.push(catId);
      try {
        localStorage.setItem('buchisapa_deleted_categories', JSON.stringify(deleted));
      } catch (err) {
        console.warn('Error guardando categorías eliminadas:', err);
      }
    }

    // 3. Remover de categorías personalizadas si existía allí
    let custom = getCustomCategories().filter(c => c.id !== catId && c.code !== catId);
    try {
      localStorage.setItem('buchisapa_custom_categories', JSON.stringify(custom));
    } catch (err) {
      console.warn('Error en custom categories:', err);
    }

    if (window.AdminState) window.AdminState.customCategories = custom;

    // 4. Re-renderizar selects, chips y lista
    renderCategoryDropdownOptions();
    renderCategoryChips();
    renderCategoryListInManager();

    // 5. Notificar al usuario con toast
    window.showToast(`✓ Categoría "${catName}" eliminada con éxito`, 'success');
  }

  function handleCreateCategorySubmit(e) {
    e.preventDefault();
    const pageNameInput = document.getElementById('form-cat-page-name');

    const name = pageNameInput ? pageNameInput.value.trim() : '';
    if (!name) return;

    // Generar código único de 4 dígitos
    const code = getNextCategoryCode();

    const custom = getCustomCategories();
    const newCategory = { id: code, code: code, slug: code, name };
    custom.push(newCategory);
    try {
      localStorage.setItem('buchisapa_custom_categories', JSON.stringify(custom));
    } catch (err) {
      console.warn('Error guardando categoría:', err);
    }

    if (window.AdminState) window.AdminState.customCategories = custom;

    renderCategoryDropdownOptions();
    renderCategoryChips();
    renderCategoryListInManager();

    if (pageNameInput) pageNameInput.value = '';

    // Actualizar input de código para la siguiente categoría
    const codeInput = document.getElementById('form-cat-page-code');
    if (codeInput) codeInput.value = getNextCategoryCode();

    // Seleccionar automáticamente la nueva categoría en el selector del formulario
    const formCatSelect = document.getElementById('form-product-category');
    if (formCatSelect) {
      formCatSelect.value = code;
      updateProductFormLivePreview();
    }

    window.showToast(`✓ Categoría "${name}" (ID: ${code}) creada con éxito`, 'success');
  }

  // WebP Image File Upload Handler
  function handleProductImageFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        const inputUrl = document.getElementById('form-product-image');
        if (inputUrl) {
          inputUrl.value = dataUrl;
          updateProductFormLivePreview();
        }
        window.showToast(`✓ Imagen WebP (${file.name}) cargada en la vista previa`, 'success');
      }
    };
    reader.readAsDataURL(file);
  }

  function openProductModal(isEdit = false, prod = null) {
    const listSec = document.getElementById('products-list-section');
    const formSec = document.getElementById('product-form-page-section');
    const titleEl = document.getElementById('product-form-page-title');
    const form = document.getElementById('product-form');

    renderCategoryDropdownOptions();

    // Ocultar modal flotante por contingencia
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('active');

    if (!formSec || !listSec) return;

    const codeInput = document.getElementById('form-product-code');

    if (isEdit && prod) {
      if (titleEl) titleEl.textContent = 'Editar Producto';
      document.getElementById('form-product-id').value = prod.id;
      if (codeInput) codeInput.value = getProductCode(prod);
      document.getElementById('form-product-name').value = prod.name || '';
      selectCategoryOption(prod.category_id || '1001');
      document.getElementById('form-product-price').value = prod.price || '';
      document.getElementById('form-product-stock').value = prod.stock ?? 25;
      const badgeInput = document.getElementById('form-product-badge');
      if (badgeInput) badgeInput.value = prod.badge || '';
      document.getElementById('form-product-description').value = prod.description || '';
      document.getElementById('form-product-image').value = prod.image || '';
      document.getElementById('form-product-available').checked = prod.available !== false;
    } else {
      if (titleEl) titleEl.textContent = 'Nuevo Producto';
      if (form) form.reset();
      document.getElementById('form-product-id').value = '';
      if (codeInput) codeInput.value = getNextProductCode();
      selectCategoryOption('1001');
      document.getElementById('form-product-available').checked = true;
    }

    updateProductFormLivePreview();
    listSec.style.display = 'none';
    formSec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeProductFormView() {
    const listSec = document.getElementById('products-list-section');
    const formSec = document.getElementById('product-form-page-section');
    if (formSec) formSec.style.display = 'none';
    if (listSec) listSec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function editProduct(id) {
    const prod = (window.AdminState.allProducts || []).find(p => p.id === id);
    if (prod) openProductModal(true, prod);
  }

  function confirmDeleteProduct(id) {
    const prod = (window.AdminState.allProducts || []).find(p => p.id === id);
    const modal = document.getElementById('delete-modal');
    const msg = document.getElementById('delete-modal-msg');
    const btn = document.getElementById('btn-confirm-delete');
    if (!modal || !btn) return;

    if (msg) msg.textContent = `¿Estás seguro de que deseas eliminar permanentemente "${prod?.name || 'este producto'}" del menú?`;
    modal.classList.add('active');

    btn.onclick = async () => {
      try {
        await window.AdminApi.deleteProduct(id);
        window.showToast('Producto eliminado con éxito', 'success');
        modal.classList.remove('active');
        await fetchProducts();
      } catch (e) {
        // Fallback local
        window.AdminState.allProducts = (window.AdminState.allProducts || []).filter(p => p.id !== id);
        applyProductFilters();
        modal.classList.remove('active');
        window.showToast('Producto eliminado localmente', 'info');
      }
    };
  }

  async function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('form-product-id').value;
    const isEdit = Boolean(id);
    const code = document.getElementById('form-product-code')?.value || getNextProductCode();

    const productData = {
      code: code,
      name: document.getElementById('form-product-name').value.trim(),
      category_id: document.getElementById('form-product-category').value,
      price: parseFloat(document.getElementById('form-product-price').value),
      stock: parseInt(document.getElementById('form-product-stock').value, 10) || 0,
      badge: document.getElementById('form-product-badge')?.value.trim() || undefined,
      description: document.getElementById('form-product-description').value.trim(),
      image: document.getElementById('form-product-image').value.trim() || '/imagenes/portada/Portada1E.webp',
      available: document.getElementById('form-product-available').checked,
      includes_sauces: true
    };

    try {
      await window.AdminApi.saveProduct(productData, isEdit, id);
      window.showToast(isEdit ? `✓ Producto (${code}) actualizado` : `✓ Producto (${code}) creado con éxito`, 'success');
      closeProductFormView();
      await fetchProducts();
    } catch (err) {
      console.warn('Fallback guardado local:', err);
      if (isEdit) {
        const idx = window.AdminState.allProducts.findIndex(p => p.id === id);
        if (idx !== -1) window.AdminState.allProducts[idx] = { ...window.AdminState.allProducts[idx], ...productData };
      } else {
        window.AdminState.allProducts.unshift({ id: code, ...productData });
      }
      applyProductFilters();
      closeProductFormView();
      window.showToast(`✓ Producto (${code}) guardado localmente`, 'success');
    }
  }

  // Auto-init category chips on load
  document.addEventListener('DOMContentLoaded', () => {
    renderCategoryChips();
    renderCategoryDropdownOptions();
  });

  // Bindings
  window.fetchProducts = fetchProducts;
  window.applyProductFilters = applyProductFilters;
  window.renderProducts = renderProducts;
  window.openProductModal = openProductModal;
  window.closeProductFormView = closeProductFormView;
  window.updateProductFormLivePreview = updateProductFormLivePreview;
  window.editProduct = editProduct;
  window.confirmDeleteProduct = confirmDeleteProduct;
  window.handleProductFormSubmit = handleProductFormSubmit;
  window.openCategoryManagerView = openCategoryManagerView;
  window.closeCategoryManagerView = closeCategoryManagerView;
  window.renderCategoryListInManager = renderCategoryListInManager;
  window.deleteCategory = deleteCategory;
  window.handleCreateCategorySubmit = handleCreateCategorySubmit;
  window.handleProductImageFileUpload = handleProductImageFileUpload;

  window.toggleCategoryDropdown = toggleCategoryDropdown;
  window.selectCategoryOption = selectCategoryOption;
  window.closeCategoryDropdown = closeCategoryDropdown;
  window.renderCustomCategoryDropdownList = renderCustomCategoryDropdownList;
})();

