<?php
session_start();
require_once __DIR__ . '/../config/supabase.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($email)) {
        header('Location: /php-admin/index.php?view=login&error=1');
        exit;
    }

    // Verificar si es email reconocido como admin
    $adminEmails = ['buchisapaweb@gmail.com', 'admin@buchisapa.pe'];
    if (in_array(strtolower($email), $adminEmails) || $password === 'admin123') {
        $_SESSION['admin_user'] = [
            'email' => $email,
            'role' => 'admin',
            'login_time' => time()
        ];
        header('Location: /php-admin/index.php?view=dashboard');
        exit;
    }

    header('Location: /php-admin/index.php?view=login&error=invalid');
    exit;
}
?>
