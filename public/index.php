<?php
require_once __DIR__ . '/db.php';
$channels = $db->query("SELECT * FROM channels ORDER BY category, name")->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Pegasus IPTV</title>
<link rel="stylesheet" href="assets/style.css">
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head><body>
<header><img src="assets/pegasus-logo.png" alt="Pegasus" height="56"> <h1>Pegasus IPTV</h1></header>
<div class="layout">
  <div class="player-area">
    <video id="video" controls style="width:100%;height:480px;background:#000"></video>
    <div id="now" style="padding:8px">Clique em um canal</div>
  </div>
  <aside class="channels">
    <?php foreach($channels as $c): ?>
      <div class="channel-card" data-url="<?=htmlspecialchars($c['url'])?>" data-streamid="<?=htmlspecialchars($c['stream_id'])?>">
        <img src="<?=($c['logo']?:'assets/placeholder.png')?>" alt="">
        <div class="meta"><strong><?=htmlspecialchars($c['name'])?></strong><div class="cat"><?=htmlspecialchars($c['category'])?></div></div>
      </div>
    <?php endforeach; ?>
  </aside>
</div>
<script>
const video = document.getElementById('video');
const now = document.getElementById('now');
document.querySelectorAll('.channel-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    const url = card.dataset.url;
    const name = card.querySelector('.meta strong').innerText;
    now.innerText = 'Reproduzindo: ' + name;
    if(Hls.isSupported()){
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, ()=> video.play().catch(()=>{}));
    } else {
      video.src = url; video.play().catch(()=>{});
    }
  });
});
</script>
</body></html>
