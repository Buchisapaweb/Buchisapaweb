<?php
/**
 * BUCHISAPA BURGER & BROASTER - DASHBOARD PANEL GENERAL
 * admin/views/dashboard.php
 * Con métricas en cero inicial, gráfica semanal de barras y 10 categorías sin scroll interno
 */
require_once __DIR__ . '/../config/supabase.php';

// Cargar todos los datos en caliente para calcular métricas
$perfilesRes = supabaseRequest('GET', 'perfiles?select=id');
$clientes = Array.isArray($perfilesRes['data']) ? $perfilesRes['data'] : [];

$productsRes = supabaseRequest('GET', 'products?select=*');
$productos = Array.isArray($productsRes['data']) ? $productsRes['data'] : [];

$ordersRes = supabaseRequest('GET', 'orders?select=*&order=created_at.desc');
$pedidos = Array.isArray($ordersRes['data']) ? $ordersRes['data'] : [];

// Calcular métricas principales
$ventas_totales = 0;
$pedidos_atendidos = 0;

// Calcular stock crítico
$stock_critico_count = 0;
foreach ($productos as $p) {
    $stk = intval($p['stock'] ?? 0);
    if ($stk <= 5) {
        $stock_critico_count++;
    }
}

// 10 Categorías oficiales de la carta de clientes
$categorias_def = [
    'promociones'       => ['name' => '⭐ PROMOCIONES', 'color' => '#f59e0b'],
    'alitas'            => ['name' => 'ALITAS', 'color' => '#ef4444'],
    'bebidas'           => ['name' => 'BEBIDAS', 'color' => '#06b6d4'],
    'broaster'          => ['name' => 'BROASTER', 'color' => '#f97316'],
    'hamburguesas'      => ['name' => 'HAMBURGUESAS', 'color' => '#eab308'],
    'infusiones'        => ['name' => 'INFUSIONES', 'color' => '#10b981'],
    'platos-amazonicos' => ['name' => 'PLATOS AMAZÓNICOS', 'color' => '#8b5cf6'],
    'refrescos'         => ['name' => 'REFRESCOS', 'color' => '#3b82f6'],
    'salchipapas'       => ['name' => 'SALCHIPAPAS Y SALCHIBROASTERS', 'color' => '#ec4899'],
    'adicional'         => ['name' => 'ADICIONAL', 'color' => '#94a3b8']
];

// Inicializar contenedores de cálculo en cero
$ventas_por_dia = [0, 0, 0, 0, 0, 0, 0];
$categorias_stats = [
    'promociones'       => 0,
    'alitas'            => 0,
    'bebidas'           => 0,
    'broaster'          => 0,
    'hamburguesas'      => 0,
    'infusiones'        => 0,
    'platos-amazonicos' => 0,
    'refrescos'         => 0,
    'salchipapas'       => 0,
    'adicional'         => 0
];

