const { readDB, writeDB } = require('../db');
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, id } = req.body;
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  const db = readDB();
  const idx = db.channels.findIndex(c=>c.id===id);
  if (idx===-1) return res.status(404).send('Canal não encontrado');
  db.channels.splice(idx,1);
  writeDB(db);
  res.send('Canal excluído');
};
