/**
 * BUCHISAPA ADMIN - HERO BANNER & PORTADA MODULE
 * Layer: /admin/js/modules/portada.js
 * 
 * Control de Portadas de Inicio con:
 * - Métricas y tarjetas de estado elegantes.
 * - Página propia e independiente para Agregar / Editar Portadas.
 * - Botones independientes para elegir si configurar Escritorio, Móvil o Ambas.
 * - Subida de archivos (Galería/Dispositivo) o ingreso por URL para cada dispositivo.
 */

(function () {
  'use strict';

  let currentDesktopImage = '';
  let currentMobileImage = '';
  let currentDeviceTarget = 'both';

  async function fetchPortadas() {
    const state = window.AdminState = window.AdminState || {};
    try {
      const data = await window.AdminApi.getPortadas();
      if (Array.isArray(data) && data.length > 0) {
        state.allPortadas = data.map((p, idx) => normalizePortada(p, idx + 1));
      } else {
        state.allPortadas = defaultPortadas();
      }
    } catch (e) {
      console.warn('Fallback portadas locales:', e);
      state.allPortadas = defaultPortadas();
    }
    renderPortadas();
  }

  function normalizePortada(p, defaultIndex) {
    const num = defaultIndex || 1;
    let desktopImg = p.image || p.imageDesktop || `/imagenes/portada/Portada${num}E.webp`;
    let mobileImg = p.imageMobile || p.image_mobile || `/imagenes/portada/Portada${num}M.webp`;

    return {
      id: p.id || `portada-${num}`,
      title: p.title || `Portada ${num}`,
      image: desktopImg,
      imageMobile: mobileImg,
      active: p.active !== false,
      order: p.order !== undefined ? p.order : num
    };
  }

  function defaultPortadas() {
    return [
      {
        id: 'portada-1',
        title: 'Portada 1',
        image: '/imagenes/portada/Portada1E.webp',
        imageMobile: '/imagenes/portada/Portada1M.webp',
        active: true,
        order: 1
      },
      {
        id: 'portada-2',
        title: 'Portada 2',
        image: '/imagenes/portada/Portada2E.webp',
        imageMobile: '/imagenes/portada/Portada2M.webp',
        active: true,
        order: 2
      },
      {
        id: 'portada-3',
        title: 'Portada 3',
        image: '/imagenes/portada/Portada3E.webp',
        imageMobile: '/imagenes/portada/Portada3M.webp',
        active: true,
        order: 3
      },
      {
        id: 'portada-4',
        title: 'Portada 4',
        image: '/imagenes/portada/Portada4E.webp',
        imageMobile: '/imagenes/portada/Portada4M.webp',
        active: true,
        order: 4
      }
    ];
  }

  function getFilename(url) {
    if (!url) return '';
    if (url.startsWith('data:image')) return 'Imagen subida (Archivo local)';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  function renderPortadas() {
    const metricTotal = document.getElementById('portada-metric-total');
    const metricActive = document.getElementById('portada-metric-active');
    const metricDesktop = document.getElementById('portada-metric-desktop');
    const metricMobile = document.getElementById('portada-metric-mobile');
    const statusGrid = document.getElementById('portadas-status-grid');

    const portadas = window.AdminState.allPortadas || [];
    const activeList = portadas.filter(p => p.active !== false);

    // 4 Cuadros de métricas
    if (metricTotal) metricTotal.textContent = portadas.length.toString();
    if (metricActive) metricActive.textContent = activeList.length.toString();
    if (metricDesktop) metricDesktop.textContent = portadas.length.toString();
    if (metricMobile) metricMobile.textContent = portadas.length.toString();

    if (!statusGrid) return;

    if (portadas.length === 0) {
      statusGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-card);">
          <p style="font-size: 1rem; font-weight: 700; color: #fff;">No hay portadas configuradas en el sistema</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Haz clic en "+ Agregar Nueva Portada" para configurar la primera diapositiva.</p>
        </div>
      `;
      return;
    }

    // Renderizar tarjetas de estado
    statusGrid.innerHTML = portadas.map((p, idx) => {
      const isActive = p.active !== false;
      const desktopFilename = getFilename(p.image) || `Portada${idx + 1}E.webp`;
      const mobileFilename = getFilename(p.imageMobile) || `Portada${idx + 1}M.webp`;

      return `
        <div class="portada-status-card ${isActive ? 'is-active' : 'is-paused'}">
          <!-- CABECERA DE LA TARJETA -->
          <div class="portada-status-header">
            <div class="portada-status-slide-name">
              <span style="font-size: 1.2rem;">🖼️</span>
              <h4>${window.AdminUtils.escapeHtml(p.title || `Portada ${idx + 1}`)}</h4>
            </div>
            <span class="portada-status-badge ${isActive ? 'active' : 'paused'}">
              ${isActive ? '🟢 ACTIVA' : '⏸️ PAUSADA'}
            </span>
          </div>

          <!-- LISTA DE ARCHIVOS VINCULADOS -->
          <div class="portada-files-list">
            <div class="portada-file-item">
              <span class="portada-file-label">
                <span style="color: #06b6d4;">🖥️</span>
                <span>Escritorio:</span>
              </span>
              <code class="portada-file-badge">${desktopFilename}</code>
            </div>
            <div class="portada-file-item">
              <span class="portada-file-label">
                <span style="color: #a855f7;">📱</span>
                <span>Móvil:</span>
              </span>
              <code class="portada-file-badge">${mobileFilename}</code>
            </div>
          </div>

          <!-- BOTONES DE ACCIÓN: ACTIVAR/PAUSAR, EDITAR Y ELIMINAR -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button 
              type="button" 
              class="portada-status-toggle-btn ${isActive ? 'btn-active-state' : 'btn-paused-state'}"
              onclick="window.togglePortadaActive('${p.id}')"
            >
              <span>${isActive ? '🟢 Portada Activa en Tienda (Clic para Pausar)' : '▶️ Portada Pausada (Clic para Activar)'}</span>
            </button>

            <div style="display: flex; gap: 8px;">
              <button 
                type="button" 
                class="btn btn-secondary btn-sm" 
                style="flex: 1; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px;"
                onclick="window.editPortada('${p.id}')"
              >
                <span>✏️ Configurar / Editar</span>
              </button>
              <button 
                type="button" 
                class="btn btn-danger btn-sm" 
                style="padding: 8px 12px;"
                onclick="window.deletePortada('${p.id}')" 
                title="Eliminar Portada"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // PÁGINA PROPIA: ABRIR / CERRAR / NAVEGAR
  // ==========================================================================
  function openCreatePortadaPage() {
    const listSec = document.getElementById('portada-list-section');
    const formSec = document.getElementById('portada-form-page-section');
    const titleEl = document.getElementById('portada-form-page-title');
    const form = document.getElementById('portada-form');

    if (!formSec || !listSec) return;

    const count = (window.AdminState?.allPortadas || []).length;
    const nextNum = count + 1;

    if (titleEl) titleEl.textContent = `Nueva Diapositiva (Portada ${nextNum})`;
    if (form) form.reset();

    document.getElementById('portada-form-id').value = '';
    document.getElementById('portada-form-title').value = `Portada ${nextNum}`;
    
    currentDesktopImage = `/imagenes/portada/Portada${nextNum}E.webp`;
    currentMobileImage = `/imagenes/portada/Portada${nextNum}M.webp`;

    document.getElementById('portada-form-image').value = currentDesktopImage;
    document.getElementById('portada-form-image-mobile').value = currentMobileImage;
    document.getElementById('portada-form-active').checked = true;

    // Resetear labels de archivos
    const labelDesktop = document.getElementById('desktop-file-name-label');
    const labelMobile = document.getElementById('mobile-file-name-label');
    if (labelDesktop) labelDesktop.textContent = '';
    if (labelMobile) labelMobile.textContent = '';

    setPortadaDeviceTarget('both');
    setDesktopInputMethod('upload');
    setMobileInputMethod('upload');
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

    if (!formSec || !listSec) return;

    if (titleEl) titleEl.textContent = `Editar ${p.title || 'Portada'}`;
    document.getElementById('portada-form-id').value = p.id;
    document.getElementById('portada-form-title').value = p.title || '';
    
    currentDesktopImage = p.image || '';
    currentMobileImage = p.imageMobile || p.image_mobile || '';

    document.getElementById('portada-form-image').value = currentDesktopImage;
    document.getElementById('portada-form-image-mobile').value = currentMobileImage;
    document.getElementById('portada-form-active').checked = p.active !== false;

    // Si ya tiene URLs personalizadas, seleccionar modo URL
    const isDesktopUpload = currentDesktopImage.startsWith('data:image');
    const isMobileUpload = currentMobileImage.startsWith('data:image');

    setDesktopInputMethod(isDesktopUpload ? 'upload' : 'url');
    setMobileInputMethod(isMobileUpload ? 'upload' : 'url');

    setPortadaDeviceTarget('both');
    updatePortadaFormPreview();

    listSec.style.display = 'none';
    formSec.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // SELECTOR DE DISPOSITIVOS INDEPENDIENTES (AMBAS, ESCRITORIO, MÓVIL)
  // ==========================================================================
  function setPortadaDeviceTarget(target) {
    currentDeviceTarget = target;

    const btnBoth = document.getElementById('btn-device-target-both');
    const btnDesktop = document.getElementById('btn-device-target-desktop');
    const btnMobile = document.getElementById('btn-device-target-mobile');

    const secDesktop = document.getElementById('portada-section-desktop');
    const secMobile = document.getElementById('portada-section-mobile');

    [btnBoth, btnDesktop, btnMobile].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    if (target === 'both') {
      if (btnBoth) btnBoth.classList.add('active');
      if (secDesktop) secDesktop.style.display = 'block';
      if (secMobile) secMobile.style.display = 'block';
    } else if (target === 'desktop') {
      if (btnDesktop) btnDesktop.classList.add('active');
      if (secDesktop) secDesktop.style.display = 'block';
      if (secMobile) secMobile.style.display = 'none';
    } else if (target === 'mobile') {
      if (btnMobile) btnMobile.classList.add('active');
      if (secDesktop) secDesktop.style.display = 'none';
      if (secMobile) secMobile.style.display = 'block';
    }
  }

  // ==========================================================================
  // PESTAÑAS DE MÉTODO (SUBIR ARCHIVO O INGRESAR URL)
  // ==========================================================================
  function setDesktopInputMethod(method) {
    const tabUpload = document.getElementById('tab-desktop-upload');
    const tabUrl = document.getElementById('tab-desktop-url');
    const conUpload = document.getElementById('desktop-upload-container');
    const conUrl = document.getElementById('desktop-url-container');

    if (method === 'upload') {
      if (tabUpload) tabUpload.classList.add('active');
      if (tabUrl) tabUrl.classList.remove('active');
      if (conUpload) conUpload.style.display = 'block';
      if (conUrl) conUrl.style.display = 'none';
    } else {
      if (tabUpload) tabUpload.classList.remove('active');
      if (tabUrl) tabUrl.classList.add('active');
      if (conUpload) conUpload.style.display = 'none';
      if (conUrl) conUrl.style.display = 'block';
    }
  }

  function setMobileInputMethod(method) {
    const tabUpload = document.getElementById('tab-mobile-upload');
    const tabUrl = document.getElementById('tab-mobile-url');
    const conUpload = document.getElementById('mobile-upload-container');
    const conUrl = document.getElementById('mobile-url-container');

    if (method === 'upload') {
      if (tabUpload) tabUpload.classList.add('active');
      if (tabUrl) tabUrl.classList.remove('active');
      if (conUpload) conUpload.style.display = 'block';
      if (conUrl) conUrl.style.display = 'none';
    } else {
      if (tabUpload) tabUpload.classList.remove('active');
      if (tabUrl) tabUrl.classList.add('active');
      if (conUpload) conUpload.style.display = 'none';
      if (conUrl) conUrl.style.display = 'block';
    }
  }

  // ==========================================================================
  // MANEJADORES DE SUBIDA DE ARCHIVOS (FILE UPLOAD & DRAG/DROP)
  // ==========================================================================
  function handleDesktopFileSelect(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    readAndSetImageFile(file, 'desktop');
  }

  function handleMobileFileSelect(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    readAndSetImageFile(file, 'mobile');
  }

  function handleDragOver(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget) e.currentTarget.classList.add('dragover');
    }
  }

  function handleDragLeave(e) {
    if (e && e.currentTarget) {
      e.currentTarget.classList.remove('dragover');
    }
  }

  function handleDesktopDrop(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget) e.currentTarget.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        readAndSetImageFile(e.dataTransfer.files[0], 'desktop');
      }
    }
  }

  function handleMobileDrop(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget) e.currentTarget.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        readAndSetImageFile(e.dataTransfer.files[0], 'mobile');
      }
    }
  }

  function readAndSetImageFile(file, device) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.showToast('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const dataUrl = event.target.result;
      if (device === 'desktop') {
        currentDesktopImage = dataUrl;
        const inputUrl = document.getElementById('portada-form-image');
        if (inputUrl) inputUrl.value = dataUrl;
        const label = document.getElementById('desktop-file-name-label');
        if (label) label.textContent = `✓ Archivo cargado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      } else {
        currentMobileImage = dataUrl;
        const inputUrl = document.getElementById('portada-form-image-mobile');
        if (inputUrl) inputUrl.value = dataUrl;
        const label = document.getElementById('mobile-file-name-label');
        if (label) label.textContent = `✓ Archivo cargado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      }
      updatePortadaFormPreview();
      window.showToast(`Imagen ${device === 'desktop' ? 'Escritorio' : 'Móvil'} lista para guardar`, 'success');
    };
    reader.readAsDataURL(file);
  }

  function updatePortadaFormPreview() {
    const desktopInput = document.getElementById('portada-form-image')?.value || currentDesktopImage || '/imagenes/portada/Portada1E.webp';
    const mobileInput = document.getElementById('portada-form-image-mobile')?.value || currentMobileImage || '/imagenes/portada/Portada1M.webp';

    const desktopImgEl = document.getElementById('portada-form-preview-img');
    const mobileImgEl = document.getElementById('portada-form-preview-img-mobile');
    const desktopBadge = document.getElementById('preview-desktop-badge');
    const mobileBadge = document.getElementById('preview-mobile-badge');

    if (desktopImgEl) desktopImgEl.src = desktopInput;
    if (mobileImgEl) mobileImgEl.src = mobileInput;
    if (desktopBadge) desktopBadge.textContent = getFilename(desktopInput);
    if (mobileBadge) mobileBadge.textContent = getFilename(mobileInput);
  }

  // ==========================================================================
  // GUARDAR PORTADA (API O LOCAL STATE)
  // ==========================================================================
  async function handlePortadaFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('portada-form-id').value;
    const isEdit = Boolean(id);

    const title = document.getElementById('portada-form-title').value.trim() || 'Portada';
    const desktopImage = document.getElementById('portada-form-image').value.trim() || currentDesktopImage || '/imagenes/portada/Portada1E.webp';
    const mobileImage = document.getElementById('portada-form-image-mobile').value.trim() || currentMobileImage || '/imagenes/portada/Portada1M.webp';

    const data = {
      title: title,
      image: desktopImage,
      imageMobile: mobileImage,
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
        const nextOrder = (window.AdminState.allPortadas || []).length + 1;
        window.AdminState.allPortadas.push({ id: 'portada-' + Date.now(), ...data, order: nextOrder });
      }
      renderPortadas();
      closePortadaFormView();
      window.showToast('Portada guardada en sesión local', 'info');
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

  async function deletePortada(id) {
    if (!confirm('¿Deseas eliminar permanentemente esta diapositiva de portada?')) return;
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

  // Window Bindings
  window.fetchPortadas = fetchPortadas;
  window.renderPortadas = renderPortadas;
  window.openCreatePortadaPage = openCreatePortadaPage;
  window.openCreatePortadaModal = openCreatePortadaPage; // alias
  window.closePortadaFormView = closePortadaFormView;
  window.editPortada = editPortada;
  window.setPortadaDeviceTarget = setPortadaDeviceTarget;
  window.setDesktopInputMethod = setDesktopInputMethod;
  window.setMobileInputMethod = setMobileInputMethod;
  window.handleDesktopFileSelect = handleDesktopFileSelect;
  window.handleMobileFileSelect = handleMobileFileSelect;
  window.handleDragOver = handleDragOver;
  window.handleDragLeave = handleDragLeave;
  window.handleDesktopDrop = handleDesktopDrop;
  window.handleMobileDrop = handleMobileDrop;
  window.updatePortadaFormPreview = updatePortadaFormPreview;
  window.handlePortadaFormSubmit = handlePortadaFormSubmit;
  window.togglePortadaActive = togglePortadaActive;
  window.deletePortada = deletePortada;

})();
