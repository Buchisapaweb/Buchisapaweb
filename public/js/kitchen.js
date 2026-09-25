/**
 * RESTAURANTE BUCHISAPA - Lógica KDS de Cocina en Tiempo Real con Alerta Sonora Automática
 */

let orders = [];

// =========================================================
// SISTEMA DE ALERTA SONORA AUTOMÁTICA EN KDS (WEB AUDIO API)
// =========================================================
const BuchisapaKdsAudio = {
  audioCtx: null,
  soundEnabled: true,
  voiceEnabled: true,
  knownOrderIds: new Set(),
  isFirstLoad: true,

  init() {
    const savedSound = localStorage.getItem('buchisapa_kds_sound');
    if (savedSound !== null) {
      this.soundEnabled = savedSound === 'true';
    }
    const savedVoice = localStorage.getItem('buchisapa_kds_voice');
    if (savedVoice !== null) {
      this.voiceEnabled = savedVoice === 'true';
    }

    this.updateControlsUI();

    // Desbloquear AudioContext en la primera interacción física del usuario
    const unlockAudio = () => {
      this.initAudio();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio, { passive: true });
    document.addEventListener('touchstart', unlockAudio, { passive: true });
    document.addEventListener('keydown', unlockAudio, { passive: true });

    // Conectar a flujo SSE para recepción instantánea de pedidos en tiempo real
    this.connectSSE();
  },

  initAudio() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.updateControlsUI();
    } catch (e) {
      console.warn('AudioContext init notice:', e);
    }
  },

  /**
   * Campana dual de cocina acústica de alta presencia (estilo KDS profesional)
   */
  playChime() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // Primer acorde de campana brillante (E5 659.25Hz + B5 987.77Hz + E6 1318.51Hz)
      this.createBellNote(659.25, now, 0.45, 0.7);
      this.createBellNote(987.77, now, 0.35, 0.4);
      this.createBellNote(1318.51, now, 0.25, 0.2);

      // Segundo acorde de campana resonante (A5 880.00Hz + E6 1318.51Hz + A6 1760Hz) a los 220ms
      this.createBellNote(880.00, now + 0.22, 0.65, 0.85);
      this.createBellNote(1318.51, now + 0.22, 0.45, 0.5);
      this.createBellNote(1760.00, now + 0.22, 0.30, 0.25);

      // Tercer toque de confirmación enérgica (C6 1046.50Hz + G6 1567.98Hz) a los 550ms
      this.createBellNote(1046.50, now + 0.55, 0.8, 0.9);
      this.createBellNote(1567.98, now + 0.55, 0.5, 0.4);
    } catch (err) {
      console.warn('Error playing chime:', err);
    }
  },

  createBellNote(freq, startTime, duration, maxGain) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(maxGain * 0.45, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  },

  speakOrder(orderNumber, customerName) {
    if (!this.voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const numClean = String(orderNumber || '').replace(/^ORD-/, '');
      const text = `¡Nuevo pedido número ${numClean}! ${customerName ? 'Cliente: ' + customerName : ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-PE';
      utterance.rate = 1.05;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 750);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  },

  triggerNewOrderAlert(order) {
    if (!order) return;

    // 1. Alerta sonora campana KDS
    this.playChime();

    // 2. Anuncio de voz sintetizada opcional
    if (this.voiceEnabled) {
      this.speakOrder(order.orderNumber || order.order_number || order.id, order.customerName || order.customer_name);
    }

    // 3. Banner superior de atención inmediata
    showNewOrderBanner(order);

    // 4. Destello visual en la tarjeta
    highlightNewOrderCard(order.id);
  },

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('buchisapa_kds_sound', this.soundEnabled);
    this.initAudio();
    if (this.soundEnabled) {
      this.playChime();
    }
    this.updateControlsUI();
  },

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    localStorage.setItem('buchisapa_kds_voice', this.voiceEnabled);
    if (this.voiceEnabled && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('Voz de avisos activada');
      u.lang = 'es-PE';
      window.speechSynthesis.speak(u);
    }
    this.updateControlsUI();
  },

  updateControlsUI() {
    const soundBtn = document.getElementById('kds-sound-toggle-btn');
    const voiceBtn = document.getElementById('kds-voice-toggle-btn');
    const dot = document.getElementById('kds-audio-dot');
    const statusText = document.getElementById('kds-audio-status-text');
    const prompt = document.getElementById('kds-audio-permission-prompt');

    if (soundBtn) {
      if (this.soundEnabled) {
        soundBtn.className = 'kds-btn kds-btn-sound';
        soundBtn.innerHTML = '🔊 Sonido: ACTIVO';
      } else {
        soundBtn.className = 'kds-btn kds-btn-sound muted';
        soundBtn.innerHTML = '🔇 Sonido: SILENCIADO';
      }
    }

    if (voiceBtn) {
      if (this.voiceEnabled) {
        voiceBtn.style.background = '#1e293b';
        voiceBtn.style.color = '#93c5fd';
        voiceBtn.style.borderColor = '#3b82f6';
        voiceBtn.innerHTML = '🗣️ Voz: ON';
      } else {
        voiceBtn.style.background = '#334155';
        voiceBtn.style.color = '#94a3b8';
        voiceBtn.style.borderColor = '#475569';
        voiceBtn.innerHTML = '🗣️ Voz: OFF';
      }
    }

    const isSuspended = this.audioCtx && this.audioCtx.state === 'suspended';

    if (dot) {
      dot.className = 'kds-audio-dot' + (!this.soundEnabled ? ' muted' : (isSuspended ? ' suspended' : ''));
    }

    if (statusText) {
      if (!this.soundEnabled) {
        statusText.textContent = 'Alerta Sonora: Silenciada manualmente por el personal';
      } else if (isSuspended) {
        statusText.textContent = 'Alerta Sonora: Esperando interacción (haz clic para activar audio)';
      } else {
        statusText.textContent = 'Alerta Sonora en Vivo: Activa (Campana Dual KDS + Sintetizador)';
      }
    }

    if (prompt) {
      prompt.style.display = (this.soundEnabled && isSuspended) ? 'inline-block' : 'none';
    }
  },

  connectSSE() {
    try {
      const eventSource = new EventSource('/api/orders/events');

      eventSource.addEventListener('new_order', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.order) {
            console.log('🔔 KDS Recibió NUEVO PEDIDO vía SSE:', data.order);
            this.handleIncomingOrder(data.order);
          }
        } catch (err) {
          console.error('Error parseando new_order SSE:', err);
        }
      });

      eventSource.addEventListener('order_update', (e) => {
        fetchOrders();
      });
    } catch (e) {
      console.warn('SSE connection notice:', e);
    }
  },

  handleIncomingOrder(order) {
    if (!order || !order.id) return;

    if (this.knownOrderIds.has(order.id)) return;
    this.knownOrderIds.add(order.id);

    const exists = orders.some(o => o.id === order.id);
    if (!exists) {
      orders.unshift(order);
      renderKDS();
    }

    this.triggerNewOrderAlert(order);
  },

  async testSoundWithOrder() {
    this.initAudio();
    try {
      const res = await fetch('/api/kitchen/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: 'Cliente Prueba KDS' })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.order) {
          this.handleIncomingOrder(json.order);
        }
      } else {
        const testOrder = {
          id: `TEST-${Date.now()}`,
          orderNumber: Math.floor(100 + Math.random() * 900),
          customerName: 'Cliente Buchisapa (Prueba Sonora)',
          status: 'recibido',
          total: 36.00
        };
        this.handleIncomingOrder(testOrder);
      }
    } catch (err) {
      const testOrder = {
        id: `TEST-${Date.now()}`,
        orderNumber: Math.floor(100 + Math.random() * 900),
        customerName: 'Cliente Buchisapa (Prueba Sonora)',
        status: 'recibido',
        total: 36.00
      };
      this.handleIncomingOrder(testOrder);
    }
  }
};

window.BuchisapaKdsAudio = BuchisapaKdsAudio;

// =========================================================
// BANNER DE NUEVA COMANDA Y RESALTADO VISUAL
// =========================================================
let newOrderBannerTimeout = null;

function showNewOrderBanner(order) {
  const banner = document.getElementById('kds-new-order-banner');
  const title = document.getElementById('kds-banner-title');
  const subtitle = document.getElementById('kds-banner-subtitle');

  if (!banner || !title || !subtitle) return;

  const orderNum = order.orderNumber || order.order_number || (order.id ? order.id.slice(-4) : 'NUEVO');
  const name = order.customerName || order.customer_name || 'Cliente';
  const total = Number(order.total || 0).toFixed(2);
  const type = (order.orderType === 'delivery' || order.order_type === 'delivery') ? '🛵 Delivery' : '🏪 Salón / Mesa';

  title.textContent = `¡NUEVO PEDIDO ENTRANTE! #${orderNum}`;
  subtitle.textContent = `${name} | S/ ${total} | ${type}`;

  banner.style.display = 'flex';

  if (newOrderBannerTimeout) clearTimeout(newOrderBannerTimeout);
  newOrderBannerTimeout = setTimeout(() => {
    dismissNewOrderBanner();
  }, 12000);
}

function dismissNewOrderBanner() {
  const banner = document.getElementById('kds-new-order-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function highlightNewOrderCard(orderId) {
  setTimeout(() => {
    const card = document.getElementById(`card-${orderId}`);
    if (card) {
      card.classList.add('new-arrival-pulse');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => {
        card.classList.remove('new-arrival-pulse');
      }, 20000);
    }
  }, 150);
}

// =========================================================
// INICIALIZACIÓN Y CICLO DE VIDA KDS
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  BuchisapaKdsAudio.init();
  fetchOrders();
  setInterval(fetchOrders, 8000);
});

