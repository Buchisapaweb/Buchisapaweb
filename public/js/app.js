/**
 * RESTAURANTE BUCHISAPA - Lógica del Cliente (client/js/client-app.js)
 * Catálogo completo oficial, búsqueda interactiva, filtrado de categorías y checkout
 */

let currentProducts = [];
let allMenuProducts = [];
let currentCategory = 'all';
let currentSlideIndex = 0;
let carouselInterval = null;
let isSearchMode = false;

function getAllProducts() {
  if (Array.isArray(window.allMenuProducts) && window.allMenuProducts.length > 0) return window.allMenuProducts;
  if (Array.isArray(allMenuProducts) && allMenuProducts.length > 0) return allMenuProducts;
  if (Array.isArray(window.currentProducts) && window.currentProducts.length > 0) return window.currentProducts;
  if (Array.isArray(currentProducts) && currentProducts.length > 0) return currentProducts;
  if (typeof getFallbackProducts === 'function') return getFallbackProducts();
  return [];
}

// Variables globales de ubicación y geolocalización (inicializadas al inicio para evitar TDZ)
let locMap = null;
let locMarker = null;
let currentCoords = { lat: -12.01635, lng: -76.88455 }; // Santa Clara / Ate (Lima)
let locPrecision = 'precise';
let isLocDetecting = false;
let reverseGeocodeTimeout = null;
let liveGeolocationWatchId = null;
let lastKnownClientPos = null;
let hasLiveClientGpsSignal = false;
const clientAppGeocodeCache = new Map();

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Inicializar sistema de Carga Diferida (Lazy Loading) de Banners e Imágenes
  initLazyLoadingObserver();

  // 2. Inicializar carrito
  if (window.BuchisapaCart) {
    window.BuchisapaCart.init();
  }

  // 3. Inicializar estado de autenticación en navbar
  updateNavbarUserAuth();

  // 4. Inicializar Carousel Hero
  initHeroCarousel();

  // 5. Cargar catálogo de platos
  await loadCatalog();

  // 6. Iniciar rastreo de geolocalización en tiempo real de alta precisión
  startLiveGeolocationWatch();
  updateSelectedLocationHeader();

  // 7. Si la URL incluye /ubicacion o parámetro ?ubicacion, abrir modal automáticamente
  try {
    const isUbicacionRoute = window.location.pathname.includes('ubicacion') || 
                             new URLSearchParams(window.location.search).has('ubicacion') ||
                             window.location.hash.includes('ubicacion');
    if (isUbicacionRoute) {
      setTimeout(() => openLocationModal(), 150);
    }
  } catch (e) {}

  // 8. Inicializar Gestos Táctiles (Swipe) en Carrusel Móvil
  initCarouselTouchGestures();

  // 10. Inicializar Banner de Pedido Activo si existe
  initActiveOrderTrackerBanner();

  // 11. Registrar Service Worker para PWA
  registerServiceWorker();
});

/**
 * SISTEMA DE CARGA DIFERIDA (LAZY LOADING) DE BANNERS E IMÁGENES
 * Optimiza la carga inicial difiriendo imágenes de productos y banners fuera de pantalla.
 */
function initLazyLoadingObserver() {
  if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          
          if (el.dataset.bg) {
            el.style.backgroundImage = el.dataset.bg;
            el.removeAttribute('data-bg');
            el.classList.add('bg-loaded');
          }
          
          if (el.dataset.src) {
            el.src = el.dataset.src;
            el.removeAttribute('data-src');
          }

          observer.unobserve(el);
        }
      });
    }, {
      rootMargin: '250px 0px',
      threshold: 0.01
    });

    const observeElements = () => {
      document.querySelectorAll('.lazy-bg[data-bg], img.lazy-img[data-src]').forEach(el => {
        lazyObserver.observe(el);
      });
    };

    observeElements();

    // Re-observar ante renderizados dinámicos
    const mutationObs = new MutationObserver(() => {
      observeElements();
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });
  } else {
    // Fallback directo
    document.querySelectorAll('.lazy-bg[data-bg]').forEach(el => {
      el.style.backgroundImage = el.dataset.bg;
      el.removeAttribute('data-bg');
      el.classList.add('bg-loaded');
    });
  }
}

/* =========================================================
   HERO CAROUSEL LOGIC
   ========================================================= */
async function initHeroCarousel() {
  try {
    const res = await fetch('/api/portadas');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        renderDynamicHeroCarousel(json.data);
      }
    }
  } catch (err) {
    console.warn('Usando banners estáticos de portada:', err);
  }
  startAutoPlay();
}

function renderDynamicHeroCarousel(portadas) {
  const track = document.getElementById('hero-carousel-track');
  const dotsContainer = document.getElementById('carousel-dots-container');
  if (!track || !dotsContainer || !Array.isArray(portadas) || portadas.length === 0) return;

  function safeStr(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  track.innerHTML = portadas.map((p, idx) => {
    const bg = p.image || `/imagenes/portada/portada-${(idx % 4) + 1}.jpg`;
    const isFirst = idx === 0;
    const activeClass = isFirst ? 'active' : '';
    const bgStyle = `style="background-image: url('${bg}');"`;

    return `
      <div class="carousel-slide ${activeClass}" ${bgStyle}>
        <img src="${safeStr(bg)}" alt="Portada BuchiSapa" class="carousel-slide-img" loading="${isFirst ? 'eager' : 'lazy'}" decoding="async">
      </div>
    `;
  }).join('');

  dotsContainer.innerHTML = portadas.map((_, idx) => `
    <span class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})"></span>
  `).join('');

  currentSlideIndex = 0;
  updateCarouselView();
}

function startAutoPlay() {
  stopAutoPlay();
  carouselInterval = setInterval(() => {
    moveCarousel(1);
  }, 5000);
}

function stopAutoPlay() {
  if (carouselInterval) clearInterval(carouselInterval);
}

function moveCarousel(direction) {
  const track = document.getElementById('hero-carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  if (!track || slides.length === 0) return;

  currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
  updateCarouselView();
  startAutoPlay();
}

function goToSlide(index) {
  currentSlideIndex = index;
  updateCarouselView();
  startAutoPlay();
}

function updateCarouselView() {
  const track = document.getElementById('hero-carousel-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const slides = document.querySelectorAll('.carousel-slide');
  if (!track) return;

  track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

  if (slides[currentSlideIndex]) {
    const activeSlide = slides[currentSlideIndex];
    if (activeSlide.dataset.bg) {
      activeSlide.style.backgroundImage = activeSlide.dataset.bg;
      activeSlide.removeAttribute('data-bg');
      activeSlide.classList.add('bg-loaded');
    }
  }

  dots.forEach((dot, idx) => {
    if (idx === currentSlideIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

/**
 * GESTOS TÁCTILES Y CONTROL INTERACTIVO DE SLIDES HERO
 */
function initCarouselTouchGestures() {
  const container = document.querySelector('.hero-carousel-container');
  if (!container) return;

  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          moveCarousel(1); // Deslizar hacia la izquierda -> siguiente
        } else {
          moveCarousel(-1); // Deslizar hacia la derecha -> anterior
        }
      } else {
        startAutoPlay();
      }
    }
  }, { passive: true });

  container.addEventListener('mouseenter', () => stopAutoPlay());
  container.addEventListener('mouseleave', () => startAutoPlay());
}


/**
 * BANNER FLOTANTE DE PEDIDO EN CURSO
 */
function initActiveOrderTrackerBanner() {
  try {
    const saved = localStorage.getItem('buchisapa_last_order');
    if (!saved) return;
    const order = JSON.parse(saved);
    if (!order || !order.id) return;

    // Verificar que sea de las últimas 3 horas
    const orderTime = new Date(order.createdAt || order.timestamp || Date.now()).getTime();
    if (Date.now() - orderTime > 3 * 3600000) return;

    let banner = document.getElementById('active-order-floating-bar');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'active-order-floating-bar';
      banner.className = 'active-order-floating-bar';
      document.body.appendChild(banner);
    }

    banner.innerHTML = `
      <div class="active-order-content">
        <div class="active-order-pulse">🛵</div>
        <div class="active-order-info">
          <span class="active-order-title">Pedido #${order.id} en curso</span>
          <span class="active-order-meta">Estado: ${order.status || 'En preparación'}</span>
        </div>
        <a href="/order-status.html?id=${order.id}" class="active-order-btn">Rastrear GPS</a>
      </div>
    `;
    banner.style.display = 'block';
  } catch (e) {}
}

/**
 * REGISTRO DE SERVICE WORKER PARA CAPACIDADES PWA
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ ServiceWorker Buchisapa registrado:', reg.scope);
      })
      .catch(() => {
        // Silencioso en caso de no soportado o bloqueado
      });
  }
}

/* =========================================================
   MENÚ MOBILE (DRAWER ESTILO BUCHISAPA BURGER) & UBICACIÓN
   ========================================================= */
function closeMobileMenu() {
  const drawer = document.getElementById('mobile-menu-backdrop');
  if (drawer) {
    drawer.classList.remove('active', 'open');
    document.body.style.overflow = '';
  }
}

function closeMobileDrawer() {
  closeMobileMenu();
}

function toggleMobileMenu() {
  const drawer = document.getElementById('mobile-menu-backdrop');
  if (drawer) {
    const isOpen = drawer.classList.contains('active') || drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('active', 'open');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('active', 'open');
      document.body.style.overflow = 'hidden';
    }
  }
}

// Exponer globalmente para eventos onclick en HTML
window.closeMobileMenu = closeMobileMenu;
window.closeMobileDrawer = closeMobileDrawer;
window.toggleMobileMenu = toggleMobileMenu;

function toggleNavCollapsible(collapsibleId) {
  const element = document.getElementById(collapsibleId);
  if (element) {
    element.classList.toggle('open');
  }
}

function goToPromociones() {
  closeMobileMenu();
  const carousel = document.querySelector('.hero-carousel-container');
  if (carousel) {
    carousel.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function selectCategoryFromDrawer(categoryId, categoryTitle) {
  closeMobileMenu();
  openCategoryView(categoryId, categoryTitle);
}

function openCartFromDrawer() {
  closeMobileMenu();
  if (window.BuchisapaCart && typeof window.BuchisapaCart.openDrawer === 'function') {
    window.BuchisapaCart.openDrawer();
  }
}

function openLoginModal(viewName = 'login') {
  closeMobileMenu();
  const modal = document.getElementById('login-modal');
  if (modal) {
    switchAuthView(viewName);
    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('active', 'open');
    document.body.style.overflow = 'hidden';

    // Pre-cargar correo o datos si ya existen en localStorage
    const savedCustomer = localStorage.getItem('buchisapa_customer');
    if (savedCustomer) {
      try {
        const data = JSON.parse(savedCustomer);
        const emailInput = document.getElementById('auth-login-email');
        if (emailInput && data.email) {
          emailInput.value = data.email;
          checkAuthFormReady('login');
        }
      } catch (e) {}
    }
  }
}

function openRegisterModal() {
  openLoginModal('register');
}

function closeLoginModal(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('auth-close-btn-top') && !e.target.closest('.auth-close-btn-top') && !e.target.closest('.auth-window-back-btn')) {
    return;
  }
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('active', 'open');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

let currentAuthView = 'login';
let currentProfileSubTab = 'data';
let currentProfileScreen = 'main';

function handleAuthBackNav() {
  if (currentAuthView === 'profile') {
    if (currentProfileScreen !== 'main') {
      switchProfileScreen('main');
      return;
    }
    closeLoginModal();
    return;
  }
  if (currentAuthView === 'register' || currentAuthView === 'recovery') {
    switchAuthView('login');
  } else {
    closeLoginModal();
  }
}

function switchAuthView(viewName) {
  currentAuthView = viewName;
  const loginView = document.getElementById('auth-view-login');
  const registerView = document.getElementById('auth-view-register');
  const recoveryView = document.getElementById('auth-view-recovery');
  const profileView = document.getElementById('auth-view-profile');
  const topbarTitle = document.getElementById('auth-topbar-title');
  const backBtnText = document.getElementById('auth-back-btn-text');

  if (loginView) loginView.style.display = viewName === 'login' ? 'block' : 'none';
  if (registerView) registerView.style.display = viewName === 'register' ? 'block' : 'none';
  if (recoveryView) recoveryView.style.display = viewName === 'recovery' ? 'block' : 'none';
  if (profileView) profileView.style.display = viewName === 'profile' ? 'block' : 'none';

  if (viewName === 'profile') {
    if (topbarTitle) topbarTitle.style.display = 'block';
  } else {
    if (topbarTitle) {
      topbarTitle.style.display = 'none';
      topbarTitle.textContent = '';
    }
    if (backBtnText) backBtnText.textContent = 'Volver';
  }

  // Limpiar alertas
  ['auth-login-alert', 'auth-register-alert', 'auth-recovery-alert', 'profile-edit-alert'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.textContent = '';
      el.className = 'auth-status-alert';
    }
  });

  if (viewName === 'register') {
    resetRegisterFormValidation();
    checkRegisterFormReady();
  } else if (viewName === 'login') {
    checkAuthFormReady('login');
  }
}

function resetRegisterFormValidation() {
  const fieldIds = [
    'reg-doc-number',
    'reg-firstname',
    'reg-lastname',
    'reg-email',
    'reg-phone',
    'reg-password',
    'reg-password-confirm'
  ];

  fieldIds.forEach(id => {
    const input = document.getElementById(id);
    const icon = document.getElementById(`status-icon-${id}`);
    const feedback = document.getElementById(`feedback-${id}`);

    if (input) {
      input.classList.remove('is-valid', 'is-invalid');
    }
    if (icon) {
      icon.classList.remove('is-valid', 'is-invalid');
    }
    if (feedback) {
      feedback.classList.remove('is-valid', 'is-invalid');
      feedback.textContent = '';
    }
  });
}

function onRegisterDocTypeChange() {
  const docType = document.getElementById('reg-doc-type')?.value || 'DNI';
  const docInput = document.getElementById('reg-doc-number');
  if (docInput) {
    if (docType === 'DNI') {
      docInput.setAttribute('placeholder', '8 dígitos');
      docInput.setAttribute('maxlength', '8');
      docInput.setAttribute('inputmode', 'numeric');
    } else if (docType === 'RUC') {
      docInput.setAttribute('placeholder', '11 dígitos');
      docInput.setAttribute('maxlength', '11');
      docInput.setAttribute('inputmode', 'numeric');
    } else if (docType === 'CE') {
      docInput.setAttribute('placeholder', '8 a 12 caracteres');
      docInput.setAttribute('maxlength', '12');
      docInput.removeAttribute('inputmode');
    } else if (docType === 'Pasaporte') {
      docInput.setAttribute('placeholder', '6 a 12 caracteres');
      docInput.setAttribute('maxlength', '12');
      docInput.removeAttribute('inputmode');
    }

    if (docInput.value.trim().length > 0) {
      handleFieldValidation('reg-doc-number', true);
    }
  }
  checkRegisterFormReady();
}

function handleFieldValidation(fieldId, isBlur = false) {
  const input = document.getElementById(fieldId);
  const icon = document.getElementById(`status-icon-${fieldId}`);
  const feedback = document.getElementById(`feedback-${fieldId}`);
  if (!input) return;

  const rawVal = input.value;
  const val = rawVal.trim();

  // Si el campo está vacío y no es blur forzado, mantener estado limpio
  if (val.length === 0 && !isBlur) {
    input.classList.remove('is-valid', 'is-invalid');
    if (icon) icon.classList.remove('is-valid', 'is-invalid');
    if (feedback) {
      feedback.classList.remove('is-valid', 'is-invalid');
      feedback.textContent = '';
    }
    checkRegisterFormReady();
    return;
  }

  let isValid = false;
  let message = '';

  switch (fieldId) {
    case 'reg-doc-number': {
      const docType = document.getElementById('reg-doc-type')?.value || 'DNI';
      if (docType === 'DNI') {
        // Solo 8 números
        const isDigits = /^\d+$/.test(val);
        if (!isDigits) {
          isValid = false;
          message = 'El DNI debe contener solo números.';
        } else if (val.length !== 8) {
          isValid = false;
          message = `Faltan ${8 - val.length} dígito(s) (debe tener 8).`;
        } else {
          isValid = true;
          message = '✓ DNI válido (8 dígitos)';
        }
      } else if (docType === 'RUC') {
        const isDigits = /^\d+$/.test(val);
        if (!isDigits) {
          isValid = false;
          message = 'El RUC debe contener solo números.';
        } else if (val.length !== 11) {
          isValid = false;
          message = `El RUC debe tener 11 dígitos (${val.length}/11).`;
        } else {
          isValid = true;
          message = '✓ RUC válido (11 dígitos)';
        }
      } else if (docType === 'CE') {
        if (/^[A-Za-z0-9]{8,12}$/.test(val)) {
          isValid = true;
          message = '✓ Carné de extranjería válido';
        } else {
          isValid = false;
          message = 'El CE debe tener entre 8 y 12 caracteres alfanuméricos.';
        }
      } else if (docType === 'Pasaporte') {
        if (/^[A-Za-z0-9]{6,12}$/.test(val)) {
          isValid = true;
          message = '✓ Pasaporte válido';
        } else {
          isValid = false;
          message = 'El Pasaporte debe tener entre 6 y 12 caracteres.';
        }
      }
      break;
    }

    case 'reg-firstname': {
      if (val.length === 0) {
        isValid = false;
        message = 'Ingresa tus nombres.';
      } else if (val.length < 2) {
        isValid = false;
        message = 'El nombre debe tener al menos 2 letras.';
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val)) {
        isValid = false;
        message = 'El nombre no debe contener números ni símbolos especiales.';
      } else {
        isValid = true;
        message = '✓ Nombres válidos';
      }
      break;
    }

    case 'reg-lastname': {
      if (val.length === 0) {
        isValid = false;
        message = 'Ingresa tus apellidos.';
      } else if (val.length < 2) {
        isValid = false;
        message = 'Los apellidos deben tener al menos 2 letras.';
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val)) {
        isValid = false;
        message = 'Los apellidos no deben contener números ni símbolos.';
      } else {
        isValid = true;
        message = '✓ Apellidos válidos';
      }
      break;
    }

    case 'reg-email': {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (val.length === 0) {
        isValid = false;
        message = 'Ingresa un correo electrónico.';
      } else if (!val.includes('@')) {
        isValid = false;
        message = 'El correo debe incluir un "@" (ej. usuario@gmail.com).';
      } else if (!emailRegex.test(val)) {
        isValid = false;
        message = 'Formato de correo incompleto o inválido.';
      } else {
        isValid = true;
        message = '✓ Correo electrónico válido';
      }
      break;
    }

    case 'reg-phone': {
      const cleanPhone = val.replace(/\s+/g, '');
      const isDigits = /^\d+$/.test(cleanPhone);
      if (cleanPhone.length === 0) {
        isValid = false;
        message = 'Ingresa tu número de celular.';
      } else if (!isDigits) {
        isValid = false;
        message = 'Solo se permiten números.';
      } else if (cleanPhone.length < 9) {
        isValid = false;
        message = `Faltan ${9 - cleanPhone.length} dígito(s) (debe tener 9).`;
      } else if (cleanPhone.length === 9) {
        isValid = true;
        message = '✓ Celular válido (9 dígitos)';
      } else {
        isValid = false;
        message = 'El celular no debe exceder 9 dígitos.';
      }
      break;
    }

    case 'reg-password': {
      if (rawVal.length === 0) {
        isValid = false;
        message = 'Ingresa una contraseña.';
      } else if (rawVal.length < 6) {
        isValid = false;
        message = `Contraseña muy corta (mínimo 6 caracteres, llevas ${rawVal.length}).`;
      } else {
        isValid = true;
        if (rawVal.length >= 8 && /[A-Z]/.test(rawVal) && /[0-9]/.test(rawVal)) {
          message = '✓ Contraseña muy segura';
        } else if (rawVal.length >= 8 || /[0-9]/.test(rawVal)) {
          message = '✓ Contraseña buena';
        } else {
          message = '✓ Contraseña válida (mín. 6 caracteres)';
        }
      }

      // Revalidar confirmación si el usuario ya escribió algo en ella
      const confirmInput = document.getElementById('reg-password-confirm');
      if (confirmInput && confirmInput.value.length > 0) {
        handleFieldValidation('reg-password-confirm', false);
      }
      break;
    }

    case 'reg-password-confirm': {
      const passVal = document.getElementById('reg-password')?.value || '';
      if (rawVal.length === 0) {
        isValid = false;
        message = 'Repite tu contraseña.';
      } else if (rawVal !== passVal) {
        isValid = false;
        message = '✕ Las contraseñas no coinciden.';
      } else if (rawVal.length < 6) {
        isValid = false;
        message = 'Debe tener al menos 6 caracteres.';
      } else {
        isValid = true;
        message = '✓ ¡Las contraseñas coinciden!';
      }
      break;
    }
  }

  // Aplicar clases visuales al input
  if (isValid) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
  }

  // Aplicar clases al icono
  if (icon) {
    if (isValid) {
      icon.classList.add('is-valid');
      icon.classList.remove('is-invalid');
    } else {
      icon.classList.add('is-invalid');
      icon.classList.remove('is-valid');
    }
  }

  // Aplicar clases y texto al feedback
  if (feedback) {
    feedback.textContent = message;
    if (isValid) {
      feedback.classList.add('is-valid');
      feedback.classList.remove('is-invalid');
    } else {
      feedback.classList.add('is-invalid');
      feedback.classList.remove('is-valid');
    }
  }

  checkRegisterFormReady();
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.getAttribute('type') === 'password';
  input.setAttribute('type', isPassword ? 'text' : 'password');

  if (btnEl) {
    if (isPassword) {
      btnEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
          <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>`;
      btnEl.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
      btnEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>`;
      btnEl.setAttribute('aria-label', 'Mostrar contraseña');
    }
  }
}

