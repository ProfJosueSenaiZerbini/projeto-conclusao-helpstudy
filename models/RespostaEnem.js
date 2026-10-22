// =====================================================================
// Model: RespostaEnem
// Respostas do aluno nas questões do ENEM (prática e simulados).
// Antes ficavam só no navegador (localStorage); agora ficam no banco.
// =====================================================================
const db = require('../config/db');

function chave(ano, numero, idioma) {
    return `${ano}-${numero}-${idioma || ''}`;
}

const RespostaEnem = {
    chave,

    async salvar({ usuarioId, simuladoId = null, ano, numero, idioma, area, letra, correta, revelada = false, tempoGasto = 0 }) {
        const [result] = await db.query(
            `INSERT INTO respostas_enem
                (usuario_id, simulado_id, ano, numero, idioma, area, alternativa_marcada, correta, revelada, tempo_gasto)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuarioId, simuladoId, ano, numero, idioma || '', area || null, letra || null, correta ? 1 : 0, revelada ? 1 : 0, tempoGasto]
        );
        return result.insertId;
    },

    // Última resposta (não zerada) de cada questão de um ano, na prática
    async estadoDoAno(usuarioId, ano) {
        const [rows] = await db.query(
            `SELECT re.ano, re.numero, re.idioma, re.alternativa_marcada, re.correta, re.revelada
             FROM respostas_enem re
             JOIN (
                SELECT MAX(id) AS id FROM respostas_enem
                WHERE usuario_id = ? AND ano = ? AND simulado_id IS NULL AND arquivada = 0
                GROUP BY numero, idioma
             ) u ON u.id = re.id`,
            [usuarioId, ano]
        );
        const mapa = {};
        rows.forEach((r) => {
            mapa[chave(r.ano, r.numero, r.idioma)] = {
                letra: r.alternativa_marcada,
                correta: Number(r.correta) === 1,
                revelada: Number(r.revelada) === 1
            };
        });
        return mapa;
    },

    // Placar da página do ENEM (cada questão conta uma vez; "ver resposta" não conta)
    async placar(usuarioId) {
        const [[row]] = await db.query(
            `SELECT COUNT(*) AS respondidas, COALESCE(SUM(re.correta), 0) AS acertos
             FROM respostas_enem re
             JOIN (
                SELECT MAX(id) AS id FROM respostas_enem
                WHERE usuario_id = ? AND simulado_id IS NULL AND arquivada = 0
                GROUP BY ano, numero, idioma
             ) u ON u.id = re.id
             WHERE re.revelada = 0`,
            [usuarioId]
        );
        const respondidas = Number(row.respondidas) || 0;
        const acertos = Number(row.acertos) || 0;
        return { respondidas, acertos, percentual: respondidas ? Math.round((acertos / respondidas) * 100) : 0 };
    },

    // "Refazer": a questão volta a aparecer sem resposta (o histórico continua salvo)
    async arquivarQuestao(usuarioId, ano, numero, idioma) {
        await db.query(
            `UPDATE respostas_enem SET arquivada = 1
             WHERE usuario_id = ? AND ano = ? AND numero = ? AND idioma = ? AND simulado_id IS NULL`,
            [usuarioId, ano, numero, idioma || '']
        );
    },

    // "Zerar placar": esconde as respostas da prática (o histórico continua salvo)
    async arquivarTudo(usuarioId) {
        const [result] = await db.query(
            'UPDATE respostas_enem SET arquivada = 1 WHERE usuario_id = ? AND simulado_id IS NULL AND arquivada = 0',
            [usuarioId]
        );
        return result.affectedRows;
    }
};

module.exports = RespostaEnem;
