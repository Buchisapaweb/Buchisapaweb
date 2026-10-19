/**
 * RESTAURANTE BUCHISAPA - Lógica Interactiva del Encabezado & Menú Desplegable Móvil (publico/js/encabezado.js)
 * Control del menú hamburguesa pantalla completa, búsqueda desplegable, acordeones y sincronización
 */

// Ignorar script errors de CDN externos (evita ruido en consola)
window.addEventListener('error', function (e) {
  if (e.message && e.message.toLowerCase().includes('script error')) {
    e.preventDefault();
    return true;
  }
}, true);

function toggleMobileMenu(forceState) {
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (!backdrop) return;

  const isCurrentlyOpen = backdrop.classList.contains('active') || backdrop.classList.contains('open') || backdrop.style.display === 'flex';
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

  if (shouldOpen) {
    // Abrir menú pantalla completa
    backdrop.style.display = 'flex';
    // Forzar reflow para animación CSS
    void backdrop.offsetWidth;
    backdrop.classList.add('active', 'open');
    document.body.style.overflow = 'hidden';

    // Sincronizar contador del carrito en drawer
    if (window.BuchisapaCart && typeof window.BuchisapaCart.getItemsCount === 'function') {
      const countEl = document.getElementById('drawer-cart-count');
      if (countEl) {
        countEl.textContent = String(window.BuchisapaCart.getItemsCount());
      }
    }
  } else {
    // Cerrar menú
    backdrop.classList.remove('active', 'open');
    setTimeout(() => {
      if (!backdrop.classList.contains('active') && !backdrop.classList.contains('open')) {
        backdrop.style.display = 'none';
      }
    }, 280);
    document.body.style.overflow = '';
  }
}

function openMobileMenu() {
  toggleMobileMenu(true);
}

function closeMobileDrawer() {
  toggleMobileMenu(false);
}

function toggleNavCollapsible(collapsibleId) {
  const container = document.getElementById(collapsibleId);
  if (!container) return;
  container.classList.toggle('open');
}

function openCategoryView(catId, catTitle) {
  if (typeof window.closeAllDesktopDropdowns === 'function') {
    window.closeAllDesktopDropdowns();
  }
  if (typeof window.closeMobileDrawer === 'function') {
    window.closeMobileDrawer();
  }
  if (typeof window.closeProductDetailModal === 'function') {
    window.closeProductDetailModal();
  }

  // Si app.js ya ha inicializado su función de renderizado de categorías, ejecutarla
  if (window._appOpenCategoryView && typeof window._appOpenCategoryView === 'function') {
    window._appOpenCategoryView(catId, catTitle);
    return;
  }

  // Redirección si estamos en otra subpágina
  const currentPath = window.location.pathname.toLowerCase();
  if (currentPath !== '/' && !currentPath.endsWith('/index.html') && currentPath !== '') {
    window.location.href = '/?cat=' + encodeURIComponent(catId || 'all');
    return;
  }

  // Si app.js aún se está descargando o inicializando, esperar brevemente a su disponibilidad
  let attempts = 0;
  const pollInterval = setInterval(() => {
    attempts++;
    if (window._appOpenCategoryView && typeof window._appOpenCategoryView === 'function') {
      clearInterval(pollInterval);
      window._appOpenCategoryView(catId, catTitle);
    } else if (attempts >= 40) {
      clearInterval(pollInterval);
    }
  }, 50);
}

function selectCategoryFromDrawer(catId, catName) {
  closeMobileDrawer();
  openCategoryView(catId, catName);
}

function goToPromociones() {
  if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
  if (typeof window.exitSearchMode === 'function') window.exitSearchMode();
  openCategoryView('promociones', 'PROMOCIONES');
}

function openCartFromDrawer() {
  closeMobileDrawer();
  if (window.BuchisapaCart && typeof window.BuchisapaCart.openDrawer === 'function') {
    setTimeout(() => {
      window.BuchisapaCart.openDrawer();
    }, 150);
  }
}

