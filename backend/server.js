const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_doacao';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'doacao_certa'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado à base de dados MySQL com sucesso!');
});

// ================= AUTENTICAÇÃO =================
app.post('/register', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  try {
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (results.length > 0) return res.status(400).json({ error: 'E-mail já cadastrado.' });

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const query = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)';
      db.query(query, [nome, email, senhaHash, tipo || 'comum'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado.' });

    const usuario = results[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
    });
  });
});

// ================= MIDDLEWARES =================
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.usuario = decoded;
    next();
  });
};

const verificarAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado: Apenas administradores.' });
  }
  next();
};

// ================= DASHBOARD E ESTATÍSTICAS (ADMIN) =================
app.get('/admin/stats', verificarToken, verificarAdmin, (req, res) => {
  db.query('SELECT COUNT(*) as total FROM usuarios', (err, rUsers) => {
    db.query('SELECT COUNT(*) as total FROM itens_doacao', (err, rItens) => {
      db.query("SELECT COUNT(*) as total FROM itens_doacao WHERE status = 'disponivel'", (err, rDisp) => {
        db.query("SELECT COUNT(*) as total FROM itens_doacao WHERE status = 'pendente'", (err, rPend) => {
          res.json({
            usuarios: rUsers[0]?.total || 0,
            totalItens: rItens[0]?.total || 0,
            disponiveis: rDisp[0]?.total || 0,
            pendentes: rPend[0]?.total || 0
          });
        });
      });
    });
  });
});

// ================= ROTAS DE ITENS (CRUD) =================
app.get('/itens', (req, res) => {
  db.query('SELECT * FROM itens_doacao', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/itens', verificarToken, (req, res) => {
  const { titulo, descricao, tamanho, local_recolha, categoria, estado_conservacao, foto_url } = req.body;
  const query = 'INSERT INTO itens_doacao (titulo, descricao, tamanho, local_recolha, categoria, estado_conservacao, foto_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [titulo, descricao, tamanho, local_recolha, categoria || 'Geral', estado_conservacao || 'Bom', foto_url || '', 'pendente'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Item cadastrado e aguardando aprovação do administrador!', id: result.insertId });
  });
});

// Atualizar/Editar Item (UPDATE - PUT)
app.put('/itens/:id', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, tamanho, local_recolha, categoria, estado_conservacao } = req.body;
  
  const query = 'UPDATE itens_doacao SET titulo = ?, descricao = ?, tamanho = ?, local_recolha = ?, categoria = ?, estado_conservacao = ? WHERE id = ?';
  db.query(query, [titulo, descricao, tamanho, local_recolha, categoria, estado_conservacao, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado.' });
    res.json({ message: 'Item atualizado com sucesso!' });
  });
});

app.patch('/itens/:id/status', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.query('UPDATE itens_doacao SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Status do item atualizado para: ${status}` });
  });
});

app.delete('/itens/:id', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM itens_doacao WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado.' });
    res.json({ message: 'Item apagado com sucesso pelo administrador!' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor profissional a correr na porta ${PORT}`);
});