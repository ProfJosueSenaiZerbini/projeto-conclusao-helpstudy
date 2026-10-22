// =====================================================================
// Lógica da página de Exercícios
// =====================================================================

let questoes = [];
let indiceAtual = 0;
let alternativaSelecionada = null;
let respondida = false;
let resultados = []; // { questaoId, correta, marcada, respostaId }
let tempoInicioQuestao = null;
let cronometroInterval = null;
let segundosTotais = 0;
let acertosSeguidos = 0; // para o mascote comemorar
let xpDaSessao = 0;
let enviando = false;

// Modo "caderno de erros": /exercicios?modo=erros (&materia=slug opcional)
function modoErros() {
    return new URLSearchParams(window.location.search).get('modo') === 'erros';
}

function obterSlugMateria() {
    const params = new URLSearchParams(window.location.search);
    if (modoErros()) return params.get('materia') || '';
    return params.get('materia') || 'matematica';
}

function formatarTempo(segundos) {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = Math.floor(segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function iniciarCronometro() {
    const display = document.getElementById('cronometro');
    cronometroInterval = setInterval(() => {
        segundosTotais++;
        display.textContent = formatarTempo(segundosTotais);
    }, 1000);
}

function pararCronometro() {
    clearInterval(cronometroInterval);
}

function renderizarNavegacao() {
    const nav = document.getElementById('nav-questoes-grid');
    nav.innerHTML = questoes
        .map((q, i) => {
            const resultado = resultados.find((r) => r.questaoId === q.id);
            let classe = i === indiceAtual ? 'atual' : '';
            if (resultado) classe = resultado.correta ? 'respondida-correta' : 'respondida-incorreta';
            return `<button class="nav-questoes__item ${classe}" data-indice="${i}">${i + 1}</button>`;
        })
        .join('');

    nav.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => irParaQuestao(parseInt(btn.dataset.indice, 10)));
    });
}

function irParaQuestao(indice) {
    indiceAtual = indice;
    alternativaSelecionada = null;
    respondida = resultados.some((r) => r.questaoId === questoes[indice].id);
    tempoInicioQuestao = Date.now();
    renderizarQuestao();
}

function renderizarQuestao() {
    const questao = questoes[indiceAtual];
    if (!questao) return;

    document.getElementById('questao-numero').textContent =
        `Questão ${indiceAtual + 1} de ${questoes.length}` + (modoErros() && questao.materia_nome ? ` · ${questao.materia_nome}` : '');
    document.getElementById('questao-nivel').textContent = Gamificacao.NOMES_NIVEL[questao.nivel] || questao.nivel;
    document.getElementById('questao-nivel').className =
        'badge ' + (questao.nivel === 'dificil' ? 'badge-danger' : questao.nivel === 'medio' ? 'badge-neutral' : 'badge-success');
    document.getElementById('questao-enunciado').textContent = questao.enunciado;

    const dicaBox = document.getElementById('dica-box');
    if (questao.dica) {
        dicaBox.classList.remove('hidden');
        dicaBox.querySelector('span').textContent = questao.dica;
    } else {
        dicaBox.classList.add('hidden');
    }

    const letras = ['a', 'b', 'c', 'd'];
    const alternativasEl = document.getElementById('alternativas');
    alternativasEl.innerHTML = letras
        .map(
            (letra) => `
        <div class="alternativa" data-letra="${letra}">
            <span class="alternativa__letra">${letra.toUpperCase()}</span>
            <span>${questao['alternativa_' + letra]}</span>
        </div>`
        )
        .join('');

    document.getElementById('explicacao-box').classList.remove('show');
    document.getElementById('btn-confirmar').classList.remove('hidden');
    document.getElementById('btn-proxima').classList.add('hidden');

    const resultadoAnterior = resultados.find((r) => r.questaoId === questao.id);
    if (resultadoAnterior) {
        marcarResultadoNaTela(resultadoAnterior);
    } else {
        alternativasEl.querySelectorAll('.alternativa').forEach((el) => {
            el.addEventListener('click', () => selecionarAlternativa(el));
        });
    }

    renderizarNavegacao();
    atualizarBotoesNavegacao();
}

