/**
 * BUCHISAPA ADMIN - MÓDULO DE GESTIÓN DE UTENSILIOS & EQUIPAMIENTO
 * Layer: /admin/routes/utensilios.js
 */
(function () {
  'use strict';

  function renderUtensiliosTable(filterText = '') {
    const tbody = document.getElementById('utensilios-table-tbody');
    const badge = document.getElementById('utensilios-count-badge');
    if (!tbody) return;

    const utensilios = window.adminData?.utensilios || [];
    let list = [...utensilios];

    if (filterText) {
      const txt = filterText.toLowerCase();
      list = list.filter(u => (u.name || '').toLowerCase().includes(txt) || (u.id || '').toLowerCase().includes(txt) || (u.area || '').toLowerCase().includes(txt));
    }

    if (badge) badge.textContent = `${list.length} equipos inventariados`;

    tbody.innerHTML = list.map(u => {
      const isMaint = u.status === 'mantenimiento';
      const statusBadge = isMaint
        ? `<span class="equip-status-mantenimiento">🔧 Mantenimiento</span>`
        : `<span class="equip-status-operativo">● 100% Operativo</span>`;

      return `
        <tr>
          <td class="cell-mono-cyan">${u.id}</td>
          <td><span class="cell-name-white">${u.name}</span></td>
          <td><span class="cell-category-tag">${u.area}</span></td>
          <td class="cell-mono-white">${u.quantity} un.</td>
          <td class="cell-subtle-sm">${u.lastMaint || 'Reciente'}</td>
          <td>${statusBadge}</td>
          <td class="cell-actions-right">
            <button class="btn btn-outline btn-xs" onclick="window.editUtensilio('${u.id}')">
              ${isMaint ? 'Marcar Listo' : 'Revisión'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.renderUtensiliosTable = renderUtensiliosTable;

  window.filterUtensiliosTable = function (val) {
    renderUtensiliosTable(val || document.getElementById('utensilios-search-input')?.value || '');
  };

  window.openNewUtensilioModal = function () {
    const name = prompt('Nombre del nuevo equipo o utensilio:');
    if (!name) return;
    const area = prompt('Área de cocina (Cocina Caliente, Zona de Plancha, Barra):') || 'Cocina Caliente';
    const quantity = parseInt(prompt('Cantidad:') || '1', 10);

    const utensilios = window.adminData?.utensilios || [];
    const newId = `UT${String(utensilios.length + 1).padStart(3, '0')}`;
    utensilios.push({
      id: newId,
      name,
      area,
      quantity,
      condition: '100% Operativo',
      lastMaint: 'Hoy',
      status: 'operativo'
    });
    window.showAdminToast?.('Equipo agregado a inventario', 'success');
    renderUtensiliosTable();
  };

  window.editUtensilio = function (id) {
    const utensilios = window.adminData?.utensilios || [];
    const u = utensilios.find(x => x.id === id);
    if (!u) return;
    const nextStatus = u.status === 'operativo' ? 'mantenimiento' : 'operativo';
    u.status = nextStatus;
    u.condition = nextStatus === 'operativo' ? '100% Operativo' : 'En Mantenimiento Preventivo';
    window.showAdminToast?.(`Estado de ${u.name} cambiado a ${u.condition}`, 'info');
    renderUtensiliosTable();
  };
})();
