// =====================================================================
// Lógica da página de Questões do ENEM
// Os dados vêm do nosso backend (/api/enem), que consulta a API enem.dev
// =====================================================================

const estado = {
    provas: [],
    prova: null, // resumo da prova selecionada (áreas, idiomas, totais)
    ano: null,
    idioma: null,
    area: null, // null = todas as áreas
    limite: 10,
    pagina: 1,
    numero: null, // quando o aluno abre uma questão específica
    carregando: false
};

// Questões exibidas na tela (chave -> questão), para corrigir as respostas
const questoesNaTela = {};
// Quando cada questão apareceu na tela (para medir o tempo de resposta)
const exibidaEm = {};

// ---------------------------------------------------------------------
// Respostas do aluno: agora ficam no banco de dados (servidor).
// Cada questão vem com "respostaAluno" (ou null) e o servidor é quem corrige.
// ---------------------------------------------------------------------
function chaveQuestao(q) {
    return `${q.year}-${q.index}-${q.language || ''}`;
}

function atualizarPlacar(placar) {
    if (!placar) return;
    document.getElementById('placar-respondidas').textContent = placar.respondidas;
    document.getElementById('placar-acertos').textContent = placar.acertos;
    document.getElementById('placar-percentual').textContent = `${placar.percentual}%`;
}

async function carregarPlacar() {
    const resp = await chamarBackend('/api/enem/placar');
    if (resp && resp.sucesso) atualizarPlacar(resp.placar);
}

