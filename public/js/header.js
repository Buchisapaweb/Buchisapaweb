/**
 * =========================================================
 * BUCHISAPA - LÓGICA DEL ENCABEZADO Y MENÚ MÓVIL (public/js/header.js)
 * Manejo unificado de navegación, drawer móvil, buscador y dropdowns
 * =========================================================
 */

(function() {
  if (!window.BuchisapaCart) {
    window.BuchisapaCart = {
      init: function() {},
      openDrawer: function() {},
      closeDrawer: function() {},
      clear: function() {},
      handleBackdropClick: function() {},
      addItem: function() {},
      getCount: function() { return 0; },
      getItemsCount: function() { return 0; }
    };
  }
  window.BuchisapaCart = window.BuchisapaCart;

  // 1. CONTROL DEL MENÚ LATERAL MÓVIL (DRAWER)
  function toggleMobileMenu(forceState) {
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (!backdrop) return;

    const isCurrentlyOpen = backdrop.classList.contains('active') || backdrop.classList.contains('open') || backdrop.style.display === 'flex';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (shouldOpen) {
      backdrop.style.display = 'flex';
      void backdrop.offsetWidth; // Forzar reflow para animación fluida
      backdrop.classList.add('active', 'open');
      document.body.style.overflow = 'hidden';

      // Sincronizar contador del carrito en drawer
      if (window.BuchisapaCart && typeof window.BuchisapaCart.getCount === 'function') {
        const countEl = document.getElementById('drawer-cart-count');
        if (countEl) {
          countEl.textContent = String(window.BuchisapaCart.getCount());
        }
      }
    } else {
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

  function closeMobileMenu() {
    toggleMobileMenu(false);
  }

  // 2. CONTROL DE ACORDEONES DENTRO DEL DRAWER MÓVIL
  function toggleNavCollapsible(collapsibleId) {
    const container = document.getElementById(collapsibleId);
    if (!container) return;
    container.classList.toggle('open');
  }

  // 3. NAVEGACIÓN A CATEGORÍAS
  function openCategoryView(catId, catTitle) {
    if (typeof closeAllDesktopDropdowns === 'function') {
      closeAllDesktopDropdowns();
    }
    if (typeof closeMobileDrawer === 'function') {
      closeMobileDrawer();
    }
    if (typeof window.closeProductDetailModal === 'function') {
      window.closeProductDetailModal();
    }

    // Si app.js ya cuenta con la función principal registrada
    if (window._appOpenCategoryView && typeof window._appOpenCategoryView === 'function') {
      window._appOpenCategoryView(catId, catTitle);
      return;
    }

    // Si estamos fuera de la página principal
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath !== '/' && !currentPath.endsWith('/index.html') && currentPath !== '') {
      window.location.href = '/?cat=' + encodeURIComponent(catId || 'all');
      return;
    }

    // Mostrar sección de resultados en la página principal
    const searchSec = document.getElementById('search-results-section');
    const catSec = document.getElementById('category-banners-section');
    const heroSec = document.querySelector('.hero-carousel-container');
    const titleWrap = document.getElementById('main-section-title-wrap');
    const titleEl = document.getElementById('search-view-title');

    if (searchSec) {
      searchSec.style.display = 'block';
      searchSec.classList.remove('is-hidden');
    }
    if (catSec) catSec.style.display = 'none';
    if (heroSec) heroSec.style.display = 'none';
    if (titleWrap) titleWrap.style.display = 'none';

    if (titleEl && (catTitle || catId)) {
      titleEl.textContent = (catTitle || catId).toUpperCase();
    }

    setTimeout(() => {
      if (searchSec) {
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 70;
        const rect = searchSec.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - headerHeight - 16;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  }

  function selectCategoryFromDrawer(catId, catName) {
    closeMobileDrawer();
    openCategoryView(catId, catName);
  }

  function goToPromociones() {
    closeMobileDrawer();
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

  // 4. BÚSQUEDA Y SINCRONIZACIÓN DE INPUTS (MÓVIL Y ESCRITORIO)
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
    
    const desktopInput = document.getElementById('desktop-search-input');
    const mobileInput = document.getElementById('main-search-input');
    
    if (desktopInput && desktopInput.value !== value) desktopInput.value = value;
    if (mobileInput && mobileInput.value !== value) mobileInput.value = value;

    const clearDesktopBtn = document.getElementById('desktop-search-clear-btn');
    const clearMobileBtn = document.getElementById('search-clear-btn');
    
    if (clearDesktopBtn) clearDesktopBtn.style.display = query.length > 0 ? 'flex' : 'none';
    if (clearMobileBtn) clearMobileBtn.style.display = query.length > 0 ? 'flex' : 'none';

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

  // 5. CONTROL EXCLUSIVO DE DROPDOWNS EN ESCRITORIO
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

      wrap.addEventListener('mouseenter', () => {
        wraps.forEach(other => {
          if (other !== wrap) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('.dropdown-trigger');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
        wrap.classList.add('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
      });

      wrap.addEventListener('mouseleave', () => {
        wrap.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });

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

      if (menu) {
        menu.addEventListener('click', () => {
          closeAllDesktopDropdowns();
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.desktop-dropdown-wrap')) {
        closeAllDesktopDropdowns();
      }
    });
  }

  // 6. TECLA ESCAPE
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const backdrop = document.getElementById('mobile-menu-backdrop');
      if (backdrop && (backdrop.classList.contains('active') || backdrop.classList.contains('open'))) {
        closeMobileDrawer();
      }
      closeAllDesktopDropdowns();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopDropdowns);
  } else {
    initDesktopDropdowns();
  }

  // 7. EXPOSICIÓN GLOBAL
  window.toggleMobileMenu = toggleMobileMenu;
  window.openMobileMenu = openMobileMenu;
  window.closeMobileDrawer = closeMobileDrawer;
  window.closeMobileMenu = closeMobileMenu;
  window.toggleNavCollapsible = toggleNavCollapsible;
  window.openCategoryView = openCategoryView;
  window.selectCategoryFromDrawer = selectCategoryFromDrawer;
  window.goToPromociones = goToPromociones;
  window.openCartFromDrawer = openCartFromDrawer;
  window.toggleSearchBar = toggleSearchBar;
  window.onSearchInputChanged = onSearchInputChanged;
  window.clearSearchInput = clearSearchInput;
  window.initDesktopDropdowns = initDesktopDropdowns;
  window.closeAllDesktopDropdowns = closeAllDesktopDropdowns;
})();
