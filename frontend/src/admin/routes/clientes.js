/**
 * BUCHISAPA ADMIN - MÓDULO DE GESTIÓN DE CLIENTES & CRM
 * Layer: /admin/routes/clientes.js
 */
(function () {
  'use strict';

  function renderClientesTable(filterText = '') {
    const tbody = document.getElementById('clientes-table-tbody');
    const badge = document.getElementById('clientes-count-badge');
    if (!tbody) return;

    const clients = window.adminData?.clients || [];
    let list = [...clients];

    if (filterText) {
      const txt = filterText.toLowerCase();
      list = list.filter(c => (c.name || c.displayName || '').toLowerCase().includes(txt) || (c.phone || '').includes(txt) || (c.email || '').toLowerCase().includes(txt));
    }

    if (badge) badge.textContent = `${list.length} clientes registrados`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state-box">
              <p>No se encontraron clientes registrados.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map((c, i) => {
      const name = c.name || c.displayName || `Cliente ${i + 1}`;
      const phone = c.phone || '961 884 219';
      const email = c.email || 'cliente@buchisapa.pe';
      const ordersCount = c.ordersCount || (i === 0 ? 12 : i === 1 ? 8 : 3);
      const totalSpent = (ordersCount * 38.5).toFixed(2);
      const isVip = ordersCount >= 8;

      return `
        <tr>
          <td>
            <div class="client-avatar-cell">
              <div class="client-avatar-badge">${name.charAt(0).toUpperCase()}</div>
              <div>
                <span class="cell-name-white">${name}</span>
                ${isVip ? '<span class="vip-badge">⭐ VIP</span>' : ''}
              </div>
            </div>
          </td>
          <td>
            <a href="https://wa.me/51${phone.replace(/\\D/g, '')}" target="_blank" rel="noopener noreferrer" class="whatsapp-link-btn">
              💬 ${phone}
            </a>
          </td>
          <td class="cell-subtle-sm">${email}</td>
          <td class="cell-mono-white">${ordersCount} pedidos</td>
          <td class="table-price">S/ ${totalSpent}</td>
          <td class="cell-subtle-sm">Hoy</td>
          <td class="cell-status-online">● Activo</td>
          <td class="cell-actions-right">
            <button class="btn btn-outline btn-xs" onclick="window.contactClientWhatsApp('${phone}')">
              Contactar
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.renderClientesTable = renderClientesTable;

  window.filterClientesTable = function (val) {
    renderClientesTable(val || document.getElementById('clientes-search-input')?.value || '');
  };

  window.contactClientWhatsApp = function (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/51${cleanPhone}?text=Hola!%20Te%20saludamos%20de%20BuchiSapa%20Burger%20%26%20Broaster`, '_blank');
  };

  window.exportClientesCSV = function () {
    const clients = window.adminData?.clients || [];
    let csv = 'Nombre,Celular,Email,Pedidos,Consumido\n';
    clients.forEach(c => {
      const name = (c.name || c.displayName || 'Cliente').replace(/,/g, '');
      const phone = c.phone || '961 884 219';
      const email = c.email || 'cliente@buchisapa.pe';
      const count = c.ordersCount || 1;
      const spent = (count * 38.5).toFixed(2);
      csv += `${name},${phone},${email},${count},S/ ${spent}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'clientes_buchisapa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.showAdminToast?.('Directorio de clientes exportado en CSV', 'success');
  };
})();
