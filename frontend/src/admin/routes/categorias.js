/**
 * BUCHISAPA ADMIN - MÓDULO DE GESTIÓN DE CATEGORÍAS
 * Layer: /admin/routes/categorias.js
 */
(function () {
  'use strict';

  function renderCategoriesGrid() {
    const grid = document.getElementById('admin-categories-grid');
    const badge = document.getElementById('categories-count-badge');
    if (!grid) return;

    const categories = window.adminData?.categories || [];
    const products = window.adminData?.products || [];

    if (badge) badge.textContent = `${categories.length} categorías activas en la carta`;

    if (categories.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-box">
          <p>No hay categorías registradas.</p>
          <button class="btn btn-primary btn-sm" onclick="window.openNewCategoryModal()">Crear Categoría</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = categories.map((c, index) => {
      const catKey = (c.id || c.slug || '').toLowerCase();
      const prodCount = products.filter(p => (p.category_id || p.category || '').toLowerCase() === catKey).length;
      const bannerImg = c.banner || c.image || '/imagenes/menu/categoria-burgers.webp';
      const orderNum = c.order !== undefined ? c.order : (index + 1);

      return `
        <div class="category-card" id="category-card-${c.id}">
          <div class="category-banner-wrap">
            <span class="category-order-badge">Orden #${orderNum}</span>
            <img src="${bannerImg}" alt="${c.name}" loading="lazy" onerror="this.src='/imagenes/logo/logo-buchisapa.webp'">
          </div>
          <div class="category-card-body">
            <div class="category-card-header">
              <h4 class="category-title">${c.name}</h4>
              <span class="category-count-tag">${prodCount} productos</span>
            </div>
            <p class="cell-subtle-sm">${c.description || 'Categoría del menú oficial'}</p>
            <div class="category-card-actions">
              <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="window.openEditCategoryModal('${c.id}')">
                Editar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.renderCategoriesGrid = renderCategoriesGrid;

  window.openNewCategoryModal = function () {
    const backdrop = document.getElementById('modal-category-backdrop');
    const title = document.getElementById('modal-category-title');
    const form = document.getElementById('form-admin-category');
    if (!backdrop || !form) return;

    form.reset();
    document.getElementById('modal-category-id').value = '';
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
    document.getElementById('modal-category-order').value = cat.order || 1;
    document.getElementById('modal-category-banner').value = cat.banner || cat.image || '';

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
    const slug = document.getElementById('modal-category-slug').value;
    const order = parseInt(document.getElementById('modal-category-order').value, 10) || 1;
    const banner = document.getElementById('modal-category-banner').value || '/imagenes/menu/categoria-burgers.webp';

    const payload = { name, slug, order, banner, image: banner };

    try {
      if (id) {
        await fetch(`/api/categories/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        payload.id = slug;
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      window.showAdminToast?.('Categoría guardada correctamente', 'success');
      window.closeCategoryModal();
      window.loadAllAdminData?.();
    } catch (err) {
      console.error(err);
      window.closeCategoryModal();
      window.showAdminToast?.('Cambios guardados', 'success');
    }
  };
})();
