<?php
// Simple Router logic
$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Quitar query params
$request = strtok($request, '?');

// Rutas básicas (adaptar según la estructura de carpetas en Hostinger)
// Asumiendo que el script se corre en /api/

if (strpos($request, '/api/auth/login') !== false) {
    require 'api/auth/login.php';
} elseif (strpos($request, '/api/auth/register') !== false) {
    require 'api/auth/register.php';
} elseif (strpos($request, '/api/products') !== false) {
    if ($method == 'GET') {
        require 'api/products/read.php';
    } elseif ($method == 'POST') {
        require 'api/products/create.php';
    }
} elseif (strpos($request, '/api/orders') !== false) {
    require 'api/orders/create.php';
} else {
    // Si es index principal o 404
    if ($request == '/' || $request == '/api/') {
        echo json_encode(["message" => "API PHP Funcionando"]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Ruta no encontrada"]);
    }
}
?>
