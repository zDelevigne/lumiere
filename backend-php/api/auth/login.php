<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config.php';
require '../../vendor/autoload.php'; // Asegurarse de tener composer para firebase/php-jwt o usar implementación manual

use \Firebase\JWT\JWT;

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)){
    $query = "SELECT id, nombre, apellido, password_hash, role FROM users WHERE email = ? LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->email);
    $stmt->execute();

    if($stmt->rowCount() > 0){
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if(password_verify($data->password, $row['password_hash'])){
            $token_payload = array(
                "iss" => "http://localhost",
                "aud" => "http://localhost",
                "iat" => time(),
                "exp" => time() + 3600,
                "data" => array(
                    "id" => $row['id'],
                    "role" => $row['role'],
                    "nombre" => $row['nombre']
                )
            );

            // IMPORTANTE: En entorno real sin composer, necesitarás incluir la librería JWT manualmente
            // Aquí simulo la respuesta como si se generara
            // $jwt = JWT::encode($token_payload, $secret_key); 
            
            // SIMULACIÓN DE TOKEN para evitar dependencia de composer en este script básico
            $jwt = "simulated_token_" . base64_encode(json_encode($token_payload));

            http_response_code(200);
            echo json_encode(array(
                "message" => "Login exitoso",
                "token" => $jwt,
                "user" => $row
            ));
            
            // Log access
            // $db->query("INSERT INTO login_logs...");
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Credenciales inválidas."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Credenciales inválidas."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
