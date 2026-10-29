// =====================================================================
// Model: RecuperacaoSenha
// Guarda os códigos de "esqueci a senha" (tabela `recuperacao_senha`).
// O código é salvo criptografado (bcrypt), nunca em texto puro.
// =====================================================================
const db = require('../config/db');

const RecuperacaoSenha = {
    // Cancela os códigos antigos e cria um novo que vale 15 minutos
    async criar(usuarioId, codigoHash) {
        await db.query('UPDATE recuperacao_senha SET usado = 1 WHERE usuario_id = ? AND usado = 0', [usuarioId]);
        await db.query(
            `INSERT INTO recuperacao_senha (usuario_id, codigo_hash, expira_em)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
            [usuarioId, codigoHash]
        );
    },

    // Último código válido (não usado e dentro do prazo)
    async buscarValido(usuarioId) {
        const [rows] = await db.query(
            `SELECT * FROM recuperacao_senha
             WHERE usuario_id = ? AND usado = 0 AND expira_em > NOW()
             ORDER BY id DESC LIMIT 1`,
            [usuarioId]
        );
        return rows[0];
    },

    // Evita mandar vários e-mails seguidos: true se pediu um código há menos de 1 minuto
    async pediuRecentemente(usuarioId) {
        const [rows] = await db.query(
            `SELECT id FROM recuperacao_senha
             WHERE usuario_id = ? AND criado_em > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
             LIMIT 1`,
            [usuarioId]
        );
        return rows.length > 0;
    },

    async registrarTentativa(id) {
        await db.query('UPDATE recuperacao_senha SET tentativas = tentativas + 1 WHERE id = ?', [id]);
    },

    async marcarUsado(id) {
        await db.query('UPDATE recuperacao_senha SET usado = 1 WHERE id = ?', [id]);
    }
};

module.exports = RecuperacaoSenha;
