/**
 * RESTAURANTE BUCHISAPA - CONTROLADOR DE AUTENTICACIÓN Y PERFIL (login.js)
 * Manejo de apertura/cierre de modales de ingreso, vistas de registro,
 * recuperación de contraseña, perfil del cliente y verificación OTP.
 */

(function () {
  'use strict';

  window.openLoginModal = function (viewName = 'login') {
    const modal = document.getElementById('login-modal');
    if (!modal) return;

    modal.classList.add('active', 'open');
    document.body.classList.add('search-open');

    if (typeof window.switchAuthView === 'function') {
      window.switchAuthView(viewName);
    }

    // Auto enfocar el primer input
    setTimeout(() => {
      const emailInput = document.getElementById('auth-login-email');
      if (emailInput && viewName === 'login') {
        emailInput.focus();
      }
    }, 120);
  };

  window.closeLoginModal = function (event) {
    if (event && event.target && event.target.id !== 'login-modal' && !event.target.classList.contains('auth-close-btn-top')) {
      // Si el clic fue dentro de la caja sin querer cerrar, evitar cierre
    }
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('active', 'open');
    }
    document.body.classList.remove('search-open');
  };

  window.switchAuthView = function (viewName) {
    const views = ['auth-view-login', 'auth-view-register', 'auth-view-recovery', 'auth-view-profile'];
    views.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const target = document.getElementById(`auth-view-${viewName}`);
    if (target) {
      target.style.display = 'block';
    }

    const topbarTitle = document.getElementById('auth-topbar-title');
    if (topbarTitle) {
      topbarTitle.classList.toggle('is-hidden', viewName !== 'profile');
    }
  };

  window.handleAuthBackNav = function () {
    const profileMain = document.getElementById('profile-screen-main');
    if (profileMain && profileMain.style.display !== 'none') {
      window.closeLoginModal();
    } else {
      window.switchAuthView('login');
    }
  };

  window.closeEmailVerificationModal = function () {
    const modal = document.getElementById('email-verification-modal');
    if (modal) {
      modal.classList.remove('active', 'open');
      modal.style.display = 'none';
    }
  };

  // Inicialización cuando el DOM esté cargado
  document.addEventListener('DOMContentLoaded', () => {
    // Escuchar botón de cierre del modal login
    const closeBtn = document.querySelector('.auth-close-btn-top');
    if (closeBtn) {
      closeBtn.addEventListener('click', window.closeLoginModal);
    }
  });
})();
