<?php
require_once '../shared/session.php';
require_once '../shared/response.php';

// Useful for checking auth state from the frontend via fetch
if (!isset($_SESSION['user'])) {
    json_response('error', 'Unauthorized access');
}

if (basename($_SERVER['PHP_SELF']) === 'guard.php') {
    json_response('success', $_SESSION['user']);
}
?>