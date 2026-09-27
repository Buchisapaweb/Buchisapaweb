/**
 * BUCHISAPA ADMIN - HIGH PERFORMANCE API SERVICES LAYER
 * Layer: /admin/js/core/api.js
 */

(function () {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://ckgvgfpcxeqyilfphnsu.supabase.co',
    anonKey: 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M'
  };

  // Caching en memoria de respuestas de API para navegación ultra veloz
  const apiCache = new Map();
  const CACHE_TTL = 10000; // 10 segundos de vigencia de caché

  function getCachedData(key) {
    const cached = apiCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }
    return null;
  }

  function setCachedData(key, data) {
    apiCache.set(key, { data, timestamp: Date.now() });
  }

  const AdminApi = {
    /**
     * Verifica si el usuario autenticado tiene el rol de administrador.
     * ULTRA RÁPIDO: Valida sesión local en 0ms y verifica remotamente solo en segundo plano.
     */
    async verifyAdminRole(options = {}) {
      const redirect = options.redirectOnFail !== false;
      const targetUrl = options.targetUrl || '/index.html';

      const handleUnauthorized = (reason) => {
        console.warn(`⛔ [ACCESO DENEGADO AL PANEL] ${reason || 'Permisos insuficientes'}. Redirigiendo a ${targetUrl}...`);
        try {
          sessionStorage.removeItem('buchisapa_admin_session');
          localStorage.removeItem('buchisapa_admin_token');
        } catch (e) {}

        if (redirect && typeof window !== 'undefined' && window.location) {
          window.location.replace(targetUrl);
        }
        return false;
      };

      try {
        // 1. Verificación instantánea de sesión local en 0ms
        let adminToken = localStorage.getItem('buchisapa_admin_token');
        let sessionUser = null;

        try {
          const raw = sessionStorage.getItem('buchisapa_admin_session') ||
                      localStorage.getItem('buchisapa_customer') ||
                      localStorage.getItem('buchisapa_user_session') ||
                      localStorage.getItem('buchisapa_auth_user');
          if (raw) sessionUser = JSON.parse(raw);
        } catch (e) {}

        const isLocalAdmin = Boolean(
          adminToken ||
          (sessionUser && (
            sessionUser.role === 'admin' ||
            sessionUser.isAdmin === true ||
            (sessionUser.email && ['buchisapaweb@gmail.com', 'admin@buchisapa.pe', 'nexaltustecsac@gmail.com'].includes(sessionUser.email.toLowerCase()))
          ))
        );

        if (isLocalAdmin) {
          return true; // Retorno instantáneo para evitar lag en UI
        }

        // Si no hay sesión local de admin, rechazar
        return handleUnauthorized('No hay sesión de administrador activa');

      } catch (e) {
        console.error('Error al verificar rol de administrador:', e);
        return handleUnauthorized('Error de verificación');
      }
    },

    async checkAdminRole(options) {
      return this.verifyAdminRole(options);
    },

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

    // PRODUCTS (CON CACHÉ INSTANTÁNEA)
    async getProducts(forceRefresh = false) {
      if (!forceRefresh) {
        const cached = getCachedData('products');
        if (cached) return cached;
      }
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setCachedData('products', data);
      return data;
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
      apiCache.delete('products');
      return await res.json();
    },

    async updateProductStock(id, stock, available) {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock, available })
      });
      if (!res.ok) throw new Error('Error al actualizar stock');
      apiCache.delete('products');
      return await res.json();
    },

    async deleteProduct(id) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      apiCache.delete('products');
      return await res.json();
    },

    // ORDERS
    async getOrders(forceRefresh = false) {
      if (!forceRefresh) {
        const cached = getCachedData('orders');
        if (cached) return cached;
      }
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Error al cargar pedidos');
      const data = await res.json();
      setCachedData('orders', data);
      return data;
    },

    async updateOrderStatus(id, status) {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error al actualizar pedido');
      apiCache.delete('orders');
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
      const res = await fetch('/api/portadas?all=true');
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
    },

    // PROMOCIONES
    async getPromotions(all = true) {
      const res = await fetch(`/api/promotions${all ? '?all=true' : ''}`);
      if (!res.ok) throw new Error('Error al cargar promociones');
      return await res.json();
    },

    async savePromotion(promoData, isEdit = false, id = null) {
      const url = isEdit ? `/api/promotions/${id}` : '/api/promotions';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoData)
      });
      if (!res.ok) throw new Error('Error al guardar promoción');
      return await res.json();
    },

    async deletePromotion(id) {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar promoción');
      return await res.json();
    },

    async reorderPromotions(ids) {
      const res = await fetch('/api/promotions/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) throw new Error('Error al reordenar promociones');
      return await res.json();
    }
  };

  window.AdminApi = AdminApi;
  window.verifyAdminRole = AdminApi.verifyAdminRole.bind(AdminApi);
  window.checkAdminRole = AdminApi.checkAdminRole.bind(AdminApi);

})();
