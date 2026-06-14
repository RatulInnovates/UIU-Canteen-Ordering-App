<?php
// backend/student/cart.php
require_once '../shared/session.php';
require_once '../shared/db.php';
require_once '../shared/response.php';

// Ensure user is logged in
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    json_response('error', 'Unauthorized access');
}

$user_id = $_SESSION['user']['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Read the cart directly from the database
    $stmt = $pdo->prepare("
        SELECT c.item_id as id, m.name, m.price, m.image_url, c.qty 
        FROM cart c
        JOIN menu_items m ON c.item_id = m.id
        WHERE c.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $cart_items = $stmt->fetchAll();
    
    // Format as associative array so frontend JS doesn't need to be changed
    $cart_assoc = [];
    foreach ($cart_items as $item) {
        $cart_assoc[$item['id']] = $item;
    }
    json_response('success', $cart_assoc);
} 
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'clear') {
        // Wipe all cart items for this specific user
        $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->execute([$user_id]);
        json_response('success', 'Cart has been emptied');
    } 
    elseif ($action === 'add') {
        $item_id = $input['item_id'] ?? null;
        $qty = $input['qty'] ?? 1;

        if (!$item_id) json_response('error', 'Item ID required');

        // Verify the item is actually available before allowing it in the cart
        $stmt = $pdo->prepare("SELECT id FROM menu_items WHERE id = ? AND available = 1");
        $stmt->execute([$item_id]);
        if (!$stmt->fetch()) {
            json_response('error', 'Item is currently unavailable');
        }

        // Check if the user already has this specific item in their cart
        $stmt = $pdo->prepare("SELECT id, qty FROM cart WHERE user_id = ? AND item_id = ?");
        $stmt->execute([$user_id, $item_id]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update quantity via raw SQL update
            $new_qty = $existing['qty'] + $qty;
            $update = $pdo->prepare("UPDATE cart SET qty = ? WHERE id = ?");
            $update->execute([$new_qty, $existing['id']]);
        } else {
            // Insert a brand new cart row
            $insert = $pdo->prepare("INSERT INTO cart (user_id, item_id, qty) VALUES (?, ?, ?)");
            $insert->execute([$user_id, $item_id, $qty]);
        }

        // Return the fresh cart state to update the UI badges
        $stmt = $pdo->prepare("
            SELECT c.item_id as id, m.name, m.price, m.image_url, c.qty 
            FROM cart c
            JOIN menu_items m ON c.item_id = m.id
            WHERE c.user_id = ?
        ");
        $stmt->execute([$user_id]);
        $cart_items = $stmt->fetchAll();
        
        $cart_assoc = [];
        foreach ($cart_items as $item) {
            $cart_assoc[$item['id']] = $item;
        }

        json_response('success', [
            'message' => 'Item added',
            'cart' => $cart_assoc
        ]);
    }
    else {
        json_response('error', 'Invalid action');
    }
}
?>