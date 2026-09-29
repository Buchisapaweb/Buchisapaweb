/**
 * BUCHISAPA - PÁGINA OFICIAL DE PROMOCIONES (JS)
 * (public/js/promociones.js)
 * Catálogo fiel a la captura de referencia, integración con carrito y modal VER MÁS
 */

const OFFICIAL_PROMOTIONS = [
  {
    id: 'promo-1',
    name: 'Promoción Tú Eliges con Gaseosa 1.5 LT.',
    price: 90.90,
    originalPrice: 105.00,
    shortDesc: '1 Pardos Brasa + papas fritas + guarnición + Inca Kola sin azúcar de 1.5. LT. Esta Promoció...',
    fullDesc: '1 Pardos Brasa + papas fritas + guarnición + Inca Kola sin azúcar de 1.5 LT. Esta Promoción incluye ensalada fresca o cocida a elección, cremas caseras (ají de pollería, mayonesa y tártara).',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/portada/Portada2E.webp',
    category_id: 'promociones',
    includes_sauces: true
  },
  {
    id: 'promo-2',
    name: 'Promoción Tu Chicha 1.5 LT.',
    price: 95.50,
    originalPrice: 110.00,
    shortDesc: '1 Pardos Brasa + papas fritas + guarnición + botella de chicha de 1.5 LT. Esta Promoción in...',
    fullDesc: '1 Pardos Brasa + papas fritas + guarnición + botella de chicha morada natural de 1.5 LT. Esta Promoción incluye ensalada fresca o cocida a elección, cremas caseras de la casa.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/portada/Portada1E.webp',
    category_id: 'promociones',
    includes_sauces: true
  },
  {
    id: 'promo-3',
    name: 'Promoción Tú Eliges con Gaseosa 2.25 LT.',
    price: 95.50,
    originalPrice: 112.00,
    shortDesc: '1 Pardos Brasa + papas fritas + guarnición + Inca Kola sin azúcar de 2.25 LT. Esta Promoci...',
    fullDesc: '1 Pardos Brasa + papas fritas + guarnición + Inca Kola sin azúcar de 2.25 LT. Esta Promoción incluye ensalada regular y variedad de salsas artesanales a elección.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/portada/Portada3E.webp',
    category_id: 'promociones',
    includes_sauces: true
  },
  {
    id: 'promo-4',
    name: 'Promoción Para 2',
    price: 57.90,
    originalPrice: 68.00,
    shortDesc: '1/2 Pardos Brasa + papas fritas + ensalada regular + 2 bebidas personales. Esta Promoción in...',
    fullDesc: '1/2 Pardos Brasa + papas fritas + ensalada regular + 2 bebidas personales heladas. Esta Promoción incluye selección de salsas y cremas de la casa.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/portada/Portada4E.webp',
    category_id: 'promociones',
    includes_sauces: true
  },
  {
    id: 'promo-5',
    name: 'Promoción Brasa Para Mí',
    price: 35.90,
    originalPrice: 42.00,
    shortDesc: '1/4 Pardos Brasa + papas fritas + guarnición de ensalada Pardos + bebida personal. Esta Pro...',
    fullDesc: '1/4 Pardos Brasa + papas fritas + guarnición de ensalada Pardos + bebida personal helada. Esta Promoción incluye cremas de la casa.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/categorias/broaster/banner.webp',
    category_id: 'promociones',
    includes_sauces: true
  },
  {
    id: 'promo-6',
    name: 'Parrillero Original Para Mí',
    price: 38.50,
    originalPrice: 45.00,
    shortDesc: '1/4 Pardos Parrillero original con papas fritas y guarnición de ensalada Pardos + bebida per...',
    fullDesc: '1/4 Pardos Parrillero original a la brasa con papas fritas crocantes, guarnición de ensalada fresca y bebida personal helada.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/categorias/hamburguesas/banner.webp',
    category_id: 'promociones',
    includes_sauces: true
  },
  {
    id: 'promo-7',
    name: 'Promoción Chicharrón Para Mí',
    price: 38.50,
    originalPrice: 45.00,
    shortDesc: '5 unidades de chicharrón + papas fritas o doradas + guarnición de ensalada Pardos + bebida p...',
    fullDesc: '5 unidades de chicharrón crujiente + papas fritas o doradas + guarnición de ensalada fresca + bebida personal helada.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/categorias/alitas/banner.webp',
    category_id: 'promociones',
    includes_sauces: true
  },
  {
    id: 'promo-8',
    name: 'Parrillero BBQ Para Mí',
    price: 39.50,
    originalPrice: 46.00,
    shortDesc: '1/4 Pardos Parrillero bbq con papas fritas y guarnición de ensalada Pardos + bebida personal...',
    fullDesc: '1/4 Pardos Parrillero bañado en salsa BBQ ahumada con papas fritas, guarnición de ensalada fresca y bebida personal helada.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
    fallbackImg: '/imagenes/categorias/salchipapas-y-salchibroasters/banner.webp',
    category_id: 'promociones',
    includes_sauces: true
  }
];

