<?php
/**
 * BUCHISAPAWEB - Panel de Control Unificado
 * admin/index.php
 */
require_once __DIR__ . '/config/supabase.php';
require_once __DIR__ . '/includes/auth.php';

// Procesar acción de cerrar sesión con redirección infalible a /index.html de la raíz
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_destroy();
    if (!headers_sent()) {
        header('Location: /index.html');
    }
    echo '<script>window.location.replace("/index.html");</script>';
    exit;
}

// Verificar permisos de administrador compartidos con /public
checkAdminAuth();

// Obtener vista activa (por defecto dashboard)
$view = $_GET['view'] ?? 'dashboard';

$allowed_views = ['dashboard', 'clientes', 'productos', 'pedidos', 'ticket'];
if (!in_array($view, $allowed_views)) {
    $view = 'dashboard';
}

// 1. Incluir Cabecera de Página
include __DIR__ . '/includes/header.php';
?>

<div class="flex h-screen overflow-hidden">
    <!-- 2. Incluir Barra Lateral -->
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    
    <!-- Workspace Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 3. Incluir Barra Superior de Estado (Topbar Contract) -->
        <?php include __DIR__ . '/includes/topbar.php'; ?>
        
        <!-- Main Content Area with mobile-responsive padding (p-4 on small viewports) -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0b0f19]">
            <?php 
            $view_file = __DIR__ . "/views/{$view}.php";
            if (file_exists($view_file)) {
                include $view_file;
            } else {
                echo "<div class='p-8 bg-[#121829] rounded-2xl border border-slate-800 text-center'><h2 class='text-sm font-black uppercase text-red-500 tracking-wider'>Vista no encontrada ({$view})</h2></div>";
            }
            ?>
        </main>
    </div>
</div>

<!-- 4. Incluir Pie de Página y Motores de Script -->
<?php include __DIR__ . '/includes/footer.php'; ?>
