(function() {
  function renderProductCard(product) {
    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
    const imageSrc = product.imagen_url || product.imagen || '/imagenes/logo/logo-buchisapa.webp';
    const priceFormatted = Number(product.precio || 0).toFixed(2);

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="product-img-wrapper" onclick="openProductCustomizer('${product.id}')">
          <img src="${imageSrc}" alt="${product.nombre}" class="product-img" loading="lazy">
          ${product.popular ? '<span class="product-popular-badge">POPULAR</span>' : ''}
        </div>
        <div class="product-info">
          <h3 class="product-name" onclick="openProductCustomizer('${product.id}')">${product.nombre}</h3>
          <p class="product-desc">${product.descripcion || ''}</p>
          <div class="product-footer">
            <span class="product-price">S/ ${priceFormatted}</span>
            <button 
              type="button" 
              class="product-add-btn" 
              onclick="openProductCustomizer('${product.id}')"
              ${isOutOfStock ? 'disabled' : ''}
            >
              ${isOutOfStock ? 'Agotado' : 'Pedir'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function openProductCustomizer(productId) {
    if (typeof window.openProductDetailModal === 'function') {
      window.openProductDetailModal(productId);
    } else if (typeof window.BuchisapaPersonalizador !== 'undefined') {
      window.BuchisapaPersonalizador.open(productId);
    }
  }

  window.renderProductCard = renderProductCard;
  window.openProductCustomizer = openProductCustomizer;
})();
