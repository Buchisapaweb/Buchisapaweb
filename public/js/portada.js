(function() {
  let currentSlide = 0;
  let totalSlides = 5;
  let carouselInterval = null;
  let touchStartX = 0;
  let touchEndX = 0;

  function goToSlide(index) {
    const track = document.getElementById('hero-carousel-track');
    const dotsContainer = document.getElementById('carousel-dots-container');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    totalSlides = slides.length || 5;

    if (index < 0) currentSlide = totalSlides - 1;
    else if (index >= totalSlides) currentSlide = 0;
    else currentSlide = index;

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

    container.addEventListener('mouseenter', stopCarouselAutoplay);
    container.addEventListener('mouseleave', startCarouselAutoplay);

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopCarouselAutoplay();
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
      startCarouselAutoplay();
    }, { passive: true });

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
