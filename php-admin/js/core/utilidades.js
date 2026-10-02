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
      '1001': 'ALITAS',
      '1002': 'BEBIDAS',
      '1003': 'BROASTER',
      '1004': 'HAMBURGUESAS',
      '1005': 'INFUSIONES',
      '1006': 'PLATOS AMAZÓNICOS',
      '1007': 'REFRESCOS',
      '1008': 'SALCHIPAPAS Y SALCHIBROASTERS',
      '1009': 'PROMOCIONES',
      '1010': 'ADICIONAL',
      'alitas': 'ALITAS',
      'bebidas': 'BEBIDAS',
      'broaster': 'BROASTER',
      'hamburguesas': 'HAMBURGUESAS',
      'infusiones': 'INFUSIONES',
      'platos-amazonicos': 'PLATOS AMAZÓNICOS',
      'refrescos': 'REFRESCOS',
      'salchipapas': 'SALCHIPAPAS Y SALCHIBROASTERS',
      'promociones': 'PROMOCIONES',
      'adicional': 'ADICIONAL'
    };
    const key = (cat || '').toLowerCase().trim();
    if (map[key]) return map[key];

    // Check custom categories in state or localStorage
    const customList = window.AdminState?.customCategories || JSON.parse(localStorage.getItem('buchisapa_custom_categories') || '[]');
    const found = customList.find(c => c.id === key || c.code === key || c.slug === key);
    if (found) return found.name;

    return cat || 'General';
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

  function formatOrderCode(orderOrCode) {
    if (!orderOrCode) return 'PC00001';
    if (typeof orderOrCode === 'object') {
      orderOrCode = orderOrCode.orderCode || orderOrCode.orderNumber || orderOrCode.id || '';
    }
    const str = String(orderOrCode).trim();
    if (str.toUpperCase().startsWith('PC')) {
      const numPart = str.substring(2).replace(/\D/g, '');
      if (numPart) {
        return `PC${numPart.padStart(5, '0')}`;
      }
      return str.toUpperCase();
    }
    const digits = str.replace(/\D/g, '');
    if (digits) {
      const num = parseInt(digits, 10);
      if (num < 100000) {
        return `PC${String(num).padStart(5, '0')}`;
      } else {
        const shortNum = num % 100000 || 1;
        return `PC${String(shortNum).padStart(5, '0')}`;
      }
    }
    return 'PC00001';
  }

  function formatTicketNumber(ticketOrCode) {
    if (!ticketOrCode) return 'TK00001';
    if (typeof ticketOrCode === 'object') {
      ticketOrCode = ticketOrCode.number || ticketOrCode.ticketNumber || ticketOrCode.orderNumber || ticketOrCode.id || '';
    }
    let str = String(ticketOrCode).trim();
    if (str.toUpperCase().startsWith('TK')) {
      const clean = str.replace(/^tk-?/i, '');
      const digits = clean.replace(/\D/g, '');
      if (digits) {
        return `TK${digits.padStart(5, '0')}`;
      }
      return `TK${clean}`;
    }
    if (str.startsWith('#')) {
      const clean = str.replace(/^#/, '');
      const digits = clean.replace(/\D/g, '');
      if (digits) {
        return `TK${digits.padStart(5, '0')}`;
      }
      return `TK${clean}`;
    }
    const digits = str.replace(/\D/g, '');
    if (digits) {
      return `TK${digits.padStart(5, '0')}`;
    }
    return `TK${str}`;
  }

  window.AdminUtils = {
    showToast,
    formatSoles,
    formatCategoryName,
    formatOrderCode,
    formatTicketNumber,
    escapeHtml,
    openModal,
    closeModal
  };

  // Expose directly to window for legacy template bindings
  window.showToast = showToast;
  window.formatSoles = formatSoles;
  window.formatCategoryName = formatCategoryName;
  window.formatOrderCode = formatOrderCode;
  window.formatTicketNumber = formatTicketNumber;
  window.escapeHtml = escapeHtml;

})();