function checkAuthFormReady(formType) {
  if (formType === 'login') {
    const email = document.getElementById('auth-login-email')?.value?.trim();
    const pass = document.getElementById('auth-login-password')?.value?.trim();
    const submitBtn = document.getElementById('auth-submit-btn-login');
    if (submitBtn) {
      if (email && pass && pass.length >= 3) {
        submitBtn.classList.add('ready');
      } else {
        submitBtn.classList.remove('ready');
      }
    }
  }
}

function checkRegisterFormReady() {
  const docType = document.getElementById('reg-doc-type')?.value || 'DNI';
  const docNumber = document.getElementById('reg-doc-number')?.value?.trim();
  const firstName = document.getElementById('reg-firstname')?.value?.trim();
  const lastName = document.getElementById('reg-lastname')?.value?.trim();
  const email = document.getElementById('reg-email')?.value?.trim();
  const phone = document.getElementById('reg-phone')?.value?.trim().replace(/\s+/g, '');
  const pass = document.getElementById('reg-password')?.value;
  const passConfirm = document.getElementById('reg-password-confirm')?.value;
  const termsChecked = document.getElementById('reg-terms')?.checked;
  const submitBtn = document.getElementById('reg-submit-btn');

  let isDocValid = false;
  if (docType === 'DNI') {
    isDocValid = !!(docNumber && /^\d{8}$/.test(docNumber));
  } else if (docType === 'RUC') {
    isDocValid = !!(docNumber && /^\d{11}$/.test(docNumber));
  } else if (docType === 'CE') {
    isDocValid = !!(docNumber && /^[A-Za-z0-9]{8,12}$/.test(docNumber));
  } else if (docType === 'Pasaporte') {
    isDocValid = !!(docNumber && /^[A-Za-z0-9]{6,12}$/.test(docNumber));
  }

  const isNameValid = !!(firstName && firstName.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(firstName));
  const isLastNameValid = !!(lastName && lastName.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(lastName));
  const isEmailValid = !!(email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email));
  const isPhoneValid = !!(phone && phone.length === 9 && /^\d{9}$/.test(phone));
  const isPassValid = !!(pass && pass.length >= 6);
  const isPassMatchValid = !!(passConfirm && passConfirm.length >= 6 && pass === passConfirm);

  const isValid = !!(
    isDocValid &&
    isNameValid &&
    isLastNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isPassValid &&
    isPassMatchValid &&
    termsChecked
  );

  if (submitBtn) {
    submitBtn.disabled = !isValid;
    if (isValid) {
      submitBtn.classList.add('ready');
    } else {
      submitBtn.classList.remove('ready');
    }
  }
  return isValid;
}

function isUserAdmin(email, role) {
  return false;
}

async function handleAuthLoginSubmit(event) {
  if (event && event.preventDefault) event.preventDefault();
  const emailInput = document.getElementById('auth-login-email');
  const passInput = document.getElementById('auth-login-password');
  const email = emailInput?.value?.trim() || '';
  const password = passInput?.value?.trim() || '';
  const alertEl = document.getElementById('auth-login-alert');
  const submitBtn = document.getElementById('auth-submit-btn-login');

  const showCustomError = (msg) => {
    if (!alertEl) return;
    alertEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <svg style="flex-shrink: 0;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#be123c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>${msg}</span>
      </div>
    `;
    alertEl.className = 'auth-status-alert error';
    alertEl.style.display = 'block';
  };

  const showCustomSuccess = (msg) => {
    if (!alertEl) return;
    alertEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <svg style="flex-shrink: 0;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>${msg}</span>
      </div>
    `;
    alertEl.className = 'auth-status-alert success';
    alertEl.style.display = 'block';
  };

  if (!email) {
    showCustomError('Por favor, ingresa tu correo electrónico.');
    if (emailInput) emailInput.focus();
    return;
  }

  if (!password) {
    showCustomError('Por favor, ingresa tu contraseña.');
    if (passInput) passInput.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando sesión...';
  }

  try {
    // Autenticación ultra rápida en paralelo (el que responda primero con éxito)
    const sbAuthPromise = (async () => {
      if (window.BuchisapaAPI && typeof window.BuchisapaAPI.loginAuth === 'function') {
        const res = await window.BuchisapaAPI.loginAuth(email, password);
        if (res && res.success) return res;
      }
      throw new Error('Supabase direct unavailable');
    })();

    const backendAuthPromise = (async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) return data;
      const errMsg = data?.error || data?.message || 'El correo electrónico o la contraseña ingresados no son correctos.';
      throw new Error(errMsg);
    })();

    try {
      result = await Promise.any([sbAuthPromise, backendAuthPromise]);
    } catch (aggregateErr) {
      // Si ambos fallaron, capturar error real
      try {
        result = await backendAuthPromise;
      } catch (err) {
        throw err;
      }
    }

    if (!result || !result.success) {
      throw new Error('El correo electrónico o la contraseña ingresados no son correctos.');
    }

    const user = result.user || result.data;
    const token = result.token || `token-${Date.now()}`;

    // Si el usuario es administrador validado por Supabase o por el servidor
    if (user.role === 'admin' || user.isAdmin === true || result.isAdmin === true) {
      localStorage.setItem('buchisapa_admin_token', token);
      sessionStorage.setItem('buchisapa_admin_session', JSON.stringify(user));
      localStorage.setItem('buchisapa_customer', JSON.stringify(user));

      showCustomSuccess('¡Acceso verificado! Ingresando...');
      // Redirección instantánea sin demoras artificiales
      window.location.href = '/admin';
      return;
    }

    // Si es un cliente regular
    localStorage.setItem('buchisapa_customer', JSON.stringify(user));
    closeLoginModal();
    if (typeof updateNavbarUserAuth === 'function') {
      updateNavbarUserAuth();
    }
    if (typeof showToast === 'function') {
      showToast(`¡Bienvenido, ${user.firstName || user.name || 'Cliente'}!`);
    }

  } catch (err) {
    console.error('Error en login:', err);
    let userFriendlyMsg = err.message || 'El correo electrónico o la contraseña ingresados no son válidos.';
    if (userFriendlyMsg.includes('Unexpected') || userFriendlyMsg.includes('JSON') || userFriendlyMsg.includes('doctype') || userFriendlyMsg.includes('SyntaxError') || userFriendlyMsg.includes('Fetch')) {
      userFriendlyMsg = 'El correo electrónico o la contraseña ingresados no son correctos. Por favor, verifica e inténtalo nuevamente.';
    }
    showCustomError(userFriendlyMsg);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ingresar';
    }
  }
}

async function handleAuthRegisterSubmit(event) {
  event.preventDefault();
  const alertEl = document.getElementById('auth-register-alert');
  const submitBtn = document.getElementById('reg-submit-btn');

  // Forzar validación visual en todos los campos requeridos
  const fields = [
    'reg-doc-number',
    'reg-firstname',
    'reg-lastname',
    'reg-email',
    'reg-phone',
    'reg-password',
    'reg-password-confirm'
  ];
  fields.forEach(f => handleFieldValidation(f, true));

  const isFormValid = checkRegisterFormReady();
  if (!isFormValid) {
    if (alertEl) {
      alertEl.textContent = 'Por favor revisa los campos señalados en rojo antes de continuar.';
      alertEl.className = 'auth-status-alert error';
      alertEl.style.display = 'block';
    }
    return;
  }

  const docType = document.getElementById('reg-doc-type')?.value || 'DNI';
  const docNumber = document.getElementById('reg-doc-number')?.value?.trim();
  const firstName = document.getElementById('reg-firstname')?.value?.trim();
  const lastName = document.getElementById('reg-lastname')?.value?.trim();
  const email = document.getElementById('reg-email')?.value?.trim();
  const phone = document.getElementById('reg-phone')?.value?.trim();
  const birthDate = document.getElementById('reg-birthdate')?.value || '';
  const password = document.getElementById('reg-password')?.value;
  const passwordConfirm = document.getElementById('reg-password-confirm')?.value;
  const termsAccepted = document.getElementById('reg-terms')?.checked;
  const marketingAccepted = document.getElementById('reg-marketing')?.checked;

  if (password !== passwordConfirm) {
    if (alertEl) {
      alertEl.textContent = 'Las contraseñas no coinciden. Por favor verifica.';
      alertEl.className = 'auth-status-alert error';
      alertEl.style.display = 'block';
    }
    return;
  }

  if (!termsAccepted) {
    if (alertEl) {
      alertEl.textContent = 'Debes aceptar los Términos y Condiciones y Políticas de Privacidad.';
      alertEl.className = 'auth-status-alert error';
      alertEl.style.display = 'block';
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando código...';
  }

  try {
    const payload = {
      docType,
      docNumber,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      birthDate,
      password,
      marketingAccepted,
      authProvider: 'local',
      isRegister: true
    };

    // Solicitar código de verificación de 6 dígitos al correo
    await requestOtpVerificationAndOpenModal(email, payload);

  } catch (err) {
    console.error('Error in register submit:', err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crear cuenta';
    }
  }
}

function handleAuthRecoverySubmit(event) {
  event.preventDefault();
  const email = document.getElementById('auth-rec-email')?.value?.trim();
  const alertEl = document.getElementById('auth-recovery-alert');

  if (alertEl) {
    alertEl.textContent = `✓ Te enviamos un enlace de recuperación a ${email || 'tu correo'}.`;
    alertEl.className = 'auth-status-alert success';
    alertEl.style.display = 'block';
  }

  setTimeout(() => {
    switchAuthView('login');
  }, 2200);
}

function continueAsGuest() {
  const current = localStorage.getItem('buchisapa_customer');
  if (!current) {
    localStorage.setItem('buchisapa_customer', JSON.stringify({
      name: 'Invitado',
      guest: true,
      updatedAt: new Date().toISOString()
    }));
  }
  closeLoginModal();
}

/* =========================================================
   AUTENTICACIÓN GOOGLE REAL (GIS + GOOGLE CLOUD AUTH)
   ========================================================= */

function parseJwtToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function handleGoogleCredentialResponse(response) {
  if (response && response.credential) {
    const payload = parseJwtToken(response.credential);
    if (payload && payload.email) {
      const name = payload.name || payload.given_name || payload.email.split('@')[0];
      const avatar = payload.picture || '';
      const googleUid = payload.sub || '';
      selectGoogleAccount(name, payload.email, '', avatar, googleUid);
    }
  }
}

function initGoogleIdentityServices() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    try {
      const clientId = window.GOOGLE_CLIENT_ID || '953347930157-111mqqngt4hq55dgco230jk1bvcba8fa.apps.googleusercontent.com';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const wrapper = document.getElementById('g_id_signin_wrapper');
      if (wrapper) {
        wrapper.innerHTML = '';
        window.google.accounts.id.renderButton(wrapper, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          locale: 'es',
          width: 280
        });
      }
    } catch (e) {
      console.warn('GIS init notice:', e);
    }
  }
}

// Inicializar GIS cuando la página cargue
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initGoogleIdentityServices, 1000));
} else {
  setTimeout(initGoogleIdentityServices, 1000);
}

function getDeviceGoogleAccounts() {
  try {
    const data = localStorage.getItem('buchisapa_device_google_accounts');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveDeviceGoogleAccount(account) {
  try {
    let list = getDeviceGoogleAccounts();
    list = list.filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    list.unshift(account);
    if (list.length > 5) list = list.slice(0, 5);
    localStorage.setItem('buchisapa_device_google_accounts', JSON.stringify(list));
  } catch (e) {}
}

function removeDeviceGoogleAccount(email, e) {
  if (e) e.stopPropagation();
  try {
    let list = getDeviceGoogleAccounts();
    list = list.filter(a => a.email.toLowerCase() !== (email || '').toLowerCase());
    localStorage.setItem('buchisapa_device_google_accounts', JSON.stringify(list));
    renderDeviceGoogleAccounts();
  } catch (err) {}
}

function renderDeviceGoogleAccounts() {
  const section = document.getElementById('google-device-accounts-section');
  const container = document.getElementById('google-accounts-list');
  if (!section || !container) return;

  const accounts = getDeviceGoogleAccounts();
  if (accounts.length === 0) {
    section.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = accounts.map(acc => {
    const initial = (acc.name || acc.email || 'G').charAt(0).toUpperCase();
    const safeName = (acc.name || acc.email.split('@')[0]).replace(/'/g, "\\'");
    const safeEmail = acc.email.replace(/'/g, "\\'");
    
    return `
      <div class="google-account-item-wrapper" style="position: relative; display: flex; align-items: center; width: 100%;">
        <button type="button" class="google-account-item-btn" onclick="selectGoogleAccount('${safeName}', '${safeEmail}', '${acc.docNumber || ''}', '${acc.avatar || ''}', '${acc.googleUid || ''}')">
          <div class="google-avatar-circle" style="background: #1a73e8; color: #fff; font-weight: 800;">${initial}</div>
          <div class="google-account-details">
            <div class="google-account-name">${acc.name || acc.email.split('@')[0]}</div>
            <div class="google-account-email">${acc.email}</div>
          </div>
        </button>
        <button type="button" class="google-account-remove-btn" onclick="removeDeviceGoogleAccount('${safeEmail}', event)" title="Quitar de este dispositivo" aria-label="Quitar cuenta" style="position: absolute; right: 10px; background: transparent; border: none; color: #9aa0a6; cursor: pointer; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    `;
  }).join('');
}

function handleGoogleSignIn() {
  // Abre la ventana de autenticación Google
  const googleModal = document.getElementById('google-auth-modal');
  if (googleModal) {
    googleModal.style.display = 'flex';
    void googleModal.offsetWidth;
    googleModal.classList.add('active', 'open');
    document.body.style.overflow = 'hidden';
    
    // Renderiza sólo las cuentas guardadas en este dispositivo si existen
    renderDeviceGoogleAccounts();

    // Intentar prompt One-Tap nativo de Google si está disponible
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        initGoogleIdentityServices();
        window.google.accounts.id.prompt();
      } catch (e) {}
    }

    const input = document.getElementById('google-custom-email-input');
    if (input) {
      setTimeout(() => input.focus(), 200);
    }
  }
}

function closeGoogleAuthModal(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('google-dark-close-btn') && !e.target.closest('.google-dark-close-btn')) {
    return;
  }
  const googleModal = document.getElementById('google-auth-modal');
  if (googleModal) {
    googleModal.classList.remove('active', 'open');
    googleModal.style.display = 'none';
  }
  // Si no hay otro modal abierto, restaurar overflow
  const loginModal = document.getElementById('login-modal');
  if (!loginModal || !loginModal.classList.contains('active')) {
    document.body.style.overflow = '';
  }
}

function handleCustomGoogleAccountSubmit(event) {
  if (event && event.preventDefault) event.preventDefault();
  const input = document.getElementById('google-custom-email-input');
  const email = input ? input.value.trim().toLowerCase() : '';
  if (email && email.includes('@')) {
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    selectGoogleAccount(formattedName, email, '');
  }
}

/* =========================================================
   SISTEMA DE VERIFICACIÓN DE CORREO POR CÓDIGO OTP (6 DÍGITOS)
   ========================================================= */

let pendingOtpState = {
  email: '',
  payload: null,
  countdownInterval: null,
  remainingSeconds: 0
};

function openEmailVerificationModal(email, payload = null) {
  const modal = document.getElementById('email-verification-modal');
  const emailDisplay = document.getElementById('otp-target-email-display');
  const alertEl = document.getElementById('otp-alert-message');
  
  if (!modal) return;

  pendingOtpState.email = email.trim().toLowerCase();
  pendingOtpState.payload = payload;

  if (emailDisplay) {
    emailDisplay.textContent = pendingOtpState.email;
  }

  if (alertEl) {
    alertEl.style.display = 'none';
    alertEl.className = 'otp-alert';
    alertEl.textContent = '';
  }

  // Limpiar y resetear los 6 casilleros
  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById(`otp-digit-${i}`);
    if (box) {
      box.value = '';
      box.classList.remove('filled');
    }
  }

  // Inicializar listeners de teclado y pegado
  setupOtpDigitInputs();

  // Abrir modal
  modal.style.display = 'flex';
  modal.classList.add('active', 'open');
  document.body.style.overflow = 'hidden';

  // Iniciar temporizador de 45 segundos
  startOtpCountdownTimer(45);

  // Autoenfocar el primer casillero
  setTimeout(() => {
    const firstBox = document.getElementById('otp-digit-1');
    if (firstBox) firstBox.focus();
  }, 250);
}

function closeEmailVerificationModal() {
  const modal = document.getElementById('email-verification-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active', 'open');
  }
  if (pendingOtpState.countdownInterval) {
    clearInterval(pendingOtpState.countdownInterval);
    pendingOtpState.countdownInterval = null;
  }
  document.body.style.overflow = '';
}