async function fetchOrders() {
  try {
    let fetched = [];
    const res = await window.BuchisapaAPI.request('orders?select=*&order=created_at.desc&limit=30');
    if (Array.isArray(res)) {
      fetched = res;
    } else {
      const direct = await fetch('/api/orders');
      if (direct.ok) {
        const json = await direct.json();
        if (json.data && Array.isArray(json.data)) {
          fetched = json.data;
        }
      }
    }

    if (Array.isArray(fetched)) {
      // Detección diferencial de pedidos entrantes
      if (BuchisapaKdsAudio.isFirstLoad) {
        fetched.forEach(o => BuchisapaKdsAudio.knownOrderIds.add(o.id));
        BuchisapaKdsAudio.isFirstLoad = false;
      } else {
        fetched.forEach(o => {
          if ((o.status === 'recibido' || o.status === 'nuevo') && !BuchisapaKdsAudio.knownOrderIds.has(o.id)) {
            BuchisapaKdsAudio.handleIncomingOrder(o);
          } else {
            BuchisapaKdsAudio.knownOrderIds.add(o.id);
          }
        });
      }

      orders = fetched;
      renderKDS();
    }
  } catch (e) {
    console.error('Error obteniendo pedidos de cocina:', e);
  }
}

function renderKDS() {
  const colRecibidos = document.getElementById('kds-recibidos');
  const colPreparacion = document.getElementById('kds-preparacion');
  const colListos = document.getElementById('kds-listos');

  if (!colRecibidos || !colPreparacion || !colListos) return;

  const recibidos = orders.filter(o => o.status === 'recibido' || o.status === 'nuevo');
  const preparacion = orders.filter(o => o.status === 'en_preparacion' || o.status === 'preparando');
  const listos = orders.filter(o => o.status === 'listo' || o.status === 'completado');

  colRecibidos.innerHTML = recibidos.length ? recibidos.map(renderOrderCard).join('') : '<div style="text-align:center; color:#64748b; padding:24px;">No hay pedidos nuevos por atender.</div>';
  colPreparacion.innerHTML = preparacion.length ? preparacion.map(renderOrderCard).join('') : '<div style="text-align:center; color:#64748b; padding:24px;">Ningún plato en preparación actualmente.</div>';
  colListos.innerHTML = listos.length ? listos.map(renderOrderCard).join('') : '<div style="text-align:center; color:#64748b; padding:24px;">Ningún pedido esperando recojo.</div>';
}

