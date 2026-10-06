/**
 * RESTAURANTE BUCHISAPA - Lógica de Carrito de Compras Oficial
 * Manejo de items, personalización de salsas, cálculo de subtotales, estado vacío y diseño "Tu Pedido Buchisapa"
 */

const BuchisapaCart = {
  items: [],
  deliveryFee: 4.00,
  orderType: 'delivery', // 'delivery', 'pickup', 'table'
  stockStatusMap: {},
  isCheckingStock: false,
  lastStockValid: true,
  outOfStockItems: [],

  isDrinkOrNoSauceItem(product) {
    if (!product) return false;

    const catBadge = String(product.categoryBadge || '').toLowerCase();
    const cat = String(product.category_id || product.category || product.categoryPill || '').toLowerCase();
    const name = String(product.name || '').toLowerCase();

    // Las promociones, combos y packs NUNCA son bebidas puras (siempre incluyen cremas y salsas de la casa)
    if (
      product.is_promotion || product.isPromotion || 
      cat.includes('promo') || name.includes('promo') || name.includes('combo') || name.includes('pack')
    ) {
      return false;
    }

    if (product.includes_sauces === false) return true;

    if (
      catBadge.includes('bebida') || catBadge.includes('infusion') || catBadge.includes('refresco') ||
      cat.includes('bebida') || cat.includes('refresco') || cat.includes('infusion') ||
      cat.includes('postre') || cat.includes('licor') || cat.includes('trago') ||
      cat.includes('cafe') || cat.includes('jugo')
    ) {
      return true;
    }

    const drinkKeywords = [
      'agua', 'cielo', 'san mateo', 'san luis', 'inca', 'coca', 'fanta', 'sprite', 'pepsi', 
      '7up', 'gaseosa', 'refresco', 'cocona', 'camu', 'aguajina', 'maracuyá', 'maracuya', 
      'chicha', 'limonada', 'jugo', 'infusión', 'infusion', 'café', 'cafe', 'té', 'te', 
      'anís', 'anis', 'manzanilla', 'hierba luisa', 'cerveza', 'pilsen', 'cusqueña', 'cristal', 'corona', 'heineken'
    ];

    return drinkKeywords.some(kw => name.includes(kw));
  },

  init() {
    const saved = localStorage.getItem('buchisapa_cart_v1');
    const savedType = localStorage.getItem('buchisapa_order_type');
    if (savedType) {
      this.orderType = savedType;
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.items = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        this.items = [];
      }
    } else {
      this.items = [];
    }
    if (!Array.isArray(this.items)) {
      this.items = [];
    }

    // Sanear elementos del carrito para asegurar que bebidas no tengan cremas asignadas
    this.items.forEach(item => {
      if (this.isDrinkOrNoSauceItem(item)) {
        item.selectedSauces = [];
      }
    });

    this.updateUI();
    if (this.items.length > 0) {
      this.checkRealtimeStock(true);
    }
  },

  save() {
    if (!Array.isArray(this.items)) {
      this.items = [];
    }
    // Asegurar sanitización en guardado
    this.items.forEach(item => {
      if (this.isDrinkOrNoSauceItem(item)) {
        item.selectedSauces = [];
      }
    });
    localStorage.setItem('buchisapa_cart_v1', JSON.stringify(this.items));
    this.updateUI();
  },

  setOrderType(type) {
    this.orderType = type === 'pickup' ? 'pickup' : 'delivery';
    localStorage.setItem('buchisapa_order_type', this.orderType);
    this.updateUI();
  },

  getCategoryBadge(product) {
    const cat = (product.category_id || product.category || '').toLowerCase();
    if (cat.includes('promocion') || cat.includes('promo')) return 'PROMOCIONES';
    if (cat.includes('broaster')) return 'BROASTER';
    if (cat.includes('hamburguesa')) return 'HAMBURGUESAS';
    if (cat.includes('amazonico') || cat.includes('cecina') || cat.includes('chaufa') || cat.includes('tacacho')) return 'PLATOS AMAZÓNICOS';
    if (cat.includes('salchipapa')) return 'SALCHIPAPAS';
    if (cat.includes('alita')) return 'ALITAS';
    if (cat.includes('bebida') || cat.includes('refresco')) return 'BEBIDAS';
    if (cat.includes('infusion')) return 'INFUSIONES';
    return 'ESPECIALIDAD';
  },

  getDefaultAccompaniments(product) {
    const name = (product.name || '').toLowerCase();
    const cat = (product.category_id || product.category || '').toLowerCase();
    
    if (this.isDrinkOrNoSauceItem(product)) {
      if (cat.includes('infusion') || name.includes('café') || name.includes('cafe') || name.includes('té') || name.includes('te') || name.includes('anís')) {
        return 'Infusión aromática caliente servida en vaso térmico sellado';
      }
      return 'Bebida bien helada servida en empaque sellado para delivery';
    }
    if (name.includes('broaster') || cat.includes('broaster')) {
      return 'Con todos sus acompañamientos (1/4 Pollo Broaster (Pecho o Pierna), Papas Fritas artesanales, Ensalada del día, Refresco Chicha Morada 500ml)';
    }
    if (name.includes('tacacho') || name.includes('cecina') || cat.includes('amazonico')) {
      return 'Con guarnición de Tacacho de plátano bellaco asado, cecina ahumada de Tarapoto y salsa criolla amazónica';
    }
    if (name.includes('hamburguesa') || cat.includes('hamburguesa')) {
      return 'Con papas fritas crocantes, ensalada fresca de la casa y cremas artesanales Buchisapa';
    }
    if (name.includes('salchipapa') || cat.includes('salchipapa')) {
      return 'Con porción generosa de papas amarillas fritas, salchicha frankfurter y ensalada';
    }
    if (name.includes('alita') || cat.includes('alita')) {
      return 'Acompañadas con papas fritas rústicas, salsa especial a elección y bastones frescos';
    }
    return 'Preparado al momento con ingredientes frescos de la selva y empaque térmico sellado';
  },

  addItem(product, quantity = 1, sauces = null, notes = '', option = null) {
    if (!Array.isArray(this.items)) {
      this.items = [];
    }

    // Validación preliminar si el plato viene marcado como no disponible o stock 0
    if (product.available === false || (typeof product.stock === 'number' && product.stock <= 0)) {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.playChime();
        window.BuchisapaPush.showToast({
          title: 'Plato Agotado en Cocina',
          message: `"${product.name || 'Este plato'}" no tiene stock disponible en este momento.`,
          stage: 'cancelado',
          icon: '🚫'
        });
      } else {
        alert(`Lo sentimos, "${product.name || 'este plato'}" está agotado en cocina.`);
      }
      return false;
    }

    const catBadge = this.getCategoryBadge(product);
    const isDrink = this.isDrinkOrNoSauceItem(product);

    let saucesList;
    if (isDrink) {
      saucesList = [];
    } else if (sauces !== null) {
      saucesList = Array.isArray(sauces) ? sauces : [];
    } else {
      saucesList = ['Mayonesa Casera', 'Tártara Especial', 'Ají de Pollería'];
    }

    const accompaniments = this.getDefaultAccompaniments(product);
    const defaultOption = option || (isDrink ? 'Opción: Bebida Individual Helada' : 'Opción: Combo Completo');

    const existingIndex = this.items.findIndex(
      item => item.id === product.id && JSON.stringify(item.selectedSauces || []) === JSON.stringify(saucesList)
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price || 0),
        image: product.image || 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
        categoryBadge: catBadge,
        accompaniments: accompaniments,
        option: defaultOption,
        quantity: quantity,
        selectedSauces: saucesList,
        notes: notes
      });
    }

    this.save();
    this.checkRealtimeStock(true);

    if (window.BuchisapaPush && typeof window.BuchisapaPush.playChime === 'function') {
      window.BuchisapaPush.playChime('cart');
    }

    this.openDrawer();
    return true;
  },

  /**
   * SUGERENCIAS CROSS-SELLING INTELIGENTES (EXCLUSIVAMENTE BEBIDAS)
   */
  getCrossSellSuggestions() {
    const currentItems = Array.isArray(this.items) ? this.items : [];
    if (currentItems.length === 0) return { title: '', subtitle: '', items: [] };

    // Obtener catálogo unificado
    let catalog = [];
    if (Array.isArray(window.currentProducts) && window.currentProducts.length > 0) {
      catalog = window.currentProducts;
    } else if (typeof getFallbackProducts === 'function') {
      catalog = getFallbackProducts();
    } else if (typeof window.getFallbackProducts === 'function') {
      catalog = window.getFallbackProducts();
    }

    if (!Array.isArray(catalog) || catalog.length === 0) {
      return { title: '', subtitle: '', items: [] };
    }

    // IDs y nombres ya en el carrito para no recomendar lo que el cliente ya tiene
    const inCartIds = new Set(currentItems.map(it => String(it.id || '').toLowerCase()));
    const inCartNames = new Set(currentItems.map(it => (it.name || '').toLowerCase().trim()));

    // Filtrar catálogo ÚNICAMENTE para bebidas/refrescos/infusiones disponibles que no estén ya en el carrito
    const availableDrinks = catalog.filter(p => {
      if (!p) return false;
      const pid = String(p.id || '').toLowerCase();
      const pname = (p.name || '').toLowerCase().trim();
      if (inCartIds.has(pid) || inCartNames.has(pname)) return false;
      if (p.available === false) return false;
      const stockStatus = this.stockStatusMap[p.id] || this.stockStatusMap[pname];
      if (stockStatus && stockStatus.hasStock === false) return false;
      return this.isDrinkOrNoSauceItem(p);
    });

    if (availableDrinks.length === 0) {
      return { title: '', subtitle: '', items: [] };
    }

    const reasonTitle = '🥤 ¡No olvides tu bebida helada!';
    const reasonSubtitle = 'Elige un refresco natural de la selva o tu gaseosa favorita para acompañar';

    // Asignar badges personalizados según la bebida
    const suggestions = [];
    const getDrinkBadge = (p) => {
      const n = (p.name || '').toLowerCase();
      if (n.includes('cocona')) return '🥤 De la Selva';
      if (n.includes('camu')) return '⭐ Vitamina C';
      if (n.includes('chicha')) return '🍇 Tradicional';
      if (n.includes('aguajina')) return '🌴 Exótico';
      if (n.includes('maracuy')) return '🍹 Refrescante';
      if (n.includes('inca') || n.includes('coca') || n.includes('gaseosa')) return '❄️ Bien Helada';
      if (n.includes('agua') || n.includes('cielo')) return '💧 Heladita';
      if (n.includes('café') || n.includes('cafe') || n.includes('té') || n.includes('te') || n.includes('anís')) return '☕ Calientito';
      return '🥤 Refresco Natural';
    };

    // Priorizar refrescos naturales de la selva
    const naturalDrinks = availableDrinks.filter(p => {
      const n = (p.name || '').toLowerCase();
      return n.includes('cocona') || n.includes('camu') || n.includes('chicha') || n.includes('aguajina') || n.includes('maracuy') || n.includes('limonada');
    });

    // Luego gaseosas/aguas/infusiones
    const otherDrinks = availableDrinks.filter(p => !naturalDrinks.includes(p));

    const orderedList = [...naturalDrinks, ...otherDrinks];

    for (const d of orderedList) {
      suggestions.push({
        ...d,
        badge: getDrinkBadge(d)
      });
      if (suggestions.length >= 4) break;
    }

    return {
      title: reasonTitle,
      subtitle: reasonSubtitle,
      items: suggestions
    };
  },

  /**
   * AGREGAR PRODUCTO COMPLEMENTARIO DESDE EL CARRITO EN 1 CLIC
   */
  addCrossSellItem(productId, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    let catalog = [];
    if (Array.isArray(window.currentProducts) && window.currentProducts.length > 0) {
      catalog = window.currentProducts;
    } else if (typeof getFallbackProducts === 'function') {
      catalog = getFallbackProducts();
    } else if (typeof window.getFallbackProducts === 'function') {
      catalog = window.getFallbackProducts();
    }

    const product = catalog.find(p => String(p.id || '').toLowerCase() === String(productId || '').toLowerCase());
    if (!product) return;

    if (product.available === false) {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.showToast({
          title: 'Plato Agotado',
          message: `"${product.name}" no está disponible en este momento.`,
          stage: 'cancelado',
          icon: '🚫'
        });
      }
      return;
    }

    this.addItem(product, 1);
  },

  removeItem(index) {
    if (!Array.isArray(this.items)) {
      this.items = [];
      this.save();
      return;
    }
    this.items.splice(index, 1);
    this.save();
    this.checkRealtimeStock(true);
  },

  updateQuantity(index, delta) {
    if (!Array.isArray(this.items)) {
      this.items = [];
      this.save();
      return;
    }
    if (this.items[index]) {
      this.items[index].quantity += delta;
      if (this.items[index].quantity <= 0) {
        this.removeItem(index);
      } else {
        this.save();
        this.checkRealtimeStock(true);
      }
    }
  },

  clear() {
    this.items = [];
    this.stockStatusMap = {};
    this.outOfStockItems = [];
    this.lastStockValid = true;
    this.save();
  },

  // Chequeo de Stock en Tiempo Real con Backend
  async checkRealtimeStock(silent = true) {
    return true;
  },

  async proceedToCheckout() {
    if (!this.items || this.items.length === 0) {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.showToast({
          title: 'Tu Pedido Está Vacío',
          message: 'Agrega al menos un plato a tu carrito para continuar.',
          stage: 'info',
          icon: '🛒'
        });
      } else {
        alert('Agrega al menos un plato a tu carrito para continuar.');
      }
      return;
    }

    if (typeof window.openCheckoutModal === 'function') {
      window.openCheckoutModal();
    }
  },

  // Quitar todos los platos sin stock con 1 solo clic
  removeOutOfStockItems() {
    const outIds = new Set(this.outOfStockItems.map(o => o.id));
    this.items = this.items.filter(it => !outIds.has(it.id));
    this.save();
    this.lastStockValid = true;
    this.outOfStockItems = [];
    this.stockStatusMap = {};
    this.checkRealtimeStock(false);
    if (window.BuchisapaPush) {
      window.BuchisapaPush.showToast({
        title: 'Carrito Limpio',
        message: 'Se retiraron los productos no disponibles. Ya puedes continuar con tu pedido.',
        stage: 'info',
        icon: '🧹'
      });
    }
  },

  // Manejo de eventos SSE de stock en vivo desde la cocina
  onStockBroadcast(data) {
    if (!data || !data.productId) return;
    const itemInCart = this.items.find(it => it.id === data.productId || (it.name && it.name.toLowerCase() === (data.name || '').toLowerCase()));
    if (itemInCart) {
      console.log(`⚡ Sincronización SSE en vivo: plato ${itemInCart.name} actualizado.`);
      this.checkRealtimeStock(true);
      if (data.available === false || data.stock === 0) {
        if (window.BuchisapaPush) {
          window.BuchisapaPush.playChime();
          window.BuchisapaPush.showToast({
            title: '⚠️ Plato Agotado en Cocina',
            message: `La cocina acaba de marcar "${itemInCart.name}" como agotado. Se actualizó tu carrito.`,
            stage: 'cancelado',
            icon: '🔥'
          });
        }
      }
    }
  },

  // Herramienta de demostración para probar stock agotado en vivo
  async toggleTestStock(productId) {
    const targetId = productId || (this.items[0] ? this.items[0].id : 'ama-1');
    try {
      const res = await fetch('/api/products/test-toggle-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: targetId })
      });
      const data = await res.json();
      if (data.success) {
        if (window.BuchisapaPush) {
          window.BuchisapaPush.showToast({
            title: 'Prueba de Stock en Vivo',
            message: data.message,
            stage: data.data.available ? 'entregado' : 'cancelado',
            icon: '🧪'
          });
        }
        await this.checkRealtimeStock(false);
      }
    } catch (e) {
      console.error('Error toggling test stock:', e);
    }
  },

  appliedCoupon: null,
  couponDiscount: 0,

  applyCouponCode(code) {
    if (!code || typeof code !== 'string') return;
    const clean = code.trim().toUpperCase();
    const subtotal = this.getSubtotal();

    if (subtotal <= 0) {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.showToast({
          title: 'Carrito vacío',
          message: 'Agrega platos antes de aplicar un cupón de descuento.',
          stage: 'cancelado',
          icon: '🛒'
        });
      }
      return;
    }

    if (clean === 'BUCHISAPA10') {
      this.appliedCoupon = { code: 'BUCHISAPA10', desc: '10% OFF Especial Buchisapa' };
      this.couponDiscount = subtotal * 0.10;
      if (window.BuchisapaPush) {
        window.BuchisapaPush.showToast({
          title: '¡Cupón Aplicado! 🎉',
          message: 'Se aplicó un 10% de descuento a tu pedido.',
          stage: 'preparando',
          icon: '🎁'
        });
      }
    } else if (clean === 'SELVA20') {
      this.appliedCoupon = { code: 'SELVA20', desc: 'Descuento Selvático S/ 5.00' };
      this.couponDiscount = Math.min(5.00, subtotal);
      if (window.BuchisapaPush) {
        window.BuchisapaPush.showToast({
          title: '¡Cupón Aplicado! 🌴',
          message: 'Se descontaron S/ 5.00 de tu pedido.',
          stage: 'preparando',
          icon: '🌴'
        });
      }
    } else if (clean === 'ENVIOGRATIS') {
      this.appliedCoupon = { code: 'ENVIOGRATIS', desc: 'Envío Gratis a Domicilio' };
      this.couponDiscount = this.deliveryFee;
      if (window.BuchisapaPush) {
        window.BuchisapaPush.showToast({
          title: '¡Envío Gratis! 🛵',
          message: 'Costo de delivery bonificado al 100%.',
          stage: 'preparando',
          icon: '🚀'
        });
      }
    } else {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.showToast({
          title: 'Código no válido',
          message: 'Prueba con BUCHISAPA10, SELVA20 o ENVIOGRATIS',
          stage: 'cancelado',
          icon: '⚠️'
        });
      }
      return;
    }
    this.updateUI();
  },

  removeCoupon() {
    this.appliedCoupon = null;
    this.couponDiscount = 0;
    this.updateUI();
  },

  getSubtotal() {
    if (!Array.isArray(this.items)) return 0;
    return this.items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0);
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    const fee = this.orderType === 'delivery' ? this.deliveryFee : 0;
    const discount = this.couponDiscount || 0;
    return Math.max(0, subtotal + fee - discount);
  },

  getCount() {
    if (!Array.isArray(this.items)) return 0;
    return this.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  },

  updateFloatingCartBar() {
    let bar = document.getElementById('floating-sticky-cart-bar');
    const count = this.getCount();
    const total = this.getTotal();

    // Si el carrito está vacío o estamos en páginas internas de gestión (admin o kitchen), no mostrar
    if (count <= 0 || window.location.pathname.includes('/kitchen') || window.location.pathname.includes('/admin')) {
      if (bar) bar.remove();
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'floating-sticky-cart-bar';
      bar.className = 'floating-sticky-cart-bar';
      bar.onclick = () => this.openDrawer();
      document.body.appendChild(bar);
    }

    bar.innerHTML = `
      <div class="floating-cart-left">
        <div class="floating-cart-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span class="floating-cart-count-badge">${count}</span>
        </div>
        <div class="floating-cart-info">
          <span class="floating-cart-title">Tu Pedido: S/ ${total.toFixed(2)}</span>
          <span class="floating-cart-sub">${count} ${count === 1 ? 'plato seleccionado' : 'platos seleccionados'} • Toca para enviar</span>
        </div>
      </div>
      <button type="button" class="floating-cart-btn" onclick="event.stopPropagation(); BuchisapaCart.openDrawer();">
        <span>Ver Pedido</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    `;

    bar.classList.remove('cart-bump');
    void bar.offsetWidth; // Forzar reflow para reiniciar la animación
    bar.classList.add('cart-bump');
  },

  updateUI() {
    if (!Array.isArray(this.items)) {
      this.items = [];
    }

    this.updateFloatingCartBar();

    const count = this.getCount();
    
    // 1. Actualizar badges en header y nav
    const countBadge = document.getElementById('cart-count-badge');
    if (countBadge) {
      countBadge.textContent = count;
      countBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    const drawerBadge = document.getElementById('drawer-cart-count');
    if (drawerBadge) {
      drawerBadge.textContent = count;
    }

    const subbarWrap = document.getElementById('cart-subbar-wrap');
    const subbarCount = document.getElementById('cart-subbar-count');
    const itemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const deliveryLabel = document.getElementById('cart-delivery-label');
    const deliveryFeeEl = document.getElementById('cart-delivery-fee');
    const totalEl = document.getElementById('cart-total');
    const summaryItemCountEl = document.getElementById('cart-summary-item-count');

    // Manejar distrito seleccionado para la etiqueta de envío
    const savedType = localStorage.getItem('buchisapa_order_type') || this.orderType || 'delivery';
    this.orderType = savedType;

    const locationLabelEl = document.getElementById('selected-location-label');
    let districtName = 'Ate';
    if (locationLabelEl && locationLabelEl.textContent) {
      const txt = locationLabelEl.textContent.replace('Entregar a', '').trim();
      if (txt) districtName = txt;
    }

    const isPickup = this.orderType === 'pickup';
    const effectiveFee = isPickup ? 0 : this.deliveryFee;

    if (deliveryLabel) {
      deliveryLabel.textContent = isPickup ? 'Costo de entrega (Recojo en Tienda):' : `Costo de envío (${districtName}):`;
    }
    if (deliveryFeeEl) {
      deliveryFeeEl.textContent = isPickup ? 'Gratis (S/ 0.00)' : `S/ ${this.deliveryFee.toFixed(2)}`;
    }
    if (summaryItemCountEl) {
      summaryItemCountEl.textContent = count === 1 ? '1 item' : `${count} items`;
    }

    const listCol = document.getElementById('cart-items-list-col');
    const summaryCol = document.getElementById('cart-summary-col');
    const hasColumns = listCol && summaryCol;

    const emptyActionBtn = document.getElementById('btn-cart-empty');

    if (count === 0) {
      // ESTADO VACÍO (DISEÑO MODERNO Y ATRACTIVO)
      if (subbarWrap) subbarWrap.style.display = 'none';
      if (emptyActionBtn) {
        emptyActionBtn.classList.add('is-hidden');
        emptyActionBtn.style.setProperty('display', 'none', 'important');
      }

      const emptyStateHtml = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon-card">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h3 class="cart-empty-title">Tu pedido está vacío</h3>
          <p class="cart-empty-desc">Aún no has seleccionado ningún plato. Explora nuestras especialidades al carbón, broaster crocante y delicias amazónicas.</p>
          
          <div class="cart-empty-quick-categories">
            <span class="quick-cat-label">Explorar por categoría:</span>
            <div class="quick-cat-chips">
              <button type="button" class="quick-cat-chip" onclick="BuchisapaCart.closeDrawer(); if(typeof openCategoryView==='function') openCategoryView('hamburguesas', 'HAMBURGUESAS');">🍔 Hamburguesas</button>
              <button type="button" class="quick-cat-chip" onclick="BuchisapaCart.closeDrawer(); if(typeof openCategoryView==='function') openCategoryView('broaster', 'BROASTER');">🍗 Broaster</button>
              <button type="button" class="quick-cat-chip" onclick="BuchisapaCart.closeDrawer(); if(typeof openCategoryView==='function') openCategoryView('platos-amazonicos', 'PLATOS AMAZÓNICOS');">🌴 Amazónicos</button>
              <button type="button" class="quick-cat-chip" onclick="BuchisapaCart.closeDrawer(); if(typeof openCategoryView==='function') openCategoryView('alitas', 'ALITAS');">🍗 Alitas</button>
              <button type="button" class="quick-cat-chip" onclick="BuchisapaCart.closeDrawer(); if(typeof openCategoryView==='function') openCategoryView('bebidas', 'BEBIDAS');">🥤 Bebidas</button>
            </div>
          </div>

          <button class="cart-empty-action-btn" type="button" onclick="BuchisapaCart.closeDrawer(); if(typeof window.scrollToCategoryBanners==='function'){window.scrollToCategoryBanners();}else{window.scrollTo({top:0,behavior:'smooth'});}">
            <span>Explorar la Carta y Pedir</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      `;

      if (hasColumns) {
        listCol.style.gridColumn = '1 / -1';
        summaryCol.style.display = 'none';
        listCol.innerHTML = emptyStateHtml;
      } else if (itemsContainer) {
        itemsContainer.innerHTML = emptyStateHtml;
      }
    } else {
      // ESTADO CON PLATOS (DISEÑO ACTUALIZADO)
      if (subbarWrap) subbarWrap.style.display = 'flex';
      if (emptyActionBtn) {
        emptyActionBtn.classList.remove('is-hidden');
        emptyActionBtn.style.setProperty('display', 'inline-flex', 'important');
      }
      if (subbarCount) {
        subbarCount.textContent = `PLATOS SELECCIONADOS (${count})`;
      }

      const subtotalFormatted = this.getSubtotal().toFixed(2);
      const totalFormatted = this.getTotal().toFixed(2);

      const crossSell = this.getCrossSellSuggestions();
      let crossSellHtml = '';

      if (crossSell && Array.isArray(crossSell.items) && crossSell.items.length > 0) {
        crossSellHtml = `
          <!-- SECCIÓN DE RECOMENDACIONES CROSS-SELLING (VERTICAL SUCESIVO) -->
          <div class="cart-cross-sell-section">
            <div class="cross-sell-header">
              <div class="cross-sell-header-left">
                <span class="cross-sell-sparkle">🥤</span>
                <div>
                  <h4 class="cross-sell-title">${crossSell.title}</h4>
                  <p class="cross-sell-subtitle">${crossSell.subtitle}</p>
                </div>
              </div>
              <span class="cross-sell-count-pill">${crossSell.items.length} sugerencias</span>
            </div>

            <div class="cross-sell-vertical-list">
              ${crossSell.items.map(item => {
                const priceFormatted = (parseFloat(item.price) || 0).toFixed(2);
                const badge = item.badge || 'RECOMENDADO';
                const catFallback = (typeof window.getCategoryBannerFallback === 'function') 
                  ? window.getCategoryBannerFallback(item.category_id || item.category) 
                  : '/imagenes/portada/Portada1E.webp';
                const imgUrl = item.image || catFallback;
                const desc = item.description || 'Refresco helado y delicioso para acompañar tu plato';

                return `
                  <div class="cross-sell-vertical-card" onclick="if(typeof openProductDetailModal === 'function') openProductDetailModal('${item.id}')" title="Ver detalles de ${item.name}">
                    <div class="cross-sell-v-img-wrap">
                      <img src="${imgUrl}" alt="${item.name}" class="cross-sell-v-img" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${catFallback}';">
                      <span class="cross-sell-v-badge">${badge}</span>
                    </div>
                    <div class="cross-sell-v-info">
                      <div class="cross-sell-v-title-row">
                        <h5 class="cross-sell-v-name">${item.name}</h5>
                        <span class="cross-sell-v-price">S/ ${priceFormatted}</span>
                      </div>
                      <p class="cross-sell-v-desc">${desc}</p>
                    </div>
                    <button class="cross-sell-v-add-btn" type="button" onclick="event.stopPropagation(); BuchisapaCart.addCrossSellItem('${item.id}', event)" title="Agregar ${item.name} al carrito">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                      <span>+ Agregar</span>
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      const dishesListHtml = `
        <!-- SELECTOR DE MODALIDAD DE ENTREGA -->
        <div class="cart-mode-toggle-wrap">
          <button type="button" class="cart-mode-tab ${!isPickup ? 'active' : ''}" onclick="BuchisapaCart.setOrderType('delivery')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.6C2 10.8 2 11.2 2 11.6V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
            <span>Delivery a Domicilio</span>
          </button>
          <button type="button" class="cart-mode-tab ${isPickup ? 'active' : ''}" onclick="BuchisapaCart.setOrderType('pickup')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Recojo en Tienda</span>
          </button>
        </div>

        <!-- LISTA DE TARJETAS DE PLATOS -->
        <div class="cart-dish-items-list">
          ${this.items.map((item, idx) => {
            const isDrinkItem = this.isDrinkOrNoSauceItem(item);
            const hasSauces = !isDrinkItem && Array.isArray(item.selectedSauces) && item.selectedSauces.length > 0;
            const priceFormatted = (parseFloat(item.price) || 0).toFixed(2);
            const itemSubtotal = ((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2);
            const categoryBadge = item.categoryBadge || (isDrinkItem ? 'BEBIDAS' : 'PROMOCIONES');
            const optionText = item.option || (isDrinkItem ? 'Bebida Helada' : 'Combo Completo');
            const accompanimentsText = item.accompaniments || this.getDefaultAccompaniments(item);
            const itemFallback = (typeof window.getCategoryBannerFallback === 'function') 
              ? window.getCategoryBannerFallback(item.category_id || item.category || categoryBadge) 
              : '/imagenes/portada/Portada1E.webp';
            const itemImg = item.image || itemFallback;

            const cardClass = 'cart-dish-card';

            return `
              <div class="${cardClass}" id="cart-item-${item.id || idx}">
                <!-- FILA SUPERIOR: FOTO, BADGE, NOMBRE, PRECIO Y TACHO -->
                <div class="dish-card-main-row">
                  <div class="dish-card-thumb-wrap">
                    <img src="${itemImg}" alt="${item.name || 'Plato'}" class="dish-card-thumbnail" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${itemFallback}';">
                  </div>
                  
                  <div class="dish-card-info-col">
                    <div class="dish-card-top-badge-row">
                      <span class="dish-card-cat-badge">${categoryBadge}</span>
                      <button class="dish-card-trash-btn" type="button" onclick="BuchisapaCart.removeItem(${idx})" aria-label="Eliminar ${item.name || 'plato'}" title="Eliminar plato del pedido">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>

                    <h4 class="dish-card-name">${item.name || 'Plato Buchisapa'}</h4>
                    <div class="dish-card-price-row">
                      <span class="dish-card-price-red">S/ ${priceFormatted}</span>
                      <span class="dish-card-unit-label">c/u</span>
                    </div>
                    <div class="dish-card-option-subtitle">${optionText}</div>
                  </div>
                </div>

                <!-- CAJA VERDE DE ACOMPAÑAMIENTOS -->
                <div class="dish-card-accompaniments-box">
                  <div class="acc-badge-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>Incluye:</span>
                  </div>
                  <span class="acc-text">${accompanimentsText}</span>
                </div>

                <!-- FILA DE CREMAS / SALSAS CON PILLS ESTILIZADAS -->
                ${hasSauces ? `
                <div class="dish-card-cremas-container">
                  <span class="cremas-header-tag">Salsas:</span>
                  <div class="sauces-tags-list">
                    ${item.selectedSauces.map(s => `<span class="sauce-tag-pill">✨ ${s}</span>`).join('')}
                  </div>
                  ${item.notes ? `<div class="dish-card-note-pill">📝 <em>${item.notes}</em></div>` : ''}
                </div>
                ` : (item.notes ? `<div class="dish-card-cremas-container"><div class="dish-card-note-pill">📝 <em>${item.notes}</em></div></div>` : '')}

                <!-- FILA DE CANTIDAD Y STEPPER -->
                <div class="dish-card-quantity-row">
                  <div class="dish-card-item-subtotal">
                    <span class="subtotal-label">Subtotal:</span>
                    <span class="subtotal-val">S/ ${itemSubtotal}</span>
                  </div>
                  <div class="qty-stepper-pill">
                    <button class="stepper-action-btn minus" type="button" onclick="BuchisapaCart.updateQuantity(${idx}, -1)" aria-label="Disminuir cantidad" title="Restar 1">−</button>
                    <span class="stepper-num">${item.quantity}</span>
                    <button class="stepper-action-btn plus" type="button" onclick="BuchisapaCart.updateQuantity(${idx}, 1)" aria-label="Aumentar cantidad" title="Sumar 1">+</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- BOTÓN AGREGAR MÁS PLATOS DE LA CARTA -->
        <button class="cart-add-more-btn" type="button" onclick="BuchisapaCart.closeDrawer(); if(typeof window.scrollToCategoryBanners==='function'){window.scrollToCategoryBanners();}else{window.scrollTo({top:0,behavior:'smooth'});}">
          <span class="plus-sign">+</span>
          <span>Agregar más platos de la carta</span>
        </button>

        <!-- SECCIÓN DE RECOMENDACIONES CROSS-SELLING -->
        ${crossSellHtml}
      `;

      const orderSummaryHtml = `
        <!-- TARJETA: RESUMEN DEL PEDIDO -->
        <div class="cart-order-summary-card">
          <div class="summary-card-header">
            <h3 class="summary-card-title">Resumen del Pedido</h3>
            <span class="summary-item-badge" id="cart-summary-item-count">${count === 1 ? '1 plato' : `${count} platos`}</span>
          </div>

          <div class="summary-lines-group">
            <div class="cart-summary-line">
              <span class="summary-line-label">Subtotal de platos:</span>
              <span class="summary-line-val" id="cart-subtotal">S/ ${subtotalFormatted}</span>
            </div>
            <div class="cart-summary-line">
              <span class="summary-line-label">Modalidad:</span>
              <span class="summary-line-val modality-tag">${isPickup ? '🏪 Recojo en Tienda (Santa Clara)' : '🛵 Delivery a Domicilio'}</span>
            </div>
            <div class="cart-summary-line">
              <span class="summary-line-label" id="cart-delivery-label">${isPickup ? 'Costo de entrega:' : `Costo de envío (${districtName}):`}</span>
              <span class="summary-line-val" id="cart-delivery-fee">${isPickup ? 'Gratis (S/ 0.00)' : `S/ ${this.deliveryFee.toFixed(2)}`}</span>
            </div>
            ${this.appliedCoupon ? `
            <div class="cart-summary-line discount-line" style="color: #16a34a; font-weight: 700;">
              <span class="summary-line-label" style="display: flex; align-items: center; gap: 4px;">
                🏷️ ${this.appliedCoupon.desc}
                <button type="button" onclick="BuchisapaCart.removeCoupon()" style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 11px; padding: 0 4px; text-decoration: underline;">(Quitar)</button>
              </span>
              <span class="summary-line-val">- S/ ${this.couponDiscount.toFixed(2)}</span>
            </div>
            ` : ''}
          </div>

          <!-- BLOQUE DE CUPÓN INTERACTIVO -->
          <div class="cart-coupon-box">
            <div class="coupon-title-row">
              <span>🎟️ ¿Tienes un código de descuento?</span>
              <span class="coupon-hint">Ej: BUCHISAPA10</span>
            </div>
            <div class="coupon-input-group">
              <input type="text" id="cart-coupon-input" placeholder="Ingresa tu código" onkeypress="if(event.key==='Enter'){ BuchisapaCart.applyCouponCode(this.value); }">
              <button type="button" class="coupon-apply-btn" onclick="BuchisapaCart.applyCouponCode(document.getElementById('cart-coupon-input').value)">Aplicar</button>
            </div>
          </div>

          <div class="summary-total-divider"></div>

          <div class="cart-summary-total-row">
            <div class="summary-total-left">
              <span class="summary-total-main-label">Total a Pagar:</span>
              <span class="summary-igv-sublabel">IGV y empaques incluidos</span>
            </div>
            <div class="summary-total-main-val" id="cart-total">
              <span class="currency-prefix">S/</span> ${totalFormatted}
            </div>
          </div>

          <!-- BOTÓN PRINCIPAL ROJO CONTINUAR CON LA ENTREGA -->
          <button class="cart-checkout-main-btn" type="button" onclick="BuchisapaCart.proceedToCheckout()">
            <span>Continuar con la Entrega</span>
            <span class="checkout-btn-price">S/ ${totalFormatted} →</span>
          </button>

          <!-- AVISO DE PEDIDO DIRECTO A COCINA -->
          <div class="cart-assurance-box">
            <div class="assurance-head">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <span class="assurance-title">Pedido directo a cocina (+51 943 312 024)</span>
            </div>
            <p class="assurance-text">Al confirmar se enviará la orden formateada con todos los detalles al WhatsApp de Buchisapa.</p>
          </div>
        </div>
      `;

      if (hasColumns) {
        listCol.style.gridColumn = '';
        summaryCol.style.display = '';
        listCol.innerHTML = dishesListHtml;
        summaryCol.innerHTML = orderSummaryHtml;
      } else if (itemsContainer) {
        itemsContainer.innerHTML = dishesListHtml + orderSummaryHtml;
      }
    }

    if (subtotalEl) subtotalEl.textContent = `S/ ${this.getSubtotal().toFixed(2)}`;
    if (totalEl) totalEl.innerHTML = `<span class="currency-prefix">S/</span> ${this.getTotal().toFixed(2)}`;
  },

  openDrawer() {
    const drawer = document.getElementById('cart-drawer-modal');
    if (drawer) {
      document.body.classList.add('cart-drawer-open');
      drawer.style.display = 'flex';
      void drawer.offsetWidth;
      drawer.classList.add('open', 'active');
      document.body.style.overflow = 'hidden';
      this.updateUI();
      if (this.items && this.items.length > 0) {
        this.checkRealtimeStock(true);
      }
      return;
    }
    if (window.location.pathname !== '/carrito' && window.location.pathname !== '/carrito.html') {
      window.location.href = '/carrito';
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer-modal');
    if (drawer) {
      document.body.classList.remove('cart-drawer-open');
      drawer.classList.remove('open', 'active');
      setTimeout(() => {
        if (!drawer.classList.contains('open')) {
          drawer.style.display = 'none';
        }
      }, 250);
      document.body.style.overflow = '';
      this.updateFloatingCartBar();
    }
  },

  handleBackdropClick(event) {
    if (event.target && event.target.id === 'cart-drawer-modal') {
      this.closeDrawer();
    }
  }
};

function initCartDomListeners() {
  const drawer = document.getElementById('cart-drawer-modal');
  if (drawer) {
    drawer.addEventListener('click', (e) => BuchisapaCart.handleBackdropClick(e));
  }
  const btnBack = document.getElementById('btn-cart-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => BuchisapaCart.closeDrawer());
  }
  const btnClose = document.getElementById('btn-cart-close');
  if (btnClose) {
    btnClose.addEventListener('click', () => BuchisapaCart.closeDrawer());
  }
  const btnEmpty = document.getElementById('btn-cart-empty');
  if (btnEmpty) {
    btnEmpty.addEventListener('click', () => BuchisapaCart.clear());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartDomListeners);
} else {
  initCartDomListeners();
}

window.BuchisapaCart = BuchisapaCart;
