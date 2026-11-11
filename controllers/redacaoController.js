// =====================================================================
// Controller: Redação (escrever, salvar, listar e excluir redações)
// =====================================================================
const Redacao = require('../models/Redacao');

// Confere e limpa os dados enviados pelo navegador
function validar(body) {
    const tema = String(body.tema || '').trim();
    const texto = String(body.texto || '');
    const checklist = String(body.checklist || '').replace(/[^01]/g, '').slice(0, 10);

    if (!tema) return { erro: 'Escolha ou escreva um tema.' };
    if (tema.length > 255) return { erro: 'O tema deve ter no máximo 255 caracteres.' };
    if (!texto.trim()) return { erro: 'Escreva alguma coisa antes de salvar.' };
    if (texto.length > 6000) return { erro: 'A redação ficou grande demais (máximo de 6000 caracteres).' };
    return { dados: { tema, texto, checklist } };
}

const redacaoController = {
    // GET /api/redacoes
    async listar(req, res) {
        try {
            const redacoes = await Redacao.listar(req.usuarioId);
            return res.json({ sucesso: true, redacoes });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar suas redações.' });
        }
    },

    // POST /api/redacoes  { tema, texto, checklist }
    async criar(req, res) {
        try {
            const { erro, dados } = validar(req.body);
            if (erro) return res.status(400).json({ sucesso: false, mensagem: erro });
            const id = await Redacao.criar(req.usuarioId, dados);
            const redacao = await Redacao.buscar(id, req.usuarioId);
            return res.status(201).json({ sucesso: true, mensagem: 'Redação salva!', redacao });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar a redação.' });
        }
    },

    // PUT /api/redacoes/:id  { tema, texto, checklist }
    async atualizar(req, res) {
        try {
            const id = Number(req.params.id);
            if (!(await Redacao.buscar(id, req.usuarioId))) {
                return res.status(404).json({ sucesso: false, mensagem: 'Redação não encontrada.' });
            }
            const { erro, dados } = validar(req.body);
            if (erro) return res.status(400).json({ sucesso: false, mensagem: erro });
            await Redacao.atualizar(id, req.usuarioId, dados);
            const redacao = await Redacao.buscar(id, req.usuarioId);
            return res.json({ sucesso: true, mensagem: 'Redação salva!', redacao });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar a redação.' });
        }
    },

    // DELETE /api/redacoes/:id
    async excluir(req, res) {
        try {
            const id = Number(req.params.id);
            if (!(await Redacao.buscar(id, req.usuarioId))) {
                return res.status(404).json({ sucesso: false, mensagem: 'Redação não encontrada.' });
            }
            await Redacao.excluir(id, req.usuarioId);
            return res.json({ sucesso: true, mensagem: 'Redação excluída.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir a redação.' });
        }
    }
};

module.exports = redacaoController;
