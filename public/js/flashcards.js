// =====================================================================
// Lógica da página Flashcards
// O aluno vira o cartão, vê a resposta e marca "Já sei" ou "Revisar".
// Dados: GET /api/conteudos/flashcards  |  Salvar: POST /api/conteudos/flashcards/:id
// =====================================================================
const esc = (t) => API.escapar(t);

let todos = [];        // todos os cartões vindos do servidor
let lista = [];        // cartões que aparecem agora (depois dos filtros)
let posicao = 0;       // cartão atual
let filtro = '';       // slug da matéria ('' = todas)
let soRevisar = false;

function aplicarFiltros(manterCartao = false) {
    const atualId = lista[posicao] && lista[posicao].id;
    lista = todos.filter((c) => (!filtro || c.slug === filtro) && (!soRevisar || c.status !== 'sei'));
    if (manterCartao && atualId) {
        const i = lista.findIndex((c) => c.id === atualId);
        posicao = i >= 0 ? i : Math.min(posicao, Math.max(lista.length - 1, 0));
    } else {
        posicao = 0;
    }
    desenharFiltros();
    desenharPlacar();
    desenharCartao();
}

function desenharFiltros() {
    const materias = {};
    todos.forEach((c) => {
        materias[c.slug] = materias[c.slug] || { nome: c.materia_nome, cor: c.cor, icone: c.icone, total: 0 };
        materias[c.slug].total++;
    });

    document.getElementById('filtros').innerHTML =
        `<button class="conteudo-filtro ${!filtro ? 'ativo' : ''}" data-filtro="">Todas <b>${todos.length}</b></button>` +
        Object.entries(materias)
            .map(
                ([slug, m]) => `
                <button class="conteudo-filtro ${filtro === slug ? 'ativo' : ''}" data-filtro="${esc(slug)}" style="--cor:${esc(m.cor)}">
                    <i class="fa-solid ${esc(m.icone)}"></i> ${esc(m.nome)} <b>${m.total}</b>
                </button>`
            )
            .join('');
}

function desenharPlacar() {
    const base = filtro ? todos.filter((c) => c.slug === filtro) : todos;
    const sei = base.filter((c) => c.status === 'sei').length;
    const pct = base.length ? Math.round((sei / base.length) * 100) : 0;
    document.getElementById('placar-sei').textContent = `${sei} de ${base.length}`;
    document.getElementById('placar-barra').style.width = pct + '%';
}

function seloStatus(status) {
    if (status === 'sei') return '<span class="badge badge-success flash-status"><i class="fa-solid fa-check"></i> Já sei</span>';
    if (status === 'revisar') return '<span class="badge badge-danger flash-status"><i class="fa-solid fa-rotate"></i> Revisar</span>';
    return '';
}

function desenharCartao() {
    const area = document.getElementById('area-cartao');

    if (!lista.length) {
        area.innerHTML = soRevisar
            ? `<div class="card empty-state"><i class="fa-solid fa-trophy"></i>Parabéns! Você já sabe todos os cartões ${filtro ? 'desta matéria' : ''}. 🎉<br>Desmarque "só os que preciso revisar" para ver todos.</div>`
            : '<div class="card empty-state"><i class="fa-solid fa-box-open"></i>Nenhum flashcard por aqui ainda.</div>';
        return;
    }

    const c = lista[posicao];
    area.innerHTML = `
        <div class="flash-cena">
            <button class="flash-cartao" id="cartao" style="--cor:${esc(c.cor)}" aria-label="Virar cartão">
                <div class="flash-face flash-face--frente">
                    ${seloStatus(c.status)}
                    <span class="materia-tag" style="--cor:${esc(c.cor)}"><i class="fa-solid ${esc(c.icone)}"></i> ${esc(c.materia_nome)}</span>
                    <p class="flash-face__texto">${esc(c.frente)}</p>
                    <span class="flash-face__dica"><i class="fa-solid fa-hand-pointer"></i> Clique para ver a resposta</span>
                </div>
                <div class="flash-face flash-face--verso">
                    <span class="materia-tag" style="--cor:${esc(c.cor)}"><i class="fa-solid fa-lightbulb"></i> Resposta</span>
                    <p class="flash-face__texto">${esc(c.verso)}</p>
                    <span class="flash-face__dica"><i class="fa-solid fa-rotate-left"></i> Clique para voltar à pergunta</span>
                </div>
            </button>
        </div>

        <div class="flash-nav">
            <button class="flash-nav__seta" id="anterior" aria-label="Cartão anterior" ${posicao === 0 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="flash-nav__contador">${posicao + 1} / ${lista.length}</span>
            <button class="flash-nav__seta" id="proximo" aria-label="Próximo cartão" ${posicao === lista.length - 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>

        <div class="flash-respostas">
            <button class="btn btn-revisar" data-marcar="revisar"><i class="fa-solid fa-rotate"></i> Revisar de novo</button>
            <button class="btn btn-sei" data-marcar="sei"><i class="fa-solid fa-check"></i> Já sei</button>
        </div>`;

    document.getElementById('cartao').addEventListener('click', virar);
    document.getElementById('anterior').addEventListener('click', () => ir(-1));
    document.getElementById('proximo').addEventListener('click', () => ir(1));
    area.querySelectorAll('[data-marcar]').forEach((b) => b.addEventListener('click', () => marcar(b.dataset.marcar)));
}

