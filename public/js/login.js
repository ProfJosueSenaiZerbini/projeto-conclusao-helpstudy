// =====================================================================
// Lógica da página de Login e Cadastro
// =====================================================================

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
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;
            const botao = formLogin.querySelector('button[type="submit"]');

            if (!email || !senha) {
                mostrarToast('Preencha e-mail e senha.', 'erro');
                return;
            }

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
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const serie = document.getElementById('serie').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;
            const botao = formCadastro.querySelector('button[type="submit"]');

            document.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));

            if (senha.length < 6) {
                document.getElementById('field-senha').classList.add('has-error');
                mostrarToast('A senha deve ter pelo menos 6 caracteres.', 'erro');
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

                localStorage.setItem('helpstudy_token', dados.token);
                localStorage.setItem('helpstudy_usuario', JSON.stringify(dados.usuario));
                mostrarToast('Conta criada com sucesso!', 'sucesso');
                setTimeout(() => (window.location.href = '/dashboard'), 700);
            } catch (err) {
                console.error(err);
                mostrarToast('Erro de conexão com o servidor.', 'erro');
                definirCarregando(botao, false);
            }
        });
    }
});
