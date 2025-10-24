<?php
require_once __DIR__ . '/db.php';
$username = $_GET['username'] ?? null;
$password = $_GET['password'] ?? null;
$stream_id = $_GET['stream_id'] ?? null;
if (!$username || !$password) { http_response_code(400); echo 'missing'; exit; }
$stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND password = ? AND active = 1");
$stmt->execute([$username,$password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { http_response_code(401); echo 'invalid'; exit; }
header('Content-Type: audio/mpegurl; charset=utf-8');
echo "#EXTM3U
";
if ($stream_id) {
    $stmt = $db->prepare("SELECT * FROM channels WHERE stream_id = ?");
    $stmt->execute([$stream_id]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($r) {
        echo '#EXTINF:-1 tvg-id="'.$r['stream_id'].'" tvg-name="'.$r['name'].'" tvg-logo="'.$r['logo'].'",'.$r['name']."
";
        echo $r['url']."
";
    }
    exit;
}
$stmt = $db->query("SELECT * FROM channels ORDER BY category, name");
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
    echo '#EXTINF:-1 tvg-id="'.$r['stream_id'].'" tvg-name="'.$r['name'].'" tvg-logo="'.$r['logo'].'",'.$r['name']."
";
    echo $r['url']."
";
}
