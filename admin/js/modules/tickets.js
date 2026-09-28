/**
 * BUCHISAPA ADMIN - TICKETS & THERMAL PRINTER MODULE
 * Layer: /admin/js/modules/tickets.js
 */

(function () {
  'use strict';

  async function fetchTickets() {
    const state = window.AdminState = window.AdminState || {};
    try {
      if (window.AdminApi && typeof window.AdminApi.getTickets === 'function') {
        const data = await window.AdminApi.getTickets();
        if (Array.isArray(data) && data.length > 0) {
          state.allTickets = data;
        } else {
          throw new Error('Empty api tickets');
        }
      } else {
        throw new Error('No getTickets api');
      }
    } catch (e) {
      if (!state.allTickets || state.allTickets.length === 0) {
        if (Array.isArray(state.allOrders) && state.allOrders.length > 0) {
          state.allTickets = state.allOrders.map((o, idx) => ({
            id: `tk-${o.id || idx + 1}`,
            number: `TK-${String(o.orderNumber || idx + 1035).padStart(4, '0').slice(-4)}`,
            created_at: o.created_at || new Date().toISOString(),
            customer: o.customer?.name || o.clientName || 'Cliente Mostrador',
            type: o.type || 'delivery',
            payment: o.payment_method || o.paymentMethod || 'Yape',
            items: (o.items || []).map(i => ({ name: i.name || 'Plato', qty: i.quantity || 1, price: i.price || 18 })),
            subtotal: o.subtotal || o.total || 36,
            deliveryFee: o.deliveryFee || (o.type === 'delivery' ? 5 : 0),
            total: o.total || 41,
            status: 'Emitido'
          }));
        } else {
          state.allTickets = [
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
              created_at: new Date(Date.now() - 25 * 60000).toISOString(),
              customer: 'Elena Rios Vásquez',
              type: 'salon',
              payment: 'Efectivo',
              items: [{ name: 'Hamburguesa Amazónica BuchiSapa', qty: 1, price: 15 }, { name: 'Jugo de Cocona', qty: 1, price: 6 }],
              subtotal: 21,
              deliveryFee: 0,
              total: 21,
              status: 'Emitido'
            },
            {
              id: 'tk-3',
              number: 'TK-0036',
              created_at: new Date(Date.now() - 70 * 60000).toISOString(),
              customer: 'Marcos Antonio Villegas',
              type: 'salon',
              payment: 'Tarjeta POS',
              items: [{ name: 'Alitas Amazónicas x12', qty: 1, price: 28 }, { name: 'Chicha de Maíz Morado', qty: 2, price: 5 }],
              subtotal: 38,
              deliveryFee: 0,
              total: 38,
              status: 'Emitido'
            },
            {
              id: 'tk-4',
              number: 'TK-0035',
              created_at: new Date(Date.now() - 140 * 60000).toISOString(),
              customer: 'Fiorella Salazar Mori',
              type: 'delivery',
              payment: 'Plin',
              items: [{ name: 'Buchi Broaster Doble', qty: 2, price: 22 }],
              subtotal: 44,
              deliveryFee: 5,
              total: 49,
              status: 'Emitido'
            }
          ];
        }
      }
    }
    filterTickets();
  }

  function filterTickets() {
    const state = window.AdminState = window.AdminState || {};
    let tickets = [...(state.allTickets || [])];

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

    state.filteredTickets = tickets;
    
    // Actualizar métricas dinámicas con valores exactos
    const countEl = document.getElementById('ticket-metric-count');
    const totalEl = document.getElementById('ticket-metric-total');
    if (countEl) countEl.textContent = (state.allTickets || []).length.toString();
    if (totalEl) {
      const sum = (state.allTickets || []).reduce((acc, t) => acc + (Number(t.total) || 0), 0);
      totalEl.textContent = window.AdminUtils ? window.AdminUtils.formatSoles(sum) : `S/ ${sum.toFixed(2)}`;
    }

    renderTicketsTable();
  }

  function renderTicketsTable() {
    const tbody = document.getElementById('tickets-table-body');
    const cardsContainer = document.getElementById('tickets-cards-container');
    const state = window.AdminState = window.AdminState || {};
    const tickets = state.filteredTickets || [];

    if (tickets.length === 0) {
      const emptyHtml = `
        <div class="ticket-empty-state">
          <div class="ticket-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
          </div>
          <h4>No se encontraron tickets</h4>
          <p>No hay comprobantes que coincidan con los filtros seleccionados.</p>
        </div>
      `;
      if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 36px;">No se encontraron tickets con los filtros aplicados.</td></tr>`;
      if (cardsContainer) cardsContainer.innerHTML = emptyHtml;
      return;
    }

    // 1. Render para Desktop Table
    if (tbody) {
      tbody.innerHTML = tickets.map(t => {
        const typeBadge = t.type === 'delivery' 
          ? '<span class="badge badge-blue">🛵 Delivery</span>' 
          : (t.type === 'salon' ? '<span class="badge badge-purple">🍽️ Salón</span>' : '<span class="badge badge-amber">🛍️ Mostrador</span>');
        
        return `
          <tr>
            <td style="font-weight: 800; color: #ff8c00; font-family: monospace; font-size: 0.95rem;">${t.number}</td>
            <td style="font-size: 0.82rem; color: #94a3b8;">${new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td style="font-weight: 700; color: #f8fafc;">${window.AdminUtils.escapeHtml(t.customer || 'Cliente Mostrador')}</td>
            <td>${typeBadge}</td>
            <td style="color: #cbd5e1;">${t.payment || 'Efectivo'}</td>
            <td style="color: #94a3b8;">${(t.items || []).length} items</td>
            <td style="font-weight: 800; color: #10b981; font-size: 0.98rem;">${window.AdminUtils.formatSoles(t.total)}</td>
            <td><span class="badge badge-green">✓ ${t.status || 'Emitido'}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-secondary btn-sm" onclick="window.previewThermalTicket('${t.id}')" style="display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>Ver / Imprimir</span>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 2. Render para Mobile Cards
    if (cardsContainer) {
      cardsContainer.innerHTML = tickets.map(t => {
        const typeClass = t.type === 'delivery' ? 'type-delivery' : (t.type === 'salon' ? 'type-salon' : 'type-pickup');
        const typeLabel = t.type === 'delivery' ? '🛵 Delivery' : (t.type === 'salon' ? '🍽️ Salón' : '🛍️ Mostrador');
        const timeStr = new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
          <div class="ticket-mobile-card">
            <div class="ticket-card-header">
              <div class="ticket-number-badge">${t.number}</div>
              <div class="ticket-card-time">${timeStr}</div>
              <div class="ticket-card-status">✓ ${t.status || 'Emitido'}</div>
            </div>
            
            <div class="ticket-card-body">
              <div class="ticket-card-customer-row">
                <span class="ticket-card-customer">${window.AdminUtils.escapeHtml(t.customer || 'Cliente Mostrador')}</span>
                <span class="ticket-card-type ${typeClass}">${typeLabel}</span>
              </div>
              <div class="ticket-card-details-row">
                <span class="ticket-card-payment-badge">💳 ${t.payment || 'Efectivo'}</span>
                <span class="ticket-card-items-count">${(t.items || []).length} ${(t.items || []).length === 1 ? 'producto' : 'productos'}</span>
              </div>
            </div>

            <div class="ticket-card-footer">
              <div class="ticket-card-total-group">
                <span class="ticket-card-total-title">Total</span>
                <span class="ticket-card-total-amount">${window.AdminUtils.formatSoles(t.total)}</span>
              </div>
              <button type="button" class="btn-ticket-card-action" onclick="window.previewThermalTicket('${t.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>Imprimir 80mm</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function closeTicketViews() {
    const listSec = document.getElementById('ticket-list-section');
    const formSec = document.getElementById('ticket-form-page-section');
    const prevSec = document.getElementById('ticket-preview-page-section');

    if (formSec) formSec.style.display = 'none';
    if (prevSec) prevSec.style.display = 'none';
    if (listSec) listSec.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function previewThermalTicket(id) {
    const ticket = (window.AdminState.allTickets || []).find(t => t.id === id);
    if (!ticket) return;

    window.AdminState.activePreviewTicket = ticket;
    renderThermalReceiptHTML(ticket);

    const listSec = document.getElementById('ticket-list-section');
    const formSec = document.getElementById('ticket-form-page-section');
    const prevSec = document.getElementById('ticket-preview-page-section');
    const titleEl = document.getElementById('ticket-preview-page-title');

    if (titleEl) titleEl.textContent = `Ticket de Venta ${ticket.number || '#TK-0000'}`;

    if (listSec) listSec.style.display = 'none';
    if (formSec) formSec.style.display = 'none';
    if (prevSec) prevSec.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function previewThermalTicketFromOrder(orderId) {
    const order = (window.AdminState.allOrders || []).find(o => o.id === orderId);
    if (!order) return;

    const ticketLike = {
      number: `${order.orderNumber || order.id}`,
      created_at: order.created_at || new Date().toISOString(),
      customer: order.customer?.name || order.clientName || 'Cliente',
      type: order.type || 'delivery',
      payment: order.payment_method || 'Efectivo',
      items: (order.items || []).map(i => ({ name: i.name, qty: i.quantity || 1, price: i.price || 0 })),
      subtotal: (order.items || []).reduce((acc, cur) => acc + (cur.price || 0) * (cur.quantity || 1), 0),
      deliveryFee: order.deliveryFee || 0,
      total: order.total
    };

    if (typeof window.navigateToView === 'function') {
      window.navigateToView('ticket');
    }

    renderThermalReceiptHTML(ticketLike);

    const listSec = document.getElementById('ticket-list-section');
    const formSec = document.getElementById('ticket-form-page-section');
    const prevSec = document.getElementById('ticket-preview-page-section');
    const titleEl = document.getElementById('ticket-preview-page-title');

    if (titleEl) titleEl.textContent = `Ticket de Venta #${order.orderNumber || order.id}`;

    if (listSec) listSec.style.display = 'none';
    if (formSec) formSec.style.display = 'none';
    if (prevSec) prevSec.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderThermalReceiptHTML(t) {
    if (!t) return;
    const targets = document.querySelectorAll('#thermal-receipt-render-target, .thermal-ticket-render-zone');
    if (!targets || targets.length === 0) return;

    const dateObj = t.created_at ? new Date(t.created_at) : new Date();
    
    // Formato DD/MM/YYYY
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Formato hh:mm:ss p. m.
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' -> 12
    const formattedHours = String(hours).padStart(2, '0');
    const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

    const rawNum = t.number || t.orderNumber || (t.id ? t.id.replace('tk-', '').replace('order-', '') : '1132');
    let orderNumber = String(rawNum).trim();
    if (!orderNumber.startsWith('#')) {
      if (orderNumber.startsWith('TK-')) {
        orderNumber = `#${orderNumber.replace('TK-', '')}`;
      } else {
        orderNumber = `#${orderNumber}`;
      }
    }

    const customerName = t.customer || t.clientName || 'Cliente';
    const statusText = t.status || 'Pendiente';
    
    const items = t.items || [];
    let totalItemsCount = 0;
    let computedSubtotal = 0;

    items.forEach(item => {
      const q = Number(item.qty || item.quantity || 1);
      const pr = Number(item.price || 0);
      totalItemsCount += q;
      computedSubtotal += (q * pr);
    });

    const deliveryFee = Number(t.deliveryFee || 0);
    const finalTotal = t.total !== undefined ? Number(t.total) : (computedSubtotal + deliveryFee);

    const receiptHtml = `
      <div class="buchisapa-real-ticket">
        <!-- LOGO Y ENCABEZADO OFICIAL -->
        <div class="ticket-header-block">
          <div class="ticket-logo-wrapper">
            <img src="/imagenes/logo/logo-ticket-bn.png" alt="BuchiSapa" class="ticket-logo-img" onerror="this.onerror=null; this.src='/imagenes/logo/logo-buchisapa.png';">
          </div>
          <h2 class="ticket-brand-name">BUCHISAPA</h2>
          <p class="ticket-slogan">Sabor que te llena</p>
          <p class="ticket-description">Comida Amazónica, Broaster &amp;<br>Hamburguesas</p>
          <p class="ticket-ruc">RUC: 10757052569</p>
          <p class="ticket-address">
            Av. La Estrella con Calle 28 Julio<br>
            Esquina de la Posta<br>
            A 1 cdra. de Real Plaza Santa Clara<br>
            Tel: 943 312 024
          </p>
        </div>

        <div class="ticket-dashed-line"></div>

        <!-- TÍTULO DEL TICKET -->
        <div class="ticket-type-title">TICKET DE VENTA</div>

        <!-- METADATOS DEL PEDIDO -->
        <div class="ticket-meta-block">
          <div class="ticket-meta-row">
            <span class="ticket-meta-label">Pedido</span>
            <span class="ticket-meta-val">${orderNumber}</span>
          </div>
          <div class="ticket-meta-row">
            <span class="ticket-meta-label">Fecha</span>
            <span class="ticket-meta-val">${formattedDate}</span>
          </div>
          <div class="ticket-meta-row">
            <span class="ticket-meta-label">Hora</span>
            <span class="ticket-meta-val">${formattedTime}</span>
          </div>
          <div class="ticket-meta-row">
            <span class="ticket-meta-label">Cliente</span>
            <span class="ticket-meta-val">${window.AdminUtils.escapeHtml(customerName)}</span>
          </div>
          <div class="ticket-meta-row">
            <span class="ticket-meta-label">Estado</span>
            <span class="ticket-meta-val">${statusText}</span>
          </div>
        </div>

        <div class="ticket-dashed-line"></div>

        <!-- ITEMS / PRODUCTOS -->
        <div class="ticket-items-block">
          ${items.map(item => {
            const qty = Number(item.qty || item.quantity || 1);
            const unitPrice = Number(item.price || 0);
            const lineTotal = qty * unitPrice;
            return `
              <div class="ticket-item-row">
                <div class="ticket-item-title">${qty} ${window.AdminUtils.escapeHtml(item.name || 'Plato BuchiSapa')}</div>
                <div class="ticket-item-pricing">
                  <span class="ticket-item-unit">S/ ${unitPrice.toFixed(2)} c/u</span>
                  <span class="ticket-item-sum">S/ ${lineTotal.toFixed(2)}</span>
                </div>
                ${item.notes ? `<div class="ticket-item-notes">Nota: ${window.AdminUtils.escapeHtml(item.notes)}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div class="ticket-dashed-line"></div>

        <!-- TOTALES -->
        <div class="ticket-totals-block">
          <div class="ticket-totals-row">
            <span class="ticket-totals-label">Items</span>
            <span class="ticket-totals-val">${totalItemsCount}</span>
          </div>
          ${deliveryFee > 0 ? `
            <div class="ticket-totals-row">
              <span class="ticket-totals-label">Delivery</span>
              <span class="ticket-totals-val">S/ ${deliveryFee.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="ticket-totals-row ticket-grand-total-row">
            <span class="ticket-grand-label">TOTAL</span>
            <span class="ticket-grand-val">S/ ${finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <div class="ticket-dashed-line"></div>

        <!-- PIE DE PÁGINA -->
        <div class="ticket-footer-block">
          <p class="ticket-thanks-msg">Gracias por su compra</p>
          <p class="ticket-website">www.buchisapa.com</p>
        </div>
      </div>
    `;

    targets.forEach(el => {
      el.innerHTML = receiptHtml;
    });
  }

  function printActiveTicket() {
    const ticketTarget = document.getElementById('thermal-receipt-render-target');
    const ticketContent = ticketTarget ? ticketTarget.innerHTML : '';
    if (!ticketContent || ticketContent.trim() === '') {
      window.showToast('No hay ticket activo cargado para imprimir', 'warning');
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'width=420,height=700');
      if (!printWindow) {
        window.print();
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Ticket BuchiSapa</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0mm;
            }
            body {
              margin: 0;
              padding: 8px 10px;
              background: #fff;
              color: #000;
              font-family: 'Courier New', Courier, 'Lucida Console', monospace;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .buchisapa-real-ticket {
              width: 100%;
              max-width: 76mm;
              margin: 0 auto;
              font-size: 13px;
              line-height: 1.35;
            }
            .ticket-header-block {
              text-align: center;
              margin-bottom: 6px;
            }
            .ticket-logo-wrapper {
              display: flex;
              justify-content: center;
              margin-bottom: 6px;
            }
            .ticket-logo-img {
              width: 75px;
              height: 75px;
              object-fit: contain;
              filter: grayscale(100%) contrast(160%);
            }
            .ticket-brand-name {
              font-size: 17px;
              font-weight: 900;
              letter-spacing: 0.5px;
              margin: 4px 0 2px;
            }
            .ticket-slogan {
              font-size: 13px;
              margin: 2px 0;
            }
            .ticket-description {
              font-size: 12px;
              line-height: 1.3;
              margin: 3px 0;
            }
            .ticket-ruc {
              font-size: 13px;
              font-weight: 700;
              margin: 4px 0;
            }
            .ticket-address {
              font-size: 11.5px;
              line-height: 1.35;
              margin: 4px 0;
            }
            .ticket-dashed-line {
              border-top: 1.5px dashed #000;
              margin: 8px 0;
            }
            .ticket-type-title {
              text-align: center;
              font-size: 14px;
              font-weight: 900;
              letter-spacing: 0.8px;
              margin: 6px 0;
            }
            .ticket-meta-block {
              font-size: 12.5px;
              line-height: 1.4;
            }
            .ticket-meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .ticket-meta-label {
              color: #111;
            }
            .ticket-meta-val {
              font-weight: 700;
            }
            .ticket-items-block {
              margin: 4px 0;
            }
            .ticket-item-row {
              margin-bottom: 6px;
              font-size: 12.5px;
            }
            .ticket-item-title {
              font-weight: 700;
              line-height: 1.3;
            }
            .ticket-item-pricing {
              display: flex;
              justify-content: space-between;
              padding-left: 12px;
              font-size: 12px;
              margin-top: 1px;
            }
            .ticket-item-notes {
              font-size: 11px;
              font-style: italic;
              padding-left: 12px;
            }
            .ticket-totals-block {
              margin: 4px 0;
            }
            .ticket-totals-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              margin-bottom: 2px;
            }
            .ticket-grand-total-row {
              font-size: 16px;
              font-weight: 900;
              margin-top: 4px;
            }
            .ticket-footer-block {
              text-align: center;
              font-size: 12px;
              margin-top: 8px;
              line-height: 1.4;
            }
            .ticket-thanks-msg {
              margin: 4px 0 2px;
            }
            .ticket-website {
              font-weight: 700;
              margin: 2px 0 0;
            }
          </style>
        </head>
        <body>
          ${ticketContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 600);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.warn('Error al abrir ventana de impresión térmica, recurriendo a window.print()', err);
      window.print();
    }
  }

  function testThermalPrinter() {
    // Generar un ticket de prueba con el formato real oficial
    const testTicket = {
      number: '1132',
      created_at: new Date().toISOString(),
      customer: 'Cliente',
      type: 'salon',
      payment: 'Efectivo',
      items: [{ name: 'Encuentro', qty: 1, price: 13 }],
      subtotal: 13,
      deliveryFee: 0,
      total: 13,
      status: 'Pendiente'
    };
    renderThermalReceiptHTML(testTicket);
    printActiveTicket();
  }

  // =========================================================================
  // BASE DE DATOS DE CATEGORÍAS EN MAYÚSCULAS Y SIN EMOJIS
  // =========================================================================
  const DEFAULT_CATEGORIES = [
    { id: 'alitas', code: '1001', name: 'ALITAS' },
    { id: 'bebidas', code: '1002', name: 'BEBIDAS' },
    { id: 'broaster', code: '1003', name: 'BROASTER' },
    { id: 'hamburguesas', code: '1004', name: 'HAMBURGUESAS' },
    { id: 'infusiones', code: '1005', name: 'INFUSIONES' },
    { id: 'platos-amazonicos', code: '1006', name: 'PLATOS AMAZÓNICOS' },
    { id: 'refrescos', code: '1007', name: 'REFRESCOS' },
    { id: 'salchipapas', code: '1008', name: 'SALCHIPAPAS Y SALCHIBROASTERS' }
  ];

  // Salsas oficiales traídas de la página de clientes (personalizador.js)
  const ALL_CLIENT_SAUCES = [
    { id: 'mayonesa', name: 'Mayonesa', default: true },
    { id: 'mostaza', name: 'Mostaza', default: true },
    { id: 'ketchup', name: 'Ketchup', default: true },
    { id: 'aji-rocoto', name: 'Ají de Rocoto', default: true },
    { id: 'tartara', name: 'Tártara', default: false },
    { id: 'aji-charapita', name: 'Ají Charapita', default: false },
    { id: 'acevichada', name: 'Acevichada', default: false },
    { id: 'salsa-bbq', name: 'Salsa BBQ', default: false },
    { id: 'salsa-golf', name: 'Salsa Golf', default: false },
    { id: 'ocopa', name: 'Ocopa', default: false },
    { id: 'aceituna', name: 'Aceituna', default: false },
    { id: 'vinagreta', name: 'Vinagreta', default: false }
  ];

  // Acompañamientos oficiales traídos exactamente de la página de clientes (personalizador.js)
  function getClientProductAccompaniments(product) {
    if (!product) return [];
    const name = (product.name || '').toLowerCase().trim();
    const cat = (product.category_id || product.category || '').toLowerCase().trim();

    // 6. BEBIDAS / 7. REFRESCOS / 8. INFUSIONES (No llevan acompañamiento)
    if (
      cat.includes('bebida') ||
      cat.includes('refresco') ||
      cat.includes('infusion') ||
      cat.includes('infusiones') ||
      name.includes('inca kola') ||
      name.includes('coca cola') ||
      name.includes('fanta') ||
      name.includes('pepsi') ||
      name.includes('agua mineral') ||
      name.includes('san mateo') ||
      name.includes('aguajina') ||
      name.includes('maracuyá') ||
      name.includes('maracuya') ||
      name.includes('camu camu') ||
      name.includes('camu') ||
      name.includes('chicha') ||
      (name.includes('cocona') && (cat.includes('refresco') || (!name.includes('salsa') && !name.includes('ensalada') && !name.includes('ají')))) ||
      name.includes('anís') ||
      name.includes('anis') ||
      name.includes('té') ||
      name.includes('te ') ||
      name.includes('café') ||
      name.includes('cafe')
    ) {
      return [];
    }

    // 1. PLATOS AMAZÓNICOS
    if (name.includes('patacones con chorizo') || (name.includes('patacon') && name.includes('chorizo'))) {
      return [
        'Patacones de plátano verde fritos',
        'Chorizo frito en bolitas',
        'Salsa / Crema'
      ];
    }
    if (name.includes('tacacho')) {
      return [
        'Tacacho con plátano asado',
        'Cecina ahumada de la selva',
        'Chorizo amazónico',
        'Plátano maduro frito',
        'Sarza criolla / ají de cocona'
      ];
    }
    if (name.includes('juane') || name.includes('juanes')) {
      return [
        'Juane de arroz con gallina',
        'Huevo duro',
        'Aceituna de botija',
        'Plátano maduro frito',
        'Ensalada de cocona / ají de cocona'
      ];
    }
    if (name.includes('chilcano') || name.includes('carachama')) {
      return [
        'Carachama / pescado del día entero',
        'Yuca sancochada',
        'Caldo chilcano'
      ];
    }
    if (name.includes('palometa')) {
      return [
        'Palometa frita entera',
        'Arroz blanco',
        'Plátano maduro frito',
        'Salsa criolla / ají'
      ];
    }
    if (name.includes('caldo amazónico') || name.includes('caldo amazonico')) {
      return [
        'Caldo verde amazónico con pescado/pollo',
        'Culantro y hierbas selváticas',
        'Yuca sancochada'
      ];
    }
    if (name.includes('chaufa') || (name.includes('chaufa') && cat.includes('amazon'))) {
      return [
        'Arroz chaufa con cecina',
        'Chorizo amazónico en trozos',
        'Huevo salteado'
      ];
    }

    // 2. HAMBURGUESAS
    if (name.includes('choripan') || name.includes('choripán')) {
      return [
        'Papas fritas',
        'Chorizo parrillero',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('hawaiana carne')) {
      return [
        'Papa frita',
        'Carne artesanal',
        'Huevo frito',
        'Jamón',
        'Queso fundido',
        'Piña a la plancha',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('hawaiana pollo')) {
      return [
        'Papa frita',
        'Pollo crispy',
        'Huevo frito',
        'Jamón',
        'Queso fundido',
        'Piña a la plancha',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('deshilachado')) {
      return [
        'Papas fritas',
        'Pollo deshilachado con mayonesa casera',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('filete')) {
      return [
        'Papas fritas',
        'Filete de pollo a la plancha',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('cheese') || name.includes('cheeseburger')) {
      return [
        'Hamburguesa de casa',
        'Queso cheddar'
      ];
    }
    if (name.includes('bacon')) {
      return [
        'Hamburguesa artesanal',
        'Papas fritas',
        'Tocino crocante',
        'Queso cheddar'
      ];
    }
    if (name.includes('suprema')) {
      return [
        'Hamburguesa artesanal',
        'Tocino crocante',
        'Queso fundido',
        'Huevo frito',
        'Jamón',
        'Papas fritas',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('royal a lo pobre')) {
      return [
        'Papa frita',
        'Carne artesanal',
        'Huevo frito',
        'Jamón',
        'Queso fundido',
        'Plátano maduro frito',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('royal')) {
      return [
        'Carne casera / Pollo deshilachado / Hamburguesa de pollo / Hamburguesa de Chorizo',
        'Papas fritas',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('hamburguesa a lo pobre') || (name.includes('a lo pobre') && cat.includes('hamburguesa'))) {
      return [
        'Hamburguesa artesanal',
        'Huevo frito',
        'Queso fundido',
        'Jamón',
        'Plátano maduro frito',
        'Papas fritas'
      ];
    }
    if (name.includes('clásica') || name.includes('clasica') || cat.includes('hamburguesa')) {
      return [
        'Hamburguesa (carne o pollo)',
        'Papas fritas',
        'Ensalada fresca',
        'Crema'
      ];
    }

    // 3. BROASTER (Todos con: Papa + ensalada + arroz + cremas)
    if (cat.includes('broaster') || (name.includes('broaster') && !name.includes('salchi'))) {
      return [
        'Papa frita',
        'Ensalada fresca',
        'Arroz blanco',
        'Cremas de la casa'
      ];
    }

    // 4. SALCHIPAPAS Y SALCHIBROASTERS (Todos con: Papas + ensalada + cremas)
    if (name.includes('salchipapa a lo pobre')) {
      return [
        'Papas fritas',
        'Salchicha en rodajas',
        'Huevo frito',
        'Plátano maduro frito',
        'Ensalada fresca',
        'Cremas'
      ];
    }
    if (name.includes('salchichorizo')) {
      return [
        'Papas fritas',
        'Chorizo amazónico en rodajas',
        'Ensalada fresca',
        'Cremas'
      ];
    }
    if (name.includes('salchibroaster')) {
      return [
        'Papas fritas',
        'Presa de pollo broaster crujiente',
        'Ensalada fresca',
        'Cremas'
      ];
    }
    if (name.includes('salchipapa') || cat.includes('salchipapa')) {
      return [
        'Papas fritas',
        'Salchicha en rodajas',
        'Ensalada fresca',
        'Cremas'
      ];
    }

    // 5. ALITAS (Todos con: + 5 alitas + papas)
    if (cat.includes('alita') || name.includes('alita') || name.includes('bbq') || name.includes('acevichada')) {
      return [
        '5 alitas crocantes',
        'Papas fritas'
      ];
    }

    // Fallback general
    return [
      'Porción principal recién preparada',
      'Papas o guarnición del plato',
      'Ensalada fresca'
    ];
  }

  // Estado del Carrito / Items Agregados al Ticket
  let activeTicketItems = [];

  function getProductCode(product, index = 0) {
    if (!product) return '100001';
    if (product.code && /^\d{6}$/.test(String(product.code))) return String(product.code);
    if (product.id && /^\d{6}$/.test(String(product.id))) return String(product.id);
    const prods = window.AdminState?.allProducts || [];
    const pos = prods.findIndex(p => p.id === product.id);
    const idx = pos >= 0 ? pos : index;
    return String(100001 + idx).padStart(6, '0');
  }

  function getCategoryCode(catId) {
    if (!catId) return '1001';
    const key = String(catId).toLowerCase().trim();
    const found = DEFAULT_CATEGORIES.find(c => c.id === key || c.name.toLowerCase() === key);
    if (found) return found.code;
    return '1001';
  }

  function getCategoryName(catId) {
    if (!catId) return 'PLATOS';
    const key = String(catId).toLowerCase().trim();
    const found = DEFAULT_CATEGORIES.find(c => c.id === key || c.name.toLowerCase() === key);
    if (found) return found.name;
    return String(catId).replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim().toUpperCase();
  }

  function populateTicketFormCategories() {
    const catSelect = document.getElementById('ticket-form-category-select');
    if (!catSelect) return;

    const allProds = window.AdminState.allProducts || window.AdminState.defaultSignatureProducts || [];

    const existingCats = new Set();
    allProds.forEach(p => {
      if (p.category_id) existingCats.add(p.category_id.toLowerCase());
      else if (p.category) existingCats.add(p.category.toLowerCase());
    });

    let catHtml = '';
    DEFAULT_CATEGORIES.forEach(cat => {
      catHtml += `<option value="${cat.id}">${cat.name}</option>`;
    });

    // Agregar categorías personalizadas adicionales en mayúsculas
    existingCats.forEach(catKey => {
      const isDefault = DEFAULT_CATEGORIES.some(c => c.id === catKey);
      if (!isDefault) {
        const cleanName = getCategoryName(catKey);
        catHtml += `<option value="${catKey}">${cleanName}</option>`;
      }
    });

    catSelect.innerHTML = catHtml;
    const initialCat = catSelect.value || 'platos-amazonicos';
    onTicketCategoryChange(initialCat);
  }

  function onTicketCategoryChange(categoryId) {
    const gridContainer = document.getElementById('ticket-products-grid-container');
    if (!gridContainer) return;

    const allProds = window.AdminState.allProducts || window.AdminState.defaultSignatureProducts || [];

    let filtered = allProds.filter(p => {
      if (!categoryId) return true;
      const cat = (p.category_id || p.category || '').toLowerCase();
      return cat === categoryId.toLowerCase();
    });

    if (filtered.length === 0) {
      filtered = allProds;
    }

    gridContainer.innerHTML = filtered.map((prod, index) => {
      const prodCode = getProductCode(prod, index);
      const catCode = getCategoryCode(prod.category_id || prod.category || categoryId);
      const catName = getCategoryName(prod.category_id || prod.category || categoryId);
      const imgUrl = prod.image_url || prod.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80';
      const priceFormatted = parseFloat(prod.price || 0).toFixed(2);

      return `
        <div class="ticket-prod-card" id="ticket-prod-card-${prod.id}" onclick="window.addTicketItem('${prod.id}')">
          <div class="ticket-prod-card-img-wrap">
            <span class="ticket-prod-id-badge">ID: ${prodCode}</span>
            <img src="${imgUrl}" alt="${window.AdminUtils.escapeHtml(prod.name)}" class="ticket-prod-card-img" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'">
          </div>
          <div class="ticket-prod-card-body">
            <div class="ticket-prod-cat-tag">
              <span class="cat-code-box">[${catCode}]</span>
              <span>${catName}</span>
            </div>
            <h4 class="ticket-prod-card-title">${window.AdminUtils.escapeHtml(prod.name)}</h4>
            <div class="ticket-prod-card-footer">
              <span class="ticket-prod-card-price">S/ ${priceFormatted}</span>
              <button type="button" class="btn-ticket-add-prod" onclick="event.stopPropagation(); window.addTicketItem('${prod.id}')" title="Agregar producto">
                <span class="btn-add-icon">+</span>
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function addTicketItem(prodId) {
    const allProds = window.AdminState.allProducts || window.AdminState.defaultSignatureProducts || [];
    const prod = allProds.find(p => p.id === prodId || String(p.id) === String(prodId));
    if (!prod) return;

    const existingIndex = activeTicketItems.findIndex(it => it.prodId === prod.id);
    if (existingIndex >= 0) {
      activeTicketItems[existingIndex].qty += 1;
    } else {
      const defaultSauces = ALL_CLIENT_SAUCES.filter(s => s.default).map(s => s.name);
      const isDrink = (prod.category_id || prod.category || '').toLowerCase().includes('bebida') ||
                      (prod.category_id || prod.category || '').toLowerCase().includes('refresco') ||
                      (prod.category_id || prod.category || '').toLowerCase().includes('infusion');
      const availableAccompaniments = getClientProductAccompaniments(prod);

      activeTicketItems.push({
        id: `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        prodId: prod.id,
        name: prod.name,
        price: parseFloat(prod.price || 0),
        qty: 1,
        isDrink: isDrink,
        availableSauces: isDrink ? [] : ALL_CLIENT_SAUCES.map(s => s.name),
        selectedSauces: isDrink ? [] : defaultSauces,
        availableSides: availableAccompaniments,
        selectedSides: [...availableAccompaniments],
        notes: ''
      });
    }

    renderTicketCartItems();
    updateTicketFormTotal();
    if (window.showToast) {
      window.showToast(`"${prod.name}" agregado al ticket`, 'success');
    }
  }

  function renderTicketCartItems() {
    const container = document.getElementById('ticket-items-list-container');
    const badge = document.getElementById('ticket-items-count-badge');
    if (!container) return;

    if (badge) {
      const totalQty = activeTicketItems.reduce((sum, it) => sum + (it.qty || 1), 0);
      badge.textContent = `${totalQty} ${totalQty === 1 ? 'producto' : 'productos'}`;
    }

    if (activeTicketItems.length === 0) {
      container.innerHTML = `
        <div class="ticket-cart-empty-placeholder">
          <p style="margin: 0; font-weight: 700; color: #cbd5e1; font-size: 0.95rem;">No hay productos agregados al ticket aún.</p>
          <p style="margin: 6px 0 0 0; font-size: 0.8rem; color: #94a3b8;">Selecciona productos de la lista superior para armar el comprobante.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activeTicketItems.map((item, index) => {
      const subtotal = (item.price * item.qty).toFixed(2);

      const sidesHtml = (item.availableSides && item.availableSides.length > 0) ? `
        <div class="ticket-cart-item-custom-section">
          <div class="ticket-cart-custom-header">
            <span class="ticket-cart-custom-title">Acompañamientos e Ingredientes:</span>
          </div>
          <div class="ticket-items-toggle-list">
            ${item.availableSides.map(sideName => {
              const isChecked = item.selectedSides && item.selectedSides.includes(sideName);
              return `
                <div class="ticket-item-toggle-card ${isChecked ? 'active' : ''}" onclick="window.toggleTicketItemSide(${index}, '${window.AdminUtils.escapeHtml(sideName)}')">
                  <div class="ticket-item-left">
                    <div class="ticket-item-checkbox">
                      <span class="ticket-item-checkbox-check">✓</span>
                    </div>
                    <span class="ticket-item-name">${window.AdminUtils.escapeHtml(sideName)}</span>
                  </div>
                  <span class="ticket-item-badge">${isChecked ? 'Incluido' : 'Sin esto'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : '';

      const saucesHtml = (!item.isDrink && item.availableSauces && item.availableSauces.length > 0) ? `
        <div class="ticket-cart-item-custom-section" style="margin-top: 8px;">
          <div class="ticket-cart-custom-header">
            <span class="ticket-cart-custom-title">Cremas y Salsas de la Casa:</span>
          </div>
          <div class="ticket-items-toggle-list">
            ${item.availableSauces.map(sName => {
              const isChecked = item.selectedSauces && item.selectedSauces.includes(sName);
              return `
                <div class="ticket-item-toggle-card ${isChecked ? 'active' : ''}" onclick="window.toggleTicketItemSauce(${index}, '${sName}')">
                  <div class="ticket-item-left">
                    <div class="ticket-item-checkbox">
                      <span class="ticket-item-checkbox-check">✓</span>
                    </div>
                    <span class="ticket-item-name">${sName}</span>
                  </div>
                  <span class="ticket-item-badge">${isChecked ? 'Incluido' : 'Sin esto'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : '';

      return `
        <div class="ticket-cart-item-card" id="ticket-cart-item-${index}">
          <div class="ticket-cart-item-header">
            <div class="ticket-cart-item-info">
              <span class="ticket-cart-item-name">${window.AdminUtils.escapeHtml(item.name)}</span>
              <span class="ticket-cart-item-price-unit">S/ ${item.price.toFixed(2)} c/u</span>
            </div>
            <div class="ticket-cart-item-controls">
              <button type="button" class="ticket-stepper-btn" onclick="window.updateTicketItemQty(${index}, -1)">-</button>
              <span class="ticket-stepper-val">${item.qty}</span>
              <button type="button" class="ticket-stepper-btn" onclick="window.updateTicketItemQty(${index}, 1)">+</button>
              <span class="ticket-cart-item-subtotal">S/ ${subtotal}</span>
              <button type="button" class="btn-remove-ticket-item" title="Eliminar producto" onclick="window.removeTicketItem(${index})">
                🗑️
              </button>
            </div>
          </div>
          ${sidesHtml}
          ${saucesHtml}
        </div>
      `;
    }).join('');
  }

  function updateTicketItemQty(index, delta) {
    if (!activeTicketItems[index]) return;
    activeTicketItems[index].qty += delta;
    if (activeTicketItems[index].qty <= 0) {
      activeTicketItems.splice(index, 1);
    }
    renderTicketCartItems();
    updateTicketFormTotal();
  }

  function removeTicketItem(index) {
    if (!activeTicketItems[index]) return;
    const removedName = activeTicketItems[index].name;
    activeTicketItems.splice(index, 1);
    renderTicketCartItems();
    updateTicketFormTotal();
    if (window.showToast) {
      window.showToast(`"${removedName}" eliminado del ticket`, 'info');
    }
  }

  function toggleTicketItemSauce(index, sauceName) {
    if (!activeTicketItems[index]) return;
    const item = activeTicketItems[index];
    item.selectedSauces = item.selectedSauces || [];
    const pos = item.selectedSauces.indexOf(sauceName);
    if (pos >= 0) {
      item.selectedSauces.splice(pos, 1);
    } else {
      item.selectedSauces.push(sauceName);
    }
    renderTicketCartItems();
  }

  function toggleTicketItemSide(index, sideName) {
    if (!activeTicketItems[index]) return;
    const item = activeTicketItems[index];
    item.selectedSides = item.selectedSides || [];
    const pos = item.selectedSides.indexOf(sideName);
    if (pos >= 0) {
      item.selectedSides.splice(pos, 1);
    } else {
      item.selectedSides.push(sideName);
    }
    renderTicketCartItems();
  }

  function updateTicketFormTotal() {
    const type = document.getElementById('ticket-form-type')?.value || 'salon';
    const deliveryInput = document.getElementById('ticket-form-delivery-fee');
    const deliveryFee = type === 'delivery' ? (parseFloat(deliveryInput?.value) || 0) : 0;

    let subtotal = 0;
    activeTicketItems.forEach(it => {
      subtotal += (it.price || 0) * (it.qty || 1);
    });

    const grandTotal = subtotal + deliveryFee;
    const display = document.getElementById('ticket-form-total-display');
    if (display) {
      display.textContent = `S/ ${grandTotal.toFixed(2)}`;
    }
  }

  function openNewTicketModal() {
    const listSec = document.getElementById('ticket-list-section');
    const formSec = document.getElementById('ticket-form-page-section');
    const prevSec = document.getElementById('ticket-preview-page-section');

    // Inicializar categorías, carrito y tipo de atención por defecto (Salón)
    activeTicketItems = [];
    selectTicketFormType('salon');
    populateTicketFormCategories();
    renderTicketCartItems();

    if (listSec) listSec.style.display = 'none';
    if (prevSec) prevSec.style.display = 'none';
    if (formSec) formSec.style.display = 'block';

    updateTicketFormTotal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNewTicketSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (activeTicketItems.length === 0) {
      window.showToast('Por favor agrega al menos un producto al ticket', 'warning');
      return;
    }

    const customer = document.getElementById('ticket-form-customer')?.value.trim() || 'Cliente';
    const type = document.getElementById('ticket-form-type')?.value || 'salon';
    const payment = document.getElementById('ticket-form-payment')?.value || 'Efectivo';
    const generalNote = document.getElementById('ticket-form-notes')?.value.trim() || '';

    const deliveryInput = document.getElementById('ticket-form-delivery-fee');
    const deliveryFee = type === 'delivery' ? (parseFloat(deliveryInput?.value) || 0) : 0;

    let subtotal = 0;
    const itemsFormatted = activeTicketItems.map(it => {
      const itemSubtotal = (it.price || 0) * (it.qty || 1);
      subtotal += itemSubtotal;
      return {
        name: it.name,
        qty: it.qty || 1,
        price: it.price || 0,
        sauces: it.selectedSauces || [],
        sides: it.selectedSides || [],
        notes: it.notes || ''
      };
    });

    const count = (window.AdminState.allTickets || []).length + 1130;
    const newNum = `#${count}`;

    const newTicket = {
      id: `tk-${Date.now()}`,
      number: newNum,
      created_at: new Date().toISOString(),
      customer: customer,
      type: type,
      payment: payment,
      items: itemsFormatted,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: subtotal + deliveryFee,
      notes: generalNote,
      status: 'Pendiente'
    };

    window.AdminState.allTickets = window.AdminState.allTickets || [];
    window.AdminState.allTickets.unshift(newTicket);

    filterTickets();
    previewThermalTicket(newTicket.id);
    window.showToast(`Ticket ${newNum} emitido con éxito. Listo para imprimir.`, 'success');
  }

  function toggleCustomDropdown(dropdownId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const target = document.getElementById(dropdownId);
    if (!target) return;

    const isCurrentlyOpen = target.classList.contains('is-open');

    // Close any other open dropdown first
    document.querySelectorAll('.custom-dropdown-container.is-open').forEach(d => {
      if (d !== target) d.classList.remove('is-open');
    });

    if (isCurrentlyOpen) {
      target.classList.remove('is-open');
    } else {
      target.classList.add('is-open');
    }
  }

  function selectCustomDropdownOption(category, value, icon, labelText) {
    if (category === 'type') {
      const input = document.getElementById('ticket-filter-type');
      if (input) input.value = value;
      const iconEl = document.getElementById('type-dropdown-current-icon');
      const textEl = document.getElementById('type-dropdown-current-text');
      if (iconEl) iconEl.textContent = icon;
      if (textEl) textEl.textContent = labelText;

      const items = document.querySelectorAll('#dropdown-ticket-type .custom-dropdown-item');
      items.forEach(it => {
        if (it.getAttribute('data-value') === value) {
          it.classList.add('is-selected');
        } else {
          it.classList.remove('is-selected');
        }
      });
      const container = document.getElementById('dropdown-ticket-type');
      if (container) container.classList.remove('is-open');

    } else if (category === 'payment') {
      const input = document.getElementById('ticket-filter-payment');
      if (input) input.value = value;
      const iconEl = document.getElementById('payment-dropdown-current-icon');
      const textEl = document.getElementById('payment-dropdown-current-text');
      if (iconEl) iconEl.textContent = icon;
      if (textEl) textEl.textContent = labelText;

      const items = document.querySelectorAll('#dropdown-ticket-payment .custom-dropdown-item');
      items.forEach(it => {
        if (it.getAttribute('data-value') === value) {
          it.classList.add('is-selected');
        } else {
          it.classList.remove('is-selected');
        }
      });
      const container = document.getElementById('dropdown-ticket-payment');
      if (container) container.classList.remove('is-open');
    }

    filterTickets();
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown-container')) {
      document.querySelectorAll('.custom-dropdown-container.is-open').forEach(d => {
        d.classList.remove('is-open');
      });
    }
  });

  function setTicketChipFilter(category, value, btnEl) {
    if (category === 'type') {
      const input = document.getElementById('ticket-filter-type');
      if (input) input.value = value;
    } else if (category === 'payment') {
      const input = document.getElementById('ticket-filter-payment');
      if (input) input.value = value;
    }
    filterTickets();
  }

  function selectTicketFormType(type, cardEl) {
    const input = document.getElementById('ticket-form-type');
    if (input) input.value = type;
    const cards = document.querySelectorAll('#ticket-form-type-selector .ticket-visual-card');
    cards.forEach(c => c.classList.remove('is-selected'));
    if (cardEl) {
      cardEl.classList.add('is-selected');
    } else {
      const target = document.querySelector(`#ticket-form-type-selector .ticket-visual-card[data-value="${type}"]`);
      if (target) target.classList.add('is-selected');
    }

    const deliveryGroup = document.getElementById('ticket-form-delivery-fee-group');
    if (deliveryGroup) {
      deliveryGroup.style.display = (type === 'delivery') ? 'block' : 'none';
    }

    const notesGroup = document.getElementById('ticket-form-notes-group');
    if (notesGroup) {
      notesGroup.style.display = (type === 'delivery') ? 'block' : 'none';
    }

    updateTicketFormTotal();
  }

  function selectTicketFormPayment(payment, badgeEl) {
    const input = document.getElementById('ticket-form-payment');
    if (input) input.value = payment;
    const badges = document.querySelectorAll('#ticket-form-payment-selector .ticket-payment-badge');
    badges.forEach(b => b.classList.remove('is-selected'));
    if (badgeEl) {
      badgeEl.classList.add('is-selected');
    } else {
      const target = document.querySelector(`#ticket-form-payment-selector .ticket-payment-badge[data-value="${payment}"]`);
      if (target) target.classList.add('is-selected');
    }
  }

  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('new-ticket-form');
    if (form) {
      form.addEventListener('submit', handleNewTicketSubmit);
    }
    const printBtns = document.querySelectorAll('#btn-print-active-ticket, .btn-print-active-ticket-action');
    printBtns.forEach(btn => {
      btn.addEventListener('click', printActiveTicket);
    });
  });

  // Bindings
  window.fetchTickets = fetchTickets;
  window.filterTickets = filterTickets;
  window.renderTicketsTable = renderTicketsTable;
  window.previewThermalTicket = previewThermalTicket;
  window.previewThermalTicketFromOrder = previewThermalTicketFromOrder;
  window.renderThermalReceiptHTML = renderThermalReceiptHTML;
  window.printActiveTicket = printActiveTicket;
  window.testThermalPrinter = testThermalPrinter;
  window.openNewTicketModal = openNewTicketModal;
  window.closeTicketViews = closeTicketViews;
  window.handleNewTicketSubmit = handleNewTicketSubmit;
  window.setTicketChipFilter = setTicketChipFilter;
  window.selectTicketFormType = selectTicketFormType;
  window.selectTicketFormPayment = selectTicketFormPayment;
  window.toggleCustomDropdown = toggleCustomDropdown;
  window.selectCustomDropdownOption = selectCustomDropdownOption;
  window.updateTicketFormTotal = updateTicketFormTotal;
  window.onTicketCategoryChange = onTicketCategoryChange;
  window.addTicketItem = addTicketItem;
  window.renderTicketCartItems = renderTicketCartItems;
  window.updateTicketItemQty = updateTicketItemQty;
  window.removeTicketItem = removeTicketItem;
  window.toggleTicketItemSauce = toggleTicketItemSauce;
  window.toggleTicketItemSide = toggleTicketItemSide;

})();

