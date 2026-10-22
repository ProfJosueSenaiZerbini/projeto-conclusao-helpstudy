// =====================================================================
// Lógica da página de Plano de Estudos
// Tarefas com "concluído", meta diária, semana (seg–dom) e sugestões
// do ENEM. Tudo vem do servidor (/api/progresso/plano).
// =====================================================================

const ICONES_MATERIA = {
    'fa-square-root-variable': 'fa-solid fa-square-root-variable',
    'fa-language': 'fa-solid fa-language',
    'fa-landmark': 'fa-solid fa-landmark',
    'fa-earth-americas': 'fa-solid fa-earth-americas',
    'fa-flask': 'fa-solid fa-flask',
    'fa-comments': 'fa-solid fa-comments',
    'fa-atom': 'fa-solid fa-atom',
    'fa-dna': 'fa-solid fa-dna',
    'fa-brain': 'fa-solid fa-brain',
    'fa-users': 'fa-solid fa-users'
};

function iconeClasse(icone) {
    return ICONES_MATERIA[icone] || 'fa-solid fa-book';
}

function esc(t) {
    return API.escapar(t);
}

function badgePrioridade(prioridade) {
    const mapa = {
        alta: { classe: 'badge-danger', texto: 'Prioridade alta' },
        media: { classe: 'badge-neutral', texto: 'Prioridade média' },
        baixa: { classe: 'badge-success', texto: 'Prioridade baixa' }
    };
    return mapa[prioridade] || mapa.media;
}

// Explicação com os números atuais do aluno
function explicacao(p) {
    if (!p.respondidas) return `Você ainda não respondeu nenhuma questão de ${p.materia_nome}. Comece por aqui!`;
    const numeros = `Você acertou ${p.corretas} de ${p.respondidas} questões de ${p.materia_nome} (${p.percentual}%).`;
    if (p.percentual < 50) return `${numeros} Vamos reforçar esse conteúdo.`;
    if (p.percentual < 80) return `${numeros} Está indo bem, dá para melhorar.`;
    return `${numeros} Ótimo! Revise de vez em quando.`;
}

function desenharAnel(feitas, meta) {
    const raio = 34;
    const circ = 2 * Math.PI * raio;
    const fracao = Math.min(feitas / meta, 1);
    const cor = fracao >= 1 ? 'var(--success)' : '#5A77DF';
    return `
        <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="${raio}" fill="none" stroke="var(--surface-soft)" stroke-width="9"/>
            <circle cx="44" cy="44" r="${raio}" fill="none" stroke="${cor}" stroke-width="9" stroke-linecap="round"
                stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - fracao)}" transform="rotate(-90 44 44)"
                style="transition: stroke-dashoffset .8s ease"/>
        </svg>
        <span class="meta-card__numero">${fracao >= 1 ? '<i class="fa-solid fa-check"></i>' : `${feitas}/${meta}`}</span>`;
}

// ---------------------------------------------------------------------
// Partes da página
// ---------------------------------------------------------------------
function desenharResumo(resumo) {
    const { concluidas, total } = resumo;
    const p = total ? Math.round((concluidas / total) * 100) : 0;
    document.getElementById('plano-contagem').textContent = `${concluidas} de ${total} concluídas`;
    document.getElementById('plano-barra').style.width = `${p}%`;
    document.getElementById('plano-contagem-texto').textContent =
        total && concluidas === total
            ? 'Plano completo! Clique em "Atualizar plano" para gerar um novo. 🎉'
            : `${p}% do seu plano feito`;
}

function desenharMeta(meta) {
    if (!meta) return;
    document.getElementById('meta-anel').innerHTML = desenharAnel(meta.feitas, meta.meta);
    document.getElementById('meta-texto').textContent =
        meta.feitas >= meta.meta ? `Meta de hoje cumprida! (${meta.feitas} questões)` : `${meta.feitas} de ${meta.meta} questões hoje`;
    const input = document.getElementById('input-meta');
    if (document.activeElement !== input) input.value = meta.meta;
}

