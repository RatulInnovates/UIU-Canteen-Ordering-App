<?php
// backend/admin/promotions.php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/validate.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Read all promotions
    try {
        $stmt = $pdo->query("SELECT * FROM promotions ORDER BY created_at DESC");
        $promotions = $stmt->fetchAll();
        json_response('success', $promotions);
    } catch (PDOException $e) {
        json_response('error', 'Failed to retrieve promotions: ' . $e->getMessage());
    }
} elseif ($method === 'POST') {
    // Check if it's an action (toggle or delete) or a new creation
    $action = $_POST['action'] ?? '';

    if ($action === 'toggle') {
        $id = intval($_POST['id'] ?? 0);
        $status = sanitize_input($_POST['status'] ?? '');

        if (!$id || !in_array($status, ['active', 'queued', 'archived'])) {
            json_response('error', 'Invalid toggle parameters');
        }

        try {
            $stmt = $pdo->prepare("UPDATE promotions SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            json_response('success', 'Promotion status updated successfully');
        } catch (PDOException $e) {
            json_response('error', 'Failed to update status: ' . $e->getMessage());
        }
    } elseif ($action === 'delete') {
        $id = intval($_POST['id'] ?? 0);

        if (!$id) {
            json_response('error', 'Invalid ID for deletion');
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM promotions WHERE id = ?");
            $stmt->execute([$id]);
            json_response('success', 'Promotion deleted successfully');
        } catch (PDOException $e) {
            json_response('error', 'Failed to delete promotion: ' . $e->getMessage());
        }
    } else {
        // Create new promotion
        $title = sanitize_input($_POST['title'] ?? '');
        $discount_code = sanitize_input($_POST['discount_code'] ?? '');
        $target_role = sanitize_input($_POST['target_role'] ?? 'all');
        $active_days = sanitize_input($_POST['active_days'] ?? 'Everyday');
        $status = sanitize_input($_POST['status'] ?? 'queued');
        $image_url = sanitize_input($_POST['image_url'] ?? '');

        if (empty($title) || empty($discount_code)) {
            json_response('error', 'Title and discount code are required');
        }

        if (empty($image_url)) {
            $image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop';
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO promotions (title, discount_code, target_role, active_days, status, image_url) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $discount_code, $target_role, $active_days, $status, $image_url]);
            json_response('success', 'Promotion created successfully');
        } catch (PDOException $e) {
            json_response('error', 'Failed to create promotion: ' . $e->getMessage());
        }
    }
} else {
    json_response('error', 'Method not allowed');
}
?>
