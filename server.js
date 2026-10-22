// =====================================================================
// HelpStudy - Servidor principal (Express)
// Sistema Inteligente para Auxílio ao Ensino de Alunos com
// Dificuldades de Aprendizagem
// =====================================================================
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const materiaRoutes = require('./routes/materias');
const progressoRoutes = require('./routes/progresso');
const enemRoutes = require('./routes/enem');
const gamificacaoRoutes = require('./routes/gamificacao');
const simuladoRoutes = require('./routes/simulados');
const executarMigracoes = require('./config/migracoes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middlewares ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Rotas da API ----------
app.use('/api/auth', authRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/enem', enemRoutes);
app.use('/api/gamificacao', gamificacaoRoutes);
app.use('/api/simulados', simuladoRoutes);

// ---------- Rotas de páginas (views) ----------
const views = path.join(__dirname, 'views');
app.get('/', (req, res) => res.sendFile(path.join(views, 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(views, 'login.html')));
app.get('/cadastro', (req, res) => res.sendFile(path.join(views, 'cadastro.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(views, 'dashboard.html')));
app.get('/exercicios', (req, res) => res.sendFile(path.join(views, 'exercicios.html')));
app.get('/resultado', (req, res) => res.sendFile(path.join(views, 'resultado.html')));
app.get('/progresso', (req, res) => res.sendFile(path.join(views, 'progresso.html')));
app.get('/plano', (req, res) => res.sendFile(path.join(views, 'plano.html')));
app.get('/enem', (req, res) => res.sendFile(path.join(views, 'enem.html')));
app.get('/simulado', (req, res) => res.sendFile(path.join(views, 'simulado.html')));
app.get('/erros', (req, res) => res.sendFile(path.join(views, 'erros.html')));
app.get('/perfil', (req, res) => res.sendFile(path.join(views, 'perfil.html')));

// ---------- 404 ----------
app.use((req, res) => {
    res.status(404).send('Página não encontrada.');
});

// Atualiza o banco (só adiciona o que falta) e depois sobe o servidor.
// Se o MySQL estiver fora do ar, o servidor sobe mesmo assim e mostra o erro.
executarMigracoes()
    .catch((err) => {
        console.error('❌ Não foi possível atualizar o banco de dados:', err.code || '', err.message || '');
    })
    .finally(() => {
        app.listen(PORT, () => {
            console.log(`🚀 HelpStudy rodando em http://localhost:${PORT}`);
        });
    });
