// =====================================================================
// Lógica da página de Simulado do ENEM
// 1) Configurar (ano, área, idioma, quantidade) e ver o histórico
// 2) Fazer a prova com cronômetro (respostas salvas no servidor)
// 3) Resultado com correção feita pelo servidor
// =====================================================================

const AREAS = {
    linguagens: { nome: 'Linguagens', icone: 'fa-language', cor: '#9B59B6' },
    'ciencias-humanas': { nome: 'Ciências Humanas', icone: 'fa-landmark', cor: '#F39C12' },
    'ciencias-natureza': { nome: 'Ciências da Natureza', icone: 'fa-flask', cor: '#16A085' },
    matematica: { nome: 'Matemática', icone: 'fa-square-root-variable', cor: '#4A6CF7' }
};

const sim = {
    dados: null, // simulado em andamento
    atual: 0,
    fimEm: 0,
    relogio: null,
    finalizando: false
};

const esc = (t) => API.escapar(t);
const $ = (id) => document.getElementById(id);

function infoArea(valor) {
    return AREAS[valor] || { nome: valor || 'Geral', icone: 'fa-book', cor: '#5A77DF' };
}

function mostrarToast(mensagem, tipo = '') {
    const toast = $('toast');
    toast.textContent = mensagem;
    toast.className = `toast show ${tipo ? 'toast-' + tipo : ''}`;
    clearTimeout(mostrarToast.timer);
    mostrarToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function relogio(segundos) {
    const s = Math.max(0, Math.ceil(segundos));
    const h = Math.floor(s / 3600);
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return h ? `${h}:${m}:${ss}` : `${m}:${ss}`;
}

function mostrarTela(nome) {
    ['config', 'prova', 'resultado'].forEach((t) => $(`tela-${t}`).classList.toggle('hidden', t !== nome));
    window.scrollTo({ top: 0 });
}

function definirUrl(id) {
    history.replaceState(null, '', id ? `/simulado?id=${id}` : '/simulado');
}

// =====================================================================
// 1) CONFIGURAÇÃO E HISTÓRICO
// =====================================================================
async function carregarProvaConfig(ano, areaInicial) {
    $('sim-area').disabled = true;
    $('sim-idioma').disabled = true;
    const resp = await API.chamar(`/api/enem/provas/${ano}`);
    if (!resp || !resp.sucesso) {
        mostrarToast((resp && resp.mensagem) || 'Não foi possível carregar a prova.', 'erro');
        return;
    }
    const prova = resp.prova;
    $('sim-area').innerHTML =
        `<option value="">Todas as áreas (${prova.totalQuestoes})</option>` +
        prova.areas.map((a) => `<option value="${esc(a.valor)}">${esc(a.nome)} (${a.total})</option>`).join('');
    if (areaInicial && prova.areas.some((a) => a.valor === areaInicial)) $('sim-area').value = areaInicial;
    $('sim-area').disabled = false;

    if (prova.idiomas.length) {
        $('sim-idioma').innerHTML = prova.idiomas.map((i) => `<option value="${esc(i.valor)}">${esc(i.nome)}</option>`).join('');
        $('sim-idioma').disabled = false;
    } else {
        $('sim-idioma').innerHTML = '<option value="">Não se aplica</option>';
    }
    $('btn-comecar').disabled = false;
}

function desenharHistorico(historico) {
    const wrap = $('historico-simulados');
    if (!historico.length) {
        wrap.innerHTML = `<div class="card empty-state"><i class="fa-regular fa-clipboard"></i>Você ainda não fez nenhum simulado. Que tal começar com 5 questões?</div>`;
        return;
    }
    wrap.innerHTML = `<div class="historico-lista">${historico
        .map((h) => {
            const nota = Number(h.nota || 0);
            const classe = nota >= 7 ? 'bom' : nota >= 5 ? 'medio' : 'baixo';
            const data = new Date(String(h.finalizadoEm).replace(' ', 'T')).toLocaleDateString('pt-BR');
            return `
            <a class="card historico-item" href="/simulado?id=${h.id}">
                <span class="historico-item__nota ${classe}">${nota.toFixed(1)}</span>
                <div class="historico-item__texto">
                    <strong>ENEM ${h.ano} · ${esc(h.areaNome)}</strong>
                    <span>${data} · ${h.acertos}/${h.total} acertos · ${API.formatarDuracao(h.tempoGasto)}</span>
                </div>
                <span class="historico-item__ver">Ver correção <i class="fa-solid fa-arrow-right"></i></span>
            </a>`;
        })
        .join('')}</div>`;
}

function desenharAndamento(lista) {
    const card = $('simulado-andamento');
    if (!lista.length) {
        card.classList.add('hidden');
        return;
    }
    const s = lista[0];
    card.classList.remove('hidden');
    card.innerHTML = `
        <div class="simulado-andamento__icone"><i class="fa-solid fa-hourglass-half"></i></div>
        <div class="simulado-andamento__texto">
            <strong>Você tem um simulado em andamento</strong>
            <span>ENEM ${s.ano} · ${esc(s.areaNome)} · ${s.respondidas}/${s.total} respondidas · ${relogio(s.restante)} restantes</span>
        </div>
        <button class="btn btn-primary btn-sm" data-continuar="${s.id}">Continuar</button>`;
    card.querySelector('[data-continuar]').addEventListener('click', () => abrirSimulado(s.id));
}

async function iniciarConfig() {
    const params = new URLSearchParams(window.location.search);

    const [lista, provas] = await Promise.all([API.chamar('/api/simulados'), API.chamar('/api/enem/provas')]);
    if (lista && lista.sucesso) {
        desenharAndamento(lista.emAndamento);
        desenharHistorico(lista.historico);
    } else {
        $('historico-simulados').innerHTML = `<div class="card empty-state"><i class="fa-solid fa-triangle-exclamation"></i>${esc((lista && lista.mensagem) || 'Não foi possível carregar seus simulados.')}</div>`;
    }

    if (!provas || !provas.sucesso || !provas.provas.length) {
        $('sim-ano').innerHTML = '<option>Indisponível</option>';
        mostrarToast((provas && provas.mensagem) || 'Não foi possível carregar as provas do ENEM.', 'erro');
        return;
    }
    const anos = provas.provas.map((p) => p.ano);
    $('sim-ano').innerHTML = provas.provas.map((p) => `<option value="${p.ano}">${esc(p.titulo)}</option>`).join('');
    const anoUrl = Number(params.get('ano'));
    $('sim-ano').value = anos.includes(anoUrl) ? anoUrl : Math.max(...anos);
    $('sim-ano').disabled = false;
    await carregarProvaConfig($('sim-ano').value, params.get('area'));
}

async function comecarSimulado(e) {
    e.preventDefault();
    const botao = $('btn-comecar');
    const original = botao.innerHTML;
    botao.disabled = true;
    botao.innerHTML = '<span class="spinner"></span> Sorteando questões...';

    const corpo = {
        ano: Number($('sim-ano').value),
        area: $('sim-area').value || null,
        idioma: $('sim-idioma').value || null,
        quantidade: Number(document.querySelector('input[name="quantidade"]:checked').value)
    };
    const resp = await API.chamar('/api/simulados', { method: 'POST', body: JSON.stringify(corpo) });
    botao.disabled = false;
    botao.innerHTML = original;

    if (resp && resp.sucesso) {
        entrarNaProva(resp.simulado);
        Gamificacao.Mascote.falar(`Simulado começou! Você tem ${relogio(resp.simulado.duracao)} para ${resp.simulado.total} questões. Boa prova! 🍀`);
        return;
    }
    if (resp && resp.simuladoId) {
        mostrarToast(resp.mensagem, 'erro');
        return;
    }
    mostrarToast((resp && resp.mensagem) || 'Não foi possível criar o simulado.', 'erro');
}

// =====================================================================
// 2) PROVA
// =====================================================================
function entrarNaProva(dados) {
    sim.dados = dados;
    sim.dados.respostas = dados.respostas || {};
    sim.atual = Math.max(0, dados.questoes.findIndex((q) => !sim.dados.respostas[q.index]));
    sim.fimEm = Date.now() + dados.restante * 1000;
    sim.finalizando = false;

    $('prova-titulo').textContent = `ENEM ${dados.ano} · ${dados.areaNome}`;
    definirUrl(dados.id);
    mostrarTela('prova');
    desenharNavegacao();
    desenharQuestao();
    clearInterval(sim.relogio);
    sim.relogio = setInterval(tique, 1000);
    tique();
}

function tique() {
    const restante = (sim.fimEm - Date.now()) / 1000;
    $('prova-relogio').textContent = relogio(restante);
    $('prova-timer').classList.toggle('alerta', restante <= 120);
    if (restante <= 0 && !sim.finalizando) {
        clearInterval(sim.relogio);
        mostrarToast('O tempo acabou! Corrigindo seu simulado...', 'erro');
        finalizar();
    }
}

function contarRespondidas() {
    return Object.keys(sim.dados.respostas).length;
}

function desenharNavegacao() {
    const total = sim.dados.questoes.length;
    const feitas = contarRespondidas();
    $('prova-progresso').textContent = `${feitas} de ${total} respondidas`;
    $('prova-barra').style.width = `${Math.round((feitas / total) * 100)}%`;
    $('prova-nav').innerHTML = sim.dados.questoes
        .map((q, i) => {
            const classes = [i === sim.atual ? 'atual' : '', sim.dados.respostas[q.index] ? 'respondida' : ''].join(' ');
            return `<button class="nav-questoes__item ${classes}" data-indice="${i}" aria-label="Questão ${i + 1}${sim.dados.respostas[q.index] ? ' (respondida)' : ''}">${i + 1}</button>`;
        })
        .join('');
}

function desenharQuestao() {
    const q = sim.dados.questoes[sim.atual];
    const area = infoArea(q.discipline);
    const marcada = sim.dados.respostas[q.index];
    const total = sim.dados.questoes.length;

    const alternativas = (q.alternatives || [])
        .map((alt) => {
            const conteudo = [
                alt.text ? markdownParaHtml(alt.text, true) : '',
                alt.file ? `<img class="alternativa__imagem" src="${alt.file}" alt="Alternativa ${alt.letter}" loading="lazy">` : ''
            ].join('');
            return `
            <button type="button" class="alternativa ${marcada === alt.letter ? 'selecionada' : ''}" data-letra="${alt.letter}" aria-pressed="${marcada === alt.letter}">
                <span class="alternativa__letra">${alt.letter}</span>
                <span class="alternativa__texto enem-texto" style="margin:0">${conteudo || '<em>(sem texto)</em>'}</span>
            </button>`;
        })
        .join('');

    $('prova-questao').innerHTML = `
        <div class="enem-questao__topo">
            <span class="enem-questao__numero">Questão ${sim.atual + 1} de ${total}</span>
            <span class="badge enem-questao__area" style="background:${area.cor}"><i class="fa-solid ${area.icone}"></i> ${esc(area.nome)}</span>
            <span class="badge badge-neutral">Nº ${q.index} · ENEM ${q.year}</span>
        </div>
        ${q.context ? `<div class="enem-texto">${markdownParaHtml(q.context)}</div>` : ''}
        ${q.alternativesIntroduction ? `<div class="enem-enunciado enem-texto">${markdownParaHtml(q.alternativesIntroduction)}</div>` : ''}
        <div class="alternativas">${alternativas}</div>
        <div class="simulado-questao__acoes">
            <button class="btn btn-ghost btn-sm" data-nav="-1" ${sim.atual === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left"></i> Anterior</button>
            ${marcada ? '<button class="btn btn-ghost btn-sm" data-limpar><i class="fa-solid fa-eraser"></i> Limpar resposta</button>' : '<span></span>'}
            ${
                sim.atual < total - 1
                    ? '<button class="btn btn-primary btn-sm" data-nav="1">Próxima <i class="fa-solid fa-arrow-right"></i></button>'
                    : '<button class="btn btn-primary btn-sm" data-finalizar><i class="fa-solid fa-flag-checkered"></i> Finalizar</button>'
            }
        </div>`;
}

function irPara(indice) {
    sim.atual = Math.min(Math.max(indice, 0), sim.dados.questoes.length - 1);
    desenharNavegacao();
    desenharQuestao();
    $('prova-questao').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function responder(letra) {
    const q = sim.dados.questoes[sim.atual];
    const anterior = sim.dados.respostas[q.index];
    if (letra) sim.dados.respostas[q.index] = letra;
    else delete sim.dados.respostas[q.index];
    desenharNavegacao();
    desenharQuestao();

    const resp = await API.chamar(`/api/simulados/${sim.dados.id}/responder`, {
        method: 'POST',
        body: JSON.stringify({ numero: q.index, letra: letra || null })
    });
    if (resp && resp.sucesso) return;

    if (resp && resp.tempoEsgotado) {
        clearInterval(sim.relogio);
        mostrarToast('O tempo acabou! Veja seu resultado.', 'erro');
        abrirSimulado(sim.dados.id);
        return;
    }
    // Não salvou: volta como estava
    if (anterior) sim.dados.respostas[q.index] = anterior;
    else delete sim.dados.respostas[q.index];
    desenharNavegacao();
    desenharQuestao();
    mostrarToast((resp && resp.mensagem) || 'Não foi possível salvar a resposta. Verifique sua conexão.', 'erro');
}

function pedirFinalizar() {
    const total = sim.dados.questoes.length;
    const feitas = contarRespondidas();
    $('modal-finalizar-texto').textContent =
        feitas < total
            ? `Você respondeu ${feitas} de ${total} questões. As questões em branco contam como erro.`
            : `Você respondeu todas as ${total} questões. Pronto para ver o resultado?`;
    const modal = $('modal-finalizar');
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('aberto'));
    modal.querySelector('[data-modal-confirmar]').focus();
}

function fecharModal() {
    const modal = $('modal-finalizar');
    modal.classList.remove('aberto');
    setTimeout(() => (modal.hidden = true), 200);
}

async function finalizar() {
    if (sim.finalizando) return;
    sim.finalizando = true;
    fecharModal();
    $('btn-finalizar').disabled = true;
    $('btn-finalizar').innerHTML = '<span class="spinner"></span> Corrigindo...';

    const resp = await API.chamar(`/api/simulados/${sim.dados.id}/finalizar`, { method: 'POST', body: '{}' });
    $('btn-finalizar').disabled = false;
    $('btn-finalizar').innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Finalizar';

    if (!resp || !resp.sucesso) {
        sim.finalizando = false;
        mostrarToast((resp && resp.mensagem) || 'Não foi possível finalizar. Tente de novo.', 'erro');
        return;
    }
    clearInterval(sim.relogio);
    mostrarResultado(resp.resultado);
    Gamificacao.processar(resp.gamificacao);
}

// =====================================================================
// 3) RESULTADO
// =====================================================================
function mostrarResultado(r) {
    sim.dados = null;
    clearInterval(sim.relogio);
    definirUrl(r.id);
    mostrarTela('resultado');

    const nota = Number(r.nota || 0);
    const emoji = nota >= 8 ? '🏆' : nota >= 6 ? '👏' : nota >= 4 ? '📚' : '💪';
    const frase =
        nota >= 8 ? 'Excelente! Você mandou muito bem.' : nota >= 6 ? 'Bom resultado! Continue praticando.' : 'Cada simulado é um treino. Revise as questões abaixo!';

    const areas = r.porArea
        .map((a) => {
            const info = infoArea(a.area);
            const p = a.total ? Math.round((a.acertos / a.total) * 100) : 0;
            return `
            <div class="sim-area-linha">
                <span class="sim-area-linha__icone" style="background:${info.cor}"><i class="fa-solid ${info.icone}"></i></span>
                <span class="sim-area-linha__nome">${esc(info.nome)}</span>
                <span class="progress-bar"><span class="progress-bar__fill" style="width:${p}%;background:${info.cor}"></span></span>
                <b>${a.acertos}/${a.total}</b>
            </div>`;
        })
        .join('');

    const questoes = r.questoes
        .map((q, i) => {
            const area = infoArea(q.discipline);
            const status = !q.respostaAluno ? 'branco' : q.acertou ? 'ok' : 'erro';
            const rotulo = status === 'ok' ? 'Acertou' : status === 'erro' ? `Marcou ${q.respostaAluno} · Certa: ${q.correctAlternative}` : `Em branco · Certa: ${q.correctAlternative}`;
            const alternativas = (q.alternatives || [])
                .map((alt) => {
                    let classe = '';
                    if (alt.letter === q.correctAlternative) classe = 'correta';
                    else if (alt.letter === q.respostaAluno) classe = 'incorreta';
                    const conteudo = [
                        alt.text ? markdownParaHtml(alt.text, true) : '',
                        alt.file ? `<img class="alternativa__imagem" src="${alt.file}" alt="Alternativa ${alt.letter}" loading="lazy">` : ''
                    ].join('');
                    return `
                    <div class="alternativa desabilitada ${classe}">
                        <span class="alternativa__letra">${alt.letter}</span>
                        <span class="alternativa__texto enem-texto" style="margin:0">${conteudo || '<em>(sem texto)</em>'}</span>
                    </div>`;
                })
                .join('');
            return `
            <details class="card sim-correcao">
                <summary>
                    <span class="sim-correcao__icone ${status}"><i class="fa-solid ${status === 'ok' ? 'fa-check' : status === 'erro' ? 'fa-xmark' : 'fa-minus'}"></i></span>
                    <span class="sim-correcao__texto">
                        <strong>${i + 1}. Questão ${q.index} · ${esc(area.nome)}</strong>
                        <span>${rotulo}</span>
                    </span>
                    <i class="fa-solid fa-chevron-down sim-correcao__seta"></i>
                </summary>
                <div class="sim-correcao__corpo">
                    ${q.context ? `<div class="enem-texto">${markdownParaHtml(q.context)}</div>` : ''}
                    ${q.alternativesIntroduction ? `<div class="enem-enunciado enem-texto">${markdownParaHtml(q.alternativesIntroduction)}</div>` : ''}
                    <div class="alternativas">${alternativas}</div>
                </div>
            </details>`;
        })
        .join('');

    $('tela-resultado').innerHTML = `
        <section class="sim-hero">
            <div class="sim-hero__emoji">${emoji}</div>
            <h1>Nota ${nota.toFixed(1)}</h1>
            <p>${frase}</p>
            <span class="sim-hero__sub">ENEM ${r.ano} · ${esc(r.areaNome)}</span>
        </section>
        <div class="resultado-stats sim-stats">
            <div class="card resultado-stat"><i class="fa-solid fa-check-double"></i><strong>${r.acertos}/${r.total}</strong><span>Acertos</span></div>
            <div class="card resultado-stat"><i class="fa-solid fa-pen"></i><strong>${r.respondidas}/${r.total}</strong><span>Respondidas</span></div>
            <div class="card resultado-stat"><i class="fa-solid fa-percent"></i><strong>${r.total ? Math.round((r.acertos / r.total) * 100) : 0}%</strong><span>Aproveitamento</span></div>
            <div class="card resultado-stat"><i class="fa-regular fa-clock"></i><strong>${API.formatarDuracao(r.tempoGasto)}</strong><span>de ${API.formatarDuracao(r.duracao)}</span></div>
        </div>
        <div class="card sim-areas">
            <h3>Acertos por área</h3>
            ${areas}
        </div>
        <div class="section-heading" style="margin-top:26px;">
            <h2>Correção</h2>
            <span class="text-muted" style="font-size:.82rem">Clique em uma questão para ver o gabarito</span>
        </div>
        <div class="sim-correcoes">${questoes}</div>
        <div class="resultado-acoes">
            <a href="/simulado" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Novo simulado</a>
            <a href="/erros" class="btn btn-outline">Caderno de erros</a>
            <a href="/dashboard" class="btn btn-ghost">Voltar ao início</a>
        </div>`;
}

async function abrirSimulado(id) {
    const resp = await API.chamar(`/api/simulados/${encodeURIComponent(id)}`);
    if (!resp || !resp.sucesso) {
        mostrarToast((resp && resp.mensagem) || 'Simulado não encontrado.', 'erro');
        definirUrl(null);
        mostrarTela('config');
        return false;
    }
    if (resp.finalizado) mostrarResultado(resp.resultado);
    else entrarNaProva(resp.simulado);
    return true;
}

// =====================================================================
// INÍCIO
// =====================================================================
document.addEventListener('DOMContentLoaded', async () => {
    $('form-simulado').addEventListener('submit', comecarSimulado);
    $('sim-ano').addEventListener('change', (e) => carregarProvaConfig(e.target.value));
    $('btn-finalizar').addEventListener('click', pedirFinalizar);

    $('prova-nav').addEventListener('click', (e) => {
        const b = e.target.closest('[data-indice]');
        if (b) irPara(Number(b.dataset.indice));
    });
    $('prova-questao').addEventListener('click', (e) => {
        const alt = e.target.closest('.alternativa');
        if (alt) return responder(alt.dataset.letra);
        if (e.target.closest('[data-limpar]')) return responder(null);
        const nav = e.target.closest('[data-nav]');
        if (nav && !nav.disabled) return irPara(sim.atual + Number(nav.dataset.nav));
        if (e.target.closest('[data-finalizar]')) pedirFinalizar();
    });

    const modal = $('modal-finalizar');
    modal.querySelector('[data-modal-cancelar]').addEventListener('click', fecharModal);
    modal.querySelector('[data-modal-confirmar]').addEventListener('click', finalizar);
    modal.addEventListener('click', (e) => e.target === modal && fecharModal());
    document.addEventListener('keydown', (e) => e.key === 'Escape' && !modal.hidden && fecharModal());

    const id = new URLSearchParams(window.location.search).get('id');
    if (id && (await abrirSimulado(id))) {
        iniciarConfig(); // deixa a tela de configuração pronta para depois
        return;
    }
    mostrarTela('config');
    iniciarConfig();
});
