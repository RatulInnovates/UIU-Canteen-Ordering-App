<?php
require_once '../shared/db.php';
require_once '../shared/response.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // Today's Revenue
    $todayStart = date('Y-m-d 00:00:00');
    $stmt = $pdo->prepare("SELECT SUM(total) as revenue FROM orders WHERE status = 'collected' AND created_at >= ?");
    $stmt->execute([$todayStart]);
    $revenue = $stmt->fetch()['revenue'] ?: 0;
    
    // Top Items
    $stmt = $pdo->query("
        SELECT mi.name, mi.price, mi.image_url, SUM(oi.qty) as sales 
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'collected'
        GROUP BY mi.id 
        ORDER BY sales DESC 
        LIMIT 3
    ");
    $top_items = $stmt->fetchAll();
    
    // Recent Transactions
    $stmt = $pdo->query("
        SELECT o.id, o.total, o.status, o.created_at, GROUP_CONCAT(CONCAT(oi.qty, 'x ', mi.name) SEPARATOR ', ') as items_str
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.item_id = mi.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ");
    $transactions = [];
    while ($row = $stmt->fetch()) {
        $row['time_formatted'] = date('h:i A', strtotime($row['created_at']));
        $transactions[] = $row;
    }
    
    json_response('success', [
        'revenue' => number_format($revenue, 2),
        'top_items' => $top_items,
        'transactions' => $transactions
    ]);
}
?>
