<?php
// backend/shared/session.php
// Starts the session securely if it hasn't been started yet
if (session_status() === PHP_SESSION_NONE) {
    // Set cookie parameters for extra security (optional but recommended)
    session_set_cookie_params([
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}
?>