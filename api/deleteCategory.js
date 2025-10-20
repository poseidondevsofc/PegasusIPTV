const db = require('../db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, id } = req.body || {};
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!id) return res.status(400).send('id obrigatório');
  try {
    await db.query('DELETE FROM categories WHERE id=$1', [id]);
    await db.query('UPDATE channels SET category_id=NULL WHERE category_id=$1', [id]);
    res.send('Categoria excluída');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir categoria');
  }
};
