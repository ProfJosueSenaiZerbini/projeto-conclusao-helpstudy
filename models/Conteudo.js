// =====================================================================
// Model: Conteudo
// Queries dos Flashcards e do Glossário
// =====================================================================
const db = require('../config/db');

const Conteudo = {
    // Flashcards (de uma matéria ou de todas) com o status do aluno
    async listarFlashcards(usuarioId, slug = null) {
        let sql = `
            SELECT f.id, f.frente, f.verso,
                   m.nome AS materia_nome, m.slug, m.cor, m.icone,
                   p.status
            FROM flashcards f
            JOIN materias m ON m.id = f.materia_id
            LEFT JOIN flashcards_progresso p ON p.flashcard_id = f.id AND p.usuario_id = ?`;
        const params = [usuarioId];
        if (slug) {
            sql += ' WHERE m.slug = ?';
            params.push(slug);
        }
        sql += ' ORDER BY m.nome, f.id';
        const [rows] = await db.query(sql, params);
        return rows;
    },

    async buscarFlashcard(id) {
        const [rows] = await db.query('SELECT id FROM flashcards WHERE id = ?', [id]);
        return rows[0];
    },

    // Marca o cartão como "sei" ou "revisar" (atualiza se já existir)
    async salvarStatus(usuarioId, flashcardId, status) {
        await db.query(
            `INSERT INTO flashcards_progresso (usuario_id, flashcard_id, status) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [usuarioId, flashcardId, status]
        );
    },

    // Termos do glossário, com filtro opcional de matéria
    async listarGlossario(slug = null) {
        let sql = `
            SELECT g.id, g.termo, g.definicao, g.exemplo,
                   m.nome AS materia_nome, m.slug, m.cor, m.icone
            FROM glossario g
            JOIN materias m ON m.id = g.materia_id`;
        const params = [];
        if (slug) {
            sql += ' WHERE m.slug = ?';
            params.push(slug);
        }
        sql += ' ORDER BY g.termo';
        const [rows] = await db.query(sql, params);
        return rows;
    }
};

module.exports = Conteudo;
