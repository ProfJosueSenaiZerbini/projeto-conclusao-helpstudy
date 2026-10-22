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

    // Nível de dificuldade atual do aluno na matéria (fica na tabela progresso)
    async nivelDoAluno(usuarioId, materiaId) {
        const [rows] = await db.query(
            'SELECT nivel_dificuldade FROM progresso WHERE usuario_id = ? AND materia_id = ?',
            [usuarioId, materiaId]
        );
        return (rows[0] && rows[0].nivel_dificuldade) || 'facil';
    },

    // Seleção adaptativa: primeiro as questões do nível do aluno, depois as
    // dos níveis vizinhos. Dentro do mesmo nível, as que ele ainda não
    // acertou vêm antes. A ordem final dentro de cada grupo é aleatória.
    async listarQuestoesAdaptativas(usuarioId, materiaId, nivelAlvo, quantidade = 10) {
        const [rows] = await db.query(
            `SELECT q.*,
                    (SELECT MAX(r.correta) FROM respostas r
                     WHERE r.questao_id = q.id AND r.usuario_id = ?) AS ja_acertou
             FROM questoes q
             WHERE q.materia_id = ?`,
            [usuarioId, materiaId]
        );
        const ORDEM = { facil: 0, medio: 1, dificil: 2 };
        const alvo = ORDEM[nivelAlvo] ?? 0;
        return rows
            .map((q) => ({ q, sorteio: Math.random() }))
            .sort(
                (a, b) =>
                    Math.abs(ORDEM[a.q.nivel] - alvo) - Math.abs(ORDEM[b.q.nivel] - alvo) ||
                    (Number(a.q.ja_acertou) || 0) - (Number(b.q.ja_acertou) || 0) ||
                    a.sorteio - b.sorteio
            )
            .slice(0, quantidade)
            .map(({ q }) => {
                const { ja_acertou, ...questao } = q;
                return questao;
            });
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