function setupOtpDigitInputs() {
  const inputs = [1, 2, 3, 4, 5, 6].map(i => document.getElementById(`otp-digit-${i}`)).filter(Boolean);

  inputs.forEach((input, index) => {
    // Al escribir un dígito
    input.oninput = (e) => {
      const val = input.value.replace(/\D/g, '');
      input.value = val ? val.slice(-1) : '';
      
      if (input.value) {
        input.classList.add('filled');
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      } else {
        input.classList.remove('filled');
      }

      // Si todos los 6 casilleros están llenos, verificar automáticamente
      const fullCode = inputs.map(i => i.value).join('');
      if (fullCode.length === 6) {
        submitOtpVerification();
      }
    };

    // Al presionar teclas especiales (Backspace / Flechas)
    input.onkeydown = (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && index > 0) {
          inputs[index - 1].focus();
          inputs[index - 1].value = '';
          inputs[index - 1].classList.remove('filled');
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputs[index - 1].focus();
      } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    };

    // Al pegar un código de 6 dígitos completo
    input.onpaste = (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pasted.replace(/\D/g, '').slice(0, 6);
      if (digits.length > 0) {
        digits.split('').forEach((d, i) => {
          if (inputs[i]) {
            inputs[i].value = d;
            inputs[i].classList.add('filled');
          }
        });
        const nextIdx = Math.min(digits.length, 5);
        if (inputs[nextIdx]) inputs[nextIdx].focus();
        if (digits.length === 6) {
          submitOtpVerification();
        }
      }
    };
  });
}

function startOtpCountdownTimer(seconds = 45) {
  if (pendingOtpState.countdownInterval) {
    clearInterval(pendingOtpState.countdownInterval);
  }

  pendingOtpState.remainingSeconds = seconds;
  const timerLabel = document.getElementById('otp-timer-label');
  const timerEl = document.getElementById('otp-countdown-timer');
  const resendBtn = document.getElementById('otp-resend-btn');

  if (timerLabel) timerLabel.style.display = 'inline';
  if (resendBtn) resendBtn.style.display = 'none';

  const updateDisplay = () => {
    const s = pendingOtpState.remainingSeconds;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  };

  updateDisplay();

  pendingOtpState.countdownInterval = setInterval(() => {
    pendingOtpState.remainingSeconds -= 1;
    if (pendingOtpState.remainingSeconds <= 0) {
      clearInterval(pendingOtpState.countdownInterval);
      pendingOtpState.countdownInterval = null;
      if (timerLabel) timerLabel.style.display = 'none';
      if (resendBtn) resendBtn.style.display = 'inline-flex';
    } else {
      updateDisplay();
    }
  }, 1000);
}

async function requestOtpVerificationAndOpenModal(email, payload = {}) {
  const alertEl = document.getElementById('auth-login-alert') || document.getElementById('auth-register-alert');
  
  try {
    const res = await fetch('/api/auth/send-verification-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: payload.name || payload.firstName || email.split('@')[0],
        userData: payload
      })
    });
    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || 'No se pudo enviar el código de verificación');
    }

    // Cerrar modal de login si estaba abierto
    closeLoginModal();
    closeGoogleAuthModal();

    // Abrir modal de verificación
    openEmailVerificationModal(email, payload);

  } catch (err) {
    console.error('Error requesting OTP:', err);
    if (alertEl) {
      alertEl.textContent = err.message || 'Error al enviar código de verificación al correo';
      alertEl.className = 'auth-status-alert error';
      alertEl.style.display = 'block';
    } else {
      alert(err.message || 'Error al enviar código');
    }
  }
}

async function handleResendOtpCode() {
  const alertEl = document.getElementById('otp-alert-message');
  const resendBtn = document.getElementById('otp-resend-btn');
  const timerLabel = document.getElementById('otp-timer-label');

  if (!pendingOtpState.email) return;

  if (resendBtn) resendBtn.disabled = true;

  try {
    const res = await fetch('/api/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pendingOtpState.email,
        name: pendingOtpState.payload?.name || pendingOtpState.email.split('@')[0]
      })
    });
    const result = await res.json();

    if (result.success) {
      if (alertEl) {
        alertEl.textContent = '✓ ¡Código reenviado con éxito! Revisa tu bandeja de entrada o spam.';
        alertEl.className = 'otp-alert success';
        alertEl.style.display = 'block';
      }
      startOtpCountdownTimer(result.cooldownSeconds || 45);
    } else {
      if (alertEl) {
        alertEl.textContent = result.error || 'Error al reenviar código';
        alertEl.className = 'otp-alert error';
        alertEl.style.display = 'block';
      }
      if (resendBtn) resendBtn.disabled = false;
    }
  } catch (err) {
    if (alertEl) {
      alertEl.textContent = 'Error de conexión al reenviar código';
      alertEl.className = 'otp-alert error';
      alertEl.style.display = 'block';
    }
    if (resendBtn) resendBtn.disabled = false;
  }
}

function handleChangeEmailFromOtp() {
  closeEmailVerificationModal();
  openLoginModal('login');
}

async function submitOtpVerification() {
  const inputs = [1, 2, 3, 4, 5, 6].map(i => document.getElementById(`otp-digit-${i}`)).filter(Boolean);
  const code = inputs.map(i => i.value).join('').trim();
  const alertEl = document.getElementById('otp-alert-message');
  const submitBtn = document.getElementById('otp-verify-submit-btn');
  const btnText = document.getElementById('otp-btn-text');
  const btnSpinner = document.getElementById('otp-btn-spinner');

  if (code.length < 6) {
    if (alertEl) {
      alertEl.textContent = 'Por favor ingresa los 6 dígitos del código enviado a tu correo.';
      alertEl.className = 'otp-alert error';
      alertEl.style.display = 'block';
    }
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnSpinner) btnSpinner.style.display = 'block';
  if (alertEl) alertEl.style.display = 'none';

  try {
    const payload = pendingOtpState.payload || {};
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pendingOtpState.email,
        code,
        name: payload.name || payload.firstName,
        docType: payload.docType,
        docNumber: payload.docNumber,
        phone: payload.phone,
        authProvider: payload.authProvider || 'local',
        password: payload.password
      })
    });
    const result = await res.json();

    if (!result.success || !result.user) {
      throw new Error(result.error || 'Código incorrecto o expirado.');
    }

    // Autenticación confirmada y verificada
    const user = result.user || result.data || {};
    const isAdminUser = Boolean(user.role === 'admin' || user.isAdmin === true || result.isAdmin === true);

    const customer = {
      id: user.id || `USR-${Date.now()}`,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || pendingOtpState.email.split('@')[0],
      firstName: user.firstName || user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Cliente',
      lastName: user.lastName || '',
      email: user.email || pendingOtpState.email,
      phone: user.phone || '942475459',
      docType: user.docType || 'DNI',
      docNumber: user.docNumber || '',
      authProvider: user.authProvider || payload.authProvider || 'local',
      role: isAdminUser ? 'admin' : (user.role || 'customer'),
      isAdmin: isAdminUser,
      emailVerified: true,
      updatedAt: new Date().toISOString()
    };

    // Guardar sesión
    localStorage.setItem('buchisapa_customer', JSON.stringify(customer));
    if (isAdminUser) {
      const token = result.token || `admin-token-${Date.now()}`;
      localStorage.setItem('buchisapa_admin_token', token);
      sessionStorage.setItem('buchisapa_admin_session', JSON.stringify(customer));
    }
    
    // Si fue login por Google, registrarlo en la lista de cuentas frecuentes de este dispositivo
    if (customer.authProvider === 'google') {
      saveDeviceGoogleAccount({
        name: customer.name,
        email: customer.email,
        docNumber: customer.docNumber,
        avatar: customer.avatar || '',
        role: customer.role
      });
    }

    updateNavbarUserAuth();

    if (alertEl) {
      alertEl.textContent = '✓ ¡Correo verificado exitosamente! Accediendo a tu cuenta...';
      alertEl.className = 'otp-alert success';
      alertEl.style.display = 'block';
    }

    setTimeout(() => {
      closeEmailVerificationModal();
      openUserProfileModal('main');
    }, 600);

  } catch (err) {
    console.error('Error in submitOtpVerification:', err);
    if (alertEl) {
      alertEl.textContent = err.message || 'Código inválido o expirado. Inténtalo de nuevo.';
      alertEl.className = 'otp-alert error';
      alertEl.style.display = 'block';
    }
    // Resaltar error en casilleros
    inputs.forEach(i => {
      i.style.borderColor = '#ef4444';
      setTimeout(() => i.style.borderColor = '', 1500);
    });
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

async function selectGoogleAccount(name, email, docNumber, avatar = '', googleUid = '') {
  const statusEl = document.getElementById('google-verifying-status');
  if (statusEl) statusEl.style.display = 'flex';

  // Cerrar modal de selección de Google y solicitar verificación obligatoria de 6 dígitos
  setTimeout(() => {
    if (statusEl) statusEl.style.display = 'none';
    closeGoogleAuthModal();
    requestOtpVerificationAndOpenModal(email, {
      name,
      email,
      docNumber,
      avatar,
      googleUid,
      authProvider: 'google'
    });
  }, 300);
}

function handleUserIconClick() {
  const saved = localStorage.getItem('buchisapa_customer');
  if (saved) {
    try {
      const customer = JSON.parse(saved);
      if (customer && (customer.name || customer.email) && !customer.guest) {
        openUserProfileModal();
        return;
      }
    } catch (e) {}
  }
  openLoginModal('login');
}

function openUserProfileModal(targetScreen = 'main') {
  const saved = localStorage.getItem('buchisapa_customer');
  if (!saved) {
    openLoginModal('login');
    return;
  }

  try {
    const customer = JSON.parse(saved);
    const fullnameEl = document.getElementById('profile-user-fullname');
    const emailEl = document.getElementById('profile-user-email');
    const avatarInitial = document.getElementById('profile-avatar-initial');

    const fullName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Cliente';
    const email = customer.email || 'Sin correo registrado';

    if (fullnameEl) fullnameEl.textContent = fullName;
    if (emailEl) emailEl.textContent = email;
    if (avatarInitial) avatarInitial.textContent = fullName.charAt(0).toUpperCase();

    // Rellenar formulario Editar mis datos
    const editDocType = document.getElementById('edit-doc-type');
    const editDocNumber = document.getElementById('edit-doc-number');
    const editBirthdate = document.getElementById('edit-birthdate');
    const editFirstName = document.getElementById('edit-firstname');
    const editLastName = document.getElementById('edit-lastname');
    const editPhone = document.getElementById('edit-phone');
    const editEmail = document.getElementById('edit-email');

    if (editDocType && customer.docType) editDocType.value = customer.docType;
    if (editDocNumber) editDocNumber.value = customer.docNumber || '';
    if (editBirthdate) editBirthdate.value = customer.birthDate || '';
    if (editFirstName) editFirstName.value = customer.firstName || fullName.split(' ')[0] || '';
    if (editLastName) editLastName.value = customer.lastName || fullName.split(' ').slice(1).join(' ') || '';
    if (editPhone) editPhone.value = customer.phone || '';
    if (editEmail) editEmail.value = email;

    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('active', 'open');
      document.body.style.overflow = 'hidden';
    }
    switchAuthView('profile');
    switchProfileScreen(targetScreen);
  } catch (e) {
    console.warn('Error abriendo perfil:', e);
    openLoginModal('login');
  }
}

function switchProfileScreen(screenName) {
  currentProfileScreen = screenName;
  const screens = ['main', 'orders', 'addresses', 'cards', 'edit_data', 'settings'];
  screens.forEach(s => {
    const el = document.getElementById(`profile-screen-${s}`);
    if (el) el.style.display = s === screenName ? 'block' : 'none';
  });

  const topbarTitle = document.getElementById('auth-topbar-title');
  const backBtnText = document.getElementById('auth-back-btn-text');

  if (topbarTitle) {
    topbarTitle.style.display = 'block';
    if (screenName === 'main') {
      topbarTitle.textContent = 'Mi perfil';
    } else if (screenName === 'orders') {
      topbarTitle.textContent = 'Mis pedidos';
    } else if (screenName === 'addresses') {
      topbarTitle.textContent = 'MIS DIRECCIONES';
    } else if (screenName === 'cards') {
      topbarTitle.textContent = 'MIS TARJETAS';
    } else if (screenName === 'edit_data') {
      topbarTitle.textContent = 'Editar mis datos';
    } else if (screenName === 'settings') {
      topbarTitle.textContent = 'Configuraciones';
    }
  }

  if (backBtnText) {
    backBtnText.textContent = 'Volver';
  }

  if (screenName === 'orders') {
    fetchAndRenderCustomerOrders(true);
  } else if (screenName === 'addresses') {
    renderCustomerAddresses();
  }
}

