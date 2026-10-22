// =====================================================================
// Lógica da página de Progresso
// Cards do topo, desempenho por matéria (com detalhes), radar,
// calendário de atividade, evolução com filtro, ENEM e conquistas.
// Todos os dados vêm do servidor (/api/progresso).
// =====================================================================

const NOMES_NIVEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const CLASSE_NIVEL = { facil: 'badge-success', medio: 'badge-neutral', dificil: 'badge-danger' };
const graficos = {}; // instâncias do Chart.js (para redesenhar ao trocar o tema)
const dadosGraficos = {};

function esc(t) {
    return API.escapar(t);
}

function iconeClasse(icone) {
    return `fa-solid ${icone || 'fa-book'}`;
}

function formatarDia(dataTexto) {
    const [, m, d] = String(dataTexto).slice(0, 10).split('-');
    return `${d}/${m}`;
}

function somarDias(dataTexto, dias) {
    const d = new Date(String(dataTexto).slice(0, 10) + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().slice(0, 10);
}

// Cores dos gráficos de acordo com o tema (claro/escuro)
function coresGrafico() {
    const css = getComputedStyle(document.documentElement);
    return {
        texto: css.getPropertyValue('--text-muted').trim() || '#5D667C',
        grade: css.getPropertyValue('--border').trim() || '#CCD4DE',
        marca: '#5A77DF'
    };
}

function desenharDonut(percentual) {
    const raio = 60;
    const circunferencia = 2 * Math.PI * raio;
    const offset = circunferencia - (percentual / 100) * circunferencia;

    return `
        <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true">
            <circle cx="80" cy="80" r="${raio}" fill="none" stroke="var(--surface-soft)" stroke-width="16"/>
            <circle cx="80" cy="80" r="${raio}" fill="none" stroke="#5A77DF" stroke-width="16"
                stroke-linecap="round" stroke-dasharray="${circunferencia}" stroke-dashoffset="${offset}"
                transform="rotate(-90 80 80)" style="transition: stroke-dashoffset 1s ease"/>
        </svg>`;
}

// =====================================================================
// CARDS DO TOPO
// =====================================================================
function desenharResumo(resumo, enem) {
    const cards = [
        {
            icone: '<i class="fa-regular fa-circle-question"></i>',
            valor: resumo.total,
            rotulo: 'Questões respondidas',
            extra: enem.total ? `${enem.total} do ENEM` : 'Matérias + ENEM'
        },
        {
            icone: '<i class="fa-solid fa-bullseye"></i>',
            valor: `${resumo.percentual}%`,
            rotulo: 'de acertos',
            extra: `${resumo.corretas} acertos`
        },
        {
            icone: '<i class="fa-regular fa-clock"></i>',
            valor: API.formatarDuracao(resumo.tempoTotal),
            rotulo: 'Tempo estudado',
            extra: 'Tempo nas questões'
        },
        {
            icone: '<span class="resumo-card__fogo">🔥</span>',
            valor: `${resumo.ofensiva} ${resumo.ofensiva === 1 ? 'dia' : 'dias'}`,
            rotulo: 'Ofensiva atual',
            extra: resumo.estudouHoje ? 'Você já estudou hoje ✔' : `Recorde: ${resumo.melhorOfensiva} dia(s)`,
            classe: resumo.ofensiva > 0 ? 'resumo-card--fogo' : ''
        },
        {
            icone: '<i class="fa-solid fa-trophy"></i>',
            valor: resumo.melhorMateria ? esc(resumo.melhorMateria.nome) : '—',
            rotulo: 'Melhor matéria',
            extra: resumo.melhorMateria ? `${resumo.melhorMateria.percentual}% de acerto` : 'Responda questões'
        }
    ];

    document.getElementById('resumo-cards').innerHTML = cards
        .map(
            (c, i) => `
        <div class="card resumo-card ${c.classe || ''}" style="animation-delay:${i * 60}ms">
            <span class="resumo-card__icone">${c.icone}</span>
            <div>
                <strong>${c.valor}</strong>
                <span class="resumo-card__rotulo">${c.rotulo}</span>
                <span class="resumo-card__extra">${c.extra}</span>
            </div>
        </div>`
        )
        .join('');
}

// =====================================================================
// DESEMPENHO POR MATÉRIA (clicável)
// =====================================================================
function desenharMaterias(materias) {
    const wrap = document.getElementById('barras-materia');
    if (!materias.length) {
        wrap.innerHTML = '<div class="empty-state"><i class="fa-regular fa-chart-bar"></i>Nenhuma matéria cadastrada.</div>';
        return;
    }

    wrap.innerHTML = materias
        .map(
            (m) => `
        <button class="materia-linha" data-slug="${esc(m.slug)}" aria-label="Ver detalhes de ${esc(m.nome)}">
            <span class="materia-linha__nome">
                <span class="materia-linha__icone" style="background:${esc(m.cor)}"><i class="${iconeClasse(m.icone)}"></i></span>
                ${esc(m.nome)}
            </span>
            <span class="materia-linha__acerto">
                <span class="progress-bar"><span class="progress-bar__fill" style="width:${m.percentual}%;background:${esc(m.cor)}"></span></span>
                <b>${m.respondidas ? m.percentual + '%' : '—'}</b>
                <small>${m.corretas}/${m.respondidas}</small>
            </span>
            <span class="materia-linha__tempo" title="Tempo médio por questão">${m.tempoMedio !== null ? API.formatarDuracao(m.tempoMedio) : '—'}</span>
            <span class="materia-linha__nivel">${
                m.respondidas ? `<span class="badge ${CLASSE_NIVEL[m.nivel]}">${NOMES_NIVEL[m.nivel]}</span>` : '<span class="text-muted">—</span>'
            }</span>
        </button>`
        )
        .join('');

    wrap.querySelectorAll('.materia-linha').forEach((b) => b.addEventListener('click', () => abrirDetalhes(b.dataset.slug)));
}

// =====================================================================
// RADAR (Chart.js)
// =====================================================================
function desenharRadar(materias) {
    dadosGraficos.radar = materias;
    const ctx = document.getElementById('grafico-radar');
    if (!ctx || !window.Chart) return;
    if (graficos.radar) graficos.radar.destroy();
    const cores = coresGrafico();

    graficos.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: materias.map((m) => m.nome),
            datasets: [
                {
                    label: '% de acerto',
                    data: materias.map((m) => m.percentual),
                    borderColor: cores.marca,
                    backgroundColor: 'rgba(90, 119, 223, 0.2)',
                    pointBackgroundColor: materias.map((m) => m.cor),
                    pointRadius: 4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (c) => {
                            const m = materias[c.dataIndex];
                            return m.respondidas ? ` ${m.percentual}% (${m.corretas} de ${m.respondidas})` : ' Ainda não estudada';
                        }
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 25, display: false },
                    grid: { color: cores.grade },
                    angleLines: { color: cores.grade },
                    pointLabels: { color: cores.texto, font: { size: 11, family: 'Inter' } }
                }
            }
        }
    });
}

