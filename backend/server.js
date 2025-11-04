const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Conexão com o banco
const db = mysql.createConnection({
  host: "34.233.157.55",      // ou IP do servidor MySQL
  user: "luciana",           // ajuste conforme seu ambiente
  password: "bnmg@",
  database: "private_benassi_mg"
});

// Testa a conexão
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
  } else {
    console.log("✅ Conectado ao banco de dados MySQL!");
  }
});

// ===============================
// 🔍 ROTA 1 – Buscar funcionários sem email/telefone (antiga)
// ===============================
app.get("/funcionarios", (req, res) => {
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

  db.query(
    sql,
    [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// ===============================
// 🔍 ROTA NOVA – Buscar TODOS os funcionários ativos
// ===============================
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

// ===============================
// 📝 ROTA 2 – Atualizar dados (e-mail e telefone)
// ===============================
app.post("/coleta", (req, res) => {
  const { id, email, telefone } = req.body;

  const sql = `UPDATE funcionarios SET email = ?, telefone = ? WHERE id = ?`;
  db.query(sql, [email, telefone, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true, message: "Dados salvos com sucesso!" });
  });
});

// 🚀 Inicializa o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});