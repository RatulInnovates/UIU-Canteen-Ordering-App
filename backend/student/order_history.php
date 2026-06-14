<?php
require_once '../shared/session.php';
require_once '../shared/db.php';
require_once '../shared/response.php';

if (!isset($_SESSION['user'])) {
    json_response('error', 'Unauthorized');
}

$user_id = $_SESSION['user']['id'];

try {
    $stmt = $pdo->prepare("
        SELECT o.id, o.token_no, o.status, o.total, o.created_at,
               JSON_ARRAYAGG(JSON_OBJECT('name', m.name, 'qty', oi.qty, 'price', oi.unit_price)) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu_items m ON oi.item_id = m.id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ");
    
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll();

    // Decode the JSON grouping back into array format for the frontend
    foreach ($orders as &$order) {
        $order['items'] = json_decode($order['items']);
    }

    json_response('success', $orders);
} catch (PDOException $e) {
    json_response('error', 'Failed to fetch order history: ' . $e->getMessage());
}
?>