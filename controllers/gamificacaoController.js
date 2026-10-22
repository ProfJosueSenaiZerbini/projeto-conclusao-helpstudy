// =====================================================================
// Controller: Gamificação (ofensiva, nível, ranking, meta e modo foco)
// =====================================================================
const db = require('../config/db');
const Gamificacao = require('../models/Gamificacao');
const Usuario = require('../models/Usuario');

const DURACAO_FOCO = 25 * 60; // 25 minutos

function erro500(res, err, mensagem) {
    console.error(err);
    return res.status(500).json({ sucesso: false, mensagem });
}

const gamificacaoController = {
    // GET /api/gamificacao/resumo → ofensiva, nível/XP e meta do dia
    async resumo(req, res) {
        try {
            res.json({ sucesso: true, ...(await Gamificacao.resumo(req.usuarioId)) });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar o resumo.');
        }
    },

    // GET /api/gamificacao/ranking → ranking semanal por XP
    async ranking(req, res) {
        try {
            res.json({ sucesso: true, ...(await Gamificacao.rankingSemanal(req.usuarioId, 10)) });
        } catch (err) {
            erro500(res, err, 'Erro ao buscar o ranking.');
        }
    },

    // PUT /api/gamificacao/meta  { meta }
    async definirMeta(req, res) {
        try {
            const meta = parseInt(req.body.meta, 10);
            if (!Number.isInteger(meta) || meta < 1 || meta > 200) {
                return res.status(400).json({ sucesso: false, mensagem: 'A meta deve ser um número entre 1 e 200.' });
            }
            await Usuario.atualizarMeta(req.usuarioId, meta);
            // Se o aluno já fez questões suficientes hoje, a meta é registrada agora
            const gamificacao = await Gamificacao.processar(req.usuarioId);
            res.json({ sucesso: true, meta, gamificacao });
        } catch (err) {
            erro500(res, err, 'Erro ao salvar a meta.');
        }
    },

    // POST /api/gamificacao/foco/iniciar → começa uma sessão de 25 minutos
    async iniciarFoco(req, res) {
        try {
            // Se já existe uma sessão aberta recente, continua nela
            const [abertas] = await db.query(
                `SELECT id, TIMESTAMPDIFF(SECOND, iniciado_em, NOW()) AS decorridos
                 FROM sessoes_foco
                 WHERE usuario_id = ? AND concluido_em IS NULL
                 ORDER BY id DESC LIMIT 1`,
                [req.usuarioId]
            );
            if (abertas.length && Number(abertas[0].decorridos) < DURACAO_FOCO) {
                return res.json({
                    sucesso: true,
                    sessaoId: abertas[0].id,
                    restante: DURACAO_FOCO - Number(abertas[0].decorridos)
                });
            }

            const [result] = await db.query('INSERT INTO sessoes_foco (usuario_id) VALUES (?)', [req.usuarioId]);
            res.json({ sucesso: true, sessaoId: result.insertId, restante: DURACAO_FOCO });
        } catch (err) {
            erro500(res, err, 'Erro ao iniciar o modo foco.');
        }
    },

    // POST /api/gamificacao/foco/:id/concluir → só aceita se passaram 25 min
    async concluirFoco(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const [rows] = await db.query(
                `SELECT id, concluido_em, TIMESTAMPDIFF(SECOND, iniciado_em, NOW()) AS decorridos
                 FROM sessoes_foco WHERE id = ? AND usuario_id = ?`,
                [id, req.usuarioId]
            );
            if (!rows.length) {
                return res.status(404).json({ sucesso: false, mensagem: 'Sessão de foco não encontrada.' });
            }
            const sessao = rows[0];
            if (!sessao.concluido_em) {
                // 20 segundos de tolerância para o relógio do navegador
                if (Number(sessao.decorridos) < DURACAO_FOCO - 20) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: 'A sessão de foco ainda não terminou.',
                        restante: DURACAO_FOCO - Number(sessao.decorridos)
                    });
                }
                await db.query('UPDATE sessoes_foco SET concluido_em = NOW() WHERE id = ? AND usuario_id = ?', [
                    id,
                    req.usuarioId
                ]);
            }
            const gamificacao = await Gamificacao.processar(req.usuarioId);
            res.json({ sucesso: true, gamificacao });
        } catch (err) {
            erro500(res, err, 'Erro ao concluir o modo foco.');
        }
    }
};

module.exports = gamificacaoController;
