// =====================================================================
// Model: Materia
// Encapsula as queries relacionadas às tabelas `materias` e `questoes`
// =====================================================================
const db = require('../config/db');

const Materia = {
    async listarTodas() {
        const [rows] = await db.query('SELECT * FROM materias ORDER BY nome ASC');
        return rows;
    },

    async buscarPorSlug(slug) {
        const [rows] = await db.query('SELECT * FROM materias WHERE slug = ?', [slug]);
        return rows[0];
    },

    async buscarPorId(id) {
        const [rows] = await db.query('SELECT * FROM materias WHERE id = ?', [id]);
        return rows[0];
    },

    async listarQuestoes(materiaId, nivel = null) {
        let sql = 'SELECT * FROM questoes WHERE materia_id = ?';
        const params = [materiaId];
        if (nivel) {
            sql += ' AND nivel = ?';
            params.push(nivel);
        }
        sql += ' ORDER BY RAND()';
        const [rows] = await db.query(sql, params);
        return rows;
    },

    async buscarQuestaoPorId(id) {
        const [rows] = await db.query('SELECT * FROM questoes WHERE id = ?', [id]);
        return rows[0];
    },

    async contarQuestoes(materiaId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM questoes WHERE materia_id = ?',
            [materiaId]
        );
        return rows[0].total;
    }
};

module.exports = Materia;
