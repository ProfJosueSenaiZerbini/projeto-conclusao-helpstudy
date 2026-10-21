// =====================================================================
// Controller: ENEM (provas e questões da API enem.dev)
// =====================================================================
const Enem = require('../models/Enem');

// Resume a prova para o front (sem a lista completa de questões)
function resumoProva(prova, idioma) {
    const contagem = {};
    Enem.filtrarQuestoes(prova, null, idioma).forEach((q) => {
        contagem[q.discipline] = (contagem[q.discipline] || 0) + 1;
    });

    return {
        ano: prova.year,
        titulo: prova.title,
        idiomas: prova.languages.map((l) => ({ valor: l.value, nome: l.label })),
        areas: prova.disciplines.map((d) => ({
            valor: d.value,
            nome: (Enem.AREAS[d.value] && Enem.AREAS[d.value].nome) || d.label,
            nomeCompleto: d.label,
            icone: (Enem.AREAS[d.value] && Enem.AREAS[d.value].icone) || 'fa-book',
            cor: (Enem.AREAS[d.value] && Enem.AREAS[d.value].cor) || '#5A77DF',
            total: contagem[d.value] || 0
        })),
        totalQuestoes: Object.values(contagem).reduce((a, b) => a + b, 0)
    };
}

// Valida o ano e o idioma pedidos e devolve a prova
async function carregarProva(req) {
    const ano = parseInt(req.params.ano, 10);
    const provas = await Enem.listarProvas();
    if (!provas.some((p) => p.year === ano)) {
        const erro = new Error(`Não há prova do ENEM disponível para o ano ${req.params.ano}.`);
        erro.status = 404;
        throw erro;
    }

    const prova = await Enem.buscarProva(ano);

    // Idioma estrangeiro: usa o pedido, ou o primeiro da prova (se a prova tiver)
    let idioma = req.query.idioma || null;
    if (prova.languages.length === 0) {
        idioma = null;
    } else if (!prova.languages.some((l) => l.value === idioma)) {
        idioma = prova.languages[0].value;
    }

    const disciplina = req.query.area || null;
    if (disciplina && !prova.disciplines.some((d) => d.value === disciplina)) {
        const erro = new Error('Área do conhecimento inválida para esta prova.');
        erro.status = 400;
        throw erro;
    }

    return { ano, prova, idioma, disciplina };
}

function responderErro(res, err, mensagemPadrao) {
    console.error('[ENEM]', err.message);
    const status = err.status || 500;
    const mensagem =
        status === 500 || status === 502
            ? 'Não foi possível acessar a API do ENEM agora. Verifique sua internet e tente novamente.'
            : err.message || mensagemPadrao;
    return res.status(status).json({ sucesso: false, mensagem });
}

const enemController = {
    // GET /api/enem/provas
    async listarProvas(req, res) {
        try {
            const provas = await Enem.listarProvas();
            return res.json({
                sucesso: true,
                provas: provas.map((p) => ({
                    ano: p.year,
                    titulo: p.title,
                    idiomas: p.languages.map((l) => ({ valor: l.value, nome: l.label }))
                }))
            });
        } catch (err) {
            return responderErro(res, err, 'Erro ao listar provas do ENEM.');
        }
    },

    // GET /api/enem/provas/:ano?idioma=
    async detalharProva(req, res) {
        try {
            const { prova, idioma } = await carregarProva(req);
            return res.json({ sucesso: true, prova: resumoProva(prova, idioma), idioma });
        } catch (err) {
            return responderErro(res, err, 'Erro ao buscar a prova.');
        }
    },

    // GET /api/enem/provas/:ano/questoes?area=&idioma=&pagina=&limite=
    async listarQuestoes(req, res) {
        try {
            const { ano, prova, idioma, disciplina } = await carregarProva(req);
            const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 10, 1), 50);

            const filtradas = Enem.filtrarQuestoes(prova, disciplina, idioma);
            const total = filtradas.length;
            const totalPaginas = Math.max(Math.ceil(total / limite), 1);
            const pagina = Math.min(Math.max(parseInt(req.query.pagina, 10) || 1, 1), totalPaginas);

            const itensDaPagina = filtradas.slice((pagina - 1) * limite, pagina * limite);
            const questoes = await Enem.buscarQuestoesCompletas(ano, itensDaPagina, idioma);

            return res.json({
                sucesso: true,
                prova: resumoProva(prova, idioma),
                filtros: { ano, area: disciplina, idioma },
                paginacao: { pagina, limite, total, totalPaginas },
                questoes
            });
        } catch (err) {
            return responderErro(res, err, 'Erro ao buscar questões.');
        }
    },

    // GET /api/enem/provas/:ano/questoes/:numero?idioma=
    async buscarQuestao(req, res) {
        try {
            const { ano, prova, idioma } = await carregarProva(req);
            const numero = parseInt(req.params.numero, 10);
            const item = Enem.filtrarQuestoes(prova, null, idioma).find((q) => q.index === numero);
            if (!item) {
                return res.status(404).json({ sucesso: false, mensagem: `A questão ${req.params.numero} não existe na prova de ${ano}.` });
            }
            const [questao] = await Enem.buscarQuestoesCompletas(ano, [item], idioma);
            if (!questao) {
                return res.status(404).json({ sucesso: false, mensagem: 'Questão não encontrada.' });
            }
            return res.json({ sucesso: true, prova: resumoProva(prova, idioma), questao });
        } catch (err) {
            return responderErro(res, err, 'Erro ao buscar a questão.');
        }
    },

    // GET /api/enem/provas/:ano/aleatoria?area=&idioma=
    async questaoAleatoria(req, res) {
        try {
            const { ano, prova, idioma, disciplina } = await carregarProva(req);
            const filtradas = Enem.filtrarQuestoes(prova, disciplina, idioma);
            if (filtradas.length === 0) {
                return res.status(404).json({ sucesso: false, mensagem: 'Nenhuma questão encontrada com esses filtros.' });
            }
            const sorteada = filtradas[Math.floor(Math.random() * filtradas.length)];
            const [questao] = await Enem.buscarQuestoesCompletas(ano, [sorteada], idioma);
            return res.json({ sucesso: true, prova: resumoProva(prova, idioma), questao });
        } catch (err) {
            return responderErro(res, err, 'Erro ao sortear questão.');
        }
    }
};

module.exports = enemController;
