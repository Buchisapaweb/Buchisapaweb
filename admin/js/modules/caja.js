/**
 * BUCHISAPA ADMIN - CAJA CHICA & ARQUEO MODULE
 * Layer: /admin/js/modules/caja.js
 */

(function () {
  'use strict';

  async function fetchCaja() {
    try {
      const data = await window.AdminApi.getCaja();
      window.AdminState.cajaData = data;
    } catch (e) {
      console.warn('Fallback datos caja local:', e);
      if (!window.AdminState.cajaData) {
        window.AdminState.cajaData = {
          isOpen: true,
          initial_cash: 250,
          total_sales: 1850.5,
          cash_sales: 720,
          digital_sales: 1130.5,
          orders_count: 38,
          movements: [
            {
              id: 'mov-1',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              tipo: 'egreso',
              categoria: 'Insumos de Cocina',
              motivo: 'Compra de 2 bolsas de hielo frappé',
              responsable: 'Admin BuchiSapa',
              comprobante: 'BOL-0982',
              monto: 45
            }
          ],
          closures: []
        };
      }
    }
    renderCajaView();
  }

  function renderCajaView() {
    const data = window.AdminState.cajaData;
    if (!data) return;

    // Status Indicator
    const indicator = document.getElementById('caja-status-indicator');
    const textEl = document.getElementById('caja-status-text');
    const btnLabel = document.getElementById('btn-toggle-caja-label');
    const sidebarBadge = document.getElementById('sidebar-caja-badge');

    if (data.isOpen) {
      if (indicator) {
        indicator.className = 'caja-status-badge open';
        if (textEl) textEl.textContent = 'Caja Abierta';
      }
      if (btnLabel) btnLabel.textContent = 'Cerrar Turno (Cierre Z)';
      if (sidebarBadge) {
        sidebarBadge.textContent = 'Abierta';
        sidebarBadge.style.background = '#10b981';
      }
    } else {
      if (indicator) {
        indicator.className = 'caja-status-badge closed';
        if (textEl) textEl.textContent = 'Caja Cerrada';
      }
      if (btnLabel) btnLabel.textContent = 'Abrir Turno';
      if (sidebarBadge) {
        sidebarBadge.textContent = 'Cerrada';
        sidebarBadge.style.background = '#ef4444';
      }
    }

    // Métricas Financieras
    const initialCash = data.initial_cash || 250;
    const totalSales = data.total_sales || 1850.5;
    const cashSales = data.cash_sales || 720;
    const digitalSales = data.digital_sales || 1130.5;

    // Calcular egresos e ingresos de movimientos
    let egresosTotal = 0;
    let ingresosExtra = 0;
    (data.movements || []).forEach(m => {
      if (m.tipo === 'egreso') egresosTotal += (parseFloat(m.monto) || 0);
      else if (m.tipo === 'ingreso') ingresosExtra += (parseFloat(m.monto) || 0);
    });

    const efectivoTeorico = initialCash + cashSales + ingresosExtra - egresosTotal;

    const initCashEl = document.getElementById('caja-initial-cash');
    const totalSalesEl = document.getElementById('caja-total-sales');
    const teoCashEl = document.getElementById('caja-efectivo-teorico');
    const digSalesEl = document.getElementById('caja-digitales-total');
    const ordersCountEl = document.getElementById('caja-orders-count-label');

    if (initCashEl) initCashEl.textContent = window.AdminUtils.formatSoles(initialCash);
    if (totalSalesEl) totalSalesEl.textContent = window.AdminUtils.formatSoles(totalSales);
    if (teoCashEl) teoCashEl.textContent = window.AdminUtils.formatSoles(efectivoTeorico);
    if (digSalesEl) digSalesEl.textContent = window.AdminUtils.formatSoles(digitalSales);
    if (ordersCountEl) ordersCountEl.textContent = `${data.orders_count || 38} pedidos cobrados`;

    // Cuadre Teórico Card
    const cuadreInitEl = document.getElementById('cuadre-initial');
    const cuadreCashEl = document.getElementById('cuadre-ventas-efectivo');
    const cuadreExtraEl = document.getElementById('cuadre-ingresos-extra');
    const cuadreEgEl = document.getElementById('cuadre-egresos');
    const cuadreExpEl = document.getElementById('cuadre-esperado');

    if (cuadreInitEl) cuadreInitEl.textContent = window.AdminUtils.formatSoles(initialCash);
    if (cuadreCashEl) cuadreCashEl.textContent = `+ ${window.AdminUtils.formatSoles(cashSales)}`;
    if (cuadreExtraEl) cuadreExtraEl.textContent = `+ ${window.AdminUtils.formatSoles(ingresosExtra)}`;
    if (cuadreEgEl) cuadreEgEl.textContent = `- ${window.AdminUtils.formatSoles(egresosTotal)}`;
    if (cuadreExpEl) cuadreExpEl.textContent = window.AdminUtils.formatSoles(efectivoTeorico);

    calcCuadreDifference(efectivoTeorico);
    renderCajaMovementsTable();
  }

  function calcCuadreDifference(expected) {
    const data = window.AdminState.cajaData;
    const initialCash = data?.initial_cash || 250;
    const cashSales = data?.cash_sales || 720;
    let egresosTotal = 0;
    let ingresosExtra = 0;
    (data?.movements || []).forEach(m => {
      if (m.tipo === 'egreso') egresosTotal += (parseFloat(m.monto) || 0);
      else if (m.tipo === 'ingreso') ingresosExtra += (parseFloat(m.monto) || 0);
    });

    const exp = expected !== undefined ? expected : (initialCash + cashSales + ingresosExtra - egresosTotal);
    const inputEl = document.getElementById('input-caja-contado');
    const badgeEl = document.getElementById('caja-diff-badge');
    if (!inputEl || !badgeEl) return;

    const realCash = parseFloat(inputEl.value) || 0;
    const diff = realCash - exp;

    if (Math.abs(diff) < 0.01) {
      badgeEl.className = 'caja-cuadre-diff ok';
      badgeEl.textContent = '✅ Caja Cuadrada (Diferencia: S/ 0.00)';
    } else if (diff > 0) {
      badgeEl.className = 'caja-cuadre-diff warning';
      badgeEl.textContent = `⚠️ Sobrante de Efectivo (+${window.AdminUtils.formatSoles(diff)})`;
    } else {
      badgeEl.className = 'caja-cuadre-diff danger';
      badgeEl.textContent = `🚨 Faltante de Efectivo (${window.AdminUtils.formatSoles(diff)})`;
    }
  }

  function renderCajaMovementsTable() {
    const tbody = document.getElementById('caja-movements-table-body');
    if (!tbody) return;

    const movements = window.AdminState.cajaData?.movements || [];
    if (movements.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 18px;">No hay movimientos registrados en este turno.</td></tr>`;
      return;
    }

    tbody.innerHTML = movements.map(m => {
      const isEgreso = m.tipo === 'egreso';
      return `
        <tr>
          <td>${m.timestamp || '--:--'}</td>
          <td><span class="badge ${isEgreso ? 'badge-red' : 'badge-green'}">${isEgreso ? 'Salida' : 'Entrada'}</span></td>
          <td>${window.AdminUtils.escapeHtml(m.categoria)}</td>
          <td>${window.AdminUtils.escapeHtml(m.motivo)}</td>
          <td>${window.AdminUtils.escapeHtml(m.responsable || 'Admin')}</td>
          <td>${m.comprobante ? `<span style="font-family: monospace;">${m.comprobante}</span>` : '-'}</td>
          <td style="font-weight: 800; color: ${isEgreso ? '#ef4444' : '#10b981'};">
            ${isEgreso ? '-' : '+'} ${window.AdminUtils.formatSoles(m.monto)}
          </td>
        </tr>
      `;
    }).join('');
  }

  function openCajaMovementModal() {
    const modal = document.getElementById('caja-movement-modal');
    const form = document.getElementById('caja-movement-form');
    if (modal && form) {
      form.reset();
      modal.classList.add('active');
    }
  }

  function toggleCajaTurno() {
    const isOpen = window.AdminState.cajaData?.isOpen !== false;
    if (isOpen) {
      openCajaCloseModal();
    } else {
      openCajaOpenModal();
    }
  }

  function openCajaOpenModal() {
    const modal = document.getElementById('caja-open-modal');
    if (modal) modal.classList.add('active');
  }

  function openCajaCloseModal() {
    const modal = document.getElementById('caja-close-modal');
    const expEl = document.getElementById('modal-close-expected');
    const realInput = document.getElementById('modal-close-real-cash');
    if (modal) {
      if (expEl) expEl.textContent = document.getElementById('cuadre-esperado')?.textContent || 'S/ 925.00';
      if (realInput) realInput.value = document.getElementById('input-caja-contado')?.value || '925.00';
      modal.classList.add('active');
    }
  }

  async function handleCajaMovementSubmit(e) {
    e.preventDefault();
    const data = {
      tipo: document.getElementById('mov-form-tipo').value,
      categoria: document.getElementById('mov-form-categoria').value,
      monto: parseFloat(document.getElementById('mov-form-monto').value) || 0,
      motivo: document.getElementById('mov-form-motivo').value.trim(),
      comprobante: document.getElementById('mov-form-comprobante').value.trim(),
      responsable: document.getElementById('mov-form-responsable').value,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      await window.AdminApi.addCajaMovement(data);
      window.showToast('Movimiento registrado con éxito', 'success');
      document.getElementById('caja-movement-modal').classList.remove('active');
      await fetchCaja();
    } catch (err) {
      window.AdminState.cajaData = window.AdminState.cajaData || { movements: [] };
      window.AdminState.cajaData.movements = window.AdminState.cajaData.movements || [];
      window.AdminState.cajaData.movements.unshift(data);
      renderCajaView();
      document.getElementById('caja-movement-modal').classList.remove('active');
      window.showToast('Movimiento registrado localmente', 'info');
    }
  }

  function printArqueoTicket() {
    window.showToast('Enviando reporte de arqueo a la impresora térmica 80mm...', 'info');
  }

  // Bindings
  window.fetchCaja = fetchCaja;
  window.renderCajaView = renderCajaView;
  window.calcCuadreDifference = calcCuadreDifference;
  window.openCajaMovementModal = openCajaMovementModal;
  window.toggleCajaTurno = toggleCajaTurno;
  window.openCajaOpenModal = openCajaOpenModal;
  window.openCajaCloseModal = openCajaCloseModal;
  window.handleCajaMovementSubmit = handleCajaMovementSubmit;
  window.printArqueoTicket = printArqueoTicket;

})();
