/**
 * BUCHISAPA ADMIN - CORE UTILITIES & HELPERS
 * Layer: /admin/js/core/utils.js
 */

(function () {
  'use strict';

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconSvg = type === 'success'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
      : type === 'error'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6200" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function formatSoles(amount) {
    const num = parseFloat(amount) || 0;
    return `S/ ${num.toFixed(2)}`;
  }

  function formatCategoryName(cat) {
    const map = {
      'platos-amazonicos': 'Amazónicos',
      'hamburguesas': 'Burgers',
      'broaster': 'Broaster',
      'salchipapas': 'Salchipapas',
      'alitas': 'Alitas',
      'bebidas': 'Bebidas',
      'refrescos': 'Refrescos',
      'infusiones': 'Infusiones',
      'combos': 'Combos',
      'extras': 'Extras',
      'guarniciones': 'Guarniciones'
    };
    const key = (cat || '').toLowerCase().trim();
    return map[key] || cat || 'General';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }

  window.AdminUtils = {
    showToast,
    formatSoles,
    formatCategoryName,
    escapeHtml,
    openModal,
    closeModal
  };

  // Expose directly to window for legacy template bindings
  window.showToast = showToast;
  window.formatSoles = formatSoles;
  window.formatCategoryName = formatCategoryName;
  window.escapeHtml = escapeHtml;

})();
