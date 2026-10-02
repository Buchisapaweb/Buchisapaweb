<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = supabaseRequest('GET', 'products?select=*');
    echo json_encode($res['data'] ?? []);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $res = supabaseRequest('POST', 'products', $input);
    echo json_encode($res);
    exit;
}
?>
