// =====================================================================
// Lógica da página de Login e Cadastro
// =====================================================================

// Mesmas regras do servidor (controllers/authController.js)
const REGEX_EMAIL = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
const REGEX_NOME = /^[\p{L}' -]+$/u;

function emailValido(email) {
    return email.length <= 150 && REGEX_EMAIL.test(email) && !email.includes('..');
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.className = `toast toast-${tipo}`;
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 3200);
}

function alternarVisibilidadeSenha(botao) {
    const input = botao.parentElement.querySelector('input');
    const icone = botao.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icone.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icone.className = 'fa-solid fa-eye';
    }
}

function definirCarregando(botao, carregando, textoOriginal) {
    if (carregando) {
        botao.dataset.textoOriginal = botao.innerHTML;
        botao.innerHTML = '<span class="spinner"></span> Aguarde...';
        botao.disabled = true;
    } else {
        botao.innerHTML = botao.dataset.textoOriginal || textoOriginal;
        botao.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Alternar visibilidade de senha
    document.querySelectorAll('.toggle-senha').forEach((btn) => {
        btn.addEventListener('click', () => alternarVisibilidadeSenha(btn));
    });

    // -------- Formulário de LOGIN --------
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        // Veio do cadastro: preenche o e-mail e avisa para fazer login
        const params = new URLSearchParams(window.location.search);
        if (params.get('cadastro') === 'ok') {
            const emailCadastrado = params.get('email');
            if (emailCadastrado) document.getElementById('email').value = emailCadastrado;
            document.getElementById('senha').focus();
            mostrarToast('Conta criada! Digite sua senha para entrar.', 'sucesso');
        }

        // Veio do "Esqueci a senha": preenche o e-mail e avisa que a senha mudou
        if (params.get('senha') === 'ok') {
            const emailRecuperado = params.get('email');
            if (emailRecuperado) document.getElementById('email').value = emailRecuperado;
            document.getElementById('senha').focus();
            mostrarToast('Senha redefinida! Entre com a nova senha.', 'sucesso');
        }

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;
            const botao = formLogin.querySelector('button[type="submit"]');

            if (!email || !senha) {
                mostrarToast('Preencha e-mail e senha.', 'erro');
                return;
            }
            if (!emailValido(email)) {
                document.getElementById('field-email').classList.add('has-error');
                mostrarToast('Digite um e-mail válido (ex.: nome@gmail.com).', 'erro');
                return;
            }
            document.getElementById('field-email').classList.remove('has-error');

            definirCarregando(botao, true);
            try {
                const resp = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const dados = await resp.json();

                if (!resp.ok || !dados.sucesso) {
                    mostrarToast(dados.mensagem || 'Não foi possível entrar.', 'erro');
                    definirCarregando(botao, false);
                    return;
                }

                localStorage.setItem('helpstudy_token', dados.token);
                localStorage.setItem('helpstudy_usuario', JSON.stringify(dados.usuario));
                mostrarToast('Login realizado! Redirecionando...', 'sucesso');
                setTimeout(() => (window.location.href = '/dashboard'), 700);
            } catch (err) {
                console.error(err);
                mostrarToast('Erro de conexão com o servidor.', 'erro');
                definirCarregando(botao, false);
            }
        });
    }

    // -------- Formulário de CADASTRO --------
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value.trim().replace(/\s+/g, ' ');
            const email = document.getElementById('email').value.trim();
            const serie = document.getElementById('serie').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;
            const botao = formCadastro.querySelector('button[type="submit"]');

            document.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));

            if (nome.length < 2 || nome.length > 25) {
                document.getElementById('field-nome').classList.add('has-error');
                mostrarToast('O nome deve ter entre 2 e 25 caracteres.', 'erro');
                return;
            }
            if (!REGEX_NOME.test(nome)) {
                document.getElementById('field-nome').classList.add('has-error');
                mostrarToast('O nome deve ter apenas letras e espaços.', 'erro');
                return;
            }
            if (!emailValido(email)) {
                document.getElementById('field-email').classList.add('has-error');
                mostrarToast('Digite um e-mail válido (ex.: nome@gmail.com).', 'erro');
                return;
            }
            if (senha.length < 6 || senha.length > 20) {
                document.getElementById('field-senha').classList.add('has-error');
                mostrarToast('A senha deve ter entre 6 e 20 caracteres.', 'erro');
                return;
            }
            if (senha !== confirmarSenha) {
                document.getElementById('field-confirmar-senha').classList.add('has-error');
                mostrarToast('As senhas não coincidem.', 'erro');
                return;
            }

            definirCarregando(botao, true);
            try {
                const resp = await fetch('/api/auth/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha, serie })
                });
                const dados = await resp.json();

                if (!resp.ok || !dados.sucesso) {
                    mostrarToast(dados.mensagem || 'Não foi possível cadastrar.', 'erro');
                    definirCarregando(botao, false);
                    return;
                }

                // Conta criada: não entra direto, manda para o login com o e-mail já preenchido
                await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                mostrarToast('Conta criada com sucesso! Agora faça seu login.', 'sucesso');
                setTimeout(() => (window.location.href = '/login?cadastro=ok&email=' + encodeURIComponent(email)), 1200);
            } catch (err) {
                console.error(err);
                mostrarToast('Erro de conexão com o servidor.', 'erro');
                definirCarregando(botao, false);
            }
        });
    }
});
