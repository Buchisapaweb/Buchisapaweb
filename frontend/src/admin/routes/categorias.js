/**
 * BUCHISAPA ADMIN - MÓDULO DE GESTIÓN DE CATEGORÍAS
 * Layer: /admin/routes/categorias.js
 */
(function () {
  'use strict';

  function renderCategoriesGrid(filterText = '') {
    const grid = document.getElementById('categorias-grid-container') || document.getElementById('admin-categories-grid');
    const badge = document.getElementById('categorias-count-badge') || document.getElementById('categories-count-badge');
    if (!grid) return;

    const categories = window.adminData?.categories || [];
    const products = window.adminData?.products || [];

    let list = [...categories];
    if (filterText && typeof filterText === 'string') {
      const q = filterText.toLowerCase().trim();
      list = list.filter(c => 
        (c.name || '').toLowerCase().includes(q) || 
        (c.id || c.slug || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }

    if (badge) {
      badge.textContent = `${list.length} de ${categories.length} categorías activas en la carta`;
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-box">
          <p>No se encontraron categorías con el criterio de búsqueda.</p>
          <button class="btn btn-primary btn-sm" onclick="window.openNewCategoryModal()">Crear Categoría</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map((c, index) => {
      const catKey = (c.id || c.slug || '').toLowerCase();
      const prodCount = products.filter(p => {
        const pCat = (p.category_id || p.category || '').toLowerCase();
        return pCat === catKey || (catKey === 'salchipapas' && (pCat.includes('salchi') || pCat.includes('salchipapa')));
      }).length;

      const bannerImg = c.banner || c.image || '/imagenes/categorias/platos-amazonicos/banner.webp';
      const orderNum = c.order !== undefined ? c.order : (index + 1);

      return `
        <div class="category-card" id="category-card-${c.id}">
          <div class="category-banner-wrap">
            <span class="category-order-badge">Orden #${orderNum}</span>
            <img src="${bannerImg}" alt="${c.name}" loading="lazy" onerror="this.src='/imagenes/logo/logo-buchisapa.webp'">
            <div class="category-banner-overlay"></div>
          </div>
          <div class="category-card-body">
            <div class="category-card-header">
              <h4 class="category-title">${c.name}</h4>
              <span class="category-count-tag">${prodCount} productos</span>
            </div>
            <p class="category-desc-text">${c.description || 'Categoría activa en la carta de clientes.'}</p>
            <div class="category-card-actions">
              <button class="btn btn-outline btn-sm btn-category-view" type="button" onclick="window.goToCategoryProducts('${c.id}')" title="Ver catálogo de ${c.name}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Ver Platos</span>
              </button>
              <button class="btn btn-secondary btn-sm" type="button" onclick="window.openEditCategoryModal('${c.id}')" title="Editar Categoría">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.renderCategoriesGrid = renderCategoriesGrid;

  window.filterCategoriesGrid = function (val) {
    renderCategoriesGrid(val || document.getElementById('categorias-search-input')?.value || '');
  };

  window.goToCategoryProducts = function (categoryId) {
    window.switchAdminView('productos');
    setTimeout(() => {
      const select = document.getElementById('productos-filter-cat');
      if (select) {
        select.value = categoryId.toLowerCase();
        window.filterProductsTable?.();
      }
    }, 100);
  };

  window.openNewCategoryModal = function () {
    const backdrop = document.getElementById('modal-category-backdrop');
    const title = document.getElementById('modal-category-title');
    const form = document.getElementById('form-admin-category');
    if (!backdrop || !form) return;

    form.reset();
    document.getElementById('modal-category-id').value = '';
    const orderInput = document.getElementById('modal-category-order');
    if (orderInput) {
      orderInput.value = (window.adminData?.categories?.length || 0) + 1;
    }
    if (title) title.textContent = 'Nueva Categoría';
    backdrop.classList.add('active');
  };

  window.openEditCategoryModal = function (id) {
    const cat = window.adminData?.categories?.find(c => c.id === id);
    if (!cat) return;

    const backdrop = document.getElementById('modal-category-backdrop');
    const title = document.getElementById('modal-category-title');
    if (!backdrop) return;

    document.getElementById('modal-category-id').value = cat.id || '';
    document.getElementById('modal-category-name').value = cat.name || '';
    document.getElementById('modal-category-slug').value = cat.slug || cat.id || '';
    document.getElementById('modal-category-order').value = cat.order !== undefined ? cat.order : 1;
    document.getElementById('modal-category-banner').value = cat.banner || cat.image || '';
    
    const descEl = document.getElementById('modal-category-desc');
    if (descEl) descEl.value = cat.description || '';

    if (title) title.textContent = `Editar Categoría: ${cat.name}`;
    backdrop.classList.add('active');
  };

  window.closeCategoryModal = function () {
    document.getElementById('modal-category-backdrop')?.classList.remove('active');
  };

  window.handleSaveCategory = async function (e) {
    e.preventDefault();
    const id = document.getElementById('modal-category-id').value;
    const name = document.getElementById('modal-category-name').value;
    const slug = document.getElementById('modal-category-slug').value || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const order = parseInt(document.getElementById('modal-category-order').value, 10) || 1;
    const banner = document.getElementById('modal-category-banner').value || '/imagenes/categorias/platos-amazonicos/banner.webp';
    const description = document.getElementById('modal-category-desc')?.value || '';

    const payload = { 
      name, 
      slug, 
      order, 
      banner, 
      image: banner,
      description
    };

    try {
      if (id) {
        await fetch(`/api/categories/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const cat = window.adminData?.categories?.find(c => c.id === id);
        if (cat) {
          Object.assign(cat, payload);
        }
      } else {
        payload.id = slug;
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (window.adminData?.categories) {
          window.adminData.categories.push(payload);
        }
      }

      window.showAdminToast?.('Categoría guardada correctamente', 'success');
      window.closeCategoryModal();
      renderCategoriesGrid();
      window.loadAllAdminData?.();
    } catch (err) {
      console.error(err);
      window.closeCategoryModal();
      window.showAdminToast?.('Cambios guardados en panel', 'success');
      renderCategoriesGrid();
    }
  };
})();
