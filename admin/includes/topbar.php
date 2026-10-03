<?php
/**
 * BUCHISAPA BURGER & BROASTER - BARRA SUPERIOR DE ESTADO (TOPBAR CONTRACT)
 * admin/includes/topbar.php
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$active_view = $_GET['view'] ?? 'dashboard';
$view_titles = [
    'dashboard' => 'Dashboard',
    'clientes' => 'Clientes',
    'productos' => 'Productos',
    'pedidos' => 'Pedidos y Comandas',
    'ticket' => 'Ticket y Boletas',
    'configuracion' => 'Configuración'
];
$active_title = $view_titles[$active_view] ?? 'Dashboard';
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
        
        <!-- User Badge Profile Card (Completely independent: no backgrounds, no border boxes, no wrappers) -->
        <div class="flex items-center gap-3 select-none cursor-pointer">
            <div class="text-right">
                <span id="topbar-admin-name" class="text-xs font-extrabold text-white block leading-tight truncate max-w-[120px]">Administrador</span>
                <span class="text-[9px] text-orange-500 font-bold uppercase tracking-widest block leading-none mt-1">Admin Principal</span>
            </div>
            <!-- Dynamic Avatar - Direct img element with NO borders, NO outer boxes, completely independent -->
            <img id="topbar-admin-img" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop" class="w-9 h-9 rounded-xl object-cover shadow-lg transition-transform duration-200 hover:scale-105" alt="Foto Administrador" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%232b1a0a%22/><text x=%2250%25%22 y=%2255%25%22 font-size=%2232%22 font-family=%22sans-serif%22 font-weight=%22bold%22 fill=%22%23f97316%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>AD</text></svg>';">
        </div>
    </div>
</header>
