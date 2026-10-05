/**
 * BUCHISAPA ADMIN - MÓDULO DE CONFIGURACIÓN & SIMULADOR DE TICKET
 * Layer: /admin/routes/ticket.js
 */
(function () {
  'use strict';

  function syncTicketPreview() {
    const business = document.getElementById('ticket-input-business')?.value || 'BUCHISAPA BURGER & BROASTER';
    const ruc = document.getElementById('ticket-input-ruc')?.value || '20601234567';
    const address = document.getElementById('ticket-input-address')?.value || 'Av. Principal 450, Tarapoto';
    const phone = document.getElementById('ticket-input-phone')?.value || '961 884 219';
    const footer = document.getElementById('ticket-input-footer')?.value || '¡Gracias por su compra! Vuelva pronto.';

    const pBusiness = document.getElementById('ticket-preview-business');
    const pRuc = document.getElementById('ticket-preview-ruc');
    const pAddress = document.getElementById('ticket-preview-address');
    const pPhone = document.getElementById('ticket-preview-phone');
    const pFooter = document.getElementById('ticket-preview-footer');

    if (pBusiness) pBusiness.textContent = business;
    if (pRuc) pRuc.textContent = ruc;
    if (pAddress) pAddress.textContent = address;
    if (pPhone) pPhone.textContent = phone;
    if (pFooter) pFooter.textContent = footer;
  }

  window.syncTicketPreview = syncTicketPreview;

  window.saveTicketConfig = function () {
    window.showAdminToast?.('Plantilla de ticket térmico guardada con éxito', 'success');
  };

  window.printTestTicket = function () {
    window.print();
  };
})();
