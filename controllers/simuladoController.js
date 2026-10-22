// =====================================================================
// Controller: Simulados do ENEM
// Cronômetro, respostas salvas no servidor, correção e histórico.
// =====================================================================
const Enem = require('../models/Enem');
const Simulado = require('../models/Simulado');
const RespostaEnem = require('../models/RespostaEnem');
const Gamificacao = require('../models/Gamificacao');

const QUANTIDADES = [5, 10, 20, 45];

function nomeArea(area) {
    if (!area) return 'Todas as áreas';
    return (Enem.AREAS[area] && Enem.AREAS[area].nome) || area;
}

function semGabarito(q) {
    const { correctAlternative, ...resto } = q;
    return { ...resto, alternatives: (q.alternatives || []).map(({ isCorrect, ...alt }) => alt) };
}

function responderErro(res, err, mensagem) {
    console.error('[SIMULADO]', err.message);
    if (err.status && err.status < 500) {
        return res.status(err.status).json({ sucesso: false, mensagem: err.message });
    }
    if (err.status) {
        return res.status(502).json({
            sucesso: false,
            mensagem: 'Não foi possível acessar a API do ENEM agora. Verifique sua internet e tente novamente.'
        });
    }
    return res.status(500).json({ sucesso: false, mensagem });
}

async function questoesCompletas(sim) {
    return Enem.buscarQuestoesCompletas(sim.ano, sim.questoes, sim.idioma);
}

// Simulado em andamento (sem gabarito)
async function montarAberto(sim) {
    const questoes = (await questoesCompletas(sim)).map(semGabarito);
    return {
        id: sim.id,
        ano: sim.ano,
        area: sim.area,
        areaNome: nomeArea(sim.area),
        idioma: sim.idioma,
        total: sim.total,
        duracao: sim.duracao,
        restante: sim.restante,
        respostas: sim.respostas,
        questoes
    };
}

// Simulado finalizado (com gabarito e correção)
async function montarResultado(sim) {
    const completas = await questoesCompletas(sim);
    const questoes = completas.map((q) => {
        const letra = sim.respostas[q.index] || null;
        return { ...q, respostaAluno: letra, acertou: !!letra && letra === q.correctAlternative };
    });

    const porArea = {};
    questoes.forEach((q) => {
        const a = (porArea[q.discipline] = porArea[q.discipline] || { area: q.discipline, nome: nomeArea(q.discipline), total: 0, acertos: 0 });
        a.total++;
        if (q.acertou) a.acertos++;
    });

    return {
        id: sim.id,
        ano: sim.ano,
        area: sim.area,
        areaNome: nomeArea(sim.area),
        idioma: sim.idioma,
        total: sim.total,
        acertos: sim.acertos,
        respondidas: Object.keys(sim.respostas).length,
        nota: sim.nota,
        tempoGasto: sim.tempoGasto,
        duracao: sim.duracao,
        finalizadoEm: sim.finalizadoEm,
        porArea: Object.values(porArea),
        questoes
    };
}

// Corrige no servidor, grava as respostas no banco e encerra o simulado
async function finalizarInterno(usuarioId, sim) {
    const completas = await questoesCompletas(sim);
    let acertos = 0;
    const respondidas = [];
    completas.forEach((q) => {
        const letra = sim.respostas[q.index];
        if (!letra) return;
        const correta = letra === q.correctAlternative;
        if (correta) acertos++;
        respondidas.push({ q, letra, correta });
    });

    const tempoGasto = Math.min(sim.decorridos, sim.duracao);
    const nota = sim.total ? Math.round((acertos / sim.total) * 1000) / 100 : 0;

    const ok = await Simulado.marcarFinalizado(usuarioId, sim.id, { acertos, nota, tempoGasto });
    if (ok) {
        const tempoPorQuestao = respondidas.length ? Math.round(tempoGasto / respondidas.length) : 0;
        for (const { q, letra, correta } of respondidas) {
            await RespostaEnem.salvar({
                usuarioId,
                simuladoId: sim.id,
                ano: sim.ano,
                numero: q.index,
                idioma: q.language || '',
                area: q.discipline,
                letra,
                correta,
                tempoGasto: tempoPorQuestao
            });
        }
    }
    return Gamificacao.processar(usuarioId);
}

// Finaliza sozinho os simulados cujo tempo acabou há mais de 30 s
async function encerrarExpirados(usuarioId) {
    const abertos = await Simulado.abertos(usuarioId);
    const ativos = [];
    for (const sim of abertos) {
        if (sim.expirado) await finalizarInterno(usuarioId, sim);
        else ativos.push(sim);
    }
    return ativos;
}