function ensureSearchUI() {
  let wrap = document.getElementById('buchisapa-search-bar-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'buchisapa-search-bar-wrap';
    wrap.className = 'buchisapa-search-bar-wrap is-hidden';
    wrap.innerHTML = `
      <div class="container search-bar-inner">
        <div class="search-bar-top-row">
          <div class="search-input-pill-wrapper">
            <svg class="search-pill-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.5-4.5"/></svg>
            <input type="search" id="main-search-input" class="search-pill-input" placeholder="Busca por nombre de plato..." autocomplete="off" aria-label="Buscar productos por nombre">
            <button id="search-clear-btn" class="search-clear-btn is-hidden" type="button" aria-label="Limpiar búsqueda">×</button>
          </div>
          <button id="search-close-action-btn" class="search-action-btn search-close-x" type="button" aria-label="Cerrar buscador" title="Cerrar">×</button>
        </div>
      </div>`;
    const header = document.querySelector('.site-header, .subpage-navbar');
    if (header) header.insertAdjacentElement('afterend', wrap);
    else document.body.prepend(wrap);
  }

  let results = document.getElementById('buchisapa-live-search-results');
  if (!results) {
    results = document.createElement('section');
    results.id = 'buchisapa-live-search-results';
    results.className = 'buchisapa-live-search-results';
    results.setAttribute('aria-live', 'polite');
    results.setAttribute('aria-label', 'Resultados de búsqueda');
    wrap.insertAdjacentElement('afterend', results);
  }
  return wrap;
}

function toggleSearchBar(forceState) {
  const wrap = ensureSearchUI();
  const shouldShow = typeof forceState === 'boolean'
    ? forceState
    : wrap.classList.contains('is-hidden') || getComputedStyle(wrap).display === 'none';

  wrap.classList.toggle('is-hidden', !shouldShow);
  wrap.classList.toggle('search-bar-visible', shouldShow);
  wrap.classList.toggle('mobile-search-visible', shouldShow);
  wrap.style.display = shouldShow ? 'block' : 'none';

  const results = document.getElementById('buchisapa-live-search-results');
  if (results) results.style.display = shouldShow ? 'block' : 'none';

  if (shouldShow) {
    const input = document.getElementById('main-search-input');
    if (input) requestAnimationFrame(() => input.focus());
  } else {
    ['main-search-input', 'desktop-search-input'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    if (results) results.replaceChildren();
  }
}

let buchisapaSearchProducts = null;
let buchisapaSearchLoadPromise = null;
function normalizeSearchName(value) {
  return String(value || '').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
async function getSearchProducts() {
  if (Array.isArray(buchisapaSearchProducts)) return buchisapaSearchProducts;
  if (buchisapaSearchLoadPromise) return buchisapaSearchLoadPromise;

  buchisapaSearchLoadPromise = (async () => {
    let products = [];
    for (const url of ['/api/products', '/datos/productos.json']) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const json = await response.json();
        const list = Array.isArray(json) ? json : (json.data || json.products || json.productos || []);
        if (Array.isArray(list) && list.length) {
          products = list;
          break;
        }
      } catch (_) {
        // Intentar la siguiente fuente disponible.
      }
    }

    buchisapaSearchProducts = products.filter(p => p && (p.name || p.nombre || p.title));
    return buchisapaSearchProducts;
  })().catch(() => {
    buchisapaSearchLoadPromise = null;
    return [];
  });

  return buchisapaSearchLoadPromise;
}

