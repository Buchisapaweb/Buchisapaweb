/**
 * RESTAURANTE BUCHISAPA - LÓGICA DE DETALLE DE PRODUCTO (producto.js)
 * Carga dinámica del plato, personalizador de acompañamientos y cremas,
 * cálculo de precios en tiempo real y sincronización con el carrito BuchiSapa.
 */

(function () {
  'use strict';

  // Base de datos de salsas de la casa
  const SAUCES_LIST = [
    { id: 'mayonesa', name: 'Mayonesa Casera', default: true },
    { id: 'mostaza', name: 'Mostaza Clásica', default: true },
    { id: 'ketchup', name: 'Ketchup', default: true },
    { id: 'rocoto', name: 'Ají de Rocoto', default: true },
    { id: 'tartara', name: 'Tártara Especial', default: false },
    { id: 'charapita', name: 'Ají Charapita', default: false },
    { id: 'ocopa', name: 'Ocopa Arequipeña', default: false },
    { id: 'bbq', name: 'Salsa BBQ Ahumada', default: false },
    { id: 'vinagreta', name: 'Vinagreta de la Casa', default: false }
  ];

  // Acompañamientos comunes por categoría
  const ACCOMPANIMENTS_MAP = {
    broaster: [
      { id: 'papas', name: 'Papas Fritas Artesanales', default: true },
      { id: 'ensalada', name: 'Ensalada Fresca de Col y Zanahoria', default: true },
      { id: 'arroz_chaufa', name: 'Cambiar por Arroz Chaufa de la Selva (+S/ 3.00)', price: 3.00, default: false }
    ],
    amazonico: [
      { id: 'tacacho', name: 'Tacacho Artesanal con Cecina', default: true },
      { id: 'patacones', name: 'Patacones de Plátano Bellaco', default: true },
      { id: 'salsa_criolla', name: 'Salsa Criolla Amazónica con Cocona', default: true }
    ],
    hamburguesa: [
      { id: 'papas', name: 'Papas Fritas Crocantes', default: true },
      { id: 'ensalada', name: 'Ensalada Fresca', default: false }
    ],
    alitas: [
      { id: 'papas', name: 'Papas Fritas Rústicas', default: true },
      { id: 'bastones', name: 'Bastones de Apio y Zanahoria', default: true }
    ],
    default: [
      { id: 'guarnicion', name: 'Porción estándar de la casa', default: true }
    ]
  };

  // Fallback de productos si el servidor está offline o cargando
  const FALLBACK_PRODUCTS = [
    {
      id: 'C0002_P01',
      code: 'C0002_P01',
      name: '1/4 Pollo Broaster BuchiSapa',
      category_id: 'broaster',
      category: 'Pollo Broaster',
      categoryBadge: 'Broaster al Carbón',
      price: 18.90,
      originalPrice: 22.00,
      description: 'Crujiente presa de 1/4 de pollo broaster sazonada con nuestra receta secreta amazónica y frita al punto exacto. Acompañada de papas fritas artesanales, ensalada del día y selección de cremas.',
      badge: 'Más Vendido 🔥',
      image: '/imagenes/categorias/broaster/banner.webp',
      stock: 50,
      available: true
    },
    {
      id: 'C0004_P01',
      code: 'C0004_P01',
      name: 'Tacacho con Cecina Especial',
      category_id: 'amazonico',
      category: 'Sabores Amazónicos',
      categoryBadge: 'Tradición de la Selva',
      price: 24.50,
      originalPrice: 28.00,
      description: 'Plátano bellaco asado y majado artesanalmente con manteca de cerdo y chicharrón crocante, servido con generosa porción de cecina ahumada traída directamente de Tarapoto.',
      badge: 'Especialidad',
      image: '/imagenes/categorias/adicionales/banner.webp',
      stock: 35,
      available: true
    },
    {
      id: 'C0005_P01',
      code: 'C0005_P01',
      name: 'Alitas Broaster BBQ Amazónica (6 und)',
      category_id: 'alitas',
      category: 'Alitas',
      categoryBadge: 'Alitas Crocantes',
      price: 21.00,
      originalPrice: 25.00,
      description: '6 crujientes alitas broaster bañadas en nuestra salsa BBQ artesanal con toque de camu camu. Incluye papas fritas y bastones frescos.',
      badge: 'Para Compartir',
      image: '/imagenes/categorias/alitas/banner.webp',
      stock: 40,
      available: true
    },
    {
      id: 'C0003_P01',
      code: 'C0003_P01',
      name: 'Refresco Natural de Cocona (1 Litro)',
      category_id: 'bebidas',
      category: 'Bebidas y Refrescos',
      categoryBadge: 'Bebida Helada',
      price: 8.50,
      description: 'Refresco natural de cocona fresca de la selva peruana, endulzado ligeramente y servido bien frío en envase sellado.',
      badge: 'Refrescante',
      image: '/imagenes/categorias/bebidas/banner.webp',
      stock: 60,
      available: true
    }
  ];

  let currentProduct = null;
  let currentQuantity = 1;
  let selectedSauces = new Set(['mayonesa', 'mostaza', 'ketchup', 'rocoto']);
  let selectedAccompaniment = 'papas';
  let extraAccPrice = 0;

  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || '';
  }

  function formatPrice(val) {
    return `S/ ${Number(val || 0).toFixed(2)}`;
  }

  // Carga inicial del producto
  async function initProductPage() {
    updateCartCount();

    const targetId = getQueryParam('id') || getQueryParam('code') || getQueryParam('producto');
    let product = null;

    try {
      if (targetId) {
        // Intento 1: buscar por ID específico
        const res = await fetch(`/api/products/${encodeURIComponent(targetId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            product = json.data;
          }
        }
      }

      if (!product) {
        // Intento 2: obtener lista completa
        const resAll = await fetch('/api/products');
        if (resAll.ok) {
          const jsonAll = await resAll.json();
          const list = jsonAll.data || [];
          if (targetId) {
            product = list.find(p => p.id === targetId || p.code === targetId || String(p.id).toLowerCase() === targetId.toLowerCase());
          }
          if (!product && list.length > 0) {
            product = list[0];
          }
        }
      }
    } catch (err) {
      console.warn('Uso de fallback local para producto:', err);
    }

    if (!product) {
      product = FALLBACK_PRODUCTS.find(p => p.id === targetId || p.code === targetId) || FALLBACK_PRODUCTS[0];
    }

    currentProduct = product;
    renderProductDetail(product);
    loadRelatedProducts(product);
    setupEventListeners();
  }

  function renderProductDetail(p) {
    document.title = `${p.name} | BuchiSapa Restaurante`;

    // Breadcrumbs
    const bcCat = document.getElementById('bc-category');
    const bcName = document.getElementById('bc-name');
    if (bcCat) bcCat.textContent = p.category || p.categoryBadge || 'Platos';
    if (bcName) bcName.textContent = p.name;

    // Imagen
    const imgEl = document.getElementById('prod-img');
    if (imgEl) {
      imgEl.src = p.image || '/imagenes/categorias/broaster/banner.webp';
      imgEl.alt = p.name;
    }

    // Badges
    const badgeEl = document.getElementById('prod-badge-floating');
    if (badgeEl) {
      badgeEl.textContent = p.badge || 'Receta Especial BuchiSapa';
    }

    const stockText = document.getElementById('prod-stock-text');
    const stockDot = document.getElementById('prod-stock-dot');
    if (stockText) {
      const isAvailable = p.available !== false && (typeof p.stock !== 'number' || p.stock > 0);
      stockText.textContent = isAvailable ? 'Disponible al instante' : 'Agotado en Cocina';
      if (stockDot) {
        stockDot.style.background = isAvailable ? '#10b981' : '#ef4444';
      }
    }

    // Textos principales
    const catEl = document.getElementById('prod-cat-pill');
    if (catEl) catEl.textContent = p.categoryBadge || p.category || 'Pollería Gourmet';

    const titleEl = document.getElementById('prod-title');
    if (titleEl) titleEl.textContent = p.name;

    const descEl = document.getElementById('prod-desc');
    if (descEl) descEl.textContent = p.description || 'Preparado al momento con los mejores ingredientes y la sazón auténtica de BuchiSapa.';

    // Precios
    const priceEl = document.getElementById('prod-price-current');
    if (priceEl) priceEl.textContent = formatPrice(p.price);

    const origEl = document.getElementById('prod-price-original');
    if (origEl) {
      if (p.originalPrice && p.originalPrice > p.price) {
        origEl.textContent = formatPrice(p.originalPrice);
        origEl.style.display = 'inline';
      } else {
        origEl.style.display = 'none';
      }
    }

    // Renderizar Salsas
    renderSaucesSection(p);

    // Renderizar Acompañamientos
    renderAccompanimentsSection(p);

    // Actualizar totales
    updateTotalPrice();
  }

  function isDrinkOrNoSauce(p) {
    const cat = String(p.category_id || p.category || '').toLowerCase();
    const name = String(p.name || '').toLowerCase();
    return cat.includes('bebida') || cat.includes('refresco') || cat.includes('infusion') || name.includes('agua') || name.includes('gaseosa');
  }

  function renderSaucesSection(p) {
    const box = document.getElementById('sauces-box');
    const wrap = document.getElementById('sauces-chips-wrap');
    if (!box || !wrap) return;

    if (isDrinkOrNoSauce(p)) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';
    wrap.innerHTML = '';

    SAUCES_LIST.forEach(sauce => {
      const label = document.createElement('label');
      label.className = `sauce-chip-label ${selectedSauces.has(sauce.id) ? 'active' : ''}`;
      label.innerHTML = `
        <input type="checkbox" class="sauce-chip-checkbox" value="${sauce.id}" ${selectedSauces.has(sauce.id) ? 'checked' : ''}>
        <span>${sauce.name}</span>
      `;

      label.addEventListener('click', (e) => {
        e.preventDefault();
        if (selectedSauces.has(sauce.id)) {
          selectedSauces.delete(sauce.id);
          label.classList.remove('active');
        } else {
          selectedSauces.add(sauce.id);
          label.classList.add('active');
        }
      });

      wrap.appendChild(label);
    });
  }

  function renderAccompanimentsSection(p) {
    const box = document.getElementById('accompaniments-box');
    const wrap = document.getElementById('options-chips-wrap');
    if (!box || !wrap) return;

    if (isDrinkOrNoSauce(p)) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';
    wrap.innerHTML = '';

    const catKey = String(p.category_id || '').toLowerCase();
    let options = ACCOMPANIMENTS_MAP[catKey] || ACCOMPANIMENTS_MAP.default;
    if (catKey.includes('broaster')) options = ACCOMPANIMENTS_MAP.broaster;
    if (catKey.includes('selva') || catKey.includes('amazon')) options = ACCOMPANIMENTS_MAP.amazonico;

    options.forEach((opt, idx) => {
      const card = document.createElement('label');
      const isSelected = idx === 0;
      card.className = `option-radio-card ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <input type="radio" name="acc_option" value="${opt.id}" data-price="${opt.price || 0}" ${isSelected ? 'checked' : ''}>
        <span class="option-radio-text">${opt.name}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.option-radio-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedAccompaniment = opt.id;
        extraAccPrice = opt.price || 0;
        updateTotalPrice();
      });

      wrap.appendChild(card);
    });
  }

  function updateTotalPrice() {
    if (!currentProduct) return;
    const unitPrice = Number(currentProduct.price || 0) + extraAccPrice;
    const total = unitPrice * currentQuantity;

    const btnPriceText = document.getElementById('add-btn-total-text');
    if (btnPriceText) btnPriceText.textContent = `• ${formatPrice(total)}`;

    const mobilePrice = document.getElementById('mobile-bar-total');
    if (mobilePrice) mobilePrice.textContent = formatPrice(total);

    const qtyDisplay = document.getElementById('qty-num');
    if (qtyDisplay) qtyDisplay.textContent = String(currentQuantity);
  }

  function setupEventListeners() {
    // Stepper
    const btnMinus = document.getElementById('qty-btn-minus');
    const btnPlus = document.getElementById('qty-btn-plus');

    if (btnMinus) {
      btnMinus.addEventListener('click', () => {
        if (currentQuantity > 1) {
          currentQuantity--;
          updateTotalPrice();
        }
      });
    }

    if (btnPlus) {
      btnPlus.addEventListener('click', () => {
        if (currentQuantity < 20) {
          currentQuantity++;
          updateTotalPrice();
        }
      });
    }

    // Agregar al carrito
    const btnAdd = document.getElementById('btn-add-to-cart');
    const btnAddMobile = document.getElementById('btn-add-to-cart-mobile');

    const handleAddToCart = () => {
      if (!currentProduct) return;

      const notesInput = document.getElementById('special-notes');
      const notes = notesInput ? notesInput.value.trim() : '';
      const saucesArray = Array.from(selectedSauces).map(sId => {
        const found = SAUCES_LIST.find(s => s.id === sId);
        return found ? found.name : sId;
      });

      // Añadir mediante BuchisapaCart si está cargado
      if (window.BuchisapaCart && typeof window.BuchisapaCart.addItem === 'function') {
        window.BuchisapaCart.addItem(currentProduct, currentQuantity, saucesArray, notes);
      } else {
        // Fallback directo a localStorage
        const cartKey = 'buchisapa_cart_v1';
        let items = [];
        try {
          items = JSON.parse(localStorage.getItem(cartKey) || '[]');
        } catch (e) { items = []; }

        items.push({
          id: currentProduct.id,
          name: currentProduct.name,
          price: currentProduct.price,
          quantity: currentQuantity,
          image: currentProduct.image,
          categoryBadge: currentProduct.categoryBadge || currentProduct.category,
          sauces: saucesArray,
          notes: notes
        });

        localStorage.setItem(cartKey, JSON.stringify(items));
      }

      showAddToast(currentProduct.name, currentQuantity);
      updateCartCount();

      // Animación en el botón
      if (btnAdd) {
        btnAdd.style.transform = 'scale(0.96)';
        setTimeout(() => btnAdd.style.transform = '', 150);
      }
    };

    if (btnAdd) btnAdd.addEventListener('click', handleAddToCart);
    if (btnAddMobile) btnAddMobile.addEventListener('click', handleAddToCart);

    // Botón de WhatsApp Directo
    const btnWs = document.getElementById('btn-ws-order');
    if (btnWs) {
      btnWs.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentProduct) return;
        const saucesStr = Array.from(selectedSauces).map(s => {
          const f = SAUCES_LIST.find(x => x.id === s);
          return f ? f.name : s;
        }).join(', ');

        const text = `Hola BuchiSapa, deseo pedir:
*${currentQuantity}x ${currentProduct.name}* (${formatPrice(currentProduct.price * currentQuantity)})
${saucesStr ? `*Cremas:* ${saucesStr}` : ''}
¿Podrían confirmarme la disponibilidad y tiempo de entrega por favor?`;

        window.open(`https://wa.me/51943312024?text=${encodeURIComponent(text)}`, '_blank');
      });
    }

    // Compartir por WhatsApp
    const btnShareWs = document.getElementById('btn-share-whatsapp');
    if (btnShareWs) {
      btnShareWs.addEventListener('click', () => {
        if (!currentProduct) return;
        const text = `¡Mira este delicioso plato en BuchiSapa! 🍗🔥 *${currentProduct.name}* a solo ${formatPrice(currentProduct.price)}: ${window.location.href}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      });
    }

    // Copiar enlace
    const btnCopyLink = document.getElementById('btn-copy-link');
    if (btnCopyLink) {
      btnCopyLink.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('¡Enlace del plato copiado al portapapeles!');
        }).catch(() => {
          prompt('Copia el enlace:', window.location.href);
        });
      });
    }
  }

  function showAddToast(prodName, qty) {
    let toast = document.getElementById('producto-add-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'producto-add-toast';
      toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: #0f172a;
        color: #ffffff;
        padding: 14px 20px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 100000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: inherit;
        border-left: 4px solid #10b981;
        transition: transform 0.25s ease, opacity 0.25s ease;
        transform: translateY(-20px);
        opacity: 0;
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span style="font-size: 22px;">✅</span>
      <div>
        <div style="font-size: 14px; font-weight: 800;">¡Agregado al Carrito!</div>
        <div style="font-size: 12px; color: #94a3b8;">${qty}x ${prodName}</div>
      </div>
    `;

    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(-20px)';
      toast.style.opacity = '0';
    }, 2800);
  }

  function updateCartCount() {
    let count = 0;
    try {
      const items = JSON.parse(localStorage.getItem('buchisapa_cart_v1') || '[]');
      count = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    } catch (e) { count = 0; }

    const badges = document.querySelectorAll('.clean-cart-badge, .cart-count-badge');
    badges.forEach(b => {
      b.textContent = String(count);
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  async function loadRelatedProducts(current) {
    const grid = document.getElementById('related-grid');
    if (!grid) return;

    let items = [];
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        items = (json.data || []).filter(p => p.id !== current.id);
      }
    } catch (e) {
      items = FALLBACK_PRODUCTS.filter(p => p.id !== current.id);
    }

    if (items.length === 0) {
      items = FALLBACK_PRODUCTS.filter(p => p.id !== current.id);
    }

    // Tomar 4 productos
    const toShow = items.slice(0, 4);
    grid.innerHTML = '';

    toShow.forEach(item => {
      const card = document.createElement('a');
      card.href = `/producto?id=${encodeURIComponent(item.id || item.code)}`;
      card.className = 'related-card';
      card.innerHTML = `
        <div class="related-card-img-wrap">
          <img src="${item.image || '/imagenes/categorias/broaster/banner.webp'}" alt="${item.name}" class="related-card-img" loading="lazy">
        </div>
        <div class="related-card-body">
          <span class="related-card-cat">${item.category || item.categoryBadge || 'BuchiSapa'}</span>
          <h4 class="related-card-title">${item.name}</h4>
          <span class="related-card-price">${formatPrice(item.price)}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Inicialización
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductPage);
  } else {
    initProductPage();
  }
})();
