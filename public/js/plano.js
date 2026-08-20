// =====================================================================
// Lógica da página de Plano de Estudos
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

function badgePrioridade(prioridade) {
    const mapa = {
        alta: { classe: 'badge-danger', texto: 'Prioridade alta' },
        media: { classe: 'badge-neutral', texto: 'Prioridade média' },
        baixa: { classe: 'badge-success', texto: 'Prioridade baixa' }
    };
    return mapa[prioridade] || mapa.media;
}

async function carregarPlano() {
    const lista = document.getElementById('plano-lista');
    const resp = await API.chamar('/api/progresso/plano');

    if (!resp || !resp.sucesso || resp.plano.length === 0) {
        lista.innerHTML = `<div class="empty-state"><i class="fa-regular fa-face-smile"></i>Responda algumas questões para gerarmos seu plano personalizado.</div>`;
        return;
    }

    lista.innerHTML = resp.plano
        .map((p) => {
            const badge = badgePrioridade(p.prioridade);
            return `
            <div class="card plano-item">
                <div class="plano-item__icon" style="background:${p.cor}">
                    <i class="${iconeClasse(p.icone)}"></i>
                </div>
                <div class="plano-item__text">
                    <strong>${p.materia_nome}</strong>
                    <span>${p.motivo}</span>
                </div>
                <span class="badge ${badge.classe} plano-item__prioridade">${badge.texto}</span>
                <a href="/exercicios?materia=${p.slug}" class="btn btn-primary btn-sm">Estudar agora</a>
            </div>`;
        })
        .join('');
}

async function regerarPlano() {
    const botao = document.getElementById('btn-regerar');
    const original = botao.innerHTML;
    botao.innerHTML = '<span class="spinner"></span> Gerando...';
    botao.disabled = true;

    await API.chamar('/api/progresso/plano/gerar', { method: 'POST' });
    await carregarPlano();

    botao.innerHTML = original;
    botao.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPlano();
    document.getElementById('btn-regerar').addEventListener('click', regerarPlano);
});
