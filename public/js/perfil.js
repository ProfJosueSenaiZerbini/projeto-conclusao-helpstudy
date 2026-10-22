// =====================================================================
// Lógica da página Meu perfil
// Edição do perfil (reaproveita atualizarPerfil do servidor), troca de
// senha, nível/XP e ranking semanal.
// =====================================================================
const esc = (t) => API.escapar(t);
let avatarEscolhido = null;

function mostrarToast(mensagem, tipo = 'sucesso') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.className = `toast toast-${tipo}`;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(mostrarToast.timer);
    mostrarToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function definirCarregando(botao, carregando) {
    if (carregando) {
        botao.dataset.original = botao.innerHTML;
        botao.innerHTML = '<span class="spinner"></span> Salvando...';
        botao.disabled = true;
    } else {
        botao.innerHTML = botao.dataset.original || botao.innerHTML;
        botao.disabled = false;
    }
}

function desenharTopo(u) {
    const avatar = document.getElementById('perfil-avatar');
    avatar.textContent = u.avatar || API.iniciais(u.nome);
    avatar.classList.toggle('com-avatar', !!u.avatar);
    document.getElementById('perfil-nome').textContent = u.nome;
    const desde = u.criado_em ? new Date(String(u.criado_em).replace(' ', 'T')).toLocaleDateString('pt-BR') : '';
    document.getElementById('perfil-sub').textContent = [u.apelido ? `@${u.apelido}` : null, u.serie, desde ? `Estuda no HelpStudy desde ${desde}` : null]
        .filter(Boolean)
        .join(' · ');
}

function desenharNivel(r) {
    if (!r || !r.nivel) return;
    const n = r.nivel;
    document.getElementById('perfil-nivel-titulo').textContent = `Nível ${n.nivel} · ${n.titulo}`;
    document.getElementById('perfil-nivel-barra').style.width = `${n.progresso}%`;
    document.getElementById('perfil-nivel-xp').textContent = `${n.xpTotal} XP · faltam ${n.xpParaProximo - n.xpNoNivel} para o nível ${n.nivel + 1}`;
}

function desenharAvatares(lista) {
    const wrap = document.getElementById('avatar-opcoes');
    const opcoes = [{ valor: '', rotulo: 'Iniciais' }, ...lista.map((a) => ({ valor: a, rotulo: a }))];
    wrap.innerHTML = opcoes
        .map(
            (o) => `
        <button type="button" role="radio" aria-checked="${(avatarEscolhido || '') === o.valor}"
            class="avatar-opcao ${(avatarEscolhido || '') === o.valor ? 'ativo' : ''} ${o.valor ? '' : 'avatar-opcao--texto'}"
            data-avatar="${esc(o.valor)}" aria-label="${o.valor ? 'Avatar ' + esc(o.valor) : 'Usar minhas iniciais'}">${esc(o.rotulo)}</button>`
        )
        .join('');
}

function desenharRanking(r) {
    const wrap = document.getElementById('ranking-lista');
    if (!r || !r.sucesso) {
        wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Não foi possível carregar o ranking.</div>';
        return;
    }
    if (!r.top.length) {
        wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-ranking-star"></i>Ninguém ganhou XP esta semana ainda. Seja o primeiro!</div>';
        return;
    }
    const medalha = (p) => (p === 1 ? '🥇' : p === 2 ? '🥈' : p === 3 ? '🥉' : p);
    let html = r.top
        .map(
            (l) => `
        <div class="ranking-linha ${l.voce ? 'voce' : ''}">
            <span class="ranking-linha__pos">${medalha(l.posicao)}</span>
            <span class="ranking-linha__avatar">${esc(l.avatar || l.nome.slice(0, 1).toUpperCase())}</span>
            <span class="ranking-linha__nome">${esc(l.nome)}${l.voce ? ' <small>(você)</small>' : ''}</span>
            <b>${l.xp} XP</b>
        </div>`
        )
        .join('');

    if (r.voce && r.voce.oculto) {
        html += `<p class="ranking-nota"><i class="fa-solid fa-eye-slash"></i> Você está escondido do ranking (${r.voce.xp} XP esta semana).</p>`;
    } else if (r.voce && r.voce.posicao && !r.top.some((l) => l.voce)) {
        html += `<div class="ranking-linha voce"><span class="ranking-linha__pos">${r.voce.posicao}</span><span class="ranking-linha__avatar">${esc(r.voce.avatar || '•')}</span><span class="ranking-linha__nome">${esc(r.voce.nome)} <small>(você)</small></span><b>${r.voce.xp} XP</b></div>`;
    } else if (r.voce && !r.voce.posicao) {
        html += '<p class="ranking-nota">Responda questões esta semana para entrar no ranking!</p>';
    }
    wrap.innerHTML = html;
}

