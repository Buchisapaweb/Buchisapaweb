/**
 * BUCHISAPA ADMIN - DELIVERY & DISPATCH COMMAND CENTER
 * Layer: /admin/js/modules/despacho.js
 * Executive Luxury Theme & Real-Time Sync
 */
(function () {
  'use strict';

  let currentDeliveryTab = 'todos'; // 'todos' | 'pendientes' | 'ruta' | 'entregados'
  let deliverySearchQuery = '';

  function isDeliveryOrder(order) {
    if (!order) return false;
    const type = String(order.orderType || order.type || '').toLowerCase();
    return type === 'delivery' || Boolean(order.deliveryAddress && order.deliveryAddress.trim() !== '');
  }

  function parseItems(items) {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  function getStatusBadge(status) {
    const s = String(status || 'recibido').toLowerCase();
    if (s === 'en-camino' || s === 'en_camino' || s === 'ruta') {
      return `<span class="badge" style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-weight: 800;"><span class="pulse-dot" style="background-color: #f59e0b; width: 6px; height: 6px;"></span> EN CAMINO</span>`;
    }
    if (s === 'entregado') {
      return `<span class="badge" style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-weight: 800;">✓ ENTREGADO</span>`;
    }
    if (s === 'en-preparacion' || s === 'cocina') {
      return `<span class="badge" style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; font-weight: 800;">🍳 EN COCINA</span>`;
    }
    if (s === 'listo' || s === 'empacado') {
      return `<span class="badge" style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; font-weight: 800;">📦 LISTO PARA SALIR</span>`;
    }
    return `<span class="badge" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-weight: 800;">⏳ PENDIENTE</span>`;
  }

  function updateDeliveryMetrics(allDeliveryOrders) {
    const enRuta = allDeliveryOrders.filter(o => {
      const s = String(o.status || '').toLowerCase();
      return s === 'en-camino' || s === 'en_camino' || s === 'ruta';
    }).length;

    const pendientes = allDeliveryOrders.filter(o => {
      const s = String(o.status || '').toLowerCase();
      return s === 'recibido' || s === 'en-preparacion' || s === 'listo' || s === '';
    }).length;

    const entregados = allDeliveryOrders.filter(o => {
      const s = String(o.status || '').toLowerCase();
      return s === 'entregado';
    });

    const totalFacturado = entregados.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const elRuta = document.getElementById('delivery-metric-en-ruta');
    const elPend = document.getElementById('delivery-metric-pendientes');
    const elEntr = document.getElementById('delivery-metric-entregados');
    const elTot = document.getElementById('delivery-metric-total');

    if (elRuta) elRuta.textContent = enRuta;
    if (elPend) elPend.textContent = pendientes;
    if (elEntr) elEntr.textContent = entregados.length;
    if (elTot) elTot.textContent = window.AdminUtils ? window.AdminUtils.formatSoles(totalFacturado) : `S/ ${totalFacturado.toFixed(2)}`;
  }

  function renderDeliveryOrders() {
    const container = document.getElementById('delivery-orders-list');
    if (!container) return;

    const state = window.AdminState = window.AdminState || {};
    const orders = state.allOrders || [];
    const deliveryOrders = orders.filter(isDeliveryOrder);

    // Actualizar métricas superiores
    updateDeliveryMetrics(deliveryOrders);

    // Filtrar por pestaña
    let filtered = [...deliveryOrders];
    if (currentDeliveryTab === 'pendientes') {
      filtered = filtered.filter(o => {
        const s = String(o.status || '').toLowerCase();
        return s === 'recibido' || s === 'en-preparacion' || s === 'listo' || s === '';
      });
    } else if (currentDeliveryTab === 'ruta') {
      filtered = filtered.filter(o => {
        const s = String(o.status || '').toLowerCase();
        return s === 'en-camino' || s === 'en_camino' || s === 'ruta';
      });
    } else if (currentDeliveryTab === 'entregados') {
      filtered = filtered.filter(o => String(o.status || '').toLowerCase() === 'entregado');
    }

    // Filtrar por texto de búsqueda
    if (deliverySearchQuery.trim() !== '') {
      const q = deliverySearchQuery.toLowerCase().trim();
      filtered = filtered.filter(o => {
        const num = String(o.orderNumber || o.id || '').toLowerCase();
        const name = String(o.customerName || o.customer?.name || '').toLowerCase();
        const address = String(o.deliveryAddress || o.customer?.address || '').toLowerCase();
        const phone = String(o.customerPhone || o.customer?.phone || '').toLowerCase();
        return num.includes(q) || name.includes(q) || address.includes(q) || phone.includes(q);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: 16px;">
          <div style="font-size: 42px; margin-bottom: 12px;">🛵</div>
          <h4 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 6px;">No hay pedidos de delivery en esta sección</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 420px; margin: 0 auto;">Los pedidos a domicilio realizados por los clientes en la tienda web aparecerán automáticamente aquí en tiempo real.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(order => {
      const orderNum = window.AdminUtils ? window.AdminUtils.formatOrderCode(order) : (order.orderCode || order.orderNumber || order.id);
      const customer = order.customerName || order.customer?.name || 'Cliente Particular';
      const phone = order.customerPhone || order.customer?.phone || '';
      const address = order.deliveryAddress || order.customer?.address || 'Dirección en Iquitos';
      const reference = order.deliveryReference || order.customer?.reference || '';
      const status = String(order.status || 'recibido').toLowerCase();
      const payment = order.paymentMethod || order.payment_method || 'Yape / Efectivo';
      const totalFormatted = window.AdminUtils ? window.AdminUtils.formatSoles(order.total) : `S/ ${Number(order.total || 0).toFixed(2)}`;
      const items = parseItems(order.items);
      const cleanPhone = phone.replace(/\D/g, '');
      const waLink = cleanPhone ? `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(`¡Hola ${customer}! Te escribimos de BuchiSapa para coordinar la entrega de tu pedido ${orderNum}.`)}` : '#';

      const isEnCamino = status === 'en-camino' || status === 'en_camino' || status === 'ruta';
      const isEntregado = status === 'entregado';

      return `
        <div class="order-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px; position: relative; transition: all 0.2s ease;">
          
          <!-- Encabezado de la Orden de Despacho -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem; font-weight: 900; color: #fff; letter-spacing: -0.01em;">${orderNum}</span>
                ${getStatusBadge(status)}
              </div>
              <span style="font-size: 0.76rem; color: var(--text-muted); display: block; margin-top: 3px;">
                🕒 ${order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recién recibido'}
              </span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.25rem; font-weight: 900; color: #10b981;">${totalFormatted}</span>
              <span style="font-size: 0.74rem; color: var(--text-muted); display: block;">💳 ${payment}</span>
            </div>
          </div>

          <!-- Información del Cliente y Destino -->
          <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #fff; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
                👤 ${window.AdminUtils ? window.AdminUtils.escapeHtml(customer) : customer}
              </strong>
              ${cleanPhone ? `
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" style="background: rgba(37, 211, 102, 0.15); border: 1px solid rgba(37, 211, 102, 0.35); color: #25d366; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                  💬 WhatsApp (${cleanPhone})
                </a>
              ` : ''}
            </div>

            <div style="color: #cbd5e1; font-size: 0.84rem; display: flex; align-items: flex-start; gap: 6px; margin-top: 2px;">
              <span style="color: #ef4444; flex-shrink: 0;">📍</span>
              <div>
                <strong>Dirección:</strong> ${window.AdminUtils ? window.AdminUtils.escapeHtml(address) : address}
                ${reference ? `<div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 2px;">Ref: ${window.AdminUtils ? window.AdminUtils.escapeHtml(reference) : reference}</div>` : ''}
              </div>
            </div>
          </div>

          <!-- Lista de Platos a Entregar -->
          <div style="padding: 4px 0;">
            <span style="font-size: 0.74rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              Contenido del Paquete (${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}):
            </span>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${items.map(it => `
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: #e2e8f0;">
                  <span><strong>${it.quantity || 1}x</strong> ${window.AdminUtils ? window.AdminUtils.escapeHtml(it.name || it.title || 'Plato') : (it.name || it.title)}</span>
                  <span style="color: var(--text-muted);">S/ ${Number((it.price || 0) * (it.quantity || 1)).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Botones de Acción de Despacho -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
            ${!isEnCamino && !isEntregado ? `
              <button type="button" class="btn btn-primary" onclick="window.updateDeliveryOrderStatus('${order.id}', 'en-camino')" style="flex: 1; height: 40px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-color: #f59e0b; color: #fff;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                <span>Despachar (En Camino)</span>
              </button>
            ` : ''}

            ${isEnCamino ? `
              <button type="button" class="btn btn-primary" onclick="window.updateDeliveryOrderStatus('${order.id}', 'entregado')" style="flex: 1; height: 40px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-color: #10b981; color: #fff;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Confirmar Entrega</span>
              </button>
            ` : ''}

            <button type="button" class="btn btn-secondary" onclick="window.previewThermalTicket && window.previewThermalTicket('${order.id}', 'sale')" style="height: 40px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px;" title="Ver Ticket / Comprobante">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Ticket</span>
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  async function updateDeliveryOrderStatus(orderId, newStatus) {
    try {
      if (window.AdminApi && typeof window.AdminApi.updateOrderStatus === 'function') {
        await window.AdminApi.updateOrderStatus(orderId, newStatus);
      } else {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Error al actualizar estado en servidor');
      }

      // Actualizar estado local
      const state = window.AdminState = window.AdminState || {};
      const order = (state.allOrders || []).find(o => o.id === orderId || String(o.orderNumber) === orderId);
      if (order) {
        order.status = newStatus;
      }

      window.showToast(`✓ Estado del pedido actualizado a "${newStatus}"`, 'success');
      renderDeliveryOrders();

      if (typeof window.fetchOrders === 'function') {
        window.fetchOrders();
      }
    } catch (err) {
      console.error('Error al actualizar despacho:', err);
      window.showToast('Error al actualizar estado', 'error');
    }
  }

  function filterDeliveryTab(tab, btn) {
    currentDeliveryTab = tab;
    document.querySelectorAll('#view-delivery .btn-filter-period').forEach(b => {
      b.classList.remove('active');
      b.style.background = 'transparent';
      b.style.color = 'var(--text-muted)';
      b.style.fontWeight = '600';
    });
    if (btn) {
      btn.classList.add('active');
      btn.style.background = 'var(--accent-red)';
      btn.style.color = '#fff';
      btn.style.fontWeight = '800';
    }
    renderDeliveryOrders();
  }

  function filterDeliverySearch() {
    const input = document.getElementById('delivery-search-input');
    deliverySearchQuery = input ? input.value : '';
    renderDeliveryOrders();
  }

  window.renderDeliveryOrders = renderDeliveryOrders;
  window.updateDeliveryOrderStatus = updateDeliveryOrderStatus;
  window.filterDeliveryTab = filterDeliveryTab;
  window.filterDeliverySearch = filterDeliverySearch;

  // Escuchar cambio de vista para renderizar
  document.addEventListener('DOMContentLoaded', () => {
    renderDeliveryOrders();
  });
})();