// =====================================================================
// CALENDÁRIO DE ATIVIDADE (estilo GitHub, últimos 3 meses)
// =====================================================================
async function carregarCalendario() {
    const wrap = document.getElementById('calendario');
    const resp = await API.chamar('/api/progresso/atividade');
    if (!resp || !resp.sucesso) {
        wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Não foi possível carregar a atividade.</div>';
        return;
    }

    const { hoje, dias } = resp;
    const mapa = new Map(dias.map((d) => [d.dia, d.total]));
    const maximo = Math.max(1, ...dias.map((d) => d.total));
    const diaSemana = (new Date(hoje + 'T12:00:00Z').getUTCDay() + 6) % 7; // 0 = segunda
    const inicio = somarDias(hoje, -diaSemana - 12 * 7);
    const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    let celulas = '';
    let meses = '';
    let mesAnterior = null;
    for (let semana = 0; semana < 13; semana++) {
        const primeiro = somarDias(inicio, semana * 7);
        const mes = Number(primeiro.slice(5, 7)) - 1;
        meses += `<span>${mes !== mesAnterior ? MESES[mes] : ''}</span>`;
        mesAnterior = mes;
        for (let d = 0; d < 7; d++) {
            const data = somarDias(inicio, semana * 7 + d);
            if (data > hoje) {
                celulas += '<i class="futuro"></i>';
                continue;
            }
            const total = mapa.get(data) || 0;
            const nivel = total ? Math.min(4, Math.ceil((total / maximo) * 4)) : 0;
            const texto = `${total} ${total === 1 ? 'questão' : 'questões'} em ${formatarDia(data)}`;
            celulas += `<i class="nv${nivel}${data === hoje ? ' hoje' : ''}" title="${texto}" aria-label="${texto}"></i>`;
        }
    }

    wrap.innerHTML = `
        <div class="calendario__meses" aria-hidden="true"><span></span>${meses}</div>
        <div class="calendario__corpo">
            <div class="calendario__dias" aria-hidden="true"><span>Seg</span><span></span><span>Qua</span><span></span><span>Sex</span><span></span><span></span></div>
            <div class="calendario__grade" role="img" aria-label="Calendário de atividade">${celulas}</div>
        </div>`;

    const diasEstudados = dias.filter((d) => d.total > 0).length;
    document.getElementById('calendario-resumo').textContent = `${diasEstudados} ${diasEstudados === 1 ? 'dia estudado' : 'dias estudados'}`;
}

