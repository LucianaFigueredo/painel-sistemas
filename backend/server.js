const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(
  cors({
    origin: ["https://one.benassiminas.com.br", "http://localhost:3000"],
  })
);
app.use(express.json());

const db = mysql.createConnection({
  host: "34.233.157.55",
  user: "luciana",
  password: "bnmg@",
  database: "private_benassi_mg",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
  } else {
    console.log("✅ Conectado ao banco de dados MySQL!");
  }
});

app.get("/funcionarios/todos", (req, res) => {
  const sql = `
    SELECT id, codigo, nome, cpf, departamento, demissao, email, telefone
    FROM funcionarios
    WHERE (demissao IS NULL OR demissao = '')
    ORDER BY nome ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post("/coleta", (req, res) => {
  const { id, email, telefone } = req.body;
  const sql = `UPDATE funcionarios SET email = ?, telefone = ? WHERE id = ?`;
  db.query(sql, [email, telefone, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true, message: "Dados salvos com sucesso!" });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
