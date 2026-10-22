// =====================================================================
// Rotas dos simulados do ENEM
// =====================================================================
const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const simuladoController = require('../controllers/simuladoController');

router.get('/', autenticar, simuladoController.listar);
router.post('/', autenticar, simuladoController.criar);
router.get('/:id', autenticar, simuladoController.detalhar);
router.post('/:id/responder', autenticar, simuladoController.responder);
router.post('/:id/finalizar', autenticar, simuladoController.finalizar);

module.exports = router;
