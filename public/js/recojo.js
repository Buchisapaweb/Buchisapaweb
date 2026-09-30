/**
 * RESTAURANTE BUCHISAPA - Lógica Oficial de Método de Entrega y Recojo en Santa Clara
 * Archivo: /js/recojo.js
 */

(function() {
  // Coordenadas oficiales de BuchiSapa Santa Clara
  const BUCHISAPA_COORDS = {
    lat: -12.01635,
    lng: -76.88455
  };

  let pickupMap = null;
  let deliveryMap = null;
  let deliveryMarker = null;
  let currentActiveMode = 'pickup';

  // Inicialización al cargar la página
  document.addEventListener('DOMContentLoaded', () => {
    initPickupMap();
    checkStoredMode();
  });

  function checkStoredMode() {
    try {
      const mode = localStorage.getItem('buchisapa_active_fulfillment') || 'pickup';
      switchDeliveryMode(mode);
    } catch (e) {
      switchDeliveryMode('pickup');
    }
  }

  // 1. CAMBIO DE TABS (RECOJO / DELIVERY)
  function switchDeliveryMode(mode) {
    currentActiveMode = mode;
    const pickupTab = document.getElementById('tab-pickup-btn');
    const deliveryTab = document.getElementById('tab-delivery-btn');
    const pickupPanel = document.getElementById('panel-pickup-view');
    const deliveryPanel = document.getElementById('panel-delivery-view');

    if (!pickupTab || !deliveryTab || !pickupPanel || !deliveryPanel) return;

    if (mode === 'pickup') {
      pickupTab.classList.add('active');
      pickupTab.setAttribute('aria-selected', 'true');
      deliveryTab.classList.remove('active');
      deliveryTab.setAttribute('aria-selected', 'false');

      pickupPanel.style.display = 'block';
      deliveryPanel.style.display = 'none';

      // Forzar recalculo de dimensiones del mapa Leaflet
      setTimeout(() => {
        if (pickupMap) pickupMap.invalidateSize();
      }, 100);
    } else {
      deliveryTab.classList.add('active');
      deliveryTab.setAttribute('aria-selected', 'true');
      pickupTab.classList.remove('active');
      pickupTab.setAttribute('aria-selected', 'false');

      deliveryPanel.style.display = 'block';
      pickupPanel.style.display = 'none';

      // Inicializar mapa de delivery al abrir tab por primera vez
      setTimeout(() => {
        initDeliveryMap();
        if (deliveryMap) deliveryMap.invalidateSize();
      }, 100);
    }
  }

  // 2. MAPA DE RECOJO EN SANTA CLARA
  function initPickupMap() {
    const mapContainer = document.getElementById('pickup-leaflet-map');
    if (!mapContainer || typeof L === 'undefined' || pickupMap) return;

    pickupMap = L.map('pickup-leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([BUCHISAPA_COORDS.lat, BUCHISAPA_COORDS.lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(pickupMap);

    const storeMarker = L.marker([BUCHISAPA_COORDS.lat, BUCHISAPA_COORDS.lng]).addTo(pickupMap);
    storeMarker.bindPopup('<strong>🍗 BuchiSapa Santa Clara</strong><br>Av. La Estrella con Calle 28 de Julio<br><em>Atención 6:00 PM - 5:00 AM</em>').openPopup();
  }

  // 3. MAPA DE DELIVERY INTERACTIVO CON PIN ARRASTRABLE
  function initDeliveryMap() {
    const mapContainer = document.getElementById('delivery-leaflet-map');
    if (!mapContainer || typeof L === 'undefined' || deliveryMap) return;

    deliveryMap = L.map('delivery-leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([BUCHISAPA_COORDS.lat, BUCHISAPA_COORDS.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(deliveryMap);

    deliveryMarker = L.marker([BUCHISAPA_COORDS.lat, BUCHISAPA_COORDS.lng], {
      draggable: true
    }).addTo(deliveryMap);

    deliveryMarker.on('dragend', function(e) {
      const position = e.target.getLatLng();
      reverseGeocodeCoord(position.lat, position.lng);
    });
  }

  // 4. DETECCIÓN GPS
  function detectClientCurrentLocation() {
    const label = document.getElementById('gps-button-label');
    if (!navigator.geolocation) {
      showToast('⚠️ Tu navegador no soporta geolocalización', '⚠️');
      return;
    }

    if (label) label.textContent = 'Detectando ubicación GPS...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (deliveryMap && deliveryMarker) {
          deliveryMap.setView([lat, lng], 17);
          deliveryMarker.setLatLng([lat, lng]);
        }

        reverseGeocodeCoord(lat, lng);
        if (label) label.textContent = '📍 Ubicación GPS encontrada';
        showToast('📍 Ubicación detectada en el mapa', '📍');
      },
      (err) => {
        if (label) label.textContent = 'Usa tu ubicación actual';
        showToast('⚠️ No se pudo acceder a tu GPS. Por favor escribe tu dirección.', '⚠️');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function reverseGeocodeCoord(lat, lng) {
    const input = document.getElementById('delivery-address-search');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name && input) {
          const parts = data.display_name.split(',');
          const simplified = parts.slice(0, 3).join(',').trim();
          input.value = simplified || data.display_name;
        }
      }
    } catch (e) {
      // Ignorar error de reverse geocoding
    }
  }

  function clearDeliveryInput() {
    const input = document.getElementById('delivery-address-search');
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  function setAddressTag(tag, btn) {
    const hidden = document.getElementById('selected-address-tag');
    if (hidden) hidden.value = tag;

    document.querySelectorAll('.address-tags-row .tag-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  // 5. CONFIRMAR RECOJO EN SANTA CLARA
  function confirmPickupOption() {
    try {
      localStorage.setItem('buchisapa_order_type', 'pickup');
      localStorage.setItem('buchisapa_active_fulfillment', 'pickup');
      localStorage.setItem('buchisapa_pickup_sede', 'Santa Clara (Ate)');

      if (window.BuchisapaCart) {
        window.BuchisapaCart.orderType = 'pickup';
        window.BuchisapaCart.deliveryFee = 0.00;
        if (typeof window.BuchisapaCart.updateUI === 'function') {
          window.BuchisapaCart.updateUI();
        }
      }
    } catch (e) {}

    showToast('🛍️ Recojo en Santa Clara Confirmado (S/ 0.00)', '🏬');

    setTimeout(() => {
      window.location.href = '/';
    }, 600);
  }

  // 6. CONFIRMAR DELIVERY
  function confirmDeliveryOption() {
    const searchInput = document.getElementById('delivery-address-search');
    const streetNum = document.getElementById('street-number-input');
    const interior = document.getElementById('interior-number-input');
    const ref = document.getElementById('reference-input');
    const tag = document.getElementById('selected-address-tag');

    const address = searchInput ? searchInput.value.trim() : 'Santa Clara, Ate';
    const referenceVal = ref ? ref.value.trim() : '';

    if (!address) {
      showToast('⚠️ Por favor ingresa tu dirección de entrega', '⚠️');
      if (searchInput) searchInput.focus();
      return;
    }

    try {
      localStorage.setItem('buchisapa_order_type', 'delivery');
      localStorage.setItem('buchisapa_active_fulfillment', 'delivery');
      localStorage.setItem('buchisapa_delivery_address', JSON.stringify({
        address: address,
        streetNumber: streetNum ? streetNum.value.trim() : '',
        interior: interior ? interior.value.trim() : '',
        reference: referenceVal,
        tag: tag ? tag.value : 'Casa'
      }));

      if (window.BuchisapaCart) {
        window.BuchisapaCart.orderType = 'delivery';
        window.BuchisapaCart.deliveryFee = 4.00;
        if (typeof window.BuchisapaCart.updateUI === 'function') {
          window.BuchisapaCart.updateUI();
        }
      }
    } catch (e) {}

    showToast('🛵 Dirección de Delivery Guardada', '🛵');

    setTimeout(() => {
      window.location.href = '/';
    }, 600);
  }

  // 7. TOAST NOTIFICACIÓN
  function showToast(message, icon = '✅') {
    const toast = document.getElementById('recojo-toast');
    const textEl = document.getElementById('recojo-toast-text');
    const iconEl = document.getElementById('recojo-toast-icon');

    if (!toast || !textEl) return;

    textEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    toast.style.display = 'flex';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // MÉTODOS DE COMPATIBILIDAD CON VISTAS PREVIAS
  function openRecojoModal() {
    window.location.href = '/recojo';
  }
  function closeRecojoModal() {
    const modal = document.getElementById('recojo-modal');
    if (modal) modal.style.display = 'none';
  }
  function selectPickupOption() {
    confirmPickupOption();
  }

  // Exportar al ámbito global
  window.switchDeliveryMode = switchDeliveryMode;
  window.detectClientCurrentLocation = detectClientCurrentLocation;
  window.clearDeliveryInput = clearDeliveryInput;
  window.setAddressTag = setAddressTag;
  window.confirmPickupOption = confirmPickupOption;
  window.confirmDeliveryOption = confirmDeliveryOption;
  window.openRecojoModal = openRecojoModal;
  window.openLocationModal = openRecojoModal;
  window.closeRecojoModal = closeRecojoModal;
  window.selectPickupOption = selectPickupOption;
})();
