// =====================================================================
// Model: ENEM
// Busca provas e questões na API pública https://enem.dev
// (documentação: https://docs.enem.dev)
//
// - Guarda as respostas em cache na memória (os dados das provas não mudam)
// - Faz as chamadas em fila, com intervalo entre elas, para respeitar o
//   limite de requisições da API (cerca de 10 a cada 10 segundos)
// - Se a API responder 429 (limite excedido), espera e tenta de novo
// =====================================================================
const https = require('https');
const http = require('http');

const BASE_URL = (process.env.ENEM_API_URL || 'https://api.enem.dev/v1').replace(/\/$/, '');
const INTERVALO_MS = 1100; // tempo mínimo entre duas chamadas à API
const TAMANHO_BLOCO = 50; // a API devolve no máximo 50 questões por chamada

// Nomes amigáveis e ícones das áreas do ENEM
const AREAS = {
    linguagens: { nome: 'Linguagens', icone: 'fa-language', cor: '#9B59B6' },
    'ciencias-humanas': { nome: 'Ciências Humanas', icone: 'fa-landmark', cor: '#F39C12' },
    'ciencias-natureza': { nome: 'Ciências da Natureza', icone: 'fa-flask', cor: '#16A085' },
    matematica: { nome: 'Matemática', icone: 'fa-square-root-variable', cor: '#4A6CF7' }
};

const cache = new Map();
let fila = Promise.resolve();
let ultimaChamada = 0;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Faz um GET e devolve { status, dados, headers }
function requisitar(url) {
    return new Promise((resolve, reject) => {
        const cliente = url.startsWith('https') ? https : http;
        const req = cliente.get(url, { headers: { Accept: 'application/json' } }, (res) => {
            let corpo = '';
            res.setEncoding('utf8');
            res.on('data', (parte) => (corpo += parte));
            res.on('end', () => {
                let dados = null;
                try {
                    dados = JSON.parse(corpo);
                } catch {
                    dados = null;
                }
                resolve({ status: res.statusCode, dados, headers: res.headers });
            });
        });
        req.setTimeout(30000, () => req.destroy(new Error('Tempo esgotado ao acessar a API do ENEM.')));
        req.on('error', reject);
    });
}

// Coloca a chamada na fila (uma por vez, com intervalo) e tenta de novo em caso de 429
function chamarApi(caminho) {
    const tarefa = fila.then(async () => {
        for (let tentativa = 1; tentativa <= 4; tentativa++) {
            const espera = ultimaChamada + INTERVALO_MS - Date.now();
            if (espera > 0) await esperar(espera);
            ultimaChamada = Date.now();

            const resp = await requisitar(BASE_URL + caminho);

            if (resp.status === 429) {
                const retry = Number(resp.headers['retry-after']) || 3000;
                await esperar(Math.min(retry, 10000));
                continue;
            }

            if (resp.status >= 200 && resp.status < 300 && resp.dados) {
                return resp.dados;
            }

            const erro = new Error(
                (resp.dados && resp.dados.error && resp.dados.error.message) || 'Erro ao consultar a API do ENEM.'
            );
            erro.status = resp.status === 404 ? 404 : resp.status === 400 ? 400 : 502;
            throw erro;
        }
        const erro = new Error('A API do ENEM está recebendo muitas requisições. Tente novamente em alguns segundos.');
        erro.status = 429;
        throw erro;
    });
    // A fila continua mesmo se esta chamada falhar
    fila = tarefa.catch(() => {});
    return tarefa;
}

// Busca com cache (a mesma informação nunca é pedida duas vezes)
function comCache(chave, buscar) {
    if (!cache.has(chave)) {
        const promessa = buscar().catch((err) => {
            cache.delete(chave); // não guarda erros
            throw err;
        });
        cache.set(chave, promessa);
    }
    return cache.get(chave);
}

const Enem = {
    AREAS,

    // Lista de provas (anos) disponíveis
    listarProvas() {
        return comCache('provas', async () => {
            const provas = await chamarApi('/exams');
            return provas.sort((a, b) => b.year - a.year);
        });
    },

    // Detalhes de uma prova: áreas, idiomas e lista de questões (sem conteúdo)
    buscarProva(ano) {
        return comCache(`prova-${ano}`, () => chamarApi(`/exams/${ano}`));
    },

    // Bloco de até 50 questões completas (ex.: bloco 0 = questões 1 a 50)
    buscarBloco(ano, bloco, idioma) {
        const inicio = bloco * TAMANHO_BLOCO + 1;
        const params = new URLSearchParams({ offset: inicio, limit: TAMANHO_BLOCO - 1 });
        if (idioma) params.set('language', idioma);
        return comCache(`bloco-${ano}-${bloco}-${idioma || ''}`, async () => {
            const resp = await chamarApi(`/exams/${ano}/questions?${params}`);
            return resp.questions || [];
        });
    },

    // Filtra a lista de questões da prova por área e idioma
    filtrarQuestoes(prova, disciplina, idioma) {
        return prova.questions.filter((q) => {
            if (disciplina && q.discipline !== disciplina) return false;
            if (q.language && q.language !== idioma) return false;
            return true;
        });
    },

    // Busca o conteúdo completo de uma lista de questões { index, language }
    async buscarQuestoesCompletas(ano, itens, idioma) {
        const blocos = [...new Set(itens.map((q) => Math.floor((q.index - 1) / TAMANHO_BLOCO)))];
        const resultados = [];
        for (const bloco of blocos) {
            resultados.push(...(await this.buscarBloco(ano, bloco, idioma)));
        }
        return itens
            .map((item) =>
                resultados.find((q) => q.index === item.index && (q.language || null) === (item.language || null))
            )
            .filter(Boolean);
    }
};

module.exports = Enem;
