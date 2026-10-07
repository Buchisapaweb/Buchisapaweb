/**
 * RESTAURANTE BUCHISAPA - Cliente Supabase JS
 * Conecta con el proyecto ckgvgfpcxeqyilfphnsu
 */

const SUPABASE_CONFIG = {
  url: (typeof window !== 'undefined' && window.SUPABASE_URL) || 'https://ckgvgfpcxeqyilfphnsu.supabase.co',
  anonKey: (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M'
};

const BuchisapaAPI = {
  /**
   * Petición REST a Supabase
   */
  async request(endpoint, options = {}) {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint.replace(/^\//, '')}`;
    const headers = {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        // Solo reportar a la auditoría técnica de fallos si NO es un 404 de lectura esperada (tabla aún no aprovisionada)
        // o si es una operación crítica de escritura (INSERT / UPDATE)
        const isFetch = !options.method || options.method === 'GET';
        const isTableNotFound404 = res.status === 404;

        if (endpoint.startsWith('orders') && (!isFetch || !isTableNotFound404)) {
          let parsedPayload = null;
          try { if (options.body) parsedPayload = JSON.parse(options.body); } catch (e) {}
          this.reportError({
            operation: options.method === 'POST' ? 'INSERT_ORDER' : (options.method === 'PATCH' ? 'UPDATE_ORDER_STATUS' : 'FETCH_ORDERS'),
            idPedido: parsedPayload?.id,
            orderNumber: parsedPayload?.order_number || parsedPayload?.orderNumber,
            nombreCliente: parsedPayload?.customer_name || parsedPayload?.nombreCliente,
            telefonoCliente: parsedPayload?.customer_phone || parsedPayload?.telefonoCliente,
            emailCliente: parsedPayload?.customer_email || parsedPayload?.emailCliente,
            total: parsedPayload?.total,
            endpoint: url,
            statusCode: res.status,
            errorCode: `HTTP_${res.status}`,
            errorMessage: `Error Supabase [${res.status}]: ${res.statusText}`,
            technicalDetails: errText || `Fallo HTTP status ${res.status}`,
            payload: parsedPayload,
            source: 'client'
          });
        }
        throw new Error(`Error Supabase [${res.status}]: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      // Fallback transparente a API local Express si Supabase no responde o no tiene la tabla
      return await this.fallbackApi(endpoint, options);
    }
  },

  /**
   * Reportar error técnico al panel de administración para monitoreo
   */
  async reportError(errorData) {
    try {
      await fetch('/api/supabase-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (e) {
      console.warn('No se pudo enviar log de error Supabase:', e);
    }
  },

  /**
   * Fallback a Express API
   */
  async fallbackApi(endpoint, options) {
    try {
      let apiUrl = '/api/productos';
      if (endpoint.startsWith('categories')) apiUrl = '/api/categorias';
      if (endpoint.startsWith('orders')) {
        apiUrl = '/api/pedidos';
        if (endpoint.includes('?')) {
          const queryPart = endpoint.split('?')[1];
          if (queryPart.includes('customer_email=eq.') || queryPart.includes('email=')) {
            const match = queryPart.match(/(?:customer_email=eq\.|email=)([^&]+)/);
            if (match && match[1]) {
              apiUrl = `/api/pedidos?email=${match[1]}`;
            }
          }
        }
        if (options && options.method === 'PATCH') {
          const match = endpoint.match(/id=eq\.([^&]+)/);
          if (match && match[1]) {
            apiUrl = `/api/pedidos/${match[1]}/status`;
          }
        }
      }
      if (endpoint.startsWith('claims')) apiUrl = '/api/reclamaciones';
      if (endpoint.startsWith('users') || endpoint.startsWith('customers')) apiUrl = '/api/usuarios';

      const res = await fetch(apiUrl, options);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.datos !== undefined ? json.datos : json;
    } catch (e) {
      console.error('Error total en API:', e);
      return null;
    }
  },

  /**
   * Obtener productos
   */
  async getProducts() {
    try {
      const res = await this.request('products?select=*&order=popular.desc');
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch (e) {
      console.warn('Fallback de productos desde Supabase:', e);
    }
    if (typeof window.getFallbackProducts === 'function') {
      return window.getFallbackProducts();
    }
    return [];
  },

  /**
   * Obtener categorías
   */
  async getCategories() {
    return await this.request('categories?select=*');
  },

  /**
   * Guardar nuevo pedido
   */
  async createOrder(orderData) {
    return await this.request('orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  /**
   * Obtener historial de pedidos filtrados por correo de cliente
   */
  async getOrdersByEmail(email) {
    if (!email) return [];
    const cleanEmail = email.trim().toLowerCase();

    // 1. Intento primario: Consulta a Supabase REST con filtro PostgREST customer_email
    try {
      const endpoint = `orders?customer_email=eq.${encodeURIComponent(cleanEmail)}&order=created_at.desc`;
      const orders = await this.request(endpoint);
      if (Array.isArray(orders) && orders.length > 0) {
        return orders;
      }
    } catch (e) {
      // Ignorar fallo de Supabase y continuar transparentemente con el fallback local
    }

    // 2. Fallback a endpoint de Express /api/pedidos?email=...
    try {
      const res = await fetch(`/api/pedidos?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json && Array.isArray(json.datos) ? json.datos : []);
        if (list.length > 0) return list;
      }
    } catch (err) {
      // Fallback local
    }

    // 3. Verificación de pedidos locales en el almacén si no vienen filtrados
    try {
      const allRes = await fetch('/api/pedidos');
      if (allRes.ok) {
        const allJson = await allRes.json();
        const allList = Array.isArray(allJson) ? allJson : (allJson && Array.isArray(allJson.datos) ? allJson.datos : []);
        return allList.filter(o => {
          const orderEmail = (o.customer_email || o.emailCliente || '').trim().toLowerCase();
          return orderEmail === cleanEmail;
        });
      }
    } catch (e) {}

    return [];
  },

  /**
   * Registrar reclamo
   */
  async createClaim(claimData) {
    return await this.request('claims', {
      method: 'POST',
      body: JSON.stringify(claimData)
    });
  },

  /**
   * Autenticación directa con Supabase Auth
   */
  async loginAuth(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      const authUrl = `${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });

      const datos = await res.json().catch(() => ({}));
      if (!res.ok || !datos.access_token) {
        const errDetail = datos.error_description || datos.msg || datos.message || 'El correo electrónico o la contraseña ingresados no son correctos.';
        throw new Error(errDetail);
      }

      const sbUser = datos.user || {};
      const meta = sbUser.user_metadata || {};
      const appMeta = sbUser.app_metadata || {};

      const isAdmin = (sbUser.email || cleanEmail).trim().toLowerCase() === 'buchisapaweb@gmail.com';

      const userProfile = {
        id: sbUser.id,
        uid: sbUser.id,
        email: sbUser.email || cleanEmail,
        nombre: meta.nombre || meta.full_name || 'Usuario BuchiSapa',
        primerNombre: meta.primerNombre || meta.given_name || (meta.nombre ? meta.nombre.split(' ')[0] : 'Admin'),
        apellido: meta.apellido || meta.family_name || (meta.nombre ? meta.nombre.split(' ').slice(1).join(' ') : ''),
        phone: meta.phone || sbUser.phone || '',
        tipoDoc: meta.tipoDoc || 'DNI',
        numeroDoc: meta.numeroDoc || '',
        role: isAdmin ? 'admin' : (meta.role || 'customer'),
        isAdmin: isAdmin,
        emailVerified: Boolean(sbUser.email_confirmed_at || sbUser.confirmed_at || meta.email_verified),
        accessToken: datos.access_token,
        refreshToken: datos.refresh_token
      };

      return {
        exito: true,
        user: userProfile,
        datos: userProfile,
        token: datos.access_token,
        isAdmin
      };
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('failed') || msg.includes('fetch') || msg.includes('network') || msg.includes('typeerror')) {
        throw new Error('El correo electrónico o la contraseña ingresados no son correctos.');
      }
      throw err;
    }
  }
};

window.BuchisapaAPI = BuchisapaAPI;
