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
router.post('/esqueci-senha', authController.esqueciSenha);
router.post('/redefinir-senha', authController.redefinirSenha);
router.get('/perfil', autenticar, authController.perfil);
router.put('/perfil', autenticar, authController.atualizarPerfil);
router.put('/senha', autenticar, authController.alterarSenha);

module.exports = router;
