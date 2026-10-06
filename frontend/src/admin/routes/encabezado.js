/* =========================================================
   ENCABEZADO UNIFICADO JS (Clock, Sidebar Toggle, Logout & Modals)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Live clock in topbar
  const timeEl = document.getElementById('topbar-live-time');
  const dateEl = document.getElementById('topbar-live-date');
  if (timeEl && dateEl) {
    const updateClock = () => {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      dateEl.textContent = now.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Mobile sidebar toggle
  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const closeSidebarBtn = document.getElementById('btn-sidebar-close');

  const toggleSidebar = () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('active');
  };

  mobileMenuBtn?.addEventListener('click', toggleSidebar);
  closeSidebarBtn?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', toggleSidebar);

  // Admin Logout button
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('¿Estás seguro de cerrar sesión por completo del panel de administración?')) {
        try {
          await fetch('/api/auth/admin-logout', { method: 'POST' });
        } catch (e) {
          console.error(e);
        }
        localStorage.removeItem('buchisapa_admin_token');
        sessionStorage.removeItem('buchisapa_admin_session');
        window.location.href = '/';
      }
    });
  }
});

// Global modal helpers
window.closeProductModal = function() {
  document.getElementById('modal-product-backdrop')?.classList.remove('active');
};

window.closeCategoryModal = function() {
  document.getElementById('modal-category-backdrop')?.classList.remove('active');
};

window.closeOrderModal = function() {
  document.getElementById('modal-order-backdrop')?.classList.remove('active');
};
