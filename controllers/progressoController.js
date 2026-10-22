// =====================================================================
// Controller: Progresso (página "Meu progresso", plano de estudos,
// revisão das atividades e caderno de erros)
// =====================================================================
const Resultado = require('../models/Resultado');
const Materia = require('../models/Materia');
const Gamificacao = require('../models/Gamificacao');
const Enem = require('../models/Enem');

function erro500(res, err, mensagem) {
    console.error(err);
    return res.status(500).json({ sucesso: false, mensagem });
}

// Preenche os dias sem atividade com zero (para o gráfico não "pular" dias)
function preencherDias(dias, inicio, fim) {
    const lista = [];
    for (let d = inicio; d <= fim; d = Gamificacao.somarDias(d, 1)) {
        const encontrado = dias.find((x) => x.dia === d);
        lista.push(encontrado || { dia: d, total: 0, corretas: 0, tempo: 0 });
    }
    return lista;
}

const progressoController = {
    // GET /api/progresso  → tudo o que a página de progresso precisa
    async geral(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const [porMateria, geral, evolucao, historico, enem, gamificacao, todas] = await Promise.all([
                Resultado.progressoPorUsuario(usuarioId),
                Resultado.progressoGeral(usuarioId),
                Resultado.evolucaoUltimosDias(usuarioId, 7),
                Resultado.historicoPorUsuario(usuarioId, 10),
                Resultado.desempenhoEnem(usuarioId),
                Gamificacao.resumo(usuarioId),
                Materia.listarTodas()
            ]);

            // Cards do topo: matérias + ENEM
            const tempoMaterias = porMateria.reduce((s, m) => s + (m.tempo_total || 0), 0);
            const total = geral.total + enem.total;
            const corretas = geral.corretas + enem.corretas;
            const estudadas = porMateria.filter((m) => Number(m.questoes_respondidas) > 0);
            const melhor = estudadas.length
                ? estudadas.reduce((a, b) => (Number(b.percentual_acerto) > Number(a.percentual_acerto) ? b : a))
                : null;

            const resumo = {
                total,
                corretas,
                percentual: total ? Math.round((corretas / total) * 100) : 0,
                tempoTotal: tempoMaterias + enem.tempo,
                ofensiva: gamificacao.ofensiva,
                melhorOfensiva: gamificacao.melhorOfensiva,
                estudouHoje: gamificacao.estudouHoje,
                melhorMateria: melhor
                    ? { nome: melhor.materia_nome, percentual: Math.round(Number(melhor.percentual_acerto)), slug: melhor.slug }
                    : null,
                nivel: gamificacao.nivel
            };

            // Lista completa de matérias (inclusive as não estudadas, para o radar)
            const materias = todas.map((m) => {
                const p = porMateria.find((x) => x.materia_id === m.id);
                return {
                    id: m.id,
                    nome: m.nome,
                    slug: m.slug,
                    cor: m.cor,
                    icone: m.icone,
                    respondidas: p ? Number(p.questoes_respondidas) : 0,
                    corretas: p ? Number(p.questoes_corretas) : 0,
                    percentual: p ? Math.round(Number(p.percentual_acerto)) : 0,
                    nivel: p ? p.nivel_dificuldade : 'facil',
                    tempoMedio: p ? p.tempo_medio : null
                };
            });

            const enemAreas = enem.porArea.map((a) => ({
                ...a,
                nome: (Enem.AREAS[a.area] && Enem.AREAS[a.area].nome) || a.area,
                cor: (Enem.AREAS[a.area] && Enem.AREAS[a.area].cor) || '#5A77DF',
                icone: (Enem.AREAS[a.area] && Enem.AREAS[a.area].icone) || 'fa-book'
            }));

            res.json({
                sucesso: true,
                porMateria,
                geral,
                evolucao,
                historico,
                resumo,
                materias,
                enem: { ...enem, porArea: enemAreas }
            });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar progresso.');
        }
    },

    // GET /api/progresso/evolucao?periodo=7|30|tudo
    async evolucao(req, res) {
        try {
            const periodo = ['7', '30', 'tudo'].includes(req.query.periodo) ? req.query.periodo : '7';
            const hoje = await Gamificacao.hojeNoBanco();
            let dias;
            let inicio;
            if (periodo === 'tudo') {
                dias = await Gamificacao.atividadePorDia(req.usuarioId);
                inicio = dias.length ? dias[0].dia : hoje;
            } else {
                const n = Number(periodo);
                dias = await Gamificacao.atividadePorDia(req.usuarioId, n - 1);
                inicio = Gamificacao.somarDias(hoje, -(n - 1));
            }
            res.json({ sucesso: true, periodo, dias: preencherDias(dias, inicio, hoje) });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar a evolução.');
        }
    },

    // GET /api/progresso/atividade → calendário dos últimos 3 meses
    async atividade(req, res) {
        try {
            const hoje = await Gamificacao.hojeNoBanco();
            const dias = await Gamificacao.atividadePorDia(req.usuarioId, 90);
            res.json({ sucesso: true, hoje, dias });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar a atividade.');
        }
    },

    // GET /api/progresso/materias/:slug → detalhes de uma matéria
    async detalheMateria(req, res) {
        try {
            const materia = await Materia.buscarPorSlug(req.params.slug);
            if (!materia) {
                return res.status(404).json({ sucesso: false, mensagem: 'Matéria não encontrada.' });
            }
            const detalhe = await Resultado.detalheMateria(req.usuarioId, materia.id);
            res.json({ sucesso: true, materia, ...detalhe });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar os detalhes da matéria.');
        }
    },

    // GET /api/progresso/revisao?respostas=1,2,3
    async revisao(req, res) {
        try {
            const ids = String(req.query.respostas || '')
                .split(',')
                .map((n) => parseInt(n, 10))
                .filter((n) => Number.isInteger(n) && n > 0)
                .slice(0, 50);
            if (!ids.length) {
                return res.status(400).json({ sucesso: false, mensagem: 'Nenhuma resposta informada.' });
            }
            const itens = await Resultado.revisaoRespostas(req.usuarioId, ids);
            res.json({ sucesso: true, itens });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar a revisão.');
        }
    },

    // GET /api/progresso/erros → caderno de erros (matérias + ENEM)
    async erros(req, res) {
        try {
            const [materias, enem] = await Promise.all([
                Resultado.errosMaterias(req.usuarioId),
                Resultado.errosEnem(req.usuarioId)
            ]);
            res.json({
                sucesso: true,
                materias: materias.map((q) => ({
                    id: q.id,
                    enunciado: q.enunciado,
                    nivel: q.nivel,
                    materia_nome: q.materia_nome,
                    slug: q.slug,
                    cor: q.cor,
                    icone: q.icone,
                    alternativa_marcada: q.alternativa_marcada,
                    respondido_em: q.respondido_em,
                    vezes: q.vezes,
                    erros: q.erros
                })),
                enem: enem.map((q) => ({
                    ...q,
                    area_nome: (Enem.AREAS[q.area] && Enem.AREAS[q.area].nome) || q.area,
                    cor: (Enem.AREAS[q.area] && Enem.AREAS[q.area].cor) || '#5A77DF',
                    icone: (Enem.AREAS[q.area] && Enem.AREAS[q.area].icone) || 'fa-book'
                }))
            });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar o caderno de erros.');
        }
    },

    // GET /api/progresso/plano → plano, resumo, semana, sugestões do ENEM e meta
    async plano(req, res) {
        try {
            const usuarioId = req.usuarioId;
            let plano = await Resultado.buscarPlanoEstudos(usuarioId);
            if (plano.length === 0) {
                plano = await Resultado.gerarPlanoEstudos(usuarioId);
            }
            res.json({ sucesso: true, ...(await montarPlano(usuarioId, plano)) });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar plano de estudos.');
        }
    },

    // POST /api/progresso/plano/gerar
    async gerarPlano(req, res) {
        try {
            const plano = await Resultado.gerarPlanoEstudos(req.usuarioId);
            res.json({ sucesso: true, ...(await montarPlano(req.usuarioId, plano)) });
        } catch (err) {
            erro500(res, err, 'Erro ao gerar plano de estudos.');
        }
    },

    // PATCH /api/progresso/plano/:id  { concluido: true|false }
    async marcarItemPlano(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (!id || typeof req.body.concluido !== 'boolean') {
                return res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos.' });
            }
            const ok = await Resultado.marcarItemPlano(req.usuarioId, id, req.body.concluido);
            if (!ok) {
                return res.status(404).json({ sucesso: false, mensagem: 'Item do plano não encontrado.' });
            }
            const plano = await Resultado.buscarPlanoEstudos(req.usuarioId);
            res.json({ sucesso: true, ...(await montarPlano(req.usuarioId, plano)) });
        } catch (err) {
            erro500(res, err, 'Erro ao atualizar o plano.');
        }
    },

    // GET /api/progresso/conquistas → todas as conquistas, com progresso
    async conquistas(req, res) {
        try {
            // Confere se o aluno já alcançou alguma (inclusive com dados antigos)
            const { conquistasNovas } = await Gamificacao.processar(req.usuarioId);
            const todas = await Gamificacao.listarConquistas(req.usuarioId);
            res.json({
                sucesso: true,
                conquistas: todas.filter((c) => c.desbloqueada),
                todas,
                novas: conquistasNovas
            });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar conquistas.');
        }
    }
};