const simuladoController = {
    // GET /api/simulados → simulado em andamento + histórico
    async listar(req, res) {
        try {
            const ativos = await encerrarExpirados(req.usuarioId);
            const historico = await Simulado.historico(req.usuarioId, 20);
            res.json({
                sucesso: true,
                emAndamento: ativos.map((s) => ({
                    id: s.id,
                    ano: s.ano,
                    areaNome: nomeArea(s.area),
                    total: s.total,
                    respondidas: Object.keys(s.respostas).length,
                    restante: s.restante
                })),
                historico: historico.map((s) => ({
                    id: s.id,
                    ano: s.ano,
                    area: s.area,
                    areaNome: nomeArea(s.area),
                    total: s.total,
                    acertos: s.acertos,
                    nota: s.nota,
                    tempoGasto: s.tempoGasto,
                    finalizadoEm: s.finalizadoEm
                }))
            });
        } catch (err) {
            responderErro(res, err, 'Erro ao buscar os simulados.');
        }
    },

    // POST /api/simulados  { ano, area, idioma, quantidade }
    async criar(req, res) {
        try {
            const ano = parseInt(req.body.ano, 10);
            const quantidade = parseInt(req.body.quantidade, 10);
            const area = req.body.area || null;
            if (!ano || !QUANTIDADES.includes(quantidade)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Escolha o ano e a quantidade de questões (5, 10, 20 ou 45).' });
            }

            const ativos = await encerrarExpirados(req.usuarioId);
            if (ativos.length) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: 'Você já tem um simulado em andamento. Termine ou finalize ele antes de começar outro.',
                    simuladoId: ativos[0].id
                });
            }

            const provas = await Enem.listarProvas();
            if (!provas.some((p) => p.year === ano)) {
                return res.status(404).json({ sucesso: false, mensagem: `Não há prova do ENEM disponível para o ano ${ano}.` });
            }
            const prova = await Enem.buscarProva(ano);
            const idioma = Enem.resolverIdioma(prova, req.body.idioma || null);
            if (area && !prova.disciplines.some((d) => d.value === area)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Área do conhecimento inválida para esta prova.' });
            }

            const disponiveis = Enem.filtrarQuestoes(prova, area, idioma);
            if (!disponiveis.length) {
                return res.status(404).json({ sucesso: false, mensagem: 'Nenhuma questão encontrada com esses filtros.' });
            }

            // Sorteia as questões e coloca na ordem da prova
            const sorteadas = disponiveis
                .map((q) => ({ q, r: Math.random() }))
                .sort((a, b) => a.r - b.r)
                .slice(0, quantidade)
                .map(({ q }) => ({ index: q.index, language: q.language || null }))
                .sort((a, b) => a.index - b.index);

            const id = await Simulado.criar({ usuarioId: req.usuarioId, ano, area, idioma, questoes: sorteadas });
            const sim = await Simulado.buscar(req.usuarioId, id);
            res.status(201).json({ sucesso: true, simulado: await montarAberto(sim) });
        } catch (err) {
            responderErro(res, err, 'Erro ao criar o simulado.');
        }
    },

    // GET /api/simulados/:id → em andamento (sem gabarito) ou resultado
    async detalhar(req, res) {
        try {
            let sim = await Simulado.buscar(req.usuarioId, parseInt(req.params.id, 10));
            if (!sim) return res.status(404).json({ sucesso: false, mensagem: 'Simulado não encontrado.' });

            if (!sim.finalizado && sim.expirado) {
                await finalizarInterno(req.usuarioId, sim);
                sim = await Simulado.buscar(req.usuarioId, sim.id);
            }
            if (sim.finalizado) {
                return res.json({ sucesso: true, finalizado: true, resultado: await montarResultado(sim) });
            }
            res.json({ sucesso: true, finalizado: false, simulado: await montarAberto(sim) });
        } catch (err) {
            responderErro(res, err, 'Erro ao buscar o simulado.');
        }
    },

    // POST /api/simulados/:id/responder  { numero, letra }  (letra null = limpar)
    async responder(req, res) {
        try {
            const sim = await Simulado.buscar(req.usuarioId, parseInt(req.params.id, 10));
            if (!sim) return res.status(404).json({ sucesso: false, mensagem: 'Simulado não encontrado.' });
            if (sim.finalizado) return res.status(400).json({ sucesso: false, mensagem: 'Este simulado já foi finalizado.' });
            if (sim.expirado) {
                await finalizarInterno(req.usuarioId, sim);
                return res.status(400).json({ sucesso: false, tempoEsgotado: true, mensagem: 'O tempo do simulado acabou.' });
            }

            const numero = parseInt(req.body.numero, 10);
            if (!sim.questoes.some((q) => q.index === numero)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Essa questão não faz parte do simulado.' });
            }
            const letra = req.body.letra ? String(req.body.letra).toUpperCase() : null;
            if (letra && !['A', 'B', 'C', 'D', 'E'].includes(letra)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Alternativa inválida.' });
            }

            const respostas = { ...sim.respostas };
            if (letra) respostas[numero] = letra;
            else delete respostas[numero];
            await Simulado.salvarRespostas(req.usuarioId, sim.id, respostas);

            res.json({ sucesso: true, respondidas: Object.keys(respostas).length, restante: sim.restante });
        } catch (err) {
            responderErro(res, err, 'Erro ao salvar a resposta.');
        }
    },

    // POST /api/simulados/:id/finalizar → corrige e devolve o resultado
    async finalizar(req, res) {
        try {
            let sim = await Simulado.buscar(req.usuarioId, parseInt(req.params.id, 10));
            if (!sim) return res.status(404).json({ sucesso: false, mensagem: 'Simulado não encontrado.' });

            let gamificacao = null;
            if (!sim.finalizado) {
                gamificacao = await finalizarInterno(req.usuarioId, sim);
                sim = await Simulado.buscar(req.usuarioId, sim.id);
            }
            res.json({ sucesso: true, resultado: await montarResultado(sim), gamificacao });
        } catch (err) {
            responderErro(res, err, 'Erro ao finalizar o simulado.');
        }
    }
};

module.exports = simuladoController;
