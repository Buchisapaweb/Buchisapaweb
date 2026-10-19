/**
 * RESTAURANTE BUCHISAPA - LÓGICA Y DESLIZAMIENTO DE PORTADA/CARRUSEL (carrusel-portada.js)
 * Maneja el deslizamiento automático, botones de navegación, puntos indicadores y gestos táctiles (swipe).
 */

(function () {
  'use strict';

  let carouselTrack = null;
  let slides = [];
  let dots = [];
  let prevBtn = null;
  let nextBtn = null;
  let currentIndex = 0;
  let autoSlideTimer = null;
  let touchStartX = 0;
  let touchEndX = 0;
  const AUTO_INTERVAL = 4000; // 4 segundos entre diapositivas

  function updateCarousel() {
    if (!carouselTrack || slides.length === 0) return;

    // Ajustar límites de índice
    if (currentIndex < 0) currentIndex = slides.length - 1;
    if (currentIndex >= slides.length) currentIndex = 0;

    // Aplicar desplazamiento suave en el riel
    carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Actualizar clases activas en slides
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Actualizar estados activos en puntos
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-current', 'false');
      }
    });
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex--;
    updateCarousel();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      nextSlide();
    }, AUTO_INTERVAL);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  function handleTouchStart(e) {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
    }
  }

  function handleTouchEnd(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      // Umbral de 40px para detectar deslice
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        resetAutoSlide();
      }
    }
  }

  function initCarousel() {
    const container = document.querySelector('.hero-carousel-container');
    if (!container) return;

    carouselTrack = document.getElementById('hero-carousel-track') || container.querySelector('.carousel-track');
    if (!carouselTrack) return;

    slides = Array.from(container.querySelectorAll('.carousel-slide'));
    dots = Array.from(container.querySelectorAll('.carousel-dot'));
    prevBtn = container.querySelector('[data-carousel-prev]') || container.querySelector('.carousel-arrow-prev');
    nextBtn = container.querySelector('[data-carousel-next]') || container.querySelector('.carousel-arrow-next');

    if (slides.length === 0) return;

    // Eventos para botones
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        resetAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        resetAutoSlide();
      });
    }

    // Eventos para puntos indicadores
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
        resetAutoSlide();
      });
    });

    // Soporte táctil en dispositivos móviles
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Pausar al pasar el cursor o enfocarlo
    container.addEventListener('mouseenter', stopAutoSlide);
    container.addEventListener('mouseleave', startAutoSlide);
    container.addEventListener('focusin', stopAutoSlide);
    container.addEventListener('focusout', startAutoSlide);

    // Navegación con teclado (Flechas izquierda y derecha)
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoSlide();
      }
    });

    // Iniciar con la primera diapositiva y activar temporizador
    currentIndex = 0;
    updateCarousel();
    startAutoSlide();
  }

  // Inicializar al cargar el DOM o si ya está disponible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }

  // Exponer API global por si se requiere reinicializar
  window.BuchisapaCarousel = {
    init: initCarousel,
    next: nextSlide,
    prev: prevSlide,
    goTo: goToSlide
  };
})();
