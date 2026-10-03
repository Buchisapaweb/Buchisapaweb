<?php
/**
 * BUCHISAPAWEB - Autenticación y chequeo de rol para /admin
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function checkAdminAuth() {
    // Se obtiene el usuario logueado desde la sesión compartida con /public o /
    $user = $_SESSION['user'] ?? $_SESSION['admin_user'] ?? null;
    $role = $user['role'] ?? null;
    
    // Si no está autenticado o no es admin, redirigir al login del sitio principal
    if (!$user || $role !== 'admin') {
        // En desarrollo local o para pruebas se puede permitir bypass si se desea,
        // pero para Hostinger redirigirá de inmediato al home client-side.
        header('Location: /#login?redirect=admin');
        exit;
    }
}
?>
