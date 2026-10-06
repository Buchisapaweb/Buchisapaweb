/**
 * BUCHISAPA BURGER & BROASTER - PANEL ADMINISTRATIVO PRINCIPAL
 * Ruta: /frontend/src/admin/routes/admin.js
 */
(function () {
  'use strict';

  window.BuchiSapaAdmin = window.BuchiSapaAdmin || {
    init: function () {
      console.log('BuchiSapa Admin inicializado correctamente desde /admin/routes/admin.js');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (window.BuchiSapaAdmin && typeof window.BuchiSapaAdmin.init === 'function') {
      window.BuchiSapaAdmin.init();
    }
  });
})();
