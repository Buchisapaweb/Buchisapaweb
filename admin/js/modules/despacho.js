/**
 * BUCHISAPA ADMIN - DELIVERY & RECOJO IN STORE MODULE
 * Layer: /admin/js/modules/delivery-recojo.js
 */

(function () {
  'use strict';

  function renderDeliveryOrders() {
    const container = document.getElementById('delivery-orders-list');
    if (!container) return;

    const orders = (window.AdminState.allOrders || []).filter(o => o.type === 'delivery');

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px; color: var(--text-muted);">
          No hay despachos de delivery pendientes en este momento.
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header-row">
          <span class="order-number">🛵 Despacho #${order.orderNumber || order.id}</span>
          <span class="badge badge-blue">${order.status || 'En camino'}</span>
        </div>
        <div class="order-customer-info">
          <span>Cliente: <strong>${window.AdminUtils.escapeHtml(order.customer?.name || 'Cliente')}</strong></span>
          <span>Dirección: <strong>${window.AdminUtils.escapeHtml(order.customer?.address || 'Iquitos')}</strong></span>
          <span>Total: <strong style="color: #10b981;">${window.AdminUtils.formatSoles(order.total)}</strong></span>
        </div>
      </div>
    `).join('');
  }

  function renderRecojoOrders() {
    const container = document.getElementById('recojo-orders-list');
    if (!container) return;

    const orders = (window.AdminState.allOrders || []).filter(o => o.type === 'pickup');

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px; color: var(--text-muted);">
          No hay órdenes de recojo en mostrador pendientes.
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header-row">
          <span class="order-number">🛍️ Recojo #${order.orderNumber || order.id}</span>
          <span class="badge badge-green">${order.status || 'Listo para retirar'}</span>
        </div>
        <div class="order-customer-info">
          <span>Cliente: <strong>${window.AdminUtils.escapeHtml(order.customer?.name || 'Cliente')}</strong></span>
          <span>Pago: <strong>${order.payment_method || 'Efectivo'}</strong></span>
          <span>Total: <strong style="color: #10b981;">${window.AdminUtils.formatSoles(order.total)}</strong></span>
        </div>
      </div>
    `).join('');
  }

  window.renderDeliveryOrders = renderDeliveryOrders;
  window.renderRecojoOrders = renderRecojoOrders;

})();
