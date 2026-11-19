// =====================================================================
// Limite de tentativas de login (proteção contra quem tenta adivinhar senha)
// Depois de 5 senhas erradas para o mesmo e-mail, a partir do mesmo
// computador, o login fica bloqueado por 15 minutos.
// Os dados ficam na memória do servidor (zeram quando o servidor reinicia).
// =====================================================================
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;

const tentativas = new Map(); // chave "ip|email" -> { erros, bloqueadoAte, ultimaVez }

function chave(req, email) {
    return `${req.ip}|${email}`;
}

const limiteLogin = {
    // Retorna quantos minutos ainda faltam de bloqueio (0 = liberado)
    minutosBloqueado(req, email) {
        const reg = tentativas.get(chave(req, email));
        if (!reg || !reg.bloqueadoAte) return 0;
        const falta = reg.bloqueadoAte - Date.now();
        if (falta <= 0) {
            tentativas.delete(chave(req, email));
            return 0;
        }
        return Math.ceil(falta / 60000);
    },

    registrarErro(req, email) {
        const k = chave(req, email);
        const reg = tentativas.get(k) || { erros: 0, bloqueadoAte: 0 };
        reg.erros += 1;
        reg.ultimaVez = Date.now();
        if (reg.erros >= MAX_TENTATIVAS) {
            reg.bloqueadoAte = Date.now() + BLOQUEIO_MS;
            reg.erros = 0;
        }
        tentativas.set(k, reg);
    },

    limpar(req, email) {
        tentativas.delete(chave(req, email));
    }
};

// Limpa registros antigos a cada 30 minutos para não ocupar memória
setInterval(() => {
    const agora = Date.now();
    for (const [k, reg] of tentativas) {
        const antigo = agora - (reg.ultimaVez || 0) > BLOQUEIO_MS;
        if (antigo && (!reg.bloqueadoAte || reg.bloqueadoAte < agora)) tentativas.delete(k);
    }
}, 30 * 60 * 1000).unref();

module.exports = limiteLogin;
