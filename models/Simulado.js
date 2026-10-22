// =====================================================================
// Model: Simulado (simulados do ENEM com cronômetro)
// Enquanto o simulado está aberto, as respostas ficam guardadas na
// própria linha do simulado (coluna "respostas"). Só na finalização
// elas são corrigidas e gravadas em respostas_enem.
// =====================================================================
const db = require('../config/db');

const SEGUNDOS_POR_QUESTAO = 180; // 3 minutos, como no ENEM
const TOLERANCIA = 30; // segundos a mais para a internet/relógio do navegador

function lerJson(texto, padrao) {
    try {
        return JSON.parse(texto) || padrao;
    } catch {
        return padrao;
    }
}

function formatar(row) {
    if (!row) return null;
    const decorridos = Number(row.decorridos) || 0;
    return {
        id: row.id,
        ano: row.ano,
        area: row.area,
        idioma: row.idioma || null,
        questoes: lerJson(row.questoes, []),
        respostas: lerJson(row.respostas, {}),
        total: Number(row.total_questoes),
        duracao: Number(row.duracao_segundos),
        iniciadoEm: row.iniciado_em,
        finalizadoEm: row.finalizado_em,
        finalizado: !!row.finalizado_em,
        acertos: Number(row.acertos) || 0,
        nota: row.nota === null ? null : Number(row.nota),
        tempoGasto: Number(row.tempo_gasto) || 0,
        decorridos,
        restante: Math.max(Number(row.duracao_segundos) - decorridos, 0),
        expirado: decorridos > Number(row.duracao_segundos) + TOLERANCIA
    };
}

const CAMPOS = `id, usuario_id, ano, area, idioma, questoes, respostas, total_questoes, duracao_segundos,
                iniciado_em, finalizado_em, acertos, nota, tempo_gasto,
                TIMESTAMPDIFF(SECOND, iniciado_em, NOW()) AS decorridos`;

const Simulado = {
    SEGUNDOS_POR_QUESTAO,

    async criar({ usuarioId, ano, area, idioma, questoes }) {
        const [result] = await db.query(
            `INSERT INTO simulados (usuario_id, ano, area, idioma, questoes, respostas, total_questoes, duracao_segundos)
             VALUES (?, ?, ?, ?, ?, '{}', ?, ?)`,
            [usuarioId, ano, area || null, idioma || '', JSON.stringify(questoes), questoes.length, questoes.length * SEGUNDOS_POR_QUESTAO]
        );
        return result.insertId;
    },

    // Sempre filtra pelo dono: um aluno não vê o simulado de outro
    async buscar(usuarioId, id) {
        const [rows] = await db.query(`SELECT ${CAMPOS} FROM simulados WHERE id = ? AND usuario_id = ?`, [id, usuarioId]);
        return formatar(rows[0]);
    },

    async abertos(usuarioId) {
        const [rows] = await db.query(
            `SELECT ${CAMPOS} FROM simulados WHERE usuario_id = ? AND finalizado_em IS NULL ORDER BY id DESC`,
            [usuarioId]
        );
        return rows.map(formatar);
    },

    async historico(usuarioId, limite = 20) {
        const [rows] = await db.query(
            `SELECT ${CAMPOS} FROM simulados
             WHERE usuario_id = ? AND finalizado_em IS NOT NULL
             ORDER BY finalizado_em DESC, id DESC
             LIMIT ?`,
            [usuarioId, limite]
        );
        return rows.map(formatar);
    },

    async salvarRespostas(usuarioId, id, respostas) {
        await db.query(
            'UPDATE simulados SET respostas = ? WHERE id = ? AND usuario_id = ? AND finalizado_em IS NULL',
            [JSON.stringify(respostas), id, usuarioId]
        );
    },

    // Marca como finalizado. Devolve false se outro pedido já finalizou antes.
    async marcarFinalizado(usuarioId, id, { acertos, nota, tempoGasto }) {
        const [result] = await db.query(
            `UPDATE simulados SET finalizado_em = NOW(), acertos = ?, nota = ?, tempo_gasto = ?
             WHERE id = ? AND usuario_id = ? AND finalizado_em IS NULL`,
            [acertos, nota, tempoGasto, id, usuarioId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Simulado;
