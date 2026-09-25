/**
 * BUCHISAPA ADMIN - ORDERS MANAGEMENT MODULE
 * Layer: /admin/js/modules/orders.js
 */

(function () {
  'use strict';

  async function fetchOrders() {
    try {
      const data = await window.AdminApi.getOrders();
      window.AdminState.allOrders = Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Error al cargar órdenes del servidor, usando órdenes simuladas:', e);
      if (!window.AdminState.allOrders || window.AdminState.allOrders.length === 0) {
        window.AdminState.allOrders = [
          {
            id: 'ord-101',
            orderNumber: 'TK-0038',
            created_at: new Date().toISOString(),
            status: 'en_preparacion',
            type: 'delivery',
            customer: { name: 'Juan Carlos Mendoza', phone: '984 555 123', address: 'Jr. Prospero 342' },
            items: [{ name: 'Bichi Broaster Regional', quantity: 2, price: 18, total: 36 }],
            total: 41,
            payment_method: 'Yape'
          },
          {
            id: 'ord-102',
            orderNumber: 'TK-0037',
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
            status: 'listo',
            type: 'pickup',
            customer: { name: 'Elena Rios', phone: '965 222 344' },
            items: [{ name: 'Hamburguesa Amazónica BuchiSapa', quantity: 1, price: 15, total: 15 }],
            total: 15,
            payment_method: 'Efectivo'
          }
        ];
      }
    }
    renderAllOrders();
    window.updateDashboardMetrics?.();
  }

  function renderAllOrders() {
    const container = document.getElementById('all-orders-master-list');
    if (!container) return;

    const orders = window.AdminState.allOrders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; color: var(--text-muted);">
          <p style="font-size: 1.1rem; font-weight: 700;">No hay pedidos registrados</p>
          <p style="font-size: 0.8rem; margin-top: 4px;">Las nuevas órdenes de los comensales aparecerán aquí en vivo.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const status = (order.status || 'pendiente').toLowerCase();
      const isDelivery = order.type === 'delivery';

      return `
        <div class="order-card">
          <div class="order-header-row">
            <div class="order-id-group">
              <span class="order-number">Orden #${order.orderNumber || order.id}</span>
              <span class="order-type-badge">${isDelivery ? '🛵 Delivery' : '🛍️ Recojo'}</span>
              <span class="badge ${getStatusBadgeClass(status)}">${getStatusLabel(status)}</span>
            </div>
            <span class="order-timestamp">${new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div class="order-customer-info">
            <span class="order-customer-name">👤 ${window.AdminUtils.escapeHtml(order.customer?.name || 'Cliente')}</span>
            ${order.customer?.phone ? `<span>📞 ${order.customer.phone}</span>` : ''}
            ${order.customer?.address ? `<span>📍 ${window.AdminUtils.escapeHtml(order.customer.address)}</span>` : ''}
            <span>💳 ${order.payment_method || 'Efectivo'}</span>
          </div>

          <div class="order-items-summary">
            ${(order.items || []).map(item => `
              <div class="order-item-row">
                <div>
                  <span class="order-item-qty">${item.quantity}x</span>
                  <span class="order-item-name">${window.AdminUtils.escapeHtml(item.name || item.title)}</span>
                </div>
                <span class="order-item-price">${window.AdminUtils.formatSoles(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>

          <div class="order-card-footer">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Total a cobrar:</span>
              <span class="order-total-amount" style="margin-left: 6px;">${window.AdminUtils.formatSoles(order.total)}</span>
            </div>

            <div class="order-stage-actions">
              ${status === 'pendiente' ? `
                <button class="btn btn-primary btn-sm" onclick="window.changeOrderStatus('${order.id}', 'en_preparacion')">
                  🧑‍🍳 A Cocina
                </button>
              ` : ''}

              ${status === 'en_preparacion' || status === 'preparando' ? `
                <button class="btn btn-secondary btn-sm" style="border-color: #10b981; color: #10b981;" onclick="window.changeOrderStatus('${order.id}', 'listo')">
                  ✅ Marcar Listo
                </button>
              ` : ''}

              ${status === 'listo' ? `
                <button class="btn btn-primary btn-sm" onclick="window.changeOrderStatus('${order.id}', 'entregado')">
                  🚀 Entregar
                </button>
              ` : ''}

              <button class="btn btn-secondary btn-sm" onclick="window.previewThermalTicketFromOrder('${order.id}')" title="Imprimir Ticket">
                🖨️ Ticket
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getStatusBadgeClass(status) {
    if (status === 'en_preparacion' || status === 'preparando') return 'badge-blue';
    if (status === 'listo' || status === 'entregado') return 'badge-green';
    if (status === 'cancelado') return 'badge-red';
    return 'badge-amber';
  }

  function getStatusLabel(status) {
    if (status === 'en_preparacion' || status === 'preparando') return 'En Preparación';
    if (status === 'listo') return 'Listo en Cocina';
    if (status === 'entregado') return 'Entregado';
    if (status === 'cancelado') return 'Cancelado';
    return 'Pendiente';
  }

  async function changeOrderStatus(id, newStatus) {
    try {
      await window.AdminApi.updateOrderStatus(id, newStatus);
      window.showToast(`Pedido actualizado a ${getStatusLabel(newStatus)}`, 'success');
      await fetchOrders();
    } catch (e) {
      // Fallback local
      const order = (window.AdminState.allOrders || []).find(o => o.id === id);
      if (order) order.status = newStatus;
      renderAllOrders();
      window.showToast(`Estado actualizado localmente a ${getStatusLabel(newStatus)}`, 'info');
    }
  }

  // Bindings
  window.fetchOrders = fetchOrders;
  window.renderAllOrders = renderAllOrders;
  window.changeOrderStatus = changeOrderStatus;

})();
