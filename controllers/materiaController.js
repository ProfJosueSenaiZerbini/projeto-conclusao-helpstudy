// =====================================================================
// Controller: Matérias e Questões
// =====================================================================
const Materia = require('../models/Materia');
const Resultado = require('../models/Resultado');

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

            const questoes = await Materia.listarQuestoes(materia.id);

            // Remove a resposta correta e explicação antes de enviar ao cliente
            const questoesSemGabarito = questoes.map(({ correta, explicacao, ...resto }) => resto);

            return res.json({ sucesso: true, materia, questoes: questoesSemGabarito });
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

            const questao = await Materia.buscarQuestaoPorId(questaoId);
            if (!questao) {
                return res.status(404).json({ sucesso: false, mensagem: 'Questão não encontrada.' });
            }

            const correta = questao.correta === alternativa;

            await Resultado.salvarResposta({
                usuarioId,
                questaoId,
                alternativaMarcada: alternativa,
                correta,
                tempoGasto
            });

            const progresso = await Resultado.atualizarProgresso(usuarioId, questao.materia_id);

            return res.json({
                sucesso: true,
                correta,
                respostaCorreta: questao.correta,
                explicacao: questao.explicacao,
                progresso
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao registrar resposta.' });
        }
    }
};

module.exports = materiaController;
