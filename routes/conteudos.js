// =====================================================================
// Rotas dos conteúdos de apoio (Flashcards e Glossário)
// =====================================================================
const express = require('express');
const router = express.Router();
const conteudoController = require('../controllers/conteudoController');
const autenticar = require('../middleware/authMiddleware');

router.get('/flashcards', autenticar, conteudoController.flashcards);
router.post('/flashcards/:id', autenticar, conteudoController.marcarFlashcard);
router.get('/glossario', autenticar, conteudoController.glossario);

module.exports = router;
