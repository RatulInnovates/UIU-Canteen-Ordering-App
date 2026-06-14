<?php
// backend/ping.php
header("Content-Type: application/json");

// Corrected path to your db.php file
require_once 'shared/db.php';

try {
    // PDO doesn't have a ping() method, but running a simple query does the exact same check
    $pdo->query("SELECT 1");
    echo json_encode(["status" => "success", "message" => "Database connected successfully via PDO"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
}
?>