function goToPromocionesFromProfile() {
  closeLoginModal();
  const target = document.getElementById('promociones') || document.getElementById('menu-section');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

function switchProfileSubTab(tabName) {
  if (tabName === 'orders') {
    switchProfileScreen('orders');
  } else if (tabName === 'addresses') {
    switchProfileScreen('addresses');
  } else if (tabName === 'cards') {
    switchProfileScreen('cards');
  } else if (tabName === 'settings') {
    switchProfileScreen('settings');
  } else {
    switchProfileScreen('edit_data');
  }
}

let currentAddressTab = 'favorites';

function switchAddressTab(tab) {
  currentAddressTab = tab;
  const favBtn = document.getElementById('addr-tab-favorites');
  const allBtn = document.getElementById('addr-tab-all');
  if (favBtn) favBtn.classList.toggle('active', tab === 'favorites');
  if (allBtn) allBtn.classList.toggle('active', tab === 'all');
  renderCustomerAddresses();
}

function toggleAddAddressForm(show) {
  const formBox = document.getElementById('add-address-form-box');
  if (formBox) {
    formBox.style.display = show ? 'block' : 'none';
    if (show) {
      formBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function getStoredAddresses() {
  try {
    const raw = localStorage.getItem('buchisapa_customer_addresses');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredAddresses(list) {
  localStorage.setItem('buchisapa_customer_addresses', JSON.stringify(list));
}

function saveNewCustomerAddress() {
  const streetInput = document.getElementById('new-addr-street');
  const districtInput = document.getElementById('new-addr-district');
  const refInput = document.getElementById('new-addr-reference');
  const favCheck = document.getElementById('new-addr-is-fav');

  const street = streetInput?.value.trim();
  const district = districtInput?.value.trim() || 'Huaycán / Ate';
  const reference = refInput?.value.trim() || '';
  const isFav = favCheck ? favCheck.checked : true;

  if (!street) {
    if (streetInput) {
      streetInput.focus();
      streetInput.style.borderColor = '#dc2626';
    }
    return;
  }

  const list = getStoredAddresses();
  const newAddr = {
    id: 'addr_' + Date.now(),
    street,
    district,
    reference,
    isFav: Boolean(isFav)
  };
  list.unshift(newAddr);
  saveStoredAddresses(list);

  if (streetInput) {
    streetInput.value = '';
    streetInput.style.borderColor = '';
  }
  if (refInput) refInput.value = '';
  toggleAddAddressForm(false);
  renderCustomerAddresses();
}

function deleteCustomerAddress(id) {
  const list = getStoredAddresses().filter(a => a.id !== id);
  saveStoredAddresses(list);
  renderCustomerAddresses();
}

function toggleFavoriteAddress(id) {
  const list = getStoredAddresses().map(a => {
    if (a.id === id) {
      return { ...a, isFav: !a.isFav };
    }
    return a;
  });
  saveStoredAddresses(list);
  renderCustomerAddresses();
}

function renderCustomerAddresses() {
  const list = getStoredAddresses();
  const emptyFav = document.getElementById('addr-empty-favorites');
  const emptyAll = document.getElementById('addr-empty-all');
  const listContainer = document.getElementById('addr-list-container');
  const bottomAddBtn = document.getElementById('addr-bottom-add-btn-wrap');

  const filtered = currentAddressTab === 'favorites' 
    ? list.filter(a => a.isFav)
    : list;

  if (filtered.length === 0) {
    if (currentAddressTab === 'favorites') {
      if (emptyFav) emptyFav.style.display = 'block';
      if (emptyAll) emptyAll.style.display = 'none';
    } else {
      if (emptyFav) emptyFav.style.display = 'none';
      if (emptyAll) emptyAll.style.display = 'block';
    }
    if (listContainer) listContainer.style.display = 'none';
    if (bottomAddBtn) bottomAddBtn.style.display = 'none';
  } else {
    if (emptyFav) emptyFav.style.display = 'none';
    if (emptyAll) emptyAll.style.display = 'none';
    if (listContainer) {
      listContainer.style.display = 'block';
      listContainer.innerHTML = filtered.map(addr => `
        <div class="saved-address-card">
          <div class="saved-address-info">
            <div class="saved-address-title-row">
              <span class="saved-address-title">${escapeHtml(addr.street)}</span>
              ${addr.isFav ? '<span class="saved-address-fav-badge">★ Favorita</span>' : ''}
            </div>
            <div class="saved-address-text">${escapeHtml(addr.district || 'Lima')}</div>
            ${addr.reference ? `<div class="saved-address-ref">Ref: ${escapeHtml(addr.reference)}</div>` : ''}
          </div>
          <div class="saved-address-actions">
            <button type="button" class="saved-address-btn-icon" onclick="toggleFavoriteAddress('${addr.id}')" title="${addr.isFav ? 'Quitar favorita' : 'Marcar favorita'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${addr.isFav ? '#f59e0b' : 'none'}" stroke="${addr.isFav ? '#d97706' : 'currentColor'}" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
            <button type="button" class="saved-address-btn-icon" onclick="deleteCustomerAddress('${addr.id}')" title="Eliminar dirección">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `).join('');
    }
    if (bottomAddBtn) bottomAddBtn.style.display = 'block';
  }
}

function handleSaveProfileData(e) {
  if (e) e.preventDefault();
  const alertEl = document.getElementById('profile-edit-alert');
  const docType = document.getElementById('edit-doc-type')?.value || 'DNI';
  const docNumber = document.getElementById('edit-doc-number')?.value.trim() || '';
  const birthDate = document.getElementById('edit-birthdate')?.value || '';
  const firstName = document.getElementById('edit-firstname')?.value.trim() || '';
  const lastName = document.getElementById('edit-lastname')?.value.trim() || '';
  const phone = document.getElementById('edit-phone')?.value.trim() || '';
  const marketingConsent = document.getElementById('edit-marketing-consent')?.checked;

  if (!docNumber || !firstName || !lastName || !phone) {
    if (alertEl) {
      alertEl.className = 'auth-status-alert error';
      alertEl.textContent = 'Por favor completa todos los campos obligatorios.';
      alertEl.style.display = 'block';
    }
    return;
  }

  const saved = localStorage.getItem('buchisapa_customer');
  let customer = {};
  if (saved) {
    try { customer = JSON.parse(saved); } catch (err) {}
  }

  customer.docType = docType;
  customer.docNumber = docNumber;
  customer.birthDate = birthDate;
  customer.firstName = firstName;
  customer.lastName = lastName;
  customer.name = `${firstName} ${lastName}`.trim();
  customer.phone = phone;
  customer.marketingConsent = Boolean(marketingConsent);

  localStorage.setItem('buchisapa_customer', JSON.stringify(customer));
  updateNavbarUserAuth();

  if (alertEl) {
    alertEl.className = 'auth-status-alert success';
    alertEl.textContent = '✓ Tus datos se actualizaron correctamente.';
    alertEl.style.display = 'block';
  }

  setTimeout(() => {
    switchProfileScreen('main');
  }, 1000);
}

function handleDeleteCustomerAccount() {
  const confirmed = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta de Buchisapa? Esta acción es permanente e irreversible.');
  if (!confirmed) return;

  localStorage.removeItem('buchisapa_customer');
  localStorage.removeItem('buchisapa_customer_addresses');
  updateNavbarUserAuth();
  closeLoginModal();
}

let cachedCustomerOrders = [];

async function fetchAndRenderCustomerOrders(showLoader = true) {
  const saved = localStorage.getItem('buchisapa_customer');
  let customer = null;
  if (saved) {
    try {
      customer = JSON.parse(saved);
    } catch (e) {}
  }

  const email = customer?.email || '';
  const emailTag = document.getElementById('profile-orders-user-email-tag');
  if (emailTag) {
    emailTag.textContent = email || 'Sin correo registrado';
  }

  const loadingEl = document.getElementById('profile-orders-loading');
  const emptyEl = document.getElementById('profile-orders-empty');
  const listEl = document.getElementById('profile-orders-list');
  const badgeCount = document.getElementById('profile-orders-count-badge');
  const btnCount = document.getElementById('profile-orders-btn-count');

  if (showLoader) {
    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (listEl) listEl.style.display = 'none';
  }

  if (!email) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    if (badgeCount) badgeCount.textContent = '0';
    if (btnCount) btnCount.textContent = '0';
    return;
  }

  let orders = [];

  try {
    // 1. Intento primario: Consulta a Supabase Client con filtro customer_email=eq
    if (window.BuchisapaAPI && typeof window.BuchisapaAPI.getOrdersByEmail === 'function') {
      orders = await window.BuchisapaAPI.getOrdersByEmail(email);
    }

    // 2. Si no hay pedidos devueltos, consultar endpoint de backend Express /api/orders/customer/:email
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      try {
        const res = await fetch(`/api/orders/customer/${encodeURIComponent(email)}`);
        if (res.ok) {
          const json = await res.json();
          orders = json.data || (Array.isArray(json) ? json : []);
        }
      } catch (err) {
        console.warn('Fallback /api/orders/customer error:', err);
      }
    }

    // 3. Respaldo adicional: verificar pedido recién creado en localStorage si pertenece al usuario
    try {
      const localLastOrderStr = localStorage.getItem('buchisapa_last_order');
      if (localLastOrderStr) {
        const localOrder = JSON.parse(localLastOrderStr);
        if (localOrder && localOrder.id) {
          const exists = orders.some(o => o.id === localOrder.id);
          if (!exists) {
            orders.unshift(localOrder);
          }
        }
      }
    } catch (e) {}

  } catch (err) {
    console.error('Error obteniendo historial de pedidos:', err);
  }

  cachedCustomerOrders = Array.isArray(orders) ? orders : [];

  // Actualizar contadores en la interfaz
  const count = cachedCustomerOrders.length;
  if (badgeCount) badgeCount.textContent = count;
  if (btnCount) btnCount.textContent = count;

  if (loadingEl) loadingEl.style.display = 'none';

  if (count === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (listEl) listEl.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    if (listEl) {
      listEl.style.display = 'flex';
      listEl.style.flexDirection = 'column';
      listEl.innerHTML = renderCustomerOrdersHtml(cachedCustomerOrders);
    }
  }
}

function renderCustomerOrdersHtml(orders) {
  return orders.map(order => {
    const orderNum = order.order_number || order.orderNumber || (order.id ? order.id.slice(-4) : '---');
    const status = (order.status || 'recibido').toLowerCase();
    const orderType = order.order_type || order.orderType || 'delivery';
    const total = parseFloat(order.total || 0).toFixed(2);

    // Formato de fecha
    let dateStr = 'Hoy';
    const rawDate = order.created_at || order.createdAt;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        dateStr = d.toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      } catch (e) {}
    }

    // Badge de estado
    let statusLabel = 'Recibido';
    let statusIcon = '⏳';
    let statusClass = 'status-recibido';

    if (status === 'preparando') {
      statusLabel = 'En Cocina';
      statusIcon = '🍳';
      statusClass = 'status-preparando';
    } else if (status === 'en_camino') {
      statusLabel = 'En Camino';
      statusIcon = '🛵';
      statusClass = 'status-en_camino';
    } else if (status === 'entregado') {
      statusLabel = 'Entregado';
      statusIcon = '✅';
      statusClass = 'status-entregado';
    } else if (status === 'cancelado') {
      statusLabel = 'Cancelado';
      statusIcon = '❌';
      statusClass = 'status-cancelado';
    }

    // Resumen de items
    let rawItems = order.items;
    let itemsList = [];
    if (typeof rawItems === 'string') {
      try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
    }
    if (Array.isArray(rawItems)) {
      itemsList = rawItems;
    }

    const itemsSummaryHtml = itemsList.map(it => {
      const q = it.quantity || 1;
      const itName = it.name || (it.item && it.item.name) || 'Producto Buchisapa';
      const itPrice = it.price || (it.item && it.item.price);
      const priceStr = itPrice ? `S/ ${(parseFloat(itPrice) * q).toFixed(2)}` : '';
      const sauces = it.selectedSauces || it.sauces || [];
      const saucesStr = (Array.isArray(sauces) && sauces.length > 0) ? `Salsas: ${sauces.join(', ')}` : '';

      return `
        <div class="profile-order-item-row">
          <div>
            <span class="profile-order-item-name">${q}x ${itName}</span>
            ${saucesStr ? `<div class="profile-order-item-sauces">${saucesStr}</div>` : ''}
          </div>
          ${priceStr ? `<span style="font-weight: 700; font-size: 12px; color: #475569;">${priceStr}</span>` : ''}
        </div>
      `;
    }).join('');

    const typeLabel = orderType === 'delivery'
      ? `🛵 Delivery${order.deliveryAddress ? ` • ${order.deliveryAddress}` : ''}`
      : (orderType === 'pickup' ? '🛍️ Para Llevar (Recojo)' : '🍽️ En Salón');

    const paymentLabel = order.payment_method || order.paymentMethod || 'Yape';

    return `
      <div class="profile-order-card" id="profile-order-card-${order.id}">
        <div class="profile-order-top">
          <div>
            <div class="profile-order-num">Pedido #${orderNum}</div>
            <div class="profile-order-date">${dateStr}</div>
          </div>
          <span class="profile-order-status-badge ${statusClass}">
            <span>${statusIcon}</span>
            <span>${statusLabel}</span>
          </span>
        </div>

        <div style="font-size: 12px; color: #64748b; margin-bottom: 6px; display: flex; flex-wrap: wrap; gap: 8px;">
          <span>${typeLabel}</span>
          <span>•</span>
          <span>Pago: <strong>${paymentLabel.toUpperCase()}</strong></span>
        </div>

        <div class="profile-order-items-list">
          ${itemsSummaryHtml || '<div style="font-size: 12px; color: #94a3b8;">Detalles no disponibles</div>'}
        </div>

        <div class="profile-order-footer">
          <div>
            <div style="font-size: 11px; color: #64748b; font-weight: 700;">TOTAL COMPRA</div>
            <div class="profile-order-total">S/ ${total}</div>
          </div>
          <div class="profile-order-actions-row">
            <button type="button" class="profile-order-btn-repeat" onclick="repeatCustomerOrder('${order.id}')" title="Agregar nuevamente estos productos al carrito">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Repetir</span>
            </button>
            <button type="button" class="profile-order-btn-track" onclick="trackCustomerOrder('${order.id}')" title="Ver seguimiento y rastreo en vivo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
              <span>Rastrear</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function trackCustomerOrder(orderId) {
  closeLoginModal();
  if (typeof openOrderTracker === 'function') {
    openOrderTracker(orderId);
  } else {
    window.location.href = `/order-status.html?id=${orderId}`;
  }
}

function repeatCustomerOrder(orderId) {
  const order = cachedCustomerOrders.find(o => o.id === orderId);
  if (!order || !window.BuchisapaCart) return;

  let rawItems = order.items;
  if (typeof rawItems === 'string') {
    try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
  }

  if (Array.isArray(rawItems)) {
    rawItems.forEach(it => {
      const prod = it.item || it;
      const qty = it.quantity || 1;
      const sauces = it.selectedSauces || it.sauces || [];
      if (prod && prod.id && prod.name) {
        window.BuchisapaCart.addItem(prod, qty, sauces);
      }
    });
  }

  closeLoginModal();
  window.BuchisapaCart.openDrawer();
  if (window.BuchisapaPush) {
    window.BuchisapaPush.playChime();
    window.BuchisapaPush.showToast({
      title: '🛒 Pedido Repetido',
      message: 'Los productos de tu compra anterior fueron agregados a tu carrito.',
      stage: 'recibido',
      icon: '✓'
    });
  }
}

function handleLogoutCustomer() {
  localStorage.removeItem('buchisapa_customer');
  localStorage.removeItem('buchisapa_admin_session');
  localStorage.removeItem('buchisapa_auth_user');
  localStorage.removeItem('buchisapa_user');
  localStorage.removeItem('buchisapa_token');
  sessionStorage.clear();
  updateNavbarUserAuth();
  closeLoginModal();
}

function updateNavbarUserAuth() {
  const drawerLoginBtn = document.getElementById('drawer-login-btn');
  const drawerLoginLabel = document.getElementById('drawer-login-label');
  const drawerUserCard = document.getElementById('drawer-user-card');
  const drawerUserAvatar = document.getElementById('drawer-user-avatar');
  const drawerUserGreeting = document.getElementById('drawer-user-greeting');
  const drawerRegisterBtn = document.getElementById('drawer-register-btn');
  const drawerAdminBtn = document.getElementById('drawer-admin-btn');
  const profileAdminBtn = document.getElementById('profile-admin-btn');
  const userBtn = document.getElementById('header-user-btn');
  const userDot = document.getElementById('user-active-indicator');
  const authBtn = document.getElementById('header-auth-btn');
  const saved = localStorage.getItem('buchisapa_customer');

  let customer = null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.name || parsed.email) && !parsed.guest) {
        customer = parsed;
      }
    } catch (e) {}
  }

  if (customer && !customer.isAdmin && customer.role !== 'admin') {
    const fullName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Cliente';
    const shortName = customer.firstName || fullName.split(' ')[0] || 'Cliente';
    const initial = fullName.charAt(0).toUpperCase() || 'C';

    // En menú lateral: Mostrar card de cliente y ocultar botón INGRESAR
    if (drawerLoginBtn) {
      drawerLoginBtn.style.display = 'none';
    }
    if (drawerUserCard) {
      drawerUserCard.style.display = 'flex';
      if (drawerUserAvatar) drawerUserAvatar.textContent = initial;
      if (drawerUserGreeting) {
        drawerUserGreeting.textContent = shortName;
        drawerUserGreeting.title = fullName;
      }
      
      const verPerfilBtn = drawerUserCard.querySelector('.drawer-user-ver-perfil-btn');
      if (verPerfilBtn) {
        verPerfilBtn.onclick = (e) => {
          e.stopPropagation();
          openUserProfileModal();
        };
      }
    }
    if (drawerRegisterBtn) {
      drawerRegisterBtn.style.display = 'none';
    }

    // Elementos en header
    if (userBtn) {
      userBtn.classList.add('logged-in');
      userBtn.setAttribute('title', `Hola, ${fullName}`);
    }
    if (userDot) {
      userDot.style.display = 'block';
    }
    if (authBtn) {
      const label = authBtn.querySelector('.header-auth-btn-label');
      if (label) label.textContent = shortName;
      authBtn.classList.add('logged-in');
    }
  } else {
    // Estado desconectado o sesión administrativa (la tienda pública se mantiene limpia)
    if (drawerLoginBtn) {
      drawerLoginBtn.style.display = 'flex';
    }
    if (drawerUserCard) {
      drawerUserCard.style.display = 'none';
    }
    if (drawerLoginLabel) {
      drawerLoginLabel.textContent = 'INGRESAR';
    }
    if (drawerRegisterBtn) {
      drawerRegisterBtn.style.display = 'flex';
    }
    if (drawerAdminBtn) {
      drawerAdminBtn.style.display = 'none';
    }
    if (profileAdminBtn) {
      profileAdminBtn.style.display = 'none';
    }

    if (userBtn) {
      userBtn.classList.remove('logged-in');
      userBtn.removeAttribute('title');
    }
    if (userDot) {
      userDot.style.display = 'none';
    }
    if (authBtn) {
      const label = authBtn.querySelector('.header-auth-btn-label');
      if (label) label.textContent = 'Ingresar';
      authBtn.classList.remove('logged-in');
    }
  }
}

// Global window exposure for inline event handlers
window.handleUserIconClick = handleUserIconClick;
window.openUserProfileModal = openUserProfileModal;
window.switchProfileScreen = switchProfileScreen;
window.goToPromociones = goToPromociones;
window.goToPromocionesFromProfile = goToPromocionesFromProfile;
window.toggleNavCollapsible = toggleNavCollapsible;
window.selectCategoryFromDrawer = selectCategoryFromDrawer;
window.openCartFromDrawer = openCartFromDrawer;
window.openCategoryView = openCategoryView;
window.switchAddressTab = switchAddressTab;
window.toggleAddAddressForm = toggleAddAddressForm;
window.saveNewCustomerAddress = saveNewCustomerAddress;
window.deleteCustomerAddress = deleteCustomerAddress;
window.toggleFavoriteAddress = toggleFavoriteAddress;
window.renderCustomerAddresses = renderCustomerAddresses;
window.handleSaveProfileData = handleSaveProfileData;
window.handleDeleteCustomerAccount = handleDeleteCustomerAccount;
window.handleLogoutCustomer = handleLogoutCustomer;
window.openLoginModal = openLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeLoginModal = closeLoginModal;
window.continueAsGuest = continueAsGuest;
window.handleAuthBackNav = handleAuthBackNav;
window.switchAuthView = switchAuthView;
window.togglePasswordVisibility = togglePasswordVisibility;
window.checkAuthFormReady = checkAuthFormReady;
window.checkRegisterFormReady = checkRegisterFormReady;
window.onRegisterDocTypeChange = onRegisterDocTypeChange;
window.handleFieldValidation = handleFieldValidation;
window.resetRegisterFormValidation = resetRegisterFormValidation;
window.handleAuthLoginSubmit = handleAuthLoginSubmit;
window.handleAuthRegisterSubmit = handleAuthRegisterSubmit;
window.handleAuthRecoverySubmit = handleAuthRecoverySubmit;
window.handleGoogleSignIn = handleGoogleSignIn;
window.closeGoogleAuthModal = closeGoogleAuthModal;
window.handleCustomGoogleAccountSubmit = handleCustomGoogleAccountSubmit;
window.selectGoogleAccount = selectGoogleAccount;
window.removeDeviceGoogleAccount = removeDeviceGoogleAccount;
window.initGoogleIdentityServices = initGoogleIdentityServices;
window.updateNavbarUserAuth = updateNavbarUserAuth;
window.updateUserNavUI = updateNavbarUserAuth;
window.openFullMenuModal = openFullMenuModal;
function openSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.classList.add('active', 'open');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('search-input-field');
    if (input) {
      setTimeout(() => input.focus(), 100);
      handleSearchInput(input.value);
    }
  }
}

function toggleSearchModal(event) {
  if (event && event.target && event.target.closest('.search-modal-box')) return;
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  if (modal.classList.contains('active') || modal.classList.contains('open')) {
    modal.classList.remove('active', 'open');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  } else {
    openSearchModal();
  }
}

function handleSearchInput(query) {
  const container = document.getElementById('search-results-container');
  if (!container) return;
  
  const items = getAllProducts();
  
  const clean = (query || '').trim();
  if (!clean) {
    renderCardsInContainer(items, container);
    return;
  }
  
  const norm = normalizeText(clean);
  const matches = items.filter(p => {
    const name = normalizeText(p.name || '');
    return name.includes(norm);
  });
  
  renderCardsInContainer(matches, container);
}

window.openSearchModal = openSearchModal;
window.toggleSearchModal = toggleSearchModal;
window.handleSearchInput = handleSearchInput;
window.toggleSearchBar = toggleSearchBar;
window.onSearchInputFocused = onSearchInputFocused;
window.clearSearchInput = clearSearchInput;
window.exitSearchMode = exitSearchMode;
window.closeCategoryModal = exitSearchMode;
window.moveCarousel = moveCarousel;
window.goToSlide = goToSlide;
window.closeCheckoutModal = closeCheckoutModal;
window.submitOrder = submitOrder;

function openFullMenuModal() {
  toggleMobileMenu();
  openFooterInfoModal('carta');
}

/* =========================================================
   MODAL DE UBICACIÓN Y VERIFICACIÓN EN TIEMPO REAL (LIMA / ATE)
   ========================================================= */
function getSafeCoords(lat, lng) {
  let numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  let numLng = typeof lng === 'number' ? lng : parseFloat(lng);
  if (isNaN(numLat) || !isFinite(numLat)) numLat = -12.01635;
  if (isNaN(numLng) || !isFinite(numLng)) numLng = -76.88455;
  return { lat: numLat, lng: numLng };
}

function getCustomPinIcon() {
  if (typeof L === 'undefined') return null;
  return L.divIcon({
    className: 'custom-loc-pin-wrap',
    html: `
      <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
        <svg width="34" height="42" viewBox="0 0 24 30" fill="none">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" fill="#dc2626"/>
          <circle cx="12" cy="11" r="5" fill="#ffffff"/>
        </svg>
        <div style="position: absolute; bottom: 0; width: 8px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 40]
  });
}

function openLocationModal() {
  window.location.href = '/ubicacion.html';
}

function closeLocationModal() {
  const modal = document.getElementById('location-modal');
  if (modal) {
    modal.classList.remove('active', 'open');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  // Detener inmediatamente el GPS continuo para ahorrar batería
  stopLiveGeolocationWatch();
}

// Función para actualizar la etiqueta de ubicación en la barra superior según selección
function updateSelectedLocationHeader() {
  const label = document.getElementById('selected-location-label');
  if (!label) return;
  
  try {
    const fulfillment = localStorage.getItem('buchisapa_active_fulfillment');
    if (fulfillment === 'delivery') {
      const storedDelivery = localStorage.getItem('buchisapa_delivery_address');
      if (storedDelivery) {
        const parsed = JSON.parse(storedDelivery);
        const tag = parsed.tag || 'Delivery';
        const shortAddr = (parsed.address || '').split(',')[0].trim();
        label.textContent = shortAddr ? `🛵 ${shortAddr}` : `🛵 ${tag}`;
        return;
      }
      label.textContent = '🛵 Delivery a Domicilio';
      return;
    }
  } catch (e) {}

  label.textContent = 'Recojo en Santa Clara';
}

// Escuchar cambios de ubicación si fue abierta en una nueva pestaña/ventana
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'BUCHISAPA_LOCATION_UPDATED') {
    const address = event.data.address || 'Santa Clara';
    const shortStreet = address.split(',')[0].trim();
    updateSelectedLocationHeader();
    if (window.BuchisapaPush) {
      window.BuchisapaPush.showToast({
        title: 'Ubicación Sincronizada',
        message: event.data.orderType === 'pickup' ? 'Recojo en Tienda confirmado' : `Dirección: ${shortStreet}`,
        stage: 'en_camino',
        icon: event.data.orderType === 'pickup' ? '🏪' : '🛵'
      });
    }
  }
});

