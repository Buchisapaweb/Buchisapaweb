/**
 * BuchiSapa Culqi Payment Module (Frontend)
 * Archivo: /public/culqi/culqi-payment.js
 * 
 * Integración oficial del SDK Culqi Checkout V4:
 * 1. Configuración de llave pública y opciones (Culqi.settings, Culqi.options)
 * 2. Activación del checkout mediante 'Culqi.open()' en el botón de pago
 * 3. Captura del token en la función global 'culqi()' y envío seguro al backend
 */
(function() {
  'use strict';

  let culqiConfig = {
    publicKey: null,
    isLoaded: false
  };

  let currentPendingOrder = null;

  /**
   * Obtiene la configuración de llaves públicas desde el backend
   */
  async function loadCulqiConfig() {
    if (culqiConfig.publicKey) return culqiConfig.publicKey;
    try {
      const res = await fetch('/api/payments/culqi/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.publicKey) {
          culqiConfig.publicKey = data.publicKey;
          return data.publicKey;
        }
      }
    } catch (e) {
      console.warn('⚠️ Error al cargar config de Culqi desde backend:', e);
    }
    culqiConfig.publicKey = 'pk_test_04c5e31a0e10b14b';
    return culqiConfig.publicKey;
  }

  /**
   * Carga dinámica del SDK Culqi Checkout V4
   */
  function ensureCulqiV4Script() {
    return new Promise((resolve) => {
      if (window.Culqi) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src*="checkout.culqi.com/js/v4"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(!!window.Culqi));
        setTimeout(() => resolve(!!window.Culqi), 800);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.culqi.com/js/v4';
      script.async = true;
      script.onload = () => resolve(!!window.Culqi);
      script.onerror = () => {
        console.warn('⚠️ No se pudo cargar checkout.culqi.com/js/v4 de forma remota');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Valida los datos de la tarjeta para formulario embebido o directo
   */
  function validateCardData(cardData) {
    if (!cardData) throw new Error('Debes ingresar los datos de tu tarjeta.');
    
    const cleanNumber = String(cardData.cardNumber || cardData.card_number || '').replace(/\D/g, '');
    if (cleanNumber.length < 15 || cleanNumber.length > 19) {
      throw new Error('El número de tarjeta debe contener entre 15 y 16 dígitos.');
    }

    const cleanCvv = String(cardData.cvv || '').trim();
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      throw new Error('El código CVV debe ser de 3 o 4 dígitos.');
    }

    const month = parseInt(cardData.expMonth || cardData.expiration_month, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error('El mes de vencimiento debe estar entre 01 y 12.');
    }

    let year = parseInt(cardData.expYear || cardData.expiration_year, 10);
    if (isNaN(year)) {
      throw new Error('El año de vencimiento no es válido.');
    }
    if (year < 100) year += 2000;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      throw new Error('La tarjeta ingresada está vencida.');
    }

    const email = String(cardData.email || '').trim();
    if (!email || !email.includes('@')) {
      throw new Error('El correo electrónico no es válido.');
    }

    return {
      card_number: cleanNumber,
      cvv: cleanCvv,
      expiration_month: String(month).padStart(2, '0'),
      expiration_year: String(year),
      email: email
    };
  }

  /**
   * Tokeniza una tarjeta llamando al backend proxy seguro
   */
  async function tokenizeCard(cardData) {
    const validated = validateCardData(cardData);
    const res = await fetch('/api/payments/culqi/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Error al validar y tokenizar los datos de la tarjeta.');
    }

    return data.id;
  }

  /**
   * Envía el token id generado al backend para cobrar y registrar el pedido
   */
  async function chargeToken(params) {
    if (!params.tokenId) throw new Error('El token de la tarjeta es requerido.');
    if (!params.amount || params.amount <= 0) throw new Error('El monto de la compra debe ser mayor a 0.');
    if (!params.orderPayload) throw new Error('No se encontraron los datos del pedido a procesar.');

    const res = await fetch('/api/payments/culqi/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: params.tokenId,
        email: params.email || params.orderPayload.customerEmail || 'cliente@buchisapa.pe',
        amount: params.amount,
        orderPayload: params.orderPayload
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'El banco no autorizó la transacción o hubo un error al procesar el cargo.');
    }

    return data;
  }

  /**
   * Limpia el carrito y los datos temporales del pedido al finalizar
   */
  function clearAllOrderData() {
    try {
      localStorage.removeItem('buchisapa_cart');
      localStorage.removeItem('buchisapa_cart_v1');
      sessionStorage.removeItem('buchisapa_current_order');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.warn('Error al limpiar almacenamiento del carrito:', e);
    }
  }

  /**
   * Procesa un pago con tarjeta directa
   */
  async function processCardPayment(options) {
    const { cardData, amount, orderPayload, onSuccess, onError } = options;
    try {
      const tokenId = await tokenizeCard(cardData);
      const chargeResult = await chargeToken({
        tokenId: tokenId,
        email: cardData.email,
        amount: amount,
        orderPayload: orderPayload
      });

      clearAllOrderData();
      if (typeof onSuccess === 'function') onSuccess(chargeResult);
      return chargeResult;
    } catch (err) {
      if (typeof onError === 'function') onError(err);
      else alert(`⚠️ Error en el pago: ${err.message}`);
      throw err;
    }
  }

  /**
   * Configura y abre el checkout oficial de Culqi V4
   * Utiliza Culqi.settings, Culqi.options y Culqi.open()
   */
  async function openCulqiV4Checkout(options) {
    options = options || {};
    const amount = Number(options.amount || 0);
    const amountInCents = Math.round(amount * 100);
    const orderPayload = options.orderPayload || {};
    const email = options.email || orderPayload.customerEmail || 'cliente@buchisapa.pe';
    const orderId = options.orderId || options.order || undefined;

    currentPendingOrder = {
      amount: amount,
      orderPayload: orderPayload,
      customerEmail: email,
      onSuccess: options.onSuccess,
      onError: options.onError
    };

    const publicKey = await loadCulqiConfig();
    await ensureCulqiV4Script();

    if (window.Culqi) {
      // 1. Configurar Llave Pública
      window.Culqi.publicKey = publicKey;

      // 2. Configurar Culqi.settings
      window.Culqi.settings({
        title: 'BuchiSapa - Pollería & Parrillas',
        currency: 'PEN',
        amount: amountInCents,
        order: orderId || undefined
      });

      // 3. Personalizar con Culqi.options
      window.Culqi.options({
        lang: 'es',
        modal: true,
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          bancaMovil: true,
          agente: true,
          billetera: true,
          cuotealo: true
        },
        style: {
          logo: `${window.location.origin}/imagenes/logo/logo-buchisapa.webp`,
          bannerColor: '#dc2626',
          buttonBackground: '#dc2626',
          menuColor: '#b91c1c',
          linksColor: '#dc2626',
          buttonText: `Pagar S/ ${amount.toFixed(2)}`,
          buttonTextColor: '#ffffff',
          priceColor: '#dc2626'
        }
      });

      // 4. Abrir ventana de pago
      window.Culqi.open();
      return true;
    }

    // Si Culqi V4 no está disponible, intentar fallback con Custom Checkout si existe
    if (typeof window.CulqiCheckout === 'function') {
      try {
        const Culqi = new window.CulqiCheckout(publicKey, {
          settings: { title: 'BuchiSapa', currency: 'PEN', amount: amountInCents },
          client: { email: email },
          options: { lang: 'es', modal: true }
        });
        Culqi.culqi = window.culqi;
        Culqi.open();
        return true;
      } catch (e) {
        console.warn('Fallback Custom Checkout error:', e);
      }
    }

    const err = new Error('No se pudo inicializar la pasarela de Culqi. Verifica tu conexión e intenta nuevamente.');
    if (options.onError) options.onError(err);
    else alert(err.message);
    return false;
  }

  /**
   * Conecta el evento 'Culqi.open()' a cualquier botón de pago especificado
   */
  function bindPaymentButton(buttonSelectorOrElement, getOrderData) {
    const btn = typeof buttonSelectorOrElement === 'string'
      ? document.querySelector(buttonSelectorOrElement)
      : buttonSelectorOrElement;

    if (!btn) return false;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const orderData = typeof getOrderData === 'function' ? getOrderData() : (getOrderData || {});
      openCulqiV4Checkout(orderData);
    });

    return true;
  }

  /**
   * Función global oficial 'culqi()' invocada por Culqi Checkout V4
   * al completar la tokenización o retornar respuesta
   */
  window.culqi = async function culqi() {
    if (!window.Culqi) {
      console.warn('⚠️ Se invocó culqi() pero Culqi no está definido en window.');
      return;
    }

    if (window.Culqi.token) {
      // Token creado exitosamente
      const token = window.Culqi.token.id;
      const email = window.Culqi.token.email || currentPendingOrder?.customerEmail || 'cliente@buchisapa.pe';
      
      console.log('✅ Se ha creado un Token en Culqi V4:', token);
      if (typeof window.Culqi.close === 'function') {
        window.Culqi.close();
      }

      // Enviar el token ID hacia el servidor con fetch
      try {
        if (!currentPendingOrder) {
          throw new Error('No se encontraron los datos del pedido en curso.');
        }

        const result = await chargeToken({
          tokenId: token,
          email: email,
          amount: currentPendingOrder.amount,
          orderPayload: currentPendingOrder.orderPayload
        });

        clearAllOrderData();

        if (currentPendingOrder.onSuccess) {
          currentPendingOrder.onSuccess(result);
        } else {
          const orderNum = currentPendingOrder.orderPayload?.orderNumber || Date.now();
          window.location.href = `/?order_success=${orderNum}`;
        }
      } catch (err) {
        console.error('❌ Error al procesar el cargo en el backend:', err);
        if (currentPendingOrder && currentPendingOrder.onError) {
          currentPendingOrder.onError(err);
        } else {
          alert(`⚠️ Error al procesar el pago: ${err.message || 'No se pudo completar la transacción con el banco.'}`);
        }
      }
    } else if (window.Culqi.order) {
      // Objeto Order creado exitosamente (para efectivo / billeteras CIP)
      const order = window.Culqi.order;
      console.log('✅ Se ha creado el objeto Order:', order);
      if (typeof window.Culqi.close === 'function') {
        window.Culqi.close();
      }

      clearAllOrderData();

      if (currentPendingOrder && currentPendingOrder.onSuccess) {
        currentPendingOrder.onSuccess({ success: true, order: order });
      } else {
        const orderNum = currentPendingOrder?.orderPayload?.orderNumber || Date.now();
        window.location.href = `/?order_success=${orderNum}`;
      }
    } else if (window.Culqi.error) {
      // Mostramos JSON de objeto error en consola
      console.error('❌ Error devuelto por Culqi:', window.Culqi.error);
      const userMsg = window.Culqi.error.user_message || window.Culqi.error.merchant_message || 'El pago no fue autorizado por la entidad bancaria.';

      if (currentPendingOrder && currentPendingOrder.onError) {
        currentPendingOrder.onError(new Error(userMsg));
      } else {
        alert(`⚠️ ${userMsg}`);
      }
    }
  };

  // Exponer API pública global
  window.BuchisapaCulqi = {
    loadConfig: loadCulqiConfig,
    validateCardData: validateCardData,
    tokenizeCard: tokenizeCard,
    chargeToken: chargeToken,
    clearAllOrderData: clearAllOrderData,
    processCardPayment: processCardPayment,
    openCulqiV4: openCulqiV4Checkout,
    openCheckout: openCulqiV4Checkout,
    openCustomCheckout: openCulqiV4Checkout,
    bindPaymentButton: bindPaymentButton
  };

  // Auto-vinculación en el DOM para botones de pago estándar
  document.addEventListener('DOMContentLoaded', () => {
    // Si existe el botón con id 'btn_pagar' según la documentación de Culqi
    const btnPagar = document.getElementById('btn_pagar');
    if (btnPagar) {
      btnPagar.addEventListener('click', function(e) {
        e.preventDefault();
        openCulqiV4Checkout();
      });
    }

    // Botón multipago en checkout.html
    const btnMultipago = document.getElementById('btn-open-culqi-multipago');
    if (btnMultipago && typeof window.openCulqiCustomCheckoutFromForm === 'function') {
      btnMultipago.addEventListener('click', function(e) {
        e.preventDefault();
        window.openCulqiCustomCheckoutFromForm();
      });
    }
  });

  console.log('💳 [BuchisapaCulqi] Módulo Culqi Checkout V4 listo y configurado.');
})();
