// =====================================================================
// Model: Usuario
// Encapsula as queries relacionadas à tabela `usuarios`
// =====================================================================
const db = require('../config/db');

const Usuario = {
    async criar({ nome, email, senhaHash, serie }) {
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, serie) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, serie || null]
        );
        return result.insertId;
    },

    async buscarPorEmail(email) {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0];
    },

    async buscarPorId(id) {
        const [rows] = await db.query(
            'SELECT id, nome, email, serie, avatar, criado_em FROM usuarios WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async atualizarPerfil(id, { nome, serie, avatar }) {
        await db.query(
            'UPDATE usuarios SET nome = ?, serie = ?, avatar = ? WHERE id = ?',
            [nome, serie, avatar, id]
        );
    }
};

module.exports = Usuario;
