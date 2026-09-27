/**
 * BUCHISAPA ADMIN - ORDERS & KDS KITCHEN MODULE
 * Layer: /admin/js/modules/pedidos.js
 */

(function () {
  'use strict';

  let activeTab = 'kds';
  let previousOrderIds = new Set();
  let kdsAudioCtx = null;
  let kitchenProducts = [];

  // ============================================================================
  // AUDIO & ALERT SYSTEM (SIRENA KDS + SÍNTESIS DE VOZ)
  // ============================================================================
  const BuchisapaKdsAudio = {
    isSoundEnabled() {
      return localStorage.getItem('kds_sound_enabled') !== 'false';
    },

    isVoiceEnabled() {
      return localStorage.getItem('kds_voice_enabled') !== 'false';
    },

    toggleSound() {
      const current = this.isSoundEnabled();
      localStorage.setItem('kds_sound_enabled', current ? 'false' : 'true');
      this.updateAudioUi();
      if (!current) this.playChime();
    },

    toggleVoice() {
      const current = this.isVoiceEnabled();
      localStorage.setItem('kds_voice_enabled', current ? 'false' : 'true');
      this.updateAudioUi();
    },

    updateAudioUi() {
      const soundBtn = document.getElementById('btn-kds-sound');
      const soundIcon = document.getElementById('kds-sound-icon');
      const soundText = document.getElementById('kds-sound-text');
      const dot = document.getElementById('admin-kds-audio-dot');
      const voiceIcon = document.getElementById('kds-voice-icon');
      const voiceText = document.getElementById('kds-voice-text');

      const soundOn = this.isSoundEnabled();
      const voiceOn = this.isVoiceEnabled();

      if (soundBtn) {
        soundBtn.classList.toggle('muted', !soundOn);
      }
      if (soundIcon) soundIcon.textContent = soundOn ? '🔊' : '🔇';
      if (soundText) soundText.textContent = soundOn ? 'Sonido: ACTIVO' : 'Sonido: MUTE';
      if (dot) dot.classList.toggle('muted', !soundOn);
      if (voiceIcon) voiceIcon.textContent = voiceOn ? '🗣️' : '🔇';
      if (voiceText) voiceText.textContent = voiceOn ? 'Voz: ACTIVA' : 'Voz: OFF';
    },

    initCtx() {
      if (!kdsAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          kdsAudioCtx = new AudioContext();
        }
      }
      if (kdsAudioCtx && kdsAudioCtx.state === 'suspended') {
        kdsAudioCtx.resume();
      }
    },

    playChime() {
      try {
        this.initCtx();
        if (!kdsAudioCtx) return;

        const now = kdsAudioCtx.currentTime;

        // Tono 1: 880 Hz (A5)
        const osc1 = kdsAudioCtx.createOscillator();
        const gain1 = kdsAudioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.connect(gain1);
        gain1.connect(kdsAudioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);

        // Tono 2: 1174.66 Hz (D6)
        const osc2 = kdsAudioCtx.createOscillator();
        const gain2 = kdsAudioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1174.66, now + 0.2);
        gain2.gain.setValueAtTime(0.4, now + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc2.connect(gain2);
        gain2.connect(kdsAudioCtx.destination);
        osc2.start(now + 0.2);
        osc2.stop(now + 0.9);
      } catch (e) {
        console.warn('Audio context alert:', e);
      }
    },

    speakOrder(orderNum, customerName) {
      if (!('speechSynthesis' in window) || !this.isVoiceEnabled()) return;
      try {
        window.speechSynthesis.cancel();
        const text = `Atención cocina, nuevo pedido número ${orderNum || ''}. ${customerName ? 'Cliente: ' + customerName : ''}`;
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'es-PE';
        msg.rate = 1.0;
        msg.pitch = 1.0;
        window.speechSynthesis.speak(msg);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    },

    triggerAlert(order) {
      if (!this.isSoundEnabled()) return;
      this.playChime();
      const num = order.orderNumber || order.id || '';
      const name = order.customerName || (order.customer && order.customer.name) || '';
      setTimeout(() => this.speakOrder(num, name), 600);
    }
  };

  // ============================================================================
  // FETCH & MANAGEMENT OF ORDERS
  // ============================================================================
  async function fetchOrders() {
    try {
      const data = await window.AdminApi.getOrders();
      const orders = Array.isArray(data) ? data : [];
      
      // Detectar órdenes nuevas para disparar sonido de comanda
      const currentIds = new Set(orders.map(o => o.id));
      if (previousOrderIds.size > 0) {
        for (const order of orders) {
          if (!previousOrderIds.has(order.id) && (order.status === 'recibido' || order.status === 'pendiente')) {
            BuchisapaKdsAudio.triggerAlert(order);
            window.showToast?.(`🔔 ¡Nuevo pedido #${order.orderNumber || order.id}!`, 'info');
            break;
          }
        }
      }
      previousOrderIds = currentIds;

      window.AdminState.allOrders = orders;
    } catch (e) {
      console.warn('Error al cargar órdenes del servidor, usando órdenes locales:', e);
      if (!window.AdminState.allOrders || window.AdminState.allOrders.length === 0) {
        window.AdminState.allOrders = [
          {
            id: 'ord-101',
            orderNumber: 'TK-0038',
            created_at: new Date().toISOString(),
            status: 'en_preparacion',
            type: 'delivery',
            customerName: 'Juan Carlos Mendoza',
            customerPhone: '984 555 123',
            deliveryAddress: 'Jr. Prospero 342, Tarapoto',
            items: [
              { name: '1/4 Pollo Broaster Clásico', quantity: 2, price: 18, total: 36, notes: 'Papas bien doradas' },
              { name: 'Refresco de Cocona 1L', quantity: 1, price: 8, total: 8 }
            ],
            total: 44,
            payment_method: 'Yape'
          },
          {
            id: 'ord-102',
            orderNumber: 'TK-0037',
            created_at: new Date(Date.now() - 12 * 60000).toISOString(),
            status: 'recibido',
            type: 'pickup',
            customerName: 'Elena Rios',
            customerPhone: '965 222 344',
            items: [{ name: 'Hamburguesa Amazónica BuchiSapa', quantity: 1, price: 18, total: 18, notes: 'Sin cebolla' }],
            total: 18,
            payment_method: 'Efectivo'
          }
        ];
      }
    }

    updateMetricsAndViews();
  }

  function updateMetricsAndViews() {
    const orders = window.AdminState.allOrders || [];

    let totalOrders = orders.length;
    let recibidos = 0;
    let preparacion = 0;
    let listos = 0;
    let totalMonto = 0;

    orders.forEach(o => {
      const st = (o.status || 'pendiente').toLowerCase();
      if (st === 'pendiente' || st === 'recibido') recibidos++;
      else if (st === 'en_preparacion' || st === 'preparando') preparacion++;
      else if (st === 'listo' || st === 'en_camino' || st === 'entregado') listos++;

      if (st !== 'cancelado') {
        totalMonto += Number(o.total || 0);
      }
    });

    // Actualizar KPIs
    const elTotal = document.getElementById('kpi-orders-total');
    const elRecibidos = document.getElementById('kpi-orders-recibidos');
    const elPrep = document.getElementById('kpi-orders-preparacion');
    const elListos = document.getElementById('kpi-orders-listos');
    const elMonto = document.getElementById('kpi-orders-monto');

    if (elTotal) elTotal.textContent = totalOrders;
    if (elRecibidos) elRecibidos.textContent = recibidos;
    if (elPrep) elPrep.textContent = preparacion;
    if (elListos) elListos.textContent = listos;
    if (elMonto) elMonto.textContent = window.AdminUtils.formatSoles(totalMonto);

    renderKdsView();
    renderAllOrders();
    renderDeliveryMonitoring();
    window.updateDashboardMetrics?.();
  }

  // ============================================================================
  // RENDER KDS KANBAN VIEW (3 COLUMNAS)
  // ============================================================================
  function renderKdsView() {
    const colRecibidos = document.getElementById('kds-recibidos-list');
    const colPrep = document.getElementById('kds-preparacion-list');
    const colListos = document.getElementById('kds-listos-list');

    const countRec = document.getElementById('count-recibidos');
    const countPrep = document.getElementById('count-preparacion');
    const countListos = document.getElementById('count-listos');

    if (!colRecibidos || !colPrep || !colListos) return;

    const orders = window.AdminState.allOrders || [];

    const listRecibidos = [];
    const listPrep = [];
    const listListos = [];

    orders.forEach(order => {
      const st = (order.status || 'pendiente').toLowerCase();
      if (st === 'pendiente' || st === 'recibido') listRecibidos.push(order);
      else if (st === 'en_preparacion' || st === 'preparando') listPrep.push(order);
      else if (st === 'listo' || st === 'en_camino') listListos.push(order);
    });

    if (countRec) countRec.textContent = listRecibidos.length;
    if (countPrep) countPrep.textContent = listPrep.length;
    if (countListos) countListos.textContent = listListos.length;

    // Render Columna 1: Recibidos
    colRecibidos.innerHTML = listRecibidos.length === 0
      ? '<div class="kds-empty-state"><span class="empty-icon">✨</span><p>Sin comandas pendientes</p></div>'
      : listRecibidos.map(o => renderKdsCard(o, 'recibido')).join('');

    // Render Columna 2: En Preparación
    colPrep.innerHTML = listPrep.length === 0
      ? '<div class="kds-empty-state"><span class="empty-icon">🔥</span><p>Cocina libre en este momento</p></div>'
      : listPrep.map(o => renderKdsCard(o, 'preparacion')).join('');

    // Render Columna 3: Listos
    colListos.innerHTML = listListos.length === 0
      ? '<div class="kds-empty-state"><span class="empty-icon">✅</span><p>No hay pedidos pendientes de entrega</p></div>'
      : listListos.map(o => renderKdsCard(o, 'listo')).join('');
  }

  function renderKdsCard(order, stage) {
    const orderNum = order.orderNumber || order.id;
    const isDelivery = order.type === 'delivery' || order.orderType === 'delivery';
    const isPickup = order.type === 'pickup' || order.orderType === 'pickup';
    const typeLabel = isDelivery ? '🛵 Delivery' : (isPickup ? '🛍️ Recojo' : '🍽️ Mesa');

    const createdTime = new Date(order.created_at || order.createdAt || Date.now());
    const minsElapsed = Math.floor((Date.now() - createdTime.getTime()) / 60000);
    const isLate = minsElapsed >= 15;

    const custName = window.AdminUtils.escapeHtml(order.customerName || order.customer?.name || 'Cliente');
    const custPhone = order.customerPhone || order.customer?.phone || '';
    const custAddress = window.AdminUtils.escapeHtml(order.deliveryAddress || order.customer?.address || '');

    let parsedItems = order.items || [];
    if (typeof parsedItems === 'string') {
      try { parsedItems = JSON.parse(parsedItems); } catch (e) { parsedItems = []; }
    }

    return `
      <div class="kds-card kds-card-${stage}">
        <div class="kds-card-header">
          <div>
            <span class="kds-order-num">#${orderNum}</span>
            <span class="order-type-badge">${typeLabel}</span>
          </div>
          <span class="kds-timer-badge ${isLate ? 'timer-warning' : ''}">
            ⏱️ ${minsElapsed} min
          </span>
        </div>

        <div class="kds-customer-detail">
          <span class="kds-cust-name">👤 ${custName}</span>
          ${custPhone ? `<a href="https://wa.me/51${custPhone.replace(/\D/g,'')}" target="_blank" class="kds-cust-phone">📞 ${custPhone} (WhatsApp)</a>` : ''}
          ${custAddress ? `<span>📍 ${custAddress}</span>` : ''}
          <span>💳 ${order.payment_method || order.paymentMethod || 'Efectivo'}</span>
        </div>

        <div class="kds-items-list">
          ${parsedItems.map(item => `
            <div class="kds-item-row">
              <span class="kds-item-qty">${item.quantity || 1}x</span>
              <div class="kds-item-name">
                ${window.AdminUtils.escapeHtml(item.name || item.title || 'Plato')}
                ${item.notes ? `<div class="kds-item-notes">📝 ${window.AdminUtils.escapeHtml(item.notes)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="kds-card-footer">
          <span class="kds-total-price">${window.AdminUtils.formatSoles(order.total || 0)}</span>

          <div class="kds-action-btns">
            ${stage === 'recibido' ? `
              <button class="btn btn-primary btn-sm" onclick="window.changeOrderStatus('${order.id}', 'en_preparacion')">
                🧑‍🍳 A Cocina
              </button>
            ` : ''}

            ${stage === 'preparacion' ? `
              <button class="btn btn-secondary btn-sm" style="border-color: #10b981; color: #10b981;" onclick="window.changeOrderStatus('${order.id}', 'listo')">
                ✅ Marcar Listo
              </button>
            ` : ''}

            ${stage === 'listo' ? `
              <button class="btn btn-primary btn-sm" onclick="window.changeOrderStatus('${order.id}', 'entregado')">
                🚀 Entregar
              </button>
            ` : ''}

            <button class="btn btn-secondary btn-sm" onclick="window.previewThermalTicketFromOrder('${order.id}')" title="Imprimir Ticket">
              🖨️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // RENDER ALL ORDERS (LIST VIEW & FILTERS)
  // ============================================================================
  function renderAllOrders() {
    const container = document.getElementById('all-orders-master-list');
    if (!container) return;

    let orders = window.AdminState.allOrders || [];

    const searchInput = document.getElementById('pedidos-search-input');
    const statusFilter = document.getElementById('pedidos-status-filter');
    const typeFilter = document.getElementById('pedidos-type-filter');

    const searchVal = (searchInput?.value || '').toLowerCase().trim();
    const statusVal = statusFilter?.value || 'todos';
    const typeVal = typeFilter?.value || 'todos';

    if (searchVal) {
      orders = orders.filter(o => {
        const num = String(o.orderNumber || o.id).toLowerCase();
        const name = (o.customerName || o.customer?.name || '').toLowerCase();
        const phone = (o.customerPhone || o.customer?.phone || '').toLowerCase();
        const addr = (o.deliveryAddress || o.customer?.address || '').toLowerCase();
        return num.includes(searchVal) || name.includes(searchVal) || phone.includes(searchVal) || addr.includes(searchVal);
      });
    }

    if (statusVal !== 'todos') {
      orders = orders.filter(o => {
        const st = (o.status || 'pendiente').toLowerCase();
        if (statusVal === 'recibido') return st === 'pendiente' || st === 'recibido';
        if (statusVal === 'en_preparacion') return st === 'en_preparacion' || st === 'preparando';
        if (statusVal === 'listo') return st === 'listo' || st === 'en_camino';
        return st === statusVal;
      });
    }

    if (typeVal !== 'todos') {
      orders = orders.filter(o => (o.type || o.orderType) === typeVal);
    }

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; color: var(--text-muted, #94a3b8);">
          <p style="font-size: 1.1rem; font-weight: 700;">No hay pedidos registrados con estos filtros</p>
          <p style="font-size: 0.8rem; margin-top: 4px;">Ajusta el buscador o el filtro para ver más ordenes.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const status = (order.status || 'pendiente').toLowerCase();
      const isDelivery = order.type === 'delivery' || order.orderType === 'delivery';

      let parsedItems = order.items || [];
      if (typeof parsedItems === 'string') {
        try { parsedItems = JSON.parse(parsedItems); } catch (e) { parsedItems = []; }
      }

      return `
        <div class="order-card">
          <div class="order-header-row">
            <div class="order-id-group">
              <span class="order-number">Orden #${order.orderNumber || order.id}</span>
              <span class="order-type-badge">${isDelivery ? '🛵 Delivery' : '🛍️ Recojo'}</span>
              <span class="badge ${getStatusBadgeClass(status)}">${getStatusLabel(status)}</span>
            </div>
            <span class="order-timestamp">${new Date(order.created_at || order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div class="order-customer-info">
            <span class="order-customer-name">👤 ${window.AdminUtils.escapeHtml(order.customerName || order.customer?.name || 'Cliente')}</span>
            ${(order.customerPhone || order.customer?.phone) ? `<span>📞 ${order.customerPhone || order.customer.phone}</span>` : ''}
            ${(order.deliveryAddress || order.customer?.address) ? `<span>📍 ${window.AdminUtils.escapeHtml(order.deliveryAddress || order.customer.address)}</span>` : ''}
            <span>💳 ${order.payment_method || order.paymentMethod || 'Efectivo'}</span>
          </div>

          <div class="order-items-summary">
            ${parsedItems.map(item => `
              <div class="order-item-row">
                <div>
                  <span class="order-item-qty">${item.quantity || 1}x</span>
                  <span class="order-item-name">${window.AdminUtils.escapeHtml(item.name || item.title || 'Plato')}</span>
                </div>
                <span class="order-item-price">${window.AdminUtils.formatSoles((item.price || 0) * (item.quantity || 1))}</span>
              </div>
            `).join('')}
          </div>

          <div class="order-card-footer">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted, #94a3b8);">Total a cobrar:</span>
              <span class="order-total-amount" style="margin-left: 6px;">${window.AdminUtils.formatSoles(order.total || 0)}</span>
            </div>

            <div class="order-stage-actions">
              ${status === 'pendiente' || status === 'recibido' ? `
                <button class="btn btn-primary btn-sm" onclick="window.changeOrderStatus('${order.id}', 'en_preparacion')">
                  🧑‍🍳 A Cocina
                </button>
              ` : ''}

              ${status === 'en_preparacion' || status === 'preparando' ? `
                <button class="btn btn-secondary btn-sm" style="border-color: #10b981; color: #10b981;" onclick="window.changeOrderStatus('${order.id}', 'listo')">
                  ✅ Marcar Listo
                </button>
              ` : ''}

              ${status === 'listo' || status === 'en_camino' ? `
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

  function renderDeliveryMonitoring() {
    const grid = document.getElementById('delivery-active-orders-grid');
    if (!grid) return;

    const orders = (window.AdminState.allOrders || []).filter(o => (o.type === 'delivery' || o.orderType === 'delivery') && o.status !== 'entregado' && o.status !== 'cancelado');

    if (orders.length === 0) {
      grid.innerHTML = `
        <div style="text-align: center; padding: 48px; color: #94a3b8; grid-column: 1 / -1;">
          <p style="font-size: 1.1rem; font-weight: 700;">No hay envíos activos en ruta</p>
          <p style="font-size: 0.8rem; margin-top: 4px;">Los motorizados asignados y entregas en proceso aparecerán aquí.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = orders.map(o => `
      <div style="background: rgba(22, 14, 46, 0.9); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; font-weight: 800; color: #fff; margin-bottom: 8px;">
          <span>🛵 Orden #${o.orderNumber || o.id}</span>
          <span style="color: #00f0ff;">S/ ${Number(o.total || 0).toFixed(2)}</span>
        </div>
        <div style="font-size: 0.82rem; color: #cbd5e1;">
          <p style="margin: 2px 0;"><strong>Cliente:</strong> ${window.AdminUtils.escapeHtml(o.customerName || o.customer?.name || '')}</p>
          <p style="margin: 2px 0;"><strong>Dirección:</strong> ${window.AdminUtils.escapeHtml(o.deliveryAddress || o.customer?.address || 'Tarapoto')}</p>
          <p style="margin: 2px 0;"><strong>Teléfono:</strong> ${o.customerPhone || o.customer?.phone || ''}</p>
        </div>
        <div style="margin-top: 12px;">
          <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="window.changeOrderStatus('${o.id}', 'entregado')">
            ✅ Marcar Entregado
          </button>
        </div>
      </div>
    `).join('');
  }

  function getStatusBadgeClass(status) {
    if (status === 'en_preparacion' || status === 'preparando') return 'badge-blue';
    if (status === 'listo' || status === 'en_camino' || status === 'entregado') return 'badge-green';
    if (status === 'cancelado') return 'badge-red';
    return 'badge-amber';
  }

  function getStatusLabel(status) {
    if (status === 'en_preparacion' || status === 'preparando') return 'En Cocina';
    if (status === 'listo' || status === 'en_camino') return 'Listo / En Ruta';
    if (status === 'entregado') return 'Entregado';
    if (status === 'cancelado') return 'Cancelado';
    return 'Recibido / Pendiente';
  }

  async function changeOrderStatus(id, newStatus) {
    try {
      await window.AdminApi.updateOrderStatus(id, newStatus);
      window.showToast?.(`Pedido actualizado a ${getStatusLabel(newStatus)}`, 'success');
      await fetchOrders();
    } catch (e) {
      const order = (window.AdminState.allOrders || []).find(o => o.id === id);
      if (order) order.status = newStatus;
      updateMetricsAndViews();
      window.showToast?.(`Estado actualizado localmente a ${getStatusLabel(newStatus)}`, 'info');
    }
  }

  // ============================================================================
  // TAB NAVIGATION & FULLSCREEN CONTROLS
  // ============================================================================
  function switchPedidosTab(tabName) {
    activeTab = tabName;

    const btnKds = document.getElementById('tab-btn-kds');
    const btnList = document.getElementById('tab-btn-list');
    const btnDelivery = document.getElementById('tab-btn-delivery');

    const paneKds = document.getElementById('pedidos-tab-content-kds');
    const paneList = document.getElementById('pedidos-tab-content-list');
    const paneDelivery = document.getElementById('pedidos-tab-content-delivery');

    if (btnKds) btnKds.classList.toggle('active', tabName === 'kds');
    if (btnList) btnList.classList.toggle('active', tabName === 'list');
    if (btnDelivery) btnDelivery.classList.toggle('active', tabName === 'delivery');

    if (paneKds) paneKds.classList.toggle('active', tabName === 'kds');
    if (paneList) paneList.classList.toggle('active', tabName === 'list');
    if (paneDelivery) paneDelivery.classList.toggle('active', tabName === 'delivery');
  }

  function toggleKdsFullScreen() {
    const sec = document.getElementById('view-pedidos');
    if (sec) {
      sec.classList.toggle('kds-fullscreen-active');
      const isActive = sec.classList.contains('kds-fullscreen-active');
      window.showToast?.(isActive ? '🖥️ Modo Pantalla Completa Activado' : 'Pantalla Normal', 'info');
    }
  }

  // ============================================================================
  // KITCHEN STOCK MODAL MANAGEMENT
  // ============================================================================
  async function openKitchenStockModal() {
    const modal = document.getElementById('admin-kds-stock-modal');
    if (!modal) return;

    modal.classList.add('active');

    try {
      const data = await window.AdminApi.getProducts();
      kitchenProducts = Array.isArray(data) ? data : [];
    } catch (e) {
      kitchenProducts = window.AdminState.products || [];
    }

    renderKitchenStockList();
  }

  function closeKitchenStockModal() {
    const modal = document.getElementById('admin-kds-stock-modal');
    if (modal) modal.classList.remove('active');
  }

  function renderKitchenStockList() {
    const container = document.getElementById('admin-kds-stock-list');
    const searchVal = (document.getElementById('stock-modal-search')?.value || '').toLowerCase();

    if (!container) return;

    let items = kitchenProducts;
    if (searchVal) {
      items = items.filter(p => (p.name || '').toLowerCase().includes(searchVal) || (p.category || '').toLowerCase().includes(searchVal));
    }

    if (items.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 24px; color: #94a3b8;">No se encontraron platos.</div>';
      return;
    }

    container.innerHTML = items.map(p => `
      <div class="stock-item-card">
        <div class="stock-item-info">
          <img src="${p.image || '/imagenes/portada/Portada1E.webp'}" alt="${p.name}" class="stock-item-img">
          <div>
            <div class="stock-item-name">${window.AdminUtils.escapeHtml(p.name)}</div>
            <div class="stock-item-category">S/ ${Number(p.price || 0).toFixed(2)}</div>
          </div>
        </div>

        <button type="button" class="stock-toggle-btn ${p.available ? 'available' : 'soldout'}" onclick="window.toggleProductStockInKitchen('${p.id}', ${Boolean(p.available)})">
          ${p.available ? '🟢 Disponible' : '🔴 AGOTADO'}
        </button>
      </div>
    `).join('');
  }

  async function toggleProductStockInKitchen(id, currentAvailable) {
    const newAvailable = !currentAvailable;
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newAvailable })
      });
      if (res.ok) {
        const prod = kitchenProducts.find(p => p.id === id);
        if (prod) prod.available = newAvailable;
        renderKitchenStockList();
        window.showToast?.(`Estado de plato actualizado`, 'success');
      }
    } catch (e) {
      console.error('Error toggling stock:', e);
    }
  }

  // Real-time EventSource connection for instant orders push
  function initRealtimeOrders() {
    if ('EventSource' in window) {
      try {
        const evtSource = new EventSource('/api/orders/events');
        evtSource.addEventListener('new_order', (e) => {
          fetchOrders();
        });
        evtSource.addEventListener('order_update', (e) => {
          fetchOrders();
        });
      } catch (err) {
        console.warn('EventSource warning:', err);
      }
    }

    // Polling fallback every 15s
    setInterval(fetchOrders, 15000);
  }

  // Bindings para el scope global
  window.fetchOrders = fetchOrders;
  window.renderAllOrders = renderAllOrders;
  window.filterAllOrdersList = renderAllOrders;
  window.changeOrderStatus = changeOrderStatus;
  window.switchPedidosTab = switchPedidosTab;
  window.toggleKdsFullScreen = toggleKdsFullScreen;
  window.toggleKdsSound = () => BuchisapaKdsAudio.toggleSound();
  window.toggleKdsVoice = () => BuchisapaKdsAudio.toggleVoice();
  window.testKdsSoundAlert = () => BuchisapaKdsAudio.triggerAlert({ orderNumber: 'PRUEBA-101', customerName: 'Carlos Mendoza' });
  window.enableKdsAudioContext = () => BuchisapaKdsAudio.initCtx();
  window.openKitchenStockModal = openKitchenStockModal;
  window.closeKitchenStockModal = closeKitchenStockModal;
  window.filterKitchenStockList = renderKitchenStockList;
  window.toggleProductStockInKitchen = toggleProductStockInKitchen;

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    BuchisapaKdsAudio.updateAudioUi();
    fetchOrders();
    initRealtimeOrders();
  });

  // Ejecución inmediata si el script se carga dinámicamente
  BuchisapaKdsAudio.updateAudioUi();
  fetchOrders();
  initRealtimeOrders();

})();
