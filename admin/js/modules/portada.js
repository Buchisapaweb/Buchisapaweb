/**
 * BUCHISAPA ADMIN - HERO BANNER & PORTADA MODULE
 * Layer: /admin/js/modules/portada.js
 */

(function () {
  'use strict';

  async function fetchPortadas() {
    try {
      const data = await window.AdminApi.getPortadas();
      window.AdminState.allPortadas = Array.isArray(data) && data.length > 0 ? data : defaultPortadas();
    } catch (e) {
      console.warn('Fallback portadas locales:', e);
      window.AdminState.allPortadas = defaultPortadas();
    }
    renderPortadas();
  }

  function defaultPortadas() {
    return [
      {
        id: 'portada-1',
        title: 'POLLO BROASTER',
        highlight: 'ULTRA CROCANTE',
        badge: '✨ ESPECIALIDAD DE LA CASA',
        subtitle: 'Empanizado artesanal dorado a la perfección, jugoso por dentro con papas crocantes...',
        image: '/imagenes/portada/portada-1.jpg',
        category: 'broaster',
        buttonText: 'PIDE TU BROASTER AQUÍ',
        active: true
      },
      {
        id: 'portada-2',
        title: 'JUANE TRADICIONAL',
        highlight: 'DE GALLINA',
        badge: '🌿 SAZÓN SELVÁTICA',
        subtitle: 'Arroz aromatizado envuelto en hoja de bijao con presa tierna y el auténtico sabor...',
        image: '/imagenes/portada/portada-2.jpg',
        category: 'platos-amazonicos',
        buttonText: 'DESCUBRE LA SELVA',
        active: true
      },
      {
        id: 'portada-3',
        title: 'HAMBURGUESA CLÁSICA',
        highlight: '100% CARNE ARTESANAL',
        badge: '🍔 TOP VENTAS',
        subtitle: 'Carne jugosa a la parrilla, queso cheddar derretido, lechuga fresca y papas crocantes...',
        image: '/imagenes/portada/portada-3.jpg',
        category: 'hamburguesas',
        buttonText: 'PIDE TU BURGER AHORA',
        active: true
      },
      {
        id: 'portada-4',
        title: 'FUSIÓN AMAZÓNICA',
        highlight: 'PATACONES CON CECINA',
        badge: '🔥 EXCLUSIVO BUCHISAPA',
        subtitle: 'Plátanos verdes machacados y fritos con deliciosa cecina ahumada regional...',
        image: '/imagenes/portada/portada-4.jpg',
        category: 'platos-amazonicos',
        buttonText: 'PROBAR AHORA',
        active: true
      }
    ];
  }

  function renderPortadas() {
    const container = document.getElementById('portadas-grid-container');
    const metricTotal = document.getElementById('portada-metric-total');
    const metricActive = document.getElementById('portada-metric-active');
    const portadas = window.AdminState.allPortadas || [];

    if (metricTotal) metricTotal.textContent = portadas.length.toString();
    if (metricActive) metricActive.textContent = portadas.filter(p => p.active !== false).length.toString();

    renderLivePreviewSimulator();

    if (!container) return;

    if (portadas.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          No hay portadas configuradas. ¡Crea una para dar la bienvenida a tus comensales!
        </div>
      `;
      return;
    }

    container.innerHTML = portadas.map(p => {
      const isActive = p.active !== false;
      return `
        <div class="portada-card">
          <div class="portada-card-thumb-wrap">
            <img src="${p.image}" alt="${window.AdminUtils.escapeHtml(p.title)}" class="portada-card-thumb">
            <span class="badge ${isActive ? 'badge-green' : 'badge-red'}" style="position: absolute; top: 10px; right: 10px;">
              ${isActive ? 'Activa' : 'Pausada'}
            </span>
          </div>
          <div class="portada-card-body">
            <span style="font-size: 0.72rem; color: var(--accent-orange); font-weight: 700;">${window.AdminUtils.escapeHtml(p.badge || 'PROMO')}</span>
            <h4 class="portada-card-title">${window.AdminUtils.escapeHtml(p.title)} ${window.AdminUtils.escapeHtml(p.highlight || '')}</h4>
            <p class="portada-card-subtitle">${window.AdminUtils.escapeHtml(p.subtitle || '')}</p>
          </div>
          <div class="portada-card-footer">
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="window.editPortada('${p.id}')">Editar</button>
              <button class="btn btn-secondary btn-sm" onclick="window.duplicatePortada('${p.id}')" title="Duplicar">📋</button>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.deletePortada('${p.id}')">Eliminar</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderLivePreviewSimulator() {
    const box = document.getElementById('portada-live-preview-box');
    const dotsContainer = document.getElementById('portada-sim-dots');
    const activePortadas = (window.AdminState.allPortadas || []).filter(p => p.active !== false);

    if (!box || activePortadas.length === 0) return;

    let idx = window.AdminState.currentPortadaSlide || 0;
    if (idx >= activePortadas.length) idx = 0;
    const cur = activePortadas[idx];

    box.innerHTML = `
      <img src="${cur.image}" alt="${window.AdminUtils.escapeHtml(cur.title || 'Portada')}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); padding: 5px 12px; border-radius: 8px; font-size: 0.76rem; color: #fff; border: 1px solid rgba(255,255,255,0.18); font-weight: 700;">
        Diapositiva ${idx + 1} de ${activePortadas.length}: ${window.AdminUtils.escapeHtml(cur.title || 'Sin título')}
      </div>
    `;

    if (dotsContainer) {
      dotsContainer.innerHTML = activePortadas.map((_, i) => `
        <button onclick="window.setPortadaSlide(${i})" style="width: 8px; height: 8px; border-radius: 50%; background: ${i === idx ? 'var(--accent-orange)' : 'rgba(255,255,255,0.3)'}; border: none; cursor: pointer;"></button>
      `).join('');
    }
  }

  function setPortadaSlide(i) {
    window.AdminState.currentPortadaSlide = i;
    renderLivePreviewSimulator();
  }

  function openCreatePortadaModal() {
    const modal = document.getElementById('portada-modal');
    const titleEl = document.getElementById('portada-modal-title');
    const form = document.getElementById('portada-form');
    if (!modal || !form) return;

    if (titleEl) titleEl.textContent = 'Nueva Imagen de Portada';
    form.reset();
    document.getElementById('portada-form-id').value = '';
    document.getElementById('portada-form-image').value = '/imagenes/portada/portada-1.jpg';
    updatePortadaFormPreview();
    modal.classList.add('active');
  }

  function editPortada(id) {
    const p = (window.AdminState.allPortadas || []).find(item => item.id === id);
    if (!p) return;

    const modal = document.getElementById('portada-modal');
    const titleEl = document.getElementById('portada-modal-title');
    if (!modal) return;

    if (titleEl) titleEl.textContent = 'Editar Portada';
    document.getElementById('portada-form-id').value = p.id;
    document.getElementById('portada-form-image').value = p.image || '';
    document.getElementById('portada-form-title').value = p.title || '';
    document.getElementById('portada-form-highlight').value = p.highlight || '';
    document.getElementById('portada-form-badge').value = p.badge || '';
    document.getElementById('portada-form-category').value = p.category || 'broaster';
    document.getElementById('portada-form-subtitle').value = p.subtitle || '';
    document.getElementById('portada-form-btn-text').value = p.buttonText || 'PEDIR AHORA';
    document.getElementById('portada-form-active').checked = p.active !== false;

    updatePortadaFormPreview();
    modal.classList.add('active');
  }

  function selectPortadaPreset(url) {
    const input = document.getElementById('portada-form-image');
    if (input) {
      input.value = url;
      updatePortadaFormPreview();
    }
  }

  function updatePortadaFormPreview() {
    const imgEl = document.getElementById('portada-form-preview-img');
    const textEl = document.getElementById('portada-form-preview-text');
    const inputUrl = document.getElementById('portada-form-image')?.value || '/imagenes/portada/portada-1.jpg';
    const title = document.getElementById('portada-form-title')?.value || 'POLLO BROASTER';
    const highlight = document.getElementById('portada-form-highlight')?.value || '';

    if (imgEl) imgEl.src = inputUrl;
    if (textEl) textEl.textContent = `${title} ${highlight}`.trim();
  }

  async function duplicatePortada(id) {
    const p = (window.AdminState.allPortadas || []).find(item => item.id === id);
    if (!p) return;

    const copy = { ...p, id: 'portada-' + Date.now(), title: `${p.title} (Copia)` };
    try {
      await window.AdminApi.savePortada(copy);
      window.showToast('Portada duplicada con éxito', 'success');
      await fetchPortadas();
    } catch (e) {
      window.AdminState.allPortadas.push(copy);
      renderPortadas();
      window.showToast('Portada duplicada localmente', 'info');
    }
  }

  async function deletePortada(id) {
    if (!confirm('¿Deseas eliminar esta diapositiva de la portada?')) return;
    try {
      await window.AdminApi.deletePortada(id);
      window.showToast('Portada eliminada', 'success');
      await fetchPortadas();
    } catch (e) {
      window.AdminState.allPortadas = (window.AdminState.allPortadas || []).filter(p => p.id !== id);
      renderPortadas();
      window.showToast('Portada eliminada localmente', 'info');
    }
  }

  async function quickAddPortadaPreset(presetKey) {
    const presets = {
      broaster: { title: 'POLLO BROASTER', highlight: 'MEGA CRUNCH', badge: '🍗 ULTRA CRUJIENTE', image: '/imagenes/portada/portada-1.jpg', category: 'broaster', subtitle: 'Papas nativas y cremas de la selva' },
      juane: { title: 'JUANE TRADICIONAL', highlight: 'REGIONAL', badge: '🌿 TRADICIÓN SELVÁTICA', image: '/imagenes/portada/portada-2.jpg', category: 'platos-amazonicos', subtitle: 'Aromatizado en hoja de bijao' },
      burger: { title: 'HAMBURGUESA BUCHISAPA', highlight: 'DOBLE CARNE', badge: '🍔 GOURMET', image: '/imagenes/portada/portada-3.jpg', category: 'hamburguesas', subtitle: 'Con queso cheddar y cecina crocante' },
      amazonica: { title: 'FUSIÓN AMAZÓNICA', highlight: 'PATACONES CON CECINA', badge: '🔥 SABOR AUTÉNTICO', image: '/imagenes/portada/portada-4.jpg', category: 'platos-amazonicos', subtitle: 'Sabor 100% regional' },
      alitas: { title: 'ALITAS BBQ Y COCONA', highlight: 'PICANTES Y CRUJIENTES', badge: '🍗 SNACK FAVORITO', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=1200&auto=format&fit=crop&q=80', category: 'alitas', subtitle: 'Glaseadas al fuego con mayonesa de la casa' },
      salchipapa: { title: 'SALCHIBROASTER REAL', highlight: 'CON TODAS LAS CREMAS', badge: '🍟 FUENTE GRANDE', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1200&auto=format&fit=crop&q=80', category: 'salchipapas', subtitle: 'Papas fritas con salchicha ahumada y trozos broaster' }
    };

    const data = presets[presetKey];
    if (!data) return;

    try {
      await window.AdminApi.savePortada({ ...data, buttonText: 'PEDIR AHORA', active: true });
      window.showToast(`Plantilla "${data.title}" agregada`, 'success');
      await fetchPortadas();
    } catch (e) {
      window.AdminState.allPortadas.push({ id: 'portada-' + Date.now(), ...data, buttonText: 'PEDIR AHORA', active: true });
      renderPortadas();
      window.showToast('Plantilla agregada localmente', 'info');
    }
  }

  // Bindings
  window.fetchPortadas = fetchPortadas;
  window.renderPortadas = renderPortadas;
  window.setPortadaSlide = setPortadaSlide;
  window.openCreatePortadaModal = openCreatePortadaModal;
  window.editPortada = editPortada;
  window.selectPortadaPreset = selectPortadaPreset;
  window.updatePortadaFormPreview = updatePortadaFormPreview;
  window.duplicatePortada = duplicatePortada;
  window.deletePortada = deletePortada;
  window.quickAddPortadaPreset = quickAddPortadaPreset;

})();