function renderOrderCard(order) {
  let items = [];
  try {
    if (Array.isArray(order.items)) {
      items = order.items;
    } else if (typeof order.items === 'string') {
      items = JSON.parse(order.items || '[]');
    } else if (order.items && typeof order.items === 'object') {
      items = Array.isArray(order.items.items) ? order.items.items : [];
    }
  } catch (e) {
    items = [];
  }
  if (!Array.isArray(items)) items = [];

  const time = new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let nextStatus = 'en_preparacion';
  let nextLabel = '🧑‍🍳 Preparar';
  if (order.status === 'en_preparacion') {
    nextStatus = 'listo';
    nextLabel = '✅ Listo';
  } else if (order.status === 'listo') {
    nextStatus = 'entregado';
    nextLabel = '🚀 Despachar';
  }

  return `
    <div class="kds-order-card" id="card-${order.id}">
      <div class="kds-order-top">
        <span class="kds-order-num">#${order.order_number || order.orderNumber || (order.id ? order.id.slice(-4) : '000')}</span>
        <span class="kds-order-time">${time} (${order.order_type || order.orderType || 'delivery'})</span>
      </div>
      <div class="kds-order-client">👤 ${order.customer_name || order.customerName || 'Cliente'} - 📞 ${order.customer_phone || order.customerPhone || '-'}</div>
      <div style="margin-bottom: 8px;">
        ${items.map(it => {
          const name = it.name || (it.item && it.item.name) || 'Plato';
          const qty = it.quantity || 1;
          const sauces = it.selectedSauces || (it.item && it.item.selectedSauces) || [];
          return `
          <div class="kds-item-row">
            <span><span class="kds-item-qty">${qty}x</span> ${name}</span>
            ${sauces && sauces.length ? `<span style="font-size:10px; color:#9ca3af;">[${sauces.join(',')}]</span>` : ''}
          </div>
          `;
        }).join('')}
      </div>
      ${order.notes ? `<div style="font-size:11px; color:#facc15; margin-bottom:8px;">⚠️ ${order.notes}</div>` : ''}
      <div class="kds-card-actions">
        <button class="kds-btn kds-btn-print" onclick="printTicket('${order.id}')">🖨️ Ticket</button>
        <button class="kds-btn kds-btn-next" onclick="updateOrderStatus('${order.id}', '${nextStatus}')">${nextLabel}</button>
      </div>
    </div>
  `;
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    // 1. Enviar a Express API para activar broadcast de Notificación Push en tiempo real
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.warn('Sync status express:', err));

    // 2. Sincronizar también con cliente Supabase / BuchisapaAPI
    if (window.BuchisapaAPI) {
      await window.BuchisapaAPI.request(`orders?id=eq.${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {});
    }

    // Feedback visual en la pantalla de cocina
    showKitchenNotice(`🔔 Notificación Push enviada al cliente: ${newStatus.toUpperCase()}`);
    fetchOrders();
  } catch (e) {
    console.error('Error actualizando estado:', e);
  }
}

function showKitchenNotice(msg) {
  let notice = document.getElementById('kds-toast-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'kds-toast-notice';
    notice.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#0f172a; color:#ffffff; border:1px solid #22c55e; padding:12px 18px; border-radius:10px; font-weight:700; font-size:13px; z-index:9999; box-shadow:0 8px 24px rgba(0,0,0,0.3); transition:all 0.3s ease; display:flex; align-items:center; gap:8px;';
    document.body.appendChild(notice);
  }
  notice.textContent = msg;
  notice.style.opacity = '1';
  notice.style.transform = 'translateY(0)';
  setTimeout(() => {
    notice.style.opacity = '0';
    notice.style.transform = 'translateY(10px)';
  }, 3500);
}

function printTicket(orderId) {
  const printerIp = window.BuchisapaPrinter ? window.BuchisapaPrinter.getPrinterIp() : (localStorage.getItem('buchisapa_printer_ip') || '192.168.8.100');
  let order = null;
  if (Array.isArray(allOrders)) {
    order = allOrders.find(o => String(o.id) === String(orderId));
  }

  const orderNum = order ? (order.order_number || order.orderNumber || String(order.id).slice(-4)) : String(orderId).slice(-4);
  const rawTicket = window.BuchisapaPrinter ? window.BuchisapaPrinter.buildTicketString(order || { id: orderId }) : '';

  currentKdsPrintingOrder = {
    orderNum,
    rawTicket,
    printerIp,
    order
  };

  const modal = document.getElementById('kds-ticket-modal');
  const paper = document.getElementById('kds-ticket-content');
  const title = document.getElementById('kds-ticket-modal-title');

  if (title) title.textContent = `Ticket de Comanda #${orderNum}`;
  if (paper) {
    if (window.BuchisapaPrinter) {
      paper.innerHTML = window.BuchisapaPrinter.formatTicketHtml(order || { id: orderId });
    }
  }

  if (modal) {
    modal.style.display = 'flex';
  } else {
    // Fallback directo a WiFi si no existiera modal
    sendTicketDirectToPrinter(rawTicket, printerIp, orderNum);
  }
}

let currentKdsPrintingOrder = null;

function closeKdsTicketModal() {
  const modal = document.getElementById('kds-ticket-modal');
  if (modal) modal.style.display = 'none';
  currentKdsPrintingOrder = null;
}

function printKdsTicketModal(mode = 'browser') {
  if (!currentKdsPrintingOrder) return;
  if (mode === 'wifi') {
    sendTicketDirectToPrinter(currentKdsPrintingOrder.rawTicket, currentKdsPrintingOrder.printerIp, currentKdsPrintingOrder.orderNum);
  } else {
    window.print();
    showKitchenToast('🖨️ Diálogo de impresión abierto');
  }
}

function sendTicketDirectToPrinter(ticket, printerIp, orderNum) {
  if (window.BuchisapaPrinter) {
    window.BuchisapaPrinter.sendRawToWifiPrinter(ticket, printerIp);
  } else {
    let hiddenIframe = document.querySelector('iframe[name="print_hidden"]');
    if (!hiddenIframe) {
      hiddenIframe = document.createElement('iframe');
      hiddenIframe.name = 'print_hidden';
      hiddenIframe.id = 'print_hidden';
      hiddenIframe.style.display = 'none';
      document.body.appendChild(hiddenIframe);
    }

    const form = document.createElement('form');
    form.action = `http://${printerIp}`;
    form.method = 'POST';
    form.target = 'print_hidden';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'printcontent';
    input.value = ticket;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => {
      if (form.parentNode) form.parentNode.removeChild(form);
    }, 1000);
  }

  showKitchenToast(`🖨️ Ticket #${orderNum} enviado a impresora WiFi (${printerIp})`);
}

