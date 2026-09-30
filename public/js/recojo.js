(function() {
  let locLeafletMap = null;
  let locLeafletMarker = null;

  function openLocationModal() {
    const modal = document.getElementById('location-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('open', 'active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      initLocModalMap();
    }, 200);
  }

  function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    if (!modal) return;
    modal.classList.remove('open', 'active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function switchLocationTab(mode) {
    const deliveryTab = document.getElementById('loc-tab-delivery');
    const pickupTab = document.getElementById('loc-tab-pickup');
    const deliveryContent = document.getElementById('loc-content-delivery');
    const pickupContent = document.getElementById('loc-content-pickup');

    if (mode === 'pickup') {
      if (deliveryTab) deliveryTab.classList.remove('active');
      if (pickupTab) pickupTab.classList.add('active');
      if (deliveryContent) deliveryContent.style.display = 'none';
      if (pickupContent) pickupContent.style.display = 'block';
    } else {
      if (deliveryTab) deliveryTab.classList.add('active');
      if (pickupTab) pickupTab.classList.remove('active');
      if (deliveryContent) deliveryContent.style.display = 'block';
      if (pickupContent) pickupContent.style.display = 'none';
      setTimeout(() => {
        if (locLeafletMap) locLeafletMap.invalidateSize();
      }, 100);
    }
  }

  function setAddressTag(tag) {
    const input = document.getElementById('loc-tag-input');
    if (input) input.value = tag;
  }

  function initLocModalMap() {
    const mapEl = document.getElementById('loc-leaflet-map');
    if (!mapEl || typeof L === 'undefined') return;
    if (locLeafletMap) {
      locLeafletMap.invalidateSize();
      return;
    }

    try {
      locLeafletMap = L.map('loc-leaflet-map', {
        center: [-12.0119, -76.8239],
        zoom: 15,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
      }).addTo(locLeafletMap);

      locLeafletMarker = L.marker([-12.0119, -76.8239], { draggable: true }).addTo(locLeafletMap);
    } catch (err) {
      console.error('Error al inicializar mapa en modal:', err);
    }
  }

  function confirmDeliveryAddress() {
    const tag = (document.getElementById('loc-tag-input')?.value || 'Mi ubicación').trim();
    const labelEl = document.getElementById('selected-location-label');
    if (labelEl) {
      labelEl.textContent = 'Delivery: ' + tag;
    }
    closeLocationModal();
    if (window.BuchisapaPush && typeof window.BuchisapaPush.showToast === 'function') {
      window.BuchisapaPush.showToast('Dirección confirmada para Delivery', '🛵');
    }
  }

  function confirmPickupStore() {
    const labelEl = document.getElementById('selected-location-label');
    if (labelEl) {
      labelEl.textContent = 'Recojo: Santa Clara';
    }
    closeLocationModal();
    if (window.BuchisapaPush && typeof window.BuchisapaPush.showToast === 'function') {
      window.BuchisapaPush.showToast('Modo Recojo en Tienda activado', '🏬');
    }
  }

  function toggleMapExpand() {
    const container = document.getElementById('loc-map-container');
    if (!container) return;
    container.classList.toggle('expanded');
    setTimeout(() => {
      if (locLeafletMap) locLeafletMap.invalidateSize();
    }, 200);
  }

  window.openLocationModal = openLocationModal;
  window.closeLocationModal = closeLocationModal;
  window.switchLocationTab = switchLocationTab;
  window.setAddressTag = setAddressTag;
  window.confirmDeliveryAddress = confirmDeliveryAddress;
  window.confirmPickupStore = confirmPickupStore;
  window.toggleMapExpand = toggleMapExpand;
})();
