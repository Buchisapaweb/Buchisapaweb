/**
 * BUCHISAPA BURGER & BROASTER - PANEL DE ADMINISTRACIÓN OFICIAL
 * Master Entry Orchestrator: /admin/js/admin.js
 * High-Density Modular POS & Backoffice System
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function getAdminAuthStatus() {
    const adminToken = localStorage.getItem('buchisapa_admin_token');
    const adminSession = sessionStorage.getItem('buchisapa_admin_session');
    let customerSession = null;
    try {
      customerSession = JSON.parse(localStorage.getItem('buchisapa_customer') || 'null');
    } catch (e) {}

    const isAdminAuthorized = Boolean(
      adminToken ||
      adminSession ||
      (customerSession && (customerSession.role === 'admin' || customerSession.isAdmin))
    );

    let user = null;
    if (adminSession) {
      try { user = JSON.parse(adminSession); } catch (e) {}
    }
    if (!user && customerSession && (customerSession.role === 'admin' || customerSession.isAdmin)) {
      user = customerSession;
    }
    if (!user && adminToken) {
      user = {
        name: 'Administrador BuchiSapa',
        email: 'admin@buchisapa.pe',
        role: 'admin',
        isAdmin: true
      };
    }

    return { isAuthorized: isAdminAuthorized, user };
  }

  function showAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    const alertEl = document.getElementById('admin-login-alert');
    if (alertEl) {
      alertEl.style.display = 'none';
      alertEl.innerHTML = '';
    }
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      const emailInput = document.getElementById('admin-login-email');
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 150);
      }
    }
  }

  function hideAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    const alertEl = document.getElementById('admin-login-alert');
    if (alertEl) {
      alertEl.style.display = 'none';
      alertEl.innerHTML = '';
    }
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  function updateAdminUserDisplay(user) {
    if (!user) return;
    const nameEl = document.getElementById('admin-sidebar-name');
    const emailEl = document.getElementById('admin-sidebar-email');
    const avatarEl = document.getElementById('admin-sidebar-avatar');

    const name = user.name || user.firstName || 'Admin BuchiSapa';
    const email = user.email || 'admin@buchisapa.pe';
    const initial = (name.charAt(0) || 'A').toUpperCase();

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = initial;
  }

  async function loadAllAdminData() {
    try {
      await Promise.allSettled([
        window.fetchProducts?.(),
        window.fetchOrders?.(),
        window.fetchCaja?.(),
        window.fetchTickets?.(),
        window.fetchPortadas?.(),
        window.fetchSupplies?.(),
        window.fetchUtensils?.()
      ]);
    } catch (e) {
      console.warn('Carga de datos del panel completada:', e);
    }
  }

  async function initApp() {
    setupEventListeners();
    setupSSEPushNotifications();

    // Verificar sesión activa de Administrador
    const { isAuthorized, user } = getAdminAuthStatus();

    if (!isAuthorized) {
      showAdminLoginModal();
      return;
    }

    hideAdminLoginModal();
    updateAdminUserDisplay(user);

    // Cargar datos en paralelo para máxima velocidad y fluidez
    await loadAllAdminData();

    // Inicializar vista por defecto
    window.switchAdminView('dashboard');
  }

  async function handleAdminLoginFormSubmit(event) {
    if (event && event.preventDefault) event.preventDefault();
    const emailInput = document.getElementById('admin-login-email');
    const passInput = document.getElementById('admin-login-password');
    const alertEl = document.getElementById('admin-login-alert');
    const submitBtn = document.getElementById('btn-admin-login-submit');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value.trim() : '';
    const emailLower = email.toLowerCase();

    const showError = (msg) => {
      if (!alertEl) return;
      alertEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #ff4d79;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>${msg}</span>
        </div>
      `;
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(255, 51, 102, 0.15)';
      alertEl.style.border = '1px solid rgba(255, 51, 102, 0.35)';
    };

    const showSuccess = (msg) => {
      if (!alertEl) return;
      alertEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #00ff88;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>${msg}</span>
        </div>
      `;
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(0, 255, 136, 0.15)';
      alertEl.style.border = '1px solid rgba(0, 255, 136, 0.35)';
    };

    if (!email) {
      showError('Por favor ingresa tu correo de administrador.');
      if (emailInput) emailInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Verificando acceso...</span>';
    }

    try {
      let data = null;

      // Autenticación ultra rápida en paralelo para el panel de administración
      const sbAuthPromise = (async () => {
        if (window.BuchisapaAPI && typeof window.BuchisapaAPI.loginAuth === 'function') {
          const res = await window.BuchisapaAPI.loginAuth(emailLower, password);
          if (res && res.success) return res;
        }
        throw new Error('Supabase direct unavailable');
      })();

      const backendAuthPromise = (async () => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailLower, password })
        });
        const resJson = await res.json().catch(() => null);
        if (res.ok && resJson && resJson.success) return resJson;
        const errMsg = resJson?.error || resJson?.message || 'El correo electrónico o la contraseña ingresados no son correctos.';
        throw new Error(errMsg);
      })();

      try {
        data = await Promise.any([sbAuthPromise, backendAuthPromise]);
      } catch (aggregateErr) {
        try {
          data = await backendAuthPromise;
        } catch (err) {
          throw err;
        }
      }

      if (data && data.success) {
        const user = data.user || data.data;
        const isAdmin = Boolean(data.isAdmin || user.role === 'admin' || user.isAdmin === true);

        if (!isAdmin) {
          throw new Error('Esta cuenta no cuenta con privilegios de Administrador.');
        }

        const token = data.token || `admin-token-${Date.now()}`;
        localStorage.setItem('buchisapa_admin_token', token);
        sessionStorage.setItem('buchisapa_admin_session', JSON.stringify(user));
        localStorage.setItem('buchisapa_customer', JSON.stringify(user));

        showSuccess('¡Identidad confirmada! Ingresando...');

        // Desbloqueo y renderizado instantáneo
        hideAdminLoginModal();
        updateAdminUserDisplay(user);
        window.switchAdminView('dashboard');
        // Carga asíncrona de datos en segundo plano sin bloquear UI
        loadAllAdminData();
        return;
      }

      const errMsg = data?.error || data?.message || 'El correo electrónico o la contraseña ingresados no son correctos.';
      throw new Error(errMsg);

    } catch (err) {
      console.error('Error in admin login:', err);
      let userFriendlyMsg = err.message || 'Error al iniciar sesión en el panel.';
      if (userFriendlyMsg.includes('Unexpected') || userFriendlyMsg.includes('JSON') || userFriendlyMsg.includes('doctype') || userFriendlyMsg.includes('SyntaxError')) {
        userFriendlyMsg = 'El correo electrónico o la contraseña ingresados no son correctos.';
      }
      showError(userFriendlyMsg);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Ingresar al Panel</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
      }
    }
  }

  function fillAdminCredentials(email, pass) {
    const emailInput = document.getElementById('admin-login-email');
    const passInput = document.getElementById('admin-login-password');
    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = pass;
    const alertEl = document.getElementById('admin-login-alert');
    if (alertEl) {
      alertEl.style.display = 'none';
      alertEl.innerHTML = '';
    }
  }

  function toggleAdminPasswordVisibility() {
    const passInput = document.getElementById('admin-login-password');
    if (!passInput) return;
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
  }

  function handleAdminLogout() {
    try {
      localStorage.removeItem('buchisapa_admin_token');
      localStorage.removeItem('buchisapa_admin_session');
      sessionStorage.removeItem('buchisapa_admin_session');
      localStorage.removeItem('buchisapa_customer');
      localStorage.removeItem('buchisapa_user_session');
      localStorage.removeItem('buchisapa_user_token');
      localStorage.removeItem('buchisapa_auth_user');
      localStorage.removeItem('buchisapa_user');
      localStorage.removeItem('buchisapa_token');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error al limpiar almacenamiento:', e);
    }
    
    // Redirigir directamente a la página de inicio (index)
    window.location.replace('/');
  }

  function setupEventListeners() {
    // 1. Sidebar Nav Click Delegation
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) window.switchAdminView(view);
      });
    });

    // 2. Mobile Drawer
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const btnSidebarClose = document.getElementById('btn-sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (btnMobileMenu) btnMobileMenu.addEventListener('click', window.toggleMobileSidebar);
    if (btnSidebarClose) btnSidebarClose.addEventListener('click', window.closeMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', window.closeMobileSidebar);

    // Logout Handler
    const btnLogout = document.getElementById('btn-admin-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.handleLogout === 'function') {
          window.handleLogout();
        } else {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/index.html';
        }
      });
    }

    // 3. Category Filter Chips (Productos)
    const chips = document.querySelectorAll('.category-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        window.AdminState.currentCategory = chip.dataset.category || 'todos';
        window.applyProductFilters();
      });
    });

    // 4. Búsqueda en Topbar & Input de Productos
    const searchInputs = document.querySelectorAll('.admin-search-input');
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        window.AdminState.searchQuery = e.target.value;
        window.applyProductFilters();
      });
    });

    // 5. Select Ordenamiento Productos
    const sortSelect = document.getElementById('product-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        window.AdminState.currentSort = e.target.value;
        window.applyProductFilters();
      });
    }

    // 6. View Mode Switcher (Grid vs Table)
    const btnGrid = document.getElementById('btn-view-grid');
    const btnTable = document.getElementById('btn-view-table');
    const gridContainer = document.getElementById('products-grid-container');
    const tableContainer = document.getElementById('products-table-container');

    if (btnGrid && btnTable) {
      btnGrid.addEventListener('click', () => {
        btnGrid.classList.add('active');
        btnTable.classList.remove('active');
        if (gridContainer) gridContainer.style.display = 'grid';
        if (tableContainer) tableContainer.style.display = 'none';
      });

      btnTable.addEventListener('click', () => {
        btnTable.classList.add('active');
        btnGrid.classList.remove('active');
        if (gridContainer) gridContainer.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
      });
    }

    // 7. Modal Close Triggers
    const closeTriggers = document.querySelectorAll('.modal-close-trigger');
    closeTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Click fuera de modal para cerrar
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });

    // 8. Formularios Modales
    const prodForm = document.getElementById('product-form');
    if (prodForm) prodForm.addEventListener('submit', window.handleProductFormSubmit);

    const cajaMovForm = document.getElementById('caja-movement-form');
    if (cajaMovForm) cajaMovForm.addEventListener('submit', window.handleCajaMovementSubmit);

    const cajaOpenForm = document.getElementById('caja-open-form');
    if (cajaOpenForm) {
      cajaOpenForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const initial = parseFloat(document.getElementById('modal-open-initial-cash').value) || 250;
        const cajero = document.getElementById('modal-open-cajero').value;
        try {
          await window.AdminApi.abrirCaja(initial, cajero);
          window.showToast('Caja abierta con éxito', 'success');
          document.getElementById('caja-open-modal').classList.remove('active');
          await window.fetchCaja();
        } catch (err) {
          if (window.AdminState.cajaData) window.AdminState.cajaData.isOpen = true;
          window.renderCajaView();
          document.getElementById('caja-open-modal').classList.remove('active');
          window.showToast('Caja abierta localmente', 'info');
        }
      });
    }

    const cajaCloseForm = document.getElementById('caja-close-form');
    if (cajaCloseForm) {
      cajaCloseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const realCash = parseFloat(document.getElementById('modal-close-real-cash').value) || 0;
        const notes = document.getElementById('modal-close-notes').value;
        try {
          await window.AdminApi.cerrarCaja({ real_cash: realCash, notes });
          window.showToast('Turno cerrado (Reporte Z generado)', 'success');
          document.getElementById('caja-close-modal').classList.remove('active');
          await window.fetchCaja();
        } catch (err) {
          if (window.AdminState.cajaData) window.AdminState.cajaData.isOpen = false;
          window.renderCajaView();
          document.getElementById('caja-close-modal').classList.remove('active');
          window.showToast('Turno cerrado localmente', 'info');
        }
      });
    }

    const newTicketForm = document.getElementById('new-ticket-form');
    if (newTicketForm) {
      newTicketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const select = document.getElementById('ticket-form-product-select');
        const selectedOpt = select ? select.options[select.selectedIndex] : null;
        const prodName = selectedOpt ? selectedOpt.textContent.split(' - ')[0] : 'Plato';
        const price = selectedOpt ? parseFloat(selectedOpt.dataset.price) : 18;
        const qty = parseInt(document.getElementById('ticket-form-quantity').value, 10) || 1;

        const ticketData = {
          number: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: document.getElementById('ticket-form-customer').value,
          phone: document.getElementById('ticket-form-phone').value,
          type: document.getElementById('ticket-form-type').value,
          payment: document.getElementById('ticket-form-payment').value,
          items: [{ name: prodName, qty, price }],
          subtotal: price * qty,
          total: price * qty,
          status: 'Emitido',
          created_at: new Date().toISOString()
        };

        try {
          await window.AdminApi.createTicket(ticketData);
          window.showToast(`Ticket #${ticketData.number} emitido`, 'success');
          document.getElementById('new-ticket-modal').classList.remove('active');
          await window.fetchTickets();
          window.previewThermalTicket(ticketData.id || window.AdminState.allTickets[0]?.id);
        } catch (err) {
          window.AdminState.allTickets.unshift(ticketData);
          window.filterTickets();
          document.getElementById('new-ticket-modal').classList.remove('active');
          window.showToast(`Ticket #${ticketData.number} emitido localmente`, 'info');
          window.previewThermalTicket(ticketData.id || ticketData.number);
        }
      });
    }

    const portadaForm = document.getElementById('portada-form');
    if (portadaForm) {
      portadaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('portada-form-id').value;
        const isEdit = Boolean(id);

        const data = {
          title: document.getElementById('portada-form-title').value.trim(),
          highlight: document.getElementById('portada-form-highlight').value.trim(),
          badge: document.getElementById('portada-form-badge').value.trim(),
          category: document.getElementById('portada-form-category').value,
          subtitle: document.getElementById('portada-form-subtitle').value.trim(),
          buttonText: document.getElementById('portada-form-btn-text').value.trim(),
          image: document.getElementById('portada-form-image').value.trim() || '/imagenes/portada/portada-1.jpg',
          active: document.getElementById('portada-form-active').checked
        };

        try {
          await window.AdminApi.savePortada(data, isEdit, id);
          window.showToast(isEdit ? 'Portada actualizada' : 'Portada guardada con éxito', 'success');
          document.getElementById('portada-modal').classList.remove('active');
          await window.fetchPortadas();
        } catch (err) {
          if (isEdit) {
            const idx = window.AdminState.allPortadas.findIndex(p => p.id === id);
            if (idx !== -1) window.AdminState.allPortadas[idx] = { ...window.AdminState.allPortadas[idx], ...data };
          } else {
            window.AdminState.allPortadas.push({ id: 'portada-' + Date.now(), ...data });
          }
          window.renderPortadas();
          document.getElementById('portada-modal').classList.remove('active');
          window.showToast('Portada guardada en sesión activa', 'info');
        }
      });
    }
  }

  function setupSSEPushNotifications() {
    try {
      const evtSource = new EventSource('/api/events');
      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'order_created' || data.type === 'new_order') {
            window.showToast(`¡Nuevo pedido recibido! #${data.order?.orderNumber || data.order?.id}`, 'info');
            window.fetchOrders?.();
          } else if (data.type === 'order_status_updated') {
            window.fetchOrders?.();
          }
        } catch (err) {
          console.warn('Error al procesar evento SSE:', err);
        }
      };
    } catch (e) {
      console.warn('SSE no disponible:', e);
    }
  }

  // Exponer utilidades globales para eventos de formulario y botones
  window.handleAdminLoginFormSubmit = handleAdminLoginFormSubmit;
  window.fillAdminCredentials = fillAdminCredentials;
  window.toggleAdminPasswordVisibility = toggleAdminPasswordVisibility;
  window.handleAdminLogout = handleAdminLogout;
  window.handleLogout = handleAdminLogout;
  window.showAdminLoginModal = showAdminLoginModal;
  window.hideAdminLoginModal = hideAdminLoginModal;

})();
