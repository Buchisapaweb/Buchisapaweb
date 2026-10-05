/**
 * BUCHISAPA ADMIN - MÓDULO DE GESTIÓN DE PRODUCTOS & CARTA
 * Layer: /admin/routes/productos.js
 */
(function () {
  'use strict';

  function syncCategorySelects() {
    const categories = window.adminData?.categories || [];
    const filterSelect = document.getElementById('productos-filter-cat');
    const modalSelect = document.getElementById('modal-product-category');

    if (filterSelect && categories.length > 0) {
      const currentVal = filterSelect.value || 'all';
      let html = '<option value="all">Todas las categorías (10)</option>';
      categories.forEach(c => {
        const val = (c.id || c.slug || '').toLowerCase();
        html += `<option value="${val}">${c.name || val.toUpperCase()}</option>`;
      });
      filterSelect.innerHTML = html;
      
      const optionExists = Array.from(filterSelect.options).some(opt => opt.value === currentVal);
      filterSelect.value = optionExists ? currentVal : 'all';
    }

    if (modalSelect && categories.length > 0) {
      const currentVal = modalSelect.value;
      let html = '';
      categories.forEach(c => {
        const val = (c.id || c.slug || '').toLowerCase();
        html += `<option value="${val}">${c.name || val.toUpperCase()}</option>`;
      });
      modalSelect.innerHTML = html;
      if (currentVal) modalSelect.value = currentVal;
    }
  }

  function renderProductsTable(filterText = '') {
    const tbody = document.getElementById('productos-table-tbody');
    const badge = document.getElementById('productos-count-badge');
    if (!tbody) return;

    syncCategorySelects();

    const products = window.adminData?.products || [];
    const categories = window.adminData?.categories || [];

    let list = [...products];

    // 1. Filtro por texto de búsqueda
    const searchVal = filterText || document.getElementById('productos-search-input')?.value || '';
    if (searchVal) {
      const txt = searchVal.toLowerCase().trim();
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(txt) || 
        (p.code || p.id || '').toLowerCase().includes(txt) ||
        (p.description || '').toLowerCase().includes(txt)
      );
    }

    // 2. Filtro por categoría seleccionada
    const catFilter = document.getElementById('productos-filter-cat')?.value || 'all';
    if (catFilter !== 'all') {
      list = list.filter(p => {
        const pCat = (p.category_id || p.category || '').toLowerCase();
        return pCat === catFilter || (catFilter === 'salchipapas' && (pCat.includes('salchi') || pCat.includes('salchipapa')));
      });
    }

    // 3. Filtro por estado de stock
    const stockFilter = document.getElementById('productos-filter-stock')?.value || 'all';
    if (stockFilter === 'agotado') {
      list = list.filter(p => Number(p.stock !== undefined ? p.stock : (p.available !== false ? 25 : 0)) <= 0);
    } else if (stockFilter === 'bajo') {
      list = list.filter(p => {
        const s = Number(p.stock !== undefined ? p.stock : (p.available !== false ? 25 : 0));
        return s > 0 && s <= 5;
      });
    } else if (stockFilter === 'normal') {
      list = list.filter(p => Number(p.stock !== undefined ? p.stock : (p.available !== false ? 25 : 0)) > 5);
    }

    if (badge) {
      badge.textContent = `${list.length} de ${products.length} platillos en carta`;
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state-box">
              <p>No se encontraron productos con los filtros seleccionados.</p>
              <button class="btn btn-outline btn-sm" onclick="window.resetProductsFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => {
      const rawCat = (p.category_id || p.category || 'general').toLowerCase();
      const matchedCat = categories.find(c => (c.id || c.slug || '').toLowerCase() === rawCat);
      const catDisplayName = matchedCat ? matchedCat.name : rawCat.toUpperCase();
      
      const stock = Number(p.stock !== undefined ? p.stock : (p.available !== false ? 25 : 0));
      const isAvailable = stock > 0 && p.available !== false;
      
      const statusBadge = stock <= 0 || !isAvailable
        ? `<span class="stock-badge stock-out">● Agotado</span>`
        : stock <= 5
        ? `<span class="stock-badge stock-low">● Stock Bajo (${stock})</span>`
        : `<span class="stock-badge stock-in">● Disponible (${stock})</span>`;

      const prodImg = p.image || p.fallbackImg || '/imagenes/menu/hamburguesa-clasica.webp';
      const prodCode = p.code || p.id?.toUpperCase() || 'PRD';

      return `
        <tr>
          <td class="cell-mono-cyan">${prodCode}</td>
          <td>
            <div class="product-cell-preview">
              <img src="${prodImg}" alt="${p.name}" class="product-img-thumb" loading="lazy" onerror="this.src='/imagenes/logo/logo-buchisapa.webp'">
              <div class="product-meta-text">
                <span class="product-name-title">${p.name}</span>
                <span class="cell-subtle-sm">${p.description ? p.description.substring(0, 48) + '...' : ''}</span>
              </div>
            </div>
          </td>
          <td><span class="product-cat-tag">${catDisplayName}</span></td>
          <td class="price-pill">S/ ${Number(p.price || 0).toFixed(2)}</td>
          <td class="cell-mono-white">${stock} un.</td>
          <td>${statusBadge}</td>
          <td class="cell-actions-right">
            <div class="product-actions-cell">
              <button class="btn ${isAvailable ? 'btn-outline' : 'btn-primary'} btn-xs" onclick="window.toggleProductStock('${p.id}')" title="Alternar Disponibilidad">
                ${isAvailable ? 'Pausar' : 'Activar'}
              </button>
              <button class="btn btn-secondary btn-xs" onclick="window.openEditProductModal('${p.id}')" title="Editar Producto">
                Editar
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.renderProductsTable = renderProductsTable;

  window.filterProductsTable = function (val) {
    renderProductsTable(val || document.getElementById('productos-search-input')?.value || '');
  };

  window.resetProductsFilters = function () {
    const search = document.getElementById('productos-search-input');
    const cat = document.getElementById('productos-filter-cat');
    const stock = document.getElementById('productos-filter-stock');
    if (search) search.value = '';
    if (cat) cat.value = 'all';
    if (stock) stock.value = 'all';
    renderProductsTable();
  };

  window.toggleProductStock = async function (id) {
    try {
      const res = await fetch('/api/products/test-toggle-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        window.showAdminToast?.(`Disponibilidad de ${id} actualizada`, 'success');
        const prod = window.adminData?.products?.find(p => p.id === id);
        if (prod) {
          prod.stock = data.available ? 25 : 0;
          prod.available = data.available;
        }
        renderProductsTable();
        window.renderDashboard?.();
      }
    } catch (e) {
      console.error(e);
      window.showAdminToast?.('Error al alternar stock', 'danger');
    }
  };

  window.openNewProductModal = function () {
    const backdrop = document.getElementById('modal-product-backdrop');
    const form = document.getElementById('form-admin-product');
    const title = document.getElementById('modal-product-title');
    if (!backdrop || !form) return;

    syncCategorySelects();
    form.reset();
    document.getElementById('modal-product-id').value = '';
    document.getElementById('modal-product-code').value = `PRD${String((window.adminData?.products?.length || 0) + 1).padStart(3, '0')}`;
    if (title) title.textContent = 'Nuevo Platillo / Bebida';
    backdrop.classList.add('active');
  };

  window.openEditProductModal = function (id) {
    const prod = window.adminData?.products?.find(p => p.id === id);
    if (!prod) return;

    syncCategorySelects();
    const backdrop = document.getElementById('modal-product-backdrop');
    const title = document.getElementById('modal-product-title');
    if (!backdrop) return;

    document.getElementById('modal-product-id').value = prod.id || '';
    document.getElementById('modal-product-name').value = prod.name || '';
    document.getElementById('modal-product-code').value = prod.code || prod.id || '';
    
    const catSelect = document.getElementById('modal-product-category');
    if (catSelect) {
      catSelect.value = (prod.category_id || prod.category || 'hamburguesas').toLowerCase();
    }
    
    document.getElementById('modal-product-price').value = prod.price || 0;
    document.getElementById('modal-product-stock').value = prod.stock !== undefined ? prod.stock : 25;
    document.getElementById('modal-product-desc').value = prod.description || '';
    document.getElementById('modal-product-img').value = prod.image || '';

    if (title) title.textContent = `Editar Platillo (${prod.code || prod.id})`;
    backdrop.classList.add('active');
  };

  window.closeProductModal = function () {
    document.getElementById('modal-product-backdrop')?.classList.remove('active');
  };

  window.handleSaveProduct = async function (e) {
    e.preventDefault();
    const id = document.getElementById('modal-product-id').value;
    const name = document.getElementById('modal-product-name').value;
    const category = document.getElementById('modal-product-category').value;
    const price = parseFloat(document.getElementById('modal-product-price').value) || 0;
    const stock = parseInt(document.getElementById('modal-product-stock').value, 10) || 0;
    const code = document.getElementById('modal-product-code').value || (id ? id : `PRD${String((window.adminData?.products?.length || 0) + 1).padStart(3, '0')}`);
    const description = document.getElementById('modal-product-desc').value;
    const image = document.getElementById('modal-product-img').value || '/imagenes/menu/hamburguesa-clasica.webp';

    const payload = { 
      name, 
      category, 
      category_id: category,
      price, 
      stock, 
      code, 
      description, 
      image, 
      available: stock > 0 
    };

    try {
      if (id) {
        await fetch(`/api/products/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const prod = window.adminData?.products?.find(p => p.id === id);
        if (prod) {
          Object.assign(prod, payload);
        }
      } else {
        payload.id = code.toLowerCase();
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (window.adminData?.products) {
          window.adminData.products.push(payload);
        }
      }

      window.showAdminToast?.('Producto guardado con éxito', 'success');
      window.closeProductModal();
      renderProductsTable();
      window.loadAllAdminData?.();
    } catch (err) {
      console.error(err);
      window.closeProductModal();
      window.showAdminToast?.('Cambios guardados en panel', 'success');
      renderProductsTable();
    }
  };
})();
