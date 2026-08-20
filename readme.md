# 🎓 HelpStudy

**Sistema Inteligente para Auxílio ao Ensino de Alunos com Dificuldades de Aprendizagem**

Projeto de TCC — plataforma web para apoiar estudantes com defasagens de aprendizagem, oferecendo exercícios por área do conhecimento, acompanhamento de tempo/desempenho e um plano de estudos personalizado gerado a partir dos resultados do aluno.

---

## 🧱 Tecnologias

| Camada    | Tecnologias |
|-----------|-------------|
| Frontend  | HTML5, CSS3, JavaScript (vanilla), Chart.js, Font Awesome |
| Backend   | Node.js, Express |
| Banco     | MySQL |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |

> Obs.: o Bootstrap 5 listado no briefing não foi necessário porque todo o layout foi construído com CSS próprio (mais leve e com identidade visual dedicada), mas você pode incluí-lo facilmente adicionando o CDN em cada `view` caso quiera usar os componentes dele.

---

## 📁 Estrutura de pastas

```
help-study/
│
├── package.json
├── server.js
├── .env
│
├── config/
│   └── db.js                 # conexão com o MySQL (pool)
│
├── routes/
│   ├── auth.js
│   ├── materias.js
│   └── progresso.js
│
├── models/
│   ├── Usuario.js
│   ├── Materia.js
│   └── Resultado.js
│
├── controllers/
│   ├── authController.js
│   └── materiaController.js
│
├── middleware/
│   └── authMiddleware.js      # proteção de rotas com JWT
│
├── public/
│   ├── css/
│   │   ├── style.css          # design tokens e componentes globais
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── exercicios.css
│   │   ├── progresso.css
│   │   ├── plano.css
│   │   ├── resultado.css
│   │   └── darkmode.css
│   ├── js/
│   │   ├── api.js             # helper de requisições + guarda de login
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   ├── exercicios.js
│   │   ├── progresso.js
│   │   ├── plano.js
│   │   ├── resultado.js
│   │   └── darkmode.js
│   ├── images/
│   └── icons/
│
├── views/
│   ├── login.html
│   ├── cadastro.html
│   ├── dashboard.html
│   ├── exercicios.html
│   ├── resultado.html
│   ├── progresso.html
│   └── plano.html
│
└── database/
    └── helpstudy.sql
```

Duas pastas foram adicionadas em relação ao briefing original: `config/` (conexão com o banco) e `middleware/` (proteção de rotas). Também há `public/js/api.js` e `public/js/resultado.js`, necessários para o funcionamento das telas de exercícios e resultado.

---

## ⚙️ Como rodar o projeto

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://www.mysql.com/) 8+ rodando localmente (ou em Docker)

### 2. Clonar/baixar e instalar dependências
```bash
cd help-study
npm install
```

### 3. Criar o banco de dados
Importe o script SQL (cria o banco, as tabelas e alguns dados de exemplo):
```bash
mysql -u root -p < database/helpstudy.sql
```

### 4. Configurar variáveis de ambiente
Edite o arquivo `.env` na raiz do projeto com os dados do seu MySQL:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=helpstudy

PORT=3000
JWT_SECRET=uma_chave_bem_secreta_e_longa
JWT_EXPIRES_IN=7d
```

### 5. Rodar o servidor
```bash
npm start
# ou, em desenvolvimento (reinicia sozinho a cada alteração):
npm run dev
```

Acesse **http://localhost:3000** no navegador. Você será redirecionado para a tela de login.

---

## 🗃️ Modelo de dados (tabelas)

| Tabela | Descrição |
|---|---|
| `usuarios` | Contas dos alunos (nome, e-mail, senha com hash, série) |
| `materias` | Áreas do conhecimento (Matemática, Português, História, Geografia, Ciências, Inglês) |
| `questoes` | Banco de questões de múltipla escolha, vinculadas a uma matéria, com nível de dificuldade e dica |
| `respostas` | Registro de cada resposta dada por um aluno (certo/errado, tempo gasto) |
| `progresso` | Agregado por aluno + matéria (questões respondidas, % de acerto, nível de dificuldade sugerido) |
| `plano_estudos` | Recomendações geradas automaticamente com base no desempenho do aluno |
| `conquistas` / `usuario_conquistas` | Sistema de gamificação (badges) |

---

## 🔌 Principais rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/cadastro` | Cria uma nova conta |
| POST | `/api/auth/login` | Autentica e retorna um token JWT |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET  | `/api/auth/perfil` | Retorna os dados do usuário logado |
| GET  | `/api/materias` | Lista todas as matérias com contagem de questões |
| GET  | `/api/materias/:slug/questoes` | Lista as questões de uma matéria (sem gabarito) |
| POST | `/api/materias/responder` | Registra a resposta de uma questão e atualiza o progresso |
| GET  | `/api/progresso` | Retorna progresso geral, por matéria, evolução (7 dias) e histórico |
| GET  | `/api/progresso/plano` | Retorna o plano de estudos atual do aluno |
| POST | `/api/progresso/plano/gerar` | Recalcula o plano de estudos com base no desempenho |
| GET  | `/api/progresso/conquistas` | Lista as conquistas já obtidas pelo aluno |

Todas as rotas (exceto cadastro/login) exigem o token JWT, enviado automaticamente pelo front-end via cookie `httpOnly` e também salvo no `localStorage` para uso no header `Authorization: Bearer <token>`.

---

## 🧠 Como funciona a lógica de "dificuldades de aprendizagem"

1. O aluno responde questões de uma matéria; cada resposta é salva em `respostas`.
2. A cada resposta, `progresso` é recalculado (% de acerto e nível sugerido: fácil/médio/difícil).
3. Ao acessar o **Plano de Estudos**, o sistema ordena as matérias pelo pior desempenho (ou nunca estudadas) e recomenda até 4 delas, com prioridade **alta**, **média** ou **baixa**.
4. As telas de **Progresso** mostram gráficos (Chart.js) com a evolução dos últimos 7 dias e o desempenho por matéria, ajudando o aluno (e um professor/responsável) a visualizar onde reforçar os estudos.

---

## 🎨 Identidade visual

- Cor de marca: rosa vibrante (`#E91E8C` → `#C1157A` em gradiente).
- Cada matéria tem uma cor própria (azul para Matemática, roxo para Português, laranja para História, etc.), reaproveitada em ícones, gráficos e badges.
- Suporte a **modo escuro** (alternável pelo botão de lua/sol em todas as páginas, com preferência salva no navegador).
- Layout responsivo (sidebar colapsável em telas menores que 900px).

---

## 📝 Próximos passos sugeridos

- Painel do professor/responsável para acompanhar múltiplos alunos.
- Upload de imagens nas questões (a coluna `imagem` já existe em `questoes`).
- Adaptação automática de dificuldade em tempo real (question by question), não só por matéria.
- Testes automatizados (Jest) para controllers e models.

---

Feito com 💗 para apoiar alunos com dificuldades de aprendizagem.
