/**
 * ==========================================================================
 * RESTAURANTE BUCHISAPA - PRODUCT CUSTOMIZER & DETAILS SHEET
 * Modal interactivo para personalización de platos con acompañamientos,
 * cremas de la casa e indicaciones especiales para la cocina.
 * ==========================================================================
 */

(function () {
  // Base de datos de salsas oficiales
  const ALL_SAUCES = [
    { id: 'mayonesa', name: 'Mayonesa', default: true },
    { id: 'mostaza', name: 'Mostaza', default: true },
    { id: 'ketchup', name: 'Ketchup', default: true },
    { id: 'aji-rocoto', name: 'Ají de Rocoto', default: true },
    { id: 'tartara', name: 'Tártara', default: false },
    { id: 'aji-charapita', name: 'Ají Charapita', default: false },
    { id: 'acevichada', name: 'Acevichada', default: false },
    { id: 'salsa-bbq', name: 'Salsa BBQ', default: false },
    { id: 'salsa-golf', name: 'Salsa Golf', default: false },
    { id: 'ocopa', name: 'Ocopa', default: false },
    { id: 'aceituna', name: 'Aceituna', default: false },
    { id: 'vinagreta', name: 'Vinagreta', default: false }
  ];

  // Estado activo del producto en personalización
  let currentProduct = null;
  let currentQty = 1;
  let selectedAccompaniments = [];
  let availableAccompaniments = [];
  let selectedSauces = [];

  const CATEGORY_CODE_TO_SLUG = {
    'c0001': 'promociones',
    'c0002': 'alitas',
    'c0003': 'bebidas',
    'c0004': 'broaster',
    'c0005': 'hamburguesas',
    'c0006': 'infusiones',
    'c0007': 'platos-amazonicos',
    'c0008': 'refrescos',
    'c0009': 'salchipapas',
    'c0010': 'adicional'
  };

  function getProductCategorySlug(product) {
    if (!product) return '';
    const rawId = String(product.category_id || '').toLowerCase().trim();
    if (CATEGORY_CODE_TO_SLUG[rawId]) return CATEGORY_CODE_TO_SLUG[rawId];
    const rawCode = String(product.category_code || '').toLowerCase().trim();
    if (CATEGORY_CODE_TO_SLUG[rawCode]) return CATEGORY_CODE_TO_SLUG[rawCode];
    const cat = String(product.category || product.categoryPill || '').toLowerCase().trim();
    return CATEGORY_CODE_TO_SLUG[cat] || cat;
  }

  /**
   * Obtiene los acompañamientos específicos según la carta oficial Buchisapa
   */
  function getProductAccompaniments(product) {
    if (!product) return [];

    // 0. Prioridad máxima: acompañamientos configurados directamente en el admin / base de datos
    if (Array.isArray(product.accompaniments)) {
      return [...product.accompaniments];
    }

    const name = (product.name || '').toLowerCase().trim();
    const cat = getProductCategorySlug(product);

    // 6. BEBIDAS / 7. REFRESCOS / 8. INFUSIONES (No llevan acompañamiento, son bebidas solas)
    if (
      cat.includes('bebida') ||
      cat.includes('refresco') ||
      cat.includes('infusion') ||
      cat.includes('infusiones') ||
      name.includes('inca kola') ||
      name.includes('coca cola') ||
      name.includes('fanta') ||
      name.includes('pepsi') ||
      name.includes('agua mineral') ||
      name.includes('san mateo') ||
      name.includes('aguajina') ||
      name.includes('maracuyá') ||
      name.includes('maracuya') ||
      name.includes('camu camu') ||
      name.includes('camu') ||
      name.includes('chicha') ||
      (name.includes('cocona') && (cat.includes('refresco') || (!name.includes('salsa') && !name.includes('ensalada') && !name.includes('ají')))) ||
      name.includes('anís') ||
      name.includes('anis') ||
      name.includes('té') ||
      name.includes('te ') ||
      name.includes('café') ||
      name.includes('cafe')
    ) {
      return [];
    }

    // 1. PROMOCIONES (4 oficiales)
    if (name.includes('buchi duo') || name.includes('buchi dúo')) {
      return ['Papa crocante', 'Hamburguesa artesanal', 'Ensalada fresca'];
    }
    if (name.includes('broaster familiar')) {
      return ['Papa crocante', 'Ensalada fresca', 'Arroz'];
    }
    if (name.includes('salchi burger')) {
      return ['Queso cheddar', 'Papa crocante', 'Ensalada fresca'];
    }
    if (name.includes('selva power')) {
      return ['Maduros fritos', 'Sarza criolla', 'Papa crocante', 'Ensalada fresca'];
    }

    // 2. HAMBURGUESAS (12 productos)
    if (name === 'clásica' || name === 'clasica') {
      return ['Hamburguesa artesanal', 'Papa crocante', 'Ensalada fresca'];
    }
    if (name.includes('choripán') || name.includes('choripan')) {
      return ['Papas crocantes', 'Chorizo', 'Ensalada fresca'];
    }
    if (name.includes('hawaiana carne')) {
      return ['Papa crocante', 'Carne artesanal', 'Huevo', 'Jamón', 'Queso', 'Piña', 'Ensalada fresca'];
    }
    if (name.includes('hawaiana pollo')) {
      return ['Papa crocante', 'Pollo crispy', 'Huevo', 'Jamón', 'Queso', 'Piña', 'Ensalada fresca'];
    }
    if (name.includes('deshilachado')) {
      return ['Papas crocantes', 'Ensalada fresca'];
    }
    if (name.includes('filete')) {
      return ['Papas crocantes', 'Ensalada fresca'];
    }
    if (name.includes('cheese')) {
      return ['Queso cheddar'];
    }
    if (name.includes('bacon')) {
      return ['Papas crocantes', 'Tocino', 'Queso'];
    }
    if (name.includes('suprema')) {
      return ['Tocino', 'Queso', 'Huevo frito', 'Jamón'];
    }
    if (name.includes('hamburguesa a lo pobre')) {
      return ['Huevo frito', 'Queso', 'Jamón', 'Plátano'];
    }
    if (name.includes('royal a lo pobre')) {
      return ['Papa crocante', 'Carne artesanal', 'Huevo', 'Jamón', 'Queso', 'Plátano', 'Ensalada fresca'];
    }
    if (name === 'royal') {
      return ['Carne casera', 'Pollo deshilachado', 'Pollo', 'Chorizo'];
    }
    if (cat.includes('hamburguesa')) {
      return ['Hamburguesa artesanal', 'Papa crocante', 'Ensalada fresca'];
    }

    // 3. BROASTER (4 productos)
    if (cat.includes('broaster') || (name.includes('broaster') && !name.includes('salchi'))) {
      return ['Papa crocante', 'Ensalada fresca', 'Arroz'];
    }

    // 4. SALCHIPAPAS Y SALCHIBROASTERS (7 productos)
    if (cat.includes('salchipapa') || cat.includes('salchi')) {
      return ['Papas crocantes', 'Ensalada fresca'];
    }

    // 5. ALITAS (2 productos)
    if (cat.includes('alita') || name.includes('alita')) {
      return ['5 alitas', 'Papas crocantes'];
    }

    // 6. PLATOS AMAZÓNICOS (7 productos)
    if (name.includes('patacones con chorizo') || (name.includes('patacon') && name.includes('chorizo'))) {
      return ['Patacones', 'Chorizo'];
    }
    if (name.includes('tacacho')) {
      return ['Maduros fritos', 'Sarza criolla'];
    }
    if (name.includes('juane') || name.includes('juanes')) {
      return ['Maduros fritos'];
    }
    if (name.includes('chilcano') || name.includes('carachama')) {
      return ['Inguiri', 'Plátano'];
    }
    if (name.includes('palometa')) {
      return ['Arroz', 'Maduro frito'];
    }
    if (name.includes('caldo amazónico') || name.includes('caldo amazonico')) {
      return ['Yuca', 'Verduras de la selva'];
    }
    if (name.includes('chaufa') || (name.includes('chaufa') && cat.includes('amazon'))) {
      return ['Cecina y chorizo amazónico salteado'];
    }

    // 7. ADICIONALES (8 productos)
    if (cat.includes('adicion')) {
      return [];
    }

    // Fallback general
    return [
      'Porción principal recién preparada',
      'Papas o guarnición del plato',
      'Ensalada fresca'
    ];
  }

  /**
   * Obtiene la descripción oficial de cada producto según la carta
   */
  function getProductDescription(product) {
    if (!product) return 'Delicioso plato preparado con ingredientes frescos y la auténtica sazón de Buchisapa.';

    // 1. Prioridad: usar directamente la descripción oficial del objeto producto
    if (product.description && typeof product.description === 'string' && product.description.trim().length > 0) {
      return product.description.trim();
    }

    // 2. Buscar en la lista global de productos (window.currentProducts o getFallbackProducts)
    const list = (Array.isArray(window.currentProducts) && window.currentProducts.length > 0)
      ? window.currentProducts
      : (typeof getFallbackProducts === 'function' ? getFallbackProducts() : (typeof window.getFallbackProducts === 'function' ? window.getFallbackProducts() : []));

    if (Array.isArray(list) && list.length > 0) {
      const targetId = product.id ? String(product.id).trim().toLowerCase() : '';
      const targetName = product.name ? String(product.name).trim().toLowerCase() : '';

      const match = list.find(p => (targetId && String(p.id).toLowerCase() === targetId) || (targetName && String(p.name).toLowerCase() === targetName));
      if (match && match.description && match.description.trim().length > 0) {
        return match.description.trim();
      }
    }

    return 'Preparado al momento con ingredientes frescos de la más alta calidad y la auténtica sazón de la selva.';
  }

  /**
   * Obtiene la categoría formateada para el badge superior
   */
  function getCategoryPillLabel(product) {
    const cat = getProductCategorySlug(product);
    if (cat.includes('hamburguesa') || cat.includes('burger')) return 'HAMBURGUESAS';
    if (cat.includes('amazon') || cat.includes('selva')) return 'PLATOS AMAZÓNICOS';
    if (cat.includes('broaster')) return 'BROASTER';
    if (cat.includes('brasa') || cat.includes('pollo')) return 'POLLOS A LA BRASA';
    if (cat.includes('salchipapa')) return 'SALCHIPAPAS';
    if (cat.includes('alita')) return 'ALITAS';
    if (cat.includes('refresco')) return 'REFRESCOS';
    if (cat.includes('bebida')) return 'BEBIDAS';
    if (cat.includes('infusion')) return 'INFUSIONES';
    if (cat.includes('promo')) return 'PROMOCIONES';
    if (cat.includes('adicion') || cat.includes('extra')) return 'ADICIONAL';
    return (product.category || product.category_id || 'CARTA GENERAL').toUpperCase();
  }

  /**
   * Obtiene el badge superior de la imagen (ej: 🔥 MÁS VENDIDO)
   */
  function getHeroBadgeText(product) {
    if (product.badge) return product.badge;
    const name = (product.name || '').toLowerCase();
    const cat = (product.category_id || product.category || '').toLowerCase();
    if (name.includes('amazónica') || name.includes('amazonica')) return '🔥 EDICIÓN ESPECIAL';
    if (name.includes('clásica') || name.includes('tacacho') || name.includes('broaster')) return '🔥 MÁS VENDIDO';
    if (name.includes('juane') || cat.includes('amazon')) return '🌴 TRADICIÓN SELVÁTICA';
    return '⭐ RECOMENDADO';
  }

  /**
   * Abre la pantalla de personalización del producto
   */
  window.openProductDetailModal = function (productIdOrObject) {
    let product = null;

    const list = (Array.isArray(window.currentProducts) && window.currentProducts.length > 0)
      ? window.currentProducts
      : (typeof getFallbackProducts === 'function' ? getFallbackProducts() : []);

    if (list.length > 0 && (!window.currentProducts || window.currentProducts.length === 0)) {
      window.currentProducts = list;
    }

    if (typeof productIdOrObject === 'object' && productIdOrObject !== null) {
      product = productIdOrObject;
    } else if (typeof productIdOrObject === 'string') {
      const target = productIdOrObject.trim().toLowerCase();
      product = list.find(p => p.id === productIdOrObject || String(p.id).toLowerCase() === target) ||
                list.find(p => (p.name || '').toLowerCase() === target) ||
                list.find(p => (p.name || '').toLowerCase().includes(target));
    }

    if (!product && list.length > 0) {
      product = list[0];
    }

    if (!product) {
      console.warn('Producto no encontrado para personalizar:', productIdOrObject);
      return;
    }

    currentProduct = product;
    currentQty = 1;

    // Inicializar acompañamientos (todos seleccionados por defecto)
    availableAccompaniments = getProductAccompaniments(product);
    selectedAccompaniments = [...availableAccompaniments];

    // Inicializar salsas (NUNCA para bebidas, infusiones, refrescos o postres)
    if (isDrinkOrNoSauceItem(product)) {
      selectedSauces = [];
    } else if (Array.isArray(product.cremas) && product.cremas.length > 0) {
      selectedSauces = [...product.cremas];
    } else {
      selectedSauces = ALL_SAUCES.filter(s => s.default).map(s => s.name);
    }

    // Recordar página de procedencia
    const searchSec = document.getElementById('search-results-section');
    if (searchSec && searchSec.style.display !== 'none' && !searchSec.classList.contains('is-hidden')) {
      window._lastActivePageView = 'category';
    } else {
      window._lastActivePageView = 'home';
    }

    // Ocultar las otras secciones del catálogo pero MANTENER EL FOOTER visible al final de la página descriptiva
    const heroSec = document.querySelector('.hero-carousel-container');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const catSec = document.getElementById('category-banners-section');
    const footer = document.querySelector('.site-footer-buchisapa');

    if (heroSec) heroSec.style.display = 'none';
    if (titleWrap) titleWrap.style.display = 'none';
    if (catSec) catSec.style.display = 'none';
    if (searchSec) {
      searchSec.style.display = 'none';
      searchSec.classList.add('is-hidden');
    }
    if (footer) footer.style.display = 'block';

    renderProductCustomizerModal();

    const modal = document.getElementById('product-customizer-modal');
    if (modal) {
      modal.style.display = 'block';
      modal.classList.add('open', 'active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const backBtnText = document.getElementById('product-nav-back-text');
    if (backBtnText) {
      backBtnText.textContent = (window._lastActivePageView === 'category') ? 'Volver a Categorías' : 'Volver al inicio';
    }
  };

  function isDrinkOrNoSauceItem(product) {
    if (!product) return false;

    // Si explícitamente se configuró en el admin que NO incluye salsas o que no tiene cremas asignadas
    if (product.includes_sauces === false || (Array.isArray(product.cremas) && product.cremas.length === 0)) {
      return true;
    }

    const catBadge = String(product.categoryBadge || '').toLowerCase();
    const cat = getProductCategorySlug(product);
    const name = String(product.name || '').toLowerCase();

    // RECHAZO TOTAL DE CUALQUIER COMIDA / PLATO / HAMBURGUESA / POLLO / ETC.
    const foodCategories = ['hamburguesa', 'broaster', 'alita', 'salchipapa', 'amazonico', 'caldo', 'promo', 'combo', 'pack', 'plato', 'chaufa', 'tacacho'];
    if (foodCategories.some(fc => cat.includes(fc))) return false;

    const foodKeywords = ['pollo', 'filete', 'carne', 'chaufa', 'tacacho', 'cecina', 'chorizo', 'hamburguesa', 'salchipapa', 'alita', 'pecho', 'pierna', 'ala', 'papas', 'arroz', 'juane', 'patacon', 'patacones', 'costilla', 'chicharron', 'chicharrón'];
    if (foodKeywords.some(fw => name.includes(fw))) return false;

    if (product.is_promotion || product.isPromotion) return false;

    if (product.includes_sauces === false) return true;

    if (
      catBadge.includes('bebida') || catBadge.includes('infusion') || catBadge.includes('refresco') ||
      cat === 'bebidas' || cat === 'refrescos' || cat === 'infusiones' ||
      cat.includes('bebida') || cat.includes('refresco') || cat.includes('infusion') ||
      cat.includes('postre') || cat.includes('licor') || cat.includes('trago')
    ) {
      return true;
    }

    const drinkKeywords = [
      'agua cielo', 'agua mineral', 'san mateo', 'san luis', 'inca kola', 'inca cola', 'coca cola', 'fanta', 'sprite', 'pepsi', 
      '7up', 'gaseosa', 'refresco', 'cocona', 'camu camu', 'aguajina', 'maracuyá', 'maracuya', 
      'chicha morada', 'chicha', 'limonada', 'jugo', 'infusión', 'infusion', 
      'anís', 'anis', 'manzanilla', 'hierba luisa', 'cerveza', 'pilsen', 'cusqueña', 'cristal', 'corona', 'heineken'
    ];

    if (drinkKeywords.some(kw => name.includes(kw))) return true;
    if (/\b(té|te|café|cafe)\b/i.test(name)) return true;

    return false;
  }

  /**
   * Cierra la página descriptiva de producto y restaura la vista previa
   */
  window.closeProductDetailModal = function () {
    const modal = document.getElementById('product-customizer-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('open', 'active');
    }

    const heroSec = document.querySelector('.hero-carousel-container');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const catSec = document.getElementById('category-banners-section');
    const searchSec = document.getElementById('search-results-section');
    const footer = document.querySelector('.site-footer-buchisapa');

    if (window._lastActivePageView === 'category') {
      // Restaurar Página 2: Lista de Productos de Categoría
      if (searchSec) {
        searchSec.style.display = 'block';
        searchSec.classList.remove('is-hidden');
      }
      if (footer) footer.style.display = 'block';
      if (heroSec) heroSec.style.display = 'none';
      if (titleWrap) titleWrap.style.display = 'none';
      if (catSec) catSec.style.display = 'none';
    } else {
      // Restaurar Página 1: Página de Inicio
      if (heroSec) heroSec.style.display = 'block';
      if (titleWrap) titleWrap.style.display = 'block';
      if (catSec) catSec.style.display = 'grid';
      if (footer) footer.style.display = 'block';
      if (searchSec) {
        searchSec.style.display = 'none';
        searchSec.classList.add('is-hidden');
      }
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Atajo de teclado tecla Escape para cerrar
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('product-customizer-modal');
      if (modal && (modal.style.display === 'block' || modal.style.display === 'flex' || modal.classList.contains('open'))) {
        window.closeProductDetailModal();
      }
    }
  });

  /**
   * Renderiza el contenido completo del customizer
   */
  function renderProductCustomizerModal() {
    let modal = document.getElementById('product-customizer-modal');
    const footerEl = document.querySelector('.site-footer-buchisapa');
    const mainEl = document.querySelector('main.main-content-padded') || document.querySelector('main');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'product-customizer-modal';
      modal.className = 'product-customizer-modal';
      if (mainEl) {
        mainEl.appendChild(modal);
      } else if (footerEl && footerEl.parentNode) {
        footerEl.parentNode.insertBefore(modal, footerEl);
      } else {
        document.body.appendChild(modal);
      }
    } else {
      // Reubicar siempre antes del footer para que la secuencia de la página sea: Header -> Detalle de Producto -> Footer
      if (mainEl && modal.parentNode !== mainEl) {
        mainEl.appendChild(modal);
      } else if (footerEl && footerEl.parentNode && modal.parentNode === document.body) {
        footerEl.parentNode.insertBefore(modal, footerEl);
      }
    }

    const p = currentProduct;
    const catLabel = getCategoryPillLabel(p);
    const heroBadge = getHeroBadgeText(p);
    const desc = getProductDescription(p);
    const priceNum = parseFloat(p.price || 0);
    const totalPrice = (priceNum * currentQty).toFixed(2);
    const catFallback = (typeof window.getCategoryBannerFallback === 'function') 
      ? window.getCategoryBannerFallback(p.category_id || p.category) 
      : '/imagenes/portada/Portada1E.webp';
    const imgSrc = p.image || catFallback;

    const isDrink = isDrinkOrNoSauceItem(p);
    const hasAccompaniments = availableAccompaniments && availableAccompaniments.length > 0;
    const showSauces = !isDrink && p.includes_sauces !== false;

    const backLabelText = (window._lastActivePageView === 'category') ? 'Volver a Categorías' : 'Volver al inicio';

    modal.innerHTML = `
      <div class="product-customizer-container">
        <div class="product-customizer-inner-wrap">
          
          <!-- BOTÓN VOLVER LIMPIO CON ETIQUETA DINÁMICA -->
          <div class="product-back-bar">
            <button type="button" class="product-nav-back-clean" onclick="closeProductDetailModal()" aria-label="Volver">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span id="product-nav-back-text">${backLabelText}</span>
            </button>
          </div>

          <!-- GRID PRINCIPAL -->
          <div class="product-detail-layout-grid">
            
            <!-- COLUMNA IZQUIERDA: FOTOGRAFÍA CUADRADA DEL PLATO -->
            <div class="product-detail-left-col">
              <div class="product-hero-card">
                <img src="${imgSrc}" alt="${escapeHtml(p.name)}" class="product-hero-img" loading="eager" decoding="async" onerror="this.onerror=null; this.src='${catFallback}';">
                <div class="product-hero-badge">
                  <span>${heroBadge}</span>
                </div>
              </div>
            </div>

            <!-- COLUMNA DERECHA: INFORMACIÓN, PERSONALIZACIÓN Y ACCIÓN -->
            <div class="product-detail-right-col">
              
              <!-- CARD INFORMACIÓN DEL PLATO -->
              <div class="product-main-info-card">
                <h1 class="product-main-title">${escapeHtml(p.name)}</h1>
                <div class="product-meta-row">
                  <span class="product-main-cat-label">CATEGORÍA: ${catLabel}</span>
                </div>
                <div class="product-price-wrapper">
                  <div class="product-main-price">S/ ${priceNum.toFixed(2)}</div>
                  <span class="product-main-unit-label">Precio unitario</span>
                </div>
                <p class="product-main-description">${escapeHtml(desc)}</p>
              </div>

              <!-- SECCIÓN 1: ACOMPAÑAMIENTOS E INGREDIENTES (SI APLICA) -->
              ${hasAccompaniments ? `
              <div class="product-section-card">
                <div class="product-section-header">
                  <div class="product-section-title-group">
                    <div class="product-section-icon">🍴</div>
                    <div>
                      <h3 class="product-section-h3">Acompañamientos e Ingredientes</h3>
                      <p class="product-section-subtitle">Personaliza lo que incluye tu plato</p>
                    </div>
                  </div>
                  <div class="product-section-actions">
                    <button type="button" class="preset-pill-btn teal" onclick="window.customizerSetAllAccompaniments(true)">
                      ✓ Con todo
                    </button>
                    <button type="button" class="preset-pill-btn outline" onclick="window.customizerSetAllAccompaniments(false)">
                      ↺ Quitar
                    </button>
                  </div>
                </div>

                <!-- LISTA DE ACOMPAÑAMIENTOS -->
                <div class="product-items-list" id="customizer-accompaniments-list">
                  ${renderAccompanimentsList()}
                </div>
              </div>
              ` : ''}

              <!-- SECCIÓN 2: CREMAS Y SALSAS DE LA CASA (SI APLICA) -->
              ${showSauces ? `
              <div class="product-section-card">
                <div class="product-section-header">
                  <div class="product-section-title-group">
                    <div class="product-section-icon">✨</div>
                    <div>
                      <h3 class="product-section-h3">Cremas y Salsas de la Casa</h3>
                      <p class="product-section-subtitle">Selecciona las cremas que deseas</p>
                    </div>
                  </div>
                  <div class="product-section-actions">
                    <button type="button" class="preset-pill-btn teal" onclick="window.customizerSetSaucesPreset('all')">
                      ✓ Todas
                    </button>
                    <button type="button" class="preset-pill-btn yellow" onclick="window.customizerSetSaucesPreset('classics')">
                      Clásicas
                    </button>
                    <button type="button" class="preset-pill-btn outline" onclick="window.customizerSetSaucesPreset('none')">
                      ↺ Ninguna
                    </button>
                  </div>
                </div>

                <!-- LISTA DE CREMAS -->
                <div class="product-items-list" id="customizer-sauces-list">
                  ${renderSaucesList()}
                </div>
              </div>
              ` : ''}

              <!-- SECCIÓN 3: INDICACIONES ESPECIALES -->
              <div class="product-section-card">
                <h3 class="product-section-h3" style="margin-bottom: 10px;">${isDrink ? 'Indicaciones para tu bebida (opcional)' : 'Indicaciones especiales para la cocina (opcional)'}</h3>
                <textarea id="customizer-kitchen-notes" class="product-notes-textarea" rows="2" placeholder="${isDrink ? 'Ej: Sin hielo, poco dulce, bien helada...' : 'Ej: Papas bien crocantes, cremas aparte en táper, pechuga bien doradita...'}"></textarea>
                ${!isDrink ? `
                <div class="product-allergen-note">
                  ¿Tienes alguna alergia alimentaria? <span class="product-allergen-link" onclick="window.showAllergenInfoModal()">Ver información de alérgenos</span>
                </div>
                ` : ''}
              </div>

              <!-- BARRA DE ACCIÓN Y CANTIDAD -->
              <div class="product-inline-action-bar">
                <div class="product-sticky-inner">
                  <!-- SELECTOR DE CANTIDAD -->
                  <div class="product-stepper">
                    <button type="button" class="product-stepper-btn" onclick="window.customizerChangeQty(-1)" aria-label="Disminuir cantidad">−</button>
                    <span class="product-stepper-qty" id="customizer-qty-display">${currentQty}</span>
                    <button type="button" class="product-stepper-btn" onclick="window.customizerChangeQty(1)" aria-label="Aumentar cantidad">+</button>
                  </div>

                  <!-- BOTÓN AGREGAR A MI PEDIDO -->
                  <button type="button" class="product-add-cart-btn" onclick="window.customizerAddToCart()">
                    <span>Agregar a mi pedido</span>
                    <span id="customizer-total-price">S/ ${totalPrice}</span>
                  </button>
                </div>
              </div>

            </div> <!-- FIN product-detail-right-col -->

          </div> <!-- FIN product-detail-layout-grid -->
        </div> <!-- FIN product-customizer-inner-wrap -->
      </div> <!-- FIN product-customizer-container -->
    `;
  }

  function renderAccompanimentsList() {
    return availableAccompaniments.map(acc => {
      const isSelected = selectedAccompaniments.includes(acc);
      return `
        <div class="product-item-toggle-card ${isSelected ? 'active' : ''}" onclick="window.customizerToggleAccompaniment('${escapeHtmlAttr(acc)}')">
          <div class="product-item-left">
            <div class="product-item-checkbox">
              <span class="product-item-checkbox-check">✓</span>
            </div>
            <span class="product-item-name">${escapeHtml(acc)}</span>
          </div>
          <span class="product-item-badge">${isSelected ? 'Incluido' : 'Sin esto'}</span>
        </div>
      `;
    }).join('');
  }

  function renderSaucesList() {
    let sauceList = ALL_SAUCES;
    if (currentProduct && Array.isArray(currentProduct.cremas) && currentProduct.cremas.length > 0) {
      sauceList = currentProduct.cremas.map(cName => {
        const found = ALL_SAUCES.find(s => s.name.toLowerCase() === cName.toLowerCase());
        return found || { id: cName.toLowerCase().replace(/\s+/g, '-'), name: cName, default: true };
      });
    }
    return sauceList.map(s => {
      const isSelected = selectedSauces.includes(s.name);
      return `
        <div class="product-item-toggle-card ${isSelected ? 'active' : ''}" onclick="window.customizerToggleSauce('${escapeHtmlAttr(s.name)}')">
          <div class="product-item-left">
            <div class="product-item-checkbox">
              <span class="product-item-checkbox-check">✓</span>
            </div>
            <span class="product-item-name">${escapeHtml(s.name)}</span>
          </div>
          <span class="product-item-badge">${isSelected ? 'Incluido' : 'Sin esto'}</span>
        </div>
      `;
    }).join('');
  }

  // Métodos de interacción en ventana
  window.customizerToggleAccompaniment = function (name) {
    const idx = selectedAccompaniments.indexOf(name);
    if (idx > -1) {
      selectedAccompaniments.splice(idx, 1);
    } else {
      selectedAccompaniments.push(name);
    }
    const container = document.getElementById('customizer-accompaniments-list');
    if (container) container.innerHTML = renderAccompanimentsList();
  };

  window.customizerSetAllAccompaniments = function (includeAll) {
    if (includeAll) {
      selectedAccompaniments = [...availableAccompaniments];
    } else {
      selectedAccompaniments = [];
    }
    const container = document.getElementById('customizer-accompaniments-list');
    if (container) container.innerHTML = renderAccompanimentsList();
  };

  window.customizerToggleSauce = function (sauceName) {
    const idx = selectedSauces.indexOf(sauceName);
    if (idx > -1) {
      selectedSauces.splice(idx, 1);
    } else {
      selectedSauces.push(sauceName);
    }
    const container = document.getElementById('customizer-sauces-list');
    if (container) container.innerHTML = renderSaucesList();
  };

  window.customizerSetSaucesPreset = function (preset) {
    let availableList = ALL_SAUCES.map(s => s.name);
    if (currentProduct && Array.isArray(currentProduct.cremas) && currentProduct.cremas.length > 0) {
      availableList = [...currentProduct.cremas];
    }

    if (preset === 'all') {
      selectedSauces = [...availableList];
    } else if (preset === 'classics') {
      selectedSauces = ['Mayonesa', 'Mostaza', 'Ketchup', 'Ají de Rocoto'].filter(s => availableList.includes(s));
    } else if (preset === 'none') {
      selectedSauces = [];
    }
    const container = document.getElementById('customizer-sauces-list');
    if (container) container.innerHTML = renderSaucesList();
  };

  window.customizerChangeQty = function (delta) {
    currentQty = Math.max(1, Math.min(50, currentQty + delta));
    const qtyEl = document.getElementById('customizer-qty-display');
    const priceEl = document.getElementById('customizer-total-price');
    if (qtyEl) qtyEl.textContent = currentQty;
    if (priceEl && currentProduct) {
      const total = (parseFloat(currentProduct.price || 0) * currentQty).toFixed(2);
      priceEl.textContent = `S/ ${total}`;
    }
  };

  window.customizerAddToCart = function () {
    if (!currentProduct || !window.BuchisapaCart) return;

    const notesInput = document.getElementById('customizer-kitchen-notes');
    const kitchenNotes = notesInput ? notesInput.value.trim() : '';

    // Preparar descripción de acompañamientos personalizados
    let accompanimentsSummary = '';
    if (isDrinkOrNoSauceItem(currentProduct) || availableAccompaniments.length === 0) {
      accompanimentsSummary = (window.BuchisapaCart && typeof window.BuchisapaCart.getDefaultAccompaniments === 'function')
        ? window.BuchisapaCart.getDefaultAccompaniments(currentProduct)
        : 'Bebida bien helada servida en empaque sellado para delivery';
    } else if (selectedAccompaniments.length === availableAccompaniments.length) {
      accompanimentsSummary = 'Con todo: ' + selectedAccompaniments.join(', ');
    } else if (selectedAccompaniments.length === 0) {
      accompanimentsSummary = 'Sin acompañamientos';
    } else {
      accompanimentsSummary = 'Solo con: ' + selectedAccompaniments.join(', ');
    }

    // Agregar al carrito
    const saucesToPass = isDrinkOrNoSauceItem(currentProduct) ? [] : selectedSauces;
    window.BuchisapaCart.addItem(
      currentProduct,
      currentQty,
      saucesToPass,
      kitchenNotes,
      accompanimentsSummary
    );

    window.closeProductDetailModal();
  };

  window.showAllergenInfoModal = function () {
    alert(
      'ℹ️ INFORMACIÓN DE ALÉRGENOS - BUCHISAPA:\n\n' +
      '• Gluten: Panes brioche, empanizados broaster y pastas.\n' +
      '• Huevos: Mayonesa, tártara, juanes y hamburguesas royal.\n' +
      '• Lácteos: Queso cheddar, queso andino y salsas de queso.\n' +
      '• Sésamo/Ajonjolí: Panes para hamburguesas.\n' +
      '• Pescado/Mariscos: Chilcano, palometa y salsa acevichada.\n\n' +
      'Si tienes alguna condición alérgica severa, especifícala en las notas para cocina.'
    );
  };

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeHtmlAttr(text) {
    if (!text) return '';
    return String(text).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }
})();
