/**
 * BuchiSapa Admin - Módulo de Portadas (Hero Banners)
 * Visualización vertical centrada, soporte 1920×1080 para pantallas grandes y móvil vertical adaptado
 * Guardado automático de imágenes en /imagenes/portada/Portada{N}E.webp y /imagenes/portada/Portada{N}M.webp
 * Cache-busting automático para refresco visual instantáneo al guardar
 * Botones de acción centrados y perfectamente balanceados
 */

(function () {
  'use strict';

  let currentEditingId = null;
  let activeDeviceTarget = 'both'; // 'both', 'desktop', 'mobile'
  let pendingDesktopBase64 = null;
  let pendingMobileBase64 = null;

  function init() {
    loadPortadas();
    setupEventListeners();
  }

  function setupEventListeners() {
    document.addEventListener('admin-data-loaded', () => {
      renderPortadas();
    });

    const activeCheck = document.getElementById('portada-form-active');
    const activeLabel = document.getElementById('portada-active-label');
    if (activeCheck && activeLabel) {
      activeCheck.addEventListener('change', () => {
        activeLabel.textContent = activeCheck.checked ? '🟢 Visible en la tienda' : '⏸️ Pausada (Oculta)';
        activeLabel.style.color = activeCheck.checked ? '#6ee7b7' : '#fde047';
      });
    }

    const desktopUrl = document.getElementById('portada-form-image');
    const mobileUrl = document.getElementById('portada-form-image-mobile');
    if (desktopUrl) desktopUrl.addEventListener('input', updatePreviews);
    if (mobileUrl) mobileUrl.addEventListener('input', updatePreviews);
  }

  async function loadPortadas() {
    try {
      const res = await fetch(`/api/portadas?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          window.AdminState.allPortadas = json.data;
        } else {
          window.AdminState.allPortadas = defaultPortadas();
        }
      } else {
        window.AdminState.allPortadas = defaultPortadas();
      }
    } catch (e) {
      console.warn('Error al cargar portadas desde API:', e);
      if (!window.AdminState.allPortadas || window.AdminState.allPortadas.length === 0) {
        window.AdminState.allPortadas = defaultPortadas();
      }
    }
    renderPortadas();
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
    if (url.startsWith('data:image')) return 'Imagen cargada desde dispositivo';
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('/');
    return parts[parts.length - 1];
  }

  // Obtener el número 'n' de la diapositiva en edición o creación
  function getCurrentSlideNumber() {
    const portadas = window.AdminState.allPortadas || [];
    if (currentEditingId) {
      const idx = portadas.findIndex(p => p.id === currentEditingId);
      if (idx !== -1) {
        return portadas[idx].order || (idx + 1);
      }
    }
    // Si es nueva
    return portadas.length + 1;
  }

  function renderPortadas() {
    const metricTotal = document.getElementById('portada-metric-total');
    const metricActive = document.getElementById('portada-metric-active');
    const metricDesktop = document.getElementById('portada-metric-desktop');
    const metricMobile = document.getElementById('portada-metric-mobile');
    const statusGrid = document.getElementById('portadas-status-grid');
    const badgeStatus = document.getElementById('portada-banner-status-badge');

    const portadas = window.AdminState.allPortadas || [];
    const activeList = portadas.filter(p => p.active !== false);

    // 4 Cuadros de métricas informativos
    if (metricTotal) metricTotal.textContent = portadas.length.toString();
    if (metricActive) metricActive.textContent = `${activeList.length} activas`;
    if (metricDesktop) metricDesktop.textContent = portadas.length.toString();
    if (metricMobile) metricMobile.textContent = portadas.length.toString();

    if (badgeStatus) {
      if (activeList.length === 0) {
        badgeStatus.textContent = 'TODAS LAS PORTADAS PAUSADAS';
        badgeStatus.parentElement.style.background = 'rgba(239, 68, 68, 0.2)';
        badgeStatus.parentElement.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        badgeStatus.style.color = '#fca5a5';
      } else {
        badgeStatus.textContent = `${activeList.length} DE ${portadas.length} PORTADAS ACTIVAS EN TIENDA`;
        badgeStatus.parentElement.style.background = 'rgba(16, 185, 129, 0.18)';
        badgeStatus.parentElement.style.borderColor = 'rgba(16, 185, 129, 0.45)';
        badgeStatus.style.color = '#6ee7b7';
      }
    }

    if (!statusGrid) return;

    if (portadas.length === 0) {
      statusGrid.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; color: #cbd5e1; background: rgba(26, 16, 51, 0.85); border-radius: var(--radius-lg); border: 2px dashed rgba(255, 98, 0, 0.4); max-width: 600px; margin: 0 auto;">
          <div style="font-size: 2.8rem; margin-bottom: 12px;">🖼️</div>
          <p style="font-size: 1.2rem; font-weight: 900; color: #ffffff; margin: 0;">No hay portadas registradas</p>
          <p style="font-size: 0.92rem; margin: 6px 0 18px; color: #e2e8f0;">Haz clic en el botón superior para agregar tu primera portada.</p>
          <button class="btn-clean-primary" onclick="window.openCreatePortadaPage()" style="font-weight: 800; min-height: 48px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Agregar Portada</span>
          </button>
        </div>
      `;
      return;
    }

    // Renderizar tarjetas centradas con imágenes apiladas (1920x1080 arriba, Móvil centrado abajo)
    statusGrid.innerHTML = portadas.map((p, idx) => {
      const isActive = p.active !== false;
      const slideNum = p.order || (idx + 1);
      const defaultDesktop = `/imagenes/portada/Portada${slideNum}E.webp`;
      const defaultMobile = `/imagenes/portada/Portada${slideNum}M.webp`;

      const rawDesktop = p.image || defaultDesktop;
      const rawMobile = p.imageMobile || defaultMobile;

      const versionParam = `?v=${p.updatedAt ? new Date(p.updatedAt).getTime() : Date.now()}`;
      const desktopSrc = rawDesktop.startsWith('data:image') ? rawDesktop : `${rawDesktop.split('?')[0]}${versionParam}`;
      const mobileSrc = rawMobile.startsWith('data:image') ? rawMobile : `${rawMobile.split('?')[0]}${versionParam}`;

      const desktopFilename = getFilename(rawDesktop) || `Portada${slideNum}E.webp`;
      const mobileFilename = getFilename(rawMobile) || `Portada${slideNum}M.webp`;

      return `
        <div class="portada-status-card-centered ${isActive ? 'is-active' : 'is-paused'}">
          
          <!-- CABECERA DE LA TARJETA -->
          <div class="portada-status-header">
            <div class="portada-status-slide-name">
              <span class="portada-card-idx">#${slideNum}</span>
              <h4 class="portada-card-title-text">${window.AdminUtils.escapeHtml(p.title || `Portada ${slideNum}`)}</h4>
            </div>
            <span class="portada-status-badge ${isActive ? 'active' : 'paused'}">
              ${isActive ? '🟢 ACTIVA (Visible en Tienda)' : '⏸️ PAUSADA (Oculta)'}
            </span>
          </div>

          <!-- CONTENEDOR DE IMÁGENES APILADAS VERTICALMENTE -->
          <div class="portada-stacked-showcase">
            
            <!-- 1. IMAGEN DE ESCRITORIO (1920 × 1080 - 16:9 PROPORCIÓN COMPLETA) -->
            <div class="portada-showcase-item desktop-item">
              <div class="showcase-header-tag">
                <div class="tag-left">
                  <span class="tag-icon">🖥️</span>
                  <strong class="tag-title">Versión Escritorio / Tabletas (Pantalla Grande)</strong>
                </div>
                <span class="tag-res cyan-res">1920 × 1080 px (16:9)</span>
              </div>
              
              <div class="portada-thumb-container desktop-1080-wrap">
                <img src="${desktopSrc}" alt="Portada Escritorio ${slideNum}" loading="lazy" onerror="if(!this.dataset.failed){this.dataset.failed='1';this.src='${mobileSrc}';}else{this.src='${defaultDesktop}';}">
              </div>

              <div class="portada-file-pill" title="${desktopFilename}">
                <span class="pill-dot cyan-dot"></span>
                <span class="pill-label">Ruta:</span>
                <span class="pill-name">${rawDesktop.startsWith('/imagenes/portada/') ? rawDesktop.split('?')[0] : `/imagenes/portada/Portada${slideNum}E.webp`}</span>
              </div>
            </div>

            <!-- 2. IMAGEN DE MÓVIL (VERTICAL SMARTPHONE CENTRADA Y SIN DISTORSIÓN) -->
            <div class="portada-showcase-item mobile-item">
              <div class="showcase-header-tag">
                <div class="tag-left">
                  <span class="tag-icon">📱</span>
                  <strong class="tag-title">Versión Móvil (Vertical Smartphone / Celular)</strong>
                </div>
                <span class="tag-res purple-res">Vertical Smartphone</span>
              </div>

              <div class="mobile-thumb-centered-frame">
                <div class="portada-thumb-container mobile-vertical-wrap">
                  <img src="${mobileSrc}" alt="Portada Móvil ${slideNum}" loading="lazy" onerror="if(!this.dataset.failed){this.dataset.failed='1';this.src='${desktopSrc}';}else{this.src='${defaultMobile}';}">
                </div>
              </div>

              <div class="portada-file-pill" title="${mobileFilename}">
                <span class="pill-dot purple-dot"></span>
                <span class="pill-label">Ruta:</span>
                <span class="pill-name">${rawMobile.startsWith('/imagenes/portada/') ? rawMobile.split('?')[0] : `/imagenes/portada/Portada${slideNum}M.webp`}</span>
              </div>
            </div>

          </div>

          <!-- BOTONES DE ACCIÓN RÁPIDA -->
          <div class="portada-card-actions-row-centered">
            <button type="button" 
                    class="btn-portada-toggle ${isActive ? 'btn-pause' : 'btn-activate-prominent'}" 
                    onclick="window.togglePortadaStatus('${p.id}')"
                    title="${isActive ? 'Pausar esta portada' : 'Activar y hacer visible'}">
              ${isActive 
                ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg><span>Pausar</span>` 
                : `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Activar</span>`
              }
            </button>
            <button type="button" 
                    class="btn-portada-edit" 
                    onclick="window.openEditPortadaPage('${p.id}')"
                    title="Cambiar imágenes o nombre">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              <span>Editar Fotos</span>
            </button>
            <button type="button" 
                    class="btn-portada-delete" 
                    onclick="window.deletePortadaSlide('${p.id}')" 
                    title="Eliminar portada">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  // NAVEGACIÓN Y APERTURA DE FORMULARIO
  window.openCreatePortadaPage = function () {
    currentEditingId = null;
    pendingDesktopBase64 = null;
    pendingMobileBase64 = null;

    const listSec = document.getElementById('portada-list-section');
    const formSec = document.getElementById('portada-form-page-section');
    const titleEl = document.getElementById('portada-form-page-title');
    const btnDelete = document.getElementById('btn-portada-form-delete');

    if (listSec) listSec.style.display = 'none';
    if (formSec) formSec.style.display = 'block';
    if (btnDelete) btnDelete.style.display = 'none';

    const portadas = window.AdminState.allPortadas || [];
    const nextIdx = portadas.length + 1;

    if (titleEl) titleEl.textContent = `Agregar Nueva Portada (Portada ${nextIdx})`;

    const idInput = document.getElementById('portada-form-id');
    const titleInput = document.getElementById('portada-form-title');
    const imgDesktop = document.getElementById('portada-form-image');
    const imgMobile = document.getElementById('portada-form-image-mobile');
    const activeCheck = document.getElementById('portada-form-active');
    const activeLabel = document.getElementById('portada-active-label');

    const defaultDesktop = `/imagenes/portada/Portada${nextIdx}E.webp`;
    const defaultMobile = `/imagenes/portada/Portada${nextIdx}M.webp`;

    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = `Portada ${nextIdx}`;
    if (imgDesktop) imgDesktop.value = defaultDesktop;
    if (imgMobile) imgMobile.value = defaultMobile;
    if (activeCheck) activeCheck.checked = true;
    if (activeLabel) {
      activeLabel.textContent = '🟢 Visible en la tienda';
      activeLabel.style.color = '#6ee7b7';
    }

    const previewDesktop = document.getElementById('preview-img-desktop');
    const previewMobile = document.getElementById('preview-img-mobile');
    if (previewDesktop) previewDesktop.src = defaultDesktop;
    if (previewMobile) previewMobile.src = defaultMobile;

    window.setPortadaDeviceTarget('both');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.openEditPortadaPage = function (id) {
    const portadas = window.AdminState.allPortadas || [];
    const item = portadas.find(p => p.id === id);
    if (!item) return;

    currentEditingId = id;
    pendingDesktopBase64 = null;
    pendingMobileBase64 = null;

    const listSec = document.getElementById('portada-list-section');
    const formSec = document.getElementById('portada-form-page-section');
    const titleEl = document.getElementById('portada-form-page-title');
    const btnDelete = document.getElementById('btn-portada-form-delete');

    if (listSec) listSec.style.display = 'none';
    if (formSec) formSec.style.display = 'block';
    if (btnDelete) btnDelete.style.display = 'inline-flex';

    const slideNum = item.order || (portadas.findIndex(p => p.id === id) + 1);

    if (titleEl) titleEl.textContent = `Editar: ${item.title || `Portada ${slideNum}`}`;

    const idInput = document.getElementById('portada-form-id');
    const titleInput = document.getElementById('portada-form-title');
    const imgDesktop = document.getElementById('portada-form-image');
    const imgMobile = document.getElementById('portada-form-image-mobile');
    const activeCheck = document.getElementById('portada-form-active');
    const activeLabel = document.getElementById('portada-active-label');

    const expectedDesktop = `/imagenes/portada/Portada${slideNum}E.webp`;
    const expectedMobile = `/imagenes/portada/Portada${slideNum}M.webp`;

    const versionParam = `?v=${item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now()}`;

    const currentDesktopUrl = (item.image && !item.image.startsWith('data:image')) ? item.image.split('?')[0] : expectedDesktop;
    const currentMobileUrl = (item.imageMobile && !item.imageMobile.startsWith('data:image')) ? item.imageMobile.split('?')[0] : expectedMobile;

    if (idInput) idInput.value = item.id;
    if (titleInput) titleInput.value = item.title || `Portada ${slideNum}`;
    if (imgDesktop) imgDesktop.value = currentDesktopUrl;
    if (imgMobile) imgMobile.value = currentMobileUrl;
    if (activeCheck) activeCheck.checked = item.active !== false;
    if (activeLabel) {
      activeLabel.textContent = item.active !== false ? '🟢 Visible en la tienda' : '⏸️ Pausada (Oculta)';
      activeLabel.style.color = item.active !== false ? '#6ee7b7' : '#fde047';
    }

    const previewDesktop = document.getElementById('preview-img-desktop');
    const previewMobile = document.getElementById('preview-img-mobile');
    if (previewDesktop) previewDesktop.src = `${currentDesktopUrl}${versionParam}`;
    if (previewMobile) previewMobile.src = `${currentMobileUrl}${versionParam}`;

    window.setPortadaDeviceTarget('both');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.closePortadaPages = function () {
    currentEditingId = null;
    pendingDesktopBase64 = null;
    pendingMobileBase64 = null;

    const listSec = document.getElementById('portada-list-section');
    const formSec = document.getElementById('portada-form-page-section');

    if (formSec) formSec.style.display = 'none';
    if (listSec) listSec.style.display = 'block';

    renderPortadas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CONTROL DE BOTONES INDEPENDIENTES
  window.setPortadaDeviceTarget = function (target) {
    activeDeviceTarget = target;

    const btnBoth = document.getElementById('btn-device-target-both');
    const btnDesktop = document.getElementById('btn-device-target-desktop');
    const btnMobile = document.getElementById('btn-device-target-mobile');

    const cardDesktop = document.getElementById('portada-card-desktop-box');
    const cardMobile = document.getElementById('portada-card-mobile-box');

    [btnBoth, btnDesktop, btnMobile].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    if (target === 'desktop') {
      if (btnDesktop) btnDesktop.classList.add('active');
      if (cardDesktop) cardDesktop.style.display = 'flex';
      if (cardMobile) cardMobile.style.display = 'none';
    } else if (target === 'mobile') {
      if (btnMobile) btnMobile.classList.add('active');
      if (cardDesktop) cardDesktop.style.display = 'none';
      if (cardMobile) cardMobile.style.display = 'flex';
    } else {
      if (btnBoth) btnBoth.classList.add('active');
      if (cardDesktop) cardDesktop.style.display = 'flex';
      if (cardMobile) cardMobile.style.display = 'flex';
    }
  };

  // SUBIDA Y GUARDADO DIRECTO DE ARCHIVOS A /imagenes/portada/Portada{N}{E|M}.webp
  window.handleDesktopImageFileSelect = function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.AdminUtils.showToast('Por favor selecciona un archivo de imagen válido.', 'error');
      return;
    }

    const slideNum = getCurrentSlideNumber();
    const targetUrl = `/imagenes/portada/Portada${slideNum}E.webp`;

    const reader = new FileReader();
    reader.onload = async function (evt) {
      const base64 = evt.target.result;
      pendingDesktopBase64 = base64;
      
      // Actualizar vista previa visual instantánea
      const previewDesktop = document.getElementById('preview-img-desktop');
      if (previewDesktop) previewDesktop.src = base64;

      // Asignar ruta limpia al campo de texto
      const input = document.getElementById('portada-form-image');
      if (input) input.value = targetUrl;

      // Enviar al servidor para guardar en disco como Portada{N}E.webp
      try {
        const res = await fetch('/api/portadas/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slideNumber: slideNum,
            type: 'E',
            file: base64
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.url && input) input.value = json.url;
        }
      } catch (err) {
        console.warn('Upload guardado en sesión:', err);
      }

      window.AdminUtils.showToast(`✅ Imagen de escritorio cargada: ${targetUrl}`, 'success');
    };
    reader.readAsDataURL(file);
  };

  window.handleMobileImageFileSelect = function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.AdminUtils.showToast('Por favor selecciona un archivo de imagen válido.', 'error');
      return;
    }

    const slideNum = getCurrentSlideNumber();
    const targetUrl = `/imagenes/portada/Portada${slideNum}M.webp`;

    const reader = new FileReader();
    reader.onload = async function (evt) {
      const base64 = evt.target.result;
      pendingMobileBase64 = base64;
      
      // Actualizar vista previa visual instantánea
      const previewMobile = document.getElementById('preview-img-mobile');
      if (previewMobile) previewMobile.src = base64;

      // Asignar ruta limpia al campo de texto
      const input = document.getElementById('portada-form-image-mobile');
      if (input) input.value = targetUrl;

      // Enviar al servidor para guardar en disco como Portada{N}M.webp
      try {
        const res = await fetch('/api/portadas/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slideNumber: slideNum,
            type: 'M',
            file: base64
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.url && input) input.value = json.url;
        }
      } catch (err) {
        console.warn('Upload guardado en sesión:', err);
      }

      window.AdminUtils.showToast(`✅ Imagen móvil cargada: ${targetUrl}`, 'success');
    };
    reader.readAsDataURL(file);
  };

  function updatePreviews() {
    const imgDesktopInput = document.getElementById('portada-form-image');
    const imgMobileInput = document.getElementById('portada-form-image-mobile');
    const previewDesktop = document.getElementById('preview-img-desktop');
    const previewMobile = document.getElementById('preview-img-mobile');

    if (imgDesktopInput && previewDesktop) {
      const val = (imgDesktopInput.value || '').trim();
      if (val && !val.startsWith('data:image')) {
        previewDesktop.src = `${val.split('?')[0]}?t=${Date.now()}`;
      } else if (val) {
        previewDesktop.src = val;
      }
    }
    if (imgMobileInput && previewMobile) {
      const val = (imgMobileInput.value || '').trim();
      if (val && !val.startsWith('data:image')) {
        previewMobile.src = `${val.split('?')[0]}?t=${Date.now()}`;
      } else if (val) {
        previewMobile.src = val;
      }
    }
  }

  // ACTIVAR / PAUSAR DIRECTO CON 1 CLIC
  window.togglePortadaStatus = async function (id) {
    const portadas = window.AdminState.allPortadas || [];
    const item = portadas.find(p => p.id === id);
    if (!item) return;

    item.active = item.active === false ? true : false;
    item.updatedAt = new Date().toISOString();

    try {
      const res = await fetch(`/api/portadas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        window.AdminUtils.showToast(
          item.active ? `🟢 "${item.title}" ahora está visible en la tienda` : `⏸️ "${item.title}" ha sido pausada`,
          item.active ? 'success' : 'info'
        );
      }
    } catch (e) {
      console.warn('Guardado local:', e);
    }
    renderPortadas();
  };

  // ELIMINAR PORTADA (Sin bloqueo de window.confirm)
  window.deletePortadaSlide = async function (id, fromForm = false) {
    const portadas = window.AdminState.allPortadas || [];
    const item = portadas.find(p => p.id === id);
    if (!item) return;

    const itemName = item.title || 'Portada';

    try {
      const res = await fetch(`/api/portadas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        window.AdminState.allPortadas = portadas.filter(p => p.id !== id);
        window.AdminState.allPortadas.forEach((p, idx) => {
          p.order = idx + 1;
        });
        window.AdminUtils.showToast(`🗑️ "${itemName}" eliminada del sistema`, 'success');
      }
    } catch (e) {
      window.AdminState.allPortadas = portadas.filter(p => p.id !== id);
      window.AdminState.allPortadas.forEach((p, idx) => {
        p.order = idx + 1;
      });
      window.AdminUtils.showToast(`🗑️ "${itemName}" eliminada`, 'info');
    }

    if (fromForm) {
      window.closePortadaPages();
    } else {
      renderPortadas();
    }
  };

  // ELIMINAR PORTADA DESDE EL FORMULARIO DE EDICIÓN
  window.deleteCurrentEditingPortada = async function () {
    if (!currentEditingId) {
      window.closePortadaPages();
      return;
    }
    await window.deletePortadaSlide(currentEditingId, true);
  };

  // GUARDAR FORMULARIO
  window.handlePortadaFormSubmit = async function (e) {
    if (e && e.preventDefault) e.preventDefault();

    const idInput = document.getElementById('portada-form-id');
    const titleInput = document.getElementById('portada-form-title');
    const imgDesktopInput = document.getElementById('portada-form-image');
    const imgMobileInput = document.getElementById('portada-form-image-mobile');
    const activeCheck = document.getElementById('portada-form-active');

    const portadas = window.AdminState.allPortadas || [];
    const id = (idInput && idInput.value) ? idInput.value : `portada-${Date.now()}`;
    const existingIndex = portadas.findIndex(p => p.id === id);

    const slideNum = existingIndex >= 0 ? (portadas[existingIndex].order || existingIndex + 1) : portadas.length + 1;
    const defaultDesktop = `/imagenes/portada/Portada${slideNum}E.webp`;
    const defaultMobile = `/imagenes/portada/Portada${slideNum}M.webp`;

    const title = (titleInput && titleInput.value) ? titleInput.value.trim() : `Portada ${slideNum}`;
    
    // Si hay un archivo cargado pendiente en base64, usarlo para que el servidor lo procese
    const desktopImg = pendingDesktopBase64 || ((imgDesktopInput && imgDesktopInput.value) ? imgDesktopInput.value.trim() : defaultDesktop);
    const mobileImg = pendingMobileBase64 || ((imgMobileInput && imgMobileInput.value) ? imgMobileInput.value.trim() : defaultMobile);
    const isActive = activeCheck ? activeCheck.checked : true;

    const payload = {
      id: id,
      title: title,
      image: desktopImg,
      imageMobile: mobileImg,
      active: isActive,
      order: slideNum,
      updatedAt: new Date().toISOString()
    };

    try {
      if (existingIndex >= 0) {
        // Actualizar
        const res = await fetch(`/api/portadas/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) portadas[existingIndex] = json.data;
          else portadas[existingIndex] = payload;
        } else {
          portadas[existingIndex] = payload;
        }
        window.AdminUtils.showToast('✅ Portada actualizada correctamente', 'success');
      } else {
        // Crear
        const res = await fetch('/api/portadas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) portadas.push(json.data);
          else portadas.push(payload);
        } else {
          portadas.push(payload);
        }
        window.AdminUtils.showToast('🎉 Nueva portada agregada con éxito', 'success');
      }
    } catch (err) {
      console.warn('Error al guardar en backend:', err);
      if (existingIndex >= 0) portadas[existingIndex] = payload;
      else portadas.push(payload);
    }

    pendingDesktopBase64 = null;
    pendingMobileBase64 = null;
    window.AdminState.allPortadas = portadas;

    // Recargar del servidor y refrescar visualmente
    await loadPortadas();
    window.closePortadaPages();
  };

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  }
})();
