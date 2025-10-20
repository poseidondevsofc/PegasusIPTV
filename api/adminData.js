const { readDB } = require('../db');
module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  const db = readDB();
  res.json({ users: db.users.map(u=>({username:u.username, displayName:u.displayName, expiresAt:u.expiresAt})), categories: db.categories, channels: db.channels });
};
