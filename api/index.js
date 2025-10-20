// api/index.js
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db'); // db.js estará na raiz
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve arquivos estáticos (public) por rota se necessário
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// endpoints administrativos/funcionais
function findUser(db, username){ return db.users.find(u => u.username === username); }
function findCategory(db, id){ return db.categories.find(c => c.id === id); }

app.get('/admin/data', (req, res) => {
  const db = readDB();
  res.json({
    users: db.users.map(u => ({ username: u.username, displayName: u.displayName, expiresAt: u.expiresAt })),
    categories: db.categories,
    channels: db.channels
  });
});

const ADMIN_PASSWORD = 'blemutes';

app.post('/createUser', async (req, res) => {
  const { admin_password, username, password, displayName, expiresAt } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  if (!username || !password) return res.status(400).send('username e password são obrigatórios');
  if (!expiresAt) return res.status(400).send('expiresAt é obrigatório (YYYY-MM-DD)');

  const db = readDB();
  if (findUser(db, username)) return res.status(409).send('Usuário já existe');

  const hash = await bcrypt.hash(password, 10);
  db.users.push({ id: uuidv4(), username, displayName: displayName || username, passwordHash: hash, expiresAt });
  writeDB(db);
  res.send('Usuário criado com sucesso');
});

app.post('/deleteUser', (req, res) => {
  const { admin_password, username } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  const db = readDB();
  const idx = db.users.findIndex(u => u.username === username);
  if (idx === -1) return res.status(404).send('Usuário não encontrado');
  db.users.splice(idx, 1);
  writeDB(db);
  res.send('Usuário excluído');
});

app.post('/addCategory', (req, res) => {
  const { admin_password, name } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  if (!name) return res.status(400).send('name é obrigatório');
  const db = readDB();
  db.categories.push({ id: uuidv4(), name });
  writeDB(db);
  res.send('Categoria criada');
});

app.post('/deleteCategory', (req, res) => {
  const { admin_password, id } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  const db = readDB();
  const idx = db.categories.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).send('Categoria não encontrada');
  db.categories.splice(idx, 1);
  // remove categoryId dos canais
  db.channels = db.channels.map(ch => ch.categoryId === id ? { ...ch, categoryId: null } : ch);
  writeDB(db);
  res.send('Categoria excluída');
});

app.post('/addChannel', (req, res) => {
  const { admin_password, name, streamUrl, logo, categoryId } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  if (!name || !streamUrl) return res.status(400).send('name e streamUrl são obrigatórios');
  const db = readDB();
  if (categoryId && !findCategory(db, categoryId)) return res.status(400).send('Categoria inválida');
  db.channels.push({ id: uuidv4(), name, streamUrl, logo: logo || '', categoryId: categoryId || null });
  writeDB(db);
  res.send('Canal adicionado');
});

app.post('/deleteChannel', (req, res) => {
  const { admin_password, id } = req.body;
  if (admin_password !== ADMIN_PASSWORD) return res.status(401).send('Senha admin incorreta');
  const db = readDB();
  const idx = db.channels.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).send('Canal não encontrado');
  db.channels.splice(idx, 1);
  writeDB(db);
  res.send('Canal excluído');
});

app.get('/view', async (req, res) => {
  const { user, pass } = req.query;
  if (!user || !pass) return res.status(400).send('Erro: usuário e senha são obrigatórios');

  const db = readDB();
  const u = findUser(db, user);
  if (!u) return res.status(404).send('Erro: usuário não encontrado');

  const ok = await bcrypt.compare(pass, u.passwordHash);
  if (!ok) return res.status(401).send('Erro: senha incorreta');
  if (u.expiresAt && new Date(u.expiresAt) < new Date()) return res.status(403).send('Erro: conta expirada');

  const categories = {};
  db.channels.forEach(ch => {
    const cat = findCategory(db, ch.categoryId);
    const catName = cat ? cat.name : 'Sem Categoria';
    if (!categories[catName]) categories[catName] = [];
    categories[catName].push(ch);
  });

  const host = req.headers.host || 'seu-dominio.com';
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const playlistLink = `${protocol}://${host}/api/playlist`;

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

app.get('/playlist', async (req, res) => {
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

  const db = readDB();
  const u = findUser(db, user);
  if (!u) return res.status(401).send('Usuário inválido');
  const ok = await bcrypt.compare(pass, u.passwordHash);
  if (!ok) return res.status(401).send('Senha inválida');
  if (u.expiresAt && new Date(u.expiresAt) < new Date()) return res.status(403).send('Conta expirada');

  res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
  let m3u = '#EXTM3U\\n';
  db.channels.forEach(ch => {
    const cat = findCategory(db, ch.categoryId);
    m3u += `#EXTINF:-1 tvg-logo="${ch.logo || ''}" group-title="${cat?cat.name:''}",${ch.name}\\n`;
    m3u += `${ch.streamUrl}\\n`;
  });
  res.send(m3u);
});

module.exports = app;
