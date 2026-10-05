/**
 * BUCHISAPA ADMIN - MÓDULO DASHBOARD & ANALÍTICA GENERAL
 * Layer: /admin/routes/dashboard.js
 */
(function () {
  'use strict';

  function renderDashboard() {
    const orders = window.adminData?.orders || [];
    const products = window.adminData?.products || [];
    const insumos = window.adminData?.insumos || [];
    const utensilios = window.adminData?.utensilios || [];

    let totalVentasHoy = 0;
    let totalPedidosHoy = orders.length;
    let deliveryCount = 0;
    let localCount = 0;
    let deliveryTotal = 0;
    let localTotal = 0;
    let unidadesVendidas = 0;

    orders.forEach(o => {
      const total = Number(o.total || o.totalAmount || 0);
      totalVentasHoy += total;
      if (o.type === 'local' || o.deliveryType === 'local') {
        localCount++;
        localTotal += total;
      } else {
        deliveryCount++;
        deliveryTotal += total;
      }
      if (Array.isArray(o.items)) {
        o.items.forEach(i => unidadesVendidas += (Number(i.quantity) || 1));
      }
    });

    const gananciaNeta = totalVentasHoy * 0.42;

    const elVentas = document.getElementById('dash-ventas-hoy');
    if (elVentas) elVentas.textContent = `S/ ${totalVentasHoy.toFixed(2)}`;

    const elPedidos = document.getElementById('dash-pedidos-hoy');
    if (elPedidos) elPedidos.textContent = `${totalPedidosHoy} órdenes`;

    const elGanancia = document.getElementById('dash-ganancia-hoy');
    if (elGanancia) elGanancia.textContent = `S/ ${gananciaNeta.toFixed(2)}`;

    const elUnidades = document.getElementById('dash-unidades-hoy');
    if (elUnidades) elUnidades.textContent = `${unidadesVendidas} un.`;

    const elDelivCount = document.getElementById('dash-delivery-count');
    if (elDelivCount) elDelivCount.textContent = `${deliveryCount} órdenes`;
    const elDelivTot = document.getElementById('dash-delivery-total');
    if (elDelivTot) elDelivTot.textContent = `Total: S/ ${deliveryTotal.toFixed(2)}`;

    const elLocCount = document.getElementById('dash-salon-count');
    if (elLocCount) elLocCount.textContent = `${localCount} órdenes`;
    const elLocTot = document.getElementById('dash-salon-total');
    if (elLocTot) elLocTot.textContent = `Total: S/ ${localTotal.toFixed(2)}`;

    const elInsumosCrit = document.getElementById('dash-insumos-alerta');
    if (elInsumosCrit) {
      const alertInsumos = insumos.filter(i => i.stock <= i.min).length;
      elInsumosCrit.textContent = `${alertInsumos} insumos`;
    }

    const elUtensiliosMant = document.getElementById('dash-utensilios-mantenimiento');
    if (elUtensiliosMant) {
      const inMaint = utensilios.filter(u => u.status === 'mantenimiento').length;
      elUtensiliosMant.textContent = `${inMaint} equipos`;
    }

    let agotados = 0;
    products.forEach(p => {
      const stock = Number(p.stock !== undefined ? p.stock : (p.available !== false ? 25 : 0));
      if (stock <= 0) agotados++;
    });

    const alertBar = document.getElementById('dashboard-stock-alert-bar');
    if (alertBar) {
      alertBar.style.display = agotados > 0 ? 'block' : 'none';
      const alertDesc = document.getElementById('stock-alert-desc');
      if (alertDesc) alertDesc.textContent = `Hay ${agotados} producto(s) con stock agotado o en nivel crítico.`;
    }

    const recentTbody = document.getElementById('dashboard-recent-orders-tbody');
    if (recentTbody) {
      if (orders.length === 0) {
        recentTbody.innerHTML = `
          <tr>
            <td colspan="4">
              <div class="empty-state-box">
                <p>Sin pedidos registrados hoy</p>
              </div>
            </td>
          </tr>
        `;
      } else {
        const recents = orders.slice(0, 5);
        recentTbody.innerHTML = recents.map(o => {
          const id = o.id || o._id || 'BS-000';
          const client = o.customerName || o.customer?.name || 'Cliente';
          const total = Number(o.total || o.totalAmount || 0).toFixed(2);
          const status = o.status || 'pending';
          const statusBadge = status === 'completed'
            ? `<span class="status-dot-delivered">● Entregado</span>`
            : status === 'delivering'
            ? `<span class="status-dot-route">● En Ruta</span>`
            : status === 'cancelled'
            ? `<span class="status-dot-cancelled">● Cancelado</span>`
            : `<span class="status-dot-kitchen">● En Cocina</span>`;

          return `
            <tr>
              <td class="cell-mono-cyan">#${id}</td>
              <td class="cell-name-white">${client}</td>
              <td class="cell-mono-white">S/ ${total}</td>
              <td>${statusBadge}</td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  window.renderDashboard = renderDashboard;
})();
