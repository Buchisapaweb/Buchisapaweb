/**
 * BuchiSapa Culqi Checkout Integration Module
 * Soporte oficial para pagos online (Tarjetas de Débito, Crédito, Yape, Cuotealo)
 */
(function() {
  'use strict';

  let culqiConfig = {
    publicKey: null,
    isLoaded: false
  };

  let currentPendingOrder = null;

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
      console.warn('Error al cargar config de Culqi:', e);
    }
    culqiConfig.publicKey = 'pk_test_04c5e31a0e10b14b';
    return culqiConfig.publicKey;
  }

  function ensureCulqiScript() {
    return Promise.all([
      new Promise((resolve) => {
        if (window.Culqi) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.culqi.com/js/v4';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      }),
      new Promise((resolve) => {
        if (window.Culqi3DS) return resolve(true);
        const script3ds = document.createElement('script');
        script3ds.src = 'https://3ds.culqi.com';
        script3ds.async = true;
        script3ds.onload = () => resolve(true);
        script3ds.onerror = () => resolve(false);
        document.head.appendChild(script3ds);
      })
    ]);
  }

  async function openCulqiCheckout({ amount, orderNumber, customerEmail, customerName, orderPayload, onSuccess, onError }) {
    await ensureCulqiScript();
    const publicKey = await loadCulqiConfig();

    if (!window.Culqi) {
      alert('No se pudo iniciar la pasarela Culqi. Por favor intenta con Yape o Efectivo.');
      if (onError) onError(new Error('Culqi no disponible'));
      return;
    }

    const amountInCents = Math.round(Number(amount) * 100);

    window.Culqi.publicKey = publicKey;
    window.Culqi.settings({
      title: 'BuchiSapa Burger & Broaster',
      currency: 'PEN',
      amount: amountInCents
    });

    window.Culqi.options({
      lang: 'es',
      modal: true,
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: true,
        billetera: true,
        bancaMovil: true,
        agente: true,
        cuotealo: false
      },
      style: {
        bgcolor: '#0f172a',
        maincolor: '#dc2626',
        disabledcolor: '#94a3b8',
        buttontext: '#ffffff',
        maintext: '#ffffff',
        desctext: '#cbd5e1'
      }
    });

    // Soporte oficial Culqi 3DS para autenticación bancaria segura
    if (window.Culqi3DS) {
      try {
        window.Culqi3DS.publicKey = publicKey;
        window.Culqi3DS.settings = {
          charge: {
            totalAmount: amountInCents,
            returnUrl: window.location.href
          }
        };
        window.Culqi3DS.device = window.Culqi3DS.generateDevice ? window.Culqi3DS.generateDevice() : undefined;
      } catch (e3ds) {
        console.warn('Culqi3DS init error:', e3ds);
      }
    }

    currentPendingOrder = {
      amount: amount,
      orderNumber: orderNumber,
      customerEmail: customerEmail,
      orderPayload: orderPayload,
      onSuccess: onSuccess,
      onError: onError
    };

    // Handler global requerido por Culqi
    window.culqi = async function() {
      if (window.Culqi.token) {
        const token = window.Culqi.token.id;
        const email = window.Culqi.token.email || currentPendingOrder?.customerEmail || 'cliente@buchisapa.pe';
        
        // Cerrar modal de Culqi
        if (window.Culqi.close) window.Culqi.close();

        // Llamar a nuestro backend para procesar el cobro seguro
        try {
          const res = await fetch('/api/payments/culqi/charge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: token,
              email: email,
              amount: currentPendingOrder.amount,
              orderPayload: currentPendingOrder.orderPayload
            })
          });

          const result = await res.json();
          if (res.ok && result.success) {
            if (currentPendingOrder && currentPendingOrder.onSuccess) {
              currentPendingOrder.onSuccess(result);
            }
          } else {
            const msg = result.error || 'El pago fue declinado. Verifica tu tarjeta o fondos.';
            alert(`⚠️ Error de pago: ${msg}`);
            if (currentPendingOrder && currentPendingOrder.onError) {
              currentPendingOrder.onError(new Error(msg));
            }
          }
        } catch (err) {
          console.error('Error al comunicarse con el servidor de pago:', err);
          alert('Hubo un inconveniente al registrar el pago. Por favor comunícate por WhatsApp.');
          if (currentPendingOrder && currentPendingOrder.onError) {
            currentPendingOrder.onError(err);
          }
        }
      } else if (window.Culqi.order) {
        // En caso de orden QR / Yape
        const orderId = window.Culqi.order.id;
        if (window.Culqi.close) window.Culqi.close();
        if (currentPendingOrder && currentPendingOrder.onSuccess) {
          currentPendingOrder.onSuccess({ success: true, chargeId: orderId, order: currentPendingOrder.orderPayload });
        }
      } else if (window.Culqi.error) {
        console.error('Error reportado por Culqi:', window.Culqi.error);
        const userMsg = window.Culqi.error.user_message || 'El pago no se pudo completar.';
        alert(`⚠️ ${userMsg}`);
        if (currentPendingOrder && currentPendingOrder.onError) {
          currentPendingOrder.onError(new Error(userMsg));
        }
      }
    };

    window.Culqi.open();
  }

  window.BuchisapaCulqi = {
    loadConfig: loadCulqiConfig,
    openCheckout: openCulqiCheckout
  };
})();
