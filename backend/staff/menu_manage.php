<?php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/validate.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all menu items
    $stmt = $pdo->query("SELECT * FROM menu_items ORDER BY created_at DESC");
    $items = $stmt->fetchAll();
    
    // Also fetch stats
    $activeCount = $pdo->query("SELECT COUNT(*) as count FROM menu_items WHERE available = 1")->fetch()['count'];
    $soldOutCount = $pdo->query("SELECT COUNT(*) as count FROM menu_items WHERE available = 0")->fetch()['count'];
    
    json_response('success', [
        "items" => $items,
        "stats" => [
            "active" => $activeCount,
            "sold_out" => $soldOutCount
        ]
    ]);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $action = $data['action'] ?? '';
    
    if ($action === 'toggle') {
        $id = $data['id'];
        $stmt = $pdo->prepare("UPDATE menu_items SET available = NOT available WHERE id = ?");
        if ($stmt->execute([$id])) {
            json_response('success', 'Toggled availability');
        } else {
            json_response('error', 'Failed to toggle');
        }
    }
    
    if ($action === 'delete') {
        $id = $data['id'];
        $stmt = $pdo->prepare("DELETE FROM menu_items WHERE id = ?");
        if ($stmt->execute([$id])) {
            json_response('success', 'Item deleted');
        } else {
            json_response('error', 'Failed to delete');
        }
    }

    // Add new item
    $name = sanitize_input($data['name']);
    $description = sanitize_input($data['description']);
    $price = floatval($data['price']);
    $category = sanitize_input($data['category']);
    $image_url = sanitize_input($data['image_url'] ?? '');
    
    $stmt = $pdo->prepare("INSERT INTO menu_items (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $description, $price, $category, $image_url])) {
        json_response('success', ['id' => $pdo->lastInsertId()]);
    } else {
        json_response('error', 'Failed to add item');
    }
}
?>
