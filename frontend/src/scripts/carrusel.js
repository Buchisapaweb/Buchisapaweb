(function () {
  'use strict';

  function initHeroCarousel() {
    const track = document.getElementById('hero-carousel-track');
    const dotsContainer = document.getElementById('carousel-dots-container');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    if (slides.length === 0) return;

    let currentIndex = 0;
    let intervalId = null;

    function updateCarousel(index) {
      // Asegurar que el index esté en rango
      if (index >= slides.length) index = 0;
      if (index < 0) index = slides.length - 1;
      currentIndex = index;

      // Desplazar el track
      const offset = -currentIndex * 100;
      track.style.transform = `translateX(${offset}%)`;

      // Actualizar dots
      const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });

      // Actualizar clases active en slides por si se usan para animaciones internas
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentIndex);
      });
    }

    function nextSlide() {
      updateCarousel(currentIndex + 1);
    }

    function startAutoSlide() {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(nextSlide, 5000); // 5 segundos por slide
    }

    function stopAutoSlide() {
      if (intervalId) clearInterval(intervalId);
    }

    // Eventos para los puntos (dots)
    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.carousel-dot');
        if (!dot) return;
        const index = parseInt(dot.dataset.slide, 10);
        updateCarousel(index);
        startAutoSlide(); // Reiniciar el timer al interactuar
      });
    }

    // Swipe para móviles (simple)
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
      } else if (touchEndX - touchStartX > 50) {
        updateCarousel(currentIndex - 1);
      }
      startAutoSlide();
    }, { passive: true });

    // Inicializar
    updateCarousel(0);
    startAutoSlide();

    // Pausar al perder foco para ahorrar recursos
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoSlide();
      else startAutoSlide();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCarousel);
  } else {
    initHeroCarousel();
  }
})();
