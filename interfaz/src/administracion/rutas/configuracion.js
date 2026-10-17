/* =========================================================
   MÓDULO ADMIN: CONFIGURACIÓN JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const btnSaveConfig = document.getElementById('btn-save-store-config');
  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      alert('Configuración general del establecimiento guardada con éxito.');
    });
  }
});
