const { readDB, writeDB } = require('../db');
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, name, streamUrl, logo, categoryId } = req.body;
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!name || !streamUrl) return res.status(400).send('name e streamUrl obrigatórios');
  const db = readDB();
  db.channels.push({ id: Date.now().toString(), name, streamUrl, logo: logo||'', categoryId: categoryId||null });
  writeDB(db);
  res.send('Canal adicionado');
};
