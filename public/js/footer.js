(function() {
  function initFooterAccordions() {
    const isMobile = window.innerWidth < 768;
    const accordions = document.querySelectorAll('.footer-accordion-item');
    accordions.forEach(acc => {
      if (isMobile) {
        acc.removeAttribute('open');
      } else {
        acc.setAttribute('open', '');
      }
    });
  }

  window.addEventListener('resize', initFooterAccordions);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterAccordions);
  } else {
    initFooterAccordions();
  }
})();
