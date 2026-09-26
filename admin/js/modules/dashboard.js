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

  // GRÁFICO DE BARRAS - VENTAS Y GANANCIAS (SEMANAL EN CANVAS CON ACABADO ULTRA ELEGANTE)
  function renderBarChart(weekOrders) {
    const canvas = document.getElementById('chart-barras-ventas');
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width) || 300, 240);
    const height = Math.max(Math.floor(rect.height) || 240, 220);
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    if (ctx.resetTransform) {
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(dpr, dpr);
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

    // Techo dinámico inteligente para el eje Y
    let maxVal = 100;
    if (maxSales > 0) {
      const raw = maxSales * 1.25;
      if (raw <= 50) maxVal = 50;
      else if (raw <= 100) maxVal = 100;
      else if (raw <= 200) maxVal = 200;
      else if (raw <= 400) maxVal = 400;
      else if (raw <= 800) maxVal = 800;
      else maxVal = Math.ceil(raw / 100) * 100;
    }

    const paddingLeft = width < 380 ? 44 : 52;
    const paddingRight = 14;
    const paddingTop = 26;
    const paddingBottom = 32;
    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    // 1. Líneas de guía horizontales con valores formateados
    const gridSteps = 4;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSteps; i++) {
      const y = Math.round(paddingTop + (chartH / gridSteps) * i);
      const val = Math.round(maxVal - (maxVal / gridSteps) * i);

      // Línea de cuadrícula
      ctx.beginPath();
      ctx.strokeStyle = i === gridSteps ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.06)';
      ctx.setLineDash(i === gridSteps ? [] : [3, 4]);
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Etiqueta del valor
      ctx.setLineDash([]);
      ctx.fillStyle = i === gridSteps ? '#94a3b8' : '#64748b';
      ctx.font = '600 9.5px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`S/${val}`, paddingLeft - 6, y);
    }

    // 2. Días y Barras con Iluminación Neón
    const now = new Date();
    const todayDayIdx = (now.getDay() + 6) % 7;
    const barGroupW = chartW / days.length;
    const barWidth = Math.max(Math.min(Math.floor(barGroupW * 0.32), 14), 6);
    const barSpacing = Math.max(Math.floor(barWidth * 0.25), 2);

    days.forEach((day, index) => {
      const xCenter = paddingLeft + barGroupW * index + barGroupW / 2;
      const isToday = index === todayDayIdx;

      // Columna de fondo para el día de hoy
      if (isToday) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(xCenter - barGroupW / 2 + 2, paddingTop, barGroupW - 4, chartH, [6, 6, 0, 0]);
        } else {
          ctx.rect(xCenter - barGroupW / 2 + 2, paddingTop, barGroupW - 4, chartH);
        }
        ctx.fill();
      }

      const sales = salesData[index];
      const profit = profitData[index];

      const salesH = maxVal > 0 ? (sales / maxVal) * chartH : 0;
      const profitH = maxVal > 0 ? (profit / maxVal) * chartH : 0;

      const salesX = xCenter - barWidth - Math.floor(barSpacing / 2);
      const profitX = xCenter + Math.ceil(barSpacing / 2);

      const salesY = paddingTop + chartH - salesH;
      const profitY = paddingTop + chartH - profitH;

      // Barra de Ventas (Cyan Glow)
      if (salesH > 1) {
        const gradSales = ctx.createLinearGradient(0, salesY, 0, paddingTop + chartH);
        gradSales.addColorStop(0, '#00f0ff');
        gradSales.addColorStop(0.3, '#00b4d8');
        gradSales.addColorStop(1, '#0055d4');
        ctx.fillStyle = gradSales;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(salesX, salesY, barWidth, salesH, [4, 4, 0, 0]);
        } else {
          ctx.rect(salesX, salesY, barWidth, salesH);
        }
        ctx.fill();

        // Línea luminosa en la parte superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(salesX + 1, salesY, barWidth - 2, 1.5);
      } else {
        // Línea base elegante
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.fillRect(salesX, paddingTop + chartH - 2, barWidth, 2);
      }

      // Barra de Ganancia (Emerald Glow)
      if (profitH > 1) {
        const gradProfit = ctx.createLinearGradient(0, profitY, 0, paddingTop + chartH);
        gradProfit.addColorStop(0, '#00ff88');
        gradProfit.addColorStop(0.4, '#10b981');
        gradProfit.addColorStop(1, '#047857');
        ctx.fillStyle = gradProfit;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(profitX, profitY, barWidth, profitH, [4, 4, 0, 0]);
        } else {
          ctx.rect(profitX, profitY, barWidth, profitH);
        }
        ctx.fill();

        // Línea luminosa en la parte superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(profitX + 1, profitY, barWidth - 2, 1.5);
      } else {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
        ctx.fillRect(profitX, paddingTop + chartH - 2, barWidth, 2);
      }

      // Etiqueta del Día de la Semana
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      if (isToday) {
        // Badge resaltado para HOY
        ctx.fillStyle = '#00f0ff';
        ctx.font = '700 10.5px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillText(day, xCenter, paddingTop + chartH + 8);

        // Punto indicador debajo
        ctx.beginPath();
        ctx.arc(xCenter, paddingTop + chartH + 22, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.fill();
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 10px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillText(day, xCenter, paddingTop + chartH + 8);
      }
    });
  }

  // GRÁFICO CIRCULAR / DONUT - CATEGORÍAS O CANAL DE ENTREGA
  function renderDonutChart(todayOrders, products, allOrders) {
    const canvas = document.getElementById('chart-circular-categorias');
    const legendContainer = document.getElementById('chart-donut-legend');
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width) || 170, 150);
    const height = Math.max(Math.floor(rect.height) || 170, 150);
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    if (ctx.resetTransform) {
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    let chartData = [];
    let centerSubtitle = 'Total';

    if (currentCircularMode === 'categorias') {
      centerSubtitle = 'Categorías';

      // 8 Categorías Oficiales BuchiSapa
      const CATEGORIES_DEF = [
        { key: 'broaster', label: 'Broaster', color: '#ff6b00', defaultPct: 24 },
        { key: 'hamburguesas', label: 'Hamburguesas', color: '#00e5ff', defaultPct: 20 },
        { key: 'platos-amazonicos', label: 'Amazónicos', color: '#00ff88', defaultPct: 16 },
        { key: 'alitas', label: 'Alitas', color: '#ff3366', defaultPct: 12 },
        { key: 'salchipapas', label: 'Salchipapas', color: '#ffcc00', defaultPct: 10 },
        { key: 'bebidas', label: 'Bebidas', color: '#38bdf8', defaultPct: 8 },
        { key: 'refrescos', label: 'Refrescos', color: '#e040fb', defaultPct: 6 },
        { key: 'infusiones', label: 'Infusiones', color: '#a855f7', defaultPct: 4 }
      ];

      const catCount = {
        'broaster': 0,
        'hamburguesas': 0,
        'platos-amazonicos': 0,
        'alitas': 0,
        'salchipapas': 0,
        'bebidas': 0,
        'refrescos': 0,
        'infusiones': 0
      };

      const allProds = (products && products.length > 0) ? products : (window.AdminState?.products || []);
      const prodLookup = {};
      allProds.forEach(p => {
        if (p.id) prodLookup[String(p.id).toLowerCase()] = p;
        if (p.name) prodLookup[String(p.name).toLowerCase()] = p;
      });

      (allOrders || []).forEach(o => {
        (o.items || []).forEach(item => {
          const qty = parseInt(item.quantity || item.qty) || 1;
          const itemId = String(item.id || item.product_id || '').toLowerCase();
          const itemName = String(item.name || '').toLowerCase();
          const itemCat = String(item.category_id || item.category || '').toLowerCase();
          const matchedProd = prodLookup[itemId] || prodLookup[itemName] || {};
          const fullCat = itemCat || String(matchedProd.category_id || matchedProd.category || '').toLowerCase();

          if (fullCat === 'broaster' || itemName.includes('broaster') || itemName.includes('pollo')) {
            catCount['broaster'] += qty;
          } else if (fullCat === 'hamburguesas' || itemName.includes('burger') || itemName.includes('hamburguesa') || itemName.includes('royal')) {
            catCount['hamburguesas'] += qty;
          } else if (fullCat === 'platos-amazonicos' || fullCat.includes('amazon') || itemName.includes('juane') || itemName.includes('tacacho') || itemName.includes('cecina') || itemName.includes('chorizo') || itemName.includes('patacon') || itemName.includes('chaufa regional')) {
            catCount['platos-amazonicos'] += qty;
          } else if (fullCat === 'alitas' || itemName.includes('alita') || itemName.includes('wings') || itemName.includes('bbq') || itemName.includes('acevichada')) {
            catCount['alitas'] += qty;
          } else if (fullCat.includes('salchipapa') || itemName.includes('salchipapa') || itemName.includes('salchibroaster') || itemName.includes('salchiqueso')) {
            catCount['salchipapas'] += qty;
          } else if (fullCat === 'bebidas' || itemName.includes('gaseosa') || itemName.includes('inca kola') || itemName.includes('coca cola') || itemName.includes('agua') || itemName.includes('san mateo')) {
            catCount['bebidas'] += qty;
          } else if (fullCat === 'refrescos' || itemName.includes('refresco') || itemName.includes('cocona') || itemName.includes('aguajina') || itemName.includes('camu camu') || itemName.includes('maracuy') || itemName.includes('chicha') || itemName.includes('jugo')) {
            catCount['refrescos'] += qty;
          } else if (fullCat === 'infusiones' || itemName.includes('infusion') || itemName.includes('infusión') || itemName.includes('cafe') || itemName.includes('café') || itemName.includes('te') || itemName.includes('té') || itemName.includes('manzanilla') || itemName.includes('anis') || itemName.includes('anís')) {
            catCount['infusiones'] += qty;
          } else {
            catCount['broaster'] += qty;
          }
        });
      });

      const totalItems = Object.values(catCount).reduce((a, b) => a + b, 0);

      if (totalItems > 0) {
        chartData = CATEGORIES_DEF.map(cat => {
          const count = catCount[cat.key] || 0;
          const pct = Math.round((count / totalItems) * 100);
          return {
            label: cat.label,
            value: pct,
            color: cat.color,
            count: count
          };
        });

        // Asegurar que sumen exactamente 100%
        const sumPct = chartData.reduce((s, i) => s + i.value, 0);
        if (sumPct > 0 && sumPct !== 100) {
          const maxItem = chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
          maxItem.value += (100 - sumPct);
        }
      } else {
        // Distribución inicial realista con las 8 categorías oficiales
        chartData = CATEGORIES_DEF.map(cat => ({
          label: cat.label,
          value: cat.defaultPct,
          color: cat.color,
          count: 0
        }));
      }
    } else {
      centerSubtitle = 'Canal';
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
          { label: '🛵 Delivery', value: delPct, color: '#00f0ff', count: deliveryCount },
          { label: '🍽️ Local / Salón', value: 100 - delPct, color: '#00ff88', count: localCount }
        ];
      } else {
        chartData = [
          { label: '🛵 Delivery', value: 65, color: '#00f0ff', count: 0 },
          { label: '🍽️ Local / Salón', value: 35, color: '#00ff88', count: 0 }
        ];
      }
    }

    const totalVal = chartData.reduce((s, i) => s + i.value, 0) || 100;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 8;
    const innerRadius = radius * 0.62;

    // Disco central de fondo
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 6, 22, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    let startAngle = -Math.PI / 2;

    chartData.forEach(item => {
      const sliceAngle = (item.value / totalVal) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      // Separador elegante entre segmentos
      ctx.strokeStyle = '#120b24';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Texto Central
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${totalVal}%`, centerX, centerY - 6);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 9px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(centerSubtitle, centerX, centerY + 10);

    // Render Leyendas
    if (legendContainer) {
      legendContainer.innerHTML = chartData.map(item => `
        <div class="donut-legend-item">
          <span class="donut-item-label">
            <span class="donut-item-dot" style="background: ${item.color}; box-shadow: 0 0 8px ${item.color};"></span>
            <span>${item.label}</span>
          </span>
          <span class="donut-item-value" style="color: ${item.color};">${item.value}%</span>
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

  // Re-render charts on window resize / orientation change (con debounce suave)
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const viewDash = document.getElementById('view-dashboard');
      if (viewDash && (viewDash.classList.contains('active') || viewDash.style.display !== 'none')) {
        updateDashboardMetrics();
      }
    }, 150);
  });

  // Observador de visibilidad para cuando el usuario cambia de módulo al Dashboard
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          const target = mutation.target;
          if (target && target.id === 'view-dashboard' && (target.classList.contains('active') || target.style.display !== 'none')) {
            requestAnimationFrame(() => {
              updateDashboardMetrics();
            });
          }
        }
      });
    });

    document.addEventListener('DOMContentLoaded', () => {
      const viewDash = document.getElementById('view-dashboard');
      if (viewDash) {
        observer.observe(viewDash, { attributes: true });
      }
    });
  }

})();