function initLocationMap() {
  setTimeout(() => {
    const mapEl = document.getElementById('loc-leaflet-map');
    if (!mapEl || typeof L === 'undefined') return;

    const safe = getSafeCoords(currentCoords?.lat, currentCoords?.lng);
    currentCoords = safe;

    if (!locMap) {
      locMap = L.map('loc-leaflet-map', {
        center: [safe.lat, safe.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // OpenStreetMap Standard tiles (100% gratuito y sin marca de agua "KEY REQUIRED")
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(locMap);

      const icon = getCustomPinIcon();
      locMarker = L.marker([safe.lat, safe.lng], {
        icon: icon,
        draggable: true
      }).addTo(locMap);

      // Evento al arrastrar el pin
      locMarker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        if (pos && typeof pos.lat === 'number' && !isNaN(pos.lat) && typeof pos.lng === 'number' && !isNaN(pos.lng)) {
          updateLocationFromCoords(pos.lat, pos.lng, true);
        }
      });

      // Evento al hacer clic sobre el mapa
      locMap.on('click', function(e) {
        if (e && e.latlng && typeof e.latlng.lat === 'number' && !isNaN(e.latlng.lat) && typeof e.latlng.lng === 'number' && !isNaN(e.latlng.lng)) {
          if (locMarker) locMarker.setLatLng(e.latlng);
          updateLocationFromCoords(e.latlng.lat, e.latlng.lng, true);
        }
      });
    } else {
      locMap.invalidateSize();
      locMap.setView([safe.lat, safe.lng], 15);
      if (locMarker) locMarker.setLatLng([safe.lat, safe.lng]);
    }
  }, 120);
}

function switchLocationTab(tab) {
  const btnDel = document.getElementById('loc-tab-delivery');
  const btnPick = document.getElementById('loc-tab-pickup');
  const contentDel = document.getElementById('loc-content-delivery');
  const contentPick = document.getElementById('loc-content-pickup');

  if (tab === 'delivery') {
    if (btnDel) btnDel.classList.add('active');
    if (btnPick) btnPick.classList.remove('active');
    if (contentDel) contentDel.style.display = 'block';
    if (contentPick) contentPick.style.display = 'none';
    if (locMap) setTimeout(() => locMap.invalidateSize(), 80);
  } else {
    if (btnPick) btnPick.classList.add('active');
    if (btnDel) btnDel.classList.remove('active');
    if (contentDel) contentDel.style.display = 'none';
    if (contentPick) contentPick.style.display = 'block';
  }
}

function openLocationHelpModal() {
  const modal = document.getElementById('location-help-modal');
  if (modal) modal.style.display = 'flex';
}

function closeLocationHelpModal() {
  const modal = document.getElementById('location-help-modal');
  if (modal) modal.style.display = 'none';
}

window.openLocationHelpModal = openLocationHelpModal;
window.closeLocationHelpModal = closeLocationHelpModal;

function closeDevicePermDialog() {
  const modal = document.getElementById('device-gps-diag-modal') || document.getElementById('location-help-modal');
  if (modal) modal.style.display = 'none';
}

function setPermPrecision(precision) {
  locPrecision = precision === 'approx' ? 'approx' : 'precise';
}

function switchLocationHelpTab(tabKey) {
  const tabs = ['chrome', 'safari', 'pc'];
  tabs.forEach(t => {
    const tabEl = document.getElementById(`help-tab-${t}`);
    const paneEl = document.getElementById(`help-pane-${t}`);
    if (tabEl) {
      if (t === tabKey) tabEl.classList.add('active');
      else tabEl.classList.remove('active');
    }
    if (paneEl) {
      if (t === tabKey) paneEl.style.display = 'flex';
      else paneEl.style.display = 'none';
    }
  });
}

function setGpsDeniedBanner(show, customMessage = null) {
  const banner = document.getElementById('loc-gps-denied-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function acceptDeviceLocation(scope) {
  sessionStorage.setItem('buchisapa_loc_prompt_dismissed', 'true');
  sessionStorage.setItem('buchisapa_loc_permission', scope);
  setGpsDeniedBanner(false);

  if (!navigator.geolocation) {
    updateLocStatus('⚠️ Geolocalización no soportada', 'error');
    return;
  }

  updateLocStatus('⏳ Obteniendo ubicación GPS...', 'detecting');

  const fastOpts = { enableHighAccuracy: locPrecision === 'precise', timeout: 15000, maximumAge: 0 };
  const fallbackOpts = { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 };

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      lastKnownClientPos = pos;
      hasLiveClientGpsSignal = true;
      let lat = pos.coords.latitude;
      let lng = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy || 15);

      if (locPrecision === 'approx') {
        lat = Math.round(lat * 150) / 150;
        lng = Math.round(lng * 150) / 150;
      }

      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.address) {
            updateLocationFromCoords(lat, lng, false, data.address);
            updateLocStatus(`✓ Ubicación detectada (${data.address})`, 'success');
            return;
          }
        }
      } catch(e) {}
      updateLocationFromCoords(lat, lng, false);
      updateLocStatus(`✓ Ubicación detectada (±${accuracy}m)`, 'success');
    },
    (err) => {
      console.warn('GPS alta precisión falló en cliente, intentando fallback:', err);
      navigator.geolocation.getCurrentPosition(
        async (pos2) => {
          lastKnownClientPos = pos2;
          hasLiveClientGpsSignal = true;
          let lat = pos2.coords.latitude;
          let lng = pos2.coords.longitude;
          updateLocationFromCoords(lat, lng, false);
          updateLocStatus('✓ Ubicación detectada', 'success');
        },
        (err2) => {
          hasLiveClientGpsSignal = false;
          updateLocStatus('⚠️ Si el GPS de tu celular está apagado, actívalo en tu barra superior', 'error');
        },
        fallbackOpts
      );
    },
    fastOpts
  );
}

// Solo reconectar GPS si el usuario YA concedió explícitamente el permiso previamente en esta sesión
window.addEventListener('focus', () => {
  if (!hasLiveClientGpsSignal && sessionStorage.getItem('buchisapa_loc_permission') === 'precise') {
    triggerLocationDetection(false, locPrecision);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !hasLiveClientGpsSignal && sessionStorage.getItem('buchisapa_loc_permission') === 'precise') {
    triggerLocationDetection(false, locPrecision);
  }
});

function denyDeviceLocation() {
  sessionStorage.setItem('buchisapa_loc_prompt_dismissed', 'true');
  sessionStorage.setItem('buchisapa_loc_permission', 'denied');

  // Fallback a ubicación por defecto sin mostrar banner
  updateLocationFromCoords(-12.0119, -76.8239, false, 'Avenida 15 de Julio, Huaycán, Ate, Perú');
  updateLocStatus('📍 Ubicación fijada manualmente (Ate, Lima)', 'normal');
}

function updateLocStatus(text, type = 'normal') {
  const badge = document.getElementById('loc-status-badge');
  const icon = document.getElementById('loc-status-icon');
  const label = document.getElementById('loc-status-text');
  if (!badge || !label) return;

  badge.className = 'loc-status-badge';
  if (type === 'detecting') {
    badge.classList.add('detecting');
    if (icon) icon.innerHTML = '<svg style="animation: spin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>';
  } else if (type === 'error') {
    badge.classList.add('error');
    if (icon) icon.innerHTML = '⚠️';
  } else {
    if (icon) icon.innerHTML = '✓';
  }
  label.textContent = text;
}

// GESTIÓN DE CACHÉ DE COORDENADAS PARA MÁXIMA VELOCIDAD Y AHORRO DE BATERÍA
function getCachedLocationCoords() {
  try {
    const raw = localStorage.getItem('buchisapa_last_known_coords');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

function setCachedLocationCoords(lat, lng, accuracy = 15, address = '') {
  try {
    const data = {
      lat,
      lng,
      accuracy,
      address,
      timestamp: Date.now()
    };
    localStorage.setItem('buchisapa_last_known_coords', JSON.stringify(data));
  } catch (e) {}
}

function updateDeviceGpsBadge(isActive, accuracy = null) {
  const badge = document.getElementById('btn-device-gps-status');
  if (!badge) return;
  if (isActive) {
    badge.style.background = '#ecfdf5';
    badge.style.borderColor = '#a7f3d0';
    badge.style.color = '#047857';
    const acc = accuracy ? ` (±${accuracy}m)` : '';
    badge.innerHTML = `<span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981;"></span><span>GPS Activo${acc}</span>`;
  } else {
    badge.style.background = '#fef2f2';
    badge.style.borderColor = '#fecaca';
    badge.style.color = '#b91c1c';
    badge.innerHTML = `<span style="width: 7px; height: 7px; border-radius: 50%; background: #ef4444;"></span><span>GPS Desactivado</span>`;
  }
}

function openDeviceGpsModal() {
  const modal = document.getElementById('device-gps-diag-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
  updateDeviceGpsModalData();
}

function closeDeviceGpsModal() {
  const modal = document.getElementById('device-gps-diag-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function updateDeviceGpsModalData() {
  const sensorEl = document.getElementById('index-diag-sensor-state');
  const permEl = document.getElementById('index-diag-perm-state');
  const coordsEl = document.getElementById('index-diag-coords');
  const accEl = document.getElementById('index-diag-accuracy');
  const speedEl = document.getElementById('index-diag-speed');
  const timeEl = document.getElementById('index-diag-time');

  const isActive = hasLiveClientGpsSignal && Boolean(currentCoords?.lat && currentCoords?.lng);

  if (sensorEl) {
    sensorEl.innerHTML = isActive
      ? '<span style="color: #34d399;">● Activo y Transmitiendo</span>'
      : '<span style="color: #f87171;">○ Inactivo / Sin Coordenadas</span>';
  }

  if (permEl) {
    const p = sessionStorage.getItem('buchisapa_loc_permission') || 'Concedido';
    permEl.textContent = p === 'denied' ? 'Denegado' : (p === 'always' ? 'Concedido permanente' : 'Concedido');
    permEl.style.color = p === 'denied' ? '#f87171' : '#38bdf8';
  }

  if (coordsEl && currentCoords?.lat && currentCoords?.lng) {
    coordsEl.textContent = `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`;
  }

  if (accEl) {
    const acc = lastKnownClientPos?.coords?.accuracy || 12;
    accEl.textContent = `± ${Math.round(acc)} metros`;
  }

  if (speedEl) {
    const spd = lastKnownClientPos?.coords?.speed;
    if (typeof spd === 'number' && spd > 0.5) {
      speedEl.textContent = `${(spd * 3.6).toFixed(1)} km/h`;
    } else {
      speedEl.textContent = '0.0 km/h (Estático)';
    }
  }

  if (timeEl) {
    const d = new Date();
    timeEl.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

function isLocationModalVisible() {
  const modal = document.getElementById('location-modal');
  if (!modal) return false;
  return modal.classList.contains('active') || modal.classList.contains('open') || modal.style.display === 'flex' || modal.style.display === 'block';
}

function stopLiveGeolocationWatch() {
  if (liveGeolocationWatchId !== null && navigator.geolocation) {
    try {
      navigator.geolocation.clearWatch(liveGeolocationWatchId);
    } catch (e) {}
    liveGeolocationWatchId = null;
  }
}

// Pausar automáticamente el GPS en segundo plano cuando la pestaña se minimiza o oculta
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopLiveGeolocationWatch();
  } else if (isLocationModalVisible()) {
    startLiveGeolocationWatch();
  }
});

function startLiveGeolocationWatch() {
  if (!navigator.geolocation) {
    console.warn('Geolocalización no disponible en el navegador');
    return;
  }

  // REGLA CLAVE: Solo ejecutar watchPosition si el modal de ubicación está visible
  if (!isLocationModalVisible()) {
    stopLiveGeolocationWatch();
    return;
  }

  // Evitar duplicar observadores activos
  if (liveGeolocationWatchId !== null) {
    try {
      navigator.geolocation.clearWatch(liveGeolocationWatchId);
    } catch (e) {}
    liveGeolocationWatchId = null;
  }

  const watchOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  const handlePositionSuccess = async (pos) => {
    lastKnownClientPos = pos;
    hasLiveClientGpsSignal = true;

    // Si el usuario cerró el modal mientras recibíamos señal, cancelar inmediatamente
    if (!isLocationModalVisible()) {
      stopLiveGeolocationWatch();
      return;
    }

    const rawLat = pos.coords.latitude;
    const rawLng = pos.coords.longitude;
    const safe = getSafeCoords(rawLat, rawLng);
    const lat = safe.lat;
    const lng = safe.lng;
    const accuracy = Math.round(pos.coords.accuracy || 15);

    currentCoords = { lat, lng };

    // Actualizar badge de dispositivo y modal
    updateDeviceGpsBadge(true, accuracy);
    updateDeviceGpsModalData();

    // 1. Actualizar coordenadas del mapa Leaflet instantáneamente
    if (locMap) {
      locMap.panTo([lat, lng], { animate: true, duration: 0.4 });
      if (locMarker) locMarker.setLatLng([lat, lng]);
    }

    // 2. Actualizar campo de entrada GPS
    const gpsInput = document.getElementById('loc-gps-input');
    if (gpsInput) {
      gpsInput.value = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }

    // 3. Resolver dirección rápida mediante Geocodificación Inversa
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    let resolvedAddress = 'Ate, Lima, Perú';
    let shortStreet = 'Lima';

    if (clientAppGeocodeCache.has(cacheKey)) {
      resolvedAddress = clientAppGeocodeCache.get(cacheKey);
      shortStreet = resolvedAddress.split(',')[0].trim();
    } else {
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.address) {
            resolvedAddress = data.address;
            shortStreet = resolvedAddress.split(',')[0].trim();
            clientAppGeocodeCache.set(cacheKey, resolvedAddress);
          }
        }
      } catch (e) {
        console.warn('Reverse geocode error en live watch:', e);
      }
    }

    // Guardar en caché persistente de coordenadas
    setCachedLocationCoords(lat, lng, accuracy, resolvedAddress);

    // 4. Mantener fija la etiqueta superior oficial #selected-location-label
    const label = document.getElementById('selected-location-label');
    if (label) {
      label.textContent = 'Recojo en Santa Clara';
    }

    // 5. Actualizar inputs de dirección
    const addrInput = document.getElementById('loc-address-input');
    if (addrInput && (!addrInput.value || addrInput.value.includes('Huaycán') || addrInput.value.includes('Santa Clara'))) {
      addrInput.value = resolvedAddress;
    }

    const custAddr = document.getElementById('cust-address');
    const orderType = localStorage.getItem('buchisapa_order_type') || 'delivery';
    if (custAddr && !custAddr.value && orderType !== 'pickup') {
      custAddr.value = resolvedAddress;
    }

    // 6. Actualizar status badge
    updateLocStatus(`✓ GPS en tiempo real (±${accuracy}m)`, 'success');
  };

  const handlePositionError = (err) => {
    console.warn('watchPosition aviso:', err.message);
  };

  try {
    liveGeolocationWatchId = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      watchOptions
    );
  } catch (err) {
    console.error('Error al iniciar watchPosition:', err);
  }
}

function triggerLocationDetection(forcePrompt = false, precision = 'precise') {
  updateLocStatus('⏳ Detectando tu ubicación en tiempo real...', 'detecting');

  // 1. Usar inmediatamente coordenadas de caché previas para respuesta ultra rápida sin lag
  const cached = getCachedLocationCoords();
  if (cached && typeof cached.lat === 'number' && typeof cached.lng === 'number') {
    updateLocationFromCoords(cached.lat, cached.lng, false, cached.address || null);
    updateLocStatus(`✓ Ubicación sincronizada (±${cached.accuracy || 15}m)`, 'success');
  }

  if (navigator.geolocation) {
    // 2. Obtención de señal GPS actualizada directamente
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        lastKnownClientPos = pos;
        hasLiveClientGpsSignal = true;

        let lat = pos.coords.latitude;
        let lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 15);

        updateDeviceGpsBadge(true, accuracy);
        updateDeviceGpsModalData();

        if (precision === 'approx') {
          lat = Math.round(lat * 150) / 150;
          lng = Math.round(lng * 150) / 150;
        }

        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        let detectedAddress = '';

        if (clientAppGeocodeCache.has(cacheKey)) {
          detectedAddress = clientAppGeocodeCache.get(cacheKey);
        } else {
          try {
            // 1. Intentar backend geocoding ultra rápido
            const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.success && data.address) {
                detectedAddress = data.address;
                clientAppGeocodeCache.set(cacheKey, detectedAddress);
              }
            } else {
              // 2. Fallback a OpenStreetMap
              const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
              if (resp.ok) {
                const data = await resp.json();
                if (data) {
                  const a = data.address || {};
                  const street = a.road || a.pedestrian || a.street || a.residential || a.footway || a.path || a.avenue || a.square || a.commercial || a.building || a.neighbourhood || '';
                  const district = a.suburb || a.city_district || a.district || a.neighbourhood || a.quarter || a.municipality || a.county || a.borough || a.town || a.village || '';
                  const city = a.city || a.town || a.municipality || a.province || a.state || 'Lima';
                  const country = a.country || 'Perú';

                  if (data.display_name) {
                    const rawParts = data.display_name.split(',').map(s => s.trim()).filter(Boolean);
                    if (rawParts.length >= 2) {
                      const filtered = rawParts.filter(p => !/^\d{4,5}$/.test(p));
                      const cleanStreet = filtered[0] || street || 'Ubicación seleccionada';
                      const cleanArea = filtered.slice(1, 4).join(', ');
                      detectedAddress = `${cleanStreet}, ${cleanArea}`;
                    }
                  }

                  if (!detectedAddress) {
                    const parts = [street, district, city, country].filter(Boolean);
                    detectedAddress = parts.length > 0 ? parts.join(', ') : `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                  }
                  clientAppGeocodeCache.set(cacheKey, detectedAddress);
                }
              }
            }
          } catch (e) {
            console.warn('Geocoding en línea no disponible, usando aproximación:', e);
          }
        }

        if (!detectedAddress) {
          detectedAddress = `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}), Lima, Perú`;
        }

        setCachedLocationCoords(lat, lng, accuracy, detectedAddress);
        updateLocationFromCoords(lat, lng, false, detectedAddress);
        updateLocStatus(`✓ Ubicación detectada en tiempo real (±${accuracy}m)`, 'success');

        // Solo iniciar watchPosition si el modal está visible
        if (isLocationModalVisible()) {
          startLiveGeolocationWatch();
        }

        if (window.BuchisapaPush) {
          window.BuchisapaPush.playChime();
        }
      },
      (err) => {
        console.log('GPS nativo tardó o no disponible:', err.message);
        hasLiveClientGpsSignal = false;
        updateDeviceGpsBadge(false);
        updateDeviceGpsModalData();

        if (err.code === 1) {
          sessionStorage.setItem('buchisapa_loc_permission', 'denied');
          // Permiso denegado: mostrar banner amigable con guía de instrucciones
          setGpsDeniedBanner(true, 'El navegador bloqueó los permisos de GPS. Haz clic en "¿Cómo activar el GPS?" para ver la solución.');
          updateLocStatus('⚠️ Acceso GPS denegado en tu navegador', 'error');
        } else if (err.code === 2) {
          // Posición no disponible
          setGpsDeniedBanner(true, 'No se pudo obtener la señal GPS del dispositivo. Comprueba tu conexión o ajusta el pin en el mapa.');
          updateLocStatus('⚠️ Señal GPS no disponible en tu equipo', 'error');
        } else if (err.code === 3) {
          // Timeout
          setGpsDeniedBanner(true, 'El GPS tardó demasiado en responder. Puedes reintentar o ingresar tu calle manualmente.');
          updateLocStatus('⚠️ Tiempo de espera GPS agotado', 'error');
        } else {
          setGpsDeniedBanner(true, 'No se pudo detectar tu ubicación. Puedes ingresar tu dirección manualmente.');
        }

        const fallbackLat = -12.01635;
        const fallbackLng = -76.88455;
        updateLocationFromCoords(fallbackLat, fallbackLng, false, 'Av. La Estrella con Calle 28 de Julio (Santa Clara), Ate, Lima');
        if (err.code !== 1 && err.code !== 2 && err.code !== 3) {
          updateLocStatus('✓ Ubicación predeterminada establecida (Ate, Lima)', 'success');
        }
        if (window.BuchisapaPush) window.BuchisapaPush.playChime();
      },
      {
        enableHighAccuracy: precision !== 'approx',
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    updateLocationFromCoords(-12.01635, -76.88455, false, 'Av. La Estrella con Calle 28 de Julio (Santa Clara), Ate, Lima');
    updateLocStatus('✓ Ubicación predeterminada establecida (Ate, Lima)', 'success');
  }
}

function updateLocationFromCoords(lat, lng, shouldReverseGeocode = false, forcedAddress = null) {
  const safe = getSafeCoords(lat, lng);
  lat = safe.lat;
  lng = safe.lng;
  currentCoords = { lat, lng };

  // Actualizar input GPS
  const gpsInput = document.getElementById('loc-gps-input');
  if (gpsInput) {
    gpsInput.value = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  // Actualizar input de dirección si fue forzado
  const addrInput = document.getElementById('loc-address-input');
  if (forcedAddress && addrInput) {
    addrInput.value = forcedAddress;
  }

  // Mantener fija la etiqueta superior oficial #selected-location-label
  if (forcedAddress) {
    const label = document.getElementById('selected-location-label');
    if (label) {
      label.textContent = 'Recojo en Santa Clara';
    }
  }

  // Actualizar mapa
  if (locMap) {
    locMap.panTo([lat, lng], { animate: true, duration: 0.5 });
    if (locMarker) locMarker.setLatLng([lat, lng]);
  }

  // Geocodificación inversa con debounce al arrastrar el marcador
  if (shouldReverseGeocode && !forcedAddress) {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (clientAppGeocodeCache.has(cacheKey)) {
      const cachedAddr = clientAppGeocodeCache.get(cacheKey);
      if (addrInput) addrInput.value = cachedAddr;
      const label = document.getElementById('selected-location-label');
      if (label) {
        label.textContent = 'Recojo en Santa Clara';
      }
      updateLocStatus('✓ Pin de entrega ajustado en el mapa', 'success');
      return;
    }

    if (reverseGeocodeTimeout) clearTimeout(reverseGeocodeTimeout);
    reverseGeocodeTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.address) {
            if (addrInput) addrInput.value = data.address;
            clientAppGeocodeCache.set(cacheKey, data.address);
            const label = document.getElementById('selected-location-label');
            if (label) {
              label.textContent = 'Entrega en Santa Clara';
            }
            updateLocStatus('✓ Pin de entrega ajustado en el mapa', 'success');
            return;
          }
        }
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (resp.ok) {
          const data = await resp.json();
          if (data) {
            const a = data.address || {};
            const street = a.road || a.pedestrian || a.street || a.residential || a.footway || a.path || a.avenue || a.square || a.commercial || a.building || a.neighbourhood || '';
            const district = a.suburb || a.city_district || a.district || a.neighbourhood || a.quarter || a.municipality || a.county || a.borough || a.town || a.village || '';
            const city = a.city || a.town || a.municipality || a.province || a.state || 'Lima';
            const country = a.country || 'Perú';

            let formatted = '';
            if (data.display_name) {
              const rawParts = data.display_name.split(',').map(s => s.trim()).filter(Boolean);
              if (rawParts.length >= 2) {
                const filtered = rawParts.filter(p => !/^\d{4,5}$/.test(p));
                const cleanStreet = filtered[0] || street || 'Ubicación seleccionada';
                const cleanArea = filtered.slice(1, 4).join(', ');
                formatted = `${cleanStreet}, ${cleanArea}`;
              }
            }

            if (!formatted) {
              const parts = [street, district, city, country].filter(Boolean);
              formatted = parts.length > 0 ? parts.join(', ') : `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            }

            if (addrInput) addrInput.value = formatted;
            clientAppGeocodeCache.set(cacheKey, formatted);
            const label = document.getElementById('selected-location-label');
            if (label) {
              label.textContent = 'Recojo en Santa Clara';
            }
          }
        }
        updateLocStatus('✓ Pin de entrega ajustado en el mapa', 'success');
      } catch (e) {
        updateLocStatus('✓ Ubicación ajustada en el mapa', 'success');
      }
    }, 300);
  }
}

