<?php
/**
 * BUCHISAPAWEB - Sidebar de navegación responsiva para /admin
 */
$current_view = $_GET['view'] ?? 'dashboard';
?>

<!-- Mobile Sidebar Overlay (renders only behind mobile drawer) -->
<div id="sidebar-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/60 z-30 hidden lg:hidden transition-opacity"></div>

<!-- Sidebar Container -->
<aside id="admin-sidebar" class="fixed inset-y-0 left-0 w-64 bg-[#0f1424] border-r border-slate-800/80 flex flex-col justify-between z-40 shrink-0 h-full transition-transform duration-200 -translate-x-full lg:translate-x-0 lg:static">
    <div>
        <!-- Brand Identity Header: Now showing the official brand logo and only "BuchiSapa" as name -->
        <div class="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="/imagenes/logo/logo-buchisapa.webp" class="w-12 h-12 object-contain filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.3)] select-none transition-transform hover:scale-105 duration-200" alt="BuchiSapa Logo" onerror="this.style.display='none'">
                <div>
                    <h1 class="font-extrabold text-lg text-white leading-none tracking-tight select-none">BuchiSapa</h1>
                </div>
            </div>
            <!-- Mobile Close Button inside drawer -->
            <button onclick="toggleSidebar()" class="p-1.5 text-slate-400 hover:text-white lg:hidden">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>

        <!-- Navigation Slots: Dashboard -> Clientes -> Productos -> Pedidos -> Ticket -->
        <nav class="p-4 space-y-1">
            <p class="px-3 text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 select-none">Administración</p>
            
            <!-- 1. Dashboard Link -->
            <a href="/admin/index.php?view=dashboard" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 <?php echo $current_view === 'dashboard' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'; ?>">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Dashboard</span>
            </a>

            <!-- 2. Clientes Link -->
            <a href="/admin/index.php?view=clientes" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 <?php echo $current_view === 'clientes' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'; ?>">
                <i data-lucide="users" class="w-4 h-4"></i>
                <span>Cliente</span>
            </a>

            <!-- 3. Productos Link -->
            <a href="/admin/index.php?view=productos" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 <?php echo $current_view === 'productos' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'; ?>">
                <i data-lucide="chef-hat" class="w-4 h-4"></i>
                <span>Productos</span>
            </a>

            <!-- 4. Pedidos Link -->
            <a href="/admin/index.php?view=pedidos" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 <?php echo $current_view === 'pedidos' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'; ?>">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                <span>Pedidos</span>
            </a>

            <!-- 5. Ticket Link -->
            <a href="/admin/index.php?view=ticket" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 <?php echo $current_view === 'ticket' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'; ?>">
                <i data-lucide="ticket" class="w-4 h-4"></i>
                <span>Ticket</span>
            </a>
        </nav>
    </div>

    <!-- Sidebar Footer: Log Out button -->
    <div class="p-4 border-t border-slate-800/80 space-y-2 bg-[#0a0d1a]">
        <a href="/admin/index.php?action=logout" class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/15 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all text-center active-press shadow-sm shadow-red-500/5">
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span>Cerrar Sesión</span>
        </a>
    </div>
</aside>
