(function () {
  'use strict';

  window.openLoginModal = function () {
    window.location.href = '/login';
  };

  window.closeLoginModal = function () {
    window.location.href = '/';
  };

  window.closeAuthScreen = function () {
    if (document.referrer && document.referrer.includes(window.location.host)) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  window.updateAuthUI = function () {
    const userStr = localStorage.getItem('buchisapa_user');
    const headerAuthBtn = document.getElementById('header-auth-btn');
    const drawerLoginBtn = document.getElementById('drawer-login-btn');

    let labelText = 'INGRESAR';

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.email) {
          const rawName = user.nombre || user.primerNombre || 'MI CUENTA';
          const namePart = rawName.split(' ')[0].toUpperCase();
          if (namePart) {
            labelText = namePart;
          }
        }
      } catch (e) {}
    }

    if (headerAuthBtn) {
      const labelEl = headerAuthBtn.querySelector('.header-auth-btn-label');
      if (labelEl) labelEl.textContent = labelText;
    }
    if (drawerLoginBtn) {
      const labelEl = drawerLoginBtn.querySelector('.header-auth-btn-label');
      if (labelEl) labelEl.textContent = labelText;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.updateAuthUI();

    const loginForm = document.getElementById('loginForm');
    const correoInput = document.getElementById('correo');
    const passwordInput = document.getElementById('password');
    const btnIngresar = document.getElementById('btnIngresar');
    const btnOjo = document.getElementById('btnOjo');
    const btnCerrar = document.getElementById('btnCerrar');
    const btnInvitado = document.getElementById('btnInvitado');

    // Manejo de la activación del botón Ingresar
    function validarFormulario() {
      if (!correoInput || !passwordInput || !btnIngresar) return;
      const correo = correoInput.value.trim();
      const password = passwordInput.value.trim();

      if (correo.length > 0 && password.length > 0) {
        btnIngresar.disabled = false;
        btnIngresar.classList.add('activo');
      } else {
        btnIngresar.disabled = true;
        btnIngresar.classList.remove('activo');
      }
    }

    if (correoInput) correoInput.addEventListener('input', validarFormulario);
    if (passwordInput) passwordInput.addEventListener('input', validarFormulario);

    // Alternar visibilidad de contraseña
    if (btnOjo && passwordInput) {
      btnOjo.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          btnOjo.textContent = '🙈';
        } else {
          passwordInput.type = 'password';
          btnOjo.textContent = '👁';
        }
      });
    }

    // Botón cerrar
    if (btnCerrar) {
      btnCerrar.addEventListener('click', () => {
        window.closeAuthScreen();
      });
    }

    // Continuar como invitado
    if (btnInvitado) {
      btnInvitado.addEventListener('click', () => {
        window.location.href = '/';
      });
    }

    // Envío del formulario de Login
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const correo = correoInput ? correoInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';

        if (!correo || !password) return;

        btnIngresar.disabled = true;
        btnIngresar.textContent = 'Cargando...';

        try {
          const res = await fetch('/api/autenticacion/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: correo, password })
          });

          const datos = await res.json();
          if (datos.exito && datos.user) {
            localStorage.setItem('buchisapa_user', JSON.stringify(datos.user));
            localStorage.setItem('buchisapa_token', datos.token || 'auth_token');

            if (datos.isAdmin) {
              localStorage.setItem('buchisapa_admin_token', datos.token || 'admin_token');
              sessionStorage.setItem('buchisapa_admin_session', JSON.stringify(datos.user));
              window.location.href = '/admin';
            } else {
              window.location.href = '/';
            }
          } else {
            alert(datos.error || 'Correo o contraseña incorrectos.');
            btnIngresar.disabled = false;
            btnIngresar.classList.add('activo');
            btnIngresar.textContent = 'Ingresar';
          }
        } catch (err) {
          alert('Error de conexión al intentar ingresar.');
          btnIngresar.disabled = false;
          btnIngresar.classList.add('activo');
          btnIngresar.textContent = 'Ingresar';
        }
      });
    }
  });
})();
