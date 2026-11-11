// =====================================================================
// Lógica da página Fórmulas rápidas
// Os dados das fórmulas ficam em dados-formulas.js
// =====================================================================
const esc = (t) => API.escapar(t);

let materiaAtiva = '';
let busca = '';

function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function destacar(texto) {
    if (!busca) return esc(texto);
    const i = normalizar(texto).indexOf(normalizar(busca));
    if (i < 0) return esc(texto);
    return esc(texto.slice(0, i)) + '<mark>' + esc(texto.slice(i, i + busca.length)) + '</mark>' + esc(texto.slice(i + busca.length));
}

function desenharFiltros() {
    const total = Object.values(FORMULAS).reduce((s, m) => s + m.lista.length, 0);
    document.getElementById('filtros').innerHTML =
        `<button class="conteudo-filtro ${!materiaAtiva ? 'ativo' : ''}" data-filtro="">Todas <b>${total}</b></button>` +
        Object.entries(FORMULAS)
            .map(
                ([chave, m]) => `
                <button class="conteudo-filtro ${materiaAtiva === chave ? 'ativo' : ''}" data-filtro="${chave}" style="--cor:${m.cor}">
                    <i class="fa-solid ${m.icone}"></i> ${esc(m.nome)} <b>${m.lista.length}</b>
                </button>`
            )
            .join('');
}

function desenharLista() {
    const alvo = normalizar(busca);
    const cartoes = [];

    Object.entries(FORMULAS).forEach(([chave, m]) => {
        if (materiaAtiva && materiaAtiva !== chave) return;
        m.lista.forEach((f) => {
            const texto = normalizar(`${f.titulo} ${f.legenda} ${f.formula}`);
            if (alvo && !texto.includes(alvo)) return;
            cartoes.push(`
                <article class="card formula-card" style="--cor:${m.cor}">
                    <div class="formula-card__topo">
                        <h3>${destacar(f.titulo)}</h3>
                        <span class="materia-tag" style="--cor:${m.cor}"><i class="fa-solid ${m.icone}"></i> ${esc(m.nome)}</span>
                    </div>
                    <div class="formula-card__formula">${esc(f.formula)}</div>
                    <p class="formula-card__legenda">${esc(f.legenda)}</p>
                    <div class="formula-card__exemplo"><b>Exemplo:</b> ${esc(f.exemplo)}</div>
                </article>`);
        });
    });

    document.getElementById('total').textContent =
        cartoes.length === 1 ? '1 fórmula encontrada' : `${cartoes.length} fórmulas encontradas`;

    document.getElementById('lista-formulas').innerHTML = cartoes.length
        ? cartoes.join('')
        : `<div class="card empty-state" style="grid-column:1 / -1"><i class="fa-solid fa-magnifying-glass"></i>Nenhuma fórmula encontrada${busca ? ` para "<b>${esc(busca)}</b>"` : ''}.</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Permite abrir já filtrado: /formulas?materia=fisica
    const param = new URLSearchParams(location.search).get('materia');
    if (param && FORMULAS[param]) materiaAtiva = param;

    desenharFiltros();
    desenharLista();

    document.getElementById('filtros').addEventListener('click', (e) => {
        const botao = e.target.closest('[data-filtro]');
        if (!botao) return;
        materiaAtiva = botao.dataset.filtro;
        desenharFiltros();
        desenharLista();
    });

    document.getElementById('busca').addEventListener('input', (e) => {
        busca = e.target.value.trim();
        desenharLista();
    });
});
