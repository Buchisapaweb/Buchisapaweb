(function() {
  function sendQuickWhatsApp() {
    const textEl = document.getElementById('quick-msg-input');
    const msg = (textEl?.value || '').trim();
    const finalMsg = msg ? msg : 'Hola BuchiSapa, quisiera hacer una consulta sobre la carta y delivery';
    const url = `https://wa.me/51943312024?text=${encodeURIComponent(finalMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  window.sendQuickWhatsApp = sendQuickWhatsApp;
})();
