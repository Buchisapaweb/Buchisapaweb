/**
 * RESTAURANTE BUCHISAPA - Lógica Interactiva del Encabezado & Menú Desplegable Móvil (public/js/encabezado.js)
 * Control del menú hamburguesa pantalla completa, búsqueda desplegable, acordeones y sincronización
 */

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

function selectCategoryFromDrawer(catId, catName) {
  closeMobileDrawer();
  if (typeof window.openCategoryView === 'function') {
    window.openCategoryView(catId, catName);
  } else {
    const el = document.getElementById('category-banners-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function goToPromociones() {
  closeMobileDrawer();
  if (typeof window.openCategoryView === 'function') {
    window.openCategoryView('combos', 'PROMOCIONES & COMBOS');
  } else {
    window.location.href = '/promociones.html';
  }
}

function openCartFromDrawer() {
  closeMobileDrawer();
  if (window.BuchisapaCart && typeof window.BuchisapaCart.openDrawer === 'function') {
    setTimeout(() => {
      window.BuchisapaCart.openDrawer();
    }, 150);
  }
}

function toggleSearchBar(forceState) {
  const wrap = document.getElementById('buchisapa-search-bar-wrap');
  if (!wrap) return;

  const shouldShow = typeof forceState === 'boolean' ? forceState : (wrap.style.display === 'none' || wrap.style.display === '');

  if (shouldShow) {
    wrap.style.display = 'block';
    wrap.classList.add('search-bar-visible', 'mobile-search-visible');
    const mobileInput = document.getElementById('main-search-input');
    if (mobileInput) {
      setTimeout(() => mobileInput.focus(), 100);
    }
  } else {
    wrap.style.display = 'none';
    wrap.classList.remove('search-bar-visible', 'mobile-search-visible');
  }
}

function onSearchInputChanged(value) {
  const query = (value || '').trim();
  
  // Sincronizar inputs
  const desktopInput = document.getElementById('desktop-search-input');
  const mobileInput = document.getElementById('main-search-input');
  
  if (desktopInput && desktopInput.value !== value) desktopInput.value = value;
  if (mobileInput && mobileInput.value !== value) mobileInput.value = value;

  // Botones de limpiar
  const clearDesktopBtn = document.getElementById('desktop-search-clear-btn');
  const clearMobileBtn = document.getElementById('search-clear-btn');
  
  if (clearDesktopBtn) clearDesktopBtn.style.display = query.length > 0 ? 'flex' : 'none';
  if (clearMobileBtn) clearMobileBtn.style.display = query.length > 0 ? 'flex' : 'none';

  // Ejecutar filtro global si existe la función handleSearchInput
  if (typeof window.handleSearchInput === 'function') {
    window.handleSearchInput(query);
  }
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
  }
});

// Exponer funciones en window para invocación desde HTML onclick
window.toggleMobileMenu = toggleMobileMenu;
window.openMobileMenu = openMobileMenu;
window.closeMobileDrawer = closeMobileDrawer;
window.toggleNavCollapsible = toggleNavCollapsible;
window.selectCategoryFromDrawer = selectCategoryFromDrawer;
window.goToPromociones = goToPromociones;
window.openCartFromDrawer = openCartFromDrawer;
window.toggleSearchBar = toggleSearchBar;
window.onSearchInputChanged = onSearchInputChanged;
window.clearSearchInput = clearSearchInput;
