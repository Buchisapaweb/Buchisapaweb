(function() {
  function closeProductDetailModal() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
      modal.classList.remove('open', 'active');
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  window.closeProductDetailModal = closeProductDetailModal;
})();
