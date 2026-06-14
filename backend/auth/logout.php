<?php
require_once '../shared/session.php';
require_once '../shared/response.php';

session_destroy();
json_response('success', 'Logged out successfully');
?>