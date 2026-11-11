// =====================================================================
// Model: Aula
// Aulas de estudo de cada matéria (tabela `aulas`) e as aulas que
// cada aluno já concluiu (tabela `aulas_progresso`).
// =====================================================================
const db = require('../config/db');

const Aula = {
    // Todas as matérias com quantas aulas têm e quantas o aluno concluiu
    async resumoPorMateria(usuarioId) {
        const [rows] = await db.query(
            `SELECT m.id, m.nome, m.slug, m.descricao, m.icone, m.cor,
                    COUNT(a.id) AS total_aulas,
                    COUNT(p.aula_id) AS aulas_concluidas
             FROM materias m
             LEFT JOIN aulas a ON a.materia_id = m.id
             LEFT JOIN aulas_progresso p ON p.aula_id = a.id AND p.usuario_id = ?
             GROUP BY m.id, m.nome, m.slug, m.descricao, m.icone, m.cor
             ORDER BY m.id`,
            [usuarioId]
        );
        return rows;
    },

    async buscarMateria(slug) {
        const [rows] = await db.query(
            'SELECT id, nome, slug, descricao, icone, cor FROM materias WHERE slug = ?',
            [slug]
        );
        return rows[0];
    },

    // Aulas de uma matéria, em ordem, dizendo se o aluno já concluiu cada uma
    async listarDaMateria(materiaId, usuarioId) {
        const [rows] = await db.query(
            `SELECT a.id, a.ordem, a.titulo, a.descricao, a.minutos,
                    p.concluida_em
             FROM aulas a
             LEFT JOIN aulas_progresso p ON p.aula_id = a.id AND p.usuario_id = ?
             WHERE a.materia_id = ?
             ORDER BY a.ordem, a.id`,
            [usuarioId, materiaId]
        );
        return rows;
    },

    // Uma aula completa, com os dados da matéria
    async buscar(id, usuarioId) {
        const [rows] = await db.query(
            `SELECT a.id, a.ordem, a.titulo, a.descricao, a.minutos, a.conteudo, a.materia_id,
                    m.nome AS materia_nome, m.slug, m.icone, m.cor,
                    p.concluida_em
             FROM aulas a
             JOIN materias m ON m.id = a.materia_id
             LEFT JOIN aulas_progresso p ON p.aula_id = a.id AND p.usuario_id = ?
             WHERE a.id = ?`,
            [usuarioId, id]
        );
        return rows[0];
    },

    // Marca a aula como concluída (se já estiver, não faz nada)
    async concluir(id, usuarioId) {
        await db.query('INSERT IGNORE INTO aulas_progresso (usuario_id, aula_id) VALUES (?, ?)', [usuarioId, id]);
    }
};

module.exports = Aula;
