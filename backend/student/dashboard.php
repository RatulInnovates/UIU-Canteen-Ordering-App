<?php
// backend/student/dashboard.php
require_once '../shared/session.php';
require_once '../shared/db.php';
require_once '../shared/response.php';

try {
    $data = [];

    // 1. Hero (Today's special)
    $stmt = $pdo->query("SELECT id, name, description, price, image_url, badge FROM menu_items WHERE available = 1 AND badge LIKE '%Special%' LIMIT 1");
    $hero = $stmt->fetch();
    if (!$hero) {
        $stmt = $pdo->query("SELECT id, name, description, price, image_url, badge FROM menu_items WHERE available = 1 ORDER BY price DESC LIMIT 1");
        $hero = $stmt->fetch();
    }
    $data['hero'] = $hero;

    // 2. Weekly Specials (3 items)
    $heroId = $hero ? $hero['id'] : 0;
    $stmt = $pdo->query("SELECT id, name, description, price, image_url, badge FROM menu_items WHERE available = 1 AND id != $heroId ORDER BY RAND() LIMIT 3");
    $data['weekly_specials'] = $stmt->fetchAll();

    // 3. Flash Sale (1 item)
    $stmt = $pdo->query("SELECT id, name, description, price, image_url, badge FROM menu_items WHERE available = 1 ORDER BY RAND() LIMIT 1");
    $flashItem = $stmt->fetch();
    if ($flashItem) {
        // Mock original price for UI
        $flashItem['original_price'] = number_format((float)$flashItem['price'] * 2, 2, '.', '');
    }
    $data['flash_sale'] = $flashItem;

    // 4. Main Menu (4 items)
    $stmt = $pdo->query("SELECT id, name, description, price, image_url, badge FROM menu_items WHERE available = 1 ORDER BY RAND() LIMIT 4");
    $data['main_menu'] = $stmt->fetchAll();

    json_response('success', $data);
} catch (PDOException $e) {
    json_response('error', 'Failed to fetch dashboard data: ' . $e->getMessage());
}
?>
