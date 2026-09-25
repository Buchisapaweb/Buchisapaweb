/**
 * BUCHISAPA ADMIN - PRODUCTS CATALOG MODULE
 * Layer: /admin/js/modules/products.js
 */

(function () {
  'use strict';

  async function fetchProducts() {
    try {
      const data = await window.AdminApi.getProducts();
      window.AdminState.allProducts = (data && data.length > 0) ? data : window.AdminState.defaultSignatureProducts;
    } catch (e) {
      console.warn('Usando catálogo local de contingencia:', e);
      window.AdminState.allProducts = window.AdminState.defaultSignatureProducts;
    }
    applyProductFilters();
    window.updateDashboardMetrics?.();
  }

  function applyProductFilters() {
    let prods = [...(window.AdminState.allProducts || [])];

    // Filtro Categoría
    if (window.AdminState.currentCategory && window.AdminState.currentCategory !== 'todos') {
      prods = prods.filter(p => p.category_id === window.AdminState.currentCategory);
    }

    // Filtro Búsqueda
    if (window.AdminState.searchQuery && window.AdminState.searchQuery.trim() !== '') {
      const q = window.AdminState.searchQuery.toLowerCase().trim();
      prods = prods.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Ordenamiento
    const sort = window.AdminState.currentSort;
    if (sort === 'price-asc') {
      prods.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      prods.sort((a, b) => b.price - a.price);
    } else if (sort === 'stock-desc') {
      prods.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    } else if (sort === 'name-asc') {
      prods.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    window.AdminState.filteredProducts = prods;
    renderProducts();
  }

  function renderProducts() {
    const gridContainer = document.getElementById('products-grid-container');
    const tableBody = document.getElementById('products-table-body');
    const prods = window.AdminState.filteredProducts || [];

    if (gridContainer) {
      if (prods.length === 0) {
        gridContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
            <p style="font-size: 1.1rem; font-weight: 700;">No se encontraron productos</p>
            <p style="font-size: 0.8rem; margin-top: 4px;">Intenta cambiar el término de búsqueda o la categoría seleccionada.</p>
          </div>
        `;
      } else {
        gridContainer.innerHTML = prods.map(prod => {
          const isAvail = prod.available !== false;
          const imgUrl = prod.image || '/imagenes/portada/portada-1.jpg';
          return `
            <div class="product-card ${!isAvail ? 'unavailable' : ''}">
              <div class="product-card-img-wrap">
                <img src="${imgUrl}" alt="${window.AdminUtils.escapeHtml(prod.name)}" class="product-card-img" loading="lazy">
                ${prod.badge ? `<span class="product-badge-pill">${window.AdminUtils.escapeHtml(prod.badge)}</span>` : ''}
              </div>
              <div class="product-card-body">
                <span class="product-card-category">${window.AdminUtils.formatCategoryName(prod.category_id)}</span>
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
      tableBody.innerHTML = prods.map(prod => {
        const isAvail = prod.available !== false;
        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${prod.image || '/imagenes/portada/portada-1.jpg'}" alt="" style="width: 36px; height: 36px; border-radius: var(--radius-sm); object-fit: cover;">
                <span style="font-weight: 700; color: #fff;">${window.AdminUtils.escapeHtml(prod.name)}</span>
              </div>
            </td>
            <td>${window.AdminUtils.formatCategoryName(prod.category_id)}</td>
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

  function openProductModal(isEdit = false, prod = null) {
    const modal = document.getElementById('product-modal');
    const titleEl = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');
    if (!modal || !form) return;

    if (isEdit && prod) {
      if (titleEl) titleEl.textContent = 'Editar Producto';
      document.getElementById('form-product-id').value = prod.id;
      document.getElementById('form-product-name').value = prod.name || '';
      document.getElementById('form-product-category').value = prod.category_id || 'platos-amazonicos';
      document.getElementById('form-product-price').value = prod.price || '';
      document.getElementById('form-product-stock').value = prod.stock ?? 25;
      document.getElementById('form-product-badge').value = prod.badge || '';
      document.getElementById('form-product-description').value = prod.description || '';
      document.getElementById('form-product-image').value = prod.image || '';
      document.getElementById('form-product-available').checked = prod.available !== false;
    } else {
      if (titleEl) titleEl.textContent = 'Nuevo Producto';
      form.reset();
      document.getElementById('form-product-id').value = '';
      document.getElementById('form-product-available').checked = true;
    }

    modal.classList.add('active');
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

    const productData = {
      name: document.getElementById('form-product-name').value.trim(),
      category_id: document.getElementById('form-product-category').value,
      price: parseFloat(document.getElementById('form-product-price').value),
      stock: parseInt(document.getElementById('form-product-stock').value, 10) || 0,
      badge: document.getElementById('form-product-badge').value.trim() || undefined,
      description: document.getElementById('form-product-description').value.trim(),
      image: document.getElementById('form-product-image').value.trim() || '/imagenes/portada/portada-1.jpg',
      available: document.getElementById('form-product-available').checked,
      includes_sauces: true
    };

    try {
      await window.AdminApi.saveProduct(productData, isEdit, id);
      window.showToast(isEdit ? 'Producto actualizado' : 'Producto creado con éxito', 'success');
      document.getElementById('product-modal').classList.remove('active');
      await fetchProducts();
    } catch (err) {
      console.warn('Fallback guardado local:', err);
      if (isEdit) {
        const idx = window.AdminState.allProducts.findIndex(p => p.id === id);
        if (idx !== -1) window.AdminState.allProducts[idx] = { ...window.AdminState.allProducts[idx], ...productData };
      } else {
        window.AdminState.allProducts.unshift({ id: 'prod-' + Date.now(), ...productData });
      }
      applyProductFilters();
      document.getElementById('product-modal').classList.remove('active');
      window.showToast('Guardado en la sesión activa', 'info');
    }
  }

  // Bindings
  window.fetchProducts = fetchProducts;
  window.applyProductFilters = applyProductFilters;
  window.renderProducts = renderProducts;
  window.openProductModal = openProductModal;
  window.editProduct = editProduct;
  window.confirmDeleteProduct = confirmDeleteProduct;
  window.handleProductFormSubmit = handleProductFormSubmit;

})();
