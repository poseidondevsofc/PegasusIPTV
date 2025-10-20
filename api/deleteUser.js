const db = require('../db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, username } = req.body || {};
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!username) return res.status(400).send('username obrigatório');
  try {
    await db.query('DELETE FROM users WHERE username=$1', [username]);
    res.send('Usuário excluído');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir usuário');
  }
};
