// =====================================================================
// Controller: Autenticação (cadastro, login, logout, perfil, esqueci a senha)
// =====================================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const RecuperacaoSenha = require('../models/RecuperacaoSenha');
const { enviarCodigoRecuperacao } = require('../config/email');
const limiteLogin = require('../middleware/limiteLogin');

// Avatares que o aluno pode escolher no perfil
const AVATARES = ['🐙', '🦊', '🐼', '🦉', '🐯', '🐸', '🐨', '🦁', '🐧', '🐢', '🦄', '🐝'];

// ---------- Regras dos campos (mesmas da tela de cadastro e do perfil) ----------
const NOME_MIN = 2;
const NOME_MAX = 25;
const APELIDO_MAX = 20;
const SENHA_MIN = 6;
const SENHA_MAX = 20;
const EMAIL_MAX = 150;
const SERIES = ['1º ano EM', '2º ano EM', '3º ano EM'];

// E-mail no formato nome@provedor.com (qualquer provedor)
const REGEX_EMAIL = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
// Nome: só letras (com acento), espaço, apóstrofo e hífen
const REGEX_NOME = /^[\p{L}' -]+$/u;
// Apelido: 2 a 20 caracteres (letras, números, espaço, ponto, - ou _)
const REGEX_APELIDO = /^[\p{L}\p{N} ._-]{2,20}$/u;

// Hash usado quando o e-mail não existe, para o login demorar o mesmo tempo
// e ninguém descobrir quais e-mails têm conta pelo tempo de resposta
const HASH_FALSO = bcrypt.hashSync('senha-que-nao-existe', 10);

function limparEmail(valor) {
    return String(valor || '').toLowerCase().trim();
}

function limparNome(valor) {
    return String(valor || '').trim().replace(/\s+/g, ' ');
}

function validarEmail(email) {
    if (!email) return 'Informe seu e-mail.';
    if (email.length > EMAIL_MAX || !REGEX_EMAIL.test(email) || email.includes('..')) {
        return 'Digite um e-mail válido (ex.: nome@gmail.com).';
    }
    return null;
}

function validarNome(nome) {
    if (nome.length < NOME_MIN || nome.length > NOME_MAX) {
        return `O nome deve ter entre ${NOME_MIN} e ${NOME_MAX} caracteres.`;
    }
    if (!REGEX_NOME.test(nome)) return 'O nome deve ter apenas letras e espaços.';
    return null;
}

function validarSenha(senha, rotulo = 'A senha') {
    if (senha.length < SENHA_MIN || senha.length > SENHA_MAX) {
        return `${rotulo} deve ter entre ${SENHA_MIN} e ${SENHA_MAX} caracteres.`;
    }
    return null;
}

// Cookie com o token: não pode ser lido por JavaScript (httpOnly) e não é
// enviado por outros sites (sameSite), o que protege contra ataques CSRF
function opcoesCookie() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
}

function gerarToken(usuarioId) {
    return jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}

