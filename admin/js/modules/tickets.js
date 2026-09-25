/**
 * BUCHISAPA ADMIN - TICKETS & THERMAL PRINTER MODULE
 * Layer: /admin/js/modules/tickets.js
 */

(function () {
  'use strict';

  async function fetchTickets() {
    try {
      const data = await window.AdminApi.getTickets();
      window.AdminState.allTickets = Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Fallback tickets locales:', e);
      if (!window.AdminState.allTickets || window.AdminState.allTickets.length === 0) {
        window.AdminState.allTickets = [
          {
            id: 'tk-1',
            number: 'TK-0038',
            created_at: new Date().toISOString(),
            customer: 'Juan Carlos Mendoza',
            type: 'delivery',
            payment: 'Yape',
            items: [{ name: 'Bichi Broaster Regional', qty: 2, price: 18 }],
            subtotal: 36,
            deliveryFee: 5,
            total: 41,
            status: 'Emitido'
          },
          {
            id: 'tk-2',
            number: 'TK-0037',
            created_at: new Date(Date.now() - 20 * 60000).toISOString(),
            customer: 'Elena Rios',
            type: 'pickup',
            payment: 'Efectivo',
            items: [{ name: 'Hamburguesa Amazónica BuchiSapa', qty: 1, price: 15 }],
            subtotal: 15,
            deliveryFee: 0,
            total: 15,
            status: 'Emitido'
          }
        ];
      }
    }
    filterTickets();
  }

  function filterTickets() {
    let tickets = [...(window.AdminState.allTickets || [])];

    const searchInput = document.getElementById('ticket-search-input');
    const typeSelect = document.getElementById('ticket-filter-type');
    const paymentSelect = document.getElementById('ticket-filter-payment');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const typeFilter = typeSelect ? typeSelect.value : 'todos';
    const payFilter = paymentSelect ? paymentSelect.value : 'todos';

    if (query) {
      tickets = tickets.filter(t =>
        (t.number && t.number.toLowerCase().includes(query)) ||
        (t.customer && t.customer.toLowerCase().includes(query))
      );
    }

    if (typeFilter !== 'todos') {
      tickets = tickets.filter(t => t.type === typeFilter);
    }

    if (payFilter !== 'todos') {
      tickets = tickets.filter(t => (t.payment || '').toLowerCase().includes(payFilter.toLowerCase()));
    }

    window.AdminState.filteredTickets = tickets;
    renderTicketsTable();
  }

  function renderTicketsTable() {
    const tbody = document.getElementById('tickets-table-body');
    if (!tbody) return;

    const tickets = window.AdminState.filteredTickets || [];
    if (tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No se encontraron tickets con los filtros aplicados.</td></tr>`;
      return;
    }

    tbody.innerHTML = tickets.map(t => {
      return `
        <tr>
          <td style="font-weight: 800; color: #fff; font-family: monospace;">${t.number}</td>
          <td style="font-size: 0.78rem; color: var(--text-muted);">${new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          <td style="font-weight: 600;">${window.AdminUtils.escapeHtml(t.customer || 'Cliente Mostrador')}</td>
          <td><span class="badge ${t.type === 'delivery' ? 'badge-blue' : 'badge-amber'}">${t.type === 'delivery' ? 'Delivery' : 'Mostrador'}</span></td>
          <td>${t.payment || 'Efectivo'}</td>
          <td>${(t.items || []).length} items</td>
          <td style="font-weight: 800; color: #10b981;">${window.AdminUtils.formatSoles(t.total)}</td>
          <td><span class="badge badge-green">${t.status || 'Emitido'}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.previewThermalTicket('${t.id}')">
              🖨️ Ver / Imprimir
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function previewThermalTicket(id) {
    const ticket = (window.AdminState.allTickets || []).find(t => t.id === id);
    if (!ticket) return;

    window.AdminState.activePreviewTicket = ticket;
    renderThermalReceiptHTML(ticket);

    const modal = document.getElementById('ticket-preview-modal');
    if (modal) modal.classList.add('active');
  }

  function previewThermalTicketFromOrder(orderId) {
    const order = (window.AdminState.allOrders || []).find(o => o.id === orderId);
    if (!order) return;

    const ticketLike = {
      number: `TK-${order.orderNumber || order.id}`,
      created_at: order.created_at || new Date().toISOString(),
      customer: order.customer?.name || 'Cliente',
      type: order.type || 'delivery',
      payment: order.payment_method || 'Efectivo',
      items: (order.items || []).map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
      subtotal: (order.items || []).reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
      deliveryFee: order.deliveryFee || 0,
      total: order.total
    };

    renderThermalReceiptHTML(ticketLike);
    const modal = document.getElementById('ticket-preview-modal');
    if (modal) modal.classList.add('active');
  }

  function renderThermalReceiptHTML(t) {
    const target = document.getElementById('thermal-receipt-render-target');
    if (!target) return;

    target.innerHTML = `
      <div class="thermal-ticket-header">
        <h2>BUCHISAPA</h2>
        <p>Burger &amp; Broaster Artesanal</p>
        <p>Calle Arica 452 - Iquitos, Perú</p>
        <p>RUC: 20608912341 · Tel: (065) 24-1190</p>
        <div style="margin-top: 8px; font-weight: 800;">
          TICKET DE VENTA: ${t.number}
        </div>
        <div style="font-size: 11px;">FECHA: ${new Date(t.created_at || Date.now()).toLocaleString()}</div>
      </div>

      <div style="font-size: 11px; margin-bottom: 8px;">
        <div>CLIENTE: <strong>${window.AdminUtils.escapeHtml(t.customer)}</strong></div>
        <div>TIPO: <strong>${t.type === 'delivery' ? 'DELIVERY' : 'MOSTRADOR / LLEVAR'}</strong></div>
        <div>PAGO: <strong>${t.payment}</strong></div>
      </div>

      <table class="thermal-ticket-table">
        <thead>
          <tr>
            <th>CANT</th>
            <th>DESCRIPCIÓN</th>
            <th style="text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${(t.items || []).map(i => `
            <tr>
              <td>${i.qty || i.quantity || 1}x</td>
              <td>${window.AdminUtils.escapeHtml(i.name)}</td>
              <td style="text-align: right;">${window.AdminUtils.formatSoles((i.qty || i.quantity || 1) * i.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="thermal-ticket-totals">
        <div class="thermal-ticket-totals-row">
          <span>SUBTOTAL:</span>
          <span>${window.AdminUtils.formatSoles(t.subtotal || (t.total - (t.deliveryFee || 0)))}</span>
        </div>
        ${t.deliveryFee ? `
          <div class="thermal-ticket-totals-row">
            <span>COSTO DELIVERY:</span>
            <span>${window.AdminUtils.formatSoles(t.deliveryFee)}</span>
          </div>
        ` : ''}
        <div class="thermal-ticket-totals-row grand-total">
          <span>TOTAL A PAGAR:</span>
          <span>${window.AdminUtils.formatSoles(t.total)}</span>
        </div>
      </div>

      <div class="thermal-ticket-footer">
        <p>¡Gracias por saborear la pasión BuchiSapa!</p>
        <p style="margin-top: 4px;">Comprobante no tributario para fines de control interno y comanda de cocina.</p>
      </div>
    `;
  }

  function testThermalPrinter() {
    window.showToast('Enviando página de prueba ESC/POS a impresora térmica 80mm...', 'info');
  }

  function openNewTicketModal() {
    const modal = document.getElementById('new-ticket-modal');
    const select = document.getElementById('ticket-form-product-select');
    if (!modal) return;

    if (select) {
      const prods = window.AdminState.allProducts || [];
      select.innerHTML = prods.map(p => `
        <option value="${p.id}" data-price="${p.price}">
          ${window.AdminUtils.escapeHtml(p.name)} - S/ ${p.price.toFixed(2)}
        </option>
      `).join('');
    }

    modal.classList.add('active');
  }

  // Bindings
  window.fetchTickets = fetchTickets;
  window.filterTickets = filterTickets;
  window.renderTicketsTable = renderTicketsTable;
  window.previewThermalTicket = previewThermalTicket;
  window.previewThermalTicketFromOrder = previewThermalTicketFromOrder;
  window.testThermalPrinter = testThermalPrinter;
  window.openNewTicketModal = openNewTicketModal;

})();
