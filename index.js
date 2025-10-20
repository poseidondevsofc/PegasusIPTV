const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'blemutes';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // serve index.html and admin.html

// Helper: find user by username
function findUser(db, username) {
  return db.find(u => u.username === username);
}

// View for website: channels grouped by category + XCIPTV credentials display
app.get('/view', async (req, res) => {
  const { user, pass } = req.query;
  if (!user || !pass) return res.status(400).send('Erro: usuário e senha são obrigatórios');

  const db = readDB();
  const u = findUser(db, user);
  if (!u) return res.status(404).send('Erro: usuário não encontrado');

  const ok = await bcrypt.compare(pass, u.passwordHash);
  if (!ok) return res.status(401).send('Erro: senha incorreta');

  if (u.expiresAt && new Date(u.expiresAt) < new Date()) return res.status(403).send('Erro: conta expirada');

  const channels = u.channels || [];
  const categories = {};
  channels.forEach(ch => {
    const cat = ch.category || 'Sem Categoria';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(ch);
  });

  // Host used for XCIPTV link (no credentials in link; XCIPTV app asks user+pass separately)
  const host = req.headers.host || 'seu-dominio.com';
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const playlistLink = `${protocol}://${host}/playlist`;

  let html = '';
  html += `<div class="credentials"><strong>Credenciais para XCIPTV</strong><br>`;
  html += `Usuário: <code>${u.username}</code><br>`;
  html += `Senha: <code>${req.query.pass}</code><br>`;
  html += `Link: <code>${playlistLink}</code> (insira o user e pass no app XCIPTV)</div>`;

  Object.keys(categories).forEach(cat => {
    html += `<div class="category"><h3>${cat}</h3><ul>`;
    categories[cat].forEach(ch => {
      html += `<li class="channel"><img src="${ch.logo}" alt="logo"/><div><strong>${ch.name}</strong><div class="meta">${ch.streamUrl}</div></div> <div style="margin-left:auto;"><a href="${ch.streamUrl}" target="_blank">Assistir</a></div></li>`;
    });
    html += `</ul></div>`;
  });

  res.send(html);
});

// Create user (admin only)
app.post('/createUser', async (req, res) => {
  const { admin_password, username, password, displayName, expiresAt } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  if (!username || !password) return res.status(400).send('username e password são obrigatórios');

  const db = readDB();
  if (db.find(u => u.username === username)) return res.status(409).send('Usuário já existe');

  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    username,
    displayName: displayName || username,
    passwordHash: hash,
    expiresAt: expiresAt || null,
    channels: []
  };
  db.push(user);
  writeDB(db);
  res.send('Usuário criado com sucesso');
});

// Add channel to user (admin only)
app.post('/addChannel', (req, res) => {
  const { admin_password, username, name, streamUrl, logo, category } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  if (!username || !name || !streamUrl) return res.status(400).send('username, name e streamUrl são obrigatórios');

  const db = readDB();
  const u = findUser(db, username);
  if (!u) return res.status(404).send('Usuário não encontrado');

  const ch = {
    id: uuidv4(),
    name,
    streamUrl,
    logo: logo || '',
    category: category || 'Sem Categoria'
  };
  u.channels = u.channels || [];
  u.channels.push(ch);
  writeDB(db);
  res.send('Canal adicionado com sucesso');
});

// Playlist endpoint for XCIPTV
// Accepts credentials via query params ?user=&pass=  OR via Basic Auth header
app.get('/playlist', async (req, res) => {
  let user = req.query.user;
  let pass = req.query.pass;

  // support Basic Auth
  if ((!user || !pass) && req.headers.authorization) {
    const auth = req.headers.authorization.split(' ');
    if (auth[0] === 'Basic' && auth[1]) {
      const buf = Buffer.from(auth[1], 'base64');
      const decoded = buf.toString();
      const parts = decoded.split(':');
      user = parts[0];
      pass = parts[1];
    }
  }

  if (!user || !pass) return res.status(400).send('Obrigatório: user e pass (ou use Basic Auth)');

  const db = readDB();
  const u = findUser(db, user);
  if (!u) return res.status(401).send('Usuário inválido');

  const ok = await bcrypt.compare(pass, u.passwordHash);
  if (!ok) return res.status(401).send('Senha inválida');

  if (u.expiresAt && new Date(u.expiresAt) < new Date()) return res.status(403).send('Conta expirada');

  res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
  let m3u = '#EXTM3U\n';
  (u.channels || []).forEach(ch => {
    m3u += `#EXTINF:-1 tvg-logo="${ch.logo || ''}" group-title="${ch.category || ''}",${ch.name}\n`;
    m3u += `${ch.streamUrl}\n`;
  });
  res.send(m3u);
});

app.listen(PORT, ()=> {
  console.log('Pegasus IPTV rodando em http://localhost:' + PORT);
});
