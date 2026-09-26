/**
 * BUCHISAPA ADMIN - API SERVICES LAYER
 * Layer: /admin/js/core/api.js
 */

(function () {
  'use strict';

  const AdminApi = {
    // AUTHENTICATION
    async login(email, password) {
      if (window.BuchisapaAPI && typeof window.BuchisapaAPI.loginAuth === 'function') {
        try {
          const sbAuth = await window.BuchisapaAPI.loginAuth(email, password);
          if (sbAuth && sbAuth.success) return sbAuth;
        } catch (e) {
          console.warn('Supabase auth fallback to /api/auth/login:', e);
        }
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Error al autenticar');
      }
      return data;
    },

    // PRODUCTS
    async getProducts() {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Error al cargar productos');
      return await res.json();
    },

    async saveProduct(productData, isEdit = false, id = null) {
      const url = isEdit ? `/api/products/${id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!res.ok) throw new Error('Error al guardar producto');
      return await res.json();
    },

    async updateProductStock(id, stock, available) {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock, available })
      });
      if (!res.ok) throw new Error('Error al actualizar stock');
      return await res.json();
    },

    async deleteProduct(id) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      return await res.json();
    },

    // ORDERS
    async getOrders() {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Error al cargar pedidos');
      return await res.json();
    },

    async updateOrderStatus(id, status) {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error al actualizar pedido');
      return await res.json();
    },

    // SUPPLIES & UTENSILS
    async getSupplies() {
      const res = await fetch('/api/supplies');
      if (!res.ok) throw new Error('Error al cargar insumos');
      return await res.json();
    },

    async updateSupplyStock(id, stock) {
      const res = await fetch(`/api/supplies/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      });
      if (!res.ok) throw new Error('Error al actualizar insumo');
      return await res.json();
    },

    async getUtensils() {
      const res = await fetch('/api/utensils');
      if (!res.ok) throw new Error('Error al cargar utensilios');
      return await res.json();
    },

    // CAJA
    async getCaja() {
      const res = await fetch('/api/caja');
      if (!res.ok) throw new Error('Error al cargar datos de caja');
      return await res.json();
    },

    async addCajaMovement(data) {
      const res = await fetch('/api/caja/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al registrar movimiento');
      return await res.json();
    },

    async abrirCaja(initialCash, cajero) {
      const res = await fetch('/api/caja/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_cash: initialCash, cajero })
      });
      if (!res.ok) throw new Error('Error al abrir turno');
      return await res.json();
    },

    async cerrarCaja(data) {
      const res = await fetch('/api/caja/cerrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al cerrar turno');
      return await res.json();
    },

    // TICKETS
    async getTickets() {
      const res = await fetch('/api/tickets');
      if (!res.ok) throw new Error('Error al cargar tickets');
      return await res.json();
    },

    async createTicket(ticketData) {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      if (!res.ok) throw new Error('Error al emitir ticket');
      return await res.json();
    },

    // PORTADAS
    async getPortadas() {
      const res = await fetch('/api/portadas');
      if (!res.ok) throw new Error('Error al cargar portadas');
      return await res.json();
    },

    async savePortada(portadaData, isEdit = false, id = null) {
      const url = isEdit ? `/api/portadas/${id}` : '/api/portadas';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portadaData)
      });
      if (!res.ok) throw new Error('Error al guardar portada');
      return await res.json();
    },

    async deletePortada(id) {
      const res = await fetch(`/api/portadas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar portada');
      return await res.json();
    }
  };

  window.AdminApi = AdminApi;

})();
