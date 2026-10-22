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
        const total = Number(stats.total) || 0;
        const corretas = Number(stats.corretas) || 0;
        const percentual = total > 0 ? ((corretas / total) * 100).toFixed(2) : 0;

        // Dificuldade adaptativa (gradual): a cada 5 respostas na matéria,
        // olha as últimas 5. Acertou 4 ou mais → sobe um nível.
        // Acertou 2 ou menos → desce um nível. Senão, continua igual.
        const ORDEM_NIVEIS = ['facil', 'medio', 'dificil'];
        const [[registro]] = await db.query(
            'SELECT nivel_dificuldade FROM progresso WHERE usuario_id = ? AND materia_id = ?',
            [usuarioId, materiaId]
        );
        let nivel = (registro && registro.nivel_dificuldade) || 'facil';
        let nivelMudou = null;

        if (total > 0 && total % 5 === 0) {
            const [ultimas] = await db.query(
                `SELECT r.correta
                 FROM respostas r
                 JOIN questoes q ON q.id = r.questao_id
                 WHERE r.usuario_id = ? AND q.materia_id = ?
                 ORDER BY r.respondido_em DESC, r.id DESC
                 LIMIT 5`,
                [usuarioId, materiaId]
            );
            const acertosRecentes = ultimas.reduce((s, r) => s + Number(r.correta), 0);
            const i = ORDEM_NIVEIS.indexOf(nivel);
            if (acertosRecentes >= 4 && i < ORDEM_NIVEIS.length - 1) {
                nivel = ORDEM_NIVEIS[i + 1];
                nivelMudou = 'subiu';
            } else if (acertosRecentes <= 2 && i > 0) {
                nivel = ORDEM_NIVEIS[i - 1];
                nivelMudou = 'desceu';
            }
        }

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

        return { total, corretas, percentual, nivel, nivelMudou };
    },

    async progressoPorUsuario(usuarioId) {
        const [rows] = await db.query(
            `SELECT p.*, m.nome AS materia_nome, m.icone, m.cor, m.slug,
                    (SELECT AVG(r.tempo_gasto)
                     FROM respostas r JOIN questoes q ON q.id = r.questao_id
                     WHERE r.usuario_id = p.usuario_id AND q.materia_id = p.materia_id) AS tempo_medio,
                    (SELECT SUM(r.tempo_gasto)
                     FROM respostas r JOIN questoes q ON q.id = r.questao_id
                     WHERE r.usuario_id = p.usuario_id AND q.materia_id = p.materia_id) AS tempo_total
             FROM progresso p
             JOIN materias m ON m.id = p.materia_id
             WHERE p.usuario_id = ?`,
            [usuarioId]
        );
        return rows.map((r) => ({
            ...r,
            tempo_medio: r.tempo_medio === null ? null : Math.round(Number(r.tempo_medio)),
            tempo_total: Number(r.tempo_total) || 0
        }));
    },

    async progressoGeral(usuarioId) {
        const [[row]] = await db.query(
            `SELECT
                COALESCE(SUM(questoes_respondidas), 0) AS total_respondidas,
                COALESCE(SUM(questoes_corretas), 0) AS total_corretas
             FROM progresso WHERE usuario_id = ?`,
            [usuarioId]
        );
        // SUM() do MySQL volta como texto: converte para número
        const total = Number(row.total_respondidas) || 0;
        const corretas = Number(row.total_corretas) || 0;
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
                    COALESCE(p.questoes_respondidas, 0) AS questoes_respondidas,
                    COALESCE(p.questoes_corretas, 0) AS questoes_corretas
             FROM materias m
             LEFT JOIN progresso p ON p.materia_id = m.id AND p.usuario_id = ?
             ORDER BY percentual_acerto ASC, questoes_respondidas ASC`,
            [usuarioId]
        );

        await db.query('DELETE FROM plano_estudos WHERE usuario_id = ? AND concluido = 0', [usuarioId]);

        // Cada vez que o plano é gerado ele ganha um número de "lote" novo
        const [[ultimo]] = await db.query(
            'SELECT COALESCE(MAX(lote), 0) AS lote FROM plano_estudos WHERE usuario_id = ?',
            [usuarioId]
        );
        const lote = Number(ultimo.lote) + 1;

        const recomendacoes = materias.slice(0, 4);
        for (const materia of recomendacoes) {
            const respondidas = Number(materia.questoes_respondidas);
            const corretas = Number(materia.questoes_corretas);
            const percentual = Math.round(Number(materia.percentual_acerto));
            const numeros = `Você acertou ${corretas} de ${respondidas} questões de ${materia.nome} (${percentual}%).`;

            let prioridade = 'media';
            let motivo;
            if (respondidas === 0) {
                prioridade = 'alta';
                motivo = `Você ainda não respondeu nenhuma questão de ${materia.nome}.`;
            } else if (percentual < 50) {
                prioridade = 'alta';
                motivo = `${numeros} Vamos reforçar esse conteúdo.`;
            } else if (percentual < 80) {
                prioridade = 'media';
                motivo = `${numeros} Você está indo bem, mas pode melhorar.`;
            } else {
                prioridade = 'baixa';
                motivo = `${numeros} Ótimo desempenho! Revise de vez em quando.`;
            }

            await db.query(
                `INSERT INTO plano_estudos (usuario_id, materia_id, motivo, prioridade, lote) VALUES (?, ?, ?, ?, ?)`,
                [usuarioId, materia.id, motivo, prioridade, lote]
            );
        }

        return this.buscarPlanoEstudos(usuarioId);
    },

    // Itens do plano atual (último lote gerado), com os números atualizados
    async buscarPlanoEstudos(usuarioId) {
        const [rows] = await db.query(
            `SELECT pe.*, m.nome AS materia_nome, m.slug, m.icone, m.cor,
                    COALESCE(p.questoes_respondidas, 0) AS respondidas,
                    COALESCE(p.questoes_corretas, 0) AS corretas,
                    COALESCE(p.percentual_acerto, 0) AS percentual
             FROM plano_estudos pe
             JOIN materias m ON m.id = pe.materia_id
             LEFT JOIN progresso p ON p.usuario_id = pe.usuario_id AND p.materia_id = pe.materia_id
             WHERE pe.usuario_id = ?
               AND pe.lote = (SELECT MAX(lote) FROM plano_estudos WHERE usuario_id = ?)
             ORDER BY FIELD(pe.prioridade, 'alta','media','baixa'), pe.id ASC`,
            [usuarioId, usuarioId]
        );
        return rows.map((r) => ({
            ...r,
            concluido: Number(r.concluido) === 1,
            respondidas: Number(r.respondidas),
            corretas: Number(r.corretas),
            percentual: Math.round(Number(r.percentual))
        }));
    },

    // Marca/desmarca um item do plano. Só altera itens do próprio aluno.
    async marcarItemPlano(usuarioId, itemId, concluido) {
        const [result] = await db.query(
            'UPDATE plano_estudos SET concluido = ? WHERE id = ? AND usuario_id = ?',
            [concluido ? 1 : 0, itemId, usuarioId]
        );
        return result.affectedRows > 0;
    },

    // Distribui as matérias do plano de segunda a sábado (as de prioridade
    // alta aparecem mais vezes) e deixa o domingo para revisão.
    // "feito" = o aluno respondeu questões daquela matéria naquele dia.
    async planoSemanal(usuarioId, plano) {
        const [[datas]] = await db.query(
            `SELECT DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AS segunda, CURDATE() AS hoje`
        );
        const segunda = String(datas.segunda).slice(0, 10);
        const hoje = String(datas.hoje).slice(0, 10);

        const [feitas] = await db.query(
            `SELECT DATE(r.respondido_em) AS dia, q.materia_id, COUNT(*) AS total
             FROM respostas r JOIN questoes q ON q.id = r.questao_id
             WHERE r.usuario_id = ? AND r.respondido_em >= ?
             GROUP BY DATE(r.respondido_em), q.materia_id`,
            [usuarioId, segunda]
        );
        const [feitasEnem] = await db.query(
            `SELECT DATE(respondido_em) AS dia, COUNT(*) AS total
             FROM respostas_enem
             WHERE usuario_id = ? AND revelada = 0 AND respondido_em >= ?
             GROUP BY DATE(respondido_em)`,
            [usuarioId, segunda]
        );

        const PESO = { alta: 3, media: 2, baixa: 1 };
        const pendentes = plano.filter((p) => !p.concluido);
        const base = pendentes.length ? pendentes : plano;
        const sequencia = [];
        for (let rodada = 1; rodada <= 3; rodada++) {
            base.forEach((p) => {
                if ((pendentes.length ? PESO[p.prioridade] || 1 : 1) >= rodada) sequencia.push(p);
            });
        }

        const NOMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const somar = (data, dias) => {
            const d = new Date(data + 'T12:00:00Z');
            d.setUTCDate(d.getUTCDate() + dias);
            return d.toISOString().slice(0, 10);
        };

        return NOMES.map((nome, i) => {
            const data = somar(segunda, i);
            const dia = { data, nome, hoje: data === hoje, passado: data < hoje };
            const enemNoDia = feitasEnem.find((f) => String(f.dia).slice(0, 10) === data);

            if (i === 6 || sequencia.length === 0) {
                const total = feitas
                    .filter((f) => String(f.dia).slice(0, 10) === data)
                    .reduce((s, f) => s + Number(f.total), 0) + (enemNoDia ? Number(enemNoDia.total) : 0);
                return { ...dia, tipo: 'revisao', questoesFeitas: total, feito: total > 0 };
            }

            const item = sequencia[i % sequencia.length];
            const registro = feitas.find((f) => String(f.dia).slice(0, 10) === data && f.materia_id === item.materia_id);
            return {
                ...dia,
                tipo: 'materia',
                materia: { nome: item.materia_nome, slug: item.slug, cor: item.cor, icone: item.icone, prioridade: item.prioridade },
                questoesFeitas: registro ? Number(registro.total) : 0,
                feito: !!registro
            };
        });
    },

    // ---------- Detalhes, revisão e caderno de erros ----------

    // Detalhes de uma matéria para a página de progresso
    async detalheMateria(usuarioId, materiaId) {
        const [porNivel] = await db.query(
            `SELECT q.nivel, COUNT(*) AS total, SUM(r.correta) AS corretas, AVG(r.tempo_gasto) AS tempo_medio
             FROM respostas r JOIN questoes q ON q.id = r.questao_id
             WHERE r.usuario_id = ? AND q.materia_id = ?
             GROUP BY q.nivel`,
            [usuarioId, materiaId]
        );
        const [ultimas] = await db.query(
            `SELECT r.id, r.correta, r.tempo_gasto, r.respondido_em, q.enunciado, q.nivel
             FROM respostas r JOIN questoes q ON q.id = r.questao_id
             WHERE r.usuario_id = ? AND q.materia_id = ?
             ORDER BY r.respondido_em DESC, r.id DESC
             LIMIT 8`,
            [usuarioId, materiaId]
        );
        const [[cobertura]] = await db.query(
            `SELECT COUNT(*) AS total,
                    (SELECT COUNT(DISTINCT r.questao_id) FROM respostas r JOIN questoes q2 ON q2.id = r.questao_id
                     WHERE r.usuario_id = ? AND q2.materia_id = ?) AS respondidas
             FROM questoes WHERE materia_id = ?`,
            [usuarioId, materiaId, materiaId]
        );
        const [[progresso]] = await db.query(
            'SELECT * FROM progresso WHERE usuario_id = ? AND materia_id = ?',
            [usuarioId, materiaId]
        );

        const niveis = ['facil', 'medio', 'dificil'].map((nivel) => {
            const n = porNivel.find((p) => p.nivel === nivel) || {};
            return {
                nivel,
                total: Number(n.total) || 0,
                corretas: Number(n.corretas) || 0,
                tempoMedio: n.tempo_medio ? Math.round(Number(n.tempo_medio)) : null
            };
        });

        return {
            nivelAtual: (progresso && progresso.nivel_dificuldade) || 'facil',
            respondidas: progresso ? Number(progresso.questoes_respondidas) : 0,
            corretas: progresso ? Number(progresso.questoes_corretas) : 0,
            percentual: progresso ? Math.round(Number(progresso.percentual_acerto)) : 0,
            questoesDisponiveis: Number(cobertura.total) || 0,
            questoesDiferentes: Number(cobertura.respondidas) || 0,
            porNivel: niveis,
            ultimas: ultimas.map((u) => ({ ...u, correta: Number(u.correta) === 1 }))
        };
    },

    // Revisão de uma atividade: só respostas do próprio aluno
    async revisaoRespostas(usuarioId, ids) {
        if (!ids.length) return [];
        const [rows] = await db.query(
            `SELECT r.id, r.alternativa_marcada, r.correta, r.tempo_gasto,
                    q.id AS questao_id, q.enunciado, q.alternativa_a, q.alternativa_b, q.alternativa_c, q.alternativa_d,
                    q.correta AS gabarito, q.explicacao, q.nivel, m.nome AS materia_nome
             FROM respostas r
             JOIN questoes q ON q.id = r.questao_id
             JOIN materias m ON m.id = q.materia_id
             WHERE r.usuario_id = ? AND r.id IN (?)
             ORDER BY r.id ASC`,
            [usuarioId, ids]
        );
        return rows.map((r) => ({ ...r, correta: Number(r.correta) === 1 }));
    },

    // Caderno de erros: questões cuja ÚLTIMA resposta do aluno está errada
    async errosMaterias(usuarioId, slug = null) {
        const params = [usuarioId];
        let filtro = '';
        if (slug) {
            filtro = 'AND m.slug = ?';
            params.push(slug);
        }
        const [rows] = await db.query(
            `SELECT q.*, m.nome AS materia_nome, m.slug, m.cor, m.icone,
                    r.alternativa_marcada, r.respondido_em, u.vezes, u.erros
             FROM (
                SELECT questao_id, MAX(id) AS ultima, COUNT(*) AS vezes,
                       SUM(CASE WHEN correta = 0 THEN 1 ELSE 0 END) AS erros
                FROM respostas WHERE usuario_id = ?
                GROUP BY questao_id
             ) u
             JOIN respostas r ON r.id = u.ultima
             JOIN questoes q ON q.id = u.questao_id
             JOIN materias m ON m.id = q.materia_id
             WHERE r.correta = 0 ${filtro}
             ORDER BY r.respondido_em DESC`,
            params
        );
        return rows.map((r) => ({ ...r, vezes: Number(r.vezes), erros: Number(r.erros) }));
    },

    async errosEnem(usuarioId) {
        const [rows] = await db.query(
            `SELECT re.ano, re.numero, re.idioma, re.area, re.alternativa_marcada, re.respondido_em, u.vezes
             FROM (
                SELECT ano, numero, idioma, MAX(id) AS ultima, COUNT(*) AS vezes
                FROM respostas_enem
                WHERE usuario_id = ? AND revelada = 0
                GROUP BY ano, numero, idioma
             ) u
             JOIN respostas_enem re ON re.id = u.ultima
             WHERE re.correta = 0
             ORDER BY re.respondido_em DESC`,
            [usuarioId]
        );
        return rows.map((r) => ({ ...r, vezes: Number(r.vezes) }));
    },

    // Desempenho no ENEM por área (para o progresso e o plano)
    async desempenhoEnem(usuarioId) {
        const [rows] = await db.query(
            `SELECT area, COUNT(*) AS total, SUM(correta) AS corretas, SUM(tempo_gasto) AS tempo
             FROM respostas_enem
             WHERE usuario_id = ? AND revelada = 0
             GROUP BY area`,
            [usuarioId]
        );
        const porArea = rows.map((r) => ({
            area: r.area,
            total: Number(r.total),
            corretas: Number(r.corretas) || 0,
            tempo: Number(r.tempo) || 0
        }));
        const total = porArea.reduce((s, a) => s + a.total, 0);
        const corretas = porArea.reduce((s, a) => s + a.corretas, 0);
        return {
            total,
            corretas,
            percentual: total ? Math.round((corretas / total) * 100) : 0,
            tempo: porArea.reduce((s, a) => s + a.tempo, 0),
            porArea
        };
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
