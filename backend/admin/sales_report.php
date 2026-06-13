<?php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    // CSV Download Action
    if ($action === 'download_csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=sales_report_' . date('Y-m-d') . '.csv');
        $output = fopen('php://output', 'w');
        
        // CSV Headers
        fputcsv($output, ['Transaction ID', 'Customer Name', 'Items Ordered', 'Status', 'Amount (BDT)', 'Created At']);

        $stmt = $pdo->query("
            SELECT o.id, u.name as customer_name, o.status, o.total, o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        ");

        while ($row = $stmt->fetch()) {
            // Get items for this order
            $itemStmt = $pdo->prepare("
                SELECT mi.name, oi.qty 
                FROM order_items oi
                JOIN menu_items mi ON oi.item_id = mi.id
                WHERE oi.order_id = ?
            ");
            $itemStmt->execute([$row['id']]);
            $items = [];
            while ($itemRow = $itemStmt->fetch()) {
                $items[] = $itemRow['name'] . ' (x' . $itemRow['qty'] . ')';
            }
            $itemsStr = implode(', ', $items);

            fputcsv($output, [
                '#TRX-' . $row['id'],
                $row['customer_name'],
                $itemsStr,
                strtoupper($row['status']),
                $row['total'],
                $row['created_at']
            ]);
        }
        fclose($output);
        exit();
    }

    // Default API response: stats, transactions list, crowd favorites
    // 1. Total Revenue
    $stmtRev = $pdo->query("SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE status != 'cancelled'");
    $totalRevenue = floatval($stmtRev->fetch()['total_revenue']);

    // 2. Total Orders
    $stmtCount = $pdo->query("SELECT COUNT(*) AS total_orders FROM orders WHERE status != 'cancelled'");
    $totalOrders = intval($stmtCount->fetch()['total_orders']);

    // 3. Recent Transactions
    $stmtTx = $pdo->query("
        SELECT o.id, u.name as customer_name, o.status, o.total, o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
    ");
    $transactions = [];
    while ($row = $stmtTx->fetch()) {
        $itemStmt = $pdo->prepare("
            SELECT mi.name, oi.qty 
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$row['id']]);
        $items = [];
        while ($itemRow = $itemStmt->fetch()) {
            $items[] = $itemRow['name'];
        }
        $row['items'] = implode(', ', $items);
        $transactions[] = $row;
    }

    // 4. Crowd Favorites (Top 3 overall menu items)
    $stmtFav = $pdo->query("
        SELECT mi.id, mi.name, mi.price, mi.image_url, COUNT(oi.id) as sales_count, mi.description
        FROM order_items oi
        JOIN menu_items mi ON oi.item_id = mi.id
        GROUP BY mi.id
        ORDER BY sales_count DESC
        LIMIT 3
    ");
    $favorites = [];
    while ($row = $stmtFav->fetch()) {
        // Mock average rating based on ID for visual variety
        $row['rating'] = number_format(4.5 + (($row['id'] % 5) * 0.1), 1);
        $favorites[] = $row;
    }

    json_response('success', [
        'total_revenue' => $totalRevenue,
        'total_orders' => $totalOrders,
        'transactions' => $transactions,
        'favorites' => $favorites
    ]);
} else {
    json_response('error', 'Method not allowed');
}
?>
