// =====================================================================
// Rotas do ENEM (dados da API pública enem.dev)
// =====================================================================
const express = require('express');
const router = express.Router();
const enemController = require('../controllers/enemController');
const autenticar = require('../middleware/authMiddleware');

router.get('/provas', autenticar, enemController.listarProvas);
router.get('/provas/:ano', autenticar, enemController.detalharProva);
router.get('/provas/:ano/questoes', autenticar, enemController.listarQuestoes);
router.get('/provas/:ano/questoes/:numero', autenticar, enemController.buscarQuestao);
router.get('/provas/:ano/aleatoria', autenticar, enemController.questaoAleatoria);

// Respostas do aluno (salvas no banco)
router.get('/placar', autenticar, enemController.placar);
router.post('/responder', autenticar, enemController.responder);
router.post('/refazer', autenticar, enemController.refazer);
router.post('/zerar', autenticar, enemController.zerar);

module.exports = router;
