// =====================================================================
// Middleware de autenticação
// Verifica o token JWT enviado via cookie ou header Authorization
// =====================================================================
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

async function autenticar(req, res, next) {
    const tokenCookie = req.cookies && req.cookies.token;
    const tokenHeader = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const token = tokenCookie || tokenHeader;

    if (!token) {
        return res.status(401).json({ sucesso: false, mensagem: 'Acesso negado. Faça login novamente.' });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ sucesso: false, mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    try {
        // Confere se o usuário do token ainda existe no banco
        const [rows] = await db.query('SELECT id FROM usuarios WHERE id = ?', [payload.id]);
        if (rows.length === 0) {
            res.clearCookie('token');
            return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado. Faça login novamente.' });
        }
        req.usuarioId = payload.id;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar usuário.' });
    }
}

module.exports = autenticar;