window.closeKdsTicketModal = closeKdsTicketModal;
window.printKdsTicketModal = printKdsTicketModal;

// ==========================================
// CONTROL DE STOCK Y AGOTADOS EN COCINA
// ==========================================
let kitchenProducts = [];

async function openKitchenStockModal() {
  const modal = document.getElementById('kds-stock-modal');
  if (modal) {
    modal.style.display = 'flex';
    await fetchKitchenProducts();
  }
}

function closeKitchenStockModal() {
  const modal = document.getElementById('kds-stock-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function fetchKitchenProducts() {
  const list = document.getElementById('kds-stock-list');
  if (!list) return;

  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      kitchenProducts = await res.json();
      renderKitchenStockList();
    }
  } catch (err) {
    console.error('Error fetching kitchen products:', err);
    list.innerHTML = `<div style="color:#ef4444; padding:20px; text-align:center;">Error cargando la lista de platos.</div>`;
  }
}

function renderKitchenStockList() {
  const list = document.getElementById('kds-stock-list');
  if (!list) return;

  if (kitchenProducts.length === 0) {
    list.innerHTML = `<div style="color:#94a3b8; text-align:center; padding:20px;">No se encontraron productos registrados.</div>`;
    return;
  }

  list.innerHTML = kitchenProducts.map(prod => {
    const isAvailable = prod.available !== false && (prod.stock === undefined || prod.stock > 0);
    const currentStock = prod.stock !== undefined ? prod.stock : (isAvailable ? 15 : 0);

    return `
      <div style="display:flex; align-items:center; justify-content:space-between; background:#0f172a; padding:12px 16px; border-radius:12px; border:1px solid ${isAvailable ? '#334155' : '#7f1d1d'};">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${prod.image || 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=100'}" alt="${prod.name}" style="width:44px; height:44px; border-radius:8px; object-fit:cover;">
          <div>
            <div style="font-weight:800; font-size:14px; color:${isAvailable ? '#f8fafc' : '#f87171'};">${prod.name}</div>
            <div style="font-size:12px; color:#94a3b8;">
              Precio: S/ ${Number(prod.price).toFixed(2)} | 
              <span style="color:${isAvailable ? '#22c55e' : '#ef4444'}; font-weight:700;">
                ${isAvailable ? `✓ Disponible (${currentStock} und)` : '🚫 AGOTADO'}
              </span>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          onclick="toggleProductStock('${prod.id}', ${isAvailable})"
          style="
            background:${isAvailable ? '#dc2626' : '#16a34a'}; 
            color:#ffffff; 
            border:none; 
            border-radius:8px; 
            padding:8px 14px; 
            font-size:12.5px; 
            font-weight:800; 
            cursor:pointer;
            transition:opacity 0.15s;
          "
          title="Cambiar estado en tiempo real"
        >
          ${isAvailable ? 'Marcar Agotado' : 'Reactivar Stock'}
        </button>
      </div>
    `;
  }).join('');
}

async function toggleProductStock(productId, currentAvailable) {
  const newAvailable = !currentAvailable;
  const newStock = newAvailable ? 15 : 0;

  try {
    const res = await fetch(`/api/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: newAvailable, stock: newStock })
    });

    if (res.ok) {
      const updated = await res.json();
      showKitchenNotice(`📦 Plato "${updated.data?.name || productId}" actualizado a: ${newAvailable ? 'DISPONIBLE' : 'AGOTADO'}`);
      // Actualizar en el arreglo local y re-renderizar
      const idx = kitchenProducts.findIndex(p => p.id === productId);
      if (idx > -1) {
        kitchenProducts[idx].available = newAvailable;
        kitchenProducts[idx].stock = newStock;
        renderKitchenStockList();
      }
    }
  } catch (err) {
    console.error('Error toggling product stock:', err);
  }
}
