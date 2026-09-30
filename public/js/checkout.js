/**
 * RESTAURANTE BUCHISAPA - Lógica de Checkout
 * Archivo: /js/checkout.js
 */

async function openCheckoutModal() {
  if (window.BuchisapaCart) {
    const isValid = await window.BuchisapaCart.checkRealtimeStock(false);
    if (!isValid) {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.playChime();
        window.BuchisapaPush.showToast({
          title: '🚫 Pedido Bloqueado por Stock',
          message: 'Hay productos agotados en tu carrito. Revisa los items marcados en rojo antes de continuar.',
          stage: 'cancelado',
          icon: '⚠️'
        });
      }
      window.BuchisapaCart.openDrawer();
      return;
    }
  }

  const isPickup = (localStorage.getItem('buchisapa_order_type') === 'pickup');
  const custAddr = document.getElementById('cust-address');
  const custPhone = document.getElementById('cust-phone');
  const savedPhone = localStorage.getItem('buchisapa_delivery_phone');

  if (isPickup && custAddr) {
    custAddr.value = 'Av. La Estrella con Calle 28 de Julio (Esquina de la posta, a 1 cuadra del Real Plaza Santa Clara), Ate, Lima 🇵🇪';
  } else if (!isPickup && custAddr && !custAddr.value) {
    custAddr.value = localStorage.getItem('buchisapa_delivery_address') || '';
  }

  if (custPhone && savedPhone && !custPhone.value) {
    custPhone.value = savedPhone;
  }

  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('open');
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
}

// Exponer en el objeto global window
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