async function carregar() {
    const [perfil, ranking] = await Promise.all([API.chamar('/api/auth/perfil'), API.chamar('/api/gamificacao/ranking')]);
    if (!perfil || !perfil.sucesso) {
        mostrarToast((perfil && perfil.mensagem) || 'Não foi possível carregar o perfil.', 'erro');
        return;
    }
    const u = perfil.usuario;
    avatarEscolhido = u.avatar || null;
    desenharTopo(u);
    desenharAvatares(perfil.avatares || []);
    document.getElementById('campo-nome').value = u.nome || '';
    document.getElementById('campo-apelido').value = u.apelido || '';
    document.getElementById('campo-serie').value = u.serie || '';
    document.getElementById('campo-ranking').checked = Number(u.ranking_publico) === 1;
    document.getElementById('campo-mascote').checked = !Gamificacao.Mascote.oculto();
    desenharRanking(ranking);
    desenharNivel(Gamificacao.resumo());
}

async function salvarPerfil(e) {
    e.preventDefault();
    const nome = document.getElementById('campo-nome').value.trim();
    const apelido = document.getElementById('campo-apelido').value.trim();
    if (nome.length < 2) {
        mostrarToast('Digite seu nome (pelo menos 2 letras).', 'erro');
        document.getElementById('campo-nome').focus();
        return;
    }
    if (apelido && !/^[\p{L}\p{N} ._-]{2,30}$/u.test(apelido)) {
        mostrarToast('O apelido pode ter letras, números, espaço, ponto, - e _ (2 a 30 caracteres).', 'erro');
        document.getElementById('campo-apelido').focus();
        return;
    }

    const botao = document.getElementById('btn-salvar-perfil');
    definirCarregando(botao, true);
    const resp = await API.chamar('/api/auth/perfil', {
        method: 'PUT',
        body: JSON.stringify({
            nome,
            apelido,
            serie: document.getElementById('campo-serie').value.trim(),
            avatar: avatarEscolhido,
            rankingPublico: document.getElementById('campo-ranking').checked
        })
    });
    definirCarregando(botao, false);

    // O mascote é uma preferência deste navegador
    Gamificacao.Mascote.definirOculto(!document.getElementById('campo-mascote').checked);

    if (!resp || !resp.sucesso) {
        mostrarToast((resp && resp.mensagem) || 'Não foi possível salvar.', 'erro');
        return;
    }
    API.salvarUsuario({ nome: resp.usuario.nome, avatar: resp.usuario.avatar || null });
    desenharTopo(resp.usuario);
    desenharRanking(await API.chamar('/api/gamificacao/ranking'));
    mostrarToast('Perfil atualizado! ✅');
}

async function alterarSenha(e) {
    e.preventDefault();
    const atual = document.getElementById('senha-atual');
    const nova = document.getElementById('senha-nova');
    const confirmar = document.getElementById('senha-confirmar');
    if (!atual.value || !nova.value) {
        mostrarToast('Preencha a senha atual e a nova senha.', 'erro');
        return;
    }
    if (nova.value.length < 6) {
        mostrarToast('A nova senha deve ter pelo menos 6 caracteres.', 'erro');
        nova.focus();
        return;
    }
    if (nova.value !== confirmar.value) {
        mostrarToast('A confirmação não é igual à nova senha.', 'erro');
        confirmar.focus();
        return;
    }

    const botao = document.getElementById('btn-salvar-senha');
    definirCarregando(botao, true);
    const resp = await API.chamar('/api/auth/senha', {
        method: 'PUT',
        body: JSON.stringify({ senhaAtual: atual.value, novaSenha: nova.value })
    });
    definirCarregando(botao, false);
    if (!resp || !resp.sucesso) {
        mostrarToast((resp && resp.mensagem) || 'Não foi possível alterar a senha.', 'erro');
        return;
    }
    e.target.reset();
    mostrarToast('Senha alterada com sucesso! 🔒');
}

document.addEventListener('DOMContentLoaded', () => {
    carregar();
    document.addEventListener('gamificacao:resumo', (e) => desenharNivel(e.detail));
    document.getElementById('form-perfil').addEventListener('submit', salvarPerfil);
    document.getElementById('form-senha').addEventListener('submit', alterarSenha);
    document.getElementById('avatar-opcoes').addEventListener('click', (e) => {
        const b = e.target.closest('[data-avatar]');
        if (!b) return;
        avatarEscolhido = b.dataset.avatar || null;
        document.querySelectorAll('.avatar-opcao').forEach((o) => {
            o.classList.toggle('ativo', o === b);
            o.setAttribute('aria-checked', o === b);
        });
        const topo = document.getElementById('perfil-avatar');
        topo.textContent = avatarEscolhido || API.iniciais(document.getElementById('campo-nome').value);
        topo.classList.toggle('com-avatar', !!avatarEscolhido);
    });
});
