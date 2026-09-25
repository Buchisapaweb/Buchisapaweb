/**
 * BUCHISAPA CLIENT NOTIFICATIONS MODULE
 * Sistema dinámico de Notificaciones Toast en pantalla y sintetizador de sonido Web Audio
 */

(function () {
  const BuchisapaPush = {
    toastContainer: null,
    audioCtx: null,

    init: function () {
      this.ensureToastContainer();
      this.initOrderTrackerListener();
    },

    getAudioContext: function () {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    },

    playChime: function (type = 'success') {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (type === 'success' || type === 'cart') {
          // Melodía agradable de 2 tonos al agregar plato
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, now); // D5
          gain1.gain.setValueAtTime(0.12, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.16);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, now + 0.08); // A5
          gain2.gain.setValueAtTime(0.14, now + 0.08);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.28);
        } else if (type === 'order') {
          // Chime festivo al confirmar orden
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.07);
            gain.gain.setValueAtTime(0.15, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.25);
          });
        }
      } catch (e) {
        // Silencioso si el navegador bloquea audio
      }
    },

    ensureToastContainer: function () {
      if (!this.toastContainer || !document.body.contains(this.toastContainer)) {
        let container = document.getElementById('buchisapa-dynamic-toasts');
        if (!container) {
          container = document.createElement('div');
          container.id = 'buchisapa-dynamic-toasts';
          container.className = 'buchisapa-toasts-container';
          document.body.appendChild(container);
        }
        this.toastContainer = container;
      }
      return this.toastContainer;
    },

    showToast: function (options = {}) {
      this.ensureToastContainer();
      const title = options.title || 'BuchiSapa';
      const message = options.message || '';
      const icon = options.icon || '🍗';
      const actionText = (typeof options.actionText === 'string' && options.actionText.trim().length > 0) ? options.actionText.trim() : null;
      const duration = options.duration || 2800;
      const onAction = options.onAction || (() => {
        if (window.BuchisapaCart) window.BuchisapaCart.openDrawer();
      });

      const toast = document.createElement('div');
      toast.className = 'buchisapa-dynamic-toast';
      toast.innerHTML = `
        <div class="toast-icon-wrap">${icon}</div>
        <div class="toast-body-wrap">
          <div class="toast-title">${title}</div>
          <div class="toast-msg">${message}</div>
        </div>
        ${actionText ? `<button type="button" class="toast-action-btn">${actionText}</button>` : ''}
        <button type="button" class="toast-close-btn" aria-label="Cerrar">✕</button>
      `;

      if (actionText) {
        const actBtn = toast.querySelector('.toast-action-btn');
        if (actBtn) {
          actBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onAction();
            this.dismissToast(toast);
          });
        }
      }

      toast.querySelector('.toast-close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismissToast(toast);
      });

      this.toastContainer.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.add('toast-show');
      });

      let dismissTimer = setTimeout(() => {
        this.dismissToast(toast);
      }, duration);

      toast.addEventListener('click', (e) => {
        if (!e.target.classList.contains('toast-action-btn')) {
          this.dismissToast(toast);
        }
      });
    },

    dismissToast: function (toast) {
      if (!toast) return;
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    },

    initOrderTrackerListener: function () {
      // Si el cliente tiene un pedido activo, escuchar cambios por SSE si está disponible
      try {
        const lastOrder = localStorage.getItem('buchisapa_last_order');
        if (lastOrder) {
          const parsed = JSON.parse(lastOrder);
          if (parsed && parsed.id) {
            this.connectSSE(parsed.id);
          }
        }
      } catch (e) {}
    },

    connectSSE: function (orderId) {
      if (typeof EventSource === 'undefined') return;
      try {
        const es = new EventSource('/api/events');
        es.addEventListener('order_update', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && (data.orderId === orderId || data.id === orderId)) {
              this.playChime('order');
              this.showToast({
                title: '¡Actualización de tu Pedido!',
                message: `Tu pedido #${orderId} cambió a estado: "${data.status || 'En preparación'}"`,
                icon: '🛵',
                actionText: 'Ver Rastreo',
                onAction: () => {
                  window.location.href = `/order-status.html?id=${orderId}`;
                }
              });
            }
          } catch (err) {}
        });
      } catch (e) {}
    },

    dismissBanner: function () {
      const banner = document.getElementById('push-permission-banner');
      if (banner) banner.style.display = 'none';
    },

    setupPermissionPrompts: function () {
      this.dismissBanner();
    }
  };

  // Exponer a nivel global
  window.BuchisapaPush = BuchisapaPush;
  window.requestPushPermission = () => Promise.resolve('granted');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BuchisapaPush.init());
  } else {
    BuchisapaPush.init();
  }
})();
