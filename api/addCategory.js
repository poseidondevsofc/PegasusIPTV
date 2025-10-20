const { readDB, writeDB } = require('../db');
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, name } = req.body;
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!name) return res.status(400).send('name obrigatório');
  const db = readDB();
  const id = Date.now().toString();
  db.categories.push({ id, name });
  writeDB(db);
  res.send('Categoria criada');
};
