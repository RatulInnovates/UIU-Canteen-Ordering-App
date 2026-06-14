<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../shared/session.php';
require_once '../shared/db.php';
require_once '../shared/response.php';

// Simple debug logger (writes to backend/logs/register_debug.log)
function debug_log($entry) {
    $dir = __DIR__ . '/../logs';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $file = $dir . '/register_debug.log';
    $payload = date('c') . " - " . $_SERVER['REMOTE_ADDR'] . " - " . $entry . "\n";
    @file_put_contents($file, $payload, FILE_APPEND | LOCK_EX);
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    debug_log('Invalid request method: ' . $_SERVER['REQUEST_METHOD']);
    json_response('error', 'Invalid request method');
}

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$student_id = $_POST['student_id'] ?? null;
$role = $_POST['role'] ?? 'student'; 
$debug = (isset($_POST['_debug']) && $_POST['_debug'] === '1') || (isset($_GET['_debug']) && $_GET['_debug'] === '1');

// Log incoming data (exclude password content to avoid sensitive logging)
try {
    $log_post = $_POST;
    if (isset($log_post['password'])) $log_post['password'] = '***';
    debug_log('Incoming POST: ' . json_encode($log_post));
} catch (Exception $e) {
    // ignore logging errors
}

if (empty($name) || empty($email) || empty($password)) {
    json_response('error', 'Name, email, and password are required');
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_response('error', 'Email is already registered');
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, student_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $hashed_password, $role, $student_id]);
    debug_log('User inserted: ' . $email);
    json_response('success', 'Registration successful. You can now login.');
} catch (PDOException $e) {
    // Log the exception
    debug_log('PDOException: ' . $e->getMessage());
    if ($debug) {
        json_response('error', [
            'message' => 'Registration failed',
            'error' => $e->getMessage(),
            'post' => (isset($log_post) ? $log_post : $_POST)
        ]);
    } else {
        json_response('error', 'Registration failed: database error');
    }
}
?>