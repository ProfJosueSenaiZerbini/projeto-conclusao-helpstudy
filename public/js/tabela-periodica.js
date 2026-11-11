// =====================================================================
// Lógica da página Tabela periódica interativa
// Os dados dos elementos ficam em dados-tabela-periodica.js
// =====================================================================
const esc = (t) => API.escapar(t);

let categoriaAtiva = '';
let selecionado = null;

function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function infoElemento([z, simbolo, nome, massa, categoria]) {
    const pos = posicaoElemento(z);
    let estado = 'Sólido';
    if (GASES.includes(simbolo)) estado = 'Gasoso';
    if (LIQUIDOS.includes(simbolo)) estado = 'Líquido';
    const sintetico = z === 43 || z === 61 || z > 92;
    if (sintetico && z > 99) estado = 'Desconhecido (artificial)';

    let valencia = null;
    if (pos.grupo === 1 || pos.grupo === 2) valencia = pos.grupo;
    if (pos.grupo >= 13 && pos.grupo <= 18) valencia = z === 2 ? 2 : pos.grupo - 10;

    return { z, simbolo, nome, massa, categoria, ...pos, estado, sintetico, valencia };
}

function desenharLegenda() {
    document.getElementById('legenda').innerHTML =
        Object.entries(CATEGORIAS)
            .map(
                ([cat, nome]) =>
                    `<button class="cat-${cat} ${categoriaAtiva === cat ? 'ativo' : ''}" data-cat="${cat}">${esc(nome)}</button>`
            )
            .join('');
}

function celula(info) {
    const coluna = info.serieF ? info.coluna + 1 : info.grupo + 1;
    const linha = info.serieF ? (info.periodo === 6 ? 10 : 11) : info.periodo + 1;
    return `
        <button class="tp-el cat-${info.categoria}" data-z="${info.z}" role="gridcell"
                style="grid-column:${coluna};grid-row:${linha}" aria-label="${esc(info.nome)}, número ${info.z}">
            <span class="tp-el__num">${info.z}</span>
            <span class="tp-el__sim">${esc(info.simbolo)}</span>
            <span class="tp-el__nome">${esc(info.nome)}</span>
        </button>`;
}

function desenharTabela() {
    let html = '';

    // Números dos grupos (famílias) e dos períodos
    for (let g = 1; g <= 18; g++) html += `<span class="tp-rotulo" style="grid-column:${g + 1};grid-row:1">${g}</span>`;
    for (let p = 1; p <= 7; p++) html += `<span class="tp-rotulo" style="grid-column:1;grid-row:${p + 1}">${p}</span>`;

    // Caixa de detalhes no espaço vazio do topo
    html += '<div class="tp-detalhe" id="detalhe"></div>';

    ELEMENTOS.forEach((e) => (html += celula(infoElemento(e))));

    // Indicação de onde ficam os lantanídeos e actinídeos
    html += '<span class="tp-vaga cat-lantanideo" style="grid-column:4;grid-row:7">57–71</span>';
    html += '<span class="tp-vaga cat-actinideo" style="grid-column:4;grid-row:8">89–103</span>';
    html += '<span class="tp-espaco" style="grid-column:1 / -1;grid-row:9"></span>';

    document.getElementById('tabela').innerHTML = html;
    mostrarDetalhe(null);
}

function mostrarDetalhe(z) {
    // A caixa de detalhes existe em dois lugares: dentro da tabela (computador)
    // e acima dela (celular). As duas recebem o mesmo conteúdo.
    const caixa = {
        set innerHTML(html) {
            document.getElementById('detalhe').innerHTML = html;
            document.getElementById('detalhe-celular').innerHTML = html;
        }
    };
    document.querySelectorAll('.tp-el.selecionado').forEach((el) => el.classList.remove('selecionado'));

    if (!z) {
        caixa.innerHTML = '<div class="tp-detalhe__vazio"><i class="fa-solid fa-hand-pointer"></i>Clique em um elemento para ver os detalhes</div>';
        return;
    }

    const info = infoElemento(ELEMENTOS[z - 1]);
    selecionado = z;
    document.querySelector(`.tp-el[data-z="${z}"]`).classList.add('selecionado');

    const familia = info.grupo ? FAMILIAS[info.grupo] || `Grupo ${info.grupo}` : CATEGORIAS[info.categoria];
    const curiosidade = CURIOSIDADES[info.simbolo] || (info.sintetico ? 'É um elemento artificial: foi produzido em laboratório.' : '');

    caixa.innerHTML = `
        <div class="tp-detalhe__caixa cat-${info.categoria}">
            <small>${info.z}</small>
            <strong>${esc(info.simbolo)}</strong>
            <span>${esc(info.massa)}</span>
        </div>
        <div class="tp-detalhe__info">
            <h3>${esc(info.nome)}</h3>
            <div class="tp-detalhe__dados">
                <span><b>Categoria:</b> ${esc(CATEGORIAS[info.categoria])}</span>
                <span><b>Massa:</b> ${esc(info.massa)} u</span>
                <span><b>Período:</b> ${info.periodo}</span>
                <span><b>Estado (25 °C):</b> ${esc(info.estado)}</span>
                <span><b>${esc(familia)}</b></span>
                ${info.valencia ? `<span><b>Elétrons na última camada:</b> ${info.valencia}</span>` : ''}
            </div>
            ${curiosidade ? `<p class="tp-detalhe__curiosidade">💡 ${esc(curiosidade)}</p>` : ''}
        </div>`;
}

function aplicarDestaques() {
    const alvo = normalizar(document.getElementById('busca').value.trim());
    document.querySelectorAll('.tp-el').forEach((el) => {
        const e = ELEMENTOS[el.dataset.z - 1];
        const bateCategoria = !categoriaAtiva || e[4] === categoriaAtiva;
        const bateBusca =
            !alvo || String(e[0]) === alvo || normalizar(e[1]) === alvo || normalizar(e[2]).includes(alvo);
        el.classList.toggle('apagado', !(bateCategoria && bateBusca));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    desenharLegenda();
    desenharTabela();

    document.getElementById('tabela').addEventListener('click', (e) => {
        const el = e.target.closest('.tp-el');
        if (el) mostrarDetalhe(Number(el.dataset.z));
    });

    document.getElementById('legenda').addEventListener('click', (e) => {
        const botao = e.target.closest('[data-cat]');
        if (!botao) return;
        categoriaAtiva = categoriaAtiva === botao.dataset.cat ? '' : botao.dataset.cat;
        desenharLegenda();
        aplicarDestaques();
    });

    const busca = document.getElementById('busca');
    busca.addEventListener('input', aplicarDestaques);
    // Enter abre o primeiro elemento encontrado
    busca.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const primeiro = document.querySelector('.tp-el:not(.apagado)');
        if (primeiro && busca.value.trim()) mostrarDetalhe(Number(primeiro.dataset.z));
    });
});
