// =====================================================================
// Lógica da página Dashboard
// =====================================================================

const ICONES_MATERIA = {
    'fa-square-root-variable': 'fa-solid fa-square-root-variable',
    'fa-language': 'fa-solid fa-language',
    'fa-landmark': 'fa-solid fa-landmark',
    'fa-earth-americas': 'fa-solid fa-earth-americas',
    'fa-flask': 'fa-solid fa-flask',
    'fa-comments': 'fa-solid fa-comments'
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
            <circle cx="60" cy="60" r="${raio}" fill="none" stroke="#0D6EFD" stroke-width="12"
                stroke-linecap="round" stroke-dasharray="${circunferencia}" stroke-dashoffset="${offset}"
                transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 1s ease"/>
            <defs>
                <linearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4DA3FF"/>
                    <stop offset="100%" stop-color="#0D6EFD"/>
                </linearGradient>
            </defs>
        </svg>`;
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