// =====================================================================
// EVOLUÇÃO (filtro 7 dias / 30 dias / tudo)
// =====================================================================
async function carregarEvolucao(periodo = '7') {
    document.querySelectorAll('.filtro-periodo button').forEach((b) => {
        b.classList.toggle('ativo', b.dataset.periodo === periodo);
        b.setAttribute('aria-pressed', b.dataset.periodo === periodo);
    });
    document.getElementById('titulo-evolucao').textContent =
        periodo === 'tudo' ? 'Evolução desde o início' : `Evolução dos últimos ${periodo} dias`;

    const resp = await API.chamar(`/api/progresso/evolucao?periodo=${periodo}`);
    if (!resp || !resp.sucesso) return;
    dadosGraficos.evolucao = resp.dias;
    desenharEvolucao(resp.dias);
}

function desenharEvolucao(dias) {
    const ctx = document.getElementById('grafico-evolucao');
    const vazio = dias.every((d) => d.total === 0);
    document.getElementById('evolucao-vazio').classList.toggle('hidden', !vazio);
    if (!ctx || !window.Chart) return;
    if (graficos.evolucao) graficos.evolucao.destroy();
    const cores = coresGrafico();

    graficos.evolucao = new Chart(ctx, {
        data: {
            labels: dias.map((d) => formatarDia(d.dia)),
            datasets: [
                {
                    type: 'line',
                    label: '% de acerto',
                    data: dias.map((d) => (d.total ? Math.round((d.corretas / d.total) * 100) : null)),
                    borderColor: cores.marca,
                    backgroundColor: 'rgba(90, 119, 223, 0.15)',
                    fill: true,
                    tension: 0.4,
                    spanGaps: true,
                    pointBackgroundColor: cores.marca,
                    pointRadius: dias.length > 40 ? 0 : 4,
                    yAxisID: 'y'
                },
                {
                    type: 'bar',
                    label: 'Questões respondidas',
                    data: dias.map((d) => d.total),
                    backgroundColor: 'rgba(169, 184, 238, 0.45)',
                    borderRadius: 6,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: true, position: 'bottom', labels: { color: cores.texto, boxWidth: 12, font: { family: 'Inter' } } }
            },
            scales: {
                x: { ticks: { color: cores.texto, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }, grid: { display: false } },
                y: { beginAtZero: true, max: 100, ticks: { color: cores.texto, callback: (v) => v + '%' }, grid: { color: cores.grade } },
                y1: { beginAtZero: true, position: 'right', ticks: { color: cores.texto, precision: 0 }, grid: { display: false } }
            }
        }
    });
}

