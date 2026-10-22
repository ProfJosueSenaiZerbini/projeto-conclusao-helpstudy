// =====================================================================
// Model: Gamificação
// XP e níveis, ofensiva (dias seguidos), meta diária, conquistas e ranking.
//
// Tudo é calculado no servidor a partir das respostas salvas no banco.
// O XP fica na tabela xp_eventos, que tem chave única
// (usuario_id, origem, referencia): o mesmo ponto nunca é dado duas vezes.
// =====================================================================
const db = require('../config/db');

// ---------------------------------------------------------------------
// Regras de XP
// ---------------------------------------------------------------------
const XP = {
    tentativa: 2, // responder uma questão (1x por questão por dia)
    questao: { facil: 10, medio: 15, dificil: 20 }, // primeiro acerto de cada questão
    enem: 20, // primeiro acerto de cada questão do ENEM
    simulado: 30, // finalizar um simulado
    meta: 20, // cumprir a meta diária
    foco: 10, // completar uma sessão de 25 min no modo foco
    conquista: 50 // desbloquear uma conquista
};

const TITULOS_NIVEL = [
    'Iniciante', 'Curioso', 'Aprendiz', 'Estudante', 'Estudante Dedicado',
    'Focado', 'Avançado', 'Expert', 'Mestre', 'Lenda do ENEM'
];

// XP necessário para chegar em cada nível: 0, 100, 300, 600, 1000, 1500...
function xpParaNivel(nivel) {
    return 50 * nivel * (nivel - 1);
}

function calcularNivel(xpTotal) {
    let nivel = 1;
    while (xpTotal >= xpParaNivel(nivel + 1)) nivel++;
    const inicio = xpParaNivel(nivel);
    const proximo = xpParaNivel(nivel + 1);
    return {
        nivel,
        titulo: TITULOS_NIVEL[Math.min(nivel, TITULOS_NIVEL.length) - 1],
        xpTotal,
        xpNoNivel: xpTotal - inicio,
        xpParaProximo: proximo - inicio,
        progresso: Math.round(((xpTotal - inicio) / (proximo - inicio)) * 100)
    };
}

