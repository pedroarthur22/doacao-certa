const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// Rota GET: Listar todos os itens de doação (Conforme a Entrega 2)
app.get('/itens', (req, res) => {
  const query = 'SELECT * FROM itens_doacao';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar itens:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
    res.json(results);
  });
});

// Rota POST: Criar um novo item de doação (Conforme a Entrega 2)
app.post('/itens', (req, res) => {
  const { titulo, descricao, tamanho, local_recolha, status } = req.body;
  
  if (!titulo || !descricao || !tamanho || !local_recolha) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  const query = 'INSERT INTO itens_doacao (titulo, descricao, tamanho, local_recolha, status) VALUES (?, ?, ?, ?, ?)';
  const values = [titulo, descricao, tamanho, local_recolha, status || 'Disponível'];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir item:', err);
      return res.status(500).json({ error: 'Erro ao registar o item' });
    }
    res.status(201).json({ message: 'Item registado com sucesso!', id: result.insertId });
  });
});

// Iniciar o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});