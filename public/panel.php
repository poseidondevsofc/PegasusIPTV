<?php
require_once __DIR__ . '/db.php';
session_start();
$admin_user = getenv('ADMIN_USER') ?: 'admin';
$admin_pass = getenv('ADMIN_PASS') ?: 'admin';
// simple auth
if (isset($_POST['login'])) {
    $u = $_POST['user'] ?? '';
    $p = $_POST['pass'] ?? '';
    if ($u === $admin_user && $p === $admin_pass) {
        $_SESSION['admin'] = true;
    } else {
        $error = 'Credenciais inválidas';
    }
}
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: panel.php');
    exit;
}
if (!isset($_SESSION['admin'])) {
    ?>
    <!doctype html><meta charset="utf-8">
    <title>Pegasus Admin - Login</title>
    <style>body{font-family:Arial;margin:20px}form{max-width:320px}</style>
    <h2>Pegasus Admin</h2>
    <?php if(isset($error)) echo "<p style='color:red;'>$error</p>"; ?>
    <form method="post">
      <label>Usuário<br><input name="user" required></label><br><br>
      <label>Senha<br><input name="pass" type="password" required></label><br><br>
      <button name="login">Entrar</button>
    </form>
    <?php
    exit;
}
// add channel
if (isset($_POST['add_channel'])) {
    $name = $_POST['name'] ?? '';
    $stream_id = $_POST['stream_id'] ?? '';
    $url = $_POST['url'] ?? '';
    $logo = $_POST['logo'] ?? '';
    $cat = $_POST['category'] ?? '';
    if ($name && $stream_id && $url) {
        $stmt = $db->prepare("INSERT OR REPLACE INTO channels (name,stream_id,url,logo,category) VALUES (?,?,?,?,?)");
        $stmt->execute([$name,$stream_id,$url,$logo,$cat]);
        $msg = 'Canal salvo';
    } else {
        $msg = 'Preencha nome, stream_id e url';
    }
}
if (isset($_POST['add_vod'])) {
    $title = $_POST['title'] ?? '';
    $url = $_POST['vurl'] ?? '';
    $poster = $_POST['poster'] ?? '';
    if ($title && $url) {
        $stmt = $db->prepare("INSERT INTO vod (title,url,poster) VALUES (?,?,?)");
        $stmt->execute([$title,$url,$poster]);
        $vmsg = 'VOD salvo';
    } else {
        $vmsg = 'Preencha título e URL';
    }
}
$channels = $db->query("SELECT * FROM channels ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
$vods = $db->query("SELECT * FROM vod ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html><meta charset="utf-8">
<title>Pegasus Admin</title>
<link rel="stylesheet" href="assets/style.css">
<div class="panel">
  <h1>Pegasus Admin</h1>
  <p><a href="panel.php?logout=1">Sair</a></p>
  <?php if(isset($msg)) echo "<p style='color:green;'>$msg</p>"; ?>
  <h2>Adicionar Canal</h2>
  <form method="post">
    <input name="name" placeholder="Nome do canal" required><br>
    <input name="stream_id" placeholder="stream_id (único)" required><br>
    <input name="url" placeholder="URL HLS (.m3u8) ou HTTP" required><br>
    <input name="logo" placeholder="URL do logo"><br>
    <input name="category" placeholder="Categoria"><br>
    <button name="add_channel">Salvar</button>
  </form>
  <h3>Canais</h3>
  <table border="1" cellpadding="6" style="border-collapse:collapse;">
  <tr><th>ID</th><th>Name</th><th>stream_id</th><th>URL</th></tr>
  <?php foreach($channels as $c): ?>
  <tr>
    <td><?=htmlspecialchars($c['id'])?></td>
    <td><?=htmlspecialchars($c['name'])?></td>
    <td><?=htmlspecialchars($c['stream_id'])?></td>
    <td style="max-width:400px;overflow:hidden;"><?=htmlspecialchars($c['url'])?></td>
  </tr>
  <?php endforeach; ?>
  </table>
  <hr>
  <h2>Adicionar VOD</h2>
  <?php if(isset($vmsg)) echo "<p style='color:green;'>$vmsg</p>"; ?>
  <form method="post">
    <input name="title" placeholder="Título do VOD" required><br>
    <input name="vurl" placeholder="URL do vídeo (mp4 ou m3u8)" required><br>
    <input name="poster" placeholder="URL do poster"><br>
    <button name="add_vod">Salvar VOD</button>
  </form>
  <h3>VODs</h3>
  <table border="1" cellpadding="6">
  <tr><th>ID</th><th>Título</th><th>URL</th></tr>
  <?php foreach($vods as $v): ?>
  <tr>
    <td><?=htmlspecialchars($v['id'])?></td>
    <td><?=htmlspecialchars($v['title'])?></td>
    <td><?=htmlspecialchars($v['url'])?></td>
  </tr>
  <?php endforeach; ?>
  </table>
</div>
