<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config.php';
global $conn;

$query = "SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.active = 1 
            ORDER BY p.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->execute();

$num = $stmt->rowCount();

if($num > 0){
    $products_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        extract($row);
        $product_item = array(
            "id" => $id,
            "name" => $name,
            "description" => html_entity_decode($description),
            "price" => $price,
            "stock" => $stock,
            "image_url" => $image_url,
            "category_name" => $category_name
        );
        array_push($products_arr, $product_item);
    }
    http_response_code(200);
    echo json_encode($products_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No se encontraron productos."));
}
?>
