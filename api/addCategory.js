import { pool } from "./db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Método não permitido");
  }

  const { adminPassword, name } = req.body;

  if (adminPassword !== "trouxas") {
    return res.status(403).send("Senha incorreta");
  }

  try {
    await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro ao adicionar categoria:", err);
    res.status(500).send("Erro no servidor: " + err.message);
  }
}
