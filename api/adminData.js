import { pool } from "./db.js";

export default async function handler(req, res) {
  try {
    const users = await pool.query("SELECT * FROM users");
    const categories = await pool.query("SELECT * FROM categories");
    const channels = await pool.query("SELECT * FROM channels");

    res.status(200).json({
      users: users.rows,
      categories: categories.rows,
      channels: channels.rows,
    });
  } catch (err) {
    console.error("Erro no servidor:", err.message);
    res.status(500).send("Erro no servidor: " + err.message);
  }
}
