const { readDB, writeDB } = require('../db');
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, id } = req.body;
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  const db = readDB();
  const idx = db.categories.findIndex(c=>c.id===id);
  if (idx===-1) return res.status(404).send('Categoria não encontrada');
  db.categories.splice(idx,1);
  db.channels = db.channels.map(ch=> ch.categoryId===id ? {...ch, categoryId:null} : ch);
  writeDB(db);
  res.send('Categoria excluída');
};
