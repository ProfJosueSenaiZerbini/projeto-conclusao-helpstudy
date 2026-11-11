// =====================================================================
// Rotas das aulas de estudo
// =====================================================================
const express = require('express');
const router = express.Router();
const aulaController = require('../controllers/aulaController');
const autenticar = require('../middleware/authMiddleware');

router.get('/', autenticar, aulaController.resumo);
router.get('/materia/:slug', autenticar, aulaController.daMateria);
router.get('/:id', autenticar, aulaController.detalhe);
router.post('/:id/concluir', autenticar, aulaController.concluir);

module.exports = router;