// ---------------------------------------------------------------------
// Datas (strings 'AAAA-MM-DD' vindas do MySQL)
// ---------------------------------------------------------------------
function somarDias(dataTexto, dias) {
    const d = new Date(dataTexto + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().slice(0, 10);
}

async function hojeNoBanco() {
    const [[row]] = await db.query('SELECT CURDATE() AS hoje');
    return String(row.hoje).slice(0, 10);
}

// Ofensiva atual e maior ofensiva a partir da lista de dias estudados
function calcularOfensiva(diasEstudados, hoje) {
    const dias = new Set(diasEstudados);
    const ontem = somarDias(hoje, -1);

    let atual = 0;
    let dia = dias.has(hoje) ? hoje : dias.has(ontem) ? ontem : null;
    while (dia && dias.has(dia)) {
        atual++;
        dia = somarDias(dia, -1);
    }

    let melhor = 0;
    let corrente = 0;
    let anterior = null;
    [...dias].sort().forEach((d) => {
        corrente = anterior && somarDias(anterior, 1) === d ? corrente + 1 : 1;
        melhor = Math.max(melhor, corrente);
        anterior = d;
    });

    return { atual, melhor, estudouHoje: dias.has(hoje) };
}

// ---------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------

// Quantidade de respostas por dia (matérias + ENEM). "Ver resposta" não conta.
async function atividadePorDia(usuarioId, dias = null) {
    const filtroR = dias ? 'AND respondido_em >= DATE_SUB(CURDATE(), INTERVAL ? DAY)' : '';
    const params = dias ? [usuarioId, dias, usuarioId, dias] : [usuarioId, usuarioId];
    const [rows] = await db.query(
        `SELECT dia, SUM(total) AS total, SUM(corretas) AS corretas, SUM(tempo) AS tempo
         FROM (
             SELECT DATE(respondido_em) AS dia, COUNT(*) AS total, SUM(correta) AS corretas, SUM(tempo_gasto) AS tempo
             FROM respostas WHERE usuario_id = ? ${filtroR}
             GROUP BY DATE(respondido_em)
             UNION ALL
             SELECT DATE(respondido_em) AS dia, COUNT(*) AS total, SUM(correta) AS corretas, SUM(tempo_gasto) AS tempo
             FROM respostas_enem WHERE usuario_id = ? AND revelada = 0 ${filtroR}
             GROUP BY DATE(respondido_em)
         ) t
         GROUP BY dia
         ORDER BY dia ASC`,
        params
    );
    return rows.map((r) => ({
        dia: String(r.dia).slice(0, 10),
        total: Number(r.total) || 0,
        corretas: Number(r.corretas) || 0,
        tempo: Number(r.tempo) || 0
    }));
}

async function xpTotal(usuarioId) {
    const [[row]] = await db.query('SELECT COALESCE(SUM(pontos), 0) AS xp FROM xp_eventos WHERE usuario_id = ?', [usuarioId]);
    return Number(row.xp) || 0;
}

async function metaDiaria(usuarioId) {
    const [[row]] = await db.query('SELECT meta_diaria FROM usuarios WHERE id = ?', [usuarioId]);
    return (row && Number(row.meta_diaria)) || 10;
}

// Gera os pontos de XP que o aluno ainda não recebeu.
// Como cada ponto tem uma referência única, rodar isso várias vezes é seguro.
async function sincronizarXp(usuarioId) {
    const ins = 'INSERT IGNORE INTO xp_eventos (usuario_id, origem, referencia, pontos, criado_em)';

    // Primeiro acerto de cada questão das matérias (vale mais nas difíceis)
    await db.query(
        `${ins}
         SELECT ?, 'questao', CONCAT('q', r.questao_id) AS ref,
                MAX(CASE q.nivel WHEN 'dificil' THEN ? WHEN 'medio' THEN ? ELSE ? END), MIN(r.respondido_em)
         FROM respostas r JOIN questoes q ON q.id = r.questao_id
         WHERE r.usuario_id = ? AND r.correta = 1
         GROUP BY ref`,
        [usuarioId, XP.questao.dificil, XP.questao.medio, XP.questao.facil, usuarioId]
    );

    // Participação: 1x por questão por dia
    await db.query(
        `${ins}
         SELECT ?, 'tentativa', CONCAT('q', questao_id, '-', DATE(respondido_em)) AS ref, ?, MIN(respondido_em)
         FROM respostas WHERE usuario_id = ?
         GROUP BY ref`,
        [usuarioId, XP.tentativa, usuarioId]
    );

    // ENEM: primeiro acerto de cada questão e participação diária
    await db.query(
        `${ins}
         SELECT ?, 'enem', CONCAT('e', ano, '-', numero, '-', idioma) AS ref, ?, MIN(respondido_em)
         FROM respostas_enem WHERE usuario_id = ? AND correta = 1 AND revelada = 0
         GROUP BY ref`,
        [usuarioId, XP.enem, usuarioId]
    );
    await db.query(
        `${ins}
         SELECT ?, 'tentativa_enem', CONCAT('e', ano, '-', numero, '-', idioma, '-', DATE(respondido_em)) AS ref, ?, MIN(respondido_em)
         FROM respostas_enem WHERE usuario_id = ? AND revelada = 0 AND alternativa_marcada IS NOT NULL
         GROUP BY ref`,
        [usuarioId, XP.tentativa, usuarioId]
    );

    // Simulados finalizados e sessões de foco concluídas
    await db.query(
        `${ins}
         SELECT ?, 'simulado', CONCAT('s', id), ?, finalizado_em
         FROM simulados WHERE usuario_id = ? AND finalizado_em IS NOT NULL`,
        [usuarioId, XP.simulado, usuarioId]
    );
    await db.query(
        `${ins}
         SELECT ?, 'foco', CONCAT('f', id), ?, concluido_em
         FROM sessoes_foco WHERE usuario_id = ? AND concluido_em IS NOT NULL`,
        [usuarioId, XP.foco, usuarioId]
    );
}

// Registra a meta do dia, se o aluno já cumpriu. Devolve true se foi agora.
async function registrarMetaDoDia(usuarioId, feitasHoje, meta, hoje) {
    if (feitasHoje < meta) return false;
    const [result] = await db.query(
        `INSERT IGNORE INTO xp_eventos (usuario_id, origem, referencia, pontos) VALUES (?, 'meta', ?, ?)`,
        [usuarioId, `m${hoje}`, XP.meta]
    );
    return result.affectedRows > 0;
}

// ---------------------------------------------------------------------
// Conquistas
// ---------------------------------------------------------------------

// Números usados para conferir as conquistas
async function estatisticas(usuarioId) {
    const hoje = await hojeNoBanco();
    const dias = await atividadePorDia(usuarioId);
    const ofensiva = calcularOfensiva(dias.map((d) => d.dia), hoje);

    const [sequencia] = await db.query(
        `SELECT correta, respondido_em FROM respostas WHERE usuario_id = ?
         UNION ALL
         SELECT correta, respondido_em FROM respostas_enem WHERE usuario_id = ? AND revelada = 0
         ORDER BY respondido_em ASC`,
        [usuarioId, usuarioId]
    );
    let melhorSequencia = 0;
    let atualSequencia = 0;
    sequencia.forEach((r) => {
        atualSequencia = Number(r.correta) ? atualSequencia + 1 : 0;
        melhorSequencia = Math.max(melhorSequencia, atualSequencia);
    });

    const [materias] = await db.query(
        `SELECT m.id, COUNT(DISTINCT q.id) AS total, COUNT(DISTINCT r.questao_id) AS respondidas
         FROM materias m
         JOIN questoes q ON q.materia_id = m.id
         LEFT JOIN respostas r ON r.questao_id = q.id AND r.usuario_id = ?
         GROUP BY m.id`,
        [usuarioId]
    );
    const melhorMateria = materias
        .map((m) => ({ total: Number(m.total), respondidas: Number(m.respondidas) }))
        .sort((a, b) => b.respondidas / b.total - a.respondidas / a.total)[0] || { total: 1, respondidas: 0 };

    const [[contagens]] = await db.query(
        `SELECT
            (SELECT COUNT(*) FROM respostas WHERE usuario_id = ? AND HOUR(respondido_em) >= 22)
          + (SELECT COUNT(*) FROM respostas_enem WHERE usuario_id = ? AND revelada = 0 AND HOUR(respondido_em) >= 22) AS coruja,
            (SELECT COUNT(*) FROM respostas_enem WHERE usuario_id = ? AND revelada = 0) AS enem,
            (SELECT COUNT(*) FROM simulados WHERE usuario_id = ? AND finalizado_em IS NOT NULL) AS simulados,
            (SELECT COUNT(*) FROM xp_eventos WHERE usuario_id = ? AND origem = 'meta') AS metas,
            (SELECT COUNT(*) FROM sessoes_foco WHERE usuario_id = ? AND concluido_em IS NOT NULL) AS foco`,
        [usuarioId, usuarioId, usuarioId, usuarioId, usuarioId, usuarioId]
    );

    const xp = await xpTotal(usuarioId);

    return {
        hoje,
        dias,
        ofensiva,
        totalRespostas: dias.reduce((s, d) => s + d.total, 0),
        maxDia: dias.reduce((m, d) => Math.max(m, d.total), 0),
        feitasHoje: (dias.find((d) => d.dia === hoje) || { total: 0 }).total,
        melhorSequencia,
        melhorMateria,
        coruja: Number(contagens.coruja) || 0,
        enem: Number(contagens.enem) || 0,
        simulados: Number(contagens.simulados) || 0,
        metas: Number(contagens.metas) || 0,
        foco: Number(contagens.foco) || 0,
        xp,
        nivel: calcularNivel(xp).nivel
    };
}

// Progresso de cada conquista: { atual, meta }
const REGRAS_CONQUISTAS = {
    primeira_questao: (e) => ({ atual: e.totalRespostas, meta: 1 }),
    dez_acertos: (e) => ({ atual: e.melhorSequencia, meta: 10 }),
    materia_completa: (e) => ({ atual: e.melhorMateria.respondidas, meta: e.melhorMateria.total }),
    semana_ativa: (e) => ({ atual: e.ofensiva.melhor, meta: 7 }),
    maratonista: (e) => ({ atual: e.maxDia, meta: 50 }),
    coruja: (e) => ({ atual: e.coruja, meta: 1 }),
    enem_20: (e) => ({ atual: e.enem, meta: 20 }),
    primeiro_simulado: (e) => ({ atual: e.simulados, meta: 1 }),
    meta_batida: (e) => ({ atual: e.metas, meta: 1 }),
    foco_total: (e) => ({ atual: e.foco, meta: 1 }),
    nivel_5: (e) => ({ atual: e.nivel, meta: 5 })
};

function progressoConquista(codigo, stats) {
    const regra = REGRAS_CONQUISTAS[codigo];
    if (!regra) return { atual: 0, meta: 1 };
    const { atual, meta } = regra(stats);
    return { atual: Math.min(atual, meta), meta: Math.max(meta, 1) };
}

// Libera as conquistas que o aluno já alcançou. Devolve só as novas.
async function verificarConquistas(usuarioId, stats) {
    const [todas] = await db.query(
        `SELECT c.id, c.codigo, c.titulo, c.descricao, c.icone, uc.id AS obtida
         FROM conquistas c
         LEFT JOIN usuario_conquistas uc ON uc.conquista_id = c.id AND uc.usuario_id = ?`,
        [usuarioId]
    );

    const novas = [];
    for (const c of todas) {
        if (c.obtida) continue;
        const { atual, meta } = progressoConquista(c.codigo, stats);
        if (atual < meta) continue;

        const [result] = await db.query(
            'INSERT IGNORE INTO usuario_conquistas (usuario_id, conquista_id) VALUES (?, ?)',
            [usuarioId, c.id]
        );
        if (result.affectedRows > 0) {
            await db.query(
                `INSERT IGNORE INTO xp_eventos (usuario_id, origem, referencia, pontos) VALUES (?, 'conquista', ?, ?)`,
                [usuarioId, c.codigo, XP.conquista]
            );
            novas.push({ codigo: c.codigo, titulo: c.titulo, descricao: c.descricao, icone: c.icone, xp: XP.conquista });
        }
    }
    return novas;
}

// Todas as conquistas, com as desbloqueadas e o progresso das bloqueadas
async function listarConquistas(usuarioId) {
    const stats = await estatisticas(usuarioId);
    const [todas] = await db.query(
        `SELECT c.id, c.codigo, c.titulo, c.descricao, c.icone, uc.obtido_em
         FROM conquistas c
         LEFT JOIN usuario_conquistas uc ON uc.conquista_id = c.id AND uc.usuario_id = ?
         ORDER BY c.id ASC`,
        [usuarioId]
    );
    return todas.map((c) => ({
        codigo: c.codigo,
        titulo: c.titulo,
        descricao: c.descricao,
        icone: c.icone,
        desbloqueada: !!c.obtido_em,
        obtido_em: c.obtido_em,
        ...progressoConquista(c.codigo, stats)
    }));
}

// ---------------------------------------------------------------------
// Função principal: chamada depois de cada resposta / atividade
// ---------------------------------------------------------------------
async function processar(usuarioId) {
    const xpAntes = await xpTotal(usuarioId);
    const nivelAntes = calcularNivel(xpAntes).nivel;

    await sincronizarXp(usuarioId);

    let stats = await estatisticas(usuarioId);
    const meta = await metaDiaria(usuarioId);
    const metaBatidaAgora = await registrarMetaDoDia(usuarioId, stats.feitasHoje, meta, stats.hoje);
    if (metaBatidaAgora) stats = await estatisticas(usuarioId);

    // Duas passadas: o bônus de uma conquista pode liberar a de nível
    let conquistasNovas = await verificarConquistas(usuarioId, stats);
    if (conquistasNovas.length) {
        stats = await estatisticas(usuarioId);
        conquistasNovas = conquistasNovas.concat(await verificarConquistas(usuarioId, stats));
    }

    const xpDepois = await xpTotal(usuarioId);
    const nivel = calcularNivel(xpDepois);

    return {
        xpGanho: xpDepois - xpAntes,
        nivel,
        subiuNivel: nivel.nivel > nivelAntes,
        conquistasNovas,
        ofensiva: stats.ofensiva.atual,
        hoje: { feitas: stats.feitasHoje, meta, metaBatidaAgora }
    };
}

// Resumo para o topo das páginas (ofensiva, nível, meta do dia)
async function resumo(usuarioId) {
    await sincronizarXp(usuarioId);
    const hoje = await hojeNoBanco();
    const dias = await atividadePorDia(usuarioId, 400);
    const ofensiva = calcularOfensiva(dias.map((d) => d.dia), hoje);
    const meta = await metaDiaria(usuarioId);
    const feitas = (dias.find((d) => d.dia === hoje) || { total: 0 }).total;
    return {
        ofensiva: ofensiva.atual,
        melhorOfensiva: ofensiva.melhor,
        estudouHoje: ofensiva.estudouHoje,
        nivel: calcularNivel(await xpTotal(usuarioId)),
        hoje: { feitas, meta }
    };
}

// ---------------------------------------------------------------------
// Ranking semanal (segunda a domingo)
// Mostra só o apelido ou o primeiro nome, nunca e-mail ou nome completo.
// ---------------------------------------------------------------------
function nomePublico(u) {
    if (u.apelido && u.apelido.trim()) return u.apelido.trim();
    return String(u.nome || 'Aluno').trim().split(/\s+/)[0];
}

async function rankingSemanal(usuarioId, limite = 10) {
    const [rows] = await db.query(
        `SELECT u.id, u.nome, u.apelido, u.avatar, u.ranking_publico, SUM(x.pontos) AS xp
         FROM xp_eventos x
         JOIN usuarios u ON u.id = x.usuario_id
         WHERE x.criado_em >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
         GROUP BY u.id, u.nome, u.apelido, u.avatar, u.ranking_publico
         ORDER BY xp DESC, u.id ASC`
    );

    const publicos = rows.filter((r) => Number(r.ranking_publico) === 1);
    const lista = publicos.map((r, i) => ({
        posicao: i + 1,
        nome: nomePublico(r),
        avatar: r.avatar || null,
        xp: Number(r.xp) || 0,
        voce: r.id === usuarioId
    }));

    const eu = rows.find((r) => r.id === usuarioId);
    const [[perfil]] = await db.query('SELECT ranking_publico FROM usuarios WHERE id = ?', [usuarioId]);
    let voce;
    if (perfil && Number(perfil.ranking_publico) !== 1) {
        voce = { oculto: true, xp: eu ? Number(eu.xp) : 0 };
    } else {
        voce = lista.find((l) => l.voce) || { posicao: null, xp: 0, voce: true };
    }

    return { top: lista.slice(0, limite), voce, participantes: lista.length };
}

module.exports = {
    XP,
    calcularNivel,
    calcularOfensiva,
    somarDias,
    hojeNoBanco,
    atividadePorDia,
    sincronizarXp,
    estatisticas,
    listarConquistas,
    verificarConquistas,
    processar,
    resumo,
    rankingSemanal,
    nomePublico
};