const authController = {
    async cadastrar(req, res) {
        try {
            const nome = limparNome(req.body.nome);
            const email = limparEmail(req.body.email);
            const senha = String(req.body.senha || '');
            const serie = String(req.body.serie || '').trim();

            if (!nome || !email || !senha) {
                return res.status(400).json({ sucesso: false, mensagem: 'Preencha nome, e-mail e senha.' });
            }
            const erro = validarNome(nome) || validarEmail(email) || validarSenha(senha);
            if (erro) return res.status(400).json({ sucesso: false, mensagem: erro });
            if (serie && !SERIES.includes(serie)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Escolha o 1º, 2º ou 3º ano.' });
            }

            const existente = await Usuario.buscarPorEmail(email);
            if (existente) {
                return res.status(409).json({ sucesso: false, mensagem: 'Este e-mail já está cadastrado.' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);
            let novoId;
            try {
                novoId = await Usuario.criar({ nome, email, senhaHash, serie });
            } catch (errBanco) {
                // Dois cadastros com o mesmo e-mail ao mesmo tempo
                if (errBanco.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ sucesso: false, mensagem: 'Este e-mail já está cadastrado.' });
                }
                throw errBanco;
            }

            const token = gerarToken(novoId);
            res.cookie('token', token, opcoesCookie());

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
            const email = limparEmail(req.body.email);
            const senha = String(req.body.senha || '');
            if (!email || !senha) {
                return res.status(400).json({ sucesso: false, mensagem: 'Informe e-mail e senha.' });
            }

            const minutos = limiteLogin.minutosBloqueado(req, email);
            if (minutos > 0) {
                return res.status(429).json({
                    sucesso: false,
                    mensagem: `Muitas tentativas erradas. Tente de novo em ${minutos} minuto(s).`
                });
            }

            const erroLogin = { sucesso: false, mensagem: 'E-mail ou senha inválidos.' };

            // E-mail com formato errado ou senha muito longa: nem consulta o banco
            if (validarEmail(email) || senha.length > 100) {
                limiteLogin.registrarErro(req, email);
                return res.status(401).json(erroLogin);
            }

            const usuario = await Usuario.buscarPorEmail(email);
            // Compara sempre (mesmo sem usuário) para a resposta levar o mesmo tempo
            const senhaValida = await bcrypt.compare(senha, usuario ? usuario.senha : HASH_FALSO);
            if (!usuario || !senhaValida) {
                limiteLogin.registrarErro(req, email);
                return res.status(401).json(erroLogin);
            }

            limiteLogin.limpar(req, email);
            const token = gerarToken(usuario.id);
            res.cookie('token', token, opcoesCookie());

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
        res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
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
            const nome = limparNome(req.body.nome);
            const apelido = String(req.body.apelido || '').trim();
            const serie = String(req.body.serie || '').trim();
            const avatar = req.body.avatar || null;
            const rankingPublico = req.body.rankingPublico !== false;

            const erroNome = validarNome(nome);
            if (erroNome) return res.status(400).json({ sucesso: false, mensagem: erroNome });
            if (apelido && !REGEX_APELIDO.test(apelido)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: `O apelido deve ter de 2 a ${APELIDO_MAX} caracteres (letras, números, espaço, ponto, - ou _).`
                });
            }
            if (serie && !SERIES.includes(serie)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Escolha o 1º, 2º ou 3º ano.' });
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
            const erroSenha = validarSenha(String(novaSenha), 'A nova senha');
            if (erroSenha) return res.status(400).json({ sucesso: false, mensagem: erroSenha });

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
    },

    // POST /api/auth/esqueci-senha  { email }
    // Gera um código de 6 dígitos e manda para o e-mail do aluno
    async esqueciSenha(req, res) {
        // Mesma resposta exista ou não o e-mail, para ninguém descobrir quem tem conta
        const respostaPadrao = {
            sucesso: true,
            mensagem: 'Se o e-mail estiver cadastrado, você vai receber um código em instantes.'
        };

        try {
            const email = String(req.body.email || '').toLowerCase().trim();
            if (!email) {
                return res.status(400).json({ sucesso: false, mensagem: 'Informe seu e-mail.' });
            }

            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) return res.json(respostaPadrao);

            if (await RecuperacaoSenha.pediuRecentemente(usuario.id)) {
                return res.status(429).json({
                    sucesso: false,
                    mensagem: 'Você acabou de pedir um código. Aguarde 1 minuto para pedir outro.'
                });
            }

            const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
            await RecuperacaoSenha.criar(usuario.id, await bcrypt.hash(codigo, 10));
            await enviarCodigoRecuperacao(usuario.email, usuario.nome, codigo);

            return res.json(respostaPadrao);
        } catch (err) {
            console.error('❌ Erro no "esqueci a senha":', err.message);
            return res.status(500).json({ sucesso: false, mensagem: 'Não foi possível enviar o código. Tente novamente.' });
        }
    },

    // POST /api/auth/redefinir-senha  { email, codigo, novaSenha }
    async redefinirSenha(req, res) {
        try {
            const email = String(req.body.email || '').toLowerCase().trim();
            const codigo = String(req.body.codigo || '').trim();
            const novaSenha = String(req.body.novaSenha || '');

            if (!email || !codigo || !novaSenha) {
                return res.status(400).json({ sucesso: false, mensagem: 'Preencha o código e a nova senha.' });
            }
            const erroSenha = validarSenha(novaSenha, 'A nova senha');
            if (erroSenha) return res.status(400).json({ sucesso: false, mensagem: erroSenha });

            const erroCodigo = { sucesso: false, mensagem: 'Código inválido ou expirado.' };

            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) return res.status(400).json(erroCodigo);

            const pedido = await RecuperacaoSenha.buscarValido(usuario.id);
            if (!pedido) return res.status(400).json(erroCodigo);

            // Depois de 5 erros o código é cancelado
            if (pedido.tentativas >= 5) {
                await RecuperacaoSenha.marcarUsado(pedido.id);
                return res.status(400).json({ sucesso: false, mensagem: 'Muitas tentativas. Peça um novo código.' });
            }

            const confere = await bcrypt.compare(codigo, pedido.codigo_hash);
            if (!confere) {
                await RecuperacaoSenha.registrarTentativa(pedido.id);
                return res.status(400).json(erroCodigo);
            }

            await Usuario.atualizarSenha(usuario.id, await bcrypt.hash(novaSenha, 10));
            await RecuperacaoSenha.marcarUsado(pedido.id);

            return res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso!' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro ao redefinir a senha.' });
        }
    }
};

module.exports = authController;
