/**
 * BUCHISAPA BURGER & BROASTER - PANEL ADMINISTRATIVO
 * Módulo de Control de Productos y Categorías (/frontend/src/admin/routes/productos.js)
 * Permite listar, filtrar por categoría, buscar, crear, editar, alternar disponibilidad y eliminar productos.
 */

(function () {
  'use strict';

  // Almacén local de productos y categorías en el admin
  let allProducts = [];
  let allCategories = [];

  // Mapeo amigable de IDs a nombres de categoría por defecto
  const CATEGORY_NAMES_MAP = {
    'C0001': 'ADICIONALES',
    'C0002': 'ALITAS',
    'C0003': 'BEBIDAS',
    'C0004': 'BROASTER',
    'C0005': 'HAMBURGUESAS',
    'C0006': 'INFUSIONES',
    'C0007': 'PLATOS AMAZÓNICOS',
    'C0008': 'PROMOCIONES',
    'C0009': 'REFRESCOS',
    'C0010': 'SALCHIPAPAS Y SALCHIBROASTERS'
  };

  function initProductsModule() {
    // 1. Botón "+ Nuevo Producto"
    const btnNewProduct = document.getElementById('btn-open-new-product');
    if (btnNewProduct) {
      btnNewProduct.addEventListener('click', (e) => {
        e.preventDefault();
        window.openNewProductModal();
      });
    }

    // 2. Botón Recargar
    const btnRefresh = document.getElementById('btn-refresh-products');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', (e) => {
        e.preventDefault();
        window.loadProductsList();
      });
    }

    // 3. Formulario Guardar Producto
    const formProduct = document.getElementById('form-admin-product');
    if (formProduct) {
      formProduct.addEventListener('submit', handleProductFormSubmit);
    }

    // 4. Filtros interactivos
    const searchInput = document.getElementById('admin-product-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        window.filterAndRenderProducts();
      });
    }

    const catFilter = document.getElementById('admin-product-category-filter');
    if (catFilter) {
      catFilter.addEventListener('change', () => {
        window.filterAndRenderProducts();
      });
    }

    const statusFilter = document.getElementById('admin-product-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        window.filterAndRenderProducts();
      });
    }

    // Carga inicial
    window.loadProductsList();
  }

  // Cargar lista completa de productos desde la API
  window.loadProductsList = async function () {
    const tbody = document.getElementById('products-page-tbody');
    if (tbody && (!allProducts || allProducts.length === 0)) {
      tbody.innerHTML = `<tr><td colspan="7" class="table-empty-cell">Cargando menú oficial de BuchiSapa...</td></tr>`;
    }

    try {
      // Cargar categorías primero para tener los nombres listos
      await loadCategoriesList();

      const res = await fetch('/api/productos');
      if (res.ok) {
        const json = await res.json();
        allProducts = Array.isArray(json) ? json : (json && Array.isArray(json.datos) ? json.datos : []);
        
        if (window.BuchiSapaAdmin) {
          window.BuchiSapaAdmin.products = allProducts;
        }

        // Actualizar métricas del dashboard si los elementos existen
        const kpiProducts = document.getElementById('kpi-val-productos');
        if (kpiProducts) kpiProducts.textContent = allProducts.length;

        window.filterAndRenderProducts();
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-empty-cell" style="color:#ef4444;">Error al cargar productos. <button onclick="window.loadProductsList()" class="btn btn-xs btn-secondary" style="margin-left:8px;">Reintentar</button></td></tr>`;
      }
    }
  };

  // Cargar categorías y poblar los selectores del panel
  async function loadCategoriesList() {
    try {
      const res = await fetch('/api/categorias');
      if (res.ok) {
        const json = await res.json();
        allCategories = Array.isArray(json) ? json : (json && Array.isArray(json.datos) ? json.datos : []);
        if (window.BuchiSapaAdmin) {
          window.BuchiSapaAdmin.categories = allCategories;
        }
      }
    } catch (e) {
      console.warn('Uso de categorías en memoria:', e);
    }

    populateCategoryDropdowns();
  }

  function populateCategoryDropdowns() {
    // 1. Selector de filtro en la tabla
    const filterSelect = document.getElementById('admin-product-category-filter');
    if (filterSelect) {
      const currentVal = filterSelect.value || 'all';
      filterSelect.innerHTML = `<option value="all">Todas las Categorías (${allProducts.length || '...'})</option>`;
      
      const catsToUse = allCategories.length > 0 ? allCategories : Object.keys(CATEGORY_NAMES_MAP).map(k => ({ id: k, nombre: CATEGORY_NAMES_MAP[k], slug: CATEGORY_NAMES_MAP[k].toLowerCase() }));
      
      catsToUse.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id || c.codigo || c.slug;
        opt.textContent = c.nombre;
        filterSelect.appendChild(opt);
      });
      filterSelect.value = currentVal;
    }

    // 2. Selector en el modal de creación/edición
    const modalSelect = document.getElementById('modal-product-category');
    if (modalSelect && allCategories.length > 0) {
      const currentModalVal = modalSelect.value;
      modalSelect.innerHTML = '';
      allCategories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id || c.codigo || c.slug;
        opt.setAttribute('data-name', c.nombre);
        opt.textContent = c.nombre;
        modalSelect.appendChild(opt);
      });
      if (currentModalVal) modalSelect.value = currentModalVal;
    }
  }

  // Filtrado y renderizado dinámico de la tabla
  window.filterAndRenderProducts = function () {
    const tbody = document.getElementById('products-page-tbody');
    const countBadge = document.getElementById('products-count-badge');
    if (!tbody) return;

    const searchTerm = (document.getElementById('admin-product-search')?.value || '').toLowerCase().trim();
    const selectedCat = (document.getElementById('admin-product-category-filter')?.value || 'all').toLowerCase().trim();
    const selectedStatus = document.getElementById('admin-product-status-filter')?.value || 'all';

    let filtered = allProducts.filter(p => {
      // 1. Filtro de búsqueda por texto
      if (searchTerm) {
        const name = (p.nombre || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        const code = (p.codigo || p.code || '').toLowerCase();
        const desc = (p.descripcion || '').toLowerCase();
        const cat = (p.categoria || '').toLowerCase();
        const matchesText = name.includes(searchTerm) || id.includes(searchTerm) || code.includes(searchTerm) || desc.includes(searchTerm) || cat.includes(searchTerm);
        if (!matchesText) return false;
      }

      // 2. Filtro por categoría
      if (selectedCat !== 'all') {
        const pCatId = String(p.id_categoria || '').toLowerCase().trim();
        const pCatName = String(p.categoria || '').toLowerCase().trim();
        const matchesCat = pCatId === selectedCat || pCatName === selectedCat;
        if (!matchesCat) return false;
      }

      // 3. Filtro por disponibilidad
      if (selectedStatus !== 'all') {
        const isAvailable = p.disponible !== false && (typeof p.stock !== 'number' || p.stock > 0);
        if (selectedStatus === 'available' && !isAvailable) return false;
        if (selectedStatus === 'unavailable' && isAvailable) return false;
      }

      return true;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Plato${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-cell">
            <div style="padding: 24px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">🍽️</div>
              <p style="margin: 0; font-weight: 600; color: #cbd5e1;">No se encontraron productos con los filtros aplicados.</p>
              <button class="btn btn-xs btn-secondary" onclick="document.getElementById('admin-product-search').value=''; document.getElementById('admin-product-category-filter').value='all'; document.getElementById('admin-product-status-filter').value='all'; window.filterAndRenderProducts();" style="margin-top: 10px;">
                Limpiar Filtros
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const price = (parseFloat(p.precio) || 0).toFixed(2);
      const img = p.imagen || '/imagenes/portada/Portada1E.webp';
      const isAvailable = p.disponible !== false && (typeof p.stock !== 'number' || p.stock > 0);
      const stockVal = typeof p.stock === 'number' ? p.stock : 25;
      const catDisplayName = p.categoria || CATEGORY_NAMES_MAP[p.id_categoria] || p.id_categoria || 'GENERAL';
      const codeOrId = p.codigo || p.id || 'PL000';

      return `
        <tr data-prod-id="${p.id}">
          <td>
            <img src="${img}" class="product-table-img" alt="${p.nombre}" onerror="this.src='/imagenes/portada/Portada1E.webp'">
          </td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <strong style="color: #ffffff; font-size: 13.5px;">${p.nombre}</strong>
              <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">${codeOrId} ${p.etiqueta ? `· <span style="color:#f59e0b; font-weight:700;">${p.etiqueta}</span>` : ''}</span>
            </div>
          </td>
          <td>
            <span class="badge badge-neutral" style="text-transform: uppercase; font-size: 11px;">${catDisplayName}</span>
          </td>
          <td>
            <strong style="color: #eab308; font-size: 14px;">S/ ${price}</strong>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 700; color: ${stockVal <= 5 ? '#f87171' : '#f8fafc'};">${stockVal}</span>
              <span style="font-size: 11px; color: #64748b;">un.</span>
            </div>
          </td>
          <td>
            <button type="button" 
                    class="btn-status-toggle ${isAvailable ? 'status-active' : 'status-inactive'}" 
                    onclick="window.toggleProductAvailability('${p.id}')"
                    title="Clic para cambiar disponibilidad"
                    style="background: ${isAvailable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isAvailable ? '#4ade80' : '#f87171'}; border: 1px solid ${isAvailable ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 9999px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
              <span>${isAvailable ? 'DISPONIBLE' : 'AGOTADO'}</span>
            </button>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px; justify-content: flex-end;">
              <button class="btn btn-xs btn-secondary btn-edit-product" onclick="window.openEditProductModal('${p.id}')" type="button" title="Editar">
                ✏️ Editar
              </button>
              <button class="btn btn-xs btn-danger btn-delete-product" onclick="window.deleteProduct('${p.id}')" type="button" title="Eliminar">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  // Abrir Modal de Nuevo Producto
  window.openNewProductModal = function () {
    const backdrop = document.getElementById('modal-product-backdrop');
    const title = document.getElementById('modal-product-title');
    const form = document.getElementById('form-admin-product');
    if (!backdrop || !form) return;

    form.reset();
    document.getElementById('modal-product-id').value = '';
    
    // Generar sugerencia de código PLXXXXX
    const nextNum = allProducts.length + 1;
    const suggestedCode = `PL${String(nextNum).padStart(5, '0')}`;
    const codeInput = document.getElementById('modal-product-code');
    if (codeInput) codeInput.value = suggestedCode;

    // Valores por defecto
    const stockInput = document.getElementById('modal-product-stock');
    if (stockInput) stockInput.value = '25';
    const dispSelect = document.getElementById('modal-product-disponible');
    if (dispSelect) dispSelect.value = 'true';

    if (title) title.textContent = 'Nuevo Plato para la Carta';
    const submitBtn = document.getElementById('btn-save-product');
    if (submitBtn) submitBtn.textContent = 'Guardar y Publicar';

    backdrop.classList.add('active', 'open');
  };

  // Abrir Modal de Edición de Producto
  window.openEditProductModal = function (productId) {
    const backdrop = document.getElementById('modal-product-backdrop');
    const title = document.getElementById('modal-product-title');
    if (!backdrop) return;

    const p = allProducts.find(item => item.id === productId || item.codigo === productId);
    if (!p) {
      alert('No se encontró el producto a editar.');
      return;
    }

    document.getElementById('modal-product-id').value = p.id;
    document.getElementById('modal-product-name').value = p.nombre || '';
    
    // Categoría
    const catSelect = document.getElementById('modal-product-category');
    if (catSelect) {
      // Buscar por ID exacto, por código o por nombre
      catSelect.value = p.id_categoria || 'C0005';
      if (!catSelect.value) {
        const matchingOpt = Array.from(catSelect.options).find(opt => 
          opt.textContent.trim().toUpperCase() === String(p.categoria || '').trim().toUpperCase()
        );
        if (matchingOpt) catSelect.value = matchingOpt.value;
      }
    }

    document.getElementById('modal-product-price').value = p.precio !== undefined ? p.precio : '';
    document.getElementById('modal-product-stock').value = p.stock !== undefined ? p.stock : 25;
    
    const dispSelect = document.getElementById('modal-product-disponible');
    if (dispSelect) {
      dispSelect.value = (p.disponible !== false && (typeof p.stock !== 'number' || p.stock > 0)) ? 'true' : 'false';
    }

    const codeInput = document.getElementById('modal-product-code');
    if (codeInput) codeInput.value = p.codigo || p.id || '';

    const badgeInput = document.getElementById('modal-product-badge');
    if (badgeInput) badgeInput.value = p.etiqueta || '';

    document.getElementById('modal-product-desc').value = p.descripcion || '';
    document.getElementById('modal-product-img').value = p.imagen || '';

    const salsasCheck = document.getElementById('modal-product-salsas');
    if (salsasCheck) salsasCheck.checked = Boolean(p.incluye_salsas);

    const acompCheck = document.getElementById('modal-product-acompanamiento');
    if (acompCheck) acompCheck.checked = Boolean(p.tiene_acompanamiento);

    if (title) title.textContent = `Editar Plato: ${p.nombre}`;
    const submitBtn = document.getElementById('btn-save-product');
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

    backdrop.classList.add('active', 'open');
  };

  // Cerrar modal
  window.closeProductModal = function () {
    const backdrop = document.getElementById('modal-product-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active', 'open');
    }
  };

  // Guardar (Crear o Actualizar) Producto
  async function handleProductFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('modal-product-id')?.value?.trim();
    const nombre = document.getElementById('modal-product-name')?.value?.trim();
    const catSelect = document.getElementById('modal-product-category');
    const id_categoria = catSelect?.value;
    const selectedOption = catSelect?.options[catSelect.selectedIndex];
    const categoria = selectedOption?.getAttribute('data-name') || selectedOption?.textContent?.trim() || CATEGORY_NAMES_MAP[id_categoria] || 'HAMBURGUESAS';
    
    const precio = parseFloat(document.getElementById('modal-product-price')?.value) || 0;
    const stock = parseInt(document.getElementById('modal-product-stock')?.value, 10) || 0;
    const disponible = document.getElementById('modal-product-disponible')?.value === 'true';
    const codigo = document.getElementById('modal-product-code')?.value?.trim();
    const etiqueta = document.getElementById('modal-product-badge')?.value?.trim() || null;
    const descripcion = document.getElementById('modal-product-desc')?.value?.trim() || '';
    const imagen = document.getElementById('modal-product-img')?.value?.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
    const incluye_salsas = document.getElementById('modal-product-salsas')?.checked || false;
    const tiene_acompanamiento = document.getElementById('modal-product-acompanamiento')?.checked || false;

    if (!nombre) {
      alert('Por favor ingresa el nombre del platillo.');
      return;
    }

    const payload = {
      nombre,
      categoria,
      id_categoria,
      precio,
      stock,
      disponible,
      codigo,
      etiqueta,
      descripcion,
      imagen,
      incluye_salsas,
      tiene_acompanamiento
    };

    const submitBtn = document.getElementById('btn-save-product');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';
    }

    try {
      let res;
      if (id) {
        // Actualizar existente
        res = await fetch(`/api/productos/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Crear nuevo
        res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (res.ok && json.exito) {
        window.closeProductModal();
        await window.loadProductsList();
        alert(id ? '✅ Plato actualizado exitosamente.' : '✅ Nuevo plato añadido a la carta.');
      } else {
        throw new Error(json.error || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert(`Error al guardar: ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Plato';
      }
    }
  }

  // Alternar disponibilidad rápida (Disponible / Agotado)
  window.toggleProductAvailability = async function (productId) {
    const prod = allProducts.find(p => p.id === productId);
    if (!prod) return;

    const nuevoEstado = !(prod.disponible !== false && (typeof prod.stock !== 'number' || prod.stock > 0));
    
    // Actualización optimista en UI
    prod.disponible = nuevoEstado;
    window.filterAndRenderProducts();

    try {
      const res = await fetch(`/api/productos/${encodeURIComponent(productId)}/disponibilidad`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: nuevoEstado })
      });
      if (!res.ok) {
        // Revertir si falló
        prod.disponible = !nuevoEstado;
        window.filterAndRenderProducts();
        alert('No se pudo actualizar la disponibilidad en el servidor.');
      }
    } catch (e) {
      prod.disponible = !nuevoEstado;
      window.filterAndRenderProducts();
      alert('Error de red al actualizar disponibilidad.');
    }
  };

  // Eliminar producto
  window.deleteProduct = async function (productId) {
    const prod = allProducts.find(p => p.id === productId);
    const nombre = prod ? prod.nombre : 'este plato';

    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente "${nombre}" de la carta oficial?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/productos/${encodeURIComponent(productId)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok && json.exito) {
        allProducts = allProducts.filter(p => p.id !== productId);
        window.filterAndRenderProducts();
        
        const kpiProducts = document.getElementById('kpi-val-productos');
        if (kpiProducts) kpiProducts.textContent = allProducts.length;

        alert('Plato eliminado de la carta oficial.');
      } else {
        alert('Error al eliminar el producto: ' + (json.error || 'Desconocido'));
      }
    } catch (e) {
      alert('Error de conexión al eliminar.');
    }
  };

  // Event Listeners de inicialización
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsModule);
  } else {
    initProductsModule();
  }
})();
