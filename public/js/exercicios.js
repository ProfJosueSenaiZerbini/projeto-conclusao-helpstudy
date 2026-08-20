<<<<<<< HEAD
// =====================================================================
// Lógica da página de Exercícios
// =====================================================================

let questoes = [];
let indiceAtual = 0;
let alternativaSelecionada = null;
let respondida = false;
let resultados = []; // { questaoId, correta }
let tempoInicioQuestao = null;
let cronometroInterval = null;
let segundosTotais = 0;

function obterSlugMateria() {
    const params = new URLSearchParams(window.location.search);
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

    document.getElementById('questao-numero').textContent = `Questão ${indiceAtual + 1} de ${questoes.length}`;
    document.getElementById('questao-nivel').textContent = questao.nivel;
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

    const questao = questoes[indiceAtual];
    const tempoGasto = Math.round((Date.now() - tempoInicioQuestao) / 1000);

    const resp = await API.chamar('/api/materias/responder', {
        method: 'POST',
        body: JSON.stringify({ questaoId: questao.id, alternativa: alternativaSelecionada, tempoGasto })
    });

    if (!resp || !resp.sucesso) {
        mostrarToast('Erro ao registrar resposta.', 'erro');
        return;
    }

    questao.correta_visivel = resp.respostaCorreta;
    questao.explicacao_visivel = resp.explicacao;

    resultados.push({ questaoId: questao.id, correta: resp.correta, marcada: alternativaSelecionada });

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
        materia: obterSlugMateria()
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
    const resp = await API.chamar(`/api/materias/${slug}/questoes`);

    if (!resp || !resp.sucesso || resp.questoes.length === 0) {
        document.getElementById('exercicio-conteudo').innerHTML =
            '<div class="empty-state"><i class="fa-regular fa-face-frown"></i>Nenhuma questão disponível para esta matéria ainda.</div>';
        return;
    }

    questoes = resp.questoes;
    document.getElementById('materia-nome').textContent = resp.materia.nome;
    document.getElementById('materia-icone-wrap').style.background = resp.materia.cor;
    document.getElementById('total-questoes-label').textContent = `${questoes.length} questões`;

    tempoInicioQuestao = Date.now();
    renderizarQuestao();
    iniciarCronometro();
}

document.addEventListener('DOMContentLoaded', () => {
    carregarExercicios();
    document.getElementById('btn-confirmar').addEventListener('click', confirmarResposta);
    document.getElementById('btn-proxima').addEventListener('click', proximaQuestao);
});
=======
// ======================================
// HELP STUDY
// EXERCÍCIOS
// ======================================

// Recupera a lição atual
const licaoAtual = JSON.parse(localStorage.getItem("licaoAtual"));

if (!licaoAtual) {
    window.location.href = "dashboard.html";
}

// Matéria

document.getElementById("nomeMateria").textContent =
    licaoAtual.materia.charAt(0).toUpperCase() +
    licaoAtual.materia.slice(1);

// ===============================
// QUESTÕES
// ===============================

const questoes = [

{
pergunta:"Quanto é 5 + 8?",

alternativas:[
"10",
"11",
"12",
"13"
],

correta:3

},

{
pergunta:"Quanto é 12 - 4?",

alternativas:[
"6",
"8",
"9",
"10"
],

correta:1

},

{
pergunta:"Quanto é 7 x 6?",

alternativas:[
"40",
"42",
"44",
"48"
],

correta:1

},

{
pergunta:"Quanto é 36 ÷ 6?",

alternativas:[
"5",
"6",
"7",
"8"
],

correta:1

},

{
pergunta:"Quanto é 15 + 20?",

alternativas:[
"35",
"30",
"25",
"40"
],

correta:0

},

{
pergunta:"Quanto é 18 - 9?",

alternativas:[
"7",
"8",
"9",
"10"
],

correta:2

},

{
pergunta:"Quanto é 9 x 8?",

alternativas:[
"72",
"70",
"74",
"76"
],

correta:0

},

{
pergunta:"Quanto é 81 ÷ 9?",

alternativas:[
"7",
"8",
"9",
"10"
],

correta:2

},

{
pergunta:"Quanto é 30 + 12?",

alternativas:[
"40",
"41",
"42",
"43"
],

correta:2

},

{
pergunta:"Quanto é 50 - 25?",

alternativas:[
"20",
"25",
"30",
"35"
],

correta:1

}

];

let indice = 0;

let respostas = new Array(questoes.length).fill(null);

// ===============================
// MOSTRAR QUESTÃO
// ===============================

function mostrarQuestao(){

    const q = questoes[indice];

    document.getElementById("numeroQuestao").innerHTML =
    `Questão ${indice+1} de ${questoes.length}`;

    document.getElementById("pergunta").innerHTML =
    q.pergunta;

    const form =
    document.getElementById("formAlternativas");

    form.innerHTML="";

    q.alternativas.forEach((texto,i)=>{

        form.innerHTML +=

        `
        <div class="alternativa">

            <input
                type="radio"
                name="resposta"
                id="alt${i}"
                value="${i}"
                ${respostas[indice]===i?"checked":""}>

            <label for="alt${i}">
                ${texto}
            </label>

        </div>
        `;

    });

    document.getElementById("barraQuestao").style.width =
    ((indice+1)/questoes.length)*100+"%";

}

mostrarQuestao();

// ===============================
// SALVAR RESPOSTA
// ===============================

function salvarResposta(){

    const marcada =
    document.querySelector("input[name='resposta']:checked");

    if(marcada){

        respostas[indice] =
        Number(marcada.value);

    }

}

// Próxima

document
.getElementById("proximo")
.onclick = ()=>{

    salvarResposta();

    if(indice < questoes.length-1){

        indice++;

        mostrarQuestao();

    }else{

        finalizar();

    }

};

// Anterior

document
.getElementById("anterior")
.onclick = ()=>{

    salvarResposta();

    if(indice>0){

        indice--;

        mostrarQuestao();

    }

};

// ===============================
// CRONÔMETRO
// ===============================

let tempo = 600;

const relogio =
document.getElementById("tempo");

const cronometro =
setInterval(()=>{

tempo--;

const min =
String(Math.floor(tempo/60))
.padStart(2,"0");

const seg =
String(tempo%60)
.padStart(2,"0");

relogio.innerHTML =
`${min}:${seg}`;

if(tempo<=0){

clearInterval(cronometro);

finalizar();

}

},1000);

// ===============================
// FINALIZAR
// ===============================

function finalizar(){

salvarResposta();

clearInterval(cronometro);

let acertos=0;

questoes.forEach((q,i)=>{

if(respostas[i]===q.correta){

acertos++;

}

});

const erros =
questoes.length-acertos;

// Salva resultado

localStorage.setItem(

"resultado",

JSON.stringify({

acertos,

erros,

nota:acertos,

materia:licaoAtual.materia,

licao:licaoAtual.licao

})

);

// Atualiza progresso

let progresso =
JSON.parse(localStorage.getItem("progresso"));

if(progresso[licaoAtual.materia] < licaoAtual.licao){

progresso[licaoAtual.materia] =
licaoAtual.licao;

localStorage.setItem(

"progresso",

JSON.stringify(progresso)

);

}

window.location.href =
"resultado.html";

}
>>>>>>> 2d02819e18d0c0429f28a9337756c2d567c01165
