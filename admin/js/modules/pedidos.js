/**
 * BUCHISAPA ADMIN - ORDERS & KDS KITCHEN MODULE
 * Layer: /admin/js/modules/pedidos.js
 */

(function () {
  'use strict';

  let activeTab = 'list';
  let previousOrderIds = new Set();
  let kdsAudioCtx = null;
  let kitchenProducts = [];

  let currentStatusFilter = 'todos';
  let currentTypeFilter = 'todos';

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
    const state = window.AdminState = window.AdminState || {};
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

      state.allOrders = orders;
    } catch (e) {
      console.warn('Error al cargar órdenes del servidor, usando órdenes locales:', e);
      if (!state.allOrders || state.allOrders.length === 0) {
        state.allOrders = [
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
    const state = window.AdminState = window.AdminState || {};
    const orders = state.allOrders || [];

    let totalOrders = orders.length;
    let recibidos = 0;
    let preparacion = 0;
    let listos = 0;
    let entregados = 0;
    let cancelados = 0;
    let totalMonto = 0;

    orders.forEach(o => {
      const st = (o.status || 'pendiente').toLowerCase();
      if (st === 'pendiente' || st === 'recibido') recibidos++;
      else if (st === 'en_preparacion' || st === 'preparando') preparacion++;
      else if (st === 'listo' || st === 'en_camino') listos++;
      else if (st === 'entregado') entregados++;
      else if (st === 'cancelado') cancelados++;

      if (st !== 'cancelado') {
        totalMonto += Number(o.total || 0);
      }
    });

    // Actualizar contadores en los Chips
    const elChipTodos = document.getElementById('count-chip-todos');
    const elChipRecibido = document.getElementById('count-chip-recibido');
    const elChipPrep = document.getElementById('count-chip-preparacion');
    const elChipListo = document.getElementById('count-chip-listo');
    const elChipEntregado = document.getElementById('count-chip-entregado');
    const elChipCancelado = document.getElementById('count-chip-cancelado');

    if (elChipTodos) elChipTodos.textContent = totalOrders;
    if (elChipRecibido) elChipRecibido.textContent = recibidos;
    if (elChipPrep) elChipPrep.textContent = preparacion;
    if (elChipListo) elChipListo.textContent = listos;
    if (elChipEntregado) elChipEntregado.textContent = entregados;
    if (elChipCancelado) elChipCancelado.textContent = cancelados;

    renderAllOrders();
    window.updateDashboardMetrics?.();
  }

  // ============================================================================
  // FILTER CHIP SELECTION
  // ============================================================================
  function selectStatusFilter(val, btn) {
    currentStatusFilter = val || 'todos';

    const container = document.getElementById('status-chips-container');
    if (container) {
      container.querySelectorAll('.status-chip').forEach(chip => chip.classList.remove('active'));
    }
    if (btn) btn.classList.add('active');

    renderAllOrders();
  }

  function selectTypeFilter(val, btn) {
    currentTypeFilter = val || 'todos';

    const container = document.getElementById('type-chips-container');
    if (container) {
      container.querySelectorAll('.type-chip').forEach(chip => chip.classList.remove('active'));
    }
    if (btn) btn.classList.add('active');

    renderAllOrders();
  }

  // ============================================================================
  // RENDER ALL ORDERS (LIST VIEW & FILTERS)
  // ============================================================================
  function renderAllOrders() {
    const container = document.getElementById('all-orders-master-list');
    if (!container) return;

    let orders = (window.AdminState && window.AdminState.allOrders) || [];

    const searchInput = document.getElementById('pedidos-search-input');
    const searchVal = (searchInput?.value || '').toLowerCase().trim();

    const statusVal = currentStatusFilter || 'todos';
    const typeVal = currentTypeFilter || 'todos';

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
          <p style="font-size: 1.1rem; font-weight: 700; color: #ffffff;">No hay pedidos registrados con estos filtros</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Toca otra pestaña de estado arriba o ajusta la búsqueda.</p>
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
            <span class="order-timestamp">⏰ ${new Date(order.created_at || order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div class="order-customer-info">
            <div class="customer-info-line">
              <span class="order-customer-name">👤 ${window.AdminUtils.escapeHtml(order.customerName || order.customer?.name || 'Cliente')}</span>
              ${(order.customerPhone || order.customer?.phone) ? `<span class="order-customer-phone">📞 ${order.customerPhone || order.customer.phone}</span>` : ''}
            </div>
            ${(order.deliveryAddress || order.customer?.address) ? `<div class="customer-address-line">📍 ${window.AdminUtils.escapeHtml(order.deliveryAddress || order.customer.address)}</div>` : ''}
            <div class="customer-payment-line">💳 Pago: ${order.payment_method || order.paymentMethod || 'Efectivo'}</div>
          </div>

          <div class="order-items-summary">
            <div class="order-items-header">📋 Platos del Pedido:</div>
            ${parsedItems.map(item => `
              <div class="order-item-row">
                <div class="order-item-detail">
                  <span class="order-item-qty">${item.quantity || 1}x</span>
                  <span class="order-item-name">${window.AdminUtils.escapeHtml(item.name || item.title || 'Plato')}</span>
                </div>
                <span class="order-item-price">${window.AdminUtils.formatSoles((item.price || 0) * (item.quantity || 1))}</span>
              </div>
            `).join('')}
          </div>

          <div class="order-card-footer">
            <div class="order-total-group">
              <span class="total-label">Total a cobrar:</span>
              <span class="order-total-amount">${window.AdminUtils.formatSoles(order.total || 0)}</span>
            </div>

            <div class="order-stage-actions">
              ${status === 'pendiente' || status === 'recibido' ? `
                <button class="btn btn-primary btn-sm btn-action-step" onclick="window.changeOrderStatus('${order.id}', 'en_preparacion')">
                  🧑‍🍳 En Preparación
                </button>
              ` : ''}

              ${status === 'en_preparacion' || status === 'preparando' ? `
                <button class="btn btn-secondary btn-sm btn-action-step" style="border-color: #10b981; color: #10b981;" onclick="window.changeOrderStatus('${order.id}', 'listo')">
                  🚀 Despachar
                </button>
              ` : ''}

              ${status === 'listo' || status === 'en_camino' || status === 'despachado' ? `
                <button class="btn btn-primary btn-sm btn-action-step" onclick="window.changeOrderStatus('${order.id}', 'entregado')">
                  ✅ Marcar Entregado
                </button>
              ` : ''}

              <button class="btn btn-secondary btn-sm btn-action-step" onclick="window.previewThermalTicketFromOrder('${order.id}')" title="Imprimir Ticket">
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
    if (status === 'listo' || status === 'en_camino' || status === 'despachado') return 'badge-green';
    if (status === 'entregado') return 'badge-purple';
    if (status === 'cancelado') return 'badge-red';
    return 'badge-amber';
  }

  function getStatusLabel(status) {
    if (status === 'en_preparacion' || status === 'preparando') return 'En Preparación';
    if (status === 'listo' || status === 'en_camino' || status === 'despachado') return 'Despachado';
    if (status === 'entregado') return 'Entregado';
    if (status === 'cancelado') return 'Cancelado';
    return 'Pendiente';
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
  // FULL-PAGE KITCHEN STOCK & CARTA AVAILABILITY MANAGEMENT
  // ============================================================================
  let activeStockCategory = 'todos';

  async function openKitchenStockModal() {
    const modal = document.getElementById('admin-kds-stock-modal');
    if (!modal) return;

    modal.classList.add('active');

    try {
      const res = await window.AdminApi.getProducts(true);
      if (Array.isArray(res)) {
        kitchenProducts = res;
      } else if (res && Array.isArray(res.data)) {
        kitchenProducts = res.data;
      } else if (res && res.products && Array.isArray(res.products)) {
        kitchenProducts = res.products;
      } else {
        kitchenProducts = window.AdminState.products || [];
      }
    } catch (e) {
      console.warn('Error al obtener platos para control de stock:', e);
      kitchenProducts = window.AdminState.products || [];
    }

    renderKitchenStockList();
  }

  function closeKitchenStockModal() {
    const modal = document.getElementById('admin-kds-stock-modal');
    if (modal) modal.classList.remove('active');
  }

  function filterStockByCategory(cat, btn) {
    activeStockCategory = cat || 'todos';

    const container = document.getElementById('stock-category-pills');
    if (container) {
      const pills = container.querySelectorAll('.category-pill');
      pills.forEach(p => p.classList.remove('active'));
    }
    if (btn) btn.classList.add('active');

    renderKitchenStockList();
  }

  function renderKitchenStockList() {
    const container = document.getElementById('admin-kds-stock-list');
    const searchVal = (document.getElementById('stock-modal-search')?.value || '').toLowerCase().trim();

    if (!container) return;

    let items = kitchenProducts || [];

    if (searchVal) {
      items = items.filter(p => 
        (p.name || '').toLowerCase().includes(searchVal) ||
        (p.category || '').toLowerCase().includes(searchVal) ||
        (p.description || '').toLowerCase().includes(searchVal)
      );
    }

    if (activeStockCategory !== 'todos') {
      items = items.filter(p => {
        const cat = (p.category || '').toLowerCase();
        if (activeStockCategory === 'pollos') return cat.includes('pollo') || cat.includes('broaster') || cat.includes('brasa');
        if (activeStockCategory === 'tipicos') return cat.includes('tipico') || cat.includes('tacacho') || cat.includes('amazonic');
        if (activeStockCategory === 'bebidas') return cat.includes('bebida') || cat.includes('refresco') || cat.includes('jugo');
        if (activeStockCategory === 'combos') return cat.includes('combo') || cat.includes('promo') || cat.includes('familiar');
        return true;
      });
    }

    const elAvailable = document.getElementById('stock-count-available');
    const elSoldout = document.getElementById('stock-count-soldout');

    const totalAvailable = kitchenProducts.filter(p => p.available !== false).length;
    const totalSoldout = kitchenProducts.filter(p => p.available === false).length;

    if (elAvailable) elAvailable.textContent = totalAvailable;
    if (elSoldout) elSoldout.textContent = totalSoldout;

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: #94a3b8;">
          <p style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">No se encontraron platos con este filtro</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Intenta buscar por otro término o selecciona "Todos".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(p => {
      const isAvailable = p.available !== false;
      const priceFormatted = window.AdminUtils ? window.AdminUtils.formatSoles(p.price || 0) : `S/ ${Number(p.price || 0).toFixed(2)}`;
      const fallbackImg = '/imagenes/portada/Portada1E.webp';

      return `
        <div class="stock-card-item ${!isAvailable ? 'is-soldout' : ''}">
          <div class="stock-card-media">
            <img src="${p.image || fallbackImg}" alt="${window.AdminUtils.escapeHtml(p.name)}" class="stock-card-img" onerror="this.src='${fallbackImg}'">
            <div class="stock-card-details">
              <div class="stock-card-name" title="${window.AdminUtils.escapeHtml(p.name)}">${window.AdminUtils.escapeHtml(p.name)}</div>
              <div class="stock-card-price">${priceFormatted}</div>
              <div class="stock-card-cat">${window.AdminUtils.escapeHtml(p.category || 'Carta Buchisapa')}</div>
            </div>
          </div>

          <button type="button" class="btn-toggle-stock ${isAvailable ? 'available' : 'soldout'}" onclick="window.toggleProductStockInKitchen('${p.id}', ${Boolean(isAvailable)})">
            ${isAvailable ? '🟢 DISPONIBLE' : '🔴 AGOTADO'}
          </button>
        </div>
      `;
    }).join('');
  }

  async function toggleProductStockInKitchen(id, currentAvailable) {
    const newAvailable = !currentAvailable;

    const prod = kitchenProducts.find(p => p.id === id || String(p.id) === String(id));
    if (prod) prod.available = newAvailable;
    renderKitchenStockList();

    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newAvailable })
      });

      if (res.ok) {
        window.showToast?.(newAvailable ? '🟢 Plato habilitado en carta' : '🔴 Plato marcado como agotado', 'success');
      } else {
        if (prod) prod.available = currentAvailable;
        renderKitchenStockList();
        window.showToast?.('Error al cambiar estado en servidor', 'error');
      }
    } catch (e) {
      console.error('Error al cambiar estado de stock:', e);
      if (prod) prod.available = currentAvailable;
      renderKitchenStockList();
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
        evtSource.addEventListener('stock_update', (e) => {
          if (document.getElementById('admin-kds-stock-modal')?.classList.contains('active')) {
            openKitchenStockModal();
          }
        });
      } catch (err) {
        console.warn('EventSource warning:', err);
      }
    }

    setInterval(fetchOrders, 15000);
  }

  // Bindings para el scope global
  window.fetchOrders = fetchOrders;
  window.renderAllOrders = renderAllOrders;
  window.filterAllOrdersList = renderAllOrders;
  window.selectStatusFilter = selectStatusFilter;
  window.selectTypeFilter = selectTypeFilter;
  window.changeOrderStatus = changeOrderStatus;
  window.toggleKdsSound = () => BuchisapaKdsAudio.toggleSound();
  window.toggleKdsVoice = () => BuchisapaKdsAudio.toggleVoice();
  window.testKdsSoundAlert = () => BuchisapaKdsAudio.triggerAlert({ orderNumber: 'PRUEBA-101', customerName: 'Carlos Mendoza' });
  window.enableKdsAudioContext = () => BuchisapaKdsAudio.initCtx();
  window.openKitchenStockModal = openKitchenStockModal;
  window.closeKitchenStockModal = closeKitchenStockModal;
  window.filterKitchenStockList = renderKitchenStockList;
  window.filterStockByCategory = filterStockByCategory;
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
