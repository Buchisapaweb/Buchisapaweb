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
    this.updateUI();
    if (this.items.length > 0) {
      this.checkRealtimeStock(true);
    }
  },

  save() {
    if (!Array.isArray(this.items)) {
      this.items = [];
    }
    localStorage.setItem('buchisapa_cart_v1', JSON.stringify(this.items));
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
    
    if (cat.includes('bebida') || cat.includes('refresco') || name.includes('kola') || name.includes('cola') || name.includes('maracuy') || name.includes('cocona') || name.includes('camu') || name.includes('chicha') || name.includes('aguajina')) {
      return 'Bebida bien helada servida en empaque sellado para delivery';
    }
    if (cat.includes('infusion') || name.includes('café') || name.includes('cafe') || name.includes('té') || name.includes('te') || name.includes('anís')) {
      return 'Infusión aromática caliente servida en vaso térmico sellado';
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
    const isDrink = catBadge === 'BEBIDAS' || catBadge === 'INFUSIONES' || (product.category_id && (product.category_id.includes('bebida') || product.category_id.includes('refresco') || product.category_id.includes('infusion')));

    let saucesList;
    if (sauces !== null) {
      saucesList = Array.isArray(sauces) ? sauces : [];
    } else {
      saucesList = isDrink ? [] : ['Mayonesa Casera', 'Tártara Especial', 'Ají de Pollería'];
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
      window.BuchisapaPush.showToast({
        title: '¡Plato Agregado!',
        message: `${product.name} (x${quantity}) sumado a tu pedido`,
        icon: '🍗',
        actionText: 'Ver Carrito',
        onAction: () => this.openDrawer()
      });
    }

    this.openDrawer();
    return true;
  },

  /**
   * SUGERENCIAS CROSS-SELLING INTELIGENTES BASADAS EN EL CARRITO
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

    // Analizar el contenido actual del pedido
    let hasAmazonico = false;
    let hasBurger = false;
    let hasBroaster = false;
    let hasSalchipapa = false;
    let hasAlitas = false;
    let hasDrink = false;
    let hasInfusion = false;

    currentItems.forEach(item => {
      const cat = (item.categoryBadge || item.category_id || item.category || '').toLowerCase();
      const name = (item.name || '').toLowerCase();

      if (cat.includes('amazon') || name.includes('tacacho') || name.includes('cecina') || name.includes('juane') || name.includes('patacón') || name.includes('patacon') || name.includes('chaufa') || name.includes('chilcano') || name.includes('palometa') || name.includes('caldo')) {
        hasAmazonico = true;
      }
      if (cat.includes('hamburguesa') || name.includes('burguer') || name.includes('burger') || name.includes('suprema') || name.includes('choripan') || name.includes('royal')) {
        hasBurger = true;
      }
      if (cat.includes('broaster') || name.includes('broaster')) {
        hasBroaster = true;
      }
      if (cat.includes('salchipapa') || name.includes('salchi')) {
        hasSalchipapa = true;
      }
      if (cat.includes('alita') || name.includes('alitas')) {
        hasAlitas = true;
      }
      if (cat.includes('bebida') || cat.includes('refresco') || name.includes('kola') || name.includes('cola') || name.includes('maracuy') || name.includes('cocona') || name.includes('chicha') || name.includes('camu') || name.includes('aguajina') || name.includes('fanta') || name.includes('pepsi') || name.includes('cielo')) {
        hasDrink = true;
      }
      if (cat.includes('infusion') || name.includes('café') || name.includes('cafe') || name.includes('té') || name.includes('te') || name.includes('anís') || name.includes('anis')) {
        hasInfusion = true;
      }
    });

    const hasFood = hasAmazonico || hasBurger || hasBroaster || hasSalchipapa || hasAlitas;

    // Función auxiliar para comprobar disponibilidad
    const isAvailable = (p) => {
      if (!p) return false;
      const pid = String(p.id || '').toLowerCase();
      const pname = (p.name || '').toLowerCase().trim();
      if (inCartIds.has(pid) || inCartNames.has(pname)) return false;
      if (p.available === false) return false;
      const stockStatus = this.stockStatusMap[p.id] || this.stockStatusMap[pname];
      if (stockStatus && stockStatus.hasStock === false) return false;
      return true;
    };

    const findProduct = (namePattern) => {
      return catalog.find(p => {
        const n = (p.name || '').toLowerCase();
        return n.includes(namePattern.toLowerCase()) && isAvailable(p);
      });
    };

    let suggestions = [];
    let reasonTitle = '¿Te provoca acompañar tu pedido?';
    let reasonSubtitle = 'Añade el complemento perfecto con un solo toque';

    // ESCENARIO 1: Hay comida pero NO ha añadido bebidas/refrescos
    if (hasFood && !hasDrink) {
      reasonTitle = '🥤 ¡No olvides tu bebida helada!';
      reasonSubtitle = 'Elige un refresco natural de la selva o tu gaseosa favorita para acompañar';

      const cocona = findProduct('Cocona');
      const camu = findProduct('Camu Camu');
      const inca = findProduct('Inca Cola') || findProduct('Inca');
      const chicha = findProduct('Chicha');
      const maracuya = findProduct('Maracuyá');
      const patacones = findProduct('Patacones con Chorizo');
      const alitas = findProduct('BBQ') || findProduct('Acevichadas');

      if (cocona) suggestions.push({ ...cocona, badge: '🥤 De la Selva' });
      if (camu) suggestions.push({ ...camu, badge: '⭐ Vitamina C' });
      if (inca) suggestions.push({ ...inca, badge: '❄️ Bien Helada' });
      if (chicha && suggestions.length < 3) suggestions.push({ ...chicha, badge: '🍇 Tradicional' });
      if (maracuya && suggestions.length < 3) suggestions.push({ ...maracuya, badge: '🍹 Refrescante' });

      // Sumar 1 piqueo complementario
      if (hasAmazonico && patacones) {
        suggestions.push({ ...patacones, badge: '🍌 Entrada Selvática' });
      } else if (alitas) {
        suggestions.push({ ...alitas, badge: '🍗 Para Picar' });
      }
    }
    // ESCENARIO 2: Hay platos amazónicos (Tacacho, Juanes, Chaufa, etc.)
    else if (hasAmazonico) {
      reasonTitle = '🌿 Completa tu banquete amazónico';
      reasonSubtitle = 'Entradas típicas y refrescos amazónicos que hacen el match perfecto';

      const patacones = findProduct('Patacones con Chorizo');
      const cocona = findProduct('Cocona');
      const camu = findProduct('Camu Camu');
      const aguajina = findProduct('Aguajina');
      const chaufa = findProduct('Arroz Chaufa');
      const cafe = findProduct('Café');

      if (patacones) suggestions.push({ ...patacones, badge: '🍌 Entrada Típica' });
      if (!hasDrink && cocona) suggestions.push({ ...cocona, badge: '🥤 Refresco Selvático' });
      if (!hasDrink && camu) suggestions.push({ ...camu, badge: '🍹 Fruta Exótica' });
      if (aguajina && suggestions.length < 3) suggestions.push({ ...aguajina, badge: '🌴 Aguajina Helada' });
      if (chaufa && suggestions.length < 3) suggestions.push({ ...chaufa, badge: '🍚 Porción Extra' });
      if (cafe && suggestions.length < 4) suggestions.push({ ...cafe, badge: '☕ Café de la Selva' });
    }
    // ESCENARIO 3: Hamburguesas, Broaster o Salchipapas
    else if (hasBurger || hasBroaster || hasSalchipapa) {
      reasonTitle = '🔥 ¿Un piqueo o bebida extra?';
      reasonSubtitle = 'Combina tus crocantes con las mejores alitas y refrescos';

      const alitasBbq = findProduct('BBQ');
      const alitasAcev = findProduct('Acevichadas');
      const inca = findProduct('Inca');
      const chicha = findProduct('Chicha');
      const patacones = findProduct('Patacones con Chorizo');
      const cafe = findProduct('Café');

      if (alitasBbq) suggestions.push({ ...alitasBbq, badge: '🍗 Piqueo Recomendado' });
      else if (alitasAcev) suggestions.push({ ...alitasAcev, badge: '🍗 Piqueo Recomendado' });

      if (!hasDrink && inca) suggestions.push({ ...inca, badge: '🥤 Heladita' });
      if (!hasDrink && chicha) suggestions.push({ ...chicha, badge: '🍹 Casera' });
      if (patacones && suggestions.length < 3) suggestions.push({ ...patacones, badge: '🍌 Toque Crujiente' });
      if (cafe && suggestions.length < 4) suggestions.push({ ...cafe, badge: '☕ Caliente' });
    }
    // ESCENARIO 4: Solo hay bebidas o infusiones en el carrito
    else if (hasDrink || hasInfusion) {
      reasonTitle = '🍽️ ¡Elige tu plato favorito!';
      reasonSubtitle = 'Acompaña tu bebida con nuestras especialidades recién preparadas';

      const tacacho = findProduct('Tacacho con Cecina');
      const broaster = findProduct('Pecho') || findProduct('Pierna');
      const burger = findProduct('Royal') || findProduct('Clásica');
      const juanes = findProduct('Juanes');

      if (tacacho) suggestions.push({ ...tacacho, badge: '🏆 Favorito Selvático' });
      if (broaster) suggestions.push({ ...broaster, badge: '🍗 Broaster Crocante' });
      if (burger) suggestions.push({ ...burger, badge: '🍔 Hamburguesa Top' });
      if (juanes && suggestions.length < 3) suggestions.push({ ...juanes, badge: '🌿 Juane Caliente' });
    }

    // FALLBACK GENERAL: Platos complementarios destacados
    if (suggestions.length < 2) {
      const fallbackList = [
        { name: 'Cocona', badge: '🥤 Refresco Natural' },
        { name: 'Patacones con Chorizo', badge: '🍌 Para Picar' },
        { name: 'Camu Camu', badge: '⭐ Vitamina C' },
        { name: 'Inca', badge: '🥤 Bebida Clásica' },
        { name: 'BBQ', badge: '🍗 Alitas Jugosas' },
        { name: 'Café', badge: '☕ Café de la Selva' }
      ];
      for (const fb of fallbackList) {
        const prod = findProduct(fb.name);
        if (prod && !suggestions.some(s => s.id === prod.id)) {
          suggestions.push({ ...prod, badge: fb.badge });
          if (suggestions.length >= 4) break;
        }
      }
    }

    // Limitar a máximo 4 sugerencias únicas
    const seen = new Set();
    const finalItems = [];
    for (const item of suggestions) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        finalItems.push(item);
        if (finalItems.length >= 4) break;
      }
    }

    return {
      title: reasonTitle,
      subtitle: reasonSubtitle,
      items: finalItems
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

    const added = this.addItem(product, 1);
    if (added !== false) {
      if (window.BuchisapaPush && typeof window.BuchisapaPush.showToast === 'function') {
        window.BuchisapaPush.showToast({
          title: '¡Sugerencia agregada!',
          message: `Sumaste "${product.name}" (S/ ${parseFloat(product.price || 0).toFixed(2)}) a tu orden.`,
          stage: 'confirmado',
          icon: '✨'
        });
      }
    }
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
  async checkRealtimeStock(silent = false) {
    if (!this.items || this.items.length === 0) {
      this.lastStockValid = true;
      this.outOfStockItems = [];
      this.stockStatusMap = {};
      return true;
    }

    this.isCheckingStock = true;

    try {
      const res = await fetch('/api/cart/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: this.items.map(it => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.lastStockValid = Boolean(data.valid);
        this.outOfStockItems = data.outOfStockItems || [];
        
        const map = {};
        if (Array.isArray(data.itemsStatus)) {
          data.itemsStatus.forEach(st => {
            if (st.id) map[st.id] = st;
            if (st.name) map[st.name.toLowerCase().trim()] = st;
          });
        }
        this.stockStatusMap = map;
      }
    } catch (e) {
      console.warn('Error al verificar stock en tiempo real:', e);
    } finally {
      this.isCheckingStock = false;
      this.updateUI();
    }

    return this.lastStockValid;
  },

  // Flujo protegido de Checkout: Valida stock antes de abrir checkout
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

    // Feedback visual en el botón mientras valida
    const checkoutBtn = document.querySelector('.cart-checkout-main-btn');
    if (checkoutBtn) {
      checkoutBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        <span>Verificando stock en cocina...</span>
      `;
      checkoutBtn.disabled = true;
    }

    const isValid = await this.checkRealtimeStock(false);

    if (!isValid) {
      if (window.BuchisapaPush) {
        window.BuchisapaPush.playChime();
        window.BuchisapaPush.showToast({
          title: '🚫 Pedido Bloqueado por Stock',
          message: 'Uno o más platos de tu pedido ya no están disponibles en cocina. Revisa los items marcados en rojo.',
          stage: 'cancelado',
          icon: '⚠️'
        });
      }
      this.openDrawer();
      return;
    }

    // Stock verificado con éxito -> continuar al checkout modal
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

    if (count === 0) {
      // ESTADO VACÍO (DISEÑO EXACTO SEGÚN CAPTURA)
      if (subbarWrap) subbarWrap.style.display = 'none';

      if (itemsContainer) {
        itemsContainer.innerHTML = `
          <div class="cart-empty-state">
            <div class="cart-empty-icon-card">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h3 class="cart-empty-title">Tu pedido está vacío</h3>
            <p class="cart-empty-desc">Aún no has seleccionado ningún plato. Explora nuestras hamburguesas artesanales, broaster crocante, caldos y platos amazónicos.</p>
            <button class="cart-empty-action-btn" type="button" onclick="BuchisapaCart.closeDrawer(); window.scrollTo({ top: 0, behavior: 'smooth' });">
              Explorar la Carta y Pedir
            </button>
          </div>
        `;
      }
    } else {
      // ESTADO CON PLATOS (DISEÑO EXACTO NUEVA ACTUALIZACIÓN)
      if (subbarWrap) subbarWrap.style.display = 'flex';
      if (subbarCount) {
        subbarCount.textContent = `PLATOS SELECCIONADOS (${count})`;
      }

      const subtotalFormatted = this.getSubtotal().toFixed(2);
      const totalFormatted = this.getTotal().toFixed(2);

      const crossSell = this.getCrossSellSuggestions();
      let crossSellHtml = '';

      if (crossSell && Array.isArray(crossSell.items) && crossSell.items.length > 0) {
        crossSellHtml = `
          <!-- SECCIÓN DE RECOMENDACIONES CROSS-SELLING -->
          <div class="cart-cross-sell-section">
            <div class="cross-sell-header">
              <div class="cross-sell-header-left">
                <span class="cross-sell-sparkle">✨</span>
                <div>
                  <h4 class="cross-sell-title">${crossSell.title}</h4>
                  <p class="cross-sell-subtitle">${crossSell.subtitle}</p>
                </div>
              </div>
              <span class="cross-sell-count-pill">${crossSell.items.length} sugerencias</span>
            </div>

            <div class="cross-sell-carousel">
              ${crossSell.items.map(item => {
                const priceFormatted = (parseFloat(item.price) || 0).toFixed(2);
                const badge = item.badge || 'RECOMENDADO';
                const catFallback = (typeof window.getCategoryBannerFallback === 'function') 
                  ? window.getCategoryBannerFallback(item.category_id || item.category) 
                  : '/imagenes/portada/portada-1.jpg';
                const imgUrl = item.image || catFallback;

                return `
                  <div class="cross-sell-card" onclick="if(typeof openProductDetailModal === 'function') openProductDetailModal('${item.id}')" title="Ver detalles de ${item.name}">
                    <div class="cross-sell-img-wrap">
                      <img src="${imgUrl}" alt="${item.name}" class="cross-sell-img" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${catFallback}';">
                      <span class="cross-sell-badge">${badge}</span>
                    </div>
                    <div class="cross-sell-info">
                      <h5 class="cross-sell-item-name">${item.name}</h5>
                      <div class="cross-sell-bottom-row">
                        <span class="cross-sell-price">S/ ${priceFormatted}</span>
                        <button class="cross-sell-add-btn" type="button" onclick="event.stopPropagation(); BuchisapaCart.addCrossSellItem('${item.id}', event)" title="Agregar ${item.name} al carrito">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                          <span>Agregar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (itemsContainer) {
        itemsContainer.innerHTML = `
          <!-- LISTA DE TARJETAS DE PLATOS -->
          <div class="cart-dish-items-list">
            ${this.items.map((item, idx) => {
              const saucesText = Array.isArray(item.selectedSauces) && item.selectedSauces.length > 0
                ? item.selectedSauces.join(', ')
                : 'Mayonesa Casera, Tártara Especial, Ají de Pollería';
              const priceFormatted = (parseFloat(item.price) || 0).toFixed(2);
              const categoryBadge = item.categoryBadge || 'PROMOCIONES';
              const optionText = item.option || 'Opción: Combo Completo';
              const accompanimentsText = item.accompaniments || 'Con todos sus acompañamientos (1/4 Pollo Broaster (Pecho o Pierna), Papas Fritas artesanales, Ensalada del día, Refresco Chicha Morada 500ml)';
              const itemFallback = (typeof window.getCategoryBannerFallback === 'function') 
                ? window.getCategoryBannerFallback(item.category_id || item.category || categoryBadge) 
                : '/imagenes/portada/portada-1.jpg';
              const itemImg = item.image || itemFallback;

              // Chequeo de stock en tiempo real por ID o Nombre
              const stockStatus = this.stockStatusMap[item.id] || (item.name ? this.stockStatusMap[item.name.toLowerCase().trim()] : null);
              const isOutOfStock = stockStatus && stockStatus.hasStock === false;
              const isLowStock = stockStatus && stockStatus.hasStock === true && stockStatus.availableStock <= 3;
              const cardClass = isOutOfStock ? 'cart-dish-card dish-out-of-stock' : (isLowStock ? 'cart-dish-card dish-low-stock' : 'cart-dish-card');

              let stockBadgeHtml = '';
              if (isOutOfStock) {
                stockBadgeHtml = `<span class="stock-pill-out">🚫 AGOTADO EN COCINA</span>`;
              } else if (isLowStock) {
                stockBadgeHtml = `<span class="stock-pill-low">⚠️ Quedan ${stockStatus.availableStock} und</span>`;
              } else if (stockStatus && stockStatus.hasStock) {
                stockBadgeHtml = `<span class="stock-pill-ok">✓ En stock</span>`;
              }

              return `
                <div class="${cardClass}" id="cart-item-${item.id || idx}">
                  <!-- FILA SUPERIOR: FOTO, BADGE, NOMBRE, PRECIO Y TACHO -->
                  <div class="dish-card-main-row">
                    <img src="${itemImg}" alt="${item.name || 'Plato'}" class="dish-card-thumbnail" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${itemFallback}';">
                    
                    <div class="dish-card-info-col">
                      <div class="dish-card-top-badge-row">
                        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                          <span class="dish-card-cat-badge">${categoryBadge}</span>
                          ${stockBadgeHtml}
                        </div>
                        <button class="dish-card-trash-btn" type="button" onclick="BuchisapaCart.removeItem(${idx})" aria-label="Eliminar ${item.name || 'plato'}">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>

                      <h4 class="dish-card-name">${item.name || 'Plato Buchisapa'}</h4>
                      <div class="dish-card-price-red">S/ ${priceFormatted}</div>
                      <div class="dish-card-option-subtitle">${optionText}</div>
                      ${isOutOfStock ? `<div style="color: #dc2626; font-size: 11.5px; font-weight: 700; margin-top: 3px;">⚠️ ${stockStatus.reason || 'Este plato no tiene porciones disponibles en cocina'}</div>` : ''}
                    </div>
                  </div>

                  <!-- CAJA VERDE DE ACOMPAÑAMIENTOS -->
                  <div class="dish-card-accompaniments-box">
                    <span class="acc-symbol">⊙</span> ${accompanimentsText}
                  </div>

                  <!-- FILA DE CREMAS -->
                  ${(Array.isArray(item.selectedSauces) && item.selectedSauces.length > 0) ? `
                  <div class="dish-card-cremas-text">
                    <strong>Cremas:</strong> ${saucesText}${item.notes ? ` (${item.notes})` : ''}
                  </div>
                  ` : (item.notes ? `<div class="dish-card-cremas-text"><strong>Notas:</strong> ${item.notes}</div>` : '')}

                  <!-- FILA DE CANTIDAD A PREPARAR Y STEPPER -->
                  <div class="dish-card-quantity-row">
                    <span class="qty-label">Cantidad a preparar:</span>
                    <div class="qty-stepper-pill">
                      <button class="stepper-action-btn minus" type="button" onclick="BuchisapaCart.updateQuantity(${idx}, -1)" aria-label="Disminuir cantidad">−</button>
                      <span class="stepper-num">${item.quantity}</span>
                      <button class="stepper-action-btn plus" type="button" onclick="BuchisapaCart.updateQuantity(${idx}, 1)" aria-label="Aumentar cantidad">+</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- BOTÓN AGREGAR MÁS PLATOS DE LA CARTA -->
          <button class="cart-add-more-btn" type="button" onclick="BuchisapaCart.closeDrawer(); window.scrollTo({ top: 0, behavior: 'smooth' });">
            <span class="plus-sign">+</span>
            <span>Agregar más platos de la carta</span>
          </button>

          <!-- SECCIÓN DE RECOMENDACIONES CROSS-SELLING -->
          ${crossSellHtml}

          <!-- TARJETA: RESUMEN DEL PEDIDO -->
          <div class="cart-order-summary-card">
            <!-- INDICADOR DE SINCRONIZACIÓN EN TIEMPO REAL -->
            <div class="cart-stock-sync-indicator">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="cart-stock-sync-dot"></span>
                <span>Stock de cocina verificado en vivo</span>
              </div>
              <button class="cart-stock-test-btn" type="button" onclick="BuchisapaCart.toggleTestStock()" title="Simula que un plato se queda sin stock en cocina">
                🧪 Probar Agotado
              </button>
            </div>

            <div class="summary-card-header">
              <h3 class="summary-card-title">Resumen del Pedido</h3>
              <span class="summary-item-badge" id="cart-summary-item-count">${count === 1 ? '1 item' : `${count} items`}</span>
            </div>

            <div class="summary-lines-group">
              <div class="cart-summary-line">
                <span class="summary-line-label">Subtotal de platos:</span>
                <span class="summary-line-val" id="cart-subtotal">S/ ${subtotalFormatted}</span>
              </div>
              <div class="cart-summary-line">
                <span class="summary-line-label">Modalidad:</span>
                <span class="summary-line-val modality-tag">${isPickup ? '🏪 Recojo en Tienda (Santa Clara)' : '🛵 Delivery'}</span>
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
            <div class="cart-coupon-box" style="margin: 12px 0 16px; padding: 10px 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px;">
              <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span>🎟️ ¿Tienes un código de descuento?</span>
                <span style="font-size: 10px; color: #dc2626; font-weight: 600;">Ejem: BUCHISAPA10</span>
              </div>
              <div style="display: flex; gap: 6px;">
                <input type="text" id="cart-coupon-input" placeholder="Ingresa tu cupón" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 12px; text-transform: uppercase; font-weight: 700;" onkeypress="if(event.key==='Enter'){ BuchisapaCart.applyCouponCode(this.value); }">
                <button type="button" onclick="BuchisapaCart.applyCouponCode(document.getElementById('cart-coupon-input').value)" style="background: #dc2626; color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer;">Aplicar</button>
              </div>
            </div>

            <div class="summary-total-divider"></div>

            <div class="cart-summary-total-row">
              <div class="summary-total-left">
                <span class="summary-total-main-label">Total a Pagar:</span>
                <span class="summary-igv-sublabel">IGV incluido</span>
              </div>
              <div class="summary-total-main-val" id="cart-total">
                <span class="currency-prefix">S/</span> ${totalFormatted}
              </div>
            </div>

            <!-- BANNER DE ALERTA SI HAY PLATOS AGOTADOS -->
            ${!this.lastStockValid ? `
              <div class="cart-stock-alert-banner">
                <div class="cart-stock-alert-head">
                  <div class="cart-stock-alert-icon">!</div>
                  <div class="cart-stock-alert-text">
                    <h4 class="cart-stock-alert-title">Platos agotados en cocina</h4>
                    <p class="cart-stock-alert-desc">Hay ${this.outOfStockItems.length} plato(s) en tu pedido sin porciones disponibles. Para proceder al checkout debes retirarlos.</p>
                  </div>
                </div>
                <button class="cart-remove-unavailable-btn" type="button" onclick="BuchisapaCart.removeOutOfStockItems()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <span>Quitar platos agotados automáticamente</span>
                </button>
              </div>
            ` : ''}

            <!-- BOTÓN PRINCIPAL ROJO CONTINUAR CON LA ENTREGA O BLOQUEADO -->
            ${!this.lastStockValid ? `
              <button class="cart-checkout-main-btn disabled-stock" type="button" disabled title="Quita los platos agotados para proceder al checkout">
                <span>🚫 Platos Agotados (Revisar Carrito)</span>
              </button>
            ` : `
              <button class="cart-checkout-main-btn" type="button" onclick="BuchisapaCart.proceedToCheckout()">
                <span>Continuar con la Entrega</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
            `}

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
      }
    }

    if (subtotalEl) subtotalEl.textContent = `S/ ${this.getSubtotal().toFixed(2)}`;
    if (totalEl) totalEl.innerHTML = `<span class="currency-prefix">S/</span> ${this.getTotal().toFixed(2)}`;
  },

  openDrawer() {
    const drawer = document.getElementById('cart-drawer-modal');
    if (drawer) {
      document.body.classList.add('cart-drawer-open');
      drawer.classList.add('open');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      const bar = document.getElementById('floating-sticky-cart-bar');
      if (bar) {
        bar.remove();
      }
      this.updateUI();
      if (this.items && this.items.length > 0) {
        this.checkRealtimeStock(true);
      }
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer-modal');
    if (drawer) {
      document.body.classList.remove('cart-drawer-open');
      drawer.classList.remove('open');
      drawer.classList.remove('active');
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

window.BuchisapaCart = BuchisapaCart;
