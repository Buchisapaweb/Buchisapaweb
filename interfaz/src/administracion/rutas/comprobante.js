/* =========================================================
   MÓDULO ADMIN: TICKET JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const btnSaveTicket = document.getElementById('btn-save-ticket-config');
  if (btnSaveTicket) {
    btnSaveTicket.addEventListener('click', () => {
      alert('Configuración del ticket actualizada para impresoras térmicas.');
    });
  }
});
