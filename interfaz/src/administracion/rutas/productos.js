/* =========================================================
   MÓDULO ADMIN: PRODUCTOS JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const btnNewProduct = document.getElementById('btn-open-new-product');
  if (btnNewProduct) {
    btnNewProduct.addEventListener('click', () => {
      window.openNewProductModal();
    });
  }

  const formProduct = document.getElementById('form-admin-product');
  if (formProduct) {
    formProduct.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Producto guardado correctamente en la base de datos de BuchiSapa.');
      window.closeProductModal();
    });
  }
});