// ---------- Animações ----------
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let animando = false; // evita cliques repetidos no meio de uma animação

// Coloca uma classe de animação no cartão (e tira antes, para poder repetir)
function animar(classe) {
    const cena = document.querySelector('.flash-cena');
    if (!cena) return;
    cena.classList.remove('pulando', 'entrar-proximo', 'entrar-anterior', 'saindo-sei', 'saindo-revisar');
    void cena.offsetWidth; // força o navegador a reiniciar a animação
    cena.classList.add(classe);
}

function virar() {
    const cartao = document.getElementById('cartao');
    if (!cartao) return;
    cartao.classList.toggle('virado');
    animar('pulando');
}

function ir(passo) {
    const nova = posicao + passo;
    if (nova < 0 || nova >= lista.length || animando) return;
    posicao = nova;
    desenharCartao();
    animar(passo > 0 ? 'entrar-proximo' : 'entrar-anterior');
}

async function marcar(status) {
    const c = lista[posicao];
    if (!c || animando) return;
    animando = true;

    c.status = status; // atualiza a tela na hora
    const salvar = API.chamar(`/api/conteudos/flashcards/${c.id}`, {
        method: 'POST',
        body: JSON.stringify({ status })
    });

    // "Já sei": o cartão sai voando · "Revisar": o cartão balança
    animar(status === 'sei' ? 'saindo-sei' : 'saindo-revisar');
    await esperar(status === 'sei' ? 380 : 450);

    // Vai para o próximo cartão (ou mantém a lista atualizada no modo "só revisar")
    const antes = posicao;
    if (soRevisar && status === 'sei') {
        aplicarFiltros(true);
    } else {
        desenharPlacar();
        if (posicao < lista.length - 1) posicao++;
        desenharCartao();
    }
    if (lista.length && (posicao !== antes || (soRevisar && status === 'sei'))) animar('entrar-proximo');
    animando = false;

    const resp = await salvar;
    if (resp && !resp.sucesso) console.error(resp.mensagem);
}

function embaralhar() {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    posicao = 0;
    desenharCartao();
    animar('entrar-proximo');
}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('filtros').addEventListener('click', (e) => {
        const botao = e.target.closest('[data-filtro]');
        if (!botao) return;
        filtro = botao.dataset.filtro;
        aplicarFiltros();
    });

    document.getElementById('so-revisar').addEventListener('change', (e) => {
        soRevisar = e.target.checked;
        aplicarFiltros();
    });

    document.getElementById('btn-embaralhar').addEventListener('click', embaralhar);

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.matches('input, textarea, select')) return;
        if (e.key === ' ' || e.key === 'Enter') {
            if (e.target.closest('button') && e.target.id !== 'cartao') return;
            e.preventDefault();
            virar();
        } else if (e.key === 'ArrowRight') ir(1);
        else if (e.key === 'ArrowLeft') ir(-1);
        else if (e.key === '1') marcar('revisar');
        else if (e.key === '2') marcar('sei');
    });

    // Permite abrir já filtrado: /flashcards?materia=matematica
    filtro = new URLSearchParams(location.search).get('materia') || '';

    const resp = await API.chamar('/api/conteudos/flashcards');
    if (!resp || !resp.sucesso) {
        document.getElementById('area-cartao').innerHTML =
            '<div class="card empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Não foi possível carregar os flashcards.</div>';
        return;
    }
    todos = resp.flashcards;
    if (filtro && !todos.some((c) => c.slug === filtro)) filtro = '';
    aplicarFiltros();
});
