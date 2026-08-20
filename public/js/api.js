// =====================================================================
// Utilitário compartilhado: chamadas à API + proteção de rotas no front
// Incluído por dashboard.js, exercicios.js, progresso.js e plano.js
// =====================================================================

const API = {
    token() {
        return localStorage.getItem('helpstudy_token');
    },

    usuario() {
        try {
            return JSON.parse(localStorage.getItem('helpstudy_usuario')) || null;
        } catch {
            return null;
        }
    },

    async chamar(rota, opcoes = {}) {
        const resp = await fetch(rota, {
            ...opcoes,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token()}`,
                ...(opcoes.headers || {})
            }
        });
        const dados = await resp.json().catch(() => ({}));
        if (resp.status === 401) {
            localStorage.removeItem('helpstudy_token');
            localStorage.removeItem('helpstudy_usuario');
            window.location.href = '/login';
            return null;
        }
        return dados;
    },

    exigirLogin() {
        if (!this.token()) {
            window.location.href = '/login';
        }
    },

    sair() {
        localStorage.removeItem('helpstudy_token');
        localStorage.removeItem('helpstudy_usuario');
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
            window.location.href = '/login';
        });
    },

    iniciais(nome) {
        if (!nome) return '?';
        const partes = nome.trim().split(' ');
        return partes.length > 1
            ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
            : partes[0].slice(0, 2).toUpperCase();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    API.exigirLogin();
    const usuario = API.usuario();
    if (!usuario) return;

    document.querySelectorAll('[data-user-name]').forEach((el) => (el.textContent = usuario.nome.split(' ')[0]));
    document.querySelectorAll('[data-user-initials]').forEach((el) => (el.textContent = API.iniciais(usuario.nome)));
    document.querySelectorAll('[data-logout]').forEach((el) => el.addEventListener('click', () => API.sair()));

    // Menu mobile
    const menuBtn = document.querySelector('[data-menu-toggle]');
    const sidebar = document.querySelector('.sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
});
