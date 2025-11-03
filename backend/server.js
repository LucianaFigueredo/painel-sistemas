const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["https://one.benassiminas.com.br", "http://localhost:3000"],
}));

// 🟢 Pool de conexões com mysql2/promise
const pool = mysql.createPool({
  host: "34.233.157.55",
  user: "luciana",
  password: "bnmg@",
  database: "private_benassi_mg",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,   // 10s
  // enableKeepAlive: true, // opcional em versões novas
});

// 🔎 Healthcheck básico
app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 🔁 Keep-alive no pool (evita idle timeout no provedor)
setInterval(async () => {
  try { await pool.query("SELECT 1"); } catch (_) { /* silencia */ }
}, 30000); // 30s

// ===============================
// 🔍 ROTA ANTIGA – Buscar sem email/telefone
// ===============================
app.get("/funcionarios", async (req, res) => {
  const search = req.query.search || "";
  const sql = `
    SELECT id, codigo, nome, cpf, departamento, demissao, email, telefone
    FROM funcionarios
    WHERE 
      (demissao IS NULL OR demissao = '')
      AND (email IS NULL OR email = '' OR telefone IS NULL OR telefone = '')
      AND (
        nome LIKE ? OR
        codigo LIKE ? OR
        cpf LIKE ? OR
        departamento LIKE ?
      )
    ORDER BY nome ASC
  `;
  try {
    const [rows] = await pool.query(sql, [
      `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`
    ]);
    res.json(rows);
  } catch (err) {
    console.error("Erro /funcionarios:", err);
    res.status(500).json({ error: "Erro ao consultar banco" });
  }
});

// ===============================
// 🔍 NOVA – Todos os ativos
// ===============================
app.get("/funcionarios/todos", async (_, res) => {
  const sql = `
    SELECT id, codigo, nome, cpf, departamento, demissao, email, telefone
    FROM funcionarios
    WHERE (demissao IS NULL OR demissao = '')
    ORDER BY nome ASC
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Erro /funcionarios/todos:", err);
    res.status(500).json({ error: "Erro ao consultar banco" });
  }
});

// ===============================
// 📝 Atualizar contato
// ===============================
app.post("/coleta", async (req, res) => {
  const { id, email, telefone } = req.body;
  if (!id || !email || !telefone) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }
  try {
    const [result] = await pool.query(
      "UPDATE funcionarios SET email = ?, telefone = ? WHERE id = ?",
      [email, telefone, id]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Erro /coleta:", err);
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});

// 🔒 (opcional) servir o build caso esse serviço também sirva o front
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 🚀 Porta do Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
