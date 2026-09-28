/**
 * BUCHISAPA ADMIN - VENTAS MODULE
 * Layer: /admin/js/modules/ventas.js
 */

(function () {
  'use strict';

  let currentPeriodFilter = 'hoy'; // 'hoy' | 'ayer' | 'semana' | 'mes'

  /**
   * Cambia el filtro de período de la vista de ventas
   */
  function filterVentasPeriod(period, btn) {
    currentPeriodFilter = period;

    // Actualizar estados visuales de los botones
    document.querySelectorAll('.date-filter-group .btn-filter-period').forEach(b => {
      b.classList.remove('active');
      b.style.background = 'transparent';
      b.style.color = 'var(--text-muted)';
      b.style.fontWeight = '600';
    });

    if (btn) {
      btn.classList.add('active');
      btn.style.background = 'var(--accent-orange)';
      btn.style.color = '#fff';
      btn.style.fontWeight = '700';
    }

    renderVentasView();
  }

  /**
   * Filtra las órdenes según el período seleccionado
   */
  function getFilteredOrders() {
    const state = window.AdminState = window.AdminState || {};
    const orders = state.allOrders || [];
    const validOrders = orders.filter(o => (o.status || '').toLowerCase() !== 'cancelado');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (currentPeriodFilter === 'hoy') {
      return validOrders.filter(o => {
        if (!o.createdAt && !o.date) return false;
        const oDate = new Date(o.createdAt || o.date).toISOString().split('T')[0];
        return oDate === todayStr;
      });
    }

    if (currentPeriodFilter === 'ayer') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return validOrders.filter(o => {
        if (!o.createdAt && !o.date) return false;
        const oDate = new Date(o.createdAt || o.date).toISOString().split('T')[0];
        return oDate === yesterdayStr;
      });
    }

    if (currentPeriodFilter === 'semana') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      return validOrders.filter(o => {
        if (!o.createdAt && !o.date) return false;
        return new Date(o.createdAt || o.date) >= startOfWeek;
      });
    }

    if (currentPeriodFilter === 'mes') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return validOrders.filter(o => {
        if (!o.createdAt && !o.date) return false;
        return new Date(o.createdAt || o.date) >= startOfMonth;
      });
    }

    return validOrders;
  }

  /**
   * Renderiza todos los paneles de la vista de ventas
   */
  function renderVentasView() {
    const orders = getFilteredOrders();
    const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? (totalSales / totalOrders) : 0;

    // 1. KPI Cards
    const totalSalesEl = document.getElementById('ventas-total-sales');
    const totalOrdersHintEl = document.getElementById('ventas-total-orders-hint');
    const ticketEl = document.getElementById('ventas-ticket-promedio');

    if (totalSalesEl) totalSalesEl.textContent = `S/ ${totalSales.toFixed(2)}`;
    if (totalOrdersHintEl) totalOrdersHintEl.textContent = `${totalOrders} órdenes atendidas`;
    if (ticketEl) ticketEl.textContent = `S/ ${avgTicket.toFixed(2)}`;

    // Canal Delivery vs Mostrador
    const deliveryOrders = orders.filter(o => (o.orderType || o.type || '').toLowerCase() === 'delivery');
    const recojoOrders = orders.filter(o => (o.orderType || o.type || '').toLowerCase() !== 'delivery');

    const delCountEl = document.getElementById('ventas-delivery-count');
    const delPctEl = document.getElementById('ventas-delivery-pct');
    const recCountEl = document.getElementById('ventas-recojo-count');
    const recPctEl = document.getElementById('ventas-recojo-pct');

    const delPct = totalOrders > 0 ? ((deliveryOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
    const recPct = totalOrders > 0 ? ((recojoOrders.length / totalOrders) * 100).toFixed(1) : '0.0';

    if (delCountEl) delCountEl.textContent = `${deliveryOrders.length} pedidos`;
    if (delPctEl) delPctEl.textContent = `${delPct}% de los pedidos totales`;
    if (recCountEl) recCountEl.textContent = `${recojoOrders.length} pedidos`;
    if (recPctEl) recPctEl.textContent = `${recPct}% de pedidos en tienda`;

    // 2. Canales de Pago (Yape/Plin, Efectivo, Tarjeta)
    let yapeTotal = 0, efectivoTotal = 0, tarjetaTotal = 0;
    orders.forEach(o => {
      const method = (o.paymentMethod || o.payment_method || '').toLowerCase();
      const amount = parseFloat(o.total) || 0;
      if (method.includes('yape') || method.includes('plin') || method.includes('digital') || method.includes('qr')) {
        yapeTotal += amount;
      } else if (method.includes('efectivo') || method.includes('cash')) {
        efectivoTotal += amount;
      } else {
        tarjetaTotal += amount;
      }
    });

    const yapePct = totalSales > 0 ? ((yapeTotal / totalSales) * 100).toFixed(1) : '0.0';
    const efectivoPct = totalSales > 0 ? ((efectivoTotal / totalSales) * 100).toFixed(1) : '0.0';
    const tarjetaPct = totalSales > 0 ? ((tarjetaTotal / totalSales) * 100).toFixed(1) : '0.0';

    const yapeEl = document.getElementById('ventas-yape');
    const yapeLbl = document.getElementById('label-ventas-yape');
    const efecEl = document.getElementById('ventas-efectivo');
    const efecLbl = document.getElementById('label-ventas-efectivo');
    const tarjEl = document.getElementById('ventas-tarjeta');
    const tarjLbl = document.getElementById('label-ventas-tarjeta');

    if (yapeEl) yapeEl.textContent = `S/ ${yapeTotal.toFixed(2)}`;
    if (yapeLbl) yapeLbl.textContent = `${yapePct}% del total`;
    if (efecEl) efecEl.textContent = `S/ ${efectivoTotal.toFixed(2)}`;
    if (efecLbl) efecLbl.textContent = `${efectivoPct}% del total`;
    if (tarjEl) tarjEl.textContent = `S/ ${tarjetaTotal.toFixed(2)}`;
    if (tarjLbl) tarjLbl.textContent = `${tarjetaPct}% del total`;

    // 3. Ranking de Productos
    renderTopProductsRanking(orders);

    // 5. Tabla de Transacciones
    renderVentasTransactionsTable(orders);
  }

  /**
   * Calcula y renderiza el ranking de los platos más vendidos
   */
  function renderTopProductsRanking(orders) {
    const tbody = document.getElementById('ventas-top-products-tbody');
    const mobileContainer = document.getElementById('ventas-top-products-mobile-list');

    if (!orders || orders.length === 0) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">
              No hay registros de ventas para calcular el ranking de productos.
            </td>
          </tr>
        `;
      }
      if (mobileContainer) {
        mobileContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-card); font-size: 0.82rem;">
            No hay registros de ventas en este período.
          </div>
        `;
      }
      return;
    }

    const productStats = {};

    orders.forEach(o => {
      const items = o.items || o.cart || [];
      items.forEach(item => {
        const name = item.name || item.title || 'Producto BuchiSapa';
        const qty = parseInt(item.quantity || item.qty || 1, 10);
        const price = parseFloat(item.price || 0);
        const total = price * qty;
        const category = item.category || 'Carta BuchiSapa';

        if (!productStats[name]) {
          productStats[name] = { name, category, qty: 0, revenue: 0 };
        }
        productStats[name].qty += qty;
        productStats[name].revenue += total;
      });
    });

    const sortedList = Object.values(productStats).sort((a, b) => b.qty - a.qty).slice(0, 8);

    if (sortedList.length === 0) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">
              Aún no hay desglose de productos individuales en las órdenes.
            </td>
          </tr>
        `;
      }
      if (mobileContainer) {
        mobileContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-card); font-size: 0.82rem;">
            Aún no hay desglose de productos individuales.
          </div>
        `;
      }
      return;
    }

    // Render Tabla Escritorio
    if (tbody) {
      tbody.innerHTML = sortedList.map((prod, idx) => `
        <tr>
          <td style="font-weight: 800; color: ${idx === 0 ? 'var(--accent-orange)' : idx === 1 ? '#eab308' : idx === 2 ? '#3b82f6' : 'var(--text-muted)'}">
            ${idx + 1}° ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
          </td>
          <td style="font-weight: 700; color: #fff;">${prod.name}</td>
          <td><span class="category-chip" style="font-size: 0.72rem;">${prod.category}</span></td>
          <td style="text-align: center; font-weight: 800; color: #fff;">${prod.qty} unid.</td>
          <td style="text-align: right; font-weight: 800; color: #10b981;">S/ ${prod.revenue.toFixed(2)}</td>
        </tr>
      `).join('');
    }

    // Render Tarjetas Móviles
    if (mobileContainer) {
      mobileContainer.innerHTML = sortedList.map((prod, idx) => `
        <div class="mobile-sales-card">
          <div class="mobile-sales-card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 900; font-size: 0.9rem; color: ${idx === 0 ? 'var(--accent-orange)' : idx === 1 ? '#eab308' : idx === 2 ? '#3b82f6' : 'var(--text-muted)'}">
                ${idx + 1}° ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
              </span>
              <h5 class="mobile-sales-card-title">${prod.name}</h5>
            </div>
            <span class="category-chip" style="font-size: 0.68rem;">${prod.category}</span>
          </div>
          <div class="mobile-sales-card-footer">
            <span style="color: var(--text-muted); font-weight: 600;">${prod.qty} unidades vendidas</span>
            <span style="font-weight: 800; color: #10b981; font-size: 0.95rem;">S/ ${prod.revenue.toFixed(2)}</span>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Renderiza la tabla de transacciones individuales (Escritorio y Móvil)
   */
  function renderVentasTransactionsTable(ordersParam) {
    const tbody = document.getElementById('ventas-transactions-tbody');
    const mobileContainer = document.getElementById('ventas-transactions-mobile-list');

    const orders = ordersParam || getFilteredOrders();
    const searchInput = document.getElementById('input-search-ventas-table');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = orders.filter(o => {
      if (!query) return true;
      const code = (o.orderCode || o.id || '').toString().toLowerCase();
      const name = (o.customerName || o.customer?.name || '').toLowerCase();
      return code.includes(query) || name.includes(query);
    });

    if (filtered.length === 0) {
      const emptyMsg = `No se encontraron transacciones ${query ? `que coincidan con "${query}"` : 'en este período'}.`;
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 28px;">
              ${emptyMsg}
            </td>
          </tr>
        `;
      }
      if (mobileContainer) {
        mobileContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-card); font-size: 0.82rem;">
            ${emptyMsg}
          </div>
        `;
      }
      return;
    }

    // Render Tabla Escritorio
    if (tbody) {
      tbody.innerHTML = filtered.map(o => {
        const dateObj = new Date(o.createdAt || o.date || Date.now());
        const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        const clientName = o.customerName || o.customer?.name || 'Cliente Mostrador';
        const orderType = (o.orderType || o.type || 'Tienda').toUpperCase();
        const method = o.paymentMethod || o.payment_method || 'Efectivo';
        const total = parseFloat(o.total || 0).toFixed(2);
        const status = (o.status || 'Completado').toLowerCase();

        let badgeClass = 'badge-success';
        if (status.includes('pendiente')) badgeClass = 'badge-warning';
        if (status.includes('prepar')) badgeClass = 'badge-info';

        return `
          <tr>
            <td style="font-weight: 800; color: var(--accent-orange);">#${o.orderCode || (o.id || '').substring(0, 6)}</td>
            <td style="color: var(--text-muted); font-size: 0.8rem;">${timeStr}</td>
            <td style="font-weight: 600; color: #fff;">${clientName}</td>
            <td><span class="status-badge" style="font-size: 0.72rem; background: rgba(255,255,255,0.06); color: #fff; border: 1px solid var(--border-card);">${orderType}</span></td>
            <td style="font-size: 0.82rem; color: var(--text-muted);">${method}</td>
            <td style="text-align: right; font-weight: 800; color: #10b981;">S/ ${total}</td>
            <td style="text-align: center;"><span class="status-badge ${badgeClass}" style="font-size: 0.72rem;">${status}</span></td>
          </tr>
        `;
      }).join('');
    }

    // Render Tarjetas Móviles
    if (mobileContainer) {
      mobileContainer.innerHTML = filtered.map(o => {
        const dateObj = new Date(o.createdAt || o.date || Date.now());
        const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        const clientName = o.customerName || o.customer?.name || 'Cliente Mostrador';
        const orderType = (o.orderType || o.type || 'Tienda').toUpperCase();
        const method = o.paymentMethod || o.payment_method || 'Efectivo';
        const total = parseFloat(o.total || 0).toFixed(2);
        const status = (o.status || 'Completado').toLowerCase();

        let badgeClass = 'badge-success';
        if (status.includes('pendiente')) badgeClass = 'badge-warning';
        if (status.includes('prepar')) badgeClass = 'badge-info';

        return `
          <div class="mobile-sales-card">
            <div class="mobile-sales-card-header">
              <div>
                <span style="font-weight: 800; color: var(--accent-orange); font-size: 0.88rem;">#${o.orderCode || (o.id || '').substring(0, 6)}</span>
                <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 6px;">• ${timeStr}</span>
              </div>
              <span class="status-badge ${badgeClass}" style="font-size: 0.68rem;">${status}</span>
            </div>
            <div class="mobile-sales-card-body">
              <span style="font-weight: 700; color: #fff;">${clientName}</span>
              <span style="font-weight: 800; color: #10b981; font-size: 0.95rem;">S/ ${total}</span>
            </div>
            <div class="mobile-sales-card-footer">
              <span style="background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px; color: #fff; font-size: 0.72rem; border: 1px solid var(--border-card);">${orderType}</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">💳 ${method}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Genera y descarga un Reporte Comercial Oficial en formato PDF
   */
  function exportarVentasPDF() {
    if (typeof showToast === 'function') {
      showToast('Generando reporte PDF comercial...', 'info');
    }

    const orders = getFilteredOrders();
    const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? (totalSales / totalOrders) : 0;

    const deliveryOrders = orders.filter(o => (o.orderType || o.type || '').toLowerCase() === 'delivery');
    const recojoOrders = orders.filter(o => (o.orderType || o.type || '').toLowerCase() !== 'delivery');

    let yapeTotal = 0, efectivoTotal = 0, tarjetaTotal = 0;
    orders.forEach(o => {
      const method = (o.paymentMethod || o.payment_method || '').toLowerCase();
      const amount = parseFloat(o.total) || 0;
      if (method.includes('yape') || method.includes('plin') || method.includes('digital') || method.includes('qr')) {
        yapeTotal += amount;
      } else if (method.includes('efectivo') || method.includes('cash')) {
        efectivoTotal += amount;
      } else {
        tarjetaTotal += amount;
      }
    });

    const periodLabelMap = {
      'hoy': 'HOY',
      'ayer': 'AYER',
      'semana': 'ÚLTIMOS 7 DÍAS',
      'mes': 'ESTE MES'
    };
    const periodName = periodLabelMap[currentPeriodFilter] || 'GENERAL';
    const nowStr = new Date().toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });

    // 1. INTENTAR GENERACIÓN CON jsPDF
    if (window.jspdf && window.jspdf.jsPDF) {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Color Palette
        const primaryColor = [239, 68, 68]; // #ef4444
        const darkColor = [30, 27, 75];     // #1e1b4b
        const grayText = [100, 116, 139];

        // Encabezado
        doc.setFillColor(...darkColor);
        doc.rect(0, 0, 210, 28, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('🍔 BUCHISAPA RESTAURANTE & COMIDA RÁPIDA', 14, 13);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('REPORTE CONSOLIDADO DE VENTAS Y RENDIMIENTO COMERCIAL', 14, 21);

        // Subtítulo / Metadatos
        doc.setTextColor(...darkColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`PERÍODO EVALUADO: ${periodName}`, 14, 37);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayText);
        doc.text(`Fecha de emisión: ${nowStr}`, 14, 43);

        // Cuadro KPIs Resumen Executivo
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, 48, 182, 32, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(...grayText);
        doc.text('VENTAS TOTALES', 20, 56);
        doc.text('ÓRDENES ATENDIDAS', 68, 56);
        doc.text('TICKET PROMEDIO', 118, 56);
        doc.text('DELIVERY / MOSTRADOR', 160, 56);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Verde S/
        doc.text(`S/ ${totalSales.toFixed(2)}`, 20, 65);

        doc.setTextColor(...darkColor);
        doc.text(`${totalOrders} ped.`, 68, 65);
        doc.text(`S/ ${avgTicket.toFixed(2)}`, 118, 65);

        doc.setFontSize(9);
        doc.setTextColor(...darkColor);
        doc.text(`${deliveryOrders.length} del. / ${recojoOrders.length} mos.`, 160, 65);

        // Cobranzas por Medio de Pago
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(14, 85, 182, 18, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('DESGLOSE DE PAGOS:', 20, 96);

        doc.setFont('helvetica', 'normal');
        doc.text(`📱 Yape/Plin: S/ ${yapeTotal.toFixed(2)}`, 62, 96);
        doc.text(`💵 Efectivo: S/ ${efectivoTotal.toFixed(2)}`, 110, 96);
        doc.text(`💳 POS/Tarjetas: S/ ${tarjetaTotal.toFixed(2)}`, 154, 96);

        // Tabla de Ranking de Productos Más Vendidos
        let startY = 110;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('🏆 RANKING DE PLATOS Y PRODUCTOS MÁS VENDIDOS', 14, startY);

        const productStats = {};
        orders.forEach(o => {
          const items = o.items || o.cart || [];
          items.forEach(item => {
            const name = item.name || item.title || 'Producto BuchiSapa';
            const qty = parseInt(item.quantity || item.qty || 1, 10);
            const price = parseFloat(item.price || 0);
            const total = price * qty;
            const category = item.category || 'Carta BuchiSapa';

            if (!productStats[name]) {
              productStats[name] = { name, category, qty: 0, revenue: 0 };
            }
            productStats[name].qty += qty;
            productStats[name].revenue += total;
          });
        });

        const sortedProds = Object.values(productStats).sort((a, b) => b.qty - a.qty).slice(0, 6);
        const prodRows = sortedProds.map((p, idx) => [
          `${idx + 1}°`,
          p.name,
          p.category,
          `${p.qty} unid.`,
          `S/ ${p.revenue.toFixed(2)}`
        ]);

        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            startY: startY + 4,
            head: [['Pos.', 'Producto / Combo', 'Categoría', 'Unidades', 'Ingreso Total']],
            body: prodRows.length > 0 ? prodRows : [['-', 'Sin registros de productos', '-', '-', 'S/ 0.00']],
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2.5 },
            columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
          });
          startY = doc.lastAutoTable.finalY + 12;
        } else {
          startY += 20;
        }

        // Tabla Detallada de Transacciones
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('📜 DETALLE DE TRANSACCIONES DE VENTA', 14, startY);

        const txRows = orders.map(o => {
          const dateObj = new Date(o.createdAt || o.date || Date.now());
          const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
          const clientName = o.customerName || o.customer?.name || 'Cliente Mostrador';
          const orderType = (o.orderType || o.type || 'Tienda').toUpperCase();
          const method = o.paymentMethod || o.payment_method || 'Efectivo';
          const total = parseFloat(o.total || 0).toFixed(2);
          const status = (o.status || 'Completado').toUpperCase();

          return [`#${o.orderCode || (o.id || '').substring(0, 6)}`, timeStr, clientName, orderType, method, `S/ ${total}`, status];
        });

        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            startY: startY + 4,
            head: [['N° Pedido', 'Hora', 'Cliente', 'Canal', 'Medio Pago', 'Total S/', 'Estado']],
            body: txRows.length > 0 ? txRows : [['-', '-', 'Sin transacciones en este período', '-', '-', 'S/ 0.00', '-']],
            theme: 'grid',
            headStyles: { fillColor: darkColor, textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: { 5: { halign: 'right', fontStyle: 'bold' } }
          });
        }

        // Pie de Página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(...grayText);
          doc.text(`Página ${i} de ${pageCount} — Sistema de Gestión BuchiSapa Restaurante`, 105, 290, { align: 'center' });
        }

        const fileName = `Reporte_Ventas_BuchiSapa_${currentPeriodFilter}_${Date.now()}.pdf`;
        doc.save(fileName);

        if (typeof showToast === 'function') {
          showToast('✅ Reporte PDF descargado con éxito', 'success');
        }
        return;
      } catch (e) {
        console.warn('Fallback por error en jsPDF:', e);
      }
    }

    // 2. FALLBACK SI NO CARGA jsPDF: VENTANA IMPRIMIBLE EN FORMATO PDF
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Por favor permite las ventanas emergentes para descargar e imprimir el PDF.');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte_Ventas_BuchiSapa_${periodName}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
          .header { border-bottom: 3px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 20px; font-weight: 800; color: #ef4444; }
          .title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          .meta { font-size: 12px; color: #64748b; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
          .kpi-box { text-align: center; }
          .kpi-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .kpi-value { font-size: 18px; font-weight: 800; color: #10b981; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 24px; }
          th { background: #1e1b4b; color: #fff; font-size: 11px; text-align: left; padding: 8px 10px; }
          td { border-bottom: 1px solid #e2e8f0; font-size: 11px; padding: 8px 10px; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #e2e8f0; color: #334155; }
          .badge-success { background: #dcfce7; color: #166534; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; text-align: right;">
          <button onclick="window.print()" style="background: #ef4444; color: #fff; font-weight: 700; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer;">🖨️ Guardar como PDF / Imprimir</button>
        </div>

        <div class="header">
          <div>
            <div class="logo">🍔 BUCHISAPA RESTAURANTE</div>
            <div class="title">REPORTE CONSOLIDADO DE VENTAS Y RENDIMIENTO COMERCIAL</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div><strong>Período:</strong> ${periodName}</div>
            <div><strong>Emisión:</strong> ${nowStr}</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Ventas Totales</div>
            <div class="kpi-value">S/ ${totalSales.toFixed(2)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Atendidos</div>
            <div class="kpi-value" style="color: #0f172a;">${totalOrders} ped.</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Ticket Promedio</div>
            <div class="kpi-value" style="color: #0f172a;">S/ ${avgTicket.toFixed(2)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Delivery / Mostrador</div>
            <div class="kpi-value" style="color: #3b82f6; font-size: 14px;">${deliveryOrders.length} del. / ${recojoOrders.length} mos.</div>
          </div>
        </div>

        <h3 style="font-size: 13px; font-weight: 800; margin-bottom: 6px;">💳 Desglose de Cobranzas por Medio de Pago</h3>
        <p style="font-size: 11px; margin-top: 0;">
          <strong>📱 Yape & Plin:</strong> S/ ${yapeTotal.toFixed(2)} &nbsp;|&nbsp;
          <strong>💵 Efectivo:</strong> S/ ${efectivoTotal.toFixed(2)} &nbsp;|&nbsp;
          <strong>💳 POS Tarjetas:</strong> S/ ${tarjetaTotal.toFixed(2)}
        </p>

        <h3 style="font-size: 13px; font-weight: 800; margin-top: 18px; margin-bottom: 6px;">📜 Registro Detallado de Transacciones de Venta</h3>
        <table>
          <thead>
            <tr>
              <th>N° Pedido</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Canal</th>
              <th>Medio Pago</th>
              <th style="text-align: right;">Total S/</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${orders.length > 0 ? orders.map(o => {
              const dateObj = new Date(o.createdAt || o.date || Date.now());
              const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
              return `
                <tr>
                  <td><strong>#${o.orderCode || (o.id || '').substring(0, 6)}</strong></td>
                  <td>${timeStr}</td>
                  <td>${o.customerName || o.customer?.name || 'Cliente Mostrador'}</td>
                  <td><span class="badge">${(o.orderType || o.type || 'Tienda').toUpperCase()}</span></td>
                  <td>${o.paymentMethod || o.payment_method || 'Efectivo'}</td>
                  <td style="text-align: right; font-weight: 800; color: #166534;">S/ ${parseFloat(o.total || 0).toFixed(2)}</td>
                  <td style="text-align: center;"><span class="badge badge-success">${(o.status || 'Completado').toUpperCase()}</span></td>
                </tr>
              `;
            }).join('') : `<tr><td colspan="7" style="text-align: center;">Sin transacciones de ventas registradas en este período.</td></tr>`}
          </tbody>
        </table>

        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  // BINDINGS PÚBLICOS
  window.filterVentasPeriod = filterVentasPeriod;
  window.renderVentasView = renderVentasView;
  window.renderVentasTransactionsTable = renderVentasTransactionsTable;
  window.exportarVentasPDF = exportarVentasPDF;

})();

