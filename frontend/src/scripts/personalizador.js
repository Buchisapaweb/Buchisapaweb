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
    { id: 'mayonesa', nombre: 'Mayonesa', default: true },
    { id: 'mostaza', nombre: 'Mostaza', default: true },
    { id: 'ketchup', nombre: 'Ketchup', default: true },
    { id: 'aji-rocoto', nombre: 'Ají de Rocoto', default: true },
    { id: 'tartara', nombre: 'Tártara', default: false },
    { id: 'aji-charapita', nombre: 'Ají Charapita', default: false },
    { id: 'acevichada', nombre: 'Acevichada', default: false },
    { id: 'salsa-bbq', nombre: 'Salsa BBQ', default: false },
    { id: 'salsa-golf', nombre: 'Salsa Golf', default: false },
    { id: 'ocopa', nombre: 'Ocopa', default: false },
    { id: 'aceituna', nombre: 'Aceituna', default: false },
    { id: 'vinagreta', nombre: 'Vinagreta', default: false }
  ];

  // Estado activo del producto en personalización
  let currentProduct = null;
  let currentQty = 1;
  let selectedAccompaniments = [];
  let availableAccompaniments = [];
  let selectedSauces = [];

  /**
   * Determina si un producto pertenece a categorías que NO llevan acompañamientos ni cremas
   * (Adicionales, Bebidas, Infusiones, Refrescos)
   */
  function isExcludedCategory(product) {
    if (!product) return false;
    const cat = String(product.id_categoria || product.categoria || product.categoriaPill || product.categoria || product.categoria_slug || '').toLowerCase().trim();
    const catBadge = String(product.categoriaBadge || '').toLowerCase().trim();
    const name = String(product.nombre || '').toLowerCase().trim();

    // 1. ADICIONALES (C0001), BEBIDAS (C0003), INFUSIONES (C0006), REFRESCOS (C0009)
    if (
      cat === 'c0001' || cat === 'c0003' || cat === 'c0006' || cat === 'c0009' ||
      cat === 'adicionales' || cat === 'adicional' ||
      cat === 'bebidas' || cat === 'bebida' ||
      cat === 'infusiones' || cat === 'infusion' ||
      cat === 'refrescos' || cat === 'refresco' ||
      cat.includes('adicional') || cat.includes('extra') ||
      cat.includes('bebida') || cat.includes('refresco') ||
      cat.includes('infusion') || cat.includes('infusiones') ||
      catBadge.includes('adicional') || catBadge.includes('bebida') ||
      catBadge.includes('refresco') || catBadge.includes('infusion')
    ) {
      return true;
    }

    // Bebidas e infusiones comunes por nombre
    const drinkKeywords = [
      'agua', 'cielo', 'san mateo', 'san luis', 'inca kola', 'coca cola', 'fanta', 'sprite', 'pepsi', 
      'gaseosa', 'aguajina', 'maracuyá', 'maracuya', 'camu camu', 'camu', 
      'chicha', 'anís', 'anis', 'manzanilla', 'hierba luisa', 'infusión', 'infusion', 
      'café', 'cafe', 'té ', 'te ', 'porción de', 'porcion de', 'adicional'
    ];

    return drinkKeywords.some(kw => name.includes(kw));
  }

  /**
   * Obtiene los acompañamientos específicos según la carta oficial Buchisapa
   */
  function getProductAccompaniments(product) {
    if (!product || isExcludedCategory(product)) {
      return [];
    }

    const name = (product.nombre || '').toLowerCase().trim();
    const cat = (product.id_categoria || product.categoria || '').toLowerCase().trim();

    // 1. PLATOS AMAZÓNICOS
    if (name.includes('patacones con chorizo') || (name.includes('patacon') && name.includes('chorizo'))) {
      return [
        'Patacones de plátano verde fritos',
        'Chorizo frito en bolitas',
        'Salsa / Crema'
      ];
    }
    if (name.includes('tacacho')) {
      return [
        'Tacacho con plátano asado',
        'Cecina ahumada de la selva',
        'Chorizo amazónico',
        'Plátano maduro frito',
        'Sarza criolla / ají de cocona'
      ];
    }
    if (name.includes('juane') || name.includes('juanes')) {
      return [
        'Juane de arroz con gallina',
        'Huevo duro',
        'Aceituna de botija',
        'Plátano maduro frito',
        'Ensalada de cocona / ají de cocona'
      ];
    }
    if (name.includes('chilcano') || name.includes('carachama')) {
      return [
        'Carachama / pescado del día entero',
        'Yuca sancochada',
        'Caldo chilcano'
      ];
    }
    if (name.includes('palometa')) {
      return [
        'Palometa frita entera',
        'Arroz blanco',
        'Plátano maduro frito',
        'Salsa criolla / ají'
      ];
    }
    if (name.includes('caldo amazónico') || name.includes('caldo amazonico')) {
      return [
        'Caldo verde amazónico con pescado/pollo',
        'Culantro y hierbas selváticas',
        'Yuca sancochada'
      ];
    }
    if (name.includes('chaufa') || (name.includes('chaufa') && cat.includes('amazon'))) {
      return [
        'Arroz chaufa con cecina',
        'Chorizo amazónico en trozos',
        'Huevo salteado'
      ];
    }

    // 2. HAMBURGUESAS
    if (name.includes('choripan') || name.includes('choripán')) {
      return [
        'Papas fritas',
        'Chorizo parrillero',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('hawaiana carne')) {
      return [
        'Papa frita',
        'Carne artesanal',
        'Huevo frito',
        'Jamón',
        'Queso fundido',
        'Piña a la plancha',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('hawaiana pollo')) {
      return [
        'Papa frita',
        'Pollo crispy',
        'Huevo frito',
        'Jamón',
        'Queso fundido',
        'Piña a la plancha',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('deshilachado')) {
      return [
        'Papas fritas',
        'Pollo deshilachado con mayonesa casera',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('filete')) {
      return [
        'Papas fritas',
        'Filete de pollo a la plancha',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('cheese') || name.includes('cheeseburger')) {
      return [
        'Hamburguesa de casa',
        'Queso cheddar'
      ];
    }
    if (name.includes('bacon')) {
      return [
        'Hamburguesa artesanal',
        'Papas fritas',
        'Tocino crocante',
        'Queso cheddar'
      ];
    }
    if (name.includes('suprema')) {
      return [
        'Hamburguesa artesanal',
        'Tocino crocante',
        'Queso fundido',
        'Huevo frito',
        'Jamón',
        'Papas fritas',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('royal a lo pobre')) {
      return [
        'Papa frita',
        'Carne artesanal',
        'Huevo frito',
        'Jamón',
        'Queso fundido',
        'Plátano maduro frito',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('royal')) {
      return [
        'Carne casera / Pollo deshilachado / Hamburguesa de pollo / Hamburguesa de Chorizo',
        'Papas fritas',
        'Ensalada fresca',
        'Crema'
      ];
    }
    if (name.includes('hamburguesa a lo pobre') || (name.includes('a lo pobre') && cat.includes('hamburguesa'))) {
      return [
        'Hamburguesa artesanal',
        'Huevo frito',
        'Queso fundido',
        'Jamón',
        'Plátano maduro frito',
        'Papas fritas'
      ];
    }
    if (name.includes('clásica') || name.includes('clasica') || cat.includes('hamburguesa')) {
      return [
        'Hamburguesa (carne o pollo)',
        'Papas fritas',
        'Ensalada fresca',
        'Crema'
      ];
    }

    // 3. BROASTER (Todos con: Papa + ensalada + arroz + cremas)
    if (cat.includes('broaster') || (name.includes('broaster') && !name.includes('salchi'))) {
      return [
        'Papa frita',
        'Ensalada fresca',
        'Arroz blanco',
        'Cremas de la casa'
      ];
    }

    // 4. SALCHIPAPAS Y SALCHIBROASTERS (Todos con: Papas + ensalada + cremas)
    if (name.includes('salchipapa a lo pobre')) {
      return [
        'Papas fritas',
        'Salchicha en rodajas',
        'Huevo frito',
        'Plátano maduro frito',
        'Ensalada fresca',
        'Cremas'
      ];
    }
    if (name.includes('salchichorizo')) {
      return [
        'Papas fritas',
        'Chorizo amazónico en rodajas',
        'Ensalada fresca',
        'Cremas'
      ];
    }
    if (name.includes('salchibroaster')) {
      return [
        'Papas fritas',
        'Presa de pollo broaster crujiente',
        'Ensalada fresca',
        'Cremas'
      ];
    }
    if (name.includes('salchipapa') || cat.includes('salchipapa')) {
      return [
        'Papas fritas',
        'Salchicha en rodajas',
        'Ensalada fresca',
        'Cremas'
      ];
    }

    // 5. ALITAS (Todos con: + 5 alitas + papas)
    if (cat.includes('alita') || name.includes('alita')) {
      return [
        '5 alitas crocantes',
        'Papas fritas'
      ];
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
    if (!product) return '';

    let d = '';
    // 1. Prioridad: usar directamente la descripción oficial del objeto producto
    if (product.descripcion && typeof product.descripcion === 'string' && product.descripcion.trim().length > 0) {
      d = product.descripcion.trim();
    } else {
      // 2. Buscar en la lista global de productos (window.currentProducts o getFallbackProducts)
      const list = (Array.isArray(window.currentProducts) && window.currentProducts.length > 0)
        ? window.currentProducts
        : (typeof getFallbackProducts === 'function' ? getFallbackProducts() : (typeof window.getFallbackProducts === 'function' ? window.getFallbackProducts() : []));

      if (Array.isArray(list) && list.length > 0) {
        const targetId = product.id ? String(product.id).trim().toLowerCase() : '';
        const targetName = product.nombre ? String(product.nombre).trim().toLowerCase() : '';

        const match = list.find(p => (targetId && String(p.id).toLowerCase() === targetId) || (targetName && String(p.nombre).toLowerCase() === targetName));
        if (match && match.descripcion && match.descripcion.trim().length > 0) {
          d = match.descripcion.trim();
        }
      }
    }

    // Eliminar texto redundante "No cuenta con acompañamientos ni cremas"
    d = d.replace(/No cuenta con acompañamientos ni cremas\.?/gi, '').trim();

    if (!d) {
      if (isExcludedCategory(product)) {
        return '';
      }
      return 'Preparado al momento con ingredientes frescos de la más alta calidad y la auténtica sazón de la selva.';
    }

    return d;
  }

  /**
   * Obtiene la categoría formateada para el badge superior
   */
  function getCategoryPillLabel(product) {
    const cat = (product.id_categoria || product.categoria || '').toLowerCase();
    if (cat.includes('hamburguesa') || cat.includes('burger')) return 'HAMBURGUESAS';
    if (cat.includes('amazon') || cat.includes('selva')) return 'PLATOS AMAZÓNICOS';
    if (cat.includes('broaster')) return 'BROASTER';
    if (cat.includes('brasa') || cat.includes('pollo')) return 'POLLOS A LA BRASA';
    if (cat.includes('salchipapa')) return 'SALCHIPAPAS';
    if (cat.includes('alita')) return 'ALITAS';
    if (cat.includes('refresco')) return 'REFRESCOS';
    if (cat.includes('bebida')) return 'BEBIDAS';
    if (cat.includes('infusion')) return 'INFUSIONES';
    return (product.id_categoria || product.categoria || 'CARTA GENERAL').toUpperCase();
  }

  /**
   * Obtiene el badge superior de la imagen (ej: 🔥 MÁS VENDIDO)
   */
  function getHeroBadgeText(product) {
    if (product.etiqueta) return product.etiqueta;
    const name = (product.nombre || '').toLowerCase();
    const cat = (product.id_categoria || product.categoria || '').toLowerCase();
    if (name.includes('amazónica') || name.includes('amazonica')) return '🔥 EDICIÓN ESPECIAL';
    if (name.includes('clásica') || name.includes('tacacho') || name.includes('broaster')) return '🔥 MÁS VENDIDO';
    if (name.includes('juane') || cat.includes('amazon')) return '🌴 TRADICIÓN SELVÁTICA';
    return '⭐ RECOMENDADO';
  }

  /**
   * Abre la pantalla de personalización del producto
   */
  window.openProductDetailModal = function (idProductoOrObject) {
    let product = null;

    const list = (Array.isArray(window.currentProducts) && window.currentProducts.length > 0)
      ? window.currentProducts
      : (typeof getFallbackProducts === 'function' ? getFallbackProducts() : []);

    if (list.length > 0 && (!window.currentProducts || window.currentProducts.length === 0)) {
      window.currentProducts = list;
    }

    if (typeof idProductoOrObject === 'object' && idProductoOrObject !== null) {
      product = idProductoOrObject;
    } else if (typeof idProductoOrObject === 'string') {
      const target = idProductoOrObject.trim().toLowerCase();
      product = list.find(p => p.id === idProductoOrObject || String(p.id).toLowerCase() === target) ||
                list.find(p => (p.nombre || '').toLowerCase() === target) ||
                list.find(p => (p.nombre || '').toLowerCase().includes(target));
    }

    if (!product && list.length > 0) {
      product = list[0];
    }

    if (!product) {
      console.warn('Producto no encontrado para personalizar:', idProductoOrObject);
      return;
    }

    currentProduct = product;
    currentQty = 1;

    // Inicializar acompañamientos (todos seleccionados por defecto)
    availableAccompaniments = getProductAccompaniments(product);
    selectedAccompaniments = [...disponibleAccompaniments];

    // Inicializar salsas (NUNCA para bebidas, infusiones, refrescos o postres)
    if (isDrinkOrNoSauceItem(product)) {
      selectedSauces = [];
    } else {
      selectedSauces = ALL_SAUCES.filter(s => s.default).map(s => s.nombre);
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

    const catBadge = String(product.categoriaBadge || '').toLowerCase();
    const cat = String(product.id_categoria || product.categoria || product.categoriaPill || '').toLowerCase();
    const name = String(product.nombre || '').toLowerCase();

    // Las promociones, combos y packs NUNCA son bebidas puras (siempre incluyen cremas y salsas de la casa)
    if (
      product.is_promotion || product.isPromotion || 
      cat.includes('promo') || name.includes('promo') || name.includes('combo') || name.includes('pack')
    ) {
      return false;
    }

    if (product.incluye_salsas === false) return true;

    if (isExcludedCategory(product)) {
      return true;
    }

    const drinkKeywords = [
      'agua', 'cielo', 'san mateo', 'san luis', 'inca', 'coca', 'fanta', 'sprite', 'pepsi', 
      '7up', 'gaseosa', 'refresco', 'cocona', 'camu', 'aguajina', 'maracuyá', 'maracuya', 
      'chicha', 'limonada', 'jugo', 'infusión', 'infusion', 'café', 'cafe', 'té', 'te', 
      'anís', 'anis', 'manzanilla', 'hierba luisa', 'cerveza', 'pilsen', 'cusqueña', 'cristal', 'corona', 'heineken'
    ];

    return drinkKeywords.some(kw => name.includes(kw));
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
    const priceNum = parseFloat(p.precio || 0);
    const totalPrice = (priceNum * currentQty).toFixed(2);
    const catFallback = (typeof window.getCategoryBannerFallback === 'function') 
      ? window.getCategoryBannerFallback(p.id_categoria || p.categoria) 
      : '/imagenes/portada/Portada1E.webp';
    const imgSrc = p.imagen || catFallback;

    const isDrink = isDrinkOrNoSauceItem(p);
    const hasAccompaniments = availableAccompaniments && availableAccompaniments.length > 0;
    const showSauces = !isDrink && p.incluye_salsas !== false;

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
                <img src="${imgSrc}" alt="${escapeHtml(p.nombre)}" class="product-hero-img" loading="eager" decoding="async" onerror="this.onerror=null; this.src='${catFallback}';">
                <div class="product-hero-badge">
                  <span>${heroBadge}</span>
                </div>
              </div>
            </div>

            <!-- COLUMNA DERECHA: INFORMACIÓN, PERSONALIZACIÓN Y ACCIÓN -->
            <div class="product-detail-right-col">
              
              <!-- CARD INFORMACIÓN DEL PLATO -->
              <div class="product-main-info-card">
                <h1 class="product-main-title">${escapeHtml(p.nombre)}</h1>
                <div class="product-meta-row">
                  <span class="product-main-cat-label">CATEGORÍA: ${catLabel}</span>
                </div>
                <div class="product-price-wrapper">
                  <div class="product-main-price">S/ ${priceNum.toFixed(2)}</div>
                  <span class="product-main-unit-label">Precio unitario</span>
                </div>
                ${desc ? `<p class="product-main-description">${escapeHtml(desc)}</p>` : ''}
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
    return ALL_SAUCES.map(s => {
      const isSelected = selectedSauces.includes(s.nombre);
      return `
        <div class="product-item-toggle-card ${isSelected ? 'active' : ''}" onclick="window.customizerToggleSauce('${escapeHtmlAttr(s.nombre)}')">
          <div class="product-item-left">
            <div class="product-item-checkbox">
              <span class="product-item-checkbox-check">✓</span>
            </div>
            <span class="product-item-name">${escapeHtml(s.nombre)}</span>
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
      selectedAccompaniments = [...disponibleAccompaniments];
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
    if (preset === 'all') {
      selectedSauces = ALL_SAUCES.map(s => s.nombre);
    } else if (preset === 'classics') {
      selectedSauces = ['Mayonesa', 'Mostaza', 'Ketchup', 'Ají de Rocoto'];
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
      const total = (parseFloat(currentProduct.precio || 0) * currentQty).toFixed(2);
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
