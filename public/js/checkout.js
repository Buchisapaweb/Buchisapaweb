/**
 * RESTAURANTE BUCHISAPA - Lógica de Checkout como Vista / Pantalla de Paso 2
 * Archivo: /js/checkout.js
 */

const STORE_FULL_ADDRESS = 'Av. La Estrella con Calle 28 de Julio (Esquina de la posta, a 1 cuadra del Real Plaza Santa Clara), Ate, Lima 🇵🇪';
const STORE_HOURS = 'Lunes a Domingo, de 6:00 PM a 5:00 AM';

function getCleanStoredAddress() {
  const raw = localStorage.getItem('buchisapa_delivery_address') || '';
  if (!raw) return '';
  try {
    if (raw.startsWith('{') && raw.endsWith('}')) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const addr = parsed.address || '';
        const num = parsed.streetNumber ? ` ${parsed.streetNumber}` : '';
        const int = parsed.interior ? ` Dpto/Int ${parsed.interior}` : '';
        const ref = parsed.reference ? ` (Ref: ${parsed.reference})` : '';
        return `${addr}${num}${int}${ref}`.trim();
      }
    }
  } catch (e) {}
  return raw;
}

async function openCheckoutModal() {
  const cart = window.BuchisapaCart;
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    if (window.BuchisapaPush) {
      window.BuchisapaPush.showToast({
        title: '🛒 Carrito Vacío',
        message: 'Agrega platos deliciosos de nuestra carta antes de continuar.',
        icon: 'ℹ️'
      });
    } else {
      alert('Tu carrito está vacío. Agrega platos antes de continuar.');
    }
    return;
  }

  // Comprobación de stock en tiempo real
  const isValid = await cart.checkRealtimeStock(false);
  if (!isValid) {
    if (window.BuchisapaPush) {
      window.BuchisapaPush.showToast({
        title: '🚫 Pedido Bloqueado por Stock',
        message: 'Hay productos agotados en tu carrito. Revisa los items marcados en rojo antes de continuar.',
        stage: 'cancelado',
        icon: '⚠️'
      });
    }
    cart.openDrawer();
    return;
  }

  // Transición suave: cerrar el carrito visualmente para dar paso a la pantalla de Checkout
  const cartDrawer = document.getElementById('cart-drawer-modal');
  if (cartDrawer) {
    cartDrawer.classList.remove('open', 'active');
    setTimeout(() => {
      if (!cartDrawer.classList.contains('open')) {
        cartDrawer.style.display = 'none';
      }
    }, 250);
  }

  const orderType = localStorage.getItem('buchisapa_order_type') || cart.orderType || 'pickup';
  const isPickup = (orderType === 'pickup');

  // Elementos del checkout
  const modalityBanner = document.getElementById('checkout-modality-banner');
  const modalityIcon = document.getElementById('checkout-modality-icon');
  const modalityName = document.getElementById('checkout-modality-name');
  const modalityFee = document.getElementById('checkout-modality-fee');
  const storeInfoBox = document.getElementById('checkout-store-info-box');
  const deliveryAddressGroup = document.getElementById('checkout-delivery-address-group');
  const custAddr = document.getElementById('cust-address');
  const custPhone = document.getElementById('cust-phone');
  const custName = document.getElementById('cust-name');
  const modalItemCount = document.getElementById('checkout-modal-item-count');
  const modalTotal = document.getElementById('checkout-modal-total');

  // Configurar según modalidad
  if (isPickup) {
    if (modalityBanner) {
      modalityBanner.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
      modalityBanner.style.borderColor = '#86efac';
    }
    if (modalityIcon) modalityIcon.textContent = '🏪';
    if (modalityName) {
      modalityName.textContent = 'Recojo en Tienda (Santa Clara)';
      modalityName.style.color = '#14532d';
    }
    if (modalityFee) {
      modalityFee.textContent = 'Gratis (S/ 0.00)';
      modalityFee.style.background = '#16a34a';
    }
    if (storeInfoBox) storeInfoBox.style.display = 'block';
    if (deliveryAddressGroup) deliveryAddressGroup.style.display = 'none';
    if (custAddr) {
      custAddr.removeAttribute('required');
      custAddr.value = STORE_FULL_ADDRESS;
    }
  } else {
    if (modalityBanner) {
      modalityBanner.style.background = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
      modalityBanner.style.borderColor = '#93c5fd';
    }
    if (modalityIcon) modalityIcon.textContent = '🛵';
    if (modalityName) {
      modalityName.textContent = 'Delivery a Domicilio';
      modalityName.style.color = '#1e40af';
    }
    const feeVal = cart.deliveryFee || 4.00;
    if (modalityFee) {
      modalityFee.textContent = `Envío S/ ${feeVal.toFixed(2)}`;
      modalityFee.style.background = '#2563eb';
    }
    if (storeInfoBox) storeInfoBox.style.display = 'none';
    if (deliveryAddressGroup) deliveryAddressGroup.style.display = 'block';
    if (custAddr) {
      custAddr.setAttribute('required', 'required');
      custAddr.value = getCleanStoredAddress();
    }
  }

  // Prellenar teléfono y nombre
  const savedPhone = localStorage.getItem('buchisapa_delivery_phone');
  if (custPhone && savedPhone && !custPhone.value) {
    custPhone.value = savedPhone;
  }
  const savedCustomer = localStorage.getItem('buchisapa_customer');
  if (custName && !custName.value && savedCustomer) {
    try {
      const custObj = JSON.parse(savedCustomer);
      if (custObj && custObj.name) custName.value = custObj.name;
    } catch (e) {}
  }

  // Totales
  const count = cart.getItemCount ? cart.getItemCount() : cart.items.length;
  const subtotal = cart.getSubtotal ? cart.getSubtotal() : 0;
  const deliveryCost = isPickup ? 0 : (cart.deliveryFee || 4.00);
  const total = subtotal + deliveryCost;

  if (modalItemCount) {
    modalItemCount.textContent = count === 1 ? '1 plato' : `${count} platos`;
  }
  if (modalTotal) {
    modalTotal.textContent = `S/ ${total.toFixed(2)}`;
  }

  // Abrir la pantalla de Checkout como vista completa
  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) {
    document.body.classList.add('cart-drawer-open');
    document.documentElement.classList.add('cart-drawer-open');
    checkoutModal.style.display = 'flex';
    void checkoutModal.offsetWidth;
    checkoutModal.classList.add('open', 'active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) {
    checkoutModal.classList.remove('open', 'active');
    setTimeout(() => {
      if (!checkoutModal.classList.contains('open')) {
        checkoutModal.style.display = 'none';
        document.body.classList.remove('cart-drawer-open');
        document.documentElement.classList.remove('cart-drawer-open');
        document.body.style.overflow = '';
      }
    }, 280);
  }
}

function closeCheckoutModalAndOpenCart() {
  closeCheckoutModal();
  setTimeout(() => {
    if (window.BuchisapaCart && typeof window.BuchisapaCart.openDrawer === 'function') {
      window.BuchisapaCart.openDrawer();
    }
  }, 100);
}

// Exponer globalmente
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.closeCheckoutModalAndOpenCart = closeCheckoutModalAndOpenCart;
window.getCleanStoredAddress = getCleanStoredAddress;
