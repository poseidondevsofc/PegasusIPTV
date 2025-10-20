const { readDB } = require('../db');
module.exports = (req, res) => {
  if (req.method === 'GET') return res.json({ ok: true, api: 'Pegasus IPTV' });
  res.status(405).send('Method Not Allowed');
};
