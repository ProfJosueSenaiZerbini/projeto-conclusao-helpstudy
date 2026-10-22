// =====================================================================
// Lógica da página Caderno de erros
// Lista as questões cuja última resposta do aluno está errada
// (matérias e ENEM) e leva para refazer. Dados: /api/progresso/erros
// =====================================================================
const esc = (t) => API.escapar(t);
const NIVEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const CLASSE_NIVEL = { facil: 'badge-success', medio: 'badge-neutral', dificil: 'badge-danger' };

let dados = { materias: [], enem: [] };
let filtro = '';

function data(texto) {
    return new Date(String(texto).replace(' ', 'T')).toLocaleDateString('pt-BR');
}

function trocarAba(aba) {
    document.querySelectorAll('.erros-abas [data-aba]').forEach((b) => {
        b.classList.toggle('ativo', b.dataset.aba === aba);
        b.setAttribute('aria-selected', b.dataset.aba === aba);
    });
    document.getElementById('painel-materias').classList.toggle('hidden', aba !== 'materias');
    document.getElementById('painel-enem').classList.toggle('hidden', aba !== 'enem');
    atualizarBotaoRefazer(aba);
}

function atualizarBotaoRefazer(aba = 'materias') {
    const botao = document.getElementById('btn-refazer-todas');
    const lista = filtro ? dados.materias.filter((q) => q.slug === filtro) : dados.materias;
    botao.classList.toggle('hidden', aba !== 'materias' || lista.length === 0);
    botao.href = `/exercicios?modo=erros${filtro ? '&materia=' + encodeURIComponent(filtro) : ''}`;
    botao.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Refazer ${filtro ? 'estas' : 'todas'} (${lista.length})`;
}

function desenharFiltros() {
    const contagem = {};
    dados.materias.forEach((q) => {
        contagem[q.slug] = contagem[q.slug] || { nome: q.materia_nome, cor: q.cor, total: 0 };
        contagem[q.slug].total++;
    });
    const wrap = document.getElementById('filtros-materias');
    if (Object.keys(contagem).length < 2) {
        wrap.innerHTML = '';
        return;
    }
    wrap.innerHTML =
        `<button class="erros-filtro ${!filtro ? 'ativo' : ''}" data-filtro="">Todas <b>${dados.materias.length}</b></button>` +
        Object.entries(contagem)
            .map(
                ([slug, m]) =>
                    `<button class="erros-filtro ${filtro === slug ? 'ativo' : ''}" data-filtro="${esc(slug)}" style="--cor:${esc(m.cor)}">${esc(m.nome)} <b>${m.total}</b></button>`
            )
            .join('');
}

function desenharMaterias() {
    const wrap = document.getElementById('lista-materias');
    const lista = filtro ? dados.materias.filter((q) => q.slug === filtro) : dados.materias;
    if (!lista.length) {
        wrap.innerHTML = `
            <div class="card empty-state">
                <i class="fa-solid fa-champagne-glasses"></i>
                Nenhum erro nas matérias. Continue assim! 🎉
                <div style="margin-top:12px"><a href="/dashboard" class="btn btn-primary btn-sm">Praticar matérias</a></div>
            </div>`;
        return;
    }
    wrap.innerHTML = lista
        .map(
            (q, i) => `
        <div class="card erro-item" style="animation-delay:${Math.min(i, 10) * 40}ms">
            <span class="erro-item__icone" style="background:${esc(q.cor)}"><i class="fa-solid ${esc(q.icone)}"></i></span>
            <div class="erro-item__texto">
                <strong>${esc(q.enunciado)}</strong>
                <span>${esc(q.materia_nome)} · Você marcou ${esc(String(q.alternativa_marcada).toUpperCase())} · errou ${q.erros}x · ${data(q.respondido_em)}</span>
            </div>
            <span class="badge ${CLASSE_NIVEL[q.nivel] || 'badge-neutral'}">${NIVEL[q.nivel] || esc(q.nivel)}</span>
            <a class="btn btn-outline btn-sm" href="/exercicios?modo=erros&materia=${encodeURIComponent(q.slug)}">Refazer</a>
        </div>`
        )
        .join('');
}

function desenharEnem() {
    const wrap = document.getElementById('lista-enem');
    if (!dados.enem.length) {
        wrap.innerHTML = `
            <div class="card empty-state">
                <i class="fa-solid fa-champagne-glasses"></i>
                Nenhum erro nas questões do ENEM. 🎉
                <div style="margin-top:12px"><a href="/enem" class="btn btn-primary btn-sm">Praticar ENEM</a></div>
            </div>`;
        return;
    }
    wrap.innerHTML = dados.enem
        .map((q, i) => {
            const params = new URLSearchParams({ ano: q.ano, questao: q.numero });
            if (q.idioma) params.set('idioma', q.idioma);
            return `
            <div class="card erro-item" style="animation-delay:${Math.min(i, 10) * 40}ms">
                <span class="erro-item__icone" style="background:${esc(q.cor)}"><i class="fa-solid ${esc(q.icone)}"></i></span>
                <div class="erro-item__texto">
                    <strong>ENEM ${q.ano} · Questão ${q.numero}${q.idioma ? ` (${esc(q.idioma)})` : ''}</strong>
                    <span>${esc(q.area_nome)} · Você marcou ${esc(q.alternativa_marcada)} · ${q.vezes} tentativa(s) · ${data(q.respondido_em)}</span>
                </div>
                <a class="btn btn-outline btn-sm" href="/enem?${params}">Abrir questão</a>
            </div>`;
        })
        .join('');
}

async function carregar() {
    const resp = await API.chamar('/api/progresso/erros');
    if (!resp || !resp.sucesso) {
        document.getElementById('lista-materias').innerHTML =
            `<div class="card empty-state"><i class="fa-solid fa-triangle-exclamation"></i>${esc((resp && resp.mensagem) || 'Não foi possível carregar o caderno.')}</div>`;
        return;
    }
    dados = { materias: resp.materias, enem: resp.enem };
    document.getElementById('num-materias').textContent = dados.materias.length;
    document.getElementById('num-enem').textContent = dados.enem.length;
    desenharFiltros();
    desenharMaterias();
    desenharEnem();
    atualizarBotaoRefazer();
    if (!dados.materias.length && dados.enem.length) trocarAba('enem');
}

document.addEventListener('DOMContentLoaded', () => {
    carregar();
    document.querySelector('.erros-abas').addEventListener('click', (e) => {
        const b = e.target.closest('[data-aba]');
        if (b) trocarAba(b.dataset.aba);
    });
    document.getElementById('filtros-materias').addEventListener('click', (e) => {
        const b = e.target.closest('[data-filtro]');
        if (!b) return;
        filtro = b.dataset.filtro;
        desenharFiltros();
        desenharMaterias();
        atualizarBotaoRefazer();
    });
});
