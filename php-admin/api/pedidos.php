<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = supabaseRequest('GET', 'orders?select=*&order=created_at.desc');
    echo json_encode($res['data'] ?? []);
    exit;
}

if ($method === 'POST' || $method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? ($input['id'] ?? null);
    if ($id) {
        $res = supabaseRequest('PATCH', "orders?id=eq.{$id}", $input);
        echo json_encode($res);
    } else {
        $res = supabaseRequest('POST', 'orders', $input);
        echo json_encode($res);
    }
    exit;
}
?>
