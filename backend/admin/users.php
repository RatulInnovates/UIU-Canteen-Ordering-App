<?php
// backend/admin/users.php
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/response.php';
require_once __DIR__ . '/../shared/validate.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Fetch all users
        $stmt = $pdo->query("SELECT id, name, email, role, student_id, created_at FROM users ORDER BY role ASC, name ASC");
        $users = $stmt->fetchAll();

        // Calculate counts
        $counts = [
            'total' => 0,
            'student' => 0,
            'staff' => 0,
            'admin' => 0
        ];
        foreach ($users as $user) {
            $counts['total']++;
            if (isset($counts[$user['role']])) {
                $counts[$user['role']]++;
            }
        }

        json_response('success', [
            'users' => $users,
            'counts' => $counts
        ]);
    } catch (PDOException $e) {
        json_response('error', 'Failed to retrieve users: ' . $e->getMessage());
    }
} elseif ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'change_role') {
        $id = intval($_POST['id'] ?? 0);
        $role = sanitize_input($_POST['role'] ?? '');

        if (!$id || !in_array($role, ['student', 'staff', 'admin'])) {
            json_response('error', 'Invalid role update parameters');
        }

        try {
            $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$role, $id]);
            json_response('success', 'User role updated successfully');
        } catch (PDOException $e) {
            json_response('error', 'Failed to update user role: ' . $e->getMessage());
        }
    } elseif ($action === 'delete') {
        $id = intval($_POST['id'] ?? 0);

        if (!$id) {
            json_response('error', 'Invalid ID for deletion');
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            json_response('success', 'User deleted successfully');
        } catch (PDOException $e) {
            json_response('error', 'Failed to delete user: ' . $e->getMessage());
        }
    } else {
        json_response('error', 'Invalid action');
    }
} else {
    json_response('error', 'Method not allowed');
}
?>
