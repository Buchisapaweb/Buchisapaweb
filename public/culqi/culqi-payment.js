/**
 * BuchiSapa Culqi Payment Module (Frontend)
 * Carpeta: /public/culqi/
 * Implementación oficial de Custom Culqi Checkout multipago versión 1.0
 * Soporte para Tarjetas de crédito/débito, Yape, Billeteras, PagoEfectivo y Cuotéalo
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
   * Carga dinámica del SDK oficial de Custom Culqi Checkout Multipago v1.0
   */
  function ensureCulqiCustomScript() {
    return new Promise((resolve) => {
      if (typeof window.CulqiCheckout === 'function') {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src*="js.culqi.com/checkout-js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(typeof window.CulqiCheckout === 'function'));
        setTimeout(() => resolve(typeof window.CulqiCheckout === 'function'), 800);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.culqi.com/checkout-js';
      script.async = true;
      script.onload = () => {
        resolve(typeof window.CulqiCheckout === 'function');
      };
      script.onerror = () => {
        console.warn('⚠️ No se pudo cargar js.culqi.com/checkout-js, se usará fallback clásico si está disponible');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Valida estrictamente los datos de la tarjeta antes de enviar a tokenizar
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
      throw new Error('Ingresa un correo electrónico válido para tu comprobante.');
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
   * Limpieza de datos locales tras cobro exitoso
   */
  function clearAllOrderData() {
    try {
      localStorage.removeItem('buchisapa_cart');
      localStorage.removeItem('buchisapa_pending_order');
      localStorage.removeItem('buchisapa_checkout_draft');
      localStorage.removeItem('buchisapa_cart_coupon');

      sessionStorage.removeItem('buchisapa_cart');
      sessionStorage.removeItem('buchisapa_pending_order');
      sessionStorage.removeItem('current_checkout_order');

      if (window.BuchisapaCart) {
        if (typeof window.BuchisapaCart.clear === 'function') {
          window.BuchisapaCart.clear();
        } else {
          window.BuchisapaCart.items = [];
          if (typeof window.BuchisapaCart.save === 'function') window.BuchisapaCart.save();
        }
      }

      const cardNum = document.getElementById('card-number-input');
      const cardExp = document.getElementById('card-expiry-input');
      const cardCvv = document.getElementById('card-cvv-input');
      const notesInput = document.getElementById('cust-notes');
      
      if (cardNum) cardNum.value = '';
      if (cardExp) cardExp.value = '';
      if (cardCvv) cardCvv.value = '';
      if (notesInput) notesInput.value = '';

      console.log('🧹 [CULQI SUCCESS] Datos de compra y carrito limpiados exitosamente.');
    } catch (cleanErr) {
      console.warn('Advertencia al limpiar datos del pedido:', cleanErr);
    }
  }

  /**
   * Tokeniza una tarjeta directamente contra el endpoint seguro del backend
   */
  async function tokenizeCard(cardData) {
    const validCard = validateCardData(cardData);

    const res = await fetch('/api/payments/culqi/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCard)
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.id) {
      throw new Error(data.error || 'No se pudo validar la tarjeta con Culqi.');
    }

    return data.id;
  }

  /**
   * Valida el token de Culqi contra el backend y genera el cargo
   */
  async function chargeToken({ tokenId, email, amount, orderPayload }) {
    if (!tokenId) throw new Error('Token de pago ausente.');
    if (!amount || Number(amount) <= 0) throw new Error('Monto inválido.');
    if (!orderPayload) throw new Error('Estructura del pedido ausente.');

    const res = await fetch('/api/payments/culqi/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokenId,
        email: email || orderPayload.customerEmail || 'cliente@buchisapa.pe',
        amount: Number(amount),
        orderPayload: orderPayload
      })
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      const errorMsg = result.error || 'El pago fue declinado por el banco emisor.';
      throw new Error(errorMsg);
    }

    clearAllOrderData();
    return result;
  }

  /**
   * Flujo directo de pago con tarjeta (formulario inline)
   */
  async function processCardPayment({ cardData, amount, orderPayload, onSuccess, onError }) {
    try {
      const tokenId = await tokenizeCard(cardData);
      const chargeResult = await chargeToken({
        tokenId: tokenId,
        email: cardData.email,
        amount: amount,
        orderPayload: orderPayload
      });

      if (onSuccess) onSuccess(chargeResult);
      return chargeResult;
    } catch (err) {
      console.error('❌ [CULQI PAYMENT ERROR]:', err);
      if (onError) {
        onError(err);
      } else {
        alert(`⚠️ Error en el pago: ${err.message}`);
      }
      throw err;
    }
  }

  /**
   * PASO 2 a 5: INTEGRACIÓN OFICIAL DEL CUSTOM CULQI CHECKOUT MULTIPAGO v1.0
   * Soporta Menú Sidebar, SliderTop o Select, Tarjetas, Yape, Billeteras, Banca Móvil, Agente y Cuotéalo
   */
  async function openCustomCulqiCheckout({
    amount,
    orderNumber,
    customerEmail,
    customerName,
    orderPayload,
    orderId,
    menuType = 'sidebar',
    container = null,
    onSuccess,
    onError
  }) {
    const publicKey = await loadCulqiConfig();
    const hasCustomSdk = await ensureCulqiCustomScript();

    const amountInCents = Math.round(Number(amount) * 100);
    const parsedName = (customerName || orderPayload?.customerName || 'Cliente').trim().split(' ');
    const firstName = parsedName[0] || 'Cliente';
    const lastName = parsedName.slice(1).join(' ') || 'BuchiSapa';
    const email = customerEmail || orderPayload?.customerEmail || 'cliente@buchisapa.pe';

    currentPendingOrder = {
      amount: amount,
      orderNumber: orderNumber,
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      orderPayload: orderPayload,
      onSuccess: onSuccess,
      onError: onError
    };

    // Si el SDK Custom Checkout v1.0 está disponible (window.CulqiCheckout)
    if (hasCustomSdk && typeof window.CulqiCheckout === 'function') {
      try {
        const settings = {
          title: "BuchiSapa - Pollería & Parrillas",
          currency: "PEN",
          amount: amountInCents,
          order: orderId || undefined
        };

        const client = {
          email: email,
          firstName: firstName,
          lastName: lastName
        };

        const paymentMethods = {
          tarjeta: true,
          yape: true,
          billetera: true,
          bancaMovil: true,
          agente: true,
          cuotealo: true
        };

        const options = {
          lang: "es",
          installments: true,
          modal: !container,
          container: container || undefined,
          paymentMethods: paymentMethods,
          paymentMethodsSort: Object.keys(paymentMethods)
        };

        const appearance = {
          theme: "default",
          hiddenCulqiLogo: false,
          hiddenBannerContent: false,
          hiddenBanner: false,
          hiddenToolBarAmount: false,
          hiddenEmail: false,
          menuType: menuType, // 'sidebar' | 'sliderTop' | 'select'
          buttonCardPayText: `Pagar S/ ${Number(amount).toFixed(2)}`,
          logo: `${window.location.origin}/imagenes/logo/logo-buchisapa.webp`,
          defaultStyle: {
            bannerColor: "#dc2626",
            buttonBackground: "#dc2626",
            menuColor: "#b91c1c",
            linksColor: "#dc2626",
            buttonTextColor: "#ffffff",
            priceColor: "#dc2626"
          },
          variables: {
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeightNormal: "600",
            borderRadius: "12px",
            colorBackground: "#0f172a",
            colorPrimary: "#dc2626",
            colorPrimaryText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#cbd5e1",
            colorTextPlaceholder: "#94a3b8",
            colorIconTab: "#ffffff",
            colorLogo: "dark"
          },
          rules: {
            ".Culqi-Main-Container": {
              background: "#0f172a",
              fontFamily: "var(--fontFamily)"
            },
            ".Culqi-ToolBanner": {
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              fontFamily: "var(--fontFamily)",
              color: "#ffffff"
            },
            ".Culqi-Toolbar-Price": {
              color: "#f87171",
              fontFamily: "var(--fontFamily)"
            },
            ".Culqi-Toolbar-Price .Culqi-Icon": {
              color: "#dc2626"
            },
            ".Culqi-Main-Method": {
              background: "#1e293b",
              color: "#ffffff"
            },
            ".Culqi-Label": {
              color: "#e2e8f0"
            },
            ".Culqi-Input": {
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#ffffff"
            },
            ".Culqi-Button": {
              background: "#dc2626",
              borderRadius: "10px",
              fontWeight: "700"
            },
            ".Culqi-Menu": {
              color: "#cbd5e1"
            },
            ".Culqi-Menu .Culqi-Icon": {
              color: "#dc2626"
            }
          }
        };

        const config = {
          settings,
          client,
          options,
          appearance
        };

        const Culqi = new window.CulqiCheckout(publicKey, config);

        const handleCulqiAction = async () => {
          if (Culqi.token) {
            const token = Culqi.token.id;
            const tokenEmail = Culqi.token.email || currentPendingOrder?.customerEmail || email;
            if (Culqi.close) Culqi.close();

            try {
              const result = await chargeToken({
                tokenId: token,
                email: tokenEmail,
                amount: currentPendingOrder.amount,
                orderPayload: currentPendingOrder.orderPayload
              });

              if (currentPendingOrder && currentPendingOrder.onSuccess) {
                currentPendingOrder.onSuccess(result);
              }
            } catch (err) {
              console.error('❌ Error validando token de Custom Checkout:', err);
              if (currentPendingOrder && currentPendingOrder.onError) {
                currentPendingOrder.onError(err);
              } else {
                alert(`⚠️ Error al procesar pago: ${err.message}`);
              }
            }
          } else if (Culqi.order) {
            if (Culqi.close) Culqi.close();
            console.log('✅ Objeto Order de Culqi generado:', Culqi.order);
            if (currentPendingOrder && currentPendingOrder.onSuccess) {
              currentPendingOrder.onSuccess({ success: true, order: Culqi.order, isMultipagoOrder: true });
            }
          } else if (Culqi.error) {
            const userMsg = Culqi.error.user_message || Culqi.error.merchant_message || 'El pago no fue autorizado.';
            if (currentPendingOrder && currentPendingOrder.onError) {
              currentPendingOrder.onError(new Error(userMsg));
            } else {
              alert(`⚠️ ${userMsg}`);
            }
          }
        };

        Culqi.culqi = handleCulqiAction;
        Culqi.open();
        return Culqi;
      } catch (customErr) {
        console.error('Error al inicializar Custom Culqi Checkout:', customErr);
        const err = new Error('No se pudo inicializar el Custom Checkout de Culqi. Por favor intenta nuevamente.');
        if (onError) onError(err);
        else alert(err.message);
        return;
      }
    } else {
      const err = new Error('La librería Custom Culqi Checkout multipago no se encuentra disponible. Por favor recarga la página.');
      if (onError) onError(err);
      else alert(err.message);
    }
  }

  // Exponer API global
  window.BuchisapaCulqi = {
    loadConfig: loadCulqiConfig,
    validateCardData: validateCardData,
    tokenizeCard: tokenizeCard,
    chargeToken: chargeToken,
    clearAllOrderData: clearAllOrderData,
    processCardPayment: processCardPayment,
    openCustomCheckout: openCustomCulqiCheckout,
    openCheckout: openCustomCulqiCheckout
  };

  console.log('💳 [BuchisapaCulqi] Módulo Custom Culqi Checkout multipago v1.0 listo.');
})();
