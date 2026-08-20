// =====================================================================
// Controller: Autenticação (cadastro, login, logout, perfil)
// =====================================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Usuario = require('../models/Usuario');

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
                usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
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
            return res.json({ sucesso: true, usuario });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar perfil.' });
        }
    }
};

module.exports = authController;
