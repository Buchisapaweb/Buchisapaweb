/**
 * BUCHISAPA ADMIN - NAVEGACIÓN Y ENRUTAMIENTO DINÁMICO
 */
(function () {
  'use strict';

  function switchAdminView(id) {
    if (!id) return;
    
    // 1. Ocultar todas las vistas y activar exclusivamente la seleccionada
    const views = document.querySelectorAll('.admin-view');
    views.forEach(v => {
      if (v.id === 'view-' + id) {
        v.classList.add('active');
        v.style.display = 'block';
      } else {
        v.classList.remove('active');
        v.style.display = 'none';
      }
    });

    // 2. Actualizar estado activo en los botones del sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.view === id);
    });

    // 3. Cerrar sidebar en dispositivos móviles
    closeMobileSidebar();

    // 4. Disparar el evento de actualización de la vista correspondiente
    if (window.onAdminViewSwitched) {
      window.onAdminViewSwitched(id);
    }

    // 5. Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleMobileSidebar() {
    document.getElementById('admin-sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('active');
  }

  function closeMobileSidebar() {
    document.getElementById('admin-sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
  }

  window.switchAdminView = switchAdminView;
  window.toggleMobileSidebar = toggleMobileSidebar;
  window.closeMobileSidebar = closeMobileSidebar;

  window.handleLogout = async function () {
    try {
      await fetch('/api/auth/admin-logout', { method: 'POST', credentials: 'same-origin' });
    } catch (e) {
      console.warn('Error during logout request', e);
    }
    try {
      sessionStorage.clear();
      localStorage.removeItem('buchisapa_admin_token');
      localStorage.removeItem('buchisapa_admin_session');
    } catch (e) {}
    location.href = '/';
  };
})();
