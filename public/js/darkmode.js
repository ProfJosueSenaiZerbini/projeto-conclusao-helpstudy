// =====================================================================
// Alternância de modo claro/escuro, com preferência salva no navegador
// =====================================================================
(function () {
    const STORAGE_KEY = 'helpstudy_theme';

    function aplicarTema(tema) {
        if (tema === 'dark') {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        atualizarIcones(tema);
    }

    function atualizarIcones(tema) {
        document.querySelectorAll('[data-theme-toggle] i').forEach((icon) => {
            icon.className = tema === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });
    }

    function alternarTema() {
        const atual = localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
        const novo = atual === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, novo);
        aplicarTema(novo);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const salvo = localStorage.getItem(STORAGE_KEY) || 'light';
        aplicarTema(salvo);

        document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
            btn.addEventListener('click', alternarTema);
        });
    });
})();
