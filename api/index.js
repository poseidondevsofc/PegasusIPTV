// api/index.js - info endpoint
module.exports = (req, res) => {
  if (req.method === 'GET') return res.json({ ok: true, api: 'Pegasus IPTV (serverless)' });
  res.status(405).send('Method Not Allowed');
};
