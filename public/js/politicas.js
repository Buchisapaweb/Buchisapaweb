(function() {
  function initPoliticas() {
    const currentPath = window.location.pathname.toLowerCase();
    const tabs = document.querySelectorAll('.politicas-tab-pill');
    
    tabs.forEach(tab => {
      const href = tab.getAttribute('href')?.toLowerCase();
      if (href && (currentPath === href || currentPath.endsWith(href))) {
        tab.classList.add('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPoliticas);
  } else {
    initPoliticas();
  }
})();
