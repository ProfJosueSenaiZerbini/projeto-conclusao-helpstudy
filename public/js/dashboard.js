// =====================================================================
// Lógica da página Dashboard
// =====================================================================

const ICONES_MATERIA = {
    'fa-square-root-variable': 'fa-solid fa-square-root-variable',
    'fa-language': 'fa-solid fa-language',
    'fa-landmark': 'fa-solid fa-landmark',
    'fa-earth-americas': 'fa-solid fa-earth-americas',
    'fa-flask': 'fa-solid fa-flask',
    'fa-comments': 'fa-solid fa-comments',
    'fa-atom': 'fa-solid fa-atom',
    'fa-dna': 'fa-solid fa-dna'
};

function iconeClasse(icone) {
    return ICONES_MATERIA[icone] || 'fa-solid fa-book';
}

function desenharAnelProgresso(percentual) {
    const raio = 46;
    const circunferencia = 2 * Math.PI * raio;
    const offset = circunferencia - (percentual / 100) * circunferencia;
    return `
        <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="${raio}" fill="none" stroke="var(--surface-soft)" stroke-width="12"/>
            <circle cx="60" cy="60" r="${raio}" fill="none" stroke="#5A77DF" stroke-width="12"
                stroke-linecap="round" stroke-dasharray="${circunferencia}" stroke-dashoffset="${offset}"
                transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 1s ease"/>
        </svg>`;
}

// Barras verticais de desempenho (% de acerto por matéria)
function desenharBarrasDesempenho(materias, porMateria) {
    const wrap = document.getElementById('barras-dash');
    const melhorPercentual = document.getElementById('melhor-percentual');
    const melhorNome = document.getElementById('melhor-nome');
    if (!wrap) return;

    const lista = (materias || []).map((m) => {
        const p = (porMateria || []).find((x) => x.slug === m.slug);
        return { nome: m.nome, percentual: p ? Math.round(Number(p.percentual_acerto)) : 0 };
    });

    if (lista.length === 0) {
        wrap.innerHTML = '<div class="empty-state" style="width:100%"><i class="fa-regular fa-chart-bar"></i>Sem dados ainda.</div>';
        return;
    }

    const estudadas = (porMateria || []).filter((p) => Number(p.questoes_respondidas) > 0);
    if (estudadas.length > 0) {
        const melhor = estudadas.reduce((a, b) => (Number(b.percentual_acerto) > Number(a.percentual_acerto) ? b : a));
        melhorPercentual.textContent = `${Math.round(Number(melhor.percentual_acerto))}%`;
        melhorNome.textContent = melhor.materia_nome;
    }

    wrap.innerHTML = lista
        .map(
            (m) => `
        <div class="barra-col">
            <span class="barra-col__valor">${m.percentual}%</span>
            <div class="barra-col__trilho">
                <div class="barra-col__preenchido" style="height:${m.percentual}%"></div>
            </div>
            <span class="barra-col__nome">${m.nome}</span>
        </div>`
        )
        .join('');
}

// Últimas respostas (coluna lateral)
function desenharRecentes(historico) {
    const wrap = document.getElementById('dash-recentes');
    if (!wrap) return;

    if (!historico || historico.length === 0) {
        wrap.innerHTML = '<div class="card empty-state"><i class="fa-regular fa-clock"></i>Você ainda não respondeu nenhuma questão.</div>';
        return;
    }

    wrap.innerHTML = historico
        .slice(0, 3)
        .map(
            (h) => `
        <div class="card recente-item">
            <div class="recente-item__icon ${h.correta ? 'ok' : 'erro'}">
                <i class="fa-solid ${h.correta ? 'fa-check' : 'fa-xmark'}"></i>
            </div>
            <div class="recente-item__text">
                <strong>${h.enunciado}</strong>
                <span><i class="fa-regular fa-clock"></i> ${new Date(h.respondido_em).toLocaleDateString('pt-BR')} · ${h.materia_nome}</span>
            </div>
        </div>`
        )
        .join('');
}

async function carregarDashboard() {
    const gridMaterias = document.getElementById('grid-materias');
    const painelPlano = document.getElementById('mini-plano');
    const painelAnel = document.getElementById('progresso-anel');
    const saudacaoHora = document.getElementById('saudacao-hora');

    const hora = new Date().getHours();
    saudacaoHora.textContent = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

    // Matérias
    const respMaterias = await API.chamar('/api/materias');
    if (respMaterias && respMaterias.sucesso) {
        gridMaterias.innerHTML = respMaterias.materias
            .map(
                (m) => `
            <a class="card materia-card" href="/exercicios?materia=${m.slug}">
                <div class="materia-card__icon" style="background:${m.cor}">
                    <i class="${iconeClasse(m.icone)}"></i>
                </div>
                <div>
                    <h3>${m.nome}</h3>
                    <p>${m.descricao || ''}</p>
                </div>
                <div class="materia-card__footer">
                    <span><i class="fa-regular fa-circle-question"></i> ${m.total_questoes} questões</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </div>
            </a>`
            )
            .join('');
    }

    // Progresso geral
    const respProgresso = await API.chamar('/api/progresso');
    if (respProgresso && respProgresso.sucesso) {
        const { percentual } = respProgresso.geral;
        painelAnel.innerHTML = `
            ${desenharAnelProgresso(percentual)}
            <div class="progress-ring-label">
                <strong>${percentual}%</strong>
                <span>Progresso geral</span>
            </div>`;

        document.getElementById('stat-respondidas').textContent = respProgresso.geral.total;
        document.getElementById('stat-corretas').textContent = respProgresso.geral.corretas;

        desenharBarrasDesempenho(respMaterias && respMaterias.sucesso ? respMaterias.materias : [], respProgresso.porMateria);
        desenharRecentes(respProgresso.historico);
    }

    // Plano de estudos (mini resumo)
    const respPlano = await API.chamar('/api/progresso/plano');
    if (respPlano && respPlano.sucesso) {
        if (respPlano.plano.length === 0) {
            painelPlano.innerHTML = `<div class="empty-state"><i class="fa-regular fa-face-smile"></i>Responda algumas questões para gerar seu plano.</div>`;
        } else {
            painelPlano.innerHTML = respPlano.plano
                .slice(0, 4)
                .map(
                    (p) => `
                <div class="mini-plano-item">
                    <div class="mini-plano-item__icon" style="background:${p.cor}">
                        <i class="${iconeClasse(p.icone)}"></i>
                    </div>
                    <div class="mini-plano-item__text">
                        <strong>${p.materia_nome}</strong>
                        <span>${p.motivo}</span>
                    </div>
                    <span class="badge badge-${p.prioridade === 'alta' ? 'danger' : p.prioridade === 'media' ? 'neutral' : 'success'}">${p.prioridade}</span>
                </div>`
                )
                .join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', carregarDashboard);
