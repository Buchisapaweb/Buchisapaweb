(() => {
  'use strict';

  function initCarousel(root) {
    const track = root.querySelector('#hero-carousel-track');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const dots = Array.from(root.querySelectorAll('[data-slide]'));
    const status = root.querySelector('.carousel-status');
    if (slides.length < 2) return;

    let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
    let timer = null;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', String(active));
      });
      if (status) status.textContent = `Portada ${index + 1} de ${slides.length}`;
    }

    function stop() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (!reducedMotion && !document.hidden) {
        timer = window.setInterval(() => show(index + 1), 6000);
      }
    }

    root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
      show(index - 1);
      start();
    });
    root.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
      show(index + 1);
      start();
    });
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      show(i);
      start();
    }));

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', event => {
      if (!root.contains(event.relatedTarget)) start();
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

    show(index);
    start();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hero-carousel-container').forEach(initCarousel);
  });
})();
