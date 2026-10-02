/**
 * BUCHISAPA ADMIN - TICKETS & THERMAL PRINTER MODULE
 * Layer: /admin/js/modules/tickets.js
 */

(function () {
  'use strict';

  function formatTicketNumber(numOrStr) {
    if (!numOrStr) return 'TK00001';
    let str = String(numOrStr).trim();
    if (str.toUpperCase().startsWith('TK')) {
      const clean = str.replace(/^tk-?/i, '');
      const digits = clean.replace(/\D/g, '');
      if (digits) {
        return `TK${digits.padStart(5, '0')}`;
      }
      return `TK${clean}`;
    }
    if (str.startsWith('#')) {
      const clean = str.replace(/^#/, '');
      const digits = clean.replace(/\D/g, '');
      if (digits) {
        return `TK${digits.padStart(5, '0')}`;
      }
      return `TK${clean}`;
    }
    const digits = str.replace(/\D/g, '');
    if (digits) {
      return `TK${digits.padStart(5, '0')}`;
    }
    return `TK${str}`;
  }

  async function fetchTickets() {
    const state = window.AdminState = window.AdminState || {};
    try {
      if (window.AdminApi && typeof window.AdminApi.getTickets === 'function') {
        const data = await window.AdminApi.getTickets();
        state.allTickets = Array.isArray(data) ? data : [];
      } else {
        state.allTickets = [];
      }
    } catch (e) {
      console.warn('Error fetching tickets:', e);
      if (!state.allTickets) {
        state.allTickets = [];
      }
    }
    filterTickets();
  }

  async function deleteTicket(ticketId) {
    if (!ticketId) return;
    const state = window.AdminState = window.AdminState || {};
    const targetTicket = (state.allTickets || []).find(t => 
      t.id === ticketId || 
      t.id === `tk-${ticketId}` || 
      String(t.orderNumber) === String(ticketId) ||
      t.number === ticketId
    );
    
    const num = targetTicket ? formatTicketNumber(targetTicket.number || targetTicket.orderNumber) : formatTicketNumber(ticketId);
    const rawId = String(ticketId).replace(/^tk-/, '').replace(/^ord-/, '');
    
    // Inmediatamente filtrar del estado local para respuesta instantánea (0ms)
    state.allTickets = (state.allTickets || []).filter(t => 
      t.id !== ticketId && 
      t.id !== `tk-${ticketId}` && 
      t.id !== rawId && 
      t.id !== `tk-${rawId}` &&
      t.orderId !== rawId && 
      t.orderId !== ticketId &&
      String(t.orderNumber) !== String(rawId) &&
      String(t.orderNumber) !== String(ticketId) &&
      t.number !== ticketId &&
      t.number !== num &&
      formatTicketNumber(t.number || t.orderNumber) !== num
    );

    state.allOrders = (state.allOrders || []).filter(o => 
      o.id !== ticketId && 
      o.id !== `tk-${ticketId}` && 
      o.id !== rawId && 
      o.id !== `ord-${rawId}` &&
      o.id !== `ord-${ticketId}` &&
      String(o.orderNumber) !== String(rawId) &&
      String(o.orderNumber) !== String(ticketId) &&
      formatTicketNumber(o.orderNumber) !== num
    );

    if (state.allTickets.length === 0) {
      localStorage.setItem('buchisapa_order_seq', '0');
    }

    filterTickets();

    // Actualizar pedidos y cocina si las funciones existen
    if (typeof window.renderAllOrders === 'function') {
      window.renderAllOrders();
    }
    if (typeof window.updateMetricsAndViews === 'function') {
      window.updateMetricsAndViews();
    }

    // Sincronizar en segundo plano con el servidor
    try {
      if (window.AdminApi && typeof window.AdminApi.deleteTicket === 'function') {
        await window.AdminApi.deleteTicket(ticketId);
      } else {
        await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' }).catch(() => {});
      }
      if (window.AdminApi && typeof window.AdminApi.deleteOrder === 'function') {
        await window.AdminApi.deleteOrder(rawId);
      } else {
        await fetch(`/api/orders/${rawId}`, { method: 'DELETE' }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error deleting ticket from API:', e);
    }

    if (window.AdminUtils && typeof window.AdminUtils.showToast === 'function') {
      window.AdminUtils.showToast(`🗑️ Pedido ${num} eliminado correctamente`, 'success');
    } else if (window.showToast) {
      window.showToast(`🗑️ Pedido ${num} eliminado correctamente`, 'success');
    }
  }

  async function deleteActivePreviewTicket() {
    if (!currentActivePreviewTicket) return;
    const ticketId = currentActivePreviewTicket.id;
    await deleteTicket(ticketId);
    closeTicketViews();
  }

  async function clearAllTicketsPrompt() {
    if (!confirm('¿Deseas eliminar TODOS los tickets y dejar el historial completamente en 0?')) return;
    const state = window.AdminState = window.AdminState || {};
    state.allTickets = [];
    state.allOrders = [];
    localStorage.setItem('buchisapa_order_seq', '0');
    filterTickets();
    
    try {
      if (window.AdminApi && typeof window.AdminApi.clearAllTickets === 'function') {
        await window.AdminApi.clearAllTickets();
      }
    } catch (e) {
      console.warn('Error clearing tickets from API:', e);
    }
    
    if (window.showToast) {
      window.showToast('Historial restablecido a 0 tickets', 'info');
    }
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
          <h4>No hay tickets registrados</h4>
          <p>Los nuevos pedidos emitidos iniciarán con la numeración correlativa desde 00001.</p>
        </div>
      `;
      if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 36px;">No hay tickets registrados. Inicia emitiendo uno nuevo.</td></tr>`;
      if (cardsContainer) cardsContainer.innerHTML = emptyHtml;
      return;
    }

    // 1. Render para Desktop Table
    if (tbody) {
      tbody.innerHTML = tickets.map(t => {
        const typeBadge = t.type === 'delivery' 
          ? '<span class="badge badge-blue">🛵 Delivery</span>' 
          : (t.type === 'salon' ? '<span class="badge badge-purple">🍽️ Salón</span>' : '<span class="badge badge-amber">🛍️ Mostrador</span>');
        
        const numFormatted = formatTicketNumber(t.number || t.orderNumber);
        const phoneVal = t.phone || t.customerPhone || '';
        const cleanPhone = phoneVal.replace(/\D/g, '');
        const waLink = cleanPhone ? `https://wa.me/51${cleanPhone.length === 9 ? cleanPhone : cleanPhone}?text=${encodeURIComponent('Hola ' + (t.customer || 'Cliente') + ', te saludamos de BuchiSapa sobre tu pedido ' + numFormatted + '.')}` : '';

        return `
          <tr>
            <td style="font-weight: 800; color: #ff8c00; font-family: monospace; font-size: 0.95rem;">${numFormatted}</td>
            <td style="font-size: 0.82rem; color: #94a3b8;">${new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-weight: 700; color: #f8fafc;">${window.AdminUtils.escapeHtml(t.customer || 'Cliente Mostrador')}</span>
                ${cleanPhone ? `
                  <a href="${waLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; color: #4ade80; font-size: 0.78rem; font-weight: 700; text-decoration: none; width: fit-content;" title="Abrir WhatsApp para coordinar entrega">
                    <span style="font-size: 0.9rem;">📱</span>
                    <span>${window.AdminUtils.escapeHtml(phoneVal)}</span>
                    <span style="font-size: 0.72rem; background: rgba(34,197,94,0.2); padding: 1px 4px; border-radius: 4px;">WhatsApp</span>
                  </a>
                ` : ''}
              </div>
            </td>
            <td>${typeBadge}</td>
            <td style="color: #cbd5e1;">${t.payment || 'Efectivo'}</td>
            <td style="color: #94a3b8;">${(t.items || []).length} items</td>
            <td style="font-weight: 800; color: #10b981; font-size: 0.98rem;">${window.AdminUtils.formatSoles(t.total)}</td>
            <td><span class="badge badge-green">✓ ${t.status || 'Emitido'}</span></td>
            <td style="text-align: right;">
              <div style="display: inline-flex; gap: 8px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
                ${cleanPhone ? `
                  <a href="${waLink}" target="_blank" class="btn btn-sm" style="display: inline-flex; align-items: center; gap: 5px; font-weight: 800; padding: 6px 10px; border-radius: 8px; background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ade80; text-decoration: none;" title="Chatear por WhatsApp">
                    <span>📲 WhatsApp</span>
                  </a>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="window.previewThermalTicket('${t.id}', 'sale')" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; padding: 6px 12px; border-radius: 8px; background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.4); color: #60a5fa;" title="Ver e imprimir Ticket de Venta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  <span>Ticket de Venta</span>
                </button>
                <button class="btn btn-emerald-order btn-sm" onclick="window.previewThermalTicket('${t.id}', 'kitchen')" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; padding: 6px 12px; border-radius: 8px;" title="Ver e imprimir Ticket de Cocina">
                  <span>👨‍🍳 Ticket de Cocina</span>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.deleteTicket('${t.id}')" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 8px; color: #f87171; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.1); font-weight: 700;" title="Eliminar orden y ticket">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  <span>Eliminar</span>
                </button>
              </div>
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
        const numFormatted = formatTicketNumber(t.number || t.orderNumber);
        const phoneVal = t.phone || t.customerPhone || '';
        const cleanPhone = phoneVal.replace(/\D/g, '');
        const waLink = cleanPhone ? `https://wa.me/51${cleanPhone.length === 9 ? cleanPhone : cleanPhone}?text=${encodeURIComponent('Hola ' + (t.customer || 'Cliente') + ', te saludamos de BuchiSapa sobre tu pedido ' + numFormatted + '.')}` : '';

        return `
          <div class="ticket-mobile-card">
            <div class="ticket-card-header">
              <div class="ticket-number-badge">${numFormatted}</div>
              <div class="ticket-card-time">${timeStr}</div>
              <div class="ticket-card-status">✓ ${t.status || 'Emitido'}</div>
            </div>
            
            <div class="ticket-card-body">
              <div class="ticket-card-customer-row">
                <div>
                  <span class="ticket-card-customer">${window.AdminUtils.escapeHtml(t.customer || 'Cliente Mostrador')}</span>
                  ${cleanPhone ? `
                    <div style="margin-top: 3px;">
                      <a href="${waLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; background: rgba(34,197,94,0.18); border: 1px solid rgba(34,197,94,0.4); color: #4ade80; padding: 2px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 800; text-decoration: none;">
                        <span>📲 WhatsApp: ${window.AdminUtils.escapeHtml(phoneVal)}</span>
                      </a>
                    </div>
                  ` : ''}
                </div>
                <span class="ticket-card-type ${typeClass}">${typeLabel}</span>
              </div>
              <div class="ticket-card-details-row">
                <span class="ticket-card-payment-badge">💳 ${t.payment || 'Efectivo'}</span>
                <span class="ticket-card-items-count">${(t.items || []).length} ${(t.items || []).length === 1 ? 'producto' : 'productos'}</span>
              </div>
            </div>

            <div class="ticket-card-footer" style="flex-direction: column; align-items: stretch; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="ticket-card-total-group">
                  <span class="ticket-card-total-title">Total</span>
                  <span class="ticket-card-total-amount">${window.AdminUtils.formatSoles(t.total)}</span>
                </div>
                <button type="button" onclick="window.deleteTicket('${t.id}')" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  <span>Eliminar Pedido</span>
                </button>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button type="button" class="btn-ticket-card-action" style="padding: 10px 6px; font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa;" onclick="window.previewThermalTicket('${t.id}', 'sale')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  <span>Ticket de Venta</span>
                </button>
                <button type="button" class="btn-ticket-card-action" style="padding: 10px 6px; font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.5); color: #34d399;" onclick="window.previewThermalTicket('${t.id}', 'kitchen')">
                  <span>👨‍🍳 Ticket de Cocina</span>
                </button>
              </div>
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

  let currentActivePreviewTicket = null;
  let currentActivePreviewTab = 'sale'; // 'sale' | 'kitchen'

  function updatePreviewControls(tab, ticket) {
    const btnSale = document.getElementById('btn-print-preview-sale');
    const btnKitchen = document.getElementById('btn-print-preview-kitchen');
    const titleEl = document.getElementById('ticket-preview-page-title');
    const subEl = document.getElementById('ticket-preview-page-subtitle');
    const tabSale = document.getElementById('tab-preview-sale');
    const tabKitchen = document.getElementById('tab-preview-kitchen');

    if (tabSale) tabSale.classList.toggle('is-active', tab === 'sale');
    if (tabKitchen) tabKitchen.classList.toggle('is-active', tab === 'kitchen');

    if (btnSale) btnSale.style.display = tab === 'sale' ? 'inline-flex' : 'none';
    if (btnKitchen) btnKitchen.style.display = tab === 'kitchen' ? 'inline-flex' : 'none';

    if (ticket) {
      const num = formatTicketNumber(ticket.number || ticket.orderNumber);
      if (titleEl) {
        titleEl.textContent = tab === 'kitchen' 
          ? `Ticket de Cocina ${num}` 
          : `Ticket de Venta ${num}`;
      }
      if (subEl) {
        subEl.textContent = tab === 'kitchen' 
          ? 'Comanda térmica para preparación en cocina' 
          : 'Comprobante oficial de venta para el cliente';
      }
    }
  }

  function previewThermalTicket(id, defaultTab = 'sale') {
    const ticket = (window.AdminState.allTickets || []).find(t => t.id === id);
    if (!ticket) return;

    currentActivePreviewTicket = ticket;
    currentActivePreviewTab = defaultTab;
    window.AdminState.activePreviewTicket = ticket;

    updatePreviewControls(defaultTab, ticket);
    renderThermalReceiptHTML(ticket, defaultTab);

    const listSec = document.getElementById('ticket-list-section');
    const formSec = document.getElementById('ticket-form-page-section');
    const prevSec = document.getElementById('ticket-preview-page-section');

    if (listSec) listSec.style.display = 'none';
    if (formSec) formSec.style.display = 'none';
    if (prevSec) prevSec.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function previewThermalTicketFromOrder(orderId, defaultTab = 'sale') {
    const order = (window.AdminState.allOrders || []).find(o => o.id === orderId);
    if (!order) return;

    const rawNum = order.orderNumber || (order.id ? order.id.replace('ord-', '') : '00001');
    const orderNumFormatted = formatTicketNumber(rawNum);

    let rawItems = [];
    if (Array.isArray(order.items)) {
      rawItems = order.items;
    } else if (typeof order.items === 'string') {
      try {
        rawItems = JSON.parse(order.items);
      } catch (e) {
        rawItems = [];
      }
    }

    const ticketLike = {
      id: order.id,
      number: orderNumFormatted,
      orderNumber: rawNum,
      created_at: order.created_at || order.createdAt || new Date().toISOString(),
      customer: order.customerName || order.customer?.name || order.clientName || 'Cliente',
      type: order.orderType || order.type || 'delivery',
      payment: order.paymentMethod || order.payment_method || 'Efectivo',
      items: rawItems.map(i => ({ 
        name: i.name, 
        qty: i.quantity || i.qty || 1, 
        price: i.price || 0,
        sides: i.sides || [],
        sauces: i.sauces || [],
        notes: i.notes || ''
      })),
      subtotal: rawItems.reduce((acc, cur) => acc + (cur.price || 0) * (cur.quantity || 1), 0),
      deliveryFee: order.deliveryFee || 0,
      total: order.total,
      notes: order.notes || ''
    };

    currentActivePreviewTicket = ticketLike;
    currentActivePreviewTab = defaultTab;
    window.AdminState.activePreviewTicket = ticketLike;

    if (typeof window.navigateToView === 'function') {
      window.navigateToView('ticket');
    }

    updatePreviewControls(defaultTab, ticketLike);
    renderThermalReceiptHTML(ticketLike, defaultTab);

    const listSec = document.getElementById('ticket-list-section');
    const formSec = document.getElementById('ticket-form-page-section');
    const prevSec = document.getElementById('ticket-preview-page-section');

    if (listSec) listSec.style.display = 'none';
    if (formSec) formSec.style.display = 'none';
    if (prevSec) prevSec.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function switchTicketPreviewTab(tabType) {
    if (!currentActivePreviewTicket) {
      currentActivePreviewTicket = window.AdminState.activePreviewTicket || (window.AdminState.allTickets && window.AdminState.allTickets[0]);
    }
    if (!currentActivePreviewTicket) return;

    currentActivePreviewTab = tabType;
    updatePreviewControls(tabType, currentActivePreviewTicket);
    renderThermalReceiptHTML(currentActivePreviewTicket, tabType);
  }

  function buildSaleReceiptHTML(t) {
    if (!t) return '';
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
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

    const rawNum = t.number || t.orderNumber || (t.id ? t.id.replace('tk-', '').replace('ord-', '') : '00001');
    const orderNumber = formatTicketNumber(rawNum);

    const customerName = t.customer || t.clientName || 'Cliente';
    const statusText = t.status || 'Emitido';
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

    return `
      <div class="buchisapa-real-ticket buchisapa-sale-ticket">
        <!-- LOGO Y ENCABEZADO OFICIAL -->
        <div class="ticket-header-block">
          <div class="ticket-logo-wrapper">
            <img src="/imagenes/logo/logo-ticket-bn.webp" alt="BuchiSapa" class="ticket-logo-img" onerror="this.onerror=null; this.src='/imagenes/logo/logo-buchisapa.webp';">
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
          ${(t.phone || t.customerPhone) ? `
            <div class="ticket-meta-row">
              <span class="ticket-meta-label">Teléfono</span>
              <span class="ticket-meta-val">${window.AdminUtils.escapeHtml(t.phone || t.customerPhone)}</span>
            </div>
          ` : ''}
          ${(t.type === 'delivery' && (t.address || t.deliveryAddress)) ? `
            <div class="ticket-meta-row">
              <span class="ticket-meta-label">Dirección</span>
              <span class="ticket-meta-val">${window.AdminUtils.escapeHtml(t.address || t.deliveryAddress)}</span>
            </div>
          ` : ''}
          <div class="ticket-meta-row">
            <span class="ticket-meta-label">Tipo</span>
            <span class="ticket-meta-val">${t.type === 'delivery' ? 'Delivery 🛵' : (t.type === 'recojo' ? 'Recojo en Local 🛍️' : 'Salón 🍽️')}</span>
          </div>
          <div class="ticket-meta-row">
            <span class="ticket-meta-label">Pago</span>
            <span class="ticket-meta-val">${t.payment || 'Efectivo'}</span>
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
            const sides = item.selectedSides || item.sides || [];
            const sauces = item.selectedSauces || item.sauces || [];
            return `
              <div class="ticket-item-row">
                <div class="ticket-item-title">${qty} ${window.AdminUtils.escapeHtml(item.name || 'Plato BuchiSapa')}</div>
                <div class="ticket-item-pricing">
                  <span class="ticket-item-unit">S/ ${unitPrice.toFixed(2)} c/u</span>
                  <span class="ticket-item-sum">S/ ${lineTotal.toFixed(2)}</span>
                </div>
                ${(sides.length > 0 || sauces.length > 0) ? `
                  <div class="ticket-item-notes" style="margin-top: 2px;">
                    ${sides.length > 0 ? `<span>• ${sides.join(', ')}</span><br>` : ''}
                    ${sauces.length > 0 ? `<span>• Salsas: ${sauces.join(', ')}</span>` : ''}
                  </div>
                ` : ''}
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
          ${t.type === 'delivery' ? `
            <div class="ticket-totals-row">
              <span class="ticket-totals-label">Subtotal Platos</span>
              <span class="ticket-totals-val">S/ ${computedSubtotal.toFixed(2)}</span>
            </div>
            <div class="ticket-totals-row">
              <span class="ticket-totals-label">Costo Delivery</span>
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
          <p class="ticket-website">https://buchisapaweb.vercel.app</p>
        </div>
      </div>
    `;
  }

  function buildKitchenReceiptHTML(t) {
    if (!t) return '';

    const dateObj = t.created_at ? new Date(t.created_at) : new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

    const rawNum = t.number || t.orderNumber || (t.id ? t.id.replace('tk-', '').replace('ord-', '') : '00001');
    const orderNumber = formatTicketNumber(rawNum);

    const customerName = t.customer || t.clientName || 'Cliente';
    const orderType = t.type === 'delivery' ? 'DELIVERY 🛵' : 'SALÓN 🍽️';
    const clientPhone = t.phone || t.customerPhone || '';
    const clientAddress = t.address || t.deliveryAddress || '';
    const items = t.items || [];

    return `
      <div class="buchisapa-real-ticket buchisapa-kitchen-ticket">
        <div class="kitchen-ticket-header">
          <h2 class="kitchen-ticket-title">COCINA</h2>
          <div class="kitchen-ticket-order-badge">Pedido ${orderNumber}</div>
          <div class="kitchen-ticket-client-line">${window.AdminUtils.escapeHtml(customerName)}</div>
          ${clientPhone ? `<div style="font-size: 11.5px; font-weight: 700; color: #111827; margin-top: 2px;">Tel/WhatsApp: ${window.AdminUtils.escapeHtml(clientPhone)}</div>` : ''}
          ${(t.type === 'delivery' && clientAddress) ? `<div style="font-size: 11px; font-weight: 600; color: #374151; margin-top: 2px;">Dirección: ${window.AdminUtils.escapeHtml(clientAddress)}</div>` : ''}
          <div class="kitchen-ticket-meta">${orderType} &bull; ${formattedDate} ${formattedTime}</div>
        </div>

        <div class="ticket-dashed-line"></div>

        <div class="kitchen-items-container">
          ${items.map(item => {
            const qty = Number(item.qty || item.quantity || 1);
            const name = window.AdminUtils.escapeHtml(item.name || 'Plato');
            
            // Acompañamientos
            const sides = item.selectedSides || item.sides || [];
            // Salsas
            const sauces = item.selectedSauces || item.sauces || [];

            return `
              <div class="kitchen-item-block">
                <div class="kitchen-item-head">${qty} ${name}</div>
                ${(sides.length > 0 || sauces.length > 0) ? `
                  <div class="kitchen-item-sublist">
                    ${sides.map(s => `<div class="kitchen-item-subline">. ${window.AdminUtils.escapeHtml(s)}</div>`).join('')}
                    ${sauces.map(s => `<div class="kitchen-item-subline">. ${window.AdminUtils.escapeHtml(s)}</div>`).join('')}
                  </div>
                ` : ''}
                ${item.notes ? `<div class="kitchen-item-notes">Nota: ${window.AdminUtils.escapeHtml(item.notes)}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        ${t.notes ? `
          <div class="ticket-dashed-line"></div>
          <div class="kitchen-general-notes-box">
            <strong>INDICACIONES GENERALES:</strong><br>
            ${window.AdminUtils.escapeHtml(t.notes)}
          </div>
        ` : ''}

        <div class="ticket-dashed-line"></div>
      </div>
    `;
  }

  function renderThermalReceiptHTML(t, tabMode = 'sale') {
    if (!t) return;
    const targets = document.querySelectorAll('#thermal-receipt-render-target, .thermal-ticket-render-zone');
    if (!targets || targets.length === 0) return;

    const receiptHtml = tabMode === 'kitchen' 
      ? buildKitchenReceiptHTML(t) 
      : buildSaleReceiptHTML(t);

    targets.forEach(el => {
      el.innerHTML = receiptHtml;
    });
  }

  function printThermalContent(htmlContent, title = 'Impresión Térmica BuchiSapa') {
    if (!htmlContent || htmlContent.trim() === '') {
      window.showToast('No hay contenido activo para imprimir', 'warning');
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
          <title>${title}</title>
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
              width: 220px;
              max-width: 85%;
              height: auto;
              object-fit: contain;
              filter: contrast(130%);
              display: block;
              margin: 0 auto;
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

            /* COCINA COMANDA */
            .kitchen-ticket-header {
              text-align: center;
              margin-bottom: 6px;
            }
            .kitchen-ticket-title {
              font-size: 22px;
              font-weight: 900;
              letter-spacing: 2px;
              margin: 0 0 6px 0;
              text-transform: uppercase;
            }
            .kitchen-ticket-order-badge {
              font-size: 17px;
              font-weight: 900;
              margin: 4px 0;
            }
            .kitchen-ticket-client-line {
              font-size: 14px;
              font-weight: 700;
              margin: 2px 0;
            }
            .kitchen-ticket-meta {
              font-size: 12px;
              color: #333333;
              margin: 2px 0;
            }
            .kitchen-items-container {
              display: flex;
              flex-direction: column;
              gap: 8px;
              margin: 6px 0;
            }
            .kitchen-item-block {
              margin-bottom: 8px;
            }
            .kitchen-item-head {
              font-size: 15px;
              font-weight: 900;
              line-height: 1.3;
            }
            .kitchen-item-sublist {
              padding-left: 14px;
              margin-top: 3px;
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .kitchen-item-subline {
              font-size: 13px;
              font-weight: 600;
              line-height: 1.25;
            }
            .kitchen-item-notes {
              font-size: 12px;
              font-weight: 700;
              font-style: italic;
              padding-left: 14px;
              margin-top: 3px;
            }
            .kitchen-general-notes-box {
              margin: 6px 0;
              padding: 4px 0;
              font-size: 12.5px;
              line-height: 1.35;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
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

  function printSaleTicket(t) {
    const ticket = t || currentActivePreviewTicket || window.AdminState.activePreviewTicket;
    if (!ticket) {
      if (window.showToast) window.showToast('No hay ticket activo para imprimir', 'warning');
      return;
    }
    const html = buildSaleReceiptHTML(ticket);
    printThermalContent(html, `Ticket Venta ${ticket.number || ''}`);
  }

  function printKitchenTicket(t) {
    const ticket = t || currentActivePreviewTicket || window.AdminState.activePreviewTicket;
    if (!ticket) {
      if (window.showToast) window.showToast('No hay ticket activo para imprimir', 'warning');
      return;
    }
    const html = buildKitchenReceiptHTML(ticket);
    printThermalContent(html, `Comanda Cocina ${ticket.number || ''}`);
  }

  function printActiveTicket() {
    if (currentActivePreviewTab === 'kitchen') {
      printKitchenTicket();
    } else {
      printSaleTicket();
    }
  }

  function testThermalPrinter() {
    // Generar un ticket de prueba con el formato real oficial
    const testTicket = {
      number: '#00001',
      orderNumber: '00001',
      created_at: new Date().toISOString(),
      customer: 'Cliente',
      type: 'salon',
      payment: 'Efectivo',
      items: [
        { 
          name: 'Encuentro', 
          qty: 1, 
          price: 13,
          selectedSides: ['Papas fritas', 'Ensalada fresca'],
          selectedSauces: ['Mayonesa', 'Ají de Rocoto']
        }
      ],
      subtotal: 13,
      deliveryFee: 0,
      total: 13,
      status: 'Emitido'
    };
    currentActivePreviewTicket = testTicket;
    renderThermalReceiptHTML(testTicket, 'sale');
    printSaleTicket(testTicket);
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
    { id: 'salchipapas', code: '1008', name: 'SALCHIPAPAS Y SALCHIBROASTERS' },
    { id: 'promociones', code: '1009', name: 'PROMOCIONES' },
    { id: 'adicional', code: '1010', name: 'ADICIONAL' }
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
            <div class="ticket-prod-card-footer">
              <span class="ticket-prod-card-price">S/ ${priceFormatted}</span>
              <button type="button" class="btn-ticket-add-prod" onclick="event.stopPropagation(); window.addTicketItem('${prod.id}')" title="Agregar producto">
                <span class="btn-add-icon">+</span>
                <span class="btn-add-text">Agregar</span>
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

    const defaultSauces = ALL_CLIENT_SAUCES.filter(s => s.default).map(s => s.name);
    const isDrink = (prod.category_id || prod.category || '').toLowerCase().includes('bebida') ||
                    (prod.category_id || prod.category || '').toLowerCase().includes('refresco') ||
                    (prod.category_id || prod.category || '').toLowerCase().includes('infusion');
    const availableAccompaniments = getClientProductAccompaniments(prod);

    activeTicketItems.push({
      id: `it-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      prodId: prod.id,
      name: prod.name,
      price: parseFloat(prod.price || 0),
      qty: 1,
      isDrink: isDrink,
      availableSauces: isDrink ? [] : ALL_CLIENT_SAUCES.map(s => s.name),
      selectedSauces: isDrink ? [] : [...defaultSauces],
      availableSides: availableAccompaniments,
      selectedSides: [...availableAccompaniments],
      notes: ''
    });

    renderTicketCartItems();
    updateTicketFormTotal();
    if (window.showToast) {
      window.showToast(`"${prod.name}" agregado al pedido`, 'success');
    }
  }

  function duplicateTicketItem(index) {
    if (!activeTicketItems[index]) return;
    const item = activeTicketItems[index];
    const defaultSauces = ALL_CLIENT_SAUCES.filter(s => s.default).map(s => s.name);

    activeTicketItems.splice(index + 1, 0, {
      id: `it-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      prodId: item.prodId,
      name: item.name,
      price: item.price,
      qty: 1,
      isDrink: item.isDrink,
      availableSauces: [...(item.availableSauces || [])],
      selectedSauces: item.isDrink ? [] : [...defaultSauces],
      availableSides: [...(item.availableSides || [])],
      selectedSides: [...(item.availableSides || [])],
      notes: ''
    });

    renderTicketCartItems();
    updateTicketFormTotal();
    if (window.showToast) {
      window.showToast(`Otra porción de "${item.name}" agregada para personalizar`, 'info');
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

    // Calcular orden / número de unidad para productos repetidos
    const productCounters = {};
    const totalCounts = {};
    activeTicketItems.forEach(it => {
      totalCounts[it.prodId] = (totalCounts[it.prodId] || 0) + 1;
    });

    container.innerHTML = activeTicketItems.map((item, index) => {
      productCounters[item.prodId] = (productCounters[item.prodId] || 0) + 1;
      const unitNumber = productCounters[item.prodId];
      const totalForThis = totalCounts[item.prodId];
      const unitLabel = totalForThis > 1 ? ` (Unidad ${unitNumber} de ${totalForThis})` : '';

      const subtotal = (item.price * (item.qty || 1)).toFixed(2);

      const sidesHtml = (item.availableSides && item.availableSides.length > 0) ? `
        <div class="admin-client-section-box">
          <div class="admin-client-section-header">
            <div class="admin-client-section-title-group">
              <div class="admin-client-section-icon pink">🍴</div>
              <div>
                <h3 class="admin-client-section-h3">Acompañamientos e Ingredientes</h3>
                <p class="admin-client-section-subtitle">Personaliza lo que incluye este plato</p>
              </div>
            </div>
            <div class="admin-client-section-actions">
              <button type="button" class="admin-preset-btn teal" onclick="window.setTicketItemSidesPreset(${index}, true)">
                ✓ Con todo
              </button>
              <button type="button" class="admin-preset-btn outline" onclick="window.setTicketItemSidesPreset(${index}, false)">
                ↺ Quitar
              </button>
            </div>
          </div>
          <div class="admin-client-items-list">
            ${item.availableSides.map(sideName => {
              const isChecked = item.selectedSides && item.selectedSides.includes(sideName);
              return `
                <div class="admin-client-toggle-card ${isChecked ? 'active' : ''}" onclick="window.toggleTicketItemSide(${index}, '${window.AdminUtils.escapeHtml(sideName)}')">
                  <div class="admin-client-item-left">
                    <div class="admin-client-item-checkbox">
                      <span class="admin-client-item-check">✓</span>
                    </div>
                    <span class="admin-client-item-name">${window.AdminUtils.escapeHtml(sideName)}</span>
                  </div>
                  <span class="admin-client-item-badge">${isChecked ? 'Incluido' : 'Sin esto'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : '';

      const saucesHtml = (!item.isDrink && item.availableSauces && item.availableSauces.length > 0) ? `
        <div class="admin-client-section-box">
          <div class="admin-client-section-header">
            <div class="admin-client-section-title-group">
              <div class="admin-client-section-icon yellow">✨</div>
              <div>
                <h3 class="admin-client-section-h3">Cremas y Salsas de la Casa</h3>
                <p class="admin-client-section-subtitle">Selecciona las cremas que deseas</p>
              </div>
            </div>
            <div class="admin-client-section-actions">
              <button type="button" class="admin-preset-btn teal" onclick="window.setTicketItemSaucesPreset(${index}, 'all')">
                ✓ Todas
              </button>
              <button type="button" class="admin-preset-btn yellow" onclick="window.setTicketItemSaucesPreset(${index}, 'classics')">
                Clásicas
              </button>
              <button type="button" class="admin-preset-btn outline" onclick="window.setTicketItemSaucesPreset(${index}, 'none')">
                ↺ Ninguna
              </button>
            </div>
          </div>
          <div class="admin-client-items-list">
            ${item.availableSauces.map(sName => {
              const isChecked = item.selectedSauces && item.selectedSauces.includes(sName);
              return `
                <div class="admin-client-toggle-card ${isChecked ? 'active' : ''}" onclick="window.toggleTicketItemSauce(${index}, '${sName}')">
                  <div class="admin-client-item-left">
                    <div class="admin-client-item-checkbox">
                      <span class="admin-client-item-check">✓</span>
                    </div>
                    <span class="admin-client-item-name">${sName}</span>
                  </div>
                  <span class="admin-client-item-badge">${isChecked ? 'Incluido' : 'Sin esto'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : '';

      return `
        <div class="admin-client-card" id="ticket-cart-item-${index}">
          <div class="admin-client-card-top">
            <div>
              <h4 class="admin-client-card-title">
                ${window.AdminUtils.escapeHtml(item.name)} 
                ${unitLabel ? `<span style="display: inline-block; margin-left: 6px; background: rgba(249, 115, 22, 0.2); border: 1px solid rgba(249, 115, 22, 0.45); color: #fb923c; font-size: 0.78rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">${unitLabel.trim()}</span>` : ''}
              </h4>
              <span class="admin-client-card-category">✦ PLATO PERSONALIZABLE</span>
              <div class="admin-client-card-price">S/ ${item.price.toFixed(2)}</div>
              <span class="admin-client-card-unit-label">Precio unitario</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button type="button" class="btn btn-sm" onclick="window.duplicateTicketItem(${index})" title="Agregar otra unidad igual para personalizar" style="padding: 7px 13px; font-size: 0.82rem; font-weight: 800; border-radius: 10px; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); background: rgba(56, 189, 248, 0.14); cursor: pointer; transition: all 0.18s ease; display: inline-flex; align-items: center; gap: 4px;">
                <span>+ Otra Unidad</span>
              </button>
              <button type="button" class="btn-remove-ticket-item" title="Eliminar esta unidad" onclick="window.removeTicketItem(${index})" style="background: rgba(239, 68, 68, 0.15); border: 1.5px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 10px; padding: 7px 10px; cursor: pointer; transition: all 0.18s ease; display: inline-flex; align-items: center; justify-content: center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          ${sidesHtml}
          ${saucesHtml}
        </div>
      `;
    }).join('');
  }

  function setTicketItemSidesPreset(index, includeAll) {
    if (!activeTicketItems[index]) return;
    const item = activeTicketItems[index];
    item.selectedSides = includeAll ? [...(item.availableSides || [])] : [];
    renderTicketCartItems();
  }

  function setTicketItemSaucesPreset(index, preset) {
    if (!activeTicketItems[index]) return;
    const item = activeTicketItems[index];
    if (preset === 'all') {
      item.selectedSauces = ALL_CLIENT_SAUCES.map(s => s.name);
    } else if (preset === 'classics') {
      item.selectedSauces = ALL_CLIENT_SAUCES.filter(s => s.default).map(s => s.name);
    } else {
      item.selectedSauces = [];
    }
    renderTicketCartItems();
  }

  function updateTicketItemQty(index, delta) {
    if (!activeTicketItems[index]) return;
    activeTicketItems[index].qty = (activeTicketItems[index].qty || 1) + delta;
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
    const customerInput = document.getElementById('ticket-form-customer');
    if (customerInput) customerInput.value = 'Cliente';
    const phoneInput = document.getElementById('ticket-form-phone');
    if (phoneInput) phoneInput.value = '';
    const addressInput = document.getElementById('ticket-form-address');
    if (addressInput) addressInput.value = '';
    const notesInput = document.getElementById('ticket-form-notes');
    if (notesInput) notesInput.value = '';
    const deliveryInput = document.getElementById('ticket-form-delivery-fee');
    if (deliveryInput) deliveryInput.value = '5.00';

    selectTicketFormType('salon');
    populateTicketFormCategories();
    renderTicketCartItems();

    if (listSec) listSec.style.display = 'none';
    if (prevSec) prevSec.style.display = 'none';
    if (formSec) formSec.style.display = 'block';

    updateTicketFormTotal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getNextOrderNumber() {
    const state = window.AdminState = window.AdminState || {};
    const tickets = state.allTickets || [];
    if (tickets.length === 0) {
      localStorage.setItem('buchisapa_order_seq', '1');
      return '00001';
    }
    let stored = localStorage.getItem('buchisapa_order_seq');
    let seq = stored !== null ? parseInt(stored, 10) : tickets.length;
    if (isNaN(seq) || seq < 0) seq = tickets.length;
    seq += 1;
    localStorage.setItem('buchisapa_order_seq', seq.toString());
    return String(seq).padStart(5, '0');
  }

  function submitTicketForm(action = 'order', e) {
    if (e && e.preventDefault) e.preventDefault();

    if (activeTicketItems.length === 0) {
      if (window.showToast) {
        window.showToast('Por favor agrega al menos un producto antes de continuar', 'warning');
      }
      return;
    }

    const customerInput = document.getElementById('ticket-form-customer');
    const customer = customerInput?.value.trim() || 'Cliente';
    const type = document.getElementById('ticket-form-type')?.value || 'salon';
    const payment = document.getElementById('ticket-form-payment')?.value || 'Efectivo';
    const phoneInput = document.getElementById('ticket-form-phone');
    const phone = phoneInput?.value.trim() || '';
    const addressInput = document.getElementById('ticket-form-address');
    const address = addressInput?.value.trim() || '';
    const generalNote = document.getElementById('ticket-form-notes')?.value.trim() || '';

    const deliveryInput = document.getElementById('ticket-form-delivery-fee');
    const rawDeliveryVal = deliveryInput?.value !== undefined ? String(deliveryInput.value).trim() : '';
    const deliveryFee = type === 'delivery' ? (parseFloat(rawDeliveryVal) || 0) : 0;

    // VALIDACIÓN OBLIGATORIA DE CAMPOS CUANDO ES DELIVERY
    if (type === 'delivery') {
      if (!phone) {
        if (window.showToast) {
          window.showToast('⚠️ El Número de Teléfono / WhatsApp es OBLIGATORIO para pedidos de Delivery', 'warning');
        }
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.style.borderColor = '#ef4444';
          setTimeout(() => { phoneInput.style.borderColor = ''; }, 3000);
        }
        return;
      }
      if (!address) {
        if (window.showToast) {
          window.showToast('⚠️ La Dirección de Entrega es OBLIGATORIA para pedidos de Delivery', 'warning');
        }
        if (addressInput) {
          addressInput.focus();
          addressInput.style.borderColor = '#ef4444';
          setTimeout(() => { addressInput.style.borderColor = ''; }, 3000);
        }
        return;
      }
      if (rawDeliveryVal === '' || isNaN(parseFloat(rawDeliveryVal)) || parseFloat(rawDeliveryVal) < 0) {
        if (window.showToast) {
          window.showToast('⚠️ El Costo de Delivery es OBLIGATORIO para pedidos de Delivery', 'warning');
        }
        if (deliveryInput) {
          deliveryInput.focus();
          deliveryInput.style.borderColor = '#ef4444';
          setTimeout(() => { deliveryInput.style.borderColor = ''; }, 3000);
        }
        return;
      }
    }

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

    const rawNum = getNextOrderNumber(); // ej. "00001"
    const orderNumFormatted = formatTicketNumber(rawNum); // ej. "TK-00001"
    const ticketId = `tk-${Date.now()}`;
    const orderId = `ord-${Date.now()}`;

    const newTicket = {
      id: ticketId,
      number: orderNumFormatted,
      orderNumber: rawNum,
      orderId: orderId,
      created_at: new Date().toISOString(),
      customer: customer,
      phone: phone,
      customerPhone: phone,
      address: address,
      deliveryAddress: address,
      type: type,
      payment: payment,
      items: itemsFormatted,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: subtotal + deliveryFee,
      notes: generalNote,
      status: 'Emitido'
    };

    window.AdminState = window.AdminState || {};
    window.AdminState.allTickets = window.AdminState.allTickets || [];
    window.AdminState.allTickets.unshift(newTicket);

    // Registrar también en el módulo de Pedidos y Cocina KDS
    const newOrder = {
      id: orderId,
      orderNumber: rawNum,
      created_at: new Date().toISOString(),
      status: 'recibido',
      type: type,
      customerName: customer,
      customerPhone: phone,
      deliveryAddress: type === 'delivery' ? address : (type === 'recojo' ? 'Recojo en Local' : 'Salón / Mesa Local'),
      items: itemsFormatted.map(i => ({
        name: i.name,
        quantity: i.qty,
        price: i.price,
        total: i.price * i.qty,
        notes: [i.notes, (i.sides && i.sides.length ? 'Guarniciones: ' + i.sides.join(', ') : ''), (i.sauces && i.sauces.length ? 'Cremas: ' + i.sauces.join(', ') : '')].filter(Boolean).join(' | ')
      })),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: subtotal + deliveryFee,
      payment_method: payment,
      notes: generalNote
    };

    window.AdminState.allOrders = window.AdminState.allOrders || [];
    window.AdminState.allOrders.unshift(newOrder);

    // Sincronizar con API backend en segundo plano
    try {
      if (window.AdminApi && typeof window.AdminApi.createTicket === 'function') {
        window.AdminApi.createTicket({
          id: ticketId,
          orderId: orderId,
          ticketNumber: orderNumFormatted,
          orderNumber: parseInt(rawNum, 10) || 1,
          customerName: customer,
          customerPhone: phone,
          deliveryAddress: address,
          orderType: type,
          paymentMethod: payment,
          items: itemsFormatted,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: subtotal + deliveryFee,
          status: 'Emitido'
        }).catch(e => console.warn('Ticket server sync warning:', e));
      }
    } catch (err) {}

    // Resetear formulario y carrito local
    activeTicketItems = [];
    if (customerInput) customerInput.value = 'Cliente';
    if (phoneInput) phoneInput.value = '';
    if (addressInput) addressInput.value = '';
    const notesInput = document.getElementById('ticket-form-notes');
    if (notesInput) notesInput.value = '';
    if (deliveryInput) deliveryInput.value = '5.00';

    // Actualizar pedidos y cocina si la función existe
    if (typeof window.renderAllOrders === 'function') {
      window.renderAllOrders();
    }
    if (typeof window.updateMetricsAndViews === 'function') {
      window.updateMetricsAndViews();
    }

    filterTickets();

    // Redirigir de vuelta a la lista inicial de tickets
    closeTicketViews();

    if (window.showToast) {
      window.showToast(`✓ ¡Pedido ${orderNumFormatted} registrado con éxito!`, 'success');
    }
  }

  function handleNewTicketSubmit(e) {
    submitTicketForm('ticket', e);
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

    const deliveryBox = document.getElementById('ticket-form-delivery-box');
    if (deliveryBox) {
      deliveryBox.style.display = (type === 'delivery') ? 'block' : 'none';
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
  window.switchTicketPreviewTab = switchTicketPreviewTab;
  window.printSaleTicket = printSaleTicket;
  window.printKitchenTicket = printKitchenTicket;
  window.printActiveTicket = printActiveTicket;
  window.testThermalPrinter = testThermalPrinter;
  window.openNewTicketModal = openNewTicketModal;
  window.closeTicketViews = closeTicketViews;
  window.handleNewTicketSubmit = handleNewTicketSubmit;
  window.submitTicketForm = submitTicketForm;
  window.setTicketChipFilter = setTicketChipFilter;
  window.selectTicketFormType = selectTicketFormType;
  window.selectTicketFormPayment = selectTicketFormPayment;
  window.toggleCustomDropdown = toggleCustomDropdown;
  window.selectCustomDropdownOption = selectCustomDropdownOption;
  window.updateTicketFormTotal = updateTicketFormTotal;
  window.onTicketCategoryChange = onTicketCategoryChange;
  window.addTicketItem = addTicketItem;
  window.renderTicketCartItems = renderTicketCartItems;
  window.duplicateTicketItem = duplicateTicketItem;
  window.setTicketItemSidesPreset = setTicketItemSidesPreset;
  window.setTicketItemSaucesPreset = setTicketItemSaucesPreset;
  window.updateTicketItemQty = updateTicketItemQty;
  window.removeTicketItem = removeTicketItem;
  window.toggleTicketItemSauce = toggleTicketItemSauce;
  window.toggleTicketItemSide = toggleTicketItemSide;
  window.deleteTicket = deleteTicket;
  window.deleteActivePreviewTicket = deleteActivePreviewTicket;
  window.clearAllTicketsPrompt = clearAllTicketsPrompt;
  window.clearAllTickets = clearAllTicketsPrompt;

})();

