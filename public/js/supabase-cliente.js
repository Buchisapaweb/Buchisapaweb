/**
 * RESTAURANTE BUCHISAPA - Cliente Supabase JS
 * Conecta con el proyecto ckgvgfpcxeqyilfphnsu
 */

const SUPABASE_CONFIG = {
  url: 'https://ckgvgfpcxeqyilfphnsu.supabase.co',
  anonKey: 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M'
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
            orderId: parsedPayload?.id,
            orderNumber: parsedPayload?.order_number || parsedPayload?.orderNumber,
            customerName: parsedPayload?.customer_name || parsedPayload?.customerName,
            customerPhone: parsedPayload?.customer_phone || parsedPayload?.customerPhone,
            customerEmail: parsedPayload?.customer_email || parsedPayload?.customerEmail,
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
      let apiUrl = '/api/products';
      if (endpoint.startsWith('categories')) apiUrl = '/api/categories';
      if (endpoint.startsWith('orders')) {
        apiUrl = '/api/orders';
        if (endpoint.includes('?')) {
          const queryPart = endpoint.split('?')[1];
          if (queryPart.includes('customer_email=eq.') || queryPart.includes('email=')) {
            const match = queryPart.match(/(?:customer_email=eq\.|email=)([^&]+)/);
            if (match && match[1]) {
              apiUrl = `/api/orders?email=${match[1]}`;
            }
          }
        }
        if (options && options.method === 'PATCH') {
          const match = endpoint.match(/id=eq\.([^&]+)/);
          if (match && match[1]) {
            apiUrl = `/api/orders/${match[1]}/status`;
          }
        }
      }
      if (endpoint.startsWith('claims')) apiUrl = '/api/claims';
      if (endpoint.startsWith('users') || endpoint.startsWith('customers')) apiUrl = '/api/users';

      const res = await fetch(apiUrl, options);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      console.error('Error total en API:', e);
      return null;
    }
  },

  /**
   * Obtener productos
   */
  async getProducts() {
    return await this.request('products?select=*&order=popular.desc');
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

    // 2. Fallback a endpoint de Express /api/orders?email=...
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);
        if (list.length > 0) return list;
      }
    } catch (err) {
      // Fallback local
    }

    // 3. Verificación de pedidos locales en el almacén si no vienen filtrados
    try {
      const allRes = await fetch('/api/orders');
      if (allRes.ok) {
        const allJson = await allRes.json();
        const allList = Array.isArray(allJson) ? allJson : (allJson && Array.isArray(allJson.data) ? allJson.data : []);
        return allList.filter(o => {
          const orderEmail = (o.customer_email || o.customerEmail || '').trim().toLowerCase();
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

    const authUrl = `${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`;
    const res = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      const errDetail = data.error_description || data.msg || data.message || 'Credenciales inválidas en Supabase';
      throw new Error(errDetail);
    }

    const sbUser = data.user || {};
    const meta = sbUser.user_metadata || {};
    const appMeta = sbUser.app_metadata || {};

    const isAdmin = Boolean(
      meta.isAdmin === true ||
      meta.role === 'admin' ||
      appMeta.role === 'admin' ||
      ['buchisapaweb@gmail.com', 'admin@buchisapa.pe', 'nexaltustecsac@gmail.com'].includes(cleanEmail)
    );

    const userProfile = {
      id: sbUser.id,
      uid: sbUser.id,
      email: sbUser.email || cleanEmail,
      name: meta.name || meta.full_name || 'Usuario BuchiSapa',
      firstName: meta.firstName || meta.given_name || (meta.name ? meta.name.split(' ')[0] : 'Admin'),
      lastName: meta.lastName || meta.family_name || (meta.name ? meta.name.split(' ').slice(1).join(' ') : ''),
      phone: meta.phone || sbUser.phone || '',
      docType: meta.docType || 'DNI',
      docNumber: meta.docNumber || '',
      role: isAdmin ? 'admin' : (meta.role || 'customer'),
      isAdmin: isAdmin,
      emailVerified: Boolean(sbUser.email_confirmed_at || sbUser.confirmed_at || meta.email_verified),
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };

    return {
      success: true,
      user: userProfile,
      data: userProfile,
      token: data.access_token,
      isAdmin
    };
  }
};

window.BuchisapaAPI = BuchisapaAPI;