function clearAddressField() {
  const addrInput = document.getElementById('loc-address-input');
  if (addrInput) {
    addrInput.value = '';
    addrInput.focus();
    updateLocStatus('📍 Ingresa tu dirección exacta', 'normal');
  }
}

function clearLocationInput() {
  clearAddressField();
  updateLocStatus('📍 Escribe tu dirección o haz clic en el mapa', 'normal');
}

function onAddressInputChanged(val) {
  if (val.trim()) {
    updateLocStatus('✓ Dirección ingresada manualmente', 'success');
  } else {
    updateLocStatus('📍 Ingresa tu dirección exacta', 'normal');
  }
}

function setAddressTag(tagName) {
  const tagInput = document.getElementById('loc-tag-input');
  if (tagInput) tagInput.value = tagName;
  highlightTagChip(tagName);
}

function highlightTagChip(tagName) {
  document.querySelectorAll('.loc-chip').forEach(chip => {
    if (chip.textContent.includes(tagName)) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function toggleMapExpand() {
  const container = document.getElementById('loc-map-container');
  if (!container) return;
  container.classList.toggle('expanded');
  if (locMap) {
    setTimeout(() => locMap.invalidateSize(), 260);
  }
}

function confirmDeliveryAddress() {
  const addrInput = document.getElementById('loc-address-input');
  const gpsInput = document.getElementById('loc-gps-input');
  const tagInput = document.getElementById('loc-tag-input');
  const phoneInput = document.getElementById('loc-phone-input');

  const address = addrInput?.value.trim() || 'Avenida 15 de Julio, Huaycán, Ate, Perú';
  const gps = gpsInput?.value.trim() || `GPS: ${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}`;
  const tag = tagInput?.value.trim() || 'Mi casa';
  const phone = phoneInput?.value.trim() || '';

  if (!address) {
    if (window.BuchisapaPush) {
      window.BuchisapaPush.showToast({
        title: 'Dirección Requerida',
        message: 'Por favor ingresa tu dirección de entrega.',
        stage: 'cancelado',
        icon: '⚠️'
      });
    } else {
      alert('Por favor ingresa tu dirección de entrega.');
    }
    return;
  }

  // Guardar en almacenamiento local
  localStorage.setItem('buchisapa_delivery_address', address);
  localStorage.setItem('buchisapa_delivery_gps', gps);
  localStorage.setItem('buchisapa_delivery_tag', tag);
  if (phone) localStorage.setItem('buchisapa_delivery_phone', phone);
  localStorage.setItem('buchisapa_order_type', 'delivery');
  localStorage.setItem('buchisapa_location', 'Lima');

  // Mantener fija la etiqueta superior oficial #selected-location-label
  const label = document.getElementById('selected-location-label');
  if (label) {
    label.textContent = 'Recojo en Santa Clara';
  }

  // Pre-llenar checkout si el formulario está abierto o se abre luego
  const custAddr = document.getElementById('cust-address');
  const custPhone = document.getElementById('cust-phone');
  if (custAddr) custAddr.value = address;
  if (custPhone && phone && !custPhone.value) custPhone.value = phone;

  // Cerrar modal
  closeLocationModal();

  // Notificación de éxito
  if (window.BuchisapaPush) {
    window.BuchisapaPush.showToast({
      title: '✓ Ubicación Verificada',
      message: `${tag ? tag + ': ' : ''}${address}`,
      stage: 'en_camino',
      icon: '🛵'
    });
  }
}

function confirmPickupStore() {
  localStorage.setItem('buchisapa_order_type', 'pickup');
  localStorage.setItem('buchisapa_pickup_store', 'Restaurante Buchisapa - Sede Santa Clara');
  localStorage.setItem('buchisapa_delivery_address', 'Av. La Estrella con Calle 28 de Julio (Esquina de la posta, a 1 cuadra del Real Plaza Santa Clara), Ate, Lima 🇵🇪');
  localStorage.setItem('buchisapa_location', 'Santa Clara, Ate');
  localStorage.setItem('buchisapa_delivery_gps', 'GPS: -12.01635, -76.88455');

  const label = document.getElementById('selected-location-label');
  if (label) {
    label.textContent = 'Recojo en Santa Clara';
  }

  const custAddr = document.getElementById('cust-address');
  if (custAddr) {
    custAddr.value = 'Av. La Estrella con Calle 28 de Julio (Esquina de la posta, a 1 cuadra del Real Plaza Santa Clara), Ate, Lima 🇵🇪';
  }

  if (window.BuchisapaCart) {
    window.BuchisapaCart.orderType = 'pickup';
    window.BuchisapaCart.deliveryFee = 0.00;
    window.BuchisapaCart.updateUI();
  }

  closeLocationModal();

  if (window.BuchisapaPush) {
    window.BuchisapaPush.showToast({
      title: '✓ Recojo en Tienda Seleccionado',
      message: 'Av. La Estrella con Calle 28 de Julio · Horario: 6:00 PM - 5:00 AM',
      stage: 'preparando',
      icon: '🏪'
    });
  }
}

function selectLocation(cityName) {
  openLocationModal();
}

// Exportar globalmente para eventos onclick del HTML
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.switchLocationTab = switchLocationTab;
window.setPermPrecision = setPermPrecision;
window.closeDevicePermDialog = closeDevicePermDialog;
window.acceptDeviceLocation = acceptDeviceLocation;
window.denyDeviceLocation = denyDeviceLocation;
window.triggerLocationDetection = triggerLocationDetection;
window.clearAddressField = clearAddressField;
window.clearLocationInput = clearLocationInput;
window.onAddressInputChanged = onAddressInputChanged;
window.setAddressTag = setAddressTag;
window.toggleMapExpand = toggleMapExpand;
window.confirmDeliveryAddress = confirmDeliveryAddress;
window.confirmPickupStore = confirmPickupStore;
window.selectLocation = selectLocation;
window.startLiveGeolocationWatch = startLiveGeolocationWatch;

function normalizeText(str) {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* =========================================================
   BÚSQUEDA Y CATEGORÍAS (DISEÑO EXACTO BUCHISAPA)
   ========================================================= */
function onSearchInputFocused() {
  const input = document.getElementById('main-search-input');
  const query = (input ? input.value : '').trim();
  if (query.length > 0) {
    enterSearchMode(query);
  }
}

function onSearchInputChanged(query) {
  const cleanQuery = (query || '').trim();
  
  // Sincronizar campos de búsqueda de móvil y desktop
  const mobInput = document.getElementById('main-search-input');
  const deskInput = document.getElementById('desktop-search-input');
  if (mobInput && mobInput.value !== query) mobInput.value = query;
  if (deskInput && deskInput.value !== query) deskInput.value = query;

  const mobClearBtn = document.getElementById('search-clear-btn');
  const deskClearBtn = document.getElementById('desktop-search-clear-btn');
  if (mobClearBtn) mobClearBtn.style.display = cleanQuery.length > 0 ? 'flex' : 'none';
  if (deskClearBtn) deskClearBtn.style.display = cleanQuery.length > 0 ? 'flex' : 'none';
  
  if (cleanQuery.length > 0) {
    enterSearchMode(cleanQuery);
  } else {
    // Si el campo está vacío o se borró el texto, restaurar el index sin cerrar la barra
    hideSearchResultsAndShowMain();
  }
}

function clearSearchInput() {
  const mobInput = document.getElementById('main-search-input');
  const deskInput = document.getElementById('desktop-search-input');
  if (mobInput) mobInput.value = '';
  if (deskInput) deskInput.value = '';

  const mobClearBtn = document.getElementById('search-clear-btn');
  const deskClearBtn = document.getElementById('desktop-search-clear-btn');
  if (mobClearBtn) mobClearBtn.style.display = 'none';
  if (deskClearBtn) deskClearBtn.style.display = 'none';

  hideSearchResultsAndShowMain();
}

function hideSearchResultsAndShowMain() {
  isSearchMode = false;
  const searchSec = document.getElementById('search-results-section');
  const catSec = document.getElementById('category-banners-section');
  const heroSec = document.querySelector('.hero-carousel-container');

  if (searchSec) {
    searchSec.style.display = 'none';
    searchSec.classList.add('is-hidden');
  }
  if (catSec) catSec.style.display = 'flex';
  if (heroSec) heroSec.style.display = 'block';
}

function toggleSearchBar(forceState) {
  const searchWrap = document.getElementById('buchisapa-search-bar-wrap');
  const input = document.getElementById('main-search-input');
  
  if (!searchWrap) return;

  const isCurrentlyOpen = searchWrap.classList.contains('search-bar-visible') || searchWrap.classList.contains('mobile-search-visible') || searchWrap.style.display === 'block';
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

  if (shouldOpen) {
    searchWrap.style.display = 'block';
    searchWrap.classList.add('search-bar-visible', 'mobile-search-visible');
    const closeBtn = document.getElementById('search-close-action-btn');
    if (closeBtn) closeBtn.style.display = 'block';

    if (input) {
      setTimeout(() => {
        input.focus();
      }, 50);
      const query = input.value.trim();
      if (query.length > 0) {
        enterSearchMode(query);
      }
    }
  } else {
    searchWrap.style.display = 'none';
    searchWrap.classList.remove('search-bar-visible', 'mobile-search-visible');
    exitSearchMode();
  }
}

function focusSearchInput() {
  toggleSearchBar(true);
}

function enterSearchMode(query) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    hideSearchResultsAndShowMain();
    return;
  }

  isSearchMode = true;
  const searchSec = document.getElementById('search-results-section');
  const catSec = document.getElementById('category-banners-section');
  const heroSec = document.querySelector('.hero-carousel-container');
  const closeBtn = document.getElementById('search-close-action-btn');

  if (searchSec) {
    searchSec.style.display = 'block';
    searchSec.classList.remove('is-hidden');
  }
  if (catSec) catSec.style.display = 'none';
  if (heroSec) heroSec.style.display = 'none';
  if (closeBtn) closeBtn.style.display = 'block';

  const normQuery = normalizeText(cleanQuery);
  const titleEl = document.getElementById('search-view-title');

  if (titleEl) titleEl.textContent = `Resultados para "${cleanQuery}"`;
  renderSearchResultsList(normQuery, `Coincidencias:`);
}

function exitSearchMode() {
  isSearchMode = false;
  const searchSec = document.getElementById('search-results-section');
  const catSec = document.getElementById('category-banners-section');
  const heroSec = document.querySelector('.hero-carousel-container');
  const input = document.getElementById('main-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const closeBtn = document.getElementById('search-close-action-btn');
  const searchWrap = document.getElementById('buchisapa-search-bar-wrap');

  if (input) input.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  if (closeBtn) closeBtn.style.display = 'none';
  if (searchWrap) {
    searchWrap.style.display = 'none';
    searchWrap.classList.remove('search-bar-visible', 'mobile-search-visible');
  }

  if (searchSec) {
    searchSec.style.display = 'none';
    searchSec.classList.add('is-hidden');
  }
  if (catSec) catSec.style.display = 'grid';
  if (heroSec) heroSec.style.display = 'block';

  // Resaltar pill "Todas"
  document.querySelectorAll('.quick-cat-btn').forEach(btn => btn.classList.remove('active'));
  const allBtn = document.querySelector('.quick-cat-btn');
  if (allBtn) allBtn.classList.add('active');

  const titleWrap = document.getElementById('main-section-title-wrap');
  if (titleWrap) titleWrap.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToCategoryBanners() {
  const catSec = document.getElementById('category-banners-section');
  if (catSec) {
    catSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
window.scrollToCategoryBanners = scrollToCategoryBanners;

function openCategoryView(catId, catTitle) {
  isSearchMode = true;
  const searchSec = document.getElementById('search-results-section');
  const catSec = document.getElementById('category-banners-section');
  const heroSec = document.querySelector('.hero-carousel-container');
  const titleEl = document.getElementById('search-view-title');
  const titleWrap = document.getElementById('main-section-title-wrap');
  const container = document.getElementById('search-view-list');
  const input = document.getElementById('main-search-input');
  const closeBtn = document.getElementById('search-close-action-btn');

  if (input) input.value = '';
  if (searchSec) {
    searchSec.style.display = 'block';
    searchSec.classList.remove('is-hidden');
  }
  if (catSec) catSec.style.display = 'none';
  if (heroSec) heroSec.style.display = 'none';
  if (titleWrap) titleWrap.style.display = 'none';
  if (closeBtn) closeBtn.style.display = 'block';

  // Sincronizar active state en quick category pills
  document.querySelectorAll('.quick-cat-btn').forEach(btn => {
    const text = btn.textContent.toLowerCase();
    const target = (catId || catTitle || '').toLowerCase();
    if (text.includes(target) || (target.includes('amazon') && text.includes('amazónico'))) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const displayTitle = (catTitle || catId || 'PLATOS').toUpperCase();
  if (titleEl) titleEl.textContent = displayTitle;

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const items = getAllProducts();
  const rawTarget = normalizeText(catId || catTitle || '');

  const filtered = items.filter(p => {
    const pCatId = normalizeText(p.category_id || '');
    const pCatName = normalizeText(p.category || '');
    const pName = normalizeText(p.name || '');

    // Coincidencia exacta
    if (pCatId === rawTarget || pCatName === rawTarget) return true;

    // Platos Amazónicos / Selva
    if (rawTarget.includes('amazon') || rawTarget.includes('selva')) {
      return pCatId.includes('amazon') || pCatId.includes('selva') || 
             pCatName.includes('amazon') || pCatName.includes('selva') ||
             pName.includes('tacacho') || pName.includes('cecina') || pName.includes('juane') || pName.includes('patacon') || pName.includes('chilcano') || pName.includes('palometa');
    }

    // Hamburguesas
    if (rawTarget.includes('hamburg') || rawTarget.includes('burger')) {
      return pCatId.includes('hamburg') || pCatId.includes('burger') || 
             pCatName.includes('hamburg') || pCatName.includes('burger');
    }

    // Broaster
    if (rawTarget.includes('broaster') && !rawTarget.includes('salchi')) {
      return (pCatId.includes('broaster') || pCatName.includes('broaster') || pCatName.includes('pollo')) && !pCatName.includes('salchi');
    }

    // Salchipapas y Salchibroasters
    if (rawTarget.includes('salchi')) {
      return pCatId.includes('salchi') || pCatName.includes('salchi');
    }

    // Alitas
    if (rawTarget.includes('alita')) {
      return pCatId.includes('alita') || pCatName.includes('alita');
    }

    // Bebidas / Gaseosas
    if (rawTarget.includes('bebida') || rawTarget.includes('gaseosa')) {
      return pCatId.includes('bebida') || pCatId.includes('gaseosa') || 
             pCatName.includes('bebida') || pCatName.includes('gaseosa');
    }

    // Refrescos
    if (rawTarget.includes('refresco')) {
      return pCatId.includes('refresco') || pCatName.includes('refresco');
    }

    // Infusiones / Calientes
    if (rawTarget.includes('infusion') || rawTarget.includes('caliente')) {
      return pCatId.includes('infusion') || pCatName.includes('infusion') || 
             pCatId.includes('caliente') || pCatName.includes('caliente');
    }

    // Fallback: coincidencia parcial en nombre de categoría o ID
    return pCatId.includes(rawTarget) || pCatName.includes(rawTarget) || rawTarget.includes(pCatId);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-results-box" style="padding: 40px 16px; text-align: center; grid-column: 1 / -1;">
        <div style="font-size: 36px; margin-bottom: 8px;">🍽️</div>
        <div style="font-weight: 800; font-size: 16px; color: #1e293b; margin-bottom: 4px;">Platos de ${displayTitle}</div>
        <div style="font-size: 13px; color: #64748b;">Estamos preparando nuevas delicias y combos para esta categoría.</div>
      </div>
    `;
    return;
  }

  renderCardsInContainer(filtered, container);
}

function renderSearchResultsList(normQuery, sectionLabel) {
  const container = document.getElementById('search-view-list');
  if (!container) return;

  const items = getAllProducts();

  if (!normQuery) {
    renderCardsInContainer(items, container);
    return;
  }

  // Filtrado ÚNICAMENTE por coincidencia en el nombre del producto (palabras o letras)
  const matches = items.filter(p => {
    const nameN = normalizeText(p.name || '');
    return nameN.includes(normQuery);
  });

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="empty-results-box" style="padding: 40px 16px; text-align: center;">
        <div style="font-size: 36px; margin-bottom: 8px;">🔍</div>
        <div style="font-weight: 800; font-size: 16px; color: #1e293b; margin-bottom: 4px;">No encontramos platos con "${normQuery}"</div>
        <div style="font-size: 13px; color: #64748b;">Intenta buscando por: <strong>Broaster, Tacacho, Cecina, Salchipapa, Hamburguesa, Chaufa o Alitas</strong>.</div>
      </div>
    `;
    return;
  }

  renderCardsInContainer(matches, container);
}

/* =========================================================
   SISTEMA DE FAVORITOS (LOCALSTORAGE PERSISTENTE)
   ========================================================= */
function getFavorites() {
  try {
    const raw = localStorage.getItem('buchisapa_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function isFavorite(productId) {
  const favs = getFavorites();
  return favs.includes(String(productId));
}

function updateFavoritesBadges() {
  const favs = getFavorites();
  const count = favs.length;
  
  const headerBadge = document.getElementById('favorites-count-badge');
  if (headerBadge) {
    headerBadge.textContent = count;
    headerBadge.style.display = count > 0 ? 'flex' : 'none';
  }
  
  const drawerCount = document.getElementById('drawer-favorites-count');
  if (drawerCount) {
    drawerCount.textContent = count;
  }
}

function toggleFavorite(productId, buttonEl) {
  const idStr = String(productId);
  let favs = getFavorites();
  let added = false;
  
  if (favs.includes(idStr)) {
    favs = favs.filter(id => id !== idStr);
    added = false;
  } else {
    favs.push(idStr);
    added = true;
  }
  
  localStorage.setItem('buchisapa_favorites', JSON.stringify(favs));
  updateFavoritesBadges();
  
  // Actualizar todos los botones de este producto en el DOM
  document.querySelectorAll(`.dish-fav-btn-${idStr}`).forEach(btn => {
    if (added) {
      btn.classList.add('active');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', '#dc2626');
        svg.setAttribute('stroke', '#dc2626');
      }
    } else {
      btn.classList.remove('active');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', 'rgba(0,0,0,0.4)');
        svg.setAttribute('stroke', '#ffffff');
      }
    }
  });

  // Si la vista de favoritos está abierta, actualizarla inmediatamente
  const titleEl = document.getElementById('search-view-title');
  const sectionEl = document.getElementById('search-view-section');
  if (sectionEl && sectionEl.style.display !== 'none' && titleEl && titleEl.textContent && titleEl.textContent.includes('FAVORITOS')) {
    goToFavorites();
  }
}

function clearAllFavorites() {
  localStorage.setItem('buchisapa_favorites', JSON.stringify([]));
  updateFavoritesBadges();
  document.querySelectorAll('.btn-fav-heart, [class*="dish-fav-btn-"]').forEach(btn => {
    btn.classList.remove('active');
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', 'rgba(0,0,0,0.4)');
      svg.setAttribute('stroke', '#ffffff');
    }
  });
  goToFavorites();
}
window.clearAllFavorites = clearAllFavorites;

function goToFavorites() {
  const favs = getFavorites();
  const titleEl = document.getElementById('search-view-title');
  const sectionEl = document.getElementById('search-view-section');
  const container = document.getElementById('search-view-list') || document.getElementById('search-results-container') || document.getElementById('search-view-list');
  
  if (titleEl) {
    if (favs.length > 0) {
      titleEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 8px;">
          <span>MIS PLATOS FAVORITOS ❤️ (${favs.length})</span>
          <button type="button" onclick="clearAllFavorites()" style="background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; cursor: pointer; transition: all 0.2s ease;">
            🗑️ Vaciar Todos / Eliminar por completo
          </button>
        </div>
      `;
    } else {
      titleEl.textContent = `MIS PLATOS FAVORITOS ❤️ (0)`;
    }
  }

  if (sectionEl) {
    sectionEl.style.display = 'block';
    sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  if (container) {
    if (favs.length === 0) {
      container.innerHTML = `
        <div class="empty-results-box" style="padding: 36px 16px; text-align: center; width: 100%;">
          <div style="font-size: 42px; margin-bottom: 10px;">❤️</div>
          <div style="font-weight: 800; font-size: 17px; color: #1e293b; margin-bottom: 6px;">Aún no tienes platos favoritos</div>
          <p style="font-size: 13.5px; color: #64748b; margin: 0 0 16px;">Toca el ícono de corazón en cualquier plato para guardarlo aquí y pedirlo más rápido.</p>
          <button onclick="goToPromociones()" style="background: #dc2626; color: #fff; font-weight: 800; font-size: 13.5px; padding: 10px 18px; border: none; border-radius: 9999px; cursor: pointer;">Explorar la Carta</button>
        </div>
      `;
      return;
    }
    
    const allItems = getAllProducts();
    const favProducts = allItems.filter(p => favs.includes(String(p.id)));
    renderCardsInContainer(favProducts, container);
  }
}

function getCategoryBannerFallback(catId) {
  const c = String(catId || '').toLowerCase().trim();
  if (c.includes('hamburguesa') || c.includes('burger')) return '/imagenes/categorias/hamburguesas/banner.jpg';
  if (c.includes('amazon') || c.includes('selva') || c.includes('juane') || c.includes('tacacho') || c.includes('patacon')) return '/imagenes/categorias/platos-amazonicos/banner.jpg';
  if (c.includes('broaster') || c.includes('pollo')) return '/imagenes/categorias/broaster/banner.jpg';
  if (c.includes('alita')) return '/imagenes/categorias/alitas/banner.jpg';
  if (c.includes('salchipapa') || c.includes('salchibroaster')) return '/imagenes/categorias/salchipapas-y-salchibroasters/banner.jpg';
  if (c.includes('bebida') || c.includes('gaseosa')) return '/imagenes/categorias/bebidas/banner.jpg';
  if (c.includes('refresco') || c.includes('jugo') || c.includes('chicha') || c.includes('cocona') || c.includes('aguajina')) return '/imagenes/categorias/refrescos/banner.jpg';
  if (c.includes('infusion') || c.includes('cafe') || c.includes('te')) return '/imagenes/categorias/infusiones/banner.jpg';
  return '/imagenes/portada/portada-1.jpg';
}
window.getCategoryBannerFallback = getCategoryBannerFallback;

function renderCardsInContainer(items, container) {
  if (!container) return;
  const list = Array.isArray(items) ? items : [];

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-results-box">
        <div style="font-size: 36px; margin-bottom: 8px;">🍽️</div>
        <div style="font-weight: 800; font-size: 16px; color: #1e293b; margin-bottom: 4px;">No hay platos disponibles en esta categoría</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(p => {
    const isFav = isFavorite(p.id);
    const catId = p.category_id || p.category || '';
    const fallbackImg = getCategoryBannerFallback(catId);
    const initialImg = p.image || fallbackImg;

    return `
      <div class="buchisapa-dish-card" onclick="openProductDetailModal('${p.id}')" style="cursor: pointer;" title="${p.name || 'Plato'}">
        <div class="dish-card-img-wrap">
          <img 
            src="${initialImg}" 
            alt="${p.name || 'Plato'}" 
            class="dish-card-img lazy-img loaded" 
            loading="lazy" 
            decoding="async" 
            onerror="this.onerror=null; this.src='${fallbackImg}';"
          >
          <button class="dish-favorite-btn dish-fav-btn-${p.id} ${isFav ? 'active' : ''}" type="button" onclick="event.stopPropagation(); toggleFavorite('${p.id}', this)" aria-label="Marcar como favorito" title="${isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#dc2626' : 'rgba(0, 0, 0, 0.4)'}" stroke="${isFav ? '#dc2626' : '#ffffff'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>
        <div class="dish-card-content">
          <div class="dish-card-header">
            ${p.category ? `<div style="font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">${p.category}</div>` : ''}
            <h3 class="dish-card-title" title="${p.name || 'Plato'}">${p.name || 'Plato Buchisapa'}</h3>
          </div>
          <p class="dish-card-desc">${p.description || 'Delicioso plato Buchisapa preparado con ingredientes frescos y el inconfundible toque amazónico.'}</p>
          <div class="dish-card-footer">
            <div class="dish-card-price">S/ ${parseFloat(p.price || 0).toFixed(2)}</div>
            <button class="dish-card-add-btn" type="button" onclick="event.stopPropagation(); openProductDetailModal('${p.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* =========================================================
   CARGA DE CATÁLOGO & AGREGAR AL CARRITO
   ========================================================= */
async function loadCatalog() {
  try {
    let products = [];
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        products = data;
      } else if (data && Array.isArray(data.data)) {
        products = data.data;
      }
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      products = getFallbackProducts();
    }

    currentProducts = Array.isArray(products) ? products : getFallbackProducts();
    allMenuProducts = currentProducts;
    window.currentProducts = currentProducts;
    window.allMenuProducts = allMenuProducts;
    initRealtimeCatalogSync();
  } catch (err) {
    console.warn('Cargando menú predeterminado Buchisapa:', err);
    currentProducts = getFallbackProducts();
    allMenuProducts = currentProducts;
    window.currentProducts = currentProducts;
    window.allMenuProducts = allMenuProducts;
  }
}

let isCatalogSyncStarted = false;
function initRealtimeCatalogSync() {
  if (isCatalogSyncStarted || typeof EventSource === 'undefined') return;
  isCatalogSyncStarted = true;
  try {
    const sse = new EventSource('/api/orders/events');
    sse.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.type === 'stock_update') {
          const p = currentProducts.find(item => item.id === payload.productId);
          if (p) {
            p.available = payload.available;
            if (typeof payload.stock === 'number') p.stock = payload.stock;
          }
        }
      } catch (err) {}
    };
  } catch (err) {}
}

function quickAddToCart(productId, event) {
  if (event) {
    event.stopPropagation();
  }
  if (typeof window.openProductDetailModal === 'function') {
    window.openProductDetailModal(productId);
  } else {
    const list = Array.isArray(currentProducts) ? currentProducts : getFallbackProducts();
    const product = list.find(p => p.id === productId);
    if (product && window.BuchisapaCart) {
      window.BuchisapaCart.addItem(product, 1, ['Ají de Pollería', 'Mayonesa Casera', 'Tártara Especial']);
    }
  }
}

async function openCheckoutModal() {
  if (window.BuchisapaCart) {
    const isValid = await window.BuchisapaCart.checkRealtimeStock(false);
    if (!isValid) {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.playChime();
        window.BuchisapaPush.showToast({
          title: '🚫 Pedido Bloqueado por Stock',
          message: 'Hay productos agotados en tu carrito. Revisa los items marcados en rojo antes de continuar.',
          stage: 'cancelado',
          icon: '⚠️'
        });
      }
      window.BuchisapaCart.openDrawer();
      return;
    }
  }

  const isPickup = (localStorage.getItem('buchisapa_order_type') === 'pickup');
  const custAddr = document.getElementById('cust-address');
  const custPhone = document.getElementById('cust-phone');
  const savedPhone = localStorage.getItem('buchisapa_delivery_phone');

  if (isPickup && custAddr) {
    custAddr.value = 'Av. La Estrella con Calle 28 de Julio (Esquina de la posta, a 1 cuadra del Real Plaza Santa Clara), Ate, Lima 🇵🇪';
  } else if (!isPickup && custAddr && !custAddr.value) {
    custAddr.value = localStorage.getItem('buchisapa_delivery_address') || '';
  }

  if (custPhone && savedPhone && !custPhone.value) {
    custPhone.value = savedPhone;
  }

  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('open');
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
}

async function submitOrder(e) {
  e.preventDefault();

  const cartItems = (window.BuchisapaCart && Array.isArray(window.BuchisapaCart.items)) ? window.BuchisapaCart.items : [];
  if (cartItems.length === 0) {
    alert('Tu carrito está vacío. Agrega platos antes de continuar.');
    return;
  }

  // Verificación estricta de stock en tiempo real antes de procesar el pedido
  if (window.BuchisapaCart) {
    const isStockValid = await window.BuchisapaCart.checkRealtimeStock(false);
    if (!isStockValid) {
      closeCheckoutModal();
      window.BuchisapaCart.openDrawer();
      if (window.BuchisapaPush) {
        window.BuchisapaPush.playChime();
        window.BuchisapaPush.showToast({
          title: '🚫 Stock Agotado',
          message: 'Uno o más platos se agotaron en cocina mientras ingresabas tus datos. El pedido no se procesó.',
          stage: 'cancelado',
          icon: '⚠️'
        });
      }
      return;
    }
  }

  const isPickup = (localStorage.getItem('buchisapa_order_type') === 'pickup');
  const name = document.getElementById('cust-name')?.value;
  const phone = document.getElementById('cust-phone')?.value;
  let address = document.getElementById('cust-address')?.value || '';
  const payment = document.getElementById('cust-payment')?.value || 'yape';
  const notes = document.getElementById('cust-notes')?.value || '';

  const STORE_FULL_ADDRESS = 'Av. La Estrella con Calle 28 de Julio (Esquina de la posta, a 1 cuadra del Real Plaza Santa Clara), Ate, Lima 🇵🇪';
  const STORE_GPS_URL = 'https://maps.google.com/?q=-12.01635,-76.88455';
  const STORE_HOURS = 'Lunes a Domingo, de 6:00 PM a 5:00 AM';

  if (isPickup) {
    address = STORE_FULL_ADDRESS;
  }

  let loggedCustomer = null;
  try {
    const savedCust = localStorage.getItem('buchisapa_customer');
    if (savedCust) loggedCustomer = JSON.parse(savedCust);
  } catch (e) {}

  const subtotal = window.BuchisapaCart ? window.BuchisapaCart.getSubtotal() : 0;
  const deliveryFee = isPickup ? 0.00 : (window.BuchisapaCart?.deliveryFee || 4.00);
  const total = subtotal + deliveryFee;

  const orderPayload = {
    customerName: name,
    customerPhone: phone,
    customerEmail: loggedCustomer?.email || undefined,
    userId: loggedCustomer?.id || undefined,
    deliveryAddress: address,
    orderType: isPickup ? 'pickup' : 'delivery',
    paymentMethod: payment,
    notes: notes,
    items: cartItems.map(it => ({
      item: { id: it.id, name: it.name, price: it.price },
      quantity: it.quantity,
      selectedSauces: it.selectedSauces || it.sauces || []
    })),
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total
  };

  try {
    let createdOrder = null;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.status === 409) {
        // Stock agotado detectado por el backend
        const errJson = await res.json();
        closeCheckoutModal();
        if (window.BuchisapaCart) {
          window.BuchisapaCart.openDrawer();
          window.BuchisapaCart.checkRealtimeStock(false);
        }
        if (window.BuchisapaPush) {
          window.BuchisapaPush.playChime();
          window.BuchisapaPush.showToast({
            title: '🚫 Pedido Rechazado por Stock',
            message: errJson.message || 'Uno o más platos ya no están disponibles en cocina.',
            stage: 'cancelado',
            icon: '⚠️'
          });
        } else {
          alert(errJson.message || 'Uno o más platos ya no están disponibles en cocina.');
        }
        return;
      }

      if (res.ok) {
        const json = await res.json();
        if (json.data) createdOrder = json.data;
      }
    } catch (apiErr) {
      console.warn('Sync order server:', apiErr);
    }

    if (!createdOrder) {
      createdOrder = {
        ...orderPayload,
        id: `ORD-${Date.now()}`,
        orderNumber: Math.floor(100 + Math.random() * 900),
        status: 'recibido'
      };
    }

    // Guardar para persistencia y seguimiento en tiempo real
    localStorage.setItem('buchisapa_last_order', JSON.stringify(createdOrder));

    // Mensaje estructurado de WhatsApp
    let waText = `*NUEVO PEDIDO BUCHISAPA* 🍗🔥%0A`;
    waText += `*Código:* %23${createdOrder.orderNumber || createdOrder.id}%0A`;
    waText += `*Cliente:* ${encodeURIComponent(name || 'Cliente')}%0A`;
    waText += `*Teléfono:* ${encodeURIComponent(phone || '')}%0A`;
    
    if (isPickup) {
      waText += `*Modalidad:* 🏪 RECOJO EN TIENDA (Santa Clara)%0A`;
      waText += `*Local de Recojo:* ${encodeURIComponent(STORE_FULL_ADDRESS)}%0A`;
      waText += `*📍 GPS Local Fijo:* ${encodeURIComponent(STORE_GPS_URL)}%0A`;
      waText += `*Horario Atención:* ${encodeURIComponent(STORE_HOURS)}%0A`;
      waText += `*Costo de Entrega:* S/ 0.00 (Gratis)%0A`;
    } else {
      waText += `*Modalidad:* 🛵 DELIVERY A DOMICILIO%0A`;
      if (address) waText += `*Dirección de Entrega:* ${encodeURIComponent(address)}%0A`;
      const gpsVal = localStorage.getItem('buchisapa_delivery_gps');
      if (gpsVal) waText += `*GPS Entrega:* ${encodeURIComponent(gpsVal)}%0A`;
      waText += `*Costo de Envío:* S/ ${deliveryFee.toFixed(2)}%0A`;
    }

    waText += `*Pago:* ${encodeURIComponent(payment.toUpperCase())}%0A`;
    if (notes) waText += `*Notas:* ${encodeURIComponent(notes)}%0A%0A`;
    waText += `*DETALLE DEL PEDIDO:*%0A`;
    cartItems.forEach(it => {
      waText += `• ${it.quantity}x ${encodeURIComponent(it.name || 'Plato')} - S/ ${((parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1)).toFixed(2)}%0A`;
    });
    waText += `%0A*TOTAL A PAGAR: S/ ${orderPayload.total.toFixed(2)}*`;

    // Limpiar carrito y cerrar modal
    window.BuchisapaCart.clear();
    closeCheckoutModal();
    if (window.BuchisapaCart.closeDrawer) window.BuchisapaCart.closeDrawer();

    // Redirigir a la página completa de seguimiento en tiempo real
    const targetOrderId = createdOrder.id || createdOrder.orderNumber || 'ORD-1001';
    
    // Ofrecer apertura a WhatsApp para enviar el pedido al restaurante
    setTimeout(() => {
      window.open(`https://wa.me/51943312024?text=${waText}`, '_blank');
      window.location.href = `/order-status.html?id=${encodeURIComponent(targetOrderId)}`;
    }, 450);
  } catch (err) {
    console.error('Error registrando pedido:', err);
    window.location.href = '/order-status.html?id=ORD-1001';
  }
}

/* =========================================================
   MENÚ COMPLETO DE BUCHISAPA (FALLBACK LOCAL)
   ========================================================= */
function getFallbackProducts() {
  return [
    {
      id: "ama-1",
      name: "Patacones con Chorizo",
      category_id: "platos-amazonicos",
      category: "platos-amazonicos",
      price: 12.00,
      description: "Patacones crujientes dorados con chorizo ahumado jugoso y crema selvática irresistible tradicional",
      popular: true,
      image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ama-2",
      name: "Tacacho con Cecina",
      category_id: "platos-amazonicos",
      category: "platos-amazonicos",
      price: 12.00,
      description: "Tacacho suave amazónico con cecina ahumada jugosa plátano dulce y sarza criolla",
      popular: true,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ama-3",
      name: "Juanes",
      category_id: "platos-amazonicos",
      category: "platos-amazonicos",
      price: 15.00,
      description: "Juane tradicional jugoso con arroz selvático gallina tierna huevo y maduro frito",
      popular: true,
      image: "/imagenes/categorias/platos-amazonicos/banner.jpg"
    },
    {
      id: "ama-4",
      name: "Chilcano de Carachama o Pescado del Día",
      category_id: "platos-amazonicos",
      category: "platos-amazonicos",
      price: 15.00,
      description: "Chilcano caliente selvático con carachama fresca jugosa yuca suave y culantro aromático",
      popular: false,
      image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ama-5",
      name: "Palometa Frita con Maduro o Plátano",
      category_id: "platos-amazonicos",
      category: "platos-amazonicos",
      price: 15.00,
      description: "Palometa frita crujiente dorada con arroz blanco maduros dulces y salsa criolla",
      popular: true,
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ama-6",
      name: "Caldo Amazónico",
      category_id: "platos-amazonicos",
      category: "platos-amazonicos",
      price: 12.00,
      description: "Caldo amazónico verde aromático con pescado fresco culantro yuca y sabor revitalizante",
      popular: false,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ama-7",
      name: "Arroz Chaufa Amazónico",
      category_id: "platos-amazonicos",
      category: "platos-amazonicos",
      price: 15.00,
      description: "Arroz chaufa amazónico salteado con cecina ahumada chorizo jugoso y toque selvático",
      popular: true,
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-1",
      name: "Clásica",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 10.00,
      description: "Hamburguesa clásica jugosa artesanal con papas crujientes ensalada fresca y cremas caseras",
      popular: true,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-2",
      name: "Choripan",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 10.00,
      description: "Choripan jugoso artesanal con chorizo parrillero papas crujientes ensalada fresca y cremas",
      popular: true,
      image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-3",
      name: "Hawaiana Carne",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 14.00,
      description: "Hamburguesa hawaiana con carne artesanal jugosa piña dulce queso jamón y crema",
      popular: true,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-4",
      name: "Hawaiana Pollo",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 13.00,
      description: "Hamburguesa hawaiana con pollo crispy crujiente piña jugosa queso jamón y crema",
      popular: true,
      image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-5",
      name: "Pollo Deshilachado",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 9.00,
      description: "Hamburguesa suave con pollo deshilachado jugoso papas doradas ensalada fresca y cremas",
      popular: false,
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-6",
      name: "Filete de Pollo",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 11.00,
      description: "Filete pollo dorado crujiente jugoso con papas ensalada fresca y cremas caseras",
      popular: false,
      image: "https://images.unsplash.com/photo-1525164286253-04e68b9d94c6?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-7",
      name: "Cheese Burguer",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 11.00,
      description: "Hamburguesa casera jugosa con doble queso cheddar derretido cremoso y pan suave",
      popular: true,
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-8",
      name: "Bacon Burguer",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 12.00,
      description: "Hamburguesa jugosa con tocino ahumado crujiente papas doradas queso derretido y cremas",
      popular: true,
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-9",
      name: "La Suprema",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 15.00,
      description: "Hamburguesa suprema gigante con tocino queso huevo frito jamón y papas crujientes",
      popular: true,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-10",
      name: "Hamburguesa a lo Pobre",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 14.00,
      description: "Hamburguesa completa pobre con huevo jamón queso plátano frito y cremas caseras",
      popular: true,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-11",
      name: "Royal",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 13.00,
      description: "Hamburguesa royal mixta con carnes selectas chorizo pollo y sabores selváticos únicos",
      popular: true,
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ham-12",
      name: "Royal a lo Pobre",
      category_id: "hamburguesas",
      category: "hamburguesas",
      price: 14.00,
      description: "Hamburguesa royal pobre con carne artesanal huevo jamón queso plátano y cremas",
      popular: true,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "bro-1",
      name: "Pecho",
      category_id: "broaster",
      category: "broaster",
      price: 18.00,
      description: "Pecho broaster gigante crujiente jugoso con arroz blanco papas y ensalada fresca",
      popular: true,
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "bro-2",
      name: "Pierna",
      category_id: "broaster",
      category: "broaster",
      price: 12.00,
      description: "Pierna broaster dorada crujiente jugosa con arroz graneado papas y ensalada fresca",
      popular: true,
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "bro-3",
      name: "Encuentro",
      category_id: "broaster",
      category: "broaster",
      price: 13.00,
      description: "Encuentro broaster mixto crujiente con pecho pierna arroz papas y ensalada completa",
      popular: true,
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "bro-4",
      name: "Ala",
      category_id: "broaster",
      category: "broaster",
      price: 10.00,
      description: "Ala broaster crujiente dorada jugosa con arroz blanco papas y ensalada fresca",
      popular: false,
      image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "sal-1",
      name: "Salchipapa Clásica",
      category_id: "salchipapas",
      category: "salchipapas",
      price: 10.00,
      description: "Salchipapa clásica tradicional con papas crujientes salchicha dorada y cremas caseras abundantes",
      popular: true,
      image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "sal-2",
      name: "Salchipapa a lo Pobre",
      category_id: "salchipapas",
      category: "salchipapas",
      price: 13.00,
      description: "Salchipapa pobre con papas huevo frito plátano maduro salchicha y cremas caseras",
      popular: true,
      image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "sal-3",
      name: "Salchibroaster Pecho",
      category_id: "salchipapas",
      category: "salchipapas",
      price: 20.00,
      description: "Salchibroaster pecho con pollo crujiente jugoso papas doradas ensalada fresca y cremas",
      popular: true,
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "sal-4",
      name: "Salchibroaster Pierna",
      category_id: "salchipapas",
      category: "salchipapas",
      price: 14.00,
      description: "Salchibroaster pierna con pollo jugoso dorado papas crujientes ensalada fresca y cremas",
      popular: true,
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "sal-5",
      name: "Salchibroaster Encuentro",
      category_id: "salchipapas",
      category: "salchipapas",
      price: 16.00,
      description: "Salchibroaster encuentro mixto con pollo broaster variado papas crujientes y cremas abundantes",
      popular: true,
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "sal-6",
      name: "Salchibroaster Ala",
      category_id: "salchipapas",
      category: "salchipapas",
      price: 13.00,
      description: "Salchibroaster ala con pollo crujiente dorado papas fritas ensalada fresca y cremas",
      popular: false,
      image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "sal-7",
      name: "Salchichorizo",
      category_id: "salchipapas",
      category: "salchipapas",
      price: 13.00,
      description: "Salchichorizo potente con chorizo parrillero jugoso papas crujientes y cremas selváticas picantes",
      popular: true,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ali-1",
      name: "Acevichadas",
      category_id: "alitas",
      category: "alitas",
      price: 15.00,
      description: "Alitas acevichadas jugosas con salsa marina cremosa papas doradas y toque cítrico",
      popular: true,
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ali-2",
      name: "BBQ",
      category_id: "alitas",
      category: "alitas",
      price: 15.00,
      description: "Alitas BBQ jugosas ahumadas con salsa dulce intensa papas doradas y limón",
      popular: true,
      image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beb-1",
      name: "Inca Cola",
      category_id: "bebidas",
      category: "bebidas",
      price: 5.00,
      description: "Gaseosa dorada peruana dulce refrescante burbujeante ideal para acompañar cualquier comida diaria",
      popular: true,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beb-2",
      name: "Coca Cola",
      category_id: "bebidas",
      category: "bebidas",
      price: 5.00,
      description: "Gaseosa negra clásica mundial refrescante burbujeante helada perfecta para hamburguesas y broaster",
      popular: true,
      image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beb-3",
      name: "Fanta",
      category_id: "bebidas",
      category: "bebidas",
      price: 3.50,
      description: "Gaseosa naranja dulce burbujeante refrescante helada perfecta para días calurosos intensos siempre",
      popular: false,
      image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beb-4",
      name: "Pepsi",
      category_id: "bebidas",
      category: "bebidas",
      price: 2.00,
      description: "Gaseosa cola refrescante ligera burbujeante helada ideal para acompañar hamburguesas y salchipapas",
      popular: false,
      image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beb-5",
      name: "Agua Cielo",
      category_id: "bebidas",
      category: "bebidas",
      price: 2.50,
      description: "Agua pura cristalina sin gas natural refrescante saludable ideal para hidratarte diariamente",
      popular: false,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ref-1",
      name: "Maracuyá",
      category_id: "refrescos",
      category: "refrescos",
      price: 3.00,
      description: "Refresco tropical maracuyá dulce ácido natural refrescante amazónico energizante y muy revitalizante",
      popular: true,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ref-2",
      name: "Chicha",
      category_id: "refrescos",
      category: "refrescos",
      price: 3.00,
      description: "Refresco morado tradicional dulce andino refrescante natural casero perfecto para platos amazónicos",
      popular: true,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ref-3",
      name: "Cocona",
      category_id: "refrescos",
      category: "refrescos",
      price: 3.00,
      description: "Refresco amazónico cocona cítrico exótico refrescante natural revitalizante ideal para calores intensos",
      popular: true,
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ref-4",
      name: "Aguajina",
      category_id: "refrescos",
      category: "refrescos",
      price: 3.00,
      description: "Refresco amazónico aguaje dulce cremoso refrescante natural nutritivo perfecto para días calurosos",
      popular: true,
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "ref-5",
      name: "Camu Camu",
      category_id: "refrescos",
      category: "refrescos",
      price: 3.00,
      description: "Refresco camu camu ácido vitamínico refrescante amazónico energizante ideal para defensas diarias",
      popular: true,
      image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "inf-1",
      name: "Anís",
      category_id: "infusiones",
      category: "infusiones",
      price: 2.50,
      description: "Infusión caliente anís aromática digestiva relajante suave perfecta después de comidas pesadas",
      popular: false,
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "inf-2",
      name: "Té",
      category_id: "infusiones",
      category: "infusiones",
      price: 2.50,
      description: "Infusión caliente té reconfortante aromático suave ideal para cualquier momento del día",
      popular: false,
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "inf-3",
      name: "Manzanilla",
      category_id: "infusiones",
      category: "infusiones",
      price: 2.50,
      description: "Flores de manzanilla seleccionadas. Calma, descanso y aroma herbal que reconforta el alma.",
      popular: false,
      image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80"
    }
  ];
}

/* =========================================================
   MODAL INFORMATIVO PARA ENLACES DEL FOOTER MÓVIL
   ========================================================= */
const FOOTER_MODAL_DATA = {
  carta: {
    title: "Carta de Salón - Sede Santa Clara - Ate",
    content: `📍 <strong>Sede Santa Clara - Ate:</strong> Santa Clara, Ate - Lima.<br><br>Disfruta en nuestro salón de toda la variedad de platos amazónicos, hamburguesas artesanales, pollos broaster y bebidas preparadas al momento con la mejor atención y comodidad para toda la familia.<br><br>🕒 <em>Horario de Atención en Salón: Lunes a Domingo de 12:00 pm a 11:30 pm</em>`
  },
  historia: {
    title: "Nuestra Historia",
    content: `<strong>BuchiSapa</strong> nació en el corazón de la selva peruana con la pasión de ofrecer auténticos sabores amazónicos y el pollo broaster más crocante y jugoso de la región.<br><br>Desde nuestros inicios, trabajamos con ingredientes frescos del campo amazónico como la cecina ahumada, plátano bellaco, ají charapita y chicha morada casera, brindando una experiencia culinaria inolvidable las 24 horas del día.`
  },
  vision: {
    title: "Nuestra Visión",
    content: `Ser la cadena de pollerías y restaurantes amazónicos más reconocida del Perú, llevando la riqueza y el sabor de nuestra selva a cada rincón con un servicio ágil, moderno y de máxima calidad.`
  },
  valores: {
    title: "Nuestros Valores",
    content: `• <strong>Pasión por el Sabor:</strong> Cuidamos cada receta con amor y sazón tradicional.<br>• <strong>Frescura Garantizada:</strong> Insumos del día seleccionados cuidadosamente.<br>• <strong>Hospitalidad Amazónica:</strong> Trato cálido, rápido y eficiente.<br>• <strong>Compromiso:</strong> Atención ininterrumpida y puntualidad en el delivery.`
  },
  restaurantes: {
    title: "Nuestros Restaurantes",
    content: `📍 <strong>Sede Principal:</strong> Jr. San Martín 450, Tarapoto.<br>📍 <strong>Sede Lima:</strong> Sede de atención y despachos autorizados.<br>📍 <strong>Sede Moyobamba:</strong> Centro de la ciudad.<br><br>🕐 <em>Atención las 24 horas para salón, recojo y delivery.</em>`
  },
  reservas: {
    title: "Reservas de Mesas",
    content: `Para reservar tu mesa en BuchiSapa para cumpleaños, aniversarios o reuniones familiares, escríbenos directamente a nuestro WhatsApp oficial <strong>+51 943 312 024</strong> indicando la fecha, hora y número de comensales. ¡Te esperamos con el mejor ambiente!`
  },
  catering: {
    title: "Servicio de Catering",
    content: `Lleva el sabor de BuchiSapa a tus eventos corporativos, almuerzos de integración o celebraciones privadas. Ofrecemos paquetes especiales de Broaster, Platos Amazónicos, Hamburguesas y Bebidas personalizadas.`
  },
  fiestas: {
    title: "Fiestas Infantiles",
    content: `Celebra el cumpleaños de los más pequeños con combos infantiles deliciosos, nuggets, broaster crispy, papitas sonrientes y refrescos naturales en un espacio cómodo y seguro.`
  },
  giftcards: {
    title: "Vales y Giftcards",
    content: `Sorprende a tus seres queridos o colaboradores con nuestras <strong>Giftcards BuchiSapa</strong> canjeables por cualquiera de nuestros deliciosos platos de la carta.`
  },
  nutricional: {
    title: "Valores Nutricionales",
    content: `En BuchiSapa preparamos nuestras recetas con aceites de alta pureza, pollos frescos de primera calidad y acompañamientos balanceados con ensaladas frescas preparadas al momento.`
  },
  alergenos: {
    title: "Cartilla de Alérgenos",
    content: `Nuestros platos pueden contener trazas de gluten (harina de empanizado), huevo (mayonesa casera), lácteos (cremas de queso) y soya. Si tienes alguna restricción alimentaria o alergia, por favor infórmalo al momento de realizar tu pedido.`
  },
  privacidad: {
    title: "Políticas de Privacidad",
    content: `En cumplimiento con la Ley N° 29733 (Ley de Protección de Datos Personales de Perú), te garantizamos que los datos de contacto y entrega proporcionados serán utilizados exclusivamente para procesar tu pedido y brindarte una mejor atención.`
  },
  terminos: {
    title: "Términos y Condiciones",
    content: `Los precios mostrados en la carta están expresados en Soles (S/) e incluyen impuestos de ley. El tiempo estimado de entrega por delivery es de 25 a 45 minutos sujeto al tráfico y condiciones climáticas.`
  },
  promociones: {
    title: "Términos de Promociones Comerciales",
    content: `Las promociones y combos son válidos hasta agotar stock y no son acumulables con otros descuentos. Válido tanto para consumo en salón como pedidos delivery.`
  },
  terminos_giftcard: {
    title: "Términos Vales y Giftcards",
    content: `Los vales de consumo tienen una vigencia de 6 meses desde su fecha de emisión y son canjeables en cualquiera de nuestras sedes.`
  },
  trabaja: {
    title: "Trabaja con Nosotros",
    content: `¿Te gustaría formar parte de la familia BuchiSapa? Buscamos talentos para cocina, atención al cliente y reparto. Envía tu CV a <strong>buchisapaweb@gmail.com</strong> o comunícate al <strong>943 312 024</strong>.`
  },
  proveedores: {
    title: "Portal de Proveedores",
    content: `Si eres productor local de insumos amazónicos (plátano, cecina, frutas tropicales, especias) o proveedor de empaques ecológicos, escríbenos a <strong>buchisapaweb@gmail.com</strong> para evaluar propuestas comerciales.`
  }
};

window.openFooterInfo = function(type) {
  window.location.href = '/informacion?seccion=' + encodeURIComponent(type || 'historia');
};

window.closeFooterInfoModal = function() {};

window.openEmailVerificationModal = openEmailVerificationModal;
window.closeEmailVerificationModal = closeEmailVerificationModal;
window.handleResendOtpCode = handleResendOtpCode;
window.handleChangeEmailFromOtp = handleChangeEmailFromOtp;
window.submitOtpVerification = submitOtpVerification;
window.switchProfileSubTab = switchProfileSubTab;
window.fetchAndRenderCustomerOrders = fetchAndRenderCustomerOrders;
window.trackCustomerOrder = trackCustomerOrder;
window.repeatCustomerOrder = repeatCustomerOrder;
window.getFallbackProducts = getFallbackProducts;
window.currentProducts = currentProducts;

/* =========================================================
   FILTRADO INTERACTIVO POR TAGS RÁPIDOS
   ========================================================= */
function filterByTag(tag, btnEl) {
  const container = btnEl ? btnEl.parentElement : null;
  if (container) {
    container.querySelectorAll('.tag-filter-pill').forEach(b => b.classList.remove('active'));
  }
  if (btnEl) btnEl.classList.add('active');

  isSearchMode = true;
  const searchSec = document.getElementById('search-results-section');
  const catSec = document.getElementById('category-banners-section');
  const heroSec = document.querySelector('.hero-carousel-container');
  const titleEl = document.getElementById('search-view-title');
  const listContainer = document.getElementById('search-view-list');
  const closeBtn = document.getElementById('search-close-action-btn');

  if (searchSec) {
    searchSec.style.display = 'block';
    searchSec.classList.remove('is-hidden');
  }
  if (catSec) catSec.style.display = 'none';
  if (heroSec) heroSec.style.display = 'none';
  if (closeBtn) closeBtn.style.display = 'block';

  let items = Array.isArray(currentProducts) && currentProducts.length > 0 ? currentProducts : getFallbackProducts();
  currentProducts = items;

  if (tag === 'all') {
    if (titleEl) titleEl.textContent = 'TODOS LOS PLATOS';
    renderCardsInContainer(items, listContainer);
    return;
  }

  const matches = items.filter(p => {
    const name = normalizeText(p.name || '');
    const cat = normalizeText(p.category_id || p.category || '');
    const desc = normalizeText(p.description || '');
    const searchTarget = normalizeText(tag);
    return name.includes(searchTarget) || cat.includes(searchTarget) || desc.includes(searchTarget);
  });

  if (titleEl) titleEl.textContent = `FILTRO: ${tag.toUpperCase()} (${matches.length} PLATOS)`;
  renderCardsInContainer(matches, listContainer);
}

window.filterByTag = filterByTag;
window.updateSelectedLocationHeader = updateSelectedLocationHeader;
window.getFavorites = getFavorites;
window.isFavorite = isFavorite;
window.toggleFavorite = toggleFavorite;
window.goToFavorites = goToFavorites;
window.updateFavoritesBadges = updateFavoritesBadges;

// Inicializar contadores de favoritos en carga
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateFavoritesBadges);
  } else {
    updateFavoritesBadges();
  }
}

