// =====================================================================
// Middleware de autenticação
// Verifica o token JWT enviado via cookie ou header Authorization
// =====================================================================
const jwt = require('jsonwebtoken');
require('dotenv').config();

function autenticar(req, res, next) {
    const tokenCookie = req.cookies && req.cookies.token;
    const tokenHeader = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const token = tokenCookie || tokenHeader;

    if (!token) {
        return res.status(401).json({ sucesso: false, mensagem: 'Acesso negado. Faça login novamente.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = payload.id;
        next();
    } catch (err) {
        return res.status(401).json({ sucesso: false, mensagem: 'Sessão expirada. Faça login novamente.' });
    }
}

module.exports = autenticar;
