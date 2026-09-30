(function() {
  let currentProductDetail = null;
  let currentCustomizerQty = 1;

  function openProductDetailModal(productOrId) {
    let product = typeof productOrId === 'object' ? productOrId : null;
    if (!product && typeof window.productsData !== 'undefined') {
      product = window.productsData.find(p => String(p.id) === String(productOrId));
    }
    if (!product && typeof window.allMenuProducts !== 'undefined') {
      product = window.allMenuProducts.find(p => String(p.id) === String(productOrId));
    }

    if (!product) return;
    currentProductDetail = product;
    currentCustomizerQty = 1;

    const modal = document.getElementById('product-detail-modal');
    const imgEl = document.getElementById('customizer-product-img');
    const nameEl = document.getElementById('customizer-product-name');
    const descEl = document.getElementById('customizer-product-desc');
    const priceEl = document.getElementById('customizer-product-price');
    const totalPriceEl = document.getElementById('customizer-total-price');
    const qtyEl = document.getElementById('customizer-qty-display');

    if (imgEl) imgEl.src = product.imagen_url || product.imagen || '/imagenes/logo/logo-buchisapa.webp';
    if (nameEl) nameEl.textContent = product.nombre;
    if (descEl) descEl.textContent = product.descripcion || '';
    if (priceEl) priceEl.textContent = `S/ ${Number(product.precio || 0).toFixed(2)}`;
    if (totalPriceEl) totalPriceEl.textContent = `S/ ${Number(product.precio || 0).toFixed(2)}`;
    if (qtyEl) qtyEl.textContent = '1';

    loadSaucesList();

    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('open', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProductDetailModal() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
      modal.classList.remove('open', 'active');
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function loadSaucesList() {
    const list = document.getElementById('customizer-sauces-list');
    if (!list) return;

    const sauces = [
      'Mayonesa tradicional',
      'Mostaza',
      'Kétchup',
      'Ají de la casa (picante)',
      'Tártara',
      'Golf especial',
      'Chimichurri selvático',
      'Crema de rocoto'
    ];

    list.innerHTML = sauces.map((sauce, idx) => `
      <label class="sauce-checkbox-label">
        <input type="checkbox" name="customizer_sauces" value="${sauce}" ${idx < 3 ? 'checked' : ''}>
        <span>${sauce}</span>
      </label>
    `).join('');
  }

  function customizerChangeQty(delta) {
    const newQty = currentCustomizerQty + delta;
    if (newQty < 1) return;
    currentCustomizerQty = newQty;

    const qtyEl = document.getElementById('customizer-qty-display');
    const totalPriceEl = document.getElementById('customizer-total-price');
    if (qtyEl) qtyEl.textContent = String(currentCustomizerQty);

    if (currentProductDetail && totalPriceEl) {
      const total = Number(currentProductDetail.precio || 0) * currentCustomizerQty;
      totalPriceEl.textContent = `S/ ${total.toFixed(2)}`;
    }
  }

  function customizerSubmitAddToCart() {
    if (!currentProductDetail) return;

    const selectedSauces = Array.from(document.querySelectorAll('input[name="customizer_sauces"]:checked'))
      .map(cb => cb.value);
    const notes = (document.getElementById('customizer-notes-input')?.value || '').trim();

    if (window.BuchisapaCart && typeof window.BuchisapaCart.addItem === 'function') {
      window.BuchisapaCart.addItem({
        id: currentProductDetail.id,
        nombre: currentProductDetail.nombre,
        precio: currentProductDetail.precio,
        imagen: currentProductDetail.imagen_url || currentProductDetail.imagen,
        cantidad: currentCustomizerQty,
        salsas: selectedSauces,
        indicaciones: notes
      });
    }

    closeProductDetailModal();
    if (window.BuchisapaCart && typeof window.BuchisapaCart.openDrawer === 'function') {
      window.BuchisapaCart.openDrawer();
    }
  }

  window.openProductDetailModal = openProductDetailModal;
  window.closeProductDetailModal = closeProductDetailModal;
  window.customizerChangeQty = customizerChangeQty;
  window.customizerSubmitAddToCart = customizerSubmitAddToCart;
})();
