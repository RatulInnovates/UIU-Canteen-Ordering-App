<?php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/helpers.php';

$ordersQuery = "
    SELECT o.*, u.name as customer_name 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status != 'cancelled'
    ORDER BY o.created_at ASC
";
$result = $pdo->query($ordersQuery);

$orders = [];
while ($row = $result->fetch()) {
    $itemQuery = $pdo->prepare("
        SELECT mi.name, oi.qty 
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.id
        WHERE oi.order_id = ?
    ");
    $itemQuery->execute([$row['id']]);
    
    $items = [];
    while ($item = $itemQuery->fetch()) {
        $items[] = $item['name'];
    }
    $row['items'] = $items;
    $orders[] = $row;
}
echo json_encode($orders, JSON_PRETTY_PRINT);
?>
