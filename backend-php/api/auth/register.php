<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../../config.php';

$database = new Database(); // Asumiendo estructura de clase en config o incluirla
// Ajuste rápido: config.php arriba tenía código procedural, lo adaptaré aquí o mejor ajusto config.php para ser clase.

// REVISIÓN: El config.php anterior era procedural. Usaré la conexión global $conn definida en config.php.

global $conn;

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->nombre) && 
    !empty($data->email) && 
    !empty($data->password) &&
    !empty($data->username)
){
    $query = "INSERT INTO users SET nombre=:nombre, apellido=:apellido, username=:username, email=:email, password_hash=:password, direccion=:direccion, role='client'";
    
    $stmt = $conn->prepare($query);

    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    $stmt->bindParam(":nombre", $data->nombre);
    $stmt->bindParam(":apellido", $data->apellido);
    $stmt->bindParam(":username", $data->username);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":direccion", $data->direccion);

    try {
        if($stmt->execute()){
            http_response_code(201);
            echo json_encode(array("message" => "Usuario creado."));
        }
    } catch (PDOException $e) {
        http_response_code(503);
        echo json_encode(array("message" => "No se pudo crear el usuario. " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
