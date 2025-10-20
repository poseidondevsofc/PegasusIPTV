const db = require('../db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, username, password, displayName, expiresAt } = req.body || {};
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!username || !password || !expiresAt) return res.status(400).send('username, password e expiresAt obrigatórios');
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password_hash, display_name, expiration_date) VALUES ($1,$2,$3,$4)', [username, hash, displayName||username, expiresAt]);
    res.send('Usuário criado com sucesso');
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).send('Usuário já existe');
    res.status(500).send('Erro ao criar usuário');
  }
};
