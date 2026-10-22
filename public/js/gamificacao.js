// =====================================================================
// Gamificação no front (incluído em todas as páginas internas)
// - Ofensiva 🔥 e nível/XP no topo
// - Pop-up animado de conquista e de nível novo
// - Mascote (polvo) com mensagens baseadas em eventos reais
// - Modo foco (Pomodoro de 25 minutos)
// Todos os números vêm do servidor (/api/gamificacao).
// =====================================================================
const Gamificacao = (() => {
    const NOMES_NIVEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
    let resumoAtual = null;

    // -----------------------------------------------------------------
    // Chips do topo
    // -----------------------------------------------------------------
    function montarChips() {
        const direita = document.querySelector('.topbar__right');
        if (!direita || direita.querySelector('.streak-chip')) return;
        const wrap = document.createElement('div');
        wrap.className = 'gami-chips';
        wrap.innerHTML = `
            <a href="/progresso" class="streak-chip apagado" title="Ofensiva: dias seguidos estudando">
                <span class="streak-chip__fogo" aria-hidden="true">🔥</span>
                <strong data-ofensiva>0</strong>
                <span class="sr-only">dias seguidos</span>
            </a>
            <a href="/perfil" class="nivel-chip" title="Seu nível">
                <span class="nivel-chip__num" data-nivel>Nv 1</span>
                <span class="nivel-chip__barra"><span data-nivel-barra style="width:0%"></span></span>
            </a>
            <button class="theme-toggle foco-btn" data-foco-toggle aria-label="Modo foco" title="Modo foco (Pomodoro 25 min)">
                <i class="fa-solid fa-hourglass-half"></i><span class="foco-btn__tempo" data-foco-tempo></span>
            </button>`;
        direita.insertBefore(wrap, direita.firstChild);
        wrap.querySelector('[data-foco-toggle]').addEventListener('click', Foco.abrirPainel);
    }

    function desenharChips(r) {
        if (!r) return;
        const chip = document.querySelector('.streak-chip');
        if (chip) {
            chip.querySelector('[data-ofensiva]').textContent = r.ofensiva;
            chip.classList.toggle('apagado', !r.estudouHoje);
            chip.title = r.estudouHoje
                ? `Ofensiva de ${r.ofensiva} dia(s). Você já estudou hoje!`
                : r.ofensiva > 0
                ? `Ofensiva de ${r.ofensiva} dia(s). Responda uma questão hoje para não perder!`
                : 'Responda uma questão para acender sua ofensiva';
        }
        const nivel = r.nivel;
        if (nivel) {
            const el = document.querySelector('[data-nivel]');
            if (el) el.textContent = `Nv ${nivel.nivel}`;
            const barra = document.querySelector('[data-nivel-barra]');
            if (barra) barra.style.width = `${nivel.progresso}%`;
            const link = document.querySelector('.nivel-chip');
            if (link) link.title = `Nível ${nivel.nivel} · ${nivel.titulo} — ${nivel.xpNoNivel}/${nivel.xpParaProximo} XP para o próximo nível`;
        }
    }

    async function atualizarResumo() {
        const r = await API.chamar('/api/gamificacao/resumo');
        if (r && r.sucesso) {
            resumoAtual = r;
            desenharChips(r);
        }
        return resumoAtual;
    }

    // -----------------------------------------------------------------
    // Pop-ups (conquista e nível novo) — mostrados um de cada vez
    // -----------------------------------------------------------------
    const fila = [];
    let mostrando = false;

    function confetes() {
        const cores = ['#5A77DF', '#F5A623', '#22A861', '#E5485D', '#9B59B6', '#16A085'];
        return Array.from({ length: 18 }, (_, i) => {
            const x = Math.round(Math.random() * 100);
            const atraso = (Math.random() * 0.4).toFixed(2);
            return `<i class="confete" style="left:${x}%;background:${cores[i % cores.length]};animation-delay:${atraso}s"></i>`;
        }).join('');
    }

    function mostrarProximo() {
        if (mostrando || !fila.length) return;
        mostrando = true;
        const item = fila.shift();
        const overlay = document.createElement('div');
        overlay.className = 'gami-popup';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-live', 'assertive');
        overlay.innerHTML = `
            <div class="gami-popup__card">
                <div class="gami-popup__confetes" aria-hidden="true">${confetes()}</div>
                <span class="gami-popup__rotulo">${item.rotulo}</span>
                <div class="gami-popup__icone"><i class="fa-solid ${item.icone}"></i></div>
                <h3>${API.escapar(item.titulo)}</h3>
                <p>${API.escapar(item.texto)}</p>
                ${item.xp ? `<span class="gami-popup__xp">+${item.xp} XP</span>` : ''}
                <button class="btn btn-primary btn-sm" data-fechar>Continuar</button>
            </div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));

        const fechar = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                mostrando = false;
                mostrarProximo();
            }, 250);
        };
        overlay.querySelector('[data-fechar]').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => e.target === overlay && fechar());
        overlay.querySelector('[data-fechar]').focus();
        setTimeout(() => overlay.isConnected && fechar(), 6000);
    }

    function popupConquista(c) {
        fila.push({ rotulo: 'Conquista desbloqueada!', icone: c.icone || 'fa-trophy', titulo: c.titulo, texto: c.descricao, xp: c.xp });
        mostrarProximo();
    }

    function popupNivel(nivel) {
        fila.push({
            rotulo: 'Subiu de nível!',
            icone: 'fa-arrow-up',
            titulo: `Nível ${nivel.nivel} · ${nivel.titulo}`,
            texto: `Você já tem ${nivel.xpTotal} XP. Continue assim!`
        });
        mostrarProximo();
    }

    // "+12 XP" flutuando perto do chip de nível
    function xpFlutuante(xp) {
        if (!xp) return;
        const chip = document.querySelector('.nivel-chip');
        const el = document.createElement('span');
        el.className = 'xp-flutuante';
        el.textContent = `+${xp} XP`;
        if (chip) {
            const r = chip.getBoundingClientRect();
            el.style.left = `${r.left + r.width / 2}px`;
            el.style.top = `${r.bottom + 4}px`;
        } else {
            el.style.right = '24px';
            el.style.top = '70px';
        }
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1600);
    }

    // -----------------------------------------------------------------
    // Recebe o bloco "gamificacao" que o servidor devolve após uma ação
    // -----------------------------------------------------------------
    function processar(g) {
        if (!g) return;
        resumoAtual = {
            ...(resumoAtual || {}),
            ofensiva: g.ofensiva,
            estudouHoje: g.hoje && g.hoje.feitas > 0,
            nivel: g.nivel,
            hoje: g.hoje
        };
        desenharChips(resumoAtual);
        xpFlutuante(g.xpGanho);
        (g.conquistasNovas || []).forEach(popupConquista);
        if (g.subiuNivel) popupNivel(g.nivel);

        if (g.hoje && g.hoje.metaBatidaAgora) {
            Mascote.falar(`Meta de hoje cumprida: ${g.hoje.feitas} questões! 🎯 Você ganhou +20 XP.`, 'festa');
        } else if ((g.conquistasNovas || []).length) {
            Mascote.falar('Mandou bem! Você desbloqueou uma conquista nova. 🏅', 'festa');
        }
    }

    // -----------------------------------------------------------------
    // Mascote (polvo da logo)
    // A imagem fica em /images/mascote.png. Se não existir, usa o emoji 🐙.
    // -----------------------------------------------------------------
    const Mascote = (() => {
        const CHAVE = 'helpstudy_mascote_oculto';
        let el = null;
        let timer = null;

        function oculto() {
            try {
                return localStorage.getItem(CHAVE) === '1';
            } catch {
                return false;
            }
        }

        function montar() {
            if (el || oculto()) return;
            el = document.createElement('div');
            el.className = 'mascote';
            el.innerHTML = `
                <div class="mascote__balao" role="status" aria-live="polite">
                    <span data-mascote-texto></span>
                    <button class="mascote__fechar" aria-label="Fechar mensagem"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <button class="mascote__corpo" aria-label="Mascote HelpStudy">
                    <img src="/images/mascote.png" alt="" width="64" height="64">
                </button>`;
            const img = el.querySelector('img');
            img.addEventListener('error', () => {
                img.replaceWith(Object.assign(document.createElement('span'), { className: 'mascote__emoji', textContent: '🐙' }));
            });
            el.querySelector('.mascote__fechar').addEventListener('click', esconderBalao);
            el.querySelector('.mascote__corpo').addEventListener('click', dica);
            document.body.appendChild(el);
        }

        function falar(texto, humor = 'normal', duracao = 7000) {
            montar();
            if (!el) return;
            el.querySelector('[data-mascote-texto]').textContent = texto;
            el.dataset.humor = humor;
            el.classList.remove('falando');
            void el.offsetWidth; // reinicia a animação
            el.classList.add('falando');
            clearTimeout(timer);
            timer = setTimeout(esconderBalao, duracao);
        }

        function esconderBalao() {
            if (el) el.classList.remove('falando');
        }

        // Clique no mascote: dica baseada nos dados do aluno
        function dica() {
            const r = resumoAtual;
            if (!r) return falar('Oi! Eu sou o polvo do HelpStudy. Bora estudar? 📚');
            if (!r.estudouHoje && r.ofensiva > 0) return falar(`Sua ofensiva de ${r.ofensiva} dia(s) está em risco! Responda uma questão hoje. 🔥`, 'alerta');
            if (r.hoje && r.hoje.feitas < r.hoje.meta) return falar(`Faltam ${r.hoje.meta - r.hoje.feitas} questões para a sua meta de hoje (${r.hoje.feitas}/${r.hoje.meta}).`);
            if (r.hoje && r.hoje.feitas >= r.hoje.meta) return falar(`Meta de hoje cumprida (${r.hoje.feitas}/${r.hoje.meta})! Quer revisar o caderno de erros? 📒`, 'festa');
            return falar('Bora estudar? Uma questão já acende sua ofensiva! 🔥');
        }

        function definirOculto(valor) {
            try {
                localStorage.setItem(CHAVE, valor ? '1' : '0');
            } catch {
                /* sem armazenamento: só vale nesta página */
            }
            if (valor && el) {
                el.remove();
                el = null;
            }
            if (!valor) montar();
        }

        return { montar, falar, dica, oculto, definirOculto };
    })();

    // -----------------------------------------------------------------
    // Modo foco (Pomodoro): 25 min de estudo, validados pelo servidor
    // -----------------------------------------------------------------
    const Foco = (() => {
        const CHAVE = 'helpstudy_foco';
        const PAUSA = 5 * 60;
        let intervalo = null;

        function ler() {
            try {
                return JSON.parse(localStorage.getItem(CHAVE)) || null;
            } catch {
                return null;
            }
        }
        function salvar(estado) {
            try {
                if (estado) localStorage.setItem(CHAVE, JSON.stringify(estado));
                else localStorage.removeItem(CHAVE);
            } catch {
                /* sem armazenamento */
            }
        }
        function formatar(seg) {
            const s = Math.max(0, Math.ceil(seg));
            return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        }

        function painel() {
            let p = document.querySelector('.foco-painel');
            if (p) return p;
            p = document.createElement('div');
            p.className = 'foco-painel';
            p.setAttribute('role', 'dialog');
            p.setAttribute('aria-label', 'Modo foco');
            p.innerHTML = `
                <div class="foco-painel__topo">
                    <strong><i class="fa-solid fa-hourglass-half"></i> Modo foco</strong>
                    <button class="theme-toggle" data-foco-fechar aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="foco-painel__anel">
                    <svg viewBox="0 0 120 120" width="132" height="132" aria-hidden="true">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-soft)" stroke-width="10"/>
                        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--brand)" stroke-width="10" stroke-linecap="round"
                            stroke-dasharray="326.7" stroke-dashoffset="0" transform="rotate(-90 60 60)" data-foco-arco/>
                    </svg>
                    <div class="foco-painel__tempo"><strong data-foco-relogio>25:00</strong><span data-foco-fase>Pronto para focar?</span></div>
                </div>
                <p class="foco-painel__texto" data-foco-texto>25 minutos estudando sem distrações e depois 5 minutos de pausa. Ao completar, você ganha +10 XP.</p>
                <div class="foco-painel__acoes">
                    <button class="btn btn-primary btn-sm" data-foco-iniciar><i class="fa-solid fa-play"></i> Iniciar 25 min</button>
                    <button class="btn btn-ghost btn-sm hidden" data-foco-parar><i class="fa-solid fa-stop"></i> Encerrar</button>
                </div>`;
            document.body.appendChild(p);
            p.querySelector('[data-foco-fechar]').addEventListener('click', () => p.classList.remove('aberto'));
            p.querySelector('[data-foco-iniciar]').addEventListener('click', iniciar);
            p.querySelector('[data-foco-parar]').addEventListener('click', parar);
            return p;
        }

        function abrirPainel() {
            const p = painel();
            p.classList.toggle('aberto');
            atualizarTela();
        }

        async function iniciar() {
            const botao = document.querySelector('[data-foco-iniciar]');
            botao.disabled = true;
            const r = await API.chamar('/api/gamificacao/foco/iniciar', { method: 'POST' });
            botao.disabled = false;
            if (!r || !r.sucesso) {
                Mascote.falar((r && r.mensagem) || 'Não consegui iniciar o modo foco. Tente de novo.', 'alerta');
                return;
            }
            salvar({ fase: 'foco', sessaoId: r.sessaoId, fim: Date.now() + r.restante * 1000, total: 25 * 60 });
            Mascote.falar('Modo foco ligado! 25 minutos só para os estudos. Você consegue! 💪');
            iniciarRelogio();
        }

        function parar() {
            salvar(null);
            atualizarTela();
            Mascote.falar('Modo foco encerrado. Quando quiser, é só começar de novo.');
        }

        async function terminouFoco(estado) {
            salvar({ ...estado, fase: 'concluindo' });
            const r = await API.chamar(`/api/gamificacao/foco/${estado.sessaoId}/concluir`, { method: 'POST' });
            if (r && r.sucesso) {
                salvar({ fase: 'pausa', fim: Date.now() + PAUSA * 1000, total: PAUSA });
                processar(r.gamificacao);
                Mascote.falar('25 minutos de foco concluídos! 🎉 Faça uma pausa de 5 minutos.', 'festa', 10000);
            } else if (r && r.restante) {
                salvar({ ...estado, fase: 'foco', fim: Date.now() + r.restante * 1000 });
            } else {
                salvar(null);
            }
            atualizarTela();
        }

        function atualizarTela() {
            const estado = ler();
            const tempoTopo = document.querySelector('[data-foco-tempo]');
            const ativo = estado && (estado.fase === 'foco' || estado.fase === 'pausa');
            document.body.classList.toggle('modo-foco', !!(estado && estado.fase === 'foco'));

            const restante = ativo ? (estado.fim - Date.now()) / 1000 : 25 * 60;
            if (tempoTopo) tempoTopo.textContent = ativo ? formatar(restante) : '';

            const p = document.querySelector('.foco-painel');
            if (!p) return;
            p.querySelector('[data-foco-relogio]').textContent = formatar(restante);
            p.querySelector('[data-foco-fase]').textContent = !ativo ? 'Pronto para focar?' : estado.fase === 'foco' ? 'Focando…' : 'Pausa';
            const arco = p.querySelector('[data-foco-arco]');
            const fracao = ativo ? Math.max(0, restante / estado.total) : 1;
            arco.setAttribute('stroke-dashoffset', String(326.7 * (1 - fracao)));
            arco.setAttribute('stroke', estado && estado.fase === 'pausa' ? 'var(--success)' : 'var(--brand)');
            p.querySelector('[data-foco-iniciar]').classList.toggle('hidden', !!ativo);
            p.querySelector('[data-foco-parar]').classList.toggle('hidden', !ativo);
        }

        function tique() {
            const estado = ler();
            if (estado && estado.fase === 'foco' && Date.now() >= estado.fim) terminouFoco(estado);
            else if (estado && estado.fase === 'pausa' && Date.now() >= estado.fim) {
                salvar(null);
                Mascote.falar('A pausa acabou! Bora para mais um ciclo de foco? ⏳');
            }
            atualizarTela();
        }

        function iniciarRelogio() {
            clearInterval(intervalo);
            intervalo = setInterval(tique, 1000);
            tique();
        }

        return { abrirPainel, iniciarRelogio };
    })();

    // -----------------------------------------------------------------
    // Início
    // -----------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', async () => {
        if (!API.token()) return;
        montarChips();
        Mascote.montar();
        Foco.iniciarRelogio();
        const r = await atualizarResumo();
        document.dispatchEvent(new CustomEvent('gamificacao:resumo', { detail: r }));
    });

    return {
        processar,
        atualizarResumo,
        Mascote,
        NOMES_NIVEL,
        resumo: () => resumoAtual,
        mostrarConquistas: (lista) => (lista || []).forEach(popupConquista)
    };
})();
