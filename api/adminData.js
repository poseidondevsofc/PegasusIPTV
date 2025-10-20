const db = require('../db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  try {
    const users = (await db.query('SELECT username, display_name, expiration_date FROM users ORDER BY id')).rows;
    const categories = (await db.query('SELECT id, name FROM categories ORDER BY id')).rows;
    const channels = (await db.query('SELECT id, name, stream_url, logo_url, category_id FROM channels ORDER BY id')).rows;
    res.json({ users, categories, channels });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
};
