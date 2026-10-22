// =====================================================================
// Rotas de gamificação (ofensiva, XP, ranking, meta diária e modo foco)
// =====================================================================
const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const gamificacaoController = require('../controllers/gamificacaoController');

router.get('/resumo', autenticar, gamificacaoController.resumo);
router.get('/ranking', autenticar, gamificacaoController.ranking);
router.put('/meta', autenticar, gamificacaoController.definirMeta);
router.post('/foco/iniciar', autenticar, gamificacaoController.iniciarFoco);
router.post('/foco/:id/concluir', autenticar, gamificacaoController.concluirFoco);

module.exports = router;
