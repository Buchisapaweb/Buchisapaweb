<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = supabaseRequest('GET', 'caja_movements?select=*&order=created_at.desc');
    echo json_encode(['success' => true, 'data' => $res['data'] ?? []]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $res = supabaseRequest('POST', 'caja_movements', $input);
    echo json_encode(['success' => true, 'movement' => $res['data'] ?? []]);
    exit;
}
?>
