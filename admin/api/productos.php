<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';

$method = $_SERVER['REQUEST_METHOD'];
$jsonPath = __DIR__ . '/../../data/products.json';

function getLocalProducts($jsonPath) {
    if (file_exists($jsonPath)) {
        return json_decode(file_get_contents($jsonPath), true) ?: [];
    }
    return [];
}

function saveLocalProducts($jsonPath, $data) {
    file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $res = $id 
        ? supabaseRequest('GET', "products?id=eq.{$id}") 
        : supabaseRequest('GET', 'products?select=*&order=category.asc');
        
    $items = (is_array($res['data'] ?? null) && count($res['data']) > 0) ? $res['data'] : getLocalProducts($jsonPath);
    if ($id) {
        $filtered = array_values(array_filter($items, fn($p) => ($p['id'] ?? '') === $id));
        echo json_encode($filtered[0] ?? null);
    } else {
        echo json_encode($items);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $local = getLocalProducts($jsonPath);
        if (empty($input['id'])) {
            $input['id'] = 'prod-' . time() . '-' . rand(100, 999);
        }
        array_unshift($local, $input);
        saveLocalProducts($jsonPath, $local);
        
        $res = supabaseRequest('POST', 'products', $input);
        echo json_encode(['success' => true, 'data' => $input]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Payload vacío']);
    }
} elseif ($method === 'PATCH' || $method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);
    if ($id && $input) {
        $local = getLocalProducts($jsonPath);
        $found = false;
        foreach ($local as $idx => $item) {
            if (($item['id'] ?? '') === $id) {
                $local[$idx] = array_merge($item, $input);
                $found = true;
                break;
            }
        }
        if (!$found) $local[] = array_merge(['id' => $id], $input);
        saveLocalProducts($jsonPath, $local);

        $res = supabaseRequest('PATCH', "products?id=eq.{$id}", $input);
        echo json_encode(['success' => true, 'data' => $input]);
    } else {
        echo json_encode(['success' => false, 'error' => 'ID o payload vacío']);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $local = getLocalProducts($jsonPath);
        $local = array_values(array_filter($local, fn($p) => ($p['id'] ?? '') !== $id));
        saveLocalProducts($jsonPath, $local);

        $res = supabaseRequest('DELETE', "products?id=eq.{$id}");
        echo json_encode(['success' => true, 'deleted_id' => $id]);
    } else {
        echo json_encode(['success' => false, 'error' => 'ID vacío']);
    }
}
