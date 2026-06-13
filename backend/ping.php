<?php
// backend/ping.php
header("Content-Type: application/json");
require_once 'db.php';

// Use mysqli::ping to verify connection is alive
if ($conn->ping()) {
    echo json_encode(["status" => "success", "message" => "Database connected"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>
