<<<<<<< HEAD
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

    document.getElementById('btn-refazer').href = `/exercicios?materia=${materia}`;

    // Histórico recente (para a revisão de questões)
    const resp = await API.chamar('/api/progresso');
    const listaRevisao = document.getElementById('lista-revisao');
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
                    <strong>${h.enunciado}</strong>
                    <span>${h.materia_nome} · ${h.correta ? 'Você acertou' : 'Você errou'} · ${h.tempo_gasto}s</span>
                </div>
            </div>`
            )
            .join('');
    } else {
        listaRevisao.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clipboard"></i>Sem histórico para exibir.</div>';
    }
}

document.addEventListener('DOMContentLoaded', carregarResultado);
=======
const resultado =
JSON.parse(
localStorage.getItem("resultado")
);

if(!resultado){

    window.location.href="dashboard.html";

}

document.getElementById("acertos").innerHTML =
resultado.acertos;

document.getElementById("erros").innerHTML =
resultado.erros;

document.getElementById("nota").innerHTML =
resultado.nota.toFixed(1);

document
.getElementById("voltar")
.onclick=()=>{

window.location.href="dashboard.html";

};
>>>>>>> 2d02819e18d0c0429f28a9337756c2d567c01165
