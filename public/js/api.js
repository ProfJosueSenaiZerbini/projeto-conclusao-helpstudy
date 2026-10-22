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

    // Escapa texto antes de colocar em innerHTML (protege contra HTML injetado)
    escapar(texto) {
        return String(texto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    // Formata segundos como "1h 05min", "12min 30s" ou "45s"
    formatarDuracao(segundos) {
        const s = Math.max(0, Math.round(Number(segundos) || 0));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        if (h) return `${h}h ${String(m).padStart(2, '0')}min`;
        if (m) return `${m}min ${String(s % 60).padStart(2, '0')}s`;
        return `${s}s`;
    },

    // Atualiza o usuário salvo no navegador (ex.: depois de editar o perfil)
    salvarUsuario(dados) {
        const atual = this.usuario() || {};
        const novo = { ...atual, ...dados };
        try {
            localStorage.setItem('helpstudy_usuario', JSON.stringify(novo));
        } catch {
            /* sem armazenamento */
        }
        this.desenharUsuario(novo);
    },

    desenharUsuario(usuario) {
        if (!usuario) return;
        document.querySelectorAll('[data-user-name]').forEach((el) => (el.textContent = usuario.nome.split(' ')[0]));
        document.querySelectorAll('[data-user-initials]').forEach((el) => {
            el.textContent = usuario.avatar || API.iniciais(usuario.nome);
            el.classList.toggle('com-avatar', !!usuario.avatar);
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

    API.desenharUsuario(usuario);
    document.querySelectorAll('[data-logout]').forEach((el) => el.addEventListener('click', () => API.sair()));

    // O chip do usuário leva para a página de perfil
    document.querySelectorAll('.user-chip').forEach((chip) => {
        if (chip.closest('a')) return;
        const link = document.createElement('a');
        link.href = '/perfil';
        link.className = chip.className;
        link.title = 'Meu perfil';
        link.innerHTML = chip.innerHTML;
        chip.replaceWith(link);
    });
    API.desenharUsuario(usuario);

    // Menu mobile
    const menuBtn = document.querySelector('[data-menu-toggle]');
    const sidebar = document.querySelector('.sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
});
