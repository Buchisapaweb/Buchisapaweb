/**
 * Carrusel principal de portadas BuchiSapa.
 * Autoplay accesible, navegación por puntos/flechas y gestos táctiles.
 */
(() => {
  'use strict';

  function initHeroCarousel() {
    const carousel = document.querySelector('.hero-carousel-container');
    const track = document.getElementById('hero-carousel-track');
    if (!carousel || !track || carousel.dataset.carouselReady === 'true') return;

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
    const previousButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    if (slides.length < 2) return;

    carousel.dataset.carouselReady = 'true';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
    let timer = null;
    let pointerStartX = null;
    let pointerStartY = null;
    let pointerId = null;
    const intervalMs = 5000;

    slides.forEach((slide, index) => {
      slide.setAttribute('aria-roledescription', 'diapositiva');
      slide.setAttribute('aria-label', `${index + 1} de ${slides.length}`);
    });

    function showSlide(index, announce = false) {
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = `translate3d(${-activeIndex * 100}%, 0, 0)`;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
        const image = slide.querySelector('img');
        if (image && active) image.loading = 'eager';
      });

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === activeIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });

      if (announce) {
        const live = carousel.querySelector('.carousel-status');
        if (live) live.textContent = `Portada ${activeIndex + 1} de ${slides.length}`;
      }
    }

    function stopAutoplay() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotion.matches || document.hidden || slides.length < 2) return;
      if (carousel.matches(':hover') || carousel.contains(document.activeElement)) return;
      timer = window.setInterval(() => showSlide(activeIndex + 1), intervalMs);
    }

    function goTo(index) {
      showSlide(index, true);
      startAutoplay();
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goTo(index));
    });
    if (previousButton) previousButton.addEventListener('click', () => goTo(activeIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => goTo(activeIndex + 1));

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', event => {
      if (!carousel.contains(event.relatedTarget)) startAutoplay();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });
    reducedMotion.addEventListener?.('change', startAutoplay);

    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
    });

    carousel.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerId = event.pointerId;
    }, { passive: true });

    carousel.addEventListener('pointerup', event => {
      if (pointerId !== event.pointerId || pointerStartX === null) return;
      const deltaX = event.clientX - pointerStartX;
      const deltaY = event.clientY - pointerStartY;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        goTo(activeIndex + (deltaX < 0 ? 1 : -1));
      }
      pointerStartX = pointerStartY = pointerId = null;
    }, { passive: true });
    carousel.addEventListener('pointercancel', () => {
      pointerStartX = pointerStartY = pointerId = null;
    }, { passive: true });

    showSlide(activeIndex);
    startAutoplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCarousel, { once: true });
  } else {
    initHeroCarousel();
  }
})();
