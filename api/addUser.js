const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, username, password, displayName, expiresAt } = req.body;
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!username || !password || !expiresAt) return res.status(400).send('username, password e expiresAt obrigatórios');
  const db = readDB();
  if (db.users.find(u=>u.username===username)) return res.status(409).send('Usuário já existe');
  const hash = await bcrypt.hash(password, 10);
  db.users.push({ id: Date.now().toString(), username, displayName: displayName||username, passwordHash: hash, expiresAt });
  writeDB(db);
  res.send('Usuário criado com sucesso');
};
