// =====================================================================
// Rotas de progresso, plano de estudos, conquistas e caderno de erros
// =====================================================================
const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const progressoController = require('../controllers/progressoController');

// Progresso detalhado por matéria + progresso geral + cards do topo
router.get('/', autenticar, progressoController.geral);
router.get('/evolucao', autenticar, progressoController.evolucao);
router.get('/atividade', autenticar, progressoController.atividade);
router.get('/materias/:slug', autenticar, progressoController.detalheMateria);

// Revisão de uma atividade e caderno de erros
router.get('/revisao', autenticar, progressoController.revisao);
router.get('/erros', autenticar, progressoController.erros);

// Plano de estudos personalizado (gera com base no desempenho)
router.get('/plano', autenticar, progressoController.plano);
router.post('/plano/gerar', autenticar, progressoController.gerarPlano);
router.patch('/plano/:id', autenticar, progressoController.marcarItemPlano);

// Conquistas do usuário
router.get('/conquistas', autenticar, progressoController.conquistas);

module.exports = router;
