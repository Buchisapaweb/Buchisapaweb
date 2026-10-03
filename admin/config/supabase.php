<?php
/**
 * BUCHISAPAWEB - Configuración de Supabase para el panel admin
 */

// 1. Supabase Config
define('SUPABASE_URL', getenv('NEXT_PUBLIC_SUPABASE_URL') ?: 'https://ckgvgfpcxeqyilfphnsu.supabase.co');
define('SUPABASE_KEY', getenv('SUPABASE_SERVICE_ROLE_KEY') ?: getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?: 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M');

/**
 * Realiza peticiones HTTP cURL a la API REST de Supabase
 */
function supabaseRequest($method, $endpoint, $data = null) {
    $url = rtrim(SUPABASE_URL, '/') . '/rest/v1/' . ltrim($endpoint, '/');
    $ch = curl_init($url);
    
    $headers = [
        'apikey: ' . SUPABASE_KEY,
        'Authorization: Bearer ' . SUPABASE_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}
?>
