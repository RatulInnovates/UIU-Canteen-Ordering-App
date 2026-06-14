<?php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';

$_SERVER['REQUEST_METHOD'] = 'GET';

$ordersQuery = "
    SELECT o.id, o.token_no, o.status, o.created_at, u.name as customer_name 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status IN ('incoming', 'preparing')
    ORDER BY o.created_at ASC
";
$result = $pdo->query($ordersQuery);

$queue = [];
while ($row = $result->fetch()) {
    $itemQuery = $pdo->query("
        SELECT mi.name, mi.image_url 
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.id
        WHERE oi.order_id = " . intval($row['id']) . " LIMIT 1
    ");
    $item = $itemQuery->fetch();
    
    $row['item_name'] = $item ? $item['name'] : 'Mixed Order';
    $row['image_url'] = $item ? $item['image_url'] : 'https://via.placeholder.com/100';
    
    $created = new DateTime($row['created_at']);
    $now = new DateTime();
    $diff = $now->diff($created);
    $minutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
    $row['elapsed'] = sprintf("%02d:%02d", $minutes, $diff->s);
    
    $queue[] = $row;
}
echo json_encode($queue, JSON_PRETTY_PRINT);
?>
