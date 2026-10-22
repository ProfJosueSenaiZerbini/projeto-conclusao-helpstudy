// =====================================================================
// Funções de texto das questões do ENEM (usadas na página do ENEM e no
// simulado): escapa HTML e converte o Markdown simples das questões.
// =====================================================================

function escaparHtml(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Converte o Markdown simples das questões (imagens, links, negrito, itálico)
// "emLinha" = true para textos curtos (alternativas), sem parágrafos
function markdownParaHtml(texto, emLinha = false) {
    if (!texto) return '';
    let html = escaparHtml(texto.replace(/\r\n/g, '\n'));

    // Imagens e links viram marcadores para o negrito/itálico não mexer nas URLs
    const guardados = [];
    const guardar = (trecho) => `\u0000${guardados.push(trecho) - 1}\u0000`;
    html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (m, alt, url) =>
        guardar(
            url.includes('broken-image') // a própria API marca assim as imagens que ela não tem
                ? '<span class="enem-imagem-indisponivel"><i class="fa-regular fa-image"></i> Imagem indisponível na fonte</span>'
                : `<img src="${url}" alt="${alt || 'Imagem da questão'}" loading="lazy" onerror="this.style.display='none'">`
        )
    );
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, nome, url) =>
        guardar(`<a href="${url}" target="_blank" rel="noopener">${nome}</a>`)
    );
    html = html.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>');
    html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^\w])_([^_\n]+?)_(?=[^\w]|$)/g, '$1<em>$2</em>');
    html = html.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
    html = html.replace(/\u0000(\d+)\u0000/g, (m, i) => guardados[Number(i)]);

    if (emLinha) return html.trim().replace(/\n+/g, '<br>');

    return html
        .split(/\n{2,}/)
        .map((paragrafo) => paragrafo.trim())
        .filter(Boolean)
        .map((paragrafo) => `<p>${paragrafo.replace(/\n/g, '<br>')}</p>`)
        .join('');
}
