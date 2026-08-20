// =====================================================================
// Rotas de progresso, plano de estudos e conquistas
// =====================================================================
const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const Resultado = require('../models/Resultado');

// Progresso detalhado por matéria + progresso geral
router.get('/', autenticar, async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const [porMateria, geral, evolucao, historico] = await Promise.all([
            Resultado.progressoPorUsuario(usuarioId),
            Resultado.progressoGeral(usuarioId),
            Resultado.evolucaoUltimosDias(usuarioId, 7),
            Resultado.historicoPorUsuario(usuarioId, 10)
        ]);
        res.json({ sucesso: true, porMateria, geral, evolucao, historico });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar progresso.' });
    }
});

// Plano de estudos personalizado (gera com base no desempenho)
router.get('/plano', autenticar, async (req, res) => {
    try {
        const plano = await Resultado.buscarPlanoEstudos(req.usuarioId);
        if (plano.length === 0) {
            const novoPlano = await Resultado.gerarPlanoEstudos(req.usuarioId);
            return res.json({ sucesso: true, plano: novoPlano });
        }
        res.json({ sucesso: true, plano });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar plano de estudos.' });
    }
});

router.post('/plano/gerar', autenticar, async (req, res) => {
    try {
        const plano = await Resultado.gerarPlanoEstudos(req.usuarioId);
        res.json({ sucesso: true, plano });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar plano de estudos.' });
    }
});

// Conquistas do usuário
router.get('/conquistas', autenticar, async (req, res) => {
    try {
        const conquistas = await Resultado.listarConquistasUsuario(req.usuarioId);
        res.json({ sucesso: true, conquistas });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar conquistas.' });
    }
});

module.exports = router;