function desenharTarefas(plano) {
    const lista = document.getElementById('plano-lista');
    if (!plano.length) {
        lista.innerHTML = `<div class="card empty-state"><i class="fa-regular fa-face-smile"></i>Responda algumas questões para gerarmos seu plano personalizado.</div>`;
        return;
    }

    lista.innerHTML = plano
        .map((p) => {
            const badge = badgePrioridade(p.prioridade);
            return `
            <div class="card plano-item ${p.concluido ? 'concluido' : ''}" data-id="${p.id}">
                <button class="plano-check" data-concluir="${p.id}" role="checkbox" aria-checked="${p.concluido}"
                    aria-label="${p.concluido ? 'Desmarcar' : 'Marcar'} ${esc(p.materia_nome)} como concluída">
                    <i class="fa-solid fa-check"></i>
                </button>
                <div class="plano-item__icon" style="background:${esc(p.cor)}">
                    <i class="${iconeClasse(p.icone)}"></i>
                </div>
                <div class="plano-item__text">
                    <strong>${esc(p.materia_nome)}</strong>
                    <span>${esc(explicacao(p))}</span>
                    ${p.respondidas ? `<div class="progress-bar plano-item__barra"><div class="progress-bar__fill" style="width:${p.percentual}%;background:${esc(p.cor)}"></div></div>` : ''}
                </div>
                <span class="badge ${badge.classe} plano-item__prioridade">${badge.texto}</span>
                <a href="/exercicios?materia=${encodeURIComponent(p.slug)}" class="btn btn-primary btn-sm">Estudar agora</a>
            </div>`;
        })
        .join('');
}

function desenharSemana(semana) {
    const grid = document.getElementById('semana-grid');
    if (!semana || !semana.length) {
        grid.innerHTML = '';
        return;
    }
    grid.innerHTML = semana
        .map((d) => {
            const [, mes, dia] = d.data.split('-');
            let status;
            if (d.feito) status = `<span class="semana-dia__status ok"><i class="fa-solid fa-check"></i> ${d.questoesFeitas} feita(s)</span>`;
            else if (d.hoje) status = '<span class="semana-dia__status hoje">Hoje</span>';
            else if (d.passado) status = '<span class="semana-dia__status perdido">Não estudou</span>';
            else status = '<span class="semana-dia__status">Pendente</span>';

            const conteudo =
                d.tipo === 'revisao'
                    ? `<a class="semana-dia__materia" href="/erros" style="--cor:#E5485D">
                           <i class="fa-solid fa-book-bookmark"></i> Revisão: caderno de erros
                       </a>
                       <a class="semana-dia__extra" href="/simulado">ou um simulado do ENEM</a>`
                    : `<a class="semana-dia__materia" href="/exercicios?materia=${encodeURIComponent(d.materia.slug)}" style="--cor:${esc(d.materia.cor)}">
                           <i class="${iconeClasse(d.materia.icone)}"></i> ${esc(d.materia.nome)}
                       </a>
                       <span class="semana-dia__extra">${badgePrioridade(d.materia.prioridade).texto}</span>`;

            return `
            <div class="card semana-dia ${d.hoje ? 'hoje' : ''} ${d.feito ? 'feito' : ''}">
                <div class="semana-dia__topo">
                    <strong>${d.nome}</strong>
                    <span>${dia}/${mes}</span>
                </div>
                ${conteudo}
                ${status}
            </div>`;
        })
        .join('');
}

function desenharSugestoesEnem(sugestoes) {
    const wrap = document.getElementById('sugestoes-enem');
    if (!sugestoes || !sugestoes.length) {
        wrap.innerHTML = `
            <div class="card empty-state">
                <i class="fa-solid fa-file-pen"></i>
                Responda questões das matérias ou do ENEM para receber sugestões.
                <div style="margin-top:12px"><a href="/enem" class="btn btn-primary btn-sm">Praticar ENEM</a></div>
            </div>`;
        return;
    }
    wrap.innerHTML = sugestoes
        .map(
            (s) => `
        <div class="card sugestao-enem">
            <span class="sugestao-enem__icone" style="background:${esc(s.cor)}"><i class="fa-solid ${esc(s.icone)}"></i></span>
            <div class="sugestao-enem__texto">
                <strong>${esc(s.nome)}</strong>
                <span>${esc(s.texto)}</span>
            </div>
            <div class="sugestao-enem__acoes">
                <a href="/enem?area=${encodeURIComponent(s.area)}" class="btn btn-outline btn-sm">Praticar questões</a>
                <a href="/simulado?area=${encodeURIComponent(s.area)}" class="btn btn-primary btn-sm"><i class="fa-solid fa-stopwatch"></i> Simulado</a>
            </div>
        </div>`
        )
        .join('');
}

