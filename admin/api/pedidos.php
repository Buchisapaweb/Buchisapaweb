<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $res = supabaseRequest('GET', "orders?id=eq.{$id}");
    } else {
        $res = supabaseRequest('GET', 'orders?select=*&order=created_at.desc');
    }
    echo json_encode($res['data'] ?? []);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $res = supabaseRequest('POST', 'orders', $input);
        echo json_encode(['success' => $res['code'] >= 200 && $res['code'] < 300, 'code' => $res['code'], 'data' => $res['data']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Payload vacío']);
    }
} elseif ($method === 'PATCH') {
    $id = $_GET['id'] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);
    if ($id && $input) {
        $res = supabaseRequest('PATCH', "orders?id=eq.{$id}", $input);
        echo json_encode(['success' => $res['code'] >= 200 && $res['code'] < 300, 'code' => $res['code'], 'data' => $res['data']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'ID o payload vacío']);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $res = supabaseRequest('DELETE', "orders?id=eq.{$id}");
        echo json_encode(['success' => $res['code'] >= 200 && $res['code'] < 300, 'code' => $res['code']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'ID vacío']);
    }
}
?>
