// =====================================================================
// Rotas da Redação
// =====================================================================
const express = require('express');
const router = express.Router();
const redacaoController = require('../controllers/redacaoController');
const autenticar = require('../middleware/authMiddleware');

router.get('/', autenticar, redacaoController.listar);
router.post('/', autenticar, redacaoController.criar);
router.put('/:id', autenticar, redacaoController.atualizar);
router.delete('/:id', autenticar, redacaoController.excluir);

module.exports = router;
