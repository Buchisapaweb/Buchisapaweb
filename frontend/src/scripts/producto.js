/**
 * RESTAURANTE BUCHISAPA - LÓGICA DE DETALLE DE PRODUCTO (producto.js)
 * Carga dinámica del plato, personalizador de acompañamientos y cremas,
 * cálculo de precios en tiempo real y sincronización con el carrito BuchiSapa.
 */

(function () {
  'use strict';

  // Base de datos de salsas de la casa
  const SAUCES_LIST = [
    { id: 'mayonesa', nombre: 'Mayonesa Casera', default: true },
    { id: 'mostaza', nombre: 'Mostaza Clásica', default: true },
    { id: 'ketchup', nombre: 'Ketchup', default: true },
    { id: 'rocoto', nombre: 'Ají de Rocoto', default: true },
    { id: 'tartara', nombre: 'Tártara Especial', default: false },
    { id: 'charapita', nombre: 'Ají Charapita', default: false },
    { id: 'ocopa', nombre: 'Ocopa Arequipeña', default: false },
    { id: 'bbq', nombre: 'Salsa BBQ Ahumada', default: false },
    { id: 'vinagreta', nombre: 'Vinagreta de la Casa', default: false }
  ];

  // Acompañamientos comunes por categoría
  const ACCOMPANIMENTS_MAP = {
    broaster: [
      { id: 'papas', nombre: 'Papas Fritas Artesanales', default: true },
      { id: 'ensalada', nombre: 'Ensalada Fresca de Col y Zanahoria', default: true },
      { id: 'arroz_chaufa', nombre: 'Cambiar por Arroz Chaufa de la Selva (+S/ 3.00)', precio: 3.00, default: false }
    ],
    amazonico: [
      { id: 'tacacho', nombre: 'Tacacho Artesanal con Cecina', default: true },
      { id: 'patacones', nombre: 'Patacones de Plátano Bellaco', default: true },
      { id: 'salsa_criolla', nombre: 'Salsa Criolla Amazónica con Cocona', default: true }
    ],
    hamburguesa: [
      { id: 'papas', nombre: 'Papas Fritas Crocantes', default: true },
      { id: 'ensalada', nombre: 'Ensalada Fresca', default: false }
    ],
    alitas: [
      { id: 'papas', nombre: 'Papas Fritas Rústicas', default: true },
      { id: 'bastones', nombre: 'Bastones de Apio y Zanahoria', default: true }
    ],
    default: [
      { id: 'guarnicion', nombre: 'Porción estándar de la casa', default: true }
    ]
  };

  // Fallback de productos si el servidor está offline o cargando
  const FALLBACK_PRODUCTS = [
    {
      id: 'C0002_P01',
      code: 'C0002_P01',
      nombre: '1/4 Pollo Broaster BuchiSapa',
      id_categoria: 'broaster',
      categoria: 'Pollo Broaster',
      etiquetaCategoria: 'Broaster al Carbón',
      precio: 18.90,
      originalPrice: 22.00,
      descripcion: 'Crujiente presa de 1/4 de pollo broaster sazonada con nuestra receta secreta amazónica y frita al punto exacto. Acompañada de papas fritas artesanales, ensalada del día y selección de cremas.',
      etiqueta: 'Más Vendido 🔥',
      imagen: '/imagenes/categorias/broaster/banner.webp',
      stock: 50,
      disponible: true
    },
    {
      id: 'C0004_P01',
      code: 'C0004_P01',
      nombre: 'Tacacho con Cecina Especial',
      id_categoria: 'amazonico',
      categoria: 'Sabores Amazónicos',
      etiquetaCategoria: 'Tradición de la Selva',
      precio: 24.50,
      originalPrice: 28.00,
      descripcion: 'Plátano bellaco asado y majado artesanalmente con manteca de cerdo y chicharrón crocante, servido con generosa porción de cecina ahumada traída directamente de Tarapoto.',
      etiqueta: 'Especialidad',
      imagen: '/imagenes/categorias/adicionales/banner.webp',
      stock: 35,
      disponible: true
    },
    {
      id: 'C0005_P01',
      code: 'C0005_P01',
      nombre: 'Alitas Broaster BBQ Amazónica (6 und)',
      id_categoria: 'alitas',
      categoria: 'Alitas',
      etiquetaCategoria: 'Alitas Crocantes',
      precio: 21.00,
      originalPrice: 25.00,
      descripcion: '6 crujientes alitas broaster bañadas en nuestra salsa BBQ artesanal con toque de camu camu. Incluye papas fritas y bastones frescos.',
      etiqueta: 'Para Compartir',
      imagen: '/imagenes/categorias/alitas/banner.webp',
      stock: 40,
      disponible: true
    },
    {
      id: 'C0003_P01',
      code: 'C0003_P01',
      nombre: 'Refresco Natural de Cocona (1 Litro)',
      id_categoria: 'bebidas',
      categoria: 'Bebidas y Refrescos',
      etiquetaCategoria: 'Bebida Helada',
      precio: 8.50,
      descripcion: 'Refresco natural de cocona fresca de la selva peruana, endulzado ligeramente y servido bien frío en envase sellado.',
      etiqueta: 'Refrescante',
      imagen: '/imagenes/categorias/bebidas/banner.webp',
      stock: 60,
      disponible: true
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
        const res = await fetch(`/api/productos/${encodeURIComponent(targetId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.exito && json.datos) {
            product = json.datos;
          }
        }
      }

      if (!product) {
        // Intento 2: obtener lista completa
        const resAll = await fetch('/api/productos');
        if (resAll.ok) {
          const jsonAll = await resAll.json();
          const list = jsonAll.datos || [];
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
    document.title = `${p.nombre} | BuchiSapa Restaurante`;

    // Breadcrumbs
    const bcCat = document.getElementById('bc-category');
    const bcName = document.getElementById('bc-name');
    if (bcCat) bcCat.textContent = p.categoria || p.categoriaBadge || 'Platos';
    if (bcName) bcName.textContent = p.nombre;

    // Imagen
    const imgEl = document.getElementById('prod-img');
    if (imgEl) {
      imgEl.src = p.imagen || '/imagenes/categorias/broaster/banner.webp';
      imgEl.alt = p.nombre;
    }

    // Badges
    const badgeEl = document.getElementById('prod-badge-floating');
    if (badgeEl) {
      badgeEl.textContent = p.etiqueta || 'Receta Especial BuchiSapa';
    }

    const stockText = document.getElementById('prod-stock-text');
    const stockDot = document.getElementById('prod-stock-dot');
    if (stockText) {
      const isAvailable = p.disponible !== false && (typeof p.stock !== 'number' || p.stock > 0);
      stockText.textContent = isAvailable ? 'Disponible al instante' : 'Agotado en Cocina';
      if (stockDot) {
        stockDot.style.background = isAvailable ? '#10b981' : '#ef4444';
      }
    }

    // Textos principales
    const catEl = document.getElementById('prod-cat-pill');
    if (catEl) catEl.textContent = p.categoriaBadge || p.categoria || 'Pollería Gourmet';

    const titleEl = document.getElementById('prod-title');
    if (titleEl) titleEl.textContent = p.nombre;

    const descEl = document.getElementById('prod-desc');
    if (descEl) {
      if (p.descripcion && p.descripcion.trim()) {
        descEl.textContent = p.descripcion.trim();
        descEl.style.display = 'block';
      } else {
        descEl.textContent = '';
        descEl.style.display = 'none';
      }
    }

    // Precios
    const priceEl = document.getElementById('prod-price-current');
    if (priceEl) priceEl.textContent = formatPrice(p.precio);

    const origEl = document.getElementById('prod-price-original');
    if (origEl) {
      if (p.originalPrice && p.originalPrice > p.precio) {
        origEl.textContent = formatPrice(p.originalPrice);
        origEl.style.display = 'inline';
      } else {
        origEl.style.display = 'none';
      }
    }

    // Actualizar totales
    updateTotalPrice();
  }

  function updateTotalPrice() {
    if (!currentProduct) return;
    const total = currentProduct.precio;

    const btnPriceText = document.getElementById('add-btn-total-text');
    if (btnPriceText) btnPriceText.textContent = `• ${formatPrice(total)}`;

    const mobilePrice = document.getElementById('mobile-bar-total');
    if (mobilePrice) mobilePrice.textContent = formatPrice(total);
  }

  function setupEventListeners() {
    // Agregar al carrito
    const btnAdd = document.getElementById('btn-add-to-cart');
    const btnAddMobile = document.getElementById('btn-add-to-cart-mobile');

    const handleAddToCart = () => {
      if (!currentProduct) return;

      // Añadir mediante BuchisapaCart si está cargado
      if (window.BuchisapaCart && typeof window.BuchisapaCart.addItem === 'function') {
        window.BuchisapaCart.addItem(currentProduct, 1, [], '');
      } else {
        // Fallback directo a localStorage
        const cartKey = 'buchisapa_cart_v1';
        let items = [];
        try {
          items = JSON.parse(localStorage.getItem(cartKey) || '[]');
        } catch (e) { items = []; }

        items.push({
          id: currentProduct.id,
          nombre: currentProduct.nombre,
          precio: currentProduct.precio,
          quantity: 1,
          imagen: currentProduct.imagen,
          etiquetaCategoria: currentProduct.categoriaBadge || currentProduct.categoria,
          sauces: [],
          notes: ''
        });

        localStorage.setItem(cartKey, JSON.stringify(items));
      }

      showAddToast(currentProduct.nombre, 1);
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

        const text = `Hola BuchiSapa, deseo pedir:
*1x ${currentProduct.nombre}* (${formatPrice(currentProduct.precio)})
¿Podrían confirmarme la disponibilidad y tiempo de entrega por favor?`;

        window.open(`https://wa.me/51943312024?text=${encodeURIComponent(text)}`, '_blank');
      });
    }

    // Compartir por WhatsApp
    const btnShareWs = document.getElementById('btn-share-whatsapp');
    if (btnShareWs) {
      btnShareWs.addEventListener('click', () => {
        if (!currentProduct) return;
        const text = `¡Mira este delicioso plato en BuchiSapa! 🍗🔥 *${currentProduct.nombre}* a solo ${formatPrice(currentProduct.precio)}: ${window.location.href}`;
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
      const res = await fetch('/api/productos');
      if (res.ok) {
        const json = await res.json();
        items = (json.datos || []).filter(p => p.id !== current.id);
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
          <img src="${item.imagen || '/imagenes/categorias/broaster/banner.webp'}" alt="${item.nombre}" class="related-card-img" loading="lazy">
        </div>
        <div class="related-card-body">
          <span class="related-card-cat">${item.categoria || item.categoriaBadge || 'BuchiSapa'}</span>
          <h4 class="related-card-title">${item.nombre}</h4>
          <span class="related-card-price">${formatPrice(item.precio)}</span>
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
