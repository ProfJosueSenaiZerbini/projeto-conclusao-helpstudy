// =====================================================================
// Lógica da página Glossário
// Busca por palavra + filtro por matéria, com os termos em ordem alfabética.
// Dados: GET /api/conteudos/glossario
// =====================================================================
const esc = (t) => API.escapar(t);

let termos = [];
let filtro = '';
let busca = '';

// Tira acentos e deixa minúsculo, para "etica" achar "Ética"
function normalizar(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
}

// Destaca o trecho buscado no texto (já escapado)
function destacar(texto) {
    const seguro = esc(texto);
    if (!busca) return seguro;
    const alvo = normalizar(busca);
    const base = normalizar(texto);
    const i = base.indexOf(alvo);
    if (i < 0) return seguro;
    return esc(texto.slice(0, i)) + '<mark>' + esc(texto.slice(i, i + alvo.length)) + '</mark>' + esc(texto.slice(i + alvo.length));
}

function desenharFiltros() {
    const materias = {};
    termos.forEach((t) => {
        materias[t.slug] = materias[t.slug] || { nome: t.materia_nome, cor: t.cor, icone: t.icone, total: 0 };
        materias[t.slug].total++;
    });

    document.getElementById('filtros').innerHTML =
        `<button class="conteudo-filtro ${!filtro ? 'ativo' : ''}" data-filtro="">Todas <b>${termos.length}</b></button>` +
        Object.entries(materias)
            .sort((a, b) => a[1].nome.localeCompare(b[1].nome, 'pt-BR'))
            .map(
                ([slug, m]) => `
                <button class="conteudo-filtro ${filtro === slug ? 'ativo' : ''}" data-filtro="${esc(slug)}" style="--cor:${esc(m.cor)}">
                    <i class="fa-solid ${esc(m.icone)}"></i> ${esc(m.nome)} <b>${m.total}</b>
                </button>`
            )
            .join('');
}

function desenharLista() {
    const alvo = normalizar(busca);
    const visiveis = termos
        .filter((t) => !filtro || t.slug === filtro)
        .filter((t) => !alvo || normalizar(t.termo).includes(alvo) || normalizar(t.definicao).includes(alvo))
        .sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'));

    document.getElementById('total').textContent =
        visiveis.length === 1 ? '1 termo encontrado' : `${visiveis.length} termos encontrados`;

    const wrap = document.getElementById('lista-termos');
    if (!visiveis.length) {
        wrap.innerHTML = `
            <div class="card empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                Nenhum termo encontrado${busca ? ` para "<b>${esc(busca)}</b>"` : ''}.
            </div>`;
        return;
    }

    // Agrupa pela primeira letra (sem acento)
    const grupos = {};
    visiveis.forEach((t) => {
        const letra = normalizar(t.termo).charAt(0).toUpperCase();
        (grupos[letra] = grupos[letra] || []).push(t);
    });

    wrap.innerHTML = Object.entries(grupos)
        .map(
            ([letra, lista]) => `
            <h2 class="glossario-letra">${esc(letra)}</h2>
            <div class="glossario-grade">
                ${lista
                    .map(
                        (t) => `
                    <article class="card termo-card" style="--cor:${esc(t.cor)}">
                        <div class="termo-card__topo">
                            <h3>${destacar(t.termo)}</h3>
                            <span class="materia-tag" style="--cor:${esc(t.cor)}"><i class="fa-solid ${esc(t.icone)}"></i> ${esc(t.materia_nome)}</span>
                        </div>
                        <p>${destacar(t.definicao)}</p>
                        ${t.exemplo ? `<div class="termo-card__exemplo"><b>Ex.:</b> ${esc(t.exemplo)}</div>` : ''}
                    </article>`
                    )
                    .join('')}
            </div>`
        )
        .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('filtros').addEventListener('click', (e) => {
        const botao = e.target.closest('[data-filtro]');
        if (!botao) return;
        filtro = botao.dataset.filtro;
        desenharFiltros();
        desenharLista();
    });

    document.getElementById('busca').addEventListener('input', (e) => {
        busca = e.target.value.trim();
        desenharLista();
    });

    // Permite abrir já filtrado: /glossario?materia=fisica
    filtro = new URLSearchParams(location.search).get('materia') || '';

    const resp = await API.chamar('/api/conteudos/glossario');
    if (!resp || !resp.sucesso) {
        document.getElementById('lista-termos').innerHTML =
            '<div class="card empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Não foi possível carregar o glossário.</div>';
        return;
    }
    termos = resp.termos;
    if (filtro && !termos.some((t) => t.slug === filtro)) filtro = '';
    desenharFiltros();
    desenharLista();
});
