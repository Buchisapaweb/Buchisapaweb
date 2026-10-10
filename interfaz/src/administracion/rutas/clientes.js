/* =========================================================
   MÓDULO ADMIN: CLIENTES JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('input-search-clients');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#clients-page-tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }
});
