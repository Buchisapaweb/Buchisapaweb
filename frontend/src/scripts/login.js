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

    // Enlace de registro
    const linkRegistro = document.getElementById('linkRegistro');
    if (linkRegistro) {
      linkRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/registro';
      });
    }

    // Enlace de recuperar contraseña
    const linkRecuperar = document.getElementById('linkRecuperar');
    if (linkRecuperar) {
      linkRecuperar.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarMensaje('Comuníquese a WhatsApp +51 987 654 321 o acérquese a nuestro local en Av. La Estrella con Calle 28 de Julio para recuperar su acceso.', 'info');
      });
    }

    function mostrarMensaje(texto, tipo = 'error') {
      let msgBox = document.getElementById('auth-msg-banner');
      if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.id = 'auth-msg-banner';
        msgBox.style.padding = '12px 16px';
        msgBox.style.borderRadius = '12px';
        msgBox.style.marginBottom = '20px';
        msgBox.style.fontSize = '15px';
        msgBox.style.fontWeight = '600';
        msgBox.style.textAlign = 'center';
        loginForm.parentNode.insertBefore(msgBox, loginForm);
      }
      if (tipo === 'error') {
        msgBox.style.backgroundColor = '#fee2e2';
        msgBox.style.color = '#b91c1c';
        msgBox.style.border = '1px solid #f87171';
      } else {
        msgBox.style.backgroundColor = '#fef3c7';
        msgBox.style.color = '#92400e';
        msgBox.style.border = '1px solid #fcd34d';
      }
      msgBox.textContent = texto;
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
            mostrarMensaje(datos.error || 'Correo o contraseña incorrectos.');
            btnIngresar.disabled = false;
            btnIngresar.classList.add('activo');
            btnIngresar.textContent = 'Ingresar';
          }
        } catch (err) {
          mostrarMensaje('Error de conexión al intentar ingresar.');
          btnIngresar.disabled = false;
          btnIngresar.classList.add('activo');
          btnIngresar.textContent = 'Ingresar';
        }
      });
    }
  });
})();
