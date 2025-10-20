const bcrypt = require('bcryptjs');
const { readDB } = require('../db');

module.exports = async (req, res) => {
  let user = req.query.user;
  let pass = req.query.pass;
  // basic auth support
  if ((!user || !pass) && req.headers.authorization) {
    const auth = req.headers.authorization.split(' ');
    if (auth[0] === 'Basic' && auth[1]) {
      const buf = Buffer.from(auth[1], 'base64');
      const decoded = buf.toString();
      const parts = decoded.split(':');
      user = parts[0]; pass = parts[1];
    }
  }
  if (!user || !pass) return res.status(400).send('Obrigatório: user e pass (ou use Basic Auth)');
  const db = readDB();
  const u = db.users.find(x=>x.username===user);
  if (!u) return res.status(401).send('Usuário inválido');
  const ok = await bcrypt.compare(pass, u.passwordHash);
  if (!ok) return res.status(401).send('Senha inválida');
  if (u.expiresAt && new Date(u.expiresAt) < new Date()) return res.status(403).send('Conta expirada');

  res.setHeader('Content-Type','audio/x-mpegurl; charset=utf-8');
  let m3u = '#EXTM3U\n';
  db.channels.forEach(ch=>{
    const cat = db.categories.find(c=>c.id===ch.categoryId);
    m3u += `#EXTINF:-1 tvg-logo="${ch.logo||''}" group-title="${cat?cat.name:''}",${ch.name}\n`;
    m3u += `${ch.streamUrl}\n`;
  });
  res.send(m3u);
};
