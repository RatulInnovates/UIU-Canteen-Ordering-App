<?php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch active orders
    $ordersQuery = "
        SELECT o.*, u.name as customer_name 
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status != 'cancelled'
        ORDER BY o.created_at ASC
    ";
    $result = $pdo->query($ordersQuery);
    
    $orders = [
        'incoming' => [],
        'preparing' => [],
        'ready' => [],
        'collected' => []
    ];
    
    while ($row = $result->fetch()) {
        $itemQuery = $pdo->prepare("
            SELECT mi.name, oi.qty 
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.id
            WHERE oi.order_id = ?
        ");
        $itemQuery->execute([$row['id']]);
        
        $items = [];
        $itemsCount = 0;
        while ($item = $itemQuery->fetch()) {
            $items[] = $item['name'] . ($item['qty'] > 1 ? " (x" . $item['qty'] . ")" : "");
            $itemsCount += $item['qty'];
        }
        $row['items_str'] = implode(', ', $items);
        $row['items_count'] = $itemsCount;
        $row['time_ago'] = get_time_ago($row['created_at']);
        
        $status = $row['status'];
        if (isset($orders[$status])) {
            $orders[$status][] = $row;
        }
    }
    
    json_response('success', $orders);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['action']) && $data['action'] === 'update_status') {
        $order_id = $data['order_id'];
        $new_status = $data['new_status'];
        
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        if ($stmt->execute([$new_status, $order_id])) {
            json_response('success', 'Status updated');
        } else {
            json_response('error', 'Failed to update status');
        }
    }
}
?>
