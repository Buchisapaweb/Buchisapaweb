/**
 * RESTAURANTE BUCHISAPA - CONTROLADOR DE CHECKOUT Y PAGO (checkout.js)
 * Procesa la información del formulario de checkout, calcula totales,
 * envía la orden al backend Express /api/orders y vacía el carrito.
 */

(function () {
  'use strict';

  function initCheckoutPage() {
    renderCheckoutSummary();
  }

  window.selectPaymentMethod = function (method, element) {
    const cards = document.querySelectorAll('.payment-method-card');
    cards.forEach(c => c.classList.remove('active'));

    if (element) {
      element.classList.add('active');
    }

    const input = document.getElementById('chk-payment-method');
    if (input) {
      input.value = method;
    }
  };

  function renderCheckoutSummary() {
    const listEl = document.getElementById('checkout-summary-items-list');
    const subtotalEl = document.getElementById('chk-subtotal-val');
    const totalEl = document.getElementById('chk-total-val');

    if (!listEl) return;

    let items = [];
    try {
      items = JSON.parse(localStorage.getItem('buchisapa_cart') || '[]');
    } catch (e) {
      items = [];
    }

    if (items.length === 0) {
      listEl.innerHTML = '<div style="font-size: 13px; color: #64748b; text-align: center; padding: 12px;">Tu carrito está vacío</div>';
      if (subtotalEl) subtotalEl.textContent = 'S/ 0.00';
      if (totalEl) totalEl.textContent = 'S/ 0.00';
      return;
    }

    let subtotal = 0;
    listEl.innerHTML = '';

    items.forEach(item => {
      const price = Number(item.price || item.unitPrice || 0);
      const qty = Number(item.quantity || item.qty || 1);
      const itemTotal = price * qty;
      subtotal += itemTotal;

      const row = document.createElement('div');
      row.style.cssText = 'display: flex; justify-content: space-between; font-size: 13px; color: #334155;';
      row.innerHTML = `
        <span><strong>${qty}x</strong> ${item.name}</span>
        <span style="font-weight: 700;">S/ ${itemTotal.toFixed(2)}</span>
      `;
      listEl.appendChild(row);
    });

    const deliveryCost = 5.00;
    const grandTotal = subtotal + deliveryCost;

    if (subtotalEl) subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `S/ ${grandTotal.toFixed(2)}`;
  }

  window.handleCheckoutSubmit = async function (event) {
    event.preventDefault();

    const name = document.getElementById('chk-name')?.value?.trim();
    const phone = document.getElementById('chk-phone')?.value?.trim();
    const email = document.getElementById('chk-email')?.value?.trim();
    const address = document.getElementById('chk-address')?.value?.trim();
    const reference = document.getElementById('chk-reference')?.value?.trim() || '';
    const paymentMethod = document.getElementById('chk-payment-method')?.value || 'yape';

    let items = [];
    try {
      items = JSON.parse(localStorage.getItem('buchisapa_cart') || '[]');
    } catch (e) {
      items = [];
    }

    if (items.length === 0) {
      alert('Tu carrito está vacío. Agrega platos antes de continuar.');
      return;
    }

    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      deliveryAddress: address,
      deliveryReference: reference,
      paymentMethod,
      orderType: 'delivery',
      items,
      notes: reference
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const json = await res.json();
        localStorage.removeItem('buchisapa_cart');
        alert(`¡Pedido #${json.data?.orderNumber || json.data?.id || ''} enviado con éxito! Gracias por elegir BuchiSapa.`);
        window.location.href = '/';
      } else {
        alert('Hubo un inconveniente al registrar la orden. Por favor intenta de nuevo.');
      }
    } catch (err) {
      alert('Error de conexión. Verifica tu señal e intenta nuevamente.');
    }
  };

  document.addEventListener('DOMContentLoaded', initCheckoutPage);
})();
