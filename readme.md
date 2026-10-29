# 🐙 HelpStudy

**Sistema Inteligente para Auxílio ao Ensino de Alunos com Dificuldades de Aprendizagem**

Projeto de TCC: uma plataforma web onde o aluno resolve exercícios por matéria, treina com questões do ENEM, acompanha o próprio desempenho e recebe um plano de estudos montado a partir dos seus resultados.

## 👥 Participantes

- Diego Nicoletti Gazano (Líder)
- Alice Mendoça Ferreira
- Luanna Moreira Santos
- Joao Vitor Silva
- Joao Vitor Dos Santos Adao

---

## 🛠️ Tecnologias

| Parte | O que usamos |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, Chart.js, Font Awesome |
| Backend | Node.js + Express (arquitetura MVC) |
| Banco de dados | MySQL |
| Login | JWT + bcryptjs (senhas criptografadas) |
| E-mail | Nodemailer + Gmail (recuperação de senha) |
| Questões do ENEM | API [enem.dev](https://enem.dev) |

---

## ✨ O que o sistema faz

- **Login e cadastro**, com opção de **"Esqueci a senha"**: o aluno recebe um código de 6 dígitos no e-mail para criar uma senha nova
- **Exercícios por matéria**: Matemática, Português, História, Geografia, Química, Física, Biologia e Inglês
- **Dificuldade adaptativa**: a cada 5 respostas, se o aluno acerta 4 ou mais, o nível sobe; se acerta 2 ou menos, o nível desce
- **Questões e simulados do ENEM**, com cronômetro e nota
- **Plano de estudos** que recomenda as matérias onde o aluno está pior
- **Progresso com gráficos**: evolução por dia e desempenho por matéria
- **Caderno de erros** para refazer as questões que o aluno errou
- **Gamificação**: XP, níveis, conquistas, ofensiva 🔥, meta diária e ranking semanal
- **Modo foco** (Pomodoro de 25 minutos)
- **Modo escuro** e layout que funciona no celular

---

## 🚀 Como rodar o projeto

**Você precisa ter instalado:** [Node.js](https://nodejs.org/) 18+ e [MySQL](https://www.mysql.com/) 8+ (com o serviço ligado).

### 1. Instalar as dependências
```bash
npm install
```

### 2. Criar o banco de dados
Abra o arquivo `database/helpstudy.sql` no MySQL Workbench e execute.

> ⚠️ Esse script **apaga e recria** o banco `helpstudy`. Rode só na primeira vez.
> Depois disso o próprio servidor atualiza o banco sozinho, sem apagar nada.

### 3. Criar o arquivo `.env`
Copie o `.env.example`, renomeie a cópia para `.env` e preencha:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=helpstudy

PORT=3000
JWT_SECRET=uma_chave_bem_secreta_e_longa
JWT_EXPIRES_IN=7d

EMAIL_USER=email_que_envia@gmail.com
EMAIL_PASS=senha_de_app_do_gmail
```

- O `.env` guarda senhas, por isso **nunca vai para o GitHub**.
- O `EMAIL_PASS` é uma **senha de app** do Gmail, não a senha normal. Para criar, ative a verificação em 2 etapas e acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
- Se deixar o `EMAIL_USER` e o `EMAIL_PASS` vazios, o código do "Esqueci a senha" aparece no terminal (bom para testes).

### 4. Iniciar o servidor
```bash
npm run dev
```
Abra **http://localhost:3000** no navegador.

---

## 📁 Estrutura de pastas

```
projeto-conclusao-helpstudy/
├── server.js         # inicia o servidor
├── .env.example      # modelo do .env
├── config/           # conexão com o banco, atualização do banco e envio de e-mail
├── models/           # comandos SQL de cada tabela
├── controllers/      # regras do sistema (login, exercícios, progresso...)
├── routes/           # rotas da API
├── middleware/       # protege as páginas que exigem login
├── views/            # páginas HTML
├── public/           # CSS, JavaScript do navegador e imagens
└── database/         # script SQL do banco
```

---

## 🗄️ Principais tabelas

| Tabela | Para que serve |
|---|---|
| `usuarios` | Contas dos alunos |
| `materias` / `questoes` | Matérias e banco de questões |
| `respostas` / `progresso` | Respostas dos alunos e desempenho por matéria |
| `plano_estudos` | Recomendações de estudo |
| `simulados` / `respostas_enem` | Simulados e respostas do ENEM |
| `conquistas` / `xp_eventos` | Gamificação |
| `recuperacao_senha` | Códigos do "Esqueci a senha" |

---

## ❓ Problemas comuns

| Erro | Solução |
|---|---|
| `Could not connect` / `ECONNREFUSED` | O MySQL está desligado. Ligue o serviço **MySQL80** em `services.msc`. |
| `secretOrPrivateKey must have a value` | Falta o arquivo `.env` (ou o `JWT_SECRET` dentro dele). |
| O código de recuperação não chegou | Olhe na pasta **Spam** e marque como "Não é spam". |

---

## 🎨 Identidade visual

Azul e branco, com a fonte Inter. Cada matéria tem uma cor própria, e o mascote é o polvo azul da logo 🐙.
