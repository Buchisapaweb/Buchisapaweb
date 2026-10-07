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

  window.handleAuthLoginSubmit = async function (event) {
    if (event) event.preventDefault();
    const alertEl = document.getElementById('auth-login-alert');
    const submitBtn = document.getElementById('auth-submit-btn-login');
    const email = document.getElementById('auth-login-email').value;
    const password = document.getElementById('auth-login-password').value;

    if (alertEl) {
      alertEl.style.display = 'none';
      alertEl.textContent = '';
      alertEl.className = 'auth-status-alert';
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Ingresando...';
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const datos = await res.json();

      if (datos.exito) {
        if (alertEl) {
          alertEl.textContent = datos.mensaje || 'Inicio de sesión exitoso.';
          alertEl.classList.add('success');
          alertEl.style.display = 'block';
        }

        // Guardar token y datos si es necesario
        if (datos.token) {
          localStorage.setItem('buchisapa_token', datos.token);
          sessionStorage.setItem('buchisapa_token', datos.token);
        }
        localStorage.setItem('buchisapa_user', JSON.stringify(datos.user || datos.datos));
        
        // Sincronizar específicamente para el panel administrativo si es admin
        if (datos.isAdmin) {
          localStorage.setItem('buchisapa_admin_token', datos.token || `admin-token-${Date.now()}`);
          sessionStorage.setItem('buchisapa_admin_token', datos.token || `admin-token-${Date.now()}`);
          localStorage.setItem('buchisapa_admin_session', JSON.stringify(datos.user || datos.datos));
        }

        if (typeof window.updateAuthUI === 'function') {
          window.updateAuthUI();
        }

        setTimeout(() => {
          if (datos.isAdmin && datos.redirectUrl) {
            window.location.href = datos.redirectUrl;
          } else {
            window.location.reload(); // Recargar para actualizar UI de cliente
          }
        }, 1000);
      } else {
        throw new Error(datos.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      if (alertEl) {
        alertEl.textContent = err.message;
        alertEl.classList.add('error');
        alertEl.style.display = 'block';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ingresar';
      }
    }
  };

  window.handleAuthRegisterSubmit = async function (event) {
    if (event) event.preventDefault();
    const alertEl = document.getElementById('auth-register-alert');
    const submitBtn = document.getElementById('reg-submit-btn');

    const payload = {
      tipoDoc: document.getElementById('reg-doc-type').value,
      numeroDoc: document.getElementById('reg-doc-number').value,
      nombre: document.getElementById('reg-firstname').value,
      apellido: document.getElementById('reg-lastname').value,
      email: document.getElementById('reg-email').value,
      telefono: document.getElementById('reg-phone').value,
      password: document.getElementById('reg-password').value,
      fechaNacimiento: document.getElementById('reg-birthdate').value,
      aceptaTerminos: document.getElementById('reg-terms').checked,
      aceptaMarketing: document.getElementById('reg-marketing').checked
    };

    if (alertEl) {
      alertEl.style.display = 'none';
      alertEl.className = 'auth-status-alert';
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';
    }

    try {
      const res = await fetch('/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const datos = await res.json();
      if (datos.exito) {
        if (alertEl) {
          alertEl.textContent = 'Cuenta creada con éxito. Redirigiendo...';
          alertEl.classList.add('success');
          alertEl.style.display = 'block';
        }
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(datos.error || 'Error en el registro');
      }
    } catch (err) {
      if (alertEl) {
        alertEl.textContent = err.message;
        alertEl.classList.add('error');
        alertEl.style.display = 'block';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear cuenta';
      }
    }
  };

  window.handleAuthRecoverySubmit = async function (event) {
    if (event) event.preventDefault();
    const alertEl = document.getElementById('auth-recovery-alert');
    const email = document.getElementById('auth-rec-email').value;

    try {
      const res = await fetch('/api/autenticacion/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const datos = await res.json();
      if (alertEl) {
        alertEl.textContent = datos.mensaje || 'Se han enviado las instrucciones a tu correo.';
        alertEl.className = 'auth-status-alert success';
        alertEl.style.display = 'block';
      }
    } catch (err) {
      if (alertEl) {
        alertEl.textContent = 'No se pudo procesar la solicitud.';
        alertEl.className = 'auth-status-alert error';
        alertEl.style.display = 'block';
      }
    }
  };

  window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a22.21 22.21 0 0 1 2.94-4.21m4.35-4.35A10.03 10.03 0 0 1 12 4c7 0 10 7 10 7a21.27 21.27 0 0 1-2.94 4.21M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>';
    } else {
      input.type = 'password';
      if (btn) btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    }
  };

  window.checkAuthFormReady = function (type) {
    if (type === 'login') {
      const email = document.getElementById('auth-login-email').value;
      const pass = document.getElementById('auth-login-password').value;
      const btn = document.getElementById('auth-submit-btn-login');
      if (btn) btn.disabled = !(email && pass);
    }
  };

  window.checkRegisterFormReady = function () {
    const btn = document.getElementById('reg-submit-btn');
    if (!btn) return;
    const terms = document.getElementById('reg-terms').checked;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const name = document.getElementById('reg-firstname').value;
    btn.disabled = !(terms && email && pass && name);
  };

  window.handleLogoutCustomer = function () {
    localStorage.removeItem('buchisapa_token');
    localStorage.removeItem('buchisapa_user');
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      window.location.reload();
    });
  };

  window.continueAsGuest = function () {
    window.closeLoginModal();
  };

  window.handleUserIconClick = function () {
    const userStr = localStorage.getItem('buchisapa_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.email) {
          window.openLoginModal('profile');
          return;
        }
      } catch (e) {}
    }
    window.openLoginModal('login');
  };

  window.updateAuthUI = function () {
    const userStr = localStorage.getItem('buchisapa_user');
    const headerAuthBtn = document.getElementById('header-auth-btn');
    const drawerLoginBtn = document.getElementById('drawer-login-btn');
    const adminRedirectBtn = document.getElementById('profile-admin-redirect-btn');
    const profileNameEl = document.getElementById('profile-user-fullname');
    const profileEmailEl = document.getElementById('profile-user-email');
    const profileInitialEl = document.getElementById('profile-avatar-initial');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.email) {
          const label = user.isAdmin ? 'ADMIN' : (user.primerNombre || 'MI CUENTA').toUpperCase();
          
          if (headerAuthBtn) {
            const labelEl = headerAuthBtn.querySelector('.header-auth-btn-label');
            if (labelEl) labelEl.textContent = label;
          }
          if (drawerLoginBtn) {
            const labelEl = drawerLoginBtn.querySelector('.header-auth-btn-label');
            if (labelEl) labelEl.textContent = label;
          }
          
          if (profileNameEl) profileNameEl.textContent = user.nombre || 'Usuario BuchiSapa';
          if (profileEmailEl) profileEmailEl.textContent = user.email;
          if (profileInitialEl) profileInitialEl.textContent = (user.nombre || user.email || 'U')[0].toUpperCase();

          if (user.isAdmin) {
            if (adminRedirectBtn) adminRedirectBtn.classList.remove('is-hidden');
          } else {
            if (adminRedirectBtn) adminRedirectBtn.classList.add('is-hidden');
          }
          return;
        }
      } catch (e) {}
    }

    // Reset si no hay sesión
    if (headerAuthBtn) {
      const labelEl = headerAuthBtn.querySelector('.header-auth-btn-label');
      if (labelEl) labelEl.textContent = 'INGRESAR';
    }
    if (drawerLoginBtn) {
      const labelEl = drawerLoginBtn.querySelector('.header-auth-btn-label');
      if (labelEl) labelEl.textContent = 'INGRESAR';
    }
    if (adminRedirectBtn) adminRedirectBtn.classList.add('is-hidden');
  };

  // Inicialización cuando el DOM esté cargado
  document.addEventListener('DOMContentLoaded', () => {
    window.updateAuthUI();
    // Escuchar botón de cierre del modal login
    const closeBtn = document.querySelector('.auth-close-btn-top');
    if (closeBtn) {
      closeBtn.addEventListener('click', window.closeLoginModal);
    }
  });
})();
