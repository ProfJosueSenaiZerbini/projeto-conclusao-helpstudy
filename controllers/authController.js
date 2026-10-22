// =====================================================================
// Controller: Autenticação (cadastro, login, logout, perfil)
// =====================================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Usuario = require('../models/Usuario');

// Avatares que o aluno pode escolher no perfil
const AVATARES = ['🐙', '🦊', '🐼', '🦉', '🐯', '🐸', '🐨', '🦁', '🐧', '🐢', '🦄', '🐝'];

function gerarToken(usuarioId) {
    return jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}

const authController = {
    async cadastrar(req, res) {
        try {
            const { nome, email, senha, serie } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ sucesso: false, mensagem: 'Preencha nome, e-mail e senha.' });
            }
            if (senha.length < 6) {
                return res.status(400).json({ sucesso: false, mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
            }

            const existente = await Usuario.buscarPorEmail(email.toLowerCase().trim());
            if (existente) {
                return res.status(409).json({ sucesso: false, mensagem: 'Este e-mail já está cadastrado.' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);
            const novoId = await Usuario.criar({
                nome: nome.trim(),
                email: email.toLowerCase().trim(),
                senhaHash,
                serie
            });

            const token = gerarToken(novoId);
            res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Cadastro realizado com sucesso!',
                token,
                usuario: { id: novoId, nome, email }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar usuário.' });
        }
    },

    async login(req, res) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                return res.status(400).json({ sucesso: false, mensagem: 'Informe e-mail e senha.' });
            }

            const usuario = await Usuario.buscarPorEmail(email.toLowerCase().trim());
            if (!usuario) {
                return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha inválidos.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha inválidos.' });
            }

            const token = gerarToken(usuario.id);
            res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            return res.json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso!',
                token,
                usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, avatar: usuario.avatar || null }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao efetuar login.' });
        }
    },

    logout(req, res) {
        res.clearCookie('token');
        return res.json({ sucesso: true, mensagem: 'Sessão encerrada.' });
    },

    async perfil(req, res) {
        try {
            const usuario = await Usuario.buscarPorId(req.usuarioId);
            if (!usuario) {
                return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
            }
            return res.json({ sucesso: true, usuario, avatares: AVATARES });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar perfil.' });
        }
    },

    // PUT /api/auth/perfil  { nome, apelido, serie, avatar, rankingPublico }
    async atualizarPerfil(req, res) {
        try {
            const nome = String(req.body.nome || '').trim();
            const apelido = String(req.body.apelido || '').trim();
            const serie = String(req.body.serie || '').trim();
            const avatar = req.body.avatar || null;
            const rankingPublico = req.body.rankingPublico !== false;

            if (nome.length < 2 || nome.length > 120) {
                return res.status(400).json({ sucesso: false, mensagem: 'O nome deve ter entre 2 e 120 caracteres.' });
            }
            if (apelido && !/^[\p{L}\p{N} ._-]{2,30}$/u.test(apelido)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'O apelido deve ter de 2 a 30 caracteres (letras, números, espaço, ponto, - ou _).'
                });
            }
            if (serie.length > 50) {
                return res.status(400).json({ sucesso: false, mensagem: 'A série deve ter no máximo 50 caracteres.' });
            }
            if (avatar !== null && !AVATARES.includes(avatar)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Avatar inválido.' });
            }

            await Usuario.atualizarPerfil(req.usuarioId, {
                nome,
                serie: serie || null,
                avatar,
                apelido: apelido || null,
                rankingPublico
            });
            const usuario = await Usuario.buscarPorId(req.usuarioId);
            return res.json({ sucesso: true, mensagem: 'Perfil atualizado!', usuario });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar o perfil.' });
        }
    },

    // PUT /api/auth/senha  { senhaAtual, novaSenha }
    async alterarSenha(req, res) {
        try {
            const { senhaAtual, novaSenha } = req.body;
            if (!senhaAtual || !novaSenha) {
                return res.status(400).json({ sucesso: false, mensagem: 'Informe a senha atual e a nova senha.' });
            }
            if (String(novaSenha).length < 6) {
                return res.status(400).json({ sucesso: false, mensagem: 'A nova senha deve ter pelo menos 6 caracteres.' });
            }

            const senhaHashAtual = await Usuario.buscarSenha(req.usuarioId);
            const confere = senhaHashAtual && (await bcrypt.compare(String(senhaAtual), senhaHashAtual));
            if (!confere) {
                return res.status(400).json({ sucesso: false, mensagem: 'A senha atual está incorreta.' });
            }

            await Usuario.atualizarSenha(req.usuarioId, await bcrypt.hash(String(novaSenha), 10));
            return res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso!' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao alterar a senha.' });
        }
    }
};

module.exports = authController;
