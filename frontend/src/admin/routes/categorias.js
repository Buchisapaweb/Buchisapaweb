/* =========================================================
   MÓDULO ADMIN: CATEGORÍAS JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const btnNewCategory = document.getElementById('btn-open-new-category');
  if (btnNewCategory) {
    btnNewCategory.addEventListener('click', () => {
      window.openNewCategoryModal();
    });
  }

  const formCategory = document.getElementById('form-admin-category');
  if (formCategory) {
    formCategory.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Categoría guardada con éxito.');
      window.closeCategoryModal();
    });
  }
});
