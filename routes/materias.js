// =====================================================================
// Rotas de matérias e questões
// =====================================================================
const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const autenticar = require('../middleware/authMiddleware');

router.get('/', autenticar, materiaController.listar);
router.get('/:slug/questoes', autenticar, materiaController.buscarQuestoes);
router.post('/responder', autenticar, materiaController.responderQuestao);

module.exports = router;
