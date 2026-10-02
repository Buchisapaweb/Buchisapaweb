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

  // 3. MAPA DE DELIVERY INTERACTIVO CON PIN ARRASTRABLE Y CLICK
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

    deliveryMap.on('click', function(e) {
      if (deliveryMarker) {
        deliveryMarker.setLatLng(e.latlng);
        reverseGeocodeCoord(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  // 4. DETECCIÓN GPS EN TIEMPO REAL
  let isDetectingGps = false;

  async function detectClientCurrentLocation() {
    if (isDetectingGps) return;
    const label = document.getElementById('gps-button-label');
    const btn = document.querySelector('.btn-use-gps');

    if (!navigator.geolocation) {
      showToast('⚠️ Tu navegador no soporta geolocalización', '⚠️');
      return;
    }

    isDetectingGps = true;
    if (btn) btn.classList.add('detecting');
    if (label) label.textContent = '⏳ Accediendo a tu ubicación en tiempo real...';

    const handlePos = async (pos) => {
      isDetectingGps = false;
      if (btn) btn.classList.remove('detecting');

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy || 15);

      if (!deliveryMap) initDeliveryMap();

      if (deliveryMap && deliveryMarker) {
        deliveryMap.flyTo([lat, lng], 17, { duration: 0.8 });
        deliveryMarker.setLatLng([lat, lng]);
      }

      await reverseGeocodeCoord(lat, lng);

      if (label) label.textContent = `✓ Ubicación detectada (±${accuracy}m)`;
      showToast('📍 Ubicación en tiempo real fijada con éxito', '✓');
    };

    const handleErr = (err) => {
      console.warn('GPS alta precisión falló, intentando modo estándar...', err);
      // Fallback a geolocalización estándar por red
      navigator.geolocation.getCurrentPosition(
        handlePos,
        (err2) => {
          isDetectingGps = false;
          if (btn) btn.classList.remove('detecting');
          if (label) label.textContent = 'Usa tu ubicación actual';
          showToast('⚠️ Activa el GPS de tu dispositivo para detectar tu ubicación.', '⚠️');
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 30000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      handlePos,
      handleErr,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function reverseGeocodeCoord(lat, lng) {
    const input = document.getElementById('delivery-address-search');
    const streetNumInput = document.getElementById('street-number-input');

    // 1. Intento primario: Endpoint propio del servidor (rápido y sin CORS)
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.address) {
          if (input) input.value = data.address;
          return;
        }
      }
    } catch (e) {
      console.warn('Error en /api/geocode/reverse:', e);
    }

    // 2. Fallback a Nominatim OpenStreetMap
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name && input) {
          const parts = data.display_name.split(',');
          const simplified = parts.slice(0, 3).join(',').trim();
          input.value = simplified || data.display_name;

          if (data.address && data.address.house_number && streetNumInput && (!streetNumInput.value || streetNumInput.value === 'S/N')) {
            streetNumInput.value = data.address.house_number;
          }
        }
      }
    } catch (e) {}
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
