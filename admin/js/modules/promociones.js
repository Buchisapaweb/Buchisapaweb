/**
 * BUCHISAPA ADMIN - MÓDULO DE PROMOCIONES Y OFERTAS
 * Archivo: /admin/js/modules/promociones.js
 * Gestión de combos, precios de oferta, estados y sincronización en tiempo real
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initPromocionesModule();
  });

  function initPromocionesModule() {
    const form = document.getElementById('promotion-form');
    if (form) {
      form.addEventListener('submit', handlePromotionFormSubmit);
    }

    const priceInput = document.getElementById('promotion-form-price');
    const origPriceInput = document.getElementById('promotion-form-original-price');
    if (priceInput) priceInput.addEventListener('input', updatePromotionFormPreview);
    if (origPriceInput) origPriceInput.addEventListener('input', updatePromotionFormPreview);

    // Exponer métodos globales
    window.fetchPromociones = fetchPromociones;
    window.renderPromociones = renderPromociones;
    window.openCreatePromotionModal = openCreatePromotionModal;
    window.editPromotion = editPromotion;
    window.deletePromotion = deletePromotion;
    window.duplicatePromotion = duplicatePromotion;
    window.togglePromotionStatus = togglePromotionStatus;
    window.filterPromotions = filterPromotions;
    window.quickAddPromotionPreset = quickAddPromotionPreset;
    window.selectPromotionPreset = selectPromotionPreset;
    window.updatePromotionFormPreview = updatePromotionFormPreview;
  }

  async function fetchPromociones() {
    try {
      const res = await window.AdminApi.getPromotions(true);
      if (res && res.success && Array.isArray(res.data)) {
        window.AdminState.allPromociones = res.data;
      } else if (Array.isArray(res)) {
        window.AdminState.allPromociones = res;
      }
    } catch (err) {
      console.warn('Usando datos de promociones en caché o respaldo:', err);
      if (!window.AdminState.allPromociones || window.AdminState.allPromociones.length === 0) {
        window.AdminState.allPromociones = [
          {
            id: 'promo-1',
            title: 'Combo Familiar Amazónico',
            description: '1 Juane Tradicional + 1 Tacacho con Cecina + 1/4 Pollo Broaster + 2 Refrescos de Cocona helados',
            price: 45.00,
            originalPrice: 58.00,
            image: '/imagenes/portada/Portada2E.webp',
            badge: '🔥 MÁS PEDIDO',
            active: true,
            features: ['✦ 1 Juane Tradicional', '🌴 Tacacho con Cecina', '🍗 1/4 Broaster', '🍹 2 Refrescos']
          }
        ];
      }
    }

    renderPromociones();
    updatePromocionesMetrics();
  }

  function updatePromocionesMetrics() {
    const list = window.AdminState.allPromociones || [];
    const totalEl = document.getElementById('promo-metric-total');
    const activeEl = document.getElementById('promo-metric-active');
    const savingsEl = document.getElementById('promo-metric-savings');
    const sidebarBadge = document.getElementById('sidebar-promociones-badge');

    const total = list.length;
    const active = list.filter(p => p.active !== false).length;

    let totalSavings = 0;
    let countSavings = 0;
    list.forEach(p => {
      const orig = Number(p.originalPrice) || Number(p.price) || 0;
      const curr = Number(p.price) || 0;
      if (orig > curr) {
        totalSavings += (orig - curr);
        countSavings++;
      }
    });
    const avgSavings = countSavings > 0 ? (totalSavings / countSavings).toFixed(2) : '10.00';

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (savingsEl) savingsEl.textContent = `S/ ${avgSavings}`;
    if (sidebarBadge) sidebarBadge.textContent = active;
  }

  function filterPromotions(filterKey) {
    window.AdminState.currentPromocionesFilter = filterKey;
    document.querySelectorAll('.promo-filter-btn').forEach(btn => {
      if (btn.dataset.filter === filterKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    renderPromociones();
  }

  function renderPromociones() {
    const container = document.getElementById('promociones-grid-container');
    if (!container) return;

    let list = window.AdminState.allPromociones || [];
    const currentFilter = window.AdminState.currentPromocionesFilter || 'all';

    if (currentFilter === 'active') {
      list = list.filter(p => p.active !== false);
    } else if (currentFilter === 'inactive') {
      list = list.filter(p => p.active === false);
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 45px 20px; text-align: center; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-card);">
          <div style="font-size: 38px; margin-bottom: 10px;">🏷️</div>
          <h4 style="color: #fff; font-size: 1.1rem; margin-bottom: 6px;">No hay promociones en esta vista</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">Haz clic en el botón de abajo para registrar una nueva promoción o utiliza una de las plantillas rápidas.</p>
          <button class="btn btn-primary btn-sm" onclick="window.openCreatePromotionModal()">+ Crear Primera Promoción</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((p, index) => {
      const price = Number(p.price || 0).toFixed(2);
      const origPrice = Number(p.originalPrice || 0).toFixed(2);
      const hasDiscount = Number(p.originalPrice) > Number(p.price);
      const savings = hasDiscount ? (Number(p.originalPrice) - Number(p.price)).toFixed(2) : 0;
      const discountPct = hasDiscount ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100) : 0;
      const isActive = p.active !== false;

      const featuresHtml = (p.features && Array.isArray(p.features) && p.features.length > 0)
        ? `<div style="display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0 12px;">
            ${p.features.slice(0, 3).map(f => `<span style="font-size: 0.7rem; background: rgba(255,255,255,0.06); color: #cbd5e1; padding: 2px 7px; border-radius: 4px;">${escapeHtml(f)}</span>`).join('')}
           </div>`
        : '';

      return `
        <div class="portada-card ${!isActive ? 'is-inactive' : ''}" style="position: relative; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid ${isActive ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.3)'}; overflow: hidden; display: flex; flex-direction: column;">
          
          <!-- Imagen de la Promoción -->
          <div style="position: relative; width: 100%; height: 160px; background: #000; overflow: hidden;">
            <img src="${escapeHtml(p.image || '/imagenes/portada/Portada1E.webp')}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 100%; object-fit: cover; opacity: ${isActive ? '1' : '0.4'}; transition: transform 0.3s ease;">
            
            <!-- Badge Superior -->
            <div style="position: absolute; top: 10px; left: 10px; background: rgba(220, 38, 38, 0.92); color: #fff; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              ${escapeHtml(p.badge || '🔥 OFERTA')}
            </div>

            <!-- Descuento Pill -->
            ${hasDiscount ? `
              <div style="position: absolute; top: 10px; right: 10px; background: #16a34a; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                -${discountPct}%
              </div>
            ` : ''}

            <!-- Estado Activo / Pausado -->
            <div style="position: absolute; bottom: 8px; right: 8px; background: ${isActive ? 'rgba(22, 163, 74, 0.85)' : 'rgba(100, 116, 139, 0.85)'}; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; backdrop-filter: blur(4px);">
              ${isActive ? '🟢 Activa en Web' : '⏸️ Pausada'}
            </div>
          </div>

          <!-- Contenido y Textos -->
          <div style="padding: 14px 16px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
              <h4 style="color: #fff; font-size: 0.98rem; font-weight: 800; margin: 0; line-height: 1.25;">
                ${escapeHtml(p.title)}
              </h4>
            </div>

            <p style="color: var(--text-muted); font-size: 0.78rem; margin: 4px 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;">
              ${escapeHtml(p.description || '')}
            </p>

            ${featuresHtml}

            <!-- Precios y Ahorro -->
            <div style="display: flex; align-items: baseline; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle); margin-top: auto;">
              <span style="font-size: 1.15rem; font-weight: 900; color: #ef4444;">
                S/ ${price}
              </span>
              ${hasDiscount ? `
                <span style="font-size: 0.82rem; color: #94a3b8; text-decoration: line-through;">
                  S/ ${origPrice}
                </span>
                <span style="font-size: 0.72rem; color: #22c55e; font-weight: 700; margin-left: auto;">
                  Ahorro S/ ${savings}
                </span>
              ` : ''}
            </div>

            <!-- Botones de Acción -->
            <div style="display: flex; gap: 6px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-subtle); flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" style="flex: 1; padding: 6px 8px; font-size: 0.75rem;" onclick="window.editPromotion('${p.id}')">
                ✏️ Editar
              </button>
              <button class="btn btn-secondary btn-sm" style="padding: 6px 8px; font-size: 0.75rem;" onclick="window.duplicatePromotion('${p.id}')" title="Duplicar esta promo">
                📋
              </button>
              <button class="btn ${isActive ? 'btn-secondary' : 'btn-primary'} btn-sm" style="padding: 6px 8px; font-size: 0.75rem;" onclick="window.togglePromotionStatus('${p.id}')" title="${isActive ? 'Pausar promoción' : 'Activar promoción'}">
                ${isActive ? '⏸️ Pausar' : '▶️ Activar'}
              </button>
              <button class="btn btn-secondary btn-sm" style="padding: 6px 8px; font-size: 0.75rem; color: #f87171;" onclick="window.deletePromotion('${p.id}')" title="Eliminar">
                🗑️
              </button>
            </div>

          </div>
        </div>
      `;
    }).join('');
  }

  function openCreatePromotionModal() {
    const modal = document.getElementById('promotion-modal');
    const titleEl = document.getElementById('promotion-modal-title');
    const form = document.getElementById('promotion-form');
    if (!modal || !form) return;

    if (titleEl) titleEl.textContent = 'Nueva Promoción Comercial';
    form.reset();
    document.getElementById('promotion-form-id').value = '';
    document.getElementById('promotion-form-image').value = '/imagenes/portada/Portada1E.webp';
    document.getElementById('promotion-form-badge').value = '🔥 OFERTA ESPECIAL';
    document.getElementById('promotion-form-price').value = '35.00';
    document.getElementById('promotion-form-original-price').value = '45.00';
    document.getElementById('promotion-form-active').checked = true;

    updatePromotionFormPreview();
    modal.classList.add('active');
  }

  function editPromotion(id) {
    const p = (window.AdminState.allPromociones || []).find(item => item.id === id);
    if (!p) return;

    const modal = document.getElementById('promotion-modal');
    const titleEl = document.getElementById('promotion-modal-title');
    if (!modal) return;

    if (titleEl) titleEl.textContent = 'Editar Promoción';
    document.getElementById('promotion-form-id').value = p.id;
    document.getElementById('promotion-form-title').value = p.title || '';
    document.getElementById('promotion-form-description').value = p.description || '';
    document.getElementById('promotion-form-image').value = p.image || '';
    document.getElementById('promotion-form-price').value = p.price || '';
    document.getElementById('promotion-form-original-price').value = p.originalPrice || p.price || '';
    document.getElementById('promotion-form-badge').value = p.badge || '🔥 OFERTA';
    document.getElementById('promotion-form-features').value = (p.features && Array.isArray(p.features)) ? p.features.join('\n') : '';
    document.getElementById('promotion-form-active').checked = p.active !== false;

    updatePromotionFormPreview();
    modal.classList.add('active');
  }

  function selectPromotionPreset(url) {
    const input = document.getElementById('promotion-form-image');
    if (input) {
      input.value = url;
      updatePromotionFormPreview();
    }
  }

  function updatePromotionFormPreview() {
    const imgEl = document.getElementById('promotion-form-preview-img');
    const titleEl = document.getElementById('promotion-form-preview-title');
    const priceEl = document.getElementById('promotion-form-preview-price');
    const inputUrl = document.getElementById('promotion-form-image')?.value || '/imagenes/portada/Portada1E.webp';
    const title = document.getElementById('promotion-form-title')?.value || 'COMBO BUCHISAPA';
    const price = document.getElementById('promotion-form-price')?.value || '35.00';
    const origPrice = document.getElementById('promotion-form-original-price')?.value || '45.00';

    if (imgEl) imgEl.src = inputUrl;
    if (titleEl) titleEl.textContent = title;
    if (priceEl) {
      priceEl.innerHTML = `S/ ${parseFloat(price || 0).toFixed(2)} <span style="text-decoration: line-through; color: #94a3b8; font-size: 0.8rem; margin-left: 6px;">S/ ${parseFloat(origPrice || 0).toFixed(2)}</span>`;
    }
  }

  async function handlePromotionFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('promotion-form-id').value;
    const isEdit = Boolean(id);

    const rawFeatures = document.getElementById('promotion-form-features').value || '';
    const features = rawFeatures.split('\n').map(s => s.trim()).filter(Boolean);

    const data = {
      title: document.getElementById('promotion-form-title').value.trim(),
      description: document.getElementById('promotion-form-description').value.trim(),
      image: document.getElementById('promotion-form-image').value.trim() || '/imagenes/portada/Portada1E.webp',
      price: parseFloat(document.getElementById('promotion-form-price').value) || 0,
      originalPrice: parseFloat(document.getElementById('promotion-form-original-price').value) || parseFloat(document.getElementById('promotion-form-price').value) || 0,
      badge: document.getElementById('promotion-form-badge').value.trim() || '🔥 OFERTA',
      features: features.length > 0 ? features : ['✦ COMBO EXCLUSIVO', '🔥 PREPARADO AL MOMENTO'],
      active: document.getElementById('promotion-form-active').checked
    };

    try {
      await window.AdminApi.savePromotion(data, isEdit, id);
      window.showToast(`Promoción ${isEdit ? 'actualizada' : 'creada'} con éxito`, 'success');
      
      const modal = document.getElementById('promotion-modal');
      if (modal) modal.classList.remove('active');

      await fetchPromociones();
    } catch (err) {
      console.error('Error al guardar promoción:', err);
      // Fallback local
      if (isEdit) {
        const idx = (window.AdminState.allPromociones || []).findIndex(p => p.id === id);
        if (idx !== -1) window.AdminState.allPromociones[idx] = { ...window.AdminState.allPromociones[idx], ...data };
      } else {
        window.AdminState.allPromociones.push({ id: 'promo-' + Date.now(), ...data });
      }
      renderPromociones();
      updatePromocionesMetrics();
      window.showToast('Promoción guardada en sesión local', 'info');
      
      const modal = document.getElementById('promotion-modal');
      if (modal) modal.classList.remove('active');
    }
  }

  async function togglePromotionStatus(id) {
    const p = (window.AdminState.allPromociones || []).find(item => item.id === id);
    if (!p) return;

    const newActive = !(p.active !== false);
    try {
      await window.AdminApi.savePromotion({ ...p, active: newActive }, true, id);
      window.showToast(`Promoción ${newActive ? 'activada' : 'pausada'}`, 'success');
      await fetchPromociones();
    } catch (e) {
      p.active = newActive;
      renderPromociones();
      updatePromocionesMetrics();
      window.showToast(`Promoción ${newActive ? 'activada' : 'pausada'} localmente`, 'info');
    }
  }

  async function duplicatePromotion(id) {
    const p = (window.AdminState.allPromociones || []).find(item => item.id === id);
    if (!p) return;

    const copy = { ...p, id: 'promo-' + Date.now(), title: `${p.title} (Copia)`, active: true };
    try {
      await window.AdminApi.savePromotion(copy);
      window.showToast('Promoción duplicada con éxito', 'success');
      await fetchPromociones();
    } catch (e) {
      window.AdminState.allPromociones.push(copy);
      renderPromociones();
      updatePromocionesMetrics();
      window.showToast('Promoción duplicada localmente', 'info');
    }
  }

  async function deletePromotion(id) {
    if (!confirm('¿Deseas eliminar esta promoción definitivamente?')) return;
    try {
      await window.AdminApi.deletePromotion(id);
      window.showToast('Promoción eliminada', 'success');
      await fetchPromociones();
    } catch (e) {
      window.AdminState.allPromociones = (window.AdminState.allPromociones || []).filter(p => p.id !== id);
      renderPromociones();
      updatePromocionesMetrics();
      window.showToast('Promoción eliminada localmente', 'info');
    }
  }

  async function quickAddPromotionPreset(presetKey) {
    const presets = {
      familiar: {
        title: 'Combo Familiar Broaster Fiesta',
        description: '1 Pollo Broaster Entero (4 presas) + Papas Nativas Familiares + Ensalada Fresca + Gaseosa 1.5L',
        price: 49.00,
        originalPrice: 62.00,
        image: '/imagenes/portada/Portada1E.webp',
        badge: '🍗 FAMILIAR',
        features: ['✦ 4 Presas Broaster crocantes', '🍟 Fuente de Papas Nativas', '🥗 Ensalada del día', '🥤 Gaseosa 1.5L']
      },
      duo: {
        title: 'Dúo Broaster Crunch & Salsas',
        description: '2 Porciones de 1/4 Broaster + Doble porción de papas + 4 cremas caseras + 2 Refrescos de Cocona',
        price: 33.00,
        originalPrice: 42.00,
        image: '/imagenes/portada/Portada1E.webp',
        badge: '✨ OFERTA DÚO',
        features: ['🍗 2 Cuartos de Pollo Broaster', '🍟 Papas crocantes', '🤍 Cremas artesanales', '🍹 2 Refrescos de Cocona']
      },
      burger: {
        title: 'Mega Burger Fest BuchiSapa',
        description: '2 Hamburguesas Royals (queso, huevo, plátano) + Porción grande de papas + 2 Bebidas heladas',
        price: 36.00,
        originalPrice: 46.00,
        image: '/imagenes/portada/Portada3E.webp',
        badge: '🍔 BURGER FEST',
        features: ['🍔 2 Burgers Royals artesanales', '🍟 Papas fritas doradas', '🥤 2 Bebidas heladas', '🤍 Cremas caseras']
      },
      amazonica: {
        title: 'Banquete Amazónico del Oriente',
        description: '1 Juane Tradicional + 1 Tacacho con Cecina + Porción de Patacones + Salsa Charapita + 2 Aguajinas',
        price: 44.00,
        originalPrice: 56.00,
        image: '/imagenes/portada/Portada2E.webp',
        badge: '🌴 100% REGIONAL',
        features: ['✦ Juane en hoja de bijao', '🌴 Tacacho con cecina ahumada', '🍌 Patacones crujientes', '🍹 2 Aguajinas heladas']
      },
      alitas: {
        title: 'Alitas Party Pack (12 u)',
        description: '12 Alitas Broaster bañadas en Salsa BBQ o Salsa de Cocona + Papas familiares + Mayonesa de la casa',
        price: 38.00,
        originalPrice: 48.00,
        image: '/imagenes/portada/Portada4E.webp',
        badge: '🔥 PARTY PACK',
        features: ['🍗 12 Alitas crocantes', '🔥 Salsa BBQ & Cocona', '🍟 Papas familiares', '🤍 Cremas caseras']
      },
      salchipapa: {
        title: 'Super Salchibroaster Salvaje',
        description: 'Fuente gigante con papas nativas, salchichas ahumadas, chorizo de la selva y trozos de pollo broaster',
        price: 30.00,
        originalPrice: 38.00,
        image: '/imagenes/portada/Portada1E.webp',
        badge: '🍟 SUPER FUENTE',
        features: ['🍟 Papas nativas doradas', '🌭 Salchicha y chorizo selvático', '🍗 Trozos de broaster', '🤍 Todas las cremas']
      }
    };

    const data = presets[presetKey];
    if (!data) return;

    try {
      await window.AdminApi.savePromotion({ ...data, active: true });
      window.showToast(`Plantilla "${data.title}" agregada`, 'success');
      await fetchPromociones();
    } catch (e) {
      window.AdminState.allPromociones.push({ id: 'promo-' + Date.now(), ...data, active: true });
      renderPromociones();
      updatePromocionesMetrics();
      window.showToast('Plantilla agregada localmente', 'info');
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

})();