// ---------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------
function mostrarToast(mensagem, tipo = '') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast show ${tipo ? 'toast-' + tipo : ''}`;
    clearTimeout(mostrarToast.timer);
    mostrarToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function infoArea(valor) {
    const areas = (estado.prova && estado.prova.areas) || [];
    return areas.find((a) => a.valor === valor) || { nome: valor || 'Geral', cor: '#5A77DF', icone: 'fa-book' };
}

// Mantém os filtros no endereço da página (permite recarregar e compartilhar)
function atualizarUrl() {
    const params = new URLSearchParams();
    if (estado.ano) params.set('ano', estado.ano);
    if (estado.area) params.set('area', estado.area);
    if (estado.idioma) params.set('idioma', estado.idioma);
    if (estado.limite !== 10) params.set('limite', estado.limite);
    if (estado.numero) params.set('questao', estado.numero);
    else if (estado.pagina > 1) params.set('pagina', estado.pagina);
    history.replaceState(null, '', `/enem?${params}`);
}

function montarConsulta(extra = {}) {
    const params = new URLSearchParams();
    if (estado.idioma) params.set('idioma', estado.idioma);
    if (estado.area) params.set('area', estado.area);
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return params.toString();
}

// Chama o backend; se o servidor estiver fora do ar, devolve um erro amigável
async function chamarBackend(rota, opcoes = { method: 'GET' }) {
    if (opcoes.method === 'POST' && !opcoes.body) opcoes = { ...opcoes, body: '{}' };
    try {
        return await API.chamar(rota, opcoes);
    } catch {
        return { sucesso: false, mensagem: 'Erro de conexão com o servidor.' };
    }
}

function mostrarCarregando(mensagem) {
    document.getElementById('lista-questoes').innerHTML = `
        <div class="card empty-state"><i class="fa-solid fa-spinner fa-spin"></i>${mensagem}</div>`;
    document.getElementById('paginacao').innerHTML = '';
}

function mostrarErro(mensagem, acao) {
    document.getElementById('lista-questoes').innerHTML = `
        <div class="card empty-state">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p style="margin-bottom:14px;">${escaparHtml(mensagem)}</p>
            <button class="btn btn-primary btn-sm" id="btn-tentar">Tentar novamente</button>
        </div>`;
    document.getElementById('paginacao').innerHTML = '';
    document.getElementById('btn-tentar').addEventListener('click', acao);
}

// ---------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------
function desenharFiltros() {
    // Anos
    const selectAno = document.getElementById('filtro-ano');
    selectAno.innerHTML = estado.provas.map((p) => `<option value="${p.ano}">${p.titulo}</option>`).join('');
    selectAno.value = estado.ano;
    selectAno.disabled = false;

    // Idiomas (só existe a partir de 2010)
    const campoIdioma = document.getElementById('campo-idioma');
    const selectIdioma = document.getElementById('filtro-idioma');
    const idiomas = (estado.prova && estado.prova.idiomas) || [];
    if (idiomas.length === 0) {
        selectIdioma.innerHTML = '<option value="">Não se aplica</option>';
        selectIdioma.disabled = true;
    } else {
        selectIdioma.innerHTML = idiomas.map((i) => `<option value="${i.valor}">${i.nome}</option>`).join('');
        selectIdioma.value = estado.idioma;
        selectIdioma.disabled = false;
    }
    campoIdioma.title = idiomas.length === 0 ? 'A prova deste ano não tem questões de língua estrangeira separadas.' : '';

    document.getElementById('filtro-limite').value = String(estado.limite);

    // Áreas
    const areas = (estado.prova && estado.prova.areas) || [];
    const total = (estado.prova && estado.prova.totalQuestoes) || 0;
    const botoes = [
        `<button class="enem-area ${!estado.area ? 'ativa' : ''}" data-area="">
            <span class="enem-area__icone" style="background:var(--brand-dark)"><i class="fa-solid fa-layer-group"></i></span>
            Todas <span class="enem-area__total">${total}</span>
        </button>`,
        ...areas.map(
            (a) => `
        <button class="enem-area ${estado.area === a.valor ? 'ativa' : ''}" data-area="${a.valor}" title="${escaparHtml(a.nomeCompleto)}">
            <span class="enem-area__icone" style="background:${a.cor}"><i class="fa-solid ${a.icone}"></i></span>
            ${escaparHtml(a.nome)} <span class="enem-area__total">${a.total}</span>
        </button>`
        )
    ];
    document.getElementById('filtro-areas').innerHTML = botoes.join('');
}

// ---------------------------------------------------------------------
// Questões
// ---------------------------------------------------------------------
function desenharQuestao(q) {
    const chave = chaveQuestao(q);
    questoesNaTela[chave] = q;
    if (!exibidaEm[chave]) exibidaEm[chave] = Date.now();
    const resposta = q.respostaAluno;
    const area = infoArea(q.discipline);
    const idioma = q.language ? (estado.prova.idiomas.find((i) => i.valor === q.language) || {}).nome : null;

    const alternativas = (q.alternatives || [])
        .map((alt) => {
            let classe = '';
            if (resposta) {
                classe = 'desabilitada';
                if (alt.letter === q.correctAlternative) classe += ' correta';
                else if (alt.letter === resposta.letra) classe += ' incorreta';
            }
            const conteudo = [
                alt.text ? markdownParaHtml(alt.text, true) : '',
                alt.file ? `<img class="alternativa__imagem" src="${alt.file}" alt="Alternativa ${alt.letter}" loading="lazy">` : ''
            ].join('');
            return `
            <button type="button" class="alternativa ${classe}" data-letra="${alt.letter}">
                <span class="alternativa__letra">${alt.letter}</span>
                <span class="alternativa__texto enem-texto" style="margin:0">${conteudo || '<em>(sem texto)</em>'}</span>
            </button>`;
        })
        .join('');

    let status = '';
    let feedback = '';
    if (resposta) {
        if (resposta.revelada) {
            status = '<span class="badge badge-neutral enem-questao__status"><i class="fa-solid fa-eye"></i> Gabarito visto</span>';
            feedback = `<div class="enem-feedback info"><i class="fa-solid fa-circle-info"></i> Resposta correta: alternativa ${q.correctAlternative}.</div>`;
        } else if (resposta.correta) {
            status = '<span class="badge badge-success enem-questao__status"><i class="fa-solid fa-check"></i> Acertou</span>';
            feedback = `<div class="enem-feedback ok"><i class="fa-solid fa-circle-check"></i> Parabéns, você acertou! A resposta é a alternativa ${q.correctAlternative}.</div>`;
        } else {
            status = '<span class="badge badge-danger enem-questao__status"><i class="fa-solid fa-xmark"></i> Errou</span>';
            feedback = `<div class="enem-feedback erro"><i class="fa-solid fa-circle-xmark"></i> Você marcou ${resposta.letra}. A resposta correta é a alternativa ${q.correctAlternative}.</div>`;
        }
    }

    const acoes = resposta
        ? `<button class="btn btn-outline btn-sm" data-acao="refazer"><i class="fa-solid fa-rotate-left"></i> Refazer</button>`
        : `<button class="btn btn-ghost btn-sm" data-acao="revelar"><i class="fa-regular fa-eye"></i> Ver resposta</button>
           <button class="btn btn-primary btn-sm" data-acao="confirmar" disabled>Confirmar resposta <i class="fa-solid fa-check"></i></button>`;

    return `
    <article class="card enem-questao" data-chave="${chave}">
        <div class="enem-questao__topo">
            <span class="enem-questao__numero">Questão ${q.index}</span>
            <span class="badge enem-questao__area" style="background:${area.cor}"><i class="fa-solid ${area.icone}"></i> ${escaparHtml(area.nome)}</span>
            ${idioma ? `<span class="badge badge-neutral"><i class="fa-solid fa-globe"></i> ${escaparHtml(idioma)}</span>` : ''}
            <span class="badge badge-neutral">ENEM ${q.year}</span>
            ${status}
        </div>
        ${q.context ? `<div class="enem-texto">${markdownParaHtml(q.context)}</div>` : ''}
        ${q.alternativesIntroduction ? `<div class="enem-enunciado enem-texto">${markdownParaHtml(q.alternativesIntroduction)}</div>` : ''}
        <div class="alternativas">${alternativas}</div>
        ${feedback}
        <div class="enem-questao__acoes">${acoes}</div>
    </article>`;
}

function desenharLista(questoes, vazio) {
    const lista = document.getElementById('lista-questoes');
    if (!questoes.length) {
        lista.innerHTML = `<div class="card empty-state"><i class="fa-regular fa-folder-open"></i>${vazio}</div>`;
        return;
    }
    lista.innerHTML = questoes.map(desenharQuestao).join('');
}

function redesenharQuestao(chave) {
    const antigo = document.querySelector(`.enem-questao[data-chave="${chave}"]`);
    if (!antigo || !questoesNaTela[chave]) return;
    const temp = document.createElement('div');
    temp.innerHTML = desenharQuestao(questoesNaTela[chave]);
    antigo.replaceWith(temp.firstElementChild);
}

function desenharPaginacao(paginacao) {
    const nav = document.getElementById('paginacao');
    const { pagina, totalPaginas } = paginacao;
    if (totalPaginas <= 1) {
        nav.innerHTML = '';
        return;
    }

    // Mostra a primeira, a última e as páginas próximas da atual
    const numeros = [];
    for (let p = 1; p <= totalPaginas; p++) {
        if (p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1) numeros.push(p);
        else if (numeros[numeros.length - 1] !== '...') numeros.push('...');
    }

    nav.innerHTML = [
        `<button class="enem-pagina" data-pagina="${pagina - 1}" ${pagina === 1 ? 'disabled' : ''} aria-label="Página anterior"><i class="fa-solid fa-chevron-left"></i></button>`,
        ...numeros.map((n) =>
            n === '...'
                ? '<span class="enem-pagina enem-pagina--reticencias">…</span>'
                : `<button class="enem-pagina ${n === pagina ? 'atual' : ''}" data-pagina="${n}">${n}</button>`
        ),
        `<button class="enem-pagina" data-pagina="${pagina + 1}" ${pagina === totalPaginas ? 'disabled' : ''} aria-label="Próxima página"><i class="fa-solid fa-chevron-right"></i></button>`
    ].join('');
}

function atualizarTitulo(texto, info) {
    document.getElementById('titulo-resultado').textContent = texto;
    const chip = document.getElementById('info-resultado');
    chip.textContent = info || '';
    chip.classList.toggle('hidden', !info);
}

// ---------------------------------------------------------------------
// Chamadas ao backend
// ---------------------------------------------------------------------
async function carregarProva() {
    const resp = await chamarBackend(`/api/enem/provas/${estado.ano}?${montarConsulta()}`);
    if (!resp || !resp.sucesso) throw new Error((resp && resp.mensagem) || 'Erro ao carregar a prova.');
    estado.prova = resp.prova;
    estado.idioma = resp.idioma;
    if (estado.area && !estado.prova.areas.some((a) => a.valor === estado.area)) estado.area = null;
    desenharFiltros();
}

async function carregarQuestoes() {
    if (!estado.ano) return;
    estado.numero = null;
    atualizarUrl();
    const area = estado.area ? infoArea(estado.area).nome : 'Todas as áreas';
    atualizarTitulo(`ENEM ${estado.ano} · ${area}`, '');
    mostrarCarregando('Buscando questões na API do ENEM...');

    const resp = await chamarBackend(
        `/api/enem/provas/${estado.ano}/questoes?${montarConsulta({ pagina: estado.pagina, limite: estado.limite })}`
    );
    if (!resp) return;
    if (!resp.sucesso) {
        mostrarErro(resp.mensagem || 'Erro ao buscar questões.', carregarQuestoes);
        return;
    }

    const { pagina, totalPaginas, total, limite } = resp.paginacao;
    estado.pagina = pagina;
    atualizarUrl();
    const inicio = total ? (pagina - 1) * limite + 1 : 0;
    const fim = Math.min(pagina * limite, total);
    atualizarTitulo(`ENEM ${estado.ano} · ${area}`, `${inicio}–${fim} de ${total} questões · página ${pagina} de ${totalPaginas}`);
    desenharLista(resp.questoes, 'Nenhuma questão encontrada com esses filtros.');
    desenharPaginacao(resp.paginacao);
}

async function carregarQuestaoUnica(url, titulo) {
    mostrarCarregando('Buscando questão na API do ENEM...');
    const resp = await chamarBackend(url);
    if (!resp) return;
    if (!resp.sucesso) {
        mostrarToast(resp.mensagem || 'Questão não encontrada.', 'erro');
        await carregarQuestoes();
        return;
    }

    estado.numero = resp.questao.index;
    atualizarUrl();
    atualizarTitulo(titulo(resp.questao), '');
    desenharLista([resp.questao], '');
    document.getElementById('paginacao').innerHTML = `
        <button class="btn btn-outline btn-sm" id="btn-voltar-lista"><i class="fa-solid fa-arrow-left"></i> Voltar para a lista</button>
        <button class="btn btn-primary btn-sm" id="btn-outra-aleatoria"><i class="fa-solid fa-shuffle"></i> Outra aleatória</button>`;
    document.getElementById('btn-voltar-lista').addEventListener('click', carregarQuestoes);
    document.getElementById('btn-outra-aleatoria').addEventListener('click', sortearQuestao);
}

function abrirQuestao(numero) {
    return carregarQuestaoUnica(
        `/api/enem/provas/${estado.ano}/questoes/${numero}?${montarConsulta()}`,
        (q) => `ENEM ${q.year} · Questão ${q.index}`
    );
}

function sortearQuestao() {
    return carregarQuestaoUnica(
        `/api/enem/provas/${estado.ano}/aleatoria?${montarConsulta()}`,
        (q) => `Questão aleatória · ENEM ${q.year}`
    );
}

// Troca de ano/idioma: recarrega a prova e volta para a página 1
async function trocarProva() {
    estado.pagina = 1;
    mostrarCarregando('Carregando prova...');
    try {
        await carregarProva();
        await carregarQuestoes();
    } catch (err) {
        mostrarErro(err.message, trocarProva);
    }
}

// ---------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------
function registrarEventos() {
    document.getElementById('filtro-ano').addEventListener('change', (e) => {
        estado.ano = Number(e.target.value);
        trocarProva();
    });

    document.getElementById('filtro-idioma').addEventListener('change', (e) => {
        estado.idioma = e.target.value || null;
        trocarProva();
    });

    document.getElementById('filtro-limite').addEventListener('change', (e) => {
        estado.limite = Number(e.target.value);
        estado.pagina = 1;
        carregarQuestoes();
    });

    document.getElementById('filtro-areas').addEventListener('click', (e) => {
        const botao = e.target.closest('.enem-area');
        if (!botao) return;
        estado.area = botao.dataset.area || null;
        estado.pagina = 1;
        desenharFiltros();
        carregarQuestoes();
    });

    document.getElementById('form-ir').addEventListener('submit', (e) => {
        e.preventDefault();
        const numero = parseInt(document.getElementById('input-numero').value, 10);
        if (!numero || numero < 1) {
            mostrarToast('Digite o número da questão.', 'erro');
            return;
        }
        abrirQuestao(numero);
    });

    document.getElementById('btn-aleatoria').addEventListener('click', sortearQuestao);
    document.getElementById('btn-simulado').addEventListener('click', () => {
        const params = new URLSearchParams();
        if (estado.ano) params.set('ano', estado.ano);
        if (estado.area) params.set('area', estado.area);
        window.location.href = `/simulado?${params}`;
    });

    document.getElementById('paginacao').addEventListener('click', (e) => {
        const botao = e.target.closest('.enem-pagina[data-pagina]');
        if (!botao || botao.disabled) return;
        estado.pagina = Number(botao.dataset.pagina);
        carregarQuestoes().then(() => window.scrollTo({ top: document.querySelector('.enem-resultado-topo').offsetTop - 10 }));
    });

    document.getElementById('btn-zerar').addEventListener('click', async () => {
        const botao = document.getElementById('btn-zerar');
        botao.disabled = true;
        const resp = await chamarBackend('/api/enem/zerar', { method: 'POST' });
        botao.disabled = false;
        if (!resp || !resp.sucesso) {
            mostrarToast((resp && resp.mensagem) || 'Não foi possível zerar.', 'erro');
            return;
        }
        if (!resp.zeradas) {
            mostrarToast('Você ainda não respondeu questões do ENEM.');
            return;
        }
        // As respostas continuam no histórico (progresso), só somem desta página
        Object.values(questoesNaTela).forEach((q) => {
            q.respostaAluno = null;
            delete q.correctAlternative;
        });
        atualizarPlacar(resp.placar);
        Object.keys(questoesNaTela).forEach(redesenharQuestao);
        mostrarToast('Placar do ENEM zerado. Seu histórico continua no progresso.', 'sucesso');
    });

    // Cliques dentro das questões (selecionar, confirmar, ver resposta, refazer)
    document.getElementById('lista-questoes').addEventListener('click', async (e) => {
        const card = e.target.closest('.enem-questao');
        if (!card) return;
        const chave = card.dataset.chave;
        const questao = questoesNaTela[chave];

        const alternativa = e.target.closest('.alternativa');
        if (alternativa && !alternativa.classList.contains('desabilitada')) {
            card.querySelectorAll('.alternativa').forEach((a) => a.classList.remove('selecionada'));
            alternativa.classList.add('selecionada');
            card.querySelector('[data-acao="confirmar"]').disabled = false;
            return;
        }

        const acao = e.target.closest('[data-acao]');
        if (!acao || acao.disabled) return;
        card.querySelectorAll('[data-acao]').forEach((b) => (b.disabled = true));

        const base = { ano: questao.year, numero: questao.index, idioma: questao.language || estado.idioma };
        let resp;

        if (acao.dataset.acao === 'confirmar') {
            const selecionada = card.querySelector('.alternativa.selecionada');
            if (!selecionada) {
                card.querySelectorAll('[data-acao]').forEach((b) => (b.disabled = false));
                return;
            }
            const tempoGasto = Math.round((Date.now() - (exibidaEm[chave] || Date.now())) / 1000);
            resp = await chamarBackend('/api/enem/responder', {
                method: 'POST',
                body: JSON.stringify({ ...base, letra: selecionada.dataset.letra, tempoGasto })
            });
            if (resp && resp.sucesso) {
                mostrarToast(
                    resp.correta ? 'Resposta correta! 🎉' : `Não foi dessa vez. A correta é a ${resp.respostaCorreta}.`,
                    resp.correta ? 'sucesso' : 'erro'
                );
                Gamificacao.processar(resp.gamificacao);
            }
        } else if (acao.dataset.acao === 'revelar') {
            resp = await chamarBackend('/api/enem/responder', { method: 'POST', body: JSON.stringify({ ...base, revelar: true }) });
        } else if (acao.dataset.acao === 'refazer') {
            resp = await chamarBackend('/api/enem/refazer', {
                method: 'POST',
                body: JSON.stringify({ ...base, idioma: questao.language || '' })
            });
        }

        if (!resp || !resp.sucesso) {
            mostrarToast((resp && resp.mensagem) || 'Não foi possível salvar. Tente de novo.', 'erro');
            card.querySelectorAll('[data-acao]').forEach((b) => (b.disabled = false));
            return;
        }

        if (acao.dataset.acao === 'refazer') {
            questao.respostaAluno = null;
            delete questao.correctAlternative;
            exibidaEm[chave] = Date.now();
        } else {
            questao.respostaAluno = resp.respostaAluno;
            questao.correctAlternative = resp.respostaCorreta;
        }
        atualizarPlacar(resp.placar);
        redesenharQuestao(chave);
    });
}

// ---------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------
async function iniciar() {
    carregarPlacar();

    const params = new URLSearchParams(window.location.search);
    estado.area = params.get('area') || null;
    estado.idioma = params.get('idioma') || null;
    estado.limite = [5, 10, 20, 30].includes(Number(params.get('limite'))) ? Number(params.get('limite')) : 10;
    estado.pagina = Math.max(parseInt(params.get('pagina'), 10) || 1, 1);

    mostrarCarregando('Carregando provas do ENEM...');
    const resp = await chamarBackend('/api/enem/provas');
    if (!resp) return;
    if (!resp.sucesso || !resp.provas.length) {
        mostrarErro((resp && resp.mensagem) || 'Não foi possível carregar as provas do ENEM.', iniciar);
        return;
    }

    estado.provas = resp.provas;
    const anos = resp.provas.map((p) => p.ano);
    document.getElementById('faixa-anos').textContent = `${Math.min(...anos)} a ${Math.max(...anos)}`;
    const anoUrl = Number(params.get('ano'));
    estado.ano = anos.includes(anoUrl) ? anoUrl : Math.max(...anos);

    try {
        await carregarProva();
    } catch (err) {
        mostrarErro(err.message, iniciar);
        return;
    }

    const numeroUrl = parseInt(params.get('questao'), 10);
    if (numeroUrl) await abrirQuestao(numeroUrl);
    else await carregarQuestoes();
}

document.addEventListener('DOMContentLoaded', () => {
    registrarEventos();
    iniciar();
});