foreach ($pedidos as $o) {
    $st = strtolower($o['status'] ?? 'recibido');
    if ($st === 'entregado' || $st === 'completado') {
        $total = floatval($o['total'] ?? 0);
        $ventas_totales += $total;
        $pedidos_atendidos++;
        
        $created_at = $o['created_at'] ?? 'now';
        $day_index = intval(date('N', strtotime($created_at))) - 1; 
        if ($day_index >= 0 && $day_index <= 6) {
            $ventas_por_dia[$day_index] += $total;
        }
        
        $items_str = strtolower(json_encode($o['items'] ?? []));
        if (strpos($items_str, 'promocion') !== false || strpos($items_str, 'combo') !== false) {
            $categorias_stats['promociones'] += $total;
        } elseif (strpos($items_str, 'alitas') !== false) {
            $categorias_stats['alitas'] += $total;
        } elseif (strpos($items_str, 'gaseosa') !== false || strpos($items_str, 'bebida') !== false || strpos($items_str, 'incka') !== false || strpos($items_str, 'agua') !== false) {
            $categorias_stats['bebidas'] += $total;
        } elseif (strpos($items_str, 'broaster') !== false || strpos($items_str, 'pollo') !== false || strpos($items_str, 'brasa') !== false) {
            $categorias_stats['broaster'] += $total;
        } elseif (strpos($items_str, 'hamburguesa') !== false || strpos($items_str, 'burger') !== false) {
            $categorias_stats['hamburguesas'] += $total;
        } elseif (strpos($items_str, 'infusion') !== false || strpos($items_str, 'cafe') !== false || strpos($items_str, 'te') !== false || strpos($items_str, 'manzanilla') !== false) {
            $categorias_stats['infusiones'] += $total;
        } elseif (strpos($items_str, 'amazon') !== false || strpos($items_str, 'tacacho') !== false || strpos($items_str, 'cecina') !== false || strpos($items_str, 'juane') !== false || strpos($items_str, 'patacon') !== false) {
            $categorias_stats['platos-amazonicos'] += $total;
        } elseif (strpos($items_str, 'refresco') !== false || strpos($items_str, 'cocona') !== false || strpos($items_str, 'chicha') !== false || strpos($items_str, 'maracuya') !== false) {
            $categorias_stats['refrescos'] += $total;
        } elseif (strpos($items_str, 'salchipapa') !== false || strpos($items_str, 'salchibroaster') !== false) {
            $categorias_stats['salchipapas'] += $total;
        } else {
            $categorias_stats['adicional'] += $total;
        }
    }
}
?>
<div class="space-y-6 animate-fade-in">
    <!-- Top row branding overview -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/40 select-none">
        <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span class="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                Panel General
            </h2>
            <p class="text-xs text-slate-400 mt-1">Resumen analítico y operativo de la pollería: ventas, comandas, clientes y alertas de insumos</p>
        </div>
        <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1424] border border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 rounded-xl select-none">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Monitoreo Activo
            </span>
        </div>
    </div>

    <!-- 1. Metric Cards Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Metric 1: Sales -->
        <div class="stat-card">
            <div class="stat-icon stat-icon-emerald">
                <i data-lucide="trending-up" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="stat-title">Ventas Totales</span>
                <span class="stat-number">S/ <?php echo number_format($ventas_totales, 2); ?></span>
            </div>
        </div>

        <!-- Metric 2: Orders -->
        <div class="stat-card">
            <div class="stat-icon stat-icon-orange">
                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="stat-title">Pedidos Entregados</span>
                <span class="stat-number"><?php echo $pedidos_atendidos; ?></span>
            </div>
        </div>

        <!-- Metric 3: Clients -->
        <div class="stat-card">
            <div class="stat-icon stat-icon-violet">
                <i data-lucide="users" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="stat-title">Clientes Totales</span>
                <span class="stat-number"><?php echo count($clientes); ?></span>
            </div>
        </div>

        <!-- Metric 4: Critical Stock -->
        <div class="stat-card <?php echo $stock_critico_count > 0 ? 'animate-pulse-glow' : ''; ?>">
            <div class="stat-icon stat-icon-red">
                <i data-lucide="alert-triangle" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="stat-title">Insumos Críticos</span>
                <span class="stat-number <?php echo $stock_critico_count > 0 ? 'text-red-400 font-black animate-pulse' : 'text-white'; ?>"><?php echo $stock_critico_count; ?></span>
            </div>
        </div>
    </div>

    <!-- 2. Venta por Semana (Solo Barras) y Ventas por Categoría (Sin Scroll, Corrido) -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in select-none">
        
        <!-- Tarjeta 1: Gráfica Semanal de Barras (7 columnas en XL) -->
        <div class="xl:col-span-7 chart-card relative overflow-hidden group">
            <div class="chart-ambient-glow"></div>
            <div class="relative z-10">
                <div class="chart-card-header">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                            <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="chart-title">Venta por Semana</h3>
                            <span class="text-[10px] text-slate-400 font-medium">Facturación diaria de Lunes a Domingo</span>
                        </div>
                    </div>
                    
                    <span class="timeframe-badge">Semanal</span>
                </div>

                <!-- Canvas de Gráfica Semanal de Barras -->
                <div class="relative w-full h-64 sm:h-72 mt-2">
                    <canvas id="salesBarChart"></canvas>
                </div>
            </div>

            <!-- Resumen numérico semanal -->
            <div class="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-3 pt-4 mt-4 border-t border-slate-800/70">
                <div class="summary-stat-box">
                    <span class="summary-stat-label">Total Semanal</span>
                    <span class="summary-stat-value text-white" id="weekly-total-display">S/ 0.00</span>
                    <span class="summary-stat-sub text-slate-400">Facturado semana</span>
                </div>
                <div class="summary-stat-box">
                    <span class="summary-stat-label">Promedio Diario</span>
                    <span class="summary-stat-value text-emerald-400" id="weekly-avg-display">S/ 0.00</span>
                    <span class="summary-stat-sub text-slate-400">Facturación / día</span>
                </div>
                <div class="summary-stat-box">
                    <span class="summary-stat-label">Día Pico</span>
                    <span class="summary-stat-value text-orange-400" id="weekly-peak-display">-</span>
                    <span class="summary-stat-sub text-slate-400">Mayor venta</span>
                </div>
            </div>
        </div>

        <!-- Tarjeta 2: Ventas por Categoría (5 columnas en XL, todo corrido sin scroll) -->
        <div class="xl:col-span-5 chart-card relative overflow-hidden group">
            <div class="chart-ambient-glow-cyan"></div>
            <div class="relative z-10">
                <div class="chart-card-header">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <i data-lucide="pie-chart" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="chart-title">Ventas por Categoría</h3>
                            <span class="text-[10px] text-slate-400 font-medium">10 Categorías oficiales de la carta</span>
                        </div>
                    </div>
                    <span class="timeframe-badge">10 Categorías</span>
                </div>

                <!-- Gráfico Dona Circular con KPI central en cero -->
                <div class="relative w-full h-52 sm:h-56 flex items-center justify-center my-1">
                    <canvas id="categoryPieChart"></canvas>
                    <div class="donut-center-overlay pointer-events-none select-none" id="donut-center-kpi">
                        <span class="donut-center-title" id="donut-center-title">TOTAL VENTAS</span>
                        <span class="donut-center-amount" id="donut-center-amount">S/ 0.00</span>
                        <span class="donut-center-sub" id="donut-center-sub">10 Categorías</span>
                    </div>
                </div>

                <!-- Desglose de las 10 categorías TODO CORRIDO de frente para abajo (SIN SCROLL) -->
                <div class="mt-4 pt-4 border-t border-slate-800/70">
                    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                        <span>Línea del Menú</span>
                        <span>Participación y Venta</span>
                    </div>
                    <!-- Lista corrida uno debajo de otro sin límite de altura ni scrollbar -->
                    <div class="space-y-2" id="categories-breakdown-list">
                        <!-- Las 10 categorías se listan completas hacia abajo -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Contenedor de datos PHP/Server en cero inicial -->
<div id="chart-data" 
     class="hidden" 
     data-weekly="<?php echo htmlspecialchars(json_encode(array_values($ventas_por_dia))); ?>"
     data-categories='<?php echo htmlspecialchars(json_encode($categorias_stats)); ?>'>
</div>

<!-- Inyección inmediata en window con datos reales (en cero si no hay pedidos) -->
<script id="dashboard-runtime-payload">
    window.dashboardData = {
        weekly: <?php echo json_encode(array_values($ventas_por_dia)); ?>,
        categories: <?php echo json_encode($categorias_stats); ?>
    };
</script>
