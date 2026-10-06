/**
 * BUCHISAPA BURGER & BROASTER - PANEL ADMINISTRATIVO PRINCIPAL
 * Coordinador Maestro en /frontend/src/admin/routes/admin.js
 */
(function () {
  'use strict';

  window.BuchiSapaAdmin = {
    currentView: 'dashboard',

    init: function () {
      console.log('🚀 BuchiSapa Admin Inicializado.');
      this.bindNavigation();
      this.refreshAllData();
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
            const vSales = document.getElementById('dash-val-ventas');
            const vOrders = document.getElementById('dash-val-pedidos');
            const vProds = document.getElementById('dash-val-productos');
            const vClients = document.getElementById('dash-val-clientes');

            if (vSales) vSales.textContent = `S/ ${(parseFloat(data.totalSales) || 0).toFixed(2)}`;
            if (vOrders) vOrders.textContent = `${parseInt(data.totalOrders) || 0} órdenes`;
            if (vProds) vProds.textContent = `${parseInt(data.totalProducts) || 0} platillos`;
            if (vClients) vClients.textContent = `${parseInt(data.totalClients) || 0} clientes`;
          }
        }
      } catch (e) {
        console.warn('Cargando métricas de respaldo...');
      }
    },

    loadOrders: async function () {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const orders = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []);
          this.renderOrdersTable(orders);
        }
      } catch (e) {
        this.renderOrdersTable([]);
      }
    },

    renderOrdersTable: function (orders) {
      const dashTbody = document.getElementById('dash-orders-tbody');
      const ordersTbody = document.getElementById('orders-page-tbody');

      if (!orders || orders.length === 0) {
        const emptyHtml = `<tr><td colspan="8" class="text-center py-4 text-muted">Sin comandas o pedidos registrados hoy.</td></tr>`;
        if (dashTbody) dashTbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Sin comandas o pedidos registrados hoy.</td></tr>`;
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
              <button class="btn btn-xs btn-secondary" onclick="window.viewOrderDetail('${ord.id}')">Ver Detalle</button>
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
          this.renderProductsTable(Array.isArray(products) ? products : []);
        }
      } catch (e) {
        this.renderProductsTable([]);
      }
    },

    renderProductsTable: function (products) {
      const tbody = document.getElementById('products-page-tbody');
      if (!tbody) return;

      if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Sin productos registrados en el catálogo.</td></tr>`;
        return;
      }

      tbody.innerHTML = products.map(p => {
        const price = (parseFloat(p.price) || 0).toFixed(2);
        const img = p.image || '/imagenes/portada/Portada1E.webp';
        return `
          <tr>
            <td><img src="${img}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;"></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge badge-neutral">${(p.category || 'General').toUpperCase()}</span></td>
            <td><strong>S/ ${price}</strong></td>
            <td>${p.stock !== undefined ? p.stock : 25} un.</td>
            <td><span class="badge badge-success">ACTIVO</span></td>
            <td>
              <button class="btn btn-xs btn-secondary" onclick="window.openEditProductModal('${p.id}')">Editar</button>
            </td>
          </tr>
        `;
      }).join('');
    },

    loadCategories: async function () {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const cats = await res.json();
          this.renderCategoriesTable(Array.isArray(cats) ? cats : []);
        }
      } catch (e) {
        this.renderCategoriesTable([]);
      }
    },

    renderCategoriesTable: function (cats) {
      const tbody = document.getElementById('categories-page-tbody');
      if (!tbody) return;

      if (!cats || cats.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Sin categorías configuradas.</td></tr>`;
        return;
      }

      tbody.innerHTML = cats.map(c => `
        <tr>
          <td><img src="${c.banner || '/imagenes/portada/Portada1E.webp'}" style="width: 50px; height: 32px; border-radius: 6px; object-fit: cover;"></td>
          <td><strong>${c.name}</strong></td>
          <td><code>${c.code || c.id}</code></td>
          <td>${c.order || 1}</td>
          <td>${c.description || '-'}</td>
          <td>
            <button class="btn btn-xs btn-secondary" onclick="window.openEditCategoryModal('${c.id}')">Editar</button>
          </td>
        </tr>
      `).join('');
    },

    loadClients: async function () {
      try {
        const res = await fetch('/api/admin/clients');
        if (res.ok) {
          const data = await res.json();
          const clients = Array.isArray(data.clients) ? data.clients : [];
          this.renderClientsTable(clients);
        }
      } catch (e) {
        this.renderClientsTable([]);
      }
    },

    renderClientsTable: function (clients) {
      const tbody = document.getElementById('clients-page-tbody');
      if (!tbody) return;

      if (!clients || clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Sin clientes registrados aún.</td></tr>`;
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

  // Helper para cambio de vista entre menú lateral
  window.switchAdminView = function (viewId) {
    const views = document.querySelectorAll('.admin-view');
    views.forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });

    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
    }

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    window.BuchiSapaAdmin.currentView = viewId;
  };

  // Modales
  window.openNewProductModal = function () {
    const backdrop = document.getElementById('modal-product-backdrop');
    if (backdrop) backdrop.classList.add('active');
  };

  window.openNewCategoryModal = function () {
    const backdrop = document.getElementById('modal-category-backdrop');
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

  window.printCurrentModalOrder = function () {
    window.print();
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.BuchiSapaAdmin.init();
  });
})();