// Junta o plano com o resumo, a semana, as sugestões do ENEM e a meta diária
async function montarPlano(usuarioId, plano) {
    const [semana, enem, gamificacao] = await Promise.all([
        Resultado.planoSemanal(usuarioId, plano),
        Resultado.desempenhoEnem(usuarioId),
        Gamificacao.resumo(usuarioId)
    ]);

    // Sugestões do ENEM: áreas ligadas às matérias com mais dificuldade
    const areas = [];
    plano
        .filter((p) => !p.concluido)
        .forEach((p) => {
            const area = Enem.MATERIA_PARA_AREA[p.slug];
            if (area && !areas.some((a) => a.area === area)) areas.push({ area, materia: p.materia_nome });
        });
    if (areas.length === 0 && enem.porArea.length) {
        const pior = [...enem.porArea].sort((a, b) => a.corretas / a.total - b.corretas / b.total)[0];
        areas.push({ area: pior.area, materia: null });
    }

    const sugestoesEnem = areas.slice(0, 2).map(({ area, materia }) => {
        const info = Enem.AREAS[area] || { nome: area, cor: '#5A77DF', icone: 'fa-book' };
        const dados = enem.porArea.find((a) => a.area === area);
        let texto;
        if (dados && dados.total) {
            const p = Math.round((dados.corretas / dados.total) * 100);
            texto = `Você acertou ${dados.corretas} de ${dados.total} questões de ${info.nome} no ENEM (${p}%).`;
        } else {
            texto = `Você ainda não praticou ${info.nome} no ENEM.`;
        }
        if (materia) texto += ` Essa área cobra ${materia}.`;
        return { area, nome: info.nome, cor: info.cor, icone: info.icone, texto };
    });

    const concluidas = plano.filter((p) => p.concluido).length;
    return {
        plano,
        resumo: { concluidas, total: plano.length },
        semana,
        sugestoesEnem,
        meta: gamificacao.hoje
    };
}

module.exports = progressoController;
