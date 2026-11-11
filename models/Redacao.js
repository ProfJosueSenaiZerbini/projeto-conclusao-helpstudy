// =====================================================================
// Model: Redacao
// Redações escritas pelos alunos (tabela `redacoes`)
// =====================================================================
const db = require('../config/db');

const Redacao = {
    async listar(usuarioId) {
        const [rows] = await db.query(
            `SELECT id, tema, texto, checklist, criado_em, atualizado_em
             FROM redacoes WHERE usuario_id = ? ORDER BY atualizado_em DESC`,
            [usuarioId]
        );
        return rows;
    },

    // Só encontra se a redação for do próprio aluno
    async buscar(id, usuarioId) {
        const [rows] = await db.query('SELECT * FROM redacoes WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
        return rows[0];
    },

    async criar(usuarioId, { tema, texto, checklist }) {
        const [result] = await db.query(
            'INSERT INTO redacoes (usuario_id, tema, texto, checklist) VALUES (?, ?, ?, ?)',
            [usuarioId, tema, texto, checklist]
        );
        return result.insertId;
    },

    async atualizar(id, usuarioId, { tema, texto, checklist }) {
        await db.query(
            'UPDATE redacoes SET tema = ?, texto = ?, checklist = ? WHERE id = ? AND usuario_id = ?',
            [tema, texto, checklist, id, usuarioId]
        );
    },

    async excluir(id, usuarioId) {
        await db.query('DELETE FROM redacoes WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
    }
};

module.exports = Redacao;
