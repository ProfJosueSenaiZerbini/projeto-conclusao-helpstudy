// =====================================================================
// Controller: Matérias e Questões
// =====================================================================
const Materia = require('../models/Materia');
const Resultado = require('../models/Resultado');
const Gamificacao = require('../models/Gamificacao');

// Remove a resposta correta e a explicação antes de enviar ao navegador
function semGabarito(questoes) {
    return questoes.map(({ correta, explicacao, ...resto }) => resto);
}

const materiaController = {
    async listar(req, res) {
        try {
            const materias = await Materia.listarTodas();
            const comContagem = await Promise.all(
                materias.map(async (m) => ({
                    ...m,
                    total_questoes: await Materia.contarQuestoes(m.id)
                }))
            );
            return res.json({ sucesso: true, materias: comContagem });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar matérias.' });
        }
    },

    async buscarQuestoes(req, res) {
        try {
            const { slug } = req.params;
            const materia = await Materia.buscarPorSlug(slug);
            if (!materia) {
                return res.status(404).json({ sucesso: false, mensagem: 'Matéria não encontrada.' });
            }

            // Dificuldade adaptativa: as questões vêm na ordem do nível do aluno
            const nivelAtual = await Materia.nivelDoAluno(req.usuarioId, materia.id);
            const questoes = await Materia.listarQuestoesAdaptativas(req.usuarioId, materia.id, nivelAtual, 10);

            return res.json({ sucesso: true, materia, nivelAtual, questoes: semGabarito(questoes) });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar questões.' });
        }
    },

    async responderQuestao(req, res) {
        try {
            const { questaoId, alternativa, tempoGasto } = req.body;
            const usuarioId = req.usuarioId;

            if (!questaoId || !alternativa) {
                return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos.' });
            }
            if (!['a', 'b', 'c', 'd'].includes(alternativa)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Alternativa inválida.' });
            }
            // O tempo vem do navegador: só aceita números entre 0 e 1 hora
            const tempo = Math.min(Math.max(parseInt(tempoGasto, 10) || 0, 0), 3600);

            const questao = await Materia.buscarQuestaoPorId(questaoId);
            if (!questao) {
                return res.status(404).json({ sucesso: false, mensagem: 'Questão não encontrada.' });
            }

            const correta = questao.correta === alternativa;

            const respostaId = await Resultado.salvarResposta({
                usuarioId,
                questaoId: questao.id,
                alternativaMarcada: alternativa,
                correta,
                tempoGasto: tempo
            });

            const progresso = await Resultado.atualizarProgresso(usuarioId, questao.materia_id);

            // XP, ofensiva, meta do dia e conquistas (calculados no servidor)
            const gamificacao = await Gamificacao.processar(usuarioId);

            return res.json({
                sucesso: true,
                respostaId,
                correta,
                respostaCorreta: questao.correta,
                explicacao: questao.explicacao,
                progresso,
                gamificacao
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao registrar resposta.' });
        }
    },

    // GET /api/materias/erros/questoes?materia=slug
    // Questões do caderno de erros, para refazer (sem o gabarito)
    async questoesDoCaderno(req, res) {
        try {
            const slug = req.query.materia || null;
            let materia = { nome: 'Caderno de erros', slug: 'erros', cor: '#E5485D', icone: 'fa-book-bookmark' };
            if (slug) {
                const encontrada = await Materia.buscarPorSlug(slug);
                if (!encontrada) {
                    return res.status(404).json({ sucesso: false, mensagem: 'Matéria não encontrada.' });
                }
                materia = { ...encontrada, nome: `${encontrada.nome} · Caderno de erros` };
            }

            const erros = await Resultado.errosMaterias(req.usuarioId, slug);
            const questoes = erros.map(
                ({ alternativa_marcada, respondido_em, vezes, erros: qtd, slug: s, cor, icone, ...q }) => q
            );
            return res.json({ sucesso: true, materia, modo: 'erros', questoes: semGabarito(questoes) });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar o caderno de erros.' });
        }
    }
};

module.exports = materiaController;
