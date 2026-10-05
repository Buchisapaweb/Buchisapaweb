/**
 * BUCHISAPA ADMIN - MÓDULO DE GESTIÓN DE PEDIDOS
 * Layer: /admin/routes/pedidos.js
 */
(function () {
  'use strict';

  let currentModalOrderId = null;

  function renderOrdersTable(filterText = '') {
    const tbody = document.getElementById('pedidos-table-tbody');
    const badge = document.getElementById('pedidos-count-badge');
    if (!tbody) return;

    const orders = window.adminData?.orders || [];
    let list = [...orders];

    if (filterText) {
      const txt = filterText.toLowerCase();
      list = list.filter(o => (o.id || o._id || '').toLowerCase().includes(txt) || (o.customerName || o.customer?.name || '').toLowerCase().includes(txt));
    }

    const statusFilter = document.getElementById('pedidos-filter-status')?.value || 'all';
    if (statusFilter !== 'all') {
      list = list.filter(o => (o.status || 'pending').toLowerCase() === statusFilter);
    }

    if (badge) badge.textContent = `${list.length} de ${orders.length} pedidos`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state-box">
              <p>No hay pedidos registrados con estos filtros.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(o => {
      const id = o.id || o._id || 'BS-000';
      const client = o.customerName || o.customer?.name || 'Cliente';
      const total = Number(o.total || o.totalAmount || 0).toFixed(2);
      const isLocal = o.type === 'local' || o.deliveryType === 'local';
      const typeLabel = isLocal ? 'Salón / Mesa' : 'Delivery';
      const time = o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hoy';
      const status = o.status || 'pending';

      const statusBadge = status === 'completed'
        ? `<span class="order-status-badge order-status-completed">● Entregado</span>`
        : status === 'delivering'
        ? `<span class="order-status-badge order-status-delivery">● En Ruta</span>`
        : status === 'cooking'
        ? `<span class="order-status-badge order-status-cooking">● En Cocina</span>`
        : status === 'cancelled'
        ? `<span class="order-status-badge order-status-cancelled">● Cancelado</span>`
        : `<span class="order-status-badge order-status-pending">● Pendiente</span>`;

      return `
        <tr>
          <td class="cell-mono-cyan">#${id}</td>
          <td>
            <div class="table-client-meta">
              <span class="cell-name-white">${client}</span>
              <span class="cell-subtle-sm">${isLocal ? '🍽️ Consumo en Mesa' : '🛵 ' + (o.deliveryAddress || 'Delivery')}</span>
            </div>
          </td>
          <td>
            <span class="delivery-type-pill ${isLocal ? 'delivery-type-local' : 'delivery-type-delivery'}">
              ${typeLabel}
            </span>
          </td>
          <td class="table-price">S/ ${total}</td>
          <td class="cell-subtle-sm">${time}</td>
          <td>${statusBadge}</td>
          <td class="cell-actions-right">
            <div class="cell-actions-inline">
              <button class="btn btn-outline btn-xs" onclick="window.viewOrderDetail('${id}')" title="Ver Comanda">
                Ver
              </button>
              <button class="btn btn-secondary btn-xs" onclick="window.advanceOrderStatus('${id}')" title="Avanzar Estado">
                Avanzar
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.renderOrdersTable = renderOrdersTable;

  window.filterOrdersTable = function (val) {
    renderOrdersTable(val || document.getElementById('pedidos-search-input')?.value || '');
  };

  window.advanceOrderStatus = async function (id) {
    const orders = window.adminData?.orders || [];
    const order = orders.find(o => (o.id || o._id) === id);
    if (!order) return;

    const flow = ['pending', 'cooking', 'delivering', 'completed'];
    const currentIdx = flow.indexOf(order.status || 'pending');
    const nextStatus = currentIdx >= 0 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : 'completed';

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        order.status = nextStatus;
        window.showAdminToast?.(`Pedido #${id} actualizado a ${nextStatus.toUpperCase()}`, 'success');
        renderOrdersTable();
        window.renderDashboard?.();
      }
    } catch (e) {
      console.error(e);
      order.status = nextStatus;
      renderOrdersTable();
      window.showAdminToast?.(`Estado cambiado a ${nextStatus}`, 'info');
    }
  };

  window.viewOrderDetail = function (id) {
    const orders = window.adminData?.orders || [];
    const order = orders.find(o => (o.id || o._id) === id);
    if (!order) return;

    currentModalOrderId = id;
    const backdrop = document.getElementById('modal-order-backdrop');
    const body = document.getElementById('modal-order-body');
    const title = document.getElementById('modal-order-title');
    if (!backdrop || !body) return;

    if (title) title.textContent = `Detalle de Pedido #${id}`;

    const items = Array.isArray(order.items) ? order.items : [];
    const client = order.customerName || order.customer?.name || 'Cliente Particular';
    const phone = order.customerPhone || order.customer?.phone || 'Sin celular';
    const address = order.deliveryAddress || 'Atención en salón / Local BuchiSapa';
    const total = Number(order.total || order.totalAmount || 0).toFixed(2);

    body.innerHTML = `
      <div class="modal-order-header-info">
        <p><strong>Cliente:</strong> <span class="cell-name-white">${client}</span> (${phone})</p>
        <p><strong>Dirección:</strong> <span>${address}</span></p>
        <p><strong>Tipo:</strong> <span class="cell-mono-cyan">${order.type === 'local' ? 'Mesa / Salón' : 'Delivery'}</span></p>
      </div>
      <div>
        <h4 class="cell-name-white">Items del Pedido:</h4>
        <div class="modal-order-items-wrap">
          ${items.map(i => `
            <div class="modal-order-item-row">
              <span>${i.quantity || 1}x ${i.name}</span>
              <span class="cell-mono-cyan">S/ ${Number(i.price || 0).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="modal-order-total-card">
        <strong class="cell-name-white">TOTAL A COBRAR:</strong>
        <strong class="cell-mono-cyan">S/ ${total}</strong>
      </div>
    `;

    backdrop.classList.add('active');
  };

  window.closeOrderModal = function () {
    document.getElementById('modal-order-backdrop')?.classList.remove('active');
    currentModalOrderId = null;
  };

  window.printCurrentModalOrder = function () {
    window.print();
  };

  window.printOrderTicket = function (id) {
    window.viewOrderDetail(id);
    setTimeout(() => {
      window.print();
    }, 300);
  };
})();
