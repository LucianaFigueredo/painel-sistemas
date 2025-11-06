const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 POOL DE CONEXÕES (mais estável que conexão única)
const pool = mysql.createPool({
  host: "34.233.157.55",
  user: "luciana",
  password: "bnmg@",
  database: "private_benassi_mg",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Testa a conexão
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
  } else {
    console.log("✅ Conectado ao banco de dados MySQL!");
    connection.release(); // Libera a conexão de volta para o pool
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

  pool.query(
    sql,
    [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`],
    (err, results) => {
      if (err) {
        console.error("Erro na query /funcionarios:", err);
        return res.status(500).json({ error: err.message });
      }
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

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Erro na query /funcionarios/todos:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ===============================
// 📝 ROTA 2 – Atualizar dados (e-mail e telefone)
// ===============================
app.post("/coleta", (req, res) => {
  const { id, email, telefone } = req.body;

  const sql = `UPDATE funcionarios SET email = ?, telefone = ? WHERE id = ?`;
  pool.query(sql, [email, telefone, id], (err, result) => {
    if (err) {
      console.error("Erro na query /coleta:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: "Dados salvos com sucesso!" });
  });
});

// ===============================
// 🆕 ROTA 3 – Cadastrar NOVO funcionário
// ===============================
app.post("/funcionarios/novo", (req, res) => {
  const { cpf, nome, email, telefone, departamento } = req.body;

  if (!cpf || !nome || !email || !telefone || !departamento) {
    return res.status(400).json({ 
      error: "Todos os campos são obrigatórios" 
    });
  }

  const sqlCheck = `SELECT id FROM funcionarios WHERE cpf = ?`;

  pool.query(sqlCheck, [cpf], (err, results) => {
    if (err) {
      console.error("Erro ao verificar CPF:", err);
      return res.status(500).json({ error: err.message });
    }

    // 🔹 Caso o CPF já exista — retorna 200 e mensagem amigável
    if (results.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Funcionário já cadastrado!",
        action: "clear-form"
      });
    }

    // 🔹 Insere o novo funcionário normalmente
    const sqlInsert = `
      INSERT INTO funcionarios (cpf, nome, email, telefone, departamento, demissao)
      VALUES (?, ?, ?, ?, ?, NULL)
    `;

    pool.query(sqlInsert, [cpf, nome, email, telefone, departamento], (err, result) => {
      if (err) {
        console.error("Erro ao cadastrar funcionário:", err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ 
        success: true, 
        message: "Funcionário cadastrado com sucesso!",
        id: result.insertId
      });
    });
  });
});


// ===============================
// 🏥 ROTA DE HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Banco não está respondendo:", err);
      return res.status(500).json({ 
        status: "error", 
        message: "Banco de dados indisponível",
        error: err.message 
      });
    }
    connection.release();
    res.json({ 
      status: "ok", 
      message: "Servidor e banco funcionando!" 
    });
  });
});

// 🚀 Inicializa o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});