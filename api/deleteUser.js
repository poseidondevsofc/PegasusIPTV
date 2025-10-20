const { readDB, writeDB } = require('../db');
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, username } = req.body;
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  const db = readDB();
  const idx = db.users.findIndex(u=>u.username===username);
  if (idx===-1) return res.status(404).send('Usuário não encontrado');
  db.users.splice(idx,1);
  writeDB(db);
  res.send('Usuário excluído');
};