document.addEventListener('DOMContentLoaded', () => {
  renderPromocionesGrid();
});

function renderPromocionesGrid(customContainer) {
  const container = customContainer || document.getElementById('promociones-cards-container');
  if (!container) return;

  container.innerHTML = OFFICIAL_PROMOTIONS.map((promo, idx) => {
    return `
      <article class="promo-item-card" id="card-${promo.id}">
        <div class="promo-item-img-box">
          <img 
            src="${promo.image}" 
            alt="${escapeHtml(promo.name)}" 
            class="promo-item-img"
            loading="${idx < 4 ? 'eager' : 'lazy'}"
            onerror="this.onerror=null; this.src='${promo.fallbackImg}';"
          >
        </div>
        <div class="promo-item-body">
          <h2 class="promo-item-title">${escapeHtml(promo.name)}</h2>
          <p class="promo-item-desc">
            ${escapeHtml(promo.shortDesc)}
            <button type="button" class="promo-ver-mas-inline" onclick="openPromoModal('${promo.id}')">VER MÁS</button>
          </p>
          <div class="promo-item-footer">
            <span class="promo-item-price">S/ ${promo.price.toFixed(2)}</span>
            <button 
              type="button" 
              class="promo-btn-agregar" 
              onclick="addPromoDirectlyToCart('${promo.id}')"
              aria-label="Agregar ${escapeHtml(promo.name)} al carrito"
            >
              <svg class="promo-basket-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function addPromoDirectlyToCart(promoId) {
  const promo = OFFICIAL_PROMOTIONS.find(p => p.id === promoId);
  if (!promo) return;

  const productData = {
    id: promo.id,
    name: promo.name,
    price: promo.price,
    image: promo.image,
    category: 'PROMOCIONES',
    category_id: 'promociones',
    includes_sauces: promo.includes_sauces
  };

  // Si existe BuchisapaCart, agregar directamente
  if (window.BuchisapaCart && typeof window.BuchisapaCart.addItem === 'function') {
    window.BuchisapaCart.addItem(productData, 1);
    if (typeof window.BuchisapaCart.openDrawer === 'function') {
      window.BuchisapaCart.openDrawer();
    }
  } else {
    // Si estamos en página independiente sin el objeto montado en memoria, guardar en localStorage y redirigir con apertura
    try {
      const existing = JSON.parse(localStorage.getItem('buchisapa_cart_items') || '[]');
      const foundIdx = existing.findIndex(it => (it.product && it.product.id === promo.id) || it.id === promo.id);
      if (foundIdx > -1) {
        existing[foundIdx].quantity = (existing[foundIdx].quantity || 1) + 1;
      } else {
        existing.push({
          id: promo.id,
          product: productData,
          quantity: 1,
          selectedSauces: ['Ají de Pollería Clásico', 'Mayonesa de la Casa'],
          sauces: ['Ají de Pollería Clásico', 'Mayonesa de la Casa']
        });
      }
      localStorage.setItem('buchisapa_cart_items', JSON.stringify(existing));
      sessionStorage.setItem('buchisapa_open_cart_on_load', 'true');
      window.location.href = '/?openCart=true';
    } catch (e) {
      window.location.href = '/';
    }
  }
}

function openPromoModal(promoId) {
  const promo = OFFICIAL_PROMOTIONS.find(p => p.id === promoId);
  if (!promo) return;

  const modal = document.getElementById('promo-detail-modal');
  const img = document.getElementById('promo-modal-image');
  const title = document.getElementById('promo-modal-title');
  const desc = document.getElementById('promo-modal-description');
  const price = document.getElementById('promo-modal-price');
  const addBtn = document.getElementById('promo-modal-add-btn');

  if (img) {
    img.src = promo.image;
    img.onerror = () => { img.src = promo.fallbackImg; };
  }
  if (title) title.textContent = promo.name;
  if (desc) desc.textContent = promo.fullDesc;
  if (price) price.textContent = `S/ ${promo.price.toFixed(2)}`;

  if (addBtn) {
    addBtn.onclick = () => {
      addPromoDirectlyToCart(promo.id);
      closePromoModal();
    };
  }

  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closePromoModal() {
  const modal = document.getElementById('promo-detail-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.OFFICIAL_PROMOTIONS = OFFICIAL_PROMOTIONS;
window.addPromoDirectlyToCart = addPromoDirectlyToCart;
window.openPromoModal = openPromoModal;
window.closePromoModal = closePromoModal;
window.escapeHtml = escapeHtml;
window.renderPromocionesGrid = renderPromocionesGrid;
