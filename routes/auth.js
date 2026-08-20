// =====================================================================
// Rotas de autenticação
// =====================================================================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const autenticar = require('../middleware/authMiddleware');

router.post('/cadastro', authController.cadastrar);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/perfil', autenticar, authController.perfil);

module.exports = router;
