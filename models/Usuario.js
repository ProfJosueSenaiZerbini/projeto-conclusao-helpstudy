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
            `SELECT id, nome, email, serie, avatar, apelido, meta_diaria, ranking_publico, criado_em
             FROM usuarios WHERE id = ?`,
            [id]
        );
        return rows[0];
    },

    async atualizarPerfil(id, { nome, serie, avatar, apelido, rankingPublico }) {
        await db.query(
            'UPDATE usuarios SET nome = ?, serie = ?, avatar = ?, apelido = ?, ranking_publico = ? WHERE id = ?',
            [nome, serie, avatar, apelido, rankingPublico ? 1 : 0, id]
        );
    },

    async buscarSenha(id) {
        const [rows] = await db.query('SELECT senha FROM usuarios WHERE id = ?', [id]);
        return rows[0] ? rows[0].senha : null;
    },

    async atualizarSenha(id, senhaHash) {
        await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, id]);
    },

    async atualizarMeta(id, meta) {
        await db.query('UPDATE usuarios SET meta_diaria = ? WHERE id = ?', [meta, id]);
    }
};

module.exports = Usuario;
