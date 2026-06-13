<?php
// backend/shared/db.php

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'uiu_canteen';

try {
    // First, connect without DB to check/create it
    $pdo = new PDO("mysql:host=$host;charset=utf8", $user, $password);
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
    // If we can't connect at all, die
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}
?>