function desenharTudo(resp) {
    desenharResumo(resp.resumo);
    desenharMeta(resp.meta);
    desenharTarefas(resp.plano);
    desenharSemana(resp.semana);
    desenharSugestoesEnem(resp.sugestoesEnem);
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.className = `toast toast-${tipo}`;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(mostrarToast.timer);
    mostrarToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ---------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------
async function carregarPlano() {
    const lista = document.getElementById('plano-lista');
    const resp = await API.chamar('/api/progresso/plano');

    if (!resp || !resp.sucesso) {
        lista.innerHTML = `<div class="card empty-state"><i class="fa-solid fa-triangle-exclamation"></i>${esc((resp && resp.mensagem) || 'Não foi possível carregar o plano.')}</div>`;
        return;
    }
    desenharTudo(resp);
}

async function regerarPlano() {
    const botao = document.getElementById('btn-regerar');
    const original = botao.innerHTML;
    botao.innerHTML = '<span class="spinner" style="border-color:var(--border);border-top-color:var(--brand)"></span> Gerando...';
    botao.disabled = true;

    const resp = await API.chamar('/api/progresso/plano/gerar', { method: 'POST' });
    if (resp && resp.sucesso) {
        desenharTudo(resp);
        mostrarToast('Plano atualizado com o seu desempenho de agora!');
    } else {
        mostrarToast('Não foi possível atualizar o plano.', 'erro');
    }

    botao.innerHTML = original;
    botao.disabled = false;
}

async function alternarConcluido(botao) {
    const id = botao.dataset.concluir;
    const concluido = botao.getAttribute('aria-checked') !== 'true';
    const item = botao.closest('.plano-item');

    // Mostra na hora e confirma com o servidor
    item.classList.toggle('concluido', concluido);
    botao.setAttribute('aria-checked', String(concluido));
    botao.disabled = true;

    const resp = await API.chamar(`/api/progresso/plano/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ concluido })
    });
    botao.disabled = false;

    if (!resp || !resp.sucesso) {
        item.classList.toggle('concluido', !concluido);
        botao.setAttribute('aria-checked', String(!concluido));
        mostrarToast((resp && resp.mensagem) || 'Não foi possível salvar.', 'erro');
        return;
    }
    desenharResumo(resp.resumo);
    desenharSemana(resp.semana);
    if (concluido) {
        mostrarToast('Tarefa concluída! ✅');
        if (resp.resumo.concluidas === resp.resumo.total) {
            Gamificacao.Mascote.falar('Você concluiu todas as tarefas do plano! 🎉 Atualize o plano para receber novas.', 'festa');
        }
    }
}

async function salvarMeta(e) {
    e.preventDefault();
    const input = document.getElementById('input-meta');
    const meta = parseInt(input.value, 10);
    if (!meta || meta < 1 || meta > 200) {
        mostrarToast('Escolha uma meta entre 1 e 200 questões.', 'erro');
        return;
    }
    const botao = e.target.querySelector('button');
    botao.disabled = true;
    const resp = await API.chamar('/api/gamificacao/meta', { method: 'PUT', body: JSON.stringify({ meta }) });
    botao.disabled = false;
    if (!resp || !resp.sucesso) {
        mostrarToast((resp && resp.mensagem) || 'Não foi possível salvar a meta.', 'erro');
        return;
    }
    input.blur();
    desenharMeta(resp.gamificacao.hoje);
    Gamificacao.processar(resp.gamificacao);
    mostrarToast(`Meta salva: ${meta} questões por dia.`);
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPlano();
    document.getElementById('btn-regerar').addEventListener('click', regerarPlano);
    document.getElementById('form-meta').addEventListener('submit', salvarMeta);
    document.getElementById('plano-lista').addEventListener('click', (e) => {
        const botao = e.target.closest('[data-concluir]');
        if (botao && !botao.disabled) alternarConcluido(botao);
    });
});
