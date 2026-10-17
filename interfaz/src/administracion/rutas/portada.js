/* =========================================================
   MÓDULO ADMIN: PORTADAS JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const btnAddBanner = document.getElementById('btn-add-banner');
  if (btnAddBanner) {
    btnAddBanner.addEventListener('click', () => {
      alert('Selecciona un archivo de imagen para actualizar la portada.');
    });
  }
});
