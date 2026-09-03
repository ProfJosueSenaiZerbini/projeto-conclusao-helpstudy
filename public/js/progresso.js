// =====================================================================
// Lógica da página de Progresso
// =====================================================================

function desenharDonut(percentual) {
    const raio = 60;
    const circunferencia = 2 * Math.PI * raio;
    const offset = circunferencia - (percentual / 100) * circunferencia;

    return `
        <svg width="160" height="160" viewBox="0 0 160 160">
            <circle 
                cx="80" 
                cy="80" 
                r="${raio}" 
                fill="none" 
                stroke="var(--surface-soft)" 
                stroke-width="16"
            />

            <circle 
                cx="80" 
                cy="80" 
                r="${raio}" 
                fill="none" 
                stroke="#0D6EFD" 
                stroke-width="16"
                stroke-linecap="round" 
                stroke-dasharray="${circunferencia}" 
                stroke-dashoffset="${offset}"
                transform="rotate(-90 80 80)"
                style="transition: stroke-dashoffset 1s ease"
            />
        </svg>`;
}


async function carregarProgresso() {

    const resp = await API.chamar('/api/progresso');

    if (!resp || !resp.sucesso) return;


    // =================================================================
    // DONUT GERAL
    // =================================================================

    const donutWrap = document.getElementById('donut-geral');

    donutWrap.innerHTML = `
        ${desenharDonut(resp.geral.percentual)}

        <div class="donut-center">
            <strong>${resp.geral.percentual}%</strong>
            <span>acerto geral</span>
        </div>
    `;


    // =================================================================
    // DESEMPENHO POR MATÉRIA
    // =================================================================

    const barrasWrap = document.getElementById('barras-materia');

    if (resp.porMateria.length === 0) {

        barrasWrap.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-chart-bar"></i>
                Responda questões para ver seu desempenho por matéria.
            </div>
        `;

    } else {

        barrasWrap.innerHTML = resp.porMateria
            .map(
                (m) => `
                <div class="materia-bar-row">

                    <span class="materia-bar-row__label">
                        ${m.materia_nome}
                    </span>

                    <div class="progress-bar">
                        <div 
                            class="progress-bar__fill"
                            style="
                                width:${m.percentual_acerto}%;
                                background:${m.cor}
                            ">
                        </div>
                    </div>

                    <span class="materia-bar-row__value">
                        ${Math.round(m.percentual_acerto)}%
                    </span>

                </div>
            `
            )
            .join('');
    }


    // =================================================================
    // EVOLUÇÃO — GRÁFICO DE LINHA
    // =================================================================

    const dias = resp.evolucao.map(
        (e) =>
            new Date(e.dia + 'T00:00:00')
                .toLocaleDateString(
                    'pt-BR',
                    {
                        day: '2-digit',
                        month: '2-digit'
                    }
                )
    );

    const percentuais = resp.evolucao.map(
        (e) =>
            e.total > 0
                ? Math.round((e.corretas / e.total) * 100)
                : 0
    );


    const ctx = document.getElementById('grafico-evolucao');

    if (ctx && window.Chart) {

        new Chart(ctx, {

            type: 'line',

            data: {

                labels: dias.length
                    ? dias
                    : ['Sem dados'],

                datasets: [

                    {
                        label: '% de acerto',

                        data: percentuais.length
                            ? percentuais
                            : [0],

                        /* AZUL */
                        borderColor: '#0D6EFD',

                        /* Fundo azul suave */
                        backgroundColor:
                            'rgba(13, 110, 253, 0.10)',

                        fill: true,

                        tension: 0.4,

                        /* Pontos azuis */
                        pointBackgroundColor: '#0D6EFD',

                        pointBorderColor: '#0D6EFD',

                        pointRadius: 4
                    }

                ]
            },

            options: {

                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {

                    y: {
                        beginAtZero: true,

                        max: 100,

                        ticks: {
                            callback: (v) => v + '%'
                        }
                    }

                }
            }
        });
    }


    // =================================================================
    // HISTÓRICO RECENTE
    // =================================================================

    const historicoWrap =
        document.getElementById('historico-recente');


    if (resp.historico.length === 0) {

        historicoWrap.innerHTML = `
            <div class="empty-state">

                <i class="fa-regular fa-clock"></i>

                Você ainda não respondeu nenhuma questão.

            </div>
        `;

    } else {

        historicoWrap.innerHTML = resp.historico
            .map(
                (h) => `
                <div class="revisao-item">

                    <div class="revisao-item__icon ${
                        h.correta
                            ? 'ok'
                            : 'erro'
                    }">

                        <i class="fa-solid ${
                            h.correta
                                ? 'fa-check'
                                : 'fa-xmark'
                        }"></i>

                    </div>

                    <div class="revisao-item__text">

                        <strong>
                            ${h.enunciado}
                        </strong>

                        <span>
                            ${h.materia_nome}
                            ·
                            ${new Date(
                                h.respondido_em
                            ).toLocaleDateString('pt-BR')}
                        </span>

                    </div>

                </div>
            `
            )
            .join('');
    }
}


// =====================================================================
// CONQUISTAS
// =====================================================================

async function carregarConquistas() {
    try {
        const resp = await API.chamar('/api/progresso/conquistas');

        console.log('Resposta das conquistas:', resp);

        const grid = document.getElementById('conquistas-grid');

        if (!grid) {
            console.error('Elemento #conquistas-grid não encontrado!');
            return;
        }

        const todasConquistas = [
            {
                codigo: 'primeira_questao',
                titulo: 'Primeiro Passo',
                descricao: 'Respondeu a 1ª questão',
                icone: 'fa-shoe-prints'
            },
            {
                codigo: 'dez_acertos',
                titulo: 'Em Chamas',
                descricao: '10 acertos seguidos',
                icone: 'fa-fire'
            },
            {
                codigo: 'materia_completa',
                titulo: 'Dedicação Total',
                descricao: 'Completou uma matéria',
                icone: 'fa-trophy'
            },
            {
                codigo: 'semana_ativa',
                titulo: 'Constância',
                descricao: '7 dias seguidos',
                icone: 'fa-calendar-check'
            }
        ];

        const obtidas = resp?.conquistas || [];

        console.log('Conquistas obtidas:', obtidas);

        const codigosObtidos = obtidas.map(c => c.codigo);

        grid.innerHTML = todasConquistas.map(c => {
            const desbloqueada = codigosObtidos.includes(c.codigo);

            return `
                <div class="card conquista-item ${desbloqueada ? '' : 'bloqueada'}">
                    <i class="fa-solid ${c.icone}"></i>

                    <strong>${c.titulo}</strong>

                    <span>${c.descricao}</span>
                </div>
            `;
        }).join('');

    } catch (erro) {
        console.error('Erro ao carregar conquistas:', erro);
    }
}



// =====================================================================
// INICIALIZAÇÃO
// =====================================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        carregarProgresso();

        carregarConquistas();

    }
);