/* =========================================================
   MÓDULO ADMIN: CATEGORÍAS JS
   ========================================================= */

(function () {
  'use strict';

  function initCategoriesModule() {
    const btnNewCategory = document.getElementById('btn-open-new-category');
    if (btnNewCategory) {
      btnNewCategory.addEventListener('click', (e) => {
        e.preventDefault();
        window.openNewCategoryModal();
      });
    }

    const formCategory = document.getElementById('form-admin-category');
    if (formCategory) {
      formCategory.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idInput = document.getElementById('modal-category-id');
        const nameInput = document.getElementById('modal-category-name');
        const slugInput = document.getElementById('modal-category-slug');
        const orderInput = document.getElementById('modal-category-order');
        const bannerInput = document.getElementById('modal-category-banner');

        const catId = idInput?.value?.trim();
        const name = nameInput?.value?.trim();
        const slug = slugInput?.value?.trim() || name.toLowerCase().replace(/\s+/g, '-');
        const order = parseInt(orderInput?.value, 10) || 1;
        const banner = bannerInput?.value?.trim() || `/imagenes/categorias/${slug}/banner.webp`;

        if (!name) {
          alert('Por favor, ingresa el nombre de la categoría.');
          return;
        }

        let categories = window.BuchiSapaAdmin?.categories || [];

        if (catId) {
          // Edición
          const index = categories.findIndex(c => String(c.id) === String(catId) || String(c.code) === String(catId) || String(c.slug) === String(catId));
          if (index !== -1) {
            categories[index] = {
              ...categories[index],
              name,
              slug,
              order,
              banner: banner || categories[index].banner
            };
          } else {
            categories.push({ id: catId, code: catId, slug, name, banner, order });
          }
        } else {
          // Nueva Categoría
          const newId = `C00${String(categories.length + 1).padStart(2, '0')}`;
          categories.push({
            id: newId,
            code: newId,
            slug,
            name,
            banner,
            order
          });
        }

        window.BuchiSapaAdmin.categories = categories;

        // Intentar guardar en backend
        try {
          await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: catId, name, slug, order, banner })
          });
        } catch (err) {
          console.warn('Nota: guardado local de categoría efectuado.');
        }

        if (typeof window.BuchiSapaAdmin?.renderCategoriesView === 'function') {
          window.BuchiSapaAdmin.renderCategoriesView(categories);
        }

        const kpiCats = document.getElementById('kpi-val-categorias');
        if (kpiCats) kpiCats.textContent = categories.length;

        window.closeCategoryModal();
        alert(catId ? 'Categoría actualizada con éxito.' : 'Nueva categoría creada con éxito.');
      });
    }
  }

  window.openNewCategoryModal = function (catId) {
    const backdrop = document.getElementById('modal-category-backdrop');
    const title = document.getElementById('modal-category-title');
    const idInput = document.getElementById('modal-category-id');
    const nameInput = document.getElementById('modal-category-name');
    const slugInput = document.getElementById('modal-category-slug');
    const orderInput = document.getElementById('modal-category-order');
    const bannerInput = document.getElementById('modal-category-banner');

    const categories = window.BuchiSapaAdmin?.categories || [];

    if (catId) {
      const cat = categories.find(c => String(c.id) === String(catId) || String(c.code) === String(catId) || String(c.slug) === String(catId));
      if (title) title.textContent = cat ? `Editar Categoría: ${cat.name}` : `Editar Categoría #${catId}`;
      if (idInput) idInput.value = catId;
      if (nameInput) nameInput.value = cat ? cat.name : '';
      if (slugInput) slugInput.value = cat ? (cat.slug || cat.code || cat.id) : '';
      if (orderInput) orderInput.value = cat ? (cat.order || 1) : 1;
      if (bannerInput) bannerInput.value = cat ? (cat.banner || cat.image || '') : '';
    } else {
      if (title) title.textContent = 'Nueva Categoría';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (slugInput) slugInput.value = '';
      if (orderInput) orderInput.value = categories.length + 1;
      if (bannerInput) bannerInput.value = '';
    }

    if (backdrop) backdrop.classList.add('active', 'open');
  };

  window.deleteCategory = function (catId) {
    let categories = window.BuchiSapaAdmin?.categories || [];
    const cat = categories.find(c => String(c.id) === String(catId) || String(c.code) === String(catId) || String(c.slug) === String(catId));
    const catName = cat ? cat.name : catId;

    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${catName}" de la carta digital?`)) {
      categories = categories.filter(c => String(c.id) !== String(catId) && String(c.code) !== String(catId) && String(c.slug) !== String(catId));
      window.BuchiSapaAdmin.categories = categories;

      try {
        fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      } catch (err) {}

      if (typeof window.BuchiSapaAdmin?.renderCategoriesView === 'function') {
        window.BuchiSapaAdmin.renderCategoriesView(categories);
      }

      const kpiCats = document.getElementById('kpi-val-categorias');
      if (kpiCats) kpiCats.textContent = categories.length;

      alert(`Categoría "${catName}" eliminada correctamente.`);
    }
  };

  document.addEventListener('DOMContentLoaded', initCategoriesModule);
})();
