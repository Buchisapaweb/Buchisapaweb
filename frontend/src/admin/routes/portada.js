/**
 * BUCHISAPA BURGER & BROASTER - PANEL DE ADMINISTRACIÓN
 * Módulo de Gestión de Portadas (IDs PT0001, PT0002, etc.)
 * Proporciones oficiales:
 * - Escritorio: 1920x1080 (16:9)
 * - Móvil: 1080x1350 (4:5)
 */
(function () {
  'use strict';

  // Manejar error de carga de previsualización (seguro y accesible inmediatamente)
  window.handlePreviewError = function (type) {
    const imgEl = document.getElementById(type === 'desktop' ? 'img-preview-desktop' : 'img-preview-mobile');
    const placeholderEl = document.getElementById(type === 'desktop' ? 'placeholder-desktop' : 'placeholder-mobile');
    if (imgEl) {
      imgEl.classList.add('is-hidden');
    }
    if (placeholderEl) {
      placeholderEl.classList.remove('is-hidden');
    }
  };

  let currentPortadas = [];
  let currentViewMode = 'mobile'; // 'mobile' (4:5) | 'desktop' (16:9)
  let isEditing = false;

  // Cargar portadas al iniciar
  async function loadPortadas() {
    const grid = document.getElementById('admin-portadas-grid');
    const badge = document.getElementById('portadas-count-badge');
    if (!grid) return;

    try {
      const res = await fetch('/api/portadas?all=true');
      const data = await res.json();

      if (data && data.success && Array.isArray(data.data)) {
        currentPortadas = data.data;
      } else {
        currentPortadas = [];
      }

      renderPortadasList();
      if (badge) {
        const activeCount = currentPortadas.filter(p => p.active !== false).length;
        badge.textContent = `${activeCount} activas de ${currentPortadas.length}`;
      }
    } catch (err) {
      console.error('Error al cargar portadas:', err);
      if (grid) {
        grid.innerHTML = `
          <div class="empty-state-box">
            <p>⚠️ No se pudieron cargar las portadas. Intenta nuevamente.</p>
            <button class="btn btn-sm btn-outline-upload" onclick="window.loadPortadas()">Reintentar</button>
          </div>
        `;
      }
    }
  }

  // Renderizar tarjetas de portadas creadas
  function renderPortadasList() {
    const grid = document.getElementById('admin-portadas-grid');
    if (!grid) return;

    if (!currentPortadas || currentPortadas.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-box">
          <p>No hay portadas creadas aún.</p>
          <button class="btn btn-primary btn-sm" onclick="window.openCreatePortadaForm()">Crear Portada</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = currentPortadas.map((item) => {
      const isMobile = currentViewMode === 'mobile';
      const imgSrc = isMobile ? (item.imageMobile || item.image) : (item.image || item.imageMobile);
      const viewLabel = isMobile ? 'Móvil (4:5)' : 'Escritorio (16:9)';
      const isActive = item.active !== false;

      return `
        <div class="portada-card ${isActive ? 'active-card' : 'inactive-card'}" id="portada-card-${item.id}">
          <div class="portada-card-header">
            <div class="portada-card-badges">
              <span class="badge-portada-id">${escapeHtml(item.id)}</span>
            </div>
            <span class="badge-portada-status ${isActive ? 'status-active' : 'status-inactive'}">
              ${isActive ? '● ACTIVO EN CARRUSEL' : '○ PAUSADO'}
            </span>
          </div>

          <div class="portada-card-preview-wrap ${isMobile ? 'preview-mode-mobile' : 'preview-mode-desktop'}">
            <div class="portada-img-container">
              <img src="${escapeHtml(imgSrc)}" alt="Portada ${escapeHtml(item.id)}" loading="lazy" onerror="this.src='/imagenes/portada/Portada1E.webp'">
            </div>
            <div class="preview-mode-tag">${viewLabel}</div>
          </div>

          <div class="portada-card-actions">
            <button class="btn btn-sm btn-action-edit" type="button" onclick="window.editPortada('${escapeHtml(item.id)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              <span>Editar portada</span>
            </button>
            <button class="btn btn-sm btn-action-toggle ${isActive ? 'btn-pause' : 'btn-activate'}" type="button" onclick="window.togglePortadaStatus('${escapeHtml(item.id)}', ${!isActive})">
              ${isActive ? 'Pausar' : 'Activar'}
            </button>
            <button class="btn btn-sm btn-action-delete" type="button" onclick="window.deletePortadaAction('${escapeHtml(item.id)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>Eliminar portada</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Cambiar modo de previsualización (Móvil vs Escritorio)
  function setPortadasViewMode(mode) {
    currentViewMode = mode;
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `btn-view-mode-${mode}`);
    });
    renderPortadasList();
  }

  // Abrir formulario para Crear Nueva Portada (Oculta la lista de portadas creadas)
  function openCreatePortadaForm() {
    isEditing = false;
    const formCard = document.getElementById('portada-editor-card');
    const listSection = document.getElementById('portadas-list-section');
    const formHeading = document.getElementById('portada-form-title-heading');
    const badgeId = document.getElementById('portada-form-id-badge');
    const inputId = document.getElementById('portada-input-id');
    const inputActive = document.getElementById('portada-input-active');
    const inputImgDesk = document.getElementById('portada-input-image-desktop');
    const inputImgMob = document.getElementById('portada-input-image-mobile');
    const modeInput = document.getElementById('portada-form-mode');
    const submitBtnText = document.getElementById('btn-submit-portada-text');

    const existingNums = currentPortadas
      .map(p => {
        const match = (p.id || '').match(/^PT(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextNum = maxNum + 1;
    const nextId = `PT${String(nextNum).padStart(4, '0')}`;

    if (formHeading) formHeading.textContent = 'Crear Nueva Portada';
    if (badgeId) badgeId.textContent = nextId;
    if (inputId) inputId.value = nextId;
    if (inputActive) inputActive.checked = true;
    if (inputImgDesk) inputImgDesk.value = '';
    if (inputImgMob) inputImgMob.value = '';
    if (modeInput) modeInput.value = 'create';
    if (submitBtnText) submitBtnText.textContent = 'Guardar Portada';

    updatePreviewFromUrl('desktop', '');
    updatePreviewFromUrl('mobile', '');

    if (listSection) listSection.classList.add('is-hidden');
    if (formCard) {
      formCard.classList.remove('is-hidden');
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Abrir formulario para Editar Portada existente
  function editPortada(id) {
    const item = currentPortadas.find(p => p.id === id);
    if (!item) return;

    isEditing = true;
    const formCard = document.getElementById('portada-editor-card');
    const listSection = document.getElementById('portadas-list-section');
    const formHeading = document.getElementById('portada-form-title-heading');
    const badgeId = document.getElementById('portada-form-id-badge');
    const inputId = document.getElementById('portada-input-id');
    const inputActive = document.getElementById('portada-input-active');
    const inputImgDesk = document.getElementById('portada-input-image-desktop');
    const inputImgMob = document.getElementById('portada-input-image-mobile');
    const formId = document.getElementById('portada-form-id');
    const modeInput = document.getElementById('portada-form-mode');
    const submitBtnText = document.getElementById('btn-submit-portada-text');

    if (formHeading) formHeading.textContent = `Editar Portada: ${item.id}`;
    if (badgeId) badgeId.textContent = item.id;
    if (inputId) inputId.value = item.id;
    if (formId) formId.value = item.id;
    if (inputActive) inputActive.checked = item.active !== false;
    if (inputImgDesk) inputImgDesk.value = item.image || '';
    if (inputImgMob) inputImgMob.value = item.imageMobile || item.image || '';
    if (modeInput) modeInput.value = 'edit';
    if (submitBtnText) submitBtnText.textContent = 'Guardar Portada';

    updatePreviewFromUrl('desktop', item.image);
    updatePreviewFromUrl('mobile', item.imageMobile || item.image);

    if (listSection) listSection.classList.add('is-hidden');
    if (formCard) {
      formCard.classList.remove('is-hidden');
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Cerrar formulario y restaurar visualización
  function closePortadaForm() {
    const formCard = document.getElementById('portada-editor-card');
    const listSection = document.getElementById('portadas-list-section');
    if (formCard) formCard.classList.add('is-hidden');
    if (listSection) listSection.classList.remove('is-hidden');
  }

  // Actualizar imagen previa desde URL o Base64
  function updatePreviewFromUrl(type, url) {
    const imgEl = document.getElementById(type === 'desktop' ? 'img-preview-desktop' : 'img-preview-mobile');
    const placeholderEl = document.getElementById(type === 'desktop' ? 'placeholder-desktop' : 'placeholder-mobile');
    
    const cleanUrl = (url || '').trim();
    if (cleanUrl) {
      if (imgEl) {
        imgEl.src = cleanUrl;
        imgEl.classList.remove('is-hidden');
      }
      if (placeholderEl) placeholderEl.classList.add('is-hidden');
    } else {
      if (imgEl) {
        imgEl.src = '';
        imgEl.classList.add('is-hidden');
      }
      if (placeholderEl) placeholderEl.classList.remove('is-hidden');
    }
  }

  // Procesar archivo seleccionado y convertir a WebP
  function handleImageFileSelect(event, type) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        let webpDataUrl = canvas.toDataURL('image/webp', 0.92);
        if (!webpDataUrl.startsWith('data:image/webp')) {
          webpDataUrl = dataUrl;
        }

        const inputEl = document.getElementById(type === 'desktop' ? 'portada-input-image-desktop' : 'portada-input-image-mobile');
        if (inputEl) inputEl.value = webpDataUrl;
        updatePreviewFromUrl(type, webpDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  // Guardar o Actualizar Portada
  async function handleSavePortada(event) {
    if (event && event.preventDefault) event.preventDefault();

    const mode = document.getElementById('portada-form-mode')?.value || 'create';
    const id = document.getElementById('portada-input-id')?.value?.trim();
    const active = document.getElementById('portada-input-active')?.checked !== false;
    const image = document.getElementById('portada-input-image-desktop')?.value?.trim() || '/imagenes/portada/Portada1E.webp';
    const imageMobile = document.getElementById('portada-input-image-mobile')?.value?.trim() || image || '/imagenes/portada/Portada1M.webp';
    const submitBtn = document.getElementById('btn-submit-portada');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Guardando...</span>';
    }

    try {
      const payload = { id, active, image, imageMobile };
      let res;

      if (mode === 'edit') {
        res = await fetch(`/api/portadas/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/portadas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        window.showAdminToast?.('Portada guardada con éxito', 'success');
        closePortadaForm();
        await loadPortadas();
      } else {
        window.showAdminToast?.(json.error || 'Error al guardar la portada', 'danger');
      }
    } catch (err) {
      console.error('Error al guardar portada:', err);
      window.showAdminToast?.('Error de conexión al guardar portada', 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span id="btn-submit-portada-text">Guardar Portada</span>
        `;
      }
    }
  }

  // Alternar estado activo / pausado
  async function togglePortadaStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/portadas/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus })
      });
      if (res.ok) {
        window.showAdminToast?.(`Portada ${id} ${newStatus ? 'activada' : 'pausada'}`, 'success');
        await loadPortadas();
      }
    } catch (e) {
      console.error('Error al cambiar estado de portada:', e);
      window.showAdminToast?.('Error al cambiar estado', 'danger');
    }
  }

  // Eliminar Portada
  async function deletePortadaAction(id) {
    try {
      const res = await fetch(`/api/portadas/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        window.showAdminToast?.(`Portada ${id} eliminada`, 'success');
        await loadPortadas();
      } else {
        window.showAdminToast?.('No se pudo eliminar la portada', 'danger');
      }
    } catch (e) {
      console.error('Error al eliminar portada:', e);
      window.showAdminToast?.('Error de conexión al eliminar', 'danger');
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Exponer funciones en window
  window.loadPortadas = loadPortadas;
  window.setPortadasViewMode = setPortadasViewMode;
  window.openCreatePortadaForm = openCreatePortadaForm;
  window.editPortada = editPortada;
  window.closePortadaForm = closePortadaForm;
  window.updatePreviewFromUrl = updatePreviewFromUrl;
  window.handlePreviewError = handlePreviewError;
  window.handleImageFileSelect = handleImageFileSelect;
  window.handleSavePortada = handleSavePortada;
  window.togglePortadaStatus = togglePortadaStatus;
  window.deletePortadaAction = deletePortadaAction;

  document.addEventListener('DOMContentLoaded', loadPortadas);
})();
