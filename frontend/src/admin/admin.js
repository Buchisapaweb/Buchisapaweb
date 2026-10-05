/**
 * BUCHISAPA BURGER & BROASTER - PANEL ADMINISTRATIVO PRINCIPAL
 * Coordinador Maestro de Datos, Estado y Módulos
 */
(function () {
  'use strict';

  // Almacén central de datos accesible para todos los módulos
  window.adminData = {
    products: [],
    categories: [],
    orders: [],
    clients: [],
    insumos: [
      { id: 'INS001', name: 'Carne Molida Especial Burger (80/20)', category: 'carnes', stock: 45, unit: 'Kg', min: 15, cost: 28.50, status: 'normal' },
      { id: 'INS002', name: 'Pechuga / Pierna de Pollo Broaster Marinado', category: 'carnes', stock: 60, unit: 'Kg', min: 20, cost: 18.00, status: 'normal' },
      { id: 'INS003', name: 'Pan Brioche Artesanal con Ajonjolí', category: 'panaderia', stock: 120, unit: 'Unidades', min: 40, cost: 1.80, status: 'normal' },
      { id: 'INS004', name: 'Papa Amarilla / Tumbay Seleccionada', category: 'vegetales', stock: 80, unit: 'Kg', min: 25, cost: 4.50, status: 'normal' },
      { id: 'INS005', name: 'Queso Cheddar Fundente en Láminas', category: 'lacteos', stock: 18, unit: 'Paquetes', min: 8, cost: 22.00, status: 'normal' },
      { id: 'INS006', name: 'Cajas Biodegradables Hamburguesa Premium', category: 'empaques', stock: 250, unit: 'Unidades', min: 50, cost: 0.95, status: 'normal' },
      { id: 'INS007', name: 'Aceite Vegetal Alto Rendimiento 20L', category: 'abarrotes', stock: 6, unit: 'Bidones', min: 3, cost: 85.00, status: 'normal' }
    ],
    utensilios: [
      { id: 'UT001', name: 'Freidora Industrial Doble Cuba 20L + 20L', area: 'Cocina Caliente', quantity: 2, condition: '100% Operativo', lastMaint: '01/10/2026', status: 'operativo' },
      { id: 'UT002', name: 'Plancha Ranurada / Lisa a Gas 90cm Smash', area: 'Zona de Plancha', quantity: 1, condition: '100% Operativo', lastMaint: '28/09/2026', status: 'operativo' },
      { id: 'UT003', name: 'Espátulas Profesionales de Acero Inox para Smash', area: 'Zona de Plancha', quantity: 4, condition: 'Buena', lastMaint: '15/09/2026', status: 'operativo' },
      { id: 'UT004', name: 'Dispensador Térmico de Salsas 3L Acero', area: 'Línea de Ensamble', quantity: 3, condition: '100% Operativo', lastMaint: '02/10/2026', status: 'operativo' },
      { id: 'UT005', name: 'Campana Extractora Industrial con Trampas de Grasa', area: 'Cocina Caliente', quantity: 1, condition: 'En Mantenimiento Preventivo', lastMaint: '04/10/2026', status: 'mantenimiento' }
    ]
  };

  /* --------------------------------------------------------------------------
     SISTEMA DE RELOJ Y FECHA EN VIVO EN TIEMPO REAL
     -------------------------------------------------------------------------- */
  function updateLiveClock() {
    const now = new Date();
    
    // 1. Hora formateada en 12 horas con segundos y AM/PM
    const timeEl = document.getElementById('topbar-live-time');
    const dateEl = document.getElementById('topbar-live-date');
    const ticketDateEl = document.getElementById('ticket-preview-date');
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    const timeFormatted = `${hoursStr}:${minutes}:${seconds} ${ampm}`;

    // 2. Fecha formateada en español
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const dateFormatted = `${dayName}, ${dayNum} ${monthName} ${year}`;

    if (timeEl) timeEl.textContent = timeFormatted;
    if (dateEl) dateEl.textContent = dateFormatted;

    if (ticketDateEl) {
      const ticketDay = String(dayNum).padStart(2, '0');
      const ticketMonth = String(now.getMonth() + 1).padStart(2, '0');
      ticketDateEl.textContent = `${ticketDay}/${ticketMonth}/${year} - ${hoursStr}:${minutes} ${ampm}`;
    }
  }

  function initLiveClock() {
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
  }

  /* --------------------------------------------------------------------------
     INICIALIZACIÓN Y ENRUTAMIENTO DE EVENTOS
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initLiveClock();

    // Event listeners del sidebar y navegación
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.switchAdminView(btn.dataset.view);
      });
    });

    document.getElementById('btn-mobile-menu')?.addEventListener('click', window.toggleMobileSidebar);
    document.getElementById('btn-sidebar-close')?.addEventListener('click', window.closeMobileSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', window.closeMobileSidebar);
    document.getElementById('btn-admin-logout')?.addEventListener('click', window.handleLogout);

    loadAllAdminData();
    window.switchAdminView('dashboard');
  });

  // Escuchar cambios de vista para activar el renderizado correspondiente
  window.onAdminViewSwitched = function (viewId) {
    if (viewId === 'dashboard') {
      window.renderDashboard?.();
    } else if (viewId === 'portada') {
      window.loadPortadas?.();
    } else if (viewId === 'productos') {
      window.renderProductsTable?.();
    } else if (viewId === 'categorias') {
      window.renderCategoriesGrid?.();
    } else if (viewId === 'pedidos') {
      window.renderOrdersTable?.();
    } else if (viewId === 'clientes') {
      window.renderClientesTable?.();
    } else if (viewId === 'insumos') {
      window.renderInsumosTable?.();
    } else if (viewId === 'utensilios') {
      window.renderUtensiliosTable?.();
    } else if (viewId === 'ticket') {
      window.syncTicketPreview?.();
    } else if (viewId === 'configuracion') {
      window.loadSavedAdminProfile?.();
    }
  };

  /* --------------------------------------------------------------------------
     CARGA DE DATOS DESDE LA API
     -------------------------------------------------------------------------- */
  async function loadAllAdminData() {
    try {
      const [resProd, resCat, resOrd, resUsers] = await Promise.allSettled([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);

      if (resProd.status === 'fulfilled' && Array.isArray(resProd.value)) {
        window.adminData.products = resProd.value;
      }
      if (resCat.status === 'fulfilled' && Array.isArray(resCat.value)) {
        window.adminData.categories = resCat.value;
      }
      if (resOrd.status === 'fulfilled' && Array.isArray(resOrd.value)) {
        window.adminData.orders = resOrd.value;
      }
      if (resUsers.status === 'fulfilled' && Array.isArray(resUsers.value)) {
        window.adminData.clients = resUsers.value;
      }

      // Renderizar todos los módulos
      window.renderDashboard?.();
      window.renderProductsTable?.();
      window.renderCategoriesGrid?.();
      window.renderOrdersTable?.();
      window.renderClientesTable?.();
      window.renderInsumosTable?.();
      window.renderUtensiliosTable?.();
    } catch (e) {
      console.error('Error cargando datos del panel admin:', e);
    }
  }

  window.loadAllAdminData = loadAllAdminData;

  /* --------------------------------------------------------------------------
     SISTEMA DE NOTIFICACIONES TOAST
     -------------------------------------------------------------------------- */
  function showAdminToast(msg, type = 'info') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type === 'success' ? 'toast-success' : type === 'danger' ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'danger' ? '✕' : 'ℹ'}</span>
      <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
  window.showAdminToast = showAdminToast;

})();
