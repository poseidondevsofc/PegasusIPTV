const db = require('../db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  let user = req.query.user;
  let pass = req.query.pass;
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
  try {
    const r = await db.query('SELECT * FROM users WHERE username=$1', [user]);
    if (!r.rows.length) return res.status(401).send('Usuário inválido');
    const u = r.rows[0];
    const ok = await bcrypt.compare(pass, u.password_hash);
    if (!ok) return res.status(401).send('Senha inválida');
    if (u.expiration_date && new Date(u.expiration_date) < new Date()) return res.status(403).send('Conta expirada');
    const ch = await db.query('SELECT c.*, cat.name as category_name FROM channels c LEFT JOIN categories cat ON cat.id=c.category_id ORDER BY c.id');
    res.setHeader('Content-Type','audio/x-mpegurl; charset=utf-8');
    let m3u = '#EXTM3U\n';
    ch.rows.forEach(c => {
      const logo = c.logo_url || '';
      const cat = c.category_name || '';
      m3u += `#EXTINF:-1 tvg-logo="${logo}" group-title="${cat}",${c.name}\n`;
      m3u += `${c.stream_url}\n`;
    });
    res.send(m3u);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar playlist');
  }
};
