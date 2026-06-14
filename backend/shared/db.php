<?php
// backend/shared/db.php

$host = '127.0.0.1'; // Forces TCP connection to respect the port
$port = '3307';      // Your specific MariaDB port
$user = 'root';      // Kept as root
$password = '12345'; // The password you set in the terminal
$dbname = 'uiu_canteen';

try {
    // Inject the port into the PDO connection string
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Check if database exists
    $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$dbname'");
    if (!$stmt->fetch()) {
        // Create DB if it doesn't exist
        $pdo->exec("CREATE DATABASE `$dbname`");
        $pdo->exec("USE `$dbname`");
        
        // Run schema
        $schema = file_get_contents(__DIR__ . '/../db/schema.sql');
        if ($schema) $pdo->exec($schema);
        
        // Run seed
        $seed = file_get_contents(__DIR__ . '/../db/seed.sql');
        if ($seed) $pdo->exec($seed);
    } else {
        // If exists, just select it
        $pdo->exec("USE `$dbname`");
    }
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}
?>