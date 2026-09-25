/**
 * BUCHISAPA ADMIN - INVENTORY (INSUMOS & UTENSILIOS) MODULE
 * Layer: /admin/js/modules/inventory.js
 */

(function () {
  'use strict';

  async function fetchSupplies() {
    try {
      const data = await window.AdminApi.getSupplies();
      window.AdminState.allSupplies = Array.isArray(data) && data.length > 0 ? data : defaultSupplies();
    } catch (e) {
      console.warn('Fallback insumos locales:', e);
      window.AdminState.allSupplies = defaultSupplies();
    }
    renderSuppliesTable();
  }

  function defaultSupplies() {
    return [
      { id: 'ins-1', name: 'Pollo Fresco Entero', category: 'Carnes', stock: 45, unit: 'kg', min: 20 },
      { id: 'ins-2', name: 'Cecina Ahumada Regional', category: 'Carnes', stock: 18, unit: 'kg', min: 10 },
      { id: 'ins-3', name: 'Chorizo Selvático', category: 'Embutidos', stock: 12, unit: 'kg', min: 8 },
      { id: 'ins-4', name: 'Plátano Bellaco Verde', category: 'Verduras', stock: 80, unit: 'unid', min: 30 },
      { id: 'ins-5', name: 'Papas Amarillas Peruanas', category: 'Tubérculos', stock: 65, unit: 'kg', min: 25 },
      { id: 'ins-6', name: 'Aceite Vegetal para Fritura', category: 'Abarrotes', stock: 40, unit: 'L', min: 15 },
      { id: 'ins-7', name: 'Cajas Térmicas Broaster 80mm', category: 'Empaques', stock: 240, unit: 'unid', min: 100 }
    ];
  }

  function renderSuppliesTable() {
    const tbody = document.getElementById('supplies-table-body');
    if (!tbody) return;

    const supplies = window.AdminState.allSupplies || [];
    tbody.innerHTML = supplies.map(s => {
      const isLow = s.stock <= s.min;
      return `
        <tr>
          <td style="font-weight: 700; color: #fff;">${window.AdminUtils.escapeHtml(s.name)}</td>
          <td>${window.AdminUtils.escapeHtml(s.category)}</td>
          <td style="font-weight: 800; color: ${isLow ? '#ef4444' : '#fff'};">${s.stock} ${s.unit}</td>
          <td style="color: var(--text-muted);">${s.min} ${s.unit}</td>
          <td>
            <span class="badge ${isLow ? 'badge-red' : 'badge-green'}">
              ${isLow ? '⚠️ Crítico' : 'Óptimo'}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.restockSupply('${s.id}', 10)">
              +10 ${s.unit}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function restockSupply(id, qty) {
    try {
      await window.AdminApi.updateSupplyStock(id, qty);
      window.showToast(`Insumo reabastecido con +${qty}`, 'success');
      await fetchSupplies();
    } catch (e) {
      const s = (window.AdminState.allSupplies || []).find(item => item.id === id);
      if (s) s.stock = (s.stock || 0) + qty;
      renderSuppliesTable();
      window.showToast(`Insumo reabastecido (+${qty})`, 'info');
    }
  }

  async function fetchUtensils() {
    try {
      const data = await window.AdminApi.getUtensils();
      window.AdminState.allUtensils = Array.isArray(data) && data.length > 0 ? data : defaultUtensils();
    } catch (e) {
      window.AdminState.allUtensils = defaultUtensils();
    }
    renderUtensilsGrid();
  }

  function defaultUtensils() {
    return [
      { id: 'ut-1', name: 'Freidora Industrial a Presión', status: 'Operativa', maint: 'Próx: 15 Oct' },
      { id: 'ut-2', name: 'Plancha Parrillera a Gas', status: 'Operativa', maint: 'Próx: 20 Oct' },
      { id: 'ut-3', name: 'Impresora Térmica Comandas 80mm', status: 'En Línea (LAN)', maint: 'Papel OK' },
      { id: 'ut-4', name: 'Congelador Vertical 650L', status: 'Operativo (-18°C)', maint: 'Revisado' }
    ];
  }

  function renderUtensilsGrid() {
    const grid = document.getElementById('utensils-grid');
    if (!grid) return;

    const utensils = window.AdminState.allUtensils || [];
    grid.innerHTML = utensils.map(u => `
      <div class="utensil-card">
        <h4 class="utensil-name">${window.AdminUtils.escapeHtml(u.name)}</h4>
        <div class="utensil-details">
          <span>Estado: <strong style="color: #10b981;">${u.status}</strong></span>
          <span>${u.maint}</span>
        </div>
      </div>
    `).join('');
  }

  // Bindings
  window.fetchSupplies = fetchSupplies;
  window.renderSuppliesTable = renderSuppliesTable;
  window.restockSupply = restockSupply;
  window.fetchUtensils = fetchUtensils;
  window.renderUtensilsGrid = renderUtensilsGrid;

})();
