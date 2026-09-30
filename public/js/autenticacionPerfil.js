/**
 * RESTAURANTE BUCHISAPA - Lógica de Autenticación y Perfil de Clientes
 * Archivo: /js/autenticacionPerfil.js
 */

let authCurrentView = 'login';
let otpCountdownInterval = null;
let otpTimeRemaining = 45;

function openLoginModal(view = 'login') {
  if (typeof toggleMobileMenu === 'function') {
    toggleMobileMenu(false);
  } else if (typeof closeMobileMenu === 'function') {
    closeMobileMenu();
  }

  const modal = document.getElementById('login-modal');
  if (!modal) return;

  document.body.classList.add('login-modal-open', 'modal-open');
  document.documentElement.classList.add('login-modal-open', 'modal-open');

  const header = document.querySelector('.site-header');
  if (header) header.style.setProperty('display', 'none', 'important');
  const wa = document.querySelector('.floating-whatsapp-btn');
  if (wa) wa.style.setProperty('display', 'none', 'important');

  modal.style.display = 'flex';
  void modal.offsetWidth;
  modal.classList.add('open', 'active');

  switchAuthView(view);
}

function closeLoginModal(event) {
  if (event && event.target && event.target.id !== 'login-modal' && !event.target.closest('.auth-close-btn-top') && !event.target.closest('.auth-window-back-btn')) {
    return;
  }

  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('open', 'active');
    modal.style.display = 'none';
    document.body.classList.remove('login-modal-open', 'modal-open');
    document.documentElement.classList.remove('login-modal-open', 'modal-open');

    const header = document.querySelector('.site-header');
    if (header) header.style.removeProperty('display');
    const wa = document.querySelector('.floating-whatsapp-btn');
    if (wa) wa.style.removeProperty('display');
  }
}

function switchAuthView(view) {
  authCurrentView = view;
  const loginView = document.getElementById('auth-view-login');
  const registerView = document.getElementById('auth-view-register');
  const recoveryView = document.getElementById('auth-view-recovery');
  const profileView = document.getElementById('auth-view-profile');
  const topbarTitle = document.getElementById('auth-topbar-title');
  const backBtn = document.getElementById('auth-global-back-btn');

  if (loginView) loginView.style.display = (view === 'login') ? 'block' : 'none';
  if (registerView) registerView.style.display = (view === 'register') ? 'block' : 'none';
  if (recoveryView) recoveryView.style.display = (view === 'recovery') ? 'block' : 'none';
  if (profileView) profileView.style.display = (view === 'profile') ? 'block' : 'none';

  if (topbarTitle) {
    if (view === 'profile') {
      topbarTitle.textContent = 'Mi Perfil';
      topbarTitle.style.display = 'inline-block';
    } else {
      topbarTitle.style.display = 'none';
    }
  }

  if (backBtn) {
    backBtn.style.display = (view === 'login') ? 'none' : 'flex';
  }
}

function handleAuthBackNav() {
  if (authCurrentView === 'register' || authCurrentView === 'recovery' || authCurrentView === 'profile') {
    switchAuthView('login');
  } else {
    closeLoginModal();
  }
}

function continueAsGuest() {
  closeLoginModal();
  if (window.BuchisapaPush) {
    window.BuchisapaPush.showToast({
      title: 'Modo Invitado',
      message: 'Puedes armar tu pedido y finalizarlo sin registrarte.',
      stage: 'info',
      icon: '🛍️'
    });
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.classList.add('active');
  } else {
    input.type = 'password';
    if (btn) btn.classList.remove('active');
  }
}

// Cerrar con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('login-modal');
    if (modal && (modal.classList.contains('open') || modal.classList.contains('active'))) {
      closeLoginModal();
    }
  }
});

// Exponer en window
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.switchAuthView = switchAuthView;
window.handleAuthBackNav = handleAuthBackNav;
window.continueAsGuest = continueAsGuest;
window.togglePasswordVisibility = togglePasswordVisibility;
