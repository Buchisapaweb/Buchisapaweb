/**
 * BUCHISAPA BURGER & BROASTER - DASHBOARD MODULE JS
 * admin/js/dashboard.js
 * Gráfica semanal exclusivamente de barras y 10 categorías en orden corrido vertical (sin scroll)
 * Datos en cero hasta registrar ventas reales en Supabase
 */

console.log("📊 Dashboard Module Initialized");

// 10 Categorías oficiales de clientes
const OFFICIAL_CATEGORIES = [
    { id: 'promociones',       name: '⭐ PROMOCIONES',               color: '#f59e0b' },
    { id: 'alitas',            name: 'ALITAS',                       color: '#ef4444' },
    { id: 'bebidas',           name: 'BEBIDAS',                      color: '#06b6d4' },
    { id: 'broaster',          name: 'BROASTER',                     color: '#f97316' },
    { id: 'hamburguesas',      name: 'HAMBURGUESAS',                 color: '#eab308' },
    { id: 'infusiones',        name: 'INFUSIONES',                   color: '#10b981' },
    { id: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS',            color: '#8b5cf6' },
    { id: 'refrescos',         name: 'REFRESCOS',                    color: '#3b82f6' },
    { id: 'salchipapas',       name: 'SALCHIPAPAS Y SALCHIBROASTERS', color: '#ec4899' },
    { id: 'adicional',         name: 'ADICIONAL',                    color: '#94a3b8' }
];

let weeklyChartInstance = null;
let categoryChartInstance = null;

function initDashboardCharts() {
    const canvasBar = document.getElementById('salesBarChart');
    const canvasPie = document.getElementById('categoryPieChart');
    
    if (!canvasBar || !canvasPie) {
        return;
    }
    
    if (typeof Chart === 'undefined') {
        setTimeout(initDashboardCharts, 150);
        return;
    }

    // Datos estrictamente en cero hasta registrar ventas
    let weeklyData = [0, 0, 0, 0, 0, 0, 0];
    let categoriesStats = {
        'promociones':       0,
        'alitas':            0,
        'bebidas':           0,
        'broaster':          0,
        'hamburguesas':      0,
        'infusiones':        0,
        'platos-amazonicos': 0,
        'refrescos':         0,
        'salchipapas':       0,
        'adicional':         0
    };

    // Sincronizar con datos inyectados por PHP / Express Server
    if (window.dashboardData) {
        if (Array.isArray(window.dashboardData.weekly) && window.dashboardData.weekly.length === 7) {
            weeklyData = window.dashboardData.weekly.map(v => parseFloat(v || 0));
        }
        if (window.dashboardData.categories && typeof window.dashboardData.categories === 'object') {
            categoriesStats = { ...categoriesStats, ...window.dashboardData.categories };
        }
    } else {
        const dataContainer = document.getElementById('chart-data');
        if (dataContainer) {
            try {
                const rawWeekly = dataContainer.getAttribute('data-weekly');
                const rawCategories = dataContainer.getAttribute('data-categories');
                if (rawWeekly && !rawWeekly.startsWith('<?php') && rawWeekly.trim() !== '') {
                    const parsedWeekly = JSON.parse(rawWeekly);
                    if (Array.isArray(parsedWeekly) && parsedWeekly.length === 7) {
                        weeklyData = parsedWeekly.map(v => parseFloat(v || 0));
                    }
                }
                if (rawCategories && !rawCategories.startsWith('<?php') && rawCategories.trim() !== '') {
                    const parsedCat = JSON.parse(rawCategories);
                    if (parsedCat && typeof parsedCat === 'object') {
                        categoriesStats = { ...categoriesStats, ...parsedCat };
                    }
                }
            } catch (e) {
                console.warn('Error al leer atributos de chart-data:', e);
            }
        }
    }

    // =========================================================================
    // 1. GRÁFICA SEMANAL: EXCLUSIVAMENTE GRÁFICO DE BARRAS
    // =========================================================================
    const daysLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const totalWeekly = weeklyData.reduce((acc, v) => acc + v, 0);
    const avgDaily = totalWeekly > 0 ? (totalWeekly / 7) : 0;
    
    let peakIndex = -1;
    let peakValue = 0;
    for (let i = 0; i < weeklyData.length; i++) {
        if (weeklyData[i] > peakValue) {
            peakValue = weeklyData[i];
            peakIndex = i;
        }
    }

    const elTotal = document.getElementById('weekly-total-display');
    const elAvg = document.getElementById('weekly-avg-display');
    const elPeak = document.getElementById('weekly-peak-display');

    if (elTotal) elTotal.textContent = 'S/ ' + totalWeekly.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (elAvg) elAvg.textContent = 'S/ ' + avgDaily.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (elPeak) {
        if (peakIndex >= 0 && peakValue > 0) {
            elPeak.textContent = daysLabels[peakIndex] + ' (S/ ' + peakValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ')';
        } else {
            elPeak.textContent = '-';
        }
    }

    const ctxBar = canvasBar.getContext('2d');
    const barGradient = ctxBar.createLinearGradient(0, 0, 0, 260);
    barGradient.addColorStop(0, 'rgba(249, 115, 22, 0.95)');
    barGradient.addColorStop(0.6, 'rgba(249, 115, 22, 0.40)');
    barGradient.addColorStop(1, 'rgba(249, 115, 22, 0.05)');

    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    weeklyChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: daysLabels,
            datasets: [{
                label: 'Ventas Diarias (S/)',
                data: weeklyData,
                backgroundColor: barGradient,
                borderColor: '#f97316',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.55
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#0f1424',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(249, 115, 22, 0.4)',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ' Total: S/ ' + context.parsed.y.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 11,
                            weight: '700'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    suggestedMax: 100,
                    grid: {
                        color: 'rgba(51, 65, 85, 0.18)',
                        borderDash: [4, 4],
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 10,
                            weight: '600'
                        },
                        callback: function(value) {
                            return 'S/ ' + value;
                        }
                    }
                }
            }
        }
    });

    // =========================================================================
    // 2. GRÁFICA CIRCULAR DE VENTAS POR CATEGORÍA
    // =========================================================================
    const ctxPie = canvasPie.getContext('2d');
    const totalCategorySales = Object.values(categoriesStats).reduce((acc, v) => acc + v, 0);

    const kpiTitle = document.getElementById('donut-center-title');
    const kpiAmount = document.getElementById('donut-center-amount');
    const kpiSub = document.getElementById('donut-center-sub');

    function resetCenterKpi() {
        if (kpiTitle) {
            kpiTitle.textContent = 'TOTAL VENTAS';
            kpiTitle.style.color = '#94a3b8';
        }
        if (kpiAmount) kpiAmount.textContent = 'S/ ' + totalCategorySales.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (kpiSub) {
            kpiSub.textContent = '10 Categorías';
            kpiSub.style.color = '#f97316';
        }
    }

    function setCenterKpi(name, amount, pct, color) {
        if (kpiTitle) {
            kpiTitle.textContent = name;
            kpiTitle.style.color = color;
        }
        if (kpiAmount) kpiAmount.textContent = 'S/ ' + amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (kpiSub) {
            kpiSub.textContent = pct + '% del menú';
            kpiSub.style.color = color;
        }
    }

    resetCenterKpi();

    const categoryLabels = OFFICIAL_CATEGORIES.map(c => c.name);
    const categoryColors = OFFICIAL_CATEGORIES.map(c => c.color);
    const categoryValues = OFFICIAL_CATEGORIES.map(c => parseFloat(categoriesStats[c.id] || 0));

    // Si los datos están en 0, mostrar anillo neutral elegante
    let chartValues = categoryValues;
    let chartColors = categoryColors;
    if (totalCategorySales <= 0) {
        chartValues = OFFICIAL_CATEGORIES.map(() => 1);
        chartColors = OFFICIAL_CATEGORIES.map(c => c.color + '35'); // 20% opacity outline
    }

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: chartValues,
                backgroundColor: chartColors,
                borderWidth: 3,
                borderColor: '#0b0f19',
                hoverBorderColor: '#ffffff',
                hoverBorderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                duration: 750
            },
            onHover: (event, activeElements) => {
                if (activeElements && activeElements.length > 0) {
                    const idx = activeElements[0].index;
                    const cat = OFFICIAL_CATEGORIES[idx];
                    const val = categoryValues[idx];
                    const pct = totalCategorySales > 0 ? ((val / totalCategorySales) * 100).toFixed(1) : '0.0';
                    setCenterKpi(cat.name, val, pct, cat.color);
                } else {
                    resetCenterKpi();
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            cutout: '72%'
        }
    });

    // =========================================================================
    // 3. DESGLOSE DE LAS 10 CATEGORÍAS TODO CORRIDO HACIA ABAJO (SIN SCROLL)
    // =========================================================================
    const breakdownContainer = document.getElementById('categories-breakdown-list');
    if (breakdownContainer) {
        let html = '';
        OFFICIAL_CATEGORIES.forEach((cat, idx) => {
            const val = categoryValues[idx];
            const pct = totalCategorySales > 0 ? ((val / totalCategorySales) * 100).toFixed(1) : '0.0';

            html += `
            <div class="category-breakdown-row select-none" data-cat-id="${cat.id}" data-cat-index="${idx}">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="text-[9px] font-mono-numbers font-black text-slate-500 w-3 text-right">#${idx + 1}</span>
                        <span class="category-color-dot" style="background-color: ${cat.color}; color: ${cat.color};"></span>
                        <span class="font-extrabold text-white truncate text-[11px]">${cat.name}</span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="font-mono-numbers font-black text-slate-300 text-[11px]">S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span class="text-[9px] font-black px-1.5 py-0.5 rounded font-mono-numbers" style="background-color: ${cat.color}20; border: 1px solid ${cat.color}45; color: ${cat.color};">
                            ${pct}%
                        </span>
                    </div>
                </div>
                <div class="category-progress-track">
                    <div class="category-progress-bar" style="width: ${pct}%; background-color: ${cat.color}; box-shadow: 0 0 6px ${cat.color}40;"></div>
                </div>
            </div>
            `;
        });

        breakdownContainer.innerHTML = html;

        // Hover bidireccional entre lista y dona
        breakdownContainer.querySelectorAll('.category-breakdown-row').forEach(row => {
            const idx = parseInt(row.getAttribute('data-cat-index'), 10);
            const cat = OFFICIAL_CATEGORIES[idx];
            const val = categoryValues[idx];
            const pct = totalCategorySales > 0 ? ((val / totalCategorySales) * 100).toFixed(1) : '0.0';

            row.addEventListener('mouseenter', () => {
                row.classList.add('active');
                setCenterKpi(cat.name, val, pct, cat.color);
                if (categoryChartInstance) {
                    categoryChartInstance.setActiveElements([{ datasetIndex: 0, index: idx }]);
                    categoryChartInstance.render();
                }
            });

            row.addEventListener('mouseleave', () => {
                row.classList.remove('active');
                resetCenterKpi();
                if (categoryChartInstance) {
                    categoryChartInstance.setActiveElements([]);
                    categoryChartInstance.render();
                }
            });
        });
    }
}

// Inicializar cuando el DOM y los scripts estén listos
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardCharts);
} else {
    initDashboardCharts();
}
