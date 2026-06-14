<?php
// backend/student/menu.php
require_once '../shared/session.php';
require_once '../shared/db.php';
require_once '../shared/response.php';

try {
    // Only fetch items where available = 1
    $stmt = $pdo->query("SELECT id, name, description, price, category, image_url, badge FROM menu_items WHERE available = 1");
    $items = $stmt->fetchAll();
    
    json_response('success', $items);
} catch (PDOException $e) {
    json_response('error', 'Failed to fetch menu: ' . $e->getMessage());
}
?>