<?php
// backend/shared/helpers.php
function get_time_ago($datetime) {
    $created = new DateTime($datetime);
    $now = new DateTime();
    $diff = $now->diff($created);
    $minutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
    return $minutes . "m ago";
}
?>
