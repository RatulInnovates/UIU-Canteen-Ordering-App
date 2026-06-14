<?php
// backend/shared/response.php
// Ensures all our backend files send the exact JSON format the JavaScript expects
function json_response($status, $data_or_message) {
    header('Content-Type: application/json');
    if ($status === 'success') {
        echo json_encode(['status' => 'success', 'data' => $data_or_message]);
    } else {
        echo json_encode(['status' => 'error', 'message' => $data_or_message]);
    }
    exit();
}
?>