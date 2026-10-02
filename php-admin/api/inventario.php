<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/supabase.php';

$res = supabaseRequest('GET', 'supplies?select=*');
echo json_encode(['success' => true, 'supplies' => $res['data'] ?? []]);
?>
