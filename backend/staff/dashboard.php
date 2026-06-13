<?php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'get_menu') {
        $stmt = $pdo->query("SELECT id, name, price FROM menu_items WHERE available = 1");
        json_response('success', $stmt->fetchAll());
    }
    
    // Default: Get live queue (incoming and preparing)
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
    
    json_response('success', $queue);
    
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['action']) && $data['action'] === 'create_order') {
        $item_id = $data['item_id'];
        $token_no = $data['token_no'];
        
        $stmt = $pdo->query("SELECT id FROM users WHERE email = 'walkin@uiu.edu'");
        $userRow = $stmt->fetch();
        
        if (!$userRow) {
            $pdo->query("INSERT INTO users (name, email, password, role) VALUES ('Walk-in Customer', 'walkin@uiu.edu', '123456', 'student')");
            $user_id = $pdo->lastInsertId();
        } else {
            $user_id = $userRow['id'];
        }
        
        $stmt = $pdo->prepare("SELECT price FROM menu_items WHERE id = ?");
        $stmt->execute([$item_id]);
        $priceRow = $stmt->fetch();
        
        if (!$priceRow) {
            json_response('error', 'Item not found');
        }
        $item_price = $priceRow['price'];
        
        $stmt = $pdo->prepare("INSERT INTO orders (user_id, token_no, status, total) VALUES (?, ?, 'incoming', ?)");
        if ($stmt->execute([$user_id, $token_no, $item_price])) {
            $order_id = $pdo->lastInsertId();
            $stmt_item = $pdo->prepare("INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES (?, ?, 1, ?)");
            $stmt_item->execute([$order_id, $item_id, $item_price]);
            
            json_response('success', 'Order created');
        } else {
            json_response('error', 'Failed to create order');
        }
    }
}
?>