// =====================================================================
// ENEM POR ÁREA
// =====================================================================
function desenharEnem(enem) {
    const wrap = document.getElementById('enem-areas');
    if (!enem.total) {
        wrap.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-file-pen"></i>
                Você ainda não respondeu questões do ENEM.
                <div style="margin-top:12px"><a href="/enem" class="btn btn-primary btn-sm">Praticar ENEM</a></div>
            </div>`;
        return;
    }
    wrap.innerHTML = `
        <p class="enem-desempenho__geral">${enem.corretas} acertos em ${enem.total} questões (${enem.percentual}%)</p>
        ${enem.porArea
            .map((a) => {
                const p = a.total ? Math.round((a.corretas / a.total) * 100) : 0;
                return `
            <a class="enem-area-linha" href="/enem?area=${encodeURIComponent(a.area || '')}">
                <span class="materia-linha__icone" style="background:${esc(a.cor)}"><i class="fa-solid ${esc(a.icone)}"></i></span>
                <span class="enem-area-linha__nome">${esc(a.nome)}</span>
                <span class="progress-bar"><span class="progress-bar__fill" style="width:${p}%;background:${esc(a.cor)}"></span></span>
                <b>${p}%</b>
                <small>${a.corretas}/${a.total}</small>
            </a>`;
            })
            .join('')}`;
}

// =====================================================================
// HISTÓRICO RECENTE
// =====================================================================
function desenharHistorico(historico) {
    const wrap = document.getElementById('historico-recente');
    if (!historico.length) {
        wrap.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i>Você ainda não respondeu nenhuma questão.</div>';
        return;
    }
    wrap.innerHTML = historico
        .map(
            (h) => `
        <div class="revisao-item">
            <div class="revisao-item__icon ${h.correta ? 'ok' : 'erro'}">
                <i class="fa-solid ${h.correta ? 'fa-check' : 'fa-xmark'}"></i>
            </div>
            <div class="revisao-item__text">
                <strong>${esc(h.enunciado)}</strong>
                <span>${esc(h.materia_nome)} · ${new Date(String(h.respondido_em).replace(' ', 'T')).toLocaleDateString('pt-BR')}</span>
            </div>
        </div>`
        )
        .join('');
}

// =====================================================================
// CARREGAMENTO PRINCIPAL
// =====================================================================
async function carregarProgresso() {
    const resp = await API.chamar('/api/progresso');
    if (!resp || !resp.sucesso) {
        document.getElementById('resumo-cards').innerHTML =
            '<div class="card empty-state" style="grid-column:1/-1"><i class="fa-solid fa-triangle-exclamation"></i>Não foi possível carregar seu progresso. Tente recarregar a página.</div>';
        return;
    }

    desenharResumo(resp.resumo, resp.enem);

    // Donut geral (matérias + ENEM)
    document.getElementById('donut-geral').innerHTML = `
        ${desenharDonut(resp.resumo.percentual)}
        <div class="donut-center">
            <strong>${resp.resumo.percentual}%</strong>
            <span>acerto geral</span>
        </div>`;
    document.getElementById('donut-legenda').textContent = resp.resumo.total
        ? `${resp.resumo.corretas} acertos em ${resp.resumo.total} questões`
        : 'Responda questões para ver seu progresso.';

    desenharMaterias(resp.materias);
    desenharRadar(resp.materias);
    desenharEnem(resp.enem);
    desenharHistorico(resp.historico);
}

// =====================================================================
// CONQUISTAS (desbloqueadas coloridas, bloqueadas com cadeado)
// =====================================================================
async function carregarConquistas() {
    const grid = document.getElementById('conquistas-grid');
    const resp = await API.chamar('/api/progresso/conquistas');
    if (!resp || !resp.sucesso) {
        grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Não foi possível carregar as conquistas.</div>';
        return;
    }

    const todas = resp.todas || [];
    const obtidas = todas.filter((c) => c.desbloqueada).length;
    document.getElementById('conquistas-contagem').textContent = `${obtidas} de ${todas.length} desbloqueadas`;

    grid.innerHTML = todas
        .map((c) => {
            const p = Math.round((c.atual / c.meta) * 100);
            const data = c.obtido_em ? new Date(String(c.obtido_em).replace(' ', 'T')).toLocaleDateString('pt-BR') : '';
            return `
            <div class="card conquista-item ${c.desbloqueada ? 'desbloqueada' : 'bloqueada'}">
                <div class="conquista-item__icone">
                    <i class="fa-solid ${esc(c.icone)}"></i>
                    ${c.desbloqueada ? '' : '<span class="conquista-item__cadeado"><i class="fa-solid fa-lock"></i></span>'}
                </div>
                <strong>${esc(c.titulo)}</strong>
                <span>${esc(c.descricao)}</span>
                ${
                    c.desbloqueada
                        ? `<small class="conquista-item__data"><i class="fa-solid fa-check"></i> ${data}</small>`
                        : `<div class="progress-bar conquista-item__barra"><div class="progress-bar__fill" style="width:${p}%"></div></div>
                           <small class="conquista-item__data">${c.atual}/${c.meta}</small>`
                }
            </div>`;
        })
        .join('');

    // Conquistas liberadas agora (inclusive com dados antigos)
    if (resp.novas && resp.novas.length) Gamificacao.mostrarConquistas(resp.novas);
}

// =====================================================================
// MODAL: DETALHES DA MATÉRIA
// =====================================================================
let ultimoFoco = null;

function fecharModal() {
    const modal = document.getElementById('modal-materia');
    modal.classList.remove('aberto');
    setTimeout(() => (modal.hidden = true), 200);
    if (ultimoFoco) ultimoFoco.focus();
}

async function abrirDetalhes(slug) {
    const modal = document.getElementById('modal-materia');
    const conteudo = document.getElementById('modal-materia-conteudo');
    ultimoFoco = document.activeElement;
    conteudo.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i>Carregando detalhes...</div>';
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('aberto'));
    modal.querySelector('[data-modal-fechar]').focus();

    const r = await API.chamar(`/api/progresso/materias/${encodeURIComponent(slug)}`);
    if (!r || !r.sucesso) {
        conteudo.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>${esc((r && r.mensagem) || 'Erro ao carregar.')}</div>`;
        return;
    }

    const m = r.materia;
    const niveis = r.porNivel
        .map((n) => {
            const p = n.total ? Math.round((n.corretas / n.total) * 100) : 0;
            return `
            <div class="detalhe-nivel">
                <span class="badge ${CLASSE_NIVEL[n.nivel]}">${NOMES_NIVEL[n.nivel]}</span>
                <span class="progress-bar"><span class="progress-bar__fill" style="width:${p}%;background:${esc(m.cor)}"></span></span>
                <b>${n.total ? p + '%' : '—'}</b>
                <small>${n.corretas}/${n.total}${n.tempoMedio !== null ? ' · ' + API.formatarDuracao(n.tempoMedio) : ''}</small>
            </div>`;
        })
        .join('');

    const ultimas = r.ultimas.length
        ? r.ultimas
              .map(
                  (u) => `
            <div class="revisao-item">
                <div class="revisao-item__icon ${u.correta ? 'ok' : 'erro'}"><i class="fa-solid ${u.correta ? 'fa-check' : 'fa-xmark'}"></i></div>
                <div class="revisao-item__text">
                    <strong>${esc(u.enunciado)}</strong>
                    <span>${NOMES_NIVEL[u.nivel] || ''} · ${API.formatarDuracao(u.tempo_gasto)} · ${new Date(String(u.respondido_em).replace(' ', 'T')).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>`
              )
              .join('')
        : '<div class="empty-state"><i class="fa-regular fa-clock"></i>Nenhuma resposta nesta matéria ainda.</div>';

    conteudo.innerHTML = `
        <div class="detalhe-topo">
            <span class="detalhe-topo__icone" style="background:${esc(m.cor)}"><i class="${iconeClasse(m.icone)}"></i></span>
            <div>
                <h2 id="modal-materia-titulo">${esc(m.nome)}</h2>
                <span class="text-muted">Nível atual: <span class="badge ${CLASSE_NIVEL[r.nivelAtual]}">${NOMES_NIVEL[r.nivelAtual]}</span></span>
            </div>
        </div>
        <div class="detalhe-numeros">
            <div><strong>${r.respondidas}</strong><span>respostas</span></div>
            <div><strong>${r.respondidas ? r.percentual + '%' : '—'}</strong><span>de acerto</span></div>
            <div><strong>${r.questoesDiferentes}/${r.questoesDisponiveis}</strong><span>questões vistas</span></div>
        </div>
        <h4 class="detalhe-subtitulo">Acertos por dificuldade</h4>
        ${niveis}
        <h4 class="detalhe-subtitulo">Últimas respostas</h4>
        <div class="detalhe-ultimas">${ultimas}</div>
        <div class="detalhe-acoes">
            <a href="/exercicios?materia=${encodeURIComponent(m.slug)}" class="btn btn-primary"><i class="fa-solid fa-play"></i> Praticar</a>
            <a href="/erros" class="btn btn-ghost">Caderno de erros</a>
        </div>`;
}

// =====================================================================
// INICIALIZAÇÃO
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarProgresso();
    carregarCalendario();
    carregarEvolucao('7');
    carregarConquistas();

    document.querySelectorAll('.filtro-periodo button').forEach((b) => b.addEventListener('click', () => carregarEvolucao(b.dataset.periodo)));

    const modal = document.getElementById('modal-materia');
    modal.querySelector('[data-modal-fechar]').addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => e.target === modal && fecharModal());
    document.addEventListener('keydown', (e) => e.key === 'Escape' && !modal.hidden && fecharModal());

    // Ao trocar o tema, redesenha os gráficos com as cores certas
    new MutationObserver(() => {
        if (dadosGraficos.radar) desenharRadar(dadosGraficos.radar);
        if (dadosGraficos.evolucao) desenharEvolucao(dadosGraficos.evolucao);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});
