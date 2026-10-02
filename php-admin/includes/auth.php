<?php
session_start();

function checkAdminAuth() {
    if (!isset($_SESSION['admin_user']) || empty($_SESSION['admin_user'])) {
        header('Location: /php-admin/index.php?view=login');
        exit;
    }
}
?>
