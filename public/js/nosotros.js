(function() {
  function initNosotros() {
    // Detect current path to highlight active subnav tab
    const currentPath = window.location.pathname.toLowerCase();
    const tabs = document.querySelectorAll('.nosotros-tab-pill');
    
    tabs.forEach(tab => {
      const href = tab.getAttribute('href')?.toLowerCase();
      if (href && (currentPath === href || currentPath.endsWith(href))) {
        tab.classList.add('active');
      } else if (href === '/nosotros' && (currentPath === '/' || currentPath === '')) {
        tab.classList.remove('active');
      }
    });

    // Reveal animations on scroll
    const cards = document.querySelectorAll('.nosotros-section-block, .nosotros-value-card');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        observer.observe(card);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNosotros);
  } else {
    initNosotros();
  }
})();
