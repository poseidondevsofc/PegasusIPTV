const db = require('../db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, name } = req.body || {};
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!name) return res.status(400).send('name obrigatório');
  try {
    await db.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
    res.send('Categoria criada');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar categoria');
  }
};
