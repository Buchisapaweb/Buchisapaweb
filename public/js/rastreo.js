/**
 * BUCHISAPA ORDER TRACKER (RASTREADOR EN TIEMPO REAL CON LEAFLET.JS)
 * Visualización en tiempo real del estado del pedido, barra de progreso y
 * mapa interactivo con ubicación animada y coordenadas mock del repartidor en vivo.
 */

(function () {
  // Coordenadas base (Buchisapa Santa Clara - Av. La Estrella con Calle 28 de Julio, Ate)
  const RESTAURANT_COORDS = [-12.0165, -76.8852];
  const DEFAULT_DESTINATION_COORDS = [-12.0295, -76.9025];

  // Puntos de ruta realista para el motorizado por avenidas principales de Santa Clara / Ate
  const ROUTE_WAYPOINTS = [
    [-12.0165, -76.8852], // Salida Buchisapa (Av. La Estrella)
    [-12.0182, -76.8875], // Av. La Estrella / Calle 28 de Julio
    [-12.0205, -76.8910], // Av. Nicolás de Piérola
    [-12.0230, -76.8945], // Av. San Alfonso
    [-12.0255, -76.8980], // Av. Central
    [-12.0275, -76.9005], // Jr. San Martín
    [-12.0295, -76.9025]  // Destino Cliente
  ];

  // Fórmula Haversine para distancia exacta entre dos puntos GPS (en km)
  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const BuchisapaOrderTracker = {
    currentOrderId: null,
    currentOrder: null,
    pollingInterval: null,
    leafletMap: null,
    motoMarker: null,
    restaurantMarker: null,
    destinationMarker: null,
    routePolyline: null,
    routeGlowPolyline: null,
    animationFrameId: null,
    routeProgress: 0.18, // 0.0 to 1.0
    direction: 1,
    lastStatus: null,
    etaMinutes: 14,
    etaSeconds: 30,
    etaInterval: null,
    autoFollow: true,
    currentCoords: RESTAURANT_COORDS,
    currentSpeed: 32,

    // Inicializar o abrir el rastreador con un ID de pedido
    init: async function (orderId) {
      this.currentOrderId = orderId || this.getSavedOrDemoOrderId();
      await this.fetchOrderData();
      this.render();
      this.startLivePolling();
      this.startEtaCountdown();
    },

    getSavedOrDemoOrderId: function () {
      try {
        const saved = localStorage.getItem('buchisapa_last_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.id || parsed.orderNumber)) {
            return parsed.id || parsed.orderNumber;
          }
        }
      } catch (e) {}

      // Si no hay pedido guardado pero hay artículos en el carrito, generar ID dinámico vinculado
      try {
        const cartRaw = localStorage.getItem('buchisapa_cart_v1');
        if (cartRaw) {
          const cartItems = JSON.parse(cartRaw);
          if (Array.isArray(cartItems) && cartItems.length > 0) {
            return 'ORD-CART';
          }
        }
      } catch (e) {}

      return 'ORD-1001'; // Pedido demo por defecto
    },

    // Obtener datos del pedido desde la API en vivo o del carrito real / último pedido
    fetchOrderData: async function () {
      try {
        if (this.currentOrderId && this.currentOrderId !== 'ORD-CART') {
          const res = await fetch(`/api/orders/${this.currentOrderId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const orderData = json.data;
              // Parsear items si viene en string
              if (typeof orderData.items === 'string') {
                try {
                  orderData.items = JSON.parse(orderData.items);
                } catch (e) {}
              }
              this.currentOrder = orderData;
              this.handleStatusChange(this.currentOrder.status);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Error obteniendo pedido en vivo:', e);
      }

      // Si el pedido buscado es el último pedido guardado en localStorage
      try {
        const lastOrderRaw = localStorage.getItem('buchisapa_last_order');
        if (lastOrderRaw) {
          const lastOrder = JSON.parse(lastOrderRaw);
          if (
            lastOrder &&
            (lastOrder.id === this.currentOrderId ||
             String(lastOrder.orderNumber) === String(this.currentOrderId) ||
             this.currentOrderId === 'ORD-CART' ||
             !this.currentOrderId)
          ) {
            if (typeof lastOrder.items === 'string') {
              try {
                lastOrder.items = JSON.parse(lastOrder.items);
              } catch (e) {}
            }
            this.currentOrder = lastOrder;
            this.handleStatusChange(this.currentOrder.status || 'recibido');
            return;
          }
        }
      } catch (e) {
        console.warn('Error leyendo último pedido local:', e);
      }

      // USAR DATOS REALES DEL CARRITO (buchisapa_cart_v1)
      let cartItems = [];
      try {
        const cartRaw = localStorage.getItem('buchisapa_cart_v1');
        if (cartRaw) {
          const parsed = JSON.parse(cartRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cartItems = parsed;
          }
        }
      } catch (e) {
        console.warn('Error leyendo carrito real:', e);
      }

      if (cartItems.length > 0) {
        // Mapear los productos reales del carrito con sus precios, cantidades y complementos
        let cartSubtotal = 0;
        const formattedItems = cartItems.map(ci => {
          const qty = parseInt(ci.quantity) || 1;
          const price = parseFloat(ci.price) || 0;
          const itemTotal = price * qty;
          cartSubtotal += itemTotal;

          const saucesText = Array.isArray(ci.selectedSauces) && ci.selectedSauces.length > 0
            ? ci.selectedSauces.join(', ')
            : '';

          return {
            id: ci.id,
            name: ci.name || 'Plato Buchisapa',
            price: price,
            quantity: qty,
            option: ci.option || '',
            selectedSauces: ci.selectedSauces || [],
            saucesText: saucesText,
            notes: ci.notes || '',
            image: ci.image || ''
          };
        });

        // Obtener tipo de orden guardado
        let orderType = 'delivery';
        try {
          const storedType = localStorage.getItem('buchisapa_order_type');
          if (storedType) orderType = storedType;
        } catch (e) {}

        const deliveryCost = orderType === 'delivery' ? 0 : 0;
        const totalAmount = cartSubtotal + deliveryCost;

        this.currentOrder = {
          id: this.currentOrderId && this.currentOrderId !== 'ORD-CART' ? this.currentOrderId : 'ORD-' + Math.floor(1000 + Math.random() * 9000),
          orderNumber: Math.floor(100 + Math.random() * 900),
          customerName: 'Cliente Buchisapa',
          customerPhone: '942 475 459',
          customerEmail: 'cliente@buchisapa.pe',
          orderType: orderType,
          deliveryAddress: orderType === 'delivery' ? 'Jr. San Martín 450, Santa Clara, Ate (Referencia: Real Plaza)' : 'Recojo en Salón Buchisapa (Santa Clara, Ate)',
          paymentMethod: 'Yape',
          notes: 'Preparación fresca al momento con ají de cocona y cremas de la casa',
          status: 'preparando',
          total: totalAmount,
          subtotal: cartSubtotal,
          items: formattedItems,
          createdAt: new Date().toISOString(),
          isFromRealCart: true
        };
        this.handleStatusChange(this.currentOrder.status);
        return;
      }

      // Si no hay carrito ni pedido en servidor, usar estado de fallback
      if (!this.currentOrder) {
        this.currentOrder = {
          id: this.currentOrderId || 'ORD-1001',
          orderNumber: 101,
          customerName: 'Cliente Buchisapa',
          customerPhone: '942 475 459',
          deliveryAddress: 'Jr. San Martín 450, Santa Clara, Ate',
          paymentMethod: 'Yape',
          notes: 'Ají extra y cremas',
          status: 'en_camino',
          total: 48.00,
          items: [
            { id: 'ama-1', name: '1/2 Pollo a la Brasa + Papas Fritas', quantity: 1, price: 36.00 },
            { id: 'ref-1', name: 'Chicha Morada 1L', quantity: 1, price: 12.00 }
          ],
          createdAt: new Date().toISOString()
        };
      }
    },

    // Polling en tiempo real cada 3 segundos
    startLivePolling: function () {
      this.stopLivePolling();
      this.pollingInterval = setInterval(async () => {
        if (!this.currentOrderId) return;
        try {
          const res = await fetch(`/api/orders/${this.currentOrderId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const updated = json.data;
              if (this.currentOrder && this.currentOrder.status !== updated.status) {
                this.currentOrder = updated;
                this.handleStatusChange(updated.status);
                this.updateUI();
              }
            }
          }
        } catch (e) {}
      }, 3000);
    },

    stopLivePolling: function () {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      if (this.etaInterval) {
        clearInterval(this.etaInterval);
        this.etaInterval = null;
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },

    startEtaCountdown: function () {
      if (this.etaInterval) clearInterval(this.etaInterval);
      this.etaInterval = setInterval(() => {
        if (this.currentOrder && this.currentOrder.status === 'en_camino') {
          if (this.etaSeconds > 0) {
            this.etaSeconds--;
          } else if (this.etaMinutes > 0) {
            this.etaMinutes--;
            this.etaSeconds = 59;
          }
          this.updateEtaDisplay();
        }
      }, 1000);
    },

    updateEtaDisplay: function () {
      const etaEl = document.getElementById('tracker-eta-time');
      const hudEtaEl = document.getElementById('tracker-hud-eta');
      const timeStr = `${String(this.etaMinutes).padStart(2, '0')}:${String(this.etaSeconds).padStart(2, '0')} min`;
      if (etaEl) etaEl.textContent = timeStr;
      if (hudEtaEl) hudEtaEl.textContent = timeStr;
    },

    handleStatusChange: function (newStatus) {
      if (this.lastStatus !== newStatus) {
        const prev = this.lastStatus;
        this.lastStatus = newStatus;

        if (prev !== null && window.BuchisapaPush) {
          const order = this.currentOrder || {};
          window.BuchisapaPush.handleIncomingOrderUpdate({
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: newStatus,
            stage: newStatus,
            title: this.getStatusHeadline(newStatus),
            message: this.getStatusSubtext(newStatus)
          });
        }
      }
    },

    // Renderizar la interfaz en el contenedor modal
    render: function () {
      const container = document.getElementById('tracker-modal-content');
      if (!container) return;

      const order = this.currentOrder;
      const status = (order.status || 'recibido').toLowerCase();
      const currentId = order.orderNumber || order.id || 'ORD-1001';

      // Sincronizar enlace a la ventana nueva en el header del modal si existe
      const newWindowBtn = document.getElementById('tracker-open-new-window-btn');
      if (newWindowBtn) {
        newWindowBtn.href = `/order-status.html?id=${encodeURIComponent(currentId)}`;
      }

      // Generar desglose de productos de la orden
      let itemsListHtml = '';
      let subtotal = 0;
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        itemsListHtml = order.items.map(it => {
          const name = it.name || it.item?.name || 'Plato Buchisapa';
          const qty = it.quantity || it.qty || 1;
          const price = Number(it.price || it.item?.price || 0) * qty;
          subtotal += price;

          // Cremas o salsas seleccionadas
          let saucesList = [];
          if (Array.isArray(it.selectedSauces) && it.selectedSauces.length > 0) {
            saucesList = it.selectedSauces;
          } else if (it.saucesText) {
            saucesList = [it.saucesText];
          } else if (it.item && Array.isArray(it.item.selectedSauces)) {
            saucesList = it.item.selectedSauces;
          }

          const optionDesc = it.option || it.item?.option || '';

          return `
            <div class="tracker-item-row" style="flex-direction: column; align-items: stretch; gap: 4px;">
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div class="tracker-item-left">
                  <span class="tracker-item-qty">${qty}x</span>
                  <span class="tracker-item-name">${name}</span>
                </div>
                <span class="tracker-item-price">S/ ${price.toFixed(2)}</span>
              </div>
              ${optionDesc ? `
                <div style="font-size: 11px; color: #64748b; padding-left: 28px; line-height: 1.3;">
                  ✨ ${optionDesc}
                </div>
              ` : ''}
              ${saucesList.length > 0 ? `
                <div style="font-size: 11px; color: #0284c7; padding-left: 28px; line-height: 1.3;">
                  🧴 Cremas: <strong>${Array.isArray(saucesList) ? saucesList.join(', ') : saucesList}</strong>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
      } else {
        subtotal = Number(order.total || 48.00);
        itemsListHtml = `
          <div class="tracker-item-row">
            <div class="tracker-item-left">
              <span class="tracker-item-qty">1x</span>
              <span class="tracker-item-name">Combo Tradicional Pollo + Guarnición</span>
            </div>
            <span class="tracker-item-price">S/ ${subtotal.toFixed(2)}</span>
          </div>
        `;
      }

      const totalToPay = Number(order.total || subtotal);

      const isStandalonePage = window.location.pathname.includes('order-status');

      container.innerHTML = `
        <!-- HERO STATUS BANNER -->
        <div class="tracker-status-hero">
          <div class="tracker-hero-top-row">
            <span class="tracker-order-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              PEDIDO #${currentId}
            </span>
            <div class="tracker-hero-badges-group">
              <div class="tracker-live-gps-pill">
                <span class="tracker-pulse-dot" style="background: #4ade80;"></span>
                <span>GPS EN VIVO</span>
              </div>
              ${!isStandalonePage ? `
              <a href="/order-status.html?id=${encodeURIComponent(currentId)}" target="_blank" class="tracker-external-window-chip" title="Ver en pantalla completa">
                <span>Pantalla completa ↗</span>
              </a>` : ''}
            </div>
          </div>
          <h2 class="tracker-hero-headline" id="tracker-hero-headline">
            ${this.getStatusHeadline(status)}
          </h2>
          <p class="tracker-hero-subtext" id="tracker-hero-subtext">
            ${this.getStatusSubtext(status)}
          </p>

          <div class="tracker-hero-eta-row">
            <div class="tracker-eta-badge-large">
              <div class="tracker-eta-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div class="tracker-eta-label">Tiempo estimado</div>
                <div class="tracker-eta-value" id="tracker-eta-time">${String(this.etaMinutes).padStart(2, '0')}:${String(this.etaSeconds).padStart(2, '0')} min</div>
              </div>
            </div>
            <div class="tracker-city-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Santa Clara, Ate - Lima</span>
            </div>
          </div>
        </div>

        <!-- PROGRESS STEPPER -->
        <div class="tracker-progress-card">
          <div class="tracker-progress-track-wrapper">
            <div class="tracker-progress-bg-line"></div>
            <div class="tracker-progress-active-line" id="tracker-active-line" style="width: ${this.getProgressPercentage(status)}%;"></div>
            <div class="tracker-stepper">
              <!-- Paso 1: Recibido -->
              <div class="tracker-step-item ${this.isStepActive(status, 'recibido')}" id="step-recibido">
                <div class="tracker-step-circle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span class="tracker-step-label">Recibido</span>
              </div>

              <!-- Paso 2: En Cocina -->
              <div class="tracker-step-item ${this.isStepActive(status, 'preparando')}" id="step-preparando">
                <div class="tracker-step-circle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                </div>
                <span class="tracker-step-label">En Cocina</span>
              </div>

              <!-- Paso 3: En Camino -->
              <div class="tracker-step-item ${this.isStepActive(status, 'en_camino')}" id="step-en_camino">
                <div class="tracker-step-circle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                </div>
                <span class="tracker-step-label">En Camino</span>
              </div>

              <!-- Paso 4: Entregado -->
              <div class="tracker-step-item ${this.isStepActive(status, 'entregado')}" id="step-entregado">
                <div class="tracker-step-circle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <span class="tracker-step-label">Entregado</span>
              </div>
            </div>
          </div>
        </div>

        <!-- VISUAL MAP COMPONENT -->
        <div class="tracker-map-card">
          <div class="tracker-map-header">
            <div class="tracker-map-title">
              <span class="tracker-map-icon-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
              </span>
              <div>
                <span class="tracker-map-heading">Seguimiento en Tiempo Real</span>
                <span class="tracker-map-subheading">GPS activo • Santa Clara</span>
              </div>
            </div>
            <div class="tracker-map-eta-badge">
              <span class="tracker-pulse-dot" style="background:#16a34a; width:6px; height:6px;"></span>
              <span>Ruta Santa Clara</span>
            </div>
          </div>

          <!-- Barra de Telemetría Superior Elegante -->
          <div class="tracker-map-telemetry-bar">
            <div class="tracker-hud-stat">
              <span class="tracker-hud-stat-label">Estado</span>
              <span class="tracker-hud-stat-value" id="tracker-hud-status">
                ${status === 'en_camino' ? 'En ruta' : (status === 'entregado' ? 'Entregado' : (status === 'preparando' ? 'En cocina' : 'Recibido'))}
              </span>
            </div>
            <div class="tracker-hud-divider"></div>
            <div class="tracker-hud-stat">
              <span class="tracker-hud-stat-label">Distancia</span>
              <span class="tracker-hud-stat-value" id="tracker-hud-dist">1.4 km</span>
            </div>
            <div class="tracker-hud-divider"></div>
            <div class="tracker-hud-stat">
              <span class="tracker-hud-stat-label">Velocidad</span>
              <span class="tracker-hud-stat-value" id="tracker-hud-speed">32 km/h</span>
            </div>
            <div class="tracker-hud-divider"></div>
            <div class="tracker-hud-stat">
              <span class="tracker-hud-stat-label">Llegada</span>
              <span class="tracker-hud-stat-value" id="tracker-hud-eta">${String(this.etaMinutes).padStart(2, '0')}:${String(this.etaSeconds).padStart(2, '0')}</span>
            </div>
          </div>

          <div class="tracker-map-container" id="tracker-map-container">
            <!-- Botones flotantes interactivos de navegación en el mapa -->
            <div class="tracker-map-floating-actions">
              <button type="button" class="tracker-hud-btn" onclick="BuchisapaOrderTracker.centerOnMoto()" title="Centrar cámara en el repartidor">
                <span>📍 Centrar</span>
              </button>
              <button type="button" id="tracker-autofollow-btn" class="tracker-hud-btn ${this.autoFollow ? 'active' : ''}" onclick="BuchisapaOrderTracker.toggleAutoFollow()" title="Seguir automáticamente">
                <span>🎥 Seguir</span>
              </button>
              <button type="button" class="tracker-hud-btn" onclick="BuchisapaOrderTracker.fitRoute()" title="Ver ruta completa">
                <span>🔍 Ruta</span>
              </button>
            </div>

            <!-- Contenedor donde se monta el mapa Leaflet -->
            <div id="leaflet-map-element" style="width: 100%; height: 100%;"></div>
          </div>
        </div>

        <!-- DRIVER / REPARTIDOR PROFILE CARD -->
        <div class="tracker-driver-card">
          <div class="tracker-driver-profile">
            <div class="tracker-driver-avatar">
              <span>MA</span>
              <span class="tracker-driver-verified-badge">✓</span>
            </div>
            <div>
              <h4 class="tracker-driver-name">Marcos Arévalo</h4>
              <p class="tracker-driver-vehicle">Motorizado Oficial #04 • Honda Wave 110 (Placa: 4512-4B)</p>
            </div>
          </div>
          <div class="tracker-driver-actions">
            <a href="tel:+51942475459" class="tracker-contact-btn" title="Llamar al repartidor">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
            <a href="https://wa.me/51942475459?text=Hola%20Marcos,%20deseo%20consultar%20sobre%20mi%20pedido%20Buchisapa%20${currentId}" target="_blank" class="tracker-contact-btn whatsapp" title="Enviar WhatsApp al repartidor">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
          </div>
        </div>

        <!-- DETALLE DEL PEDIDO Y DESTINO -->
        <div class="tracker-order-summary-card">
          <div class="tracker-summary-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 class="tracker-summary-title">Comanda y Entrega</h4>
              ${order.isFromRealCart ? `
                <span style="background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #a7f3d0;">
                  ✓ Datos de tu Carrito
                </span>
              ` : ''}
            </div>
            <span class="tracker-summary-total">Total: S/ ${totalToPay.toFixed(2)}</span>
          </div>

          <div class="tracker-summary-meta">
            <div class="tracker-meta-row">
              <svg class="tracker-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span><strong>Destino:</strong> ${order.deliveryAddress || 'Jr. San Martín 450, Santa Clara, Ate'}</span>
            </div>
            <div class="tracker-meta-row">
              <svg class="tracker-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              <span><strong>Método de Pago:</strong> ${(order.paymentMethod || 'Yape').toUpperCase()}</span>
            </div>
            ${order.notes ? `
            <div class="tracker-meta-row">
              <svg class="tracker-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span><strong>Indicaciones:</strong> ${order.notes}</span>
            </div>` : ''}
          </div>

          <!-- Items y Desglose de Cuenta -->
          <div class="tracker-items-breakdown">
            <span class="tracker-items-section-title">Productos en comanda:</span>
            <div class="tracker-items-list">
              ${itemsListHtml}
            </div>

            <div class="tracker-bill-totals">
              <div class="tracker-bill-row">
                <span>Subtotal de productos:</span>
                <span>S/ ${subtotal.toFixed(2)}</span>
              </div>
              <div class="tracker-bill-row">
                <span>Costo de envío (Delivery):</span>
                <span style="color: #059669; font-weight: 700;">GRATIS</span>
              </div>
              <div class="tracker-bill-row tracker-bill-row-total">
                <span>Total a Pagar:</span>
                <span class="tracker-bill-total-price">S/ ${totalToPay.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SELECTOR DE PRUEBA RÁPIDA (SIMULADOR DISCRETO) -->
        <div class="tracker-demo-controls">
          <span class="tracker-demo-label">Simular etapa:</span>
          <div class="tracker-demo-btn-group">
            <button type="button" class="tracker-demo-btn ${status === 'recibido' ? 'active' : ''}" onclick="BuchisapaOrderTracker.changeDemoStatus('recibido')">Recibido</button>
            <button type="button" class="tracker-demo-btn ${status === 'preparando' ? 'active' : ''}" onclick="BuchisapaOrderTracker.changeDemoStatus('preparando')">Cocina</button>
            <button type="button" class="tracker-demo-btn ${status === 'en_camino' ? 'active' : ''}" onclick="BuchisapaOrderTracker.changeDemoStatus('en_camino')">En Camino</button>
            <button type="button" class="tracker-demo-btn ${status === 'entregado' ? 'active' : ''}" onclick="BuchisapaOrderTracker.changeDemoStatus('entregado')">Entregado</button>
          </div>
        </div>
      `;

      // Cargar Leaflet y montar el mapa interactivo
      this.ensureLeafletLoaded(() => {
        setTimeout(() => {
          this.initMap(status);
        }, 80);
      });
    },

    // Asegurar que las librerías de Leaflet estén cargadas
    ensureLeafletLoaded: function (callback) {
      if (window.L && typeof window.L.map === 'function') {
        callback();
        return;
      }

      // Cargar CSS si falta
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }

      // Cargar JS si falta
      if (!document.querySelector('script[src*="leaflet.js"]')) {
        const js = document.createElement('script');
        js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        js.onload = callback;
        js.onerror = () => {
          console.warn('Falló la carga de Leaflet de CDN, utilizando fallback SVG.');
          callback();
        };
        document.head.appendChild(js);
      } else {
        // Si ya hay etiqueta script, esperar un momento
        setTimeout(callback, 300);
      }
    },

    getStatusHeadline: function (status) {
      switch (status) {
        case 'recibido': return '¡Tu pedido fue recibido!';
        case 'preparando': return 'Nuestra cocina está en acción 🔥';
        case 'en_camino': return '¡El repartidor va en camino! 🛵';
        case 'entregado': return '¡Pedido entregado con éxito! 🎉';
        default: return 'Actualizando estado...';
      }
    },

    getStatusSubtext: function (status) {
      switch (status) {
        case 'recibido': return 'Hemos confirmado tu orden y está en cola para preparación.';
        case 'preparando': return 'Nuestros cocineros están preparando tus platos con sazón auténtico.';
        case 'en_camino': return 'Marcos Arévalo lleva tu pedido caliente directamente a tu puerta.';
        case 'entregado': return 'Esperamos que disfrutes tu comida amazónica. ¡Buen provecho!';
        default: return 'Sincronizando con el restaurante en tiempo real.';
      }
    },

    getProgressPercentage: function (status) {
      switch (status) {
        case 'recibido': return 0;
        case 'preparando': return 33.3;
        case 'en_camino': return 66.6;
        case 'entregado': return 100;
        default: return 0;
      }
    },

    isStepActive: function (currentStatus, stepName) {
      const order = ['recibido', 'preparando', 'en_camino', 'entregado'];
      const currentIndex = order.indexOf(currentStatus);
      const stepIndex = order.indexOf(stepName);

      if (currentIndex === stepIndex) return 'active';
      if (currentIndex > stepIndex) return 'completed';
      return '';
    },

    // Actualizar UI reactivamente al cambiar el estado
    updateUI: function () {
      const status = (this.currentOrder?.status || 'recibido').toLowerCase();

      const headline = document.getElementById('tracker-hero-headline');
      const subtext = document.getElementById('tracker-hero-subtext');
      const activeLine = document.getElementById('tracker-active-line');
      const hudStatus = document.getElementById('tracker-hud-status');

      if (headline) headline.textContent = this.getStatusHeadline(status);
      if (subtext) subtext.textContent = this.getStatusSubtext(status);
      if (activeLine) activeLine.style.width = `${this.getProgressPercentage(status)}%`;
      if (hudStatus) {
        hudStatus.textContent = status === 'en_camino'
          ? 'En ruta'
          : (status === 'entregado' ? 'Entregado' : (status === 'preparando' ? 'En cocina' : 'Recibido'));
      }

      // Actualizar clases del stepper
      ['recibido', 'preparando', 'en_camino', 'entregado'].forEach(step => {
        const el = document.getElementById(`step-${step}`);
        if (el) {
          el.className = `tracker-step-item ${this.isStepActive(status, step)}`;
        }
      });

      // Actualizar animación y posición del mapa Leaflet
      if (this.leafletMap) {
        this.updateMapPosition(status);
      }
    },

    // Inicializar mapa Leaflet interactivo dentro del modal
    initMap: function (status) {
      const mapEl = document.getElementById('leaflet-map-element');
      if (!mapEl) return;

      if (window.L && typeof window.L.map === 'function') {
        try {
          if (this.leafletMap) {
            this.leafletMap.remove();
            this.leafletMap = null;
          }

          const center = [-12.023, -76.894];
          this.leafletMap = window.L.map('leaflet-map-element', {
            center: center,
            zoom: 14,
            zoomControl: false,
            attributionControl: false
          });

          // Control de zoom en esquina inferior izquierda para no colisionar con acciones
          window.L.control.zoom({ position: 'bottomleft' }).addTo(this.leafletMap);

          // Capa de mosaico OpenStreetMap limpia
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(this.leafletMap);

          // 1. Marcador Restaurante Buchisapa
          const restaurantIcon = window.L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div class="marker-pin-wrap">
                <div class="marker-badge-icon marker-badge-restaurant">🍗</div>
                <div class="marker-label-tag">Buchisapa</div>
              </div>
            `,
            iconSize: [36, 50],
            iconAnchor: [18, 50]
          });

          this.restaurantMarker = window.L.marker(RESTAURANT_COORDS, { icon: restaurantIcon })
            .addTo(this.leafletMap)
            .bindPopup(`
              <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:4px; text-align:left;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  <span style="font-size:16px;">🍗</span>
                  <strong style="color:#dc2626; font-size:13px;">Buchisapa Restaurante</strong>
                </div>
                <p style="margin:0 0 4px 0; font-size:11.5px; color:#475569;">Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate</p>
                <span style="background:#fee2e2; color:#dc2626; font-size:10px; font-weight:700; padding:2px 6px; border-radius:10px;">Punto de Origen</span>
              </div>
            `);

          // 2. Marcador Destino / Casa del Cliente
          const homeIcon = window.L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div class="marker-pin-wrap">
                <div class="marker-badge-icon marker-badge-home">📍</div>
                <div class="marker-label-tag">Tu Casa</div>
              </div>
            `,
            iconSize: [36, 50],
            iconAnchor: [18, 50]
          });

          const deliveryAddr = this.currentOrder?.deliveryAddress || 'Jr. San Martín 450, Santa Clara, Ate';
          this.destinationMarker = window.L.marker(DEFAULT_DESTINATION_COORDS, { icon: homeIcon })
            .addTo(this.leafletMap)
            .bindPopup(`
              <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:4px; text-align:left;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  <span style="font-size:16px;">📍</span>
                  <strong style="color:#059669; font-size:13px;">Destino de Entrega</strong>
                </div>
                <p style="margin:0 0 4px 0; font-size:11.5px; color:#475569;">${deliveryAddr}</p>
                <span style="background:#d1fae5; color:#059669; font-size:10px; font-weight:700; padding:2px 6px; border-radius:10px;">Punto de Llegada</span>
              </div>
            `);

          // 3. Resplandor y Línea de Ruta (Polyline)
          this.routeGlowPolyline = window.L.polyline(ROUTE_WAYPOINTS, {
            color: '#fca5a5',
            weight: 9,
            opacity: 0.45
          }).addTo(this.leafletMap);

          this.routePolyline = window.L.polyline(ROUTE_WAYPOINTS, {
            color: '#dc2626',
            weight: 4,
            opacity: 0.9,
            dashArray: '8, 8'
          }).addTo(this.leafletMap);

          // 4. Marcador Motorizado Repartidor
          const motoIcon = window.L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div class="marker-pin-wrap">
                <div class="marker-pulse-ring"></div>
                <div class="marker-badge-icon marker-badge-moto">🛵</div>
                <div class="marker-label-tag" style="background:#f97316;">En Vivo</div>
              </div>
            `,
            iconSize: [40, 55],
            iconAnchor: [20, 55]
          });

          const initialMotoCoords = status === 'en_camino'
            ? ROUTE_WAYPOINTS[1]
            : (status === 'entregado' ? DEFAULT_DESTINATION_COORDS : RESTAURANT_COORDS);

          this.currentCoords = initialMotoCoords;

          this.motoMarker = window.L.marker(initialMotoCoords, { icon: motoIcon })
            .addTo(this.leafletMap)
            .bindPopup(`
              <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:4px; text-align:left; min-width:190px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #f1f5f9;">
                  <div style="width:30px; height:30px; border-radius:50%; background:#f97316; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">MA</div>
                  <div>
                    <strong style="color:#0f172a; font-size:13px; display:block;">Marcos Arévalo</strong>
                    <span style="font-size:11px; color:#64748b;">Repartidor • Honda Wave 110</span>
                  </div>
                </div>
                <div style="font-size:11px; color:#334155; display:flex; flex-direction:column; gap:3px;">
                  <div><strong>Placa:</strong> <span style="font-family:monospace;">4512-4B</span></div>
                  <div><strong>Velocidad:</strong> <span id="popup-moto-speed">32 km/h</span></div>
                  <div><strong>GPS Mock:</strong> <span id="popup-moto-coords" style="font-family:monospace; font-size:10px;">${initialMotoCoords[0].toFixed(4)}, ${initialMotoCoords[1].toFixed(4)}</span></div>
                </div>
              </div>
            `);

          // Ajustar encuadre inicial del mapa
          this.leafletMap.fitBounds(this.routePolyline.getBounds(), { padding: [35, 35] });

          // Reprogramar recalculo de dimensiones para render impecable dentro del modal
          setTimeout(() => {
            if (this.leafletMap) {
              this.leafletMap.invalidateSize();
            }
          }, 150);

          setTimeout(() => {
            if (this.leafletMap) {
              this.leafletMap.invalidateSize();
            }
          }, 350);

          // Iniciar movimiento y animación del repartidor
          this.updateMapPosition(status);
          return;
        } catch (err) {
          console.warn('Error inicializando Leaflet, usando fallback SVG:', err);
        }
      }

      // Fallback a Mapa Vectorial SVG
      this.renderVectorSvgMap(mapEl, status);
    },

    // Animación continua y cálculo en tiempo real de coordenadas mock
    updateMapPosition: function (status) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (!this.motoMarker) return;

      if (status === 'en_camino') {
        let lastTimestamp = 0;
        const animate = (timestamp) => {
          if (!lastTimestamp) lastTimestamp = timestamp;
          const delta = timestamp - lastTimestamp;

          if (delta > 50) {
            lastTimestamp = timestamp;

            // Desplazar progreso suavemente
            this.routeProgress += 0.006 * this.direction;
            if (this.routeProgress >= 0.94) {
              this.direction = -1;
            } else if (this.routeProgress <= 0.08) {
              this.direction = 1;
            }

            // Coordenadas mock interpoladas
            const coords = this.getPointAlongRoute(this.routeProgress);
            if (this.motoMarker && Array.isArray(coords) && !isNaN(coords[0]) && !isNaN(coords[1])) {
              this.currentCoords = coords;
              this.motoMarker.setLatLng(coords);

              // Variación sutil realista de velocidad (28 - 36 km/h)
              this.currentSpeed = Math.round(31 + Math.sin(timestamp / 500) * 4);

              // Distancia restante al destino
              const distKm = calculateDistanceKm(
                coords[0], coords[1],
                DEFAULT_DESTINATION_COORDS[0], DEFAULT_DESTINATION_COORDS[1]
              );

              // Actualizar elementos HUD
              const hudDist = document.getElementById('tracker-hud-dist');
              const hudSpeed = document.getElementById('tracker-hud-speed');
              const popupSpeed = document.getElementById('popup-moto-speed');
              const popupCoords = document.getElementById('popup-moto-coords');

              if (hudDist) hudDist.textContent = `${distKm.toFixed(1)} km`;
              if (hudSpeed) hudSpeed.textContent = `${this.currentSpeed} km/h`;
              if (popupSpeed) popupSpeed.textContent = `${this.currentSpeed} km/h`;
              if (popupCoords) popupCoords.textContent = `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;

              // Auto-seguimiento con la cámara si está activado
              if (this.autoFollow && this.leafletMap) {
                this.leafletMap.panTo(coords, { animate: true, duration: 0.3 });
              }
            }
          }

          this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
      } else if (status === 'entregado') {
        this.currentCoords = DEFAULT_DESTINATION_COORDS;
        if (this.motoMarker) this.motoMarker.setLatLng(DEFAULT_DESTINATION_COORDS);
        const hudDist = document.getElementById('tracker-hud-dist');
        const hudSpeed = document.getElementById('tracker-hud-speed');
        if (hudDist) hudDist.textContent = '0.0 km';
        if (hudSpeed) hudSpeed.textContent = '0 km/h';
      } else {
        this.currentCoords = RESTAURANT_COORDS;
        if (this.motoMarker) this.motoMarker.setLatLng(RESTAURANT_COORDS);
        const hudDist = document.getElementById('tracker-hud-dist');
        const hudSpeed = document.getElementById('tracker-hud-speed');
        if (hudDist) hudDist.textContent = '2.1 km';
        if (hudSpeed) hudSpeed.textContent = '0 km/h';
      }
    },

    // Controles de cámara Leaflet
    centerOnMoto: function () {
      if (this.leafletMap && this.currentCoords && !isNaN(this.currentCoords[0]) && !isNaN(this.currentCoords[1])) {
        this.leafletMap.setView(this.currentCoords, 16, { animate: true });
        if (this.motoMarker) this.motoMarker.openPopup();
      }
    },

    toggleAutoFollow: function () {
      this.autoFollow = !this.autoFollow;
      const btn = document.getElementById('tracker-autofollow-btn');
      if (btn) {
        btn.classList.toggle('active', this.autoFollow);
      }
      if (this.autoFollow) {
        this.centerOnMoto();
      }
    },

    fitRoute: function () {
      if (this.leafletMap && this.routePolyline) {
        this.leafletMap.fitBounds(this.routePolyline.getBounds(), { padding: [35, 35] });
      }
    },

    // Interpolación lineal sobre los waypoints de la ruta
    getPointAlongRoute: function (fraction) {
      if (typeof fraction !== 'number' || isNaN(fraction) || !isFinite(fraction)) {
        fraction = 0.18;
      }
      fraction = Math.max(0, Math.min(1, fraction));
      const totalPoints = ROUTE_WAYPOINTS.length;
      if (!totalPoints || totalPoints < 2) return RESTAURANT_COORDS;

      const rawIndex = Math.floor(fraction * (totalPoints - 1));
      const safeIndex = Math.max(0, Math.min(totalPoints - 2, isNaN(rawIndex) ? 0 : rawIndex));
      const segmentFraction = Math.max(0, Math.min(1, (fraction * (totalPoints - 1)) - safeIndex));

      const p1 = ROUTE_WAYPOINTS[safeIndex] || RESTAURANT_COORDS;
      const p2 = ROUTE_WAYPOINTS[safeIndex + 1] || DEFAULT_DESTINATION_COORDS;

      const lat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
      const lng = p1[1] + (p2[1] - p1[1]) * segmentFraction;
      if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
        return RESTAURANT_COORDS;
      }
      return [lat, lng];
    },

    // Mapa Vectorial SVG responsivo de respaldo
    renderVectorSvgMap: function (container, status) {
      container.innerHTML = `
        <div class="vector-map-svg-wrap">
          <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" style="display: block;">
            <rect width="600" height="300" fill="#f8fafc"/>
            <path d="M0 60 H600 M0 140 H600 M0 220 H600 M120 0 V300 M280 0 V300 M440 0 V300" stroke="#e2e8f0" stroke-width="6"/>
            <path d="M40 240 Q 200 200 300 130 T 540 60" fill="none" stroke="#cbd5e1" stroke-width="14" stroke-linecap="round"/>
            <path id="svg-delivery-route" d="M40 240 Q 200 200 300 130 T 540 60" fill="none" stroke="#dc2626" stroke-width="4" stroke-dasharray="8 6"/>

            <g transform="translate(40, 240)">
              <circle r="18" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
              <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">🍗</text>
              <rect x="-35" y="24" width="70" height="18" rx="4" fill="#0f172a"/>
              <text x="0" y="37" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">Buchisapa</text>
            </g>

            <g transform="translate(540, 60)">
              <circle r="18" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
              <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">📍</text>
              <rect x="-35" y="24" width="70" height="18" rx="4" fill="#0f172a"/>
              <text x="0" y="37" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">Tu Casa</text>
            </g>

            <g id="svg-moto-marker" transform="translate(300, 130)">
              <circle r="24" fill="rgba(249, 115, 22, 0.25)">
                <animate attributeName="r" values="18;28;18" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle r="18" fill="#f97316" stroke="#ffffff" stroke-width="3"/>
              <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">🛵</text>
              <rect x="-30" y="-32" width="60" height="18" rx="4" fill="#f97316"/>
              <text x="0" y="-20" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">En Vivo</text>
            </g>
          </svg>
        </div>
      `;
    },

    // Cambiar estado para demostración interactiva
    changeDemoStatus: async function (newStatus) {
      if (!this.currentOrder) return;
      this.currentOrder.status = newStatus;

      try {
        await fetch(`/api/orders/${this.currentOrder.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (e) {}

      this.handleStatusChange(newStatus);
      this.updateUI();
    },

    // Abrir modal y disparar cálculo e invalidación de tamaño de Leaflet
    openModal: function (orderId) {
      const modal = document.getElementById('order-status-modal');
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.init(orderId);

        // Recalcular tamaño de Leaflet tras la apertura del modal
        setTimeout(() => {
          if (this.leafletMap) {
            this.leafletMap.invalidateSize();
            if (this.routePolyline) {
              this.leafletMap.fitBounds(this.routePolyline.getBounds(), { padding: [35, 35] });
            }
          }
        }, 150);

        setTimeout(() => {
          if (this.leafletMap) {
            this.leafletMap.invalidateSize();
          }
        }, 350);
      }
    },

    closeModal: function () {
      const modal = document.getElementById('order-status-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
      this.stopLivePolling();
    }
  };

  // Exponer globalmente
  window.BuchisapaOrderTracker = BuchisapaOrderTracker;
  window.openOrderTracker = function (orderId) {
    const id = orderId || (BuchisapaOrderTracker.currentOrderId) || 'ORD-1001';
    window.location.href = `/order-status.html?id=${encodeURIComponent(id)}`;
  };
  window.closeOrderTracker = function () {
    BuchisapaOrderTracker.closeModal();
  };
})();
