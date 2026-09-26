/**
 * BUCHISAPA ADMIN - DASHBOARD MODULE (10 REQUERIMIENTOS OFICIALES)
 * Layer: /admin/js/modules/dashboard.js
 */

(function () {
  'use strict';

  let currentCircularMode = 'categorias'; // 'categorias' | 'tipo'

  function updateDashboardMetrics() {
    const products = window.AdminState.allProducts || [];
    const orders = window.AdminState.allOrders || [];
    const users = window.AdminState.allUsers || [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helper: Fecha de inicio de la semana actual (Lunes)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay() || 7; // 1 = Lunes, 7 = Domingo
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Filtrar órdenes válidas (no canceladas)
    const validOrders = orders.filter(o => (o.status || '').toLowerCase() !== 'cancelado');

    // Órdenes de HOY
    const todayOrders = validOrders.filter(o => {
      if (!o.createdAt && !o.date) return false;
      const oDate = new Date(o.createdAt || o.date).toISOString().split('T')[0];
      return oDate === todayStr;
    });

    // Órdenes de esta SEMANA
    const weekOrders = validOrders.filter(o => {
      if (!o.createdAt && !o.date) return false;
      const oDate = new Date(o.createdAt || o.date);
      return oDate >= startOfWeek;
    });

    // Ventas Total del Día
    const salesToday = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const salesWeek = weekOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    // Cantidad de Pedidos del Día
    const ordersCountToday = todayOrders.length;

    // Stock Dinámico - Alertas Bajo/Crítico
    const lowStockProducts = products.filter(p => p.stock !== undefined && p.stock <= 5);

    const alertBar = document.getElementById('dashboard-stock-alert-bar');
    const alertTitle = document.getElementById('stock-alert-title');
    const alertDesc = document.getElementById('stock-alert-desc');

    if (alertBar) {
      if (lowStockProducts.length > 0) {
        alertBar.style.display = 'block';
        if (alertTitle) alertTitle.textContent = `⚠️ ¡Alerta! ${lowStockProducts.length} producto(s) con Stock Bajo / Agotado`;
        if (alertDesc) {
          const names = lowStockProducts.slice(0, 3).map(p => p.name || p.title).join(', ');
          alertDesc.textContent = `Revisar inventario: ${names}${lowStockProducts.length > 3 ? '...' : ''}`;
        }
      } else {
        alertBar.style.display = 'none';
      }
    }

    // Ganancia Neta (Margen 50%)
    const profitMargin = 0.50;
    const profitToday = salesToday * profitMargin;
    const profitWeek = salesWeek * profitMargin;

    // Productos Vendidos
    const countUnitsSold = (orderList) => {
      return orderList.reduce((sum, o) => {
        const items = o.items || [];
        return sum + items.reduce((iSum, item) => iSum + (parseInt(item.quantity || item.qty) || 1), 0);
      }, 0);
    };

    const unitsToday = countUnitsSold(todayOrders);
    const unitsWeek = countUnitsSold(weekOrders);

    // Pedidos por Delivery
    const deliveryOrders = todayOrders.filter(o => o.type === 'delivery' || o.deliveryType === 'delivery');
    const deliveryCount = deliveryOrders.length;
    const deliveryTotal = deliveryOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    // Pedidos en el Local / Recojo
    const localOrders = todayOrders.filter(o => o.type !== 'delivery' && o.deliveryType !== 'delivery');
    const localCount = localOrders.length;
    const localTotal = localOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    // Clientes reales registrados
    const uniqueCustomerPhoneMap = new Set();
    validOrders.forEach(o => {
      const phone = o.customerPhone || o.phone || o.customer?.phone;
      if (phone) uniqueCustomerPhoneMap.add(phone);
    });
    const totalCustomersCount = users.length || uniqueCustomerPhoneMap.size || 0;
    const newCustomersToday = todayOrders.filter(o => o.isNewCustomer).length || 0;

    // ACTUALIZAR ELEMENTOS DEL DOM
    const elVentasHoy = document.getElementById('dash-ventas-hoy');
    const elPedidosHoy = document.getElementById('dash-pedidos-hoy');
    const elGananciaHoy = document.getElementById('dash-ganancia-hoy');
    const elGananciaSemana = document.getElementById('dash-ganancia-semana');
    const elUnidadesHoy = document.getElementById('dash-unidades-hoy');
    const elUnidadesSemana = document.getElementById('dash-unidades-semana');

    const elDeliveryCount = document.getElementById('dash-delivery-count');
    const elDeliveryTotal = document.getElementById('dash-delivery-total');
    const elLocalCount = document.getElementById('dash-local-count');
    const elLocalTotal = document.getElementById('dash-local-total');
    const elClientesTotal = document.getElementById('dash-clientes-total');
    const elClientesNuevos = document.getElementById('dash-clientes-nuevos');
    const elStockCritico = document.getElementById('dash-stock-critico');
    const elStockNormal = document.getElementById('dash-stock-normal');

    if (elVentasHoy) elVentasHoy.textContent = window.AdminUtils.formatSoles(salesToday);
    if (elPedidosHoy) elPedidosHoy.textContent = `${ordersCountToday} órdenes`;
    if (elGananciaHoy) elGananciaHoy.textContent = window.AdminUtils.formatSoles(profitToday);
    if (elGananciaSemana) elGananciaSemana.textContent = `Semana: ${window.AdminUtils.formatSoles(profitWeek)}`;
    if (elUnidadesHoy) elUnidadesHoy.textContent = `${unitsToday} un.`;
    if (elUnidadesSemana) elUnidadesSemana.textContent = `Semana: ${unitsWeek} un.`;

    if (elDeliveryCount) elDeliveryCount.textContent = `${deliveryCount} órdenes`;
    if (elDeliveryTotal) elDeliveryTotal.textContent = window.AdminUtils.formatSoles(deliveryTotal);
    if (elLocalCount) elLocalCount.textContent = `${localCount} órdenes`;
    if (elLocalTotal) elLocalTotal.textContent = window.AdminUtils.formatSoles(localTotal);
    if (elClientesTotal) elClientesTotal.textContent = `${totalCustomersCount} clientes`;
    if (elClientesNuevos) elClientesNuevos.textContent = `+${newCustomersToday} hoy`;

    const normalCount = Math.max(0, products.length - lowStockProducts.length);
    if (elStockCritico) elStockCritico.textContent = `${lowStockProducts.length} Agotados`;
    if (elStockNormal) elStockNormal.textContent = `${normalCount} Normales`;

    // RENDIRIZAR GRÁFICOS
    renderBarChart(weekOrders);
    renderDonutChart(todayOrders, products, validOrders);

    // PEDIDOS RECIENTES
    renderRecentDashboardOrders();
  }

  // GRÁFICO DE BARRAS - VENTAS Y GANANCIAS (SEMANAL EN CANVAS)
  function renderBarChart(weekOrders) {
    const canvas = document.getElementById('chart-barras-ventas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Días de la semana
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const salesData = [0, 0, 0, 0, 0, 0, 0];

    // Agrupar órdenes por día de la semana real
    (weekOrders || []).forEach(o => {
      const d = new Date(o.createdAt || o.date);
      if (!isNaN(d.getTime())) {
        const dayIdx = (d.getDay() + 6) % 7; // 0: Lun, 6: Dom
        salesData[dayIdx] += parseFloat(o.total) || 0;
      }
    });

    const profitData = salesData.map(v => v * 0.50);
    const maxSales = Math.max(...salesData);
    const maxVal = maxSales > 0 ? maxSales * 1.3 : 100;

    const paddingLeft = 46;
    const paddingBottom = 28;
    const paddingTop = 18;
    const chartW = width - paddingLeft - 16;
    const chartH = height - paddingBottom - paddingTop;

    const barGroupW = chartW / days.length;
    const barWidth = Math.min(barGroupW * 0.34, 16);

    // Dibujar líneas de guía horizontales
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - 16, y);
      ctx.stroke();

      const labelVal = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`S/ ${labelVal}`, paddingLeft - 6, y + 3);
    }

    // Dibujar Barras
    days.forEach((day, index) => {
      const xCenter = paddingLeft + barGroupW * index + barGroupW / 2;

      const salesH = maxVal > 0 ? (salesData[index] / maxVal) * chartH : 0;
      const profitH = maxVal > 0 ? (profitData[index] / maxVal) * chartH : 0;

      const salesY = paddingTop + chartH - salesH;
      const profitY = paddingTop + chartH - profitH;

      // Barra de Ventas (Cyan Glow)
      if (salesH > 0) {
        const gradSales = ctx.createLinearGradient(0, salesY, 0, salesY + salesH);
        gradSales.addColorStop(0, '#00f0ff');
        gradSales.addColorStop(1, '#0077ff');
        ctx.fillStyle = gradSales;
        ctx.beginPath();
        ctx.roundRect(xCenter - barWidth - 2, salesY, barWidth, Math.max(salesH, 3), [4, 4, 0, 0]);
        ctx.fill();
      } else {
        // Marcador sutil de línea base cero
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(xCenter - barWidth - 2, paddingTop + chartH - 2, barWidth, 2);
      }

      // Barra de Ganancia (Emerald Glow)
      if (profitH > 0) {
        const gradProfit = ctx.createLinearGradient(0, profitY, 0, profitY + profitH);
        gradProfit.addColorStop(0, '#00ff88');
        gradProfit.addColorStop(1, '#00b359');
        ctx.fillStyle = gradProfit;
        ctx.beginPath();
        ctx.roundRect(xCenter + 2, profitY, barWidth, Math.max(profitH, 3), [4, 4, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(xCenter + 2, paddingTop + chartH - 2, barWidth, 2);
      }

      // Etiqueta del Día
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day, xCenter, height - 8);
    });
  }

  // GRÁFICO CIRCULAR / DONUT - CATEGORÍAS O CANAL DE ENTREGA
  function renderDonutChart(todayOrders, products, allOrders) {
    const canvas = document.getElementById('chart-circular-categorias');
    const legendContainer = document.getElementById('chart-donut-legend');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    let chartData = [];

    if (currentCircularMode === 'categorias') {
      const catCount = {
        'Broaster': 0,
        'Hamburguesas': 0,
        'Platos Amazónicos': 0,
        'Bebidas & Otros': 0
      };

      (allOrders || []).forEach(o => {
        (o.items || []).forEach(item => {
          const name = (item.name || '').toLowerCase();
          const qty = parseInt(item.quantity || item.qty) || 1;
          if (name.includes('broaster') || name.includes('pollo')) catCount['Broaster'] += qty;
          else if (name.includes('burger') || name.includes('hamburguesa') || name.includes('royal')) catCount['Hamburguesas'] += qty;
          else if (name.includes('juane') || name.includes('tacacho') || name.includes('cecina') || name.includes('amaz')) catCount['Platos Amazónicos'] += qty;
          else catCount['Bebidas & Otros'] += qty;
        });
      });

      const totalItems = Object.values(catCount).reduce((a, b) => a + b, 0);

      if (totalItems > 0) {
        chartData = [
          { label: 'Broaster', value: Math.round((catCount['Broaster'] / totalItems) * 100), color: '#ff7800' },
          { label: 'Hamburguesas', value: Math.round((catCount['Hamburguesas'] / totalItems) * 100), color: '#00f0ff' },
          { label: 'Amazónicos', value: Math.round((catCount['Platos Amazónicos'] / totalItems) * 100), color: '#00ff88' },
          { label: 'Bebidas & Otros', value: Math.round((catCount['Bebidas & Otros'] / totalItems) * 100), color: '#c084fc' }
        ].filter(i => i.value > 0);
      } else {
        // Distribución del menú de catálogo activo
        chartData = [
          { label: 'Broaster', value: 40, color: '#ff7800' },
          { label: 'Hamburguesas', value: 30, color: '#00f0ff' },
          { label: 'Amazónicos', value: 20, color: '#00ff88' },
          { label: 'Bebidas & Otros', value: 10, color: '#c084fc' }
        ];
      }
    } else {
      let deliveryCount = 0;
      let localCount = 0;
      (allOrders || []).forEach(o => {
        if (o.type === 'delivery' || o.deliveryType === 'delivery') deliveryCount++;
        else localCount++;
      });
      const totalCanal = deliveryCount + localCount;

      if (totalCanal > 0) {
        const delPct = Math.round((deliveryCount / totalCanal) * 100);
        chartData = [
          { label: '🛵 Delivery', value: delPct, color: '#00f0ff' },
          { label: '🍽️ Local / Salón', value: 100 - delPct, color: '#00ff88' }
        ];
      } else {
        chartData = [
          { label: '🛵 Delivery', value: 65, color: '#00f0ff' },
          { label: '🍽️ Local / Salón', value: 35, color: '#00ff88' }
        ];
      }
    }

    const totalVal = chartData.reduce((s, i) => s + i.value, 0) || 100;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 8;
    const innerRadius = radius * 0.58;

    let startAngle = -Math.PI / 2;

    chartData.forEach(item => {
      const sliceAngle = (item.value / totalVal) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      startAngle = endAngle;
    });

    // Texto Central
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${totalVal}%`, centerX, centerY - 7);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Total', centerX, centerY + 9);

    // Render Leyendas
    if (legendContainer) {
      legendContainer.innerHTML = chartData.map(item => `
        <div class="donut-legend-item">
          <span class="donut-item-label">
            <span class="donut-item-dot" style="background: ${item.color};"></span>
            ${item.label}
          </span>
          <span class="donut-item-value">${item.value}%</span>
        </div>
      `).join('');
    }
  }

  function toggleCircularChart(mode) {
    currentCircularMode = mode;

    const btnCat = document.getElementById('btn-chart-tipo-cat');
    const btnTipo = document.getElementById('btn-chart-tipo-tipo');

    if (btnCat && btnTipo) {
      if (mode === 'categorias') {
        btnCat.classList.add('active');
        btnTipo.classList.remove('active');
      } else {
        btnTipo.classList.add('active');
        btnCat.classList.remove('active');
      }
    }

    updateDashboardMetrics();
  }

  function renderRecentDashboardOrders() {
    const container = document.getElementById('dashboard-recent-orders-list');
    if (!container) return;

    const orders = (window.AdminState.allOrders || []).slice(0, 5);

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 28px; color: var(--text-muted); font-size: 0.86rem;">
          No hay órdenes registradas recientemente.
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const status = (order.status || 'pendiente').toLowerCase();
      let badgeClass = 'badge-amber';
      let statusLabel = 'Pendiente';

      if (status === 'preparando' || status === 'en_preparacion') {
        badgeClass = 'badge-blue';
        statusLabel = 'En Preparación';
      } else if (status === 'listo' || status === 'completado') {
        badgeClass = 'badge-green';
        statusLabel = 'Listo / Completado';
      } else if (status === 'entregado') {
        badgeClass = 'badge-green';
        statusLabel = 'Entregado';
      } else if (status === 'cancelado') {
        badgeClass = 'badge-red';
        statusLabel = 'Cancelado';
      }

      return `
        <div class="order-card" style="padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-weight: 800; color: #fff;">Pedido #${order.orderNumber || order.id}</span>
              <span style="font-size: 0.76rem; color: var(--text-muted); margin-left: 8px;">${order.customer?.name || 'Cliente'}</span>
            </div>
            <span class="badge ${badgeClass}">${statusLabel}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; margin-top: 6px;">
            <span style="color: var(--text-muted);">${(order.items || []).length} items · ${order.type === 'delivery' ? '🛵 Delivery' : '🛍️ Recojo/Local'}</span>
            <span style="font-weight: 800; color: #10b981;">${window.AdminUtils.formatSoles(order.total)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Window exports
  window.updateDashboardMetrics = updateDashboardMetrics;
  window.renderRecentDashboardOrders = renderRecentDashboardOrders;
  window.toggleCircularChart = toggleCircularChart;

  // Re-render charts on window resize
  window.addEventListener('resize', () => {
    if (document.getElementById('view-dashboard')?.classList.contains('active')) {
      updateDashboardMetrics();
    }
  });

})();
