# 💚 Doação Certa

Plataforma mobile e web desenvolvida para otimizar a recolha e distribuição solidária de roupas, conectando doadores, instituições e administradores de forma transparente, segura e sustentável.

---

## 📋 Sobre o Projeto
O **Doação Certa** é uma solução tecnológica voltada a resolver problemas reais de logística e gestão de doações comunitárias[cite: 2, 3]. O aplicativo permite que utilizadores comuns cadastrem doações de vestuário, consultem catálogos detalhados com sistema de visualização ampliada (zoom) e que administradores moderem publicações por meio de um painel de gestão completo.

---

## 🛠️ Tecnologias Utilizadas
* **Front-end:** React Native (Expo) com suporte híbrido (Web e Mobile) e interface customizada baseada em componentes modernos.
* **Back-end:** Node.js com framework Express.
* **Base de Dados:** MySQL (`doacao_certa`) gerenciado via `mysql2`.
* **Segurança e Autenticação:** `bcryptjs` (hash seguro de senhas) e JSON Web Token (`jsonwebtoken`) enviados via *Bearer Token*.
* **Controlo de Versão:** Git e GitHub[cite: 3].

---

## 👥 Níveis de Acesso e Permissões
O sistema conta com dois níveis de utilizador validados por middleware no back-end[cite: 7]:
1. **Utilizador Comum:** 
   * Realiza cadastro e login seguro[cite: 7].
   * Consulta o catálogo de doações disponíveis.
   * Cadastra novos itens de doação (que entram inicialmente com o status de `pendente` para moderação).
2. **Administrador:** 
   * Possui acesso a um painel estatístico em tempo real[cite: 7].
   * Modera doações pendentes (pode aprovar ou rejeitar/excluir anúncios)[cite: 7].
   * Executa operações restritas de CRUD com caixas de confirmação nativas[cite: 7].

---

## 🚀 Progresso das Entregas

### 📦 Entrega 1: Proposta e Estrutura Inicial
* Identificação do problema real e definição do público-alvo e escopo[cite: 3].
* Criação do projeto Expo e configuração inicial do fluxo de navegação[cite: 3].
* Estruturação do repositório oficial no GitHub[cite: 3].

### 🗄️ Entrega 2: Modelagem, Banco de Dados e Integração
* **Modelagem de Dados:** Criação da base de dados `doacao_certa` e tabela `itens_doacao` no MySQL[cite: 7].
* **API REST:** Configuração das rotas iniciais `GET` e `POST` em Node.js com Express[cite: 7].
* **Integração Front-end:** Conexão entre o React Native e a API utilizando o método `fetch()`[cite: 7].

### 🔐 Entrega 3: Autenticação, JWT, Níveis e Sistema Funcional
* Implementação de rotas de registo com hash de senha (`bcryptjs`)[cite: 7].
* Sistema de login com geração e validação de tokens JWT (*Bearer Token*)[cite: 7].
* Proteção de rotas e separação estrita de privilégios entre utilizadores `comum` e `admin`[cite: 7].
* Conclusão do CRUD completo com moderação e diálogos de confirmação de exclusão[cite: 7].

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Configuração da Base de Dados (MySQL)
Executa o script abaixo no teu MySQL Workbench para preparar as tabelas:

```sql
CREATE DATABASE IF NOT EXISTS doacao_certa;
USE doacao_certa;

-- Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('comum', 'admin') DEFAULT 'comum',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens de Doação
CREATE TABLE IF NOT EXISTS itens_doacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  tamanho VARCHAR(20) NOT NULL,
  local_recolha VARCHAR(150) NOT NULL,
  categoria VARCHAR(50) DEFAULT 'Geral',
  estado_conservacao VARCHAR(50) DEFAULT 'Bom',
  foto_url VARCHAR(255) NULL,
  status VARCHAR(30) DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);