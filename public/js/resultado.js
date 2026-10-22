// =====================================================================
// Lógica da página de Resultado
// =====================================================================

function formatarTempo(segundos) {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}min ${s}s`;
}

function mensagemPorDesempenho(percentual) {
    if (percentual >= 80) return { emoji: '🏆', titulo: 'Excelente trabalho!', texto: 'Você dominou bem esse conteúdo. Continue assim!' };
    if (percentual >= 50) return { emoji: '👏', titulo: 'Bom progresso!', texto: 'Você está no caminho certo. Vamos reforçar alguns pontos.' };
    return { emoji: '💪', titulo: 'Continue praticando!', texto: 'Errar faz parte do aprendizado. Vamos estudar mais esse tema juntos.' };
}

async function carregarResultado() {
    const dadosSalvos = sessionStorage.getItem('helpstudy_ultimo_resultado');
    if (!dadosSalvos) {
        window.location.href = '/dashboard';
        return;
    }
    const { total, corretas, tempo, materia } = JSON.parse(dadosSalvos);
    const percentual = total > 0 ? Math.round((corretas / total) * 100) : 0;
    const notaDez = total > 0 ? (corretas / total) * 10 : 0;

    const msg = mensagemPorDesempenho(percentual);
    document.getElementById('resultado-emoji').textContent = msg.emoji;
    document.getElementById('resultado-titulo').textContent = msg.titulo;
    document.getElementById('resultado-texto').textContent = msg.texto;

    document.getElementById('stat-nota').textContent = notaDez.toFixed(1);
    document.getElementById('stat-acertos').textContent = `${corretas}/${total}`;
    document.getElementById('stat-percentual').textContent = `${percentual}%`;
    document.getElementById('stat-tempo').textContent = formatarTempo(tempo);

    const dados = JSON.parse(dadosSalvos);
    document.getElementById('btn-refazer').href =
        dados.modo === 'erros'
            ? `/exercicios?modo=erros${materia ? '&materia=' + encodeURIComponent(materia) : ''}`
            : `/exercicios?materia=${encodeURIComponent(materia)}`;

    if (dados.xp) {
        const xp = document.getElementById('resultado-xp');
        xp.textContent = `+${dados.xp} XP nesta atividade`;
        xp.classList.remove('hidden');
    }

    const listaRevisao = document.getElementById('lista-revisao');

    // Revisão exata da atividade: o servidor devolve as respostas desta sessão
    if (dados.respostaIds && dados.respostaIds.length) {
        const resp = await API.chamar(`/api/progresso/revisao?respostas=${dados.respostaIds.join(',')}`);
        if (resp && resp.sucesso && resp.itens.length) {
            listaRevisao.innerHTML = resp.itens.map(desenharItemRevisao).join('');
            return;
        }
        listaRevisao.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clipboard"></i>Não foi possível carregar a revisão.</div>';
        return;
    }

    // Atividade antiga (sem os ids): usa o histórico recente, como antes
    const resp = await API.chamar('/api/progresso');
    if (resp && resp.sucesso && resp.historico.length > 0) {
        listaRevisao.innerHTML = resp.historico
            .slice(0, total)
            .map(
                (h) => `
            <div class="revisao-item">
                <div class="revisao-item__icon ${h.correta ? 'ok' : 'erro'}">
                    <i class="fa-solid ${h.correta ? 'fa-check' : 'fa-xmark'}"></i>
                </div>
                <div class="revisao-item__text">
                    <strong>${API.escapar(h.enunciado)}</strong>
                    <span>${API.escapar(h.materia_nome)} · ${h.correta ? 'Você acertou' : 'Você errou'} · ${h.tempo_gasto}s</span>
                </div>
            </div>`
            )
            .join('');
    } else {
        listaRevisao.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clipboard"></i>Sem histórico para exibir.</div>';
    }
}

// Uma questão da revisão: o que o aluno marcou, o gabarito e a explicação
function desenharItemRevisao(item, i) {
    const esc = API.escapar;
    const alternativas = ['a', 'b', 'c', 'd']
        .map((l) => {
            let classe = '';
            let rotulo = '';
            if (l === item.gabarito) {
                classe = 'correta';
                rotulo = '<span class="revisao-alt__tag">Resposta certa</span>';
            }
            if (l === item.alternativa_marcada && !item.correta) {
                classe = 'incorreta';
                rotulo = '<span class="revisao-alt__tag">Sua resposta</span>';
            }
            if (l === item.alternativa_marcada && item.correta) rotulo = '<span class="revisao-alt__tag">Sua resposta ✔</span>';
            return `
            <div class="revisao-alt ${classe}">
                <span class="alternativa__letra">${l.toUpperCase()}</span>
                <span>${esc(item['alternativa_' + l])}</span>
                ${rotulo}
            </div>`;
        })
        .join('');

    return `
    <details class="revisao-detalhe" ${!item.correta ? 'open' : ''}>
        <summary class="revisao-item">
            <div class="revisao-item__icon ${item.correta ? 'ok' : 'erro'}">
                <i class="fa-solid ${item.correta ? 'fa-check' : 'fa-xmark'}"></i>
            </div>
            <div class="revisao-item__text">
                <strong>${i + 1}. ${esc(item.enunciado)}</strong>
                <span>${esc(item.materia_nome)} · Você marcou ${item.alternativa_marcada.toUpperCase()}${
                    item.correta ? ' (acertou)' : ` · Certa: ${item.gabarito.toUpperCase()}`
                } · ${formatarTempo(item.tempo_gasto)}</span>
            </div>
            <i class="fa-solid fa-chevron-down revisao-detalhe__seta"></i>
        </summary>
        <div class="revisao-detalhe__corpo">
            ${alternativas}
            ${item.explicacao ? `<div class="revisao-explicacao"><strong>Explicação:</strong> ${esc(item.explicacao)}</div>` : ''}
        </div>
    </details>`;
}

document.addEventListener('DOMContentLoaded', carregarResultado);
