/**
 * BUCHISAPA ADMIN - NAVIGATION & VIEW ROUTING MODULE
 * Layer: /admin/js/modules/navegacion.js
 */

(function () {
  'use strict';

  const viewMetadata = {
    'dashboard': {
      title: 'Dashboard General',
      desc: 'Métricas clave, volumen de ventas y accesos directos',
      button: null
    },
    'productos': {
      title: 'Catálogo de Productos',
      desc: 'Gestión de platos, precios, disponibilidad y stock',
      button: { text: '+ Nuevo Producto', action: () => window.openProductModal() }
    },
    'categorias': {
      title: 'Gestión de Categorías de la Carta',
      desc: 'Agrega nuevas categorías o elimina categorías del menú digital',
      button: { text: '+ Volver a Productos', action: () => window.switchAdminView('productos') }
    },
    'pedidos': {
      title: 'Gestión de Pedidos & Cocina KDS',
      desc: 'Comandas activas, estados de preparación y pedidos listos en tiempo real',
      button: null
    },
    'ventas': {
      title: 'Reporte de Ventas',
      desc: 'Métricas clave, volumen de ventas y métodos de pago',
      button: { text: 'Exportar Reporte', action: () => window.showToast('Exportando reporte comercial a CSV...', 'info') }
    },
    'ticket': {
      title: 'Tickets y Boletas Térmicas',
      desc: 'Emisión rápida de comprobantes e impresión 80mm',
      button: { text: '+ Emitir Ticket', action: () => window.openNewTicketModal() }
    },
    'portada': {
      title: 'Banners de Portada',
      desc: 'Gestión de diapositivas del carrusel de la tienda web',
      button: { text: '+ Nueva Portada', action: () => window.openCreatePortadaPage() }
    },
    'promociones': {
      title: 'Promociones y Ofertas',
      desc: 'Combos con descuento y promociones especiales para clientes',
      button: { text: '+ Nueva Promoción', action: () => window.openCreatePromotionModal() }
    },
    'insumos': {
      title: 'Insumos de Cocina',
      desc: 'Control de inventario de materia prima y stock crítico',
      button: null
    },
    'utensilios': {
      title: 'Equipamiento y Utensilios',
      desc: 'Maquinaria de cocina, empaques y estado de mantenimiento',
      button: null
    },
    'delivery': {
      title: 'Despachos y Delivery',
      desc: 'Pedidos asignados a repartidores y seguimiento en ruta',
      button: null
    },
    'recojo': {
      title: 'Recojo en Mostrador',
      desc: 'Órdenes para retirar directamente en el restaurante',
      button: null
    },
    'ubicacion': {
      title: 'Ubicación y Cobertura',
      desc: 'Sede central BuchiSapa y radio de entrega autorizado',
      button: null
    },
    'reportes': {
      title: 'Ranking y Métricas',
      desc: 'Platos más vendidos y rendimiento de la carta',
      button: null
    },
    'configuracion': {
      title: 'Configuración del Sistema',
      desc: 'Horarios de atención, datos de contacto y WhatsApp',
      button: { text: 'Guardar Ajustes', action: () => window.showToast('Configuraciones guardadas con éxito', 'success') }
    }
  };

  /**
   * Cambia la vista activa del panel INSTANTÁNEAMENTE en 0ms
   */
  function switchAdminView(viewId) {
    if (!viewId) return;

    // 1. Actualizar enlaces del sidebar instantáneamente
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.dataset.view === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 2. Transición instantánea de vistas DOM
    document.querySelectorAll('.admin-view').forEach(view => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // 3. Actualizar Topbar
    const meta = viewMetadata[viewId] || { title: 'Panel de Control', desc: 'Administración BuchiSapa', button: null };
    const titleEl = document.getElementById('topbar-title');
    const descEl = document.getElementById('topbar-desc');
    if (titleEl) titleEl.textContent = meta.title;
    if (descEl) descEl.textContent = meta.desc;

    // 4. Actualizar botón de acción principal en topbar
    const mainActionBtn = document.querySelector('.btn-open-new-product');
    if (mainActionBtn) {
      if (meta.button) {
        mainActionBtn.style.display = 'inline-flex';
        const cleanText = (meta.button.text || '').replace(/^\+\s*/, '').trim();
        const fullTextEl = mainActionBtn.querySelector('.btn-text-full');
        const mobileTextEl = mainActionBtn.querySelector('.btn-text-mobile');
        if (fullTextEl) fullTextEl.textContent = cleanText || meta.button.text;
        if (mobileTextEl) {
          if (cleanText.toLowerCase().includes('producto')) {
            mobileTextEl.textContent = 'Agregar';
          } else if (cleanText.toLowerCase().includes('ticket')) {
            mobileTextEl.textContent = 'Ticket';
          } else if (cleanText.toLowerCase().includes('movimiento')) {
            mobileTextEl.textContent = 'Movimiento';
          } else {
            mobileTextEl.textContent = cleanText.split(' ')[0] || 'Nuevo';
          }
        }
        mainActionBtn.onclick = meta.button.action;
      } else {
        mainActionBtn.style.display = 'none';
      }
    }

    // 5. Scroll suave a la parte superior
    window.scrollTo({ top: 0, behavior: 'auto' });

    // 6. Cerrar sidebar en móvil si estuviera abierto
    closeMobileSidebar();

    // 7. Refresco asíncrono de datos según la vista en segundo plano
    triggerViewDataRefresh(viewId);
  }

  function triggerViewDataRefresh(viewId) {
    setTimeout(() => {
      if (viewId === 'pedidos' && typeof window.fetchOrders === 'function') {
        window.fetchOrders();
      } else if (viewId === 'productos' && typeof window.fetchProducts === 'function') {
        window.fetchProducts();
      } else if (viewId === 'categorias' && typeof window.renderCategoryListInManager === 'function') {
        window.renderCategoryListInManager();
      } else if (viewId === 'ventas') {
        window.renderVentasView?.();
      } else if (viewId === 'dashboard') {
        window.updateDashboardMetrics?.();
      }
    }, 10);
  }

  function toggleMobileSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;

    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  function handleLogout() {
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
    window.location.replace('/index.html');
  }

  // Bindings
  window.switchAdminView = switchAdminView;
  window.toggleMobileSidebar = toggleMobileSidebar;
  window.closeMobileSidebar = closeMobileSidebar;
  window.handleLogout = handleLogout;

})();
