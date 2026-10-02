<?php
require_once __DIR__ . '/config/supabase.php';
require_once __DIR__ . '/includes/auth.php';

$view = $_GET['view'] ?? 'dashboard';

if ($view === 'login') {
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel de Administración - BuchiSapa PHP</title>
        <link rel="stylesheet" href="/php-admin/css/admin.css">
        <style>
            body { background: #0f172a; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .login-box { background: #1e293b; border-radius: 16px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .login-box h2 { text-align: center; color: #ef4444; margin-bottom: 20px; }
            .input-group { margin-bottom: 16px; }
            .input-group label { display: block; font-size: 13px; margin-bottom: 6px; color: #94a3b8; }
            .input-group input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; box-sizing: border-box; }
            .btn-submit { width: 100%; background: #dc2626; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2>🍗 BuchiSapa Admin</h2>
            <form action="/php-admin/api/auth.php" method="POST">
                <div class="input-group">
                    <label>Correo electrónico</label>
                    <input type="email" name="email" required placeholder="admin@buchisapa.pe">
                </div>
                <div class="input-group">
                    <label>Contraseña</label>
                    <input type="password" name="password" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn-submit">Ingresar al Panel</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Verificar sesión
checkAdminAuth();

$allowed_views = ['dashboard', 'productos', 'pedidos', 'caja', 'categorias', 'configuracion', 'delivery', 'insumos', 'portada', 'reportes', 'ticket', 'ubicacion', 'utensilios', 'ventas'];
if (!in_array($view, $allowed_views)) {
    $view = 'dashboard';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración PHP - BuchiSapa</title>
    <link rel="stylesheet" href="/php-admin/css/admin.css">
</head>
<body>
    <div class="admin-layout">
        <?php include __DIR__ . '/includes/sidebar.php'; ?>
        <div class="admin-main">
            <?php include __DIR__ . '/includes/topbar.php'; ?>
            <main class="admin-content">
                <?php 
                $view_file = __DIR__ . "/views/{$view}.php";
                if (file_exists($view_file)) {
                    include $view_file;
                } else {
                    echo "<h2>Vista en construcción</h2>";
                }
                ?>
            </main>
        </div>
    </div>
    <?php include __DIR__ . '/includes/modals.php'; ?>
    <script src="/php-admin/js/core/api.js"></script>
    <script src="/php-admin/js/core/estado.js"></script>
    <script src="/php-admin/js/core/utilidades.js"></script>
    <script src="/php-admin/js/admin.js"></script>
</body>
</html>
