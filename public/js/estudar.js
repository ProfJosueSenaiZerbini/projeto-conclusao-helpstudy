// =====================================================================
// Lógica da página Estudar
// Sem matéria: mostra todas as matérias com o progresso de estudo.
// Com ?materia=slug: mostra as aulas da matéria e o atalho para as questões.
// =====================================================================
const esc = (t) => API.escapar(t);

function barra(feitas, total, texto) {
    const pct = total ? Math.round((feitas / total) * 100) : 0;
    return `
        <div class="estudo-progresso">
            <span>${texto}</span>
            <div class="progress-bar"><div class="progress-bar__fill" style="width:${pct}%"></div></div>
        </div>`;
}

// ---------- Todas as matérias ----------
async function mostrarTodas(area) {
    const resp = await API.chamar('/api/aulas');
    if (!resp || !resp.sucesso) return erro(area);

    area.innerHTML = `
        <div class="card conteudo-intro">
            <div class="conteudo-intro__icone"><i class="fa-solid fa-book-open"></i></div>
            <div class="conteudo-intro__texto">
                <h1>Estudar</h1>
                <p>Escolha uma matéria, estude as aulas no seu ritmo e depois pratique com as 10 questões.</p>
            </div>
        </div>
        <div class="estudo-grade">
            ${resp.materias
                .map(
                    (m) => `
                <a class="card estudo-materia" href="/estudar?materia=${encodeURIComponent(m.slug)}" style="--cor:${esc(m.cor)}">
                    <div class="estudo-materia__icone"><i class="fa-solid ${esc(m.icone)}"></i></div>
                    <div>
                        <h3>${esc(m.nome)}</h3>
                        <p>${esc(m.descricao || '')}</p>
                    </div>
                    ${barra(
                        m.aulas_concluidas,
                        m.total_aulas,
                        m.total_aulas ? `${m.aulas_concluidas} de ${m.total_aulas} aulas estudadas` : 'Sem aulas ainda'
                    )}
                </a>`
                )
                .join('')}
        </div>`;
}

// ---------- Uma matéria ----------
async function mostrarMateria(area, slug) {
    const resp = await API.chamar(`/api/aulas/materia/${encodeURIComponent(slug)}`);
    if (!resp || !resp.sucesso) return erro(area, resp && resp.mensagem);

    const { materia, aulas } = resp;
    const feitas = aulas.filter((a) => a.concluida).length;
    const proxima = aulas.find((a) => !a.concluida);
    document.title = `Estudar ${materia.nome} · HelpStudy`;

    area.innerHTML = `
        <a class="voltar-link" href="/estudar"><i class="fa-solid fa-arrow-left"></i> Todas as matérias</a>

        <div class="card estudo-topo" style="--cor:${esc(materia.cor)}">
            <div class="estudo-topo__icone"><i class="fa-solid ${esc(materia.icone)}"></i></div>
            <div class="estudo-topo__texto">
                <h1>${esc(materia.nome)}</h1>
                <p>${esc(materia.descricao || '')}</p>
            </div>
            ${barra(feitas, aulas.length, `${feitas} de ${aulas.length} aulas estudadas`)}
        </div>

        <div class="aulas-lista" style="--cor:${esc(materia.cor)}">
            ${
                aulas.length
                    ? aulas
                          .map(
                              (a, i) => `
                <a class="card aula-item ${a.concluida ? 'concluida' : ''}" href="/aula?id=${a.id}" style="animation-delay:${i * 60}ms">
                    <span class="aula-item__numero">${a.concluida ? '<i class="fa-solid fa-check"></i>' : i + 1}</span>
                    <div class="aula-item__texto">
                        <strong>${esc(a.titulo)}</strong>
                        <span>${esc(a.descricao || '')}</span>
                    </div>
                    <span class="aula-item__tempo"><i class="fa-regular fa-clock"></i> ${a.minutos} min</span>
                    <i class="fa-solid fa-chevron-right"></i>
                </a>`
                          )
                          .join('')
                    : '<div class="card empty-state"><i class="fa-solid fa-book"></i>Esta matéria ainda não tem aulas.</div>'
            }
        </div>

        <div class="card praticar-card" style="--cor:${esc(materia.cor)}">
            <div class="praticar-card__texto">
                <h3>${feitas === aulas.length && aulas.length ? 'Aulas concluídas! Hora de praticar 🎯' : 'Pronto para praticar?'}</h3>
                <p>${
                    feitas === aulas.length && aulas.length
                        ? 'Você estudou todo o conteúdo. Agora teste o que aprendeu com as 10 questões.'
                        : 'O ideal é estudar as aulas primeiro, mas se você já domina o assunto pode ir direto para as questões.'
                }</p>
            </div>
            <div class="praticar-card__acoes">
                ${proxima ? `<a class="btn btn-ghost" href="/aula?id=${proxima.id}"><i class="fa-solid fa-book-open"></i> ${feitas ? 'Continuar estudando' : 'Começar a estudar'}</a>` : ''}
                <a class="btn btn-ghost" href="/flashcards?materia=${encodeURIComponent(materia.slug)}"><i class="fa-solid fa-clone"></i> Flashcards</a>
                <a class="btn btn-primary" href="/exercicios?materia=${encodeURIComponent(materia.slug)}"><i class="fa-solid fa-pen-to-square"></i> Fazer as 10 questões</a>
            </div>
        </div>`;
}

function erro(area, mensagem) {
    area.innerHTML = `
        <div class="card empty-state">
            <i class="fa-solid fa-triangle-exclamation"></i>
            ${esc(mensagem || 'Não foi possível carregar as aulas.')}<br>
            <a href="/estudar">Ver todas as matérias</a>
        </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const area = document.getElementById('area-estudar');
    const slug = new URLSearchParams(location.search).get('materia');
    if (slug) mostrarMateria(area, slug);
    else mostrarTodas(area);
});
