(function() {
  let currentSlide = 0;
  let totalSlides = 5;
  let carouselInterval = null;

  function goToSlide(index) {
    const track = document.getElementById('hero-carousel-track');
    const dotsContainer = document.getElementById('carousel-dots-container');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    totalSlides = slides.length || 5;

    if (index < 0) currentSlide = totalSlides - 1;
    else if (index >= totalSlides) currentSlide = 0;
    else currentSlide = index;

    track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startCarouselAutoplay() {
    stopCarouselAutoplay();
    carouselInterval = setInterval(nextSlide, 5000);
  }

  function stopCarouselAutoplay() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  function initHeroCarousel() {
    const track = document.getElementById('hero-carousel-track');
    const container = document.querySelector('.hero-carousel-container');
    if (!track || !container) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let isHorizontalDrag = null;

    function onDragStart(e) {
      isDragging = true;
      isHorizontalDrag = null;
      const touch = e.type && e.type.includes('touch') ? e.touches[0] : e;
      startX = touch ? touch.clientX : 0;
      startY = touch ? touch.clientY : 0;
      deltaX = 0;
      deltaY = 0;
      track.style.transition = 'none';
      stopCarouselAutoplay();
    }

    function onDragMove(e) {
      if (!isDragging) return;
      const touch = e.type && e.type.includes('touch') ? e.touches[0] : e;
      if (!touch) return;

      const currentX = touch.clientX;
      const currentY = touch.clientY;
      deltaX = currentX - startX;
      deltaY = currentY - startY;

      // Determinar la dirección dominante del gesto
      if (isHorizontalDrag === null) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          isHorizontalDrag = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }

      // Si el gesto es vertical (desplazarse hacia abajo/arriba en la página), cancelar drag y permitir scroll
      if (isHorizontalDrag === false) {
        isDragging = false;
        track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
        goToSlide(currentSlide);
        startCarouselAutoplay();
        return;
      }

      if (isHorizontalDrag === true) {
        const containerWidth = container.clientWidth || 1000;
        const baseOffset = -currentSlide * containerWidth;

        let moveX = baseOffset + deltaX;
        if (currentSlide === 0 && deltaX > 0) {
          moveX = baseOffset + deltaX * 0.3;
        } else if (currentSlide === totalSlides - 1 && deltaX < 0) {
          moveX = baseOffset + deltaX * 0.3;
        }

        track.style.transform = `translateX(${moveX}px)`;
      }
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

      if (deltaX < -40) {
        nextSlide();
      } else if (deltaX > 40) {
        prevSlide();
      } else {
        goToSlide(currentSlide);
      }
      startCarouselAutoplay();
    }

    container.addEventListener('mouseenter', stopCarouselAutoplay);
    container.addEventListener('mouseleave', startCarouselAutoplay);

    container.addEventListener('touchstart', onDragStart, { passive: true });
    container.addEventListener('touchmove', onDragMove, { passive: true });
    container.addEventListener('touchend', onDragEnd, { passive: true });

    container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onDragStart(e);
    });
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    startCarouselAutoplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCarousel);
  } else {
    initHeroCarousel();
  }

  window.goToSlide = goToSlide;
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;
  window.startCarouselAutoplay = startCarouselAutoplay;
  window.stopCarouselAutoplay = stopCarouselAutoplay;
})();
