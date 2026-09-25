/**
 * RESTAURANTE BUCHISAPA - Lógica Interactiva del Encabezado (public/js/encabezado.js)
 * Control del menú móvil, barra de búsqueda desplegable y sincronización de inputs
 */

function toggleMobileMenu() {
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (!backdrop) return;
  
  if (backdrop.classList.contains('active') || backdrop.style.display === 'flex') {
    backdrop.classList.remove('active');
    setTimeout(() => {
      if (!backdrop.classList.contains('active')) {
        backdrop.style.display = 'none';
      }
    }, 250);
    document.body.style.overflow = '';
  } else {
    backdrop.style.display = 'flex';
    void backdrop.offsetWidth;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function toggleSearchBar(forceState) {
  const wrap = document.getElementById('buchisapa-search-bar-wrap');
  if (!wrap) return;

  const shouldShow = typeof forceState === 'boolean' ? forceState : (wrap.style.display === 'none' || wrap.style.display === '');

  if (shouldShow) {
    wrap.style.display = 'block';
    const mobileInput = document.getElementById('main-search-input');
    if (mobileInput) {
      setTimeout(() => mobileInput.focus(), 100);
    }
  } else {
    wrap.style.display = 'none';
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

// Exponer funciones en window
window.toggleMobileMenu = toggleMobileMenu;
window.toggleSearchBar = toggleSearchBar;
window.onSearchInputChanged = onSearchInputChanged;
window.clearSearchInput = clearSearchInput;
