// =====================================================================
// Lógica da página Redação
// Escolhe o tema, conta linhas/palavras, marca o checklist e salva no banco.
// API: GET/POST /api/redacoes  |  PUT/DELETE /api/redacoes/:id
// =====================================================================
const esc = (t) => API.escapar(t);

// Temas oficiais da redação do ENEM
const TEMAS_ENEM = [
    [2025, 'Perspectivas acerca do envelhecimento na sociedade brasileira'],
    [2024, 'Desafios para a valorização da herança africana no Brasil'],
    [2023, 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil'],
    [2022, 'Desafios para a valorização de comunidades e povos tradicionais no Brasil'],
    [2021, 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil'],
    [2020, 'O estigma associado às doenças mentais na sociedade brasileira'],
    [2019, 'Democratização do acesso ao cinema no Brasil'],
    [2018, 'Manipulação do comportamento do usuário pelo controle de dados na internet'],
    [2017, 'Desafios para a formação educacional de surdos no Brasil'],
    [2016, 'Caminhos para combater a intolerância religiosa no Brasil'],
    [2015, 'A persistência da violência contra a mulher na sociedade brasileira']
];

// As 5 competências avaliadas no ENEM
const COMPETENCIAS = [
    ['Competência 1', 'Escrevi seguindo a norma padrão, sem erros de gramática e ortografia.'],
    ['Competência 2', 'Entendi o tema, não fugi dele e usei repertório (dados, livros, filmes, fatos).'],
    ['Competência 3', 'Organizei as ideias e defendi um ponto de vista com argumentos.'],
    ['Competência 4', 'Usei conectivos para ligar frases e parágrafos (coesão).'],
    ['Competência 5', 'Fiz uma proposta de intervenção completa e que respeita os direitos humanos.']
];

const LETRAS_POR_LINHA = 70; // média de letras em uma linha da folha do ENEM
const TEMA_LIVRE = '__livre__';

let redacoes = [];
let atualId = null;        // redação aberta no editor (null = nova)
let alterado = false;      // tem mudança que ainda não foi salva?

// ---------- Contadores ----------
function contar(texto) {
    const paragrafos = texto.split('\n').map((p) => p.trim()).filter(Boolean);
    const linhas = paragrafos.reduce((soma, p) => soma + Math.ceil(p.length / LETRAS_POR_LINHA), 0);
    const palavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
    return { linhas, paragrafos: paragrafos.length, palavras };
}

function atualizarContadores() {
    const { linhas, paragrafos, palavras } = contar(document.getElementById('texto').value);

    const chipLinhas = document.getElementById('cont-linhas');
    chipLinhas.textContent = `≈ ${linhas} / 30 linhas`;
    chipLinhas.className = 'redacao-chip ' + (linhas > 30 || (linhas > 0 && linhas <= 7) ? 'alerta' : linhas >= 20 ? 'ok' : '');

    const chipPar = document.getElementById('cont-paragrafos');
    chipPar.textContent = paragrafos === 1 ? '1 parágrafo' : `${paragrafos} parágrafos`;
    chipPar.className = 'redacao-chip ' + (paragrafos === 4 ? 'ok' : '');

    document.getElementById('cont-palavras').textContent = palavras === 1 ? '1 palavra' : `${palavras} palavras`;

    const aviso = document.getElementById('aviso-linhas');
    let msg = '';
    if (linhas > 30) msg = '⚠️ Passou de 30 linhas. A folha do ENEM tem 30 linhas: tente resumir.';
    else if (linhas > 0 && linhas <= 7) msg = '⚠️ No ENEM, redações com até 7 linhas recebem nota zero. Continue escrevendo!';
    aviso.textContent = msg;
    aviso.classList.toggle('hidden', !msg);
}

// ---------- Tema ----------
function montarTemas() {
    document.getElementById('tema-select').innerHTML =
        '<option value="">Escolha um tema...</option>' +
        '<optgroup label="Temas do ENEM">' +
        TEMAS_ENEM.map(([ano, tema]) => `<option value="${esc(tema)}">ENEM ${ano} — ${esc(tema)}</option>`).join('') +
        '</optgroup>' +
        `<option value="${TEMA_LIVRE}">✏️ Tema livre (escrever o meu)</option>`;
}

function temaAtual() {
    const valor = document.getElementById('tema-select').value;
    return valor === TEMA_LIVRE ? document.getElementById('tema-livre').value.trim() : valor;
}

function definirTema(tema) {
    const select = document.getElementById('tema-select');
    const livre = document.getElementById('tema-livre');
    const ehEnem = TEMAS_ENEM.some(([, t]) => t === tema);
    if (!tema) select.value = '';
    else if (ehEnem) select.value = tema;
    else select.value = TEMA_LIVRE;
    livre.value = ehEnem ? '' : tema || '';
    livre.classList.toggle('hidden', select.value !== TEMA_LIVRE);
}

// ---------- Checklist ----------
function montarChecklist() {
    document.getElementById('checklist').innerHTML = COMPETENCIAS.map(
        ([titulo, texto], i) => `
        <label class="competencia">
            <input type="checkbox" data-comp="${i}">
            <div><b>${titulo}</b><span>${texto}</span></div>
        </label>`
    ).join('');
}

function lerChecklist() {
    return [...document.querySelectorAll('[data-comp]')].map((c) => (c.checked ? '1' : '0')).join('');
}

function definirChecklist(valor = '') {
    document.querySelectorAll('[data-comp]').forEach((c, i) => (c.checked = valor[i] === '1'));
}

// ---------- Editor ----------
function status(texto) {
    document.getElementById('status').textContent = texto;
}

function abrir(redacao) {
    if (alterado && !confirm('Você tem alterações que não foram salvas. Quer continuar mesmo assim?')) return;
    atualId = redacao ? redacao.id : null;
    definirTema(redacao ? redacao.tema : '');
    document.getElementById('texto').value = redacao ? redacao.texto : '';
    definirChecklist(redacao ? redacao.checklist : '');
    alterado = false;
    status(redacao ? `Editando a redação salva em ${dataHora(redacao.atualizado_em)}` : '');
    atualizarContadores();
    desenharLista();
    if (redacao) window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('texto').focus();
}

async function salvar() {
    const tema = temaAtual();
    const texto = document.getElementById('texto').value;
    if (!tema) return status('⚠️ Escolha ou escreva um tema antes de salvar.');
    if (!texto.trim()) return status('⚠️ Escreva alguma coisa antes de salvar.');

    const botao = document.getElementById('btn-salvar');
    botao.disabled = true;
    status('Salvando...');

    const resp = await API.chamar(atualId ? `/api/redacoes/${atualId}` : '/api/redacoes', {
        method: atualId ? 'PUT' : 'POST',
        body: JSON.stringify({ tema, texto, checklist: lerChecklist() })
    });
    botao.disabled = false;
    if (!resp) return;
    if (!resp.sucesso) return status('⚠️ ' + (resp.mensagem || 'Não foi possível salvar.'));

    atualId = resp.redacao.id;
    redacoes = [resp.redacao, ...redacoes.filter((r) => r.id !== atualId)];
    alterado = false;
    status(`✅ Salvo às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
    desenharLista();
}

async function excluir(id) {
    if (!confirm('Excluir esta redação? Não dá para desfazer.')) return;
    const resp = await API.chamar(`/api/redacoes/${id}`, { method: 'DELETE' });
    if (!resp || !resp.sucesso) return;
    redacoes = redacoes.filter((r) => r.id !== id);
    if (atualId === id) {
        alterado = false;
        abrir(null);
    } else {
        desenharLista();
    }
}

// ---------- Lista de redações salvas ----------
function dataHora(texto) {
    const d = new Date(String(texto).replace(' ', 'T'));
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function desenharLista() {
    const wrap = document.getElementById('lista-redacoes');
    if (!redacoes.length) {
        wrap.innerHTML = '<div class="card empty-state"><i class="fa-solid fa-pen-nib"></i>Você ainda não salvou nenhuma redação.</div>';
        return;
    }
    wrap.innerHTML = redacoes
        .map((r) => {
            const { linhas } = contar(r.texto);
            const feitas = (r.checklist.match(/1/g) || []).length;
            return `
            <div class="card redacao-item ${r.id === atualId ? 'atual' : ''}">
                <div class="redacao-item__icone"><i class="fa-solid fa-file-lines"></i></div>
                <div class="redacao-item__texto">
                    <strong>${esc(r.tema)}</strong>
                    <span>${dataHora(r.atualizado_em)} · ≈ ${linhas} linhas · checklist ${feitas}/5</span>
                </div>
                <div class="redacao-item__acoes">
                    <button class="btn btn-ghost btn-sm" data-abrir="${r.id}"><i class="fa-solid fa-pen"></i> Abrir</button>
                    <button class="btn btn-ghost btn-sm" data-excluir="${r.id}" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        })
        .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    montarTemas();
    montarChecklist();
    atualizarContadores();

    const marcarAlterado = () => {
        alterado = true;
        status('Alterações não salvas');
    };

    document.getElementById('texto').addEventListener('input', () => {
        atualizarContadores();
        marcarAlterado();
    });
    document.getElementById('tema-select').addEventListener('change', (e) => {
        document.getElementById('tema-livre').classList.toggle('hidden', e.target.value !== TEMA_LIVRE);
        marcarAlterado();
    });
    document.getElementById('tema-livre').addEventListener('input', marcarAlterado);
    document.getElementById('checklist').addEventListener('change', marcarAlterado);
    document.getElementById('btn-salvar').addEventListener('click', salvar);
    document.getElementById('btn-nova').addEventListener('click', () => abrir(null));

    // Ctrl + S salva
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            salvar();
        }
    });

    document.getElementById('lista-redacoes').addEventListener('click', (e) => {
        const abrirBtn = e.target.closest('[data-abrir]');
        const excluirBtn = e.target.closest('[data-excluir]');
        if (abrirBtn) abrir(redacoes.find((r) => r.id === Number(abrirBtn.dataset.abrir)));
        if (excluirBtn) excluir(Number(excluirBtn.dataset.excluir));
    });

    // Avisa antes de sair da página com texto não salvo
    window.addEventListener('beforeunload', (e) => {
        if (!alterado) return;
        e.preventDefault();
        e.returnValue = '';
    });

    const resp = await API.chamar('/api/redacoes');
    redacoes = resp && resp.sucesso ? resp.redacoes : [];
    desenharLista();
});
