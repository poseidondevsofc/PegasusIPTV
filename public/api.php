<?php
require_once __DIR__ . '/db.php';
function jsonExit($data){ header('Content-Type: application/json; charset=utf-8'); echo json_encode($data); exit; }
$action = $_GET['action'] ?? null;
$username = $_GET['username'] ?? null;
$password = $_GET['password'] ?? null;
if (!$username || !$password) { http_response_code(400); echo 'ERR: missing credentials'; exit; }
$stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND password = ? AND active = 1");
$stmt->execute([$username,$password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { http_response_code(401); echo 'ERR: invalid user'; exit; }
if ($action === 'get_live_streams') {
    $rows = $db->query('SELECT id,name,stream_id,logo,category FROM channels WHERE is_vod = 0')->fetchAll(PDO::FETCH_ASSOC);
    $out = [];
    foreach($rows as $r){
        $out[] = [
            'name'=>$r['name'],
            'stream_id'=>$r['stream_id'],
            'stream_url'=> (getenv('BASE_URL')?:((isset($_SERVER['HTTPS'])?'https':'http').'://'.$_SERVER['HTTP_HOST'])) . "/playlist.php?username={$username}&password={$password}&stream_id=".urlencode($r['stream_id'])
        ];
    }
    jsonExit($out);
} elseif ($action === 'get_vod_streams') {
    $rows = $db->query('SELECT id,title,url,poster FROM vod')->fetchAll(PDO::FETCH_ASSOC);
    $out = [];
    foreach($rows as $r){
        $out[] = ['title'=>$r['title'],'stream_id'=>'vod_'.$r['id'],'stream_url'=>$r['url']];
    }
    jsonExit($out);
} else {
    http_response_code(400); echo 'ERR: unknown action';
}
