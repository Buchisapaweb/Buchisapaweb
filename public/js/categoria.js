(function() {
  function filterByCategory(categoryId, categoryTitle) {
    if (typeof window.openCategoryView === 'function') {
      window.openCategoryView(categoryId, categoryTitle);
    }
  }

  function exitSearchMode() {
    const searchSec = document.getElementById('search-results-section');
    const catSec = document.getElementById('category-banners-section');
    const heroSec = document.querySelector('.hero-carousel-container');
    const titleWrap = document.getElementById('main-section-title-wrap');

    if (searchSec) {
      searchSec.style.display = 'none';
      searchSec.classList.add('is-hidden');
    }
    if (catSec) catSec.style.display = '';
    if (heroSec) heroSec.style.display = '';
    if (titleWrap) titleWrap.style.display = '';

    const desktopInput = document.getElementById('desktop-search-input');
    const mobileInput = document.getElementById('main-search-input');
    if (desktopInput) desktopInput.value = '';
    if (mobileInput) mobileInput.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.filterByCategory = filterByCategory;
  window.exitSearchMode = exitSearchMode;
})();
