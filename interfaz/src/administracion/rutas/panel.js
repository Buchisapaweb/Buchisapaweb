/* =========================================================
   MÓDULO ADMIN: DASHBOARD JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Enlazar clics en tarjetas KPI para cambio de vista
  const kpiCards = document.querySelectorAll('.dash-kpi-card[data-target-view]');
  kpiCards.forEach(card => {
    card.addEventListener('click', () => {
      const view = card.getAttribute('data-target-view');
      if (view && typeof window.switchAdminView === 'function') {
        window.switchAdminView(view);
      }
    });
  });

  // Actualizar fecha del gráfico dinámicamente
  const chartDateEl = document.getElementById('dash-chart-day-date');
  if (chartDateEl) {
    const today = new Date();
    chartDateEl.textContent = today.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }
});
