<?php
// backend/shared/session.php
session_start();

function require_role($role) {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== $role) {
        require_once 'response.php';
        json_response('error', 'Unauthorized access');
    }
}
?>
