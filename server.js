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

// ---------- 404 ----------
app.use((req, res) => {
    res.status(404).send('Página não encontrada.');
});

app.listen(PORT, () => {
    console.log(`🚀 HelpStudy rodando em http://localhost:${PORT}`);
});
