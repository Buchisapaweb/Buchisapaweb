/**
 * BUCHISAPA ADMIN - API SERVICES LAYER
 * Layer: /admin/js/core/api.js
 */

(function () {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://ckgvgfpcxeqyilfphnsu.supabase.co',
    anonKey: 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M'
  };

  const AdminApi = {
    /**
     * Verifica si el usuario autenticado tiene el rol de administrador en Supabase
     * antes de cargar cualquier vista en el panel, redirigiendo al index si no tiene permisos.
     * @param {Object} options - Opciones de redirección y fallback { redirectOnFail: true, targetUrl: '/index.html' }
     * @returns {Promise<boolean>} Retorna true si tiene permisos de admin, false si no los tiene (y redirige)
     */
    async verifyAdminRole(options = {}) {
      const redirect = options.redirectOnFail !== false;
      const targetUrl = options.targetUrl || '/index.html';

      const handleUnauthorized = (reason) => {
        console.warn(`⛔ [ACCESO DENEGADO AL PANEL] ${reason || 'Permisos insuficientes'}. Redirigiendo a ${targetUrl}...`);
        try {
          // Limpiar tokens y sesiones no autorizadas para prevenir bucles
          sessionStorage.removeItem('buchisapa_admin_session');
          localStorage.removeItem('buchisapa_admin_token');
        } catch (e) {}

        if (redirect && typeof window !== 'undefined' && window.location) {
          window.location.replace(targetUrl);
        }
        return false;
      };

      try {
        // 1. Obtener sesión local y tokens
        let adminToken = localStorage.getItem('buchisapa_admin_token');
        let sessionUser = null;

        try {
          const raw = sessionStorage.getItem('buchisapa_admin_session') ||
                      localStorage.getItem('buchisapa_customer') ||
                      localStorage.getItem('buchisapa_user_session') ||
                      localStorage.getItem('buchisapa_auth_user');
          if (raw) sessionUser = JSON.parse(raw);
        } catch (e) {
          console.warn('Error al parsear sesión local:', e);
        }

        // Buscar token de acceso de Supabase (JWT)
        let supabaseToken = sessionUser?.accessToken || sessionUser?.token || null;
        if (!supabaseToken && typeof localStorage !== 'undefined') {
          try {
            const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
            if (sbKey) {
              const rawSb = JSON.parse(localStorage.getItem(sbKey) || '{}');
              if (rawSb?.access_token) {
                supabaseToken = rawSb.access_token;
                if (!sessionUser && rawSb.user) sessionUser = rawSb.user;
              }
            }
          } catch (e) {}
        }

        // Si no hay token ni usuario en sesión, no hay autenticación
        if (!adminToken && !sessionUser && !supabaseToken) {
          return handleUnauthorized('No hay sesión de usuario autenticada');
        }

        const userEmail = (sessionUser?.email || '').trim().toLowerCase();

        // 2. Validación directa contra Supabase Auth mediante el token JWT
        if (supabaseToken && typeof supabaseToken === 'string' && supabaseToken.startsWith('ey')) {
          try {
            const sbRes = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/user`, {
              method: 'GET',
              headers: {
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${supabaseToken}`
              }
            });

            if (sbRes.ok) {
              const sbUser = await sbRes.json();
              const meta = sbUser?.user_metadata || {};
              const appMeta = sbUser?.app_metadata || {};
              const isAdmin = Boolean(
                meta.isAdmin === true ||
                meta.role === 'admin' ||
                appMeta.role === 'admin' ||
                sbUser?.role === 'admin'
              );

              if (isAdmin) {
                return true;
              } else {
                return handleUnauthorized('El usuario autenticado en Supabase no tiene rol de administrador');
              }
            }
          } catch (errAuth) {
            console.warn('Verificación directa Supabase Auth no concluyente:', errAuth);
          }
        }

        // 3. Validación de rol en Supabase REST (tabla users / perfiles)
        if (userEmail) {
          try {
            const restUrl = `${SUPABASE_CONFIG.url}/rest/v1/users?email=eq.${encodeURIComponent(userEmail)}&select=id,email,role,isAdmin`;
            const restRes = await fetch(restUrl, {
              method: 'GET',
              headers: {
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
              }
            });

            if (restRes.ok) {
              const users = await restRes.json();
              if (Array.isArray(users) && users.length > 0) {
                const u = users[0];
                const isAdmin = Boolean(u.role === 'admin' || u.isAdmin === true);
                if (isAdmin) {
                  return true;
                } else {
                  return handleUnauthorized('El registro en Supabase indica que el usuario no es administrador');
                }
              }
            }
          } catch (errRest) {
            console.warn('Verificación en tabla Supabase no concluyente:', errRest);
          }
        }

        // 4. Validación con el endpoint backend /api/auth/verify-admin
        try {
          const verifyRes = await fetch('/api/auth/verify-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
            },
            body: JSON.stringify({
              email: userEmail,
              token: adminToken || supabaseToken
            })
          });

          if (verifyRes.ok) {
            const result = await verifyRes.json();
            if (result && result.isAdmin === true) {
              return true;
            } else if (result && result.isAdmin === false) {
              return handleUnauthorized('El servidor backend confirmó que no cuenta con rol de administrador');
            }
          }
        } catch (errServer) {
          console.warn('Verificación backend /api/auth/verify-admin no concluyente:', errServer);
        }

        // 5. Salvaguarda: Verificar rol de administrador en la sesión local
        if (sessionUser) {
          const isLocalAdmin = Boolean(
            sessionUser.role === 'admin' ||
            sessionUser.isAdmin === true ||
            (sessionUser.email && ['buchisapaweb@gmail.com', 'admin@buchisapa.pe', 'nexaltustecsac@gmail.com'].includes(sessionUser.email.toLowerCase()))
          );
          if (isLocalAdmin) {
            return true;
          }
        }

        // Si llegó aquí sin verificar permisos de admin
        return handleUnauthorized('El usuario no posee permisos de administrador');

      } catch (e) {
        console.error('Error crítico al verificar rol de administrador:', e);
        return handleUnauthorized('Error de verificación');
      }
    },

    // Alias para compatibilidad
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
  window.verifyAdminRole = AdminApi.verifyAdminRole.bind(AdminApi);
  window.checkAdminRole = AdminApi.checkAdminRole.bind(AdminApi);

})();
