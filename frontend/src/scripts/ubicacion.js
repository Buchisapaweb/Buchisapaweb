// Variables globales
    const STORE_LAT = -12.01635;
    const STORE_LNG = -76.88455;
    let currentLat = STORE_LAT;
    let currentLng = STORE_LNG;
    let currentMode = 'delivery';
    let leafletMap = null;
    let deliveryMarker = null;
    let storeMarker = null;
    let routePolyline = null;
    let motoMarker = null;
    let motoAnimationTimer = null;
    let isSatellite = false;
    let watchId = null;
    let selectedAccuracy = 'precise';
    let searchDebounceTimer = null;

    // Base de datos de referencias locales de Ate / Santa Clara para autocompletado instantáneo
    const LOCAL_PLACES = [
      { nombre: 'Av. La Estrella (Santa Clara)', sub: 'Santa Clara, Ate, Lima', lat: -12.01635, lng: -76.88455 },
      { nombre: 'Real Plaza Santa Clara', sub: 'Av. Nicolás Ayllón 8694, Ate', lat: -12.01780, lng: -76.88390 },
      { nombre: 'Calle 28 de Julio (Santa Clara)', sub: 'Esquina posta médica, Ate, Lima', lat: -12.01610, lng: -76.88500 },
      { nombre: 'Av. 15 de Julio (Huaycán)', sub: 'Huaycán Zona A, Ate, Lima', lat: -12.01190, lng: -76.82390 },
      { nombre: 'Plaza Principal Huaycán', sub: 'Av. 15 de Julio, Ate', lat: -12.01350, lng: -76.82100 },
      { nombre: 'Plaza Vitarte', sub: 'Av. Nicolás Ayllón, Vitarte, Ate', lat: -12.02890, lng: -76.91850 },
      { nombre: 'Pariachi (Carretera Central)', sub: 'Km 12.5 Carretera Central, Ate', lat: -12.00950, lng: -76.84500 },
      { nombre: 'Horacio Zeballos', sub: 'Ate, Lima', lat: -12.00400, lng: -76.83700 },
      { nombre: 'Los Laureles', sub: 'Santa Clara, Ate', lat: -12.01950, lng: -76.88900 },
      { nombre: 'Av. Sinchi Roca', sub: 'Santa Clara, Ate', lat: -12.01480, lng: -76.88220 },
      { nombre: 'Carretera Central Km 10', sub: 'Santa Clara, Ate', lat: -12.01820, lng: -76.88100 }
    ];

    // Capas de mapas
    let osmLayer = null;
    let satelliteLayer = null;

    document.addEventListener('DOMContentLoaded', () => {
      initMap();
      loadStoredSettings();
      verifyAndRequestLiveGps();

      // Cerrar sugerencias si se hace clic fuera del contenedor
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.loc-search-container-wrap')) {
          closeSuggestionsDropdown();
        }
      });
    });

    function initMap() {
      leafletMap = L.map('live-delivery-map', {
        center: [currentLat, currentLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(leafletMap);

      satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });

      // Marcador de tienda Buchisapa Santa Clara
      const storeIcon = L.divIcon({
        className: 'store-leaflet-pin',
        html: `
          <div style="background: #1e293b; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2px solid #fff; font-size: 18px;">
            🍗
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      storeMarker = L.marker([STORE_LAT, STORE_LNG], { icon: storeIcon }).addTo(leafletMap);
      storeMarker.bindPopup('<strong style="color: #dc2626;">Buchisapa Santa Clara</strong><br>Av. La Estrella con Calle 28 de Julio');

      // Marcador interactivo y arrastrable de entrega (Image 1)
      const pinIcon = L.divIcon({
        className: 'delivery-leaflet-pin',
        html: `
          <div class="pin-label-tag">📍 Punto de Entrega</div>
          <div class="pin-pulse-circle">
            <div style="width: 12px; height: 12px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      deliveryMarker = L.marker([currentLat, currentLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(leafletMap);

      // Evento de arrastre de marcador
      deliveryMarker.on('dragend', function (e) {
        const pos = e.target.getLatLng();
        updatePosition(pos.lat, pos.lng, true);
      });

      // Clic en mapa para reposicionar fluidamente
      leafletMap.on('click', function (e) {
        if (currentMode === 'delivery') {
          updatePosition(e.latlng.lat, e.latlng.lng, true);
          leafletMap.panTo([e.latlng.lat, e.latlng.lng], { animate: true, duration: 0.8 });
        }
      });
    }

    function updatePosition(lat, lng, doReverseGeocode = true) {
      currentLat = lat;
      currentLng = lng;
      
      if (deliveryMarker) {
        deliveryMarker.setLatLng([lat, lng]);
      }

      // Actualizar telemetría GPS en UI
      document.getElementById('display-gps-coords').textContent = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      
      // Calcular distancia y cobertura
      calculateDistanceAndRate(lat, lng);

      if (doReverseGeocode) {
        reverseGeocode(lat, lng);
      }
    }

    function calculateDistanceAndRate(lat, lng) {
      // Fórmula Haversine precisa
      const R = 6371; // Radio de la Tierra en km
      const dLat = (lat - STORE_LAT) * Math.PI / 180;
      const dLon = (lng - STORE_LNG) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(STORE_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      let fee = 3.50;
      if (distance > 3) {
        fee = 3.50 + Math.ceil(distance - 3) * 1.50;
      }

      const coverageEl = document.getElementById('coverage-status-text');
      if (distance <= 12) {
        coverageEl.textContent = `Cobertura Directa (${distance.toFixed(1)} km • S/ ${fee.toFixed(2)})`;
        coverageEl.parentElement.style.color = '#16a34a';
      } else {
        coverageEl.textContent = `Fuera de zona estándar (${distance.toFixed(1)} km • Envío especial)`;
        coverageEl.parentElement.style.color = '#ea580c';
      }
    }

    async function reverseGeocode(lat, lng) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (res.ok) {
          const datos = await res.json();
          if (datos && datos.display_name) {
            const road = datos.address.road || datos.address.pedestrian || datos.address.suburb || 'Ubicación seleccionada';
            const city = (datos.address.city || datos.address.town || datos.address.county || 'Ate') + ', Lima';
            
            document.getElementById('display-address-title').textContent = road;
            document.getElementById('display-address-sub').textContent = city;
          }
        }
      } catch (err) {
        console.warn('Geocoding no disponible, usando coordenadas:', err);
      }
    }

    function switchMode(mode) {
      currentMode = mode;
      const tabDelivery = document.getElementById('tab-btn-delivery');
      const tabPickup = document.getElementById('tab-btn-pickup');
      const viewDelivery = document.getElementById('view-delivery-container');
      const viewPickup = document.getElementById('view-pickup-container');

      if (mode === 'delivery') {
        tabDelivery.classList.add('active');
        tabPickup.classList.remove('active');
        viewDelivery.style.display = 'block';
        viewPickup.style.display = 'none';
        if (deliveryMarker && leafletMap) {
          deliveryMarker.setOpacity(1);
          leafletMap.flyTo([currentLat, currentLng], 16, { animate: true, duration: 1.2 });
        }
      } else {
        tabDelivery.classList.remove('active');
        tabPickup.classList.add('active');
        viewDelivery.style.display = 'none';
        viewPickup.style.display = 'block';
        if (leafletMap) {
          leafletMap.flyTo([STORE_LAT, STORE_LNG], 17, { animate: true, duration: 1.2 });
        }
      }
    }

    // GESTIÓN DE PERMISOS GPS EN VIVO (Image 4)
    function verifyAndRequestLiveGps() {
      if (!navigator.geolocation) {
        console.warn('Geolocalización no soportada');
        return;
      }

      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ nombre: 'geolocation' }).then(result => {
          if (result.state === 'granted') {
            startLiveWatch();
          } else if (result.state === 'prompt') {
            setTimeout(() => {
              openGpsPermissionModal();
            }, 500);
          } else if (result.state === 'denied') {
            document.getElementById('display-gps-status').textContent = 'GPS Desactivado (Click para activar)';
            document.getElementById('header-gps-label').textContent = 'GPS Inactivo';
          }
        }).catch(() => {
          requestUserGps(false);
        });
      } else {
        requestUserGps(false);
      }
    }

    function requestUserGps(userInitiated = false) {
      if (!navigator.geolocation) {
        alert('Tu navegador no soporta geolocalización.');
        return;
      }

      const btnGps = document.getElementById('btn-center-gps');
      const btnText = document.getElementById('btn-gps-text');
      if (btnText) btnText.textContent = 'Detectando...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updatePosition(lat, lng, true);
          if (leafletMap) {
            leafletMap.flyTo([lat, lng], 17, { animate: true, duration: 1.4 });
          }
          startLiveWatch();
          if (btnText) btnText.textContent = 'GPS en Vivo';
          if (btnGps) btnGps.classList.add('active-blue');
          document.getElementById('header-gps-label').textContent = 'GPS en Vivo';
          document.getElementById('display-gps-status').textContent = 'Precisión Satelital (±' + Math.round(position.coords.accuracy) + 'm)';
        },
        (error) => {
          console.warn('Error GPS:', error);
          if (btnText) btnText.textContent = 'Activar GPS';
          if (btnGps) btnGps.classList.remove('active-blue');
          if (userInitiated) {
            openGpsPermissionModal();
          }
        },
        { enableHighAccuracy: selectedAccuracy === 'precise', timeout: 10000, maximumAge: 0 }
      );
    }

    function startLiveWatch() {
      if (watchId !== null) return;
      if (!navigator.geolocation) return;

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          updatePosition(lat, lng, false);
        },
        (err) => console.warn('Watch error:', err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    }

    // MODAL DE PERMISOS GPS
    function openGpsPermissionModal() {
      const modal = document.getElementById('gps-permission-modal');
      if (modal) modal.style.display = 'flex';
    }

    function closeGpsPermissionModal() {
      const modal = document.getElementById('gps-permission-modal');
      if (modal) modal.style.display = 'none';
    }

    function selectGpsOption(opt) {
      selectedAccuracy = opt;
      const optP = document.getElementById('opt-precise');
      const optA = document.getElementById('opt-approx');
      const chkP = document.getElementById('check-precise');
      const chkA = document.getElementById('check-approx');

      if (opt === 'precise') {
        optP.classList.add('selected');
        optA.classList.remove('selected');
        chkP.className = 'gps-option-check';
        chkP.textContent = '✓';
        chkA.className = 'gps-option-uncheck';
        chkA.textContent = '';
      } else {
        optA.classList.add('selected');
        optP.classList.remove('selected');
        chkA.className = 'gps-option-check';
        chkA.textContent = '✓';
        chkP.className = 'gps-option-uncheck';
        chkP.textContent = '';
      }
    }

    function executeGrantGps(scope) {
      closeGpsPermissionModal();
      requestUserGps(true);
    }

    function denyGpsAndManual() {
      closeGpsPermissionModal();
      document.getElementById('display-gps-status').textContent = 'Modo Manual / Pin en Mapa';
    }

    // CAPA SATÉLITE
    function toggleSatelliteLayer() {
      const btn = document.getElementById('btn-toggle-satellite');
      if (!isSatellite) {
        leafletMap.removeLayer(osmLayer);
        satelliteLayer.addTo(leafletMap);
        btn.classList.add('active-blue');
        isSatellite = true;
      } else {
        leafletMap.removeLayer(satelliteLayer);
        osmLayer.addTo(leafletMap);
        btn.classList.remove('active-blue');
        isSatellite = false;
      }
    }

    // DIBUJAR RUTA
    function toggleRouteToStore() {
      const btn = document.getElementById('btn-draw-route');
      if (routePolyline) {
        leafletMap.removeLayer(routePolyline);
        routePolyline = null;
        btn.classList.remove('active-blue');
        return;
      }

      const points = [
        [STORE_LAT, STORE_LNG],
        [currentLat, currentLng]
      ];

      routePolyline = L.polyline(points, {
        color: '#dc2626',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(leafletMap);

      leafletMap.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
      btn.classList.add('active-blue');
    }

    // SIMULAR MOTO DELIVERY
    function simulateMotoDelivery() {
      const btn = document.getElementById('btn-simulate-moto');
      if (motoMarker) {
        leafletMap.removeLayer(motoMarker);
        motoMarker = null;
        if (motoAnimationTimer) clearInterval(motoAnimationTimer);
        btn.classList.remove('active-blue');
        return;
      }

      const motoIcon = L.divIcon({
        className: 'moto-leaflet-icon',
        html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));">🛵</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      motoMarker = L.marker([STORE_LAT, STORE_LNG], { icon: motoIcon }).addTo(leafletMap);
      btn.classList.add('active-blue');

      let step = 0;
      const totalSteps = 60;
      if (motoAnimationTimer) clearInterval(motoAnimationTimer);

      motoAnimationTimer = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        const curLat = STORE_LAT + (currentLat - STORE_LAT) * progress;
        const curLng = STORE_LNG + (currentLng - STORE_LNG) * progress;
        
        motoMarker.setLatLng([curLat, curLng]);

        if (step >= totalSteps) {
          clearInterval(motoAnimationTimer);
        }
      }, 100);
    }

    // GESTIÓN DEL BUSCADOR MEJORADO CON NAVEGACIÓN FLUIDA
    function handleMapSearchInput(e) {
      const val = e.target.value.trim();
      const clearBtn = document.getElementById('map-clear-btn');
      if (clearBtn) {
        clearBtn.style.display = val.length > 0 ? 'inline-flex' : 'none';
      }

      if (val.length < 2) {
        closeSuggestionsDropdown();
        return;
      }

      // Filtrado instantáneo en referencias locales
      const localMatches = LOCAL_PLACES.filter(p => 
        p.nombre.toLowerCase().includes(val.toLowerCase()) || 
        p.sub.toLowerCase().includes(val.toLowerCase())
      );

      renderSuggestions(localMatches);

      // Búsqueda remota complementaria con debounce
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        fetchRemoteSuggestions(val);
      }, 400);
    }

    function clearMapSearch() {
      const input = document.getElementById('map-query-input');
      const clearBtn = document.getElementById('map-clear-btn');
      if (input) {
        input.value = '';
        input.focus();
      }
      if (clearBtn) clearBtn.style.display = 'none';
      closeSuggestionsDropdown();
    }

    async function fetchRemoteSuggestions(query) {
      try {
        const fullQuery = query.includes('Lima') || query.includes('Ate') ? query : `${query}, Ate, Lima, Perú`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=5&addressdetails=1`);
        if (res.ok) {
          const datos = await res.json();
          if (datos && datos.length > 0) {
            const formatted = datos.map(item => ({
              nombre: item.display_name.split(',')[0],
              sub: item.display_name.split(',').slice(1, 4).join(', '),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }));
            renderSuggestions(formatted);
          }
        }
      } catch (e) {
        console.warn('Error fetching remote suggestions:', e);
      }
    }

    function renderSuggestions(items) {
      const dropdown = document.getElementById('loc-suggestions-dropdown');
      if (!dropdown) return;

      if (!items || items.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      dropdown.innerHTML = items.map(item => `
        <div class="loc-suggestion-item" onclick="selectSuggestion('${item.nombre.replace(/'/g, "\\'")}', '${item.sub.replace(/'/g, "\\'")}', ${item.lat}, ${item.lng})">
          <div class="loc-sugg-icon">📍</div>
          <div class="loc-sugg-text-box">
            <div class="loc-sugg-title">${item.nombre}</div>
            <div class="loc-sugg-sub">${item.sub}</div>
          </div>
        </div>
      `).join('');

      dropdown.style.display = 'block';
    }

    function closeSuggestionsDropdown() {
      const dropdown = document.getElementById('loc-suggestions-dropdown');
      if (dropdown) dropdown.style.display = 'none';
    }

    // NAVEGACIÓN FLUIDA: Vuela con animación suave (flyTo), reposiciona el pin y actualiza el costo y dirección
    function selectSuggestion(name, sub, lat, lng) {
      const input = document.getElementById('map-query-input');
      if (input) {
        input.value = name;
        input.blur();
      }
      closeSuggestionsDropdown();

      // Reposiciona posición, distancia y costos
      updatePosition(lat, lng, false);
      document.getElementById('display-address-title').textContent = name;
      document.getElementById('display-address-sub').textContent = sub || 'Ate, Lima';

      // Vuelo suave con flyTo
      if (leafletMap) {
        leafletMap.flyTo([lat, lng], 17, {
          animate: true,
          duration: 1.3,
          easeLinearity: 0.25
        });
      }
    }

    async function searchAddressOnMap(e) {
      e.preventDefault();
      const input = document.getElementById('map-query-input');
      const query = input.value.trim();
      if (!query) return;

      closeSuggestionsDropdown();

      // Verificar primero en lugares locales
      const localFound = LOCAL_PLACES.find(p => p.nombre.toLowerCase().includes(query.toLowerCase()));
      if (localFound) {
        selectSuggestion(localFound.nombre, localFound.sub, localFound.lat, localFound.lng);
        return;
      }

      try {
        const fullQuery = query.includes('Lima') || query.includes('Ate') ? query : `${query}, Ate, Lima, Perú`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`);
        if (res.ok) {
          const datos = await res.json();
          if (datos && datos.length > 0) {
            const lat = parseFloat(datos[0].lat);
            const lng = parseFloat(datos[0].lon);
            const title = datos[0].display_name.split(',')[0];
            const sub = datos[0].display_name.split(',').slice(1, 3).join(', ');
            selectSuggestion(title, sub, lat, lng);
          } else {
            alert('No encontramos esa dirección exacta. Puedes tocar o mover el pin rojo en el mapa para ubicarte.');
          }
        }
      } catch (err) {
        console.warn('Error buscando:', err);
      }
    }

    function setChipTag(tag) {
      document.getElementById('input-address-tag').value = tag;
      document.querySelectorAll('.loc-chip-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.includes(tag));
      });
    }

    function focusAddressInput() {
      const input = document.getElementById('map-query-input');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function saveDeliveryAndGoMenu(e) {
      e.preventDefault();
      const tag = document.getElementById('input-address-tag').value.trim() || 'Mi casa';
      const phone = document.getElementById('input-phone-number').value.trim();
      const address = document.getElementById('display-address-title').textContent;

      if (!phone) {
        alert('Por favor, ingresa tu número de teléfono para coordinar la entrega.');
        return;
      }

      const deliveryData = {
        type: 'delivery',
        tag: tag,
        phone: phone,
        address: address,
        lat: currentLat,
        lng: currentLng,
        timestamp: Date.now()
      };

      localStorage.setItem('buchisapa_delivery_address', JSON.stringify(deliveryData));
      localStorage.setItem('buchisapa_active_fulfillment', 'delivery');
      localStorage.setItem('buchisapa_user_phone', phone);

      window.location.href = '/?mode=delivery';
    }

    function savePickupAndGoMenu() {
      const pickupData = {
        type: 'pickup',
        branch: 'Santa Clara',
        address: 'Av. La Estrella con Calle 28 de Julio, Ate',
        timestamp: Date.now()
      };

      localStorage.setItem('buchisapa_pickup_branch', JSON.stringify(pickupData));
      localStorage.setItem('buchisapa_active_fulfillment', 'pickup');

      window.location.href = '/?mode=pickup';
    }

    function loadStoredSettings() {
      const stored = localStorage.getItem('buchisapa_delivery_address');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.phone) document.getElementById('input-phone-number').value = parsed.phone;
          if (parsed.tag) setChipTag(parsed.tag);
        } catch (e) {}
      }
    }