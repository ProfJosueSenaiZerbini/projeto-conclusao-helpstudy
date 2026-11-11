// =====================================================================
// Controller: Conteúdos de apoio (Flashcards e Glossário)
// =====================================================================
const Conteudo = require('../models/Conteudo');

const conteudoController = {
    // GET /api/conteudos/flashcards?materia=slug
    async flashcards(req, res) {
        try {
            const slug = req.query.materia || null;
            const cartoes = await Conteudo.listarFlashcards(req.usuarioId, slug);
            return res.json({ sucesso: true, flashcards: cartoes });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar os flashcards.' });
        }
    },

    // POST /api/conteudos/flashcards/:id  { status: 'sei' | 'revisar' }
    async marcarFlashcard(req, res) {
        try {
            const id = Number(req.params.id);
            const { status } = req.body;
            if (!['sei', 'revisar'].includes(status)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Status inválido.' });
            }
            if (!(await Conteudo.buscarFlashcard(id))) {
                return res.status(404).json({ sucesso: false, mensagem: 'Flashcard não encontrado.' });
            }
            await Conteudo.salvarStatus(req.usuarioId, id, status);
            return res.json({ sucesso: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar o flashcard.' });
        }
    },

    // GET /api/conteudos/glossario?materia=slug
    async glossario(req, res) {
        try {
            const slug = req.query.materia || null;
            const termos = await Conteudo.listarGlossario(slug);
            return res.json({ sucesso: true, termos });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar o glossário.' });
        }
    }
};

module.exports = conteudoController;
