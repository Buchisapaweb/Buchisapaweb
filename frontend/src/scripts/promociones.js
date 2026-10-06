/**
 * BUCHISAPA - PÁGINA OFICIAL DE PROMOCIONES (JS)
 * (public/js/promociones.js)
 * Catálogo fiel a la captura de referencia, integración con carrito y modal VER MÁS
 */

const OFFICIAL_PROMOTIONS = [
  {
    "id": "PL00041",
    "code": "PL00041",
    "name": "PROMO BROASTER FAMILIAR",
    "price": 38,
    "originalPrice": 44,
    "shortDesc": "La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola.",
    "description": "La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola. / Acompañamientos: Papa crocante + Ensalada fresca + Arroz",
    "fullDesc": "La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola. / Acompañamientos: Papa crocante + Ensalada fresca + Arroz",
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "category_id": "C0008",
    "category": "PROMOCIONES",
    "includes_sauces": true
  },
  {
    "id": "PL00042",
    "code": "PL00042",
    "name": "PROMO BUCHI DUO",
    "price": 22,
    "originalPrice": 28,
    "shortDesc": "Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi.",
    "description": "Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi. / Acompañamientos: Papa crocante + Hamburguesa artesanal + Ensalada fresca",
    "fullDesc": "Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi. / Acompañamientos: Papa crocante + Hamburguesa artesanal + Ensalada fresca",
    "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80",
    "category_id": "C0008",
    "category": "PROMOCIONES",
    "includes_sauces": true
  },
  {
    "id": "PL00043",
    "code": "PL00043",
    "name": "PROMO SALCHI BURGER",
    "price": 24,
    "originalPrice": 30,
    "shortDesc": "La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola.",
    "description": "La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola. / Acompañamientos: Queso cheddar + Papa crocante + Ensalada fresca",
    "fullDesc": "La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola. / Acompañamientos: Queso cheddar + Papa crocante + Ensalada fresca",
    "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80",
    "category_id": "C0008",
    "category": "PROMOCIONES",
    "includes_sauces": true
  },
  {
    "id": "PL00044",
    "code": "PL00044",
    "name": "PROMO SELVA POWER",
    "price": 29,
    "originalPrice": 35,
    "shortDesc": "Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta.",
    "description": "Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta. / Acompañamientos: Maduros fritos + Sarza criolla + Papa crocante + Ensalada fresca",
    "fullDesc": "Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta. / Acompañamientos: Maduros fritos + Sarza criolla + Papa crocante + Ensalada fresca",
    "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    "category_id": "C0008",
    "category": "PROMOCIONES",
    "includes_sauces": true
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
