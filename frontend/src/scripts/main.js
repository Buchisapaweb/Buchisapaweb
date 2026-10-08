// ========================================================
// BUCHISAPA - POLLERÍA & SABOR AMAZÓNICO
// MAIN APP JAVASCRIPT
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  let menuData = [];
  let cart = JSON.parse(localStorage.getItem('buchisapa_cart') || '[]');
  const SHIPPING_COST = 5.00;

  // DOM Elements
  const menuGrid = document.getElementById('menu-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const btnCartToggle = document.getElementById('btn-cart-toggle');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const cartItemsWrap = document.getElementById('cart-items-wrap');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartShippingEl = document.getElementById('cart-shipping');
  const cartTotalEl = document.getElementById('cart-total');
  const btnCheckoutStart = document.getElementById('btn-checkout-start');

  const checkoutModal = document.getElementById('checkout-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const modalOrderTotal = document.getElementById('modal-order-total');
  const groupDireccion = document.getElementById('group-direccion');
  const orderTipoRadios = document.querySelectorAll('input[name="order-tipo"]');

  const successModal = document.getElementById('success-modal');
  const btnCloseSuccess = document.getElementById('btn-close-success');
  const orderTicket = document.getElementById('order-ticket');
  const btnWaConfirm = document.getElementById('btn-wa-confirm');

  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const btnHamburger = document.getElementById('btn-hamburger');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');

  const headerAuthBtn = document.getElementById('header-auth-btn');
  const drawerLoginBtn = document.getElementById('drawer-login-btn');
  const userModal = document.getElementById('user-modal');
  const btnCloseUserModal = document.getElementById('btn-close-user-modal');
  const userModalNombre = document.getElementById('user-modal-nombre');
  const userModalEmail = document.getElementById('user-modal-email');
  const btnAdminPanel = document.getElementById('btn-admin-panel');
  const btnLogout = document.getElementById('btn-logout');

  // Set current year
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

  // 1. Fetch Menu
  async function loadMenu() {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data && data.menu) {
        menuData = data.menu;
        renderMenu('todos');
      }
    } catch (err) {
      console.error('Error al cargar la carta:', err);
    }
  }

  // 2. Render Menu Cards
  function renderMenu(categoria) {
    if (!menuGrid) return;
    const filtered = categoria === 'todos' 
      ? menuData 
      : menuData.filter(item => item.categoria === categoria);

    if (filtered.length === 0) {
      menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 40px 0;">No se encontraron platos en esta categoría.</p>';
      return;
    }

    menuGrid.innerHTML = filtered.map(dish => `
      <div class="dish-card">
        <div class="dish-card-header">
          <span class="dish-tag">${dish.categoria === 'pollos' ? 'Pollería' : dish.categoria === 'amazonicos' ? 'Amazonía' : dish.categoria === 'piqueos' ? 'Piqueo' : 'Bebida'}</span>
          <h3 class="dish-title">${dish.nombre}</h3>
          <p class="dish-desc">${dish.descripcion}</p>
          <span class="dish-portion">🍽 ${dish.porciones}</span>
        </div>
        <div class="dish-card-footer">
          <div class="dish-price-wrap">
            <span class="price-cur">Precio:</span>
            <span class="price-amount">S/ ${dish.precio.toFixed(2)}</span>
          </div>
          <button class="btn-add-cart" data-id="${dish.id}">
            <span>+</span> Agregar
          </button>
        </div>
      </div>
    `).join('');

    // Attach click events
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        addToCart(id);
      });
    });
  }

  // Category Filter Events
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      renderMenu(cat);
    });
  });

  // 3. Cart Management
  function saveCart() {
    localStorage.setItem('buchisapa_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(dishId) {
    const dish = menuData.find(d => d.id === dishId);
    if (!dish) return;

    const existing = cart.find(item => item.id === dishId);
    if (existing) {
      existing.cantidad += 1;
    } else {
      cart.push({
        id: dish.id,
        nombre: dish.nombre,
        precio: dish.precio,
        cantidad: 1
      });
    }

    saveCart();
    openCart();
  }

  function updateQuantity(dishId, delta) {
    const item = cart.find(i => i.id === dishId);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
      cart = cart.filter(i => i.id !== dishId);
    }
    saveCart();
  }

  function removeFromCart(dishId) {
    cart = cart.filter(i => i.id !== dishId);
    saveCart();
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    if (cartBadge) cartBadge.textContent = totalItems;

    if (!cartItemsWrap) return;

    if (cart.length === 0) {
      cartItemsWrap.innerHTML = `
        <div class="cart-empty">
          <span class="empty-icon">🍗</span>
          <p>Tu carrito está vacío</p>
          <small>Elige tus platos favoritos de la carta para empezar.</small>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = 'S/ 0.00';
      if (cartShippingEl) cartShippingEl.textContent = 'S/ 0.00';
      if (cartTotalEl) cartTotalEl.textContent = 'S/ 0.00';
      if (btnCheckoutStart) btnCheckoutStart.disabled = true;
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const total = subtotal + SHIPPING_COST;

    cartItemsWrap.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.nombre}</h4>
          <span class="cart-item-price">S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="window.cartUpdateQty('${item.id}', -1)">-</button>
          <span class="qty-count">${item.cantidad}</span>
          <button class="qty-btn" onclick="window.cartUpdateQty('${item.id}', 1)">+</button>
          <button class="btn-remove-item" onclick="window.cartRemove('${item.id}')" title="Eliminar">🗑</button>
        </div>
      </div>
    `).join('');

    if (cartSubtotalEl) cartSubtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
    if (cartShippingEl) cartShippingEl.textContent = `S/ ${SHIPPING_COST.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `S/ ${total.toFixed(2)}`;
    if (btnCheckoutStart) btnCheckoutStart.disabled = false;
  }

  window.cartUpdateQty = updateQuantity;
  window.cartRemove = removeFromCart;

  // Open/Close Cart
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
  }

  if (btnCartToggle) btnCartToggle.addEventListener('click', openCart);
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // 4. Checkout Modal
  if (btnCheckoutStart) {
    btnCheckoutStart.addEventListener('click', () => {
      closeCart();
      const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      const isDelivery = document.querySelector('input[name="order-tipo"]:checked')?.value === 'delivery';
      const shipping = isDelivery ? SHIPPING_COST : 0;
      const total = subtotal + shipping;

      if (modalOrderTotal) modalOrderTotal.textContent = `S/ ${total.toFixed(2)}`;

      // Pre-fill user data if logged in
      const userStr = localStorage.getItem('buchisapa_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.nombre) document.getElementById('order-cliente').value = user.nombre;
          if (user.telefono) document.getElementById('order-telefono').value = user.telefono;
          if (user.direccion) document.getElementById('order-direccion').value = user.direccion;
        } catch (e) {}
      }

      if (checkoutModal) checkoutModal.classList.add('open');
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('open');
    });
  }

  orderTipoRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'recojo') {
        if (groupDireccion) groupDireccion.style.display = 'none';
      } else {
        if (groupDireccion) groupDireccion.style.display = 'block';
      }
      // Update modal total
      const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      const shipping = e.target.value === 'delivery' ? SHIPPING_COST : 0;
      if (modalOrderTotal) modalOrderTotal.textContent = `S/ ${(subtotal + shipping).toFixed(2)}`;
    });
  });

  // Submit Order
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit-order');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando pedido...';
      }

      const cliente = document.getElementById('order-cliente').value.trim();
      const telefono = document.getElementById('order-telefono').value.trim();
      const tipoEntrega = document.querySelector('input[name="order-tipo"]:checked')?.value || 'delivery';
      const direccion = tipoEntrega === 'delivery' ? document.getElementById('order-direccion').value.trim() : 'Recojo en Local Santa Clara';
      const metodoPago = document.getElementById('order-metodo').value;
      const notas = document.getElementById('order-notas').value.trim();

      const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      const shipping = tipoEntrega === 'delivery' ? SHIPPING_COST : 0;
      const total = subtotal + shipping;

      const payload = {
        cliente,
        telefono,
        tipoEntrega,
        direccion,
        metodoPago,
        notas,
        items: cart,
        total
      };

      try {
        const res = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.exito && data.pedido) {
          const ped = data.pedido;
          // Clear Cart
          cart = [];
          saveCart();

          if (checkoutModal) checkoutModal.classList.remove('open');

          // Populate success ticket
          if (orderTicket) {
            orderTicket.innerHTML = `
              <p><strong>Nº de Pedido:</strong> <span style="color: #e32229; font-weight: 800;">${ped.id}</span></p>
              <p><strong>Cliente:</strong> ${ped.cliente} (${ped.telefono})</p>
              <p><strong>Entrega:</strong> ${ped.tipoEntrega === 'delivery' ? '🛵 A domicilio: ' + ped.direccion : '🏪 Recojo en local (Santa Clara)'}</p>
              <p><strong>Método de pago:</strong> ${ped.metodoPago.toUpperCase()}</p>
              <p><strong>Total:</strong> <strong style="color: #e32229; font-size: 18px;">S/ ${ped.total.toFixed(2)}</strong></p>
              <hr style="margin: 10px 0; border: none; border-top: 1px dashed #d1d5db;">
              <p style="font-size: 12.5px; color: #4b5563;">Detalle: ${ped.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')}</p>
            `;
          }

          // Build WhatsApp link with prefilled order details
          const itemsSummary = ped.items.map(i => `- ${i.cantidad}x ${i.nombre} (S/ ${(i.precio * i.cantidad).toFixed(2)})`).join('%0A');
          const waMessage = `Hola BuchiSapa! Realicé el pedido *${ped.id}* a nombre de *${ped.cliente}*:%0A${itemsSummary}%0A*Total: S/ ${ped.total.toFixed(2)}*%0A*Tipo:* ${ped.tipoEntrega}%0A*Dirección:* ${ped.direccion}%0A*Pago:* ${ped.metodoPago}`;
          if (btnWaConfirm) {
            btnWaConfirm.href = `https://wa.me/51987654321?text=${waMessage}`;
          }

          if (successModal) successModal.classList.add('open');
        } else {
          alert(data.error || 'No se pudo procesar el pedido.');
        }
      } catch (err) {
        alert('Error de conexión al enviar pedido.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirmar y Enviar Pedido';
        }
      }
    });
  }

  if (btnCloseSuccess) {
    btnCloseSuccess.addEventListener('click', () => {
      if (successModal) successModal.classList.remove('open');
    });
  }

  // 5. Auth / User Button Click Handler
  function handleAuthClick() {
    const userStr = localStorage.getItem('buchisapa_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.nombre) {
          if (userModalNombre) userModalNombre.textContent = user.nombre;
          if (userModalEmail) userModalEmail.textContent = user.email || '';
          if (btnAdminPanel) {
            btnAdminPanel.style.display = (user.isAdmin || user.email?.includes('admin')) ? 'block' : 'none';
          }
          if (userModal) userModal.classList.add('open');
          return;
        }
      } catch (e) {}
    }
    // If not logged in, go to login
    window.location.href = '/login';
  }

  if (headerAuthBtn) headerAuthBtn.addEventListener('click', handleAuthClick);
  if (drawerLoginBtn) drawerLoginBtn.addEventListener('click', handleAuthClick);

  if (btnCloseUserModal) {
    btnCloseUserModal.addEventListener('click', () => {
      if (userModal) userModal.classList.remove('open');
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('buchisapa_user');
      localStorage.removeItem('buchisapa_token');
      localStorage.removeItem('buchisapa_admin_token');
      sessionStorage.removeItem('buchisapa_admin_session');
      if (userModal) userModal.classList.remove('open');
      if (window.updateAuthUI) window.updateAuthUI();
      window.location.reload();
    });
  }

  // 6. Mobile Drawer Toggle
  if (btnHamburger) {
    btnHamburger.addEventListener('click', () => {
      if (mobileDrawer) mobileDrawer.classList.add('open');
      if (drawerOverlay) drawerOverlay.classList.add('open');
    });
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
  }

  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeMobileDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileDrawer);

  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // Initialize
  loadMenu();
  updateCartUI();
  if (window.updateAuthUI) {
    window.updateAuthUI();
  }
});