function selecionarAlternativa(el) {
    document.querySelectorAll('.alternativa').forEach((a) => a.classList.remove('selecionada'));
    el.classList.add('selecionada');
    alternativaSelecionada = el.dataset.letra;
}

function marcarResultadoNaTela(resultado) {
    const questao = questoes[indiceAtual];
    document.querySelectorAll('.alternativa').forEach((el) => {
        el.classList.add('desabilitada');
        if (el.dataset.letra === questao.correta_visivel) {
            el.classList.add('correta');
        }
        if (el.dataset.letra === resultado.marcada && !resultado.correta) {
            el.classList.add('incorreta');
        }
    });
    if (questao.explicacao_visivel) {
        const box = document.getElementById('explicacao-box');
        box.querySelector('span').textContent = questao.explicacao_visivel;
        box.classList.add('show');
    }
    document.getElementById('btn-confirmar').classList.add('hidden');
    document.getElementById('btn-proxima').classList.remove('hidden');
}

async function confirmarResposta() {
    if (!alternativaSelecionada) {
        mostrarToast('Selecione uma alternativa antes de confirmar.', 'erro');
        return;
    }

    if (enviando) return;
    const questao = questoes[indiceAtual];
    const tempoGasto = Math.round((Date.now() - tempoInicioQuestao) / 1000);

    enviando = true;
    const botaoConfirmar = document.getElementById('btn-confirmar');
    botaoConfirmar.disabled = true;
    const resp = await API.chamar('/api/materias/responder', {
        method: 'POST',
        body: JSON.stringify({ questaoId: questao.id, alternativa: alternativaSelecionada, tempoGasto })
    });
    enviando = false;
    botaoConfirmar.disabled = false;

    if (!resp || !resp.sucesso) {
        mostrarToast((resp && resp.mensagem) || 'Erro ao registrar resposta.', 'erro');
        return;
    }

    questao.correta_visivel = resp.respostaCorreta;
    questao.explicacao_visivel = resp.explicacao;

    resultados.push({ questaoId: questao.id, correta: resp.correta, marcada: alternativaSelecionada, respostaId: resp.respostaId });
    reagirResposta(resp, questao);

    document.querySelectorAll('.alternativa').forEach((el) => {
        el.classList.add('desabilitada');
        if (el.dataset.letra === resp.respostaCorreta) el.classList.add('correta');
        if (el.dataset.letra === alternativaSelecionada && !resp.correta) el.classList.add('incorreta');
    });

    if (resp.explicacao) {
        const box = document.getElementById('explicacao-box');
        box.querySelector('span').textContent = resp.explicacao;
        box.classList.add('show');
    }

    mostrarToast(resp.correta ? 'Boa! Resposta correta 🎉' : 'Não foi dessa vez, mas continue tentando!', resp.correta ? 'sucesso' : 'erro');

    document.getElementById('btn-confirmar').classList.add('hidden');
    document.getElementById('btn-proxima').classList.remove('hidden');
    renderizarNavegacao();
}

// XP, conquistas e reações do mascote (com base no que o servidor respondeu)
function reagirResposta(resp, questao) {
    const g = resp.gamificacao;
    if (g) {
        xpDaSessao += g.xpGanho || 0;
        Gamificacao.processar(g);
    }

    const falou = g && ((g.conquistasNovas || []).length || (g.hoje && g.hoje.metaBatidaAgora));
    const nivelMudou = resp.progresso && resp.progresso.nivelMudou;
    const nomeNivel = resp.progresso && Gamificacao.NOMES_NIVEL[resp.progresso.nivel];
    const materia = questao.materia_nome || document.getElementById('materia-nome').textContent;

    if (resp.correta) {
        acertosSeguidos++;
    } else {
        if (acertosSeguidos >= 3 && !falou) Gamificacao.Mascote.falar('Tudo bem errar! Leia a explicação com calma, ela ajuda a fixar. 💙');
        acertosSeguidos = 0;
    }

    if (falou) return; // a meta/conquista já ganhou mensagem
    if (nivelMudou === 'subiu') {
        Gamificacao.Mascote.falar(`Você subiu para o nível ${nomeNivel} em ${materia}! As próximas questões vão ser mais desafiadoras. 🚀`, 'festa');
    } else if (nivelMudou === 'desceu') {
        Gamificacao.Mascote.falar(`Vamos reforçar a base: as próximas questões de ${materia} voltam para o nível ${nomeNivel}. Você consegue! 💪`, 'alerta');
    } else if (resp.correta && (acertosSeguidos === 3 || acertosSeguidos === 5 || acertosSeguidos === 10)) {
        Gamificacao.Mascote.falar(`${acertosSeguidos} acertos seguidos! Você está voando! 🔥`, 'festa');
    }
}

