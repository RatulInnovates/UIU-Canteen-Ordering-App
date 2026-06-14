<?php
// backend/student/order.php
require_once '../shared/session.php';
require_once '../shared/db.php';
require_once '../shared/response.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    json_response('error', 'Please login to place an order');
}

$user_id = $_SESSION['user']['id'];
$input = json_decode(file_get_contents('php://input'), true);

$note = $input['note'] ?? '';
$payment_method = $input['payment_method'] ?? 'cash';
$total = 0;

try {
    // Start database transaction
    $pdo->beginTransaction();

    // 1. Fetch the user's cart securely from the database
    $stmt = $pdo->prepare("
        SELECT c.item_id, c.qty, m.price 
        FROM cart c
        JOIN menu_items m ON c.item_id = m.id
        WHERE c.user_id = ? AND m.available = 1
    ");
    $stmt->execute([$user_id]);
    $cart_items = $stmt->fetchAll();

    if (empty($cart_items)) {
        throw new Exception("Your tray is empty or items are no longer available.");
    }

    $order_items_data = [];
    
    // 2. Calculate totals dynamically 
    foreach ($cart_items as $item) {
        $qty = (int)$item['qty'];
        if ($qty <= 0) continue;

        $total += ($item['price'] * $qty);
        $order_items_data[] = [
            'item_id' => $item['item_id'],
            'qty' => $qty,
            'unit_price' => $item['price']
        ];
    }

    if ($total == 0) {
        throw new Exception("Invalid order total.");
    }

    $token_no = rand(100, 999); 

    // 3. Insert the main record into 'orders'
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, token_no, status, note, total, payment_method) VALUES (?, ?, 'incoming', ?, ?, ?)");
    $stmt->execute([$user_id, $token_no, $note, $total, $payment_method]);
    $order_id = $pdo->lastInsertId();

    // 4. Insert each individual food item into 'order_items'
    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES (?, ?, ?, ?)");
    foreach ($order_items_data as $oi) {
        $stmt->execute([$order_id, $oi['item_id'], $oi['qty'], $oi['unit_price']]);
    }

    // 5. Delete the cart contents from the database now that the order is finalized
    $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->execute([$user_id]);

    // Commit transaction
    $pdo->commit();

    json_response('success', [
        'message' => 'Order placed successfully',
        'order_id' => $order_id,
        'token_no' => $token_no
    ]);

} catch (Exception $e) {
    // If anything fails, rollback the transaction so no partial orders are saved
    $pdo->rollBack();
    json_response('error', $e->getMessage());
}
?>