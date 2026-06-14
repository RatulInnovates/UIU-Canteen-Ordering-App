<?php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Daily Revenue (Today's orders excluding cancelled)
    $stmtRevenue = $pdo->query("
        SELECT COALESCE(SUM(total), 0) AS daily_revenue 
        FROM orders 
        WHERE DATE(created_at) = CURRENT_DATE() AND status != 'cancelled'
    ");
    $dailyRevenue = floatval($stmtRevenue->fetch()['daily_revenue']);

    // 2. Active Orders counts (Incoming + Preparing)
    $stmtActive = $pdo->query("
        SELECT status, COUNT(*) as count 
        FROM orders 
        WHERE status IN ('incoming', 'preparing') 
        GROUP BY status
    ");
    $activeIncoming = 0;
    $activePreparing = 0;
    while ($row = $stmtActive->fetch()) {
        if ($row['status'] === 'incoming') {
            $activeIncoming = intval($row['count']);
        } elseif ($row['status'] === 'preparing') {
            $activePreparing = intval($row['count']);
        }
    }
    $totalActive = $activeIncoming + $activePreparing;

    // 3. Today vs Yesterday orders (Capacity ratio)
    $stmtTodayCount = $pdo->query("SELECT COUNT(*) AS count FROM orders WHERE DATE(created_at) = CURRENT_DATE()");
    $todayCount = intval($stmtTodayCount->fetch()['count']);

    $stmtYesterdayCount = $pdo->query("SELECT COUNT(*) AS count FROM orders WHERE DATE(created_at) = CURRENT_DATE() - INTERVAL 1 DAY");
    $yesterdayCount = intval($stmtYesterdayCount->fetch()['count']);

    // Avoid division by zero, standard capacity comparison
    if ($yesterdayCount > 0) {
        $capacityPercentage = round(($todayCount / $yesterdayCount) * 100);
    } else {
        $capacityPercentage = $todayCount > 0 ? 100 : 0; // fallback if no orders yesterday
    }

    // 4. Top Performing Items (Join order_items & menu_items, group by item_id, sum qty and revenue)
    $topItemsQuery = "
        SELECT mi.id, mi.name, mi.price, mi.image_url, COUNT(oi.id) as sales_count, COALESCE(SUM(oi.qty * oi.unit_price), 0) as revenue
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.id
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) = CURRENT_DATE() AND o.status != 'cancelled'
        GROUP BY mi.id
        ORDER BY sales_count DESC, revenue DESC
        LIMIT 5
    ";
    $stmtTopItems = $pdo->query($topItemsQuery);
    $topItems = $stmtTopItems->fetchAll();

    // Fallback: If no sales today, show overall top items to prevent blank dashboard
    if (empty($topItems)) {
        $overallTopItemsQuery = "
            SELECT mi.id, mi.name, mi.price, mi.image_url, COUNT(oi.id) as sales_count, COALESCE(SUM(oi.qty * oi.unit_price), 0) as revenue
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY mi.id
            ORDER BY sales_count DESC, revenue DESC
            LIMIT 5
        ";
        $stmtTopItems = $pdo->query($overallTopItemsQuery);
        $topItems = $stmtTopItems->fetchAll();
    }

    // 5. Daily Revenue (Last 7 Days)
    $chartData = [];
    for ($i = 6; $i >= 0; $i--) {
        $dateStr = date('Y-m-d', strtotime("-$i days"));
        $label = date('M d', strtotime("-$i days"));
        $chartData[$dateStr] = [
            'label' => $label,
            'value' => 0.0
        ];
    }

    try {
        $stmtDaily = $pdo->query("
            SELECT DATE(created_at) AS order_date, COALESCE(SUM(total), 0) AS total_amount
            FROM orders
            WHERE created_at >= CURRENT_DATE() - INTERVAL 6 DAY AND status != 'cancelled'
            GROUP BY DATE(created_at)
        ");
        while ($row = $stmtDaily->fetch()) {
            $orderDate = $row['order_date'];
            if (isset($chartData[$orderDate])) {
                $chartData[$orderDate]['value'] = floatval($row['total_amount']);
            }
        }
    } catch (PDOException $e) {
        // Log or handle error, keep 0 values
    }
    $chartData = array_values($chartData);

    // 6. Recent Orders
    require_once __DIR__ . '/../shared/helpers.php';
    $stmtRecent = $pdo->query("
        SELECT o.id, u.name as customer_name, o.token_no, o.status, o.total, o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
    ");
    $recentOrders = [];
    while ($row = $stmtRecent->fetch()) {
        $row['time_ago'] = get_time_ago($row['created_at']);
        $recentOrders[] = $row;
    }

    json_response('success', [
        'daily_revenue' => $dailyRevenue,
        'active_orders' => $totalActive,
        'in_queue' => $activeIncoming,
        'preparing' => $activePreparing,
        'capacity_percentage' => $capacityPercentage,
        'top_items' => $topItems,
        'hourly_revenue' => $chartData,
        'recent_orders' => $recentOrders
    ]);
} else {
    json_response('error', 'Method not allowed');
}
?>