async function onSearchInputChanged(value) {
  const raw = String(value || '');
  const query = raw.trim();
  ['desktop-search-input', 'main-search-input'].forEach(id => {
    const input = document.getElementById(id);
    if (input && input.value !== raw) input.value = raw;
  });
  ['desktop-search-clear-btn', 'search-clear-btn'].forEach(id => {
    const button = document.getElementById(id);
    if (button) button.classList.toggle('is-hidden', !query);
  });

  const results = document.getElementById('buchisapa-live-search-results');
  if (!results) return;
  if (!query) {
    results.replaceChildren();
    return;
  }

  results.innerHTML = '<div class="search-results-message">Buscando productos…</div>';
  const products = await getSearchProducts();
  // No sobrescribir resultados de una búsqueda más reciente.
  const activeInput = document.activeElement;
  const latestQuery = activeInput && (activeInput.id === 'main-search-input' || activeInput.id === 'desktop-search-input')
    ? activeInput.value.trim() : query;
  if (normalizeSearchName(latestQuery) !== normalizeSearchName(query)) return;

  const normalizedQuery = normalizeSearchName(query);
  const matches = products.filter(product =>
    normalizeSearchName(product.name || product.nombre || product.title).includes(normalizedQuery)
  ).slice(0, 30);

  if (!matches.length) {
    results.innerHTML = '<div class="search-results-message">No encontramos productos con ese nombre.</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'search-results-list';
  const heading = document.createElement('div');
  heading.className = 'search-results-heading';
  heading.textContent = 'Resultados (' + matches.length + ')';
  results.replaceChildren(heading, list);

  matches.forEach(product => {
    const id = product.id || product.code || product.codigo || '';
    const name = product.name || product.nombre || product.title || 'Producto BuchiSapa';
    const link = document.createElement('a');
    link.className = 'search-result-item';
    link.href = '/producto?id=' + encodeURIComponent(id);
    const label = document.createElement('span');
    label.className = 'search-result-name';
    label.textContent = name;
    const arrow = document.createElement('span');
    arrow.className = 'search-result-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '›';
    link.append(label, arrow);
    list.appendChild(link);
  });
}

function clearSearchInput() {
  onSearchInputChanged('');
  const desktopInput = document.getElementById('desktop-search-input');
  const mobileInput = document.getElementById('main-search-input');
  if (desktopInput) desktopInput.focus();
  if (mobileInput) mobileInput.focus();
}

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (backdrop && (backdrop.classList.contains('active') || backdrop.classList.contains('open'))) {
      closeMobileDrawer();
    }
    if (typeof closeAllDesktopDropdowns === 'function') {
      closeAllDesktopDropdowns();
    }
  }
});

