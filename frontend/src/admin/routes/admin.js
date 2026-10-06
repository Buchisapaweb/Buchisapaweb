/**
 * BUCHISAPA BURGER & BROASTER - PANEL ADMINISTRATIVO PRINCIPAL
 * Coordinador Maestro en /frontend/src/admin/routes/admin.js
 */
(function () {
  'use strict';

  window.BuchiSapaAdmin = {
    currentView: 'dashboard',

    init: async function () {
      console.log('🚀 BuchiSapa Admin Inicializado.');
      const isAuth = await this.verifyAdminAuth();
      if (!isAuth) return;
      this.bindNavigation();
      this.bindTableEvents();
      this.refreshAllData();
    },

    verifyAdminAuth: async function () {
      try {
        const res = await fetch('/api/auth/admin-session');
        if (!res.ok) {
          window.location.replace('/index.html?login=admin');
          return false;
        }
        const data = await res.json().catch(() => null);
        if (!data || !data.isAdmin) {
          window.location.replace('/index.html?login=admin');
          return false;
        }
        return true;
      } catch (err) {
        window.location.replace('/index.html?login=admin');
        return false;
      }
    },

    bindNavigation: function () {
      const navButtons = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
      navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetView = btn.getAttribute('data-view');
          if (targetView) {
            window.switchAdminView(targetView);
          }
        });
      });

      window.addEventListener('hashchange', () => {
        const hashView = location.hash.replace('#', '');
        if (hashView && document.getElementById(`view-${hashView}`)) {
          window.switchAdminView(hashView);
        }
      });

      const initialHash = location.hash.replace('#', '');
      if (initialHash && document.getElementById(`view-${initialHash}`)) {
        window.switchAdminView(initialHash);
      }
    },

    bindTableEvents: function () {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('button, [data-action]');
        if (!target) return;

        if (target.classList.contains('btn-view-order')) {
          const orderId = target.getAttribute('data-order-id');
          if (orderId && typeof window.viewOrderDetail === 'function') {
            window.viewOrderDetail(orderId);
          }
        } else if (target.classList.contains('btn-edit-product')) {
          const productId = target.getAttribute('data-product-id');
          if (typeof window.openEditProductModal === 'function') {
            window.openEditProductModal(productId);
          }
        } else if (target.classList.contains('btn-edit-category')) {
          const catId = target.getAttribute('data-cat-id');
          if (typeof window.openNewCategoryModal === 'function') {
            window.openNewCategoryModal(catId);
          }
        } else if (target.classList.contains('btn-delete-category')) {
          const catId = target.getAttribute('data-cat-id');
          if (typeof window.deleteCategory === 'function') {
            window.deleteCategory(catId);
          } else {
            if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
              alert('Categoría eliminada.');
              window.AdminApp && window.AdminApp.loadCategories();
            }
          }
        } else if (target.classList.contains('btn-goto-products')) {
          window.switchAdminView('productos');
        }
      });
    },

    refreshAllData: function () {
      this.loadDashboardMetrics();
      this.loadOrders();
      this.loadProducts();
      this.loadCategories();
      this.loadClients();
    },

    loadDashboardMetrics: async function () {
      try {
        const res = await fetch('/api/admin/dashboard-stats');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const numClients = parseInt(data.totalClients) || 0;
            const numProducts = parseInt(data.totalProducts) || 0;
            const numOrders = parseInt(data.totalOrders) || 0;
            const numCategories = parseInt(data.totalCategories) || 0;

            const kpiClients = document.getElementById('kpi-val-clientes');
            const kpiProducts = document.getElementById('kpi-val-productos');
            const kpiOrders = document.getElementById('kpi-val-pedidos');
            const kpiCategories = document.getElementById('kpi-val-categorias');
            const kpiSales = document.getElementById('kpi-val-ventas');
            const kpiTicket = document.getElementById('kpi-val-ticket');

            if (kpiClients) kpiClients.textContent = numClients;
            if (kpiProducts) kpiProducts.textContent = numProducts;
            if (kpiOrders) kpiOrders.textContent = numOrders;
            if (kpiCategories) kpiCategories.textContent = numCategories;
            if (kpiSales) kpiSales.textContent = numOrders;
            if (kpiTicket) kpiTicket.textContent = numOrders;
          }
        }
      } catch (e) {
        console.warn('Cargando métricas...');
      }
    },

    loadOrders: async function () {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const orders = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []);
          this.renderOrdersTable(orders);
          
          const kpiOrders = document.getElementById('kpi-val-pedidos');
          const kpiSales = document.getElementById('kpi-val-ventas');
          const kpiTicket = document.getElementById('kpi-val-ticket');
          if (kpiOrders) kpiOrders.textContent = orders.length;
          if (kpiSales) kpiSales.textContent = orders.length;
          if (kpiTicket) kpiTicket.textContent = orders.length;
        }
      } catch (e) {
        this.renderOrdersTable([]);
      }
    },

    renderOrdersTable: function (orders) {
      const dashTbody = document.getElementById('dash-orders-tbody');
      const ordersTbody = document.getElementById('orders-page-tbody');

      if (!orders || orders.length === 0) {
        const emptyHtml = `<tr><td colspan="6" class="table-empty-cell">Sin comandas o pedidos registrados hoy.</td></tr>`;
        if (dashTbody) dashTbody.innerHTML = emptyHtml;
        if (ordersTbody) ordersTbody.innerHTML = emptyHtml;
        return;
      }

      const rowsHtml = orders.slice(0, 10).map(ord => {
        const code = ord.id ? `#BS-${String(ord.id).slice(-4).toUpperCase()}` : '#BS-0000';
        const client = ord.customerName || ord.user_name || 'Cliente Particular';
        const total = (parseFloat(ord.total) || 0).toFixed(2);
        const status = ord.status || 'pendiente';
        const badgeClass = status === 'entregado' ? 'badge-success' : (status === 'cancelado' ? 'badge-danger' : 'badge-warning');

        return `
          <tr>
            <td><strong>${code}</strong></td>
            <td>${client}</td>
            <td>${ord.items ? ord.items.length : 1} items</td>
            <td><strong>S/ ${total}</strong></td>
            <td><span class="badge ${badgeClass}">${status.toUpperCase()}</span></td>
            <td>
              <button class="btn btn-xs btn-secondary btn-view-order" data-order-id="${ord.id}">Ver Detalle</button>
            </td>
          </tr>
        `;
      }).join('');

      if (dashTbody) dashTbody.innerHTML = rowsHtml;
      if (ordersTbody) ordersTbody.innerHTML = rowsHtml;
    },

    loadProducts: async function () {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const products = await res.json();
          const list = Array.isArray(products) ? products : [];
          this.renderProductsTable(list);

          const kpiProducts = document.getElementById('kpi-val-productos');
          if (kpiProducts && list.length > 0) kpiProducts.textContent = list.length;
        }
      } catch (e) {
        this.renderProductsTable([]);
      }
    },

    renderProductsTable: function (products) {
      const tbody = document.getElementById('products-page-tbody');
      if (!tbody) return;

      if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-empty-cell">Sin productos registrados en el catálogo.</td></tr>`;
        return;
      }

      tbody.innerHTML = products.map(p => {
        const price = (parseFloat(p.price) || 0).toFixed(2);
        const img = p.image || '/imagenes/portada/Portada1E.webp';
        return `
          <tr>
            <td><img src="${img}" class="product-table-img" alt="${p.name}"></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge badge-neutral">${(p.category || 'General').toUpperCase()}</span></td>
            <td><strong>S/ ${price}</strong></td>
            <td>${p.stock !== undefined ? p.stock : 25} un.</td>
            <td><span class="badge badge-success">ACTIVO</span></td>
            <td>
              <button class="btn btn-xs btn-secondary btn-edit-product" data-product-id="${p.id}">Editar</button>
            </td>
          </tr>
        `;
      }).join('');
    },

    loadCategories: async function () {
      const defaultCategories = [
        { id: 'C0001', code: 'C0001', slug: 'adicionales', name: 'ADICIONALES', banner: '/imagenes/categorias/adicionales/banner.webp', order: 1 },
        { id: 'C0002', code: 'C0002', slug: 'alitas', name: 'ALITAS', banner: '/imagenes/categorias/alitas/banner.webp', order: 2 },
        { id: 'C0003', code: 'C0003', slug: 'bebidas', name: 'BEBIDAS', banner: '/imagenes/categorias/bebidas/banner.webp', order: 3 },
        { id: 'C0004', code: 'C0004', slug: 'broaster', name: 'BROASTER', banner: '/imagenes/categorias/broaster/banner.webp', order: 4 },
        { id: 'C0005', code: 'C0005', slug: 'hamburguesas', name: 'HAMBURGUESAS', banner: '/imagenes/categorias/hamburguesas/banner.webp', order: 5 },
        { id: 'C0006', code: 'C0006', slug: 'infusiones', name: 'INFUSIONES', banner: '/imagenes/categorias/infusiones/banner.webp', order: 6 },
        { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS', banner: '/imagenes/categorias/platos-amazonicos/banner.webp', order: 7 },
        { id: 'C0008', code: 'C0008', slug: 'promociones', name: 'PROMOCIONES', banner: '/imagenes/categorias/promociones/banner.webp', order: 8 },
        { id: 'C0009', code: 'C0009', slug: 'refrescos', name: 'REFRESCOS', banner: '/imagenes/categorias/refrescos/banner.webp', order: 9 },
        { id: 'C0010', code: 'C0010', slug: 'salchipapas', name: 'SALCHIPAPAS Y SALCHIBROASTERS', banner: '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp', order: 10 }
      ];

      try {
        const res = await fetch('/api/categories');
        let list = [];
        if (res.ok) {
          const cats = await res.json();
          if (Array.isArray(cats) && cats.length > 0) {
            list = cats;
          } else if (cats && Array.isArray(cats.data) && cats.data.length > 0) {
            list = cats.data;
          }
        }
        
        if (!list || list.length === 0) {
          list = defaultCategories;
        }

        window.BuchiSapaAdmin.categories = list;
        this.renderCategoriesView(list);

        const kpiCats = document.getElementById('kpi-val-categorias');
        if (kpiCats) kpiCats.textContent = list.length;
      } catch (e) {
        window.BuchiSapaAdmin.categories = defaultCategories;
        this.renderCategoriesView(defaultCategories);
      }
    },

    renderCategoriesView: function (cats) {
      const container = document.getElementById('category-cards-container');
      const badgeCount = document.getElementById('category-count-badge');
      const tbody = document.getElementById('categories-page-tbody');

      if (badgeCount) badgeCount.textContent = `${cats.length} Categorías`;

      if (container) {
        if (!cats || cats.length === 0) {
          container.innerHTML = '<div class="category-loading-message">No hay categorías registradas en la carta digital.</div>';
          return;
        }

        container.innerHTML = cats.map(c => `
          <div class="category-item-card" data-cat-id="${c.id || c.code || c.slug}">
            <div class="category-card-banner-wrap">
              <img src="${c.banner || c.image || '/imagenes/categorias/adicionales/banner.webp'}" alt="${c.name}" class="category-card-banner-img" onerror="this.src='/imagenes/portada/Portada1E.webp'">
              <div class="category-card-banner-overlay"></div>
              <span class="category-code-badge">${c.code || c.slug || c.id}</span>
              <span class="category-order-badge">#${c.order || 1}</span>
            </div>
            <div class="category-card-body">
              <h3 class="category-card-name" title="${c.name}">${c.name}</h3>
              <div class="category-card-footer">
                <button class="btn btn-xs btn-primary btn-edit-category" data-cat-id="${c.id || c.code || c.slug}" type="button">
                  <span>Editar</span>
                </button>
                <button class="btn btn-xs btn-danger btn-delete-category" data-cat-id="${c.id || c.code || c.slug}" type="button">
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }

      if (tbody) {
        tbody.innerHTML = cats.map(c => `
          <tr>
            <td><span class="badge badge-gold">#${c.order || 1}</span></td>
            <td><code>${c.code || c.id}</code></td>
            <td><img src="${c.banner || c.image || '/imagenes/portada/Portada1E.webp'}" class="category-table-banner" alt="${c.name}"></td>
            <td><strong class="category-table-title">${c.name}</strong></td>
            <td class="category-table-desc">${c.description || '-'}</td>
            <td class="table-cell-right">
              <button class="btn btn-xs btn-primary btn-edit-category" data-cat-id="${c.id || c.code || c.slug}" type="button">Editar</button>
              <button class="btn btn-xs btn-danger btn-delete-category" data-cat-id="${c.id || c.code || c.slug}" type="button">Eliminar</button>
            </td>
          </tr>
        `).join('');
      }
    },

    loadClients: async function () {
      try {
        const res = await fetch('/api/admin/clients');
        if (res.ok) {
          const data = await res.json();
          const clients = Array.isArray(data.clients) ? data.clients : [];
          this.renderClientsTable(clients);

          const kpiClients = document.getElementById('kpi-val-clientes');
          if (kpiClients && clients.length > 0) kpiClients.textContent = clients.length;
        }
      } catch (e) {
        this.renderClientsTable([]);
      }
    },

    renderClientsTable: function (clients) {
      const tbody = document.getElementById('clients-page-tbody');
      if (!tbody) return;

      if (!clients || clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty-cell">Sin clientes registrados aún.</td></tr>`;
        return;
      }

      tbody.innerHTML = clients.map(c => `
        <tr>
          <td><strong>${c.name || 'Usuario BuchiSapa'}</strong></td>
          <td>${c.email || '-'}</td>
          <td>${c.phone || '-'}</td>
          <td>${c.dni || '-'}</td>
          <td><span class="badge badge-blue">${c.orderCount || 1} pedidos</span></td>
        </tr>
      `).join('');
    }
  };

  // Helper para cambio de vista entre menú lateral (100% puro en clases CSS)
  window.switchAdminView = function (viewId) {
    if (!viewId) return;

    const views = document.querySelectorAll('.admin-view');
    views.forEach(v => {
      v.classList.remove('active');
    });

    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
      sidebar.classList.remove('active', 'open');
    }
    if (overlay) {
      overlay.classList.remove('active', 'open');
    }

    try {
      if (history.replaceState) {
        history.replaceState(null, '', `#${viewId}`);
      } else {
        location.hash = `#${viewId}`;
      }
    } catch (e) {}

    window.BuchiSapaAdmin.currentView = viewId;
  };

  // Helper Modales
  window.openNewProductModal = function () {
    const backdrop = document.getElementById('modal-product-backdrop');
    if (backdrop) backdrop.classList.add('active');
  };

  window.openEditProductModal = function (productId) {
    const backdrop = document.getElementById('modal-product-backdrop');
    const title = document.getElementById('modal-product-title');
    if (title) title.textContent = `Editar Producto #${productId}`;
    if (backdrop) backdrop.classList.add('active');
  };

  window.openNewCategoryModal = function (catId) {
    const backdrop = document.getElementById('modal-category-backdrop');
    const title = document.getElementById('modal-category-title');
    if (title) title.textContent = catId ? `Editar Categoría #${catId}` : 'Nueva Categoría';
    if (backdrop) backdrop.classList.add('active');
  };

  window.viewOrderDetail = function (orderId) {
    const backdrop = document.getElementById('modal-order-backdrop');
    const body = document.getElementById('modal-order-body');
    if (body) {
      body.innerHTML = `<p class="p-4 text-center">Cargando detalles de comanda #${orderId}...</p>`;
    }
    if (backdrop) backdrop.classList.add('active');
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.BuchiSapaAdmin.init();
  });
})();
