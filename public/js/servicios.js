/* =========================================================
   BUCHISAPA - PÁGINA INDEPENDIENTE: SERVICIOS (JS)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.servicios-menu-item').forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.servicios-section-block').forEach(sec => {
    observer.observe(sec);
  });
});