// GESTIÓN EXCLUSIVA DE DROPDOWNS DE ESCRITORIO (CATEGORÍAS Y CARTA SALÓN)
// Garantiza que NUNCA se abran ni superpongan dos menús simultáneamente
function closeAllDesktopDropdowns() {
  const wraps = document.querySelectorAll('.desktop-dropdown-wrap');
  wraps.forEach(wrap => {
    wrap.classList.remove('is-open');
    const btn = wrap.querySelector('.dropdown-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (document.activeElement && wrap.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  });
}

function initDesktopDropdowns() {
  const wraps = document.querySelectorAll('.desktop-dropdown-wrap');
  if (!wraps.length) return;

  wraps.forEach(wrap => {
    const trigger = wrap.querySelector('.dropdown-trigger');
    const menu = wrap.querySelector('.desktop-dropdown-menu');

    // Al entrar con el ratón a un dropdown, cerrar INMEDIATAMENTE todos los demás
    wrap.addEventListener('mouseenter', () => {
      wraps.forEach(other => {
        if (other !== wrap) {
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.dropdown-trigger');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (document.activeElement && other.contains(document.activeElement)) {
            document.activeElement.blur();
          }
        }
      });
      wrap.classList.add('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    });

    // Al salir con el ratón, cerrar este dropdown
    wrap.addEventListener('mouseleave', () => {
      wrap.classList.remove('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (document.activeElement && wrap.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });

    // Al hacer clic en el trigger: alternar y cerrar otros
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = wrap.classList.contains('is-open');
        closeAllDesktopDropdowns();
        if (!wasOpen) {
          wrap.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Al hacer clic en cualquier opción dentro del menú, cerrar todo
    if (menu) {
      menu.addEventListener('click', () => {
        closeAllDesktopDropdowns();
      });
    }
  });

  // Cerrar al hacer clic en cualquier parte fuera de los menús
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.desktop-dropdown-wrap')) {
      closeAllDesktopDropdowns();
    }
  });
}

function initEncabezadoEvents() {
  initDesktopDropdowns();

  // 1. Delegación de eventos para banners de categorías en el home
  const bannersContainer = document.getElementById('category-banners-section');
  if (bannersContainer) {
    bannersContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.category-banner-card');
      if (!card) return;
      const catId = card.dataset.category;
      const catTitle = card.dataset.title || card.getAttribute('title') || (catId ? catId.toUpperCase() : '');
      if (catId) {
        openCategoryView(catId, catTitle);
      }
    });
  }

  // 2. Botón volver en sección de búsqueda / resultados
  const exitSearchBtn = document.getElementById('btn-exit-search');
  if (exitSearchBtn) {
    exitSearchBtn.addEventListener('click', () => {
      if (typeof window.exitSearchMode === 'function') {
        window.exitSearchMode();
      }
    });
  }

  // 3. Dropdown de categorías del encabezado
  const catDropdownMenu = document.querySelector('#nav-dropdown-categorias .desktop-dropdown-menu');
  if (catDropdownMenu) {
    catDropdownMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      const catId = item.dataset.category;
      const catTitle = item.dataset.title || item.textContent.trim();
      if (catId) {
        openCategoryView(catId, catTitle);
      }
    });
  }

  // 4. Selector de ubicación en encabezado
  const locBtn = document.getElementById('btn-header-location') || document.querySelector('.location-picker-inline');
  if (locBtn) {
    locBtn.addEventListener('click', () => {
      if (typeof window.openLocationModal === 'function') {
        window.openLocationModal();
      }
    });
  }

  // 5. Botón menú hamburguesa
  const navToggleBtn = document.getElementById('btn-nav-toggle') || document.querySelector('.nav-toggle-btn');
  if (navToggleBtn) {
    navToggleBtn.addEventListener('click', () => toggleMobileMenu());
  }

  // 6. Botón Carta Completa
  const fullMenuBtn = document.getElementById('btn-header-full-menu');
  if (fullMenuBtn) {
    fullMenuBtn.addEventListener('click', () => {
      if (typeof window.openFullMenuModal === 'function') {
        window.openFullMenuModal();
      }
    });
  }

  // 7. Carrito en cabecera
  const cartBtn = document.getElementById('header-cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      if (window.BuchisapaCart && typeof window.BuchisapaCart.openDrawer === 'function') {
        window.BuchisapaCart.openDrawer();
      }
    });
  }

  // 8. Botón Autenticación / Perfil
  const authBtn = document.getElementById('header-auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      if (typeof window.handleUserIconClick === 'function') {
        window.handleUserIconClick();
      }
    });
  }

  // 9. Buscador: delegación para que funcione en index y subpáginas.
  ensureSearchUI();
  if (!document.documentElement.dataset.buchisapaSearchEvents) {
    document.documentElement.dataset.buchisapaSearchEvents = 'ready';

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const searchButton = target.closest('#header-search-btn, #subpage-search-btn, [data-action="open-search"]');
      if (searchButton) {
        event.preventDefault();
        toggleSearchBar();
        return;
      }
      if (target.closest('#search-close-action-btn')) {
        event.preventDefault();
        toggleSearchBar(false);
        return;
      }
      if (target.closest('#search-clear-btn, #desktop-search-clear-btn')) {
        event.preventDefault();
        clearSearchInput();
      }
    });

    document.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement &&
          (target.id === 'main-search-input' || target.id === 'desktop-search-input')) {
        onSearchInputChanged(target.value);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') toggleSearchBar(false);
    });
  }
}

// Inicializar al cargar el DOM o si ya está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEncabezadoEvents);
} else {
  initEncabezadoEvents();
}

// Exponer funciones en window para compatibilidad
window.toggleMobileMenu = toggleMobileMenu;
window.openMobileMenu = openMobileMenu;
window.closeMobileDrawer = closeMobileDrawer;
window.toggleNavCollapsible = toggleNavCollapsible;
window.openCategoryView = openCategoryView;
window.selectCategoryFromDrawer = selectCategoryFromDrawer;
window.goToPromociones = goToPromociones;
window.openCartFromDrawer = openCartFromDrawer;
window.toggleSearchBar = toggleSearchBar;
window.ensureSearchUI = ensureSearchUI;
window.onSearchInputChanged = onSearchInputChanged;
window.clearSearchInput = clearSearchInput;
window.initDesktopDropdowns = initDesktopDropdowns;
window.closeAllDesktopDropdowns = closeAllDesktopDropdowns;
window.initEncabezadoEvents = initEncabezadoEvents;
