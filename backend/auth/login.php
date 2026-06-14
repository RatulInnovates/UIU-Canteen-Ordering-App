<?php
require_once '../shared/session.php';
require_once '../shared/db.php';
require_once '../shared/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', 'Invalid request method');
}

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'student';

if (empty($email) || empty($password)) {
    json_response('error', 'Email and password are required');
}

$stmt = $pdo->prepare("SELECT id, name, email, password, role, student_id FROM users WHERE email = ? AND role = ?");
$stmt->execute([$email, $role]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    unset($user['password']); // Secure the session data
    $_SESSION['user'] = $user;
    
    json_response('success', [
        'message' => 'Login successful',
        'user' => $user
    ]);
} else {
    json_response('error', 'Invalid email or password');
}
?>