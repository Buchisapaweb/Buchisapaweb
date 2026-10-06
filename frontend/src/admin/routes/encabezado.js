/* =========================================================
   ENCABEZADO UNIFICADO JS (Clock, Sidebar Toggle, Logout & Modals)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Reloj en vivo (Live Clock)
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

  // 2. Perfil de usuario administrador dinámico
  const userNameEl = document.getElementById('topbar-user-name');
  const userAvatarEl = document.getElementById('topbar-user-avatar');
  if (userAvatarEl) {
    userAvatarEl.addEventListener('error', () => {
      userAvatarEl.style.display = 'none';
      const fallback = userAvatarEl.nextElementSibling;
      if (fallback) fallback.style.display = 'block';
    });
  }

  const loadDynamicUserProfile = async () => {
    try {
      const stored = localStorage.getItem('buchisapa_admin_user') || sessionStorage.getItem('buchisapa_admin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (userNameEl && u.name) userNameEl.textContent = u.name;
        if (userAvatarEl && u.avatar) userAvatarEl.src = u.avatar;
      }
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          if (userNameEl && (data.user.name || data.user.full_name)) {
            userNameEl.textContent = data.user.name || data.user.full_name;
          }
          if (userAvatarEl && data.user.avatar) {
            userAvatarEl.src = data.user.avatar;
          }
        }
      }
    } catch (err) {}
  };
  loadDynamicUserProfile();

  // 3. Menú lateral en dispositivos móviles (Sidebar Toggle)
  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const closeSidebarBtn = document.getElementById('btn-sidebar-close');

  const toggleSidebar = () => {
    if (sidebar) {
      sidebar.classList.toggle('active');
      sidebar.classList.toggle('open');
    }
    if (overlay) {
      overlay.classList.toggle('active');
      overlay.classList.toggle('open');
      const isOpen = sidebar?.classList.contains('active') || sidebar?.classList.contains('open');
      overlay.style.display = isOpen ? 'block' : 'none';
    }
  };

  mobileMenuBtn?.addEventListener('click', toggleSidebar);
  closeSidebarBtn?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', toggleSidebar);

  // 4. Botón de Cerrar Sesión (Admin Logout)
  const performLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await fetch('/api/auth/admin-logout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error('Error durante la revocación de sesión en servidor:', e);
    }

    // Limpiar almacenamiento local y cookies
    try {
      localStorage.removeItem('buchisapa_admin_token');
      localStorage.removeItem('buchisapa_admin_user');
      localStorage.removeItem('buchisapa_admin_session');
      sessionStorage.removeItem('buchisapa_admin_session');
      sessionStorage.removeItem('buchisapa_admin_user');
      
      document.cookie = "buchisapa_admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (e) {}

    // Redirigir siempre a la página principal /index.html
    window.location.replace('/index.html');
  };

  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', performLogout);
  }

  // Delegación global por si se vuelve a renderizar el sidebar
  document.addEventListener('click', (e) => {
    const btn = e.target?.closest?.('#btn-admin-logout');
    if (btn) {
      performLogout(e);
    }
  });

  window.adminLogout = performLogout;

  // 5. Controles de Modales
  document.getElementById('btn-close-product-modal')?.addEventListener('click', window.closeProductModal);
  document.getElementById('btn-cancel-product-modal')?.addEventListener('click', window.closeProductModal);
  document.getElementById('btn-close-category-modal')?.addEventListener('click', window.closeCategoryModal);
  document.getElementById('btn-cancel-category-modal')?.addEventListener('click', window.closeCategoryModal);
  document.getElementById('btn-close-order-modal')?.addEventListener('click', window.closeOrderModal);
  document.getElementById('btn-cancel-order-modal')?.addEventListener('click', window.closeOrderModal);
  document.getElementById('btn-print-modal-order')?.addEventListener('click', window.printCurrentModalOrder);
});

// Ayudantes de Apertura / Cierre de Modales Globale
window.closeProductModal = function() {
  document.getElementById('modal-product-backdrop')?.classList.remove('active', 'open');
};

window.closeCategoryModal = function() {
  document.getElementById('modal-category-backdrop')?.classList.remove('active', 'open');
};

window.closeOrderModal = function() {
  document.getElementById('modal-order-backdrop')?.classList.remove('active', 'open');
};

window.printCurrentModalOrder = function() {
  window.print();
};
