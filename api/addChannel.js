const db = require('../db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { admin_password, name, streamUrl, logo, categoryId } = req.body || {};
  if (admin_password !== 'trouxas') return res.status(401).send('Senha admin incorreta');
  if (!name || !streamUrl) return res.status(400).send('name e streamUrl obrigatórios');
  try {
    await db.query('INSERT INTO channels (name, stream_url, logo_url, category_id) VALUES ($1,$2,$3,$4)', [name, streamUrl, logo||null, categoryId||null]);
    res.send('Canal adicionado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar canal');
  }
};
