/**
 * BUCHISAPA ADMIN - MÓDULO DE GESTIÓN DE INSUMOS & STOCK
 * Layer: /admin/routes/insumos.js
 */
(function () {
  'use strict';

  function renderInsumosTable(filterText = '') {
    const tbody = document.getElementById('insumos-table-tbody');
    const badge = document.getElementById('insumos-count-badge');
    if (!tbody) return;

    const insumos = window.adminData?.insumos || [];
    let list = [...insumos];

    if (filterText) {
      const txt = filterText.toLowerCase();
      list = list.filter(i => (i.name || '').toLowerCase().includes(txt) || (i.id || '').toLowerCase().includes(txt));
    }

    if (badge) badge.textContent = `${list.length} insumos en almacén`;

    tbody.innerHTML = list.map(i => {
      const isCritical = i.stock <= i.min;
      const statusBadge = isCritical
        ? `<span class="table-stock-badge stock-out">⚠️ Stock Crítico</span>`
        : `<span class="table-stock-badge stock-ok">● Óptimo</span>`;

      return `
        <tr class="${isCritical ? 'insumo-critical-row' : ''}">
          <td class="cell-mono-cyan">${i.id}</td>
          <td><span class="cell-name-white">${i.name}</span></td>
          <td class="cell-mono-white">${i.stock}</td>
          <td><span class="insumo-unit-pill">${i.unit}</span></td>
          <td class="table-price">S/ ${Number(i.cost).toFixed(2)}</td>
          <td>${statusBadge}</td>
          <td class="cell-actions-right">
            <button class="btn btn-outline btn-xs" onclick="window.editInsumoStock('${i.id}')">
              Ajustar Stock
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.renderInsumosTable = renderInsumosTable;

  window.filterInsumosTable = function (val) {
    renderInsumosTable(val || document.getElementById('insumos-search-input')?.value || '');
  };

  window.openNewInsumoModal = function () {
    const name = prompt('Nombre del nuevo insumo:');
    if (!name) return;
    const stock = parseFloat(prompt('Cantidad inicial de stock:') || '10');
    const unit = prompt('Unidad (Kg, Unidades, Litros):') || 'Kg';
    const cost = parseFloat(prompt('Costo unitario en Soles (S/):') || '10.00');

    const insumos = window.adminData?.insumos || [];
    const newId = `INS${String(insumos.length + 1).padStart(3, '0')}`;
    insumos.push({
      id: newId,
      name,
      stock,
      unit,
      cost,
      min: Math.round(stock * 0.3),
      status: 'normal'
    });
    window.showAdminToast?.('Insumo registrado con éxito', 'success');
    renderInsumosTable();
  };

  window.editInsumoStock = function (id) {
    const insumos = window.adminData?.insumos || [];
    const ins = insumos.find(i => i.id === id);
    if (!ins) return;
    const newStock = prompt(`Ajustar stock actual para "${ins.name}" (${ins.unit}):`, ins.stock);
    if (newStock !== null) {
      ins.stock = parseFloat(newStock) || 0;
      window.showAdminToast?.(`Stock de ${ins.name} actualizado`, 'success');
      renderInsumosTable();
    }
  };
})();
