// =====================================================================
// Lógica da página da Aula
// Mostra o conteúdo, os exemplos resolvidos, as perguntinhas de fixação,
// o resumo "Lembre-se" e marca a aula como estudada.
// Dados: GET /api/aulas/:id  |  Concluir: POST /api/aulas/:id/concluir
// =====================================================================
const esc = (t) => API.escapar(t);

// Escapa o texto e transforma **assim** em negrito
function fmt(texto) {
    return esc(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// Embaralha uma cópia da lista (para a resposta certa não ficar sempre no mesmo lugar)
function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

let dados = null;

function htmlSecoes(secoes) {
    return (secoes || [])
        .map(
            (s) => `
        <section class="card aula-bloco">
            <h2>${fmt(s.titulo)}</h2>
            ${(s.texto || []).map((p) => `<p>${fmt(p)}</p>`).join('')}
            ${s.lista ? `<ul>${s.lista.map((item) => `<li>${fmt(item)}</li>`).join('')}</ul>` : ''}
        </section>`
        )
        .join('');
}

function htmlExemplos(exemplos) {
    if (!exemplos || !exemplos.length) return '';
    return `
        <h2 class="aula-titulo-secao"><i class="fa-solid fa-pencil"></i> ${exemplos.length > 1 ? 'Exemplos resolvidos' : 'Exemplo resolvido'}</h2>
        ${exemplos
            .map(
                (e) => `
            <div class="card aula-bloco exemplo">
                <h3>${fmt(e.titulo)}</h3>
                <ol>${e.passos.map((p) => `<li>${fmt(p)}</li>`).join('')}</ol>
                <div class="exemplo__resposta"><i class="fa-solid fa-check"></i> ${fmt(e.resposta)}</div>
            </div>`
            )
            .join('')}`;
}

function htmlFixacao(perguntas) {
    if (!perguntas || !perguntas.length) return '';
    const letras = ['A', 'B', 'C', 'D', 'E'];
    return `
        <h2 class="aula-titulo-secao"><i class="fa-solid fa-circle-question"></i> Teste rápido (não vale nota)</h2>
        ${perguntas
            .map((q, i) => {
                const opcoes = embaralhar(q.alternativas.map((texto, indice) => ({ texto, indice })));
                return `
            <div class="card aula-bloco fixacao" data-pergunta="${i}">
                <h3>${i + 1}. ${fmt(q.pergunta)}</h3>
                <div class="fixacao__opcoes">
                    ${opcoes
                        .map(
                            (o, k) => `
                        <button class="fixacao__opcao" data-indice="${o.indice}">
                            <b>${letras[k]}</b> <span>${fmt(o.texto)}</span>
                        </button>`
                        )
                        .join('')}
                </div>
                <div class="fixacao__explicacao hidden"></div>
            </div>`;
            })
            .join('')}`;
}

function htmlResumo(resumo) {
    if (!resumo || !resumo.length) return '';
    return `
        <section class="card aula-bloco lembre">
            <h2><i class="fa-solid fa-lightbulb"></i> Lembre-se</h2>
            <ul>${resumo.map((r) => `<li>${fmt(r)}</li>`).join('')}</ul>
        </section>`;
}

function htmlRodape() {
    const { aula, materia, proxima, anterior } = dados;
    const slug = encodeURIComponent(materia.slug);
    const continuar = proxima
        ? `<a class="btn btn-primary" href="/aula?id=${proxima.id}">Próxima aula <i class="fa-solid fa-arrow-right"></i></a>`
        : `<a class="btn btn-primary" href="/exercicios?materia=${slug}"><i class="fa-solid fa-pen-to-square"></i> Fazer as 10 questões</a>`;

    return `
        <div class="card aula-rodape" id="rodape">
            ${
                aula.concluida
                    ? `<span class="aula-feita"><i class="fa-solid fa-circle-check"></i> Você já estudou esta aula</span>`
                    : `<p>Terminou de ler, fez os exemplos e o teste rápido?</p>
                       <button class="btn btn-estudada" id="btn-concluir"><i class="fa-solid fa-check"></i> Marcar como estudada (+15 XP)</button>`
            }
            <div class="aula-rodape__acoes">
                <a class="btn btn-ghost" href="/flashcards?materia=${slug}"><i class="fa-solid fa-clone"></i> Revisar com flashcards</a>
                ${continuar}
            </div>
        </div>

        <nav class="aula-navegacao" aria-label="Outras aulas">
            ${
                anterior
                    ? `<a class="card" href="/aula?id=${anterior.id}"><small><i class="fa-solid fa-arrow-left"></i> Aula anterior</small><strong>${esc(anterior.titulo)}</strong></a>`
                    : `<a class="card" href="/estudar?materia=${slug}"><small><i class="fa-solid fa-arrow-left"></i> Voltar</small><strong>Todas as aulas de ${esc(materia.nome)}</strong></a>`
            }
            ${
                proxima
                    ? `<a class="card proxima" href="/aula?id=${proxima.id}"><small>Próxima aula <i class="fa-solid fa-arrow-right"></i></small><strong>${esc(proxima.titulo)}</strong></a>`
                    : `<a class="card proxima" href="/exercicios?materia=${slug}"><small>Hora de praticar <i class="fa-solid fa-arrow-right"></i></small><strong>As 10 questões de ${esc(materia.nome)}</strong></a>`
            }
        </nav>`;
}

function desenhar() {
    const { aula, materia, posicao, total } = dados;
    const c = aula.conteudo || {};
    document.title = `${aula.titulo} · HelpStudy`;

    document.getElementById('area-aula').innerHTML = `
        <div class="aula-pagina" style="--cor:${esc(materia.cor)}">
            <a class="voltar-link" href="/estudar?materia=${encodeURIComponent(materia.slug)}"><i class="fa-solid fa-arrow-left"></i> ${esc(materia.nome)}</a>

            <header class="card aula-cabecalho">
                <span class="materia-tag" style="--cor:${esc(materia.cor)}"><i class="fa-solid ${esc(materia.icone)}"></i> ${esc(materia.nome)} · Aula ${posicao} de ${total}</span>
                <h1>${esc(aula.titulo)}</h1>
                <p>${esc(aula.descricao || '')}</p>
                <div class="aula-info">
                    <span><i class="fa-regular fa-clock"></i> ${aula.minutos} min de leitura</span>
                    ${aula.concluida ? '<span style="color:var(--success)"><i class="fa-solid fa-circle-check"></i> Estudada</span>' : ''}
                </div>
            </header>

            ${htmlSecoes(c.secoes)}
            ${htmlExemplos(c.exemplos)}
            ${htmlFixacao(c.fixacao)}
            ${htmlResumo(c.resumo)}
            <div id="area-rodape">${htmlRodape()}</div>
        </div>`;

    ligarEventos();
}

function ligarEventos() {
    // Perguntinhas de fixação: corrige na hora, sem salvar
    document.querySelectorAll('.fixacao').forEach((card) => {
        const pergunta = dados.aula.conteudo.fixacao[Number(card.dataset.pergunta)];
        card.querySelectorAll('.fixacao__opcao').forEach((botao) => {
            botao.addEventListener('click', () => {
                const escolhida = Number(botao.dataset.indice);
                const acertou = escolhida === pergunta.correta;
                card.querySelectorAll('.fixacao__opcao').forEach((b) => {
                    b.disabled = true;
                    if (Number(b.dataset.indice) === pergunta.correta) b.classList.add('certa');
                });
                if (!acertou) botao.classList.add('errada');

                const caixa = card.querySelector('.fixacao__explicacao');
                caixa.innerHTML = `<strong>${acertou ? '✅ Isso mesmo!' : '❌ Quase!'}</strong> ${fmt(pergunta.explicacao)}`;
                caixa.classList.remove('hidden');
                if (acertou) falarMascote('Boa! Você está pegando o jeito. 💡');
            });
        });
    });

    const botao = document.getElementById('btn-concluir');
    if (botao) botao.addEventListener('click', concluir);
}

async function concluir() {
    const botao = document.getElementById('btn-concluir');
    definirCarregando(botao, true);
    const resp = await API.chamar(`/api/aulas/${dados.aula.id}/concluir`, { method: 'POST' });
    if (!resp || !resp.sucesso) {
        definirCarregando(botao, false);
        falarMascote((resp && resp.mensagem) || 'Não foi possível marcar a aula. Tente de novo.', 'alerta');
        return;
    }
    dados.aula.concluida = true;
    document.getElementById('area-rodape').innerHTML = htmlRodape();
    // Mostra o XP ganho, subida de nível e conquistas (igual às outras páginas)
    if (typeof Gamificacao !== 'undefined' && resp.gamificacao) Gamificacao.processar(resp.gamificacao);
    if (!dados.proxima) falarMascote('Você terminou as aulas desta matéria! Agora é hora das 10 questões. 🎯', 'festa');
}

// O mascote fica dentro do gamificacao.js (pode estar desligado no perfil)
function falarMascote(texto, humor) {
    if (typeof Gamificacao !== 'undefined' && Gamificacao.Mascote) Gamificacao.Mascote.falar(texto, humor);
}

// Botão com "carregando" (mesmo comportamento das outras páginas)
function definirCarregando(botao, carregando) {
    if (!botao) return;
    botao.disabled = carregando;
    if (carregando) {
        botao.dataset.texto = botao.innerHTML;
        botao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    } else if (botao.dataset.texto) {
        botao.innerHTML = botao.dataset.texto;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const id = Number(new URLSearchParams(location.search).get('id'));
    const area = document.getElementById('area-aula');
    if (!id) {
        location.href = '/estudar';
        return;
    }

    const resp = await API.chamar(`/api/aulas/${id}`);
    if (!resp || !resp.sucesso) {
        area.innerHTML = `
            <div class="card empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                ${esc((resp && resp.mensagem) || 'Não foi possível abrir a aula.')}<br>
                <a href="/estudar">Voltar para Estudar</a>
            </div>`;
        return;
    }
    dados = resp;
    desenhar();
    window.scrollTo(0, 0);
});
