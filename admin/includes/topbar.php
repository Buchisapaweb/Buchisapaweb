<?php
/**
 * BUCHISAPA BURGER & BROASTER - BARRA SUPERIOR DE ESTADO (TOPBAR CONTRACT)
 * admin/includes/topbar.php
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$active_view = $_GET['view'] ?? 'clientes';
$view_titles = [
    'clientes' => 'Clientes',
    'productos' => 'Productos',
    'pedidos' => 'Pedidos y Comandas'
];
$active_title = $view_titles[$active_view] ?? 'Clientes';
$user_email = $_SESSION['user']['email'] ?? $_SESSION['admin_user']['email'] ?? 'admin@buchisapa.pe';
?>
<!-- Topbar Header wrapper conforming to Top Bar Contract -->
<header class="h-16 border-b border-slate-800/80 bg-[#0f1424]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-30 sticky top-0">
    <!-- Zone 1: Brand & Toggle (Left) -->
    <div class="flex items-center gap-3">
        <!-- Sidebar Toggle Trigger for mobile view (natural thumb zone reachable) -->
        <button onclick="toggleSidebar()" class="lg:hidden flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-slate-800/50 active:scale-95 transition-all" aria-label="Abrir panel lateral">
            <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        
        <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">BuchiSapa</span>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">/</span>
            <span class="text-xs font-black text-white uppercase tracking-wider select-none"><?php echo htmlspecialchars($active_title); ?></span>
        </div>
    </div>

    <!-- Zone 2: Navigation Links or Indicators (Center) -->
    <div class="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400">
        <!-- Live indicators with subtle dot dividers -->
        <span class="flex items-center gap-1.5 text-emerald-400">
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Motor Supabase Conectado</span>
        </span>
        <span class="text-slate-700 select-none">&bull;</span>
        <span class="text-slate-500">Service Key Active</span>
    </div>

    <!-- Zone 3: Actions & Metrics (Right) -->
    <div class="flex items-center gap-3">
        <!-- Clock element with monospace font-variant -->
        <span id="topbar-clock" class="text-xs font-bold text-slate-400 font-mono-numbers bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800/60 hidden sm:inline select-none">
            <?php echo date('H:i:s'); ?>
        </span>
        
        <!-- User Badge Profile Card -->
        <div class="flex items-center gap-2 bg-[#121829] border border-slate-800/80 pl-3 pr-2.5 py-1.5 rounded-xl max-w-[180px] sm:max-w-none">
            <div class="text-right hidden sm:block">
                <span class="text-[10px] font-black text-white block truncate max-w-[110px]"><?php echo htmlspecialchars($user_email); ?></span>
                <span class="text-[9px] text-orange-500 font-bold uppercase tracking-wider block">Admin Principal</span>
            </div>
            <!-- Standard Avatar Circle representing Admin status -->
            <div class="w-7 h-7 bg-orange-500/10 border border-orange-500/20 text-orange-400 font-black text-[10px] rounded-lg flex items-center justify-center shrink-0 uppercase select-none">
                <?php echo substr($user_email, 0, 2); ?>
            </div>
        </div>
    </div>
</header>
