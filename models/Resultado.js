// =====================================================================
// Model: Resultado
// Encapsula as queries relacionadas a `respostas`, `progresso`,
// `plano_estudos` e `conquistas`
// =====================================================================
const db = require('../config/db');

const Resultado = {
    // ---------- Respostas ----------
    async salvarResposta({ usuarioId, questaoId, alternativaMarcada, correta, tempoGasto }) {
        const [result] = await db.query(
            `INSERT INTO respostas (usuario_id, questao_id, alternativa_marcada, correta, tempo_gasto)
             VALUES (?, ?, ?, ?, ?)`,
            [usuarioId, questaoId, alternativaMarcada, correta ? 1 : 0, tempoGasto || 0]
        );
        return result.insertId;
    },

    async historicoPorUsuario(usuarioId, limite = 20) {
        const [rows] = await db.query(
            `SELECT r.*, q.enunciado, q.materia_id, m.nome AS materia_nome
             FROM respostas r
             JOIN questoes q ON q.id = r.questao_id
             JOIN materias m ON m.id = q.materia_id
             WHERE r.usuario_id = ?
             ORDER BY r.respondido_em DESC
             LIMIT ?`,
            [usuarioId, limite]
        );
        return rows;
    },

    // ---------- Progresso ----------
    async atualizarProgresso(usuarioId, materiaId) {
        const [[stats]] = await db.query(
            `SELECT COUNT(*) AS total, SUM(r.correta) AS corretas
             FROM respostas r
             JOIN questoes q ON q.id = r.questao_id
             WHERE r.usuario_id = ? AND q.materia_id = ?`,
            [usuarioId, materiaId]
        );
        const total = stats.total || 0;
        const corretas = stats.corretas || 0;
        const percentual = total > 0 ? ((corretas / total) * 100).toFixed(2) : 0;

        let nivel = 'facil';
        if (percentual >= 80) nivel = 'dificil';
        else if (percentual >= 50) nivel = 'medio';

        await db.query(
            `INSERT INTO progresso (usuario_id, materia_id, questoes_respondidas, questoes_corretas, percentual_acerto, nivel_dificuldade)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                questoes_respondidas = VALUES(questoes_respondidas),
                questoes_corretas = VALUES(questoes_corretas),
                percentual_acerto = VALUES(percentual_acerto),
                nivel_dificuldade = VALUES(nivel_dificuldade)`,
            [usuarioId, materiaId, total, corretas, percentual, nivel]
        );

        return { total, corretas, percentual, nivel };
    },

    async progressoPorUsuario(usuarioId) {
        const [rows] = await db.query(
            `SELECT p.*, m.nome AS materia_nome, m.icone, m.cor, m.slug
             FROM progresso p
             JOIN materias m ON m.id = p.materia_id
             WHERE p.usuario_id = ?`,
            [usuarioId]
        );
        return rows;
    },

    async progressoGeral(usuarioId) {
        const [[row]] = await db.query(
            `SELECT
                COALESCE(SUM(questoes_respondidas), 0) AS total_respondidas,
                COALESCE(SUM(questoes_corretas), 0) AS total_corretas
             FROM progresso WHERE usuario_id = ?`,
            [usuarioId]
        );
        const total = row.total_respondidas || 0;
        const corretas = row.total_corretas || 0;
        const percentual = total > 0 ? Math.round((corretas / total) * 100) : 0;
        return { total, corretas, percentual };
    },

    async evolucaoUltimosDias(usuarioId, dias = 7) {
        const [rows] = await db.query(
            `SELECT DATE(respondido_em) AS dia,
                    COUNT(*) AS total,
                    SUM(correta) AS corretas
             FROM respostas
             WHERE usuario_id = ? AND respondido_em >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             GROUP BY DATE(respondido_em)
             ORDER BY dia ASC`,
            [usuarioId, dias]
        );
        return rows;
    },

    // ---------- Plano de estudos ----------
    async gerarPlanoEstudos(usuarioId) {
        // Identifica matérias com pior desempenho (ou ainda não estudadas) para recomendar
        const [materias] = await db.query(
            `SELECT m.id, m.nome, m.slug, m.icone, m.cor,
                    COALESCE(p.percentual_acerto, 0) AS percentual_acerto,
                    COALESCE(p.questoes_respondidas, 0) AS questoes_respondidas
             FROM materias m
             LEFT JOIN progresso p ON p.materia_id = m.id AND p.usuario_id = ?
             ORDER BY percentual_acerto ASC, questoes_respondidas ASC`,
            [usuarioId]
        );

        await db.query('DELETE FROM plano_estudos WHERE usuario_id = ? AND concluido = 0', [usuarioId]);

        const recomendacoes = materias.slice(0, 4);
        for (const materia of recomendacoes) {
            let prioridade = 'media';
            let motivo = 'Continue praticando para manter o ritmo.';
            if (materia.questoes_respondidas === 0) {
                prioridade = 'alta';
                motivo = 'Você ainda não iniciou esta matéria.';
            } else if (materia.percentual_acerto < 50) {
                prioridade = 'alta';
                motivo = 'Seu percentual de acerto está abaixo de 50%.';
            } else if (materia.percentual_acerto < 80) {
                prioridade = 'media';
                motivo = 'Você está indo bem, mas pode melhorar.';
            } else {
                prioridade = 'baixa';
                motivo = 'Ótimo desempenho! Revise de vez em quando.';
            }

            await db.query(
                `INSERT INTO plano_estudos (usuario_id, materia_id, motivo, prioridade) VALUES (?, ?, ?, ?)`,
                [usuarioId, materia.id, motivo, prioridade]
            );
        }

        return this.buscarPlanoEstudos(usuarioId);
    },

    async buscarPlanoEstudos(usuarioId) {
        const [rows] = await db.query(
            `SELECT pe.*, m.nome AS materia_nome, m.slug, m.icone, m.cor
             FROM plano_estudos pe
             JOIN materias m ON m.id = pe.materia_id
             WHERE pe.usuario_id = ? AND pe.concluido = 0
             ORDER BY FIELD(pe.prioridade, 'alta','media','baixa')`,
            [usuarioId]
        );
        return rows;
    },

    // ---------- Conquistas ----------
    async listarConquistasUsuario(usuarioId) {
        const [rows] = await db.query(
            `SELECT c.*, uc.obtido_em
             FROM usuario_conquistas uc
             JOIN conquistas c ON c.id = uc.conquista_id
             WHERE uc.usuario_id = ?`,
            [usuarioId]
        );
        return rows;
    },

    async concederConquista(usuarioId, codigo) {
        const [[conquista]] = await db.query('SELECT id FROM conquistas WHERE codigo = ?', [codigo]);
        if (!conquista) return null;
        await db.query(
            'INSERT IGNORE INTO usuario_conquistas (usuario_id, conquista_id) VALUES (?, ?)',
            [usuarioId, conquista.id]
        );
        return conquista.id;
    }
};

module.exports = Resultado;
