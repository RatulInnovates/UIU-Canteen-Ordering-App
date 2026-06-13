<?php
require_once '../shared/db.php';
require_once '../shared/response.php';
require_once '../shared/validate.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Hardcoded staff ID for demo purposes, normally from session
$staff_id = 5; // Rahat Ahmed

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT name, email, student_id, settings FROM users WHERE id = ?");
    $stmt->execute([$staff_id]);
    $user = $stmt->fetch();
    
    if ($user) {
        $settings = $user['settings'] ? json_decode($user['settings'], true) : [
            'notif_orders' => true,
            'notif_stock' => false,
            'notif_sys' => true,
            'notif_sound' => false
        ];
        
        json_response('success', [
            'name' => $user['name'],
            'email' => $user['email'],
            'staff_id' => $user['student_id'] ?: 'UIU-STF-2024-889',
            'settings' => $settings
        ]);
    } else {
        json_response('error', 'Staff not found');
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $name = sanitize_input($data['name']);
    $email = sanitize_input($data['email']);
    $staff_id_num = sanitize_input($data['staff_id']);
    
    // Default or provided settings
    $settings = isset($data['settings']) ? json_encode($data['settings']) : null;
    
    $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, student_id = ?, settings = ? WHERE id = ?");
    if ($stmt->execute([$name, $email, $staff_id_num, $settings, $staff_id])) {
        json_response('success', 'Profile and settings updated successfully');
    } else {
        json_response('error', 'Failed to update profile');
    }
}
?>
