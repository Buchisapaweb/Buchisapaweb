/**
 * BUCHISAPA ADMIN - HERO BANNER & PORTADA MODULE
 * Layer: /admin/js/modules/portada.js
 */

(function () {
  'use strict';

  async function fetchPortadas() {
    const state = window.AdminState = window.AdminState || {};
    try {
      const data = await window.AdminApi.getPortadas();
      state.allPortadas = Array.isArray(data) && data.length > 0 ? data : defaultPortadas();
    } catch (e) {
      console.warn('Fallback portadas locales:', e);
      state.allPortadas = defaultPortadas();
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
        image: '/imagenes/portada/Portada1E.webp',
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
        image: '/imagenes/portada/Portada2E.webp',
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
        image: '/imagenes/portada/Portada3E.webp',
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
        image: '/imagenes/portada/Portada4E.webp',
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
    const metricInactive = document.getElementById('portada-metric-inactive');
    const metricCategories = document.getElementById('portada-metric-categories');

    const portadas = window.AdminState.allPortadas || [];

    const activeList = portadas.filter(p => p.active !== false);
    const inactiveList = portadas.filter(p => p.active === false);
    const uniqueCats = new Set(portadas.map(p => p.category || 'general'));

    if (metricTotal) metricTotal.textContent = portadas.length.toString();
    if (metricActive) metricActive.textContent = activeList.length.toString();
    if (metricInactive) metricInactive.textContent = inactiveList.length.toString();
    if (metricCategories) metricCategories.textContent = uniqueCats.size.toString();

    renderLivePreviewSimulator();

    if (!container) return;

    if (portadas.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-card);">
          <p style="font-size: 1rem; font-weight: 700; color: #fff;">No hay portadas configuradas</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">¡Agrega una nueva imagen o selecciona una plantilla rápida para comenzar!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = portadas.map((p, idx) => {
      const isActive = p.active !== false;
      const categoryName = (p.category || 'General').toUpperCase();

      return `
        <div class="portada-card ${isActive ? '' : 'portada-card-paused'}">
          <div class="portada-card-thumb-wrap">
            <img src="${p.image}" alt="${window.AdminUtils.escapeHtml(p.title)}" class="portada-card-thumb" onerror="this.src='/imagenes/portada/Portada1E.webp'">
            <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; color: #fff; border: 1px solid rgba(255,255,255,0.15);">
              Slide #${idx + 1}
            </div>
            <button onclick="window.togglePortadaActive('${p.id}')" style="position: absolute; top: 10px; right: 10px; border: none; cursor: pointer; border-radius: 9999px; padding: 3px 10px; font-size: 0.72rem; font-weight: 800; transition: all 0.2s;" class="${isActive ? 'badge-green-glow' : 'badge-amber-glow'}">
              ${isActive ? '🟢 ACTIVA' : '⏸️ PAUSADA'}
            </button>
          </div>
          <div class="portada-card-body">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: var(--accent-orange); font-weight: 800; text-transform: uppercase;">
                ${window.AdminUtils.escapeHtml(p.badge || '✨ PORTADA BUCHISAPA')}
              </span>
              <span style="font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: var(--text-muted); font-weight: 600;">
                ${categoryName}
              </span>
            </div>
            <h4 class="portada-card-title">
              ${window.AdminUtils.escapeHtml(p.title)} <span style="color: var(--accent-orange);">${window.AdminUtils.escapeHtml(p.highlight || '')}</span>
            </h4>
            <p class="portada-card-subtitle">${window.AdminUtils.escapeHtml(p.subtitle || 'Sin descripción asignada.')}</p>
          </div>
          <div class="portada-card-footer">
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="window.editPortada('${p.id}')" style="font-weight: 700;">✏️ Editar</button>
              <button class="btn btn-secondary btn-sm" onclick="window.duplicatePortada('${p.id}')" title="Duplicar">📋</button>
              <button class="btn btn-secondary btn-sm" onclick="window.togglePortadaActive('${p.id}')" title="${isActive ? 'Pausar' : 'Activar'}">
                ${isActive ? '⏸️' : '▶️'}
              </button>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.deletePortada('${p.id}')" title="Eliminar">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setPreviewDeviceMode(mode) {
    window.AdminState.previewDeviceMode = mode;

    const btnDesktop = document.getElementById('btn-preview-mode-desktop');
    const btnMobile = document.getElementById('btn-preview-mode-mobile');

    if (btnDesktop) {
      if (mode === 'desktop') {
        btnDesktop.style.background = 'var(--accent-orange)';
        btnDesktop.style.color = '#fff';
      } else {
        btnDesktop.style.background = 'transparent';
        btnDesktop.style.color = 'var(--text-muted)';
      }
    }

    if (btnMobile) {
      if (mode === 'mobile') {
        btnMobile.style.background = 'var(--accent-orange)';
        btnMobile.style.color = '#fff';
      } else {
        btnMobile.style.background = 'transparent';
        btnMobile.style.color = 'var(--text-muted)';
      }
    }

    renderLivePreviewSimulator();
  }

  function renderLivePreviewSimulator() {
    const box = document.getElementById('portada-live-preview-box');
    const dotsContainer = document.getElementById('portada-sim-dots');
    const activePortadas = (window.AdminState.allPortadas || []).filter(p => p.active !== false);

    if (!box) return;

    if (activePortadas.length === 0) {
      box.style.width = '100%';
      box.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--text-muted); text-align: center; padding: 20px;">
          <p style="font-size: 0.9rem; font-weight: 700;">No hay diapositivas activas para previsualizar</p>
          <span style="font-size: 0.78rem;">Activa al menos una portada en la lista inferior</span>
        </div>
      `;
      if (dotsContainer) dotsContainer.innerHTML = '';
      return;
    }

    let idx = window.AdminState.currentPortadaSlide || 0;
    if (idx >= activePortadas.length) idx = 0;
    const cur = activePortadas[idx];

    const deviceMode = window.AdminState.previewDeviceMode || 'desktop';

    if (deviceMode === 'mobile') {
      // VISTA MÓVIL (Celular en formato vertical, SIN TEXTO SUPERPUESTO)
      const mobileImgSrc = cur.imageMobile || cur.image_mobile || cur.image || '/imagenes/portada/Portada1M.webp';

      box.style.width = '240px';
      box.style.margin = '0 auto';
      box.style.borderRadius = '20px';
      box.style.border = '3px solid rgba(255, 255, 255, 0.2)';
      box.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6)';

      box.innerHTML = `
        <!-- Notch de Smartphone -->
        <div style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 60px; height: 12px; background: #000; border-radius: 10px; z-index: 10; border: 1px solid rgba(255,255,255,0.1);"></div>

        <div style="position: relative; width: 100%; height: 360px; border-radius: 16px; overflow: hidden; background: #000;">
          <img src="${mobileImgSrc}" alt="${window.AdminUtils.escapeHtml(cur.title || 'Portada Móvil')}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/imagenes/portada/Portada1M.webp'">

          <!-- Badge Indicador Móvil -->
          <div style="position: absolute; top: 22px; right: 10px; background: rgba(0,0,0,0.8); backdrop-filter: blur(6px); padding: 3px 8px; border-radius: 12px; font-size: 0.65rem; color: #fff; border: 1px solid rgba(255,255,255,0.2); font-weight: 800;">
            📱 Móvil #${idx + 1}
          </div>
        </div>
      `;
    } else {
      // VISTA ESCRITORIO (Panorámica PC, SIN TEXTO SUPERPUESTO)
      const desktopImgSrc = cur.image || cur.imageDesktop || '/imagenes/portada/Portada1E.webp';

      box.style.width = '100%';
      box.style.margin = '0';
      box.style.borderRadius = 'var(--radius-md)';
      box.style.border = '1px solid rgba(255, 255, 255, 0.12)';
      box.style.boxShadow = 'none';

      box.innerHTML = `
        <div style="position: relative; width: 100%; height: 230px; border-radius: var(--radius-md); overflow: hidden; background: #000;">
          <img src="${desktopImgSrc}" alt="${window.AdminUtils.escapeHtml(cur.title || 'Portada Escritorio')}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/imagenes/portada/Portada1E.webp'">

          <!-- Badge Indicador Escritorio -->
          <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 20px; font-size: 0.72rem; color: #fff; border: 1px solid rgba(255,255,255,0.2); font-weight: 800;">
            🖥️ Escritorio #${idx + 1}
          </div>
        </div>
      `;
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = activePortadas.map((_, i) => `
        <button onclick="window.setPortadaSlide(${i})" style="width: 10px; height: 10px; border-radius: 50%; background: ${i === idx ? 'var(--accent-orange)' : 'rgba(255,255,255,0.3)'}; border: none; cursor: pointer; transition: all 0.2s; transform: ${i === idx ? 'scale(1.2)' : 'scale(1)'};" title="Ver Slide ${i + 1}"></button>
      `).join('');
    }
  }

  function setPortadaSlide(i) {
    window.AdminState.currentPortadaSlide = i;
    renderLivePreviewSimulator();
  }

  function openCreatePortadaModal() {
    const listSec = document.getElementById('portada-list-section');
    const formSec = document.getElementById('portada-form-page-section');
    const titleEl = document.getElementById('portada-form-page-title');
    const form = document.getElementById('portada-form');

    const modal = document.getElementById('portada-modal');
    if (modal) modal.classList.remove('active');

    if (!formSec || !listSec) return;

    if (titleEl) titleEl.textContent = 'Nueva Imagen de Portada';
    if (form) form.reset();
    document.getElementById('portada-form-id').value = '';
    document.getElementById('portada-form-image').value = '/imagenes/portada/Portada1E.webp';
    if (document.getElementById('portada-form-image-mobile')) {
      document.getElementById('portada-form-image-mobile').value = '/imagenes/portada/Portada1M.webp';
    }
    updatePortadaFormPreview();
    listSec.style.display = 'none';
    formSec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closePortadaFormView() {
    const listSec = document.getElementById('portada-list-section');
    const formSec = document.getElementById('portada-form-page-section');
    if (formSec) formSec.style.display = 'none';
    if (listSec) listSec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function editPortada(id) {
    const p = (window.AdminState.allPortadas || []).find(item => item.id === id);
    if (!p) return;

    const listSec = document.getElementById('portada-list-section');
    const formSec = document.getElementById('portada-form-page-section');
    const titleEl = document.getElementById('portada-form-page-title');

    const modal = document.getElementById('portada-modal');
    if (modal) modal.classList.remove('active');

    if (!formSec || !listSec) return;

    if (titleEl) titleEl.textContent = 'Editar Portada';
    document.getElementById('portada-form-id').value = p.id;
    document.getElementById('portada-form-image').value = p.image || '';
    if (document.getElementById('portada-form-image-mobile')) {
      document.getElementById('portada-form-image-mobile').value = p.imageMobile || p.image_mobile || '';
    }
    document.getElementById('portada-form-title').value = p.title || '';
    document.getElementById('portada-form-highlight').value = p.highlight || '';
    document.getElementById('portada-form-badge').value = p.badge || '';
    document.getElementById('portada-form-category').value = p.category || 'broaster';
    document.getElementById('portada-form-subtitle').value = p.subtitle || '';
    document.getElementById('portada-form-btn-text').value = p.buttonText || 'PEDIR AHORA';
    document.getElementById('portada-form-active').checked = p.active !== false;

    updatePortadaFormPreview();
    listSec.style.display = 'none';
    formSec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handlePortadaFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('portada-form-id').value;
    const isEdit = Boolean(id);

    const data = {
      title: document.getElementById('portada-form-title').value.trim(),
      highlight: document.getElementById('portada-form-highlight').value.trim(),
      badge: document.getElementById('portada-form-badge').value.trim(),
      image: document.getElementById('portada-form-image').value.trim() || '/imagenes/portada/Portada1E.webp',
      imageMobile: document.getElementById('portada-form-image-mobile')?.value.trim() || undefined,
      category: document.getElementById('portada-form-category').value,
      subtitle: document.getElementById('portada-form-subtitle').value.trim(),
      buttonText: document.getElementById('portada-form-btn-text').value.trim() || 'PEDIR AHORA',
      active: document.getElementById('portada-form-active').checked
    };

    try {
      await window.AdminApi.savePortada(data, isEdit, id);
      window.showToast(`Portada ${isEdit ? 'actualizada' : 'creada'} con éxito`, 'success');
      closePortadaFormView();
      await fetchPortadas();
    } catch (err) {
      console.warn('Fallback guardado local de portada:', err);
      if (isEdit) {
        const idx = (window.AdminState.allPortadas || []).findIndex(p => p.id === id);
        if (idx !== -1) window.AdminState.allPortadas[idx] = { ...window.AdminState.allPortadas[idx], ...data };
      } else {
        window.AdminState.allPortadas.push({ id: 'portada-' + Date.now(), ...data });
      }
      renderPortadas();
      closePortadaFormView();
      window.showToast('Portada guardada en sesión local', 'info');
    }
  }

  function selectPortadaPreset(url, mobileUrl) {
    const input = document.getElementById('portada-form-image');
    if (input) {
      input.value = url;
      updatePortadaFormPreview();
    }
    const mobileInput = document.getElementById('portada-form-image-mobile');
    if (mobileInput && mobileUrl) {
      mobileInput.value = mobileUrl;
    }
  }

  function updatePortadaFormPreview() {
    const imgEl = document.getElementById('portada-form-preview-img');
    const textEl = document.getElementById('portada-form-preview-text');
    const inputUrl = document.getElementById('portada-form-image')?.value || '/imagenes/portada/Portada1E.webp';
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
      broaster: { title: 'POLLO BROASTER', highlight: 'MEGA CRUNCH', badge: '🍗 ULTRA CRUJIENTE', image: '/imagenes/portada/Portada1E.webp', imageMobile: '/imagenes/portada/Portada1M.webp', category: 'broaster', subtitle: 'Papas nativas y cremas de la selva' },
      juane: { title: 'JUANE TRADICIONAL', highlight: 'REGIONAL', badge: '🌿 TRADICIÓN SELVÁTICA', image: '/imagenes/portada/Portada2E.webp', imageMobile: '/imagenes/portada/Portada2M.webp', category: 'platos-amazonicos', subtitle: 'Aromatizado en hoja de bijao' },
      burger: { title: 'HAMBURGUESA BUCHISAPA', highlight: 'DOBLE CARNE', badge: '🍔 GOURMET', image: '/imagenes/portada/Portada3E.webp', imageMobile: '/imagenes/portada/Portada3M.webp', category: 'hamburguesas', subtitle: 'Con queso cheddar y cecina crocante' },
      amazonica: { title: 'FUSIÓN AMAZÓNICA', highlight: 'PATACONES CON CECINA', badge: '🔥 SABOR AUTÉNTICO', image: '/imagenes/portada/Portada4E.webp', imageMobile: '/imagenes/portada/Portada4M.webp', category: 'platos-amazonicos', subtitle: 'Sabor 100% regional' },
      alitas: { title: 'ALITAS BBQ Y COCONA', highlight: 'PICANTES Y CRUJIENTES', badge: '🍗 SNACK FAVORITO', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=1200&auto=format&fit=crop&q=80', imageMobile: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80', category: 'alitas', subtitle: 'Glaseadas al fuego con mayonesa de la casa' },
      salchipapa: { title: 'SALCHIBROASTER REAL', highlight: 'CON TODAS LAS CREMAS', badge: '🍟 FUENTE GRANDE', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1200&auto=format&fit=crop&q=80', imageMobile: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', category: 'salchipapas', subtitle: 'Papas fritas con salchicha ahumada y trozos broaster' }
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

  async function togglePortadaActive(id) {
    const p = (window.AdminState.allPortadas || []).find(item => item.id === id);
    if (!p) return;

    const newActiveState = p.active === false ? true : false;
    p.active = newActiveState;

    try {
      await window.AdminApi.savePortada(p, true, id);
      window.showToast(`Portada ${newActiveState ? 'activada' : 'pausada'} con éxito`, 'success');
      await fetchPortadas();
    } catch (e) {
      renderPortadas();
      window.showToast(`Estado actualizado (${newActiveState ? 'Activa' : 'Pausada'})`, 'info');
    }
  }

  function filterPortadas(filterKey) {
    const all = window.AdminState.allPortadas || [];
    const container = document.getElementById('portadas-grid-container');
    if (!container) return;

    let filtered = all;
    if (filterKey === 'active') filtered = all.filter(p => p.active !== false);
    if (filterKey === 'inactive') filtered = all.filter(p => p.active === false);

    // Temp override for rendering
    const tempState = window.AdminState.allPortadas;
    window.AdminState.allPortadas = filtered;
    renderPortadas();
    window.AdminState.allPortadas = tempState;
  }

  // Bindings
  window.fetchPortadas = fetchPortadas;
  window.renderPortadas = renderPortadas;
  window.setPortadaSlide = setPortadaSlide;
  window.setPreviewDeviceMode = setPreviewDeviceMode;
  window.openCreatePortadaModal = openCreatePortadaModal;
  window.closePortadaFormView = closePortadaFormView;
  window.editPortada = editPortada;
  window.handlePortadaFormSubmit = handlePortadaFormSubmit;
  window.selectPortadaPreset = selectPortadaPreset;
  window.updatePortadaFormPreview = updatePortadaFormPreview;
  window.duplicatePortada = duplicatePortada;
  window.deletePortada = deletePortada;
  window.quickAddPortadaPreset = quickAddPortadaPreset;
  window.togglePortadaActive = togglePortadaActive;
  window.filterPortadas = filterPortadas;

})();

