// =====================================================================
// Lógica da página "Esqueci a senha"
// Passo 1: aluno informa o e-mail e recebe um código
// Passo 2: aluno digita o código e cria a nova senha
// (mostrarToast e definirCarregando vêm do login.js)
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
    const passoEmail = document.getElementById('passo-email');
    const passoCodigo = document.getElementById('passo-codigo');
    const formEsqueci = document.getElementById('form-esqueci');
    const formRedefinir = document.getElementById('form-redefinir');
    const linkReenviar = document.getElementById('reenviar-codigo');

    let emailInformado = '';

    async function pedirCodigo(email) {
        const resp = await fetch('/api/auth/esqueci-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const dados = await resp.json();
        return { ok: resp.ok && dados.sucesso, mensagem: dados.mensagem };
    }

    // -------- Passo 1: enviar o código --------
    formEsqueci.addEventListener('submit', async (e) => {
        e.preventDefault();
        const campoEmail = document.getElementById('field-email');
        const email = document.getElementById('email').value.trim();
        const botao = formEsqueci.querySelector('button[type="submit"]');

        campoEmail.classList.remove('has-error');
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            campoEmail.classList.add('has-error');
            return;
        }

        definirCarregando(botao, true);
        try {
            const resultado = await pedirCodigo(email);
            if (!resultado.ok) {
                mostrarToast(resultado.mensagem || 'Não foi possível enviar o código.', 'erro');
                definirCarregando(botao, false);
                return;
            }

            emailInformado = email;
            document.getElementById('email-enviado').textContent = email;
            passoEmail.hidden = true;
            passoCodigo.hidden = false;
            document.getElementById('codigo').focus();
            mostrarToast(resultado.mensagem, 'sucesso');
        } catch (err) {
            console.error(err);
            mostrarToast('Erro de conexão com o servidor.', 'erro');
        }
        definirCarregando(botao, false);
    });

    // Deixa digitar só números no código
    document.getElementById('codigo').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });

    // -------- Reenviar o código --------
    linkReenviar.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const resultado = await pedirCodigo(emailInformado);
            mostrarToast(resultado.ok ? 'Código enviado de novo!' : resultado.mensagem, resultado.ok ? 'sucesso' : 'erro');
        } catch (err) {
            console.error(err);
            mostrarToast('Erro de conexão com o servidor.', 'erro');
        }
    });

    // -------- Passo 2: redefinir a senha --------
    formRedefinir.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('codigo').value.trim();
        const novaSenha = document.getElementById('senha').value;
        const confirmar = document.getElementById('confirmar-senha').value;
        const botao = formRedefinir.querySelector('button[type="submit"]');

        formRedefinir.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));

        if (codigo.length !== 6) {
            document.getElementById('field-codigo').classList.add('has-error');
            return;
        }
        if (novaSenha.length < 6) {
            document.getElementById('field-senha').classList.add('has-error');
            return;
        }
        if (novaSenha !== confirmar) {
            document.getElementById('field-confirmar-senha').classList.add('has-error');
            return;
        }

        definirCarregando(botao, true);
        try {
            const resp = await fetch('/api/auth/redefinir-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInformado, codigo, novaSenha })
            });
            const dados = await resp.json();

            if (!resp.ok || !dados.sucesso) {
                mostrarToast(dados.mensagem || 'Não foi possível redefinir a senha.', 'erro');
                definirCarregando(botao, false);
                return;
            }

            mostrarToast('Senha redefinida! Redirecionando...', 'sucesso');
            setTimeout(() => {
                window.location.href = '/login?senha=ok&email=' + encodeURIComponent(emailInformado);
            }, 1000);
        } catch (err) {
            console.error(err);
            mostrarToast('Erro de conexão com o servidor.', 'erro');
            definirCarregando(botao, false);
        }
    });
});