function proximaQuestao() {
    if (indiceAtual < questoes.length - 1) {
        irParaQuestao(indiceAtual + 1);
    } else {
        finalizarExercicio();
    }
}

function atualizarBotoesNavegacao() {
    document.getElementById('btn-proxima').innerHTML =
        indiceAtual < questoes.length - 1
            ? 'Próxima <i class="fa-solid fa-arrow-right"></i>'
            : 'Finalizar <i class="fa-solid fa-flag-checkered"></i>';
}

function finalizarExercicio() {
    pararCronometro();
    const corretas = resultados.filter((r) => r.correta).length;
    const dados = {
        total: questoes.length,
        corretas,
        tempo: segundosTotais,
        materia: obterSlugMateria(),
        modo: modoErros() ? 'erros' : 'materia',
        respostaIds: resultados.map((r) => r.respostaId).filter(Boolean),
        xp: xpDaSessao
    };
    sessionStorage.setItem('helpstudy_ultimo_resultado', JSON.stringify(dados));
    window.location.href = '/resultado';
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.className = `toast toast-${tipo}`;
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 2800);
}

async function carregarExercicios() {
    const slug = obterSlugMateria();
    const rota = modoErros()
        ? `/api/materias/erros/questoes${slug ? '?materia=' + encodeURIComponent(slug) : ''}`
        : `/api/materias/${encodeURIComponent(slug)}/questoes`;
    const resp = await API.chamar(rota);

    if (!resp || !resp.sucesso || resp.questoes.length === 0) {
        const conteudo = document.querySelector('.exercicio-layout');
        const vazioErros = resp && resp.sucesso && modoErros();
        conteudo.innerHTML = vazioErros
            ? `<div class="card empty-state" style="grid-column:1/-1"><i class="fa-solid fa-champagne-glasses"></i>
                 Seu caderno de erros está vazio. Você acertou tudo que tinha errado! 🎉
                 <div style="margin-top:14px"><a href="/dashboard" class="btn btn-primary btn-sm">Voltar ao início</a></div></div>`
            : `<div class="card empty-state" style="grid-column:1/-1"><i class="fa-regular fa-face-frown"></i>
                 ${API.escapar((resp && resp.mensagem) || 'Nenhuma questão disponível para esta matéria ainda.')}</div>`;
        document.getElementById('materia-nome').textContent = vazioErros ? 'Caderno de erros' : 'Exercícios';
        return;
    }

    questoes = resp.questoes;
    document.getElementById('materia-nome').textContent = resp.materia.nome;
    document.getElementById('materia-icone-wrap').style.background = resp.materia.cor;
    document.getElementById('total-questoes-label').textContent = modoErros()
        ? `${questoes.length} ${questoes.length === 1 ? 'questão para refazer' : 'questões para refazer'}`
        : `${questoes.length} questões · Nível adaptado: ${Gamificacao.NOMES_NIVEL[resp.nivelAtual] || 'Fácil'}`;

    tempoInicioQuestao = Date.now();
    renderizarQuestao();
    iniciarCronometro();
}

document.addEventListener('DOMContentLoaded', () => {
    carregarExercicios();
    document.getElementById('btn-confirmar').addEventListener('click', confirmarResposta);
    document.getElementById('btn-proxima').addEventListener('click', proximaQuestao);
});
