// =====================================================================
// Controller: Aulas de estudo
// O aluno estuda o conteúdo da matéria e depois faz as 10 questões.
// =====================================================================
const Aula = require('../models/Aula');
const Gamificacao = require('../models/Gamificacao');

const aulaController = {
    // GET /api/aulas → matérias com o progresso de estudo do aluno
    async resumo(req, res) {
        try {
            const materias = await Aula.resumoPorMateria(req.usuarioId);
            return res.json({
                sucesso: true,
                materias: materias.map((m) => ({
                    ...m,
                    total_aulas: Number(m.total_aulas),
                    aulas_concluidas: Number(m.aulas_concluidas)
                }))
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar as aulas.' });
        }
    },

    // GET /api/aulas/materia/:slug → a matéria e a lista de aulas dela
    async daMateria(req, res) {
        try {
            const materia = await Aula.buscarMateria(req.params.slug);
            if (!materia) {
                return res.status(404).json({ sucesso: false, mensagem: 'Matéria não encontrada.' });
            }
            const aulas = await Aula.listarDaMateria(materia.id, req.usuarioId);
            return res.json({
                sucesso: true,
                materia,
                aulas: aulas.map((a) => ({ ...a, concluida: Boolean(a.concluida_em) }))
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar as aulas da matéria.' });
        }
    },

    // GET /api/aulas/:id → uma aula completa, com a anterior e a próxima
    async detalhe(req, res) {
        try {
            const aula = await Aula.buscar(Number(req.params.id), req.usuarioId);
            if (!aula) {
                return res.status(404).json({ sucesso: false, mensagem: 'Aula não encontrada.' });
            }
            const lista = await Aula.listarDaMateria(aula.materia_id, req.usuarioId);
            const posicao = lista.findIndex((a) => a.id === aula.id);

            let conteudo = {};
            try {
                conteudo = JSON.parse(aula.conteudo);
            } catch (e) {
                conteudo = {};
            }

            return res.json({
                sucesso: true,
                aula: {
                    id: aula.id,
                    ordem: aula.ordem,
                    titulo: aula.titulo,
                    descricao: aula.descricao,
                    minutos: aula.minutos,
                    concluida: Boolean(aula.concluida_em),
                    conteudo
                },
                materia: { nome: aula.materia_nome, slug: aula.slug, icone: aula.icone, cor: aula.cor },
                posicao: posicao + 1,
                total: lista.length,
                anterior: posicao > 0 ? { id: lista[posicao - 1].id, titulo: lista[posicao - 1].titulo } : null,
                proxima: posicao < lista.length - 1 ? { id: lista[posicao + 1].id, titulo: lista[posicao + 1].titulo } : null
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao abrir a aula.' });
        }
    },

    // POST /api/aulas/:id/concluir → marca a aula como estudada (+15 XP na 1ª vez)
    async concluir(req, res) {
        try {
            const id = Number(req.params.id);
            if (!(await Aula.buscar(id, req.usuarioId))) {
                return res.status(404).json({ sucesso: false, mensagem: 'Aula não encontrada.' });
            }
            await Aula.concluir(id, req.usuarioId);
            const gamificacao = await Gamificacao.processar(req.usuarioId);
            return res.json({ sucesso: true, gamificacao });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao concluir a aula.' });
        }
    }
};

module.exports = aulaController;
